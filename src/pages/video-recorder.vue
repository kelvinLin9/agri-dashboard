<template>
  <div class="max-w-3xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">測試錄影</h1>
      <p class="text-gray-500">此頁面用於測試 VideoRecorder 元件的功能</p>
    </div>

    <div class="flex flex-col gap-6">
      <!-- 設定區 -->
      <div class="bg-gray-50 rounded-xl p-5">
        <h2 class="text-base font-semibold text-gray-700 mb-4">錄影設定</h2>

        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">方向要求</label>
          <select
            v-model="settings.orientation"
            class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="landscape">橫式 (Landscape)</option>
            <option value="portrait">直式 (Portrait)</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">最大時長</label>
          <select
            v-model.number="settings.maxDuration"
            class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option :value="15">15 秒</option>
            <option :value="30">30 秒</option>
            <option :value="60">60 秒</option>
            <option :value="120">2 分鐘</option>
            <option :value="0">無限制</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <input v-model="settings.fullscreen" type="checkbox" class="w-4 h-4" />
            全螢幕模式
          </label>
        </div>

        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <input v-model="settings.embedded" type="checkbox" class="w-4 h-4" />
            嵌入模式（不使用 Teleport）
          </label>
        </div>
      </div>

      <!-- 開始按鈕 -->
      <button
        class="px-6 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
        @click="startRecording"
      >
        🎬 開始錄影
      </button>

      <!-- 結果區 -->
      <div v-if="recordedVideo" class="bg-green-50 border border-green-300 rounded-xl p-5">
        <h2 class="text-base font-semibold text-green-800 mb-4">錄製結果</h2>
        <video :src="recordedVideo.url" controls class="w-full max-h-96 rounded-lg bg-black" />
        <div class="mt-4 space-y-1">
          <p class="text-sm text-gray-700"><strong>檔案大小：</strong>{{ formatFileSize(recordedVideo.blob.size) }}</p>
          <p class="text-sm text-gray-700"><strong>錄製時長：</strong>{{ recordedVideo.duration }} 秒</p>
          <p class="text-sm text-gray-700"><strong>格式：</strong>{{ recordedVideo.blob.type }}</p>
        </div>
        <div class="flex gap-3 mt-4">
          <button
            class="px-6 py-3 rounded-xl text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            @click="downloadVideo"
          >
            ⬇️ 下載影片
          </button>
          <button
            class="px-6 py-3 rounded-xl text-base font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
            @click="clearVideo"
          >
            🗑️ 清除
          </button>
        </div>
      </div>

      <!-- 日誌區 -->
      <div class="bg-gray-800 rounded-xl p-5">
        <h2 class="text-base font-semibold text-gray-100 mb-4">事件日誌</h2>
        <div class="max-h-52 overflow-y-auto">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="flex gap-3 py-2 border-b border-gray-700 text-sm font-mono"
          >
            <span class="text-gray-400 shrink-0">{{ log.time }}</span>
            <span
              :class="{
                'text-gray-200': log.type === 'info',
                'text-green-400': log.type === 'success',
                'text-yellow-400': log.type === 'warning',
                'text-red-400': log.type === 'error',
              }"
            >
              {{ log.message }}
            </span>
          </div>
          <div v-if="logs.length === 0" class="text-gray-500 italic text-center py-4">尚無事件</div>
        </div>
      </div>

      <!-- 裝置資訊區 -->
      <div class="bg-yellow-50 border border-yellow-300 rounded-xl p-5">
        <h2 class="text-base font-semibold text-yellow-800 mb-4">📱 裝置資訊</h2>
        <button
          class="mb-4 px-6 py-3 rounded-xl text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          @click="loadDeviceInfo"
        >
          🔄 重新讀取
        </button>

        <div v-if="deviceInfo.loading" class="text-gray-500 text-center py-4">讀取中...</div>

        <div v-else-if="deviceInfo.error" class="text-red-600 text-center py-4">
          ❗ {{ deviceInfo.error }}
        </div>

        <template v-else>
          <!-- 攝影機列表 -->
          <div class="mb-4 pb-4 border-b border-yellow-200">
            <h3 class="text-sm font-semibold text-yellow-900 mb-2">🎥 可用攝影機 ({{ deviceInfo.cameras.length }})</h3>
            <ul v-if="deviceInfo.cameras.length > 0" class="pl-5 list-disc">
              <li v-for="camera in deviceInfo.cameras" :key="camera.deviceId" class="text-sm text-gray-700 mb-1">
                <strong>{{ camera.label || '未命名鏡頭' }}</strong>
                <code class="ml-2 px-1.5 py-0.5 bg-black/5 rounded text-xs text-gray-500">{{ camera.deviceId.slice(0, 16) }}...</code>
              </li>
            </ul>
            <p v-else class="text-gray-400 italic">無可用攝影機</p>
          </div>

          <!-- 螢幕資訊 -->
          <div class="mb-4 pb-4 border-b border-yellow-200">
            <h3 class="text-sm font-semibold text-yellow-900 mb-2">📺 螢幕/視窗</h3>
            <ul class="pl-5 list-disc text-sm text-gray-700 space-y-1">
              <li><strong>螢幕解析度：</strong>{{ deviceInfo.screen.width }} × {{ deviceInfo.screen.height }}</li>
              <li><strong>視窗大小：</strong>{{ deviceInfo.window.width }} × {{ deviceInfo.window.height }}</li>
              <li><strong>裝置像素比：</strong>{{ deviceInfo.pixelRatio }}x</li>
              <li><strong>目前方向：</strong>{{ deviceInfo.orientation }}</li>
            </ul>
          </div>

          <!-- 瀏覽器支援 -->
          <div class="mb-4 pb-4 border-b border-yellow-200">
            <h3 class="text-sm font-semibold text-yellow-900 mb-2">🌐 瀏覽器支援</h3>
            <ul class="pl-5 list-disc text-sm text-gray-700 space-y-1">
              <li>
                <strong>行動裝置偵測：</strong>
                <span :class="deviceInfo.isMobile ? 'text-blue-600' : 'text-gray-600'">
                  {{ deviceInfo.isMobile ? '📱 是（將使用 H.264）' : '💻 否（將使用 VP8）' }}
                </span>
              </li>
              <li>
                <strong>MediaRecorder：</strong>
                <span :class="deviceInfo.support.mediaRecorder ? 'text-green-600' : 'text-red-600'">
                  {{ deviceInfo.support.mediaRecorder ? '✅ 支援' : '❌ 不支援' }}
                </span>
              </li>
              <li>
                <strong>H.264 硬體加速：</strong>
                <span :class="deviceInfo.support.h264 ? 'text-green-600' : 'text-yellow-600'">
                  {{ deviceInfo.support.h264 ? '✅ 支援' : '⚠️ 不支援' }}
                </span>
              </li>
              <li>
                <strong>VP8/VP9：</strong>
                <span :class="deviceInfo.support.vp8 ? 'text-green-600' : 'text-yellow-600'">
                  {{ deviceInfo.support.vp8 ? '✅ 支援' : '⚠️ 不支援' }}
                </span>
              </li>
              <li>
                <strong>getUserMedia：</strong>
                <span :class="deviceInfo.support.getUserMedia ? 'text-green-600' : 'text-red-600'">
                  {{ deviceInfo.support.getUserMedia ? '✅ 支援' : '❌ 不支援' }}
                </span>
              </li>
              <li>
                <strong>Fullscreen API：</strong>
                <span :class="deviceInfo.support.fullscreen ? 'text-green-600' : 'text-red-600'">
                  {{ deviceInfo.support.fullscreen ? '✅ 支援' : '❌ 不支援' }}
                </span>
              </li>
              <li><strong>實際使用編碼：</strong><code class="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{{ deviceInfo.support.actualCodec }}</code></li>
            </ul>
          </div>

          <!-- UserAgent -->
          <div>
            <h3 class="text-sm font-semibold text-yellow-900 mb-2">🔍 UserAgent</h3>
            <code class="block bg-black/5 px-3 py-2 rounded-lg text-xs text-gray-500 break-all leading-relaxed">
              {{ deviceInfo.userAgent }}
            </code>
          </div>
        </template>
      </div>
    </div>

    <!-- 錄影元件 -->
    <VideoRecorder
      ref="recorderRef"
      :orientation="settings.orientation"
      quality="1080p"
      :max-duration="settings.maxDuration"
      :show-countdown="settings.showCountdown"
      :show-grid="settings.showGrid"
      :fullscreen="settings.fullscreen"
      :embedded="settings.embedded"
      instruction="請開始錄影"
      @recorded="handleRecorded"
      @cancelled="handleCancelled"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import VideoRecorder from '@/components/video/VideoRecorder.vue'

