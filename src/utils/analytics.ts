/**
 * Google Analytics GA4 追蹤工具
 * 封裝電商追蹤事件
 */

// 確保 gtag 函式存在
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

/**
 * 通用事件追蹤
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
    console.log(`[GA4] Event: ${eventName}`, params)
  }
}

/**
 * 電商事件：查看商品
 */
export function trackViewItem(item: {
  id: number | string
  name: string
  category?: string
  price: number
}) {
  trackEvent('view_item', {
    currency: 'TWD',
    value: item.price,
    items: [{
      item_id: item.id.toString(),
      item_name: item.name,
      item_category: item.category || '農產品',
      price: item.price,
      quantity: 1
    }]
  })
}

/**
 * 電商事件：加入購物車
 */
export function trackAddToCart(item: {
  id: number | string
  name: string
  category?: string
  price: number
  quantity: number
}) {
  trackEvent('add_to_cart', {
    currency: 'TWD',
    value: item.price * item.quantity,
    items: [{
      item_id: item.id.toString(),
      item_name: item.name,
      item_category: item.category || '農產品',
      price: item.price,
      quantity: item.quantity
    }]
  })
}

/**
 * 電商事件：開始結帳
 */
export function trackBeginCheckout(items: Array<{
  id: number | string
  name: string
  price: number
  quantity: number
}>, totalValue: number) {
  trackEvent('begin_checkout', {
    currency: 'TWD',
    value: totalValue,
    items: items.map(item => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  })
}

/**
 * 電商事件：完成購買
 */
export function trackPurchase(transaction: {
  transactionId: string
  value: number
  items: Array<{
    id: number | string
    name: string
    price: number
    quantity: number
  }>
}) {
  trackEvent('purchase', {
    transaction_id: transaction.transactionId,
    currency: 'TWD',
    value: transaction.value,
    items: transaction.items.map(item => ({
      item_id: item.id.toString(),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  })
}

/**
 * 電商事件：搜尋
 */
export function trackSearch(searchTerm: string) {
  trackEvent('search', {
    search_term: searchTerm
  })
}

/**
 * 自訂事件：登入
 */
export function trackLogin(method: string = 'email') {
  trackEvent('login', { method })
}

/**
 * 自訂事件：註冊
 */
export function trackSignUp(method: string = 'email') {
  trackEvent('sign_up', { method })
}
