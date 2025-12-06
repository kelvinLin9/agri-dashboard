<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
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
      <div v-else-if="orderStore.orders.length === 0" class="text-center py-16">
        <UIcon name="i-heroicons-shopping-bag" class="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          還沒有訂單
        </h2>
        <p class="text-gray-500 mb-6">快去選購喜歡的商品吧！</p>
        <UButton size="lg" @click="router.push('/shop/products')">
          前往商店
        </UButton>
      </div>

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
            </div>
            <UBadge :color="getStatusColor(order.status)" variant="soft" size="lg">
              {{ getStatusLabel(order.status) }}
            </UBadge>
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
                <p class="font-semibold">${{ item.subtotal.toLocaleString() }}</p>
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
              <p class="text-xl font-bold text-green-600">${{ order.totalAmount.toLocaleString() }}</p>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { OrderStatus } from '@/api'

const router = useRouter()
const orderStore = useOrderStore()

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
    await orderStore.fetchMyOrders({
      page: page.value,
      limit: pageSize.value,
      status: selectedStatus.value,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    })
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
  if (!confirm('確定要取消此訂單嗎？')) return

  try {
    await orderStore.cancelOrder(orderId)
    console.log('訂單已取消')
    fetchMyOrders()
  } catch (error) {
    console.error('取消訂單失敗:', error)
    alert('無法取消訂單，請稍後再試')
  }
}

const canCancel = (status: OrderStatus): boolean => {
  return status === OrderStatus.PENDING || status === OrderStatus.PAID
}

// Helper functions
const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'yellow'
    case OrderStatus.PAID:
    case OrderStatus.PROCESSING:
      return 'blue'
    case OrderStatus.SHIPPING:
      return 'purple'
    case OrderStatus.DELIVERED:
    case OrderStatus.COMPLETED:
      return 'green'
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return 'red'
    default:
      return 'gray'
  }
}

const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return '待付款'
    case OrderStatus.PAID:
      return '已付款'
    case OrderStatus.PROCESSING:
      return '處理中'
    case OrderStatus.SHIPPING:
      return '配送中'
    case OrderStatus.DELIVERED:
      return '已送達'
    case OrderStatus.COMPLETED:
      return '已完成'
    case OrderStatus.CANCELLED:
      return '已取消'
    case OrderStatus.REFUNDED:
      return '已退款'
    default:
      return '未知狀態'
  }
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
