<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-green-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    <!-- Hero Banner with animated background -->
    <div class="relative overflow-hidden bg-gradient-to-r from-harvest-600 via-earth-500 to-harvest-500 text-white py-16 md:py-20">
      <!-- Animated background elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-400/15 rounded-full blur-2xl animate-pulse" style="animation-delay: 0.5s;"></div>
      </div>
      
      <!-- Decorative leaf patterns -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 text-6xl">🌿</div>
        <div class="absolute bottom-10 right-20 text-5xl">🍃</div>
        <div class="absolute top-20 right-1/3 text-4xl">🌱</div>
      </div>
      
      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span class="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></span>
            新鮮直送・每日精選
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            農產品商店
          </h1>
          <p class="text-lg md:text-xl text-amber-100 leading-relaxed max-w-lg">
            嚴選台灣在地優質農產，從產地直送到您家，享受最新鮮的美味
          </p>
          
          <!-- Stats badges -->
          <div class="flex flex-wrap gap-4 mt-8">
            <div class="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
              <UIcon name="i-heroicons-truck" class="w-5 h-5" />
              <span class="text-sm font-medium">免費配送</span>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
              <UIcon name="i-heroicons-shield-check" class="w-5 h-5" />
              <span class="text-sm font-medium">品質保證</span>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
              <UIcon name="i-heroicons-clock" class="w-5 h-5" />
              <span class="text-sm font-medium">24小時新鮮</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-10">
      <!-- Search and Filters with glassmorphism -->
      <div class="relative mb-10 -mt-8">
        <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-amber-500/5 border border-white/50 dark:border-gray-700/50 p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
            <!-- Search -->
            <div class="md:col-span-2">
              <SearchBox
                v-model="search"
                placeholder="搜尋農產品..."
                size="lg"
                @search="handleSearch"
              />
            </div>

            <!-- Category Filter -->
            <USelectMenu
              v-model="selectedCategory"
              :items="categoryOptions"
              placeholder="選擇分類"
              size="lg"
              @change="handleFilterChange"
            />

            <!-- Sort -->
            <USelectMenu
              v-model="selectedSort"
              :items="sortOptions"
              placeholder="排序方式"
              size="lg"
              @change="handleFilterChange"
            />
          </div>
        </div>
      </div>

      <!-- Product Grid Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        <div v-for="i in 8" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
          <div class="aspect-square bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-5 space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="products.length === 0"
        icon="i-heroicons-shopping-bag"
        title="沒有找到商品"
        description="試試其他的搜尋條件吧！"
        icon-size="lg"
      />

      <!-- Product Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        <div
          v-for="(product, index) in products"
          :key="product.id"
          class="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
          :style="{ animationDelay: `${index * 50}ms` }"
          @click="viewProduct(product)"
        >
          <!-- Sale Badge -->
          <div v-if="product.salePrice && product.originalPrice" class="absolute top-4 left-4 z-20">
            <div class="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {{ Math.round((1 - product.salePrice / product.originalPrice) * 100) }}% OFF
            </div>
          </div>
          
          <!-- New Badge -->
          <div v-if="product.isNew" class="absolute top-4 right-4 z-20">
            <div class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              新品
            </div>
          </div>

          <!-- Product Image -->
          <div class="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
            <img
              v-if="product.mainImage"
              :src="product.mainImage"
              :alt="product.name"
              class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-20 h-20 text-gray-300 dark:text-gray-600" />
            </div>
            
            <!-- Hover overlay with quick add button -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <UButton
                v-if="product.stockQuantity > 0"
                color="white"
                variant="solid"
                size="lg"
                class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl"
                @click.stop="addToCart(product)"
              >
                <UIcon name="i-heroicons-shopping-cart" class="mr-2" />
                快速加入
              </UButton>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-5 space-y-3">
            <!-- Category tag -->
            <div v-if="product.category" class="inline-flex items-center gap-1 text-xs text-harvest-600 dark:text-harvest-400 font-medium">
              <UIcon name="i-heroicons-tag" class="w-3 h-3" />
              {{ product.category?.name || '農產品' }}
            </div>
            
            <h3 class="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-harvest-600 dark:group-hover:text-harvest-400 transition-colors">
              {{ product.name }}
            </h3>

            <p v-if="product.shortDescription" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {{ product.shortDescription }}
            </p>

            <!-- Price -->
            <div class="flex items-baseline gap-2 pt-2">
              <span v-if="product.salePrice" class="text-2xl font-bold bg-gradient-to-r from-harvest-600 to-earth-500 bg-clip-text text-transparent">
                ${{ product.salePrice.toLocaleString() }}
              </span>
              <span
                v-if="product.salePrice && product.originalPrice"
                class="text-sm text-gray-400 line-through"
              >
                ${{ product.originalPrice.toLocaleString() }}
              </span>
              <span v-if="!product.salePrice" class="text-2xl font-bold text-gray-900 dark:text-white">
                ${{ product.originalPrice?.toLocaleString() }}
              </span>
            </div>

            <!-- Stock Status -->
            <div class="flex items-center justify-between pt-2">
              <div class="flex items-center gap-2">
                <span v-if="product.stockQuantity > 10" class="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                  庫存充足
                </span>
                <span v-else-if="product.stockQuantity > 0" class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  僅剩 {{ product.stockQuantity }} 件
                </span>
                <span v-else class="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                  已售完
                </span>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <UButton
              block
              :color="product.stockQuantity > 0 ? 'primary' : 'neutral'"
              :variant="product.stockQuantity > 0 ? 'solid' : 'outline'"
              :disabled="product.stockQuantity <= 0"
              class="mt-3 group/btn transition-all duration-300"
              @click.stop="addToCart(product)"
            >
              <template v-if="product.stockQuantity > 0">
                <UIcon name="i-heroicons-shopping-cart" class="mr-2 group-hover/btn:animate-bounce" />
                加入購物車
              </template>
              <template v-else>
                <UIcon name="i-heroicons-x-circle" class="mr-2" />
                暫時缺貨
              </template>
            </UButton>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="products.length > 0" class="flex justify-center mt-12">
        <div class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-amber-500/5 border border-white/50 dark:border-gray-700/50 p-4">
          <UPagination
            v-model:page="page"
            :items-per-page="limit"
            :total="total"
            @update:page="fetchProducts"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsApi, categoriesApi, type Product, type Category } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import EmptyState from '@/components/common/EmptyState.vue'
