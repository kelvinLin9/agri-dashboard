/**
 * 退款相關類型
 */

// 退款狀態
export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// 退款記錄
export interface Refund {
  id: string // UUID
  paymentId: string // UUID
  orderId: string // UUID
  refundNumber: string
  amount: number
  reason: string
  status: RefundStatus
  rejectedReason?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// 建立退款 DTO
export interface CreateRefundDto {
  orderId: string
  amount: number
  reason: string
}

// 批准退款 DTO
export interface ApproveRefundDto {
  note?: string
}
