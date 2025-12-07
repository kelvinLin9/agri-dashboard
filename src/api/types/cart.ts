/**
 * 購物車相關類型
 */

import type { Product } from './product'

// 購物車項目
export interface CartItem {
  id: string
  productId: string
  cartId: string
  productName?: string      // API 返回的商品名稱
  productImage?: string     // API 返回的商品圖片
  unitPrice: number         // 單價（實際 API 字段名）
  quantity: number
  price?: number           // 備用欄位
  subtotal: number
  product?: Product
  createdAt: string
  updatedAt: string
}

// 購物車
export interface Cart {
  id: string
  memberId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

// 新增購物車項目 DTO
export interface AddCartItemDto {
  productId: string
  quantity: number
}

// 更新購物車項目 DTO
export interface UpdateCartItemDto {
  quantity: number
}

// 驗證購物車響應
export interface ValidateCartResponse {
  isValid: boolean  // 改為 isValid 匹配後端 API
  issues?: {
    productId: string
    issue: string
  }[]
}
