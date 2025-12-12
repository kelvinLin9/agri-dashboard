<template>
  <div class="jp-landing">
    <!-- Hero Section with Japanese Illustration -->
    <section class="hero-section">
      <!-- Floating Decorative Elements -->
      <div class="floating-elements">
        <div class="petal petal-1"></div>
        <div class="petal petal-2"></div>
        <div class="petal petal-3"></div>
        <div class="petal petal-4"></div>
        <div class="petal petal-5"></div>
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
      </div>

      <!-- Hero Background Image -->
      <div class="hero-bg">
        <img
          src="@/assets/images/jp-style/hero-landscape.png"
          alt="日式田園風景"
          class="hero-image"
        />
        <div class="hero-overlay"></div>
      </div>

      <!-- Hero Content -->
      <div class="hero-content">
        <div class="container">
          <!-- Japanese Badge -->
          <div class="jp-badge">
            <span class="badge-dot"></span>
            <span class="badge-text">嚴選台灣・産地直送</span>
          </div>

          <!-- Main Title with Brush Style -->
          <h1 class="hero-title">
            <span class="title-kanji">日沐</span>
            <span class="title-english">SunBathe</span>
          </h1>

          <p class="hero-subtitle">
            <span class="brush-line"></span>
            溫暖您的每一餐
          </p>

          <p class="hero-description">
            日沐嚴選最優質的在地農產，連結土地與餐桌。<br>
            我們相信，好的食物不僅滋養身體，更能溫暖人心。<br>
            每一口，都是陽光的味道。
          </p>

          <!-- CTA Buttons -->
          <div class="hero-actions">
            <button class="btn-primary" @click="goToShop">
              <span class="btn-icon">🛒</span>
              立即選購
            </button>
            <button class="btn-secondary" @click="scrollToStory">
              <span class="btn-icon">📖</span>
              了解更多
            </button>
          </div>

          <!-- Trust Indicators -->
          <div class="trust-badges">
            <div class="trust-item">
              <div class="trust-icon">🚚</div>
              <span>免費配送</span>
            </div>
            <div class="trust-item">
              <div class="trust-icon">✅</div>
              <span>品質保證</span>
            </div>
            <div class="trust-item">
              <div class="trust-icon">🌱</div>
              <span>用心種植</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span class="scroll-text">往下滑動</span>
      </div>
    </section>

    <!-- Features Section with Wave Pattern -->
    <section class="features-section">
      <div class="wave-pattern-bg"></div>
      <div class="container">
        <div class="section-header">
          <span class="section-tag">私たちの約束</span>
          <h2 class="section-title">我們的承諾</h2>
          <p class="section-subtitle">堅持品質、誠信經營，為您帶來最安心的農產品</p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon" :style="{ backgroundColor: feature.color }">
              {{ feature.emoji }}
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
            <div class="feature-line"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="products-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">おすすめ商品</span>
          <h2 class="section-title">精選商品</h2>
          <p class="section-subtitle">本週熱銷・新鮮上架</p>
        </div>

        <!-- Produce Illustration -->
        <div class="produce-showcase">
          <img
            src="@/assets/images/jp-style/produce-illustration.png"
            alt="新鮮農產品"
            class="produce-image"
          />
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="products-grid">
          <div v-for="i in 4" :key="i" class="product-card skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="product-card"
            @click="viewProduct(product)"
          >
            <!-- Sale Badge -->
            <div v-if="product.salePrice && product.originalPrice" class="sale-badge">
              {{ Math.round((1 - product.salePrice / product.originalPrice) * 100) }}% OFF
            </div>

            <!-- Product Image -->
            <div class="product-image-wrapper">
              <img
                v-if="product.mainImage"
                :src="product.mainImage"
                :alt="product.name"
                class="product-image"
              />
              <div v-else class="product-placeholder">
                <span>🌿</span>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <span v-if="product.category" class="product-category">
                {{ product.category?.name || '農產品' }}
              </span>
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-pricing">
                <span v-if="product.salePrice" class="sale-price">
                  ${{ product.salePrice.toLocaleString() }}
                </span>
                <span v-if="product.salePrice && product.originalPrice" class="original-price">
                  ${{ product.originalPrice.toLocaleString() }}
                </span>
                <span v-if="!product.salePrice" class="regular-price">
                  ${{ product.originalPrice?.toLocaleString() }}
                </span>
              </div>
              <button class="add-to-cart-btn" @click.stop="addToCart(product)">
                加入購物車
              </button>
            </div>
          </div>
        </div>

        <div class="view-all-wrapper">
          <button class="btn-view-all" @click="goToShop">
            查看全部商品
            <span class="arrow">→</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Story Section -->
    <section id="story" class="story-section">
      <div class="container">
        <div class="story-grid">
          <!-- Image Side -->
          <div class="story-image-wrapper">
            <div class="image-frame">
              <img
                src="@/assets/images/jp-style/farmer-illustration.png"
                alt="農人故事"
                class="story-image"
              />
            </div>
            <div class="decorative-stamp">
              <span>産地直送</span>
            </div>
          </div>

          <!-- Content Side -->
          <div class="story-content">
            <span class="section-tag">私たちの物語</span>
            <h2 class="story-title">
              用心耕耘<br>
              <span class="highlight">每一寸土地</span>
            </h2>

            <p class="story-text">
              我們相信，好的食物來自於對土地的尊重與用心。從 2020 年創立至今，
              我們走訪台灣各地，與堅持友善耕作的農友們建立合作關係。
            </p>

            <p class="story-text">
              每一項產品都經過嚴格篩選，從種植到採收、從包裝到配送，
              我們用心把關每個環節，只為讓您享用最純粹的農產品。
            </p>

            <!-- Stats -->
            <div class="story-stats">
              <div class="stat-item">
                <span class="stat-number">50+</span>
                <span class="stat-label">合作農友</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">100%</span>
                <span class="stat-label">在地生產</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">24hr</span>
                <span class="stat-label">新鮮配送</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">お客様の声</span>
          <h2 class="section-title">顧客好評</h2>
          <p class="section-subtitle">聽聽他們怎麼說</p>
        </div>

        <div class="testimonials-grid">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="testimonial-card"
          >
            <div class="testimonial-stars">
              <span v-for="i in 5" :key="i">⭐</span>
            </div>
            <p class="testimonial-content">"{{ testimonial.content }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ testimonial.name.charAt(0) }}</div>
              <div class="author-info">
                <span class="author-name">{{ testimonial.name }}</span>
                <span class="author-location">{{ testimonial.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-bg-pattern"></div>
      <div class="container">
        <h2 class="cta-title">開始您的新鮮之旅</h2>
        <p class="cta-subtitle">
          立即加入會員，享受專屬優惠與第一手農產資訊。<br>
          讓新鮮美味，成為您日常的一部分。
        </p>
        <div class="cta-actions">
          <button class="btn-cta-primary" @click="goToRegister">
            免費加入會員
          </button>
          <button class="btn-cta-secondary" @click="goToShop">
            立即選購
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="jp-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <div class="brand-logo">
              <span class="logo-kanji">日</span>
              <span class="logo-text">日沐 SunBathe</span>
            </div>
            <p class="brand-desc">
              從產地到餐桌，傳遞土地的溫度與陽光的味道。
            </p>
          </div>

          <!-- Quick Links -->
          <div class="footer-links">
            <h4 class="footer-title">快速連結</h4>
            <ul>
              <li><a href="#" @click.prevent="goToShop">商品專區</a></li>
              <li><a href="#story">關於我們</a></li>
              <li><a href="#">常見問題</a></li>
              <li><a href="#">配送說明</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="footer-contact">
            <h4 class="footer-title">聯絡我們</h4>
            <ul>
              <li>📞 02-1234-5678</li>
              <li>🕐 週一至週五 9:00-18:00</li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2025 日沐 SunBathe. All rights reserved.</p>
        </div>
      </div>
    </footer>
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

// Features data
const features = [
  {
    emoji: '☀️',
    title: '新鮮直送',
    description: '產地採收後 24 小時內配送，保留食材最天然的風味與營養，讓您品嚐最新鮮的滋味。',
    color: '#fef3c7'
  },
  {
    emoji: '🌾',
    title: '在地小農',
    description: '與超過 50 位台灣在地農友合作，支持友善耕作，每一筆消費都是對土地的溫柔守護。',
    color: '#d1fae5'
  },
  {
    emoji: '✨',
    title: '安心認證',
    description: '嚴格把關每項產品來源，提供完整的產銷履歷，讓您吃得安心、買得放心。',
    color: '#fce7f3'
  }
]

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
/* ==========================================
   Japanese Illustration Style Landing Page
   ========================================== */

/* CSS Variables */
.jp-landing {
  --color-cream: #faf7f0;
  --color-paper: #f5f0e6;
  --color-ink: #2d2d2d;
  --color-ink-light: #5c5c5c;
  --color-vermillion: #e63946;
  --color-indigo: #4a5568;
  --color-gold: #d4a574;
  --color-matcha: #7c9473;
  --color-sakura: #ffb7c5;
  --color-sumi: #1a1a2e;

  font-family: 'Noto Sans TC', 'Hiragino Kaku Gothic Pro', sans-serif;
  background-color: var(--color-cream);
  color: var(--color-ink);
  overflow-x: hidden;
}

/* ==========================================
   Hero Section
   ========================================== */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(250, 247, 240, 0.85) 0%,
    rgba(250, 247, 240, 0.6) 50%,
    rgba(250, 247, 240, 0.3) 100%
  );
}

