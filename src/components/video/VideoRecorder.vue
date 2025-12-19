<template>
  <!-- 全螢幕模式：使用 Teleport -->
  <Teleport v-if="!props.embedded" to="body" :disabled="false">
    <div
      v-if="isActive"
      ref="containerRef"
      class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
    >
      <!-- 影片預覽層 -->
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="h-full w-full object-cover"
        :class="{
          '-scale-x-100': recorder.currentFacingMode.value === 'user',
          'blur-[20px]': state === 'wrong_orientation',
        }"
      />

      <!-- 九宮格輔助線（永遠顯示） -->
      <div v-if="state !== 'wrong_orientation'" class="pointer-events-none absolute inset-0">
        <div class="absolute top-0 bottom-0 left-1/3 w-px border-l border-dashed border-white/50" />
        <div class="absolute top-0 bottom-0 left-2/3 w-px border-l border-dashed border-white/50" />
        <div class="absolute top-1/3 right-0 left-0 h-px border-t border-dashed border-white/50" />
        <div class="absolute top-2/3 right-0 left-0 h-px border-t border-dashed border-white/50" />
      </div>

      <!-- 引導遮罩插槽（用於臉部引導、箭頭等） -->
      <div
        v-if="
          (state === 'ready' || state === 'recording' || state === 'paused') &&
          $slots['guide-overlay']
        "
        class="pointer-events-none absolute inset-0 z-5"
      >
        <slot name="guide-overlay" />
      </div>

      <!-- 方向錯誤提示遮罩 -->
      <Transition name="fade">
        <div
          v-if="state === 'wrong_orientation'"
          class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[10px]"
        >
          <div
            class="rounded-2xl bg-white px-12 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          >
            <div class="text-secondary-400 mx-auto mb-4 size-20">
              <svg
                v-if="props.orientation === 'landscape'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                class="h-full w-full"
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
                class="h-full w-full"
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
            <p class="m-0 text-base font-medium text-gray-500">
              {{ props.orientation === 'landscape' ? '請將裝置轉成橫式' : '請將裝置轉成直式' }}
            </p>
          </div>
        </div>
      </Transition>

      <!-- 頂部列：取消按鈕（錄製中隱藏） -->
      <div
        v-if="state !== 'recording' && state !== 'paused'"
        class="video-recorder__top-bar absolute top-0 right-0 left-0 z-10 flex justify-end p-4"
      >
        <button
          type="button"
          class="flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-black/50 text-white backdrop-blur-[10px] transition-all duration-200 hover:bg-black/70"
          @click="handleCancel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-6"
          >
            <path
              fill-rule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- 準備狀態：說明文字 + 開始按鈕 -->
      <Transition name="fade">
        <div
          v-if="state === 'ready'"
          class="absolute top-4 right-16 left-4 z-10 flex justify-center"
        >
          <div
            class="flex items-center gap-3 rounded-[32px] bg-white/95 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          >
            <!-- 說明插槽（可自訂內容，否則顯示 prop） -->
            <slot name="instruction">
              <span v-if="props.instruction" class="leading-relaxed font-medium">
                {{ props.instruction }}
              </span>
            </slot>
            <button
              type="button"
              class="bg-secondary-600 hover:bg-secondary-400 shrink-0 cursor-pointer rounded-3xl border-none px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200"
              @click="handleStartRecording"
            >
              開始錄製 →
            </button>
          </div>
        </div>
      </Transition>

      <!-- 倒數動畫遮罩 -->
      <Transition name="scale">
        <div
          v-if="state === 'countdown'"
          class="absolute inset-0 flex items-center justify-center bg-black/50"
        >
          <span
            class="text-[120px] font-bold text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.5)]"
            >{{ countdownValue }}</span
          >
        </div>
      </Transition>

      <!-- 錄製中：控制按鈕 -->
      <Transition name="slide-up">
        <div
          v-if="state === 'recording' || state === 'paused'"
          class="video-recorder__controls absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4"
        >
          <!-- 計時器 -->
          <div
            class="flex items-center gap-2 rounded-3xl bg-black/60 px-4 py-2 backdrop-blur-[10px]"
          >
            <div
              class="size-2 rounded-full"
              :class="state === 'paused' ? 'bg-warning' : 'bg-error animate-pulse'"
            />
            <span class="font-mono text-sm font-semibold text-white">{{
              recorder.formattedTime.value
            }}</span>
          </div>

          <!-- 控制按鈕列 -->
          <div
            class="flex items-center gap-4 rounded-[40px] bg-black/50 px-4 py-2 backdrop-blur-[10px]"
          >
            <!-- 暫停/繼續 -->
            <button
              type="button"
              class="flex size-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-[10px] transition-all duration-200 hover:bg-white/30"
              @click="handleTogglePause"
            >
              <svg
                v-if="state === 'paused'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-6"
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
                class="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- 停止錄製 -->
            <button
              type="button"
              class="bg-error hover:bg-notification-red flex size-14 cursor-pointer items-center justify-center rounded-full border-none transition-all duration-200"
              @click="handleStopRecording"
            >
              <div class="size-5 rounded bg-white" />
            </button>

            <!-- 切換鏡頭（只有多個鏡頭時顯示） -->
            <button
              v-if="recorder.hasMultipleCameras.value"
              type="button"
              class="flex size-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-[10px] transition-all duration-200 hover:bg-white/30"
              @click="handleSwitchCamera"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-6"
              >
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>

  <!-- 嵌入模式：不使用 Teleport -->
  <div
    v-if="props.embedded && isActive"
    ref="containerRef"
    class="relative z-auto h-full w-full overflow-hidden bg-black"
  >
    <!-- 影片預覽層 -->
    <video
      ref="videoRef"
      autoplay
      playsinline
      muted
      class="h-full w-full object-cover"
      :class="{
        '-scale-x-100': recorder.currentFacingMode.value === 'user',
        'blur-[20px]': state === 'wrong_orientation',
      }"
    />

    <!-- 九宮格輔助線 -->
    <div v-if="state !== 'wrong_orientation'" class="pointer-events-none absolute inset-0">
      <div class="absolute top-0 bottom-0 left-1/3 w-px border-l border-dashed border-white/50" />
      <div class="absolute top-0 bottom-0 left-2/3 w-px border-l border-dashed border-white/50" />
      <div class="absolute top-1/3 right-0 left-0 h-px border-t border-dashed border-white/50" />
      <div class="absolute top-2/3 right-0 left-0 h-px border-t border-dashed border-white/50" />
    </div>

    <!-- 引導遮罩插槽 -->
    <div
      v-if="
        (state === 'ready' || state === 'recording' || state === 'paused') &&
        $slots['guide-overlay']
      "
      class="pointer-events-none absolute inset-0 z-5"
    >
      <slot name="guide-overlay" />
    </div>

    <!-- 頂部列：取消按鈕（錄製中隱藏） -->
    <div
      v-if="state !== 'recording' && state !== 'paused'"
      class="video-recorder__top-bar absolute top-0 right-0 left-0 z-10 flex justify-end p-4"
    >
      <button
        type="button"
        class="flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-black/50 text-white backdrop-blur-[10px] transition-all duration-200 hover:bg-black/70"
        @click="handleCancel"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-6"
        >
          <path
            fill-rule="evenodd"
            d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- 準備狀態 -->
    <Transition name="fade">
      <div v-if="state === 'ready'" class="absolute top-4 right-16 left-4 z-10 flex justify-center">
        <div
          class="flex max-w-[90%] items-center gap-3 rounded-[32px] bg-white/95 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        >
          <slot name="instruction">
            <span
              v-if="props.instruction"
              class="text-secondary-400 text-sm leading-relaxed font-medium"
            >
              {{ props.instruction }}
            </span>
          </slot>
          <button
            type="button"
            class="bg-primary hover:bg-primary-600 shrink-0 cursor-pointer rounded-3xl border-none px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200"
            @click="handleStartRecording"
          >
            開始錄製 →
          </button>
        </div>
      </div>
    </Transition>

    <!-- 倒數動畫遮罩 -->
    <Transition name="scale">
      <div
        v-if="state === 'countdown'"
        class="absolute inset-0 flex items-center justify-center bg-black/50"
      >
        <span class="text-[120px] font-bold text-white [text-shadow:0_4px_20px_rgba(0,0,0,0.5)]">{{
          countdownValue
        }}</span>
      </div>
    </Transition>

    <!-- 錄製中：控制按鈕 -->
    <Transition name="slide-up">
      <div
        v-if="state === 'recording' || state === 'paused'"
        class="video-recorder__controls absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4"
      >
        <div class="flex items-center gap-2 rounded-3xl bg-black/60 px-4 py-2 backdrop-blur-[10px]">
          <div
            class="size-2 rounded-full"
            :class="state === 'paused' ? 'bg-warning' : 'bg-error animate-pulse'"
          />
          <span class="font-mono text-sm font-semibold text-white">{{
            recorder.formattedTime.value
          }}</span>
        </div>

        <div
          class="flex items-center gap-4 rounded-[40px] bg-black/50 px-4 py-2 backdrop-blur-[10px]"
        >
          <button
            type="button"
            class="flex size-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-[10px] transition-all duration-200 hover:bg-white/30"
            @click="handleTogglePause"
          >
            <svg
              v-if="state === 'paused'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-6"
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
              class="size-6"
            >
              <path
                fill-rule="evenodd"
                d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            class="bg-error hover:bg-notification-red flex size-14 cursor-pointer items-center justify-center rounded-full border-none transition-all duration-200"
            @click="handleStopRecording"
          >
            <div class="size-5 rounded bg-white" />
          </button>

          <button
            v-if="recorder.hasMultipleCameras.value"
            type="button"
            class="flex size-12 cursor-pointer items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-[10px] transition-all duration-200 hover:bg-white/30"
            @click="handleSwitchCamera"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-6"
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
</template>

