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
      <UButton
        icon="i-heroicons-arrow-path"
        :loading="loading"
        @click="fetchLogs"
      >
        刷新
      </UButton>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總操作數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ statistics?.totalLogs || 0 }}
            </p>
          </div>
          <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">平均響應時間</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {{ Math.round(statistics?.averageResponseTime || 0) }}ms
            </p>
          </div>
          <UIcon name="i-heroicons-clock" class="w-8 h-8 text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">錯誤率</p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {{ ((statistics?.errorRate || 0) * 100).toFixed(1) }}%
            </p>
          </div>
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">今日操作</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {{ todayLogs }}
            </p>
          </div>
          <UIcon name="i-heroicons-calendar" class="w-8 h-8 text-purple-500" />
        </div>
      </UCard>
    </div>

    <!-- 篩選和搜尋 -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 操作類型篩選 -->
        <USelectMenu
          v-model="selectedOperationType"
          :items="operationTypeOptions"
          placeholder="操作類型"
        />

        <!-- 狀態碼篩選 -->
        <USelectMenu
          v-model="selectedStatusCode"
          :items="statusCodeOptions"
          placeholder="狀態碼"
        />

        <!-- 用戶 ID 搜尋 -->
        <UInput
          v-model="searchUserId"
          placeholder="搜尋用戶 ID..."
          icon="i-heroicons-magnifying-glass"
        />

        <!-- 清除篩選 -->
        <UButton
          label="清除篩選"
          color="neutral"
          variant="soft"
          @click="clearFilters"
        />
      </div>
    </UCard>

    <!-- 日誌列表 -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">操作記錄</h3>
      </template>

      <div v-if="loading" class="flex items-center justify-center h-64">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
        <span class="ml-2">載入中...</span>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center h-64 text-red-500">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mb-2" />
        <p>{{ error }}</p>
        <UButton size="sm" class="mt-4" @click="fetchLogs">重試</UButton>
      </div>

      <div v-else-if="!logs.length" class="flex flex-col items-center justify-center h-64 text-gray-500">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-2" />
        <p>暫無日誌記錄</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">時間</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">用戶</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作類型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">端點</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">方法</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">狀態</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">響應時間</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IP</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                {{ log.username || log.userId }}
              </td>
              <td class="px-4 py-3 text-sm">
                <UBadge :color="getOperationColor(log.operationType)">
                  {{ log.operationType }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                {{ log.endpoint }}
              </td>
              <td class="px-4 py-3 text-sm">
                <UBadge :color="getMethodColor(log.method)" variant="subtle">
                  {{ log.method }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-sm">
                <UBadge :color="getStatusColor(log.statusCode)">
                  {{ log.statusCode }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {{ log.responseTime }}ms
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                {{ log.ipAddress }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- 分頁 -->
    <div class="flex justify-center">
      <UButton
        :disabled="offset === 0"
        @click="previousPage"
      >
        上一頁
      </UButton>
      <span class="mx-4 flex items-center">
        第 {{ currentPage }} 頁
      </span>
      <UButton
        :disabled="logs.length < limit"
        @click="nextPage"
      >
        下一頁
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { logsApi, OperationType, type AuditLog, type LogStatistics } from '@/api/logs'

const logs = ref<AuditLog[]>([])
const statistics = ref<LogStatistics | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 篩選參數
const selectedOperationType = ref<{ label: string; value: OperationType | null }>({ label: '全部類型', value: null })
const selectedStatusCode = ref<{ label: string; value: number | null }>({ label: '全部狀態', value: null })
const searchUserId = ref('')

// 分頁參數
const limit = ref(50)
const offset = ref(0)

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)

// 今日日誌數量
const todayLogs = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return logs.value.filter(log => {
    const logDate = new Date(log.createdAt)
    return logDate >= today
  }).length
})

// 操作類型選項
const operationTypeOptions = [
  { label: '全部類型', value: null },
  { label: 'CREATE', value: OperationType.CREATE },
  { label: 'READ', value: OperationType.READ },
  { label: 'UPDATE', value: OperationType.UPDATE },
  { label: 'DELETE', value: OperationType.DELETE },
  { label: 'LOGIN', value: OperationType.LOGIN },
  { label: 'LOGOUT', value: OperationType.LOGOUT },
  { label: 'UPLOAD', value: OperationType.UPLOAD },
  { label: 'DOWNLOAD', value: OperationType.DOWNLOAD },
  { label: 'PAYMENT', value: OperationType.PAYMENT },
  { label: 'REFUND', value: OperationType.REFUND },
  { label: 'OTHER', value: OperationType.OTHER },
]

// 狀態碼選項
const statusCodeOptions = [
  { label: '全部狀態', value: null },
  { label: '200 (成功)', value: 200 },
  { label: '201 (已創建)', value: 201 },
  { label: '400 (錯誤請求)', value: 400 },
  { label: '401 (未授權)', value: 401 },
  { label: '403 (禁止訪問)', value: 403 },
  { label: '404 (未找到)', value: 404 },
  { label: '500 (伺服器錯誤)', value: 500 },
]

// 獲取日誌
async function fetchLogs() {
  loading.value = true
  error.value = null

  try {
    const params: any = {
      limit: limit.value,
      offset: offset.value,
    }

    if (selectedOperationType.value.value) {
      params.operationType = selectedOperationType.value.value
    }

    if (selectedStatusCode.value.value) {
      params.statusCode = selectedStatusCode.value.value
    }

    if (searchUserId.value) {
      params.userId = searchUserId.value
    }

    logs.value = await logsApi.getAll(params)
  } catch (err: any) {
    error.value = err.message || '獲取日誌失敗'
    console.error('Failed to fetch logs:', err)
  } finally {
    loading.value = false
  }
}

// 獲取統計資料
async function fetchStatistics() {
  try {
    statistics.value = await logsApi.getStatistics()
  } catch (err: any) {
    console.error('Failed to fetch statistics:', err)
  }
}

// 清除篩選
function clearFilters() {
  selectedOperationType.value = { label: '全部類型', value: null }
  selectedStatusCode.value = { label: '全部狀態', value: null }
  searchUserId.value = ''
  offset.value = 0
  fetchLogs()
}

// 分頁
function previousPage() {
  if (offset.value >= limit.value) {
    offset.value -= limit.value
    fetchLogs()
  }
}

function nextPage() {
  offset.value += limit.value
  fetchLogs()
}

// 格式化日期時間
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

// 操作類型顏色
function getOperationColor(type: OperationType): string {
  const colors: Record<OperationType, string> = {
    [OperationType.CREATE]: 'green',
    [OperationType.READ]: 'blue',
    [OperationType.UPDATE]: 'yellow',
    [OperationType.DELETE]: 'red',
    [OperationType.LOGIN]: 'purple',
    [OperationType.LOGOUT]: 'gray',
    [OperationType.UPLOAD]: 'indigo',
    [OperationType.DOWNLOAD]: 'cyan',
    [OperationType.PAYMENT]: 'emerald',
    [OperationType.REFUND]: 'orange',
    [OperationType.OTHER]: 'gray',
  }
  return colors[type] || 'gray'
}

// HTTP 方法顏色
function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'blue',
    POST: 'green',
    PUT: 'yellow',
    PATCH: 'orange',
    DELETE: 'red',
  }
  return colors[method] || 'gray'
}

// 狀態碼顏色
function getStatusColor(code: number): string {
  if (code >= 200 && code < 300) return 'green'
  if (code >= 300 && code < 400) return 'blue'
  if (code >= 400 && code < 500) return 'yellow'
  if (code >= 500) return 'red'
  return 'gray'
}

// 監聽篩選變化
watch([selectedOperationType, selectedStatusCode, searchUserId], () => {
  offset.value = 0
  fetchLogs()
})

// 頁面載入時獲取數據
onMounted(async () => {
  await Promise.all([fetchLogs(), fetchStatistics()])
})
</script>
