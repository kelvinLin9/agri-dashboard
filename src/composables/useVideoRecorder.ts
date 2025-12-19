import { ref, computed, onBeforeUnmount } from 'vue'
import { VideoQuality, VIDEO_QUALITY_CONFIGS, type RecordingSettings } from '@/types/video'

// =====================================================================
// 型別定義
// =====================================================================

/** 裝置方向 */
export type Orientation = 'portrait' | 'landscape'

/** 攝影機方向 */
export type FacingMode = 'user' | 'environment'

/** 錄製結果 */
export interface RecordedResult {
  blob: Blob
  duration: number
  mimeType: string
}

/** Composable 設定選項 */
export interface VideoRecorderOptions {
  /** 影片品質 */
  quality?: VideoQuality
  /** 攝影機方向 */
  facingMode?: FacingMode
  /** 是否啟用音訊 */
  audioEnabled?: boolean
  /** 最大錄製時間（秒） */
  maxDuration?: number
  /** 要求的裝置方向（可選） */
  requiredOrientation?: Orientation
  /** 編碼模式 */
  codecMode?: 'auto' | 'h264' | 'vp8' | 'vp9' | 'hevc' | 'av1'
}

// =====================================================================
// 工具函數
// =====================================================================

/**
 * 偵測是否為行動裝置
 * 用於決定錄製策略（編碼格式、幀率等）
 */
function isMobileDevice(): boolean {
  // 優先使用 User-Agent Client Hints API（較新的標準）
  if ('userAgentData' in navigator && (navigator as Navigator & { userAgentData?: { mobile: boolean } }).userAgentData) {
    return (navigator as Navigator & { userAgentData: { mobile: boolean } }).userAgentData.mobile
  }
  // 回退到傳統 UA 字串偵測
  const userAgent = navigator.userAgent.toLowerCase()
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
}

/**
 * 影片錄製 Composable
 *
 * 提供專業的影片錄製功能，包含：
 * - 攝像頭初始化與權限管理
 * - 多品質錄製選項
 * - 錄製控制（開始/停止/暫停/繼續）
 * - 時間與大小追蹤
 * - 方向偵測
 * - 多鏡頭支援
 */
