import apiClient from './apiClient'

/**
 * 操作類型枚舉（與後端同步）
 */
export enum OperationType {
  // 基本 CRUD 操作
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  // 認證相關
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  // API 存取
  API_ACCESS = 'api_access',
  // 前台關鍵操作
  ORDER_PLACED = 'order_placed',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
}

/**
 * 用戶類型
 */
export enum UserType {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
}

/**
 * 操作日誌
 */
export interface AuditLog {
  id: string
  operationType: OperationType
  description?: string
  userType: UserType
  userId?: string
  username?: string
  method: string
  path: string
  ipAddress?: string
  userAgent?: string
  statusCode: number
  executionTime?: number
  errorMessage?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

/**
 * 日誌查詢參數
 */
export interface QueryLogsParams {
  userId?: string
  operationType?: OperationType
  userType?: UserType
  statusCode?: number
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

/**
 * 日誌查詢響應
 */
export interface QueryLogsResponse {
  logs: AuditLog[]
  total: number
}

/**
 * 日誌統計資料（與後端同步）
 */
export interface LogStatistics {
  totalLogs: number
  errorCount: number
  todayCount: number
  adminOperations: number
  customerOperations: number
}

/**
 * 清理結果
 */
export interface CleanupResult {
  adminLogsDeleted: number
  auditLogsDeleted: number
}

/**
 * Logs API
 */
export const logsApi = {
  /**
   * 查詢日誌列表
   */
  getAll: async (params?: QueryLogsParams): Promise<QueryLogsResponse> => {
    const { data } = await apiClient.get<{ data: QueryLogsResponse }>('/logs', { params })
    return data.data
  },

  /**
   * 獲取統計資料
   */
  getStatistics: async (): Promise<LogStatistics> => {
    const { data } = await apiClient.get<{ data: LogStatistics }>('/logs/statistics')
    return data.data
  },

  /**
   * 手動觸發清理（管理員）
   */
  cleanup: async (): Promise<CleanupResult> => {
    const { data } = await apiClient.post<{ data: CleanupResult }>('/logs/cleanup')
    return data.data
  },
}

/**
 * 操作類型顯示名稱
 */
export const operationTypeLabels: Record<OperationType, string> = {
  [OperationType.CREATE]: '建立',
  [OperationType.READ]: '讀取',
  [OperationType.UPDATE]: '更新',
  [OperationType.DELETE]: '刪除',
  [OperationType.LOGIN]: '登入',
  [OperationType.LOGOUT]: '登出',
  [OperationType.LOGIN_FAILED]: '登入失敗',
  [OperationType.API_ACCESS]: 'API 存取',
  [OperationType.ORDER_PLACED]: '訂單建立',
  [OperationType.PAYMENT_COMPLETED]: '付款完成',
  [OperationType.PAYMENT_FAILED]: '付款失敗',
}

/**
 * 操作類型顏色
 */
export const operationTypeColors: Record<OperationType, string> = {
  [OperationType.CREATE]: 'success',
  [OperationType.READ]: 'info',
  [OperationType.UPDATE]: 'warning',
  [OperationType.DELETE]: 'error',
  [OperationType.LOGIN]: 'primary',
  [OperationType.LOGOUT]: 'neutral',
  [OperationType.LOGIN_FAILED]: 'error',
  [OperationType.API_ACCESS]: 'neutral',
  [OperationType.ORDER_PLACED]: 'success',
  [OperationType.PAYMENT_COMPLETED]: 'success',
  [OperationType.PAYMENT_FAILED]: 'error',
}
