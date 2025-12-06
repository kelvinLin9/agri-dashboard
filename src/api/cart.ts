import apiClient from './apiClient'
import type {
  Cart,
  AddCartItemDto,
  UpdateCartItemDto,
  ValidateCartResponse,
  ApiResponse,
} from './types'

/**
 * 購物車 API
 */
export const cartApi = {
  /**
   * 取得我的購物車
   */
  getMy: async (): Promise<Cart> => {
    const response = await apiClient.get<ApiResponse<Cart>>('/cart')
    return response.data.data
  },

  /**
   * 加入商品到購物車
   */
  addItem: async (data: AddCartItemDto): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<Cart>>('/cart/items', data)
    return response.data.data
  },

  /**
   * 更新購物車項目
   */
  updateItem: async (itemId: string, data: UpdateCartItemDto): Promise<Cart> => {
    const response = await apiClient.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, data)
    return response.data.data
  },

  /**
   * 刪除購物車項目
   */
  deleteItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`)
    return response.data.data
  },

  /**
   * 清空購物車
   */
  clear: async (): Promise<void> => {
    await apiClient.delete('/cart/clear')
  },

  /**
   * 驗證購物車（檢查庫存、價格等）
   */
  validate: async (): Promise<ValidateCartResponse> => {
    const response = await apiClient.post<ApiResponse<ValidateCartResponse>>('/cart/validate')
    return response.data.data
  },
}
