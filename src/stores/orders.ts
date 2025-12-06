import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ordersApi } from '@/api'
import type { Order, OrderStatus, CreateOrderDto, CreateOrderFromCartDto } from '@/api/types'

/**
 * 訂單 Store
 * 管理訂單列表和訂單詳情
 */
export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasOrders = computed(() => orders.value.length > 0)

  /**
   * 根據狀態過濾訂單
   */
  const getOrdersByStatus = computed(() => {
    return (status: OrderStatus) => orders.value.filter(order => order.status === status)
  })

  // Actions
  /**
   * 取得我的訂單
   */
  const fetchMyOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ordersApi.getMyOrders()
      orders.value = response.data
    }
    catch (err: any) {
      error.value = err.message || '載入訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 根據 ID 取得訂單詳情
   */
  const fetchOrderById = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ordersApi.getById(id)
      currentOrder.value = response.data
    }
    catch (err: any) {
      error.value = err.message || '載入訂單詳情失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 根據訂單編號取得訂單
   */
  const fetchOrderByNumber = async (orderNumber: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ordersApi.getByOrderNumber(orderNumber)
      currentOrder.value = response.data
    }
    catch (err: any) {
      error.value = err.message || '載入訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 創建訂單
   */
  const createOrder = async (data: CreateOrderDto) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ordersApi.create(data)
      currentOrder.value = response.data
      return response.data
    }
    catch (err: any) {
      error.value = err.message || '創建訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 從購物車創建訂單（推薦使用）
   */
  const createOrderFromCart = async (data: CreateOrderFromCartDto) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ordersApi.createFromCart(data)
      currentOrder.value = response.data
      return response.data
    }
    catch (err: any) {
      error.value = err.message || '創建訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 取消訂單
   */
  const cancelOrder = async (id: string, cancelReason?: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await ordersApi.cancel(id, cancelReason)
      // 更新列表中的訂單狀態
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = response.data
      }
      // 如果是當前訂單，也更新
      if (currentOrder.value?.id === id) {
        currentOrder.value = response.data
      }
    }
    catch (err: any) {
      error.value = err.message || '取消訂單失敗'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 清除當前訂單
   */
  const clearCurrentOrder = () => {
    currentOrder.value = null
  }

  /**
   * 清除錯誤
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,
    // Getters
    hasOrders,
    getOrdersByStatus,
    // Actions
    fetchMyOrders,
    fetchOrderById,
    fetchOrderByNumber,
    createOrder,
    createOrderFromCart,
    cancelOrder,
    clearCurrentOrder,
    clearError,
  }
})
