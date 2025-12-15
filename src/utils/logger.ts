/**
 * 前端 Logger 工具
 * 只在開發環境輸出日誌，生產環境自動靜音
 */

const isDev = import.meta.env.DEV

/**
 * 日誌級別
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 格式化日誌前綴
 */
function formatPrefix(level: LogLevel, context?: string): string {
  const timestamp = new Date().toLocaleTimeString()
  const levelIcon = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  }
  const icon = levelIcon[level]
  return context ? `${icon} [${timestamp}] [${context}]` : `${icon} [${timestamp}]`
}

/**
 * Logger 物件
 */
export const logger = {
  /**
   * Debug 級別日誌（只在開發環境輸出）
   */
  debug: (message: string, context?: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(formatPrefix('debug', context), message, ...args)
    }
  },

  /**
   * Info 級別日誌（只在開發環境輸出）
   */
  info: (message: string, context?: string, ...args: unknown[]) => {
    if (isDev) {
      console.info(formatPrefix('info', context), message, ...args)
    }
  },

  /**
   * Warn 級別日誌（開發和生產都輸出）
   */
  warn: (message: string, context?: string, ...args: unknown[]) => {
    console.warn(formatPrefix('warn', context), message, ...args)
  },

  /**
   * Error 級別日誌（開發和生產都輸出）
   */
  error: (message: string, context?: string, ...args: unknown[]) => {
    console.error(formatPrefix('error', context), message, ...args)
  }
}

/**
 * 創建帶有固定 context 的 logger
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, ...args: unknown[]) => logger.debug(message, context, ...args),
    info: (message: string, ...args: unknown[]) => logger.info(message, context, ...args),
    warn: (message: string, ...args: unknown[]) => logger.warn(message, context, ...args),
    error: (message: string, ...args: unknown[]) => logger.error(message, context, ...args)
  }
}

export default logger
