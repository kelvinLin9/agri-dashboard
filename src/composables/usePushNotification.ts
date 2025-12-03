import { ref, onMounted } from 'vue'
import apiClient from '@/api/apiClient'

/**
 * Push Notification Composable
 * 處理 Web Push 推送通知的訂閱和管理
 */
export function usePushNotification() {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const subscription = ref<PushSubscription | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 檢查瀏覽器支援
   */
  const checkSupport = () => {
    isSupported.value =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    return isSupported.value
  }

  /**
   * 請求通知權限
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = '您的瀏覽器不支援推送通知'
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (err: any) {
      error.value = '無法請求通知權限：' + err.message
      return false
    }
  }

  /**
   * 訂閱推送通知
   */
  const subscribeToPush = async (): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = '您的瀏覽器不支援推送通知'
      return false
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        error.value = '需要通知權限才能訂閱推送'
        return false
      }
    }

    isLoading.value = true
    error.value = null

    try {
      // 等待 Service Worker 準備就緒
      const registration = await navigator.serviceWorker.ready

      // 從後端獲取 VAPID public key
      const response = await apiClient.get('/notifications/vapid-public-key')
      const vapidPublicKey = response.data.data.publicKey

      // 訂閱推送
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      })

      subscription.value = sub

      // 傳送訂閱資訊到後端
      await apiClient.post('/notifications/push-subscribe', {
        subscription: sub.toJSON()
      })

      isSubscribed.value = true
      console.log('✅ 推送通知訂閱成功')
      return true
    } catch (err: any) {
      error.value = '訂閱推送通知失敗：' + err.message
      console.error('❌ 訂閱失敗:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 取消訂閱
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription.value) {
      error.value = '沒有找到訂閱'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      await subscription.value.unsubscribe()

      // 通知後端
      await apiClient.post('/notifications/push-unsubscribe', {
        endpoint: subscription.value.endpoint
      })

      subscription.value = null
      isSubscribed.value = false
      console.log('✅ 已取消訂閱推送通知')
      return true
    } catch (err: any) {
      error.value = '取消訂閱失敗：' + err.message
      console.error('❌ 取消訂閱失敗:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 檢查現有訂閱
   */
  const checkSubscription = async () => {
    if (!isSupported.value) return

    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()

      if (sub) {
        subscription.value = sub
        isSubscribed.value = true
        console.log('📝 找到現有的推送訂閱')
      }
    } catch (err: any) {
      console.error('檢查訂閱失敗:', err)
    }
  }

  /**
   * 初始化
   */
  onMounted(() => {
    checkSupport()
    if (isSupported.value) {
      checkSubscription()
    }
  })

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribe,
    checkSubscription
  }
}

/**
 * 將 VAPID public key 從 base64url 轉換為 Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
