/**
 * 全域 Toast 工具
 *
 * 這是一個可在 Vue 組件外使用的 Toast 單例
 * 用於 API 攔截器等非組件環境
 */

interface ToastOptions {
  title: string
  description?: string
  color?: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'neutral'
  icon?: string
  duration?: number
}

// 存放 Nuxt UI toast 實例的引用
let toastInstance: {
  add: (options: ToastOptions) => void
  clear: () => void
} | null = null

// 預設圖標
const defaultIcons = {
  success: 'i-heroicons-check-circle',
  error: 'i-heroicons-x-circle',
  warning: 'i-heroicons-exclamation-triangle',
  info: 'i-heroicons-information-circle',
}

/**
 * 設置 Toast 實例（在 App.vue 中呼叫）
 */
export function setToastInstance(instance: typeof toastInstance) {
  toastInstance = instance
}

/**
 * 取得 Toast 實例
 */
export function getToastInstance() {
  return toastInstance
}

/**
 * 顯示 Toast
 */
export function showToast(options: ToastOptions) {
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
 * 顯示成功 Toast
 */
export function showSuccess(title: string, description?: string) {
  showToast({ title, description, color: 'success', icon: defaultIcons.success })
}

/**
 * 顯示錯誤 Toast
 */
export function showError(title: string, description?: string) {
  showToast({ title, description, color: 'error', icon: defaultIcons.error })
}

/**
 * 顯示警告 Toast
 */
export function showWarning(title: string, description?: string) {
  showToast({ title, description, color: 'warning', icon: defaultIcons.warning })
}

/**
 * 顯示資訊 Toast
 */
export function showInfo(title: string, description?: string) {
  showToast({ title, description, color: 'info', icon: defaultIcons.info })
}

/**
 * 清除所有 Toast
 */
export function clearToasts() {
  toastInstance?.clear()
}
