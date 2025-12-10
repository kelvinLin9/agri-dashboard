/**
 * 認證和用戶相關類型
 */

// 用戶介面
export interface User {
  id: string
  username?: string
  email: string
  nickname?: string
  role: 'super_admin' | 'admin' | 'operator' | 'customer_service' | 'customer'
  status: 'active' | 'inactive' | 'locked'
  avatar?: string
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

// 認證響應
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// 註冊 DTO（移除 username）
export interface RegisterDto {
  email: string
  password: string
  nickname?: string
}

// 登入 DTO（改為 email）
export interface LoginDto {
  email: string
  password: string
}
