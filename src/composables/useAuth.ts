import { computed, type ComputedRef } from 'vue'

/**
 * 用戶資料介面
 */
export interface User {
  id: string
  username?: string
  email: string
  nickname?: string
  role: string
  avatar?: string
  emailVerified?: boolean
}

/**
 * 基礎認證狀態 Composable
 *
 * 用於檢查登入狀態，主要用於公開頁面的條件顯示
 * 例如：Header 顯示「登入」vs「我的帳戶」按鈕
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAuth } from '@/composables/useAuth'
 *
 * const { isAuthenticated, user } = useAuth()
 * </script>
 *
 * <template>
 *   <div v-if="isAuthenticated">
 *     歡迎回來，{{ user?.nickname }}！
 *   </div>
 *   <div v-else>
 *     <NuxtLink to="/login">請登入</NuxtLink>
 *   </div>
 * </template>
 * ```
 */
export function useAuth() {
  /**
   * Access Token
   */
  const token = computed(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  })

  /**
   * 是否已登入
   */
  const isAuthenticated = computed(() => !!token.value)

  /**
   * 當前登入用戶資訊
   */
  const user: ComputedRef<User | null> = computed(() => {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      return JSON.parse(userStr) as User
    } catch (error) {
      console.error('Failed to parse user data:', error)
      return null
    }
  })

  /**
   * 用戶角色
   */
  const userRole = computed(() => user.value?.role)

  /**
   * 登出
   */
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    // 重新載入頁面或導向登入頁
    window.location.href = '/login'
  }

  return {
    isAuthenticated,
    user,
    userRole,
    token,
    logout,
  }
}
