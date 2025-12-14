<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
    <div class="container mx-auto max-w-2xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-6xl text-primary mx-auto mb-6" />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            正在確認支付狀態...
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            請稍候，我們正在驗證您的支付
          </p>
          <div class="mt-6 flex justify-center">
            <div class="flex space-x-2">
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="paymentStatus === 'success'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <!-- Success Header -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UIcon name="i-heroicons-check-circle" class="text-5xl text-green-500" />
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">支付成功！</h1>
          <p class="text-green-100">您的訂單已完成支付</p>
        </div>

        <!-- Order Details -->
        <div class="p-8 space-y-6">
          <div v-if="orderDetails" class="space-y-4">
            <!-- Order Number -->
            <div class="flex justify-between items-center py-3 border-b dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">訂單編號</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ orderDetails.orderNumber }}</span>
            </div>

            <!-- Payment Amount -->
            <div class="flex justify-between items-center py-3 border-b dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">支付金額</span>
              <span class="text-2xl font-bold text-green-600">${{ orderDetails.totalAmount?.toLocaleString() }}</span>
            </div>

            <!-- Payment Time -->
            <div class="flex justify-between items-center py-3 border-b dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">支付時間</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(new Date()) }}</span>
            </div>

            <!-- Merchant Trade No -->
            <div v-if="merchantTradeNo" class="flex justify-between items-center py-3">
              <span class="text-gray-600 dark:text-gray-400 text-sm">交易編號</span>
              <span class="font-mono text-xs text-gray-500 dark:text-gray-500">{{ merchantTradeNo }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-6 space-y-3">
            <UButton
              block
              size="lg"
              color="primary"
              @click="router.push('/my-orders')"
            >
              <UIcon name="i-heroicons-clipboard-document-list" class="mr-2" />
              查看我的訂單
            </UButton>
            <UButton
              block
              size="lg"
              variant="outline"
              @click="router.push('/shop/products')"
            >
              <UIcon name="i-heroicons-shopping-bag" class="mr-2" />
              繼續購物
            </UButton>
          </div>
        </div>
      </div>

      <!-- Failed State -->
      <div v-else-if="paymentStatus === 'failed'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <!-- Failed Header -->
        <div class="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UIcon name="i-heroicons-x-circle" class="text-5xl text-red-500" />
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">支付失敗</h1>
          <p class="text-red-100">您的支付未能成功完成</p>
        </div>

        <!-- Error Details -->
        <div class="p-8 space-y-6">
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-red-800 dark:text-red-200 text-sm">
              {{ errorMessage || '支付過程中發生錯誤，請稍後再試' }}
            </p>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <UButton
              block
              size="lg"
              color="red"
              @click="retryPayment"
            >
              <UIcon name="i-heroicons-arrow-path" class="mr-2" />
              重試支付
            </UButton>
            <UButton
              block
              size="lg"
              variant="outline"
              @click="router.push('/my-orders')"
            >
              <UIcon name="i-heroicons-clipboard-document-list" class="mr-2" />
              返回訂單列表
            </UButton>
          </div>
        </div>
      </div>

      <!-- Unknown/Error State -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
        <div class="text-center">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-6xl text-yellow-500 mx-auto mb-6" />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            無法確認支付狀態
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            請稍後查看訂單狀態，或聯繫客服確認
          </p>
          <UButton
            size="lg"
            @click="router.push('/my-orders')"
          >
            查看我的訂單
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const paymentStatus = ref<'success' | 'failed' | 'unknown'>('unknown')
const merchantTradeNo = ref<string>('')
const orderDetails = ref<any>(null)
const errorMessage = ref<string>('')

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date)
}

const checkPaymentStatus = async () => {
  try {
    // Get order ID from query params
    const orderId = route.query.oId as string
    merchantTradeNo.value = route.query.MerchantTradeNo as string || ''

    console.log('Payment result params:', {
      orderId,
      merchantTradeNo: merchantTradeNo.value,
      allParams: route.query
    })

    if (!orderId) {
      console.warn('No orderId in query params')
      // 如果沒有訂單ID，顯示成功訊息（從綠界成功頁面返回）
      paymentStatus.value = 'success'
      orderDetails.value = { orderNumber: merchantTradeNo.value || '已完成' }
      isLoading.value = false
      return
    }

    // Wait a bit for ECPay callback to complete (backend processing is async)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Fetch order details to check payment status
    const token = localStorage.getItem('token')
    const amountFromUrl = route.query.amt ? parseInt(route.query.amt as string) : null
    
    if (!token) {
      console.warn('No auth token found - showing success without order details')
      // 沒有 token 時，顯示成功訊息但不顯示訂單詳情
      // 用戶可以稍後登入查看訂單
      paymentStatus.value = 'success'
      orderDetails.value = { 
        orderNumber: merchantTradeNo.value || orderId,
        totalAmount: amountFromUrl // 從 URL 取得金額
      }
      isLoading.value = false
      return
    }

    // TODO: SSL 生效後改回 https://sunbathe-api.hirimu.cc/api
    const apiUrl = 'https://agri-backend-660672910950.asia-east1.run.app/api'
    const response = await fetch(`${apiUrl}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order details')
    }

    const data = await response.json()
    orderDetails.value = data.data

    console.log('Order details:', orderDetails.value)

    // Check if order is paid
    if (orderDetails.value.orderStatus === 'paid' || orderDetails.value.isPaid) {
      paymentStatus.value = 'success'
      console.log(`支付成功：訂單 ${orderDetails.value.orderNumber} 已完成支付`)
    } else if (orderDetails.value.orderStatus === 'cancelled' || orderDetails.value.orderStatus === 'failed') {
      paymentStatus.value = 'failed'
      errorMessage.value = '訂單已取消或支付失敗'
    } else {
      // Order exists but payment might still be processing
      paymentStatus.value = 'unknown'
      errorMessage.value = '支付狀態確認中，請稍後查看訂單'
    }
  } catch (error) {
    console.error('Error checking payment status:', error)
    // 即使出錯，也假設支付成功（因為綠界已經顯示成功）
    paymentStatus.value = 'success'
    orderDetails.value = { 
      orderNumber: merchantTradeNo.value || route.query.oId || '已處理',
      totalAmount: null
    }
  } finally {
    isLoading.value = false
  }
}

const retryPayment = () => {
  if (orderDetails.value?.id) {
    router.push(`/payment/${orderDetails.value.id}`)
  } else {
    router.push('/my-orders')
  }
}

onMounted(() => {
  checkPaymentStatus()
})
</script>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.5rem);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
