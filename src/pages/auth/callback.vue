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
import apiClient from '@/api/apiClient'

const router = useRouter()
const isProcessing = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    // 從 URL 參數中獲取 authorization code（而不是直接獲取 token）
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (!code) {
      throw new Error('缺少認證憑證')
    }

    // 用 authorization code 換取 token
    // 這個請求是 POST，不會在 URL 中暴露敏感資訊
    const response = await apiClient.post<{ data: {
      accessToken: string
      refreshToken: string
      user: any
    } }>('/auth/oauth/token', { code })
    
    const authData = response.data.data

    if (!authData.accessToken || !authData.refreshToken) {
      throw new Error('無法獲取認證憑證')
    }

    // 存儲 tokens 到 localStorage
    localStorage.setItem('access_token', authData.accessToken)
    localStorage.setItem('refresh_token', authData.refreshToken)

    // 檢查權限：只有管理員可以登入後台
    if (authData.user.role !== 'admin' && authData.user.role !== 'super_admin') {
      // 清除 token
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      throw new Error('權限不足：只有管理員可以登入後台管理系統')
    }
    
    localStorage.setItem('user', JSON.stringify(authData.user))

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
