<template>
  <UApp>
    <Header />
    <UContainer>
      <RouterView />
    </UContainer>
    <!-- <LoadingOverlay :is-open="isLoading" /> -->
  </UApp>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Header from './layout/Header.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import { useNotifications } from '@/composables/useNotifications'
import { useNotificationStore } from '@/stores/notification'

// 初始化通知功能
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
