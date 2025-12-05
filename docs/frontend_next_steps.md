# 前端開發下一步行動計劃

## 📊 現狀分析

### ✅ 已完成的頁面

根據目前的路由和頁面結構,已經有以下頁面:

1. **認證相關** ✅
   - `/login` - 登入頁
   - `/register` - 註冊頁
   - `/auth/callback` - OAuth 回調頁

2. **管理後台基礎** ✅
   - `/dashboard` - 儀表板
   - `/members` - 會員管理 (使用 MembersAPI ✅)
   - `/orders` - 訂單管理 (使用 OrdersAPI ✅)
   - `/products` - 產品管理 (使用 ProductsAPI ✅)
   - `/notifications` - 通知管理
   - `/logs` - 系統日誌
   - `/pages` - 頁面管理

### 🆕 API 層已完成但缺少對應頁面

1. **支付管理** - `paymentApi` 已實作,但無對應頁面
2. **退款管理** - `refundApi` 已實作,但無對應頁面
3. **分類管理** - `categoriesApi` 已完整,但產品頁面使用不完整
4. **上傳管理** - `uploadApi` 已增強,但無獨立管理頁面

---

## 🎯 下一步開發計劃

### 優先級 P0 (緊急且重要)

#### 1. **整合新增的 API 功能到現有頁面**

由於你剛剛完成了 Payment 和 Refund API,最優先的是讓訂單管理頁面可以使用這些功能。

##### A. 訂單管理頁面增強 ([`orders/index.vue`](file:///Users/linyixiu/agri/agri-dashboard/src/pages/orders/index.vue))

**新增功能**:
- [ ] 訂單詳情中加入「查看支付記錄」按鈕
  - 調用 `paymentApi.getByOrderId(orderId)` 查詢支付狀態
  - 顯示支付方式、金額、狀態、ECPay 交易編號
  
- [ ] 訂單詳情中加入「發起退款」按鈕 (針對已付款訂單)
  - 彈出退款表單 modal
  - 輸入退款金額和原因
  - 調用 `refundApi.create()` 建立退款申請
  
- [ ] 訂單詳情中加入「查看退款記錄」(如果有退款)
  - 調用 `refundApi.getByOrderId(orderId)`
  - 顯示退款狀態、金額、原因

**實作重點**:
```typescript
// 在訂單詳情 modal 中加入支付和退款資訊
const paymentInfo = ref<Payment | null>(null)
const refundInfo = ref<Refund | null>(null)

const fetchPaymentInfo = async (orderId: string) => {
  try {
    paymentInfo.value = await paymentApi.getByOrderId(orderId)
  } catch (error) {
    console.error('取得支付資訊失敗', error)
  }
}

const handleCreateRefund = async () => {
  await refundApi.create({
    orderId: viewingOrder.value.id,
    amount: refundAmount.value,
    reason: refundReason.value
  })
  // 重新載入訂單資料
}
```

##### B. 產品管理頁面優化 ([`products/index.vue`](file:///Users/linyixiu/agri/agri-dashboard/src/pages/products/index.vue))

**集成分類樹狀結構**:
- [ ] 使用 `categoriesApi.getTree()` 取得階層式分類
- [ ] 在分類選擇器中顯示樹狀結構 (使用 UTreeSelect 或類似組件)
- [ ] 支持根據分類篩選產品

---

### 優先級 P1 (重要)

#### 2. **建立支付管理頁面**

**路徑**: `/payments` 或在訂單頁面下加入子頁面 `/orders/payments`

**功能需求**:
- [ ] 支付記錄列表
  - 表格顯示:支付編號、訂單編號、金額、狀態、支付方式、建立時間
  - 篩選:按狀態、支付方式、日期範圍
  - 搜尋:支付編號、ECPay 交易編號
  
- [ ] 支付詳情 Modal
  - 完整支付資訊
  - 關聯的訂單連結
  - ECPay 交易資訊

**組件檔案**: `src/pages/payments/index.vue`

**參考實作**:
```vue
<template>
  <div class="p-6 space-y-6">
    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4">
      <UCard>總支付數: {{ total }}</UCard>
      <UCard>成功: {{ paidCount }}</UCard>
      <UCard>待處理: {{ pendingCount }}</UCard>
      <UCard>失敗: {{ failedCount }}</UCard>
    </div>

    <!-- 篩選和搜尋 -->
    <UCard>
      <UInput v-model="search" placeholder="搜尋支付編號..." />
      <USelectMenu v-model="statusFilter" :items="statusOptions" />
    </UCard>

    <!-- 支付列表 -->
    <UCard>
      <UTable :data="payments" :columns="columns" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { paymentApi, type Payment } from '@/api'

const payments = ref<Payment[]>([])
const fetchPayments = async () => {
  // TODO: 後端可能需要加入 getAll 方法
  // 目前 paymentApi 只有 getById 和 getByOrderId
}
</script>
```

