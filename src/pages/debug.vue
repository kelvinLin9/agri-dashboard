<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <UCard class="max-w-md">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-wrench-screwdriver" class="w-6 h-6 text-yellow-500" />
          <h2 class="text-xl font-bold">調試工具</h2>
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="cleared" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600" />
            <span class="text-sm font-medium text-green-900 dark:text-green-100">
              推送通知標記已清除
            </span>
          </div>
          <p class="text-sm text-green-800 dark:text-green-200 mt-2">
            {{ countdown }} 秒後自動返回首頁...
          </p>
        </div>

        <div class="space-y-2">
          <UButton
            block
            color="red"
            variant="soft"
            @click="clearPushNotificationPrompt"
          >
            <template #leading>
              <UIcon name="i-heroicons-trash" />
            </template>
            清除推送通知提示標記
          </UButton>

          <UButton
            block
            color="orange"
            variant="soft"
            @click="clearAllStorage"
          >
            <template #leading>
              <UIcon name="i-heroicons-archive-box-x-mark" />
            </template>
            清除所有 LocalStorage
          </UButton>

          <UButton
            block
            color="gray"
            variant="outline"
            @click="router.push('/')"
          >
            返回首頁
          </UButton>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>當前狀態:</strong></p>
          <p>• 推送提示標記: {{ hasPrompted ? '已設置' : '未設置' }}</p>
          <p>• 通知權限: {{ notificationPermission }}</p>
          <p>• Access Token: {{ hasToken ? '存在' : '不存在' }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cleared = ref(false)
const countdown = ref(3)
const hasPrompted = ref(false)
const hasToken = ref(false)
const notificationPermission = ref('unknown')

onMounted(() => {
  // 檢查當前狀態
  hasPrompted.value = !!localStorage.getItem('push-notification-prompted')
  hasToken.value = !!localStorage.getItem('access_token')
  notificationPermission.value = Notification?.permission || 'unknown'
})

const clearPushNotificationPrompt = () => {
  localStorage.removeItem('push-notification-prompted')
  console.log('✅ 已清除推送通知提示標記')
  
  cleared.value = true
  
  // 倒數計時
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      router.push('/')
    }
  }, 1000)
}

const clearAllStorage = () => {
  if (confirm('⚠️ 這將清除所有資料並登出,確定要繼續嗎?')) {
    localStorage.clear()
    console.log('🗑️ 已清除所有 LocalStorage')
    alert('✅ 已清除所有資料!')
    router.push('/login')
  }
}
</script>