// =====================================================================
// 型別
// =====================================================================

interface RecordedVideo {
  blob: Blob
  url: string
  duration: number
}

interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

// =====================================================================
// 狀態
// =====================================================================

const recorderRef = ref<InstanceType<typeof VideoRecorder> | null>(null)

const settings = reactive({
  orientation: 'landscape' as 'landscape' | 'portrait',
  maxDuration: 60,
  showCountdown: true,
  showGrid: true,
  fullscreen: true,
  embedded: false,
})

const recordedVideo = ref<RecordedVideo | null>(null)
const logs = ref<LogEntry[]>([])

// 裝置資訊
interface CameraInfo {
  deviceId: string
  label: string
}

const deviceInfo = reactive({
  loading: false,
  error: '',
  isMobile: false,
  cameras: [] as CameraInfo[],
  screen: { width: 0, height: 0 },
  window: { width: 0, height: 0 },
  pixelRatio: 1,
  orientation: '',
  userAgent: '',
  support: {
    mediaRecorder: false,
    getUserMedia: false,
    fullscreen: false,
    h264: false,
    vp8: false,
    actualCodec: '',
  },
})

// =====================================================================
// 方法
// =====================================================================

function addLog(message: string, type: LogEntry['type'] = 'info') {
  const now = new Date()
  const time = now.toLocaleTimeString('zh-TW', { hour12: false })
  logs.value.unshift({ time, message, type })

  // 最多保留 50 條
  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function startRecording() {
  addLog('開始錄影流程', 'info')
  recorderRef.value?.start()
}

function handleRecorded(result: { blob: Blob; duration: number }) {
  addLog(
    `錄製完成！時長: ${result.duration}秒, 大小: ${formatFileSize(result.blob.size)}`,
    'success',
  )

  // 清除舊的 URL
  if (recordedVideo.value?.url) {
    URL.revokeObjectURL(recordedVideo.value.url)
  }

  recordedVideo.value = {
    blob: result.blob,
    url: URL.createObjectURL(result.blob),
    duration: result.duration,
  }
}

function handleCancelled() {
  addLog('使用者取消錄製', 'warning')
}

function handleError(error: { message: string }) {
  addLog(`錯誤: ${error.message}`, 'error')
}

function downloadVideo() {
  if (!recordedVideo.value) return

  const link = document.createElement('a')
  link.href = recordedVideo.value.url
  link.download = `recording-${Date.now()}.webm`
  link.click()

  addLog('開始下載影片', 'info')
}

function clearVideo() {
  if (recordedVideo.value?.url) {
    URL.revokeObjectURL(recordedVideo.value.url)
  }
  recordedVideo.value = null
  addLog('已清除錄製結果', 'info')
}

// 裝置資訊讀取
async function loadDeviceInfo() {
  deviceInfo.loading = true
  deviceInfo.error = ''

  try {
    // 行動裝置偵測
    if ('userAgentData' in navigator && (navigator as Navigator & { userAgentData?: { mobile: boolean } }).userAgentData) {
      deviceInfo.isMobile = (navigator as Navigator & { userAgentData: { mobile: boolean } }).userAgentData.mobile
    } else {
      const userAgent = navigator.userAgent.toLowerCase()
      deviceInfo.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    }

    // 螢幕/視窗資訊
    deviceInfo.screen = { width: screen.width, height: screen.height }
    deviceInfo.window = { width: window.innerWidth, height: window.innerHeight }
    deviceInfo.pixelRatio = window.devicePixelRatio
    deviceInfo.orientation =
      window.innerWidth >= window.innerHeight ? '橫式 (Landscape)' : '直式 (Portrait)'
    deviceInfo.userAgent = navigator.userAgent

    // 瀏覽器支援
    deviceInfo.support.mediaRecorder = typeof MediaRecorder !== 'undefined'
    deviceInfo.support.getUserMedia = !!navigator.mediaDevices?.getUserMedia
    deviceInfo.support.fullscreen = !!document.documentElement.requestFullscreen

    // 編碼格式支援檢測
    deviceInfo.support.h264 = MediaRecorder.isTypeSupported('video/webm;codecs=h264')
    deviceInfo.support.vp8 = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')

    // 計算實際會使用的編碼
    if (deviceInfo.isMobile) {
      // 手機優先 H.264
      if (deviceInfo.support.h264) {
        deviceInfo.support.actualCodec = 'video/webm;codecs=h264 (硬體加速)'
      } else if (deviceInfo.support.vp8) {
        deviceInfo.support.actualCodec = 'video/webm;codecs=vp8 (降級)'
      } else {
        deviceInfo.support.actualCodec = 'video/webm (通用)'
      }
    } else {
      // 電腦優先 VP8
      if (deviceInfo.support.vp8) {
        deviceInfo.support.actualCodec = 'video/webm;codecs=vp8,opus'
      } else if (deviceInfo.support.h264) {
        deviceInfo.support.actualCodec = 'video/webm;codecs=h264'
      } else {
        deviceInfo.support.actualCodec = 'video/webm (通用)'
      }
    }

    // 列舉攝影機
    const devices = await navigator.mediaDevices.enumerateDevices()
    deviceInfo.cameras = devices
      .filter((d) => d.kind === 'videoinput')
      .map((d) => ({ deviceId: d.deviceId, label: d.label }))
  } catch (err) {
    deviceInfo.error = err instanceof Error ? err.message : '讀取失敗'
  } finally {
    deviceInfo.loading = false
  }
}

// 清理
onUnmounted(() => {
  if (recordedVideo.value?.url) {
    URL.revokeObjectURL(recordedVideo.value.url)
  }
})

// 初始化
onMounted(() => {
  loadDeviceInfo()
})
</script>
