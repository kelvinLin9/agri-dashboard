<template>
  <UHeader>
    <!-- Logo / Title -->
    <template #title>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-harvest-500 to-earth-600 rounded-lg text-white font-bold text-sm shadow-warm">
          日
        </div>
        <div class="text-xl font-bold bg-gradient-to-r from-harvest-600 to-earth-600 bg-clip-text text-transparent hidden sm:block">
          日沐 SunBathe
        </div>
      </div>
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
          size="lg"
          @click="toggleColorMode"
          :aria-label="isDark ? '切換到淺色模式' : '切換到深色模式'"
        />

        <!-- User Avatar Menu (Desktop & Mobile) -->
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            size="lg"
            class="hover:bg-transparent"
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
        </UDropdownMenu>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
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


// ========== 登入狀態檢查 ==========
const isLoggedIn = computed(() => !!user.value)

const isAdmin = computed(() => {
  const role = user.value?.role
  return ['super_admin', 'admin', 'operator', 'customer_service'].includes(role)
})

// ========== 用戶下拉菜單 ==========
const userMenuItems = computed<DropdownMenuItem[][]>(() => {
  // 未登入狀態
  if (!isLoggedIn.value) {
    return [
      [
        {
          label: '登入',
          icon: 'i-heroicons-arrow-right-on-rectangle',
          onSelect: () => router.push('/login')
        },
        {
          label: '註冊會員',
          icon: 'i-heroicons-user-plus',
          onSelect: () => router.push('/register')
        }
      ],
      [
        {
          label: '商店首頁',
          icon: 'i-heroicons-shopping-bag',
          onSelect: () => router.push('/shop/products')
        }
      ]
    ]
  }

  // 已登入狀態 - 根據權限顯示不同選項
  const baseItems: DropdownMenuItem[][] = [
    // 用戶資訊
    [
      {
        label: userName.value,
        avatar: userAvatar.value ? { src: userAvatar.value } : undefined,
        icon: userAvatar.value ? undefined : 'i-heroicons-user-circle',
        disabled: true,
      }
    ]
  ]

  // 管理員專屬選項
  if (isAdmin.value) {
    baseItems.push([
      {
        label: '管理後台',
        icon: 'i-heroicons-cog-8-tooth',
        onSelect: () => router.push('/dashboard')
      },
      {
        label: '商店首頁',
        icon: 'i-heroicons-shopping-bag',
        onSelect: () => router.push('/shop/products')
      }
    ])
  } else {
    // 一般用戶選項
    baseItems.push([
      {
        label: '我的訂單',
        icon: 'i-heroicons-clipboard-document-list',
        onSelect: () => router.push('/my-orders')
      },
      {
        label: '購物車',
        icon: 'i-heroicons-shopping-cart',
        onSelect: () => router.push('/cart')
      },
      {
        label: '商店首頁',
        icon: 'i-heroicons-shopping-bag',
        onSelect: () => router.push('/shop/products')
      }
    ])
  }

  // 登出選項（所有已登入用戶都有）
  baseItems.push([
    {
      label: '登出',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: handleLogout,
      color: 'error' as const
    }
  ])

  return baseItems
})

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
