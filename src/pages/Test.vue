<template>
  <div class="flex h-screen flex-col items-center justify-center bg-gray-900 p-4">
    <!-- 頂部標籤 -->
    <div class="mb-4 text-center">
      <p class="text-lg font-semibold text-white">走路步態背面拍攝-錄製中(近)</p>
    </div>

    <!-- 視頻預覽區域 -->
    <div class="relative w-full max-w-4xl flex-1 overflow-hidden rounded-lg bg-black">
      <!-- 視頻元素 -->
      <video ref="videoElement" autoplay playsinline class="h-full w-full object-cover"></video>

      <!-- 網格疊加層 -->
      <div class="pointer-events-none absolute inset-0">
        <!-- 垂直線 -->
        <div
          class="absolute top-0 left-1/3 h-full w-px border-l border-dashed border-white opacity-50"
        ></div>
        <div
          class="absolute top-0 left-2/3 h-full w-px border-l border-dashed border-white opacity-50"
        ></div>
        <!-- 水平線 -->
        <div
          class="absolute top-1/3 left-0 h-px w-full border-t border-dashed border-white opacity-50"
        ></div>
        <div
          class="absolute top-2/3 left-0 h-px w-full border-t border-dashed border-white opacity-50"
        ></div>
      </div>

      <!-- 人形輪廓疊加層（簡化版本） -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg width="200" height="400" viewBox="0 0 200 400" class="opacity-60">
          <!-- 頭部 -->
          <ellipse cx="100" cy="50" rx="30" ry="35" fill="none" stroke="#4ade80" stroke-width="3" />
          <!-- 身體 -->
          <rect
            x="70"
            y="85"
            width="60"
            height="120"
            fill="none"
            stroke="#4ade80"
            stroke-width="3"
            rx="5"
          />
          <!-- 左手臂 -->
          <line x1="70" y1="120" x2="30" y2="180" stroke="#4ade80" stroke-width="3" />
          <!-- 右手臂 -->
          <line x1="130" y1="120" x2="170" y2="180" stroke="#4ade80" stroke-width="3" />
          <!-- 左腿 -->
          <line x1="85" y1="205" x2="60" y2="320" stroke="#4ade80" stroke-width="3" />
          <!-- 右腿 -->
          <line x1="115" y1="205" x2="140" y2="320" stroke="#4ade80" stroke-width="3" />
        </svg>
      </div>

      <!-- 錄製指示器 -->
      <div
        v-if="isRecording"
        class="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2"
      >
        <div class="h-3 w-3 animate-pulse rounded-full bg-white"></div>
        <span class="text-sm font-semibold text-white">錄製中</span>
      </div>
    </div>

    <!-- 底部控制欄 -->
    <div class="mt-4 flex w-full max-w-4xl items-center justify-center gap-6">
      <!-- 左側按鈕（圖庫/照片） -->
      <button
        class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all hover:bg-blue-600 active:scale-95"
        @click="handleGalleryClick"
      >
        <UIcon name="i-heroicons-photo" class="h-8 w-8" />
      </button>

      <!-- 計時器 -->
      <div class="flex items-center gap-2 rounded-full bg-white px-6 py-3 shadow-lg">
        <UIcon name="i-heroicons-clock" class="h-5 w-5 text-gray-700" />
        <span class="text-lg font-semibold text-gray-900">{{ formattedTime }}</span>
      </div>

      <!-- 錄製按鈕 -->
      <button
        class="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 active:scale-95"
        :class="{ 'animate-pulse': isRecording }"
        @click="toggleRecording"
      >
        <UIcon v-if="!isRecording" name="i-heroicons-video-camera" class="h-10 w-10" />
        <div v-else class="h-8 w-8 rounded bg-white"></div>
      </button>

      <!-- 右側按鈕（切換攝像頭/設置） -->
      <button
        class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-all hover:bg-blue-600 active:scale-95"
        @click="handleSettingsClick"
      >
        <UIcon name="i-heroicons-cog-6-tooth" class="h-8 w-8" />
      </button>
    </div>

    <!-- 錄製完成提示 -->
    <div v-if="recordedBlob" class="mt-4 flex items-center gap-4 rounded-lg bg-white p-4 shadow-lg">
      <span class="text-sm font-semibold text-gray-700">錄製完成</span>
      <button
        class="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
        @click="downloadRecording"
      >
        下載
      </button>
      <button
        class="rounded-full bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
        @click="clearRecording"
      >
        清除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

