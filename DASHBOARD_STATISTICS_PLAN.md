# Dashboard 統計圖表完整規劃文件

**版本**: v2.0  
**最後更新**: 2024-11-30  
**狀態**: 規劃中 / 部分實作

---

## 📊 概述

本文件規劃前端 Dashboard 頁面的統計圖表功能，使用 ECharts 實現多種數據可視化圖表。

### 🎯 核心目標

1. **完整的業務數據統計視圖** - 涵蓋銷售、訂單、會員、產品等核心指標
2. **多樣化圖表類型** - 折線圖、柱狀圖、餅圖、儀表盤、表格列表等
3. **響應式設計** - 適配桌面、平板、手機等不同螢幕尺寸
4. **可重用的圖表組件架構** - 統一的組件設計，易於維護和擴展
5. **數據自動刷新機制** - 定時更新 + 手動刷新
6. **優秀的用戶體驗** - Loading 狀態、錯誤處理、空數據提示

### 🌟 新增目標 (v2.0)

7. **數據品質保證** - 基於優化後的 Seeder 確保真實、一致的數據
8. **深色模式支援** - 完整的淺色/深色主題切換
9. **數據導出功能** - 支援圖表導出為圖片、Excel
10. **即時數據更新** - WebSocket 推送關鍵指標變化

---

## 📈 圖表類型規劃

### 1. 總覽卡片（Overview Cards）⭕ 未開始

**位置**: Dashboard 頂部  
**數據來源**: `GET /api/dashboard/overview`  
**更新頻率**: 30 秒自動刷新

#### 核心指標

| 卡片 | 指標 | 數據源 | 顏色主題 | 圖標 |
|------|------|--------|----------|------|
| 今日銷售額 | `todaySales` | 今日已完成訂單總金額 | 綠色 | `i-heroicons-banknotes` |
| 今日訂單數 | `todayOrders` | 今日新增訂單數量 | 藍色 | `i-heroicons-shopping-cart` |
| 今日新增會員 | `todayMembers` | 今日註冊會員數 | 紫色 | `i-heroicons-user-plus` |
| 總產品數 | `totalProducts` | 系統中產品總數 | 橙色 | `i-heroicons-cube` |
| 低庫存產品 | `lowStockProducts` | 庫存低於閾值的產品數 | 黃色 | `i-heroicons-exclamation-triangle` |
| 待處理訂單 | `pendingOrders` | 狀態為 pending 的訂單數 | 紅色 | `i-heroicons-clock` |

#### 視覺設計

- **佈局**: Grid 佈局，桌面每行 3 個，平板每行 2 個，手機每行 1 個
- **卡片內容**: 
  - 主標題（指標名稱）
  - 大數字（當前值）
  - 趨勢指示器（↑ 3.5% 或 ↓ 1.2%）
  - 對比說明（vs. 昨日）
- **交互**: 點擊卡片可跳轉到詳細頁面（可選）

#### API 設計

```typescript
GET /api/dashboard/overview

Response: {
  todayS ales: number;
  todayOrders: number;
  todayMembers: number;
  totalProducts: number;
  lowStockProducts: number;
outOfStockProducts: number;
  pendingOrders: number;
  
  // 趨勢數據（與昨日對比）
  trends: {
    sales: { value: number; percentage: number; direction: 'up' | 'down' | 'stable' };
    orders: { value: number; percentage: number; direction: 'up' | 'down' | 'stable' };
    members: { value: number; percentage: number; direction: 'up' | 'down' | 'stable' };
  };
}
```

---

### 2. 銷售趨勢圖（Sales Trend Chart）⭕ 未開始

**圖表類型**: 雙軸折線圖（Dual-axis Line Chart）  
**數據來源**: `GET /api/orders/stats/daily`  
**時間範圍選擇**: 7天 / 30天 / 3個月 / 自訂

#### API 設計

```typescript
GET /api/orders/stats/daily?startDate=2024-11-01&endDate=2024-11-30&groupBy=day

Query Parameters:
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)
- groupBy: 'day' | 'week' | 'month' (預設 'day')

Response: {
  data: Array<{
    date: string;              // "2024-11-28"
    amount: number;             // 銷售金額
    orderCount: number;         // 訂單數量
    completedOrderCount: number; // 已完成訂單數
  }>;
}
```

