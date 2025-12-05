import apiClient from './apiClient'
import type {
  Payment,
  CreatePaymentDto,
} from './types'

/**
 * 支付 API
 */
export const paymentApi = {
  /**
   * 建立支付訂單
   * 注意:此 API 會返回 HTML 表單,需要前端自動提交到 ECPay
   */
  create: async (data: CreatePaymentDto): Promise<string> => {
    const response = await apiClient.post<string>('/payment/create', data)
    // 返回 HTML 表單字串
    return response.data
  },

  /**
   * 查詢支付記錄
   */
  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get<{ data: Payment }>(`/payment/${id}`)
    return response.data.data
  },

  /**
   * 根據訂單 ID 查詢支付
   */
  getByOrderId: async (orderId: string): Promise<Payment> => {
    const response = await apiClient.get<{ data: Payment }>(`/payment/order/${orderId}`)
    return response.data.data
  },
}
