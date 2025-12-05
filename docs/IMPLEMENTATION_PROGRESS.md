# 🚀 實作進度追蹤

**開始日期**: 2025-12-05  
**最後更新**: 2025-12-05 09:19

> 本文檔用於追蹤前端功能實作進度，與 [frontend_next_steps.md](./frontend_next_steps.md) 配合使用。

---

## 📊 總體進度

- API 層: ✅ **100%** (69/69 端點)
- 前端頁面: 🔄 **進行中**
  - 已完成: 9 個基礎頁面
  - 待開發: 4 個新頁面
  - 待優化: 5 個現有頁面

---

## 🎯 優先級 P0 - 整合現有頁面

### 1. 訂單管理頁面增強

**檔案**: `src/pages/orders/index.vue`  
**狀態**: ✅ 已完成 
**實際時間**: ~40 分鐘

#### 任務清單

- [x] **支付記錄查詢**
  - [x] 在訂單詳情 modal 中新增「支付資訊」區塊
  - [x] 調用 `paymentApi.getByOrderId()` 取得支付記錄
  - [x] 顯示支付狀態、金額、支付方式、ECPay 交易編號
  - [x] 根據支付狀態顯示不同顏色的 Badge

- [x] **退款功能**
  - [x] 在訂單詳情中新增「申請退款」按鈕 (僅已付款訂單)
  - [x] 建立退款申請 Modal
    - [x] 輸入退款金額 (不可超過訂單總額)
    - [x] 輸入退款原因 (必填)
    - [x] 送出後調用 `refundApi.create()`
  - [x] 查詢退款記錄
    - [x] 調用 `refundApi.getByOrderId()` 
    - [x] 顯示退款狀態、金額、原因、審核結果

#### 實作筆記

```typescript
// 支付和退款資訊查詢
const fetchPaymentInfo = async (orderId: string) => {
  try {
    const payment = await paymentApi.getByOrderId(orderId)
    paymentInfo.value = payment
  } catch (error) {
    console.error('獲取支付資訊失敗:', error)
  }
}

// 退款申請
const submitRefund = async () => {
  await refundApi.create({
    orderId: viewingOrder.value.id,
    amount: refundForm.value.amount,
    reason: refundForm.value.reason
  })
  await fetchRefundInfo(viewingOrder.value.id)
}

// 退款資格檢查
const canApplyRefund = computed(() => {
  if (!viewingOrder.value || refundInfo.value) return false
  const validStatuses = [
    OrderStatus.PAID,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED
  ]
  return validStatuses.includes(viewingOrder.value.status)
})
```

**重要變更**:
- 將 `viewOrder` 函數改為 async, 在打開 modal 時自動載入支付和退款資訊
- 新增 `PaymentStatus` 和 `RefundStatus` 的輔助函數來顯示狀態標籤和顏色
- 退款金額預設為訂單總額,用戶可以調整

#### 測試檢查

- [x] 可以查看已付款訂單的支付資訊
- [x] 支付狀態 Badge 顯示正確顏色
- [x] 可以對已付款訂單發起退款
- [x] 退款申請表單驗證正確 (金額範圍、原因必填)
- [x] 可以查看退款記錄和狀態
- [x] 退款狀態 Badge 顯示正確顏色
- [x] TypeScript 編譯通過 ✅

---

### 2. 會員管理頁面優化

**檔案**: `src/pages/members/index.vue`  
**狀態**: ⏳ 待開始  
**預計時間**: 1-2 小時

#### 任務清單

- [ ] **點數操作功能**
  - [ ] 在會員詳情中新增「調整點數」按鈕
  - [ ] 建立點數調整 Modal
    - [ ] 選擇操作類型 (增加/扣除)
    - [ ] 輸入點數數量
    - [ ] 輸入調整原因 (必填)
    - [ ] 增加: 調用 `membersApi.addPoints()`
    - [ ] 扣除: 調用 `membersApi.deductPoints()`
  - [ ] 顯示點數變更歷史 (如果後端有提供)

- [ ] **等級福利查看**
  - [ ] 新增「等級福利」按鈕或頁籤
  - [ ] 調用 `membersApi.getLevelBenefits(level)`
  - [ ] 顯示該等級的所有福利項目

#### 實作筆記

```typescript
// 程式碼片段
```

#### 測試檢查

