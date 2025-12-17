<template>
  <div class="p-6 space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">操作日誌</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          系統操作記錄與審計追蹤
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-trash"
          color="error"
          variant="soft"
          :loading="cleaning"
          @click="handleCleanup"
        >
          清理過期日誌
        </UButton>
        <UButton
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="fetchData"
        >
          刷新
        </UButton>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p class="text-2xl font-bold">{{ statistics?.totalLogs || 0 }}</p>
          <p class="text-sm text-gray-500">總日誌數</p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p class="text-2xl font-bold">{{ statistics?.todayCount || 0 }}</p>
          <p class="text-sm text-gray-500">今日操作</p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p class="text-2xl font-bold">{{ statistics?.errorCount || 0 }}</p>
          <p class="text-sm text-gray-500">錯誤數</p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p class="text-2xl font-bold">{{ statistics?.adminOperations || 0 }}</p>
          <p class="text-sm text-gray-500">管理員操作</p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <UIcon name="i-heroicons-users" class="w-6 h-6 text-cyan-500 mx-auto mb-2" />
          <p class="text-2xl font-bold">{{ statistics?.customerOperations || 0 }}</p>
          <p class="text-sm text-gray-500">顧客操作</p>
        </div>
      </UCard>
    </div>

    <!-- 篩選區 -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <!-- 操作類型 -->
        <USelectMenu
          v-model="filters.operationType"
          :items="operationTypeOptions"
          placeholder="操作類型"
          value-attribute="value"
        />

        <!-- 用戶類型 -->
        <USelectMenu
          v-model="filters.userType"
          :items="userTypeOptions"
          placeholder="用戶類型"
          value-attribute="value"
        />

        <!-- 狀態碼 -->
        <USelectMenu
          v-model="filters.statusCode"
          :items="statusCodeOptions"
          placeholder="狀態碼"
          value-attribute="value"
        />

        <!-- 開始日期 -->
        <UInput
          v-model="filters.startDate"
          type="date"
          placeholder="開始日期"
        />

        <!-- 結束日期 -->
        <UInput
          v-model="filters.endDate"
          type="date"
          placeholder="結束日期"
        />

        <!-- 清除 -->
        <UButton
          color="neutral"
          variant="soft"
          icon="i-heroicons-x-mark"
          @click="clearFilters"
        >
          清除篩選
        </UButton>
      </div>
    </UCard>

    <!-- 日誌表格 -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">操作記錄</h3>
          <span class="text-sm text-gray-500">共 {{ total }} 筆</span>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
        <span class="ml-2">載入中...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-64 text-red-500">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mb-2" />
        <p>{{ error }}</p>
        <UButton size="sm" class="mt-4" @click="fetchData">重試</UButton>
      </div>

      <!-- Empty -->
      <div v-else-if="!logs.length" class="flex flex-col items-center justify-center h-64 text-gray-500">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-2" />
        <p>暫無日誌記錄</p>
      </div>

      <!-- Table -->
      <UTable
        v-else
        :data="logs"
        :columns="columns"
        :loading="loading"
      >
        <template #createdAt-cell="{ row }">
          {{ formatDateTime(row.original.createdAt) }}
        </template>

        <template #operationType-cell="{ row }">
          <UBadge :color="getOperationColor(row.original.operationType)">
            {{ getOperationLabel(row.original.operationType) }}
          </UBadge>
        </template>

        <template #userType-cell="{ row }">
          <UBadge :color="row.original.userType === 'admin' ? 'warning' : 'neutral'" variant="subtle">
            {{ row.original.userType === 'admin' ? '管理員' : '顧客' }}
          </UBadge>
        </template>

        <template #method-cell="{ row }">
          <UBadge :color="getMethodColor(row.original.method)" variant="outline">
            {{ row.original.method }}
          </UBadge>
        </template>

        <template #statusCode-cell="{ row }">
          <UBadge :color="getStatusColor(row.original.statusCode)">
            {{ row.original.statusCode }}
          </UBadge>
        </template>

        <template #executionTime-cell="{ row }">
          <span :class="row.original.executionTime > 1000 ? 'text-red-500' : ''">
            {{ row.original.executionTime || '-' }}ms
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            icon="i-heroicons-eye"
            variant="ghost"
            size="xs"
            @click="viewDetail(row.original)"
          />
        </template>
      </UTable>

      <!-- Pagination -->
      <template #footer>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">
            顯示 {{ offset + 1 }} - {{ Math.min(offset + limit, total) }} 筆，共 {{ total }} 筆
          </span>
          <UPagination
            v-model:page="currentPage"
            :total="total"
            :page-count="limit"
          />
        </div>
      </template>
    </UCard>

    <!-- 詳情 Modal -->
    <UModal v-model:open="detailOpen">
      <template #header>
        <h3 class="text-lg font-semibold">日誌詳情</h3>
      </template>

      <div v-if="selectedLog" class="space-y-4 p-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">時間</p>
            <p class="font-medium">{{ formatDateTime(selectedLog.createdAt) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">操作類型</p>
            <UBadge :color="getOperationColor(selectedLog.operationType)">
              {{ getOperationLabel(selectedLog.operationType) }}
            </UBadge>
          </div>
          <div>
            <p class="text-sm text-gray-500">用戶</p>
            <p class="font-medium">{{ selectedLog.username || selectedLog.userId || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">IP 地址</p>
            <p class="font-mono">{{ selectedLog.ipAddress || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">路徑</p>
            <p class="font-mono text-sm">{{ selectedLog.path }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">狀態碼</p>
            <UBadge :color="getStatusColor(selectedLog.statusCode)">
              {{ selectedLog.statusCode }}
            </UBadge>
          </div>
        </div>

        <div v-if="selectedLog.description">
          <p class="text-sm text-gray-500">描述</p>
          <p class="font-medium">{{ selectedLog.description }}</p>
        </div>

        <div v-if="selectedLog.errorMessage">
          <p class="text-sm text-gray-500">錯誤訊息</p>
          <p class="text-red-500">{{ selectedLog.errorMessage }}</p>
        </div>

        <div v-if="selectedLog.metadata">
          <p class="text-sm text-gray-500">附加資料</p>
          <pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
        </div>

        <div v-if="selectedLog.userAgent">
          <p class="text-sm text-gray-500">User Agent</p>
          <p class="text-xs text-gray-600 break-all">{{ selectedLog.userAgent }}</p>
        </div>
      </div>

      <template #footer>
        <UButton color="neutral" @click="detailOpen = false">關閉</UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  logsApi,
  OperationType,
  UserType,
  operationTypeLabels,
  operationTypeColors,
  type AuditLog,
  type LogStatistics,
} from '@/api/logs'

const toast = useToast()

// State
// State
const logs = ref<any[]>([])
const statistics = ref<LogStatistics | null>(null)
const loading = ref(false)
const cleaning = ref(false)
const error = ref<string | null>(null)
const total = ref(0)

// Detail modal
const detailOpen = ref(false)
const selectedLog = ref<AuditLog | null>(null)

// Filters
const filters = ref({
  operationType: null as any,
  userType: null as any,
  statusCode: null as any,
  startDate: '',
  endDate: '',
})

// Pagination
const limit = 20
const offset = ref(0)
const currentPage = computed({
  get: () => Math.floor(offset.value / limit) + 1,
  set: (val) => {
    offset.value = (val - 1) * limit
    fetchLogs()
  },
})

// Table columns
const columns: any[] = [
  { key: 'createdAt', label: '時間' },
  { key: 'operationType', label: '操作類型' },
  { key: 'userType', label: '用戶類型' },
  { key: 'username', label: '用戶' },
  { key: 'method', label: '方法' },
  { key: 'path', label: '路徑' },
  { key: 'statusCode', label: '狀態' },
  { key: 'executionTime', label: '耗時' },
  { key: 'actions', label: '' },
]

// Options
const operationTypeOptions = [
  { label: '全部類型', value: null },
  ...Object.entries(operationTypeLabels).map(([value, label]) => ({
    label,
    value: value as OperationType,
  })),
]

const userTypeOptions = [
  { label: '全部', value: null },
  { label: '管理員', value: UserType.ADMIN },
  { label: '顧客', value: UserType.CUSTOMER },
  { label: '系統', value: UserType.SYSTEM },
]

const statusCodeOptions = [
  { label: '全部狀態', value: null },
  { label: '成功 (2xx)', value: 200 },
  { label: '客戶端錯誤 (4xx)', value: 400 },
  { label: '伺服器錯誤 (5xx)', value: 500 },
]

// Fetch logs
async function fetchLogs() {
  loading.value = true
  error.value = null

  try {
    const params: Record<string, unknown> = {
      limit,
      offset: offset.value,
    }

    if (filters.value.operationType) {
      params.operationType = filters.value.operationType
    }
    if (filters.value.userType) {
      params.userType = filters.value.userType
    }
    if (filters.value.statusCode) {
      params.statusCode = filters.value.statusCode
    }
    if (filters.value.startDate) {
      params.startDate = filters.value.startDate
    }
    if (filters.value.endDate) {
      params.endDate = filters.value.endDate
    }

    const response = await logsApi.getAll(params)
    logs.value = response.logs
    total.value = response.total
  } catch (err) {
    error.value = err instanceof Error ? err.message : '獲取日誌失敗'
  } finally {
    loading.value = false
  }
}

// Fetch statistics
async function fetchStatistics() {
  try {
    statistics.value = await logsApi.getStatistics()
  } catch (err) {
    console.error('Failed to fetch statistics:', err)
  }
}

// Fetch all data
async function fetchData() {
  await Promise.all([fetchLogs(), fetchStatistics()])
}

// Clear filters
function clearFilters() {
  filters.value = {
    operationType: null,
    userType: null,
    statusCode: null,
    startDate: '',
    endDate: '',
  }
  offset.value = 0
  fetchLogs()
}

// Manual cleanup
async function handleCleanup() {
  if (!confirm('確定要清理過期日誌嗎？\n- 管理員日誌超過 90 天將被刪除\n- 審計日誌超過 2 年將被刪除')) {
    return
  }

  cleaning.value = true
  try {
    const result = await logsApi.cleanup()
    toast.add({
      title: '清理完成',
      description: `已刪除 ${result.adminLogsDeleted} 條管理員日誌，${result.auditLogsDeleted} 條審計日誌`,
      color: 'success',
    })
    fetchData()
  } catch (err) {
    toast.add({
      title: '清理失敗',
      description: err instanceof Error ? err.message : '未知錯誤',
      color: 'error',
    })
  } finally {
    cleaning.value = false
  }
}

// View detail
function viewDetail(log: AuditLog) {
  selectedLog.value = log
  detailOpen.value = true
}

// Helpers
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getOperationLabel(type: OperationType): string {
  return operationTypeLabels[type] || type
}

function getOperationColor(type: OperationType): string {
  return operationTypeColors[type] || 'neutral'
}

function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'info',
    POST: 'success',
    PUT: 'warning',
    PATCH: 'warning',
    DELETE: 'error',
  }
  return colors[method] || 'neutral'
}

function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'success'
  if (code >= 300 && code < 400) return 'info'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'error'
  return 'neutral'
}

// Watch filters
watch(
  () => [
    filters.value.operationType,
    filters.value.userType,
    filters.value.statusCode,
    filters.value.startDate,
    filters.value.endDate,
  ],
  () => {
    offset.value = 0
    fetchLogs()
  },
)

// Init
onMounted(fetchData)
</script>
