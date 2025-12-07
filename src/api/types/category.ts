/**
 * 分類相關類型
 */

// 分類介面
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  children?: Category[]
}

// 建立分類 DTO
export interface CreateCategoryDto {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
  isActive?: boolean
  sortOrder?: number
}

// 更新分類 DTO
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> { }
