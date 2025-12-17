<template>
  <div class="video-recorder-page">
    <!-- Top Bar -->
    <div class="video-recorder-page__header">
      <div class="video-recorder-page__header-content">
        <div class="video-recorder-page__title">
          <UIcon name="i-heroicons-video-camera" class="video-recorder-page__title-icon" />
          <h1 class="video-recorder-page__title-text">影片錄製</h1>
        </div>
        <UBadge :color="recordedBlob ? 'success' : 'neutral'" variant="subtle">
          {{ recordedBlob ? '已完成' : '準備就緒' }}
        </UBadge>
      </div>
    </div>

    <!-- Main Content -->
    <div class="video-recorder-page__content">
      <!-- Start Recording Card -->
      <div v-if="!recordedBlob && !uploadedFile" class="video-recorder-page__start-section">
        <UCard class="video-recorder-page__start-card">
          <div class="video-recorder-page__start-content">
            <div class="video-recorder-page__start-icon">
              <UIcon name="i-heroicons-video-camera" class="video-recorder-page__start-icon-svg" />
            </div>
            <h2 class="video-recorder-page__start-title">開始錄影</h2>
            <p class="video-recorder-page__start-desc">點擊下方按鈕開始全螢幕錄影</p>

            <!-- Settings -->
            <div class="video-recorder-page__settings">
              <UFormField label="錄製方向">
                <USelectMenu
                  v-model="selectedOrientation"
                  :items="orientationOptions"
                  value-key="value"
                  class="video-recorder-page__select"
                />
              </UFormField>
              <UFormField label="影片品質">
                <USelectMenu
                  v-model="selectedQuality"
                  :items="qualityOptions"
                  value-key="value"
                  class="video-recorder-page__select"
                />
              </UFormField>
              <UFormField label="最大時間">
                <USelectMenu
                  v-model="selectedMaxDuration"
                  :items="durationOptions"
                  value-key="value"
                  class="video-recorder-page__select"
                />
              </UFormField>
            </div>

            <UButton
              icon="i-heroicons-video-camera"
              color="primary"
              size="xl"
              class="video-recorder-page__start-btn"
              @click="startRecording"
            >
              開始錄製
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Preview Section (after recording) -->
      <div v-if="recordedBlob && !uploadedFile" class="video-recorder-page__preview-section">
        <UCard>
          <template #header>
            <h3 class="video-recorder-page__section-title">影片預覽</h3>
          </template>

          <!-- Video Preview -->
          <div class="video-recorder-page__video-container">
            <video
              v-if="recordedBlobUrl"
              :src="recordedBlobUrl"
              controls
              class="video-recorder-page__video"
            />
          </div>

          <!-- Recording Info -->
          <div class="video-recorder-page__info">
            <div class="video-recorder-page__info-item">
              <UIcon name="i-heroicons-clock" class="video-recorder-page__info-icon" />
              <span>時長: {{ formattedDuration }}</span>
            </div>
            <div class="video-recorder-page__info-item">
              <UIcon name="i-heroicons-server-stack" class="video-recorder-page__info-icon" />
              <span>大小: {{ formattedFileSize }}</span>
            </div>
          </div>
        </UCard>

        <!-- Metadata Form -->
        <UCard class="video-recorder-page__metadata-card">
          <template #header>
            <h3 class="video-recorder-page__section-title">影片資訊</h3>
          </template>

          <div class="video-recorder-page__form">
            <UFormField label="標題">
              <UInput v-model="metadata.title" placeholder="輸入影片標題..." />
            </UFormField>
            <UFormField label="描述">
              <UTextarea v-model="metadata.description" placeholder="輸入影片描述..." :rows="3" />
            </UFormField>
          </div>
        </UCard>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="video-recorder-page__progress">
          <div class="video-recorder-page__progress-header">
            <span>上傳中...</span>
            <span class="video-recorder-page__progress-percent">{{ uploadProgress }}%</span>
          </div>
          <UProgress :value="uploadProgress" color="primary" />
        </div>

        <!-- Action Buttons -->
        <div class="video-recorder-page__actions">
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

      <!-- Upload Success Section -->
      <div v-if="uploadedFile" class="video-recorder-page__success-section">
        <UAlert
          icon="i-heroicons-check-circle"
          color="success"
          variant="subtle"
          title="上傳成功！"
          description="影片已成功上傳到伺服器"
        />

        <UCard class="video-recorder-page__success-card">
          <div class="video-recorder-page__success-info">
            <div class="video-recorder-page__info-item">
              <UIcon name="i-heroicons-video-camera" class="video-recorder-page__info-icon" />
              <span>{{ metadata.title || '未命名影片' }}</span>
            </div>
            <div class="video-recorder-page__info-item">
              <UIcon name="i-heroicons-clock" class="video-recorder-page__info-icon" />
              <span>時長: {{ formattedDuration }}</span>
            </div>
            <div class="video-recorder-page__info-item">
              <UIcon name="i-heroicons-server-stack" class="video-recorder-page__info-icon" />
              <span>大小: {{ formattedFileSize }}</span>
            </div>
          </div>
        </UCard>

        <div class="video-recorder-page__success-actions">
          <UButton icon="i-heroicons-link" color="neutral" variant="soft" @click="copyLink">
            複製連結
          </UButton>
          <UButton icon="i-heroicons-plus-circle" color="primary" @click="handleRetake">
            繼續錄製
          </UButton>
        </div>
      </div>
    </div>

    <!-- Video Recorder Component -->
    <VideoRecorder
      ref="recorderRef"
      :orientation="selectedOrientation"
      :quality="selectedQuality"
      :max-duration="selectedMaxDuration"
      :show-grid="true"
      :show-countdown="true"
      instruction="請對準拍攝對象開始錄製"
      @recorded="handleRecorded"
      @cancelled="handleCancelled"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VideoRecorder from '@/components/video/VideoRecorder.vue'
