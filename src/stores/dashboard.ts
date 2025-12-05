import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import type { DashboardOverview, SalesTrendItem, OrderStatusItem } from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const overview = ref<DashboardOverview | null>(null)
  const salesTrend = ref<SalesTrendItem[]>([])
  const orderStatusDistribution = ref<OrderStatusItem[]>([])
  const lastUpdate = ref<Date | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchOverview() {
    try {
      loading.value = true
      error.value = null
      overview.value = await dashboardApi.getOverview()
      lastUpdate.value = new Date()
    } catch (err: any) {
      error.value = err.message || '獲取總覽數據失敗'
      console.error('Failed to fetch overview:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSalesTrend(days: number = 30) {
    try {
      salesTrend.value = await dashboardApi.getSalesTrend(days)
    } catch (err: any) {
      console.error('Failed to fetch sales trend:', err)
      throw err
    }
  }

  async function fetchOrderStatusDistribution() {
    try {
      orderStatusDistribution.value = await dashboardApi.getOrderStatusDistribution()
    } catch (err: any) {
      console.error('Failed to fetch order status distribution:', err)
      throw err
    }
  }

  async function refreshAll() {
    loading.value = true
    error.value = null

    try {
      await Promise.all([
        fetchOverview(),
        fetchSalesTrend(),
        fetchOrderStatusDistribution(),
      ])
    } catch (err: any) {
      error.value = err.message || '刷新數據失敗'
    } finally {
      loading.value = false
    }
  }

  function clearData() {
    overview.value = null
    salesTrend.value = []
    orderStatusDistribution.value = []
    lastUpdate.value = null
    error.value = null
  }

  return {
    // State
    overview,
    salesTrend,
    orderStatusDistribution,
    lastUpdate,
    loading,
    error,

    // Actions
    fetchOverview,
    fetchSalesTrend,
    fetchOrderStatusDistribution,
    refreshAll,
    clearData,
  }
})
