import { ref } from 'vue'

export type ConfirmType = 'danger' | 'warning' | 'info' | 'success'

export interface ConfirmOptions {
  title?: string
  message: string
  type?: ConfirmType
  confirmLabel?: string
  cancelLabel?: string
  showWarning?: boolean
  warningMessage?: string
}

/**
 * 全域確認對話框 Composable
 * 
 * 提供類似 confirm() 的 API，但使用美觀的 Modal 對話框
 * 
 * @example
 * ```ts
 * const { confirm } = useConfirm()
 * 
 * // 基本使用
 * const confirmed = await confirm({
 *   message: '確定要刪除嗎？'
 * })
 * if (confirmed) {
 *   // 執行刪除
 * }
 * 
 * // 危險操作
 * const confirmed = await confirm({
 *   title: '刪除商品',
 *   message: '此操作將永久刪除商品，無法復原。',
 *   type: 'danger',
 *   confirmLabel: '確認刪除'
 * })
 * ```
 */
export function useConfirm() {
  const isOpen = ref(false)
  const isLoading = ref(false)

  let resolvePromise: ((value: boolean) => void) | null = null
  let currentOptions: ConfirmOptions = { message: '' }

  /**
   * 顯示確認對話框
   * @returns Promise<boolean> - 用戶點擊確認返回 true，取消返回 false
   */
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolvePromise = resolve
      currentOptions = {
        title: '確認操作',
        type: 'info',
        confirmLabel: '確認',
        cancelLabel: '取消',
        showWarning: options.type === 'danger',
        ...options
      }
      isOpen.value = true
    })
  }

  /**
   * 確認處理
   */
  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
    isOpen.value = false
  }

  /**
   * 取消處理
   */
  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
    isOpen.value = false
  }

  /**
   * 設置載入狀態（用於異步確認操作）
   */
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // 便捷方法
  const confirmDanger = (message: string, title?: string) => {
    return confirm({
      title: title || '確認刪除',
      message,
      type: 'danger',
      confirmLabel: '確認刪除',
      showWarning: true
    })
  }

  const confirmWarning = (message: string, title?: string) => {
    return confirm({
      title: title || '注意',
      message,
      type: 'warning'
    })
  }

  return {
    // State
    isOpen,
    isLoading,
    currentOptions: currentOptions as ConfirmOptions,
    // Methods
    confirm,
    confirmDanger,
    confirmWarning,
    handleConfirm,
    handleCancel,
    setLoading,
  }
}
