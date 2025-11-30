import apiClient, { buildQueryString } from './apiClient'
import type {
  Notification,
  NotificationQueryParams,
  CreateNotificationDto,
  PaginatedResponse,
  ApiResponse,
} from './types'

/**
 * 通知 API
 */
export const notificationsApi = {
  /**
   * 查詢當前用戶的通知列表（支援分頁、排序、篩選）
   */
  getAll: async (params?: NotificationQueryParams): Promise<PaginatedResponse<Notification>> => {
    const queryString = params ? buildQueryString(params) : ''
    const response = await apiClient.get<PaginatedResponse<Notification>>(`/notifications${queryString}`)
    return response.data
  },

  /**
   * 查詢未讀通知數量
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/notifications/unread-count')
    return response.data
  },

  /**
   * 建立通知（管理員）
   */
  create: async (data: CreateNotificationDto): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.post<ApiResponse<Notification>>('/notifications', data)
    return response.data
  },

  /**
   * 標記通知為已讀
   */
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`)
    return response.data
  },

  /**
   * 標記全部已讀
   */
  markAllAsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>('/notifications/read-all')
    return response.data
  },

  /**
   * 刪除通知
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`)
  },
}

