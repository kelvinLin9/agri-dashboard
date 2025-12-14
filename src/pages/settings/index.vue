<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">系統設定</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          管理商店基本資訊與運費設定
        </p>
      </div>
      <UButton
        icon="i-heroicons-arrow-path"
        :loading="settingsStore.isLoading"
        @click="handleRefresh"
      >
        重新載入
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="settingsStore.isLoading && !settingsStore.settings.length" class="space-y-4">
      <USkeleton v-for="i in 5" :key="i" class="h-16" />
    </div>

    <!-- Tabs -->
    <UTabs v-else :items="tabItems" class="w-full">
      <!-- 商店資訊 Tab -->
      <template #store>
        <UCard class="mt-4">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-building-storefront" class="w-5 h-5 text-harvest-600" />
              <span class="font-semibold">商店基本資訊</span>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="商店名稱">
              <UInput
                v-model="storeForm.store_name"
                placeholder="輸入商店名稱"
                class="w-full"
              />
            </UFormField>

            <UFormField label="商店描述">
              <UTextarea
                v-model="storeForm.store_description"
                placeholder="輸入商店描述（用於 SEO）"
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <UFormField label="聯絡信箱">
              <UInput
                v-model="storeForm.store_email"
                type="email"
                placeholder="contact@example.com"
                class="w-full"
              />
            </UFormField>

            <UFormField label="聯絡電話">
              <UInput
                v-model="storeForm.store_phone"
                placeholder="02-1234-5678"
                class="w-full"
              />
            </UFormField>

            <UFormField label="商店地址">
              <UInput
                v-model="storeForm.store_address"
                placeholder="輸入商店地址"
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="primary"
                :loading="settingsStore.isSaving"
                @click="saveStoreSettings"
              >
                <UIcon name="i-heroicons-check" class="mr-2" />
                儲存商店設定
              </UButton>
            </div>
          </template>
        </UCard>
      </template>

      <!-- 運費設定 Tab -->
      <template #shipping>
        <UCard class="mt-4">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-truck" class="w-5 h-5 text-harvest-600" />
              <span class="font-semibold">運費設定</span>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="免運門檻" hint="訂單金額達此門檻免運費">
              <UInput
                v-model.number="shippingForm.shipping_free_threshold"
                type="number"
                placeholder="1500"
                class="w-full"
              >
                <template #leading>
                  <span class="text-gray-500">NT$</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField label="基本運費" hint="未達免運門檻時的運費">
              <UInput
                v-model.number="shippingForm.shipping_base_fee"
                type="number"
                placeholder="100"
                class="w-full"
              >
                <template #leading>
                  <span class="text-gray-500">NT$</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField label="冷藏商品加價" hint="冷藏商品額外運費">
              <UInput
                v-model.number="shippingForm.shipping_cold_fee"
                type="number"
                placeholder="50"
                class="w-full"
              >
                <template #leading>
                  <span class="text-gray-500">NT$</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField label="離島配送加價" hint="離島地區額外運費">
              <UInput
                v-model.number="shippingForm.shipping_island_fee"
                type="number"
                placeholder="150"
                class="w-full"
              >
                <template #leading>
                  <span class="text-gray-500">NT$</span>
                </template>
              </UInput>
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="primary"
                :loading="settingsStore.isSaving"
                @click="saveShippingSettings"
              >
                <UIcon name="i-heroicons-check" class="mr-2" />
                儲存運費設定
              </UButton>
            </div>
          </template>
        </UCard>
      </template>

      <!-- 訂單設定 Tab -->
      <template #order>
        <UCard class="mt-4">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-harvest-600" />
              <span class="font-semibold">訂單設定</span>
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="訂單逾時時間 (分鐘)" hint="未付款訂單自動取消的時間">
              <UInput
                v-model.number="orderForm.order_timeout_minutes"
                type="number"
                placeholder="30"
                class="w-full"
              />
            </UFormField>

            <UFormField label="訂單編號前綴" hint="訂單編號的前綴字串">
              <UInput
                v-model="orderForm.order_prefix"
                placeholder="SB"
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="primary"
                :loading="settingsStore.isSaving"
                @click="saveOrderSettings"
              >
                <UIcon name="i-heroicons-check" class="mr-2" />
                儲存訂單設定
              </UButton>
            </div>
          </template>
        </UCard>
      </template>

      <!-- 通知偏好 Tab -->
      <template #notification>
        <UCard class="mt-4">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-bell-alert" class="w-5 h-5 text-harvest-600" />
              <span class="font-semibold">通知偏好</span>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div class="font-medium">新訂單通知</div>
                <div class="text-sm text-gray-500">當有新訂單時發送通知</div>
              </div>
              <USwitch v-model="notificationForm.notification_new_order" />
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div class="font-medium">低庫存警告</div>
                <div class="text-sm text-gray-500">當庫存低於閾值時通知</div>
              </div>
              <USwitch v-model="notificationForm.notification_low_stock" />
            </div>

            <UFormField label="低庫存警告閾值" hint="庫存低於此數量時發送通知">
              <UInput
                v-model.number="notificationForm.notification_low_stock_threshold"
                type="number"
                placeholder="10"
                class="w-full"
              />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="primary"
                :loading="settingsStore.isSaving"
                @click="saveNotificationSettings"
              >
                <UIcon name="i-heroicons-check" class="mr-2" />
                儲存通知偏好
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UTabs>

    <!-- Error Alert -->
    <UAlert
      v-if="settingsStore.error"
      color="error"
      icon="i-heroicons-exclamation-triangle"
      :title="settingsStore.error"
      :close-button="{ icon: 'i-heroicons-x-mark', color: 'error', variant: 'link' }"
      @close="settingsStore.error = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'

