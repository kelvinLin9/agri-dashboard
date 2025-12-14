/**
 * 圖片上傳 Composable
 * 
 * 提供圖片上傳、管理和驗證功能
 * 
 * @example
 * const {
 *   images,
 *   mainImage,
 *   isUploading,
 *   uploadConfig,
 *   uploadFiles,
 *   addImage,
 *   removeImage,
 *   setAsMainImage,
 *   clearImages,
 *   validateFile,
 * } = useImageUpload()
 */

import { ref, computed, onMounted, type ComputedRef } from 'vue'
import { uploadApi } from '@/api'
import type { UploadConfig } from '@/api/types'

export interface UseImageUploadOptions {
  /** 初始主圖片 */
  initialMainImage?: string
  /** 初始圖片列表 */
  initialImages?: string[]
  /** 最大圖片數量 (預設 10) */
  maxImages?: number
  /** 上傳用途 (用於後端分類) */
  usage?: string
  /** 是否自動載入設定 */
  autoLoadConfig?: boolean
}

export interface UseImageUploadReturn {
  /** 圖片列表 (不含主圖) */
  images: ReturnType<typeof ref<string[]>>
  /** 主圖片 */
  mainImage: ReturnType<typeof ref<string>>
  /** 所有圖片 (主圖 + 其他圖片，去重) */
  allImages: ComputedRef<string[]>
  /** 是否正在上傳 */
  isUploading: ReturnType<typeof ref<boolean>>
  /** 上傳進度 (0-100) */
  uploadProgress: ReturnType<typeof ref<number>>
  /** 上傳設定 */
  uploadConfig: ReturnType<typeof ref<UploadConfig | null>>
  /** 上傳檔案 */
  uploadFiles: (files: File[]) => Promise<string[]>
  /** 透過 URL 新增圖片 */
  addImageByUrl: (url: string) => boolean
  /** 移除圖片 (by index in allImages) */
  removeImage: (index: number) => void
  /** 設為主圖 */
  setAsMainImage: (url: string) => void
  /** 清空所有圖片 */
  clearImages: () => void
  /** 驗證檔案 */
  validateFile: (file: File) => { valid: boolean; error?: string }
  /** 載入上傳設定 */
  loadConfig: () => Promise<void>
  /** 觸發檔案選擇 */
  triggerFileInput: () => void
  /** 處理檔案選擇事件 */
  handleFileSelect: (event: Event) => Promise<void>
  /** 處理拖曳放下事件 */
  handleDrop: (event: DragEvent) => Promise<void>
  /** 檔案 input ref */
  fileInputRef: ReturnType<typeof ref<HTMLInputElement | null>>
}

