<template>
  <!-- Full Screen Overlay -->
  <Teleport to="body">
    <div
      v-if="isActive"
      ref="containerRef"
      class="video-recorder"
      :class="[
        `video-recorder--${props.orientation}`,
        { 'video-recorder--fullscreen': isFullscreen },
      ]"
    >
      <!-- Video Preview Layer -->
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="video-recorder__video"
        :class="{
          'video-recorder__video--mirror': currentFacingMode === 'user',
          'video-recorder__video--blurred': state === 'wrong_orientation',
        }"
      />

      <!-- Grid Overlay -->
      <div v-if="showGridOverlay && state !== 'wrong_orientation'" class="video-recorder__grid">
        <div class="video-recorder__grid-line video-recorder__grid-line--v1" />
        <div class="video-recorder__grid-line video-recorder__grid-line--v2" />
        <div class="video-recorder__grid-line video-recorder__grid-line--h1" />
        <div class="video-recorder__grid-line video-recorder__grid-line--h2" />
      </div>

      <!-- Wrong Orientation Overlay -->
      <Transition name="fade">
        <div v-if="state === 'wrong_orientation'" class="video-recorder__orientation-overlay">
          <div class="video-recorder__orientation-card">
            <div class="video-recorder__orientation-icon">
              <svg
                v-if="props.orientation === 'landscape'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                class="video-recorder__rotate-icon"
              >
                <rect
                  x="8"
                  y="16"
                  width="32"
                  height="48"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  opacity="0.4"
                />
                <rect
                  x="24"
                  y="8"
                  width="48"
                  height="32"
                  rx="4"
                  fill="currentColor"
                  opacity="0.8"
                />
                <path
                  d="M56 24 C60 24, 60 32, 56 32"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                />
                <polygon points="54,20 60,24 54,28" fill="currentColor" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                class="video-recorder__rotate-icon"
              >
                <rect
                  x="24"
                  y="8"
                  width="48"
                  height="32"
                  rx="4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  opacity="0.4"
                />
                <rect
                  x="8"
                  y="16"
                  width="32"
                  height="48"
                  rx="4"
                  fill="currentColor"
                  opacity="0.8"
                />
                <path
                  d="M24 56 C24 60, 16 60, 16 56"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                />
                <polygon points="20,54 24,60 28,54" fill="currentColor" />
              </svg>
            </div>
            <p class="video-recorder__orientation-text">
              {{ props.orientation === 'landscape' ? '請將裝置轉成橫式' : '請將裝置轉成直式' }}
            </p>
          </div>
        </div>
      </Transition>

      <!-- Top Bar: Cancel Button -->
      <div class="video-recorder__top-bar">
        <button
          type="button"
          class="video-recorder__btn video-recorder__btn--cancel"
          @click="handleCancel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="video-recorder__icon"
          >
            <path
              fill-rule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Ready State: Instruction + Start Button -->
      <Transition name="fade">
        <div v-if="state === 'ready'" class="video-recorder__instruction-bar">
          <div class="video-recorder__instruction-content">
            <span v-if="props.instruction" class="video-recorder__instruction-text">
              {{ props.instruction }}
            </span>
            <button
              type="button"
              class="video-recorder__btn video-recorder__btn--start"
              @click="handleStartRecording"
            >
              開始錄製 →
            </button>
          </div>
        </div>
      </Transition>

      <!-- Countdown Overlay -->
      <Transition name="scale">
        <div v-if="state === 'countdown'" class="video-recorder__countdown">
          <span class="video-recorder__countdown-number">{{ countdownValue }}</span>
        </div>
      </Transition>

      <!-- Recording State: Controls -->
      <Transition name="slide-up">
        <div v-if="state === 'recording' || state === 'paused'" class="video-recorder__controls">
          <!-- Timer -->
          <div class="video-recorder__timer">
            <div
              class="video-recorder__timer-dot"
              :class="{ 'video-recorder__timer-dot--paused': state === 'paused' }"
            />
            <span class="video-recorder__timer-text">{{ formattedTime }}</span>
          </div>

          <!-- Control Buttons -->
          <div class="video-recorder__control-buttons">
            <!-- Grid Toggle -->
            <button
              type="button"
              class="video-recorder__btn video-recorder__btn--control"
              :class="{ 'video-recorder__btn--active': showGridOverlay }"
              @click="showGridOverlay = !showGridOverlay"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="video-recorder__icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- Pause/Resume -->
            <button
              type="button"
              class="video-recorder__btn video-recorder__btn--control"
              @click="togglePause"
            >
              <svg
                v-if="state === 'paused'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="video-recorder__icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="video-recorder__icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- Stop Recording -->
            <button
              type="button"
              class="video-recorder__btn video-recorder__btn--stop"
              @click="handleStopRecording"
            >
              <div class="video-recorder__stop-icon" />
            </button>

            <!-- Switch Camera -->
            <button
              type="button"
              class="video-recorder__btn video-recorder__btn--control"
              @click="handleSwitchCamera"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="video-recorder__icon"
              >
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path
                  fill-rule="evenodd"
                  d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.152-.177a1.56 1.56 0 001.11-.71l.821-1.317a2.603 2.603 0 012.332-1.39zM12 17.25a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// ==================== Types ====================
