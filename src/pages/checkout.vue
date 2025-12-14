<template>
  <div class="page-warm-light py-8">
    <div class="container mx-auto px-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">結帳</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2">
          <UCard class="card-glass shadow-warm">
            <template #header>
              <h2 class="text-xl font-semibold">收件人資訊</h2>
            </template>

            <form @submit.prevent="submitOrder" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="收件人姓名" required>
                  <UInput v-model="form.recipientName" placeholder="請輸入姓名" />
                </UFormField>

                <UFormField label="聯絡電話" required>
                  <UInput v-model="form.recipientPhone" placeholder="0912345678" />
                </UFormField>
              </div>

              <UFormField label="Email">
                <UInput v-model="form.recipientEmail" type="email" placeholder="your@email.com" />
              </UFormField>

              <div class="grid grid-cols-3 gap-4">
                <UFormField label="郵遞區號" required>
                  <UInput v-model="form.recipientPostalCode" placeholder="100" />
                </UFormField>

                <UFormField label="縣市" required>
                  <UInput v-model="form.recipientCity" placeholder="台北市" />
                </UFormField>

                <UFormField label="區域" required>
                  <UInput v-model="form.recipientDistrict" placeholder="中正區" />
                </UFormField>
              </div>

              <UFormField label="詳細地址" required>
                <UInput v-model="form.recipientAddress" placeholder="請輸入詳細地址" />
              </UFormField>

              <UFormField label="配送方式" required>
                <USelectMenu v-model="selectedShipping" :items="shippingOptions" />
              </UFormField>

              <UFormField label="付款方式" required>
                <USelectMenu v-model="selectedPayment" :items="paymentOptions" />
              </UFormField>

              <UFormField label="訂單備註">
                <UTextarea v-model="form.customerNote" :rows="3" placeholder="有什麼需要備註的嗎？" />
              </UFormField>
            </form>
          </UCard>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <UCard class="card-glass shadow-warm">
            <template #header>
              <h2 class="text-lg font-semibold">訂單摘要</h2>
            </template>

            <div class="space-y-4">
              <!-- Coupon Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">優惠碼</label>
                <div class="flex gap-2">
                  <UInput
                    v-model="couponCode"
                    placeholder="輸入優惠碼"
                    size="sm"
                    :disabled="isValidatingCoupon || appliedCoupon !== null"
                    class="flex-1"
                    @keyup.enter="validateCoupon"
                  />
                  <UButton
                    v-if="!appliedCoupon"
                    size="sm"
                    variant="outline"
                    :loading="isValidatingCoupon"
                    :disabled="!couponCode.trim()"
                    @click="validateCoupon"
                  >
                    套用
                  </UButton>
                  <UButton
                    v-else
                    size="sm"
                    color="error"
                    variant="ghost"
                    @click="removeCoupon"
                  >
                    移除
                  </UButton>
                </div>
                <!-- Coupon Status -->
                <div v-if="couponError" class="text-sm text-red-500 flex items-center gap-1">
                  <UIcon name="i-heroicons-x-circle" class="w-4 h-4" />
                  {{ couponError }}
                </div>
                <div v-if="appliedCoupon" class="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
                  已套用: {{ appliedCoupon.name }} (-${{ discountAmount.toLocaleString() }})
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">商品小計</span>
                  <span>${{ cartStore.subtotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">運費</span>
                  <span v-if="shippingFee === 0" class="text-green-600">免運費</span>
                  <span v-else>${{ shippingFee.toLocaleString() }}</span>
                </div>
                <div v-if="shippingFee === 0 && cartStore.subtotal > 0" class="text-xs text-green-600">
                  已達免運門檻 (滿 ${{ shippingConfig?.freeThreshold?.toLocaleString() }})
                </div>
                <div v-if="discountAmount > 0" class="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>優惠折扣</span>
                  <span>-${{ discountAmount.toLocaleString() }}</span>
                </div>
              </div>

              <div class="border-t pt-4">
                <div class="flex justify-between text-xl font-bold">
                  <span>總計</span>
                  <span class="text-harvest-600">${{ totalAmount.toLocaleString() }}</span>
                </div>
              </div>

              <UButton block size="xl" :loading="isSubmitting" @click="submitOrder">
                確認訂單
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/orders'
import { useToast } from '@/composables/useToast'
import * as v from 'valibot'
import { CheckoutFormSchema, type CheckoutFormInput } from '@/schemas/checkout'
import { trackPurchase } from '@/utils/analytics'
import { couponsApi } from '@/api/coupons'
import { settingsApi } from '@/api/settings'
import type { ShippingConfig } from '@/api/types/settings'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const toast = useToast()

const isSubmitting = ref(false)
const isValidatingCoupon = ref(false)
const couponCode = ref('')
const couponError = ref('')
const appliedCoupon = ref<{ code: string; name: string } | null>(null)
const discountAmount = ref(0)
const shippingConfig = ref<ShippingConfig | null>(null)

// 計算運費
const shippingFee = computed(() => {
  if (!shippingConfig.value) return 100 // 預設運費
  const { freeThreshold, baseFee } = shippingConfig.value
  // 滿額免運
  if (cartStore.subtotal >= freeThreshold) return 0
  return baseFee
})

const totalAmount = computed(() => {
  return cartStore.subtotal + shippingFee.value - discountAmount.value
})

const form = ref<CheckoutFormInput>({
  recipientName: '',
  recipientPhone: '',
  recipientEmail: '',
  recipientPostalCode: '',
  recipientCity: '',
  recipientDistrict: '',
  recipientAddress: '',
  shippingMethod: 'home_delivery',
  paymentMethod: 'credit_card',
  customerNote: '',
})

const shippingOptions = [
  { label: '宅配', value: 'home_delivery' },
  { label: '超商取貨', value: 'cvs_pickup' },
]

const paymentOptions = [
  { label: '信用卡', value: 'credit_card' },
  { label: 'ATM 轉帳', value: 'atm' },
  { label: '超商代碼', value: 'cvs' },
]

const selectedShipping = computed({
  get: () => shippingOptions.find(opt => opt.value === form.value.shippingMethod),
  set: (val) => { form.value.shippingMethod = val?.value as 'home_delivery' | 'cvs_pickup' || 'home_delivery' }
})

const selectedPayment = computed({
  get: () => paymentOptions.find(opt => opt.value === form.value.paymentMethod),
  set: (val) => { form.value.paymentMethod = val?.value as 'credit_card' | 'atm' | 'cvs' || 'credit_card' }
})

// 使用 Valibot 驗證表單
const validateForm = (): boolean => {
  const result = v.safeParse(CheckoutFormSchema, form.value)

  if (!result.success) {
    // 取得第一個錯誤訊息
    const firstIssue = result.issues[0]
    const errorMessage = firstIssue.message || '請檢查表單內容'
    toast.error('請填寫必要欄位', errorMessage)
    return false
  }

  return true
}

// 優惠碼驗證
const validateCoupon = async () => {
  if (!couponCode.value.trim()) return

  isValidatingCoupon.value = true
  couponError.value = ''

  const result = await couponsApi.validate(couponCode.value, cartStore.subtotal)

  if (result.isValid && result.coupon && result.discountAmount !== undefined) {
    appliedCoupon.value = {
      code: result.coupon.code,
      name: result.coupon.name,
    }
    discountAmount.value = result.discountAmount
    toast.success('優惠碼已套用', `折扣 $${result.discountAmount}`)
  } else {
    couponError.value = result.message || '優惠碼無效'
  }

  isValidatingCoupon.value = false
}

// 移除優惠碼
const removeCoupon = () => {
  appliedCoupon.value = null
  discountAmount.value = 0
  couponCode.value = ''
  couponError.value = ''
}

const submitOrder = async () => {
  // 先驗證表單
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  // 建立訂單時包含優惠碼資訊（折扣金額由後端根據 couponCode 計算）
  const orderData = {
    ...form.value,
    couponCode: appliedCoupon.value?.code || undefined,
  }
  const order = await orderStore.createOrderFromCart(orderData)
  // GA4: 追蹤購買完成
  trackPurchase({
    transactionId: order.orderNumber || order.id.toString(),
    value: order.totalAmount || totalAmount.value,
    items: cartStore.items.map(item => ({
      id: item.productId,
      name: item.product?.name || item.productName || '商品',
      price: item.unitPrice || item.price || 0,
      quantity: item.quantity
    }))
  })
  toast.success('訂單已建立', `訂單編號: ${order.orderNumber}`)
  isSubmitting.value = false
  router.push(`/payment?orderId=${order.id}`)
}

// 載入運費設定
const loadShippingConfig = async () => {
  try {
    shippingConfig.value = await settingsApi.getShippingConfig()
  } catch (err) {
    console.error('載入運費設定失敗', err)
  }
}

// 頁面載入時取得運費設定
loadShippingConfig()
</script>
