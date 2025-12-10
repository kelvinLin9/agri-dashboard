<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-harvest-600 via-harvest-500 to-earth-500 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">運送說明</h1>
          <p class="text-xl text-white/90">
            了解我們的配送服務，讓新鮮農產品安全送達您的餐桌。
          </p>
        </div>
      </div>
    </section>

    <!-- Shipping Info -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Delivery Area -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-harvest-100 dark:bg-harvest-900/30 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-harvest-600 dark:text-harvest-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">配送範圍</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" />
                  可配送區域
                </h3>
                <ul class="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  <li>• 台灣本島全區</li>
                  <li>• 北部：基隆、台北、新北、桃園、新竹、苗栗</li>
                  <li>• 中部：台中、彰化、南投、雲林</li>
                  <li>• 南部：嘉義、台南、高雄、屏東</li>
                  <li>• 東部：宜蘭、花蓮、台東</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-red-500" />
                  暫不配送區域
                </h3>
                <ul class="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                  <li>• 離島地區（金門、馬祖、澎湖、蘭嶼、綠島等）</li>
                  <li>• 軍事管制區</li>
                  <li>• 部分偏遠山區（如需配送請先洽詢客服）</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Shipping Fee -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-earth-100 dark:bg-earth-900/30 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-earth-600 dark:text-earth-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">運費說明</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">配送類型</th>
                    <th class="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">運費</th>
                    <th class="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">免運門檻</th>
                  </tr>
                </thead>
                <tbody class="text-gray-900 dark:text-white">
                  <tr class="border-b border-gray-100 dark:border-gray-700">
                    <td class="py-4 px-4">
                      <span class="font-medium">常溫配送</span>
                      <p class="text-sm text-gray-500 dark:text-gray-400">乾貨、常溫保存商品</p>
                    </td>
                    <td class="py-4 px-4 font-semibold text-harvest-600 dark:text-harvest-400">NT$ 80</td>
                    <td class="py-4 px-4">滿 NT$ 1,500 免運</td>
                  </tr>
                  <tr class="border-b border-gray-100 dark:border-gray-700">
                    <td class="py-4 px-4">
                      <span class="font-medium">冷藏配送</span>
                      <p class="text-sm text-gray-500 dark:text-gray-400">新鮮蔬果、乳製品</p>
                    </td>
                    <td class="py-4 px-4 font-semibold text-harvest-600 dark:text-harvest-400">NT$ 150</td>
                    <td class="py-4 px-4">滿 NT$ 2,000 免運</td>
                  </tr>
                  <tr>
                    <td class="py-4 px-4">
                      <span class="font-medium">冷凍配送</span>
                      <p class="text-sm text-gray-500 dark:text-gray-400">冷凍肉品、海鮮</p>
                    </td>
                    <td class="py-4 px-4 font-semibold text-harvest-600 dark:text-harvest-400">NT$ 180</td>
                    <td class="py-4 px-4">滿 NT$ 2,500 免運</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p class="text-sm text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 flex-shrink-0" />
                注意：不同溫層商品需分開配送，運費將分別計算。建議將同溫層商品一起購買以節省運費。
              </p>
            </div>
          </div>

          <!-- Delivery Time -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-forest-100 dark:bg-forest-900/30 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-forest-600 dark:text-forest-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">配送時間</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-6 mb-6">
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-3">🚚 標準配送</h3>
                <ul class="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                  <li>• 訂單確認後 <strong>1-3 個工作日</strong> 出貨</li>
                  <li>• 出貨後 <strong>1-2 天</strong> 內送達</li>
                  <li>• 週六、日及國定假日不配送</li>
                </ul>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-3">⚡ 預購商品</h3>
                <ul class="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                  <li>• 依商品頁面標示的預計出貨日</li>
                  <li>• 產季新鮮直送</li>
                  <li>• 出貨前將發送通知</li>
                </ul>
              </div>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">可選配送時段</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="p-3 bg-harvest-50 dark:bg-harvest-900/20 rounded-lg text-center">
                <p class="font-medium text-harvest-600 dark:text-harvest-400">上午</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">09:00 - 12:00</p>
              </div>
              <div class="p-3 bg-harvest-50 dark:bg-harvest-900/20 rounded-lg text-center">
                <p class="font-medium text-harvest-600 dark:text-harvest-400">下午</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">12:00 - 17:00</p>
              </div>
              <div class="p-3 bg-harvest-50 dark:bg-harvest-900/20 rounded-lg text-center">
                <p class="font-medium text-harvest-600 dark:text-harvest-400">晚間</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">17:00 - 20:00</p>
              </div>
            </div>
          </div>

          <!-- Important Notes -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">注意事項</h2>
            </div>
            <ul class="space-y-4 text-gray-600 dark:text-gray-400">
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>收貨時請當面檢查商品外觀是否完整，如有問題請立即反映給配送人員。</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>冷藏/冷凍商品請於收貨後立即放入冰箱保存，以確保商品新鮮度。</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>如遇颱風、地震等天災，配送可能延遲，我們將另行通知。</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>若無人簽收，配送人員將聯繫您安排二次配送，或放置管理室/指定地點。</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check" class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>訂單出貨後將發送簡訊/Email 通知，內含物流追蹤連結。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-12 bg-gradient-to-br from-harvest-600 to-earth-600 text-white">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-2xl font-bold mb-4">有配送相關問題？</h2>
          <p class="text-white/90 mb-6">
            如有任何配送疑問，歡迎聯繫我們的客服團隊。
          </p>
          <a href="mailto:contact@sunbathe.tw" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-harvest-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            <UIcon name="i-heroicons-envelope" class="w-5 h-5" />
            聯繫客服
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Shipping page - static content with informational layout
</script>