import SearchBox from '@/components/common/SearchBox.vue'

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()

// Data
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(false)

// Pagination
const page = ref(1)
const limit = ref(12)
const total = ref(0)

// Filters (internal simple values)
const search = ref('')
const filterCategory = ref<string | undefined>(undefined)
const filterSort = ref<string | undefined>('newest')

// Convert to SelectMenu options
const selectedCategory = computed({
  get: () => categoryOptions.value.find(opt => opt.value === filterCategory.value),
  set: (val) => { filterCategory.value = val?.value ?? undefined }
})

const selectedSort = computed({
  get: () => sortOptions.find(opt => opt.value === filterSort.value),
  set: (val) => { filterSort.value = val?.value ?? undefined }
})

// Options
const categoryOptions = computed(() => {
  return [
    { label: '全部分類', value: undefined },
    ...categories.value.map(cat => ({
      label: cat.name,
      value: cat.id.toString()
    }))
  ]
})

const sortOptions = [
  { label: '最新上架', value: 'newest' },
  { label: '價格由低到高', value: 'price_asc' },
  { label: '價格由高到低', value: 'price_desc' },
  { label: '最熱門', value: 'popular' },
]

// Methods
const fetchCategories = async () => {
  try {
    const response = await categoriesApi.getAll()
    categories.value = Array.isArray(response) ? response : (response.data || [])
  } catch (error) {
    console.error('獲取分類失敗:', error)
  }
}

const fetchProducts = async () => {
  isLoading.value = true
  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
      status: 'active', // Only show active products
    }

    if (search.value) params.search = search.value
    if (filterCategory.value) params.categoryId = filterCategory.value

    // Sort
    if (filterSort.value === 'newest') {
      params.sortBy = 'createdAt'
      params.sortOrder = 'DESC'
    } else if (filterSort.value === 'price_asc') {
      params.sortBy = 'originalPrice'
      params.sortOrder = 'ASC'
    } else if (filterSort.value === 'price_desc') {
      params.sortBy = 'originalPrice'
      params.sortOrder = 'DESC'
    }

    const response = await productsApi.getAll(params)
    products.value = response.data
    total.value = response.meta.total
  } catch (error: any) {
    console.error('獲取商品失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchProducts()
}

const handleFilterChange = () => {
  page.value = 1
  fetchProducts()
}

const viewProduct = (product: Product) => {
  router.push(`/shop/products/${product.id}`)
}

const addToCart = async (product: Product) => {
  try {
    await cartStore.addItem({
      productId: product.id,
      quantity: 1
    })
    toast.success('已加入購物車', product.name)
  } catch (error: any) {
    console.error('加入購物車失敗:', error)
    toast.error('加入失敗', '無法加入購物車，請稍後再試')
  }
}

// Lifecycle
onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>
