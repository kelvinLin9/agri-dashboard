<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-900 dark:to-gray-900 py-8">
    <div class="container mx-auto px-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">我的訂單</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          查看您的訂單記錄
        </p>
      </div>

      <!--Status Tabs -->
      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <UButton
            v-for="status in statusFilters"
            :key="status.value"
            :variant="selectedStatus === status.value ? 'solid' : 'outline'"
            :color="selectedStatus === status.value ? 'primary' : 'neutral'"
            @click="selectedStatus = status.value; fetchMyOrders()"
          >
            {{ status.label }}
            <UBadge v-if="status.count !== undefined" size="xs" class="ml-2">
              {{ status.count }}
            </UBadge>
          </UButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="orderStore.isLoading" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-48" />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="orderStore.orders.length === 0"
        icon="i-heroicons-shopping-bag"
        title="還沒有訂單"
        description="快去選購喜歡的商品吧！"
        action-label="前往商店"
        action-icon="i-heroicons-arrow-right"
        @action="router.push('/shop/products')"
      />

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <UCard
          v-for="order in orderStore.orders"
          :key="order.id"
          class="hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewOrder(order.id)"
        >
          <!-- Order Header -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm text-gray-500">訂單編號</p>
              <p class="font-mono font-semibold text-primary-600">{{ order.orderNumber }}</p>
              <!-- 待付款訂單顯示倒數計時 -->
              <OrderCountdown
                v-if="order.status === OrderStatus.PENDING"
                :created-at="order.createdAt"
                :timeout-minutes="30"
                class="mt-2"
                @warning="handleOrderWarning(order)"
                @expired="handleOrderExpired(order)"
              />
            </div>
            <StatusBadge :status="order.status" type="order" size="lg" />
          </div>

          <!-- Order Items Preview -->
          <div class="space-y-2 mb-4">
            <div
              v-for="item in order.orderItems?.slice(0, 2)"
              :key="item.id"
              class="flex items-center gap-3"
            >
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
                <UIcon v-if="!item.productImage" name="i-heroicons-photo" class="w-full h-full text-gray-400" />
                <img v-else :src="item.productImage" class="w-full h-full object-cover rounded" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ item.productName }}</p>
                <p class="text-sm text-gray-500">x{{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold">${{ Number(item.subtotal).toLocaleString() }}</p>
              </div>
            </div>
            <p v-if="order.orderItems && order.orderItems.length > 2" class="text-sm text-gray-500">
              還有 {{ order.orderItems.length - 2 }} 件商品...
            </p>
          </div>

          <!-- Order Footer -->
          <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500">
              {{ formatDateTime(order.createdAt) }}
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600 dark:text-gray-400">訂單總額</p>
              <p class="text-xl font-bold text-harvest-600">${{ Number(order.totalAmount).toLocaleString() }}</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex gap-2 mt-4">
            <UButton
              size="sm"
              variant="outline"
              @click.stop="viewOrder(order.id)"
            >
              查看詳情
            </UButton>
            <UButton
              v-if="order.status === 'pending'"
              size="sm"
              color="primary"
              @click.stop="goToPayment(order.id)"
            >
              前往付款
            </UButton>
            <UButton
              v-if="canCancel(order.status)"
              size="sm"
              color="error"
              variant="outline"
              @click.stop="cancelOrder(order.id)"
            >
              取消訂單
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Pagination -->
      <div v-if="orderStore.orders.length > 0" class="flex justify-center mt-8">
        <UPagination
          v-model:page="page"
          :items-per-page="pageSize"
          :total="totalOrders"
          @update:page="fetchMyOrders"
        />
      </div>
    </div>
  </div>

  <!-- 確認取消訂單對話框 -->
  <ConfirmDialog
    v-model:open="confirmState.isOpen.value"
    :title="'取消訂單'"
    :message="'確定要取消此訂單嗎？取消後無法恢復。'"
    type="danger"
    confirm-label="確認取消"
    :loading="isCancelling"
    @confirm="handleCancelConfirm"
    @cancel="confirmState.handleCancel"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import OrderCountdown from '@/components/common/OrderCountdown.vue'
import { OrderStatus } from '@/api'
import type { Order } from '@/api/types/order'

const router = useRouter()
const orderStore = useOrderStore()
const toast = useToast()
const confirmState = useConfirm()

// Cancel order state
const isCancelling = ref(false)
const cancellingOrderId = ref<string | null>(null)

// Pagination
const page = ref(1)
const pageSize = ref(10)
const totalOrders = ref(0)

// Filters
const selectedStatus = ref<OrderStatus | undefined>(undefined)

// Status filter options
const statusFilters = computed(() => [
  { label: '全部', value: undefined, count: totalOrders.value },
  { label: '待付款', value: OrderStatus.PENDING },
  { label: '處理中', value: OrderStatus.PROCESSING },
  { label: '配送中', value: OrderStatus.SHIPPING },
  { label: '已完成', value: OrderStatus.COMPLETED },
  { label: '已取消', value: OrderStatus.CANCELLED },
])

// Methods
const fetchMyOrders = async () => {
  try {
    await orderStore.fetchMyOrders()
    totalOrders.value = orderStore.orders.length // TODO: 需要從 API 獲取總數
  } catch (error) {
    console.error('獲取訂單失敗:', error)
  }
}

const viewOrder = (orderId: string) => {
  router.push(`/my-orders/${orderId}`)
}

const goToPayment = (orderId: string) => {
  router.push(`/payment?orderId=${orderId}`)
}

const cancelOrder = async (orderId: string) => {
  cancellingOrderId.value = orderId
  confirmState.isOpen.value = true
}

const handleCancelConfirm = async () => {
  if (!cancellingOrderId.value) return
  
  isCancelling.value = true
  try {
    await orderStore.cancelOrder(cancellingOrderId.value)
    toast.success('訂單已取消')
    confirmState.isOpen.value = false
    fetchMyOrders()
  } catch (error) {
    console.error('取消訂單失敗:', error)
    toast.error('取消失敗', '無法取消訂單，請稍後再試')
  } finally {
    isCancelling.value = false
    cancellingOrderId.value = null
  }
}

const canCancel = (status: OrderStatus): boolean => {
  return status === OrderStatus.PENDING || status === OrderStatus.PAID
}

// 訂單倒數計時事件處理
const handleOrderWarning = (order: Order) => {
  toast.warning('訂單即將逾時', `訂單 ${order.orderNumber} 剩餘不到 5 分鐘，請盡快付款`)
}

const handleOrderExpired = (order: Order) => {
  toast.info('訂單已逾時', `訂單 ${order.orderNumber} 已超過付款時限，系統將自動取消`)
  // 重新載入訂單列表以更新狀態
  setTimeout(() => fetchMyOrders(), 2000)
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
  fetchMyOrders()
})
</script>
