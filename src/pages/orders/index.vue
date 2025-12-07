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
          <SearchBox
            v-model="search"
            placeholder="搜尋訂單編號、會員"
            size="lg"
            @search="handleFilterChange"
          />
        </div>

        <!-- Status Filter -->
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          value-attribute="value"
          placeholder="選擇訂單狀態"
          size="lg"
          @change="handleFilterChange"
        />

        <!-- Payment Method Filter -->
        <USelectMenu
          v-model="selectedPaymentMethod"
          :items="paymentMethodOptions"
          value-attribute="value"
          placeholder="選擇付款方式"
          size="lg"
          @change="handleFilterChange"
        />

        <!-- Shipping Method Filter -->
        <USelectMenu
          v-model="selectedShippingMethod"
          :items="shippingMethodOptions"
          value-attribute="value"
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
          狀態: {{ selectedStatus?.label }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedStatus = undefined; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedPaymentMethod" color="info" variant="soft">
          付款: {{ selectedPaymentMethod?.label }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedPaymentMethod = undefined; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedShippingMethod" color="info" variant="soft">
          配送: {{ selectedShippingMethod?.label }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedShippingMethod = undefined; handleFilterChange()"
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
            <StatusBadge :status="viewingOrder.status" type="order" size="lg" />
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
                  <p class="text-sm text-gray-500">單價: {{ formatCurrency(item.price ?? 0) }}</p>
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

          <!-- Payment Information -->
          <div v-if="paymentInfo">
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              💳 支付資訊
            </h4>
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">支付編號</p>
                  <p class="font-medium font-mono text-sm">{{ paymentInfo.paymentNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">支付狀態</p>
                  <UBadge :color="getPaymentStatusColor(paymentInfo.status)" variant="soft">
                    {{ getPaymentStatusLabel(paymentInfo.status) }}
                  </UBadge>
                </div>
                <div>
                  <p class="text-sm text-gray-500">支付金額</p>
                  <p class="font-semibold text-green-600">{{ formatCurrency(paymentInfo.amount) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">支付方式</p>
                  <p class="font-medium">{{ getPaymentMethodLabel(paymentInfo.paymentMethod) }}</p>
                </div>
                <div v-if="paymentInfo.ecpayTradeNo">
                  <p class="text-sm text-gray-500">ECPay 交易編號</p>
                  <p class="font-medium font-mono text-sm">{{ paymentInfo.ecpayTradeNo }}</p>
                </div>
                <div v-if="paymentInfo.paidAt">
                  <p class="text-sm text-gray-500">付款時間</p>
                  <p class="font-medium text-sm">{{ formatDateTime(paymentInfo.paidAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Refund Information -->
          <div v-if="refundInfo">
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              💰 退款資訊
            </h4>
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">退款編號</p>
                  <p class="font-medium font-mono text-sm">{{ refundInfo.refundNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">退款狀態</p>
                  <UBadge :color="getRefundStatusColor(refundInfo.status)" variant="soft">
                    {{ getRefundStatusLabel(refundInfo.status) }}
                  </UBadge>
                </div>
                <div>
                  <p class="text-sm text-gray-500">退款金額</p>
                  <p class="font-semibold text-red-600">{{ formatCurrency(refundInfo.amount) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">申請時間</p>
                  <p class="font-medium text-sm">{{ formatDateTime(refundInfo.createdAt) }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-sm text-gray-500">退款原因</p>
                  <p class="font-medium">{{ refundInfo.reason }}</p>
                </div>
                <div v-if="refundInfo.rejectedReason" class="col-span-2">
                  <p class="text-sm text-gray-500">拒絕原因</p>
                  <p class="font-medium text-red-600">{{ refundInfo.rejectedReason }}</p>
                </div>
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
          <div class="flex justify-between items-center">
            <!-- 退款按鈕 (僅已付款且無退款記錄時顯示) -->
            <div>
              <UButton
                v-if="canApplyRefund"
                label="申請退款"
                icon="i-heroicons-arrow-left-on-rectangle"
                color="warning"
                @click="openRefundModal"
              />
            </div>
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
              v-model="orderFormStatus"
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

    <!-- Refund Application Modal -->
    <UModal v-model:open="isRefundModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">申請退款</h3>
        </template>

        <form @submit.prevent="submitRefund" class="space-y-4">
          <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              訂單編號: <span class="font-mono font-semibold">{{ viewingOrder?.orderNumber }}</span>
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              訂單金額: <span class="font-semibold text-green-600">{{ formatCurrency(viewingOrder?.totalAmount || 0) }}</span>
            </p>
          </div>

          <UFormField label="退款金額" required>
            <UInput
              v-model.number="refundForm.amount"
              type="number"
              min="1"
              :max="viewingOrder?.totalAmount || 0"
              step="0.01"
              placeholder="輸入退款金額"
            />
            <template #hint>
              <span class="text-xs text-gray-500">最多可退款: {{ formatCurrency(viewingOrder?.totalAmount || 0) }}</span>
            </template>
          </UFormField>

          <UFormField label="退款原因" required>
            <UTextarea
              v-model="refundForm.reason"
              :rows="4"
              placeholder="請詳細說明退款原因..."
            />
          </UFormField>
        </form>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="取消"
              color="neutral"
              variant="soft"
              @click="isRefundModalOpen = false"
            />
            <UButton
              label="提交申請"
              color="warning"
              :loading="isSubmittingRefund"
              :disabled="!canSubmitRefund"
              @click="submitRefund"
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
import StatusBadge from '@/components/common/StatusBadge.vue'
import { 
  ordersApi, 
  paymentApi, 
  refundApi,
  type Order, 
  type OrderQueryParams, 
  type Payment,
  type Refund,
  OrderStatus, 
  PaymentStatus,
  RefundStatus,
  SortOrder, 
  type PaginatedResponse, 
  type ApiResponse 
} from '@/api'
import SearchBox from '@/components/common/SearchBox.vue'

// Data
const orders = ref<Order[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isSubmittingRefund = ref(false)

// Payment & Refund Data
const paymentInfo = ref<Payment | null>(null)
const refundInfo = ref<Refund | null>(null)


// Pagination
const page = ref(1)
const limit = ref(10)
const total = ref(0)

// Filters (internal simple values)
const search = ref('')
const filterStatus = ref<OrderStatus | undefined>(undefined)
const filterPaymentMethod = ref<string | undefined>(undefined)
const filterShippingMethod = ref<string | undefined>(undefined)

// Convert simple values to SelectMenu option objects
const selectedStatus = computed({
  get: () => statusOptions.find(opt => opt.value === filterStatus.value),
  set: (val) => { filterStatus.value = val?.value }
})

const selectedPaymentMethod = computed({
  get: () => paymentMethodOptions.find(opt => opt.value === filterPaymentMethod.value),
  set: (val) => { filterPaymentMethod.value = val?.value }
})

const selectedShippingMethod = computed({
  get: () => shippingMethodOptions.find(opt => opt.value === filterShippingMethod.value),
  set: (val) => { filterShippingMethod.value = val?.value }
})

// Modals
const isViewModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isRefundModalOpen = ref(false)
const viewingOrder = ref<Order | null>(null)
const editingOrder = ref<Order | null>(null)

// Refund Form
const defaultRefundForm = {
  amount: 0,
  reason: ''
}
const refundForm = ref({ ...defaultRefundForm })

// Form
const defaultForm = {
  status: OrderStatus.PENDING,
  trackingNumber: null as string | null,
  shippingFee: 0,
  discountAmount: 0,
  adminNote: null as string | null,
}

const orderForm = ref({ ...defaultForm })

// Computed for orderForm.status SelectMenu
const orderFormStatus = computed({
  get: () => statusOptions.find(opt => opt.value === orderForm.value.status),
  set: (val) => { if (val) orderForm.value.status = val.value }
})

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
      return h(StatusBadge, {
        status: row.original.status,
        type: 'order',
        size: 'sm'
      })
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

// Refund related computed
const canApplyRefund = computed(() => {
  if (!viewingOrder.value || refundInfo.value) return false
  
  // 檢查訂單狀態是否為已付款或更後面的狀態
  const validStatuses = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED
  ]
  return validStatuses.includes(viewingOrder.value.status)
})

const canSubmitRefund = computed(() => {
  return refundForm.value.amount > 0 && 
         refundForm.value.amount <= (viewingOrder.value?.totalAmount || 0) &&
         refundForm.value.reason.trim().length > 0
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
      if (filterStatus.value) params.status = filterStatus.value
      if (filterPaymentMethod.value) params.paymentMethod = filterPaymentMethod.value
      if (filterShippingMethod.value) params.shippingMethod = filterShippingMethod.value

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
      // Admin API returns ApiResponse<PaginatedResponse<Order>>
      // Need to access response.data to get the actual PaginatedResponse
      const apiResponse = response as any
      const paginatedData = apiResponse.data || apiResponse
      orders.value = Array.isArray(paginatedData.data) ? paginatedData.data : []
      total.value = paginatedData.meta?.total || paginatedData.total || 0
    } else {
      // User API returns ApiResponse<Order[]>
      const apiResponse = response as ApiResponse<Order[]>
      const myOrders = Array.isArray(apiResponse.data) ? apiResponse.data : []
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

const viewOrder = async (order: Order) => {
  viewingOrder.value = order
  isViewModalOpen.value = true
  
  // 重置支付和退款資訊
  paymentInfo.value = null
  refundInfo.value = null
  
  // 獲取支付資訊
  await fetchPaymentInfo(order.id)
  
  // 獲取退款資訊 (如果有)
  await fetchRefundInfo(order.id)
}

const fetchPaymentInfo = async (orderId: string) => {
  try {
    const payment = await paymentApi.getByOrderId(orderId)
    paymentInfo.value = payment
  } catch (error) {
    console.error('獲取支付資訊失敗:', error)
    // 沒有支付記錄也是正常的,不顯示錯誤
  }
}

const fetchRefundInfo = async (orderId: string) => {
  try {
    const refund = await refundApi.getByOrderId(orderId)
    refundInfo.value = refund
  } catch (error) {
    console.error('獲取退款資訊失敗:', error)
    // 沒有退款記錄也是正常的,不顯示錯誤
  }
}

const openRefundModal = () => {
  refundForm.value = {
    amount: viewingOrder.value?.totalAmount || 0,
    reason: ''
  }
  isRefundModalOpen.value = true
}

const submitRefund = async () => {
  if (!viewingOrder.value || !canSubmitRefund.value) return
  
  isSubmittingRefund.value = true
  try {
    await refundApi.create({
      orderId: viewingOrder.value.id,
      amount: refundForm.value.amount,
      reason: refundForm.value.reason
    })
    
    // TODO: Show success toast
    console.log('退款申請成功')
    
    // 關閉 modal 並刷新退款資訊
    isRefundModalOpen.value = false
    await fetchRefundInfo(viewingOrder.value.id)
  } catch (error) {
    console.error('退款申請失敗:', error)
    // TODO: Show error toast
  } finally {
    isSubmittingRefund.value = false
  }
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


const clearFilters = () => {
  search.value = ''
  filterStatus.value = undefined
  filterPaymentMethod.value = undefined
  filterShippingMethod.value = undefined
  handleFilterChange()
}

// Helper Functions (kept for getPaymentMethodLabel, etc.)
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

// Payment Status Helpers
const getPaymentStatusColor = (status: PaymentStatus) =>{
  const colors: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'yellow',
    [PaymentStatus.PAID]: 'success',
    [PaymentStatus.FAILED]: 'error',
    [PaymentStatus.CANCELLED]: 'neutral',
    [PaymentStatus.REFUNDED]: 'warning',
    [PaymentStatus.PARTIAL_REFUNDED]: 'orange',
  }
  return colors[status] || 'neutral'
}

const getPaymentStatusLabel = (status: PaymentStatus) => {
  const labels: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: '待付款',
    [PaymentStatus.PAID]: '已付款',
    [PaymentStatus.FAILED]: '付款失敗',
    [PaymentStatus.CANCELLED]: '已取消',
    [PaymentStatus.REFUNDED]: '已退款',
    [PaymentStatus.PARTIAL_REFUNDED]: '部分退款',
  }
  return labels[status] || status
}

// Refund Status Helpers
const getRefundStatusColor = (status: RefundStatus) => {
  const colors: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: 'yellow',
    [RefundStatus.APPROVED]: 'blue',
    [RefundStatus.REJECTED]: 'error',
    [RefundStatus.COMPLETED]: 'success',
  }
  return colors[status] || 'neutral'
}

const getRefundStatusLabel = (status: RefundStatus) => {
  const labels: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: '待審核',
    [RefundStatus.APPROVED]: '已批准',
    [RefundStatus.REJECTED]: '已拒絕',
    [RefundStatus.COMPLETED]: '已完成',
  }
  return labels[status] || status
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(numAmount)
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
