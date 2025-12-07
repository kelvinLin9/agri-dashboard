<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">通知中心</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">查看和管理系統通知</p>
      </div>
      <div class="flex gap-2">
        <UButton
          label="模板發送"
          icon="i-heroicons-document-text"
          color="blue"
          variant="outline"
          @click="isTemplateSendModalOpen = true"
        />
        <UButton
          label="批量發送"
          icon="i-heroicons-users"
          color="purple"
          variant="outline"
          @click="isBulkSendModalOpen = true"
        />
        <UButton
          label="建立通知"
          icon="i-heroicons-plus"
          color="primary"
          @click="isCreateModalOpen = true"
        />
        <UButton
          v-if="notificationStore.unreadCount > 0"
          label="全部標為已讀"
          icon="i-heroicons-check-circle"
          @click="handleMarkAllRead"
        />
      </div>
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
          類型: {{ selectedType?.label }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="filterType = undefined; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedStatus" color="info" variant="soft">
          狀態: {{ selectedStatus?.label }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="filterStatus = undefined; handleFilterChange()"
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

    <!-- Create Notification Modal -->
    <UModal v-model:open="isCreateModalOpen" title="建立新通知">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">建立新通知</h3>
          </template>

          <div class="space-y-4">
            <!-- Send Mode Selection -->
            <UFormField label="發送模式" required>
              <div class="flex gap-2">
                <UButton
                  :color="sendMode === 'broadcast' ? 'primary' : 'neutral'"
                  :variant="sendMode === 'broadcast' ? 'solid' : 'outline'"
                  @click="sendMode = 'broadcast'"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-megaphone" />
                  </template>
                  廣播給所有會員
                </UButton>
                <UButton
                  :color="sendMode === 'single' ? 'primary' : 'neutral'"
                  :variant="sendMode === 'single' ? 'solid' : 'outline'"
                  @click="sendMode = 'single'"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-user" />
                  </template>
                  發送給單個用戶
                </UButton>
              </div>
            </UFormField>

            <!-- User Selection (only for single mode) -->
            <UFormField v-if="sendMode === 'single'" label="接收用戶" required>
              <USelectMenu
                v-model="createForm.userId"
                :items="userOptions"
                value-key="value"
                searchable
                placeholder="選擇接收用戶"
              >
                <template #leading>
                  <UIcon name="i-heroicons-user" class="w-5 h-5" />
                </template>
              </USelectMenu>
            </UFormField>

            <!-- Broadcast Info -->
            <div v-if="sendMode === 'broadcast'" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-heroicons-megaphone" class="w-5 h-5 text-green-600" />
                <span class="text-sm font-medium text-green-900 dark:text-green-100">廣播給所有會員</span>
              </div>
              <p class="text-sm text-green-800 dark:text-green-200">
                通知將發送給所有會員（{{ userOptions.length }} 人）
              </p>
            </div>

            <!-- Type -->
            <UFormField label="通知類型" required>
              <USelectMenu
                v-model="createForm.type"
                :items="typeOptions.filter(opt => opt.value)"
                value-key="value"
                placeholder="選擇通知類型"
              />
            </UFormField>

            <!-- Channel -->
            <UFormField label="發送渠道" required>
              <USelectMenu
                v-model="createFormChannel"
                :items="channelOptions"
                placeholder="選擇發送渠道"
              />
            </UFormField>

            <!-- Title -->
            <UFormField label="標題" required>
              <UInput 
                v-model="createForm.title" 
                placeholder="輸入通知標題"
              />
            </UFormField>

            <!-- Content -->
            <UFormField label="內容" required>
              <UTextarea 
                v-model="createForm.content" 
                placeholder="輸入通知內容"
                :rows="4"
              />
            </UFormField>

            <!-- Action URL -->
            <UFormField label="操作連結（選填）">
              <UInput 
                v-model="createForm.actionUrl" 
                placeholder="https://example.com/action"
              />
            </UFormField>

            <!-- Priority -->
            <UFormField label="優先級">
              <USelectMenu
                v-model="createForm.priority"
                :items="priorityOptions"
                value-key="value"
                placeholder="選擇優先級"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton 
                label="取消" 
                color="neutral" 
                variant="ghost"
                @click="isCreateModalOpen = false"
              />
              <UButton 
                label="建立" 
                color="primary"
                :loading="isCreating"
                @click="handleCreateNotification"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Template Send Modal -->
    <UModal v-model:open="isTemplateSendModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">📝 模板發送通知</h3>
          </template>

          <div class="space-y-4">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                使用預設模板快速發送通知，模板會自動填充指定的變數內容
              </p>
            </div>

            <UFormField label="模板代碼" required>
              <UInput
                v-model="templateForm.templateCode"
                placeholder="例如: order_shipped, payment_success"
              />
            </UFormField>

            <UFormField label="模板變數 (JSON格式)" required>
              <UTextarea
                v-model="templateForm.variablesJson"
                :rows="4"
                placeholder='{"orderNumber": "ORD-001", "userName": "張三"}'
              />
            </UFormField>

            <UFormField label="接收用戶 (選填)">
              <USelectMenu
                v-model="templateForm.userId"
                :items="userOptions"
                value-key="value"
                searchable
                placeholder="留空則發送給所有用戶"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                label="取消"
                color="neutral"
                variant="ghost"
                @click="isTemplateSendModalOpen = false"
              />
              <UButton
                label="發送"
                color="blue"
                :loading="isSendingTemplate"
                @click="handleTemplateSend"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Bulk Send Modal -->
    <UModal v-model:open="isBulkSendModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">👥 批量發送通知</h3>
          </template>

          <div class="space-y-4">
            <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p class="text-sm text-purple-800 dark:text-purple-200">
                選擇多個用戶發送通知，最多可選擇 100 位用戶
              </p>
            </div>

            <UFormField label="接收用戶" required>
              <USelectMenu
                v-model="bulkForm.selectedUsers"
                :items="userOptions"
                value-key="value"
                searchable
                multiple
                placeholder="選擇接收用戶 (可多選)"
              >
                <template #leading>
                  <UIcon name="i-heroicons-users" class="w-5 h-5" />
                </template>
              </USelectMenu>
              <template #hint>
                <span class="text-xs text-purple-600">
                  已選擇 {{ bulkForm.selectedUsers?.length || 0 }} 位用戶
                </span>
              </template>
            </UFormField>

            <UFormField label="通知類型" required>
              <USelectMenu
                v-model="bulkForm.type"
                :items="typeOptions.filter(opt => opt.value)"
                value-key="value"
                placeholder="選擇通知類型"
              />
            </UFormField>

            <UFormField label="標題" required>
              <UInput
                v-model="bulkForm.title"
                placeholder="輸入通知標題"
              />
            </UFormField>

            <UFormField label="內容" required>
              <UTextarea
                v-model="bulkForm.content"
                :rows="4"
                placeholder="輸入通知內容"
              />
            </UFormField>

            <UFormField label="發送渠道" required>
              <USelectMenu
                v-model="bulkFormChannel"
                :items="channelOptions"
                placeholder="選擇發送渠道"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                label="取消"
                color="neutral"
                variant="ghost"
                @click="isBulkSendModalOpen = false"
              />
              <UButton
                label="批量發送"
                color="purple"
                :loading="isSendingBulk"
                :disabled="!canSendBulk"
                @click="handleBulkSend"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h, resolveComponent } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useNotifications } from '@/composables/useNotifications'
