<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="showBanner"
      class="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <!-- Icon -->
          <div class="flex-shrink-0 hidden sm:flex">
            <div class="w-12 h-12 rounded-full bg-harvest-100 dark:bg-harvest-900 flex items-center justify-center">
              <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-harvest-600 dark:text-harvest-400" />
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
              🍪 Cookie 使用聲明
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              本網站使用 Cookie 及類似技術來提升您的瀏覽體驗、分析網站流量，並用於廣告追蹤。
              繼續使用本網站即表示您同意我們的
              <router-link to="/privacy" class="text-harvest-600 dark:text-harvest-400 hover:underline">
                隱私權政策
              </router-link>。
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              @click="handleReject"
            >
              僅必要
            </UButton>
            <UButton
              size="sm"
              @click="handleAccept"
            >
              全部接受
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const COOKIE_CONSENT_KEY = 'cookie_consent'
const showBanner = ref(false)

const checkConsent = () => {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) {
    // 延遲顯示，讓頁面先載入
    setTimeout(() => {
      showBanner.value = true
    }, 1500)
  }
}

const handleAccept = () => {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    accepted: true,
    essential: true,
    analytics: true,
    marketing: true,
    timestamp: new Date().toISOString(),
  }))
  showBanner.value = false

  // 動態載入 GA4（如果尚未載入）
  loadGA4IfNeeded()
}

// 動態載入 GA4
const loadGA4IfNeeded = () => {
  // 檢查 gtag 是否已正常初始化
  if (typeof window.gtag === 'function' && window.dataLayer && window.dataLayer.length > 0) {
    console.log('[GA4] Already loaded')
    return
  }

  // 動態載入 gtag.js
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-GNM87PKS88'
  document.head.appendChild(script)

  // 初始化 gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', 'G-GNM87PKS88')

  console.log('[GA4] Dynamically loaded after consent')
}

const handleReject = () => {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    accepted: true,
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
  }))
  showBanner.value = false
}

onMounted(() => {
  checkConsent()
})
</script>
