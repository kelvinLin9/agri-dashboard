<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">訂單管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理系統訂單資料</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總訂單數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ total }}
            </p>
          </div>
          <UIcon name="i-heroicons-shopping-bag" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">待處理</p>
            <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {{ pendingCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-clock" class="w-8 h-8 text-yellow-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">進行中</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {{ processingCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {{ completedCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
        </div>
      </UCard>
    </div>

    <!-- Filters and Search -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-1">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="搜尋訂單編號、會員"
            size="lg"
            @input="debouncedSearch"
          />
        </div>

        <!-- Status Filter -->
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          placeholder="選擇訂單狀態"
          size="lg"
          @change="handleFilterChange"
        />

        <!-- Payment Method Filter -->
        <USelectMenu
          v-model="selectedPaymentMethod"
          :items="paymentMethodOptions"
          placeholder="選擇付款方式"
          size="lg"
          @change="handleFilterChange"
        />

        <!-- Shipping Method Filter -->
        <USelectMenu
          v-model="selectedShippingMethod"
          :items="shippingMethodOptions"
          placeholder="選擇配送方式"
          size="lg"
          @change="handleFilterChange"
        />
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2">
        <UBadge v-if="search" color="info" variant="soft">
          搜尋: {{ search }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="search = ''; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedStatus" color="info" variant="soft">
          狀態: {{ getStatusLabel(selectedStatus) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedStatus = null; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedPaymentMethod" color="info" variant="soft">
          付款: {{ getPaymentMethodLabel(selectedPaymentMethod) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedPaymentMethod = null; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedShippingMethod" color="info" variant="soft">
          配送: {{ getShippingMethodLabel(selectedShippingMethod) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedShippingMethod = null; handleFilterChange()"
          />
        </UBadge>
        <UButton
          v-if="hasActiveFilters"
          label="清除全部"
          size="sm"
          color="neutral"
          variant="ghost"
          @click="clearFilters"
        />
      </div>
    </UCard>

    <!-- Orders Table -->
    <UCard>
      <UTable
        :data="orders"
        :columns="columns"
        :loading="isLoading"
        :empty-state="{ icon: 'i-heroicons-shopping-bag-20-solid', label: '沒有訂單資料' }"
      />

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          顯示 {{ (page - 1) * limit + 1 }} 到
          {{ Math.min(page * limit, total) }}
          筆，共 {{ total }} 筆
        </div>
        <UPagination
          v-model:page="page"
          :items-per-page="limit"
          :total="total"
        />
      </div>
    </UCard>

    <!-- View Order Modal -->
    <UModal v-model:open="isViewModalOpen">
      <template #content>
        <UCard v-if="viewingOrder">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">訂單詳情</h3>
            <UBadge
              :color="getStatusColor(viewingOrder.status)"
              size="lg"
            >
              {{ getStatusLabel(viewingOrder.status) }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Order Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              訂單資訊
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">訂單編號</p>
                <p class="font-medium font-mono">{{ viewingOrder.orderNumber }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">建立時間</p>
                <p class="font-medium">{{ formatDateTime(viewingOrder.createdAt) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">付款方式</p>
                <p class="font-medium">{{ getPaymentMethodLabel(viewingOrder.paymentMethod) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">配送方式</p>
                <p class="font-medium">{{ getShippingMethodLabel(viewingOrder.shippingMethod) }}</p>
              </div>
            </div>
          </div>

          <!-- Recipient Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              收件人資訊
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">姓名</p>
                <p class="font-medium">{{ viewingOrder.recipientName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">電話</p>
                <p class="font-medium">{{ viewingOrder.recipientPhone }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-sm text-gray-500">地址</p>
                <p class="font-medium">
                  {{ [
                    viewingOrder.recipientPostalCode,
                    viewingOrder.recipientCity,
                    viewingOrder.recipientDistrict,
                    viewingOrder.recipientAddress
                  ].filter(Boolean).join(' ') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div v-if="viewingOrder.orderItems && viewingOrder.orderItems.length > 0">
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              訂單項目
            </h4>
            <div class="space-y-2">
              <div
                v-for="item in viewingOrder.orderItems"
                :key="item.id"
                class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p class="font-medium">{{ item.productName }}</p>
                  <p class="text-sm text-gray-500">數量: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold">{{ formatCurrency(item.subtotal) }}</p>
                  <p class="text-sm text-gray-500">單價: {{ formatCurrency(item.price) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Amount Summary -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              金額明細
            </h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">商品小計</span>
                <span class="font-medium">{{ formatCurrency(viewingOrder.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">運費</span>
                <span class="font-medium">{{ formatCurrency(viewingOrder.shippingFee) }}</span>
              </div>
              <div v-if="viewingOrder.discountAmount > 0" class="flex justify-between text-red-600">
                <span>折扣</span>
                <span class="font-medium">-{{ formatCurrency(viewingOrder.discountAmount) }}</span>
              </div>
              <div v-if="viewingOrder.pointsUsed > 0" class="flex justify-between text-purple-600">
                <span>點數折抵 ({{ viewingOrder.pointsUsed }} 點)</span>
                <span class="font-medium">-{{ formatCurrency(viewingOrder.pointsUsed) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span class="text-lg font-semibold">訂單總額</span>
                <span class="text-lg font-bold text-green-600">{{ formatCurrency(viewingOrder.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="viewingOrder.customerNote || viewingOrder.adminNote">
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              備註
            </h4>
            <div class="space-y-2">
              <div v-if="viewingOrder.customerNote">
                <p class="text-sm text-gray-500">客戶備註</p>
                <p class="text-sm">{{ viewingOrder.customerNote }}</p>
              </div>
              <div v-if="viewingOrder.adminNote">
                <p class="text-sm text-gray-500">管理員備註</p>
                <p class="text-sm">{{ viewingOrder.adminNote }}</p>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              label="關閉"
              color="neutral"
              variant="soft"
              @click="isViewModalOpen = false"
            />
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <!-- Edit Order Modal -->
    <UModal v-model:open="isEditModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">編輯訂單</h3>
        </template>

        <form @submit.prevent="saveOrder" class="space-y-4">
          <UFormField label="訂單狀態" required>
            <USelectMenu
              v-model="orderForm.status"
              :items="statusOptions"
            />
          </UFormField>

          <UFormField label="物流編號">
            <UInput
              v-model="orderForm.trackingNumber"
              placeholder="輸入物流編號"
            />
          </UFormField>

          <UFormField label="運費">
            <UInput
              v-model.number="orderForm.shippingFee"
              type="number"
              min="0"
              step="0.01"
            />
          </UFormField>

          <UFormField label="折扣金額">
            <UInput
              v-model.number="orderForm.discountAmount"
              type="number"
              min="0"
              step="0.01"
            />
          </UFormField>

          <UFormField label="管理員備註">
            <UTextarea
              v-model="orderForm.adminNote"
              :rows="3"
              placeholder="輸入管理員備註"
            />
          </UFormField>
        </form>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="取消"
              color="neutral"
              variant="soft"
              @click="isEditModalOpen = false"
            />
            <UButton
              label="儲存"
              :loading="isSaving"
              @click="saveOrder"
            />
          </div>
        </template>
      </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h, resolveComponent } from 'vue'
import { ordersApi, type Order, type OrderQueryParams, OrderStatus, SortOrder } from '@/api'
import { useDebounceFn } from '@vueuse/core'

// Data
const orders = ref<Order[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

// Pagination
const page = ref(1)
const limit = ref(10)
const total = ref(0)

// Filters
const search = ref('')
const selectedStatus = ref<OrderStatus | null>(null)
const selectedPaymentMethod = ref<string | null>(null)
const selectedShippingMethod = ref<string | null>(null)

// Modals
const isViewModalOpen = ref(false)
const isEditModalOpen = ref(false)
const viewingOrder = ref<Order | null>(null)
const editingOrder = ref<Order | null>(null)

// Form
const defaultForm = {
  status: OrderStatus.PENDING,
  trackingNumber: null as string | null,
  shippingFee: 0,
  discountAmount: 0,
  adminNote: null as string | null,
}

const orderForm = ref({ ...defaultForm })

// Options
const statusOptions = [
  { value: OrderStatus.PENDING, label: '待付款' },
  { value: OrderStatus.PAID, label: '已付款' },
  { value: OrderStatus.PROCESSING, label: '處理中' },
  { value: OrderStatus.SHIPPING, label: '配送中' },
  { value: OrderStatus.DELIVERED, label: '已送達' },
  { value: OrderStatus.COMPLETED, label: '已完成' },
  { value: OrderStatus.CANCELLED, label: '已取消' },
  { value: OrderStatus.REFUNDED, label: '已退款' },
]

const paymentMethodOptions = [
  { value: 'credit_card', label: '信用卡' },
  { value: 'atm', label: 'ATM 轉帳' },
  { value: 'cvs', label: '超商代碼' },
  { value: 'cod', label: '貨到付款' },
]

const shippingMethodOptions = [
  { value: 'home_delivery', label: '宅配' },
  { value: 'cvs_pickup', label: '超商取貨' },
  { value: 'self_pickup', label: '自取' },
]

// Table Columns
const columns = [
  {
    id: 'orderNumber',
    accessorKey: 'orderNumber',
    header: '訂單編號',
    cell: ({ row }: any) => {
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-mono font-semibold text-primary-600' }, row.original.orderNumber)
      ])
    }
  },
  {
    id: 'member',
    accessorKey: 'recipientName',
    header: '收件人',
    cell: ({ row }: any) => {
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, row.original.recipientName),
        h('span', { class: 'text-xs text-gray-500' }, row.original.recipientPhone)
      ])
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: '狀態',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, {
        color: getStatusColor(row.original.status),
        variant: 'soft',
        size: 'sm'
      }, () => getStatusLabel(row.original.status))
    }
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: '金額',
    cell: ({ row }: any) => {
      return h('span', { class: 'font-semibold text-green-600' }, 
        formatCurrency(row.original.totalAmount)
      )
    }
  },
  {
    id: 'paymentMethod',
    accessorKey: 'paymentMethod',
    header: '付款方式',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, {
        color: 'blue',
        variant: 'soft',
        size: 'sm'
      }, () => getPaymentMethodLabel(row.original.paymentMethod))
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: '建立時間',
    cell: ({ row }: any) => {
      return h('span', { class: 'text-sm text-gray-600' }, 
        formatDateTime(row.original.createdAt)
      )
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }: any) => {
      const UButton = resolveComponent('UButton')
      const UTooltip = resolveComponent('UTooltip')
      
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UTooltip, { text: '查看詳情' }, () =>
          h(UButton, {
            icon: 'i-heroicons-eye',
            size: 'sm',
            color: 'info',
            variant: 'soft',
            onClick: () => viewOrder(row.original)
          })
        ),
        h(UTooltip, { text: '編輯訂單' }, () =>
          h(UButton, {
            icon: 'i-heroicons-pencil',
            size: 'sm',
            color: 'warning',
            variant: 'soft',
            onClick: () => editOrder(row.original)
          })
        )
      ])
    }
  },
]

// Computed
const hasActiveFilters = computed(() => {
  return !!(search.value || selectedStatus.value || selectedPaymentMethod.value || selectedShippingMethod.value)
})

const pendingCount = computed(() => {
  if (!Array.isArray(orders.value)) return 0
  return orders.value.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PAID).length
})

const processingCount = computed(() => {
  if (!Array.isArray(orders.value)) return 0
  return orders.value.filter(o => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.SHIPPING).length
})

const completedCount = computed(() => {
  if (!Array.isArray(orders.value)) return 0
  return orders.value.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED).length
})

// Methods
const fetchOrders = async () => {
  isLoading.value = true
  try {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

    let response
    
    if (isAdmin) {
      const params: OrderQueryParams = {
        page: page.value,
        limit: limit.value,
        sortBy: 'createdAt',
        sortOrder: SortOrder.DESC,
      }

      if (search.value) params.search = search.value
      if (selectedStatus.value) params.status = selectedStatus.value
      if (selectedPaymentMethod.value) params.paymentMethod = selectedPaymentMethod.value
      if (selectedShippingMethod.value) params.shippingMethod = selectedShippingMethod.value

      response = await ordersApi.getAll(params)
    } else {
      // 一般用戶只能看自己的訂單
      response = await ordersApi.getMyOrders()
    }
    
    // API 回應結構處理
    // getAll 回傳 PaginatedResponse: { data: Order[], meta: {...} }
    // getMyOrders 回傳 ApiResponse: { data: Order[] }
    // 需要統一處理
    
    if (isAdmin) {
      const paginatedData = response.data || {}
      orders.value = Array.isArray(paginatedData.data) ? paginatedData.data : []
      total.value = paginatedData.meta?.total || 0
    } else {
      // 一般用戶 API 沒有分頁結構，直接是 Order[]
      const myOrders = Array.isArray(response) ? response : (response.data || [])
      orders.value = myOrders
      total.value = myOrders.length
    }
  } catch (error: any) {
    console.error('獲取訂單失敗:', error)
    orders.value = []
    total.value = 0
    // TODO: Show error toast
  } finally {
    isLoading.value = false
  }
}

const viewOrder = (order: Order) => {
  viewingOrder.value = order
  isViewModalOpen.value = true
}

const editOrder = (order: Order) => {
  editingOrder.value = order
  orderForm.value = {
    status: order.status,
    trackingNumber: order.trackingNumber || null,
    shippingFee: Number(order.shippingFee),
    discountAmount: Number(order.discountAmount),
    adminNote: order.adminNote || null,
  }
  isEditModalOpen.value = true
}

const saveOrder = async () => {
  if (!editingOrder.value) return

  isSaving.value = true
  try {
    await ordersApi.update(editingOrder.value.id, orderForm.value)
    // TODO: Show success toast
    isEditModalOpen.value = false
    fetchOrders()
  } catch (error: any) {
    console.error('更新訂單失敗:', error)
    // TODO: Show error toast
  } finally {
    isSaving.value = false
  }
}

const handleFilterChange = () => {
  page.value = 1
  fetchOrders()
}

const debouncedSearch = useDebounceFn(() => {
  handleFilterChange()
}, 500)

const clearFilters = () => {
  search.value = ''
  selectedStatus.value = null
  selectedPaymentMethod.value = null
  selectedShippingMethod.value = null
  handleFilterChange()
}

// Helper Functions
const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'yellow',
    [OrderStatus.PAID]: 'blue',
    [OrderStatus.PROCESSING]: 'indigo',
    [OrderStatus.SHIPPING]: 'purple',
    [OrderStatus.DELIVERED]: 'green',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'error',
    [OrderStatus.REFUNDED]: 'warning',
  }
  return colors[status] || 'neutral'
}

const getStatusLabel = (status: OrderStatus) => {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '待付款',
    [OrderStatus.PAID]: '已付款',
    [OrderStatus.PROCESSING]: '處理中',
    [OrderStatus.SHIPPING]: '配送中',
    [OrderStatus.DELIVERED]: '已送達',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款',
  }
  return labels[status] || status
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    credit_card: '信用卡',
    atm: 'ATM 轉帳',
    cvs: '超商代碼',
    cod: '貨到付款',
  }
  return labels[method] || method
}

const getShippingMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    home_delivery: '宅配',
    cvs_pickup: '超商取貨',
    self_pickup: '自取',
  }
  return labels[method] || method
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Watch
watch(page, () => {
  fetchOrders()
})

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
</style>