<script setup lang="ts">
/**
 * VideoRecorder 全螢幕錄影元件
 *
 * 專為行動裝置設計的錄影元件，支援：
 * - 全螢幕錄製
 * - 嵌入模式（embedded）
 * - 裝置方向偵測與鎖定
 * - 倒數計時動畫
 * - 暫停/繼續錄製
 * - 前後鏡頭切換
 *
 * 使用 useVideoRecorder composable 處理核心錄製邏輯
 */
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useVideoRecorder, type Orientation, type FacingMode } from '@/composables/useVideoRecorder'
import { VideoQuality } from '@/types/video'

// =====================================================================
// 型別定義
// =====================================================================

/** 錄影器狀態 */
type RecorderState =
  | 'idle' // 閒置
  | 'requesting_camera' // 請求攝影機權限
  | 'wrong_orientation' // 方向錯誤
  | 'ready' // 準備就緒
  | 'countdown' // 倒數中
  | 'recording' // 錄製中
  | 'paused' // 暫停
  | 'completed' // 完成

/** 錄製結果 */
interface RecordedResult {
  blob: Blob
  duration: number
}

// =====================================================================
// Props & Emits
// =====================================================================

interface Props {
  /** 要求的裝置方向 */
  orientation?: Orientation
  /** 錄製引導說明文字 */
  instruction?: string
  /** 最大錄製時長（秒），0 表示無限制 */
  maxDuration?: number
  /** 影片品質 */
  quality?: '480p' | '720p' | '1080p'
  /** 是否顯示九宮格 */
  showGrid?: boolean
  /** 是否顯示倒數動畫 */
  showCountdown?: boolean
  /** 預設攝影機方向 */
  facingMode?: FacingMode
  /** 是否全螢幕模式 */
  fullscreen?: boolean
  /** 是否嵌入模式（不使用 Teleport） */
  embedded?: boolean
  /** 編碼模式 */
  codecMode?: 'auto' | 'h264' | 'vp8' | 'vp9' | 'hevc' | 'av1'
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'landscape',
  instruction: '',
  maxDuration: 60,
  quality: '720p',
  showGrid: true,
  showCountdown: true,
  facingMode: 'environment',
  fullscreen: true,
  embedded: false,
  codecMode: 'auto',
})

