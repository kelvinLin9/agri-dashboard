import { ref, computed, onBeforeUnmount } from 'vue'
import { VideoQuality, VIDEO_QUALITY_CONFIGS, type RecordingSettings } from '@/types/video'

/**
 * 影片錄製 Composable
 *
 * 提供專業的影片錄製功能，包含：
 * - 攝像頭初始化與權限管理
 * - 多品質錄製選項
 * - 錄製控制（開始/停止/暫停/繼續）
 * - 時間與大小追蹤
 */
export function useVideoRecorder(initialSettings?: Partial<RecordingSettings>) {
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

  // Settings
  const settings = ref<RecordingSettings>({
    quality: VideoQuality.MEDIUM,
    facingMode: 'environment',
    audioEnabled: true,
    maxDuration: 0, // unlimited
    ...initialSettings,
  })

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

  // ==================== Methods ====================

  /**
   * 初始化攝像頭
   */
  async function initCamera(videoEl?: HTMLVideoElement) {
    try {
      error.value = null

      if (videoEl) {
        videoElement.value = videoEl
      }

      const config = VIDEO_QUALITY_CONFIGS[settings.value.quality]

      // 請求媒體權限
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: settings.value.facingMode,
          width: { ideal: config.width },
          height: { ideal: config.height },
          frameRate: { ideal: config.frameRate },
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
   * 開始錄製
   */
  function startRecording() {
    if (!stream.value) {
      error.value = '請先初始化攝像頭'
      return false
    }

    try {
      error.value = null

      // 檢查瀏覽器支援
      if (!window.MediaRecorder) {
        error.value = '您的瀏覽器不支持錄製功能'
        return false
      }

      const config = VIDEO_QUALITY_CONFIGS[settings.value.quality]

      // 設定 MIME type 和 bitrate
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: config.bitrate,
      }

      // 檢查支援的格式
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        if (MediaRecorder.isTypeSupported('video/webm')) {
          options.mimeType = 'video/webm'
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options.mimeType = 'video/mp4'
        } else {
          delete options.mimeType
        }
      }

      // 創建 MediaRecorder
      const recorder = new MediaRecorder(stream.value, options)
      mediaRecorder.value = recorder

      // 清空之前的資料
      recordedChunks.value = []
      recordedBlob.value = null

      // 事件處理
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.value.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.value, {
          type: mediaRecorder.value?.mimeType || 'video/webm',
        })
        recordedBlob.value = blob
        console.log('錄製完成，文件大小:', blob.size, 'bytes')
      }

      recorder.onerror = (event: Event) => {
        console.error('錄製錯誤:', event)
        error.value = '錄製過程中發生錯誤'
        stopRecording()
      }

      // 開始錄製
      recorder.start(1000) // 每秒收集一次資料
      isRecording.value = true
      isPaused.value = false

      // 開始計時器
      elapsedTime.value = 0
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
  function stopRecording() {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
      isRecording.value = false
      isPaused.value = false
      stopTimer()
    }
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
   * 清除錄製
   */
  function clearRecording() {
    recordedBlob.value = null
    recordedChunks.value = []
    elapsedTime.value = 0
    error.value = null
  }

  /**
   * 切換攝像頭
   */
  async function switchCamera() {
    const newMode = settings.value.facingMode === 'user' ? 'environment' : 'user'
    settings.value.facingMode = newMode

    // 停止當前流
    cleanup()

    // 重新初始化
    return await initCamera(videoElement.value || undefined)
  }

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
   * 啟動計時器
   */
  function startTimer() {
    stopTimer() // 清除舊的
    timerInterval = window.setInterval(() => {
      elapsedTime.value++

      // 檢查是否達到最大時間
      if (settings.value.maxDuration &&
          settings.value.maxDuration > 0 &&
          elapsedTime.value >= settings.value.maxDuration) {
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

  /**
   * 清理資源
   */
  function cleanup() {
    stopTimer()

    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }

    if (mediaRecorder.value) {
      mediaRecorder.value = null
    }

    isInitialized.value = false
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
    error,
    settings,
    stream,

    // Computed
    formattedTime,
    formattedFileSize,
    estimatedFileSize,
    remainingTime,

    // Methods
    initCamera,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    toggleRecording,
    clearRecording,
    switchCamera,
    setQuality,
    setMaxDuration,
    cleanup,
  }
}
