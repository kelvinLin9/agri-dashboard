# API 整合完成實作計劃

## 目標

完成前端專案缺失的後端 API 整合,確保前端可以完整對接後端所有功能,並維持整個專案的程式碼一致性。

---

## 背景分析

### 現有實作模式

分析 `src/api/` 資料夾後,發現現有的 API 模式如下:

1. **API Client** ([`apiClient.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/apiClient.ts))
   - 使用 axios 建立統一的 HTTP 客戶端
   - 實作了請求/響應攔截器
   - 自動處理 Token 認證和刷新
   - 全局錯誤處理 (401, 403, 404, 500 等)
   - Loading 狀態管理

2. **響應格式**
   - 後端使用 `ResponseTransformInterceptor` 包裝響應為 `{ data: T }`
   - 前端需要從 `response.data.data` 提取實際數據
   - 分頁響應遵循統一格式

3. **TypeScript 類型** ([`types.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/types.ts))
   - 定義了通用類型 (`ApiResponse`, `PaginatedResponse`)
   - 包含了 User, Product, Order, Member, Notification 等實體類型
   - 使用 DTO 模式定義請求參數

4. **API 服務模式**
   - 每個模組一個獨立檔案 (如 `auth.ts`, `products.ts` 等)
   - 導出一個物件包含所有相關方法
   - 方法命名遵循 RESTful 慣例 (`getAll`, `getById`, `create`, `update`, `delete`)

### 已實作的 API

- ✅ **認證** (`auth.ts`): login, register, getProfile, logout, changePassword
- ✅ **產品** (`products.ts`): getAll, getById, getBySlug, create, update, updateStock, delete
- ✅ **分類** (`categories.ts`): getAll, getById, getBySlug, getProducts, create, update, delete
- ✅ **訂單** (`orders.ts`): getAll, getMyOrders, getById, getByOrderNumber, create, update, cancel, delete
- ✅ **會員** (`members.ts`): getAll, getMyProfile, getById, create, update, updateMyProfile, delete, getStatistics
- ✅ **通知** (`notifications.ts`): getAll, getUnreadCount, create, markAsRead, markAllAsRead, delete, broadcast
- ✅ **上傳** (`upload.ts`): uploadImage, uploadVideo, getAll, getById, delete

### 缺失的 API (根據後端文檔)