const emit = defineEmits<{
  /** 錄製完成 */
  recorded: [result: RecordedResult]
  /** 使用者取消 */
  cancelled: []
  /** 發生錯誤 */
  error: [error: { message: string }]
}>()

// =====================================================================
// 品質映射
// =====================================================================

const QUALITY_MAP: Record<string, VideoQuality> = {
  '480p': VideoQuality.LOW,
  '720p': VideoQuality.MEDIUM,
  '1080p': VideoQuality.HIGH,
}

// =====================================================================
// Composable
// =====================================================================

const recorder = useVideoRecorder({
  quality: QUALITY_MAP[props.quality],
  facingMode: props.facingMode,
  audioEnabled: true,
  maxDuration: props.maxDuration,
  requiredOrientation: props.orientation,
  codecMode: props.codecMode,
})

// =====================================================================
// DOM 參照
// =====================================================================

const containerRef = ref<HTMLDivElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

// =====================================================================
// 元件狀態
// =====================================================================

/** 元件是否啟用 */
const isActive = ref(false)

/** 是否處於全螢幕 */
const isFullscreen = ref(false)

/** 目前狀態 */
const state = ref<RecorderState>('idle')

/** 是否顯示九宮格 */
const showGridOverlay = ref(props.showGrid)

/** 倒數值 */
const countdownValue = ref(3)

