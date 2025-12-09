<template>
  <div class="page-warm">
    <div class="container mx-auto px-6 py-8">
      <!-- Back Button -->
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        class="mb-6 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
        @click="router.back()"
      >
        返回商品列表
      </UButton>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div class="space-y-4">
          <div class="aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl animate-pulse">
            <div class="w-full h-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div class="grid grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i" class="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4 animate-pulse"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 animate-pulse"></div>
          <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Product Detail -->
      <div v-else-if="product" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Product Image Gallery -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div class="relative aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl group">
            <!-- Sale Badge -->
            <div v-if="product.salePrice && product.originalPrice" class="absolute top-6 left-6 z-10">
              <div class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <UIcon name="i-heroicons-fire" class="w-4 h-4" />
                {{ Math.round((1 - product.salePrice / product.originalPrice) * 100) }}% OFF
              </div>
            </div>

            <img
              v-if="selectedImage || product.mainImage"
              :src="selectedImage || product.mainImage"
              :alt="product.name"
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
              <UIcon name="i-heroicons-photo" class="w-32 h-32 text-gray-300 dark:text-gray-600" />
            </div>
          </div>

          <!-- Gallery Thumbnails -->
          <div v-if="allImages.length > 1" class="grid grid-cols-4 gap-3">
            <div
              v-for="(image, index) in allImages"
              :key="index"
              class="aspect-square bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer ring-2 transition-all duration-300"
              :class="[
                selectedImage === image
                  ? 'ring-harvest-500 shadow-lg shadow-harvest-500/20'
                  : 'ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
              ]"
              @click="selectedImage = image"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Category and Badges -->
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-if="product.category"
              color="gray"
              variant="soft"
              size="lg"
              class="px-4 py-1.5"
            >
              <UIcon name="i-heroicons-tag" class="w-3.5 h-3.5 mr-1.5" />
              {{ product.category.name }}
            </UBadge>
            <UBadge v-if="product.isNew" color="purple" variant="soft" size="lg" class="px-4 py-1.5">
              <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
              新品上架
            </UBadge>
            <UBadge v-if="product.isFeatured" color="yellow" variant="soft" size="lg" class="px-4 py-1.5">
              <UIcon name="i-heroicons-star" class="w-3.5 h-3.5 mr-1.5" />
              精選推薦
            </UBadge>
          </div>

          <!-- Title -->
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              {{ product.name }}
            </h1>
            <p v-if="product.shortDescription" class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ product.shortDescription }}
            </p>
          </div>

          <!-- Price Card -->
          <div class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div class="flex items-baseline gap-4">
              <span v-if="product.salePrice" class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-harvest-600 to-earth-500 bg-clip-text text-transparent">
                ${{ product.salePrice.toLocaleString() }}
              </span>
              <span
                v-if="product.salePrice && product.originalPrice"
                class="text-xl text-gray-400 line-through"
              >
                ${{ product.originalPrice.toLocaleString() }}
              </span>
              <span v-if="!product.salePrice" class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                ${{ product.originalPrice?.toLocaleString() }}
              </span>
            </div>
            <div v-if="product.salePrice" class="flex items-center gap-2 mt-3">
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-nature-100 dark:bg-nature-900/30 text-nature-700 dark:text-nature-400 rounded-full text-sm font-medium">
                <UIcon name="i-heroicons-gift" class="w-4 h-4" />
                現省 ${{ (product.originalPrice - product.salePrice).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Stock Status -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">庫存狀態</span>
              <div>
                <span v-if="product.stockQuantity > 10" class="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <span class="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                  庫存充足 ({{ product.stockQuantity }} 件)
                </span>
                <span v-else-if="product.stockQuantity > 0" class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                  <span class="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                  庫存不多 (僅剩 {{ product.stockQuantity }} 件)
                </span>
                <span v-else class="flex items-center gap-2 text-red-500 font-medium">
                  <span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  目前缺貨
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <UIcon name="i-heroicons-qr-code" class="w-4 h-4" />
              <span>商品編號: <span class="font-mono">{{ product.sku }}</span></span>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="space-y-3">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              購買數量
            </label>
            <div class="flex items-center gap-4">
              <div class="flex items-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm">
                <UButton
                  icon="i-heroicons-minus"
                  color="neutral"
                  variant="ghost"
                  size="lg"
                  :disabled="quantity <= 1"
                  class="rounded-none"
                  @click="quantity--"
                />
                <span class="px-8 py-3 min-w-[80px] text-center font-bold text-lg bg-gray-50 dark:bg-gray-700">
                  {{ quantity }}
                </span>
                <UButton
                  icon="i-heroicons-plus"
                  color="neutral"
                  variant="ghost"
                  size="lg"
                  :disabled="quantity >= product.stockQuantity"
                  class="rounded-none"
                  @click="quantity++"
                />
              </div>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                最多可購買 {{ product.stockQuantity }} 件
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-2">
            <UButton
              size="xl"
              class="flex-1 py-4 text-lg font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300"
              :disabled="product.stockQuantity <= 0 || isAddingToCart"
              :loading="isAddingToCart"
              @click="void addToCart()"
            >
              <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5 mr-2" />
              {{ product.stockQuantity > 0 ? '加入購物車' : '目前缺貨' }}
            </UButton>
            <UButton
              size="xl"
              color="primary"
              class="flex-1 py-4 text-lg font-semibold shadow-lg shadow-earth-500/25 hover:shadow-xl hover:shadow-earth-500/30 transition-all duration-300"
              :disabled="product.stockQuantity <= 0 || isAddingToCart"
              @click="buyNow"
            >
              <UIcon name="i-heroicons-bolt" class="w-5 h-5 mr-2" />
              立即購買
            </UButton>
          </div>

          <!-- Product Details -->
          <div v-if="product.origin || product.shelfLife" class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-harvest-500" />
              商品資訊
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div v-if="product.origin" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div class="w-10 h-10 bg-harvest-100 dark:bg-harvest-900/30 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-harvest-600 dark:text-harvest-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">產地來源</p>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ product.origin }}</p>
                </div>
              </div>
              <div v-if="product.shelfLife" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-clock" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">保存期限</p>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ product.shelfLife }} 天</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Description -->
      <div v-if="product && product.description" class="mt-12">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-harvest-600 to-earth-500 px-8 py-5">
            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
              商品詳情
            </h2>
          </div>
          <div class="p-8">
            <div class="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-img:rounded-xl" v-html="product.description"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="!isLoading && !product" class="text-center py-20">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 max-w-md mx-auto">
          <div class="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">找不到此商品</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">該商品可能已下架或不存在</p>
          <UButton size="lg" @click="router.push('/shop/products')">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
            返回商品列表
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const selectedImage = ref<string | null>(null)

