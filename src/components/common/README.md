# Common Components 通用組件

此目錄包含可重用的通用組件，用於提高代碼一致性並減少重複。

---

## 組件列表

### 🔴 高優先級
1. [ConfirmDialog](#confirmdialog) - 確認對話框
2. [StatusBadge](#statusbadge) - 狀態徽章
3. [EmptyState](#emptystate) - 空狀態顯示

### 🟡 中優先級
4. [SearchBox](#searchbox) - 搜尋框
5. [LoadingButton](#loadingbutton) - 載入按鈕
6. [ActionMenu](#actionmenu) - 操作選單

### 🟢 低優先級
7. [FormField](#formfield) - 表單欄位
8. [Pagination](#pagination) - 分頁組件
9. [FilterBar](#filterbar) - 篩選條
10. [ImagePreview](#imagepreview) - 圖片預覽
11. [FileUploader](#fileuploader) - 檔案上傳
12. [DateRangePicker](#daterangepicker) - 日期範圍
13. [DataTable](#datatable) - 數據表格

**總計**: 13 個組件 ✅ **全部完成**

---

# ActionMenu 組件

統一的操作選單組件，常用於表格行操作（查看/編輯/刪除）。

## 功能特性

✅ 預設操作：查看/編輯/刪除  
✅ 支援自訂操作  
✅ 自動分隔線  
✅ 可控制顯示/隱藏操作  
✅ 支援禁用狀態  
✅ 顏色標記（危險操作為紅色）  

## 基本用法

```vue
<template>
  <ActionMenu
    @view="handleView"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import ActionMenu from '@/components/common/ActionMenu.vue'

const handleView = () => {
  console.log('查看')
}

const handleEdit = () => {
  console.log('編輯')
}

const handleDelete = () => {
  console.log('刪除')
}
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `actions` | `ActionItem[]` | `[]` | 自訂操作列表 |
| `showView` | `boolean` | `true` | 是否顯示查看 |
| `showEdit` | `boolean` | `true` | 是否顯示編輯 |
| `showDelete` | `boolean` | `true` | 是否顯示刪除 |
| `triggerIcon` | `string` | `'i-heroicons-ellipsis-vertical'` | 觸發按鈕圖標 |
| `triggerLabel` | `string` | - | 觸發按鈕文字 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 按鈕大小 |
| `color` | `string` | `'neutral'` | 按鈕顏色 |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'ghost'` | 按鈕樣式 |

### ActionItem 介面

```typescript
interface ActionItem {
  label: string                    // 操作名稱
  icon?: string                    // 圖標
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info' | 'neutral'
  click?: () => void              // 點擊處理函數
  disabled?: boolean              // 是否禁用
}
```

## Events

| 事件 | 參數 | 說明 |
|------|------|------|
| `view` | - | 點擊查看 |
| `edit` | - | 點擊編輯 |
| `delete` | - | 點擊刪除 |

## 使用範例

### 1. 基本操作選單

```vue
<ActionMenu
  @view="viewItem"
  @edit="editItem"
  @delete="deleteItem"
/>
```

### 2. 只顯示部分操作

```vue
<!-- 只有編輯和刪除 -->
<ActionMenu
  :show-view="false"
  @edit="editItem"
  @delete="deleteItem"
/>

<!-- 只有查看 -->
<ActionMenu
  :show-edit="false"
  :show-delete="false"
  @view="viewItem"
/>
```

### 3. 添加自訂操作

```vue
<ActionMenu
  :actions="customActions"
  @view="viewItem"
  @edit="editItem"
  @delete="deleteItem"
/>

<script setup lang="ts">
import type { ActionItem } from '@/components/common/ActionMenu.vue'

const customActions: ActionItem[] = [
  {
    label: '複製',
    icon: 'i-heroicons-document-duplicate',
    click: () => duplicateItem(),
  },
  {
    label: '下載',
    icon: 'i-heroicons-arrow-down-tray',
    click: () => downloadItem(),
  },
]
</script>
```

### 4. 在表格中使用

```vue
<UTable :data="products" :columns="columns" />

<script setup lang="ts">
import { h } from 'vue'
import ActionMenu from '@/components/common/ActionMenu.vue'

const columns = [
  { key: 'name', label: '名稱' },
  { key: 'price', label: '價格' },
  {
    key: 'actions',
    label: '操作',
    cell: ({ row }) => h(ActionMenu, {
      onView: () => viewProduct(row.original),
      onEdit: () => editProduct(row.original),
      onDelete: () => confirmDelete(row.original),
    })
  }
]
</script>
```

### 5. 條件性顯示操作

```vue
<ActionMenu
  :show-edit="canEdit"
  :show-delete="canDelete"
  @view="viewItem"
  @edit="editItem"
  @delete="deleteItem"
/>

<script setup lang="ts">
const canEdit = computed(() => user.hasPermission('edit'))
const canDelete = computed(() => user.hasPermission('delete'))
</script>
```

### 6. 帶禁用狀態的自訂操作

```vue
<ActionMenu
  :actions="[
    {
      label: '發布',
      icon: 'i-heroicons-paper-airplane',
      click: publishItem,
      disabled: !canPublish,
      color: 'success'
    },
    {
      label: '封存',
      icon: 'i-heroicons-archive-box',
      click: archiveItem,
      color: 'warning'
    }
  ]"
  @edit="editItem"
/>
```

### 7. 自訂觸發按鈕

```vue
<!-- 使用文字標籤 -->
<ActionMenu
  trigger-label="操作"
  trigger-icon="i-heroicons-chevron-down"
  @view="viewItem"
  @edit="editItem"
/>

<!-- 實心按鈕 -->
<ActionMenu
  trigger-label="更多"
  variant="solid"
  color="primary"
  @view="viewItem"
  @edit="editItem"
/>
```

### 8. 完整表格範例

```vue
<template>
  <UCard>
    <UTable
      :data="products"
      :columns="columns"
      :loading="isLoading"
    />
  </UCard>
</template>

<script setup lang="ts">
import { h } from 'vue'
import ActionMenu from '@/components/common/ActionMenu.vue'
import type { ActionItem } from '@/components/common/ActionMenu.vue'

const products = ref([])
const isLoading = ref(false)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '產品名稱' },
  { key: 'price', label: '價格' },
  { key: 'stock', label: '庫存' },
  {
    key: 'actions',
    label: '操作',
    cell: ({ row }) => {
      const customActions: ActionItem[] = []
      
      // 根據庫存狀態添加操作
      if (row.original.stock === 0) {
        customActions.push({
          label: '補貨',
          icon: 'i-heroicons-arrow-up-tray',
          click: () => restockProduct(row.original),
          color: 'warning'
        })
      }
      
      return h(ActionMenu, {
        actions: customActions,
        onView: () => viewProduct(row.original),
        onEdit: () => editProduct(row.original),
        onDelete: () => confirmDeleteProduct(row.original),
      })
    }
  }
]

const viewProduct = (product: any) => {
  console.log('查看產品:', product)
}

const editProduct = (product: any) => {
  console.log('編輯產品:', product)
}

const confirmDeleteProduct = (product: any) => {
  console.log('刪除產品:', product)
}

const restockProduct = (product: any) => {
  console.log('補貨:', product)
}
</script>
```

## 操作順序

預設操作順序：
1. 查看 (View)
2. 編輯 (Edit)
3. --- 分隔線 ---
4. 自訂操作
5. --- 分隔線 ---
6. 刪除 (Delete) ⚠️ 危險操作總是放最後

## 遷移指南

### 舊寫法

```vue
<div class="flex items-center gap-2">
  <UTooltip text="查看">
    <UButton icon="i-heroicons-eye" size="sm" @click="view" />
  </UTooltip>
  <UTooltip text="編輯">
    <UButton icon="i-heroicons-pencil" size="sm" @click="edit" />
  </UTooltip>
  <UTooltip text="刪除">
    <UButton icon="i-heroicons-trash" size="sm" color="error" @click="del" />
  </UTooltip>
</div>
```

### 新寫法

```vue
<ActionMenu
  @view="view"
  @edit="edit"
  @delete="del"
/>
```

**好處**：
- ✅ 節省空間（下拉選單）
- ✅ 統一操作樣式
- ✅ 自動分隔和顏色
- ✅ 代碼更簡潔

## 可應用頁面

- ✅ `/pages/products/index.vue` - 產品操作
- ✅ `/pages/orders/index.vue` - 訂單操作
- ✅ `/pages/members/index.vue` - 會員操作
- ✅ `/pages/categories/index.vue` - 分類操作
- ✅ `/pages/uploads/index.vue` - 檔案操作

**預計減少重複代碼：~80 行**

---

# LoadingButton 組件

整合 loading 狀態的按鈕組件，自動管理禁用狀態和載入動畫。

## 功能特性

✅ 自動禁用（loading 時）  
✅ 可自訂 loading 文字和圖標  
✅ 支援所有 UButton 屬性  
✅ 防止重複點擊  
✅ 簡化代碼  

## 基本用法

```vue
<template>
  <LoadingButton
    label="儲存"
    :loading="isSaving"
    @click="handleSave"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoadingButton from '@/components/common/LoadingButton.vue'

const isSaving = ref(false)

const handleSave = async () => {
  isSaving.value = true
  try {
    await api.save()
  } finally {
    isSaving.value = false
  }
}
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `label` | `string` | - | 按鈕文字 |
| `icon` | `string` | - | 按鈕圖標 |
| `loadingText` | `string` | - | loading 時的文字 |
| `loadingIcon` | `string` | - | loading 時的圖標 |
| `loading` | `boolean` | `false` | loading 狀態 |
| `disabled` | `boolean` | `false` | 禁用狀態 |
| `color` | `string` | `'primary'` | 按鈕顏色 |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | 按鈕樣式 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 按鈕大小 |
| `block` | `boolean` | `false` | 是否佔滿寬度 |

## Events

| 事件 | 參數 | 說明 |
|------|------|------|
| `click` | `MouseEvent` | 點擊按鈕（loading 時不觸發） |

## Slots

| 插槽 | 說明 |
|------|------|
| `default` | 自訂按鈕內容 |

## 使用範例

### 1. 基本 loading 按鈕

```vue
<LoadingButton
  label="提交"
  :loading="isSubmitting"
  @click="handleSubmit"
/>
```

### 2. 自訂 loading 文字

```vue
<LoadingButton
  label="上傳"
  loading-text="上傳中..."
  :loading="isUploading"
  @click="handleUpload"
/>
```

### 3. 帶圖標

```vue
<LoadingButton
  label="發布"
  icon="i-heroicons-paper-airplane"
  loading-icon="i-heroicons-clock"
  loading-text="發布中..."
  :loading="isPublishing"
  @click="handlePublish"
/>
```

### 4. 不同顏色和樣式

```vue
<!-- 成功按鈕 -->
<LoadingButton
  label="確認"
  color="success"
  :loading="isConfirming"
  @click="handleConfirm"
/>

<!-- 危險按鈕 -->
<LoadingButton
  label="刪除"
  color="error"
  variant="soft"
  :loading="isDeleting"
  @click="handleDelete"
/>
```

### 5. 大小變化

```vue
<LoadingButton
  label="儲存"
  size="lg"
  :loading="isSaving"
  @click="handleSave"
/>
```

### 6. 區塊按鈕

```vue
<LoadingButton
  label="登入"
  block
  :loading="isLoggingIn"
  @click="handleLogin"
/>
```

### 7. 完整表單範例

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <UFormField label="名稱">
      <UInput v-model="form.name" />
    </UFormField>
    
    <UFormField label="描述">
      <UTextarea v-model="form.description" />
    </UFormField>
    
    <div class="flex gap-3 mt-6">
      <UButton
        label="取消"
        variant="outline"
        @click="handleCancel"
      />
      <LoadingButton
        label="儲存"
        loading-text="儲存中..."
        :loading="isSaving"
        @click="handleSubmit"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
const isSaving = ref(false)

const handleSubmit = async () => {
  isSaving.value = true
  try {
    await api.createItem(form.value)
    toast.success('儲存成功')
  } catch (error) {
    toast.error('儲存失敗')
  } finally {
    isSaving.value = false
  }
}
</script>
```

### 8. 使用插槽

```vue
<LoadingButton :loading="isProcessing" @click="handleProcess">
  <template v-if="!isProcessing">
    <UIcon name="i-heroicons-sparkles" />
    <span class="ml-2">處理數據</span>
  </template>
  <template v-else>
    <span>處理中...</span>
  </template>
</LoadingButton>
```

## 遷移指南

### 舊寫法

```vue
<UButton
  label="儲存"
  :loading="isSaving"
  :disabled="isSaving"
  @click="handleSave"
/>
```

### 新寫法

```vue
<LoadingButton
  label="儲存"
  :loading="isSaving"
  @click="handleSave"
/>
```

**好處**：
- ✅ 自動禁用（無需手動設定 `disabled`）
- ✅ 防止重複點擊
- ✅ 代碼更簡潔

## 可應用場景

- ✅ 表單提交按鈕
- ✅ 資料儲存按鈕
- ✅ 檔案上傳按鈕
- ✅ API 請求按鈕
- ✅ 所有需要 loading 狀態的按鈕

**預計減少重複代碼：~50 行**

---

# SearchBox 組件

統一的搜尋框組件，內建防抖功能，避免過多 API 請求。

## 功能特性

✅ 內建防抖機制（預設 500ms）  
✅ 自動清除按鈕  
✅ Enter 鍵即時搜尋  
✅ Loading 狀態顯示  
✅ 可自訂圖標和大小  
✅ 支援插槽擴展  

## 基本用法

```vue
<template>
  <SearchBox
    v-model="searchQuery"
    placeholder="搜尋產品..."
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchBox from '@/components/common/SearchBox.vue'

const searchQuery = ref('')

const handleSearch = (value: string) => {
  console.log('搜尋:', value)
  // 執行搜尋操作
}
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 搜尋值（使用 v-model） |
| `placeholder` | `string` | `'搜尋...'` | 佔位符文字 |
| `icon` | `string` | `'i-heroicons-magnifying-glass'` | 圖標 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 輸入框大小 |
| `debounce` | `number` | `500` | 防抖延遲（毫秒），設為 0 則停用 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 載入狀態 |
| `clearable` | `boolean` | `true` | 是否顯示清除按鈕 |
| `immediate` | `boolean` | `false` | 是否立即觸發搜尋（初始化時） |

## Events

| 事件 | 參數 | 說明 |
|------|------|------|
| `update:modelValue` | `string` | modelValue 更新（即時） |
| `search` | `string` | 搜尋觸發（防抖後） |
| `clear` | - | 點擊清除按鈕 |
| `enter` | `string` | 按下 Enter 鍵 |

## Slots

| 插槽 | 說明 |
|------|------|
| `leading` | 左側插槽（替換預設圖標） |
| `trailing` | 右側插槽（無搜尋值時顯示） |

## 使用範例

### 1. 基本搜尋

```vue
<SearchBox
  v-model="searchQuery"
  @search="fetchProducts"
/>
```

### 2. 自訂防抖時間

```vue
<!-- 300ms 防抖 -->
<SearchBox
  v-model="searchQuery"
  :debounce="300"
  @search="handleSearch"
/>

<!-- 即時搜尋（無防抖） -->
<SearchBox
  v-model="searchQuery"
  :debounce="0"
  @search="handleSearch"
/>
```

### 3. 帶 Loading 狀態

```vue
<template>
  <SearchBox
    v-model="searchQuery"
    :loading="isSearching"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
const isSearching = ref(false)

const handleSearch = async (value: string) => {
  isSearching.value = true
  try {
    await api.search(value)
  } finally {
    isSearching.value = false
  }
}
</script>
```

### 4. 大尺寸搜尋框

```vue
<SearchBox
  v-model="searchQuery"
  size="lg"
  placeholder="搜尋所有產品..."
  @search="handleSearch"
/>
```

### 5. 立即搜尋（初始化）

```vue
<!-- 組件載入時立即搜尋 -->
<SearchBox
  v-model="searchQuery"
  immediate
  @search="handleSearch"
/>
```

### 6. Enter 鍵觸發

```vue
<SearchBox
  v-model="searchQuery"
  placeholder="輸入關鍵字後按 Enter"
  @enter="handleQuickSearch"
  @search="handleDebouncedSearch"
/>

<script setup>
const handleQuickSearch = (value: string) => {
  // Enter 鍵立即搜尋
  console.log('快速搜尋:', value)
}

const handleDebouncedSearch = (value: string) => {
  // 防抖後搜尋
  console.log('防抖搜尋:', value)
}
</script>
```

### 7. 清除事件處理

```vue
<SearchBox
  v-model="searchQuery"
  @search="handleSearch"
  @clear="handleClear"
/>

<script setup>
const handleClear = () => {
  // 清除時額外處理
  resetFilters()
  fetchAllData()
}
</script>
```

### 8. 使用自訂插槽

```vue
<SearchBox v-model="searchQuery" @search="handleSearch">
  <template #leading>
    <UIcon name="i-heroicons-funnel" class="text-gray-400" />
  </template>
  
  <template #trailing>
    <UButton
      icon="i-heroicons-adjustments-horizontal"
      size="xs"
      variant="ghost"
      @click="openFilters"
    />
  </template>
</SearchBox>
```

### 9. 完整範例（產品列表頁）

```vue
<template>
  <div class="space-y-4">
    <!-- 搜尋框 -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <SearchBox
            v-model="searchQuery"
            placeholder="搜尋產品名稱或描述..."
            size="lg"
            :loading="isLoading"
            @search="handleSearch"
          />
        </div>
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryOptions"
          placeholder="選擇分類"
        />
      </div>
    </UCard>

    <!-- 結果顯示 -->
    <UCard>
      <div v-if="searchQuery" class="mb-4 text-sm text-gray-600">
        找到 {{ products.length }} 個符合「{{ searchQuery }}」的結果
      </div>
      
      <UTable :data="products" :loading="isLoading" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchBox from '@/components/common/SearchBox.vue'

const searchQuery = ref('')
const isLoading = ref(false)
const products = ref([])

const handleSearch = async (value: string) => {
  isLoading.value = true
  try {
    const response = await api.searchProducts({
      query: value,
      category: selectedCategory.value
    })
    products.value = response.data
  } finally {
    isLoading.value = false
  }
}
</script>
```

## 防抖機制說明

```typescript
// 用戶輸入: "a" → "ap" → "app" → "apple"
// 
// 時間軸:
// 0ms:    輸入 "a"    → 開始 500ms 計時
// 100ms:  輸入 "ap"   → 重置計時
// 200ms:  輸入 "app"  → 重置計時
// 300ms:  輸入 "apple" → 重置計時
// 800ms:  觸發搜尋("apple") ✓
//
// 結果: 只發送 1 次 API 請求，而非 4 次
```

## 遷移指南

### 舊寫法（手動防抖）

```vue
<script setup>
const searchQuery = ref('')

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fetchData()
    }, 500)
  }
})()
</script>

<template>
  <UInput
    v-model="searchQuery"
    icon="i-heroicons-magnifying-glass"
    placeholder="搜尋..."
    @input="debouncedSearch"
  />
</template>
```

### 新寫法（使用組件）

```vue
<template>
  <SearchBox
    v-model="searchQuery"
    @search="fetchData"
  />
</template>
```

**節省代碼：~10 行 → 1 行** 📉

## 可應用頁面

- ✅ `/pages/products/index.vue` - 產品搜尋
- ✅ `/pages/orders/index.vue` - 訂單搜尋
- ✅ `/pages/members/index.vue` - 會員搜尋
- ✅ `/pages/uploads/index.vue` - 檔案搜尋

**預計減少重複代碼：~40 行**

---

# EmptyState 組件

統一的空狀態顯示組件，用於列表無數據時的友好提示。

## 功能特性

✅ 可自訂圖標、標題、描述  
✅ 支援操作按鈕  
✅ 支援自訂內容插槽  
✅ 支援多個操作按鈕  
✅ 響應式設計  
✅ 暗黑模式支援  

## 基本用法

```vue
<template>
  <div v-if="items.length === 0">
    <EmptyState
      icon="i-heroicons-folder-open"
      title="尚無數據"
      description="開始添加您的第一個項目"
      action-label="新增項目"
      @action="openCreateModal"
    />
  </div>
</template>

<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue'
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `icon` | `string` | `'i-heroicons-inbox'` | 圖標名稱 |
| `iconSize` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'xl'` | 圖標大小 |
| `title` | `string` | - | 標題文字 |
| `description` | `string` | - | 描述文字 |
| `actionLabel` | `string` | - | 操作按鈕文字 |
| `actionIcon` | `string` | - | 操作按鈕圖標 |
| `actionColor` | `string` | `'primary'` | 操作按鈕顏色 |
| `actionVariant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'solid'` | 操作按鈕樣式 |
| `showBackground` | `boolean` | `true` | 是否顯示圖標背景 |

## Events

| 事件 | 參數 | 說明 |
|------|------|------|
| `action` | - | 點擊操作按鈕 |

## Slots

| 插槽 | 說明 |
|------|------|
| `default` | 自訂內容（顯示在描述和按鈕之間） |
| `actions` | 自訂操作按鈕區域 |

## 使用範例

### 1. 基本空狀態

```vue
<EmptyState
  title="尚無訂單"
  description="目前沒有任何訂單記錄"
/>
```

### 2. 帶操作按鈕

```vue
<EmptyState
  icon="i-heroicons-shopping-cart"
  title="購物車是空的"
  description="還沒有添加任何商品到購物車"
  action-label="開始購物"
  action-icon="i-heroicons-plus"
  @action="goToProducts"
/>
```

### 3. 自訂圖標大小

```vue
<EmptyState
  icon="i-heroicons-photo"
  icon-size="lg"
  title="尚無圖片"
  description="點擊下方按鈕上傳您的第一張圖片"
  action-label="上傳圖片"
  @action="openUploadModal"
/>
```

### 4. 使用自訂內容插槽

```vue
<EmptyState
  icon="i-heroicons-users"
  title="邀請團隊成員"
  description="與您的團隊一起協作"
>
  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-sm">
    <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
      <li>✓ 無限團隊成員</li>
      <li>✓ 即時協作</li>
      <li>✓ 權限管理</li>
    </ul>
  </div>
</EmptyState>
```

### 5. 多個操作按鈕

```vue
<EmptyState
  icon="i-heroicons-document"
  title="尚無文件"
  description="創建新文件或導入現有文件"
>
  <template #actions>
    <UButton
      label="創建文件"
      icon="i-heroicons-plus"
      @click="createDocument"
    />
    <UButton
      label="導入文件"
      icon="i-heroicons-arrow-up-tray"
      variant="outline"
      @click="importDocument"
    />
  </template>
</EmptyState>
```

### 6. 搜尋無結果

```vue
<EmptyState
  icon="i-heroicons-magnifying-glass"
  title="找不到符合的結果"
  :description="`沒有找到「${searchQuery}」的相關內容`"
  action-label="清除搜尋"
  action-variant="outline"
  @action="clearSearch"
/>
```

### 7. 無背景圖標

```vue
<EmptyState
  icon="i-heroicons-bell-slash"
  :show-background="false"
  title="沒有新通知"
  description="您已閱讀所有通知"
/>
```

### 8. 在表格中使用

```vue
<UTable
  :data="items"
  :columns="columns"
  :empty-state="{
    icon: 'i-heroicons-inbox',
    label: '尚無數據'
  }"
/>

<!-- 或自訂空狀態 -->
<UCard>
  <UTable
    v-if="items.length > 0"
    :data="items"
    :columns="columns"
  />
  <EmptyState
    v-else
    icon="i-heroicons-shopping-bag"
    title="尚無產品"
    description="開始添加您的第一個產品"
    action-label="新增產品"
    @action="openCreateModal"
  />
</UCard>
```

## 常用圖標

| 場景 | 推薦圖標 |
|------|---------|
| 一般列表 | `i-heroicons-inbox` |
| 文件/資料夾 | `i-heroicons-folder-open` |
| 搜尋無結果 | `i-heroicons-magnifying-glass` |
| 購物車 | `i-heroicons-shopping-cart` |
| 通知 | `i-heroicons-bell-slash` |
| 圖片/相簿 | `i-heroicons-photo` |
| 用戶/成員 | `i-heroicons-users` |
| 文檔 | `i-heroicons-document` |
| 產品 | `i-heroicons-shopping-bag` |
| 訂單 | `i-heroicons-clipboard-document-list` |

## 遷移指南

### 舊寫法（重複代碼）

```vue
<div v-else-if="uploads.length === 0" class="text-center py-12">
  <UIcon name="i-heroicons-photo" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
  <p class="text-gray-500">尚無上傳檔案</p>
</div>
```

### 新寫法（使用組件）

```vue
<EmptyState
  v-else-if="uploads.length === 0"
  icon="i-heroicons-photo"
  title="尚無上傳檔案"
/>
```

**好處**：
- ✅ 一致的樣式和間距
- ✅ 響應式設計
- ✅ 暗黑模式支援
- ✅ 更易維護

## 可應用頁面

- ✅ `/pages/products/index.vue` - 無產品時
- ✅ `/pages/orders/index.vue` - 無訂單時
- ✅ `/pages/members/index.vue` - 無會員時
- ✅ `/pages/categories/index.vue` - 無分類時
- ✅ `/pages/uploads/index.vue` - 無檔案時
- ✅ `/pages/notifications/index.vue` - 無通知時

**預計減少重複代碼：~60 行**

---

# StatusBadge 組件

統一的狀態徽章組件，自動根據狀態類型顯示對應的顏色和文字。

## 功能特性

✅ 支援 6 種狀態類型：訂單、支付、退款、會員、通知、產品  
✅ 自動顏色映射  
✅ 自動文字轉換（英文 → 中文）  
✅ 可自訂大小和樣式  
✅ TypeScript 類型安全  

## 基本用法

```vue
<template>
  <StatusBadge :status="order.status" type="order" />
  <!-- 自動顯示: 「已完成」(綠色) -->
</template>

<script setup lang="ts">
import StatusBadge from '@/components/common/StatusBadge.vue'
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `status` | `string` | **必填** | 狀態值（英文） |
| `type` | `'order' \| 'payment' \| 'refund' \| 'member' \| 'notification' \| 'product'` | **必填** | 狀態類型 |
| `variant` | `'solid' \| 'soft' \| 'outline'` | `'soft'` | 徽章樣式 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 徽章大小 |

## 支援的狀態

### Order (訂單)
| Status | 顯示 | 顏色 |
|--------|------|------|
| `pending` | 待處理 | 灰色 |
| `paid` | 已付款 | 藍色 |
| `processing` | 處理中 | 藍色 |
| `shipping` | 配送中 | 紫色 |
| `delivered` | 已送達 | 綠色 |
| `completed` | 已完成 | 綠色 |
| `cancelled` | 已取消 | 灰色 |
| `refunded` | 已退款 | 橙色 |

### Payment (支付)
| Status | 顯示 | 顏色 |
|--------|------|------|
| `pending` | 待支付 | 橙色 |
| `processing` | 處理中 | 藍色 |
| `completed` | 已完成 | 綠色 |
| `failed` | 失敗 | 紅色 |
| `refunded` | 已退款 | 橙色 |

### Refund (退款)
| Status | 顯示 | 顏色 |
|--------|------|------|
| `pending` | 待審核 | 橙色 |
| `approved` | 已批准 | 綠色 |
| `rejected` | 已拒絕 | 紅色 |
| `processing` | 處理中 | 藍色 |
| `completed` | 已完成 | 綠色 |

### Member (會員等級)
| Status | 顯示 | 顏色 |
|--------|------|------|
| `bronze` | 銅牌會員 | 橙色 |
| `silver` | 銀牌會員 | 灰色 |
| `gold` | 金牌會員 | 金色 |
| `platinum` | 白金會員 | 紫色 |
| `diamond` | 鑽石會員 | 藍色 |

### Notification (通知)
| Status | 顯示 | 顏色 |
|--------|------|------|
| `pending` | 待發送 | 灰色 |
| `sent` | 已發送 | 藍色 |
| `delivered` | 已送達 | 藍色 |
| `read` | 已讀 | 綠色 |
| `failed` | 失敗 | 紅色 |

### Product (產品)
| Status | 顯示 | 顏色 |
|--------|------|------|
| `active` | 上架中 | 綠色 |
| `inactive` | 已下架 | 灰色 |
| `out_of_stock` | 缺貨 | 紅色 |
| `draft` | 草稿 | 灰色 |

## 使用範例

### 1. 訂單狀態

```vue
<StatusBadge :status="order.status" type="order" />
```

### 2. 支付狀態

```vue
<StatusBadge :status="payment.status" type="payment" size="md" />
```

### 3. 會員等級

```vue
<StatusBadge :status="member.level" type="member" variant="solid" />
```

### 4. 在表格中使用

```vue
<UTable :data="orders" :columns="columns" />

<script setup lang="ts">
const columns = [
  // ... other columns
  {
    id: 'status',
    header: '狀態',
    cell: ({ row }) => h(StatusBadge, {
      status: row.original.status,
      type: 'order'
    })
  }
]
</script>
```

### 5. 自訂大小和樣式

```vue
<!-- 大尺寸 + 實心樣式 -->
<StatusBadge 
  :status="order.status" 
  type="order" 
  size="lg"
  variant="solid"
/>

<!-- 小尺寸 + 外框樣式 -->
<StatusBadge 
  :status="notification.status" 
  type="notification" 
  size="xs"
  variant="outline"
/>
```

## 遷移指南

### 舊寫法（重複代碼）

```vue
<!-- 每個頁面都要寫狀態映射 -->
<script setup>
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'pending': 'neutral',
    'completed': 'success',
    'cancelled': 'error',
  }
  return colors[status] || 'neutral'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'pending': '待處理',
    'completed': '已完成',
    'cancelled': '已取消',
  }
  return labels[status] || status
}
</script>

<template>
  <UBadge :color="getStatusColor(order.status)">
    {{ getStatusLabel(order.status) }}
  </UBadge>
</template>
```

### 新寫法（使用組件）

```vue
<template>
  <StatusBadge :status="order.status" type="order" />
</template>
```

**節省代碼：~20 行 → 1 行** 📉

## 可應用頁面

- ✅ `/pages/orders/index.vue` - 訂單狀態、支付狀態、退款狀態
- ✅ `/pages/members/index.vue` - 會員等級
- ✅ `/pages/notifications/index.vue` - 通知狀態
- ✅ `/pages/products/index.vue` - 產品狀態

**預計減少重複代碼：~80 行**

---

# ConfirmDialog 組件

可重用的確認對話框組件，用於需要用戶確認的操作（如刪除、重要操作等）。

## 功能特性

✅ 支援 4 種類型：`danger` | `warning` | `info` | `success`  
✅ 自動配色圖標  
✅ 自定義標題和訊息  
✅ 自定義按鈕文字  
✅ Loading 狀態支援  
✅ 危險操作警告框  
✅ 自定義內容插槽  

## 基本用法

```vue
<template>
  <!-- 在 template 中使用 -->
  <ConfirmDialog
    v-model:open="isDeleteModalOpen"
    title="確認刪除"
    message="確定要刪除此項目嗎？"
    type="danger"
    :loading="isDeleting"
    @confirm="handleDelete"
  />
  
  <!-- 觸發按鈕 -->
  <UButton @click="isDeleteModalOpen = true">刪除</UButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

const handleDelete = async () => {
  isDeleting.value = true
  try {
    // 執行刪除操作
    await api.delete(...)
    isDeleteModalOpen.value = false
  } finally {
    isDeleting.value = false
  }
}
</script>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 控制 Modal 顯示/隱藏（使用 v-model:open） |
| `title` | `string` | `'確認操作'` | 對話框標題 |
| `message` | `string` | **必填** | 確認訊息內容（支援 HTML） |
| `type` | `'danger' \| 'warning' \| 'info' \| 'success'` | `'info'` | 對話框類型 |
| `confirmLabel` | `string` | `'確認'` | 確認按鈕文字 |
| `cancelLabel` | `string` | `'取消'` | 取消按鈕文字 |
| `loading` | `boolean` | `false` | 確認按鈕 loading 狀態 |
| `showWarning` | `boolean` | `true` | 是否顯示警告框（僅 danger 類型） |
| `warningMessage` | `string` | `'此操作無法復原...'` | 自定義警告訊息 |

## Events

| 事件 | 參數 | 說明 |
|------|------|------|
| `update:open` | `boolean` | Modal 開關狀態變更 |
| `confirm` | - | 點擊確認按鈕 |
| `cancel` | - | 點擊取消按鈕 |

## Slots

| 插槽 | 說明 |
|------|------|
| `content` | 自定義額外內容（顯示在訊息下方） |

## 類型說明

### `danger` (危險操作)
- 🔴 紅色主題
- 用於：刪除、清空、重置等不可逆操作
- 自動顯示警告框

### `warning` (警告)
- 🟠 橙色主題
- 用於：需要注意但可恢復的操作

### `info` (資訊)
- 🔵 藍色主題
- 用於：一般確認操作

### `success` (成功)
- 🟢 綠色主題
- 用於：正面操作的確認

## 使用範例

### 1. 刪除確認（Danger）

```vue
<ConfirmDialog
  v-model:open="isDeleteModalOpen"
  title="確認刪除"
  message="確定要刪除產品 <strong>{{ product.name }}</strong> 嗎？"
  type="danger"
  confirm-label="確認刪除"
  :loading="isDeleting"
  @confirm="deleteProduct"
/>
```

### 2. 批量操作警告（Warning）

```vue
<ConfirmDialog
  v-model:open="isBatchModalOpen"
  title="批量操作"
  message="即將修改 {{ selectedCount }} 個項目的狀態"
  type="warning"
  @confirm="handleBatchUpdate"
/>
```

### 3. 一般確認（Info）

```vue
<ConfirmDialog
  v-model:open="isPublishModalOpen"
  title="發布文章"
  message="確定要發布這篇文章嗎？"
  type="info"
  confirm-label="發布"
  @confirm="publishArticle"
/>
```

### 4. 自定義警告訊息

```vue
<ConfirmDialog
  v-model:open="isDeleteModalOpen"
  title="刪除分類"
  message="確定要刪除此分類嗎？"
  type="danger"
  warning-message="⚠️ 此分類包含 5 個子分類，刪除後所有子分類將移至根層級"
  @confirm="handleDelete"
/>
```

### 5. 使用自定義內容插槽

```vue
<ConfirmDialog
  v-model:open="isModalOpen"
  title="清空購物車"
  message="確定要清空購物車嗎？"
  type="warning"
  @confirm="clearCart"
>
  <template #content>
    <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        購物車中有 {{ cartItems.length }} 個商品，總金額 NT$ {{ totalAmount }}
      </p>
    </div>
  </template>
</ConfirmDialog>
```

## 遷移指南

### 舊寫法（重複代碼）

```vue
<!-- 每個頁面都要寫一次 -->
<UModal v-model:open="isDeleteModalOpen">
  <template #content>
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">確認刪除</h3>
      </template>
      <p class="text-gray-600">確定要刪除此項目嗎？</p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="取消" @click="isDeleteModalOpen = false" />
          <UButton 
            label="確認刪除" 
            color="error" 
            :loading="isDeleting"
            @click="handleDelete" 
          />
        </div>
      </template>
    </UCard>
  </template>
</UModal>
```

### 新寫法（使用組件）

```vue
<ConfirmDialog
  v-model:open="isDeleteModalOpen"
  title="確認刪除"
  message="確定要刪除此項目嗎？"
  type="danger"
  :loading="isDeleting"
  @confirm="handleDelete"
/>
```

**節省代碼：~20 行 → 7 行** 📉

## 可應用頁面

- ✅ `/pages/products/index.vue` - 刪除產品
- ✅ `/pages/members/index.vue` - 刪除會員
- ✅ `/pages/orders/index.vue` - 取消訂單
- ✅ `/pages/categories/index.vue` - 刪除分類
- ✅ `/pages/uploads/index.vue` - 刪除檔案
- ✅ `/pages/notifications/index.vue` - 刪除通知

**預計減少重複代碼：~120 行**
