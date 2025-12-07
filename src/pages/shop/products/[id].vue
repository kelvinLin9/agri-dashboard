<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-6 py-8">
      <!-- Back Button -->
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        class="mb-6"
        @click="router.back()"
      >
        返回商品列表
      </UButton>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <USkeleton class="h-96" />
        <USkeleton class="h-96" />
      </div>

      <!-- Product Detail -->
      <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Product Image -->
        <div>
          <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
            <img
              v-if="product.mainImage"
              :src="product.mainImage"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-32 h-32 text-gray-300" />
            </div>
          </div>

          <!-- Gallery (if available) -->
          <div v-if="product.images && product.images.length > 0" class="grid grid-cols-4 gap-2">
            <div
              v-for="(image, index) in product.images"
              :key="index"
              class="aspect-square bg-gray-100 dark:bg-gray-800 rounded cursor-pointer hover:opacity-75"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Title and Category -->
          <div>
            <UBadge
              v-if="product.category"
              color="gray"
              variant="soft"
              class="mb-2"
            >
              {{ product.category.name }}
            </UBadge>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ product.name }}
            </h1>
            <p v-if="product.shortDescription" class="text-gray-600 dark:text-gray-400">
              {{ product.shortDescription }}
            </p>
          </div>

          <!-- Badges -->
          <div class="flex gap-2">
            <UBadge v-if="product.isNew" color="purple" variant="soft">
              新品
            </UBadge>
            <UBadge v-if="product.isFeatured" color="yellow" variant="soft">
              精選
            </UBadge>
          </div>

          <!-- Price -->
          <div class="border-y border-gray-200 dark:border-gray-700 py-6">
            <div class="flex items-baseline gap-3">
              <span v-if="product.salePrice" class="text-4xl font-bold text-green-600">
                ${{ product.salePrice.toLocaleString() }}
              </span>
              <span
                v-if="product.salePrice && product.originalPrice"
                class="text-xl text-gray-400 line-through"
              >
                ${{ product.originalPrice.toLocaleString() }}
              </span>
              <span v-if="!product.salePrice" class="text-4xl font-bold text-gray-900 dark:text-white">
                ${{ product.originalPrice.toLocaleString() }}
              </span>
            </div>
            <p v-if="product.salePrice" class="text-sm text-green-600 mt-2">
              節省 ${{ (product.originalPrice - product.salePrice).toLocaleString() }}
            </p>
          </div>

          <!-- Stock and SKU -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">庫存狀態:</span>
              <UBadge
                v-if="product.stockQuantity > 10"
                color="success"
                variant="soft"
              >
                庫存充足 ({{ product.stockQuantity }})
              </UBadge>
              <UBadge
                v-else-if="product.stockQuantity > 0"
                color="warning"
                variant="soft"
              >
                庫存不多 ({{ product.stockQuantity }})
              </UBadge>
              <UBadge v-else color="error" variant="soft">
                缺貨中
              </UBadge>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">商品編號:</span>
              <span class="text-sm font-mono">{{ product.sku }}</span>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              數量
            </label>
            <div class="flex items-center gap-4">
              <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <UButton
                  icon="i-heroicons-minus"
                  color="neutral"
                  variant="ghost"
                  :disabled="quantity <= 1"
                  @click="quantity--"
                />
                <span class="px-6 py-2 min-w-[60px] text-center font-semibold">
                  {{ quantity }}
                </span>
                <UButton
                  icon="i-heroicons-plus"
                  color="neutral"
                  variant="ghost"
                  :disabled="quantity >= product.stockQuantity"
                  @click="quantity++"
                />
              </div>
              <span class="text-sm text-gray-500">
                最多 {{ product.stockQuantity }} 件
              </span>
            </div>
          </div>

          <!-- Add to Cart -->
          <div class="flex gap-3">
            <UButton
              size="xl"
              block
              :disabled="product.stockQuantity <= 0 || isAddingToCart"
              :loading="isAddingToCart"
              @click="addToCart"
            >
              <UIcon name="i-heroicons-shopping-cart" class="mr-2" />
              {{ product.stockQuantity > 0 ? '加入購物車' : '缺貨中' }}
            </UButton>
            <UButton
              size="xl"
              color="green"
              :disabled="product.stockQuantity <= 0 || isAddingToCart"
              @click="buyNow"
            >
              立即購買
            </UButton>
          </div>

          <!-- Product Details -->
          <div v-if="product.origin || product.shelfLife" class="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">商品資訊</h3>
            <div v-if="product.origin" class="flex gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">產地:</span>
              <span class="text-sm font-medium">{{ product.origin }}</span>
            </div>
            <div v-if="product.shelfLife" class="flex gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">保存期限:</span>
              <span class="text-sm font-medium">{{ product.shelfLife }} 天</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Description -->
      <div v-if="product && product.description" class="mt-12">
        <UCard>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            商品詳情
          </h2>
          <div class="prose dark:prose-invert max-w-none" v-html="product.description"></div>
        </UCard>
      </div>

      <!-- Error State -->
      <div v-if="!isLoading && !product" class="text-center py-16">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-4">找不到此商品</p>
        <UButton @click="router.push('/shop/products')">
          返回商品列表
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productsApi, type Product } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()

// Data
const product = ref<Product | null>(null)
const isLoading = ref(false)
const isAddingToCart = ref(false)
const quantity = ref(1)

// Methods
const fetchProduct = async () => {
  isLoading.value = true
  try {
    const productId = route.params.id as string
    product.value = await productsApi.getById(productId)
  } catch (error: any) {
    console.error('獲取商品失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  if (!product.value) return

  isAddingToCart.value = true
  try {
    await cartStore.addItem({
      productId: product.value.id,
      quantity: quantity.value
    })
    toast.success('已加入購物車', `${product.value.name} x ${quantity.value}`)
    quantity.value = 1
  } catch (error: any) {
    console.error('加入購物車失敗:', error)
    toast.error('加入失敗', '無法加入購物車，請稍後再試')
  } finally {
    isAddingToCart.value = false
  }
}

const buyNow = async () => {
  await addToCart()
  if (!isAddingToCart.value) {
    router.push('/cart')
  }
}

// Lifecycle
onMounted(() => {
  fetchProduct()
})
</script>
