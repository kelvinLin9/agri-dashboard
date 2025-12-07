/**
 * 訂單相關類型
 */

import type { SearchableQueryParams } from './common'
import type { Product } from './product'

// 訂單狀態
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// 訂單項目
export interface OrderItem {
  id: number
  orderId: string
  productId: number
  productName: string
  productSku: string
  productImage: string
  unitPrice: number
  quantity: number
  subtotal: number
  discountAmount?: number
  total: number
  price?: number  // 別名,與 unitPrice 相同
  note?: string
  createdAt?: string
  updatedAt?: string
  product?: Product
}

// 訂單
export interface Order {
  id: string
  orderNumber: string
  memberId: string
  status: OrderStatus
  paymentMethod: string
  shippingMethod: string
  recipientName: string
  recipientPhone: string
  recipientEmail?: string
  recipientPostalCode: string
  recipientCity: string
  recipientDistrict: string
  recipientAddress: string
  subtotal: number
  shippingFee: number
  discountAmount: number
  pointsUsed: number
  pointsEarned: number
  totalAmount: number
  trackingNumber?: string
  customerNote?: string
  adminNote?: string
  paidAt?: string
  shippedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  orderItems?: OrderItem[]
}

// 訂單查詢參數
export interface OrderQueryParams extends SearchableQueryParams {
  status?: OrderStatus
  memberId?: string
  paymentMethod?: string
  shippingMethod?: string
}

// 建立訂單 DTO
export interface CreateOrderDto {
  orderItems: {
    productId: string
    quantity: number
    note?: string
  }[]
  paymentMethod: string
  shippingMethod: string
  recipientName: string
  recipientPhone: string
  recipientEmail?: string
  recipientPostalCode: string
  recipientCity: string
  recipientDistrict: string
  recipientAddress: string
  pointsUsed?: number
  customerNote?: string
}

// 從購物車建立訂單 DTO
export interface CreateOrderFromCartDto {
  paymentMethod: string
  shippingMethod: string
  recipientName: string
  recipientPhone: string
  recipientEmail?: string
  recipientPostalCode: string
  recipientCity: string
  recipientDistrict: string
  recipientAddress: string
  couponCode?: string
  pointsUsed?: number
  customerNote?: string
}

// 更新訂單 DTO
export interface UpdateOrderDto {
  status?: OrderStatus
  trackingNumber?: string | null
  shippingFee?: number
  discountAmount?: number
  adminNote?: string | null
}
