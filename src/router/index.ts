import { createRouter, createWebHistory } from 'vue-router'
import { authApi } from '@/api'
import { isAdmin } from '@/utils/roles'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // =====================
    // Admin Routes (後台管理)
    // =====================
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard',
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/dashboard/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/members',
      name: 'members',
      component: () => import('../pages/members/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../pages/orders/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../pages/products/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../pages/categories/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/uploads',
      name: 'uploads',
      component: () => import('../pages/uploads/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/pages',
      name: 'pages',
      component: () => import('../pages/pages/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('../pages/logs/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../pages/notifications/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, layout: 'admin' },
    },

    // =====================
    // Auth Routes (認證相關 - 空白佈局)
    // =====================
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login.vue'),
      meta: { requiresAuth: false, layout: 'blank' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/register.vue'),
      meta: { requiresAuth: false, layout: 'blank' },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../pages/auth/callback.vue'),
      meta: { requiresAuth: false, layout: 'blank' },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../pages/verify-email.vue'),
      meta: { requiresAuth: false, layout: 'blank' },
    },
    {
      path: '/debug',
      name: 'debug',
      component: () => import('../pages/debug.vue'),
      meta: { requiresAuth: false, layout: 'blank' },
    },

    // =====================
    // Customer Routes (客戶端 - 購物體驗)
    // =====================
    {
      path: '/welcome',
      name: 'landing',
      component: () => import('../pages/landing.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/shop',
      name: 'shop',
      redirect: '/shop/products',
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/shop/products',
      name: 'shop-products',
      component: () => import('../pages/shop/products/index.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/shop/products/:id',
      name: 'shop-product-detail',
      component: () => import('../pages/shop/products/[id].vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../pages/cart.vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../pages/checkout.vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },
    {
      path: '/payment',
      name: 'payment',
      component: () => import('../pages/payment.vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('../pages/payment/success.vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },
    {
      path: '/payment/failed',
      name: 'payment-failed',
      component: () => import('../pages/payment/failed.vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },
    {
      path: '/payment/result',
      name: 'payment-result',
      component: () => import('../pages/payment/result.vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },
    {
      path: '/my-orders',
      name: 'my-orders',
      component: () => import('../pages/my-orders/index.vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },
    {
      path: '/my-orders/:id',
      name: 'my-order-detail',
      component: () => import('../pages/my-orders/[id].vue'),
      meta: { requiresAuth: true, layout: 'customer' },
    },

    // =====================
    // Static Pages (靜態頁面 - 客戶端)
    // =====================
    {
      path: '/about',
      name: 'about',
      component: () => import('../pages/about.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('../pages/faq.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/shipping',
      name: 'shipping',
      component: () => import('../pages/shipping.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../pages/privacy.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../pages/terms.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
    {
      path: '/refund-policy',
      name: 'refund-policy',
      component: () => import('../pages/refund-policy.vue'),
      meta: { requiresAuth: false, layout: 'customer' },
    },
  ],
})

// 全域路由守衛
router.beforeEach(async (to, from, next) => {
  // 檢查路由是否需要認證
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // 取得 token
  const token = localStorage.getItem('access_token')
  const userStr = localStorage.getItem('user')

  // 如果不需要認證，直接放行
  if (!requiresAuth) {
    // 如果已登入用戶訪問登入/註冊頁，根據角色重定向
    if (token && (to.name === 'login' || to.name === 'register')) {
      if (userStr) {
        const userData = JSON.parse(userStr)
        const userIsAdmin = isAdmin(userData.role)
        // 管理員導向 dashboard，一般用戶導向商店
        return next({ name: userIsAdmin ? 'dashboard' : 'shop-products' })
      }
      return next({ name: 'shop-products' })
    }
    return next()
  }

  // 需要認證但沒有 token，重定向到登入頁
  if (!token) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath }, // 保存原始目標路徑
    })
  }

  // 有 token，驗證是否有效
  try {
    let userData = null

    // 如果已有用戶資料，解析它
    if (userStr) {
      userData = JSON.parse(userStr)
    } else {
      // 沒有用戶資料時，從 API 獲取
      const userProfile = await authApi.getProfile()
      userData = userProfile
      localStorage.setItem('user', JSON.stringify(userProfile))
    }

    // 檢查是否需要管理員權限
    if (requiresAdmin) {
      const userIsAdmin = isAdmin(userData.role)

      if (!userIsAdmin) {
        // 非管理員嘗試訪問管理頁面，重定向到商店
        return next({ name: 'shop-products' })
      }
    }

    // 驗證通過，放行
    next()
  } catch (error) {
    // Token 無效或過期
    console.error('認證失敗:', error)

    // 清除所有認證資料
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    // 重定向到登入頁
    next({
      name: 'login',
      query: { redirect: to.fullPath, error: 'auth_failed' },
    })
  }
})

export default router
