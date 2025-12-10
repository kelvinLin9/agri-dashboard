<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <!-- Main Footer Content -->
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand Section -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <img
              src="@/assets/logo.png"
              alt="日沐 SunBathe"
              class="w-12 h-12 object-contain"
            />
            <span class="text-xl font-bold bg-gradient-to-r from-harvest-600 to-earth-600 bg-clip-text text-transparent">
              日沐 SunBathe
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
            用心栽種，用愛分享。我們致力於提供最新鮮、最優質的農產品，讓您與家人享受健康美味的生活。
          </p>
          <!-- Social Links -->
          <div class="flex items-center gap-3">
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-harvest-100 hover:text-harvest-600 dark:hover:bg-harvest-900/30 dark:hover:text-harvest-400 transition-colors"
              aria-label="Facebook"
            >
              <UIcon name="i-simple-icons-facebook" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-harvest-100 hover:text-harvest-600 dark:hover:bg-harvest-900/30 dark:hover:text-harvest-400 transition-colors"
              aria-label="Instagram"
            >
              <UIcon name="i-simple-icons-instagram" class="w-5 h-5" />
            </a>
            <a
              href="#"
              class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-harvest-100 hover:text-harvest-600 dark:hover:bg-harvest-900/30 dark:hover:text-harvest-400 transition-colors"
              aria-label="LINE"
            >
              <UIcon name="i-simple-icons-line" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            快速連結
          </h3>
          <ul class="space-y-3">
            <li>
              <router-link
                to="/shop/products"
                class="text-gray-600 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
              >
                所有商品
              </router-link>
            </li>
            <li>
              <router-link
                to="/about"
                class="text-gray-600 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
              >
                關於我們
              </router-link>
            </li>
            <li>
              <router-link
                to="/faq"
                class="text-gray-600 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
              >
                常見問題
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            客戶服務
          </h3>
          <ul class="space-y-3">
            <li>
              <router-link
                to="/my-orders"
                class="text-gray-600 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
              >
                訂單查詢
              </router-link>
            </li>
            <li>
              <router-link
                to="/shipping"
                class="text-gray-600 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
              >
                運送說明
              </router-link>
            </li>
            <li>
              <router-link
                to="/refund-policy"
                class="text-gray-600 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
              >
                退換貨政策
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            聯繫我們
          </h3>
          <ul class="space-y-3">
            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-harvest-500" />
              <a href="mailto:contact@sunbathe.tw" class="hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors">
                contact@sunbathe.tw
              </a>
            </li>
            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UIcon name="i-heroicons-phone" class="w-4 h-4 text-harvest-500" />
              <a href="tel:0800-123-456" class="hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors">
                0800-123-456
              </a>
            </li>
            <li class="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-harvest-500 mt-0.5" />
              <span>
                週一至週五 09:00-18:00<br />
                週六 09:00-12:00
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © {{ currentYear }} 日沐 SunBathe. All rights reserved.
          </p>
          <div class="flex items-center gap-4 text-sm">
            <router-link
              to="/privacy"
              class="text-gray-500 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
            >
              隱私權政策
            </router-link>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <router-link
              to="/terms"
              class="text-gray-500 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
            >
              服務條款
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