// 視頻元素引用
const videoElement = ref<HTMLVideoElement | null>(null)

// 錄製狀態
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedChunks = ref<Blob[]>([])
const recordedBlob = ref<Blob | null>(null)
const stream = ref<MediaStream | null>(null)

// 計時器
const elapsedTime = ref(0)
let timerInterval: number | null = null

// 格式化時間顯示
const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60)
  const seconds = elapsedTime.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 初始化攝像頭
async function initCamera() {
  try {
    // 請求攝像頭和麥克風權限
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 使用後置攝像頭（移動設備）
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: true,
    })

    stream.value = mediaStream

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream
    }
  } catch (error) {
    console.error('無法訪問攝像頭:', error)
    alert('無法訪問攝像頭，請檢查權限設置')
  }
}

// 開始錄製
function startRecording() {
  if (!stream.value) {
    alert('請先初始化攝像頭')
    return
  }

  try {
    // 檢查瀏覽器是否支持 MediaRecorder
    if (!window.MediaRecorder) {
      alert('您的瀏覽器不支持錄製功能')
      return
    }

    // 檢查支持的 MIME 類型
    const options: MediaRecorderOptions = {
      mimeType: 'video/webm;codecs=vp8,opus',
    }

    // 如果不支持 webm，嘗試其他格式
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm'
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        options.mimeType = 'video/mp4'
      } else {
        // 使用瀏覽器默認格式
        delete options.mimeType
      }
    }

    // 創建 MediaRecorder 實例
    const recorder = new MediaRecorder(stream.value, options)
    mediaRecorder.value = recorder

    // 清空之前的錄製數據
    recordedChunks.value = []

    // 處理數據可用事件
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    // 處理錄製停止事件
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks.value, {
        type: mediaRecorder.value?.mimeType || 'video/webm',
      })
      recordedBlob.value = blob
      console.log('錄製完成，文件大小:', blob.size, 'bytes')
    }

    // 處理錯誤事件
    recorder.onerror = (event: Event) => {
      console.error('錄製錯誤:', event)
      alert('錄製過程中發生錯誤')
    }

    // 開始錄製
    recorder.start(1000) // 每 1 秒收集一次數據
    isRecording.value = true

    // 開始計時器
    elapsedTime.value = 0
    timerInterval = window.setInterval(() => {
      elapsedTime.value++
    }, 1000)
  } catch (error) {
    console.error('開始錄製失敗:', error)
    alert('開始錄製失敗，請重試')
  }
}

// 停止錄製
function stopRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    // 停止計時器
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}

// 切換錄製狀態
function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 下載錄製文件
function downloadRecording() {
  if (!recordedBlob.value) {
    return
  }

  const url = URL.createObjectURL(recordedBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `錄製_${new Date().toISOString().replace(/[:.]/g, '-')}.${
    recordedBlob.value.type.includes('mp4') ? 'mp4' : 'webm'
  }`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 清除錄製
function clearRecording() {
  recordedBlob.value = null
  recordedChunks.value = []
  elapsedTime.value = 0
}

// 處理圖庫點擊
function handleGalleryClick() {
  console.log('打開圖庫')
  // TODO: 實現圖庫功能
}

// 處理設置點擊
function handleSettingsClick() {
  console.log('打開設置')
  // TODO: 實現設置功能
}

// 組件掛載時初始化攝像頭
onMounted(() => {
  initCamera()
})

// 組件卸載時清理資源
onBeforeUnmount(() => {
  // 停止錄製
  if (isRecording.value) {
    stopRecording()
  }

  // 停止計時器
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  // 停止所有媒體軌道
  if (stream.value) {
    stream.value.getTracks().forEach((track) => {
      track.stop()
    })
  }

  // 清理錄製器
  if (mediaRecorder.value) {
    mediaRecorder.value = null
  }
})
</script>

<style scoped>
/* 確保視頻元素正確顯示 */
video {
  transform: scaleX(-1); /* 鏡像翻轉，讓預覽更自然 */
}

/* 動畫效果 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
