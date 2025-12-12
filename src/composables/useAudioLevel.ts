import { ref, onBeforeUnmount, type Ref } from 'vue'

/**
 * 音量計 Composable
 *
 * 用於即時顯示錄音音量（VU Meter）
 * 使用 Web Audio API 分析音訊流
 */
export function useAudioLevel(stream: Ref<MediaStream | null>) {
  const audioLevel = ref(0) // 0-100
  const isMuted = ref(false)

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let microphone: MediaStreamAudioSourceNode | null = null
  let animationId: number | null = null

  /**
   * 初始化音訊分析器
   */
  function initAudioAnalyser() {
    if (!stream.value) return

    try {
      // 創建 AudioContext
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // 創建分析器
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8

      // 連接音訊源
      microphone = audioContext.createMediaStreamSource(stream.value)
      microphone.connect(analyser)

      // 開始分析
      startAnalysis()
    } catch (error) {
      console.error('Failed to initialize audio analyser:', error)
    }
  }

  /**
   * 開始分析音量
   */
  function startAnalysis() {
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateLevel = () => {
      if (!analyser) return

      analyser.getByteFrequencyData(dataArray)

      // 計算平均音量
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] ?? 0
      }
      const average = sum / bufferLength

      // 轉換為 0-100
      audioLevel.value = Math.min(100, Math.round((average / 255) * 100))

      // 檢測靜音
      isMuted.value = audioLevel.value < 1

      animationId = requestAnimationFrame(updateLevel)
    }

    updateLevel()
  }

  /**
   * 停止分析
   */
  function stopAnalysis() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    if (microphone) {
      microphone.disconnect()
      microphone = null
    }

    if (audioContext) {
      audioContext.close()
      audioContext = null
    }

    analyser = null
    audioLevel.value = 0
  }

  // 組件卸載時清理
  onBeforeUnmount(() => {
    stopAnalysis()
  })

  return {
    audioLevel,
    isMuted,
    initAudioAnalyser,
    stopAnalysis,
  }
}