import { notificationsApi } from '@/api/notifications'
import apiClient from '@/api/apiClient'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { NotificationType, NotificationStatus, NotificationChannel, CreateNotificationDto } from '@/api/types'

const notificationStore = useNotificationStore()
const router = useRouter()
const toast = useToast()

// 筛選 (internal simple values)
const page = ref(1)
const filterType = ref<NotificationType | undefined>(undefined)
const filterStatus = ref<NotificationStatus | undefined>(undefined)

// Convert simple values to SelectMenu option objects
const selectedType = computed({
  get: () => typeOptions.find(opt => opt.value === filterType.value),
  set: (val) => { filterType.value = val?.value as NotificationType | undefined }
})

const selectedStatus = computed({
  get: () => statusOptions.find(opt => opt.value === filterStatus.value),
  set: (val) => { filterStatus.value = val?.value as NotificationStatus | undefined }
})

// Create notification modal
const isCreateModalOpen = ref(false)
const isCreating = ref(false)

// Template send modal
const isTemplateSendModalOpen = ref(false)
const isSendingTemplate = ref(false)
const templateForm = ref({
  templateCode: '',
  variablesJson: '',
  userId: ''
})

// Bulk send modal
const isBulkSendModalOpen = ref(false)
const isSendingBulk = ref(false)
const bulkForm = ref<{
  selectedUsers: string[]
  type: NotificationType | null
  channel: NotificationChannel | null
  title: string
  content: string
}>({
  selectedUsers: [],
  type: null,
  channel: null,
  title: '',
  content: ''
})

