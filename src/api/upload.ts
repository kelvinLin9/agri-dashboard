import apiClient from './apiClient'
import type { Upload, UploadResponse, ApiResponse } from './types'

/**
 * 上傳 API
 */
export const uploadApi = {
  /**
   * 上傳圖片
   */
  uploadImage: async (file: File, type?: string): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData()
    formData.append('file', file)
    if (type) {
      formData.append('type', type)
    }

    const response = await apiClient.post<ApiResponse<UploadResponse>>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * 上傳影片
   */
  uploadVideo: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<UploadResponse>>('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * 查詢上傳記錄
   */
  getAll: async (): Promise<ApiResponse<Upload[]>> => {
    const response = await apiClient.get<ApiResponse<Upload[]>>('/upload')
    return response.data
  },

  /**
   * 查詢單一上傳記錄
   */
  getById: async (id: string): Promise<ApiResponse<Upload>> => {
    const response = await apiClient.get<ApiResponse<Upload>>(`/upload/${id}`)
    return response.data
  },

  /**
   * 刪除檔案
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/upload/${id}`)
  },
}
