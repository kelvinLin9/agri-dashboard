<template>
  <div class="page-warm">
    <!-- Hero Section -->
    <section class="relative overflow-hidden min-h-[90vh] flex items-center">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-orange-200/30 rounded-full blur-2xl animate-pulse" style="animation-delay: 0.5s;"></div>
      </div>

      <!-- Decorative Elements -->
      <div class="absolute inset-0 opacity-20 pointer-events-none">
        <div class="absolute top-20 left-[10%] text-7xl animate-float">🌾</div>
        <div class="absolute top-40 right-[15%] text-6xl animate-float" style="animation-delay: 0.5s;">🍃</div>
        <div class="absolute bottom-32 left-[20%] text-5xl animate-float" style="animation-delay: 1s;">🌿</div>
        <div class="absolute bottom-40 right-[25%] text-6xl animate-float" style="animation-delay: 1.5s;">🌻</div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-3xl">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-amber-800 mb-8 shadow-lg shadow-amber-100/50 border border-amber-200/50">
            <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            嚴選台灣在地・新鮮直送
          </div>

          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-amber-950 leading-tight mb-6">
            日沐 SunBathe
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-harvest-600 to-earth-500 mt-2">
              溫暖您的每一餐
            </span>
          </h1>

          <p class="text-xl md:text-2xl text-amber-800/80 leading-relaxed mb-10 max-w-2xl">
            日沐嚴選最優質的在地農產，連結土地與餐桌。我們相信，好的食物不僅滋養身體，更能溫暖人心。每一口，都是陽光的味道。份食材，都承載著土地的溫度與農人的用心。
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-wrap gap-4">
            <UButton
              size="xl"
              class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-orange-200/50 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              @click="goToShop"
            >
              <UIcon name="i-heroicons-shopping-bag" class="mr-2 w-5 h-5" />
              立即選購
            </UButton>
            <UButton
              size="xl"
              variant="outline"
              class="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 px-8 py-4 text-lg font-semibold"
              @click="scrollToStory"
            >
              <UIcon name="i-heroicons-play-circle" class="mr-2 w-5 h-5" />
              了解更多
            </UButton>
          </div>

          <!-- Trust Badges -->
          <div class="flex flex-wrap gap-6 mt-12">
            <div class="flex items-center gap-2 text-amber-700">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <UIcon name="i-heroicons-truck" class="w-5 h-5 text-green-600" />
              </div>
              <span class="font-medium">免費配送</span>
            </div>
            <div class="flex items-center gap-2 text-amber-700">
              <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-amber-600" />
              </div>
              <span class="font-medium">品質保證</span>
            </div>
            <div class="flex items-center gap-2 text-amber-700">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <UIcon name="i-heroicons-heart" class="w-5 h-5 text-orange-600" />
              </div>
              <span class="font-medium">用心種植</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div class="w-8 h-12 rounded-full border-2 border-amber-400 flex items-start justify-center pt-2">
          <div class="w-1.5 h-3 bg-amber-400 rounded-full animate-scroll"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 relative">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-amber-950 mb-4">我們的承諾</h2>
          <p class="text-xl text-amber-700/80 max-w-2xl mx-auto">
            堅持品質、誠信經營，為您帶來最安心的農產品
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-amber-100/50 border border-white/50 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 hover:-translate-y-2">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-heroicons-sun" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-amber-950 mb-3">新鮮直送</h3>
            <p class="text-amber-700/80 leading-relaxed">
              產地採收後 24 小時內配送，保留食材最天然的風味與營養，讓您品嚐最新鮮的滋味。
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-amber-100/50 border border-white/50 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 hover:-translate-y-2">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-200/50 group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-amber-950 mb-3">在地小農</h3>
            <p class="text-amber-700/80 leading-relaxed">
              與超過 50 位台灣在地農友合作，支持友善耕作，每一筆消費都是對土地的溫柔守護。
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-amber-100/50 border border-white/50 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 hover:-translate-y-2">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center mb-6 shadow-lg shadow-orange-200/50 group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-heroicons-shield-check" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-amber-950 mb-3">安心認證</h3>
            <p class="text-amber-700/80 leading-relaxed">
              嚴格把關每項產品來源，提供完整的產銷履歷，讓您吃得安心、買得放心。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="py-24 bg-gradient-to-b from-amber-50/50 to-white relative overflow-hidden">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-between mb-12">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold text-amber-950 mb-4">精選商品</h2>
            <p class="text-xl text-amber-700/80">本週熱銷・新鮮上架</p>
          </div>
          <UButton
            variant="ghost"
            class="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            @click="goToShop"
          >
            查看全部
            <UIcon name="i-heroicons-arrow-right" class="ml-2" />
          </UButton>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="i in 4" :key="i" class="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
            <div class="aspect-square bg-amber-100"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-amber-100 rounded-full w-3/4"></div>
              <div class="h-3 bg-amber-100 rounded-full w-1/2"></div>
              <div class="h-10 bg-amber-100 rounded-xl mt-4"></div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(product, index) in featuredProducts"
            :key="product.id"
            class="group relative bg-white rounded-3xl overflow-hidden shadow-xl shadow-amber-100/50 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 cursor-pointer hover:-translate-y-2"
            :style="{ animationDelay: `${index * 100}ms` }"
            @click="viewProduct(product)"
          >
            <!-- Sale Badge -->
            <div v-if="product.salePrice && product.originalPrice" class="absolute top-4 left-4 z-10">
              <div class="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {{ Math.round((1 - product.salePrice / product.originalPrice) * 100) }}% OFF
              </div>
            </div>

            <!-- Product Image -->
            <div class="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
              <img
                v-if="product.mainImage"
                :src="product.mainImage"
                :alt="product.name"
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <img src="@/assets/images/product-placeholder.png" alt="商品圖片" class="w-3/4 h-3/4 object-contain opacity-80" />
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-6">
              <div v-if="product.category" class="inline-flex items-center gap-1 text-xs text-green-600 font-medium mb-2">
                <UIcon name="i-heroicons-tag" class="w-3 h-3" />
                {{ product.category?.name || '農產品' }}
              </div>

              <h3 class="font-bold text-lg text-amber-950 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                {{ product.name }}
              </h3>

              <div class="flex items-baseline gap-2 mb-4">
                <span v-if="product.salePrice" class="text-2xl font-bold text-orange-600">
                  ${{ product.salePrice.toLocaleString() }}
                </span>
                <span v-if="product.salePrice && product.originalPrice" class="text-sm text-amber-400 line-through">
                  ${{ product.originalPrice.toLocaleString() }}
                </span>
                <span v-if="!product.salePrice" class="text-2xl font-bold text-amber-950">
                  ${{ product.originalPrice?.toLocaleString() }}
                </span>
              </div>

              <UButton
                block
                class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                @click.stop="addToCart(product)"
              >
                <UIcon name="i-heroicons-shopping-cart" class="mr-2" />
                加入購物車
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section id="story" class="py-24 relative overflow-hidden">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Image Side -->
          <div class="relative">
            <div class="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-amber-200/50">
              <img
                src="@/assets/images/story-farm.png"
                alt="日沐農場故事"
                class="w-full h-full object-cover"
              />
            </div>
            <!-- Decorative -->
            <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-2xl -z-10"></div>
            <div class="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-green-300 to-emerald-400 rounded-2xl -z-10"></div>
          </div>

          <!-- Content Side -->
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-sm font-medium text-amber-700 mb-6">
              <UIcon name="i-heroicons-heart" class="w-4 h-4" />
              我們的故事
            </div>

            <h2 class="text-4xl md:text-5xl font-bold text-amber-950 mb-6 leading-tight">
              用心耕耘
              <span class="block text-orange-600">每一寸土地</span>
            </h2>

            <p class="text-lg text-amber-700/80 leading-relaxed mb-6">
              我們相信，好的食物來自於對土地的尊重與用心。從 2020 年創立至今，我們走訪台灣各地，
              與堅持友善耕作的農友們建立合作關係。
            </p>

            <p class="text-lg text-amber-700/80 leading-relaxed mb-8">
              每一項產品都經過嚴格篩選，從種植到採收、從包裝到配送，我們用心把關每個環節，
              只為讓您享用最純粹的農產品。
            </p>

            <div class="grid grid-cols-3 gap-6 mb-8">
              <div class="text-center">
                <div class="text-4xl font-bold text-orange-600 mb-1">50+</div>
                <div class="text-sm text-amber-600">合作農友</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-orange-600 mb-1">100%</div>
                <div class="text-sm text-amber-600">在地生產</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-orange-600 mb-1">24hr</div>
                <div class="text-sm text-amber-600">新鮮配送</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section (Static) -->
    <section class="py-24 bg-gradient-to-b from-white to-amber-50/50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-amber-950 mb-4">顧客好評</h2>
          <p class="text-xl text-amber-700/80">聽聽他們怎麼說</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="bg-white rounded-3xl p-8 shadow-xl shadow-amber-100/50 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-300"
          >
            <!-- Stars -->
            <div class="flex gap-1 mb-4">
              <UIcon v-for="i in 5" :key="i" name="i-heroicons-star-solid" class="w-5 h-5 text-amber-400" />
            </div>

            <p class="text-amber-800 leading-relaxed mb-6 italic">
              "{{ testimonial.content }}"
            </p>

            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                {{ testimonial.name.charAt(0) }}
              </div>
              <div>
                <div class="font-semibold text-amber-950">{{ testimonial.name }}</div>
                <div class="text-sm text-amber-600">{{ testimonial.location }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productsApi, type Product, SortOrder } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const cartStore = useCartStore()
