# API 整合完成任務

## 目標
分析現有前端 API 結構,規劃並實作所有缺失的後端 API 整合,確保整個專案的一致性。

## 任務清單

### 研究階段
- [x] 查看後端提供的前端整合文檔
- [x] 檢查現有的前端 API 資料夾結構
- [x] 分析現有 API 實作模式
  - [x] `apiClient.ts` - 基礎配置和攔截器
  - [x] `auth.ts` - 認證 API
  - [x] `products.ts` - 產品 API
  - [x] `orders.ts` - 訂單 API
  - [x] `members.ts` - 會員 API
  - [x] `notifications.ts` - 通知 API
  - [x] `categories.ts` - 分類 API
  - [x] `upload.ts` - 上傳 API
- [x] 檢查後端提供的 TypeScript 型別定義
- [x] 對照後端 API 文檔,識別缺失的 API

### 規劃階段
- [x] 建立實作計劃文檔
- [x] 定義缺失的 TypeScript 型別
- [x] 規劃新增的 API 服務檔案
- [x] 用戶確認:一切以後端為準

### 實作階段
- [x] 更新 `types.ts` 加入缺失的型別定義
- [x] 實作 Payment API (`payment.ts`)
- [x] 實作 Refund API (`refund.ts`)
- [x] 補充 Upload API 的缺失功能 (修正端點為 `/uploads/*`)
- [x] 補充 Members API 的缺失功能
- [x] 補充 Notifications API 的缺失功能
- [x] 補充 Categories API 的缺失功能
- [x] 更新 `index.ts` 導出新的 API

### 驗證階段
- [x] 檢查所有新增的 API 是否符合現有模式
- [x] 確認型別定義的完整性
- [x] TypeScript 編譯檢查通過
- [x] 清理未使用的 import
- [x] 建立 walkthrough 文檔

