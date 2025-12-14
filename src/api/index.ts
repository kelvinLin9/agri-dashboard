/**
  * API 統一導出
 *
 * 使用方式：
 * import { authApi, productsApi, ordersApi } from '@/api'
 *
 * 或單獨導入：
 * import { authApi } from '@/api/auth'
 */

// 導出所有類型
export * from './types'

// 導出 apiClient
export { default as apiClient, buildQueryString } from './apiClient'

// 導出所有 API 服務
export { authApi } from './auth'
export { productsApi } from './products'
export { categoriesApi } from './categories'
export { ordersApi } from './orders'
export { membersApi } from './members'
export { notificationsApi } from './notifications'
export { uploadApi } from './upload'
export { paymentApi } from './payment'
export { refundApi } from './refund'
export { dashboardApi } from './dashboard'
export { logsApi } from './logs'
export { pagesApi } from './pages'
export { cartApi } from './cart'
export { couponsApi } from './coupons'
export { wishlistApi } from './wishlist'
export { settingsApi } from './settings'

