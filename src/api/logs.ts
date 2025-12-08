import apiClient from './apiClient'

/**
 * 操作日誌
 */
export interface AuditLog {
  id: string
  userId: string
  username?: string
  operationType: OperationType
  endpoint: string
  method: string
  ipAddress: string
  userAgent: string
  statusCode: number
  errorMessage?: string
  responseTime: number
  createdAt: string
}

/**
 * 操作類型枚舉
 */
export enum OperationType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  OTHER = 'OTHER',
}

/**
 * 日誌查詢參數
 */
export interface QueryLogsParams {
  userId?: string
  operationType?: OperationType
  statusCode?: number
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
 * 日誌統計資料
 */
export interface LogStatistics {
  totalLogs: number
  operationTypeDistribution: Record<OperationType, number>
  statusCodeDistribution: Record<string, number>
  averageResponseTime: number
  errorRate: number
}

/**
 * Logs API
 */
class LogsApi {
  /**
   * 查詢日誌列表
   */
  async getAll(params?: QueryLogsParams): Promise<QueryLogsResponse> {
    const { data } = await apiClient.get<QueryLogsResponse>('/logs', { params })
    return data
  }

  /**
   * 獲取統計資料
   */
  async getStatistics(): Promise<LogStatistics> {
    const { data } = await apiClient.get<LogStatistics>('/logs/statistics')
    return data
  }
}

export const logsApi = new LogsApi()
