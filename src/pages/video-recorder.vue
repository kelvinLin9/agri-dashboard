<template>
  <div class="flex min-h-screen flex-col bg-gray-900">
    <!-- Top Bar -->
    <div class="border-b border-gray-800 bg-gray-950 px-4 py-3">
      <div class="mx-auto flex max-w-6xl items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-video-camera" class="h-6 w-6 text-harvest-500" />
          <h1 class="text-lg font-semibold text-white">影片錄製</h1>
        </div>
        <div class="flex items-center gap-2">
          <UBadge :color="isRecording ? 'red' : 'gray'" variant="subtle">
            {{ isRecording ? '錄製中' : (recordedBlob ? '已完成' : '準備就緒') }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col items-center justify-center p-4">
      <!-- Video Preview Area -->
      <div class="relative w-full max-w-4xl overflow-hidden rounded-lg bg-black shadow-2xl" style="aspect-ratio: 16/9;">
        <!-- Video Element -->
        <video
          ref="videoElement"
          autoplay
          playsinline
          muted
          class="h-full w-full object-cover"
          :class="{ 'scale-x-[-1]': settings.facingMode === 'user' }"
        ></video>

        <!-- Grid Overlay -->
        <div v-if="!recordedBlob" class="pointer-events-none absolute inset-0 opacity-30">
          <div class="absolute top-0 left-1/3 h-full w-px border-l border-dashed border-white"></div>
          <div class="absolute top-0 left-2/3 h-full w-px border-l border-dashed border-white"></div>
          <div class="absolute top-1/3 left-0 h-px w-full border-t border-dashed border-white"></div>
          <div class="absolute top-2/3 left-0 h-px w-full border-t border-dashed border-white"></div>
        </div>

        <!-- Recording Indicator -->
        <div v-if="isRecording" class="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 shadow-lg">
          <div class="h-3 w-3 animate-pulse rounded-full bg-white"></div>
          <span class="text-sm font-semibold text-white">{{ isPaused ? '已暫停' : 'REC' }}</span>
        </div>

        <!-- Timer, File Size & Remaining Time -->
        <div v-if="isRecording || recordedBlob" class="absolute top-4 left-4 flex flex-col gap-2">
          <div class="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur">
            <UIcon name="i-heroicons-clock" class="h-4 w-4 text-white" />
            <span class="text-sm font-mono text-white">{{ formattedTime }}</span>
            <span v-if="remainingTime !== null && isRecording" class="text-xs text-gray-400">
              / {{ formatRemainingTime(remainingTime) }}
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur">
            <UIcon name="i-heroicons-server-stack" class="h-4 w-4 text-white" />
            <span class="text-sm font-mono text-white">{{ formattedFileSize }}</span>
          </div>
        </div>

        <!-- Audio Level Meter (VU Meter) -->
        <div v-if="(isRecording || isInitialized) && !recordedBlob" class="absolute bottom-4 left-4 right-4">
          <div class="rounded-lg bg-black/60 px-3 py-2 backdrop-blur">
            <div class="mb-1 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isMuted ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-speaker-wave'"
                  class="h-4 w-4 text-white"
                />
                <span class="text-xs font-medium text-white">音量</span>
              </div>
              <span class="text-xs font-mono text-gray-400">{{ audioLevel }}%</span>
            </div>
            <!-- VU Meter Bar -->
            <div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                class="h-full transition-all duration-100"
                :class="[
                  audioLevel > 80 ? 'bg-red-500' :
                  audioLevel > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                ]"
                :style="{ width: `${audioLevel}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="absolute inset-x-4 bottom-4">
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="red"
            variant="solid"
            :title="error"
            :close-button="{ icon: 'i-heroicons-x-mark', color: 'white', variant: 'link' }"
            @close="error = null"
          />
        </div>

        <!-- Playback controls for recorded video -->
        <div v-if="recordedBlob && !isUploading && recordedBlobUrl" class="absolute inset-0 flex items-center justify-center">
          <video
            :src="recordedBlobUrl"
            controls
            class="h-full w-full object-contain"
          ></video>
        </div>
      </div>

      <!-- Controls Area -->
      <div class="mt-6 w-full max-w-4xl space-y-4">
        <!-- Settings Panel (before recording) -->
        <div v-if="!recordedBlob && !isRecording" class="space-y-3">
          <UCard>
            <template #header>
              <h3 class="text-sm font-semibold text-gray-300">錄製設定</h3>
            </template>

            <div class="grid grid-cols-2 gap-4">
              <!-- Quality -->
              <UFormGroup label="影片品質">
                <USelect
                  v-model="selectedQuality"
                  :options="qualityOptions"
                  size="sm"
                  @update:model-value="handleQualityChange"
                />
              </UFormGroup>

              <!-- Max Duration -->
              <UFormGroup label="最大錄製時間">
                <USelect
                  v-model="maxDuration"
                  :options="durationOptions"
                  size="sm"
                  @update:model-value="handleMaxDurationChange"
                />
              </UFormGroup>
            </div>
          </UCard>
        </div>

        <!-- Recording Controls -->
        <div v-if="!recordedBlob" class="flex items-center justify-center gap-4">
          <!-- Camera Switch -->
          <UButton
            icon="i-heroicons-arrows-right-left"
            color="gray"
            variant="soft"
            :disabled="isRecording"
            @click="handleSwitchCamera"
          />

          <!-- Record Button -->
          <UButton
            :icon="isRecording ? undefined : 'i-heroicons-video-camera'"
            :color="isRecording ? 'red' : 'primary'"
            size="xl"
            class="h-16 w-16 rounded-full"
            @click="toggleRecording"
          >
            <div v-if="isRecording" class="h-6 w-6 rounded bg-white"></div>
          </UButton>

          <!-- Pause/Resume -->
          <UButton
            v-if="isRecording"
            :icon="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'"
            color="orange"
            variant="soft"
            @click="togglePause"
          />
        </div>

        <!-- Upload Controls -->
        <div v-else-if="!uploadedFile" class="space-y-4">
          <!-- Metadata Form -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">影片資訊</h3>
            </template>

            <div class="space-y-4">
              <UFormGroup label="標題">
                <UInput v-model="metadata.title" placeholder="輸入影片標題..." />
              </UFormGroup>

              <UFormGroup label="描述">
                <UTextarea v-model="metadata.description" placeholder="輸入影片描述..." :rows="3" />
              </UFormGroup>
            </div>
          </UCard>

          <!-- Upload Progress -->
          <div v-if="isUploading" class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">上傳中...</span>
              <span class="font-semibold text-white">{{ uploadProgress }}%</span>
            </div>
            <UProgress :value="uploadProgress" color="primary" />
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-center gap-3">
            <UButton
              icon="i-heroicons-cloud-arrow-up"
              color="primary"
              size="lg"
              :loading="isUploading"
              :disabled="isUploading"
              @click="handleUpload"
            >
              上傳影片
            </UButton>

            <UButton
              icon="i-heroicons-arrow-path"
              color="gray"
              variant="soft"
              size="lg"
              :disabled="isUploading"
              @click="handleRetake"
            >
              重新錄製
            </UButton>

            <UButton
              icon="i-heroicons-arrow-down-tray"
              color="gray"
              variant="ghost"
              size="lg"
              :disabled="isUploading"
              @click="handleDownload"
            >
              下載
            </UButton>
          </div>
        </div>

        <!-- Upload Success -->
        <div v-else class="space-y-4">
          <UAlert
            icon="i-heroicons-check-circle"
            color="green"
            variant="subtle"
            title="上傳成功！"
            description="影片已成功上傳到伺服器"
          />

          <UCard>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-video-camera" class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-300">{{ metadata.title || '未命名影片' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-300">時長: {{ formattedTime }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-server-stack" class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-300">大小: {{ formattedFileSize }}</span>
              </div>
            </div>
          </UCard>

          <div class="flex items-center justify-center gap-3">
            <UButton
              icon="i-heroicons-link"
              color="gray"
              variant="soft"
              @click="copyLink"
            >
              複製連結
            </UButton>

            <UButton
              icon="i-heroicons-plus-circle"
              color="primary"
              @click="handleRetake"
            >
              繼續錄製
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useVideoRecorder } from '@/composables/useVideoRecorder'
import { useVideoUpload } from '@/composables/useVideoUpload'
import { useAudioLevel } from '@/composables/useAudioLevel'
import { VideoQuality } from '@/types/video'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// ==================== Video Recorder ====================
const videoElement = ref<HTMLVideoElement | null>(null)
const {
  isRecording,
  isPaused,
  isInitialized,
  recordedBlob,
  error,
  settings,
  stream,
  formattedTime,
  formattedFileSize,
  remainingTime,
  initCamera,
  toggleRecording,
  pauseRecording,
  resumeRecording,
  clearRecording,
  switchCamera: switchCameraFn,
  setQuality,
  setMaxDuration,
} = useVideoRecorder({
  quality: VideoQuality.MEDIUM,
  facingMode: 'environment',
  audioEnabled: true,
  maxDuration: 300, // 5分鐘預設
})

// ==================== Audio Level ====================
const {
  audioLevel,
  isMuted,
  initAudioAnalyser,
  stopAnalysis,
} = useAudioLevel(stream)

// Watch for stream initialization
watch(stream, (newStream) => {
  if (newStream) {
    initAudioAnalyser()
  } else {
    stopAnalysis()
  }
})

// ==================== Video Upload ====================
const {
  isUploading,
  uploadProgress,
  uploadedFile,
  uploadError,
  uploadVideo,
  clearUpload,
} = useVideoUpload()

// ==================== State ====================
const metadata = ref({
  title: '',
  description: '',
  tags: [] as string[],
})

const selectedQuality = ref(VideoQuality.MEDIUM)
const qualityOptions = [
  { label: '高畫質 (1080p)', value: VideoQuality.HIGH },
  { label: '標準畫質 (720p)', value: VideoQuality.MEDIUM },
  { label: '低畫質 (480p)', value: VideoQuality.LOW },
]

const maxDuration = ref(300) // 5 minutes
const durationOptions = [
  { label: '無限制', value: 0 },
  { label: '1 分鐘', value: 60 },
  { label: '3 分鐘', value: 180 },
  { label: '5 分鐘', value: 300 },
  { label: '10 分鐘', value: 600 },
  { label: '15 分鐘', value: 900 },
]

// ==================== Computed ====================
const recordedBlobUrl = computed(() => {
  if (!recordedBlob.value) return null
  return URL.createObjectURL(recordedBlob.value)
})

// ==================== Methods ====================
function formatRemainingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

async function handleUpload() {
  if (!recordedBlob.value) {
    toast.add({
      title: '錯誤',
      description: '沒有可上傳的影片',
      color: 'error',
    })
    return
  }

  const result = await uploadVideo(recordedBlob.value, metadata.value)

  if (result) {
    toast.add({
      title: '上傳成功',
      description: '影片已成功上傳',
      color: 'success',
    })
  } else if (uploadError.value) {
    toast.add({
      title: '上傳失敗',
      description: uploadError.value,
      color: 'error',
    })
  }
}

function handleRetake() {
  clearRecording()
  clearUpload()
  metadata.value = {
    title: '',
    description: '',
    tags: [],
  }

  // Revoke old blob URL
  if (recordedBlobUrl.value) {
    URL.revokeObjectURL(recordedBlobUrl.value)
  }
}

function handleDownload() {
  if (!recordedBlob.value) return

  const url = recordedBlobUrl.value
  if (!url) return

  const a = document.createElement('a')
  a.href = url
  a.download = `${metadata.value.title || 'video'}-${new Date().toISOString().slice(0, 10)}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  toast.add({
    title: '下載開始',
    description: '影片下載已開始',
    color: 'success',
  })
}

function togglePause() {
  if (isPaused.value) {
    resumeRecording()
  } else {
    pauseRecording()
  }
}

function handleQualityChange(value: any) {
  if (!value || typeof value !== 'string') return
  if (!Object.values(VideoQuality).includes(value as VideoQuality)) return

  if (setQuality(value as VideoQuality)) {
    toast.add({
      title: '品質已變更',
      description: `影片品質設為 ${value}`,
      color: 'success',
    })
  }
}

function handleMaxDurationChange(value: any) {
  if (value === undefined || value === null) return
  const numValue = typeof value === 'number' ? value : Number(value)
  if (isNaN(numValue)) return

  setMaxDuration(numValue)
  const label = durationOptions.find(opt => opt.value === numValue)?.label || '自訂'
  toast.add({
    title: '時間限制已變更',
    description: `最大錄製時間設為 ${label}`,
    color: 'success',
  })
}

async function handleSwitchCamera() {
  await switchCameraFn()
}

async function copyLink() {
  if (!uploadedFile.value?.url) return

  try {
    await navigator.clipboard.writeText(uploadedFile.value.url)
    toast.add({
      title: '已複製',
      description: '影片連結已複製到剪貼簿',
      color: 'success',
    })
  } catch {
    toast.add({
      title: '複製失敗',
      description: '無法複製到剪貼簿',
      color: 'error',
    })
  }
}

// ==================== Lifecycle ====================
onMounted(async () => {
  if (videoElement.value) {
    await initCamera(videoElement.value)
  }
})

// Auto-generate title based on timestamp
watch(recordedBlob, (blob) => {
  if (blob && !metadata.value.title) {
    const timestamp = new Date().toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    metadata.value.title = `影片錄製 ${timestamp}`
  }
})
</script>

<style scoped>
/* Smooth animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
