/**
 * 上傳相關類型
 */

// 上傳記錄
export interface Upload {
  id: string
  userId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  type: 'image' | 'video' | 'document'
  createdAt: string
}

// 上傳響應
export interface UploadResponse {
  id: string
  url: string
  filename: string
  size: number
}

// 更新上傳 DTO
export interface UpdateUploadDto {
  filename?: string
  type?: 'image' | 'video' | 'document'
}

// 上傳設定
export interface UploadConfig {
  maxFileSize: number
  maxFileSizeMB: number
  maxFilesPerUpload: number
  allowedImageTypes: string[]
  allowedImageExtensions: string[]
  allowedDocumentTypes: string[]
  allowedDocumentExtensions: string[]
  allowedVideoTypes: string[]
  allowedVideoExtensions: string[]
}