/* Floating Elements */
.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.petal {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--color-sakura);
  border-radius: 50% 0 50% 50%;
  opacity: 0.6;
  animation: fall 10s infinite linear;
}

.petal-1 { left: 10%; animation-delay: 0s; }
.petal-2 { left: 30%; animation-delay: 2s; }
.petal-3 { left: 50%; animation-delay: 4s; }
.petal-4 { left: 70%; animation-delay: 6s; }
.petal-5 { left: 90%; animation-delay: 8s; }

@keyframes fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.cloud {
  position: absolute;
  width: 200px;
  height: 60px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 100px;
  animation: float 20s infinite ease-in-out;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
}

.cloud::before {
  width: 80px;
  height: 80px;
  top: -40px;
  left: 30px;
}

.cloud::after {
  width: 60px;
  height: 60px;
  top: -30px;
  right: 40px;
}

.cloud-1 { top: 15%; left: -200px; }
.cloud-2 { top: 25%; right: -200px; animation-delay: 10s; animation-direction: reverse; }

@keyframes float {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(calc(100vw + 400px));
  }
}

/* Hero Content */
.hero-content {
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.jp-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-gold);
  border-radius: 100px;
  margin-bottom: 2rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--color-matcha);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.badge-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-ink-light);
  letter-spacing: 0.1em;
}

