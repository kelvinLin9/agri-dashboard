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
  productSlug?: string      // 商品 slug
  unitPrice: number         // 加入時的單價
  currentPrice: number      // 當前產品價格
  quantity: number
  price?: number           // 備用欄位
  subtotal: number
  stockQuantity: number    // 當前庫存
  isAvailable: boolean     // 是否可購買
  priceChanged: boolean    // 價格是否已變動
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
