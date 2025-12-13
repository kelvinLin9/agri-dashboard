<template>
  <div class="flex flex-col bg-gray-100 dark:bg-gray-900">
    <!-- Top Bar -->
    <div class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
      <div class="mx-auto flex max-w-6xl items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-video-camera" class="h-6 w-6 text-harvest-500" />
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">影片錄製</h1>
        </div>
        <div class="flex items-center gap-2">
          <UBadge :color="isRecording ? 'red' : 'gray'" variant="subtle">
            {{ isRecording ? '錄製中' : (recordedBlob ? '已完成' : '準備就緒') }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col items-center p-2 sm:p-4 pb-8">
      <!-- Video Preview Area -->
      <div
        ref="videoContainerRef"
        class="relative w-full max-w-sm lg:max-w-4xl overflow-hidden rounded-lg bg-black shadow-2xl aspect-[9/16] lg:aspect-video"
        :class="{ 'max-w-none !aspect-auto h-screen': isFullscreen }"
      >
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

        <!-- Recording Indicator (top right) -->
        <div v-if="isRecording" class="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-2 rounded-full bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg">
          <div class="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse rounded-full bg-white"></div>
          <span class="text-xs sm:text-sm font-semibold text-white">{{ isPaused ? '已暫停' : 'REC' }}</span>
        </div>

        <!-- Timer & File Size (top left) -->
        <div v-if="isRecording || recordedBlob" class="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
          <div class="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-black/60 px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur">
            <UIcon name="i-heroicons-clock" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            <span class="text-xs sm:text-sm font-mono text-white">{{ formattedTime }}</span>
            <span v-if="remainingTime !== null && isRecording" class="text-[10px] sm:text-xs text-gray-400">
              / {{ formatRemainingTime(remainingTime) }}
            </span>
          </div>
          <div class="hidden sm:flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur">
            <UIcon name="i-heroicons-server-stack" class="h-4 w-4 text-white" />
            <span class="text-sm font-mono text-white">{{ formattedFileSize }}</span>
          </div>
        </div>

        <!-- Audio Level Meter (bottom, wider on desktop) -->
        <div v-if="(isRecording || isInitialized) && !recordedBlob" class="absolute bottom-16 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 lg:bottom-4">
          <div class="rounded-lg bg-black/60 px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur">
            <div class="mb-1 flex items-center justify-between">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <UIcon
                  :name="isMuted ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-speaker-wave'"
                  class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white"
                />
                <span class="text-[10px] sm:text-xs font-medium text-white">音量</span>
              </div>
              <span class="text-[10px] sm:text-xs font-mono text-gray-400">{{ audioLevel }}%</span>
            </div>
            <div class="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-gray-700">
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

        <!-- ====== MOBILE/TABLET: Overlay Controls (inside video) ====== -->
        <div v-if="!recordedBlob" class="lg:hidden absolute bottom-2 left-0 right-0 flex justify-center">
          <div class="flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 backdrop-blur-md">
            <!-- Settings Dropdown (left) -->
            <UPopover v-if="!isRecording" mode="click">
              <UButton
                icon="i-heroicons-cog-6-tooth"
                color="neutral"
                variant="ghost"
                size="lg"
                class="!text-white"
              />
              <template #content>
                <div class="p-4 space-y-4 min-w-[200px]">
                  <UFormField label="影片品質" size="sm">
                    <USelectMenu
                      v-model="selectedQuality"
                      :items="qualityOptions"
                      size="sm"
                      value-key="value"
                      class="w-full"
                      @update:model-value="handleQualityChange"
                    />
                  </UFormField>
                  <UFormField label="最大時間" size="sm">
                    <USelectMenu
                      v-model="maxDuration"
                      :items="durationOptions"
                      size="sm"
                      value-key="value"
                      class="w-full"
                      @update:model-value="handleMaxDurationChange"
                    />
                  </UFormField>
                </div>
              </template>
            </UPopover>

            <!-- Pause/Resume (left side during recording) -->
            <UButton
              v-if="isRecording"
              :icon="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'"
              color="neutral"
              variant="ghost"
              size="lg"
              class="!text-white"
              @click="togglePause"
            />

            <!-- Record / Stop Button (CENTER) -->
            <button
              class="h-12 w-12 rounded-full flex items-center justify-center transition-all active:scale-95"
              :class="isRecording ? 'bg-red-600 ring-4 ring-red-400/50' : 'bg-white ring-4 ring-white/30'"
              @click="toggleRecording"
            >
              <div v-if="isRecording" class="h-4 w-4 rounded-sm bg-white"></div>
              <UIcon v-else name="i-heroicons-video-camera" class="h-6 w-6 text-gray-900" />
            </button>

            <!-- Camera Switch (right) -->
            <UButton
              icon="i-heroicons-arrows-right-left"
              color="neutral"
              variant="ghost"
              size="lg"
              class="!text-white"
              :disabled="isRecording"
              @click="handleSwitchCamera"
            />

            <!-- Fullscreen Toggle -->
            <UButton
              :icon="isFullscreen ? 'i-heroicons-arrows-pointing-in' : 'i-heroicons-arrows-pointing-out'"
              color="neutral"
              variant="ghost"
              size="lg"
              class="!text-white"
              @click="toggleFullscreen"
            />
          </div>
        </div>

        <!-- Error Message (TOP) -->
        <div v-if="error" class="absolute inset-x-2 sm:inset-x-4 top-2 sm:top-4 z-10">
          <UAlert
            icon="i-heroicons-exclamation-triangle"
            color="error"
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

      <!-- ====== DESKTOP: External Control Panel ====== -->
      <div class="hidden lg:block mt-6 w-full max-w-4xl">
        <div v-if="!recordedBlob">
          <UCard>
            <div class="flex items-center gap-6">
              <!-- Left: Settings (only shown when not recording) -->
              <div v-if="!isRecording" class="flex-1">
                <div class="grid grid-cols-2 gap-4">
                  <UFormField label="影片品質" size="sm">
                    <USelectMenu
                      v-model="selectedQuality"
                      :items="qualityOptions"
                      size="sm"
                      value-key="value"
                      class="w-full"
                      @update:model-value="handleQualityChange"
                    />
                  </UFormField>
                  <UFormField label="最大時間" size="sm">
                    <USelectMenu
                      v-model="maxDuration"
                      :items="durationOptions"
                      size="sm"
                      value-key="value"
                      class="w-full"
                      @update:model-value="handleMaxDurationChange"
                    />
                  </UFormField>
                </div>
              </div>

              <!-- Recording status (shown when recording) -->
              <div v-else class="flex-1 flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full animate-pulse" :class="isPaused ? 'bg-yellow-500' : 'bg-red-500'"></div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ isPaused ? '已暫停' : '錄製中' }}
                  </span>
                </div>
                <div class="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                  {{ formattedTime }}
                </div>
                <div v-if="remainingTime !== null" class="text-sm text-gray-500 dark:text-gray-400">
                  剩餘 {{ formatRemainingTime(remainingTime) }}
                </div>
              </div>

              <!-- Right: Action Buttons -->
              <div class="flex items-center gap-3">
                <!-- Camera Switch -->
                <UButton
                  icon="i-heroicons-arrows-right-left"
                  color="neutral"
                  variant="soft"
                  size="lg"
                  :disabled="isRecording"
                  @click="handleSwitchCamera"
                />

                <!-- Pause/Resume (only during recording) -->
                <UButton
                  v-if="isRecording"
                  :icon="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'"
                  color="warning"
                  variant="soft"
                  size="lg"
                  @click="togglePause"
                />

                <!-- Record / Stop Button -->
                <UButton
                  :icon="isRecording ? 'i-heroicons-stop' : 'i-heroicons-video-camera'"
                  :color="isRecording ? 'error' : 'primary'"
                  size="xl"
                  class="!rounded-full !p-4"
                  @click="toggleRecording"
                />
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Upload Controls (shown after recording, on all devices) -->
      <div class="mt-4 w-full max-w-4xl" v-if="recordedBlob && !uploadedFile">
        <!-- Metadata Form -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">影片資訊</h3>
          </template>

          <div class="space-y-4">
            <UFormField label="標題">
              <UInput v-model="metadata.title" placeholder="輸入影片標題..." />
            </UFormField>

            <UFormField label="描述">
              <UTextarea v-model="metadata.description" placeholder="輸入影片描述..." :rows="3" />
            </UFormField>
          </div>
        </UCard>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="mt-4 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">上傳中...</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ uploadProgress }}%</span>
          </div>
          <UProgress :value="uploadProgress" color="primary" />
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
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
            color="neutral"
            variant="soft"
            size="lg"
            :disabled="isUploading"
            @click="handleRetake"
          >
            重新錄製
          </UButton>

          <UButton
            icon="i-heroicons-arrow-down-tray"
            color="neutral"
            variant="ghost"
            size="lg"
            :disabled="isUploading"
            @click="handleDownload"
          >
            下載
          </UButton>
        </div>
      </div>

      <!-- Upload Success (shown after successful upload, on all devices) -->
      <div class="mt-4 w-full max-w-4xl space-y-4" v-if="uploadedFile">
        <UAlert
          icon="i-heroicons-check-circle"
          color="success"
          variant="subtle"
          title="上傳成功！"
          description="影片已成功上傳到伺服器"
        />

        <UCard>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-video-camera" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ metadata.title || '未命名影片' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span class="text-sm text-gray-700 dark:text-gray-300">時長: {{ formattedTime }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-server-stack" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span class="text-sm text-gray-700 dark:text-gray-300">大小: {{ formattedFileSize }}</span>
            </div>
          </div>
        </UCard>

        <div class="flex items-center justify-center gap-3">
          <UButton
            icon="i-heroicons-link"
            color="neutral"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useVideoRecorder } from '@/composables/useVideoRecorder'
import { useVideoUpload } from '@/composables/useVideoUpload'
import { useAudioLevel } from '@/composables/useAudioLevel'
import { VideoQuality } from '@/types/video'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// ==================== Fullscreen ====================
const videoContainerRef = ref<HTMLDivElement | null>(null)
const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!videoContainerRef.value) return

  if (!document.fullscreenElement) {
    videoContainerRef.value.requestFullscreen().catch((err) => {
      toast.add({
        title: '無法進入全螢幕',
        description: err.message,
        color: 'error',
      })
    })
  } else {
    document.exitFullscreen()
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

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
  // Add fullscreen event listener
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  if (videoElement.value) {
    await initCamera(videoElement.value)
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
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
