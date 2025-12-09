<template>
  <div class="page-warm-light flex items-center justify-center py-8">
    <div class="container mx-auto px-6 max-w-md">
      <UCard class="card-glass shadow-warm">
        <div class="text-center py-8">
          <div class="w-20 h-20 bg-nature-100 dark:bg-nature-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-nature-600" />
          </div>
          
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            支付成功！
          </h1>
          
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            您的訂單已完成支付
          </p>

          <div class="space-y-3">
            <UButton block size="lg" @click="router.push('/orders')">
              查看我的訂單
            </UButton>
            
            <UButton block size="lg" variant="outline" color="neutral" @click="router.push('/shop/products')">
              繼續購物
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