- [ ] 可以增加會員點數
- [ ] 可以扣除會員點數
- [ ] 點數數量驗證正確
- [ ] 原因欄位為必填
- [ ] 可以查看各等級福利

---

### 3. 產品管理頁面優化

**檔案**: `src/pages/products/index.vue`  
**狀態**: ⏳ 待開始  
**預計時間**: 1.5 小時

#### 任務清單

- [ ] **分類樹狀結構選擇器**
  - [ ] 調用 `categoriesApi.getTree()` 取得階層式分類
  - [ ] 將分類選擇器改為支援樹狀結構
  - [ ] 選項建議使用:
    - [ ] USelectMenu with grouped items
    - [ ] 或建立自訂的 TreeSelect 組件
  - [ ] 顯示分類的完整路徑 (如: 農產品 > 蔬菜 > 葉菜類)

#### 實作筆記

```typescript
// 分類樹轉換為選項格式的輔助函數
```

#### 測試檢查

- [ ] 分類選擇器顯示階層結構
- [ ] 可以正確選擇子分類
- [ ] 產品列表可根據分類篩選
- [ ] 新增/編輯產品時分類選擇正確

---

## 🎯 優先級 P1 - 新頁面開發

### 4. 退款管理頁面

**檔案**: `src/pages/refunds/index.vue` (新建)  
**路由**: `/refunds`  
**狀態**: ⏳ 待開始  
**預計時間**: 4-5 小時

> [!WARNING]
> **前置需求**: 需要後端提供 `GET /refund` 端點來列出所有退款記錄。目前 API 只有 `getById` 和 `getByOrderId`。

#### 任務清單

- [ ] **建立基礎頁面結構**
  - [ ] 建立 `src/pages/refunds/index.vue`
  - [ ] 在 `router/index.ts` 中新增路由
  - [ ] 在側邊欄新增導航項目

- [ ] **退款列表**
  - [ ] 統計卡片 (總退款數、待審核、已批准、已拒絕)
  - [ ] 表格顯示退款記錄
  - [ ] 欄位: 退款編號、訂單編號、金額、原因、狀態、申請時間
  - [ ] 篩選: 按狀態
  - [ ] 搜尋: 退款編號、訂單編號

- [ ] **退款審核**
  - [ ] 退款詳情 Modal
    - [ ] 顯示完整退款資訊
    - [ ] 顯示關聯的訂單資訊
    - [ ] 管理員操作按鈕 (批准/拒絕)
  - [ ] 批准退款: `refundApi.approve()`
  - [ ] 拒絕退款: `refundApi.reject()` (需輸入拒絕原因)

#### 實作筆記

```typescript
// 暫時的解決方案: 可以先從訂單列表過濾出有退款的訂單
```

#### 測試檢查

- [ ] 頁面正常載入
- [ ] 退款列表正確顯示
- [ ] 篩選和搜尋功能正常
- [ ] 可以批准退款
- [ ] 可以拒絕退款並輸入原因
- [ ] 狀態更新後列表自動刷新

---

### 5. 分類管理頁面

**檔案**: `src/pages/categories/index.vue` (新建)  
**路由**: `/categories` 或 `/products/categories`  
**狀態**: ⏳ 待開始  
**預計時間**: 5-6 小時

#### 任務清單

- [ ] **建立基礎頁面**
  - [ ] 建立頁面文件
  - [ ] 新增路由
  - [ ] 新增導航

- [ ] **樹狀分類顯示**
  - [ ] 調用 `categoriesApi.getTree()` 取得分類樹
  - [ ] 樹狀表格或 Nested List 組件
  - [ ] 支援展開/收合子分類
  - [ ] 顯示產品數量

- [ ] **CRUD 操作**
  - [ ] 新增分類 Modal
    - [ ] 選擇父分類 (可選)
    - [ ] 輸入分類名稱、Slug、描述
    - [ ] 上傳分類圖片
    - [ ] 設定排序順序
  - [ ] 編輯分類
  - [ ] 刪除分類 (檢查是否有關聯產品)
  - [ ] 拖曳排序 (進階功能)

- [ ] **分類詳情**
  - [ ] 顯示該分類下的產品
  - [ ] 調用 `categoriesApi.getProducts(id)`

#### 實作筆記

```typescript
// 樹狀結構的遞迴渲染
```

#### 測試檢查

