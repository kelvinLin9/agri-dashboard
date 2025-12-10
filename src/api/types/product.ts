/**
 * 產品相關類型
 */

import type { SearchableQueryParams } from './common'
import type { Category } from './category'

// 產品介面
export interface Product {
  id: number
  categoryId: number
  name: string
  sku: string
  slug: string
  shortDescription?: string
  description?: string
  mainImage?: string
  images?: string[]
  originalPrice: number
  salePrice?: number
  costPrice?: number
  stockQuantity: number
  lowStockThreshold?: number
  trackInventory: boolean
  allowBackorder?: boolean
  weight?: number
  length?: number
  width?: number
  height?: number
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock'
  isFeatured: boolean
  isNew: boolean
  sortOrder?: number
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  origin?: string
  shelfLife?: number
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  category?: Category
}

// 產品查詢參數
export interface ProductQueryParams extends SearchableQueryParams {
  status?: 'draft' | 'active' | 'inactive' | 'out_of_stock'
  categoryId?: number
  isFeatured?: boolean
  isNew?: boolean
}

// 建立產品 DTO
export interface CreateProductDto {
  // 基本資訊 (必填)
  categoryId: number
  name: string
  slug: string
  originalPrice: number
  stockQuantity: number

  // 基本資訊 (可選)
  sku?: string // SKU 由後端自動產生，前端選填
  shortDescription?: string
  description?: string

  // 圖片
  mainImage?: string
  images?: string[]

  // 價格
  salePrice?: number
  costPrice?: number

  // 庫存管理
  lowStockThreshold?: number
  trackInventory?: boolean
  allowBackorder?: boolean

  // 物流資訊
  weight?: number
  length?: number
  width?: number
  height?: number

  // 狀態與設定
  status?: 'draft' | 'active' | 'inactive' | 'out_of_stock'
  isFeatured?: boolean
  isNew?: boolean
  sortOrder?: number

  // SEO
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string

  // 農產品特定欄位
  origin?: string
  shelfLife?: number
  notes?: string
}

// 更新產品 DTO (繼承 CreateProductDto 所有欄位為選填)
export type UpdateProductDto = Partial<CreateProductDto>
