import apiClient, { buildQueryString } from './apiClient'
import type {
  AuthResponse,
  RegisterDto,
  LoginDto,
  User,
  ApiResponse,
} from './types'

/**
 * 認證 API
 */
export const authApi = {
  /**
   * 註冊新用戶
   */
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  /**
   * 用戶登入
   */
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    // 儲存 token
    if (response.data.accessToken) {
      localStorage.setItem('access_token', response.data.accessToken)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  /**
   * 獲取當前用戶資訊
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile')
    return response.data
  },

  /**
   * 刷新 Token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    if (response.data.accessToken) {
      localStorage.setItem('access_token', response.data.accessToken)
    }
    return response.data
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
