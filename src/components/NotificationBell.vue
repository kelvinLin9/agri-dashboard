<template>
  <UPopover v-model:open="isOpen">
    <UButton
      color="neutral"
      variant="ghost"
      size="lg"
    >
      <UChip
        :show="unreadCount > 0"
        :text="unreadCount > 99 ? '99+' : unreadCount"
        color="error"
        size="2xl"
        position="top-right"
        inset
      >
        <UIcon name="i-heroicons-bell" class="w-5 h-5" />
      </UChip>
    </UButton>

    <template #content>
      <UCard class="w-96 max-h-[500px] flex flex-col">
        <!-- Header -->
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">通知中心</h3>
            <UButton
              v-if="unreadCount > 0"
              label="全部標為已讀"
              size="xs"
              color="neutral"
              variant="ghost"
              @click="handleMarkAllRead"
            />
          </div>
        </template>

        <!-- Notifications List -->
        <div class="flex-1 overflow-y-auto space-y-2 max-h-96">
          <div
            v-if="recentNotifications.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <UIcon name="i-heroicons-bell-slash" class="w-12 h-12 mx-auto mb-2" />
            <p>沒有通知</p>
          </div>

          <div
            v-for="notification in recentNotifications"
            :key="notification.id"
            class="p-3 rounded-lg cursor-pointer transition-colors"
            :class="notification.status === 'read' ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <UIcon
                v-if="getNotificationIcon(notification.type)"
                :name="getNotificationIcon(notification.type)"
                class="w-5 h-5 mt-0.5 flex-shrink-0"
                :class="getIconColor(notification.type)"
              />

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">{{ notification.title }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                  {{ notification.content }}
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ formatRelativeTime(notification.createdAt) }}</p>
              </div>

              <!-- Unread Indicator -->
              <UBadge
                v-if="notification.status !== 'read'"
                color="primary"
                variant="solid"
                size="xs"
                class="flex-shrink-0"
              >
                新
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <template #footer>
          <UButton
            label="查看全部通知"
            block
            color="neutral"
            variant="soft"
            @click="goToNotificationsPage"
          />
        </template>
      </UCard>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/api/types'

const notificationStore = useNotificationStore()
const router = useRouter()

// 數據
const isOpen = ref(false)
const hasNewNotification = ref(false)

// 計算屬性
const unreadCount = computed(() => notificationStore.unreadCount)

const recentNotifications = computed(() => {
  return notificationStore.notifications.slice(0, 10)
})

// 方法
const handleNotificationClick = async (notification: Notification) => {
  // 標記為已讀
  if (notification.status !== 'read') {
    await notificationStore.markAsRead(notification.id)
  }

  // 如果有 actionUrl，導航過去
  if (notification.actionUrl) {
    router.push(notification.actionUrl)
  }
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead()
}

const goToNotificationsPage = () => {
  router.push('/notifications')
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    system: 'i-heroicons-cog-6-tooth',
    order: 'i-heroicons-shopping-bag',
    payment: 'i-heroicons-credit-card',
    member: 'i-heroicons-user',
    product: 'i-heroicons-cube',
    promotion: 'i-heroicons-megaphone',
    refund: 'i-heroicons-arrow-uturn-left',
  }
  return icons[type] || 'i-heroicons-bell'
}

const getIconColor = (type: string) => {
  const colors: Record<string, string> = {
    system: 'text-gray-600',
    order: 'text-blue-600',
    payment: 'text-green-600',
    member: 'text-purple-600',
    product: 'text-orange-600',
    promotion: 'text-pink-600',
    refund: 'text-red-600',
  }
  return colors[type] || 'text-gray-600'
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小時前`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} 天前`
  
  return date.toLocaleDateString('zh-TW')
}

// 生命週期：載入時獲取通知
onMounted(() => {
  // 只有在有 token 時才獲取通知，避免在登入/回調頁面觸發 401
  const token = localStorage.getItem('access_token')
  if (token) {
    notificationStore.fetchNotifications()
  }
})

// 監聽新通知（觸發動畫）
watch(() => notificationStore.notifications.length, (newLen, oldLen) => {
  if (newLen > oldLen) {
    hasNewNotification.value = true
    setTimeout(() => {
      hasNewNotification.value = false
    }, 3000)
  }
})
</script>