const bulkFormChannel = computed({
  get: () => channelOptions.find(opt => opt.value === bulkForm.value.channel),
  set: (val) => { bulkForm.value.channel = val?.value as NotificationChannel | null }
})

const canSendBulk = computed(() => {
  return bulkForm.value.selectedUsers.length > 0 &&
         bulkForm.value.type &&
         bulkForm.value.channel &&
         bulkForm.value.title &&
         bulkForm.value.content
})

const createForm = ref<{
  userId: string
  type: NotificationType | null
  channel: NotificationChannel | null
  title: string
  content: string
  actionUrl: string
  priority: number
}>({
  userId: '',
  type: null,
  channel: null,
  title: '',
  content: '',
  actionUrl: '',
  priority: 0,
})

// 發送模式
const sendMode = ref<'single' | 'broadcast'>('broadcast')
const sendModeOptions = [
  { value: 'single', label: '發送給單個用戶' },
  { value: 'broadcast', label: '廣播給所有會員' }
]

// Computed for createForm SelectMenus
const createFormChannel = computed({
  get: () => channelOptions.find(opt => opt.value === createForm.value.channel),
  set: (val) => { createForm.value.channel = val?.value as NotificationChannel | null }
})

// 計算屬性 - 從 Store 讀取連線狀態
const isConnected = computed(() => notificationStore.isConnected)

// 計算屬性 - 獲取當前用戶
const currentUser = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
})

// 用戶選項
const userOptions = ref<Array<{ value: string; label: string }>>([])

// 載入用戶列表
const loadUsers = async () => {
  try {
    const response = await apiClient.get('/members', {
      params: { limit: 100 }
    })
    
    // 響應結構: { data: { data: [...], total: N } }
    const members = response.data.data?.data || response.data.data || []
    
    userOptions.value = members.map((member: any) => ({
      value: member.userId,
      label: `${member.user?.username || member.realName || '未知'} (${member.user?.email || ''})`,
    }))
  } catch (error) {
    console.error('載入用戶列表失敗:', error)
  }
}


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

const channelOptions = [
  { value: 'websocket', label: 'WebSocket' },
  { value: 'email', label: '電子郵件' },
  { value: 'sms', label: '簡訊' },
  { value: 'in_app', label: '應用內' },
]

const priorityOptions = [
  { value: 0, label: '低' },
  { value: 1, label: '中' },
  { value: 2, label: '高' },
  { value: 3, label: '緊急' },
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
      return h(StatusBadge, {
        status: row.original.status,
        type: 'notification',
        size: 'sm'
      })
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
    type: filterType.value,
    status: filterStatus.value,
  })
  notificationStore.fetchNotifications()
}

const clearFilters = () => {
  filterType.value = undefined
  filterStatus.value = undefined
  notificationStore.resetFilters()
  notificationStore.fetchNotifications()
}

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead()
  notificationStore.fetchNotifications()
  notificationStore.fetchUnreadCount()
}

const handleMarkAsRead = async (id: string) => {
  await notificationStore.markAsRead(id)
  // 未讀數量已在 store 中更新
}

const handleDelete = async (id: string) => {
  await notificationStore.deleteNotification(id)
}

