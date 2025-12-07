/**
 * 會員相關類型
 */

import type { SearchableQueryParams } from './common'
import type { User } from './auth'

// 會員等級
export enum MemberLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

// 會員
export interface Member {
  id: string
  userId: string
  realName?: string
  phone?: string
  birthday?: string
  gender?: 'male' | 'female' | 'other'
  postalCode?: string
  city?: string
  district?: string
  address?: string
  level: MemberLevel
  points: number
  totalSpent: number
  orderCount: number
  newsletterSubscribed: boolean
  preferredLanguage?: string
  notes?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  user?: User
}

// 會員查詢參數
export interface MemberQueryParams extends SearchableQueryParams {
  level?: MemberLevel
}

// 建立會員 DTO
export interface CreateMemberDto {
  realName?: string
  phone?: string
  birthday?: string
  gender?: 'male' | 'female' | 'other' | null
  postalCode?: string
  city?: string
  district?: string
  address?: string
  newsletterSubscribed?: boolean
}

// 更新會員 DTO
export interface UpdateMemberDto extends Partial<CreateMemberDto> {
  level?: MemberLevel
  points?: number
  status?: 'active' | 'inactive'
}

// 新增點數 DTO
export interface AddPointsDto {
  points: number
  reason: string
}

// 扣除點數 DTO
export interface DeductPointsDto {
  points: number
  reason: string
}