/** 方向變更前是否正在錄製 */
let wasRecordingBeforeOrientationChange = false

// =====================================================================
// 方向偵測
// =====================================================================

/** 檢查方向是否正確 */
function isOrientationCorrect(): boolean {
  return recorder.getCurrentOrientation() === props.orientation
}

/** 處理方向變化 */
function handleOrientationChange() {
  if (!isActive.value) return

  if (!isOrientationCorrect()) {
    // 方向變錯了
    if (state.value === 'recording') {
      wasRecordingBeforeOrientationChange = true
      recorder.pauseRecording()
      state.value = 'paused'
    }
    if (state.value !== 'countdown') {
      state.value = 'wrong_orientation'
    }
  } else {
    // 方向恢復正確
    if (state.value === 'wrong_orientation') {
      if (wasRecordingBeforeOrientationChange) {
        wasRecordingBeforeOrientationChange = false
        recorder.resumeRecording()
        state.value = 'recording'
      } else {
        state.value = 'ready'
      }
    }
  }
}

// =====================================================================
// 事件處理
// =====================================================================

/** 處理開始錄製（可能有倒數） */
function handleStartRecording() {
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

/** 開始實際錄製 */
function beginRecording() {
  const success = recorder.startRecording()
  if (success) {
    state.value = 'recording'
  } else {
    emit('error', { message: recorder.error.value || '開始錄製失敗' })
  }
}

/** 停止錄製 */
function handleStopRecording() {
  state.value = 'completed'
  recorder.stopRecording()

  // 非嵌入模式才退出全螢幕
  if (!props.embedded) {
    exitFullscreen()
  }

  // 等待 recordedBlob 更新後發送事件
  const checkBlob = setInterval(() => {
    if (recorder.recordedBlob.value) {
      clearInterval(checkBlob)
      emit('recorded', {
        blob: recorder.recordedBlob.value,
        duration: recorder.elapsedTime.value,
      })
      cleanup()
    }
  }, 100)

  // 最多等待 3 秒
  setTimeout(() => {
    clearInterval(checkBlob)
  }, 3000)
}

/** 切換暫停/繼續 */
function handleTogglePause() {
  if (state.value === 'recording') {
    recorder.pauseRecording()
    state.value = 'paused'
  } else if (state.value === 'paused') {
    recorder.resumeRecording()
    state.value = 'recording'
  }
}

/** 切換攝影機 */
function handleSwitchCamera() {
  recorder.switchCamera()
}

/** 取消錄製 */
function handleCancel() {
  emit('cancelled')
  cleanup()
}

// =====================================================================
// 全螢幕控制
// =====================================================================

/** 進入全螢幕 */
async function enterFullscreen() {
  try {
    if (containerRef.value) {
      await containerRef.value.requestFullscreen()
      isFullscreen.value = true
    }
  } catch {
    // 不支援全螢幕，繼續執行
    isFullscreen.value = false
  }
}

/** 退出全螢幕 */
async function exitFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  } catch {
    // 忽略錯誤
  }
  isFullscreen.value = false
}

