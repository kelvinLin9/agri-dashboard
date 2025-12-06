<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Banner -->
    <div class="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
      <div class="container mx-auto px-6">
        <h1 class="text-4xl font-bold mb-2">農產品商店</h1>
        <p class="text-green-100">新鮮、健康、直送到家</p>
      </div>
    </div>

    <div class="container mx-auto px-6 py-8">
      <!-- Search and Filters -->
      <UCard class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <UInput
              v-model="search"
              icon="i-heroicons-magnifying-glass"
              placeholder="搜尋農產品..."
              size="lg"
              @input="debouncedSearch"
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
      </UCard>

      <!-- Product Grid -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <USkeleton v-for="i in 8" :key="i" class="h-80" />
      </div>

      <div v-else-if="products.length === 0" class="text-center py-16">
        <UIcon name="i-heroicons-shopping-bag" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400 text-lg">沒有找到商品</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <UCard
          v-for="product in products"
          :key="product.id"
          class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          @click="viewProduct(product)"
        >
          <!-- Product Image -->
          <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-300" />
            </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-2">
            <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {{ product.name }}
            </h3>

            <p v-if="product.shortDescription" class="text-sm text-gray-500 line-clamp-2">
              {{ product.shortDescription }}
            </p>

            <!-- Price -->
            <div class="flex items-baseline gap-2">
              <span v-if="product.salePrice" class="text-2xl font-bold text-green-600">
                ${{ product.salePrice.toLocaleString() }}
              </span>
              <span
                v-if="product.salePrice && product.originalPrice"
                class="text-sm text-gray-400 line-through"
              >
                ${{ product.originalPrice.toLocaleString() }}
              </span>
              <span v-if="!product.salePrice" class="text-2xl font-bold text-gray-900 dark:text-white">
                ${{ product.originalPrice.toLocaleString() }}
              </span>
            </div>

            <!-- Stock Status -->
            <div class="flex items-center justify-between">
              <UBadge
                v-if="product.stockQuantity > 0"
                color="success"
                variant="soft"
                size="sm"
              >
                庫存: {{ product.stockQuantity }}
              </UBadge>
              <UBadge v-else color="error" variant="soft" size="sm">
                缺貨
              </UBadge>

              <UBadge v-if="product.isNew" color="purple" variant="soft" size="sm">
                新品
              </UBadge>
            </div>

            <!-- Add to Cart Button -->
            <UButton
              block
              color="primary"
              :disabled="product.stockQuantity <= 0"
              @click.stop="addToCart(product)"
            >
              <template v-if="product.stockQuantity > 0">
                <UIcon name="i-heroicons-shopping-cart" class="mr-2" />
                加入購物車
              </template>
              <template v-else>
                缺貨中
              </template>
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Pagination -->
      <div v-if="products.length > 0" class="flex justify-center mt-8">
        <UPagination
          v-model:page="page"
          :items-per-page="limit"
          :total="total"
          @update:page="fetchProducts"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsApi, categoriesApi, type Product, type Category } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useDebounceFn } from '@vueuse/core'

const router = useRouter()
const cartStore = useCartStore()

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

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  fetchProducts()
}, 500)

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
    console.log('已加入購物車:', product.name)
  } catch (error: any) {
    console.error('加入購物車失敗:', error)
    alert('無法加入購物車，請稍後再試')
  }
}

// Lifecycle
onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>