type RecorderState =
  | 'idle'
  | 'requesting_camera'
  | 'wrong_orientation'
  | 'ready'
  | 'countdown'
  | 'recording'
  | 'paused'
  | 'completed'
type Orientation = 'portrait' | 'landscape'
type FacingMode = 'user' | 'environment'

interface RecordedResult {
  blob: Blob
  duration: number
}

// ==================== Props ====================
interface Props {
  orientation?: Orientation
  instruction?: string
  maxDuration?: number
  quality?: '480p' | '720p' | '1080p'
  showGrid?: boolean
  showCountdown?: boolean
  facingMode?: FacingMode
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'landscape',
  instruction: '',
  maxDuration: 60,
  quality: '720p',
  showGrid: true,
  showCountdown: true,
  facingMode: 'environment',
})

// ==================== Emits ====================
const emit = defineEmits<{
  recorded: [result: RecordedResult]
  cancelled: []
  error: [error: { message: string }]
}>()

// ==================== Video Quality Configs ====================
const QUALITY_CONFIGS = {
  '480p': { width: 854, height: 480, bitrate: 1000000, frameRate: 30 },
  '720p': { width: 1280, height: 720, bitrate: 2500000, frameRate: 30 },
  '1080p': { width: 1920, height: 1080, bitrate: 5000000, frameRate: 30 },
}

// ==================== Refs ====================
const containerRef = ref<HTMLDivElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

// ==================== State ====================
const isActive = ref(false)
const isFullscreen = ref(false)
const state = ref<RecorderState>('idle')
const showGridOverlay = ref(props.showGrid)
const currentFacingMode = ref<FacingMode>(props.facingMode)
const countdownValue = ref(3)
const elapsedTime = ref(0)

// Media
const stream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedChunks = ref<Blob[]>([])

// Timers
let recordingTimer: number | null = null
let orientationCheckInterval: number | null = null

// Previous orientation state (for auto-resume)
let wasRecordingBeforeOrientationChange = false

// ==================== Computed ====================
const formattedTime = computed(() => {
  const mins = Math.floor(elapsedTime.value / 60)
  const secs = elapsedTime.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

// ==================== Orientation Detection ====================
function getCurrentOrientation(): Orientation {
  if (screen.orientation) {
    return screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
  }
  return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
}

function isOrientationCorrect(): boolean {
  return getCurrentOrientation() === props.orientation
}

function handleOrientationChange() {
  if (!isActive.value) return

  if (!isOrientationCorrect()) {
    // Orientation became wrong
    if (state.value === 'recording') {
      wasRecordingBeforeOrientationChange = true
      pauseRecording()
    }
    if (state.value !== 'countdown') {
      state.value = 'wrong_orientation'
    }
  } else {
    // Orientation is now correct
    if (state.value === 'wrong_orientation') {
      state.value = 'ready'
      if (wasRecordingBeforeOrientationChange) {
        wasRecordingBeforeOrientationChange = false
        resumeRecording()
      }
    }
  }
}

// ==================== Camera Methods ====================
async function initCamera() {
  try {
    state.value = 'requesting_camera'
    const config = QUALITY_CONFIGS[props.quality]

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: currentFacingMode.value,
        width: { ideal: config.width },
        height: { ideal: config.height },
        frameRate: { ideal: config.frameRate },
      },
      audio: true,
    }

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    stream.value = mediaStream

    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }

    // Check orientation after camera init
    if (isOrientationCorrect()) {
      state.value = 'ready'
    } else {
      state.value = 'wrong_orientation'
    }
  } catch (err) {
    console.error('Camera init failed:', err)
    emit('error', { message: err instanceof Error ? err.message : '無法存取攝像頭' })
    cleanup()
  }
}