#### ECharts 配置重點

- **X軸**: 時間軸，自動根據日期範圍調整格式
- **Y軸**: 
  - 左側：銷售金額（元）
  - 右側：訂單數量（筆）
- **Series**:
  - 銷售金額折線（平滑曲線，漸變填充）
  - 訂單數量折線（虛線）
- **Tooltip**: 懸停顯示詳細數據
- **DataZoom**: 支援區域縮放

#### 數據品質說明

由於 Seeder 優化，訂單數據分佈更真實：
- 65% 訂單為已完成狀態
- 最近 7 天每天都have訂單
- 近期訂單數量呈增長趨勢

---

### 3. 訂單狀態分佈（Order Status Distribution）⭕ 未開始

**圖表類型**: 環形圖（Doughnut Chart）  
**數據來源**: `GET /api/orders/stats/status`

#### API 設計

```typescript
GET /api/orders/stats/status?period=30

Query Parameters:
- period: number (天數，預設 30)

Response: {
  data: Array<{
    status: 'pending' | 'paid' | 'processing' | 'shipping' | 'delivered' | 'completed' | 'cancelled';
    count: number;
    percentage: number;
    amount: number;  // 該狀態訂單總金額
  }>;
  total: number;
}
```

#### 狀態顏色映射

```typescript
const statusColors = {
  pending: '#E6A23C',     // 黃色 - 待付款
  paid: '#409EFF',        // 藍色 - 已付款
  processing: '#67C23A',  // 綠色 - 處理中
  shipping: '#FF9500',    // 橙色 - 配送中
  delivered: '#5AC8FA',   // 淺藍 - 已送達
  completed: '#34C759',   // 深綠 - 已完成
  cancelled: '#FF3B30',   // 紅色 - 已取消
};
```

#### 預期數據分佈（基於 Seeder）

- Completed: ~65%
- Delivered: ~15%
- Shipping: ~5%
- Paid: ~5%
- Processing: ~3%
- Pending: ~2%
- Cancelled: ~5%

---

### 4. 會員等級分佈（Member Level Distribution）⭕ 未開始

**圖表類型**: 水平柱狀圖（Horizontal Bar Chart）  
**數據來源**: `GET /api/members/stats/level-distribution`

#### API 設計

```typescript
GET /api/members/stats/level-distribution

Response: {
  data: Array<{
    level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    count: number;
    percentage: number;
    totalSpent: number;  // 該等級會員總消費
  }>;
}
```

#### 等級顏色映射

```typescript
const levelColors = {
  BRONZE: '#CD7F32',    // 銅色
  SILVER: '#C0C0C0',    // 銀色
  GOLD: '#FFD700',      // 金色
  PLATINUM: '#E5E4E2',  // 白金色
  DIAMOND: '#B9F2FF',   // 鑽石藍
};
```

---

### 5. 熱銷商品排行（Top Products）⭕ 未開始

**圖表類型**: 橫向柱狀圖 + 產品圖片  
**數據來源**: `GET /api/products/stats/top-sales`

#### API 設計

```typescript
GET /api/products/stats/top-sales?limit=10&period=30&sortBy=amount

Query Parameters:
- limit: number (預設 10)
- period: number (天數，預設 30)
- sortBy: 'amount' | 'quantity' (依金額或數量排序)

Response: {
  data: Array<{
    productId: number;
    productName: string;
    productImage: string;
    salesCount: number;      // 銷售數量
    salesAmount: number;     // 銷售金額
    category: string;
  }>;
}
```

#### 視覺設計

- 左側：產品縮圖 + 名稱
- 中間：橫向柱狀圖
- 右側：銷售金額/數量數字

---

### 6. 產品庫存狀態（Product Stock Status）⭕ 未開始

**圖表類型**: 儀表盤（Gauge） + 狀態卡片  
**數據來源**: `GET /api/products/stats/stock-status`

#### API 設計

