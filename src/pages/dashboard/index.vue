<template>
  <div class="p-6 space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Dashboard 總覽</h1>
      <UButton
        icon="i-heroicons-arrow-path"
        :loading="loading"
        @click="fetchOrders"
      >
        刷新
      </UButton>
    </div>

    <!-- 銷售 & 訂單趨勢圖表（雙軸） -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">銷售 & 訂單趨勢（最近 30 天）</h3>
          <div class="text-sm text-gray-500">
            訂單總數: {{ totalOrders }} | 總銷售額: NT$ {{ totalSales.toLocaleString() }}
          </div>
        </div>
      </template>

      <div v-if="loading" class="flex items-center justify-center h-[400px]">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
        <span class="ml-2">載入中...</span>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center h-[400px] text-red-500">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mb-2" />
        <p>{{ error }}</p>
        <UButton size="sm" class="mt-4" @click="fetchOrders">重試</UButton>
      </div>

      <div v-else-if="!combinedChartData.xAxisData.length" class="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-2" />
        <p>暫無數據</p>
      </div>

      <LineChart
        v-else
        :chart-data="combinedChartData"
        :dual-y-axis="true"
        left-y-axis-name="銷售金額 (元)"
        right-y-axis-name="訂單數量 (筆)"
        :show-legend="true"
        height="500px"
      />
    </UCard>

    <!-- 訂單狀態分佈卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總訂單數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ totalOrders }}
            </p>
          </div>
          <UIcon name="i-heroicons-shopping-bag" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總銷售額</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              NT$ {{ totalSales.toLocaleString() }}
            </p>
          </div>
          <UIcon name="i-heroicons-banknotes" class="w-8 h-8 text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">平均訂單金額</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              NT$ {{ avgOrderAmount.toLocaleString() }}
            </p>
          </div>
          <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-purple-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">已完成訂單</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {{ completedOrders }}
            </p>
          </div>
          <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ordersApi } from '@/api/orders'
import { SortOrder } from '@/api/types'
import LineChart from '@/components/charts/LineChart.vue'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  createdAt: string
  status: string
}

const orders = ref<Order[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 計算組合圖表數據（銷售金額 + 訂單數量）
const combinedChartData = computed(() => {
  if (orders.value.length === 0) {
    return { xAxisData: [], series: [] }
  }

  // 按日期分組
  const groupedData: Record<string, { amount: number; count: number }> = {}

  orders.value.forEach((order) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0]
    if (!date) return  // 安全檢查
    
    if (!groupedData[date]) {
      groupedData[date] = { amount: 0, count: 0 }
    }

    // 只計算已完成訂單的金額
    if (order.status === 'completed') {
      groupedData[date].amount += Number(order.totalAmount)
    }
    groupedData[date].count += 1
  })

  // 排序並轉換為圖表格式
  const sortedDates = Object.keys(groupedData).sort()
  
  return {
    xAxisData: sortedDates,
    series: [
      {
        name: '銷售金額',
        data: sortedDates.map(date => Number(groupedData[date]?.amount.toFixed(2) ?? 0)),
        color: '#67C23A',
        smooth: true,
        showArea: true,
        yAxisIndex: 0, // 左軸
      },
      {
        name: '訂單數量',
        data: sortedDates.map(date => groupedData[date]?.count ?? 0),
        color: '#409EFF',
        smooth: true,
        showArea: false,
        yAxisIndex: 1, // 右軸
      },
    ],
  }
})

// 計算總訂單數
const totalOrders = computed(() => orders.value.length)

// 計算總銷售額（只計算已完成訂單）
const totalSales = computed(() => {
  return orders.value
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + Number(order.totalAmount), 0)
})

// 計算平均訂單金額
const avgOrderAmount = computed(() => {
  const completed = orders.value.filter((order) => order.status === 'completed')
  if (completed.length === 0) return 0
  return Math.round(totalSales.value / completed.length)
})

// 計算已完成訂單數
const completedOrders = computed(() => {
  return orders.value.filter((order) => order.status === 'completed').length
})

// 獲取訂單數據
async function fetchOrders() {
  loading.value = true
  error.value = null

  try {
    // 獲取最近 30 天的訂單
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const response = await ordersApi.getAll({
      page: 1,
      limit: 100, // 後端限制最大為 100
      sortBy: 'createdAt',
      sortOrder: SortOrder.DESC, // 使用枚舉
    })

    // API 回應結構: Pag inatedResponse<Order>
    const paginatedData = response || {}
    const allOrders = Array.isArray(paginatedData.data) ? paginatedData.data : []

    console.log('所有訂單數量:', allOrders.length)
    console.log('日期範圍:', startDate.toISOString(), '到', endDate.toISOString())

    // 過濾最近 30 天的訂單
    orders.value = allOrders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })

    console.log('過濾後訂單數量:', orders.value.length)
  } catch (err: any) {
    error.value = err.message || '獲取訂單數據失敗'
    console.error('Failed to fetch orders:', err)
  } finally {
    loading.value = false
  }
}

// 頁面載入時獲取數據
onMounted(() => {
  fetchOrders()
})
</script>
