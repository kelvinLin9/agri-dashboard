<template>
  <UApp>
    <Header v-if="route.meta.layout !== 'blank'" />
    <UContainer>
      <RouterView />
    </UContainer>
    <LoadingOverlay :is-open="isLoading" />

    <!-- PWA 安裝提示 -->
    <PwaInstallPrompt />

    <!-- 推送通知訂閱提示 -->
    <PushNotificationPrompt />

    <!-- 浮動購物車按鈕 -->
    <FloatingCart />

    <!-- 回到頂部按鈕 -->
    <BackToTop />

    <!-- Cookie 同意橫幅 -->
    <CookieConsent />
  </UApp>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from './layout/Header.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'
import PushNotificationPrompt from './components/PushNotificationPrompt.vue'
import FloatingCart from './components/FloatingCart.vue'
import BackToTop from './components/common/BackToTop.vue'
import CookieConsent from './components/common/CookieConsent.vue'
import { useNotifications } from '@/composables/useNotifications'
import { useNotificationStore } from '@/stores/notification'
import { isLoading } from '@/utils/loading'
import { setToastInstance } from '@/utils/globalToast'
import { useToast } from '@/composables/useToast'

// 初始化全域 Toast（讓 API 攔截器可以使用）
const toast = useToast()
setToastInstance(toast)

// 初始化通知功能
const route = useRoute()
const { connect, disconnect, requestDesktopPermission } = useNotifications()
const notificationStore = useNotificationStore()

onMounted(async () => {
  // 檢查是否有 access token
  const token = localStorage.getItem('access_token')

  if (token) {
    // 連接 WebSocket
    connect()

    // 載入未讀通知數量
    await notificationStore.fetchUnreadCount()

    // 請求桌面通知權限
    await requestDesktopPermission()
  } else {
    console.log('🔔 No access token, skipping notification initialization')
  }
})

onUnmounted(() => {
  // 組件卸載時斷開 WebSocket
  disconnect()
})
</script>
