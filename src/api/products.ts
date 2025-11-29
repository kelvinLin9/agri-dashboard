import apiClient, { buildQueryString } from './apiClient'
import type {
  Product,
  ProductQueryParams,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResponse,
  ApiResponse,
} from './types'

/**
 * 產品 API
 */
export const productsApi = {
  /**
   * 查詢所有產品（支援分頁、排序、搜尋）
   */
  getAll: async (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const queryString = params ? buildQueryString(params) : ''
    const response = await apiClient.get<PaginatedResponse<Product>>(`/products${queryString}`)
    return response.data
  },

  /**
   * 根據 ID 查詢產品
   */
  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  },

  /**
   * 根據 Slug 查詢產品
   */
  getBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/slug/${slug}`)
    return response.data
  },

  /**
   * 建立產品
   */
  create: async (data: CreateProductDto): Promise<ApiResponse<Product>> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data)
    return response.data
  },

  /**
   * 更新產品
   */
  update: async (id: string, data: UpdateProductDto): Promise<ApiResponse<Product>> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data
  },

  /**
   * 更新產品庫存
   */
  updateStock: async (id: string, quantity: number): Promise<ApiResponse<Product>> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}/stock`, {
      quantity,
    })
    return response.data
  },

  /**
   * 刪除產品
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}
