import apiClient from './apiClient'
import type {
  Notification,
  CreateNotificationDto,
  ApiResponse,
} from './types'

/**
 * 通知 API
 */
export const notificationsApi = {
  /**
   * 查詢所有通知（管理員）
   */
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications')
    return response.data
  },

  /**
   * 查詢我的通知
   */
  getMyNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/notifications/my-notifications')
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
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`)
  },

  /**
   * 標記全部已讀
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/mark-all-read')
  },

  /**
   * 刪除通知
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`)
  },

  /**
   * 清空所有已讀通知
   */
  clearRead: async (): Promise<void> => {
    await apiClient.delete('/notifications/clear-read')
  },
}
