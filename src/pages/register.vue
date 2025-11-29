<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
    <UCard class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-building-storefront" class="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          建立新帳號
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          免費註冊，立即開始使用
        </p>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Username -->
        <UFormField label="用戶名" required :error="errors.username">
          <UInput
            v-model="registerForm.username"
            icon="i-heroicons-user"
            size="lg"
            placeholder="請輸入用戶名"
            :disabled="isLoading"
          />
        </UFormField>

        <!-- Email -->
        <UFormField label="Email" required :error="errors.email">
          <UInput
            v-model="registerForm.email"
            type="email"
            icon="i-heroicons-envelope"
            size="lg"
            placeholder="請輸入 Email"
            :disabled="isLoading"
          />
        </UFormField>

        <!-- Nickname (Optional) -->
        <UFormField label="暱稱" hint="(選填)">
          <UInput
            v-model="registerForm.nickname"
            icon="i-heroicons-user-circle"
            size="lg"
            placeholder="請輸入暱稱"
            :disabled="isLoading"
          />
        </UFormField>

        <!-- Password -->
        <UFormField 
          label="密碼" 
          required 
          :error="errors.password"
          help="密碼必須包含大小寫字母、數字和特殊符號"
        >
          <UInput
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            icon="i-heroicons-lock-closed"
            size="lg"
            placeholder="至少 8 個字元"
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

        <!-- Confirm Password -->
        <UFormField label="確認密碼" required :error="errors.confirmPassword">
          <UInput
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            icon="i-heroicons-lock-closed"
            size="lg"
            placeholder="再次輸入密碼"
            :disabled="isLoading"
            :ui="{ trailing: 'pointer-events-auto' }"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-eye"
                :padded="false"
                :class="{ 'text-gray-400 dark:text-gray-500': !showConfirmPassword, 'text-primary-500': showConfirmPassword }"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Terms Agreement -->
        <UFormField :error="errors.terms">
          <UCheckbox
            v-model="agreedToTerms"
            :disabled="isLoading"
          >
            <template #label>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                我同意
                <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">服務條款</a>
                和
                <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">隱私政策</a>
              </span>
            </template>
          </UCheckbox>
        </UFormField>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ errorMessage }}
            </p>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
            <p class="text-sm text-green-600 dark:text-green-400">
              {{ successMessage }}
            </p>
          </div>
        </div>

        <!-- Register Button -->
        <UButton
          type="submit"
          size="lg"
          block
          :loading="isLoading"
          :disabled="!isFormValid"
        >
          <template #leading>
            <UIcon name="i-heroicons-user-plus" />
          </template>
          註冊
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

      <!-- Google Register Button -->
      <UButton
        color="white"
        variant="outline"
        size="lg"
        block
        :loading="isGoogleLoading"
        @click="handleGoogleRegister"
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
        使用 Google 帳號註冊
      </UButton>

      <!-- Login Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          已經有帳號了？
          <router-link to="/login" class="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
            立即登入
          </router-link>
        </p>
      </div>
    </UCard>

    <!-- Footer -->
    <div class="absolute bottom-4 left-0 right-0 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        © 2025 農業管理系統. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'

const router = useRouter()

// Form Data
const registerForm = ref({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

const agreedToTerms = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const errors = ref<Record<string, string>>({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation Functions
const validateUsername = (username: string): string => {
  if (!username.trim()) return '請輸入用戶名'
  if (username.length < 3) return '用戶名至少需要 3 個字元'
  if (username.length > 20) return '用戶名不能超過 20 個字元'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return '用戶名只能包含字母、數字和底線'
  return ''
}

const validateEmail = (email: string): string => {
  if (!email.trim()) return '請輸入 Email'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Email 格式不正確'
  return ''
}

const validatePassword = (password: string): string => {
  if (!password) return '請輸入密碼'
  if (password.length < 8) return '密碼至少需要 8 個字元'
  if (!/[a-z]/.test(password)) return '密碼必須包含小寫字母'
  if (!/[A-Z]/.test(password)) return '密碼必須包含大寫字母'
  if (!/[0-9]/.test(password)) return '密碼必須包含數字'
  if (!/[!@#$%^&*]/.test(password)) return '密碼必須包含特殊符號 (!@#$%^&*)'
  return ''
}

const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) return '請確認密碼'
  if (password !== confirmPassword) return '兩次輸入的密碼不一致'
  return ''
}

// Computed
const isFormValid = computed(() => {
  return registerForm.value.username.trim() !== '' &&
         registerForm.value.email.trim() !== '' &&
         registerForm.value.password.trim() !== '' &&
         registerForm.value.confirmPassword.trim() !== '' &&
         agreedToTerms.value &&
         Object.keys(errors.value).length === 0
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}

  const usernameError = validateUsername(registerForm.value.username)
  if (usernameError) errors.value.username = usernameError

  const emailError = validateEmail(registerForm.value.email)
  if (emailError) errors.value.email = emailError

  const passwordError = validatePassword(registerForm.value.password)
  if (passwordError) errors.value.password = passwordError

  const confirmPasswordError = validateConfirmPassword(
    registerForm.value.password,
    registerForm.value.confirmPassword
  )
  if (confirmPasswordError) errors.value.confirmPassword = confirmPasswordError

  if (!agreedToTerms.value) {
    errors.value.terms = '請同意服務條款和隱私政策'
  }

  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await authApi.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
      nickname: registerForm.value.nickname || undefined,
    })

    // 註冊成功
    console.log('註冊成功:', response)
    successMessage.value = '註冊成功！正在跳轉...'
    
    // 延遲跳轉以顯示成功訊息
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error: any) {
    console.error('註冊失敗:', error)
    errorMessage.value = error.message || '註冊失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleRegister = async () => {
  isGoogleLoading.value = true
  errorMessage.value = ''

  try {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    
    if (!googleClientId) {
      throw new Error('Google Client ID 未設定')
    }

    // Google OAuth 註冊流程（與登入相同）
    const redirectUri = `${window.location.origin}/auth/google/callback`
    const scope = 'email profile'
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

    window.location.href = googleAuthUrl
  } catch (error: any) {
    console.error('Google 註冊失敗:', error)
    errorMessage.value = error.message || 'Google 註冊失敗'
    isGoogleLoading.value = false
  }
}

// Clear error when user types
import { watch } from 'vue'
watch(() => registerForm.value.username, () => {
  if (errors.value.username) delete errors.value.username
})
watch(() => registerForm.value.email, () => {
  if (errors.value.email) delete errors.value.email
})
watch(() => registerForm.value.password, () => {
  if (errors.value.password) delete errors.value.password
})
watch(() => registerForm.value.confirmPassword, () => {
  if (errors.value.confirmPassword) delete errors.value.confirmPassword
})
watch(() => agreedToTerms.value, () => {
  if (errors.value.terms) delete errors.value.terms
})
</script>
