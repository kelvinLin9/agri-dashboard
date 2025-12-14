<template>
  <div class="page-warm-light py-8">
    <div class="container mx-auto px-6 max-w-3xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-primary mb-4" />
        <p class="text-gray-600 dark:text-gray-400">載入訂單資訊中...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="text-4xl text-red-500 mb-4" />
        <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
        <UButton @click="router.push('/my-orders')">返回訂單列表</UButton>
      </div>

      <!-- Payment Content -->
      <div v-else-if="order" class="space-y-6">
        <!-- Order Info Card -->
        <UCard class="card-glass shadow-warm">
          <template #header>
            <h1 class="text-2xl font-bold">支付訂單</h1>
          </template>

          <div class="space-y-4">
            <!-- Order Number -->
            <div class="flex justify-between items-center pb-4 border-b">
              <span class="text-gray-600 dark:text-gray-400">訂單編號</span>
              <span class="font-semibold">{{ order.orderNumber }}</span>
            </div>

            <!-- Order Amount -->
            <div class="flex justify-between items-center pb-4 border-b">
              <span class="text-gray-600 dark:text-gray-400">訂單金額</span>
              <span class="text-3xl font-bold text-harvest-600">${{ Number(order.totalAmount).toLocaleString() }}</span>
            </div>

            <!-- Order Items Summary -->
            <div class="pb-4 border-b">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">訂單商品</h3>
              <div class="space-y-2">
                <div v-for="item in order.orderItems" :key="item.id" class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ item.productName }} x{{ item.quantity }}</span>
                  <span class="font-medium">${{ Number(item.total).toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Shipping Info -->
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p>收件人：{{ order.recipientName }}</p>
              <p>電話：{{ order.recipientPhone }}</p>
              <p>地址：{{ order.recipientCity }}{{ order.recipientDistrict }}{{ order.recipientAddress }}</p>
            </div>
          </div>
        </UCard>

        <!-- Payment Method Card -->
        <UCard class="card-glass shadow-warm">
          <template #header>
            <h2 class="text-xl font-semibold">選擇支付方式</h2>
          </template>

          <div class="space-y-4">
            <URadioGroup v-model="selectedPaymentMethod" :options="paymentMethods" />

            <div class="bg-harvest-50 dark:bg-harvest-900/20 p-4 rounded-lg">
              <div class="flex items-start">
                <UIcon name="i-heroicons-information-circle" class="text-harvest-500 mt-0.5 mr-2" />
                <div class="text-sm text-harvest-700 dark:text-harvest-300">
                  <p class="font-semibold mb-1">支付說明</p>
                  <p v-if="selectedPaymentMethod === 'credit_card'">
                    點擊「前往支付」後，將跳轉至綠界金流頁面完成信用卡支付
                  </p>
                  <p v-else-if="selectedPaymentMethod === 'atm'">
                    支付後系統將提供虛擬帳號，請於3天內完成匯款
                  </p>
                  <p v-else-if="selectedPaymentMethod === 'cvs'">
                    支付後將取得超商代碼，請於3天內至超商繳費
                  </p>
                </div>
              </div>
            </div>

            <UButton 
              block 
              size="xl" 
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="proceedToPayment"
            >
              <UIcon name="i-heroicons-credit-card" class="mr-2" />
              前往支付 ${{ Number(order.totalAmount).toLocaleString() }}
            </UButton>

            <UButton 
              block 
              color="gray" 
              variant="outline"
              @click="router.push(`/my-orders/${order.id}`)"
            >
              返回訂單詳情
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Hidden div for ECPay form submission -->
    <div id="ecpay-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { useToast } from '@/composables/useToast'
import type { Order } from '@/api/types'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const toast = useToast()

const orderId = ref(route.query.orderId as string || '')
const order = ref<Order | null>(null)
const isLoading = ref(false)
const error = ref('')
const isSubmitting = ref(false)

const selectedPaymentMethod = ref('credit_card')
const paymentMethods = [
  { value: 'credit_card', label: '💳 信用卡/金融卡' },
  { value: 'atm', label: '🏦 ATM 轉帳' },
  { value: 'cvs', label: '🏪 超商代碼繳費' },
]

// Load order info
onMounted(async () => {
  if (!orderId.value) {
    error.value = '缺少訂單編號'
    return
  }

  isLoading.value = true
  try {
    order.value = await orderStore.fetchOrderById(orderId.value)
    
    if (!order.value) {
      error.value = '無法找到該訂單'
      return
    }
    
    if (order.value.status === 'cancelled') {
      error.value = '此訂單已取消'
      setTimeout(() => router.push('/my-orders'), 2000)
      return
    }

    if (order.value.status !== 'pending') {
      error.value = '此訂單已完成支付或正在處理中'
      setTimeout(() => router.push(`/my-orders/${orderId.value}`), 2000)
      return
    }
  } catch (err: any) {
    console.error('載入訂單失敗:', err)
    error.value = err.message || '無法載入訂單資訊'
  } finally {
    isLoading.value = false
  }
})

const proceedToPayment = async () => {
  if (!order.value) return

  isSubmitting.value = true
  try {
    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      throw new Error('無法獲取用戶資訊，請重新登入')
    }

    // Parse amount to number
    const amount = typeof order.value.totalAmount === 'string' 
      ? parseFloat(order.value.totalAmount) 
      : order.value.totalAmount

    // Call backend to create payment and get ECPay form
    // TODO: 改回使用環境變數 import.meta.env.VITE_API_URL
    const apiUrl = 'https://hirimu.cc/api'
    const response = await fetch(`${apiUrl}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        orderId: order.value.id,
        userId: user.id,
        paymentMethod: selectedPaymentMethod.value,
        amount: amount
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || '建立支付訂單失敗')
    }

    // Get HTML form from backend
    const html = await response.text()

    console.log('📝 收到 ECPay 表單，準備提交...')
    console.log('📄 表單 HTML:', html.substring(0, 500)) // 顯示前 500 字元

    // Create a temporary div to hold the form
    const container = document.getElementById('ecpay-container')
    if (container) {
      // 設為可見，讓腳本能正常執行
      container.style.display = 'block'
      container.innerHTML = html
      
      // 等待一小段時間讓腳本執行
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 如果腳本沒有自動提交，手動提交
      const form = container.querySelector('form')
      if (form) {
        console.log('📤 提交 ECPay 表單...')
        console.log('🔍 表單 action:', form.action)
        console.log('🔍 表單欄位數:', form.elements.length)
        
        // 暫時註釋以便查看 Console
        form.submit()
        // console.log('⏸️  已暫停自動提交，請複製上面的訊息')
      } else {
        console.error('❌ 找不到 ECPay 表單')
        throw new Error('無法找到支付表單')
      }
    }
  } catch (err: any) {
    console.error('支付失敗:', err)
    toast.error('支付失敗', err.message || '支付處理失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}
</script>
