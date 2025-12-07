/**
 * 產品相關驗證 Schema
 * 使用 Valibot 進行表單驗證
 */

import * as v from 'valibot'

/**
 * 產品表單驗證 Schema
 */
export const ProductFormSchema = v.object({
  // 基本資訊
  name: v.pipe(
    v.string('產品名稱必須是文字'),
    v.nonEmpty('請輸入產品名稱'),
    v.minLength(2, '產品名稱至少 2 個字'),
    v.maxLength(100, '產品名稱最多 100 個字')
  ),

  slug: v.pipe(
    v.string('Slug 必須是文字'),
    v.nonEmpty('請輸入 Slug'),
    v.regex(/^[a-z0-9-]+$/, 'Slug 只能包含小寫英文、數字和連字號')
  ),

  categoryId: v.pipe(
    v.number('請選擇分類'),
    v.minValue(1, '請選擇分類')
  ),

  status: v.pipe(
    v.string('請選擇狀態'),
    v.picklist(['active', 'inactive', 'out_of_stock'], '請選擇有效的狀態')
  ),

  isFeatured: v.optional(v.boolean()),
  isNew: v.optional(v.boolean()),

  // 價格
  originalPrice: v.pipe(
    v.number('原價必須是數字'),
    v.minValue(0, '原價不能為負數')
  ),

  salePrice: v.optional(
    v.pipe(
      v.number('售價必須是數字'),
      v.minValue(0, '售價不能為負數')
    )
  ),

  costPrice: v.optional(
    v.pipe(
      v.number('成本價必須是數字'),
      v.minValue(0, '成本價不能為負數')
    )
  ),

  // 庫存
  stockQuantity: v.pipe(
    v.number('庫存數量必須是數字'),
    v.minValue(0, '庫存數量不能為負數'),
    v.integer('庫存數量必須是整數')
  ),

  lowStockThreshold: v.optional(
    v.pipe(
      v.number('低庫存閾值必須是數字'),
      v.minValue(0, '低庫存閾值不能為負數'),
      v.integer('低庫存閾值必須是整數')
    )
  ),

  trackInventory: v.optional(v.boolean()),

  // 描述
  shortDescription: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(200, '簡短描述最多 200 個字')
    )
  ),

  description: v.optional(v.string()),

  // 產品資訊
  origin: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(50, '產地最多 50 個字')
    )
  ),

  shelfLife: v.optional(
    v.pipe(
      v.number('保存期限必須是數字'),
      v.minValue(0, '保存期限不能為負數')
    )
  ),

  // 圖片
  mainImage: v.optional(v.string()),
  images: v.optional(v.array(v.string())),

  // SEO
  seoTitle: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(60, 'SEO 標題最多 60 個字')
    )
  ),

  seoDescription: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(160, 'SEO 描述最多 160 個字')
    )
  ),

  seoKeywords: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(200, 'SEO 關鍵字最多 200 個字')
    )
  ),
})

/**
 * 產品表單型別 (從 Schema 推導)
 */
export type ProductFormData = v.InferOutput<typeof ProductFormSchema>

/**
 * 產品表單輸入型別
 */
export type ProductFormInput = v.InferInput<typeof ProductFormSchema>
