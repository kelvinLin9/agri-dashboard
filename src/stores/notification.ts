import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationsApi } from '@/api/notifications'
import type { Notification, NotificationStatus, NotificationType, NotificationQueryParams } from '@/api/types'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const isConnected = ref(false)

  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
  })

  const filters = ref<{
    type: NotificationType | null
    status: NotificationStatus | null
  }>({
    type: null,
    status: null,
  })

  // Actions
  const fetchNotifications = async () => {
    isLoading.value = true
    try {
      const params: NotificationQueryParams = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as any,
      }

      if (filters.value.type) params.type = filters.value.type
      if (filters.value.status) params.status = filters.value.status

      const response = await notificationsApi.getAll(params)
      const paginatedData = response.data as { data?: Notification[], meta?: { total?: number } } || {}
      notifications.value = Array.isArray(paginatedData.data) ? paginatedData.data : []
      pagination.value.total = paginatedData.meta?.total || 0
    } catch (error) {
      console.error('獲取通知失敗:', error)
      notifications.value = []
      pagination.value.total = 0
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      unreadCount.value = response.count || 0
    } catch (error) {
      console.error('獲取未讀數量失敗:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      // 更新本地狀態
      const notification = notifications.value.find(n => n.id === id)
      if (notification && notification.status !== 'read') {
        notification.status = 'read' as any
        notification.readAt = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('標記已讀失敗:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      // 更新本地所有未讀通知
      notifications.value.forEach(n => {
        if (n.status !== 'read') {
          n.status = 'read' as any
          n.readAt = new Date().toISOString()
        }
      })
      unreadCount.value = 0
    } catch (error) {
      console.error('標記全部已讀失敗:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id)
      // 從本地移除
      const index = notifications.value.findIndex(n => n.id === id)
      if (index > -1) {
        const notification = notifications.value[index]
        if (notification && notification.status !== 'read') {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
        pagination.value.total = Math.max(0, pagination.value.total - 1)
      }
    } catch (error) {
      console.error('刪除通知失敗:', error)
    }
  }

  // WebSocket 新通知處理
  const addNotification = (notification: Notification) => {
    notifications.value.unshift(notification)
    pagination.value.total++
    if (notification.status !== 'read') {
      unreadCount.value++
    }
  }

  const setPage = (page: number) => {
    pagination.value.page = page
  }

  const setFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  const resetFilters = () => {
    filters.value = {
      type: null,
      status: null,
    }
    pagination.value.page = 1
  }

  const setConnected = (connected: boolean) => {
    isConnected.value = connected
  }

  // Getters
  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => n.status !== 'read')
  })

  const hasUnread = computed(() => {
    return unreadCount.value > 0
  })

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    pagination,
    filters,
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    setPage,
    setFilters,
    resetFilters,
    setConnected,
    // Getters
    unreadNotifications,
    hasUnread,
  }
})
