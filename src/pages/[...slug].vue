<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="text-center max-w-lg mx-auto">
      <!-- Animated 404 Illustration -->
      <div class="relative mb-8">
        <div class="text-[180px] font-bold text-gray-200 dark:text-gray-700 leading-none select-none">
          404
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="bg-gradient-to-r from-harvest-400 to-harvest-600 text-white rounded-2xl px-6 py-3 shadow-xl transform -rotate-6 animate-pulse">
            <UIcon name="i-heroicons-face-frown" class="w-8 h-8" />
          </div>
        </div>
      </div>

      <!-- Message -->
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        找不到頁面
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        抱歉，您要找的頁面不存在或已被移動。<br />
        請檢查網址是否正確，或返回首頁繼續瀏覽。
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <UButton
          size="xl"
          icon="i-heroicons-home"
          to="/"
          class="shadow-lg"
        >
          返回首頁
        </UButton>
        <UButton
          size="xl"
          color="neutral"
          variant="outline"
          icon="i-heroicons-shopping-bag"
          to="/shop/products"
        >
          瀏覽商品
        </UButton>
      </div>

      <!-- Quick Links -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">或許您想找的是：</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <UButton variant="ghost" size="sm" to="/shop/products">所有商品</UButton>
          <UButton variant="ghost" size="sm" to="/cart">購物車</UButton>
          <UButton variant="ghost" size="sm" to="/my-orders">我的訂單</UButton>
          <UButton variant="ghost" size="sm" to="/login">登入</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.title = '404 - 找不到頁面 | 日沐 SunBathe'
})
</script>
