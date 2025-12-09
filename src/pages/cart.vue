<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-900 dark:to-gray-900">
    <div class="container mx-auto px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">購物車</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          {{ cartStore.itemCount }} 件商品
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="cartStore.isLoading" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-32" />
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartStore.isEmpty" class="text-center py-16">
        <UIcon name="i-heroicons-shopping-cart" class="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
          購物車是空的
        </h2>
        <p class="text-gray-500 mb-6">快去選購喜歡的農產品吧！</p>
        <UButton size="lg" @click="router.push('/shop/products')">
          <UIcon name="i-heroicons-shopping-bag" class="mr-2" />
          前往商店
        </UButton>
      </div>

      <!-- Cart Items -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Items List -->
        <div class="lg:col-span-2 space-y-4">
          <UCard
            v-for="item in cartStore.items"
            :key="item.id"
            class="hover:shadow-md transition-shadow"
          >
            <div class="flex gap-4">
              <!-- Product Image -->
              <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  v-if="item.product?.mainImage"
                  :src="item.product.mainImage"
                  :alt="item.product?.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-300" />
                </div>
              </div>

              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                  {{ item.product?.name || item.productName || '商品' }}
                </h3>
                
                <!-- 價格資訊與變動提示 -->
                <div class="flex items-center gap-2 mb-2">
                  <p class="text-sm text-gray-500">
                    單價: ${{ (item.unitPrice || item.price || 0).toLocaleString() }}
                  </p>
                  <!-- 價格變動提示 -->
                  <UBadge 
                    v-if="item.priceChanged" 
                    color="warning" 
                    size="xs"
                    class="animate-pulse"
                  >
                    <UIcon name="i-heroicons-arrow-trending-up" class="mr-1" />
                    價格已更新
                  </UBadge>
                </div>

                <!-- 庫存警告 -->
                <div v-if="item.stockQuantity !== undefined && item.stockQuantity <= 5 && item.stockQuantity > 0" 
                     class="flex items-center gap-1 text-orange-500 text-xs mb-2">
                  <UIcon name="i-heroicons-exclamation-triangle" />
                  <span>僅剩 {{ item.stockQuantity }} 件</span>
                </div>

                <!-- 無庫存警告 -->
                <div v-if="item.isAvailable === false || (item.stockQuantity !== undefined && item.stockQuantity <= 0)" 
                     class="flex items-center gap-1 text-red-500 text-xs mb-2">
                  <UIcon name="i-heroicons-x-circle" />
                  <span>商品已無庫存</span>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-3 mt-2">
                  <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <UButton
                      icon="i-heroicons-minus"
                      size="sm"
                      color="neutral"
                      variant="ghost"
                      :disabled="item.quantity <= 1 || isUpdating"
                      @click="updateQuantity(item.id, item.quantity - 1)"
                    />
                    <span class="px-4 py-1 min-w-[40px] text-center font-semibold">
                      {{ item.quantity }}
                    </span>
                    <UButton
                      icon="i-heroicons-plus"
                      size="sm"
                      color="neutral"
                      variant="ghost"
                      :disabled="isUpdating || (item.stockQuantity !== undefined && item.quantity >= item.stockQuantity)"
                      @click="updateQuantity(item.id, item.quantity + 1)"
                    />
                  </div>

                  <UButton
                    icon="i-heroicons-trash"
                    size="sm"
                    color="error"
                    variant="ghost"
                    :disabled="isUpdating"
                    @click="removeItem(item.id)"
                  >
                    刪除
                  </UButton>
                </div>
              </div>

              <!-- Price -->
              <div class="text-right flex-shrink-0">
                <p class="text-lg font-bold text-gray-900 dark:text-white">
                  ${{ (item.subtotal || 0).toLocaleString() }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- Clear Cart -->
          <div class="flex justify-between items-center pt-4">
            <UButton
              color="neutral"
              variant="ghost"
              @click="router.push('/shop/products')"
            >
              <UIcon name="i-heroicons-arrow-left" class="mr-2" />
              繼續購物
            </UButton>
            <UButton
              color="error"
              variant="soft"
              :disabled="isUpdating"
              @click="confirmClearCart"
            >
              <UIcon name="i-heroicons-trash" class="mr-2" />
              清空購物車
            </UButton>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">訂單摘要</h2>
            </template>

            <div class="space-y-3">
              <!-- Subtotal -->
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>小計</span>
                <span>${{ (cartStore.subtotal || 0).toLocaleString() }}</span>
              </div>

              <!-- Shipping (placeholder) -->
              <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>運費</span>
                <span>結帳時計算</span>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-200 dark:border-gray-700"></div>

              <!-- Total -->
              <div class="flex justify-between text-xl font-bold">
                <span>總計</span>
                <span class="text-harvest-600">${{ cartStore.subtotal.toLocaleString() }}</span>
              </div>

              <!-- Checkout Button -->
              <UButton
                block
                size="xl"
                color="primary"
                class="mt-6"
                @click="goToCheckout"
              >
                <UIcon name="i-heroicons-shopping-bag" class="mr-2" />
                前往結帳
              </UButton>

              <!-- Continue Shopping -->
              <UButton
                block
                color="neutral"
                variant="outline"
                @click="router.push('/shop/products')"
              >
                繼續購物
              </UButton>
            </div>
          </UCard>

          <!-- Trust Badges -->
          <div class="mt-6 p-4 bg-harvest-50 dark:bg-harvest-900/20 rounded-lg">
            <div class="space-y-3 text-sm">
              <div class="flex items-center gap-2 text-harvest-700 dark:text-harvest-300">
                <UIcon name="i-heroicons-shield-check" />
                <span>安全結帳</span>
              </div>
              <div class="flex items-center gap-2 text-harvest-700 dark:text-harvest-300">
                <UIcon name="i-heroicons-truck" />
                <span>快速配送</span>
              </div>
              <div class="flex items-center gap-2 text-harvest-700 dark:text-harvest-300">
                <UIcon name="i-heroicons-arrow-path" />
                <span>7天鑑賞期</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Cart Confirmation Modal -->
    <UModal v-model:open="isClearModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">確認清空購物車</h3>
          </template>

          <p class="text-gray-600 dark:text-gray-400">
            確定要清空購物車嗎？此操作無法復原。
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="soft"
                @click="isClearModalOpen = false"
              />
              <UButton
                label="確認清空"
                color="error"
                :loading="isClearing"
                @click="clearCart"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()

// State
const isUpdating = ref(false)
const isClearing = ref(false)
const isClearModalOpen = ref(false)

// Methods
const updateQuantity = async (itemId: string, quantity: number) => {
  if (quantity < 1) return

  isUpdating.value = true
  try {
    await cartStore.updateItemQuantity(itemId, quantity)
    console.log('購物車已更新')
  } catch (error: any) {
    console.error('更新失敗:', error)
  } finally {
    isUpdating.value = false
  }
}

const removeItem = async (itemId: string) => {
  isUpdating.value = true
  try {
    await cartStore.removeItem(itemId)
    toast.success('已移除', '商品已從購物車移除')
  } catch (error: any) {
    console.error('移除失敗:', error.message || '無法移除商品')
    toast.error('移除失敗', '無法移除商品，請稍後再試')
  } finally {
    isUpdating.value = false
  }
}

const confirmClearCart = () => {
  isClearModalOpen.value = true
}

const clearCart = async () => {
  isClearing.value = true
  try {
    await cartStore.clearCart()
    console.log('購物車已清空')
    isClearModalOpen.value = false
  } catch (error: any) {
    console.error('清空失敗:', error)
  } finally {
    isClearing.value = false
  }
}

const goToCheckout = async () => {
  try {
    const validation = await cartStore.validateCart()
    if (!validation.isValid) {
      // 顯示詳細的驗證問題
      if (validation.issues && validation.issues.length > 0) {
        const issueMessages = validation.issues.map(issue => issue.issue).join('、')
        toast.warning('無法結帳', issueMessages)
      } else {
        toast.warning('無法結帳', '請檢查商品庫存或價格')
      }
      // 重新載入購物車以獲取最新狀態
      await cartStore.fetchCart()
      return
    }
    router.push('/checkout')
  } catch (error: any) {
    console.error('驗證失敗:', error)
    toast.error('驗證失敗', '無法驗證購物車，請稍後再試')
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await cartStore.fetchCart()
  } catch (error: any) {
    console.error('載入購物車失敗:', error)
  }
})
</script>
