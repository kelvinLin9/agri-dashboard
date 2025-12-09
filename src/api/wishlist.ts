import apiClient from './apiClient'
import type { Product } from './types'

export interface WishlistItem {
  id: string
  productId: number
  product: Product
  createdAt: string
}

export const wishlistApi = {
  /**
   * 取得收藏清單
   */
  getAll: async (): Promise<WishlistItem[]> => {
    const response = await apiClient.get('/wishlist')
    return response.data
  },

  /**
   * 加入收藏
   */
  add: async (productId: number): Promise<WishlistItem> => {
    const response = await apiClient.post('/wishlist', { productId })
    return response.data
  },

  /**
   * 移除收藏
   */
  remove: async (productId: number): Promise<void> => {
    await apiClient.delete(`/wishlist/${productId}`)
  },

  /**
   * 切換收藏狀態
   */
  toggle: async (productId: number): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.post(`/wishlist/toggle/${productId}`)
    return response.data
  },

  /**
   * 檢查是否已收藏
   */
  check: async (productId: number): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.get(`/wishlist/check/${productId}`)
    return response.data
  },
}
