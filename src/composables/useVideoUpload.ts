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
   * 上傳影片到後端
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

      // 創建 File 對象
      const file = new File([blob], filename, { type: blob.type || 'video/webm' })

      // 調用上傳 API（帶進度回調）
      const result = await uploadApi.upload(
        file,
        'video',  // usage
        undefined, // entityType
        undefined  // entityId
      )

      // 如果有元數據，更新上傳記錄
      if (result.id && (metadata.title || metadata.description)) {
        const updateData: any = {}
        if (metadata.title) updateData.filename = metadata.title
        if (metadata.description) updateData.description = metadata.description

        if (Object.keys(updateData).length > 0) {
          await uploadApi.update(String(result.id), updateData)
        }
      }

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
