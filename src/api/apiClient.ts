import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { openLoading, closeLoading } from '@/utils/loading'
import type { ApiError } from './types'

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Loading 計數器（處理並發請求）
let loadingCount = 0

const showLoading = () => {
  if (loadingCount === 0) {
    openLoading()
  }
  loadingCount++
}

const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    closeLoading()
  }
}

// 請求攔截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 顯示 loading（僅非靜默請求）
    if (!config.headers?.['X-Silent-Request']) {
      showLoading()
    }

    // Authorization 處理
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 移除自定義 header
    if (config.headers?.['X-Silent-Request']) {
      delete config.headers['X-Silent-Request']
    }

    return config
  },
  (error: AxiosError) => {
    hideLoading()
    return Promise.reject(error)
  },
)

// 響應攔截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    hideLoading()
    return response
  },
  async (error: AxiosError<ApiError>) => {
    hideLoading()

    // 處理錯誤響應
    if (error.response) {
      const { status, data } = error.response

      // 401 Unauthorized - Token 過期或無效
      if (status === 401) {
        // 嘗試刷新 token
        const refreshToken = localStorage.getItem('refresh_token')

        if (refreshToken && !error.config?.url?.includes('/auth/refresh')) {
          try {
            // 刷新 token
            const response = await axios.post(
              `${apiClient.defaults.baseURL}/auth/refresh`,
              { refreshToken },
            )

            const { accessToken } = response.data
            localStorage.setItem('access_token', accessToken)

            // 重試原請求
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${accessToken}`
              return apiClient.request(error.config)
            }
          } catch (refreshError) {
            // 刷新失敗，清除 token 並跳轉登入
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')

            // 重定向到登入頁
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
        } else {
          // 沒有 refresh token，直接清除並跳轉
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')

          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      }

      // 403 Forbidden - 無權限
      if (status === 403) {
        console.error('無權限訪問:', data.message)
        // TODO: 顯示無權限提示
      }

      // 404 Not Found
      if (status === 404) {
        console.error('資源不存在:', data.message)
      }

      // 409 Conflict
      if (status === 409) {
        console.error('數據衝突:', data.message)
      }

      // 422 Validation Error
      if (status === 422) {
        console.error('驗證錯誤:', data.message)
      }

      // 429 Too Many Requests
      if (status === 429) {
        console.error('請求過於頻繁，請稍後再試')
      }

      // 500+ Server Error
      if (status >= 500) {
        console.error('伺服器錯誤:', data.message || '請稍後再試')
      }

      // 返回格式化的錯誤
      return Promise.reject({
        status,
        message: Array.isArray(data.message) ? data.message.join(', ') : data.message,
        error: data.error,
        data: data,
      })
    } else if (error.request) {
      // 請求已發送但沒有收到響應
      console.error('網路錯誤，請檢查網路連線')
      return Promise.reject({
        status: 0,
        message: '網路錯誤，請檢查網路連線',
        error: 'NETWORK_ERROR',
      })
    } else {
      // 發送請求時發生錯誤
      console.error('請求錯誤:', error.message)
      return Promise.reject({
        status: 0,
        message: error.message || '請求發生錯誤',
        error: 'REQUEST_ERROR',
      })
    }
  },
)

/**
 * 建構查詢參數字串
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

  return filtered ? `?${filtered}` : ''
}

export default apiClient