async function switchCamera() {
  if (!stream.value) return

  // Stop current stream
  stream.value.getTracks().forEach((track) => track.stop())

  // Toggle facing mode
  currentFacingMode.value = currentFacingMode.value === 'user' ? 'environment' : 'user'

  // Reinitialize camera
  const config = QUALITY_CONFIGS[props.quality]
  try {
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: currentFacingMode.value,
        width: { ideal: config.width },
        height: { ideal: config.height },
        frameRate: { ideal: config.frameRate },
      },
      audio: true,
    })

    stream.value = newStream
    if (videoRef.value) {
      videoRef.value.srcObject = newStream
    }

    // If we were recording, we need to restart the recorder with new stream
    if (mediaRecorder.value && (state.value === 'recording' || state.value === 'paused')) {
      const wasRecording = state.value === 'recording'
      mediaRecorder.value.stop()

      await nextTick()
      startMediaRecorder()
      if (!wasRecording) {
        mediaRecorder.value?.pause()
      }
    }
  } catch (err) {
    emit('error', { message: '切換攝像頭失敗' })
  }
}

// ==================== Recording Methods ====================
function startMediaRecorder() {
  if (!stream.value) return

  const config = QUALITY_CONFIGS[props.quality]
  const options: MediaRecorderOptions = {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: config.bitrate,
  }

  // Check supported format
  if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
    if (MediaRecorder.isTypeSupported('video/webm')) {
      options.mimeType = 'video/webm'
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options.mimeType = 'video/mp4'
    } else {
      delete options.mimeType
    }
  }

  const recorder = new MediaRecorder(stream.value, options)
  mediaRecorder.value = recorder

  recorder.ondataavailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.value.push(event.data)
    }
  }

  recorder.onstop = () => {
    if (state.value === 'completed') {
      const blob = new Blob(recordedChunks.value, {
        type: mediaRecorder.value?.mimeType || 'video/webm',
      })
      emit('recorded', { blob, duration: elapsedTime.value })
      cleanup()
    }
  }

  recorder.onerror = () => {
    emit('error', { message: '錄製過程中發生錯誤' })
    cleanup()
  }

  recorder.start(1000)
}

function startRecordingTimer() {
  stopRecordingTimer()
  recordingTimer = window.setInterval(() => {
    elapsedTime.value++

    // Check max duration
    if (props.maxDuration > 0 && elapsedTime.value >= props.maxDuration) {
      handleStopRecording()
    }
  }, 1000)
}

function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

function pauseRecording() {
  if (mediaRecorder.value && state.value === 'recording') {
    mediaRecorder.value.pause()
    state.value = 'paused'
    stopRecordingTimer()
  }
}

function resumeRecording() {
  if (mediaRecorder.value && state.value === 'paused') {
    mediaRecorder.value.resume()
    state.value = 'recording'
    startRecordingTimer()
  }
}

function togglePause() {
  if (state.value === 'recording') {
    pauseRecording()
  } else if (state.value === 'paused') {
    resumeRecording()
  }
}

// ==================== Event Handlers ====================
async function handleStartRecording() {
  if (props.showCountdown) {
    state.value = 'countdown'
    countdownValue.value = 3

    const countdownInterval = setInterval(() => {
      countdownValue.value--
      if (countdownValue.value === 0) {
        clearInterval(countdownInterval)
        beginRecording()
      }
    }, 1000)
  } else {
    beginRecording()
  }
}

function beginRecording() {
  recordedChunks.value = []
  elapsedTime.value = 0
  startMediaRecorder()
  state.value = 'recording'
  startRecordingTimer()
}

function handleStopRecording() {
  state.value = 'completed'
  stopRecordingTimer()
  mediaRecorder.value?.stop()
  exitFullscreen()
}

function handleSwitchCamera() {
  switchCamera()
}

function handleCancel() {
  emit('cancelled')
  cleanup()
}

// ==================== Fullscreen ====================
async function enterFullscreen() {
  try {
    if (containerRef.value) {
      await containerRef.value.requestFullscreen()
      isFullscreen.value = true
    }
  } catch {
    // Fullscreen not supported, continue anyway
    isFullscreen.value = false
  }
}

async function exitFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  } catch {
    // Ignore errors
  }
  isFullscreen.value = false
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement

  // If user exits fullscreen manually, cancel recording
  if (!isFullscreen.value && isActive.value && state.value !== 'completed') {
    handleCancel()
  }
}

// ==================== Lifecycle ====================
function cleanup() {
  isActive.value = false
  state.value = 'idle'
  stopRecordingTimer()

  if (orientationCheckInterval) {
    clearInterval(orientationCheckInterval)
    orientationCheckInterval = null
  }

  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = null
  }

  if (mediaRecorder.value) {
    mediaRecorder.value = null
  }

  recordedChunks.value = []
  elapsedTime.value = 0
  wasRecordingBeforeOrientationChange = false

  exitFullscreen()
}