// Computed
const allImages = computed(() => {
  if (!product.value) return []
  const images: string[] = []
  if (product.value.mainImage) images.push(product.value.mainImage)
  if (product.value.images && product.value.images.length > 0) {
    images.push(...product.value.images)
  }
  return images
})

// Methods
const fetchProduct = async () => {
  isLoading.value = true
  try {
    const productId = route.params.id as string
    product.value = await productsApi.getById(productId)
    if (product.value?.mainImage) {
      selectedImage.value = product.value.mainImage
    }
  } catch (error: unknown) {
    console.error('獲取商品失敗:', error)
    toast.error('載入失敗', '無法載入商品資訊')
  } finally {
    isLoading.value = false
  }
}

const addToCart = async (): Promise<boolean> => {
  if (!product.value) return false

  isAddingToCart.value = true
  try {
    await cartStore.addItem({
      productId: product.value.id,
      quantity: quantity.value
    })
    toast.success('已加入購物車', `${product.value.name} x ${quantity.value}`)
    quantity.value = 1
    return true
  } catch (error: unknown) {
    console.error('加入購物車失敗:', error)
    toast.error('加入失敗', '無法加入購物車，請稍後再試')
    return false
  } finally {
    isAddingToCart.value = false
  }
}

const buyNow = async () => {
  const success = await addToCart()
  if (success) {
    router.push('/cart')
  }
}

// Lifecycle
onMounted(() => {
  fetchProduct()
})
</script>
