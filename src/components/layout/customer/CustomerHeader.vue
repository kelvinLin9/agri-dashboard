<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Logo & Brand -->
        <router-link to="/welcome" class="flex items-center gap-3 group">
          <img
            src="@/assets/logo.png"
            alt="日沐 SunBathe"
            class="w-10 h-10 object-contain transition-transform group-hover:scale-105"
          />
          <span class="text-xl font-bold bg-gradient-to-r from-harvest-600 to-earth-600 bg-clip-text text-transparent hidden sm:block">
            日沐 SunBathe
          </span>
        </router-link>

        <!-- Center: Navigation (Desktop) -->
        <nav class="hidden lg:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-harvest-600 dark:hover:text-harvest-400 hover:bg-harvest-50 dark:hover:bg-harvest-900/20 transition-all font-medium"
            :class="{ 'text-harvest-600 dark:text-harvest-400 bg-harvest-50 dark:bg-harvest-900/20': isActiveRoute(item.to) }"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <!-- Search Button (Mobile) / Search Bar (Desktop) -->
          <div class="hidden md:block">
            <SearchBar />
          </div>
          <UButton
            class="md:hidden"
            icon="i-heroicons-magnifying-glass"
            color="neutral"
            variant="ghost"
            size="lg"
            @click="isSearchOpen = true"
          />

          <!-- Cart -->
          <router-link to="/cart" class="relative">
            <UButton
              icon="i-heroicons-shopping-cart"
              color="neutral"
              variant="ghost"
              size="lg"
            />
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 w-5 h-5 bg-harvest-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </router-link>

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
              class="hover:bg-transparent"
            >
              <UAvatar
                :src="userAvatar"
                :alt="userName"
                size="sm"
                :ui="{ background: 'bg-harvest-500 dark:bg-harvest-400' }"
              >
                <template v-if="!userAvatar" #fallback>
                  <span class="text-white text-sm font-medium">
                    {{ userInitials }}
                  </span>
                </template>
              </UAvatar>
            </UButton>
          </UDropdownMenu>

          <!-- Mobile Menu Button -->
          <UButton
            class="lg:hidden"
            icon="i-heroicons-bars-3"
            color="neutral"
            variant="ghost"
            size="lg"
            @click="isMobileMenuOpen = true"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Search Modal -->
    <UModal v-model:open="isSearchOpen">
      <template #content>
        <div class="p-4">
          <SearchBar autofocus @search="isSearchOpen = false" />
        </div>
      </template>
    </UModal>

    <!-- Mobile Menu Drawer -->
    <USlideover v-model:open="isMobileMenuOpen" side="right">
      <template #content>
        <div class="p-6">
          <!-- User Info -->
          <div v-if="isLoggedIn" class="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
            <UAvatar
              :src="userAvatar"
              :alt="userName"
              size="lg"
              :ui="{ background: 'bg-harvest-500' }"
            >
              <template v-if="!userAvatar" #fallback>
                <span class="text-white text-lg font-medium">{{ userInitials }}</span>
              </template>
            </UAvatar>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ userName }}</p>
              <p class="text-sm text-gray-500">會員</p>
            </div>
          </div>

          <!-- Mobile Navigation -->
          <nav class="space-y-1">
            <router-link
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-harvest-50 dark:hover:bg-harvest-900/20 transition-colors"
              :class="{ 'bg-harvest-50 dark:bg-harvest-900/20 text-harvest-600 dark:text-harvest-400': isActiveRoute(item.to) }"
              @click="isMobileMenuOpen = false"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </router-link>
          </nav>

          <!-- Mobile Actions -->
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <template v-if="isLoggedIn">
              <router-link to="/my-orders" @click="isMobileMenuOpen = false">
                <UButton block variant="soft" color="neutral" icon="i-heroicons-clipboard-document-list">
                  我的訂單
                </UButton>
              </router-link>
              <UButton block variant="soft" color="error" icon="i-heroicons-arrow-right-on-rectangle" @click="handleLogout">
                登出
              </UButton>
            </template>
            <template v-else>
              <router-link to="/login" @click="isMobileMenuOpen = false">
                <UButton block color="primary" icon="i-heroicons-arrow-right-on-rectangle">
                  登入
                </UButton>
              </router-link>
              <router-link to="/register" @click="isMobileMenuOpen = false">
                <UButton block variant="soft" icon="i-heroicons-user-plus">
                  註冊會員
                </UButton>
              </router-link>
            </template>
          </div>
        </div>
      </template>
    </USlideover>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { useCartStore } from '@/stores/cart'
import { authApi } from '@/api'
import SearchBar from './SearchBar.vue'
import type { DropdownMenuItem } from '@nuxt/ui'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// UI State
const isSearchOpen = ref(false)
const isMobileMenuOpen = ref(false)

// Color Mode
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggleColorMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Cart
const cartCount = computed(() => cartStore.itemCount)

// User Info
const user = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

const isLoggedIn = computed(() => !!user.value)
const userName = computed(() => user.value?.nickname || user.value?.username || '用戶')
const userAvatar = computed(() => user.value?.avatar || '')
const userInitials = computed(() => {
  const name = userName.value
  if (!name) return '?'
  if (/[\u4e00-\u9fa5]/.test(name)) return name.charAt(0)
  return name.charAt(0).toUpperCase()
})

// Navigation Items
const navItems = [
  { label: '首頁', to: '/welcome', icon: 'i-heroicons-home' },
  { label: '商品', to: '/shop/products', icon: 'i-heroicons-shopping-bag' },
  { label: '關於我們', to: '/about', icon: 'i-heroicons-information-circle' },
]

const isActiveRoute = (path: string) => {
  if (path === '/welcome') return route.path === '/' || route.path === '/welcome'
  return route.path.startsWith(path)
}

// User Menu
const userMenuItems = computed<DropdownMenuItem[][]>(() => {
  if (!isLoggedIn.value) {
    return [
      [
        { label: '登入', icon: 'i-heroicons-arrow-right-on-rectangle', onSelect: () => router.push('/login') },
        { label: '註冊會員', icon: 'i-heroicons-user-plus', onSelect: () => router.push('/register') },
      ]
    ]
  }

  return [
    [{ label: userName.value, icon: 'i-heroicons-user-circle', disabled: true }],
    [
      { label: '我的訂單', icon: 'i-heroicons-clipboard-document-list', onSelect: () => router.push('/my-orders') },
      { label: '購物車', icon: 'i-heroicons-shopping-cart', onSelect: () => router.push('/cart') },
    ],
    [{ label: '登出', icon: 'i-heroicons-arrow-right-on-rectangle', color: 'error' as const, onSelect: handleLogout }],
  ]
})

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
    isMobileMenuOpen.value = false
    router.push('/login')
  }
}
</script>
