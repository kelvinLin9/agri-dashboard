import apiClient from './apiClient'
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  ApiResponse,
  Product,
} from './types'

/**
 * 分類 API
 */
export const categoriesApi = {
  /**
   * 查詢所有分類
   */
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/product-categories')
    return response.data
  },

  /**
   * 查詢分類樹狀結構
   */
  getTree: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/product-categories/tree')
    return response.data
  },

  /**
   * 查詢根分類列表
   */
  getRoots: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/product-categories/roots')
    return response.data
  },

  /**
   * 根據 ID 查詢分類
   */
  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/product-categories/${id}`)
    return response.data
  },

  /**
   * 根據 Slug 查詢分類
   */
  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/product-categories/slug/${slug}`)
    return response.data
  },

  /**
   * 查詢分類下的產品
   */
  getProducts: async (id: string): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(`/product-categories/${id}/products`)
    return response.data
  },

  /**
   * 建立分類
   */
  create: async (data: CreateCategoryDto): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post<ApiResponse<Category>>('/product-categories', data)
    return response.data
  },

  /**
   * 更新分類
   */
  update: async (id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> => {
    const response = await apiClient.put<ApiResponse<Category>>(`/product-categories/${id}`, data)
    return response.data
  },

  /**
   * 刪除分類
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/product-categories/${id}`)
  },
}
