<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">通知中心</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">查看和管理系統通知</p>
      </div>
      <UButton
        v-if="notificationStore.unreadCount > 0"
        label="全部標為已讀"
        icon="i-heroicons-check-circle"
        @click="handleMarkAllRead"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總通知數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ notificationStore.pagination.total }}
            </p>
          </div>
          <UIcon name="i-heroicons-bell" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">未讀通知</p>
            <p class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {{ notificationStore.unreadCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-envelope" class="w-8 h-8 text-orange-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">連線狀態</p>
            <p class="text-2xl font-bold mt-1" :class="isConnected ? 'text-green-600' : 'text-red-600'">
              {{ isConnected ? '已連線' : '未連線' }}
            </p>
          </div>
          <UIcon 
            :name="isConnected ? 'i-heroicons-signal' : 'i-heroicons-signal-slash'" 
            class="w-8 h-8"
            :class="isConnected ? 'text-green-500' : 'text-red-500'"
          />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Type Filter -->
        <USelectMenu
          v-model="selectedType"
          :items="typeOptions"
          placeholder="選擇通知類型"
          size="lg"
          @change="handleFilterChange"
        />

        <!-- Status Filter -->
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          placeholder="選擇狀態"
          size="lg"
          @change="handleFilterChange"
        />
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2">
        <UBadge v-if="selectedType" color="info" variant="soft">
          類型: {{ getTypeLabel(selectedType) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedType = null; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedStatus" color="info" variant="soft">
          狀態: {{ getStatusLabel(selectedStatus) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedStatus = null; handleFilterChange()"
          />
        </UBadge>
        <UButton
          label="清除全部"
          size="sm"
          color="neutral"
          variant="ghost"
          @click="clearFilters"
        />
      </div>
    </UCard>

    <!-- Notifications Table -->
    <UCard>
      <UTable
        :data="notificationStore.notifications"
        :columns="columns"
        :loading="notificationStore.isLoading"
        :empty-state="{ icon: 'i-heroicons-bell-slash', label: '沒有通知' }"
      />

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          顯示 {{ (notificationStore.pagination.page - 1) * notificationStore.pagination.limit + 1 }} 到
          {{ Math.min(notificationStore.pagination.page * notificationStore.pagination.limit, notificationStore.pagination.total) }}
          筆，共 {{ notificationStore.pagination.total }} 筆
        </div>
        <UPagination
          v-model:page="page"
          :items-per-page="notificationStore.pagination.limit"
          :total="notificationStore.pagination.total"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h, resolveComponent } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useNotifications } from '@/composables/useNotifications'
import type { NotificationType, NotificationStatus } from '@/api/types'

const notificationStore = useNotificationStore()
const router = useRouter()

// 數據
const page = ref(1)
const selectedType = ref<NotificationType | null>(null)
const selectedStatus = ref<NotificationStatus | null>(null)

// 計算屬性 - 從 Store 讀取連線狀態
const isConnected = computed(() => notificationStore.isConnected)

// 計算屬性
const hasActiveFilters = computed(() => {
  return !!(selectedType.value || selectedStatus.value)
})

// 篩選選項
const typeOptions = [
  { value: null, label: '全部類型' },
  { value: 'system', label: '系統通知' },
  { value: 'order', label: '訂單通知' },
  { value: 'payment', label: '支付通知' },
  { value: 'member', label: '會員通知' },
  { value: 'product', label: '產品通知' },
  { value: 'promotion', label: '促銷通知' },
  { value: 'refund', label: '退款通知' },
]

const statusOptions = [
  { value: null, label: '全部狀態' },
  { value: 'pending', label: '待發送' },
  { value: 'sent', label: '已發送' },
  { value: 'delivered', label: '已送達' },
  { value: 'read', label: '已讀' },
  { value: 'failed', label: '失敗' },
]

// Table 列定義
const columns = [
  {
    id: 'type',
    accessorKey: 'type',
    header: '類型',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      const UIcon = resolveComponent('UIcon')
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UIcon, {
          name: getNotificationIcon(row.original.type),
          class: getIconColor(row.original.type)
        }),
        h(UBadge, {
          color: 'neutral',
          variant: 'soft',
          size: 'sm'
        }, () => getTypeLabel(row.original.type))
      ])
    }
  },
  {
    id: 'content',
    accessorKey: 'title',
    header: '通知內容',
    cell: ({ row }: any) => {
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, row.original.title),
        h('span', { class: 'text-xs text-gray-500 line-clamp-1' }, row.original.content)
      ])
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: '狀態',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, {
        color: getStatusColor(row.original.status),
        variant: 'soft',
        size: 'sm'
      }, () => getStatusLabel(row.original.status))
    }
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: '優先級',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, {
        color: getPriorityColor(row.original.priority),
        variant: 'soft',
        size: 'sm'
      }, () => getPriorityLabel(row.original.priority))
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: '時間',
    cell: ({ row }: any) => {
      return h('span', { class: 'text-sm text-gray-600' },
        formatDateTime(row.original.createdAt)
      )
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }: any) => {
      const UButton = resolveComponent('UButton')
      const UTooltip = resolveComponent('UTooltip')

      return h('div', { class: 'flex items-center gap-2' }, [
        row.original.status !== 'read' ? h(UTooltip, { text: '標記已讀' }, () =>
          h(UButton, {
            icon: 'i-heroicons-check',
            size: 'sm',
            color: 'success',
            variant: 'soft',
            onClick: () => handleMarkAsRead(row.original.id)
          })
        ) : null,
        h(UTooltip, { text: '刪除' }, () =>
          h(UButton, {
            icon: 'i-heroicons-trash',
            size: 'sm',
            color: 'error',
            variant: 'soft',
            onClick: () => handleDelete(row.original.id)
          })
        ),
      ])
    }
  },
]

