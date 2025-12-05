import apiClient, { buildQueryString } from './apiClient'
import type {
  Member,
  MemberQueryParams,
  CreateMemberDto,
  UpdateMemberDto,
  PaginatedResponse,
} from './types'

/**
 * 會員 API
 */
export const membersApi = {
  /**
   * 查詢所有會員（管理員，支援分頁、排序、搜尋）
   */
  getAll: async (params?: MemberQueryParams): Promise<PaginatedResponse<Member>> => {
    const queryString = params ? buildQueryString(params) : ''
    const response = await apiClient.get<{ data: PaginatedResponse<Member> }>(`/members${queryString}`)
    return response.data.data
  },

  /**
   * 查詢我的會員資料
   */
  getMyProfile: async (): Promise<Member> => {
    const response = await apiClient.get<{ data: Member }>('/members/my-profile')
    return response.data.data
  },

  /**
   * 根據 ID 查詢會員
   */
  getById: async (id: string): Promise<Member> => {
    const response = await apiClient.get<{ data: Member }>(`/members/${id}`)
    return response.data.data
  },

  /**
   * 建立會員資料
   */
  create: async (data: CreateMemberDto): Promise<Member> => {
    const response = await apiClient.post<{ data: Member }>('/members', data)
    return response.data.data
  },

  /**
   * 更新會員資料
   */
  update: async (id: string, data: UpdateMemberDto): Promise<Member> => {
    const response = await apiClient.put<{ data: Member }>(`/members/${id}`, data)
    return response.data.data
  },

  /**
   * 更新我的會員資料
   */
  updateMyProfile: async (data: UpdateMemberDto): Promise<Member> => {
    const response = await apiClient.put<{ data: Member }>('/members/my-profile', data)
    return response.data.data
  },

  /**
   * 刪除會員
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/members/${id}`)
  },

  /**
   * 獲取會員統計
   */
  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/members/statistics')
    return response.data
  },

  /**
   * 查詢等級福利
   */
  getLevelBenefits: async (level: string): Promise<any> => {
    const response = await apiClient.get<{ data: any }>(`/members/level-benefits/${level}`)
    return response.data.data
  },

  /**
   * 增加會員點數 (管理員)
   */
  addPoints: async (id: string, data: { points: number; reason: string }): Promise<Member> => {
    const response = await apiClient.post<{ data: Member }>(`/members/${id}/add-points`, data)
    return response.data.data
  },

  /**
   * 扣除會員點數 (管理員)
   */
  deductPoints: async (id: string, data: { points: number; reason: string }): Promise<Member> => {
    const response = await apiClient.post<{ data: Member }>(`/members/${id}/deduct-points`, data)
    return response.data.data
  },
}
