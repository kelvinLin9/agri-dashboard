<template>
  <div class="min-h-screen flex items-center justify-center page-warm-light p-4">
    <UCard class="w-full max-w-md card-glass ring-0 shadow-warm text-center">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-8">
        <div class="flex justify-center mb-4">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-harvest-500 animate-spin" />
        </div>
        <p class="text-gray-600">正在驗證您的 Email...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="py-8">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-green-500" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">驗證成功！</h1>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <UButton
          color="primary"
          size="lg"
          @click="goToLogin"
          class="btn-warm-shadow"
        >
          前往登入
        </UButton>
      </div>

      <!-- Error State -->
      <div v-else class="py-8">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-x-circle" class="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">驗證失敗</h1>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <div class="space-y-3">
          <UButton
            color="primary"
            size="lg"
            block
            @click="resendEmail"
            :loading="isResending"
            class="btn-warm-shadow"
          >
            重新發送驗證信
          </UButton>
          <UButton
            variant="ghost"
            size="lg"
            block
            @click="goToLogin"
          >
            返回登入
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isLoading = ref(true)
const isSuccess = ref(false)
const isResending = ref(false)
const message = ref('')
const userEmail = ref('')

onMounted(async () => {
  const token = route.query.token as string
  
  if (!token) {
    isLoading.value = false
    message.value = '缺少驗證 token'
    return
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiUrl}/auth/verify-email?token=${token}`)
    const data = await response.json()

    if (response.ok) {
      isSuccess.value = true
      message.value = data.message || 'Email 驗證成功！現在您可以完整使用所有功能。'
    } else {
      message.value = data.message || '驗證失敗，請重新嘗試'
    }
  } catch (error) {
    console.error('驗證失敗:', error)
    message.value = '驗證過程發生錯誤，請稍後再試'
  } finally {
    isLoading.value = false
  }
})

const goToLogin = () => {
  router.push('/login')
}

const resendEmail = async () => {
  const email = prompt('請輸入您的 Email 地址：')
  if (!email) return

  isResending.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${apiUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    
    if (response.ok) {
      alert(data.message || '驗證信已發送，請檢查您的信箱')
    } else {
      alert(data.message || '發送失敗，請稍後再試')
    }
  } catch (error) {
    alert('發送過程發生錯誤')
  } finally {
    isResending.value = false
  }
}
</script>
