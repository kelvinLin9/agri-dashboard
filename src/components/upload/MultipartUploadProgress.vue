<script setup lang="ts">
import { computed } from 'vue'
import type { PartInfo, PartStatus, UploadStatus } from '@/composables/useMultipartUpload'

interface Props {
  status: UploadStatus
  overallProgress: number
  parts: PartInfo[]
  completedParts: number
  failedParts: number
  fileName: string
  fileSize: number
  isPaused: boolean
  canPause: boolean
  canResume: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  pause: []
  resume: []
  cancel: []
  retry: []
}>()

/**
 * 格式化檔案大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/**
 * 狀態文字
 */
const statusText = computed(() => {
  switch (props.status) {
    case 'idle':
      return '準備就緒'
    case 'initializing':
      return '初始化中...'
    case 'uploading':
      return props.isPaused ? '已暫停' : '上傳中...'
    case 'completing':
      return '合併檔案中...'
    case 'completed':
      return '上傳完成'
    case 'failed':
      return '上傳失敗'
    case 'cancelled':
      return '已取消'
    default:
      return ''
  }
})

/**
 * 狀態顏色
 */
const statusColor = computed(() => {
  switch (props.status) {
    case 'completed':
      return 'success'
    case 'failed':
      return 'error'
    case 'cancelled':
      return 'neutral'
    default:
      return 'primary'
  }
})

/**
 * Part 狀態顏色
 */
function getPartColor(status: PartStatus): string {
  switch (status) {
    case 'completed':
      return 'var(--color-success-500)'
    case 'uploading':
      return 'var(--color-primary-500)'
    case 'failed':
      return 'var(--color-error-500)'
    default:
      return 'var(--color-neutral-300)'
  }
}
</script>

<template>
  <div class="multipart-upload-progress">
    <!-- 檔案資訊 -->
    <div class="file-info">
      <div class="file-icon">
        <UIcon name="i-heroicons-film" class="icon" />
      </div>
      <div class="file-details">
        <span class="file-name">{{ fileName }}</span>
        <span class="file-size">{{ formatSize(fileSize) }}</span>
      </div>
    </div>

    <!-- 整體進度 -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="status-text" :class="statusColor">{{ statusText }}</span>
        <span class="progress-percent">{{ overallProgress }}%</span>
      </div>

      <UProgress
        :model-value="overallProgress"
        :color="statusColor"
        :indicator="status === 'uploading'"
      />

      <div class="progress-details">
        <span>{{ completedParts }} / {{ parts.length }} 分片</span>
        <span v-if="failedParts > 0" class="failed-count">
          {{ failedParts }} 個失敗
        </span>
      </div>
    </div>

    <!-- 分片狀態指示 -->
    <div v-if="parts.length > 0 && parts.length <= 50" class="parts-indicator">
      <div
        v-for="part in parts"
        :key="part.partNumber"
        class="part-dot"
        :style="{ backgroundColor: getPartColor(part.status) }"
        :title="`Part ${part.partNumber}: ${part.status}`"
      />
    </div>

    <!-- 控制按鈕 -->
    <div class="controls">
      <!-- 暫停/繼續 -->
      <UButton
        v-if="canPause"
        variant="outline"
        color="neutral"
        icon="i-heroicons-pause"
        @click="emit('pause')"
      >
        暫停
      </UButton>

      <UButton
        v-if="canResume"
        variant="outline"
        color="primary"
        icon="i-heroicons-play"
        @click="emit('resume')"
      >
        繼續
      </UButton>

      <!-- 重試 -->
      <UButton
        v-if="failedParts > 0"
        variant="outline"
        color="warning"
        icon="i-heroicons-arrow-path"
        @click="emit('retry')"
      >
        重試失敗
      </UButton>

      <!-- 取消 -->
      <UButton
        v-if="status === 'uploading' || status === 'initializing'"
        variant="ghost"
        color="error"
        icon="i-heroicons-x-mark"
        @click="emit('cancel')"
      >
        取消
      </UButton>
    </div>

    <!-- 錯誤詳情 -->
    <div v-if="status === 'failed'" class="error-section">
      <UAlert
        color="error"
        icon="i-heroicons-exclamation-triangle"
        title="上傳失敗"
        description="部分分片上傳失敗，請檢查網絡連接後重試。"
      />
    </div>
  </div>
</template>

<style scoped>
.multipart-upload-progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.file-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-50);
  border-radius: var(--radius-md);
}

.file-icon .icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary-500);
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-all;
}

.file-size {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-text {
  font-weight: 500;
}

.status-text.success {
  color: var(--color-success-600);
}

.status-text.error {
  color: var(--color-error-600);
}

.status-text.primary {
  color: var(--color-primary-600);
}

.progress-percent {
  font-weight: 600;
  color: var(--color-text-primary);
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.failed-count {
  color: var(--color-error-600);
}

.parts-indicator {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.part-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.controls {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.error-section {
  margin-top: var(--spacing-2);
}
</style>
