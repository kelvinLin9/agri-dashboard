<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          隱私權政策
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          最後更新日期：{{ lastUpdated }}
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">一、前言</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            日沐 SunBathe（以下簡稱「本公司」）非常重視您的隱私權保護。本隱私權政策說明當您使用本網站及相關服務時，我們如何蒐集、使用、揭露及保護您的個人資料。使用本服務即表示您同意本政策的條款。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">二、資料蒐集範圍</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">我們可能蒐集以下類型的資料：</p>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li><strong>個人識別資料：</strong>姓名、電子郵件、電話號碼、送貨地址</li>
            <li><strong>帳戶資料：</strong>使用者名稱、密碼（加密儲存）</li>
            <li><strong>交易資料：</strong>訂單記錄、付款資訊（不儲存完整信用卡號碼）</li>
            <li><strong>技術資料：</strong>IP 位址、瀏覽器類型、裝置資訊、Cookie</li>
            <li><strong>使用資料：</strong>瀏覽記錄、點擊行為、偏好設定</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">三、資料使用目的</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">您的資料將用於以下目的：</p>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>處理及配送您的訂單</li>
            <li>提供客戶服務及技術支援</li>
            <li>發送訂單確認、出貨通知等交易相關通訊</li>
            <li>經您同意後，發送行銷資訊及優惠活動</li>
            <li>改善網站服務及使用者體驗</li>
            <li>防止詐欺及確保網站安全</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">四、資料保護措施</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本公司採用業界標準的安全措施保護您的個人資料，包括但不限於：SSL 加密傳輸、密碼雜湊儲存、存取控制機制、定期安全稽核。我們的員工均需簽署保密協議，並僅在業務需要時才能存取您的資料。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">五、Cookie 使用</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本網站使用 Cookie 及類似技術來提升您的瀏覽體驗、記住您的偏好設定，以及進行網站分析。您可以透過瀏覽器設定管理或拒絕 Cookie，但這可能影響部分網站功能。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">六、第三方服務</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            我們可能使用第三方服務來協助營運，例如：金流服務（綠界科技）、分析工具（Google Analytics）、雲端服務等。這些第三方服務商有各自的隱私權政策，我們會確保選擇符合資料保護標準的合作夥伴。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">七、您的權利</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">依據《個人資料保護法》，您享有以下權利：</p>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>查詢或請求閱覽您的個人資料</li>
            <li>請求補充或更正您的個人資料</li>
            <li>請求停止蒐集、處理或利用您的個人資料</li>
            <li>請求刪除您的個人資料</li>
          </ul>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
            如需行使上述權利，請聯繫我們的客服團隊：<a href="mailto:privacy@sunbathe.com.tw" class="text-harvest-600 hover:underline">privacy@sunbathe.com.tw</a>
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">八、政策變更</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本公司保留隨時修訂本隱私權政策的權利。若有重大變更，我們將於網站上公告或透過電子郵件通知您。建議您定期查閱本政策以了解最新內容。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">九、聯絡方式</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            如對本隱私權政策有任何疑問，歡迎透過以下方式聯繫我們：
          </p>
          <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-gray-700 dark:text-gray-200">日沐 SunBathe 客服中心</p>
            <p class="text-gray-600 dark:text-gray-300">電子郵件：<a href="mailto:support@sunbathe.com.tw" class="text-harvest-600 hover:underline">support@sunbathe.com.tw</a></p>
          </div>
        </section>
      </div>

      <!-- Back Button -->
      <div class="mt-8 text-center">
        <UButton variant="ghost" icon="i-heroicons-arrow-left" to="/">
          返回首頁
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const lastUpdated = '2024 年 12 月 9 日'

onMounted(() => {
  document.title = '隱私權政策 | 日沐 SunBathe'
})
</script>
