import { createRouter, createWebHistory } from 'vue-router'
import { authApi } from '@/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/index.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../pages/dashboard/index.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'members',
          name: 'members',
          component: () => import('../pages/members/index.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../pages/orders/index.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../pages/products/index.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'pages',
          name: 'pages',
          component: () => import('../pages/pages/index.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('../pages/logs/index.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../pages/notifications/index.vue'),
          meta: { requiresAuth: true },
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
    // Shopping Flow Routes (Customer-facing)
    {
      path: '/shop',
      name: 'shop',
      redirect: '/shop/products',
      meta: { requiresAuth: true },
    },
    {
      path: '/shop/products',
      name: 'shop-products',
      component: () => import('../pages/shop/products/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/shop/products/:id',
      name: 'shop-product-detail',
      component: () => import('../pages/shop/products/[id].vue'),
      meta: { requiresAuth: true },
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

  // 取得 token
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')

  // 如果不需要認證，直接放行
  if (!requiresAuth) {
    // 如果已登入用戶訪問登入/註冊頁，重定向到首頁
    if (token && (to.name === 'login' || to.name === 'register')) {
      return next({ name: 'home' })
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
    // 如果已有用戶資料，先檢查角色權限
    if (user) {
      const userData = JSON.parse(user)

      // 檢查是否為管理員
      if (userData.role !== 'admin' && userData.role !== 'super_admin') {
        // 清除 token
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')

        return next({
          name: 'login',
          query: { error: 'permission_denied' },
        })
      }
    }

    // 驗證 token 是否仍然有效（每次路由都驗證可能過於頻繁）
    // 可以考慮添加快取機制，例如每 5 分鐘驗證一次
    // 這裡簡化處理，只在沒有用戶資料時驗證
    if (!user) {
      const userProfile = await authApi.getProfile()

      // 檢查權限
      if (userProfile.role !== 'admin' && userProfile.role !== 'super_admin') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')

        return next({
          name: 'login',
          query: { error: 'permission_denied' },
        })
      }

      // 更新用戶資料
      localStorage.setItem('user', JSON.stringify(userProfile))
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
