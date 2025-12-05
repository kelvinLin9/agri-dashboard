import apiClient from './apiClient'
import type {
  Refund,
  CreateRefundDto,
  ApproveRefundDto,
} from './types'

/**
 * 退款 API
 */
export const refundApi = {
  /**
   * 建立退款申請
   */
  create: async (data: CreateRefundDto): Promise<Refund> => {
    const response = await apiClient.post<{ data: Refund }>('/refund/create', data)
    return response.data.data
  },

  /**
   * 審核通過退款 (管理員)
   */
  approve: async (id: string, data?: ApproveRefundDto): Promise<Refund> => {
    const response = await apiClient.post<{ data: Refund }>(`/refund/${id}/approve`, data || {})
    return response.data.data
  },

  /**
   * 拒絕退款 (管理員)
   */
  reject: async (id: string, reason: string): Promise<Refund> => {
    const response = await apiClient.post<{ data: Refund }>(`/refund/${id}/reject`, { reason })
    return response.data.data
  },

  /**
   * 查詢退款記錄
   */
  getById: async (id: string): Promise<Refund> => {
    const response = await apiClient.get<{ data: Refund }>(`/refund/${id}`)
    return response.data.data
  },

  /**
   * 根據訂單 ID 查詢退款
   */
  getByOrderId: async (orderId: string): Promise<Refund> => {
    const response = await apiClient.get<{ data: Refund }>(`/refund/order/${orderId}`)
    return response.data.data
  },
}
