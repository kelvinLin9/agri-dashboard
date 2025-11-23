import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { openLoading, closeLoading } from '@/utils/loading'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

// 請求攔截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    openLoading()

    // Authorization 處理
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    closeLoading()
    return Promise.reject(error)
  },
)

// 響應攔截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    closeLoading()
    return response
  },
  (error: AxiosError) => {
    closeLoading()

    // 處理錯誤響應
    if (error.response) {
      const status = error.response.status

      // 401 Unauthorized - Token 過期或無效
      if (status === 401) {
        localStorage.removeItem('token')
        // TODO: 實作登出邏輯或重定向到登入頁
        // router.push({ name: 'login' })
      }

      // 403 Forbidden - 無權限
      if (status === 403) {
        // TODO: 處理無權限情況
        console.error('無權限訪問')
      }

      // 500 Internal Server Error
      if (status >= 500) {
        // TODO: 處理伺服器錯誤
        console.error('伺服器錯誤')
      }
    } else if (error.request) {
      // 請求已發送但沒有收到響應
      console.error('網路錯誤，請檢查網路連線')
    } else {
      // 發送請求時發生錯誤
      console.error('請求錯誤:', error.message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
