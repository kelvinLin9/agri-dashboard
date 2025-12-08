<template>
  <div v-if="isVisible" class="flex items-center gap-2">
    <UIcon :name="iconName" :class="iconClass" />
    <span :class="textClass">
      <template v-if="isExpired">
        已超時
      </template>
      <template v-else>
        剩餘 {{ formattedTime }}
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  /** 訂單建立時間 */
  createdAt: string
  /** 超時時間（分鐘），預設 30 */
  timeoutMinutes?: number
  /** 是否顯示秒數 */
  showSeconds?: boolean
}>(), {
  timeoutMinutes: 30,
  showSeconds: true,
})

const emit = defineEmits<{
  /** 當倒數結束時觸發 */
  expired: []
  /** 當剩餘時間少於 5 分鐘時觸發 */
  warning: []
}>()

// State
const remainingSeconds = ref(0)
const hasEmittedWarning = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

// Computed
const isVisible = computed(() => remainingSeconds.value >= 0)
const isExpired = computed(() => remainingSeconds.value <= 0)
const isWarning = computed(() => remainingSeconds.value > 0 && remainingSeconds.value <= 300) // 5 分鐘

const formattedTime = computed(() => {
  if (remainingSeconds.value <= 0) return '0:00'
  
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  
  if (props.showSeconds) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes} 分鐘`
})

const iconName = computed(() => {
  if (isExpired.value) return 'i-heroicons-exclamation-circle'
  if (isWarning.value) return 'i-heroicons-clock'
  return 'i-heroicons-clock'
})

const iconClass = computed(() => {
  if (isExpired.value) return 'text-red-500'
  if (isWarning.value) return 'text-orange-500 animate-pulse'
  return 'text-gray-400'
})

const textClass = computed(() => {
  if (isExpired.value) return 'text-red-500 font-semibold'
  if (isWarning.value) return 'text-orange-500 font-semibold'
  return 'text-gray-500'
})

// Methods
const calculateRemaining = () => {
  const created = new Date(props.createdAt).getTime()
  const deadline = created + (props.timeoutMinutes * 60 * 1000)
  const now = Date.now()
  const remaining = Math.floor((deadline - now) / 1000)
  
  remainingSeconds.value = Math.max(0, remaining)
  
  // 發送事件
  if (remaining <= 0) {
    emit('expired')
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  } else if (remaining <= 300 && !hasEmittedWarning.value) {
    hasEmittedWarning.value = true
    emit('warning')
  }
}

const startTimer = () => {
  calculateRemaining()
  intervalId = setInterval(calculateRemaining, 1000)
}

// Lifecycle
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Watch for createdAt changes
watch(() => props.createdAt, () => {
  hasEmittedWarning.value = false
  if (intervalId) {
    clearInterval(intervalId)
  }
  startTimer()
})
</script>
