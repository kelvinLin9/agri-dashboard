import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '@/api'
import type { Cart, AddCartItemDto } from '@/api/types'

/**
 * 購物車 Store
 * 管理購物車狀態和操作
 */
export const useCartStore = defineStore('cart', () => {
  // State
  const cart = ref<Cart | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const items = computed(() => cart.value?.items || [])
  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.subtotal, 0))
  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  /**
   * 載入購物車
   */
  const fetchCart = async () => {
    isLoading.value = true
    error.value = null
    try {
      cart.value = await cartApi.getMy()
    }
    catch (err: any) {
      error.value = err.message || '載入購物車失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 加入商品到購物車
   */
  const addItem = async (data: AddCartItemDto) => {
    isLoading.value = true
    error.value = null
    try {
      cart.value = await cartApi.addItem(data)
    }
    catch (err: any) {
      error.value = err.message || '加入購物車失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 更新購物車商品數量
   */
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    isLoading.value = true
    error.value = null
    try {
      cart.value = await cartApi.updateItem(itemId, { quantity })
    }
    catch (err: any) {
      error.value = err.message || '更新數量失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 刪除購物車商品
   */
  const removeItem = async (itemId: string) => {
    isLoading.value = true
    error.value = null
    try {
      cart.value = await cartApi.deleteItem(itemId)
    }
    catch (err: any) {
      error.value = err.message || '刪除商品失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 清空購物車
   */
  const clearCart = async () => {
    isLoading.value = true
    error.value = null
    try {
      await cartApi.clear()
      cart.value = null
    }
    catch (err: any) {
      error.value = err.message || '清空購物車失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 驗證購物車（檢查庫存、價格）
   */
  const validateCart = async () => {
    try {
      return await cartApi.validate()
    }
    catch (err: any) {
      error.value = err.message || '驗證購物車失敗'
      throw err
    }
  }

  /**
   * 清除錯誤
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    cart,
    isLoading,
    error,
    // Getters
    items,
    itemCount,
    subtotal,
    isEmpty,
    // Actions
    fetchCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    validateCart,
    clearError,
  }
})
