<template>
  <div class="min-h-screen flex items-center justify-center page-warm-light p-4">
    <UCard class="w-full max-w-md card-glass ring-0 shadow-warm">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img 
            src="@/assets/logo.png" 
            alt="日沐 SunBathe Logo" 
            class="w-20 h-20 object-contain"
          />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          加入日沐 SunBathe
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
            :ui="{ trailing: 'pointer-events-none' }"
          >
            <template #trailing>
              <span class="w-5 h-5"></span>
            </template>
          </UInput>
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
            :ui="{ trailing: 'pointer-events-none' }"
          >
            <template #trailing>
              <span class="w-5 h-5"></span>
            </template>
          </UInput>
        </UFormField>

        <!-- Nickname (Optional) -->
        <UFormField label="暱稱" hint="(選填)">
          <UInput
            v-model="registerForm.nickname"
            icon="i-heroicons-user-circle"
            size="lg"
            placeholder="請輸入暱稱"
            :disabled="isLoading"
            :ui="{ trailing: 'pointer-events-none' }"
          >
            <template #trailing>
              <span class="w-5 h-5"></span>
            </template>
          </UInput>
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
                <a href="#" class="text-harvest-600 hover:text-harvest-500 dark:text-harvest-400">服務條款</a>
                和
                <a href="#" class="text-harvest-600 hover:text-harvest-500 dark:text-harvest-400">隱私政策</a>
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
          block
          size="lg"
          :loading="isLoading"
          class="btn-warm-shadow"
          :disabled="!isFormValid"
        >
          <template #leading>
            <UIcon name="i-heroicons-user-plus" />
          </template>
          註冊帳號
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
          <router-link to="/login" class="text-harvest-600 hover:text-harvest-500 dark:text-harvest-400 font-medium">
            立即登入
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api'
import { trackSignUp } from '@/utils/analytics'
import * as v from 'valibot'
import { RegisterFormSchema } from '@/schemas/auth'

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

// 使用 Valibot 驗證
const validateFormWithValibot = () => {
  // 組合表單數據與 agreedToTerms
  const formData = {
    ...registerForm.value,
    agreedToTerms: agreedToTerms.value,
  }
  return v.safeParse(RegisterFormSchema, formData)
}

// Computed
const isFormValid = computed(() => {
  const result = validateFormWithValibot()
  return result.success
})

// Methods
const validateForm = (): boolean => {
  errors.value = {}
  
  const result = validateFormWithValibot()
  
  if (!result.success) {
    // 將 Valibot 錯誤映射到各欄位
    for (const issue of result.issues) {
      const path = issue.path?.[0]?.key as string
      if (path && !errors.value[path]) {
        errors.value[path] = issue.message
      }
    }
    return false
  }
  
  return true
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
    // GA4: 追蹤註冊成功
    trackSignUp('email')
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

const handleGoogleRegister = () => {
  // GA4: 追蹤 Google 註冊嘗試
  trackSignUp('google')
  const currentOrigin = window.location.origin
  const backendUrl = import.meta.env.VITE_API_URL || 'https://agri-backend-660672910950.asia-east1.run.app/api'
  const redirectUri = encodeURIComponent(currentOrigin)
  const fullUrl = `${backendUrl}/auth/google?redirect_uri=${redirectUri}`

  window.location.href = fullUrl
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
