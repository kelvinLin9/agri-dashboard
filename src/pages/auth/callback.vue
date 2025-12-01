<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <UCard class="w-full max-w-md text-center">
      <div v-if="isProcessing">
        <UIcon name="i-heroicons-arrow-path" class="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
        <h2 class="text-xl font-semibold mb-2">正在處理 Google 登入...</h2>
        <p class="text-gray-500">請稍候</p>
      </div>

      <div v-else-if="error">
        <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-red-600 mb-2">登入失敗</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <UButton @click="redirectToLogin" size="lg">
          返回登入頁面
        </UButton>
      </div>

      <div v-else-if="success">
        <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-green-600 mb-2">登入成功！</h2>
        <p class="text-gray-600">正在跳轉到首頁...</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'

const router = useRouter()
const isProcessing = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    // 從 URL 參數中獲取 tokens
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('accessToken')
    const refreshToken = urlParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      throw new Error('缺少認證憑證')
    }

    // 存儲 tokens 到 localStorage（使用與 apiClient 一致的 key 名稱）
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)

    // 獲取用戶資料
    try {
      const userProfile = await authApi.getProfile()
      
      // 檢查權限：只有管理員可以登入後台
      if (userProfile.role !== 'ADMIN' && userProfile.role !== 'SUPER_ADMIN') {
        throw new Error('權限不足：只有管理員可以登入後台管理系統')
      }
      
      localStorage.setItem('user', JSON.stringify(userProfile))
    } catch (err: any) {
      // 如果是權限錯誤，重新拋出以便外層捕獲並顯示錯誤
      if (err.message.includes('權限不足')) {
        throw err
      }
      console.error('無法獲取用戶資料:', err)
    }

    // 標記成功
    success.value = true
    isProcessing.value = false

    // 延遲跳轉以顯示成功訊息
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err: any) {
    console.error('Google 登入失敗:', err)
    
    // 清除可能已存儲的 token
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    error.value = err.message || '處理登入資訊時發生錯誤'
    isProcessing.value = false
  }
})

const redirectToLogin = () => {
  router.push('/login')
}
</script>
