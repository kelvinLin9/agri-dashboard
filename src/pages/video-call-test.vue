<template>
  <div class="video-call-test">
    <!-- 頁面標題 -->
    <div class="video-call-test__header">
      <h1>視訊通話測試</h1>
      <p class="video-call-test__status">
        連線狀態：
        <span :class="isConnected ? 'status--online' : 'status--offline'">
          {{ isConnected ? '已連線' : '未連線' }}
        </span>
      </p>
    </div>

    <!-- 連線按鈕 -->
    <div v-if="!isConnected" class="video-call-test__connect">
      <UButton size="lg" @click="connect">
        連線到視訊通話伺服器
      </UButton>
    </div>

    <!-- 主要內容 -->
    <div v-else class="video-call-test__content">
      <!-- 撥號區塊 -->
      <UCard class="video-call-test__card">
        <template #header>
          <h3>發起通話</h3>
        </template>

        <div class="video-call-test__form">
          <UFormField label="目標用戶 ID">
            <UInput
              v-model="targetId"
              placeholder="輸入對方的 User ID (UUID)"
              size="lg"
            />
          </UFormField>

          <div class="video-call-test__call-type">
            <URadioGroup v-model="selectedCallType" :items="callTypeOptions" />
          </div>

          <div class="video-call-test__actions">
            <UButton
              size="lg"
              color="primary"
              :disabled="!targetId || isInCall"
              :loading="callState === 'calling'"
              @click="handleStartCall"
            >
              {{ callState === 'calling' ? '撥號中...' : '發起通話' }}
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- 通話狀態 -->
      <UCard class="video-call-test__card">
        <template #header>
          <h3>目前狀態</h3>
        </template>

        <div class="video-call-test__info">
          <div class="info-row">
            <span class="info-label">通話狀態</span>
            <span class="info-value">{{ callStateText }}</span>
          </div>
          <div v-if="currentCallId" class="info-row">
            <span class="info-label">通話 ID</span>
            <span class="info-value">{{ currentCallId }}</span>
          </div>
        </div>
      </UCard>

      <!-- 使用說明 -->
      <UCard class="video-call-test__card">
        <template #header>
          <h3>使用說明</h3>
        </template>

        <ol class="video-call-test__instructions">
          <li>在兩個不同的瀏覽器（或無痕視窗）登入不同帳號</li>
          <li>兩邊都開啟此測試頁面</li>
          <li>確認兩邊都顯示「已連線」</li>
          <li>在其中一邊輸入另一方的 User ID，點擊「發起通話」</li>
          <li>另一方會收到來電提示，點擊接聽</li>
        </ol>

        <UAlert
          class="mt-4"
          color="warning"
          title="注意事項"
          description="WebRTC 在非 localhost 環境需要 HTTPS 才能使用攝影機"
        />
      </UCard>

      <!-- 我的 User ID -->
      <UCard class="video-call-test__card">
        <template #header>
          <h3>我的資訊</h3>
        </template>

        <div class="video-call-test__my-id">
          <p>將以下 ID 分享給對方：</p>
          <code class="video-call-test__id-code">{{ myUserId }}</code>
          <UButton size="sm" variant="ghost" @click="copyMyId">
            複製
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- 來電提示 -->
    <IncomingCallModal
      :is-visible="!!incomingCall"
      :caller-name="incomingCall?.callerName || '未知用戶'"
      :call-type="incomingCall?.type || 'video'"
      @accept="acceptCall"
      @reject="rejectCall"
    />

    <!-- 通話介面 -->
    <VideoCall
      :is-visible="['calling', 'connecting', 'connected'].includes(callState)"
      :call-state="callState"
      :call-type="callType"
      :local-stream="localStream"
      :remote-stream="remoteStream"
      :remote-name="incomingCall?.callerName"
      @toggle-mute="toggleMute"
      @toggle-video="toggleVideo"
      @end-call="endCall"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 視訊通話測試頁面
 * 用於測試 1 對 1 視訊通話功能
 */
import { ref, computed, onMounted } from 'vue'
import { useVideoCall, type CallType } from '@/composables/useVideoCall'
import VideoCall from '@/components/video/VideoCall.vue'
import IncomingCallModal from '@/components/video/IncomingCallModal.vue'
import { useToast } from '@/composables/useToast'

// 頁面設定
// Composables
const toast = useToast()
const {
  isConnected,
  callState,
  currentCallId,
  incomingCall,
  callType,
  localStream,
  remoteStream,
  isInCall,
  connect,
  startCall,
  acceptCall,
  rejectCall,
  endCall,
  toggleMute,
  toggleVideo,
} = useVideoCall()

// 狀態
const targetId = ref('')
const selectedCallType = ref<CallType>('video')

// 通話類型選項
const callTypeOptions = [
  { value: 'video', label: '視訊通話' },
  { value: 'audio', label: '純語音通話' },
]

// 我的 User ID
const myUserId = computed(() => {
  try {
    const token = localStorage.getItem('access_token')
    if (token) {
      const parts = token.split('.')
      const payloadPart = parts[1]
      if (payloadPart) {
        const payload = JSON.parse(atob(payloadPart))
        return payload.sub || '未知'
      }
    }
  } catch {
    // ignore
  }
  return '未知'
})

// 通話狀態文字
const callStateText = computed(() => {
  const map: Record<string, string> = {
    idle: '閒置',
    calling: '撥號中',
    incoming: '來電中',
    connecting: '連線中',
    connected: '通話中',
    ended: '已結束',
  }
  return map[callState.value] || callState.value
})

// 發起通話
const handleStartCall = async () => {
  if (!targetId.value) {
    toast.add({
      title: '請輸入目標用戶 ID',
      color: 'error',
    })
    return
  }

  const result = await startCall(targetId.value, {
    type: selectedCallType.value,
    onEnded: (reason) => {
      toast.add({
        title: '通話結束',
        description: reason,
        color: 'info',
      })
    },
  })

  if (!result.success) {
    toast.add({
      title: '發起通話失敗',
      description: result.message || result.error,
      color: 'error',
    })
  }
}

// 複製我的 ID
const copyMyId = async () => {
  try {
    await navigator.clipboard.writeText(myUserId.value)
    toast.add({
      title: '已複製到剪貼簿',
      color: 'success',
    })
  } catch {
    toast.add({
      title: '複製失敗',
      color: 'error',
    })
  }
}

// 頁面載入時自動連線
onMounted(() => {
  connect()
})
</script>

<style scoped lang="scss">
.video-call-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  &__header {
    text-align: center;
    margin-bottom: 2rem;

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
  }

  &__status {
    font-size: 1rem;
    color: var(--color-text-secondary);

    .status--online {
      color: #22c55e;
      font-weight: 600;
    }

    .status--offline {
      color: #ef4444;
      font-weight: 600;
    }
  }

  &__connect {
    text-align: center;
    padding: 3rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  &__card {
    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__call-type {
    padding: 0.5rem 0;
  }

  &__actions {
    padding-top: 0.5rem;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      color: var(--color-text-secondary);
    }

    .info-value {
      font-weight: 500;
      font-family: monospace;
    }
  }

  &__instructions {
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    li {
      color: var(--color-text-secondary);
    }
  }

  &__my-id {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    p {
      margin: 0;
      color: var(--color-text-secondary);
    }
  }

  &__id-code {
    background: var(--color-bg-secondary);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.875rem;
    word-break: break-all;
  }
}
</style>
