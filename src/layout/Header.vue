<template>
  <UHeader>
    <template #title>
      <div class="text-2xl font-bold p-2">梅</div>
    </template>

    <UNavigationMenu
      :items="navItems"
      orientation="horizontal"
      variant="link"
    />

    <template #right>
      <div class="flex items-center gap-2">
        <!-- Notification Bell -->
        <NotificationBell />
        
        <!-- Dark Mode Toggle -->
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
          color="neutral"
          variant="ghost"
          @click="toggleColorMode"
          :aria-label="colorMode.value === 'dark' ? '切換到淺色模式' : '切換到深色模式'"
        />
        
        <!-- Logout Button -->
        <UButton
          color="neutral"
          variant="ghost"
          @click="handleLogout"
        >
          登出
        </UButton>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import NotificationBell from '@/components/NotificationBell.vue'

// ========== 路由 ==========
const route = useRoute()

// ========== 導航選單配置 ==========
const navigationConfig: Array<{ label: string; routeName: string }> = [
  { label: 'Dashboard', routeName: 'dashboard' },
  { label: '會員資料', routeName: 'members' },
  { label: '訂單資料', routeName: 'orders' },
  { label: '產品維護', routeName: 'products' },
  { label: '頁面維護', routeName: 'pages' },
  { label: '操作log', routeName: 'logs' },
  { label: '推播通知', routeName: 'notifications' },
]

const navItems = computed<NavigationMenuItem[]>(() =>
  navigationConfig.map((item) => ({
    label: item.label,
    to: { name: item.routeName },
    active: route.name === item.routeName,
  })),
)

// ========== 深色模式 ==========
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

// ========== 登出功能 ==========
const handleLogout = () => {
  // TODO: 實作登出邏輯
  console.log('登出')
}
</script>


