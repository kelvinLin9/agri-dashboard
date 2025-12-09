<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-900 dark:to-gray-900 flex items-center justify-center py-8">
    <div class="container mx-auto px-6 max-w-md">
      <UCard>
        <div class="text-center py-8">
          <div class="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <UIcon name="i-heroicons-x-circle" class="w-12 h-12 text-red-600" />
          </div>
          
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            支付失敗
          </h1>
          
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            支付過程中發生錯誤，請重試
          </p>

          <div class="space-y-3">
            <UButton block size="lg" @click="router.push('/cart')">
              返回購物車
            </UButton>
            
            <UButton block size="lg" variant="outline" color="neutral" @click="router.push('/orders')">
              查看訂單
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
