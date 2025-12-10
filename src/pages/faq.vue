<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-harvest-600 via-harvest-500 to-earth-500 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">常見問題</h1>
          <p class="text-xl text-white/90">
            以下整理了顧客最常詢問的問題，希望能幫助您快速找到答案。
          </p>
        </div>
      </div>
    </section>

    <!-- Search -->
    <section class="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <UIcon name="i-heroicons-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜尋問題..."
              class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-harvest-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Categories -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Category Tabs -->
          <div class="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="activeCategory = category.id"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              :class="activeCategory === category.id
                ? 'bg-harvest-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              {{ category.name }}
            </button>
          </div>

          <!-- FAQ List -->
          <div class="space-y-4">
            <div
              v-for="(faq, index) in filteredFaqs"
              :key="index"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                @click="toggleFaq(index)"
                class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <span class="font-medium text-gray-900 dark:text-white pr-4">{{ faq.question }}</span>
                <UIcon
                  :name="openFaqs.includes(index) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="w-5 h-5 text-gray-400 flex-shrink-0"
                />
              </button>
              <div
                v-show="openFaqs.includes(index)"
                class="px-6 pb-4 text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                {{ faq.answer }}
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredFaqs.length === 0" class="text-center py-12">
            <UIcon name="i-heroicons-question-mark-circle" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400 mb-2">找不到相關問題</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">請嘗試其他關鍵字，或直接聯繫客服</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-12 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">還有其他問題？</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            如果以上沒有找到您需要的答案，歡迎直接聯繫我們的客服團隊。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:contact@sunbathe.tw" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-harvest-600 text-white rounded-lg font-semibold hover:bg-harvest-700 transition-colors">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5" />
              聯繫客服
            </a>
            <a href="tel:0800-123-456" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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
import { ref, computed } from 'vue'

const searchQuery = ref('')
const activeCategory = ref('all')
const openFaqs = ref<number[]>([])

const categories = [
  { id: 'all', name: '全部' },
  { id: 'order', name: '訂單相關' },
  { id: 'shipping', name: '運送配送' },
  { id: 'payment', name: '付款相關' },
  { id: 'return', name: '退換貨' },
  { id: 'account', name: '帳戶會員' },
]

const faqs = [
  // 訂單相關
  {
    category: 'order',
    question: '如何查詢訂單狀態？',
    answer: '您可以登入會員帳戶，在「我的訂單」頁面查看所有訂單的即時狀態。訂單狀態包含：待付款、處理中、已出貨、已送達、已完成等。您也可以透過訂單確認信中的連結直接查詢。'
  },
  {
    category: 'order',
    question: '訂單可以修改嗎？',
    answer: '訂單成立後 30 分鐘內，若尚未進入處理程序，您可以聯繫客服進行修改。超過此時間或訂單已開始處理，將無法修改。建議您在下單前仔細確認商品內容與數量。'
  },
  {
    category: 'order',
    question: '如何取消訂單？',
    answer: '若訂單尚未出貨，您可以在「我的訂單」中直接取消。若已出貨則需等待商品送達後，依退貨流程處理。已付款的訂單取消後，款項將於 3-7 個工作日內退回原付款帳戶。'
  },
  // 運送配送
  {
    category: 'shipping',
    question: '配送範圍有哪些？',
    answer: '目前我們提供台灣本島配送服務，離島地區（金門、馬祖、澎湖等）暫不提供配送。未來將逐步擴大服務範圍，敬請期待。'
  },
  {
    category: 'shipping',
    question: '運費如何計算？',
    answer: '一般商品運費為 $80，滿 $1,500 免運費。冷藏/冷凍商品因需低溫配送，運費為 $150，滿 $2,000 免運。偏遠地區可能酌收額外運費。'
  },
  {
    category: 'shipping',
    question: '配送需要多久時間？',
    answer: '一般情況下，訂單付款後 1-3 個工作日內出貨，出貨後 1-2 天內送達。如遇連假或特殊情況可能延遲，我們會以簡訊或 Email 通知您最新進度。'
  },
  {
    category: 'shipping',
    question: '可以指定配送時間嗎？',
    answer: '可以的！結帳時您可以選擇希望的配送時段：上午(9:00-12:00)、下午(12:00-17:00)、晚間(17:00-20:00)。實際配送時間以物流公司為準。'
  },
  // 付款相關
  {
    category: 'payment',
    question: '有哪些付款方式？',
    answer: '我們提供多元付款方式：1. 信用卡（VISA、MasterCard、JCB）2. LINE Pay 3. 銀行轉帳/ATM 4. 超商付款（7-11、全家）。所有線上付款均採用 SSL 加密，安全有保障。'
  },
  {
    category: 'payment',
    question: '付款失敗怎麼辦？',
    answer: '若付款失敗，請先確認：1. 信用卡額度是否足夠 2. 卡片是否開通網路交易功能 3. 輸入資料是否正確。若問題持續，建議更換付款方式或聯繫發卡銀行。'
  },
  {
    category: 'payment',
    question: '可以開立統一發票嗎？',
    answer: '可以的！結帳時可選擇開立電子發票（個人或公司戶）。若需開立公司統編發票，請在備註欄填寫公司名稱與統編。發票將於出貨後以電子郵件寄送。'
  },
  // 退換貨
  {
    category: 'return',
    question: '商品可以退換貨嗎？',
    answer: '依據消費者保護法，您享有收到商品後 7 天內的鑑賞期。生鮮食品、個人衛生用品等依規定不適用無條件退貨，但若商品有瑕疵，我們將全額退費或換貨。'
  },
  {
    category: 'return',
    question: '如何辦理退貨？',
    answer: '請於收到商品 7 天內聯繫客服申請退貨。商品需保持原包裝完整，未經使用。確認後我們將安排物流取件，退款將於收到退回商品後 3-7 個工作日處理完成。'
  },
  {
    category: 'return',
    question: '收到商品有問題怎麼辦？',
    answer: '若收到的商品有瑕疵、損壞或與訂購內容不符，請於收貨後 24 小時內拍照並聯繫客服。我們將優先處理，安排補寄或全額退款，相關運費由我們負擔。'
  },
  // 帳戶會員
  {
    category: 'account',
    question: '如何成為會員？',
    answer: '點擊網站右上角「註冊」按鈕，填寫基本資料並驗證 Email 即可成為會員。新會員首次購物可享 9 折優惠，並開始累積消費金額升等會員等級。'
  },
  {
    category: 'account',
    question: '忘記密碼怎麼辦？',
    answer: '請在登入頁面點擊「忘記密碼」，輸入註冊時的 Email，我們將發送密碼重設連結至您的信箱。連結有效時間為 24 小時，請盡快完成重設。'
  },
  {
    category: 'account',
    question: '會員等級有什麼權益？',
    answer: '會員等級分為：一般會員、銀卡（年消費滿 $10,000）、金卡（年消費滿 $30,000）、鑽石卡（年消費滿 $80,000）。等級越高享有越多折扣、專屬優惠券和優先購買權。'
  },
]

const filteredFaqs = computed(() => {
  let result = faqs

  if (activeCategory.value !== 'all') {
    result = result.filter(faq => faq.category === activeCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    )
  }

  return result
})

const toggleFaq = (index: number) => {
  const idx = openFaqs.value.indexOf(index)
  if (idx > -1) {
    openFaqs.value.splice(idx, 1)
  } else {
    openFaqs.value.push(index)
  }
}
</script>