import { useVideoUpload } from '@/composables/useVideoUpload'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// ==================== Recorder Ref ====================
const recorderRef = ref<InstanceType<typeof VideoRecorder>>()

// ==================== Recording State ====================
const recordedBlob = ref<Blob | null>(null)
const recordedDuration = ref(0)

const recordedBlobUrl = computed(() => {
  if (!recordedBlob.value) return null
  return URL.createObjectURL(recordedBlob.value)
})

const formattedDuration = computed(() => {
  const mins = Math.floor(recordedDuration.value / 60)
  const secs = recordedDuration.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const formattedFileSize = computed(() => {
  const size = recordedBlob.value?.size || 0
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
})

// ==================== Settings ====================
const selectedOrientation = ref<'portrait' | 'landscape'>('portrait')
const orientationOptions = [
  { label: '橫向', value: 'landscape' },
  { label: '直向', value: 'portrait' },
]

const selectedQuality = ref<'480p' | '720p' | '1080p'>('720p')
const qualityOptions = [
  { label: '高畫質 (1080p)', value: '1080p' },
  { label: '標準畫質 (720p)', value: '720p' },
  { label: '低畫質 (480p)', value: '480p' },
]

const selectedMaxDuration = ref(60)
const durationOptions = [
  { label: '無限制', value: 0 },
  { label: '1 分鐘', value: 60 },
  { label: '3 分鐘', value: 180 },
  { label: '5 分鐘', value: 300 },
  { label: '10 分鐘', value: 600 },
]

// ==================== Upload ====================
const { isUploading, uploadProgress, uploadedFile, uploadError, uploadVideo, clearUpload } =
  useVideoUpload()

// ==================== Metadata ====================
const metadata = ref({
  title: '',
  description: '',
})

// ==================== Methods ====================
function startRecording() {
  recorderRef.value?.start()
}

function handleRecorded({ blob, duration }: { blob: Blob; duration: number }) {
  recordedBlob.value = blob
  recordedDuration.value = duration

  // Auto-generate title
  const timestamp = new Date().toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  metadata.value.title = `影片錄製 ${timestamp}`

  toast.add({
    title: '錄製完成',
    description: `已錄製 ${formattedDuration.value} 的影片`,
    color: 'success',
  })
}

function handleCancelled() {
  toast.add({
    title: '已取消',
    description: '錄製已取消',
    color: 'neutral',
  })
}

function handleError({ message }: { message: string }) {
  toast.add({
    title: '錄製錯誤',
    description: message,
    color: 'error',
  })
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
  // Revoke old blob URL
  if (recordedBlobUrl.value) {
    URL.revokeObjectURL(recordedBlobUrl.value)
  }

  recordedBlob.value = null
  recordedDuration.value = 0
  metadata.value = { title: '', description: '' }
  clearUpload()
}

function handleDownload() {
  if (!recordedBlob.value || !recordedBlobUrl.value) return

  const a = document.createElement('a')
  a.href = recordedBlobUrl.value
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

// ==================== Cleanup ====================
watch(recordedBlobUrl, (_, oldUrl) => {
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl)
  }
})
</script>

<style scoped>
.video-recorder-page {
  min-height: 100vh;
  background: var(--ui-bg);
}

.video-recorder-page__header {
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated);
  padding: 12px 16px;
}

.video-recorder-page__header-content {
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.video-recorder-page__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-recorder-page__title-icon {
  width: 24px;
  height: 24px;
  color: var(--ui-primary);
}

.video-recorder-page__title-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.video-recorder-page__content {
  max-width: 1024px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* Start Section */
.video-recorder-page__start-section {
  display: flex;
  justify-content: center;
  padding-top: 48px;
}

.video-recorder-page__start-card {
  max-width: 400px;
  width: 100%;
}

.video-recorder-page__start-content {
  text-align: center;
  padding: 24px 0;
}

.video-recorder-page__start-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: var(--ui-primary-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-recorder-page__start-icon-svg {
  width: 40px;
  height: 40px;
  color: var(--ui-primary);
}

.video-recorder-page__start-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0 0 8px;
}

.video-recorder-page__start-desc {
  font-size: 14px;
  color: var(--ui-text-muted);
  margin: 0 0 24px;
}

.video-recorder-page__settings {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.video-recorder-page__select {
  width: 100%;
}

.video-recorder-page__start-btn {
  width: 100%;
}

/* Preview Section */
.video-recorder-page__preview-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-recorder-page__section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.video-recorder-page__video-container {
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-recorder-page__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-recorder-page__info {
  display: flex;
  gap: 24px;
  margin-top: 12px;
}

.video-recorder-page__info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ui-text-muted);
}

.video-recorder-page__info-icon {
  width: 18px;
  height: 18px;
}

.video-recorder-page__metadata-card {
  margin-top: 8px;
}

.video-recorder-page__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-recorder-page__progress {
  padding: 16px;
  background: var(--ui-bg-elevated);
  border-radius: 8px;
}

.video-recorder-page__progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--ui-text-muted);
}

.video-recorder-page__progress-percent {
  font-weight: 600;
  color: var(--ui-text);
}

.video-recorder-page__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

/* Success Section */
.video-recorder-page__success-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-recorder-page__success-card {
  margin-top: 8px;
}

.video-recorder-page__success-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-recorder-page__success-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}
</style>
