<template>
  <!-- 視訊通話全螢幕介面 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="video-call">
        <!-- 遠端視訊（主畫面） -->
        <video
          ref="remoteVideoRef"
          autoplay
          playsinline
          class="video-call__remote"
          :class="{ 'video-call__remote--audio-only': callType === 'audio' }"
        />

        <!-- 純語音時顯示頭像 -->
        <div v-if="callType === 'audio'" class="video-call__avatar">
          <div class="video-call__avatar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <span class="video-call__avatar-name">{{ remoteName }}</span>
        </div>

        <!-- 本地視訊（小畫面） -->
        <div class="video-call__local-container">
          <video
            ref="localVideoRef"
            autoplay
            playsinline
            muted
            class="video-call__local"
            :class="{ 'video-call__local--hidden': !isVideoEnabled }"
          />
          <div v-if="!isVideoEnabled" class="video-call__local-muted">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.97 3.97a.75.75 0 011.06 0l15 15a.75.75 0 11-1.06 1.06l-15-15a.75.75 0 010-1.06zM17.25 16.06l2.69 2.69c.944.945 2.56.276 2.56-1.06V6.31c0-1.336-1.616-2.005-2.56-1.06l-2.69 2.69v8.12zM15.75 7.5v8.068l-3.75-3.75V6A2.25 2.25 0 0014.25 3.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 00-.75.75v3.068l-1.5-1.5V6a3.75 3.75 0 013.75-3.75h.75a2.25 2.25 0 012.25 2.25v.878l-.001.121.75.75V4.5a.75.75 0 011.5 0v2.121l.06.06A4.5 4.5 0 0124 10.5v3a.75.75 0 01-1.5 0v-3a3 3 0 00-1.281-2.455l-1.22-1.22V18a2.25 2.25 0 01-2.25 2.25h-.75a.75.75 0 010-1.5h.75a.75.75 0 00.75-.75v-8.068l-3-3z" />
            </svg>
          </div>
        </div>

        <!-- 狀態顯示 -->
        <div class="video-call__status">
          <span v-if="callState === 'calling'">撥號中...</span>
          <span v-else-if="callState === 'connecting'">連線中...</span>
          <span v-else-if="callState === 'connected'">{{ formattedDuration }}</span>
        </div>

        <!-- 控制按鈕 -->
        <div class="video-call__controls">
          <!-- 靜音 -->
          <button
            type="button"
            class="video-call__btn"
            :class="{ 'video-call__btn--active': isMuted }"
            @click="handleToggleMute"
          >
            <svg v-if="!isMuted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v1.386a.75.75 0 01-.224.545l-6 5.5a.75.75 0 01-.276.165V4.5z" />
              <path d="M3.97 3.97a.75.75 0 011.06 0l15 15a.75.75 0 11-1.06 1.06l-15-15a.75.75 0 010-1.06z" />
            </svg>
          </button>

          <!-- 視訊開關 -->
          <button
            v-if="callType === 'video'"
            type="button"
            class="video-call__btn"
            :class="{ 'video-call__btn--active': !isVideoEnabled }"
            @click="handleToggleVideo"
          >
            <svg v-if="isVideoEnabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.97 3.97a.75.75 0 011.06 0l15 15a.75.75 0 11-1.06 1.06l-15-15a.75.75 0 010-1.06z" />
              <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5z" />
            </svg>
          </button>

          <!-- 掛斷 -->
          <button
            type="button"
            class="video-call__btn video-call__btn--end"
            @click="handleEndCall"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                clip-rule="evenodd"
                transform="rotate(135 12 12)"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 視訊通話元件
 * 全螢幕顯示視訊通話介面
 */
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import type { CallType, CallState } from '@/composables/useVideoCall'

// Props
const props = defineProps<{
  /** 是否顯示 */
  isVisible: boolean
  /** 通話狀態 */
  callState: CallState
  /** 通話類型 */
  callType: CallType
  /** 本地串流 */
  localStream: MediaStream | null
  /** 遠端串流 */
  remoteStream: MediaStream | null
  /** 對方名稱 */
  remoteName?: string
}>()

// Emits
const emit = defineEmits<{
  toggleMute: []
  toggleVideo: []
  endCall: []
}>()

// Refs
const localVideoRef = ref<HTMLVideoElement | null>(null)
const remoteVideoRef = ref<HTMLVideoElement | null>(null)

// 狀態
const isMuted = ref(false)
const isVideoEnabled = ref(true)
const duration = ref(0)
let durationTimer: number | null = null

// 計算屬性
const formattedDuration = computed(() => {
  const mins = Math.floor(duration.value / 60)
  const secs = duration.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

// 監聽串流變化
watch(
  () => props.localStream,
  (stream) => {
    if (localVideoRef.value && stream) {
      localVideoRef.value.srcObject = stream
    }
  },
  { immediate: true },
)

watch(
  () => props.remoteStream,
  (stream) => {
    if (remoteVideoRef.value && stream) {
      remoteVideoRef.value.srcObject = stream
    }
  },
  { immediate: true },
)

// 監聽通話狀態
watch(
  () => props.callState,
  (state) => {
    if (state === 'connected') {
      startDurationTimer()
    } else if (state === 'ended' || state === 'idle') {
      stopDurationTimer()
      duration.value = 0
    }
  },
)

// 計時器
const startDurationTimer = () => {
  duration.value = 0
  durationTimer = window.setInterval(() => {
    duration.value++
  }, 1000)
}

const stopDurationTimer = () => {
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }
}

// 事件處理
const handleToggleMute = () => {
  isMuted.value = !isMuted.value
  emit('toggleMute')
}

const handleToggleVideo = () => {
  isVideoEnabled.value = !isVideoEnabled.value
  emit('toggleVideo')
}

const handleEndCall = () => {
  emit('endCall')
}

// 生命週期
onMounted(() => {
  if (props.localStream && localVideoRef.value) {
    localVideoRef.value.srcObject = props.localStream
  }
  if (props.remoteStream && remoteVideoRef.value) {
    remoteVideoRef.value.srcObject = props.remoteStream
  }
})

onUnmounted(() => {
  stopDurationTimer()
})
</script>

<style scoped lang="scss">
.video-call {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  // 遠端視訊
  &__remote {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--audio-only {
      display: none;
    }
  }

  // 純語音頭像
  &__avatar {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

    &-icon {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;

      svg {
        width: 60px;
        height: 60px;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    &-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
    }
  }

  // 本地視訊容器
  &__local-container {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 120px;
    height: 160px;
    border-radius: 12px;
    overflow: hidden;
    background: #1a1a1a;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  &__local {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);

    &--hidden {
      display: none;
    }
  }

  &__local-muted {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2a2a2a;

    svg {
      width: 40px;
      height: 40px;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  // 狀態顯示
  &__status {
    position: absolute;
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem 1.5rem;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    color: white;
    font-size: 1rem;
    font-weight: 500;
  }

  // 控制按鈕
  &__controls {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 1.5rem;
  }

  &__btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    svg {
      width: 28px;
      height: 28px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    &--active {
      background: rgba(255, 255, 255, 0.9);
      color: #333;
    }

    &--end {
      background: #ef4444;

      &:hover {
        background: #dc2626;
      }
    }
  }
}

// 動畫
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
