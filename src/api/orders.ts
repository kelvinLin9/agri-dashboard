import apiClient, { buildQueryString } from './apiClient'
import type {
  Order,
  OrderQueryParams,
  CreateOrderDto,
  UpdateOrderDto,
  PaginatedResponse,
  ApiResponse,
} from './types'

/**
 * 訂單 API
 */
export const ordersApi = {
  /**
   * 查詢所有訂單（管理員，支援分頁、排序、搜尋）
   */
  getAll: async (params?: OrderQueryParams): Promise<PaginatedResponse<Order>> => {
    const queryString = params ? buildQueryString(params) : ''
    const response = await apiClient.get<PaginatedResponse<Order>>(`/orders${queryString}`)
    return response.data
  },

  /**
   * 查詢我的訂單
   */
  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders/my-orders')
    return response.data
  },

  /**
   * 根據 ID 查詢訂單
   */
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  /**
   * 根據訂單編號查詢
   */
  getByOrderNumber: async (orderNumber: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/order-number/${orderNumber}`)
    return response.data
  },

  /**
   * 建立訂單
   */
  create: async (data: CreateOrderDto): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data)
    return response.data
  },

  /**
   * 更新訂單（管理員）
   */
  update: async (id: string, data: UpdateOrderDto): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, data)
    return response.data
  },

  /**
   * 取消訂單（用戶）
   */
  cancel: async (id: string, cancelReason?: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/cancel`, {
      cancelReason,
    })
    return response.data
  },

  /**
   * 刪除訂單（管理員）
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`)
  },
}
