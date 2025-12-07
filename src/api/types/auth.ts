/**
 * 認證和用戶相關類型
 */

// 用戶介面
export interface User {
  id: string
  username: string
  email: string
  nickname?: string
  role: 'super_admin' | 'admin' | 'operator' | 'customer_service'
  status: 'active' | 'inactive' | 'locked'
  createdAt: string
  updatedAt: string
}

// 認證響應
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// 註冊 DTO
export interface RegisterDto {
  username: string
  email: string
  password: string
  nickname?: string
}

// 登入 DTO
export interface LoginDto {
  usernameOrEmail: string
  password: string
}
