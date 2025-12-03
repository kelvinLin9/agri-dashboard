<template>
  <UCard v-if="showPrompt && isSupported" class="fixed bottom-20 right-4 max-w-sm shadow-lg z-40">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-bell" class="w-6 h-6 text-blue-500" />
          <h3 class="font-semibold">開啟推送通知</h3>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="xs"
          :padded="false"
          @click="dismiss"
        />
      </div>
    </template>
    
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      開啟推送通知，即時接收訂單、支付等重要訊息，即使應用關閉也不錯過！
    </p>
    
    <div class="flex gap-2">
      <UButton 
        color="blue" 
        block 
        :loading="isLoading"
        @click="enableNotifications"
      >
        <template #leading>
          <UIcon name="i-heroicons-bell-alert" />
        </template>
        開啟通知
      </UButton>
    </div>
    
    <p v-if="error" class="text-xs text-red-500 mt-2">
      {{ error }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePushNotification } from '@/composables/usePushNotification'

const { 
  isSupported, 
  isSubscribed, 
  isLoading, 
  error,
  subscribeToPush 
} = usePushNotification()

const showPrompt = ref(false)

onMounted(() => {
  // 檢查是否需要顯示提示
  const hasPrompted = localStorage.getItem('push-notification-prompted')
  const notificationPermission = Notification?.permission
  
  // 如果：
  // 1. 從未提示過
  // 2. 瀏覽器支援
  // 3. 還沒訂閱
  // 4. 權限不是 denied
  // 則在 5 秒後顯示提示
  if (
    !hasPrompted && 
    isSupported.value && 
    !isSubscribed.value &&
    notificationPermission !== 'denied'
  ) {
    setTimeout(() => {
      showPrompt.value = true
    }, 5000) // 5 秒後顯示，給用戶時間先看到 PWA 安裝提示
  }
})

const enableNotifications = async () => {
  const success = await subscribeToPush()
  
  if (success) {
    showPrompt.value = false
    localStorage.setItem('push-notification-prompted', 'true')
  }
}

const dismiss = () => {
  showPrompt.value = false
  localStorage.setItem('push-notification-prompted', 'true')
  
  // 7 天後再提示
  setTimeout(() => {
    localStorage.removeItem('push-notification-prompted')
  }, 7 * 24 * 60 * 60 * 1000)
}
</script>