const handleCreateNotification = async () => {
  // Validate based on send mode
  if (sendMode.value === 'single') {
    // 單個用戶模式：需要選擇用戶
    if (!createForm.value.userId) {
      toast.add({
        title: '錯誤',
        description: '請選擇接收用戶',
        color: 'error',
      })
      return
    }
  }

  // Validate required fields
  if (!createForm.value.type || !createForm.value.channel || !createForm.value.title || !createForm.value.content) {
    toast.add({
      title: '錯誤',
      description: '請填寫所有必填欄位',
      color: 'error',
    })
    return
  }

  isCreating.value = true
  try {
    if (sendMode.value === 'broadcast') {
      // 廣播模式：使用 broadcast API
      await notificationsApi.broadcast({
        templateCode: 'custom',  // 使用自定義模板或直接創建
        variables: {
          title: createForm.value.title,
          content: createForm.value.content
        },
        data: {
          type: createForm.value.type,
          channel: createForm.value.channel,
          actionUrl: createForm.value.actionUrl,
          priority: createForm.value.priority,
        }
      })

      toast.add({
        title: '成功',
        description: `廣播通知已發送給 ${userOptions.value.length} 位會員！`,
        color: 'success',
      })
    } else {
      // 單個用戶模式：使用 create API
      const dto: CreateNotificationDto = {
        userId: createForm.value.userId,
        type: createForm.value.type,
        channel: createForm.value.channel,
        title: createForm.value.title,
        content: createForm.value.content,
        priority: createForm.value.priority,
      }

      if (createForm.value.actionUrl) {
        dto.actionUrl = createForm.value.actionUrl
      }

      await notificationsApi.create(dto)

      toast.add({
        title: '成功',
        description: '通知已發送！',
        color: 'success',
      })
    }

    // Reset form and close modal
    createForm.value = {
      userId: '', // 保留空值，因為會自動從 currentUser 取得
      type: null,
      channel: null,
      title: '',
      content: '',
      actionUrl: '',
      priority: 0,
    }
    isCreateModalOpen.value = false

    // Refresh notifications list and unread count
    notificationStore.fetchNotifications()
    notificationStore.fetchUnreadCount()
  } catch (error: any) {
    console.error('建立通知失敗:', error)
    toast.add({
      title: '錯誤',
      description: error.response?.data?.message || '建立通知失敗',
      color: 'error',
    })
  } finally {
    isCreating.value = false
  }
}

const handleTemplateSend = async () => {
  if (!templateForm.value.templateCode || !templateForm.value.variablesJson) {
    toast.add({
      title: '錯誤',
      description: '請填寫模板代碼和變數',
      color: 'error',
    })
    return
  }

  // 驗證 JSON 格式
  let variables: Record<string, any>
  try {
    variables = JSON.parse(templateForm.value.variablesJson)
  } catch (error) {
    toast.add({
      title: '錯誤',
      description: '變數格式不正確，請輸入有效的 JSON',
      color: 'error',
    })
    return
  }

  isSendingTemplate.value = true
  try {
    await notificationsApi.sendByTemplate({
      templateCode: templateForm.value.templateCode,
      variables,
      data: templateForm.value.userId ? { userId: templateForm.value.userId } : undefined
    })

    toast.add({
      title: '成功',
      description: templateForm.value.userId ? '模板通知已發送！' : '模板通知已廣播給所有用戶！',
      color: 'success',
    })

    // Reset form
    templateForm.value = {
      templateCode: '',
      variablesJson: '',
      userId: ''
    }
    isTemplateSendModalOpen.value = false

    // Refresh notifications list
    notificationStore.fetchNotifications()
    notificationStore.fetchUnreadCount()
  } catch (error: any) {
    console.error('模板發送失敗:', error)
    toast.add({
      title: '錯誤',
      description: error.response?.data?.message || '模板發送失敗',
      color: 'error',
    })
  } finally {
    isSendingTemplate.value = false
  }
}

const handleBulkSend = async () => {
  if (!canSendBulk.value) {
    toast.add({
      title: '錯誤',
      description: '請填寫所有必填欄位',
      color: 'error',
    })
    return
  }

  isSendingBulk.value = true
  try {
    await notificationsApi.sendBulk({
      userIds: bulkForm.value.selectedUsers,
      type: bulkForm.value.type!,
      channel: bulkForm.value.channel!,
      title: bulkForm.value.title,
      content: bulkForm.value.content
    })

    toast.add({
      title: '成功',
      description: `批量通知已發送給 ${bulkForm.value.selectedUsers.length} 位用戶！`,
      color: 'success',
    })

    // Reset form
    bulkForm.value = {
      selectedUsers: [],
      type: null,
      channel: null,
      title: '',
      content: ''
    }
    isBulkSendModalOpen.value = false

    // Refresh notifications list
    notificationStore.fetchNotifications()
    notificationStore.fetchUnreadCount()
  } catch (error: any) {
    console.error('批量發送失敗:', error)
    toast.add({
      title: '錯誤',
      description: error.response?.data?.message || '批量發送失敗',
      color: 'error',
    })
  } finally {
    isSendingBulk.value = false
  }
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
  loadUsers() // 載入用戶列表
})

// 監聽彈窗開啟，重置表單
watch(isCreateModalOpen, (newVal) => {
  if (newVal) {
    // 彈窗開啟時重載用戶列表
    loadUsers()
  }
})
</script>
