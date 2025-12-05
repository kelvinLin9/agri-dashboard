<template>
  <div class="p-6 space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Dashboard 總覽</h1>
        <p v-if="dashboardStore.lastUpdate" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          最後更新: {{ formatTime(dashboardStore.lastUpdate) }}
        </p>
      </div>
      <UButton
        icon="i-heroicons-arrow-path"
        :loading="dashboardStore.loading"
        @click="handleRefresh"
      >
        刷新全部
      </UButton>
    </div>

    <!-- 總覽卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <OverviewCard
        title="今日銷售額"
        :value="dashboardStore.overview?.todaySales || 0"
        icon="i-heroicons-banknotes"
        color="green"
        :trend="dashboardStore.overview?.trends.sales"
        :formatter="formatCurrency"
      />
      <OverviewCard
        title="今日訂單數"
        :value="dashboardStore.overview?.todayOrders || 0"
        icon="i-heroicons-shopping-cart"
        color="blue"
        :trend="dashboardStore.overview?.trends.orders"
      />
      <OverviewCard
        title="總產品數"
        :value="dashboardStore.overview?.totalProducts || 0"
        icon="i-heroicons-cube"
        color="purple"
      />
      <OverviewCard
        title="低庫存產品"
        :value="dashboardStore.overview?.lowStockProducts || 0"
        icon="i-heroicons-exclamation-triangle"
        color="yellow"
      />
      <OverviewCard
        title="待處理訂單"
        :value="dashboardStore.overview?.pendingOrders || 0"
        icon="i-heroicons-clock"
        color="orange"
      />
      <OverviewCard
        title="今日新增會員"
        :value="dashboardStore.overview?.todayMembers || 0"
        icon="i-heroicons-user-plus"
        color="indigo"
        :trend="dashboardStore.overview?.trends.members"
      />
    </div>

    <!-- 圖表區域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 銷售 & 訂單趨勢 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">銷售 & 訂單趨勢（最近 30 天）</h3>
        </template>

        <div v-if="dashboardStore.loading" class="flex items-center justify-center h-[400px]">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
          <span class="ml-2">載入中...</span>
        </div>

        <div v-else-if="!salesTrendChartData.xAxisData.length" class="flex flex-col items-center justify-center h-[400px] text-gray-500">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-2" />
          <p>暫無數據</p>
        </div>

        <LineChart
          v-else
          :chart-data="salesTrendChartData"
          :dual-y-axis="true"
          left-y-axis-name="銷售金額 (元)"
          right-y-axis-name="訂單數量 (筆)"
          :show-legend="true"
          height="400px"
        />
      </UCard>

      <!-- 訂單狀態分佈 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">訂單狀態分佈</h3>
        </template>

        <div v-if="dashboardStore.loading" class="flex items-center justify-center h-[400px]">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
          <span class="ml-2">載入中...</span>
        </div>

        <div v-else-if="!orderStatusChartData.length" class="flex flex-col items-center justify-center h-[400px] text-gray-500">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-2" />
          <p>暫無數據</p>
        </div>

        <PieChart
          v-else
          :data="orderStatusChartData"
          :is-donut="true"
          :radius="['50%', '70%']"
          height="400px"
        />
      </UCard>
    </div>

    <!-- 錯誤提示 -->
    <UNotification
      v-if="dashboardStore.error"
      color="red"
      icon="i-heroicons-exclamation-triangle"
      :title="dashboardStore.error"
      :timeout="5000"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import OverviewCard from '@/components/charts/OverviewCard.vue'

const dashboardStore = useDashboardStore()

// 訂單狀態顏色映射
const statusColors: Record<string, string> = {
  pending: '#E6A23C',
  paid: '#409EFF',
  processing: '#67C23A',
  shipping: '#FF9500',
  delivered: '#5AC8FA',
  completed: '#34C759',
  cancelled: '#FF3B30',
}

// 訂單狀態中文映射
const statusLabels: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  processing: '處理中',
  shipping: '配送中',
  delivered: '已送達',
  completed: '已完成',
  cancelled: '已取消',
}

// 銷售趨勢圖表數據
const salesTrendChartData = computed(() => {
  const trend = dashboardStore.salesTrend

  if (!trend.length) {
    return { xAxisData: [], series: [] }
  }

  return {
    xAxisData: trend.map((item) => item.date),
    series: [
      {
        name: '銷售金額',
        data: trend.map((item) => item.amount),
        color: '#67C23A',
        smooth: true,
        showArea: true,
        yAxisIndex: 0,
      },
      {
        name: '訂單數量',
        data: trend.map((item) => item.orderCount),
        color: '#409EFF',
        smooth: true,
        showArea: false,
        yAxisIndex: 1,
      },
    ],
  }
})

// 訂單狀態分佈圖表數據
const orderStatusChartData = computed(() => {
  const distribution = dashboardStore.orderStatusDistribution

  return distribution.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
    color: statusColors[item.status] || '#909399',
  }))
})

// 格式化金額
function formatCurrency(value: number | string): string {
  const num = typeof value === 'number' ? value : parseFloat(value)
  return `NT$ ${num.toLocaleString()}`
}

// 格式化時間
function formatTime(date: Date): string {
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 刷新數據
async function handleRefresh() {
  try {
    await dashboardStore.refreshAll()
  } catch (error) {
    console.error('Refresh failed:', error)
  }
}

// 頁面載入時獲取數據
onMounted(async () => {
  await handleRefresh()
})
</script>