```typescript
GET /api/products/stats/stock-status

Response: {
  totalProducts: number;
  lowStockProducts: number;      // 庫存低於閾值
  outOfStockProducts: number;     // 缺貨（庫存 = 0）
  normalStockProducts: number;
  stockHealthScore: number;       // 0-100 分的庫存健康度
}
```

#### 視覺設計

- **主儀表盤**: 顯示庫存健康度（0-100）
  - 0-30: 危險（紅色）
  - 30-60: 警告（黃色）
  - 60-100: 正常（綠色）
- **狀態卡片**: 分別顯示正常/低庫存/缺貨數量

#### 預期數據（基於 Seeder）

- 缺貨產品: 5%
- 低庫存產品: 10%
- 正常庫存產品: 85%

---

### 7. 月度銷售對比（Monthly Sales Comparison）⭕ 未開始

**圖表類型**: 分組柱狀圖（Grouped Bar Chart）  
**數據來源**: `GET /api/orders/stats/monthly`

#### API 設計

```typescript
GET /api/orders/stats/monthly?months=6

Query Parameters:
- months: number (查詢幾個月，預設 6)

Response: {
  data: Array<{
    month: string;           // "2024-11"
    amount: number;
    orderCount: number;
    completedOrderCount: number;
    avgOrderValue: number;    // 平均訂單金額
    growth: {
      amount: number;         // 金額環比增長率 (%)
      orderCount: number;     // 訂單數環比增長率 (%)
    };
  }>;
}
```

---

### 8. 支付方式分佈（Payment Method Distribution）⭕ 未開始

**圖表類型**: 餅圖  
**數據來源**: `GET /api/orders/stats/payment-methods`

#### API 設計

```typescript
GET /api/orders/stats/payment-methods?period=30

Response: {
  data: Array<{
    method: 'credit_card' | 'atm' | 'cvs' | 'cash' | 'other';
    methodName: string;      // 顯示名稱
    count: number;
    amount: number;
    percentage: number;
  }>;
}
```

---

### 9. 最近訂單列表（Recent Orders）⭕ 未開始

**圖表類型**: 表格列表  
**數據來源**: `GET /api/orders?limit=10&sort=createdAt:desc`

#### 視覺設計

- 訂單編號
- 會員名稱
- 訂單金額
- 訂單狀態（帶顏色標籤）
- 建立時間
- 快速操作按鈕（查看詳情）

---

### 10. 庫存警報列表（Stock Alerts）⭕ 未開始

**圖表類型**: 表格列表  
**數據來源**: `GET /api/products?filter=low-stock&limit=10`

#### 視覺設計

- 產品圖片
- 產品名稱
- 當前庫存
- 庫存閾值
- 警報等級（缺貨/低庫存）
- 快速操作（補貨）

---

## 🏗️ 技術架構

### 依賴套件

```json
{
  "dependencies": {
    "echarts": "^5.5.0",
    "vue-echarts": "^6.6.0",
    "@nuxt/ui": "latest",
    "pinia": "^2.1.7",
    "dayjs": "^1.11.10"
  }
}
```

### 目錄結構

```
dashboard/src/
├── components/
│   └── charts/
│       ├── LineChart.vue          # 折線圖組件 ⭕
│       ├── BarChart.vue           # 柱狀圖組件 ⭕
│       ├── PieChart.vue           # 餅圖組件 ⭕
│       ├── GaugeChart.vue         # 儀表盤組件 ⭕
│       ├── DoughnutChart.vue      # 環形圖組件 ⭕
│       ├── OverviewCard.vue       # 總覽卡片組件 ⭕
│       ├── ChartContainer.vue     # 圖表容器 ⭕
│       └── DataTable.vue          # 數據表格組件 ⭕
├── api/
│   ├── dashboard.ts               # Dashboard API ⭕
│   └── types/
│       └── dashboard.ts           # API 類型定義 ⭕
├── stores/
│   └── dashboard.ts               # Dashboard Store ⭕
├── composables/
│   ├── useDashboard.ts            # Dashboard 邏輯 ⭕
│   ├── useChart.ts                # 圖表通用邏輯 ⭕
│   └── useAutoRefresh.ts          # 自動刷新邏輯 ⭕
└── pages/
    └── dashboard/
        └── index.vue              # Dashboard 主頁面 ⭕
```