.hero-title {
  margin-bottom: 1.5rem;
}

.title-kanji {
  display: block;
  font-size: clamp(4rem, 12vw, 8rem);
  font-weight: 900;
  color: var(--color-sumi);
  line-height: 1;
  letter-spacing: 0.1em;
  text-shadow: 2px 2px 0 var(--color-gold);
}

.title-english {
  display: block;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 300;
  color: var(--color-ink-light);
  letter-spacing: 0.3em;
  margin-top: 0.5rem;
}

.hero-subtitle {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 600;
  color: var(--color-vermillion);
  margin-bottom: 1.5rem;
}

.brush-line {
  display: block;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-vermillion), transparent);
}

.hero-description {
  font-size: 1.125rem;
  line-height: 2;
  color: var(--color-ink-light);
  margin-bottom: 2.5rem;
  max-width: 600px;
}

/* Buttons */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-vermillion), #ff6b6b);
  color: white;
  box-shadow: 0 4px 20px rgba(230, 57, 70, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(230, 57, 70, 0.4);
}

.btn-secondary {
  background: white;
  color: var(--color-ink);
  border: 2px solid var(--color-gold);
}

.btn-secondary:hover {
  background: var(--color-paper);
  border-color: var(--color-vermillion);
}

.btn-icon {
  font-size: 1.25rem;
}

/* Trust Badges */
.trust-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-ink-light);
}

.trust-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  font-size: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
}

.scroll-mouse {
  width: 28px;
  height: 44px;
  border: 2px solid var(--color-gold);
  border-radius: 14px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.scroll-wheel {
  width: 4px;
  height: 10px;
  background: var(--color-gold);
  border-radius: 2px;
  animation: scroll-anim 2s infinite;
}

@keyframes scroll-anim {
  0%, 100% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0.3; transform: translateY(8px); }
}

.scroll-text {
  font-size: 0.75rem;
  color: var(--color-ink-light);
  letter-spacing: 0.1em;
}

/* ==========================================
   Features Section
   ========================================== */
.features-section {
  position: relative;
  padding: 6rem 0;
  background: var(--color-paper);
}

.wave-pattern-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: url('@/assets/images/jp-style/wave-pattern.png') repeat-x;
  background-size: auto 100%;
  opacity: 0.15;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-tag {
  display: inline-block;
  font-size: 0.875rem;
  color: var(--color-matcha);
  letter-spacing: 0.2em;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--color-sumi);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: var(--color-ink-light);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border-radius: 20px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-sumi);
  margin-bottom: 1rem;
}