const settingsStore = useSettingsStore()
const toast = useToast()

// Tab 設定
const tabItems = [
  { label: '商店資訊', icon: 'i-heroicons-building-storefront', slot: 'store' },
  { label: '運費設定', icon: 'i-heroicons-truck', slot: 'shipping' },
  { label: '訂單設定', icon: 'i-heroicons-clipboard-document-list', slot: 'order' },
  { label: '通知偏好', icon: 'i-heroicons-bell-alert', slot: 'notification' },
]

// 表單狀態
const storeForm = reactive({
  store_name: '',
  store_description: '',
  store_email: '',
  store_phone: '',
  store_address: '',
})

const shippingForm = reactive({
  shipping_free_threshold: 1500,
  shipping_base_fee: 100,
  shipping_cold_fee: 50,
  shipping_island_fee: 150,
})

const orderForm = reactive({
  order_timeout_minutes: 30,
  order_prefix: 'SB',
})

const notificationForm = reactive({
  notification_new_order: true,
  notification_low_stock: true,
  notification_low_stock_threshold: 10,
})

// 從 store 同步到表單
const syncFormFromStore = () => {
  // 商店設定
  storeForm.store_name = settingsStore.getSetting('store_name') || ''
  storeForm.store_description = settingsStore.getSetting('store_description') || ''
  storeForm.store_email = settingsStore.getSetting('store_email') || ''
  storeForm.store_phone = settingsStore.getSetting('store_phone') || ''
  storeForm.store_address = settingsStore.getSetting('store_address') || ''

  // 運費設定
  shippingForm.shipping_free_threshold = settingsStore.getSetting('shipping_free_threshold') ?? 1500
  shippingForm.shipping_base_fee = settingsStore.getSetting('shipping_base_fee') ?? 100
  shippingForm.shipping_cold_fee = settingsStore.getSetting('shipping_cold_fee') ?? 50
  shippingForm.shipping_island_fee = settingsStore.getSetting('shipping_island_fee') ?? 150

  // 訂單設定
  orderForm.order_timeout_minutes = settingsStore.getSetting('order_timeout_minutes') ?? 30
  orderForm.order_prefix = settingsStore.getSetting('order_prefix') ?? 'SB'

  // 通知偏好
  notificationForm.notification_new_order = settingsStore.getSetting('notification_new_order') ?? true
  notificationForm.notification_low_stock = settingsStore.getSetting('notification_low_stock') ?? true
  notificationForm.notification_low_stock_threshold = settingsStore.getSetting('notification_low_stock_threshold') ?? 10
}

// 儲存商店設定
const saveStoreSettings = async () => {
  try {
    await settingsStore.updateSettings([
      { key: 'store_name', value: storeForm.store_name },
      { key: 'store_description', value: storeForm.store_description },
      { key: 'store_email', value: storeForm.store_email },
      { key: 'store_phone', value: storeForm.store_phone },
      { key: 'store_address', value: storeForm.store_address },
    ])
    toast.success('已儲存', '商店設定已更新')
  } catch (err) {
    toast.error('儲存失敗', settingsStore.error || '請稍後再試')
  }
}

// 儲存運費設定
const saveShippingSettings = async () => {
  try {
    await settingsStore.updateSettings([
      { key: 'shipping_free_threshold', value: shippingForm.shipping_free_threshold, type: 'number' },
      { key: 'shipping_base_fee', value: shippingForm.shipping_base_fee, type: 'number' },
      { key: 'shipping_cold_fee', value: shippingForm.shipping_cold_fee, type: 'number' },
      { key: 'shipping_island_fee', value: shippingForm.shipping_island_fee, type: 'number' },
    ])
    toast.success('已儲存', '運費設定已更新')
  } catch (err) {
    toast.error('儲存失敗', settingsStore.error || '請稍後再試')
  }
}

// 儲存訂單設定
const saveOrderSettings = async () => {
  try {
    await settingsStore.updateSettings([
      { key: 'order_timeout_minutes', value: orderForm.order_timeout_minutes, type: 'number' },
      { key: 'order_prefix', value: orderForm.order_prefix },
    ])
    toast.success('已儲存', '訂單設定已更新')
  } catch (err) {
    toast.error('儲存失敗', settingsStore.error || '請稍後再試')
  }
}

// 儲存通知偏好
const saveNotificationSettings = async () => {
  try {
    await settingsStore.updateSettings([
      { key: 'notification_new_order', value: notificationForm.notification_new_order, type: 'boolean' },
      { key: 'notification_low_stock', value: notificationForm.notification_low_stock, type: 'boolean' },
      { key: 'notification_low_stock_threshold', value: notificationForm.notification_low_stock_threshold, type: 'number' },
    ])
    toast.success('已儲存', '通知偏好已更新')
  } catch (err) {
    toast.error('儲存失敗', settingsStore.error || '請稍後再試')
  }
}

// 重新載入
const handleRefresh = async () => {
  await settingsStore.fetchAll()
  syncFormFromStore()
}

// 監聽 store 變化
watch(() => settingsStore.settings, () => {
  syncFormFromStore()
}, { deep: true })

// 載入設定
onMounted(async () => {
  await settingsStore.fetchAll()
  syncFormFromStore()
})
</script>