// 方法
const handleFilterChange = () => {
  page.value = 1
  notificationStore.setFilters({
    type: selectedType.value,
    status: selectedStatus.value,
  })
  notificationStore.fetchNotifications()
}

const clearFilters = () => {
  selectedType.value = null
  selectedStatus.value = null
  notificationStore.resetFilters()
  notificationStore.fetchNotifications()
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead()
  notificationStore.fetchNotifications()
}

const handleMarkAsRead = async (id: string) => {
  await notificationStore.markAsRead(id)
}

const handleDelete = async (id: string) => {
  await notificationStore.deleteNotification(id)
}

// Helper 函數
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

const getTypeLabel = (type: string | null) => {
  if (!type) return '全部類型'
  const labels: Record<string, string> = {
    system: '系統通知',
    order: '訂單通知',
    payment: '支付通知',
    member: '會員通知',
    product: '產品通知',
    promotion: '促銷通知',
    refund: '退款通知',
  }
  return labels[type] || type
}

const getStatusLabel = (status: string | null) => {
  if (!status) return '全部狀態'
  const labels: Record<string, string> = {
    pending: '待發送',
    sent: '已發送',
    delivered: '已送達',
    read: '已讀',
    failed: '失敗',
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'neutral',
    sent: 'blue',
    delivered: 'info',
    read: 'success',
    failed: 'error',
  }
  return colors[status] || 'neutral'
}

const getPriorityLabel = (priority: number) => {
  if (priority >= 3) return '緊急'
  if (priority >= 2) return '高'
  if (priority >= 1) return '中'
  return '低'
}

const getPriorityColor = (priority: number) => {
  if (priority >= 3) return 'error'
  if (priority >= 2) return 'warning'
  if (priority >= 1) return 'info'
  return 'neutral'
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Watch
watch(page, () => {
  notificationStore.setPage(page.value)
  notificationStore.fetchNotifications()
})

// Lifecycle
onMounted(() => {
  notificationStore.fetchNotifications()
  notificationStore.fetchUnreadCount()
})
</script>
