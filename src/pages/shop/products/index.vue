<template>
  <div class="page-warm">
    <!-- Hero Section - Modern Split Layout -->
    <section class="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/80 to-green-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <!-- Animated Background Orbs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-amber-300/40 to-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-green-200/40 to-emerald-100/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute -bottom-24 left-1/3 w-[350px] h-[350px] bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s;"></div>
      </div>

      <!-- Floating Food Emojis - Hidden on mobile for cleaner look -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div class="absolute top-[10%] left-[5%] text-4xl lg:text-5xl opacity-60 animate-float">🥬</div>
        <div class="absolute top-[20%] right-[8%] text-3xl lg:text-4xl opacity-50 animate-float" style="animation-delay: 0.3s;">🍎</div>
        <div class="absolute bottom-[25%] left-[12%] text-4xl lg:text-5xl opacity-50 animate-float" style="animation-delay: 0.8s;">🥕</div>
        <div class="absolute top-[40%] right-[15%] text-2xl lg:text-3xl opacity-40 animate-float" style="animation-delay: 1.2s;">🌽</div>
        <div class="absolute bottom-[15%] right-[5%] text-3xl lg:text-4xl opacity-60 animate-float" style="animation-delay: 0.5s;">🍊</div>
        <div class="absolute top-[60%] left-[8%] text-2xl lg:text-3xl opacity-40 animate-float" style="animation-delay: 1.5s;">🥦</div>
      </div>

      <div class="container mx-auto px-6 py-16 md:py-24 relative z-10">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Content -->
          <div class="order-2 lg:order-1">
            <!-- Animated Badge -->
            <div class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-sm font-medium text-amber-700 dark:text-amber-300 mb-6 shadow-lg shadow-amber-100/50 dark:shadow-none border border-amber-200/50 dark:border-amber-700/30">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              新鮮上架・每日精選
            </div>

            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-950 dark:text-white leading-tight mb-6">
              探索
              <span class="relative inline-block">
                <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-harvest-600 to-earth-500">新鮮好物</span>
                <span class="absolute bottom-2 left-0 w-full h-3 bg-amber-200/60 dark:bg-amber-700/40 -z-0 rounded"></span>
              </span>
            </h1>

            <p class="text-lg md:text-xl text-amber-800/80 dark:text-amber-100/80 leading-relaxed mb-8 max-w-lg">
              嚴選台灣在地優質農產，從產地直送到您家。每一份食材都經過精心挑選，讓您享受最純粹的美味。
            </p>

            <!-- Feature Pills -->
            <div class="flex flex-wrap gap-3 mb-8">
              <div class="group flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-white/50 dark:border-gray-700/50">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <UIcon name="i-heroicons-truck" class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">免費配送</span>
              </div>
              <div class="group flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-white/50 dark:border-gray-700/50">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">品質保證</span>
              </div>
              <div class="group flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-white/50 dark:border-gray-700/50">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">24hr 新鮮</span>
              </div>
            </div>

            <!-- Stats - Responsive layout -->
            <div class="flex flex-wrap gap-4 sm:gap-6 md:gap-8">
              <div class="text-center min-w-[70px]">
                <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-harvest-600 to-earth-500">{{ total }}+</div>
                <div class="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">精選商品</div>
              </div>
              <div class="text-center min-w-[70px]">
                <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-harvest-600 to-earth-500">50+</div>
                <div class="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">合作農友</div>
              </div>
              <div class="text-center min-w-[70px]">
                <div class="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-harvest-600 to-earth-500">100%</div>
                <div class="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">在地生產</div>
              </div>
            </div>
          </div>

          <!-- Right: Illustration/Visual - Hidden on small mobile, simplified on tablet -->
          <div class="order-1 lg:order-2 relative hidden sm:block">
            <div class="relative mx-auto w-full max-w-sm md:max-w-md lg:max-w-none">
              <!-- Main Visual Card -->
              <div class="relative bg-gradient-to-br from-white/80 to-amber-50/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl shadow-amber-200/30 dark:shadow-none border border-white/60 dark:border-gray-700/50">
                <!-- Decorative Corner - Hidden on mobile -->
                <div class="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl md:rounded-2xl rotate-12 opacity-80 hidden md:block"></div>
                <div class="absolute -bottom-2 -left-2 md:-bottom-3 md:-left-3 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg md:rounded-xl -rotate-12 opacity-80 hidden md:block"></div>

                <!-- Content -->
                <div class="relative z-10">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-harvest-500 to-earth-600 flex items-center justify-center text-white shadow-lg">
                      <UIcon name="i-heroicons-shopping-bag" class="w-7 h-7" />
                    </div>
                    <div>
                      <h3 class="font-bold text-lg text-gray-900 dark:text-white">日沐優選</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">SunBathe Collection</p>
                    </div>
                  </div>

                  <!-- Product Preview Cards -->
                  <div class="space-y-3">
                    <div class="flex items-center gap-3 p-3 bg-white/70 dark:bg-gray-700/50 rounded-xl">
                      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center text-2xl">🍅</div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 dark:text-white text-sm">有機番茄</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">新鮮直送</div>
                      </div>
                      <div class="text-orange-600 dark:text-orange-400 font-bold">$120</div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-white/70 dark:bg-gray-700/50 rounded-xl">
                      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center text-2xl">🥬</div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 dark:text-white text-sm">高麗菜</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">當季蔬菜</div>
                      </div>
                      <div class="text-orange-600 dark:text-orange-400 font-bold">$85</div>
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-white/70 dark:bg-gray-700/50 rounded-xl">
                      <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 flex items-center justify-center text-2xl">🍋</div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 dark:text-white text-sm">黃金檸檬</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">產地直送</div>
                      </div>
                      <div class="text-orange-600 dark:text-orange-400 font-bold">$150</div>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-600/50 text-center">
                    <span class="text-sm text-gray-500 dark:text-gray-400">向下捲動探索更多 ↓</span>
                  </div>
                </div>
              </div>

              <!-- Floating Badge -->
              <div class="absolute -bottom-6 -right-6 lg:bottom-8 lg:-right-12 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-5 py-3 rounded-2xl shadow-xl shadow-orange-300/40 dark:shadow-none transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-fire" class="w-5 h-5" />
                  <span class="font-bold">熱銷中</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-6 py-10">
      <!-- Search and Filters with glassmorphism -->
      <div class="relative mb-10 -mt-8">
        <div class="card-glass p-6">
          <!-- Row 1: Search + Category + Sort -->
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

          <!-- Row 2: Price Range + Tags -->
          <div class="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Price Range -->
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">價格區間:</span>
                <div class="flex items-center gap-2">
                  <UInput
                    v-model.number="minPrice"
                    type="number"
                    placeholder="最低"
                    size="sm"
                    class="w-24"
                    :min="0"
                    @blur="handleFilterChange"
                    @keyup.enter="handleFilterChange"
                  />
                  <span class="text-gray-400">-</span>
                  <UInput
                    v-model.number="maxPrice"
                    type="number"
                    placeholder="最高"
                    size="sm"
                    class="w-24"
                    :min="0"
                    @blur="handleFilterChange"
                    @keyup.enter="handleFilterChange"
                  />
                </div>
              </div>

              <!-- Divider -->
              <div class="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

              <!-- Tag Filters -->
              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  :color="filterIsNew ? 'primary' : 'neutral'"
                  :variant="filterIsNew ? 'solid' : 'outline'"
                  size="sm"
                  @click="toggleFilter('isNew')"
                >
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4 mr-1" />
                  新品
                </UButton>
                <UButton
                  :color="filterIsFeatured ? 'primary' : 'neutral'"
                  :variant="filterIsFeatured ? 'solid' : 'outline'"
                  size="sm"
                  @click="toggleFilter('isFeatured')"
                >
                  <UIcon name="i-heroicons-star" class="w-4 h-4 mr-1" />
                  精選
                </UButton>
                <UButton
                  :color="filterOnSale ? 'primary' : 'neutral'"
                  :variant="filterOnSale ? 'solid' : 'outline'"
                  size="sm"
                  @click="toggleFilter('onSale')"
                >
                  <UIcon name="i-heroicons-fire" class="w-4 h-4 mr-1" />
                  特價
                </UButton>
              </div>

              <!-- Clear Filters -->
              <UButton
                v-if="hasActiveFilters"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="clearFilters"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-1" />
                清除篩選
              </UButton>
            </div>
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
          <div v-if="product.isNew" class="absolute top-4 right-14 z-20">
            <div class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              新品
            </div>
          </div>

          <!-- Wishlist Heart Button -->
          <button
            class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
            :class="wishlist.isInWishlist(product.id)
              ? 'bg-red-500 text-white shadow-lg scale-110'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm'"
            @click.stop="handleToggleWishlist(product.id)"
          >
            <UIcon
              :name="wishlist.isInWishlist(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
              class="w-5 h-5"
            />
          </button>

          <!-- Product Image -->
          <div class="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
            <img
              v-if="product.mainImage"
              :src="product.mainImage"
              :alt="product.name"
              loading="lazy"
              decoding="async"
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
        <div class="card-glass p-4">
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
import { trackAddToCart, trackSearch } from '@/utils/analytics'
import { useWishlist } from '@/composables/useWishlist'

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()
const wishlist = useWishlist()

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
const minPrice = ref<number | undefined>(undefined)
const maxPrice = ref<number | undefined>(undefined)
const filterIsNew = ref(false)
const filterIsFeatured = ref(false)
const filterOnSale = ref(false)

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
    if (minPrice.value !== undefined && minPrice.value > 0) params.minPrice = minPrice.value
    if (maxPrice.value !== undefined && maxPrice.value > 0) params.maxPrice = maxPrice.value
    if (filterIsNew.value) params.isNew = true
    if (filterIsFeatured.value) params.isFeatured = true

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
    let filteredProducts = response.data

    // 特價篩選（前端過濾：有 salePrice 且小於 originalPrice）
    if (filterOnSale.value) {
      filteredProducts = filteredProducts.filter(
        (p: Product) => p.salePrice && p.originalPrice && p.salePrice < p.originalPrice
      )
    }

    products.value = filteredProducts
    total.value = filterOnSale.value ? filteredProducts.length : response.meta.total
  } catch (error: any) {
    console.error('獲取商品失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  // GA4: 追蹤搜尋
  if (search.value.trim()) {
    trackSearch(search.value.trim())
  }
  fetchProducts()
}

const handleFilterChange = () => {
  page.value = 1
  fetchProducts()
}

const toggleFilter = (filter: 'isNew' | 'isFeatured' | 'onSale') => {
  if (filter === 'isNew') {
    filterIsNew.value = !filterIsNew.value
  } else if (filter === 'isFeatured') {
    filterIsFeatured.value = !filterIsFeatured.value
  } else if (filter === 'onSale') {
    filterOnSale.value = !filterOnSale.value
  }
  handleFilterChange()
}

const hasActiveFilters = computed(() => {
  return filterCategory.value !== undefined ||
    (minPrice.value !== undefined && minPrice.value > 0) ||
    (maxPrice.value !== undefined && maxPrice.value > 0) ||
    filterIsNew.value ||
    filterIsFeatured.value ||
    filterOnSale.value
})

const clearFilters = () => {
  filterCategory.value = undefined
  minPrice.value = undefined
  maxPrice.value = undefined
  filterIsNew.value = false
  filterIsFeatured.value = false
  filterOnSale.value = false
  handleFilterChange()
}

const handleToggleWishlist = async (productId: number | string) => {
  try {
    const isNowInWishlist = await wishlist.toggleWishlist(productId)
    toast.success(
      isNowInWishlist ? '已加入收藏' : '已取消收藏',
      isNowInWishlist ? '可在收藏頁面查看' : ''
    )
  } catch (error) {
    console.error('收藏操作失敗:', error)
    toast.error('操作失敗', '請稍後再試')
  }
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
    // GA4: 追蹤加入購物車
    trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.category?.name,
      price: product.salePrice || product.originalPrice,
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

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(3deg);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