> [!WARNING]
> **注意**: 目前 `paymentApi` 沒有 `getAll()` 方法來列出所有支付記錄。你可能需要:
> 1. 請後端團隊加入 `GET /payment` 端點
> 2. 或者從訂單頁面進入查看個別支付記錄即可

---

#### 3. **建立退款管理頁面**

**路徑**: `/refunds` 或 `/orders/refunds`

**功能需求**:
- [ ] 退款申請列表
  - 狀態:待審核、已批准、已拒絕、已完成
  - 管理員操作:批准、拒絕退款
  
- [ ] 退款審核 Modal
  - 顯示訂單資訊、退款原因
  - 批准/拒絕按鈕
  - 拒絕時需填寫原因

**組件檔案**: `src/pages/refunds/index.vue`

**實作重點**:
```vue
<script setup lang="ts">
import { refundApi, type Refund, RefundStatus } from '@/api'

const handleApprove = async (refundId: string) => {
  await refundApi.approve(refundId, {
    note: '已確認退款'
  })
  fetchRefunds()
}

const handleReject = async (refundId: string, reason: string) => {
  await refundApi.reject(refundId, reason)
  fetchRefunds()
}
</script>
```

> [!WARNING]
> **同樣問題**: `refundApi` 也沒有 `getAll()` 方法。需要後端支援。

---

### 優先級 P2 (可選但建議)

#### 4. **建立分類管理頁面**

**路徑**: `/categories` 或 `/products/categories`

**功能需求**:
- [ ] 樹狀分類結構顯示
  - 使用 `categoriesApi.getTree()`
  - 拖曳排序功能
  - 展開/收合子分類
  
- [ ] CRUD 操作
  - 新增分類 (選擇父分類)
  - 編輯分類
  - 刪除分類 (檢查是否有關聯產品)
  
- [ ] 分類詳情
  - 顯示該分類下的產品數量
  - 使用 `categoriesApi.getProducts(id)` 查看產品列表

**UI 建議**:
- 使用樹狀表格或 Nested List 組件
- 支持 inline editing

---

#### 5. **建立上傳管理頁面**

**路徑**: `/uploads` 或 `/media`

**功能需求**:
- [ ] 檔案列表
  - 表格或網格模式切換
  - 顯示預覽圖、檔名、大小、上傳時間
  - 篩選:按類型 (image/video/document)
  
- [ ] 上傳功能
  - 拖曳上傳
  - 批量上傳 (使用 `uploadApi.uploadMultiple()`)
  - 上傳進度顯示
  
- [ ] 檔案管理
  - 更新檔案資訊 (使用 `uploadApi.update()`)
  - 刪除檔案
  - 複製檔案 URL
  - 下載統計 (使用 `uploadApi.incrementDownload()`)
  
- [ ] 統計資訊
  - 總檔案數、總大小
  - 使用 `uploadApi.getStatistics()`

---

#### 6. **會員管理頁面增強**

