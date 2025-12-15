import { ref, computed } from 'vue'
import { uploadApi } from '@/api/upload'
import type { Upload } from '@/api/types'

/**
 * Part 狀態
 */
export type PartStatus = 'pending' | 'uploading' | 'completed' | 'failed'

/**
 * Part 資訊
 */
export interface PartInfo {
  partNumber: number
  uploadUrl: string
  status: PartStatus
  progress: number // 0-100
  etag?: string
  error?: string
  retryCount: number
}

/**
 * 上傳狀態
 */
export type UploadStatus = 'idle' | 'initializing' | 'uploading' | 'completing' | 'completed' | 'failed' | 'cancelled'

/**
 * Multipart Upload Composable
 *
 * 支援大檔案分片上傳，包含：
 * - 自動檔案切片（預設 10MB）
 * - 並行上傳控制（預設 3 並發）
 * - 進度追蹤（整體 + 各 part）
 * - 暫停/繼續功能
 * - 錯誤重試（最多 3 次）
 */
export function useMultipartUpload() {
  // ==================== 配置 ====================
  const PART_SIZE = 10 * 1024 * 1024 // 10MB
  const CONCURRENCY = 3 // 並行上傳數
  const MAX_RETRIES = 3 // 最大重試次數
  const TIMEOUT_MS = 2 * 60 * 1000 // 每個 part 2 分鐘超時

  // ==================== State ====================
  const status = ref<UploadStatus>('idle')
  const uploadedFile = ref<Upload | null>(null)
  const error = ref<string | null>(null)

  // 上傳資訊
  const uploadId = ref<string | null>(null)
  const key = ref<string | null>(null)
  const parts = ref<PartInfo[]>([])
  const fileSize = ref(0)
  const fileName = ref('')

  // 控制
  const isPaused = ref(false)
  const abortController = ref<AbortController | null>(null)

  // ==================== Computed ====================

  /**
   * 整體進度 (0-100)
   */
  const overallProgress = computed(() => {
    if (parts.value.length === 0) return 0
    const totalProgress = parts.value.reduce((sum, p) => sum + p.progress, 0)
    return Math.round(totalProgress / parts.value.length)
  })

  /**
   * 已完成的 parts 數量
   */
  const completedParts = computed(() =>
    parts.value.filter((p) => p.status === 'completed').length,
  )

  /**
   * 失敗的 parts 數量
   */
  const failedParts = computed(() =>
    parts.value.filter((p) => p.status === 'failed').length,
  )

  /**
   * 是否可以暫停
   */
  const canPause = computed(() => status.value === 'uploading' && !isPaused.value)

  /**
   * 是否可以繼續
   */
  const canResume = computed(() => status.value === 'uploading' && isPaused.value)

  // ==================== Methods ====================

  /**
   * 將檔案切成分片
   */
  function sliceFile(file: File): Blob[] {
    const chunks: Blob[] = []
    let offset = 0

    while (offset < file.size) {
      const end = Math.min(offset + PART_SIZE, file.size)
      chunks.push(file.slice(offset, end))
      offset = end
    }

    return chunks
  }

  /**
   * 上傳單個 part
   */
  async function uploadPart(part: PartInfo, chunk: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // 進度事件
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          part.progress = Math.round((e.loaded / e.total) * 100)
        }
      })

      // 完成事件
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // 從響應頭獲取 ETag
          const etag = xhr.getResponseHeader('ETag')
          if (etag) {
            resolve(etag.replace(/"/g, ''))
          } else {
            reject(new Error('無法獲取 ETag'))
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => reject(new Error('網絡錯誤')))
      xhr.addEventListener('timeout', () => reject(new Error('上傳超時')))
      xhr.addEventListener('abort', () => reject(new Error('上傳已取消')))

      // 開始上傳
      xhr.open('PUT', part.uploadUrl)
      xhr.timeout = TIMEOUT_MS
      xhr.send(chunk)

      // 儲存 abort 控制
      abortController.value = {
        abort: () => xhr.abort(),
      } as AbortController
    })
  }

  /**
   * 並行上傳所有 parts
   */
  async function uploadParts(file: File): Promise<void> {
    const chunks = sliceFile(file)

    // 建立一個任務隊列
    const queue = [...parts.value.filter((p) => p.status !== 'completed')]

    const uploadNext = async (): Promise<void> => {
      if (isPaused.value || status.value === 'cancelled') return

      const part = queue.find((p) => p.status === 'pending')
      if (!part) return

      part.status = 'uploading'

      const chunk = chunks[part.partNumber - 1]
      if (!chunk) {
        part.status = 'failed'
        part.error = '無效的分片'
        return
      }

      try {
        const etag = await uploadPart(part, chunk)
        part.etag = etag
        part.status = 'completed'
        part.progress = 100
      } catch (err) {
        part.retryCount++
        if (part.retryCount < MAX_RETRIES) {
          // 重試
          part.status = 'pending'
          part.progress = 0
          part.error = err instanceof Error ? err.message : '上傳失敗'
        } else {
          part.status = 'failed'
          part.error = err instanceof Error ? err.message : '上傳失敗'
        }
      }

      // 繼續下一個
      if (queue.some((p) => p.status === 'pending')) {
        await uploadNext()
      }
    }

    // 啟動並行上傳
    const workers = Array(Math.min(CONCURRENCY, queue.length))
      .fill(null)
      .map(() => uploadNext())

    await Promise.all(workers)
  }

  /**
   * 開始上傳
   */
  async function startUpload(
    file: File,
    options?: {
      title?: string
      description?: string
    },
  ): Promise<Upload | null> {
    try {
      // 重置狀態
      status.value = 'initializing'
      error.value = null
      uploadedFile.value = null
      isPaused.value = false
      fileSize.value = file.size
      fileName.value = file.name

      // Step 1: 初始化分片上傳
      const initResult = await uploadApi.initiateMultipartUpload(
        file.name,
        file.type || 'application/octet-stream',
        file.size,
      )

      uploadId.value = initResult.uploadId
      key.value = initResult.key

      // Step 2: 獲取預簽名 URL
      const { parts: partUrls } = await uploadApi.getMultipartPresignedUrls(
        initResult.key,
        initResult.uploadId,
        initResult.partCount,
      )

      // 初始化 parts 狀態
      parts.value = partUrls.map((p) => ({
        partNumber: p.partNumber,
        uploadUrl: p.uploadUrl,
        status: 'pending' as PartStatus,
        progress: 0,
        retryCount: 0,
      }))

      // Step 3: 開始上傳
      status.value = 'uploading'
      await uploadParts(file)

      // 檢查是否有失敗的 parts
      if (failedParts.value > 0) {
        throw new Error(`${failedParts.value} 個分片上傳失敗`)
      }

      // 檢查是否被取消 (status 可能在上傳過程中被改變)
      if (status.value !== 'uploading') {
        return null
      }

      // Step 4: 完成上傳
      status.value = 'completing'
      const completedParts = parts.value
        .filter((p) => p.status === 'completed' && p.etag)
        .map((p) => ({
          partNumber: p.partNumber,
          etag: p.etag!,
        }))

      const result = await uploadApi.completeMultipartUpload(
        key.value!,
        uploadId.value!,
        completedParts,
        file.size,
        {
          mimeType: file.type,
          title: options?.title,
          description: options?.description,
        },
      )

      status.value = 'completed'
      uploadedFile.value = result
      return result
    } catch (err) {
      status.value = 'failed'
      error.value = err instanceof Error ? err.message : '上傳失敗'
      return null
    }
  }

  /**
   * 暫停上傳
   */
  function pause(): void {
    if (canPause.value) {
      isPaused.value = true
      abortController.value?.abort()
    }
  }

  /**
   * 繼續上傳
   */
  async function resume(file: File): Promise<void> {
    if (!canResume.value || !key.value || !uploadId.value) return

    isPaused.value = false
    await uploadParts(file)

    // 如果全部完成，進行合併
    if (failedParts.value === 0 && completedParts.value === parts.value.length) {
      status.value = 'completing'
      // ... 完成邏輯
    }
  }

  /**
   * 取消上傳
   */
  async function cancel(): Promise<void> {
    status.value = 'cancelled'
    abortController.value?.abort()

    // 清理服務端資源
    if (key.value && uploadId.value) {
      try {
        await uploadApi.abortMultipartUpload(key.value, uploadId.value)
      } catch {
        // 忽略錯誤
      }
    }

    reset()
  }

  /**
   * 重試失敗的 parts
   */
  async function retryFailed(file: File): Promise<void> {
    // 重置失敗的 parts
    parts.value.forEach((p) => {
      if (p.status === 'failed') {
        p.status = 'pending'
        p.progress = 0
        p.retryCount = 0
        p.error = undefined
      }
    })

    // 重新上傳
    status.value = 'uploading'
    await uploadParts(file)
  }

  /**
   * 重置狀態
   */
  function reset(): void {
    status.value = 'idle'
    uploadedFile.value = null
    error.value = null
    uploadId.value = null
    key.value = null
    parts.value = []
    fileSize.value = 0
    fileName.value = ''
    isPaused.value = false
  }

  // ==================== Return ====================
  return {
    // State
    status,
    uploadedFile,
    error,
    parts,
    fileSize,
    fileName,
    isPaused,

    // Computed
    overallProgress,
    completedParts,
    failedParts,
    canPause,
    canResume,

    // Methods
    startUpload,
    pause,
    resume,
    cancel,
    retryFailed,
    reset,
  }
}
