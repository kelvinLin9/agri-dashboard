import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/index.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../pages/dashboard/index.vue'),
        },
        {
          path: 'members',
          name: 'members',
          component: () => import('../pages/members/index.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../pages/orders/index.vue'),
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../pages/products/index.vue'),
        },
        {
          path: 'pages',
          name: 'pages',
          component: () => import('../pages/pages/index.vue'),
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('../pages/logs/index.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../pages/notifications/index.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/register.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../pages/auth/callback.vue'),
      meta: { layout: 'blank' },
    },
  ],
})

// 全域路由守衛
// TODO: 實作路由守衛
// router.beforeEach(async (to, from, next) => {
// const token = localStorage.getItem('token')
// if (!token && to.name !== 'login') {
//   return next({ name: 'login' })
// }
// next()
// })
export default router
