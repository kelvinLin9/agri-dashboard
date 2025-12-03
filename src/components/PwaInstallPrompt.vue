<template>
  <UCard v-if="showInstallPrompt" class="fixed bottom-4 right-4 max-w-sm shadow-lg z-50">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6 text-green-500" />
          <h3 class="font-semibold">安裝應用程式</h3>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="xs"
          :padded="false"
          @click="dismiss"
        />
      </div>
    </template>
    
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      將農業管理系統安裝到您的裝置，享受更好的使用體驗！
    </p>
    
    <ul class="text-xs text-gray-500 dark:text-gray-500 mb-4 space-y-1">
      <li class="flex items-center gap-2">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
        離線也能使用部分功能
      </li>
      <li class="flex items-center gap-2">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
        更快的載入速度
      </li>
      <li class="flex items-center gap-2">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
        接收即時推送通知
      </li>
    </ul>
    
    <div class="flex gap-2">
      <UButton color="green" block @click="install">
        <template #leading>
          <UIcon name="i-heroicons-arrow-down-tray" />
        </template>
        立即安裝
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // 檢查是否已經提示過
    const hasPrompted = localStorage.getItem('pwa-install-prompted')
    const promptedAt = localStorage.getItem('pwa-install-prompted-at')
    
    // 如果從未提示過，或距離上次提示超過 7 天，則顯示提示
    if (!hasPrompted || (promptedAt && Date.now() - parseInt(promptedAt) > 7 * 24 * 60 * 60 * 1000)) {
      // 延遲 3 秒後顯示，避免打擾用戶
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 3000)
    }
  })
  
  // 監聽安裝成功事件
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA 安裝成功')
    showInstallPrompt.value = false
  })
})

const install = async () => {
  if (!deferredPrompt) return
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  console.log(`用戶選擇：${outcome}`)
  
  if (outcome === 'accepted') {
    console.log('用戶同意安裝 PWA')
  } else {
    console.log('用戶拒絕安裝 PWA')
  }
  
  deferredPrompt = null
  showInstallPrompt.value = false
  
  // 記錄提示時間
  localStorage.setItem('pwa-install-prompted', 'true')
  localStorage.setItem('pwa-install-prompted-at', Date.now().toString())
}

const dismiss = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-prompted', 'true')
  localStorage.setItem('pwa-install-prompted-at', Date.now().toString())
}
</script>