export function useVideoRecorder(options?: VideoRecorderOptions) {
  // ==================== State ====================
  const videoElement = ref<HTMLVideoElement | null>(null)
  const stream = ref<MediaStream | null>(null)
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const recordedChunks = ref<Blob[]>([])

  const isRecording = ref(false)
  const isPaused = ref(false)
  const isInitialized = ref(false)
  const recordedBlob = ref<Blob | null>(null)
  const error = ref<string | null>(null)

  // Timer
  const elapsedTime = ref(0)
  let timerInterval: number | null = null

  // Camera
  const availableCameras = ref<MediaDeviceInfo[]>([])
  const currentFacingMode = ref<FacingMode>(options?.facingMode || 'environment')

  // Settings
  const settings = ref<RecordingSettings>({
    quality: options?.quality || VideoQuality.MEDIUM,
    facingMode: options?.facingMode || 'environment',
    audioEnabled: options?.audioEnabled ?? true,
    maxDuration: options?.maxDuration || 0,
  })

  // Orientation
  const requiredOrientation = ref<Orientation | undefined>(options?.requiredOrientation)

  // Codec Mode
  const codecMode = ref<'auto' | 'h264' | 'vp8' | 'vp9' | 'hevc' | 'av1'>(options?.codecMode || 'auto')

  // ==================== Computed ====================
  const formattedTime = computed(() => {
    const minutes = Math.floor(elapsedTime.value / 60)
    const seconds = elapsedTime.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const estimatedFileSize = computed(() => {
    if (!isRecording.value) return 0
    const config = VIDEO_QUALITY_CONFIGS[settings.value.quality]
    // Rough estimation: bitrate * time
    return Math.round((config.bitrate / 8) * elapsedTime.value)
  })

  const formattedFileSize = computed(() => {
    const size = recordedBlob.value?.size || estimatedFileSize.value
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  })

  const remainingTime = computed(() => {
    if (!settings.value.maxDuration || settings.value.maxDuration === 0) return null
    return Math.max(0, settings.value.maxDuration - elapsedTime.value)
  })

  /** 是否有多個攝影機 */
  const hasMultipleCameras = computed(() => availableCameras.value.length > 1)

  /** 目前的 MIME type */
  const currentMimeType = computed(() => mediaRecorder.value?.mimeType || 'video/webm')

  // ==================== Orientation Methods ====================

  /**
   * 取得目前裝置/視窗方向
   * 使用視窗尺寸判斷，適用於桌面和行動裝置
   */
  function getCurrentOrientation(): Orientation {
    // 優先使用視窗尺寸判斷，因為這在桌面瀏覽器拉伸時也能正確反應
    return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'
  }

  /**
   * 檢查方向是否正確
   */
  function isOrientationCorrect(): boolean {
    if (!requiredOrientation.value) return true
    return getCurrentOrientation() === requiredOrientation.value
  }

  /**
   * 設定要求的方向
   */
  function setRequiredOrientation(orientation: Orientation | undefined) {
    requiredOrientation.value = orientation
  }

  // ==================== Camera Methods ====================

  /**
   * 列舉可用的攝影機
   */
  async function enumerateCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      availableCameras.value = devices.filter((d) => d.kind === 'videoinput')
    } catch {
      // 無法列舉設備，假設只有一個鏡頭
      availableCameras.value = []
    }
  }

  /**
   * 初始化攝像頭
   */
  async function initCamera(videoEl?: HTMLVideoElement) {
    try {
      error.value = null

      if (videoEl) {
        videoElement.value = videoEl
      }

      // 列舉可用的攝影機
      await enumerateCameras()

      const config = VIDEO_QUALITY_CONFIGS[settings.value.quality]

      // 請求媒體權限
      // 針對 1080p 使用 exact 約束確保解析度鎖定
      // 幀率加上 max 約束避免手機端過載
      const isHighQuality = settings.value.quality === VideoQuality.HIGH
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode.value,
          width: isHighQuality ? { exact: config.width } : { ideal: config.width },
          height: isHighQuality ? { exact: config.height } : { ideal: config.height },
          frameRate: { ideal: config.frameRate, max: config.frameRate },
        },
        audio: settings.value.audioEnabled,
      })

      stream.value = mediaStream

      if (videoElement.value) {
        videoElement.value.srcObject = mediaStream
      }

      isInitialized.value = true
      return true
    } catch (err) {
      console.error('Camera initialization failed:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          error.value = '無法訪問攝像頭，請檢查權限設置'
        } else if (err.name === 'NotFoundError') {
          error.value = '找不到攝像頭設備'
        } else {
          error.value = '攝像頭初始化失敗，請重試'
        }
      }
      return false
    }
  }

  /**
   * 切換攝像頭
   */
  async function switchCamera() {
    if (!stream.value) return false

    try {
      // 停止目前的串流
      stream.value.getTracks().forEach((track) => track.stop())

      // 切換方向
      const newMode: FacingMode = currentFacingMode.value === 'user' ? 'environment' : 'user'
      currentFacingMode.value = newMode
      settings.value.facingMode = newMode

      const config = VIDEO_QUALITY_CONFIGS[settings.value.quality]

      const isHighQuality = settings.value.quality === VideoQuality.HIGH
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode.value,
          width: isHighQuality ? { exact: config.width } : { ideal: config.width },
          height: isHighQuality ? { exact: config.height } : { ideal: config.height },
          frameRate: { ideal: config.frameRate, max: config.frameRate },
        },
        audio: settings.value.audioEnabled,
      })

      stream.value = newStream

      if (videoElement.value) {
        videoElement.value.srcObject = newStream
      }

      // 如果錄製中，需要重新啟動錄製器
      if (mediaRecorder.value && (isRecording.value || isPaused.value)) {
        const wasRecording = isRecording.value
        mediaRecorder.value.stop()

        // 等待一幀後重新開始
        await new Promise((resolve) => requestAnimationFrame(resolve))
        createMediaRecorder()
        mediaRecorder.value?.start(1000)

        if (!wasRecording) {
          mediaRecorder.value?.pause()
        }
      }

      return true
    } catch (err) {
      console.error('Switch camera failed:', err)
      error.value = '切換攝像頭失敗'
      return false
    }
  }

  // ==================== Recording Methods ====================

  /**
   * 建立 MediaRecorder
   */
  function createMediaRecorder(): boolean {
    if (!stream.value) {
      error.value = '請先初始化攝像頭'
      return false
    }

    // 檢查瀏覽器支援
    if (!window.MediaRecorder) {
      error.value = '您的瀏覽器不支持錄製功能'
      return false
    }

    const config = VIDEO_QUALITY_CONFIGS[settings.value.quality]
    const isMobile = isMobileDevice()

    // 根據編碼模式取得支援的 MIME type
    function getMimeTypeForCodec(codec: string): string | null {
      const formats: Record<string, string[]> = {
        h264: ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=h264'],
        vp8: ['video/webm;codecs=vp8,opus'],
        vp9: ['video/webm;codecs=vp9,opus'],
        hevc: ['video/mp4;codecs=hvc1', 'video/mp4;codecs=hevc', 'video/mp4;codecs=hev1'],
        av1: ['video/mp4;codecs=av01', 'video/webm;codecs=av1,opus'],
      }

      const candidates = formats[codec] || []
      for (const mimeType of candidates) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          return mimeType
        }
      }
      return null
    }

    // 設定 MIME type 和 bitrate
    let preferredMimeType: string | null = null

    if (codecMode.value !== 'auto') {
      // 使用用戶指定的編碼
      preferredMimeType = getMimeTypeForCodec(codecMode.value)
    }

    // 2. 如果指定的編碼不支援或是自動模式，嘗試最通用的 H.264/MP4
    if (!preferredMimeType) {
      preferredMimeType = getMimeTypeForCodec('h264')
    }

    // 3. 如果 H.264 也不支援，嘗試較高品質的 VP8 或 VP9
    if (!preferredMimeType) {
      preferredMimeType = getMimeTypeForCodec('vp8') || getMimeTypeForCodec('vp9')
    }

    // 4. 最後的最後：如果都沒匹配到，嘗試最基礎的格式
    if (!preferredMimeType) {
      const basicFormats = ['video/webm', 'video/mp4']
      preferredMimeType = basicFormats.find(f => MediaRecorder.isTypeSupported(f)) || null
    }

    const options: MediaRecorderOptions = {
      mimeType: preferredMimeType || undefined,
      videoBitsPerSecond: config.bitrate,
    }

    console.log(`[VideoRecorder] 使用編碼: ${options.mimeType || '預設'}, 行動裝置: ${isMobile}, 模式: ${codecMode.value}`)

    // 創建 MediaRecorder
    const recorder = new MediaRecorder(stream.value, options)
    mediaRecorder.value = recorder

    // 事件處理
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    recorder.onerror = (event: Event) => {
      console.error('錄製錯誤:', event)
      error.value = '錄製過程中發生錯誤'
      stopRecording()
    }

    return true
  }

  /**
   * 開始錄製
   */
  function startRecording(): boolean {
    try {
      error.value = null

      // 清空之前的資料
      recordedChunks.value = []
      recordedBlob.value = null
      elapsedTime.value = 0

      if (!createMediaRecorder()) {
        return false
      }

      // 設定停止時的處理
      mediaRecorder.value!.onstop = () => {
        const blob = new Blob(recordedChunks.value, {
          type: mediaRecorder.value?.mimeType || 'video/webm',
        })
        recordedBlob.value = blob
        console.log('錄製完成，文件大小:', blob.size, 'bytes')
      }

      // 開始錄製
      mediaRecorder.value!.start(1000) // 每秒收集一次資料
      isRecording.value = true
      isPaused.value = false

      // 開始計時器
      startTimer()

      return true
    } catch (err) {
      console.error('開始錄製失敗:', err)
      error.value = '開始錄製失敗，請重試'
      return false
    }
  }

  /**
   * 停止錄製
   */
  function stopRecording(): RecordedResult | null {
    if (mediaRecorder.value && (isRecording.value || isPaused.value)) {
      mediaRecorder.value.stop()
      isRecording.value = false
      isPaused.value = false
      stopTimer()

      // 因為 onstop 是異步的，這裡先返回 null
      // 實際結果會在 recordedBlob 更新後取得
      return null
    }
    return null
  }

  /**
   * 暫停錄製
   */
  function pauseRecording() {
    if (mediaRecorder.value && isRecording.value && !isPaused.value) {
      mediaRecorder.value.pause()
      isPaused.value = true
      stopTimer()
    }
  }

  /**
   * 繼續錄製
   */
  function resumeRecording() {
    if (mediaRecorder.value && isRecording.value && isPaused.value) {
      mediaRecorder.value.resume()
      isPaused.value = false
      startTimer()
    }
  }

  /**
   * 切換錄製狀態
   */
  function toggleRecording() {
    if (isRecording.value) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  /**
   * 切換暫停狀態
   */
  function togglePause() {
    if (isRecording.value) {
      if (isPaused.value) {
        resumeRecording()
      } else {
        pauseRecording()
      }
    }
  }

  /**
   * 清除錄製
   */
  function clearRecording() {
    recordedBlob.value = null
    recordedChunks.value = []
    elapsedTime.value = 0
    error.value = null
  }

  // ==================== Settings Methods ====================

  /**
   * 設定錄製品質
   */
  function setQuality(quality: VideoQuality) {
    if (isRecording.value) {
      error.value = '無法在錄製中變更品質'
      return false
    }
    settings.value.quality = quality
    return true
  }

  /**
   * 設定最大錄製時間
   */
  function setMaxDuration(seconds: number) {
    settings.value.maxDuration = seconds
  }

  /**
   * 設定是否啟用音訊
   */
  function setAudioEnabled(enabled: boolean) {
    if (isRecording.value) {
      error.value = '無法在錄製中變更音訊設定'
      return false
    }
    settings.value.audioEnabled = enabled
    return true
  }

  // ==================== Timer Methods ====================

  /**
   * 啟動計時器
   */
  function startTimer() {
    stopTimer() // 清除舊的
    timerInterval = window.setInterval(() => {
      elapsedTime.value++

      // 檢查是否達到最大時間
      if (
        settings.value.maxDuration &&
        settings.value.maxDuration > 0 &&
        elapsedTime.value >= settings.value.maxDuration
      ) {
        stopRecording()
      }
    }, 1000)
  }

  /**
   * 停止計時器
   */
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  // ==================== Cleanup ====================

  /**
   * 清理資源
   */
  function cleanup() {
    stopTimer()

    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }

    if (mediaRecorder.value) {
      if (isRecording.value || isPaused.value) {
        try {
          mediaRecorder.value.stop()
        } catch {
          // ignore
        }
      }
      mediaRecorder.value = null
    }

    isInitialized.value = false
    isRecording.value = false
    isPaused.value = false
  }

  // 組件卸載時清理
  onBeforeUnmount(() => {
    if (isRecording.value) {
      stopRecording()
    }
    cleanup()
  })

  // ==================== Return ====================
  return {
    // State
    isRecording,
    isPaused,
    isInitialized,
    elapsedTime,
    recordedBlob,
    recordedChunks,
    error,
    settings,
    stream,
    currentFacingMode,
    availableCameras,

    // Computed
    formattedTime,
    formattedFileSize,
    estimatedFileSize,
    remainingTime,
    hasMultipleCameras,
    currentMimeType,

    // Camera Methods
    initCamera,
    switchCamera,
    enumerateCameras,

    // Recording Methods
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    toggleRecording,
    togglePause,
    clearRecording,

    // Orientation Methods
    getCurrentOrientation,
    isOrientationCorrect,
    setRequiredOrientation,

    // Settings Methods
    setQuality,
    setMaxDuration,
    setAudioEnabled,

    // Cleanup
    cleanup,
  }
}
