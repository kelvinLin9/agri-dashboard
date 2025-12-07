/**
 * 通知相關類型
 */

import type { SearchableQueryParams } from './common'

// 通知類型
export enum NotificationType {
  SYSTEM = 'system',
  ORDER = 'order',
  PAYMENT = 'payment',
  MEMBER = 'member',
  PRODUCT = 'product',
  PROMOTION = 'promotion',
  REFUND = 'refund',
}

// 通知渠道
export enum NotificationChannel {
  WEBSOCKET = 'websocket',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

// 通知狀態
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// 通知
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  channel: NotificationChannel
  status: NotificationStatus
  title: string
  content: string
  data?: Record<string, any>
  actionUrl?: string
  recipientEmail?: string
  recipientPhone?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  errorMessage?: string
  retryCount: number
  priority: number
  expiresAt?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

// 通知查詢參數
export interface NotificationQueryParams extends SearchableQueryParams {
  type?: NotificationType
  status?: NotificationStatus
  priority?: number
}

// 建立通知 DTO
export interface CreateNotificationDto {
  userId: string
  type: NotificationType
  title: string
  content: string
  channel: NotificationChannel
  data?: Record<string, any>
  actionUrl?: string
  priority?: number
}

// 使用模板發送通知 DTO
export interface SendByTemplateDto {
  templateCode: string
  variables?: Record<string, any>
  data?: Record<string, any>
}

// 批量發送通知 DTO
export interface SendBulkDto {
  userIds: string[]
  type: NotificationType
  title: string
  content: string
  channel: NotificationChannel
  data?: Record<string, any>
  actionUrl?: string
  priority?: number
}
