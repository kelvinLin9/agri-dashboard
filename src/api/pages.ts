import apiClient from './apiClient'

/**
 * 頁面類型枚舉
 */
export enum PageType {
  HOME = 'home',
  ABOUT = 'about',
  CONTACT = 'contact',
  TERMS = 'terms',
  PRIVACY = 'privacy',
  CUSTOM = 'custom',
}

/**
 * 頁面狀態枚舉
 */
export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * 頁面實體
 */
export interface Page {
  id: string
  slug: string
  title: string
  content: string
  type: PageType
  status: PageStatus
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  sortOrder: number
  showInMenu: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 創建頁面 DTO
 */
export interface CreatePageDto {
  slug: string
  title: string
  content: string
  type?: PageType
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  sortOrder?: number
  showInMenu?: boolean
}

/**
 * 更新頁面 DTO
 */
export type UpdatePageDto = Partial<CreatePageDto>

/**
 * Pages API
 */
class PagesApi {
  /**
   * 獲取所有頁面
   */
  async getAll(): Promise<Page[]> {
    const { data } = await apiClient.get<Page[]>('/pages')
    return data
  }

  /**
   * 根據 ID 獲取頁面
   */
  async getById(id: string): Promise<Page> {
    const { data } = await apiClient.get<Page>(`/pages/${id}`)
    return data
  }

  /**
   * 根據 slug 獲取頁面（公開）
   */
  async getBySlug(slug: string): Promise<Page> {
    const { data } = await apiClient.get<Page>(`/pages/slug/${slug}`)
    return data
  }

  /**
   * 創建頁面
   */
  async create(pageData: CreatePageDto): Promise<Page> {
    const { data } = await apiClient.post<Page>('/pages', pageData)
    return data
  }

  /**
   * 更新頁面
   */
  async update(id: string, pageData: UpdatePageDto): Promise<Page> {
    const { data } = await apiClient.patch<Page>(`/pages/${id}`, pageData)
    return data
  }

  /**
   * 發布頁面
   */
  async publish(id: string): Promise<Page> {
    const { data } = await apiClient.patch<Page>(`/pages/${id}/publish`)
    return data
  }

  /**
   * 取消發布頁面
   */
  async unpublish(id: string): Promise<Page> {
    const { data } = await apiClient.patch<Page>(`/pages/${id}/unpublish`)
    return data
  }

  /**
   * 刪除頁面
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pages/${id}`)
  }
}

export const pagesApi = new PagesApi()
