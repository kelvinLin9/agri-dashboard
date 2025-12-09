import apiClient from './apiClient'
import type {
  AuthResponse,
  RegisterDto,
  LoginDto,
  User,
} from './types'

/**
 * 認證 API
 */
export const authApi = {
  /**
   * 註冊新用戶
   * 使用 _noToast 標誌以便在頁面中自定錯誤處理
   */
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', data, { _noToast: true } as any)
    const authData = response.data.data

    // 儲存 token
    if (authData.accessToken) {
      localStorage.setItem('access_token', authData.accessToken)
      localStorage.setItem('refresh_token', authData.refreshToken)
      localStorage.setItem('user', JSON.stringify(authData.user))
    }
    return authData
  },

  /**
   * 用戶登入
   * 使用 _noToast 標誌以便在頁面中自定錯誤處理（安全考量：不顯示具體錯誤細節）
   */
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', data, { _noToast: true } as any)
    // 後端使用 ResponseTransformInterceptor 包裝響應為 { data: {...} }
    const authData = response.data.data

    // 儲存 token
    if (authData.accessToken) {
      localStorage.setItem('access_token', authData.accessToken)
      localStorage.setItem('refresh_token', authData.refreshToken)
      localStorage.setItem('user', JSON.stringify(authData.user))
    }
    return authData
  },

  /**
   * 獲取當前用戶資訊
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/auth/profile')
    return response.data.data
  },

  /**
   * 刷新 Token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ data: { accessToken: string } }>('/auth/refresh', { refreshToken })
    const tokenData = response.data.data
    if (tokenData.accessToken) {
      localStorage.setItem('access_token', tokenData.accessToken)
    }
    return tokenData
  },

  /**
   * 用戶登出
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
    // 清除本地儲存
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  /**
   * 修改密碼
   */
  changePassword: async (data: {
    oldPassword: string
    newPassword: string
  }): Promise<void> => {
    await apiClient.put('/auth/change-password', data)
  },
}