### 狀態圖示說明
- ✅ 已完成
- 🔄 進行中
- ⭕ 未開始
- ❌ 已取消

---

## 📡 完整 API 規範

### 統一響應格式

所有 API 遵循統一的響應格式：

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### 錯誤處理

```typescript
interface ApiError {
  status: 'error';
  message: string;
  code: string;  // 'VALIDATION_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR'
  details?: Record<string, any>;
}
```

---

## 🎨 組件設計詳細

### 1. ChartContainer.vue ⭕

**功能**: 統一的圖表容器，處理 loading、error、empty 狀態

```vue
<template>
  <UCard :ui="{ body: 'p-0' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <div class="flex items-center gap-2">
          <UButton 
            v-if="refreshable"
            icon="i-heroicons-arrow-path" 
            size="xs" 
            color="gray" 
            variant="ghost"
            :loading="loading"
            @click="$emit('refresh')"
          />
          <slot name="actions" />
        </div>
      </div>
    </template>

    <div :style="{ height }">
      <!-- Loading 狀態 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        <span class="ml-2">載入中...</span>
      </div>

      <!-- Error 狀態 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full text-red-500">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mb-2" />
        <p>{{ error }}</p>
        <UButton size="sm" @click="$emit('retry')">重試</UButton>
      </div>

      <!-- Empty 狀態 -->
      <div v-else-if="isEmpty" class="flex flex-col items-center justify-center h-full text-gray-500">
        <slot name="empty">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-2" />
          <p>暫無數據</p>
        </slot>
      </div>

      <!-- 圖表內容 -->
      <div v-else class="h-full p-4">
        <slot />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  height?: string;
  refreshable?: boolean;
}>();

defineEmits<{
  refresh: [];
  retry: [];
}>();
</script>
```

---

### 2. OverviewCard.vue ⭕

```vue
<template>
  <UCard>
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ title }}</p>
        <p class="text-3xl font-bold mt-2">{{ formattedValue }}</p>
        
        <!-- 趨勢指示器 -->
        <div v-if="trend" class="flex items-center mt-2 text-sm">
          <UIcon 
            :name="trend.direction === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
            :class="trend.direction === 'up' ? 'text-green-500' : 'text-red-500'"
          />
          <span :class="trend.direction === 'up' ? 'text-green-500' : 'text-red-500'" class="ml-1">
            {{ Math.abs(trend.percentage) }}%
          </span>
          <span class="text-gray-500 ml-1">vs. 昨日</span>
        </div>
      </div>

      <!-- 圖標 -->
      <div :class="`bg-${color}-100 dark:bg-${color}-900/20 p-3 rounded-lg`">
        <UIcon :name="icon" :class="`text-${color}-600 w-6 h-6`" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  trend?: {
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
  formatter?: (value: number | string) => string;
}>();

const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value);
  }
  return props.value.toLocaleString();
});
</script>
```

---

### 3. LineChart.vue ⭕

```vue
<template>
  <VChart :option="chartOption" :autoresize="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const props = defineProps<{
  data: { date: string; value: number }[];
  seriesName?: string;
  color?: string;
}>();

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.data.map(d => d.date),
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: props.seriesName || '數值',
      type: 'line',
      smooth: true,
      data: props.data.map(d => d.value),
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: props.color || '#409EFF' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
          ],
        },
      },
    },
  ],
}));
</script>
```

---

## 📱 頁面佈局設計

### Dashboard 主頁面