.feature-desc {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-ink-light);
}

.feature-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: var(--color-vermillion);
  transition: width 0.3s ease;
}

.feature-card:hover .feature-line {
  width: 100%;
}

/* ==========================================
   Products Section
   ========================================== */
.products-section {
  padding: 6rem 0;
  background: var(--color-cream);
}

.produce-showcase {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.produce-image {
  max-width: 400px;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.sale-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--color-vermillion);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 5;
}

.product-image-wrapper {
  aspect-ratio: 1;
  overflow: hidden;
  background: linear-gradient(135deg, #fef9f3, #f5ebe0);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
}

.product-info {
  padding: 1.5rem;
}

.product-category {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--color-matcha);
  background: rgba(124, 148, 115, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  margin-bottom: 0.75rem;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-sumi);
  margin-bottom: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-pricing {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sale-price,
.regular-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-vermillion);
}

.regular-price {
  color: var(--color-sumi);
}

.original-price {
  font-size: 0.875rem;
  color: #aaa;
  text-decoration: line-through;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, var(--color-gold), #e8b893);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  background: linear-gradient(135deg, #c99659, #d9a57a);
  transform: scale(1.02);
}

/* Skeleton Loading */
.skeleton {
  pointer-events: none;
}

.skeleton-image {
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 1.5rem;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.view-all-wrapper {
  text-align: center;
}

.btn-view-all {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid var(--color-sumi);
  color: var(--color-sumi);
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view-all:hover {
  background: var(--color-sumi);
  color: white;
}

.btn-view-all .arrow {
  transition: transform 0.3s ease;
}

.btn-view-all:hover .arrow {
  transform: translateX(5px);
}

/* ==========================================
   Story Section
   ========================================== */
.story-section {
  padding: 6rem 0;
  background: var(--color-paper);
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

@media (max-width: 768px) {
  .story-grid {
    grid-template-columns: 1fr;
  }
}

.story-image-wrapper {
  position: relative;
}

.image-frame {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.story-image {
  width: 100%;
  height: auto;
  display: block;
}

.decorative-stamp {
  position: absolute;
  bottom: -1rem;
  right: -1rem;
  width: 80px;
  height: 80px;
  background: var(--color-vermillion);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  writing-mode: vertical-rl;
  letter-spacing: 0.1em;
  box-shadow: 0 4px 20px rgba(230, 57, 70, 0.3);
}

.story-content .section-tag {
  display: block;
  text-align: left;
  margin-bottom: 1rem;
}

.story-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--color-sumi);
  line-height: 1.3;
  margin-bottom: 2rem;
}

.story-title .highlight {
  color: var(--color-vermillion);
}

.story-text {
  font-size: 1.125rem;
  line-height: 2;
  color: var(--color-ink-light);
  margin-bottom: 1.5rem;
}

.story-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-vermillion);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-ink-light);
}

/* ==========================================
   Testimonials Section
   ========================================== */
.testimonials-section {
  padding: 6rem 0;
  background: linear-gradient(180deg, var(--color-cream), var(--color-paper));
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.testimonial-stars {
  margin-bottom: 1rem;
}

.testimonial-content {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-ink-light);
  margin-bottom: 1.5rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-gold), #e8b893);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--color-sumi);
}

.author-location {
  font-size: 0.875rem;
  color: var(--color-ink-light);
}

/* ==========================================
   CTA Section
   ========================================== */
.cta-section {
  position: relative;
  padding: 6rem 0;
  background: linear-gradient(135deg, var(--color-vermillion), #ff6b6b);
  color: white;
  text-align: center;
  overflow: hidden;
}

.cta-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image:
    radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
    radial-gradient(circle at 80% 50%, white 1px, transparent 1px);
  background-size: 60px 60px;
}

.cta-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.cta-subtitle {
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.btn-cta-primary {
  padding: 1rem 2.5rem;
  background: white;
  color: var(--color-vermillion);
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-cta-secondary {
  padding: 1rem 2.5rem;
  background: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ==========================================
   Footer
   ========================================== */
.jp-footer {
  background: var(--color-sumi);
  color: rgba(255, 255, 255, 0.8);
  padding: 4rem 0 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-kanji {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-gold), #e8b893);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.brand-desc {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
}

.footer-title {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.footer-links ul,
.footer-contact ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li,
.footer-contact li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: var(--color-gold);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
}
</style>
