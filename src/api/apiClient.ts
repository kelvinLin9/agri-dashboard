import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { openLoading, closeLoading } from '@/utils/loading'
import type { ApiError } from './types'

// 擴充 AxiosRequestConfig 類型以包含 _retry 屬性
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

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

// Refresh Token 相關變數與函數
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
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
        const originalRequest = error.config

        // 如果是刷新 token 的請求本身失敗，則直接登出
        if (originalRequest?.url?.includes('/auth/refresh')) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }

        // 如果正在刷新，則將請求加入隊列
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return apiClient(originalRequest)
            }
          }).catch(err => {
            return Promise.reject(err)
          })
        }

        const refreshToken = localStorage.getItem('refresh_token')

        if (refreshToken && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true
          isRefreshing = true

          try {
            // 刷新 token
            const response = await axios.post(
              `${apiClient.defaults.baseURL}/auth/refresh`,
              { refreshToken }
            )

            // 後端回應結構: { data: { accessToken: '...' } }
            // 注意：這裡使用 axios 直接請求，可能不會經過 ResponseTransformInterceptor，視後端實作而定
            // 為了保險，檢查多層結構
            const responseData = response.data
            const accessToken = responseData.data?.accessToken || responseData.accessToken

            if (!accessToken) {
              throw new Error('No access token received')
            }

            localStorage.setItem('access_token', accessToken)

            // 處理隊列中的請求
            processQueue(null, accessToken)

            // 重試當前請求
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return apiClient(originalRequest)

          } catch (refreshError) {
            // 刷新失敗，清除隊列並登出
            processQueue(refreshError, null)

            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')

            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
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