- [ ] 分類樹正確顯示
- [ ] 可以新增根分類
- [ ] 可以新增子分類
- [ ] 可以編輯分類
- [ ] 刪除前檢查關聯產品
- [ ] 可以查看分類下的產品

---

### 6. 上傳/媒體管理頁面

**檔案**: `src/pages/uploads/index.vue` (新建)  
**路由**: `/uploads` 或 `/media`  
**狀態**: ⏳ 待開始  
**預計時間**: 5-6 小時

#### 任務清單

- [ ] **建立基礎頁面**
  - [ ] 建立頁面文件
  - [ ] 新增路由
  - [ ] 新增導航

- [ ] **檔案列表**
  - [ ] 調用 `uploadApi.getAll()` 或 `uploadApi.getMyFiles()`
  - [ ] 統計資訊: `uploadApi.getStatistics()`
  - [ ] 切換顯示模式: 表格/網格
  - [ ] 表格模式: 檔名、類型、大小、上傳時間
  - [ ] 網格模式: 縮圖預覽
  - [ ] 篩選: 按檔案類型 (image/video/document)

- [ ] **上傳功能**
  - [ ] 拖曳上傳區域
  - [ ] 點擊選擇檔案
  - [ ] 單檔上傳: `uploadApi.upload()`
  - [ ] 多檔上傳: `uploadApi.uploadMultiple()`
  - [ ] 上傳進度條

- [ ] **檔案操作**
  - [ ] 查看檔案詳情
  - [ ] 編輯檔案資訊: `uploadApi.update()`
  - [ ] 複製檔案 URL
  - [ ] 刪除檔案: `uploadApi.delete()`
  - [ ] 下載統計: `uploadApi.incrementDownload()`

- [ ] **管理員功能**
  - [ ] 清理臨時檔案: `uploadApi.cleanup()`

#### 實作筆記

```typescript
// 檔案上傳的進度追蹤
```

#### 測試檢查

- [ ] 檔案列表正常顯示
- [ ] 拖曳上傳功能正常
- [ ] 多檔上傳功能正常
- [ ] 上傳進度正確顯示
- [ ] 可以編輯檔案資訊
- [ ] 可以複製 URL
- [ ] 可以刪除檔案
- [ ] 統計資訊正確

---

## 🎯 優先級 P2 - 功能增強

### 7. 通知管理頁面增強

**檔案**: `src/pages/notifications/index.vue`  
**狀態**: ⏳ 待開始  
**預計時間**: 2-3 小時

#### 任務清單

- [ ] **模板發送功能**
  - [ ] 新增「模板發送」按鈕
  - [ ] 建立模板發送 Modal
    - [ ] 輸入模板代碼
    - [ ] 輸入模板變數 (JSON 格式)
    - [ ] 調用 `notificationsApi.sendByTemplate()`

- [ ] **批量發送功能**
  - [ ] 新增「批量發送」按鈕
  - [ ] 建立批量發送 Modal
    - [ ] 選擇目標用戶 (多選)
    - [ ] 選擇通知類型
    - [ ] 輸入標題和內容
    - [ ] 選擇發送頻道
    - [ ] 調用 `notificationsApi.sendBulk()`

- [ ] **狀態管理**
  - [ ] 管理員可更新通知狀態
  - [ ] 調用 `notificationsApi.updateStatus()`

#### 測試檢查

- [ ] 可以使用模板發送通知
- [ ] 可以批量發送給多個用戶
- [ ] 可以更新通知狀態

---

## 🎯 優先級 P3 - 通用組件

### 8. 可重用組件開發

**位置**: `src/components/`  
**狀態**: ⏳ 待開始  

#### 組件清單

- [ ] **FileUploader.vue**
  - [ ] 拖曳上傳
  - [ ] 圖片預覽
  - [ ] 進度條
  - [ ] 支援單檔/多檔模式
  - [ ] 自動調用 uploadApi

- [ ] **PaymentStatusBadge.vue**
  - [ ] 根據支付狀態顯示不同顏色
  - [ ] Props: status (PaymentStatus)

- [ ] **RefundStatusBadge.vue**
  - [ ] 根據退款狀態顯示不同顏色
  - [ ] Props: status (RefundStatus)

- [ ] **CurrencyDisplay.vue**
  - [ ] 格式化顯示金額
  - [ ] 支援不同顏色 (正/負數)
  - [ ] Props: amount, showPrefix, colorize

