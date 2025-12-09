<template>
  <div class="page-warm-light py-8">
    <div class="container mx-auto px-6 max-w-4xl">
      <!-- Back Button -->
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        class="mb-6"
        @click="router.back()"
      >
        返回訂單列表
      </UButton>

      <!-- Loading -->
      <div v-if="orderStore.isLoading" class="space-y-4">
        <USkeleton class="h-64" />
        <USkeleton class="h-96" />
      </div>

      <!-- Order Detail -->
      <div v-else-if="order" class="space-y-6">
        <!-- Order Header Card -->
        <UCard class="card-glass shadow-warm">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                訂單詳情
              </h1>
              <p class="text-sm text-gray-500">訂單編號: <span class="font-mono font-semibold">{{ order.orderNumber }}</span></p>
              <p class="text-sm text-gray-500">下單時間: {{ formatDateTime(order.createdAt) }}</p>
            </div>
            <StatusBadge :status="order.status" type="order" size="lg" />
          </div>
        </UCard>

        <!-- Order Progress (Timeline) -->
        <UCard v-if="order.status !== 'cancelled'" class="card-glass shadow-warm">
          <template #header>
            <h2 class="text-lg font-semibold">訂單進度</h2>
          </template>
          <div class="relative">
            <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div class="space-y-6">
              <div v-for="step in orderSteps" :key="step.status" class="relative flex gap-4">
                <div
                  class="w-8 h8 rounded-full flex items-center justify-center z-10"
                  :class="step.completed ? 'bg-harvest-500' : 'bg-gray-300'"
                >
                  <UIcon :name="step.icon" class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1 pb-6">
                  <p :class="step.completed ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500'">
                    {{ step.label }}
                  </p>
                  <p v-if="step.time" class="text-sm text-gray-500">{{ step.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Recipient Info -->
        <UCard class="card-glass shadow-warm">
          <template #header>
            <h2 class="text-lg font-semibold">收件人資訊</h2>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">收件人</p>
              <p class="font-medium">{{ order.recipientName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">聯絡電話</p>
              <p class="font-medium">{{ order.recipientPhone }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-gray-500">收件地址</p>
              <p class="font-medium">
                {{ [order.recipientPostalCode, order.recipientCity, order.recipientDistrict, order.recipientAddress].filter(Boolean).join(' ') }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Order Items -->
        <UCard class="card-glass shadow-warm">
          <template #header>
            <h2 class="text-lg font-semibold">訂單商品</h2>
          </template>
          <div class="space-y-4">
            <div
              v-for="item in order.orderItems"
              :key="item.id"
              class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0">
                <UIcon v-if="!item.productImage" name="i-heroicons-photo" class="w-full h-full text-gray-400" />
                <img v-else :src="item.productImage" class="w-full h-full object-cover rounded" />
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 dark:text-white">{{ item.productName }}</p>
                <p class="text-sm text-gray-500">單價: ${{ (Number(item.unitPrice) || 0).toLocaleString() }}</p>
                <p class="text-sm text-gray-500">數量: x{{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-lg text-gray-900 dark:text-white">
                  ${{ (Number(item.subtotal) || 0).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Payment Summary -->
        <UCard class="card-glass shadow-warm">
          <template #header>
            <h2 class="text-lg font-semibold">金額明細</h2>
          </template>
          <div class="space-y-3">
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
              <span>點數折抵 ({{ order.pointsUsed }} 點)</span>
              <span>-${{ order.pointsUsed.toLocaleString() }}</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div class="flex justify-between text-xl font-bold">
                <span>訂單總額</span>
                <span class="text-harvest-600">${{ order.totalAmount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Payment & Shipping Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard class="card-glass shadow-warm">
            <template #header>
              <h3 class="font-semibold">付款方式</h3>
            </template>
            <p>{{ getPaymentMethodLabel(order.paymentMethod) }}</p>
          </UCard>

          <UCard class="card-glass shadow-warm">
            <template #header>
              <h3 class="font-semibold">配送方式</h3>
            </template>
            <p>{{ getShippingMethodLabel(order.shippingMethod) }}</p>
          </UCard>
        </div>

        <!-- Customer Note -->
        <UCard v-if="order.customerNote" class="card-glass shadow-warm">
          <template #header>
            <h3 class="font-semibold">訂單備註</h3>
          </template>
          <p class="text-gray-700 dark:text-gray-300">{{ order.customerNote }}</p>
        </UCard>

        <!-- Actions -->
        <div class="flex gap-3 justify-end sticky bottom-6">
          <UButton
            v-if="order.status === 'pending'"
            size="lg"
            color="primary"
            @click="goToPayment"
          >
            <UIcon name="i-heroicons-credit-card" class="mr-2" />
            前往付款
          </UButton>
          <UButton
            v-if="canCancel"
            size="lg"
            color="error"
            variant="outline"
            @click="confirmCancel"
          >
            <UIcon name="i-heroicons-x-circle" class="mr-2" />
            取消訂單
          </UButton>
          <UButton
            size="lg"
            variant="outline"
            @click="router.push('/my-orders')"
          >
            返回列表
          </UButton>
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

// Order progress steps
const orderSteps = computed(() => [
  {
    status: 'pending',
    label: '訂單已建立',
    icon: 'i-heroicons-document-text',
    completed: true,
    time: formatDateTime(order.value?.createdAt || '')
  },
  {
    status: 'paid',
    label: '付款完成',
    icon: 'i-heroicons-check-circle',
    completed: order.value && ['paid', 'processing', 'shipping', 'delivered', 'completed'].includes(order.value.status),
    time: order.value?.paidAt ? formatDateTime(order.value.paidAt) : undefined
  },
  {
    status: 'processing',
    label: '商品準備中',
    icon: 'i-heroicons-cog',
    completed: order.value && ['processing', 'shipping', 'delivered', 'completed'].includes(order.value.status)
  },
  {
    status: 'shipping',
    label: '商品配送中',
    icon: 'i-heroicons-truck',
    completed: order.value && ['shipping', 'delivered', 'completed'].includes(order.value.status),
    time: order.value?.shippedAt ? formatDateTime(order.value.shippedAt) : undefined
  },
  {
    status: 'completed',
    label: '訂單完成',
    icon: 'i-heroicons-check-badge',
    completed: order.value && ['completed'].includes(order.value.status),
    time: order.value?.completedAt ? formatDateTime(order.value.completedAt) : undefined
  }
])

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
