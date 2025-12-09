import apiClient from './apiClient'

export interface CouponValidationResult {
  isValid: boolean
  coupon?: {
    id: string
    code: string
    name: string
    type: 'percentage' | 'fixed'
    value: number
  }
  discountAmount?: number
  message?: string
}

export const couponsApi = {
  /**
   * 驗證優惠碼
   */
  validate: async (code: string, subtotal: number): Promise<CouponValidationResult> => {
    const response = await apiClient.post('/coupons/validate', { code, subtotal })
    return response.data
  },
}
