import { ref, computed } from 'vue'
import { uploadApi } from '@/api/upload'
import { useMultipartUpload } from './useMultipartUpload'
import type { VideoMetadata } from '@/types/video'
import type { UploadResponse } from '@/api/types'
import type { PartInfo, UploadStatus } from './useMultipartUpload'

/**
 * 影片上傳 Composable
 *
 * 自動選擇上傳方式：
 * - 檔案 < 50MB：使用單一 PUT 上傳（快速）
 * - 檔案 >= 50MB：使用 Multipart 分片上傳（穩定）
 *
 * 支援功能：
 * - 上傳進度追蹤
 * - 暫停/繼續（僅大檔案）
 * - 錯誤處理與重試
 */
export function useVideoUpload() {
  // ==================== 配置 ====================
  const MULTIPART_THRESHOLD = 50 * 1024 * 1024 // 50MB 閾值

  // ==================== Multipart Composable ====================
  const multipart = useMultipartUpload()

  // ==================== State ====================
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadedFile = ref<UploadResponse | null>(null)
  const uploadError = ref<string | null>(null)
  const isMultipartMode = ref(false)

  // 用於重試
  let lastUploadParams: { blob: Blob; metadata: VideoMetadata } | null = null
  let currentFile: File | null = null

  // ==================== Computed ====================

  /**
   * 上傳狀態（統一兩種模式）
   */
  const status = computed<UploadStatus>(() => {
    if (isMultipartMode.value) {
      return multipart.status.value
    }
    if (isUploading.value) return 'uploading'
    if (uploadedFile.value) return 'completed'
    if (uploadError.value) return 'failed'
    return 'idle'
  })

  /**
   * 可見的進度（統一兩種模式）
   */
  const progress = computed(() => {
    if (isMultipartMode.value) {
      return multipart.overallProgress.value
    }
    return uploadProgress.value
  })

  /**
   * 分片資訊（僅大檔案模式）
   */
  const parts = computed<PartInfo[]>(() => {
    return isMultipartMode.value ? multipart.parts.value : []
  })

  /**
   * 是否可以暫停
   */
  const canPause = computed(() => isMultipartMode.value && multipart.canPause.value)

  /**
   * 是否可以繼續
   */
  const canResume = computed(() => isMultipartMode.value && multipart.canResume.value)

  /**
   * 是否已暫停
   */
  const isPaused = computed(() => isMultipartMode.value && multipart.isPaused.value)

  /**
   * 失敗的分片數
   */
  const failedParts = computed(() => isMultipartMode.value ? multipart.failedParts.value : 0)

  // ==================== Methods ====================

  /**
   * 上傳影片（自動選擇上傳方式）
   */
  async function uploadVideo(
    blob: Blob,
    metadata: VideoMetadata = {},
  ): Promise<UploadResponse | null> {
    // 儲存參數以便重試
    lastUploadParams = { blob, metadata }

    // 根據檔案大小選擇上傳方式
    if (blob.size >= MULTIPART_THRESHOLD) {
      return await uploadWithMultipart(blob, metadata)
    } else {
      return await uploadWithSinglePut(blob, metadata)
    }
  }

  /**
   * 單一 PUT 上傳（小檔案）
   */
  async function uploadWithSinglePut(
    blob: Blob,
    metadata: VideoMetadata,
  ): Promise<UploadResponse | null> {
    try {
      isUploading.value = true
      isMultipartMode.value = false
      uploadProgress.value = 0
      uploadError.value = null
      uploadedFile.value = null

      // 生成檔案名稱
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = metadata.title
        ? `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.webm`
        : `video-${timestamp}.webm`

      // Step 1: 獲取預簽名 URL
      const { uploadUrl, publicUrl, key, expectedFileSize } =
        await uploadApi.getR2PresignedUrl(
          filename,
          blob.type || 'video/webm',
          blob.size,
        )

      // Step 2: 直接上傳到 R2
      await uploadToR2WithProgress(uploadUrl, blob)

      // Step 3: 通知後端記錄上傳
      const result = await uploadApi.completeR2Upload(key, publicUrl, blob.size, {
        expectedFileSize,
        mimeType: blob.type || 'video/webm',
        title: metadata.title,
        description: metadata.description,
      })

      uploadedFile.value = result
      uploadProgress.value = 100

      return result
    } catch (err) {
      console.error('影片上傳失敗:', err)
      uploadError.value =
        err instanceof Error ? err.message : '上傳失敗，請檢查網絡連接'
      return null
    } finally {
      isUploading.value = false
    }
  }

  /**
   * Multipart 分片上傳（大檔案）
   */
  async function uploadWithMultipart(
    blob: Blob,
    metadata: VideoMetadata,
  ): Promise<UploadResponse | null> {
    isMultipartMode.value = true
    uploadError.value = null
    uploadedFile.value = null

    // 將 Blob 轉為 File（如果需要）
    const file =
      blob instanceof File
        ? blob
        : new File([blob], metadata.title || 'video.webm', {
            type: blob.type || 'video/webm',
          })

    currentFile = file

    const result = await multipart.startUpload(file, {
      title: metadata.title,
      description: metadata.description,
    })

    if (result) {
      uploadedFile.value = result
      return result
    } else {
      uploadError.value = multipart.error.value || '上傳失敗'
      return null
    }
  }

  /**
   * 使用 XMLHttpRequest 上傳並追蹤進度
   */
  function uploadToR2WithProgress(url: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`上傳失敗: HTTP ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => reject(new Error('網絡錯誤')))
      xhr.addEventListener('timeout', () => reject(new Error('上傳超時')))

      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', blob.type || 'video/webm')
      xhr.timeout = 5 * 60 * 1000
      xhr.send(blob)
    })
  }

  /**
   * 暫停上傳（僅大檔案）
   */
  function pause(): void {
    if (isMultipartMode.value) {
      multipart.pause()
    }
  }

  /**
   * 繼續上傳（僅大檔案）
   */
  async function resume(): Promise<void> {
    if (isMultipartMode.value && currentFile) {
      await multipart.resume(currentFile)
    }
  }

  /**
   * 取消上傳
   */
  async function cancelUpload(): Promise<void> {
    if (isMultipartMode.value) {
      await multipart.cancel()
    }
    isUploading.value = false
    uploadProgress.value = 0
    uploadError.value = '上傳已取消'
  }

  /**
   * 重試上傳
   */
  async function retryUpload(): Promise<UploadResponse | null> {
    if (isMultipartMode.value && currentFile && failedParts.value > 0) {
      await multipart.retryFailed(currentFile)
      return uploadedFile.value
    }

    if (!lastUploadParams) {
      uploadError.value = '沒有可重試的上傳'
      return null
    }

    return await uploadVideo(lastUploadParams.blob, lastUploadParams.metadata)
  }

  /**
   * 清除上傳狀態
   */
  function clearUpload(): void {
    uploadedFile.value = null
    uploadError.value = null
    uploadProgress.value = 0
    isMultipartMode.value = false
    lastUploadParams = null
    currentFile = null
    multipart.reset()
  }

  // ==================== Return ====================
  return {
    // State
    isUploading,
    uploadProgress: progress,
    uploadedFile,
    uploadError,
    status,

    // Multipart 專用
    isMultipartMode,
    parts,
    isPaused,
    canPause,
    canResume,
    failedParts,
    completedParts: multipart.completedParts,
    fileName: multipart.fileName,
    fileSize: multipart.fileSize,

    // Methods
    uploadVideo,
    pause,
    resume,
    cancelUpload,
    retryUpload,
    clearUpload,
  }
}
