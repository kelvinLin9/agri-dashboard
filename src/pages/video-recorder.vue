<template>
  <div class="mx-auto max-w-3xl p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-gray-900">測試錄影</h1>
      <p class="text-gray-500">此頁面用於測試 VideoRecorder 元件的功能</p>
    </div>

    <div class="flex flex-col gap-6">
      <!-- 設定區 -->
      <div class="rounded-xl bg-gray-50 p-5">
        <h2 class="mb-4 text-base font-semibold text-gray-700">錄影設定</h2>

        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">方向要求</label>
          <select
            v-model="settings.orientation"
            class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="landscape">橫式 (Landscape)</option>
            <option value="portrait">直式 (Portrait)</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">最大時長</label>
          <select
            v-model.number="settings.maxDuration"
            class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
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
            <input v-model="settings.fullscreen" type="checkbox" class="h-4 w-4" />
            全螢幕模式
          </label>
        </div>

        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">編碼模式</label>
          <select
            v-model="settings.codecMode"
            class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option
              v-for="codec in codecOptions"
              :key="codec.value"
              :value="codec.value"
              :disabled="!codec.supported"
            >
              {{ codec.label }}{{ !codec.supported ? ' ❌' : '' }}
            </option>
          </select>
        </div>

        <!-- 遷入模式選項暫時註解
        <div class="mb-3">
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <input v-model="settings.embedded" type="checkbox" class="w-4 h-4" />
            嵌入模式（不使用 Teleport）
          </label>
        </div>
        -->
      </div>

      <!-- 開始按鈕 -->
      <button
        class="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
        @click="startRecording"
      >
        🎬 開始錄影
      </button>

      <!-- 結果區 -->
      <div v-if="recordedVideo" class="rounded-xl border border-green-300 bg-green-50 p-5">
        <h2 class="mb-4 text-base font-semibold text-green-800">錄製結果</h2>
        <video :src="recordedVideo.url" controls class="max-h-96 w-full rounded-lg bg-black" />
        <div class="mt-4 space-y-1">
          <p class="text-sm text-gray-700">
            <strong>檔案大小：</strong>{{ formatFileSize(recordedVideo.blob.size) }}
          </p>
          <p class="text-sm text-gray-700">
            <strong>錄製時長：</strong>{{ recordedVideo.duration }} 秒
          </p>
          <p class="text-sm text-gray-700">
            <strong>影片解析度：</strong>{{ recordedVideo.width }} × {{ recordedVideo.height }}
          </p>
          <p class="text-sm text-gray-700"><strong>幀率：</strong>30 fps（目標值）</p>
          <p class="text-sm text-gray-700"><strong>格式：</strong>{{ recordedVideo.blob.type }}</p>
        </div>
        <div class="mt-4 flex gap-3">
          <button
            class="rounded-xl bg-blue-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-600"
            @click="downloadVideo"
          >
            ⬇️ 下載影片
          </button>
          <button
            class="rounded-xl bg-red-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-red-600"
            @click="clearVideo"
          >
            🗑️ 清除
          </button>
        </div>
      </div>

      <!-- 日誌區 -->
      <div class="rounded-xl bg-gray-800 p-5">
        <h2 class="mb-4 text-base font-semibold text-gray-100">事件日誌</h2>
        <div class="max-h-52 overflow-y-auto">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="flex gap-3 border-b border-gray-700 py-2 font-mono text-sm"
          >
            <span class="shrink-0 text-gray-400">{{ log.time }}</span>
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
          <div v-if="logs.length === 0" class="py-4 text-center text-gray-500 italic">尚無事件</div>
        </div>
      </div>

      <!-- 裝置資訊區 -->
      <div class="rounded-xl border border-yellow-300 bg-yellow-50 p-5">
        <h2 class="mb-4 text-base font-semibold text-yellow-800">📱 裝置資訊</h2>
        <button
          class="mb-4 rounded-xl bg-blue-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-600"
          @click="loadDeviceInfo"
        >
          🔄 重新讀取
        </button>

        <div v-if="deviceInfo.loading" class="py-4 text-center text-gray-500">讀取中...</div>

        <div v-else-if="deviceInfo.error" class="py-4 text-center text-red-600">
          ❗ {{ deviceInfo.error }}
        </div>

        <template v-else>
          <!-- 攝影機列表 -->
          <div class="mb-4 border-b border-yellow-200 pb-4">
            <h3 class="mb-2 text-sm font-semibold text-yellow-900">
              🎥 可用攝影機 ({{ deviceInfo.cameras.length }})
            </h3>
            <ul v-if="deviceInfo.cameras.length > 0" class="list-disc pl-5">
              <li
                v-for="camera in deviceInfo.cameras"
                :key="camera.deviceId"
                class="mb-1 text-sm text-gray-700"
              >
                <strong>{{ camera.label || '未命名鏡頭' }}</strong>
                <code class="ml-2 rounded bg-black/5 px-1.5 py-0.5 text-xs text-gray-500"
                  >{{ camera.deviceId.slice(0, 16) }}...</code
                >
              </li>
            </ul>
            <p v-else class="text-gray-400 italic">無可用攝影機</p>
          </div>

          <!-- 螢幕資訊 -->
          <div class="mb-4 border-b border-yellow-200 pb-4">
            <h3 class="mb-2 text-sm font-semibold text-yellow-900">📺 螢幕/視窗</h3>
            <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
              <li>
                <strong>螢幕解析度：</strong>{{ deviceInfo.screen.width }} ×
                {{ deviceInfo.screen.height }}
              </li>
              <li>
                <strong>視窗大小：</strong>{{ deviceInfo.window.width }} ×
                {{ deviceInfo.window.height }}
              </li>
              <li><strong>裝置像素比：</strong>{{ deviceInfo.pixelRatio }}x</li>
              <li><strong>目前方向：</strong>{{ deviceInfo.orientation }}</li>
            </ul>
          </div>

          <!-- 瀏覽器支援 -->
          <div class="mb-4 border-b border-yellow-200 pb-4">
            <h3 class="mb-2 text-sm font-semibold text-yellow-900">🌐 瀏覽器支援</h3>
            <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
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
              <li>
                <strong>使用編碼：</strong
                ><code class="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{{
                  deviceInfo.support.actualCodec
                }}</code>
              </li>
            </ul>
          </div>

          <!-- UserAgent -->
          <div>
            <h3 class="mb-2 text-sm font-semibold text-yellow-900">🔍 UserAgent</h3>
            <code
              class="block rounded-lg bg-black/5 px-3 py-2 text-xs leading-relaxed break-all text-gray-500"
            >
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
      :codec-mode="settings.codecMode"
      instruction="請確認孩子的面部五官完整顯示在鏡頭中的九宮格內，然後按下錄影按鈕開始錄製影片"
      @recorded="handleRecorded"
      @cancelled="handleCancelled"
      @error="handleError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import VideoRecorder from '@/components/video/VideoRecorder.vue'