```vue
<template>
  <div class="p-6 space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Dashboard 總覽</h1>
      <div class="flex items-center gap-2">
        <UBadge v-if="lastUpdate" color="gray" variant="subtle">
          最後更新: {{ formatTime(lastUpdate) }}
        </UBadge>
        <UButton
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="refreshAll"
        >
          刷新全部
        </UButton>
      </div>
    </div>

    <!-- 總覽卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <OverviewCard
        v-for="card in overviewCards"
        :key="card.title"
        v-bind="card"
      />
    </div>

    <!-- 圖表區域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 銷售趨勢 -->
      <ChartContainer
        title="銷售趨勢"
        :loading="charts.salesTrend.loading"
        :error="charts.salesTrend.error"
        :is-empty="!charts.salesTrend.data.length"
        refreshable
        @refresh="fetchSalesTrend"
      >
        <LineChart :data="charts.salesTrend.data" />
      </ChartContainer>

      <!-- 訂單狀態分佈 -->
      <ChartContainer
        title="訂單狀態分佈"
        :loading="charts.orderStatus.loading"
        :error="charts.orderStatus.error"
        :is-empty="!charts.orderStatus.data.length"
      >
        <PieChart :data="charts.orderStatus.data" />
      </ChartContainer>

      <!-- 其他圖表... -->
    </div>

    <!-- 最近訂單與庫存警報 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近訂單列表 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">最近訂單</h3>
       </template>
        <DataTable :data="recentOrders" />
      </UCard>

      <!-- 庫存警報 -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">庫存警報</h3>
        </template>
        <DataTable :data="stockAlerts" />
      </UCard>
    </div>
  </div>
</template>
```

---

## 🔄 數據管理 (Pinia Store)

### Dashboard Store

```typescript
// stores/dashboard.ts
import { defineStore } from 'pinia';
import { dashboardApi } from '@/api/dashboard';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    overview: null as DashboardOverview | null,
    salesTrend: [] as SalesTrendData[],
    orderStatus: [] as OrderStatusData[],
    // ...
    lastUpdate: null as Date | null,
    loading: false,
    autoRefreshInterval: null as number | null,
  }),

  actions: {
    async fetchOverview() {
      try {
        const data = await dashboardApi.getOverview();
        this.overview = data;
        this.lastUpdate = new Date();
      } catch (error) {
        console.error('Failed to fetch overview:', error);
        throw error;
      }
    },

    async fetchSalesTrend(params?: { startDate: string; endDate: string }) {
      try {
        const data = await dashboardApi.getSalesTrend(params);
        this.salesTrend = data;
      } catch (error) {
        console.error('Failed to fetch sales trend:', error);
        throw error;
      }
    },

    async refreshAll() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchOverview(),
          this.fetchSalesTrend(),
          this.fetchOrderStatus(),
          // ...
        ]);
      } finally {
        this.loading = false;
      }
    },

    startAutoRefresh(interval = 300000) { // 5 分鐘
      this.stopAutoRefresh();
      this.autoRefreshInterval = window.setInterval(() => {
        this.refreshAll();
      }, interval);
    },

    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
      }
    },
  },
});
```

---

## ⚡ 性能優化策略

### 1. 數據緩存

```typescript
// composables/useCache.ts
import { ref } from 'vue';

export function useCache<T>(key: string, ttl = 300000) { // 5 分鐘
  const cache = ref<{ data: T | null; timestamp: number }>({
    data: null,
    timestamp: 0,
  });

  function get(): T | null {
    if (Date.now() - cache.value.timestamp < ttl) {
      return cache.value.data;
    }
    return null;
  }

  function set(data: T) {
    cache.value = {
      data,
      timestamp: Date.now(),
    };
  }

  function clear() {
    cache.value = { data: null, timestamp: 0 };
  }

  return { get, set, clear };
}
```

### 2. 請求防抖

```typescript
// composables/useDebounce.ts
import { ref } from 'vue';

export function useDebouncedRef<T>(initialValue: T, delay = 300) {
  const value = ref(initialValue);
  let timeout: number;

  function setValue(newValue: T) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      value.value = newValue;
    }, delay);
  }

  return { value, setValue };
}
```

### 3. 圖表懶加載

```typescript
// 使用 IntersectionObserver
import { ref, onMounted, onUnmounted } from 'vue';

export function useLazyLoad(callback: () => void) {
  const target = ref<HTMLElement>();
  let observer: IntersectionObserver;

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback();
        observer.disconnect();
      }
    });

    if (target.value) {
      observer.observe(target.value);
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return { target };
}
```

---

## 🧪 測試計畫

### 單元測試

