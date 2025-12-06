<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
    <div class="container mx-auto px-6 max-w-md">
      <UCard>
        <div class="text-center py-8">
          <!-- Loading Icon -->
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-5xl text-primary mx-auto mb-4" />
          
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            支付處理中...
          </h1>
          
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            請稍候，正在確認您的支付狀態
          </p>

          <div class="space-y-2 text-sm text-gray-500 dark:text-gray-500">
            <p>⏱️ 預計等待時間：2-5秒</p>
            <p>🔒 您的支付資訊已加密保護</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // Get MerchantTradeNo from query params (ECPay will pass this)
  const merchantTradeNo = route.query.MerchantTradeNo as string
  
  console.log('Payment result params:', route.query)
  
  // Wait for ECPay callback to complete (backend processing)
  // ECPay's callback is async, so we need to wait a bit
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Redirect to orders page
  if (merchantTradeNo) {
    // Redirect to orders with search filter
    router.push({
      path: '/my-orders',
      query: { search: merchantTradeNo }
    })
  } else {
    // No merchant trade number, go to orders list
    router.push('/my-orders')
  }
})
</script>
