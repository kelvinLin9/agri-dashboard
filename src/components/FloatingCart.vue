<template>
  <div v-if="shouldShow" class="floating-cart">
    <UButton
      icon="i-heroicons-shopping-cart"
      size="xl"
      :ui="{ rounded: 'rounded-full' }"
      class="cart-button relative"
      @click="goToCart"
    >
      <!-- 數量徽章 -->
      <span
        v-if="itemCount > 0"
        class="absolute -top-2 -right-2 min-w-[24px] h-6 px-2 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg"
      >
        {{ displayCount }}
      </span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

// 在商品列表頁和商品詳情頁顯示
const shouldShow = computed(() => {
  return route.path === '/shop/products' || route.path.startsWith('/shop/products/')
})

// 購物車商品數量
const itemCount = computed(() => cartStore.itemCount)

// 顯示數量（超過99顯示99+）
const displayCount = computed(() => {
  return itemCount.value > 99 ? '99+' : itemCount.value
})

// 前往購物車
const goToCart = () => {
  router.push('/cart')
}

// 載入購物車數據
onMounted(async () => {
  // Store 內部會檢查 token，未登入時自動跳過
  await cartStore.fetchCart()
})
</script>

<style scoped>
.floating-cart {
  position: fixed;
  bottom: 96px; /* 提高以避免和 BackToTop 按鈕重疊 */
  right: 24px;
  z-index: 999;
}

.cart-button {
  width: 60px;
  height: 60px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* 響應式：手機上稍微小一點 */
@media (max-width: 768px) {
  .floating-cart {
    bottom: 80px;
    right: 16px;
  }

  .cart-button {
    width: 56px;
    height: 56px;
  }
}
</style>
