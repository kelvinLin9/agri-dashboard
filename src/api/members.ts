import apiClient, { buildQueryString } from './apiClient'
import type {
  Member,
  MemberQueryParams,
  CreateMemberDto,
  UpdateMemberDto,
  PaginatedResponse,
  ApiResponse,
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
    const response = await apiClient.get<PaginatedResponse<Member>>(`/members${queryString}`)
    return response.data
  },

  /**
   * 查詢我的會員資料
   */
  getMyProfile: async (): Promise<ApiResponse<Member>> => {
    const response = await apiClient.get<ApiResponse<Member>>('/members/my-profile')
    return response.data
  },

  /**
   * 根據 ID 查詢會員
   */
  getById: async (id: string): Promise<ApiResponse<Member>> => {
    const response = await apiClient.get<ApiResponse<Member>>(`/members/${id}`)
    return response.data
  },

  /**
   * 建立會員資料
   */
  create: async (data: CreateMemberDto): Promise<ApiResponse<Member>> => {
    const response = await apiClient.post<ApiResponse<Member>>('/members', data)
    return response.data
  },

  /**
   * 更新會員資料
   */
  update: async (id: string, data: UpdateMemberDto): Promise<ApiResponse<Member>> => {
    const response = await apiClient.put<ApiResponse<Member>>(`/members/${id}`, data)
    return response.data
  },

  /**
   * 更新我的會員資料
   */
  updateMyProfile: async (data: UpdateMemberDto): Promise<ApiResponse<Member>> => {
    const response = await apiClient.put<ApiResponse<Member>>('/members/my-profile', data)
    return response.data
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
}
