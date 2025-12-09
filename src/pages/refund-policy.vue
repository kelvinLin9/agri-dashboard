<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          退換貨政策
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          最後更新日期：{{ lastUpdated }}
        </p>
      </div>

      <!-- Alert -->
      <div class="mb-8 p-4 bg-harvest-50 dark:bg-harvest-900/20 border border-harvest-200 dark:border-harvest-800 rounded-xl">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-harvest-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-harvest-800 dark:text-harvest-200 font-medium">7 天鑑賞期保障</p>
            <p class="text-harvest-700 dark:text-harvest-300 text-sm mt-1">
              依據《消費者保護法》規定，您享有商品到貨後 7 天的猶豫期（非試用期）。
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">一、7天鑑賞期</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            依據《消費者保護法》第 19 條規定，消費者於收到商品後 7 日內，得不附理由退回商品。
          </p>
          <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p class="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>注意：</strong>鑑賞期為「猶豫期」而非「試用期」，商品需保持全新狀態、完整包裝、未拆封使用，方可退貨。
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">二、不適用 7 天鑑賞期商品</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">依法以下商品不適用 7 天鑑賞期：</p>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li><strong>生鮮食品：</strong>蔬果、肉品、海鮮等易腐敗商品</li>
            <li><strong>客製化商品：</strong>依消費者要求客製的商品</li>
            <li><strong>報紙、期刊或雜誌</strong></li>
            <li><strong>已拆封的保健食品、食品類商品</strong></li>
          </ul>
          <p class="text-gray-600 dark:text-gray-300 mt-4">
            上述商品若有瑕疵或運送過程損壞，仍可申請退換貨。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">三、退貨條件</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">欲辦理退貨，商品須符合以下條件：</p>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>商品未經使用、未經損壞</li>
            <li>商品包裝完整（包括外盒、配件、贈品等）</li>
            <li>發票/收據完整保留</li>
            <li>於收到商品後 7 日內提出申請</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">四、換貨條件</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">以下情況可申請換貨：</p>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>商品有瑕疵或與訂購內容不符</li>
            <li>運送過程造成商品損壞</li>
            <li>收到錯誤商品</li>
          </ul>
          <p class="text-gray-600 dark:text-gray-300 mt-4">
            上述情況的換貨運費由本公司負擔。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">五、生鮮商品處理</h2>
          <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
            <p class="text-red-800 dark:text-red-200 text-sm">
              <strong>重要：</strong>生鮮商品請於收貨時當場檢查，如有問題請立即拍照存證並於 24 小時內聯繫客服。
            </p>
          </div>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>生鮮商品因易腐性，不適用 7 天鑑賞期</li>
            <li>若收到時已明顯腐壞或變質，請拍照存證並於 24 小時內通知客服</li>
            <li>經確認後，我們將補寄商品或全額退款</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">六、退換貨流程</h2>
          <ol class="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-3 ml-4">
            <li><strong>提出申請：</strong>透過「我的訂單」頁面或聯繫客服提出退換貨申請</li>
            <li><strong>等待審核：</strong>客服將於 1-2 個工作天內審核並回覆</li>
            <li><strong>寄回商品：</strong>審核通過後，請將商品妥善包裝寄回</li>
            <li><strong>退款/換貨：</strong>收到商品並確認無誤後，7 個工作天內完成退款或寄出換貨商品</li>
          </ol>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">七、退款方式</h2>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li><strong>信用卡付款：</strong>刷退至原信用卡，依各銀行作業時間入帳</li>
            <li><strong>ATM 轉帳：</strong>退款至您指定的銀行帳戶</li>
            <li><strong>超商代碼：</strong>退款至您指定的銀行帳戶</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">八、運費說明</h2>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>商品瑕疵或錯誤：退換貨運費由本公司負擔</li>
            <li>7天鑑賞期退貨：退貨運費由消費者負擔</li>
            <li>換貨（非瑕疵）：來回運費由消費者負擔</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">九、聯絡客服</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            如需辦理退換貨或有任何疑問，歡迎透過以下方式聯繫我們：
          </p>
          <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-gray-700 dark:text-gray-200">日沐 SunBathe 客服中心</p>
            <p class="text-gray-600 dark:text-gray-300">電子郵件：<a href="mailto:support@sunbathe.com.tw" class="text-harvest-600 hover:underline">support@sunbathe.com.tw</a></p>
            <p class="text-gray-600 dark:text-gray-300">服務時間：週一至週五 09:00-18:00</p>
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
  document.title = '退換貨政策 | 日沐 SunBathe'
})
</script>
