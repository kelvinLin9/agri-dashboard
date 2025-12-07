/**
 * 支付相關類型
 */

// 支付狀態
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUNDED = 'PARTIAL_REFUNDED',
}

// 支付方式
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  ATM = 'ATM',
  CVS = 'CVS',
  COD = 'COD',
}

// 支付記錄
export interface Payment {
  id: string // UUID
  orderId: string // UUID
  paymentNumber: string
  status: PaymentStatus
  amount: number
  paymentMethod: PaymentMethod
  ecpayTradeNo?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

// 建立支付 DTO
export interface CreatePaymentDto {
  orderId: string
}
