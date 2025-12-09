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
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">商品小計</span>
                  <span>${{ cartStore.subtotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">運費</span>
                  <span>$60</span>
                </div>
              </div>

              <div class="border-t pt-4">
                <div class="flex justify-between text-xl font-bold">
                  <span>總計</span>
                  <span class="text-harvest-600">${{ (cartStore.subtotal + 60).toLocaleString() }}</span>
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

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const toast = useToast()

const isSubmitting = ref(false)

const form = ref({
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
  set: (val) => { form.value.shippingMethod = val?.value || 'home_delivery' }
})

const selectedPayment = computed({
  get: () => paymentOptions.find(opt => opt.value === form.value.paymentMethod),
  set: (val) => { form.value.paymentMethod = val?.value || 'credit_card' }
})

const submitOrder = async () => {
  isSubmitting.value = true
  try {
    const order = await orderStore.createOrderFromCart(form.value)
    toast.success('訂單已建立', `訂單編號: ${order.orderNumber}`)
    router.push(`/payment?orderId=${order.id}`)
  } catch (error: any) {
    console.error('建立訂單失敗:', error)
    toast.error('建立訂單失敗', '無法建立訂單，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}
</script>
