<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
    <UCard class="w-full max-w-md">
      <div class="text-center">
        <div class="flex justify-center mb-4">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          正在處理 Google 登入...
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          請稍候
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const code = route.query.code as string
  const error = route.query.error as string

  if (error) {
    console.error('Google OAuth error:', error)
    router.push({
      path: '/login',
      query: { error: 'google_auth_failed' }
    })
    return
  }

  if (!code) {
    router.push('/login')
    return
  }

  try {
    // 發送 authorization code 到後端
    // 注意：你需要在後端實作 Google OAuth 處理端點
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    const data = await response.json()

    if (data.accessToken) {
      // 儲存 token
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))

      // 跳轉到首頁
      router.push('/')
    } else {
      throw new Error('未收到 access token')
    }
  } catch (error) {
    console.error('處理 Google callback 失敗:', error)
    router.push({
      path: '/login',
      query: { error: 'callback_failed' }
    })
  }
})
</script>
