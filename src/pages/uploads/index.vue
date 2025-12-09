<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">上傳管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理系統多媒體文件</p>
      </div>
      <div class="flex gap-2">
        <UButton
          label="上傳檔案"
          icon="i-heroicons-arrow-up-tray"
          color="primary"
          @click="openUploadModal"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總檔案數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ stats.totalFiles }}
            </p>
          </div>
          <UIcon name="i-heroicons-document" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">圖片</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {{ stats.imageCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-photo" class="w-8 h-8 text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">影片</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {{ stats.videoCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-film" class="w-8 h-8 text-purple-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總大小</p>
            <p class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {{ formatSize(stats.totalSize) }}
            </p>
          </div>
          <UIcon name="i-heroicons-server-stack" class="w-8 h-8 text-orange-500" />
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <SearchBox
            v-model="searchQuery"
            placeholder="搜尋檔案名稱"
            size="lg"
            @search="handleSearch"
          />
        </div>

        <!-- Type Filter -->
        <USelectMenu
          v-model="selectedType"
          :items="typeOptions"
          placeholder="選擇文件類型"
          size="lg"
          @change="fetchUploads"
        />
      </div>
    </UCard>

    <!-- Files Grid -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">文件列表</h3>
          <div class="flex gap-2">
            <UButton
              :icon="viewMode === 'grid' ? 'i-heroicons-squares-2x2' : 'i-heroicons-list-bullet'"
              size="sm"
              variant="ghost"
              @click="toggleViewMode"
            />
            <UButton
              label="重新載入"
              icon="i-heroicons-arrow-path"
              variant="ghost"
              size="sm"
              @click="fetchUploads"
            />
          </div>
        </div>
      </template>

      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500" />
      </div>

      <EmptyState
        v-else-if="uploads.length === 0"
        icon="i-heroicons-photo"
        title="尚無上傳檔案"
        description="點擊上方按鈕上傳第一個檔案"
        action-label="上傳檔案"
        action-icon="i-heroicons-arrow-up-tray"
        @action="openUploadModal"
      />

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="upload in uploads"
          :key="upload.id"
          class="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          @click="viewUpload(upload)"
        >
          <!-- Preview -->
          <div class="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <img
              v-if="upload.type === 'image'"
              :src="upload.url"
              :alt="upload.originalName"
              class="w-full h-full object-cover"
            />
            <div v-else-if="upload.type === 'video'" class="relative w-full h-full">
              <video :src="upload.url" class="w-full h-full object-cover" />
              <UIcon name="i-heroicons-play-circle" class="absolute inset-0 m-auto w-12 h-12 text-white opacity-75" />
            </div>
            <UIcon v-else name="i-heroicons-document" class="w-12 h-12 text-gray-400" />
          </div>

          <!-- Info -->
          <div class="p-2">
            <p class="text-xs font-medium truncate" :title="upload.originalName">
              {{ upload.originalName }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatSize(upload.size) }}
            </p>
          </div>

          <!-- Actions Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <UTooltip text="查看">
              <UButton
                icon="i-heroicons-eye"
                size="sm"
                color="info"
                @click.stop="viewUpload(upload)"
              />
            </UTooltip>
            <UTooltip text="刪除">
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="error"
                @click.stop="confirmDelete(upload)"
              />
            </UTooltip>
          </div>
        </div>
      </div>

      <!-- List View -->
      <UTable
        v-else
        :data="uploads"
        :columns="columns"
        :loading="isLoading"
      />

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          顯示 {{ (pagination.page - 1) * pagination.limit + 1 }} 到
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          筆，共 {{ pagination.total }} 筆
        </div>
        <UPagination
          v-model:page="pagination.page"
          :items-per-page="pagination.limit"
          :total="pagination.total"
          @update:page="fetchUploads"
        />
      </div>
    </UCard>

    <!-- Upload Modal -->
    <UModal v-model:open="isUploadModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">上傳檔案</h3>
          </template>

          <div class="space-y-4">
            <!-- File Type Selection -->
            <UFormField label="文件類型" required>
              <USelectMenu
                v-model="uploadForm.type"
                :items="uploadTypeOptions"
                placeholder="選擇文件類型"
              />
            </UFormField>

            <!-- File Input -->
            <UFormField label="選擇檔案" required>
              <input
                ref="fileInput"
                type="file"
                :accept="uploadForm.type?.value === 'image' ? 'image/*' : 'video/*'"
                :multiple="uploadForm.multiple"
                class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900 dark:file:text-blue-300"
                @change="handleFileSelect"
              />
            </UFormField>

            <!-- Multiple Files Toggle -->
            <UFormField>
              <UCheckbox
                v-model="uploadForm.multiple"
                label="允許多檔上傳"
              />
            </UFormField>

            <!-- Selected Files List -->
            <div v-if="uploadForm.files.length > 0" class="space-y-2">
              <p class="text-sm font-medium">已選擇 {{ uploadForm.files.length }} 個檔案：</p>
              <div class="max-h-40 overflow-y-auto space-y-1">
                <div
                  v-for="(file, index) in uploadForm.files"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <UIcon
                      :name="file.type.startsWith('image/') ? 'i-heroicons-photo' : 'i-heroicons-film'"
                      class="flex-shrink-0"
                    />
                    <span class="text-sm truncate">{{ file.name }}</span>
                    <span class="text-xs text-gray-500 flex-shrink-0">{{ formatSize(file.size) }}</span>
                  </div>
                  <UButton
                    icon="i-heroicons-x-mark"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click="removeFile(index)"
                  />
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="soft"
                @click="isUploadModalOpen = false"
              />
              <UButton
                label="上傳"
                :loading="isUploading"
                :disabled="uploadForm.files.length === 0"
                @click="submitUpload"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- View Modal -->
    <UModal v-model:open="isViewModalOpen" :ui="{ width: 'max-w-4xl' }">
      <template #content>
        <UCard v-if="viewingUpload">
          <template #header>
            <h3 class="text-lg font-semibold">文件詳情</h3>
          </template>

          <div class="space-y-4">
            <!-- Preview -->
            <div class="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <img
                v-if="viewingUpload.type === 'image'"
                :src="viewingUpload.url"
                :alt="viewingUpload.originalName"
                class="max-h-96 object-contain"
              />
              <video
                v-else-if="viewingUpload.type === 'video'"
                :src="viewingUpload.url"
                controls
                class="max-h-96"
              />
            </div>

            <!-- Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">檔案名稱</p>
                <p class="font-medium">{{ viewingUpload.originalName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">文件類型</p>
                <p class="font-medium">{{ viewingUpload.type }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">檔案大小</p>
                <p class="font-medium">{{ formatSize(viewingUpload.size) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">MIME 類型</p>
                <p class="font-medium text-xs">{{ viewingUpload.mimeType }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">上傳者</p>
                <p class="font-medium">{{ viewingUpload.userId }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">上傳時間</p>
                <p class="font-medium text-sm">{{ formatDateTime(viewingUpload.createdAt) }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-sm text-gray-500">URL</p>
                <div class="flex items-center gap-2">
                  <input
                    :value="viewingUpload.url"
                    readonly
                    class="flex-1 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                  />
                  <UButton
                    icon="i-heroicons-clipboard"
                    size="sm"
                    variant="ghost"
                    @click="copyUrl(viewingUpload.url)"
                  />
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <UButton
                label="刪除"
                color="error"
                variant="soft"
                @click="confirmDeleteFromView"
              />
              <UButton
                label="關閉"
                color="neutral"
                @click="isViewModalOpen = false"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">確認刪除</h3>
          </template>

          <p class="text-gray-600 dark:text-gray-400">
            確定要刪除檔案 <span class="font-semibold">{{ deletingUpload?.originalName }}</span> 嗎？
            此操作無法復原。
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="soft"
                @click="isDeleteModalOpen = false"
              />
              <UButton
                label="確認刪除"
                color="error"
                :loading="isDeleting"
                @click="deleteUpload"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from 'vue'
import { uploadApi, type Upload } from '@/api'
import EmptyState from '@/components/common/EmptyState.vue'
import SearchBox from '@/components/common/SearchBox.vue'

// Data
const uploads = ref<Upload[]>([])
const isLoading = ref(false)
const isUploading = ref(false)
const isDeleting = ref(false)

// Pagination
const pagination = ref({
  page: 1,
  limit: 24,
  total: 0,
  totalPages: 0,
})

// Stats
const stats = ref({
  totalFiles: 0,
  imageCount: 0,
  videoCount: 0,
  totalSize: 0,
})

// Filters
const searchQuery = ref('')
const selectedType = ref<{ label: string; value: string } | undefined>(undefined)

const typeOptions = [
  { label: '全部類型', value: '' },
  { label: '圖片', value: 'image' },
  { label: '影片', value: 'video' },
]

// View Mode
const viewMode = ref<'grid' | 'list'>('grid')

// Modals
const isUploadModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Current Upload
const viewingUpload = ref<Upload | null>(null)
const deletingUpload = ref<Upload | null>(null)

// Upload Form
const fileInput = ref<HTMLInputElement | null>(null)
const uploadForm = ref({
  type: undefined as { label: string; value: string } | undefined,
  multiple: false,
  files: [] as File[],
})

const uploadTypeOptions = [
  { label: '圖片', value: 'image' },
  { label: '影片', value: 'video' },
]

// Table Columns (for list view)
const columns = [
  {
    id: 'preview',
    header: '預覽',
    cell: ({ row }: any) => {
      const upload = row.original
      const UIcon = resolveComponent('UIcon')

      if (upload.type === 'image') {
        return h('img', {
          src: upload.url,
          alt: upload.originalName,
          class: 'w-12 h-12 object-cover rounded'
        })
      } else if (upload.type === 'video') {
        return h(UIcon, { name: 'i-heroicons-film', class: 'w-8 h-8 text-purple-500' })
      }
      return h(UIcon, { name: 'i-heroicons-document', class: 'w-8 h-8 text-gray-400' })
    }
  },
  {
    id: 'name',
    accessorKey: 'originalName',
    header: '檔案名稱',
  },
  {
    id: 'type',
    accessorKey: 'fileType',
    header: '類型',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      const type = row.original.type
      return h(UBadge, {
        color: type === 'image' ? 'green' : 'purple',
        variant: 'soft'
      }, () => type === 'image' ? '圖片' : '影片')
    }
  },
  {
    id: 'size',
    accessorKey: 'size',
    header: '大小',
    cell: ({ row }: any) => formatSize(row.original.size)
  },
  {
    id: 'downloads',
    accessorKey: 'downloadCount',
    header: '下載次數',
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }: any) => {
      const UButton = resolveComponent('UButton')
      const UTooltip = resolveComponent('UTooltip')

      return h('div', { class: 'flex items-center gap-2' }, [
        h(UTooltip, { text: '查看' }, () =>
          h(UButton, {
            icon: 'i-heroicons-eye',
            size: 'sm',
            color: 'info',
            variant: 'soft',
            onClick: () => viewUpload(row.original)
          })
        ),
        h(UTooltip, { text: '刪除' }, () =>
          h(UButton, {
            icon: 'i-heroicons-trash',
            size: 'sm',
            color: 'error',
            variant: 'soft',
            onClick: () => confirmDelete(row.original)
          })
        ),
      ])
    }
  },
]

// Methods
const fetchUploads = async () => {
  isLoading.value = true
  // getAll() doesn't take parameters, it returns all uploads
  const data: Upload[] = await uploadApi.getAll()
  uploads.value = Array.isArray(data) ? data : []

  pagination.value.total = uploads.value.length

  // Client-side filtering if needed
  let filteredUploads = [...uploads.value]

  if (searchQuery.value) {
    filteredUploads = filteredUploads.filter(u =>
      u.originalName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedType.value?.value) {
    filteredUploads = filteredUploads.filter(u => u.type === selectedType.value?.value)
  }

  // Apply pagination
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  uploads.value = filteredUploads.slice(start, end)
  pagination.value.total = filteredUploads.length

  // Fetch statistics
  await fetchStatistics()
  isLoading.value = false
}

const fetchStatistics = async () => {
  // getStatistics() doesn't take parameters
  const statsData = await uploadApi.getStatistics()
  stats.value = {
    totalFiles: statsData.totalFiles || uploads.value.length,
    imageCount: statsData.imageCount || uploads.value.filter(u => u.type === 'image').length,
    videoCount: statsData.videoCount || uploads.value.filter(u => u.type === 'video').length,
    totalSize: statsData.totalSize || uploads.value.reduce((sum, u) => sum + (u.size || 0), 0),
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchUploads()
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const openUploadModal = () => {
  uploadForm.value = {
    type: undefined,
    multiple: false,
    files: [],
  }
  isUploadModalOpen.value = true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    uploadForm.value.files = Array.from(target.files)
  }
}

const removeFile = (index: number) => {
  uploadForm.value.files.splice(index, 1)
}

const submitUpload = async () => {
  if (uploadForm.value.files.length === 0 || !uploadForm.value.type) {
    return
  }

  isUploading.value = true
  if (uploadForm.value.multiple && uploadForm.value.files.length > 1) {
    await uploadApi.uploadMultiple(uploadForm.value.files)
  } else {
    const file = uploadForm.value.files[0]
    if (!file) return

    if (uploadForm.value.type?.value === 'image') {
      await uploadApi.uploadImage(file)
    } else {
      await uploadApi.uploadVideo(file)
    }
  }

  isUploadModalOpen.value = false
  isUploading.value = false
  await fetchUploads()
}

const viewUpload = (upload: Upload) => {
  viewingUpload.value = upload
  isViewModalOpen.value = true
}

const confirmDelete = (upload: Upload) => {
  deletingUpload.value = upload
  isDeleteModalOpen.value = true
}

const confirmDeleteFromView = () => {
  if (viewingUpload.value) {
    deletingUpload.value = viewingUpload.value
    isViewModalOpen.value = false
    isDeleteModalOpen.value = true
  }
}

const deleteUpload = async () => {
  if (!deletingUpload.value) return

  isDeleting.value = true
  await uploadApi.delete(deletingUpload.value.id)
  isDeleteModalOpen.value = false
  isDeleting.value = false
  await fetchUploads()
}

const copyUrl = (url: string) => {
  navigator.clipboard.writeText(url)
  // TODO: Show success toast
}

// Helper Functions
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  fetchUploads()
})
</script>
