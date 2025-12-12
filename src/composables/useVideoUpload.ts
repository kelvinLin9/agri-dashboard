import { ref } from 'vue'
import { uploadApi } from '@/api/upload'
import type { VideoMetadata } from '@/types/video'
import type { UploadResponse } from '@/api/types'

/**
 * 影片上傳 Composable
 *
 * 提供專業的影片上傳功能，包含：
 * - 後端 API 整合
 * - 上傳進度追蹤
 * - 錯誤處理與重試
 * - 元數據管理
 */
export function useVideoUpload() {
  // ==================== State ====================
  const isUploading = ref(false)
  const uploadProgress = ref(0)  // 0-100
  const uploadedFile = ref<UploadResponse | null>(null)
  const uploadError = ref<string | null>(null)

  // 用於重試
  let lastUploadParams: { blob: Blob; metadata: VideoMetadata } | null = null

  // ==================== Methods ====================

  /**
   * 上傳影片到 Cloudflare R2
   * 使用預簽名 URL 直接上傳，不經過後端
   */
  async function uploadVideo(
    blob: Blob,
    metadata: VideoMetadata = {}
  ): Promise<UploadResponse | null> {
    try {
      isUploading.value = true
      uploadProgress.value = 0
      uploadError.value = null
      uploadedFile.value = null

      // 儲存參數以便重試
      lastUploadParams = { blob, metadata }

      // 生成檔案名稱
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = metadata.title
        ? `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.webm`
        : `video-${timestamp}.webm`

      // Step 1: 獲取 R2 預簽名上傳 URL
      const { uploadUrl, publicUrl, key } = await uploadApi.getR2PresignedUrl(
        filename,
        blob.type || 'video/webm'
      )

      // Step 2: 直接上傳到 R2 (使用 XMLHttpRequest 追蹤進度)
      await uploadToR2WithProgress(uploadUrl, blob)

      // Step 3: 通知後端記錄上傳
      const result = await uploadApi.completeR2Upload(
        key,
        publicUrl,
        blob.size,
        metadata.title,
        metadata.description
      )

      uploadedFile.value = result
      uploadProgress.value = 100

      return result
    } catch (err) {
      console.error('影片上傳失敗:', err)
      uploadError.value = err instanceof Error
        ? err.message
        : '上傳失敗，請檢查網絡連接'
      return null
    } finally {
      isUploading.value = false
    }
  }

  /**
   * 使用 XMLHttpRequest 上傳到 R2 並追蹤進度
   */
  function uploadToR2WithProgress(url: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // 上傳進度事件
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100)
        }
      })

      // 上傳完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`上傳失敗: HTTP ${xhr.status}`))
        }
      })

      // 上傳錯誤
      xhr.addEventListener('error', () => {
        reject(new Error('網絡錯誤'))
      })

      // 上傳超時
      xhr.addEventListener('timeout', () => {
        reject(new Error('上傳超時'))
      })

      // 開始上傳
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', blob.type || 'video/webm')
      xhr.timeout = 5 * 60 * 1000 // 5分鐘超時
      xhr.send(blob)
    })
  }

  /**
   * 取消上傳
   * 注意：目前的 API 不支援取消，這個方法只是重置狀態
   */
  function cancelUpload() {
    // TODO: 如果後端支援 AbortController，這裡可以實作真正的取消
    isUploading.value = false
    uploadProgress.value = 0
    uploadError.value = '上傳已取消'
  }

  /**
   * 重試上傳
   */
  async function retryUpload(): Promise<UploadResponse | null> {
    if (!lastUploadParams) {
      uploadError.value = '沒有可重試的上傳'
      return null
    }

    return await uploadVideo(
      lastUploadParams.blob,
      lastUploadParams.metadata
    )
  }

  /**
   * 清除上傳狀態
   */
  function clearUpload() {
    uploadedFile.value = null
    uploadError.value = null
    uploadProgress.value = 0
    lastUploadParams = null
  }

  // ==================== Return ====================
  return {
    // State
    isUploading,
    uploadProgress,
    uploadedFile,
    uploadError,

    // Methods
    uploadVideo,
    cancelUpload,
    retryUpload,
    clearUpload,
  }
}
