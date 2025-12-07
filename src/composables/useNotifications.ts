import { ref, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useNotificationStore } from '@/stores/notification'
import { useToast } from '@/composables/useToast'
import type { Notification } from '@/api/types'

export const useNotifications = () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const notificationStore = useNotificationStore()
  const toast = useToast()

  // WebSocket 連線
  const connect = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.warn('No access token found, cannot connect to notifications')
      return
    }

    // 構建 WebSocket URL
    let wsUrl: string
    if (import.meta.env.VITE_API_URL) {
      // 從 API URL 轉換為 WebSocket URL
      const apiUrl = import.meta.env.VITE_API_URL
      wsUrl = apiUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://')
        .replace('/api', '') + '/notifications'
    } else {
      // Fallback URL
      wsUrl = 'wss://agri-backend-660672910950.asia-east1.run.app/notifications'
    }

    console.log('🔧 [useNotifications] WebSocket URL:', wsUrl)
    console.log('🔧 [useNotifications] Access Token:', token?.substring(0, 20) + '...')
    console.log('🔧 [useNotifications] Environment Variables:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      mode: import.meta.env.MODE,
    })


    // 建立 WebSocket 連線
    socket.value = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    // 連線成功
    socket.value.on('connect', () => {
      console.log('✅ Connected to notification server')
      isConnected.value = true
      notificationStore.setConnected(true)
      socket.value?.emit('subscribe')
    })

    // 連線斷開
    socket.value.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notification server:', reason)
      isConnected.value = false
      notificationStore.setConnected(false)
    })

    // 連線錯誤
    socket.value.on('connect_error', (error) => {
      console.error('Connection error:', error.message)
      isConnected.value = false
      notificationStore.setConnected(false)
    })

    // 接收新通知
    socket.value.on('notification', (notification: Notification) => {
      console.log('📬 New notification received:', notification)

      // 更新 Store
      notificationStore.addNotification(notification)

      // 顯示控制台通知（開發用）
      showNotificationToast(notification)

      // 桌面通知（如果已授權）
      showDesktopNotification(notification)
    })

    // 訂閱確認
    socket.value.on('subscribed', (data) => {
      console.log('✅ Subscribed to notifications:', data)
    })
  }

  // 斷開連線
  const disconnect = () => {
    if (socket.value) {
      socket.value.emit('unsubscribe')
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      notificationStore.setConnected(false)
      console.log('🔌 Disconnected from notification server')
    }
  }

  // 顯示 Toast 通知
  const showNotificationToast = (notification: Notification) => {
    // 根據優先級決定顏色
    const color = notification.priority >= 3 ? 'error' :
      notification.priority >= 2 ? 'warning' :
        notification.priority >= 1 ? 'info' : 'primary'

    // 根據類型決定圖標
    const icons: Record<string, string> = {
      system: 'i-heroicons-cog-6-tooth',
      order: 'i-heroicons-shopping-bag',
      payment: 'i-heroicons-credit-card',
      member: 'i-heroicons-user',
      product: 'i-heroicons-cube',
      promotion: 'i-heroicons-megaphone',
      refund: 'i-heroicons-arrow-uturn-left',
    }
    const icon = icons[notification.type] || 'i-heroicons-bell'

    toast.add({
      title: notification.title,
      description: notification.content,
      icon,
      color,
    })
  }

  // 顯示桌面通知
  const showDesktopNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const desktopNotif = new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority >= 2,
      })

      desktopNotif.onclick = () => {
        window.focus()
        if (notification.actionUrl) {
          // 使用 window.location 導航
          window.location.href = notification.actionUrl
        }
        notificationStore.markAsRead(notification.id)
        desktopNotif.close()
      }
    }
  }

  // 請求桌面通知權限
  const requestDesktopPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  // 組件卸載時斷開連線
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    requestDesktopPermission,
  }
}
