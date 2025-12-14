<template>
  <div class="page-warm-light py-6">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Back Button -->
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        class="mb-4"
        @click="router.back()"
      >
        返回訂單列表
      </UButton>

      <!-- Loading -->
      <div v-if="orderStore.isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <USkeleton class="h-64" />
        </div>
        <USkeleton class="h-64" />
      </div>

      <!-- Order Detail -->
      <div v-else-if="order">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Left Column: Order Info & Items -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Order Header with Progress -->
            <UCard class="card-glass shadow-warm">
              <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                    訂單 {{ order.orderNumber }}
                  </h1>
                  <p class="text-sm text-gray-500">{{ formatDateTime(order.createdAt) }}</p>
                </div>
                <StatusBadge :status="order.status" type="order" size="lg" />
              </div>

              <!-- Horizontal Progress (if not cancelled) -->
              <div v-if="order.status !== 'cancelled'" class="mt-4 pt-4 border-t dark:border-gray-700">
                <div class="grid grid-cols-4 relative">
                  <!-- Progress Line (Background) -->
                  <div class="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                  <!-- Progress Line (Active) -->
                  <div 
                    class="absolute top-4 left-[12.5%] h-0.5 bg-harvest-500 z-0 transition-all duration-500"
                    :style="{ width: progressWidth }"
                  ></div>
                  
                  <!-- Steps -->
                  <div 
                    v-for="step in compactSteps" 
                    :key="step.status" 
                    class="flex flex-col items-center z-10"
                  >
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors"
                      :class="step.completed 
                        ? 'bg-harvest-500 border-harvest-500 text-white' 
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'"
                    >
                      <UIcon :name="step.icon" class="w-4 h-4" />
                    </div>
                    <span class="text-xs mt-1 text-center hidden sm:block whitespace-nowrap" :class="step.completed ? 'text-harvest-600 font-medium' : 'text-gray-400'">
                      {{ step.label }}
                    </span>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Recipient & Shipping Info (Combined) -->
            <UCard class="card-glass shadow-warm">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <UIcon name="i-heroicons-user" class="w-4 h-4" />
                    收件人資訊
                  </h3>
                  <div class="space-y-2 text-sm">
                    <p><span class="text-gray-500">姓名：</span>{{ order.recipientName }}</p>
                    <p><span class="text-gray-500">電話：</span>{{ order.recipientPhone }}</p>
                    <p><span class="text-gray-500">地址：</span>{{ fullAddress }}</p>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <UIcon name="i-heroicons-truck" class="w-4 h-4" />
                    付款 / 配送
                  </h3>
                  <div class="space-y-2 text-sm">
                    <p><span class="text-gray-500">付款：</span>{{ getPaymentMethodLabel(order.paymentMethod) }}</p>
                    <p><span class="text-gray-500">配送：</span>{{ getShippingMethodLabel(order.shippingMethod) }}</p>
                    <p v-if="order.customerNote"><span class="text-gray-500">備註：</span>{{ order.customerNote }}</p>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Order Items (Compact) -->
            <UCard class="card-glass shadow-warm">
              <template #header>
                <div class="flex justify-between items-center">
                  <h2 class="font-semibold">訂購商品 ({{ order.orderItems?.length || 0 }} 項)</h2>
                </div>
              </template>
              <div class="divide-y dark:divide-gray-700">
                <div
                  v-for="item in order.orderItems"
                  :key="item.id"
                  class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div class="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                    <img v-if="item.productImage" :src="item.productImage" class="w-full h-full object-cover" />
                    <UIcon v-else name="i-heroicons-photo" class="w-full h-full text-gray-300 p-3" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ item.productName }}</p>
                    <p class="text-sm text-gray-500">${{ (Number(item.unitPrice) || 0).toLocaleString() }} × {{ item.quantity }}</p>
                  </div>
                  <div class="text-right font-semibold text-gray-900 dark:text-white">
                    ${{ (Number(item.subtotal) || 0).toLocaleString() }}
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Right Column: Payment Summary & Actions -->
          <div class="space-y-4">
            <!-- Payment Summary -->
            <UCard class="card-glass shadow-warm sticky top-4">
              <template #header>
                <h2 class="font-semibold">金額明細</h2>
              </template>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>商品小計</span>
                  <span>${{ order.subtotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>運費</span>
                  <span>${{ order.shippingFee.toLocaleString() }}</span>
                </div>
                <div v-if="order.discountAmount > 0" class="flex justify-between text-red-600">
                  <span>折扣</span>
                  <span>-${{ order.discountAmount.toLocaleString() }}</span>
                </div>
                <div v-if="order.pointsUsed > 0" class="flex justify-between text-purple-600">
                  <span>點數折抵</span>
                  <span>-${{ order.pointsUsed.toLocaleString() }}</span>
                </div>
                <div class="border-t dark:border-gray-700 pt-3 mt-3">
                  <div class="flex justify-between text-lg font-bold">
                    <span>訂單總額</span>
                    <span class="text-harvest-600">${{ order.totalAmount.toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-4 pt-4 border-t dark:border-gray-700 space-y-2">
                <UButton
                  v-if="order.status === 'pending'"
                  block
                  size="lg"
                  color="primary"
                  @click="goToPayment"
                >
                  <UIcon name="i-heroicons-credit-card" class="mr-2" />
                  前往付款
                </UButton>
                <UButton
                  v-if="canCancel"
                  block
                  color="error"
                  variant="soft"
                  @click="confirmCancel"
                >
                  取消訂單
                </UButton>
                <UButton
                  block
                  variant="ghost"
                  @click="router.push('/my-orders')"
                >
                  返回列表
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-16">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-4">找不到此訂單</p>
        <UButton @click="router.push('/my-orders')">
          返回訂單列表
        </UButton>
      </div>
    </div>
  </div>

  <!-- 確認取消訂單對話框 -->
  <ConfirmDialog
    v-model:open="showCancelDialog"
    title="取消訂單"
    message="確定要取消此訂單嗎？取消後無法恢復。"
    type="danger"
    confirm-label="確認取消"
    :loading="isCancelling"
    @confirm="cancelOrder"
    @cancel="showCancelDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { OrderStatus } from '@/api'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const toast = useToast()

// Cancel dialog state
const showCancelDialog = ref(false)
const isCancelling = ref(false)

const orderId = route.params.id as string
const order = computed(() => orderStore.currentOrder)

// Full address computed
const fullAddress = computed(() => {
  if (!order.value) return ''
  return [order.value.recipientPostalCode, order.value.recipientCity, order.value.recipientDistrict, order.value.recipientAddress].filter(Boolean).join(' ')
})

// Compact progress steps (4 steps instead of 5)
const compactSteps = computed(() => [
  {
    status: 'pending',
    label: '已下單',
    icon: 'i-heroicons-document-text',
    completed: true
  },
  {
    status: 'paid',
    label: '已付款',
    icon: 'i-heroicons-credit-card',
    completed: order.value && ['paid', 'processing', 'shipping', 'delivered', 'completed'].includes(order.value.status)
  },
  {
    status: 'shipping',
    label: '配送中',
    icon: 'i-heroicons-truck',
    completed: order.value && ['shipping', 'delivered', 'completed'].includes(order.value.status)
  },
  {
    status: 'completed',
    label: '已完成',
    icon: 'i-heroicons-check-badge',
    completed: order.value && ['completed'].includes(order.value.status)
  }
])

// Progress bar width (for grid layout - spans from 12.5% to 87.5%, so 75% total)
const progressWidth = computed(() => {
  const completed = compactSteps.value.filter(s => s.completed).length
  // 4 steps, 3 segments, each segment is 25% of container (75% / 3 = 25%)
  const segmentWidth = 25 // percentage
  const completedSegments = Math.max(0, completed - 1)
  return `${completedSegments * segmentWidth}%`
})

const canCancel = computed(() => {
  return order.value && (order.value.status === OrderStatus.PENDING || order.value.status === OrderStatus.PAID)
})

// Methods
const fetchOrder = async () => {
  await orderStore.fetchOrderById(orderId)
}

const goToPayment = () => {
  router.push(`/payment?orderId=${orderId}`)
}

const confirmCancel = () => {
  showCancelDialog.value = true
}

const cancelOrder = async () => {
  isCancelling.value = true
  await orderStore.cancelOrder(orderId)
  toast.success('訂單已取消')
  showCancelDialog.value = false
  isCancelling.value = false
  fetchOrder()
}

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    credit_card: '信用卡',
    atm: 'ATM 轉帳',
    cvs: '超商代碼',
    cod: '貨到付款'
  }
  return labels[method] || method
}

const getShippingMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    home_delivery: '宅配',
    cvs_pickup: '超商取貨',
    self_pickup: '自取'
  }
  return labels[method] || method
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchOrder()
})
</script>