// ==================== Expose Methods ====================
async function start() {
  isActive.value = true
  currentFacingMode.value = props.facingMode
  showGridOverlay.value = props.showGrid

  await nextTick()
  await enterFullscreen()
  await initCamera()

  // Start orientation monitoring
  screen.orientation?.addEventListener('change', handleOrientationChange)
  window.addEventListener('orientationchange', handleOrientationChange)
}

function stop() {
  if (state.value === 'recording' || state.value === 'paused') {
    handleStopRecording()
  }
}

function cancel() {
  handleCancel()
}

defineExpose({
  start,
  stop,
  cancel,
})

// ==================== Watchers ====================
watch(
  () => props.showGrid,
  (val) => {
    showGridOverlay.value = val
  },
)

// ==================== Mount/Unmount ====================
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  screen.orientation?.removeEventListener('change', handleOrientationChange)
  window.removeEventListener('orientationchange', handleOrientationChange)
  cleanup()
})
</script>

<style scoped>
/* ==================== Base ====================  */
.video-recorder {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ==================== Video ====================  */
.video-recorder__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-recorder__video--mirror {
  transform: scaleX(-1);
}

.video-recorder__video--blurred {
  filter: blur(20px);
}

/* ==================== Grid Overlay ====================  */
.video-recorder__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.video-recorder__grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
}

.video-recorder__grid-line--v1 {
  left: 33.33%;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed rgba(255, 255, 255, 0.5);
  background: transparent;
}

.video-recorder__grid-line--v2 {
  left: 66.66%;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed rgba(255, 255, 255, 0.5);
  background: transparent;
}

.video-recorder__grid-line--h1 {
  top: 33.33%;
  left: 0;
  right: 0;
  height: 1px;
  border-top: 1px dashed rgba(255, 255, 255, 0.5);
  background: transparent;
}

.video-recorder__grid-line--h2 {
  top: 66.66%;
  left: 0;
  right: 0;
  height: 1px;
  border-top: 1px dashed rgba(255, 255, 255, 0.5);
  background: transparent;
}

/* ==================== Orientation Overlay ====================  */
.video-recorder__orientation-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
}

.video-recorder__orientation-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 48px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.video-recorder__orientation-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  color: #3b82f6;
}

.video-recorder__rotate-icon {
  width: 100%;
  height: 100%;
}

.video-recorder__orientation-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

/* ==================== Top Bar ====================  */
.video-recorder__top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  z-index: 10;
}

/* ==================== Buttons ====================  */
.video-recorder__btn {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.video-recorder__btn--cancel {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  backdrop-filter: blur(10px);
}

.video-recorder__btn--cancel:hover {
  background: rgba(0, 0, 0, 0.7);
}

.video-recorder__btn--start {
  background: #f97316;
  color: #fff;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
}

.video-recorder__btn--start:hover {
  background: #ea580c;
}

.video-recorder__btn--control {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  backdrop-filter: blur(10px);
}

.video-recorder__btn--control:hover {
  background: rgba(255, 255, 255, 0.3);
}

.video-recorder__btn--active {
  background: #3b82f6;
}

.video-recorder__btn--stop {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ef4444;
}

.video-recorder__btn--stop:hover {
  background: #dc2626;
}

.video-recorder__stop-icon {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 4px;
}

.video-recorder__icon {
  width: 24px;
  height: 24px;
}

/* ==================== Instruction Bar ====================  */
.video-recorder__instruction-bar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.video-recorder__instruction-content {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.video-recorder__instruction-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* ==================== Countdown ====================  */
.video-recorder__countdown {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.video-recorder__countdown-number {
  font-size: 120px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* ==================== Controls ====================  */
.video-recorder__controls {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 10;
}

.video-recorder__timer {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
}

.video-recorder__timer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 1s infinite;
}

.video-recorder__timer-dot--paused {
  background: #fbbf24;
  animation: none;
}

.video-recorder__timer-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  font-family: ui-monospace, monospace;
}

.video-recorder__control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 40px;
  backdrop-filter: blur(10px);
}

/* ==================== Animations ====================  */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(1.5);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* ==================== Safe Area (notch support) ====================  */
@supports (padding: max(0px)) {
  .video-recorder__top-bar {
    padding-top: max(16px, env(safe-area-inset-top));
    padding-right: max(16px, env(safe-area-inset-right));
  }

  .video-recorder__controls {
    bottom: max(32px, env(safe-area-inset-bottom));
  }
}
</style>