根據 [`API_OVERVIEW.md`](file:///Users/linyixiu/agri/agri-backend/docs/05-frontend-integration/API_OVERVIEW.md),以下 API 尚未實作:

1. **支付 API** (`/api/payment`)
   - `POST /payment/create` - 建立支付訂單
   - `GET /payment/:id` - 查詢支付記錄
   - `GET /payment/order/:orderId` - 根據訂單查詢支付

2. **退款 API** (`/api/refund`)
   - `POST /refund/create` - 建立退款申請
   - `POST /refund/:id/approve` - 審核通過退款
   - `POST /refund/:id/reject` - 拒絕退款
   - `GET /refund/:id` - 查詢退款記錄
   - `GET /refund/order/:orderId` - 根據訂單查詢退款

3. **會員 API 補充**
   - `GET /members/level-benefits/:level` - 查詢等級福利
   - `POST /members/:id/add-points` - 增加點數
   - `POST /members/:id/deduct-points` - 扣除點數

4. **上傳 API 補充**
   - `POST /uploads/multiple` - 上傳多個檔案
   - `GET /uploads/my-files` - 查詢我的檔案
   - `GET /uploads/statistics` - 檔案統計
   - `PATCH /uploads/:id` - 更新檔案資訊
   - `POST /uploads/:id/download` - 增加下載次數
   - `POST /uploads/cleanup` - 清理臨時檔案

5. **通知 API 補充**
   - `POST /notifications/send-by-template` - 使用模板發送
   - `POST /notifications/send-bulk` - 批量發送
   - `PATCH /notifications/:id/status` - 更新通知狀態

6. **分類 API 補充**
   - `GET /product-categories/tree` - 查詢分類樹
   - `GET /product-categories/roots` - 查詢根分類

---

## User Review Required

> [!IMPORTANT]
> **型別定義策略**
> 
> 後端提供了 TypeScript 型別定義檔案在 `agri-backend/docs/05-frontend-integration/typescript-types/`,包含:
> - `auth.types.ts`
> - `product.types.ts`
> - `order.types.ts`
> - `payment.types.ts`
> - `notification.types.ts`
> - `common.types.ts`
> 
> 目前前端的 `types.ts` 有部分型別定義與後端不完全一致。建議:
> 1. **保持前端現有 `types.ts`** - 因為已經在使用中
> 2. **參考後端型別補充缺失定義** - 特別是 Payment 和 Refund
> 3. **逐步對齊** - 未來有時間時可以完全對齊後端型別
> 
> 請確認這個策略是否合適?

> [!WARNING]
> **API 端點命名差異**
> 
> 注意到前端 `upload.ts` 使用的端點是 `/upload/*`,但後端文檔顯示是 `/uploads/*` (有 s)。需要確認:
> 1. 後端實際使用的端點是哪一個?
> 2. 前端是否需要調整?

---

## Proposed Changes

### 核心 API 模組

#### [NEW] [`payment.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/payment.ts)

新建支付 API 服務檔案,包含:
- `create(orderId: string)` - 建立支付訂單 (返回 HTML 表單需自動提交)
- `getById(id: string)` - 查詢支付記錄
- `getByOrderId(orderId: string)` - 根據訂單 ID 查詢支付

**特殊處理**: `POST /payment/create` 會返回 HTML 表單,需要在前端自動提交到 ECPay

#### [NEW] [`refund.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/refund.ts)

新建退款 API 服務檔案,包含:
- `create(data: CreateRefundDto)` - 建立退款申請
- `approve(id: string, data?: ApproveRefundDto)` - 審核通過退款 (管理員)
- `reject(id: string, reason: string)` - 拒絕退款 (管理員)
- `getById(id: string)` - 查詢退款記錄
- `getByOrderId(orderId: string)` - 根據訂單 ID 查詢退款

---

#### [MODIFY] [`types.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/types.ts)

補充缺失的型別定義:

**新增 Payment 相關型別**:
```typescript
// 支付狀態
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUNDED = 'PARTIAL_REFUNDED',
}

// 支付方式
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  ATM = 'ATM',
  CVS = 'CVS',
  COD = 'COD',
}

// 支付實體
export interface Payment {
  id: string
  orderId: string
  paymentNumber: string
  status: PaymentStatus
  amount: number
  paymentMethod: PaymentMethod
  ecpayTradeNo?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}
```

**新增 Refund 相關型別**:
```typescript
// 退款狀態
export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

// 退款實體
export interface Refund {
  id: string
  paymentId: string
  orderId: string
  refundNumber: string
  amount: number
  reason: string
  status: RefundStatus
  rejectedReason?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

// 建立退款 DTO
export interface CreateRefundDto {
  orderId: string
  amount: number
  reason: string
}

// 審核退款 DTO
export interface ApproveRefundDto {
  note?: string
}
```

**新增會員點數操作 DTO**:
```typescript
export interface AddPointsDto {
  points: number
  reason: string
}

export interface DeductPointsDto {
  points: number
  reason: string
}
```

---

#### [MODIFY] [`members.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/members.ts)

補充缺失的會員 API 方法:
- `getLevelBenefits(level: MemberLevel)` - 查詢等級福利
- `addPoints(id: string, data: AddPointsDto)` - 增加點數 (管理員)
- `deductPoints(id: string, data: DeductPointsDto)` - 扣除點數 (管理員)

---

#### [MODIFY] [`upload.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/upload.ts)

補充缺失的上傳 API 方法:
- `uploadMultiple(files: File[], type?: string)` - 上傳多個檔案
- `getMyFiles()` - 查詢我的檔案
- `getStatistics()` - 檔案統計 (管理員)
- `update(id: string, data: UpdateUploadDto)` - 更新檔案資訊
- `incrementDownload(id: string)` - 增加下載次數
- `cleanup()` - 清理臨時檔案 (管理員)

**注意**: 需要確認端點是 `/upload` 還是 `/uploads`

---

#### [MODIFY] [`notifications.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/notifications.ts)

補充缺失的通知 API 方法:
- `sendByTemplate(data: SendByTemplateDto)` - 使用模板發送 (管理員)
- `sendBulk(data: SendBulkDto)` - 批量發送 (管理員)
- `updateStatus(id: string, status: NotificationStatus)` - 更新通知狀態 (管理員)

---

#### [MODIFY] [`categories.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/categories.ts)

補充缺失的分類 API 方法:
- `getTree()` - 查詢分類樹狀結構
- `getRoots()` - 查詢根分類列表

---

#### [MODIFY] [`index.ts`](file:///Users/linyixiu/agri/agri-dashboard/src/api/index.ts)

更新導出列表:
```typescript
export { paymentApi } from './payment'
export { refundApi } from './refund'
```

---

## Verification Plan

### 自動化測試

目前專案中沒有發現針對 API 層的單元測試。因此驗證將主要依賴:

1. **TypeScript 編譯檢查**
   ```bash
   cd /Users/linyixiu/agri/agri-dashboard
   npm run type-check  # 或 tsc --noEmit
   ```
   確保所有型別定義正確,無編譯錯誤。

2. **ESLint 檢查**
   ```bash
   npm run lint
   ```
   確保程式碼符合專案規範。

### 手動驗證

由於這些 API 需要實際的後端服務和認證,建議以下驗證步驟:

1. **編譯驗證**
   - 執行 TypeScript 編譯,確保無型別錯誤
   - 檢查所有 import/export 是否正確

2. **程式碼審查**
   - 確認新增的 API 方法遵循現有模式
   - 檢查型別定義完整性
   - 驗證錯誤處理一致性

3. **整合測試建議** (需要用戶協助)
   - 在開發環境啟動後端服務
   - 建立測試頁面調用新 API
   - 驗證支付流程 (特別是 HTML 表單自動提交)
   - 測試退款申請流程

### 驗證清單

- [ ] TypeScript 編譯無錯誤
- [ ] ESLint 檢查通過
- [ ] 所有新增 API 方法有完整的 TypeScript 型別注解
- [ ] 響應格式處理與現有 API 一致
- [ ] 錯誤處理與現有 API 一致
- [ ] `index.ts` 正確導出所有新 API

---

## 注意事項

### 一致性要點

1. **響應處理**: 統一使用 `response.data.data` 提取數據
2. **錯誤處理**: 依賴 `apiClient` 的攔截器,無需在各 API 方法中重複處理
3. **命名規範**: 方法名使用駝峰式,遵循 RESTful 慣例
4. **型別定義**: 所有方法都要有完整的型別注解
5. **註解**: 每個方法都應該有 JSDoc 註解說明用途

### UUID vs 整數 ID

根據後端文檔:
- **使用 UUID**: User, Member, Order, Payment, Refund, Notification
- **使用整數 ID**: Product, ProductCategory, Upload

確保參數型別正確使用 `string` 或 `number`。

---

**計劃建立時間**: 2025-12-05  
**預計完成時間**: 1-2 小時
