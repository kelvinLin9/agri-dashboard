<template>
  <UApp>
    <component :is="layoutComponent">
      <RouterView />
    </component>

    <LoadingOverlay :is-open="isLoading" />

    <!-- PWA 安裝提示 -->
    <PwaInstallPrompt />

    <!-- 推送通知訂閱提示 -->
    <PushNotificationPrompt />
  </UApp>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import LoadingOverlay from './components/LoadingOverlay.vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'
import PushNotificationPrompt from './components/PushNotificationPrompt.vue'
import { useNotifications } from '@/composables/useNotifications'
import { useNotificationStore } from '@/stores/notification'
import { isLoading } from '@/utils/loading'
import { setToastInstance } from '@/utils/globalToast'
import { useTheme } from '@/composables/useTheme'
import { useToast } from '@/composables/useToast'

// Layout Components (Lazy loaded)
const BlankLayout = defineAsyncComponent(() => import('./layouts/BlankLayout.vue'))
const CustomerLayout = defineAsyncComponent(() => import('./layouts/CustomerLayout.vue'))
const AdminLayout = defineAsyncComponent(() => import('./layouts/AdminLayout.vue'))

// 初始化全域 Toast（讓 API 攔截器可以使用）
const toast = useToast()
setToastInstance(toast)

// 路由
const route = useRoute()

// 動態佈局選擇
const layoutComponent = computed(() => {
  const layout = route.meta.layout as string | undefined

  switch (layout) {
    case 'blank':
      return BlankLayout
    case 'admin':
      return AdminLayout
    case 'customer':
    default:
      return CustomerLayout
  }
})

// 初始化通知功能
const { connect, disconnect, requestDesktopPermission } = useNotifications()
const notificationStore = useNotificationStore()
const { initTheme } = useTheme()

onMounted(async () => {
  // 初始化主題
  initTheme()

  // 檢查是否有 access token
  const token = localStorage.getItem('access_token')

  if (token) {
    // 連接 WebSocket
    connect()

    // 載入未讀通知數量
    await notificationStore.fetchUnreadCount()

    // 請求桌面通知權限
    await requestDesktopPermission()
  }
})

onUnmounted(() => {
  // 組件卸載時斷開 WebSocket
  disconnect()
})
</script>
