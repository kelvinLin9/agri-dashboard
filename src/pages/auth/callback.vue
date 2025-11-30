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
    console.log('=== Google OAuth Callback 開始處理 ===')
    console.log('當前 URL:', window.location.href)
    
    // 從 URL 參數中獲取 tokens
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('accessToken')
    const refreshToken = urlParams.get('refreshToken')

    console.log('提取的 accessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null')
    console.log('提取的 refreshToken:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null')

    if (!accessToken || !refreshToken) {
      console.error('錯誤：缺少 token')
      throw new Error('缺少認證憑證')
    }

    // 存儲 tokens 到 localStorage（使用與 apiClient 一致的 key 名稱）
    console.log('開始存儲 tokens...')
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    console.log('Tokens 已存儲')
    console.log('驗證存儲:', {
      access_token: localStorage.getItem('access_token')?.substring(0, 20) + '...',
      refresh_token: localStorage.getItem('refresh_token')?.substring(0, 20) + '...'
    })

    // 獲取用戶資料
    try {
      console.log('正在獲取用戶資料...')
      const userProfile = await authApi.getProfile()
      localStorage.setItem('user', JSON.stringify(userProfile))
      console.log('用戶資料已獲取並存儲:', userProfile)
    } catch (err) {
      console.error('無法獲取用戶資料:', err)
    }

    // 標記成功
    success.value = true
    isProcessing.value = false
    console.log('=== 處理完成，準備跳轉 ===')

    // 延遲跳轉以顯示成功訊息
    setTimeout(() => {
      console.log('跳轉到首頁')
      router.push('/')
    }, 1500)
  } catch (err: any) {
    console.error('=== Google 登入回調處理失敗 ===')
    console.error('錯誤詳情:', err)
    error.value = err.message || '處理登入資訊時發生錯誤'
    isProcessing.value = false
  }
})

const redirectToLogin = () => {
  // router.push('/login')
}
</script>