// 預設上傳設定
const DEFAULT_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFileSizeMB: 10,
  maxFilesPerUpload: 10,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  allowedImageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  allowedDocumentTypes: [],
  allowedDocumentExtensions: [],
  allowedVideoTypes: [],
  allowedVideoExtensions: [],
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    initialMainImage = '',
    initialImages = [],
    maxImages = 10,
    usage = 'product',
    autoLoadConfig = true,
  } = options

  // State
  const images = ref<string[]>([...initialImages])
  const mainImage = ref<string>(initialMainImage)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadConfig = ref<UploadConfig | null>(null)
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // Computed
  const allImages = computed(() => {
    const result = [...images.value]
    if (mainImage.value && !result.includes(mainImage.value)) {
      result.unshift(mainImage.value)
    }
    return result
  })

  // 取得有效設定
  const getConfig = (): UploadConfig => uploadConfig.value || DEFAULT_CONFIG

  // 載入上傳設定
  const loadConfig = async () => {
    try {
      uploadConfig.value = await uploadApi.getConfig()
    } catch (error) {
      console.warn('無法載入上傳設定，使用預設值:', error)
      uploadConfig.value = DEFAULT_CONFIG
    }
  }

  // 驗證檔案
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const config = getConfig()

    // 檢查檔案類型
    if (!config.allowedImageTypes.includes(file.type)) {
      const extensions = config.allowedImageExtensions.join(', ')
      return { valid: false, error: `不支援的檔案格式，請使用 ${extensions}` }
    }

    // 檢查檔案大小
    if (file.size > config.maxFileSize) {
      return { valid: false, error: `檔案大小不能超過 ${config.maxFileSizeMB}MB` }
    }

    return { valid: true }
  }

  /**
   * 上傳單一檔案（智能選擇上傳策略）
   */
  const uploadSingleFile = async (file: File): Promise<string> => {
    // 查詢上傳策略
    const strategy = await uploadApi.getUploadStrategy(file.size, file.type, file.name, usage)

    if (strategy.strategy === 'presigned') {
      // 大檔案：R2 預簽名上傳
      const { uploadUrl, publicUrl, key, expectedFileSize } = await uploadApi.getR2PresignedUrl(
        file.name,
        file.type,
        file.size,
      )

      // 直接上傳到 R2
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            // 單檔進度（整體進度在外層處理）
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`上傳失敗: HTTP ${xhr.status}`))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('網絡錯誤')))
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // 通知後端記錄
      const result = await uploadApi.completeR2Upload(key, publicUrl, file.size, {
        expectedFileSize,
        mimeType: file.type,
      })
      return result.url
    } else {
      // 小檔案：傳統 API 上傳
      const result = await uploadApi.upload(file, usage)
      return result.url
    }
  }

  // 上傳檔案（智能策略）
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    const config = getConfig()
    const currentCount = allImages.value.length
    const remainingSlots = maxImages - currentCount

    if (remainingSlots <= 0) {
      throw new Error(`已達到圖片上限 ${maxImages} 張`)
    }

    // 限制上傳數量
    const filesToUpload = files.slice(0, Math.min(remainingSlots, config.maxFilesPerUpload))

    // 驗證所有檔案
    for (const file of filesToUpload) {
      const validation = validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
    }

    isUploading.value = true
    uploadProgress.value = 0
    const uploadedUrls: string[] = []

    try {
      let processedCount = 0
      for (const file of filesToUpload) {
        const imageUrl = await uploadSingleFile(file)

        // 添加到圖片列表
        if (!images.value.includes(imageUrl) && mainImage.value !== imageUrl) {
          images.value.push(imageUrl)
        }

        // 如果沒有主圖，自動設為主圖
        if (!mainImage.value) {
          mainImage.value = imageUrl
        }

        uploadedUrls.push(imageUrl)
        processedCount++
        uploadProgress.value = Math.round((processedCount / filesToUpload.length) * 100)
      }

      return uploadedUrls
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // 透過 URL 新增圖片
  const addImageByUrl = (url: string): boolean => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return false

    if (allImages.value.length >= maxImages) {
      return false
    }

    if (!images.value.includes(trimmedUrl) && mainImage.value !== trimmedUrl) {
      images.value.push(trimmedUrl)
    }

    if (!mainImage.value) {
      mainImage.value = trimmedUrl
    }

    return true
  }

  // 移除圖片
  const removeImage = (index: number) => {
    const img = allImages.value[index]
    if (!img) return

    // 從 images 陣列移除
    const imgIndex = images.value.indexOf(img)
    if (imgIndex > -1) {
      images.value.splice(imgIndex, 1)
    }

    // 如果刪除的是主圖，設定新的主圖
    if (mainImage.value === img) {
      mainImage.value = images.value[0] || ''
    }
  }

  // 設為主圖
  const setAsMainImage = (url: string) => {
    mainImage.value = url
  }

  // 清空所有圖片
  const clearImages = () => {
    images.value = []
    mainImage.value = ''
  }

  // 觸發檔案選擇
  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  // 處理檔案選擇事件
  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      await uploadFiles(Array.from(target.files))
      target.value = '' // 重設 input 以允許重複選擇同一檔案
    }
  }

  // 處理拖曳放下事件
  const handleDrop = async (event: DragEvent) => {
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(event.dataTransfer.files).filter(f =>
        f.type.startsWith('image/')
      )
      if (imageFiles.length > 0) {
        await uploadFiles(imageFiles)
      }
    }
  }

  // 自動載入設定
  if (autoLoadConfig) {
    onMounted(loadConfig)
  }

  return {
    images,
    mainImage,
    allImages,
    isUploading,
    uploadProgress,
    uploadConfig,
    uploadFiles,
    addImageByUrl,
    removeImage,
    setAsMainImage,
    clearImages,
    validateFile,
    loadConfig,
    triggerFileInput,
    handleFileSelect,
    handleDrop,
    fileInputRef,
  }
}
