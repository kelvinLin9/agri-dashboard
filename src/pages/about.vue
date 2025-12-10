<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-harvest-600 via-harvest-500 to-earth-500 text-white py-20">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="container mx-auto px-4 relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">關於日沐 SunBathe</h1>
          <p class="text-xl text-white/90 leading-relaxed">
            用心栽種，用愛分享。我們致力於連結農場與餐桌，為您帶來最新鮮、最優質的在地農產品。
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">我們的使命</h2>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                日沐 SunBathe 成立於 2020 年，源自於對台灣這片土地的熱愛，以及對農業永續發展的願景。
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                我們相信，好的食物來自於用心的耕耘。每一顆蔬果、每一批農產品，都承載著農民的汗水與希望。
                我們的使命是搭建一座橋樑，讓這份心意能夠直達您的餐桌。
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                透過嚴格的品質把關與完善的冷鏈物流，我們確保每一件商品都保持最佳狀態送到您手中。
              </p>
            </div>
            <div class="bg-harvest-100 dark:bg-harvest-900/30 rounded-2xl p-8">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <div class="text-4xl font-bold text-harvest-600 dark:text-harvest-400 mb-2">50+</div>
                  <div class="text-gray-600 dark:text-gray-400 text-sm">合作農場</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-harvest-600 dark:text-harvest-400 mb-2">200+</div>
                  <div class="text-gray-600 dark:text-gray-400 text-sm">優質商品</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-harvest-600 dark:text-harvest-400 mb-2">10K+</div>
                  <div class="text-gray-600 dark:text-gray-400 text-sm">滿意顧客</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-harvest-600 dark:text-harvest-400 mb-2">4.9</div>
                  <div class="text-gray-600 dark:text-gray-400 text-sm">顧客評分</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">我們的核心價值</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-harvest-100 dark:bg-harvest-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UIcon name="i-heroicons-sparkles" class="w-8 h-8 text-harvest-600 dark:text-harvest-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">新鮮品質</h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                從產地到餐桌，我們層層把關，確保每一件商品都是最新鮮的狀態。
              </p>
            </div>
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-earth-100 dark:bg-earth-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UIcon name="i-heroicons-heart" class="w-8 h-8 text-earth-600 dark:text-earth-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">用心服務</h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                每一位顧客都是我們最珍貴的夥伴，我們用心傾聽、真誠服務。
              </p>
            </div>
            <div class="text-center p-6">
              <div class="w-16 h-16 bg-forest-100 dark:bg-forest-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UIcon name="i-heroicons-globe-asia-australia" class="w-8 h-8 text-forest-600 dark:text-forest-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">永續發展</h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                支持在地農業，推動友善耕作，為下一代守護這片美麗的土地。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">我們的團隊</h2>
          <p class="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            由一群熱愛農業、熱愛這片土地的夥伴組成，我們用專業與熱情，為您挑選最好的農產品。
          </p>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-24 h-24 bg-gradient-to-br from-harvest-400 to-harvest-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span class="text-3xl text-white font-bold">林</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">林一休</h3>
              <p class="text-harvest-600 dark:text-harvest-400 text-sm mb-2">創辦人 / 執行長</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">深耕農業領域十餘年</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gradient-to-br from-earth-400 to-earth-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span class="text-3xl text-white font-bold">王</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">王美玲</h3>
              <p class="text-earth-600 dark:text-earth-400 text-sm mb-2">營運長</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">物流與品管專家</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gradient-to-br from-forest-400 to-forest-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span class="text-3xl text-white font-bold">陳</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">陳志明</h3>
              <p class="text-forest-600 dark:text-forest-400 text-sm mb-2">技術長</p>
              <p class="text-gray-500 dark:text-gray-400 text-sm">電商平台架構師</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-16 bg-gradient-to-br from-harvest-600 to-earth-600 text-white">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-4">與我們聯繫</h2>
          <p class="text-white/90 mb-8">
            有任何問題或建議，歡迎隨時與我們聯繫。我們很樂意傾聽您的聲音。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:contact@sunbathe.tw" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-harvest-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5" />
              contact@sunbathe.tw
            </a>
            <a href="tel:0800-123-456" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/30 transition-colors">
              <UIcon name="i-heroicons-phone" class="w-5 h-5" />
              0800-123-456
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// About page - static content, no logic needed
</script>