- [ ] **TreeSelect.vue**
  - [ ] 階層式選擇器
  - [ ] 用於分類選擇
  - [ ] 支援搜尋

---

## 🎯 優先級 P3 - 儀表板優化

### 9. 儀表板數據可視化

**檔案**: `src/pages/dashboard/index.vue`  
**狀態**: ⏳ 待開始  
**預計時間**: 3-4 小時

#### 任務清單

- [ ] **支付統計卡片**
  - [ ] 今日支付總額
  - [ ] 支付成功率
  - [ ] 常用支付方式分布圖

- [ ] **退款統計卡片**
  - [ ] 待處理退款數量
  - [ ] 本月退款率
  - [ ] 退款趨勢圖

- [ ] **會員統計增強**
  - [ ] 各等級會員分布餅圖
  - [ ] 點數使用情況
  - [ ] 會員增長趨勢線圖

- [ ] **圖表組件**
  - [ ] 使用 ECharts 或類似庫
  - [ ] 響應式設計

#### 測試檢查

- [ ] 統計數據正確
- [ ] 圖表正常顯示
- [ ] 響應式布局正常

---

## 📝 實作日誌

### 2025-12-05

**今日目標**:
- ✅ 完成訂單頁面支付查詢功能
- ✅ 完成訂單頁面退款申請功能

**完成事項**:
- ✅ 在訂單詳情 Modal 新增支付資訊顯示區塊
- ✅ 在訂單詳情 Modal 新增退款資訊顯示區塊
- ✅ 實作退款申請 Modal 及表單驗證
- ✅ 整合 `paymentApi.getByOrderId()` API
- ✅ 整合 `refundApi.getByOrderId()` API
- ✅ 整合 `refundApi.create()` API
- ✅ 實作 PaymentStatus 和 RefundStatus 的輔助函數
- ✅ TypeScript 編譯檢查通過

**遇到的問題**:
- 無重大問題,實作順利

**解決方案**:
- N/A

**明日計劃**:
- 繼續 P0 優先級任務:會員管理頁面優化 (點數操作功能)
- 或開始產品管理頁面優化 (分類樹選擇器)

---

### [日期] - 待填寫

**今日目標**:
- 

**完成事項**:
- 

**遇到的問題**:
- 

**解決方案**:
- 

**明日計劃**:
- 

---

## 📊 整體進度看板

| 功能 | 優先級 | 狀態 | 完成度 | 備註 |
|------|--------|------|--------|------|
| 訂單頁面增強 | P0 | ✅ 已完成 | 100% | 支付/退款整合 ✅ |
| 會員頁面優化 | P0 | ⏳ 待開始 | 0% | 點數操作/等級福利 |
| 產品頁面優化 | P0 | ⏳ 待開始 | 0% | 分類樹選擇器 |
| 退款管理頁面 | P1 | ⏳ 待開始 | 0% | 需後端 API 支援 |
| 分類管理頁面 | P1 | ⏳ 待開始 | 0% | |
| 上傳管理頁面 | P2 | ⏳ 待開始 | 0% | |
| 通知頁面增強 | P2 | ⏳ 待開始 | 0% | 模板/批量發送 |
| 通用組件開發 | P3 | ⏳ 待開始 | 0% | |
| 儀表板優化 | P3 | ⏳ 待開始 | 0% | |

**圖例**:
- ✅ 已完成
- 🚧 進行中
- ⏳ 待開始
- ⏸️ 暫停
- ❌ 已取消

---

## 💡 開發提示

### 常用指令

```bash
# 啟動開發伺服器
npm run dev

# TypeScript 類型檢查
npm run type-check

# ESLint 檢查
npm run lint

# 建置
npm run build
```

### Git 提交建議

```bash
# 功能開發
git commit -m "feat(orders): 新增支付記錄查詢功能"

# Bug 修復
git commit -m "fix(members): 修正點數扣除驗證問題"

# 文檔更新
git commit -m "docs: 更新實作進度追蹤文檔"
```

### 測試重點

每個功能開發完成後記得測試:
1. ✅ 功能正常運作
2. ✅ 錯誤處理 (API 失敗、網路錯誤)
3. ✅ Loading 狀態顯示
4. ✅ 表單驗證
5. ✅ 權限控制
6. ✅ 響應式設計

---

**最後更新**: 2025-12-05 09:19  
**更新者**: AI Assistant
