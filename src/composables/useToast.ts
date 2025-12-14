import { ref, inject } from 'vue'

/**
 * Toast 通知選項
 */
export interface ToastOptions {
  title: string
  description?: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  duration?: number
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

// Toast 狀態 key (Nuxt UI 使用的 injection key)
const toastInjectionKey = Symbol('nuxt-ui.toaster')

/**
 * Toast Composable
 * 
 * 使用 Nuxt UI 的 Toaster context 來顯示通知
 */
export function useToast() {
  // 嘗試從 Nuxt UI 的 Toaster context 取得 toast 實例
  const toaster = inject<any>(toastInjectionKey, null)

  // 本地 toasts 陣列（fallback）
  const localToasts = ref<ToastOptions[]>([])

  /**
   * 新增 Toast 通知
   */
  const add = (options: ToastOptions) => {
    if (toaster?.add) {
      toaster.add(options)
    } else {
      // Fallback: 使用 console 輸出
      const emoji = options.color === 'success' ? '✅' :
        options.color === 'error' ? '❌' :
          options.color === 'warning' ? '⚠️' :
            options.color === 'info' ? 'ℹ️' : '🔔'
      console.log(`${emoji} [Toast] ${options.title}${options.description ? ': ' + options.description : ''}`)
      localToasts.value.push(options)
    }
  }

  /**
   * 移除 Toast
   */
  const remove = (id: string) => {
    if (toaster?.remove) {
      toaster.remove(id)
    }
  }

  /**
   * 清除所有 Toast
   */
  const clear = () => {
    if (toaster?.clear) {
      toaster.clear()
    }
    localToasts.value = []
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

  return {
    add,
    remove,
    clear,
    toasts: localToasts,
    success,
    error,
    warning,
    info,
  }
}
