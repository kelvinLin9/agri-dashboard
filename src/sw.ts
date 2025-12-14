/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

// Workbox 預快取和路由
const manifest = self.__WB_MANIFEST
precacheAndRoute(manifest)
cleanupOutdatedCaches()

// 允許立即控制頁面
self.skipWaiting()
clientsClaim()

// SPA 導航處理 - 只在有預快取資源時啟用（生產環境）
try {
  if (manifest && manifest.length > 0) {
    const handler = createHandlerBoundToURL('/index.html')
    const navigationRoute = new NavigationRoute(handler, {
      denylist: [/^\/api\//], // API 請求不走 SPA 路由
    })
    registerRoute(navigationRoute)
  } else {
    console.log('[SW] Development mode - skipping navigation route')
  }
} catch (error) {
  console.warn('[SW] Navigation route setup failed (normal in development):', error)
}

/**
 * Push 事件處理器
 * 接收來自後端的推送通知
 */
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push event received:', event)

  if (!event.data) {
    console.warn('[SW] Push event has no data')
    return
  }

  try {
    const data = event.data.json()
    console.log('[SW] Push data:', data)

    const title = data.title || '新通知'
    const options: NotificationOptions = {
      body: data.body || '',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-192x192.png',
      data: data.data || { url: '/' },
      tag: data.tag || 'notification',
      requireInteraction: data.priority >= 2, // 高優先級通知需要用戶交互
    }

    // 添加非標準屬性 (vibrate, actions)
    if (data.vibrate) {
      (options as any).vibrate = data.vibrate
    } else {
      (options as any).vibrate = [200, 100, 200]
    }

    if (data.actions) {
      (options as any).actions = data.actions
    }

    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          console.log('[SW] Notification shown:', title)
        })
        .catch((error) => {
          console.error('[SW] Failed to show notification:', error)
        })
    )
  } catch (error) {
    console.error('[SW] Failed to parse push data:', error)
  }
})

/**
 * NotificationClick 事件處理器
 * 處理用戶點擊通知的行為
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked:', event.notification)

  // 關閉通知
  event.notification.close()

  // 獲取要打開的 URL (默認為首頁)
  const urlToOpen = event.notification.data?.url || '/'
  const fullUrl = new URL(urlToOpen, self.location.origin).href

  console.log('[SW] Opening URL:', fullUrl)

  // 處理點擊事件
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      console.log('[SW] Existing clients:', clientList.length)

      // 如果已有相同 URL 的窗口,聚焦到該窗口
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          console.log('[SW] Focusing existing window')
          return client.focus()
        }
      }

      // 如果有任何窗口打開,導航到目標 URL
      if (clientList.length > 0) {
        const firstClient = clientList[0]
        if (firstClient && 'navigate' in firstClient && typeof firstClient.navigate === 'function') {
          console.log('[SW] Navigating existing window')
          return firstClient.navigate(fullUrl).then(client => client?.focus())
        }
      }

      // 否則打開新窗口
      if (self.clients.openWindow) {
        console.log('[SW] Opening new window')
        return self.clients.openWindow(fullUrl)
      }
    }).catch((error) => {
      console.error('[SW] Failed to handle notification click:', error)
    })
  )
})

/**
 * Message 事件處理器
 * 處理來自客戶端的消息
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('[SW] Service Worker loaded with push notification support')
