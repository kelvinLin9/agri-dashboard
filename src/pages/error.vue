<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="text-center max-w-lg mx-auto">
      <!-- Animated 500 Illustration -->
      <div class="relative mb-8">
        <div class="text-[180px] font-bold text-gray-200 dark:text-gray-700 leading-none select-none">
          500
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-2xl px-6 py-3 shadow-xl transform rotate-3 animate-bounce">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8" />
          </div>
        </div>
      </div>

      <!-- Message -->
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        系統異常
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        抱歉，系統發生了一些問題。<br />
        我們正在努力修復中，請稍後再試。
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <UButton
          size="xl"
          icon="i-heroicons-arrow-path"
          @click="handleRefresh"
          class="shadow-lg"
        >
          重新整理
        </UButton>
        <UButton
          size="xl"
          color="neutral"
          variant="outline"
          icon="i-heroicons-home"
          to="/"
        >
          返回首頁
        </UButton>
      </div>

      <!-- Contact Info -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          如果問題持續發生，請聯繫我們：
        </p>
        <div class="flex flex-wrap gap-4 justify-center text-sm text-gray-600 dark:text-gray-400">
          <a href="mailto:support@sunbathe.com.tw" class="flex items-center gap-2 hover:text-harvest-600 transition-colors">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
            support@sunbathe.com.tw
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.title = '500 - 系統錯誤 | 日沐 SunBathe'
})

const handleRefresh = () => {
  window.location.reload()
}
</script>