/** 全螢幕狀態變化處理 */
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement

  // 使用者手動退出全螢幕，取消錄製（僅非嵌入模式）
  if (!isFullscreen.value && isActive.value && state.value !== 'completed' && !props.embedded) {
    handleCancel()
  }
}

// =====================================================================
// 生命週期
// =====================================================================

/** 清理資源 */
function cleanup() {
  isActive.value = false
  state.value = 'idle'
  wasRecordingBeforeOrientationChange = false

  recorder.cleanup()

  // 恢復頁面滾動（僅非嵌入模式）
  if (!props.embedded) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.height = ''
    exitFullscreen()
  }
}

// =====================================================================
// 公開方法
// =====================================================================

/** 開始錄影流程 */
async function start() {
  isActive.value = true
  showGridOverlay.value = props.showGrid

  await nextTick()

  // 禁止頁面滾動（僅非嵌入模式）
  if (!props.embedded) {
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
  }

  // 根據 prop 決定是否進入全螢幕（僅非嵌入模式）
  if (props.fullscreen && !props.embedded) {
    await enterFullscreen()
  }

  // 初始化攝影機
  state.value = 'requesting_camera'
  const success = await recorder.initCamera(videoRef.value || undefined)

  if (success) {
    // 初始化後檢查方向（嵌入模式不檢查方向）
    if (props.embedded) {
      state.value = 'ready'
    } else {
      state.value = isOrientationCorrect() ? 'ready' : 'wrong_orientation'
    }
  } else {
    emit('error', { message: recorder.error.value || '無法存取攝像頭' })
    cleanup()
    return
  }

  // 開始監聯方向變化（僅非嵌入模式）
  if (!props.embedded) {
    screen.orientation?.addEventListener('change', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)
    // 監聽 resize 以支援桌面瀏覽器拉伸測試
    window.addEventListener('resize', handleOrientationChange)
  }
}

/** 停止錄製 */
function stop() {
  if (state.value === 'recording' || state.value === 'paused') {
    handleStopRecording()
  }
}

/** 取消錄製 */
function cancel() {
  handleCancel()
}

defineExpose({
  start,
  stop,
  cancel,
})

// =====================================================================
// 監聽器
// =====================================================================

watch(
  () => props.showGrid,
  (val) => {
    showGridOverlay.value = val
  },
)

// 監聽最大時長達到
watch(
  () => recorder.elapsedTime.value,
  (elapsed) => {
    if (props.maxDuration > 0 && elapsed >= props.maxDuration && state.value === 'recording') {
      handleStopRecording()
    }
  },
)

// =====================================================================
// 掛載/卸載
// =====================================================================

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  screen.orientation?.removeEventListener('change', handleOrientationChange)
  window.removeEventListener('orientationchange', handleOrientationChange)
  window.removeEventListener('resize', handleOrientationChange)

  // 確保恢復頁面滾動
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.height = ''

  cleanup()
})
</script>

<style scoped>
/* ==================== Vue Transitions ====================  */
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
