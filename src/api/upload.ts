import apiClient from './apiClient'
import type { Upload, UploadResponse, UpdateUploadDto, ApiResponse, UploadConfig } from './types'

/**
 * 上傳 API
 */
export const uploadApi = {
  /**
   * 上傳單一檔案
   */
  upload: async (file: File, usage?: string, entityType?: string, entityId?: string): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    if (usage) formData.append('usage', usage)
    if (entityType) formData.append('entityType', entityType)
    if (entityId) formData.append('entityId', entityId)

    const response = await apiClient.post<{ data: UploadResponse }>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  /**
   * 上傳多個檔案
   */
  uploadMultiple: async (files: File[], usage?: string): Promise<UploadResponse[]> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    if (usage) formData.append('usage', usage)

    const response = await apiClient.post<{ data: UploadResponse[] }>('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  /**
   * 上傳圖片 (向後兼容)
   */
  uploadImage: async (file: File, type?: string): Promise<ApiResponse<UploadResponse>> => {
    const result = await uploadApi.upload(file, type || 'image')
    return { data: result }
  },

  /**
   * 上傳影片 (向後兼容)
   */
  uploadVideo: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const result = await uploadApi.upload(file, 'video')
    return { data: result }
  },

  /**
   * 查詢上傳記錄
   */
  getAll: async (): Promise<Upload[]> => {
    const response = await apiClient.get<{ data: Upload[] }>('/uploads')
    return response.data.data
  },

  /**
   * 查詢我的檔案
   */
  getMyFiles: async (): Promise<Upload[]> => {
    const response = await apiClient.get<{ data: Upload[] }>('/uploads/my-files')
    return response.data.data
  },

  /**
   * 查詢檔案統計 (管理員)
   */
  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get<{ data: any }>('/uploads/statistics')
    return response.data.data
  },

  /**
   * 查詢單一上傳記錄
   */
  getById: async (id: string): Promise<Upload> => {
    const response = await apiClient.get<{ data: Upload }>(`/uploads/${id}`)
    return response.data.data
  },

  /**
   * 更新檔案資訊
   */
  update: async (id: string, data: UpdateUploadDto): Promise<Upload> => {
    const response = await apiClient.patch<{ data: Upload }>(`/uploads/${id}`, data)
    return response.data.data
  },

  /**
   * 增加下載次數
   */
  incrementDownload: async (id: string): Promise<void> => {
    await apiClient.post(`/uploads/${id}/download`)
  },

  /**
   * 刪除檔案
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/uploads/${id}`)
  },

  /**
   * 清理臨時檔案 (管理員)
   */
  cleanup: async (): Promise<any> => {
    const response = await apiClient.post<{ data: any }>('/uploads/cleanup')
    return response.data.data
  },

  /**
   * 取得上傳設定
   */
  getConfig: async (): Promise<UploadConfig> => {
    const response = await apiClient.get<{ data: UploadConfig }>('/uploads/config')
    return response.data.data
  },

  // ==================== Cloudflare R2 方法 ====================

  /**
   * 獲取 R2 預簽名上傳 URL
   * 用於直接上傳大容量影片到 Cloudflare R2
   */
  getR2PresignedUrl: async (
    filename: string,
    contentType: string,
  ): Promise<{
    uploadUrl: string
    publicUrl: string
    key: string
  }> => {
    const response = await apiClient.post<{
      uploadUrl: string
      publicUrl: string
      key: string
    }>('/uploads/r2/presigned-url', {
      filename,
      contentType,
    })
    return response.data
  },

  /**
   * 通知後端 R2 上傳完成
   * 記錄上傳資訊到資料庫
   */
  completeR2Upload: async (
    key: string,
    publicUrl: string,
    fileSize: number,
    title?: string,
    description?: string,
  ): Promise<Upload> => {
    const response = await apiClient.post<Upload>('/uploads/r2/complete', {
      key,
      publicUrl,
      fileSize,
      title,
      description,
    })

    return response.data
  },
}