const toast = useToast()

// Data
const featuredProducts = ref<Product[]>([])
const isLoading = ref(false)

// Static testimonials
const testimonials = [
  {
    name: '林小姐',
    location: '台北市',
    content: '蔬菜真的很新鮮！收到的時候還帶著露水，煮起來特別甜。已經是老客戶了，每週固定訂購！'
  },
  {
    name: '陳先生',
    location: '新竹縣',
    content: '芒果超級好吃，甜度剛剛好，送禮自用兩相宜。包裝也很用心，水果完全沒有碰傷。'
  },
  {
    name: '王媽媽',
    location: '台中市',
    content: '終於找到可以安心購買的農產品平台！每項產品都有產銷履歷，買得放心、吃得安心。'
  }
]

// Methods
const fetchFeaturedProducts = async () => {
  isLoading.value = true
  const response = await productsApi.getAll({
    page: 1,
    limit: 4,
    status: 'active',
    sortBy: 'createdAt',
    sortOrder: SortOrder.DESC
  })
  featuredProducts.value = response.data
  isLoading.value = false
}

const goToShop = () => {
  router.push('/shop/products')
}

const goToRegister = () => {
  router.push('/register')
}

const scrollToStory = () => {
  const storySection = document.getElementById('story')
  if (storySection) {
    storySection.scrollIntoView({ behavior: 'smooth' })
  }
}

const viewProduct = (product: Product) => {
  router.push(`/shop/products/${product.id}`)
}

const addToCart = async (product: Product) => {
  await cartStore.addItem({
    productId: product.id,
    quantity: 1
  })
  toast.success('已加入購物車', product.name)
}

// Lifecycle
onMounted(() => {
  fetchFeaturedProducts()
})
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes scroll {
  0%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.5;
    transform: translateY(8px);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-scroll {
  animation: scroll 2s ease-in-out infinite;
}
</style>
