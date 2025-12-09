<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          服務條款
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          最後更新日期：{{ lastUpdated }}
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">一、接受條款</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            歡迎使用日沐 SunBathe（以下簡稱「本網站」）。當您存取或使用本網站及其提供的服務時，即表示您同意遵守本服務條款。如您不同意本條款的任何部分，請勿使用本網站。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">二、服務說明</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本網站提供農產品線上購物服務，包括但不限於：商品瀏覽、訂單下單、線上付款、配送追蹤等功能。我們保留隨時修改、暫停或終止服務的權利，且無需事先通知。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">三、會員帳戶</h2>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>您必須年滿 18 歲或獲得法定代理人同意方可註冊會員</li>
            <li>您有責任維護帳戶密碼的安全性</li>
            <li>您同意對於使用您帳戶的所有活動負責</li>
            <li>若發現帳戶被未授權使用，請立即通知我們</li>
            <li>我們保留暫停或終止違規帳戶的權利</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">四、商品與價格</h2>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>商品圖片僅供參考，實際商品可能略有差異（農產品為自然生長，外觀會有合理差異）</li>
            <li>商品價格以結帳當時顯示的價格為準</li>
            <li>我們保留修改商品價格及規格的權利</li>
            <li>若發現價格錯誤，我們將通知您並提供取消訂單的選項</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">五、訂單與付款</h2>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>訂單成立後，我們將發送訂單確認郵件</li>
            <li>我們保留拒絕或取消任何訂單的權利</li>
            <li>付款方式包括：信用卡、ATM 轉帳、超商代碼</li>
            <li>訂單付款後方進入出貨流程</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">六、配送服務</h2>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>配送範圍：台灣本島及離島（離島運費另計）</li>
            <li>配送時間：付款完成後 1-3 個工作天出貨</li>
            <li>生鮮商品採低溫宅配，請於配送當日收取</li>
            <li>若因收件人因素導致配送失敗，額外運費由收件人負擔</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">七、智慧財產權</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本網站所有內容，包括但不限於文字、圖片、標誌、設計、軟體等，均受著作權法及其他智慧財產權法律保護。未經本公司書面同意，不得複製、修改、散布或以任何方式使用。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">八、禁止行為</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">使用本網站時，您同意不得：</p>
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
            <li>從事任何違法行為</li>
            <li>冒用他人身份或提供虛假資訊</li>
            <li>干擾或破壞網站運作</li>
            <li>使用自動化工具大量蒐集資料</li>
            <li>侵害他人權益或發布不當內容</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">九、免責聲明</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本網站以「現狀」提供服務，我們不對服務的持續性、正確性或適用性作任何明示或暗示的擔保。對於因使用本網站而產生的任何直接或間接損失，本公司不負賠償責任（法律另有規定者除外）。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">十、條款修改</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本公司保留隨時修改本服務條款的權利。修改後的條款將公布於本網站，繼續使用本服務即視為同意修改後的條款。
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">十一、準據法</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            本條款以中華民國法律為準據法。因本條款所生之爭議，雙方同意以台灣台北地方法院為第一審管轄法院。
          </p>
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
  document.title = '服務條款 | 日沐 SunBathe'
})
</script>
