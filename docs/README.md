# 📚 文檔索引

這裡集中管理所有 Agri Dashboard 專案的開發文檔。

---

## 🎯 快速導航

### 新手必讀

1. [**會話總結**](./session_summary.md) ⭐
   - 專案當前狀態
   - 今日完成事項
   - 快速重啟指南

2. [**前端開發路線圖**](./frontend_next_steps.md) ⭐
   - 詳細的開發計劃
   - 優先級分級
   - 程式碼範例

3. [**實作進度追蹤**](./IMPLEMENTATION_PROGRESS.md) 📝
   - 即時更新的任務清單
   - 實作日誌
   - 進度看板

---

## 📖 API 整合文檔

### 完成記錄

- [**API 整合 Walkthrough**](./walkthrough.md)
  - 所有變更詳情
  - 使用範例
  - 驗證結果

- [**API 覆蓋率檢查表**](./api_coverage_checklist.md)
  - 100% 端點對照驗證
  - 前後端 API 映射

- [**實作計劃**](./implementation_plan.md)
  - 技術規劃
  - 變更說明

### 任務追蹤

- [**任務清單**](./task.md)
  - API 整合任務分解
  - 進度追蹤

---

## 🔗 外部資源

### 後端文檔

- [後端 API 總覽](../agri-backend/docs/05-frontend-integration/API_OVERVIEW.md)
- [前端快速上手指南](../agri-backend/docs/05-frontend-integration/00-QUICK_START_FOR_FRONTEND.md)
- [TypeScript 型別定義](../agri-backend/docs/05-frontend-integration/typescript-types/)

### 前端程式碼

- [API 統一導出](../src/api/index.ts)
- [型別定義](../src/api/types.ts)
- [API Client](../src/api/apiClient.ts)

---

## 📂 文檔結構

```
docs/
├── README.md                      # 📚 本文件 - 文檔索引
├── IMPLEMENTATION_PROGRESS.md     # 📝 實作進度追蹤 (持續更新)
├── session_summary.md             # 🗂️ 會話總結
├── frontend_next_steps.md         # 🎯 前端開發路線圖
├── api_coverage_checklist.md      # ✅ API 覆蓋率檢查表
├── walkthrough.md                 # 📖 API 整合詳細記錄
├── implementation_plan.md         # 📋 實作計劃
└── task.md                        # ✓ 任務清單
```

---

## 🚀 如何使用這些文檔

### 第一次開始開發

1. 閱讀 [**會話總結**](./session_summary.md) 了解專案現狀
2. 查看 [**前端開發路線圖**](./frontend_next_steps.md) 選擇要做的功能
3. 在 [**實作進度追蹤**](./IMPLEMENTATION_PROGRESS.md) 中更新狀態

### 繼續進行開發

1. 打開 [**實作進度追蹤**](./IMPLEMENTATION_PROGRESS.md)
2. 查看當前進行中的任務
3. 完成後更新任務狀態和實作筆記
4. 提交時參考文檔中的 Git 提交建議

### 查找 API 資訊

1. 在 [**API 覆蓋率檢查表**](./api_coverage_checklist.md) 找到對應端點
2. 在 [**Walkthrough**](./walkthrough.md) 查看使用範例
3. 參考後端的 [API_OVERVIEW.md](../agri-backend/docs/05-frontend-integration/API_OVERVIEW.md) 查看詳細規格

---

## 📝 文檔更新規範

### 應該更新的時機

- ✅ 完成一個功能時 → 更新 `IMPLEMENTATION_PROGRESS.md`
- ✅ 發現新問題時 → 在相應文檔中記錄
- ✅ 修改計劃時 → 更新 `frontend_next_steps.md`
- ✅ 每日結束時 → 更新實作日誌

### 更新格式

```markdown
### [日期]

**今日目標**: 完成訂單頁面支付查詢功能

**完成事項**:
- ✅ 實作支付資訊 API 調用
- ✅ 建立支付詳情 Modal
- ✅ 測試支付狀態顯示

**遇到的問題**:
- API 回應格式與預期不符

**解決方案**:
- 調整型別定義並更新 apiClient

**明日計劃**:
- 實作退款申請功能
```

---

## 🎯 重要提醒

### P0 優先級 (立即開始)
1. 訂單頁面 - 支付/退款整合
2. 會員頁面 - 點數操作
3. 產品頁面 - 分類樹

### 需要後端支援
- ⚠️ 支付列表 API (`GET /payment`)
- ⚠️ 退款列表 API (`GET /refund`)

---

**建立日期**: 2025-12-05  
**最後更新**: 2025-12-05 09:19  
**維護者**: Development Team
