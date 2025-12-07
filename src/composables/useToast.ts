import { getCurrentInstance } from 'vue'

/**
 * Toast 通知類型
 */
export interface ToastOptions {
  title: string
  description?: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  duration?: number
  actions?: {
    label: string
    click?: () => void
  }[]
}

/**
 * 預設圖標
 */
const defaultIcons: Record<string, string> = {
  success: 'i-heroicons-check-circle',
  error: 'i-heroicons-x-circle',
  warning: 'i-heroicons-exclamation-triangle',
  info: 'i-heroicons-information-circle',
}

/**
 * 全域 Toast Composable
 * 
 * 提供統一的 Toast 通知介面
 * 
 * @example
 * ```ts
 * const toast = useToast()
 * 
 * // 成功通知
 * toast.success('操作成功', '商品已加入購物車')
 * 
 * // 錯誤通知
 * toast.error('操作失敗', '請稍後再試')
 * 
 * // 自訂通知
 * toast.add({
 *   title: '新訂單',
 *   description: '您有一筆新訂單',
 *   color: 'primary',
 *   icon: 'i-heroicons-shopping-bag'
 * })
 * ```
 */
export function useToast() {
  const instance = getCurrentInstance()

  // 取得 Nuxt UI 的 toast 實例
  const getToastInstance = () => {
    // Nuxt UI v4 會自動注入 $toast
    if (instance?.appContext.config.globalProperties.$toast) {
      return instance.appContext.config.globalProperties.$toast
    }

    // 嘗試從 provide/inject 取得
    const app = instance?.appContext.app
    if (app && (app as any)._context?.provides?.toast) {
      return (app as any)._context.provides.toast
    }

    // 如果都取不到，使用 console 作為 fallback
    console.warn('[useToast] Toast instance not found, using console fallback')
    return null
  }

  /**
   * 新增 Toast 通知
   */
  const add = (options: ToastOptions) => {
    const toastInstance = getToastInstance()

    if (toastInstance?.add) {
      toastInstance.add(options)
    } else {
      // Fallback: 使用 console
      const emoji = options.color === 'success' ? '✅' :
        options.color === 'error' ? '❌' :
          options.color === 'warning' ? '⚠️' :
            options.color === 'info' ? 'ℹ️' : '🔔'
      console.log(`${emoji} [Toast] ${options.title}${options.description ? ': ' + options.description : ''}`)
    }
  }

  /**
   * 成功通知
   */
  const success = (title: string, description?: string) => {
    add({
      title,
      description,
      color: 'success',
      icon: defaultIcons.success,
    })
  }

  /**
   * 錯誤通知
   */
  const error = (title: string, description?: string) => {
    add({
      title,
      description,
      color: 'error',
      icon: defaultIcons.error,
    })
  }

  /**
   * 警告通知
   */
  const warning = (title: string, description?: string) => {
    add({
      title,
      description,
      color: 'warning',
      icon: defaultIcons.warning,
    })
  }

  /**
   * 資訊通知
   */
  const info = (title: string, description?: string) => {
    add({
      title,
      description,
      color: 'info',
      icon: defaultIcons.info,
    })
  }

  /**
   * 清除所有通知
   */
  const clear = () => {
    const toastInstance = getToastInstance()
    if (toastInstance?.clear) {
      toastInstance.clear()
    }
  }

  return {
    add,
    success,
    error,
    warning,
    info,
    clear,
  }
}
