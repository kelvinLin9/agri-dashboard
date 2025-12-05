# Dashboard 統計圖表使用指南

## 🚀 啟動 Dashboard

```bash
cd dashboard
npm run dev
```

訪問: `http://localhost:5173/dashboard`

---

## 📊 功能介紹

### 1. 總覽卡片（6張）

顯示關鍵業務指標：
- **今日銷售額** - 含趨勢對比
- **今日訂單數** - 含趨勢對比
- **總產品數**
- **低庫存產品** - 警示用
- **待處理訂單** - 需處理
- **今日新增會員** - 含趨勢對比

### 2. 銷售趨勢圖

雙軸折線圖顯示最近 30 天：
- 左軸：銷售金額（元）
- 右軸：訂單數量（筆）

### 3. 訂單狀態分佈圖

環形圖顯示訂單狀態占比：
- 待付款、已付款、處理中
- 配送中、已送達、已完成、已取消

---

## 🔄 刷新數據

點擊右上角「刷新全部」按鈕，系統會：
1. 重新獲取所有統計數據
2. 更新所有圖表
3. 顯示最後更新時間

---

## 🎨 組件重用

### PieChart

```vue
<PieChart
  :data="pieData"
  :is-donut="true"
  height="400px"
/>
```

### BarChart

```vue
<BarChart
  :data="barData"
  :horizontal="true"
  height="400px"
/>
```

### OverviewCard

```vue
<OverviewCard
  title="標題"
  :value="12345"
  icon="i-heroicons-banknotes"
  color="green"
  :trend="trendData"
/>
```

---

## ⚙️ 自訂配置

### 修改數據範圍

編輯 `src/api/dashboard.ts`:

```typescript
// 修改訂單抓取數量（目前 100 筆）
ordersApi.getAll({ page: 1, limit: 200 })

// 修改日期範圍（目前 30 天）
async getSalesTrend(days: number = 60)
```

### 修改卡片顏色

編輯 `src/pages/dashboard/index.vue`:

```vue
<OverviewCard
  color="purple"  <!-- 改成其他顏色 -->
/>
```

可用顏色: green, blue, purple, yellow, orange, red, indigo

---

## 🐛 常見問題

### Q: 圖表不顯示？
A: 檢查是否有訂單數據，可先執行後端 seeder

### Q: 數據不準確？
A: 前端計算基於最近 100 筆訂單，建議未來改用後端 API

### Q: 趨勢不顯示？
A: 需要有昨日數據才能計算趨勢

---

## 📝 開發注意事項

1. **數據限制**: 目前限制 100 筆訂單、1000 個產品
2. **性能**: 大數據量時建議改用後端統計 API
3. **快取**: 目前無快取機制，每次刷新都重新計算
4. **自動刷新**: 目前需手動刷新，可加入定時器

---

## 🔮 未來規劃

- [ ] 後端統計 API 整合
- [ ] 數據快取機制
- [ ] 自動刷新（每 5 分鐘）
- [ ] 日期範圍選擇器
- [ ] 更多圖表類型
- [ ] 數據導出功能
