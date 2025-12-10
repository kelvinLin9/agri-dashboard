<template>
  <header class="sticky top-0 z-40 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
    <div class="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
      <!-- Left: Mobile Menu & Breadcrumb -->
      <div class="flex items-center gap-4">
        <!-- Mobile Menu Toggle -->
        <UButton
          class="lg:hidden"
          icon="i-heroicons-bars-3"
          color="neutral"
          variant="ghost"
          size="lg"
          @click="emit('toggle-sidebar')"
        />

        <!-- Breadcrumb -->
        <nav class="hidden sm:flex items-center gap-2 text-sm">
          <router-link
            to="/dashboard"
            class="text-gray-500 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
          >
            首頁
          </router-link>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
          <span class="text-gray-900 dark:text-white font-medium">
            {{ currentPageTitle }}
          </span>
        </nav>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <!-- Notification Bell -->
        <NotificationBell />

        <!-- Dark Mode Toggle -->
        <UButton
          :icon="isDark ? 'i-heroicons-moon-solid' : 'i-heroicons-sun-solid'"
          color="neutral"
          variant="ghost"
          size="lg"
          @click="toggleColorMode"
        />

        <!-- User Menu -->
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            size="lg"
            class="flex items-center gap-2"
          >
            <UAvatar
              :src="userAvatar"
              :alt="userName"
              size="xs"
              :ui="{ background: 'bg-harvest-500' }"
            >
              <template v-if="!userAvatar" #fallback>
                <span class="text-white text-xs font-medium">{{ userInitials }}</span>
              </template>
            </UAvatar>
            <span class="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {{ userName }}
            </span>
            <UIcon name="i-heroicons-chevron-down" class="hidden lg:block w-4 h-4 text-gray-400" />
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { authApi } from '@/api'
import NotificationBell from '@/components/NotificationBell.vue'
import type { DropdownMenuItem } from '@nuxt/ui'

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()

// Color Mode
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Page Title
const pageTitles: Record<string, string> = {
  dashboard: '儀表板',
  members: '會員管理',
  orders: '訂單管理',
  products: '產品管理',
  categories: '分類管理',
  uploads: '媒體管理',
  notifications: '推播通知',
  logs: '操作日誌',
  pages: '頁面維護',
}

const currentPageTitle = computed(() => {
  const name = route.name as string
  return pageTitles[name] || '管理後台'
})

// User Info
const user = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

const userName = computed(() => user.value?.nickname || user.value?.username || '管理員')
const userAvatar = computed(() => user.value?.avatar || '')
const userInitials = computed(() => {
  const name = userName.value
  if (!name) return '?'
  if (/[\u4e00-\u9fa5]/.test(name)) return name.charAt(0)
  return name.charAt(0).toUpperCase()
})

const userRole = computed(() => {
  const role = user.value?.role
  const roleMap: Record<string, string> = {
    super_admin: '超級管理員',
    admin: '管理員',
    operator: '操作員',
    customer_service: '客服'
  }
  return roleMap[role] || '用戶'
})

// User Menu
const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: userName.value,
      icon: 'i-heroicons-user-circle',
      disabled: true,
    },
    {
      label: userRole.value,
      icon: 'i-heroicons-shield-check',
      disabled: true,
    }
  ],
  [
    {
      label: '前往商店',
      icon: 'i-heroicons-shopping-bag',
      onSelect: () => router.push('/shop/products')
    }
  ],
  [
    {
      label: '登出',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      color: 'error' as const,
      onSelect: handleLogout
    }
  ]
])

// Logout
const handleLogout = async () => {
  try {
    await authApi.logout()
  } catch (error) {
    console.error('登出失敗:', error)
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    router.push('/login')
  }
}
</script>
