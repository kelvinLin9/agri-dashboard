import { ordersApi } from './orders'
import { membersApi } from './members'
import { productsApi } from './products'

/**
 * Dashboard 總覽統計
 */
export interface DashboardOverview {
  todaySales: number
  todayOrders: number
  todayMembers: number
  totalProducts: number
  lowStockProducts: number
  pendingOrders: number
  trends: {
    sales: TrendData
    orders: TrendData
    members: TrendData
  }
}

export interface TrendData {
  value: number
  percentage: number
  direction: 'up' | 'down' | 'stable'
}

/**
 * 銷售趨勢數據
 */
export interface SalesTrendItem {
  date: string
  amount: number
  orderCount: number
  completedOrderCount: number
}

/**
 * 訂單狀態分佈
 */
export interface OrderStatusItem {
  status: string
  count: number
  percentage: number
  amount: number
}

/**
 * 支付方式分佈
 */
export interface PaymentMethodItem {
  method: string
  methodName: string
  count: number
  amount: number
  percentage: number
}

/**
 * 熱銷商品
 */
export interface TopProductItem {
  productId: number
  productName: string
  productImage: string
  salesCount: number
  salesAmount: number
  category: string
}

/**
 * Dashboard API
 * 
 * 注意：由於後端目前沒有專門的 Dashboard 統計 API，
 * 這裡使用前端計算的方式。未來可以替換為後端 API。
 */
class DashboardApi {
  /**
   * 獲取總覽統計
   * 
   * 基於現有 API 進行前端計算
   */
  async getOverview(): Promise<DashboardOverview> {
    try {
      // 並行獲取所有需要的數據
      const [ordersData, , productsData] = await Promise.all([
        ordersApi.getAll({ page: 1, limit: 100 }),
        membersApi.getStatistics(),
        productsApi.getAll({ page: 1, limit: 100 }), // 後端限制最大 100
      ])

      // 安全提取數據，處理分頁回應格式
      const extractData = (response: any): any[] => {
        if (Array.isArray(response)) return response
        if (response?.data && Array.isArray(response.data)) return response.data
        return []
      }

      const orders = extractData(ordersData)
      const products = extractData(productsData)

      // 計算今日統計
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const todayOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= today
      })

      const yesterdayOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= yesterday && orderDate < today
      })

      // 今日銷售額（已完成訂單）
      const todaySales = todayOrders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0)

      const yesterdaySales = yesterdayOrders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0)

      // 待處理訂單
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length

      // 低庫存產品（庫存 < 10）
      const lowStockProducts = products.filter((p: any) => (p.stock || 0) < 10 && (p.stock || 0) > 0).length

      // 計算趨勢
      const salesTrend = this.calculateTrend(todaySales, yesterdaySales)
      const ordersTrend = this.calculateTrend(todayOrders.length, yesterdayOrders.length)

      // 會員趨勢（從會員統計中獲取）
      const membersTrend: TrendData = {
        value: 0,
        percentage: 0,
        direction: 'stable',
      }

      return {
        todaySales,
        todayOrders: todayOrders.length,
        todayMembers: 0, // 需要後端支援
        totalProducts: products.length,
        lowStockProducts,
        pendingOrders,
        trends: {
          sales: salesTrend,
          orders: ordersTrend,
          members: membersTrend,
        },
      }
    } catch (error) {
      console.error('Failed to fetch dashboard overview:', error)
      throw error
    }
  }

  /**
   * 獲取銷售趨勢（最近 N 天）
   */
  async getSalesTrend(days: number = 30): Promise<SalesTrendItem[]> {
    try {
      const ordersData = await ordersApi.getAll({ page: 1, limit: 100 })

      // 安全提取數據
      const extractData = (response: any): any[] => {
        if (Array.isArray(response)) return response
        if (response?.data && Array.isArray(response.data)) return response.data
        return []
      }
      const orders = extractData(ordersData)

      // 計算日期範圍
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // 按日期分組
      const groupedData: Record<string, SalesTrendItem> = {}

      orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt)
        if (orderDate < startDate || orderDate > endDate) return

        const dateKey = orderDate.toISOString().split('T')[0] || ''
        if (!dateKey) return

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date: dateKey,
            amount: 0,
            orderCount: 0,
            completedOrderCount: 0,
          }
        }

        groupedData[dateKey]!.orderCount++

        if (order.status === 'completed') {
          groupedData[dateKey]!.amount += Number(order.totalAmount)
          groupedData[dateKey]!.completedOrderCount++
        }
      })

      // 轉換為陣列並排序
      return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('Failed to fetch sales trend:', error)
      throw error
    }
  }

  /**
   * 獲取訂單狀態分佈
   */
  async getOrderStatusDistribution(): Promise<OrderStatusItem[]> {
    try {
      const ordersData = await ordersApi.getAll({ page: 1, limit: 100 })

      // 安全提取數據
      const extractData = (response: any): any[] => {
        if (Array.isArray(response)) return response
        if (response?.data && Array.isArray(response.data)) return response.data
        return []
      }
      const orders = extractData(ordersData)

      // 按狀態分組
      const statusMap: Record<string, { count: number; amount: number }> = {}

      orders.forEach((order: any) => {
        const status = order.status || 'unknown'

        if (!statusMap[status]) {
          statusMap[status] = { count: 0, amount: 0 }
        }

        statusMap[status]!.count++
        statusMap[status]!.amount += Number(order.totalAmount)
      })

      const total = orders.length

      // 轉換為陣列
      return Object.entries(statusMap).map(([status, data]) => ({
        status,
        count: data.count,
        percentage: (data.count / total) * 100,
        amount: data.amount,
      }))
    } catch (error) {
      console.error('Failed to fetch order status distribution:', error)
      throw error
    }
  }

  /**
   * 獲取熱銷商品 TOP N
   */
  async getTopProducts(): Promise<TopProductItem[]> {
    // 這需要訂單項目數據，目前簡化處理
    // 實際應該從訂單項目中統計
    return []
  }

  /**
   * 計算趨勢
   */
  private calculateTrend(current: number, previous: number): TrendData {
    const value = current - previous
    const percentage = previous > 0 ? Math.abs((value / previous) * 100) : 0

    let direction: 'up' | 'down' | 'stable' = 'stable'
    if (value > 0) direction = 'up'
    else if (value < 0) direction = 'down'

    return {
      value,
      percentage: Math.round(percentage * 10) / 10,
      direction,
    }
  }
}

export const dashboardApi = new DashboardApi()
