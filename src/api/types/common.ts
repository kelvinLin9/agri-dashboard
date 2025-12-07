/**
 * 通用類型定義
 * 包含全站共用的基礎型別
 */

// 排序方向
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// 分頁查詢參數
export interface QueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
}

// 可搜尋查詢參數
export interface SearchableQueryParams extends QueryParams {
  search?: string
}

// 分頁響應 metadata
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 分頁響應格式（實際後端回應結構）
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  meta: PaginationMeta  // 為了兼容性添加 meta 別名
}

// 標準 API 響應
export interface ApiResponse<T> {
  data: T
  message?: string
}

// API 錯誤響應
export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
  timestamp?: string
  path?: string
}
