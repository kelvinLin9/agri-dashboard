<template>
  <!-- Desktop Sidebar -->
  <aside
    class="fixed left-0 top-0 h-full z-50 hidden lg:block transition-all duration-300 ease-in-out"
    :class="[
      collapsed ? 'w-16' : 'w-64',
      'bg-gray-900 dark:bg-gray-950 text-white shadow-xl'
    ]"
  >
    <!-- Logo Section -->
    <div class="h-16 flex items-center justify-center border-b border-gray-800">
      <router-link to="/dashboard" class="flex items-center gap-3">
        <img
          src="@/assets/logo.png"
          alt="日沐"
          class="w-8 h-8 object-contain"
        />
        <Transition name="fade">
          <span
            v-if="!collapsed"
            class="text-lg font-bold text-white whitespace-nowrap"
          >
            日沐 後台
          </span>
        </Transition>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-4 overflow-y-auto">
      <ul class="space-y-1 px-2">
        <li v-for="item in navItems" :key="item.name">
          <UTooltip
            :text="item.label"
            :delay-open="300"
            side="right"
            :disabled="!collapsed"
          >
            <router-link
              :to="{ name: item.name }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
              :class="[
                isActiveRoute(item.name)
                  ? 'bg-harvest-500/20 text-harvest-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              ]"
            >
              <UIcon
                :name="item.icon"
                class="w-5 h-5 flex-shrink-0"
                :class="[isActiveRoute(item.name) ? 'text-harvest-400' : 'text-gray-400 group-hover:text-white']"
              />
              <Transition name="fade">
                <span v-if="!collapsed" class="whitespace-nowrap">
                  {{ item.label }}
                </span>
              </Transition>
            </router-link>
          </UTooltip>
        </li>
      </ul>
    </nav>

    <!-- Collapse Toggle -->
    <div class="p-2 border-t border-gray-800">
      <button
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        @click="emit('toggle')"
      >
        <UIcon
          :name="collapsed ? 'i-heroicons-chevron-double-right' : 'i-heroicons-chevron-double-left'"
          class="w-5 h-5"
        />
        <Transition name="fade">
          <span v-if="!collapsed" class="text-sm">收合選單</span>
        </Transition>
      </button>
    </div>
  </aside>

  <!-- Mobile Sidebar (Drawer) -->
  <Transition name="slide">
    <aside
      v-if="mobileOpen"
      class="fixed left-0 top-0 h-full w-64 z-50 lg:hidden bg-gray-900 dark:bg-gray-950 text-white shadow-xl"
    >
      <!-- Close Button -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <div class="flex items-center gap-3">
          <img
            src="@/assets/logo.png"
            alt="日沐"
            class="w-8 h-8 object-contain"
          />
          <span class="text-lg font-bold text-white">日沐 後台</span>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-gray-400 hover:text-white"
          @click="emit('mobile-close')"
        />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-2">
          <li v-for="item in navItems" :key="item.name">
            <router-link
              :to="{ name: item.name }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
              :class="[
                isActiveRoute(item.name)
                  ? 'bg-harvest-500/20 text-harvest-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              ]"
              @click="emit('mobile-close')"
            >
              <UIcon
                :name="item.icon"
                class="w-5 h-5 flex-shrink-0"
              />
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

interface Props {
  collapsed: boolean
  mobileOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  'mobile-close': []
}>()

const route = useRoute()

// Navigation Items
const navItems = [
  { name: 'dashboard', label: '儀表板', icon: 'i-heroicons-chart-bar' },
  { name: 'members', label: '會員管理', icon: 'i-heroicons-users' },
  { name: 'orders', label: '訂單管理', icon: 'i-heroicons-shopping-cart' },
  { name: 'products', label: '產品管理', icon: 'i-heroicons-cube' },
  { name: 'categories', label: '分類管理', icon: 'i-heroicons-folder' },
  { name: 'uploads', label: '媒體管理', icon: 'i-heroicons-photo' },
  { name: 'notifications', label: '推播通知', icon: 'i-heroicons-bell' },
  { name: 'logs', label: '操作日誌', icon: 'i-heroicons-clipboard-document-list' },
]

const isActiveRoute = (name: string) => route.name === name
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
