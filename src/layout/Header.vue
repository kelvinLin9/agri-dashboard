<template>
  <UHeader>
    <!-- Logo / Title -->
    <template #title>
      <div class="text-2xl font-bold">梅</div>
    </template>

    <!-- Desktop Navigation (center) -->
    <UNavigationMenu
      :items="navItems"
      orientation="horizontal"
      variant="link"
      class="hidden lg:flex"
    />

    <!-- Right Side Actions -->
    <template #right>
      <div class="flex items-center gap-2">
        <!-- Notification Bell -->
        <NotificationBell />
        
        <!-- Dark Mode Toggle -->
        <UButton
          :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
          color="neutral"
          variant="ghost"
          @click="toggleColorMode"
          :aria-label="isDark ? '切換到淺色模式' : '切換到深色模式'"
        />
        
        <!-- User Avatar Menu (Desktop & Mobile) -->
        <UDropdown :items="userMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            class="p-0 hover:bg-transparent"
            :aria-label="'用戶菜單'"
          >
            <UAvatar
              :src="userAvatar"
              :alt="userName"
              size="sm"
              :ui="{ background: 'bg-primary-500 dark:bg-primary-400' }"
            >
              <template v-if="!userAvatar" #fallback>
                <span class="text-white text-sm font-medium">
                  {{ userInitials }}
                </span>
              </template>
            </UAvatar>
          </UButton>
        </UDropdown>
      </div>
    </template>

    <!-- Mobile Menu Content -->
    <template #body>
      <div class="flex flex-col gap-4">
        <!-- Mobile User Info -->
        <div class="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900">
            <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="flex-1">
            <div class="font-semibold text-gray-900 dark:text-white">{{ userName }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ userRole }}</div>
          </div>
        </div>

        <!-- Mobile Navigation Links -->
        <UNavigationMenu
          :items="navItems"
          orientation="vertical"
          variant="link"
        />

        <!-- Mobile Actions -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <UButton
            color="neutral"
            variant="ghost"
            block
            @click="handleLogout"
            icon="i-heroicons-arrow-right-on-rectangle"
          >
            登出
          </UButton>
        </div>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'
import NotificationBell from '@/components/NotificationBell.vue'
import { authApi } from '@/api'

// ========== 路由 ==========
const route = useRoute()
const router = useRouter()

// ========== 用戶資訊 ==========
const user = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

const userName = computed(() => user.value?.nickname || user.value?.username || '用戶')
const userRole = computed(() => {
  const role = user.value?.role
  const roleMap: Record<string, string> = {
    'super_admin': '超級管理員',
    'admin': '管理員',
    'operator': '操作員',
    'customer_service': '客服'
  }
  return roleMap[role] || '用戶'
})

const userAvatar = computed(() => user.value?.avatar || '')

const userInitials = computed(() => {
  const name = userName.value
  if (!name) return '?'
  
  // 如果是中文名取第一個字
  if (/[\u4e00-\u9fa5]/.test(name)) {
    return name.charAt(0)
  }
  
  // 英文名取首字母
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase()
})


// ========== 導航選單配置 ==========
const navigationConfig: Array<{ label: string; routeName: string; icon?: string }> = [
  { label: 'Dashboard', routeName: 'dashboard', icon: 'i-heroicons-chart-bar' },
  { label: '會員資料', routeName: 'members', icon: 'i-heroicons-users' },
  { label: '訂單資料', routeName: 'orders', icon: 'i-heroicons-shopping-cart' },
  { label: '產品維護', routeName: 'products', icon: 'i-heroicons-cube' },
  { label: '頁面維護', routeName: 'pages', icon: 'i-heroicons-document-text' },
  { label: '操作log', routeName: 'logs', icon: 'i-heroicons-clipboard-document-list' },
  { label: '推播通知', routeName: 'notifications', icon: 'i-heroicons-bell' },
]

const navItems = computed<NavigationMenuItem[]>(() =>
  navigationConfig.map((item) => ({
    label: item.label,
    to: { name: item.routeName },
    active: route.name === item.routeName,
    icon: item.icon,
  })),
)


// ========== 用戶下拉菜單 ==========
const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: userName.value,
      slot: 'account',
      disabled: true,
      icon: 'i-heroicons-user-circle',
    },
    {
      label: userRole.value,
      slot: 'description',
      disabled: true,
      class: 'text-xs text-gray-500 dark:text-gray-400'
    }
  ],
  [
    {
      label: '個人設定',
      icon: 'i-heroicons-cog-6-tooth',
      shortcuts: ['⌘', 'K'],
      click: () => {
        // TODO: 導航到個人設定頁面
        console.log('個人設定')
      }
    }
  ],
  [
    {
      label: '登出',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: handleLogout,
      class: 'text-red-600 dark:text-red-400'
    }
  ]
])

// ========== 深色模式 ==========
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

// ========== 登出功能 ==========
const handleLogout = async () => {
  try {
    // 調用後端登出 API
    await authApi.logout()
    
    // 清除所有本地存儲（防止遺漏）
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    
    // 跳轉到登入頁面
    router.push('/login')
  } catch (error) {
    console.error('登出失敗:', error)
    // 即使 API 調用失敗，也清除本地數據並跳轉
    localStorage.clear()
    router.push('/login')
  }
}
</script>