**現有頁面**: [`members/index.vue`](file:///Users/linyixiu/agri/agri-dashboard/src/pages/members/index.vue)

**新增功能** (利用新 API):
- [ ] 會員等級福利查看
  - 新增「等級福利」按鈕
  - 調用 `membersApi.getLevelBenefits(level)` 顯示該等級的福利

- [ ] 點數操作 (管理員功能)
  - 在會員詳情中加入「調整點數」功能
  - 可以增加點數:`membersApi.addPoints()`
  - 可以扣除點數:`membersApi.deductPoints()`
  - 需要輸入原因

**實作範例**:
```vue
<UButton @click="openPointsModal('add')">增加點數</UButton>
<UButton @click="openPointsModal('deduct')">扣除點數</UButton>

<UModal v-model:open="isPointsModalOpen">
  <UFormField label="點數">
    <UInput v-model.number="pointsAmount" type="number" />
  </UFormField>
  <UFormField label="原因">
    <UInput v-model="pointsReason" />
  </UFormField>
  <UButton @click="handlePointsAction">確認</UButton>
</UModal>
```

---

#### 7. **通知管理頁面增強**

**現有頁面**: [`notifications/index.vue`](file:///Users/linyixiu/agri/agri-dashboard/src/pages/notifications/index.vue)

**新增功能**:
- [ ] 使用模板發送通知
  - 新增「模板發送」按鈕
  - 選擇模板代碼
  - 輸入變數
  - 調用 `notificationsApi.sendByTemplate()`
  
- [ ] 批量發送通知
  - 選擇多個用戶或用戶組
  - 撰寫通知內容
  - 選擇通知頻道 (WebSocket/Email/SMS)
  - 調用 `notificationsApi.sendBulk()`
  
- [ ] 通知狀態管理
  - 更新通知狀態
  - 調用 `notificationsApi.updateStatus()`

---

### 優先級 P3 (長期優化)

#### 8. **建立通用組件**

為了提高開發效率,建議建立以下可重用組件:

##### A. 檔案上傳組件

**位置**: `src/components/FileUploader.vue`

**功能**:
- 拖曳上傳
- 圖片預覽
- 進度條
- 支持單檔/多檔模式
- 自動調用 `uploadApi`

**使用範例**:
```vue
<FileUploader
  v-model="imageUrl"
  accept="image/*"
  :max-size="5"
  usage="product_image"
/>
```

##### B. 支付狀態徽章組件

**位置**: `src/components/PaymentStatusBadge.vue`

```vue
<template>
  <UBadge :color="getColor(status)">
    {{ getLabel(status) }}
  </UBadge>
</template>

<script setup lang="ts">
import type { PaymentStatus } from '@/api'

const props = defineProps<{ status: PaymentStatus }>()
</script>
```

##### C. 金額顯示組件

**位置**: `src/components/CurrencyDisplay.vue`

```vue
<template>
  <span :class="colorClass">
    {{ formatCurrency(amount) }}
  </span>
</template>
```

---

#### 9. **儀表板數據可視化**

**優化頁面**: [`dashboard/index.vue`](file:///Users/linyixiu/agri/agri-dashboard/src/pages/dashboard/index.vue)

**新增數據**:
- [ ] 支付統計
  - 今日支付總額
  - 支付成功率
  - 常用支付方式分布
  
- [ ] 退款統計
  - 退款申請數量
  - 退款率趨勢
  - 待處理退款數量
  
- [ ] 會員統計
  - 各等級會員分布
  - 點數使用情況
  - 會員增長趨勢

**實作**:
```typescript
// 在 dashboard 中整合新 API
const paymentStats = ref({
  total: 0,
  successRate: 0,
  todayAmount: 0
})

const refundStats = ref({
  pending: 0,
  approved: 0,
  rejected: 0
})

// 調用統計 API
const fetchStats = async () => {
  // TODO: 後端可能需要提供統計 API
  const members = await membersApi.getStatistics()
  // ...
}
```

---

#### 10. **路由結構優化**

建議將路由改為模組化結構:

**新增路由**:
```typescript
// router/index.ts
{
  path: '/finance',
  name: 'finance',
  children: [
    {
      path: 'payments',
      name: 'payments',
      component: () => import('../pages/finance/payments.vue')
    },
    {
      path: 'refunds',
      name: 'refunds',
      component: () => import('../pages/finance/refunds.vue')
    }
  ]
},
{
  path: '/content',
  name: 'content',
  children: [
    {
      path: 'categories',
      name: 'categories',
      component: () => import('../pages/content/categories.vue')
    },
    {
      path: 'uploads',
      name: 'uploads',
      component: () => import('../pages/content/uploads.vue')
    }
  ]
}
```

---

## 🚀 建議實施順序

### 第一週:緊急功能

1. **Day 1-2**: 訂單頁面整合支付和退款功能
2. **Day 3**: 會員頁面加入點數操作
3. **Day 4-5**: 產品頁面整合分類樹狀結構

### 第二週:新頁面開發

1. **Day 1-2**: 建立退款管理頁面
2. **Day 3-4**: 建立分類管理頁面
3. **Day 5**: 建立上傳管理頁面

### 第三週:優化與完善

1. **Day 1-2**: 通知頁面加入批量發送功能
2. **Day 3-4**: 儀表板數據可視化
3. **Day 5**: 建立通用組件庫

---

## ⚠️ 重要注意事項

### 後端 API 需要補充

目前發現以下 API 缺少列表查詢方法,需要與後端團隊溝通:

1. **Payment API**
   - ❌ 缺少 `GET /payment` (列出所有支付)
   - 建議: 加入分頁、篩選、搜尋參數
   
2. **Refund API**
   - ❌ 缺少 `GET /refund` (列出所有退款)
   - 建議: 加入狀態篩選、日期範圍

### 型別定義優化

建議後續統一前後端的型別定義:
- 使用後端提供的 `typescript-types` 作為 Single Source of Truth
- 建立型別同步機制

---

## 📋 總結檢查清單

**立即可執行** (API 已就緒):
- [x] API 層完整實作 ✅
- [ ] 訂單頁面整合支付/退款查詢
- [ ] 會員頁面加入點數操作
- [ ] 產品頁面使用分類樹
- [ ] 通知頁面加入模板/批量發送

**需要後端支援**:
- [ ] 支付列表 API (`GET /payment`)
- [ ] 退款列表 API (`GET /refund`)
- [ ] 統計相關 API

**長期規劃**:
- [ ] 建立通用組件庫
- [ ] 儀表板數據可視化
- [ ] 路由結構重構
- [ ] 型別定義統一

---

**建立時間**: 2025-12-05  
**預計總工時**: 2-3 週 (1 人)
