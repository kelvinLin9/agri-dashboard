import { createRouter, createWebHistory } from 'vue-router'
import { authApi } from '@/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/index.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../pages/dashboard/index.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'members',
          name: 'members',
          component: () => import('../pages/members/index.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../pages/orders/index.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../pages/products/index.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'pages',
          name: 'pages',
          component: () => import('../pages/pages/index.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('../pages/logs/index.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../pages/notifications/index.vue'),
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login.vue'),
      meta: {
        requiresAuth: false,
        layout: 'blank'
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/register.vue'),
      meta: {
        requiresAuth: false,
        layout: 'blank'
      },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../pages/auth/callback.vue'),
      meta: {
        requiresAuth: false,
        layout: 'blank'
      },
    },
    {
      path: '/debug',
      name: 'debug',
      component: () => import('../pages/debug.vue'),
      meta: {
        requiresAuth: false,
        layout: 'blank'
      },
    },
    {
      path: '/welcome',
      name: 'landing',
      component: () => import('../pages/landing.vue'),
      meta: {
        requiresAuth: false,
        layout: 'blank'
      },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../pages/verify-email.vue'),
      meta: {
        requiresAuth: false,
        layout: 'blank'
      },
    },
    // Shopping Flow Routes (Customer-facing)
    {
      path: '/shop',
      name: 'shop',
      redirect: '/shop/products',
      meta: { requiresAuth: false },  // 訪客可瀏覽
    },
    {
      path: '/shop/products',
      name: 'shop-products',
      component: () => import('../pages/shop/products/index.vue'),
      meta: { requiresAuth: false },  // 訪客可瀏覽
    },
    {
      path: '/shop/products/:id',
      name: 'shop-product-detail',
      component: () => import('../pages/shop/products/[id].vue'),
      meta: { requiresAuth: false },  // 訪客可瀏覽
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../pages/cart.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../pages/checkout.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payment',
      name: 'payment',
      component: () => import('../pages/payment.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('../pages/payment/success.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/payment/failed',
      name: 'payment-failed',
      component: () => import('../pages/payment/failed.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-orders',
      name: 'my-orders',
      component: () => import('../pages/my-orders/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-orders/:id',
      name: 'my-order-detail',
      component: () => import('../pages/my-orders/[id].vue'),
      meta: { requiresAuth: true },
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
        const isAdmin = ['super_admin', 'admin', 'operator', 'customer_service'].includes(userData.role)
        // 管理員導向 dashboard，一般用戶導向商店
        return next({ name: isAdmin ? 'dashboard' : 'shop-products' })
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
      const isAdmin = ['super_admin', 'admin', 'operator', 'customer_service'].includes(userData.role)

      if (!isAdmin) {
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
