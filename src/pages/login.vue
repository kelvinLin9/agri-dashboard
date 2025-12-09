<template>
  <div class="min-h-screen flex items-center justify-center page-warm-light p-4">
    <UCard class="w-full max-w-md card-glass ring-0 shadow-warm">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-harvest-500 to-earth-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-building-storefront" class="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          日沐 SunBathe
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          登入以繼續使用
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Username or Email -->
        <UFormField label="帳號或 Email">
          <UInput
            v-model="loginForm.usernameOrEmail"
            icon="i-heroicons-user"
            size="lg"
            placeholder="請輸入帳號或 Email"
            :disabled="isLoading"
          />
        </UFormField>

        <!-- Password -->
        <UFormField label="密碼">
          <template #hint>
            <a href="#" class="text-sm text-harvest-600 hover:text-harvest-500 dark:text-harvest-400">
              忘記密碼？
            </a>
          </template>
          <UInput
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            icon="i-heroicons-lock-closed"
            size="lg"
            placeholder="請輸入密碼"
            :disabled="isLoading"
            :ui="{ trailing: 'pointer-events-auto' }"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-eye"
                :padded="false"
                :class="{ 'text-gray-400 dark:text-gray-500': !showPassword, 'text-primary-500': showPassword }"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Remember Me -->
        <UFormField>
          <UCheckbox
            v-model="rememberMe"
            label="記住我"
            :disabled="isLoading"
          />
        </UFormField>

        <!-- Validation Error Message -->
        <div v-if="inputError" class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p class="text-sm text-yellow-600 dark:text-yellow-400">
              {{ inputError }}
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ errorMessage }}
            </p>
          </div>
        </div>

        <!-- Login Button -->
        <UButton
          type="submit"
          size="lg"
          block
          :loading="isLoading"
          :disabled="!isFormValid"
          class="btn-warm-shadow"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-right-on-rectangle" />
          </template>
          登入
        </UButton>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white dark:bg-gray-800 text-gray-500">或使用</span>
        </div>
      </div>

      <!-- Google Login Button -->
      <UButton
        color="white"
        variant="outline"
        size="lg"
        block
        :loading="isGoogleLoading"
        @click="handleGoogleLogin"
      >
        <template #leading>
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </template>
        使用 Google 帳號登入
      </UButton>

      <!-- Register Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          還沒有帳號？
          <router-link to="/register" class="text-harvest-600 hover:text-harvest-500 dark:text-harvest-400 font-medium">
            立即註冊
          </router-link>
        </p>
      </div>
    </UCard>

    <!-- Footer -->
    <div class="absolute bottom-4 left-0 right-0 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        © 2025 日沐 SunBathe. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/api'
import { trackLogin } from '@/utils/analytics'

const router = useRouter()
const route = useRoute()

// Form Data
const loginForm = ref({
  usernameOrEmail: '',
  password: '',
})

const rememberMe = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

// 檢查 URL 參數中的錯誤訊息
onMounted(() => {
  const error = route.query.error as string
  if (error === 'auth_failed') {
    errorMessage.value = '登入已過期，請重新登入'
  } else if (error === 'permission_denied') {
    errorMessage.value = '權限不足：只有管理員可以登入後台管理系統'
  }
})

// 輸入驗證輔助函數
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidUsername = (username: string): boolean => {
  // 用戶名：3-20個字符，只能包含字母、數字、底線
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// Computed
const isFormValid = computed(() => {
  const { usernameOrEmail, password } = loginForm.value

  // 檢查欄位非空
  if (!usernameOrEmail.trim() || !password.trim()) {
    return false
  }

  // 密碼最少 6 個字符
  if (password.length < 6) {
    return false
  }

  // 用戶名或 Email 格式驗證
  const input = usernameOrEmail.trim()
  // 如果包含 @，則視為 email，否則視為 username
  if (input.includes('@')) {
    return isValidEmail(input) && password.length >= 6
  } else {
    return isValidUsername(input) && password.length >= 6
  }
})

// 表單驗證提示
const getInputError = (): string => {
  const { usernameOrEmail, password } = loginForm.value

  if (!usernameOrEmail.trim()) {
    return ''
  }

  const input = usernameOrEmail.trim()
  if (input.includes('@')) {
    if (!isValidEmail(input)) {
      return 'Email 格式不正確'
    }
  } else {
    if (!isValidUsername(input)) {
      return '用戶名格式不正確（3-20個字符，只能包含字母、數字、底線）'
    }
  }

  if (password && password.length > 0 && password.length < 6) {
    return '密碼至少需要 6 個字符'
  }

  return ''
}

const inputError = computed(() => getInputError())

// Methods
const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await authApi.login({
      usernameOrEmail: loginForm.value.usernameOrEmail,
      password: loginForm.value.password,
    })

    // 登入成功

    // 檢查權限：只有管理員可以登入後台
    const userRole = response.user.role
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      // 清除 token
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      throw new Error('權限不足：只有管理員可以登入後台管理系統')
    }

    // 檢查是否有重定向目標
    const redirect = route.query.redirect as string
    if (redirect && redirect !== '/login') {
      router.push(redirect)
    } else {
      // 跳轉到首頁或儀表板
      router.push('/')
    }
    // GA4: 追蹤登入成功
    trackLogin('email')
  } catch (error: any) {
    console.error('登入失敗:', error)
    // 統一錯誤訊息，不顯示具體錯誤細節以防止資訊洩漏
    // 例如不讓攻擊者知道帳號是否存在
    if (error.message?.includes('權限不足')) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '登入失敗，請檢查帳號或密碼是否正確'
    }
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = () => {
  // GA4: 追蹤 Google 登入嘗試
  trackLogin('google')
  const currentOrigin = window.location.origin
  const backendUrl = import.meta.env.VITE_API_URL || 'https://agri-backend-660672910950.asia-east1.run.app/api'
  const redirectUri = encodeURIComponent(currentOrigin)
  const fullUrl = `${backendUrl}/auth/google?redirect_uri=${redirectUri}`

  window.location.href = fullUrl
}

// 清除錯誤訊息當用戶開始輸入
const clearError = () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

// Watch for input changes
import { watch } from 'vue'
watch([() => loginForm.value.usernameOrEmail, () => loginForm.value.password], clearError)
</script>

<style scoped>
/* 可以添加自定義樣式 */
</style>