```typescript
// components/charts/__tests__/LineChart.spec.ts
import { mount } from '@vue/test-utils';
import LineChart from '../LineChart.vue';

describe('LineChart', () => {
  it('renders correctly with data', () => {
    const wrapper = mount(LineChart, {
      props: {
        data: [
          { date: '2024-11-28', value: 1000 },
          { date: '2024-11-29', value: 1200 },
        ],
      },
    });

    expect(wrapper.find('.echarts').exists()).toBe(true);
  });

  it('updates when data changes', async () => {
    const wrapper = mount(LineChart, {
      props: {
        data: [{ date: '2024-11-28', value: 1000 }],
      },
    });

    await wrapper.setProps({
      data: [
        { date: '2024-11-28', value: 1000 },
        { date: '2024-11-29', value: 1200 },
      ],
    });

    // 驗證圖表更新
  });
});
```

### E2E 測試

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads and displays overview cards', async ({ page }) => {
  await page.goto('/dashboard');

  // 等待總覽卡片載入
  await expect(page.locator('[data-testid="overview-card"]')).toHaveCount(6);

  // 驗證銷售趨勢圖表顯示
  await expect(page.locator('[data-testid="sales-trend-chart"]')).toBeVisible();

  // 驗證刷新按鈕功能
  await page.click('[data-testid="refresh-button"]');
  await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
});
```

---

## 🚀 部署清單

### 環境變數

```env
# .env
VITE_API_URL=https://api.example.com
VITE_DASHBOARD_REFRESH_INTERVAL=300000  # 5 分鐘
VITE_ENABLE_AUTO_REFRESH=true
```

### 構建優化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts': ['echarts', 'vue-echarts'],
        },
      },
    },
  },
});
```

---

## 📋 實作步驟清單

### Phase 1: 基礎架構 ⭕
- [ ] 安裝依賴 (echarts, vue-echarts)
- [ ] 建立 API 模組
- [ ] 建立 Pinia Store
- [ ] 建立 Composables

### Phase 2: 基礎組件 ⭕
- [ ] ChartContainer.vue
- [ ] OverviewCard.vue
- [ ] LineChart.vue
- [ ] BarChart.vue
- [ ] PieChart.vue
- [ ] DoughnutChart.vue
- [ ] GaugeChart.vue
- [ ] DataTable.vue

### Phase 3: 後端 API ⭕
- [ ] Dashboard Overview API
- [ ] Sales Trend API
- [ ] Order Status API
- [ ] Product Stats API
- [ ] Member Stats API

### Phase 4: Dashboard 頁面 ⭕
- [ ] 頁面佈局
- [ ] 整合總覽卡片
- [ ] 整合所有圖表
- [ ] 實作響應式設計
- [ ] 實作數據刷新
- [ ] 實作錯誤處理

### Phase 5: 優化與測試 ⭕
- [ ] 性能優化
- [ ] 單元測試
- [ ] E2E 測試
- [ ] 可訪問性優化
- [ ] 深色模式支援

---

## 📊 數據品質保障

### Seeder 優化成果

經過 Seeder 優化，現在的假資料具有以下特點：

1. **訂單狀態真實分佈**:
   - 65% 已完成訂單
   - 不會出現大量「待付款」訂單的不合理情況

2. **會員統計一致性**:
   - 會員的 `totalSpent` 與實際訂單金額完全一致
   - 會員的 `orderCount` 與實際訂單數量完全一致

3. **時間分佈合理**:
   - 最近 7 天每天都有訂單
   - 訂單數量呈現自然增長趨勢
   - 今日訂單數量符合預期（至少 5-10 筆）

4. **庫存狀態真實**:
   - 5% 產品缺貨
   - 10% 產品低庫存
   - 85% 產品庫存正常

這些優化確保 Dashboard 展示的統計資料更接近真實業務場景，有助於測試和演示。

---

## 🎯 下一步行動

### 立即執行 (P0)
1. 建立後端 Dashboard API 端點
2. 實作基礎圖表組件
3. 建立 Dashboard 主頁面

### 近期執行 (P1)
4. 實作自動刷新機制
5. 添加深色模式支援
6. 實作響應式設計

### 長期規劃 (P2)
7. 數據導出功能
8. 自訂儀表板佈局
9. WebSocket 即時更新
10. 預測分析功能

---

**文件維護**: 請隨著實作進度更新各階段的完成狀態 (✅/🔄/⭕)
