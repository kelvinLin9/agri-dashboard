import apiClient, { buildQueryString } from './apiClient'
import type {
  Product,
  ProductQueryParams,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResponse,
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
    const response = await apiClient.get<{ data: PaginatedResponse<Product> }>(`/products${queryString}`)
    return response.data.data
  },

  /**
   * 根據 ID 查詢產品
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ data: Product }>(`/products/${id}`)
    return response.data.data
  },

  /**
   * 根據 Slug 查詢產品
   */
  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get<{ data: Product }>(`/products/slug/${slug}`)
    return response.data.data
  },

  /**
   * 建立產品
   */
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<{ data: Product }>('/products', data)
    return response.data.data
  },

  /**
   * 更新產品
   */
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.put<{ data: Product }>(`/products/${id}`, data)
    return response.data.data
  },

  /**
   * 更新產品庫存
   */
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    const response = await apiClient.put<{ data: Product }>(`/products/${id}/stock`, {
      quantity,
    })
    return response.data.data
  },

  /**
   * 刪除產品
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}