// =====================================================================
// 型別
// =====================================================================

interface RecordedVideo {
  blob: Blob
  url: string
  duration: number
  width: number
  height: number
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
  orientation: 'portrait' as 'landscape' | 'portrait',
  maxDuration: 60,
  showCountdown: true,
  showGrid: true,
  codecMode: 'auto' as 'auto' | 'h264' | 'vp8' | 'vp9' | 'hevc' | 'av1',
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
    vp9: false,
    hevc: false,
    av1: false,
    actualCodec: '',
  },
})

// 編碼選項（根據瀏覽器支援動態生成）
const codecOptions = computed(() => [
  { value: 'auto', label: '預設（依裝置自動選擇最佳編碼）', supported: true },
  {
    value: 'h264',
    label: 'H.264（相容性最佳，iOS/Android 硬體加速）',
    supported: deviceInfo.support.h264,
  },
  { value: 'vp8', label: 'VP8（開源格式，桌面瀏覽器廣泛支援）', supported: deviceInfo.support.vp8 },
  { value: 'vp9', label: 'VP9（VP8 進化版，壓縮效率更高）', supported: deviceInfo.support.vp9 },
  { value: 'hevc', label: 'H.265/HEVC（目前瀏覽器支援有限）', supported: deviceInfo.support.hevc },
  {
    value: 'av1',
    label: 'AV1（最新開源標準，壓縮效率最佳但支援較少）',
    supported: deviceInfo.support.av1,
  },
])

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

  const url = URL.createObjectURL(result.blob)

  // 透過 video 元素取得實際解析度
  const video = document.createElement('video')
  video.src = url
  video.onloadedmetadata = () => {
    recordedVideo.value = {
      blob: result.blob,
      url,
      duration: result.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    }
    addLog(`影片解析度: ${video.videoWidth} × ${video.videoHeight}`, 'info')
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

  // 根據 MIME type 決定副檔名
  const mimeType = recordedVideo.value.blob.type
  let extension = 'webm'
  if (mimeType.includes('mp4')) {
    extension = 'mp4'
  } else if (mimeType.includes('webm')) {
    extension = 'webm'
  } else if (mimeType.includes('quicktime') || mimeType.includes('mov')) {
    extension = 'mov'
  }

  const link = document.createElement('a')
  link.href = recordedVideo.value.url
  link.download = `recording-${Date.now()}.${extension}`
  link.click()

  addLog(`開始下載影片 (.${extension})`, 'info')
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
    if (
      'userAgentData' in navigator &&
      (navigator as Navigator & { userAgentData?: { mobile: boolean } }).userAgentData
    ) {
      deviceInfo.isMobile = (
        navigator as Navigator & { userAgentData: { mobile: boolean } }
      ).userAgentData.mobile
    } else {
      const userAgent = navigator.userAgent.toLowerCase()
      deviceInfo.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      )
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

    // 編碼格式支援檢測（同時檢測 WebM 和 MP4 容器）
    deviceInfo.support.h264 =
      MediaRecorder.isTypeSupported('video/webm;codecs=h264') ||
      MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ||
      MediaRecorder.isTypeSupported('video/mp4')
    deviceInfo.support.vp8 = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    deviceInfo.support.vp9 = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    deviceInfo.support.hevc =
      MediaRecorder.isTypeSupported('video/mp4;codecs=hvc1') ||
      MediaRecorder.isTypeSupported('video/mp4;codecs=hevc') ||
      MediaRecorder.isTypeSupported('video/mp4;codecs=hev1')
    deviceInfo.support.av1 =
      MediaRecorder.isTypeSupported('video/webm;codecs=av1,opus') ||
      MediaRecorder.isTypeSupported('video/mp4;codecs=av01')

    // 計算實際會使用的預估編碼
    if (deviceInfo.support.h264) {
      if (
        MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ||
        MediaRecorder.isTypeSupported('video/mp4')
      ) {
        deviceInfo.support.actualCodec = 'video/mp4;codecs=avc1 (相容性最佳)'
      } else {
        deviceInfo.support.actualCodec = 'video/webm;codecs=h264 (標準)'
      }
    } else if (deviceInfo.support.vp8) {
      deviceInfo.support.actualCodec = 'video/webm;codecs=vp8 (高品質)'
    } else {
      deviceInfo.support.actualCodec = '瀏覽器自動選擇'
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
