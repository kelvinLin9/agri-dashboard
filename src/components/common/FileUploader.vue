<template>
  <div
    class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
    :class="isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <UIcon
      name="i-heroicons-cloud-arrow-up"
      class="w-12 h-12 mx-auto mb-4"
      :class="isDragging ? 'text-blue-500' : 'text-gray-400'"
    />
    
    <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {{ isDragging ? '放開以上傳' : '拖曳檔案到這裡' }}
    </p>
    
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      或
    </p>
    
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="handleFileSelect"
    />
    
    <UButton
      label="選擇檔案"
      icon="i-heroicons-folder-open"
      @click="fileInput?.click()"
    />
    
    <div v-if="files.length > 0" class="mt-6 space-y-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <UIcon
            :name="getFileIcon(file.type)"
            class="flex-shrink-0 text-gray-500"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ file.name }}</p>
            <p class="text-xs text-gray-500">{{ formatSize(file.size) }}</p>
          </div>
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
    
    <div v-if="uploading" class="mt-4">
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        上傳中... {{ progress }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  accept?: string
  multiple?: boolean
  uploading?: boolean
  progress?: number
}

withDefaults(defineProps<Props>(), {
  accept: '*/*',
  multiple: false,
  uploading: false,
  progress: 0,
})

const emit = defineEmits<{
  'files-selected': [files: File[]]
  'files-removed': [index: number]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const isDragging = ref(false)

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    addFiles(Array.from(e.dataTransfer.files))
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const addFiles = (newFiles: File[]) => {
  files.value = [...files.value, ...newFiles]
  emit('files-selected', files.value)
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
  emit('files-removed', index)
}

const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return 'i-heroicons-photo'
  if (type.startsWith('video/')) return 'i-heroicons-film'
  if (type.includes('pdf')) return 'i-heroicons-document-text'
  return 'i-heroicons-document'
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>
