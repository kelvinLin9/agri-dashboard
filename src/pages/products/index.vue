<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">產品管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理系統產品資料</p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        size="lg"
        label="新增產品"
        @click="openCreateModal"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總產品數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ total }}
            </p>
          </div>
          <UIcon name="i-heroicons-cube" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">上架中</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {{ activeCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">低庫存</p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {{ lowStockCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">精選產品</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {{ featuredCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-star" class="w-8 h-8 text-purple-500" />
        </div>
      </UCard>
    </div>

    <!-- Filters and Search -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div class="md:col-span-1">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="搜尋產品（名稱、SKU）"
            size="lg"
            @input="debouncedSearch"
          />
        </div>

        <!-- Category Filter -->
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryOptions"
          placeholder="選擇分類"
          size="lg"
          @change="handleFilterChange"
        />

        <!-- Status Filter -->
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          placeholder="選擇狀態"
          size="lg"
          @change="handleFilterChange"
        />
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2">
        <UBadge v-if="search" color="info" variant="soft">
          搜尋: {{ search }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="search = ''; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedCategory" color="info" variant="soft">
          分類: {{ getCategoryLabel(selectedCategory) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedCategory = null; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedStatus" color="info" variant="soft">
          狀態: {{ getStatusLabel(selectedStatus) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedStatus = null; handleFilterChange()"
          />
        </UBadge>
        <UButton
          v-if="hasActiveFilters"
          label="清除全部"
          size="sm"
          color="neutral"
          variant="ghost"
          @click="clearFilters"
        />
      </div>
    </UCard>

    <!-- Products Table -->
    <UCard>
      <UTable
        :data="products"
        :columns="columns"
        :loading="isLoading"
        :empty-state="{ icon: 'i-heroicons-cube-20-solid', label: '沒有產品資料' }"
      >
      </UTable>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          顯示 {{ (page - 1) * limit + 1 }} 到
          {{ Math.min(page * limit, total) }}
          筆，共 {{ total }} 筆
        </div>
        <UPagination
          v-model:page="page"
          :items-per-page="limit"
          :total="total"
          @update:page="fetchProducts"
        />
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingProduct ? '編輯產品' : '新增產品' }}
          </h3>
        </template>

        <form @submit.prevent="saveProduct" class="space-y-4">
          <div class="h-[60vh] overflow-y-auto p-1">
            <UTabs :items="tabItems" class="w-full">
              <!-- Basic Info Tab -->
              <template #item="{ item }">
                <div v-if="item.key === 'basic'" class="space-y-4 mt-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="產品名稱" required>
                      <UInput v-model="productForm.name" placeholder="輸入產品名稱" />
                    </UFormField>
                    <UFormField label="SKU (庫存單位)" required>
                      <UInput v-model="productForm.sku" placeholder="輸入 SKU" />
                    </UFormField>
                    <UFormField label="Slug (網址代稱)" required>
                      <UInput v-model="productForm.slug" placeholder="輸入 Slug" />
                    </UFormField>
                    <UFormField label="分類" required>
                      <USelect
                        v-model="productForm.categoryId"
                        :items="categoryOptions"
                        option-attribute="label"
                        value-attribute="value"
                        placeholder="選擇分類"
                      />
                    </UFormField>
                    <UFormField label="狀態" required>
                      <USelect
                        v-model="productForm.status"
                        :items="statusOptions"
                        option-attribute="label"
                        value-attribute="value"
                      />
                    </UFormField>
                  </div>
                  <div class="flex gap-4 mt-4">
                    <UCheckbox v-model="productForm.isFeatured" label="精選產品" />
                    <UCheckbox v-model="productForm.isNew" label="新品" />
                  </div>
                </div>

                <!-- Pricing Tab -->
                <div v-else-if="item.key === 'pricing'" class="space-y-4 mt-4">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <UFormField label="原價" required>
                      <UInput v-model.number="productForm.originalPrice" type="number" min="0" />
                    </UFormField>
                    <UFormField label="特價">
                      <UInput v-model.number="productForm.salePrice" type="number" min="0" />
                    </UFormField>
                    <UFormField label="成本價">
                      <UInput v-model.number="productForm.costPrice" type="number" min="0" />
                    </UFormField>
                  </div>
                </div>

                <!-- Inventory Tab -->
                <div v-else-if="item.key === 'inventory'" class="space-y-4 mt-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="庫存數量" required>
                      <UInput v-model.number="productForm.stockQuantity" type="number" min="0" />
                    </UFormField>
                    <UFormField label="低庫存警示值">
                      <UInput v-model.number="productForm.lowStockThreshold" type="number" min="0" />
                    </UFormField>
                  </div>
                  <UCheckbox v-model="productForm.trackInventory" label="追蹤庫存" class="mt-2" />
                </div>

                <!-- Details Tab -->
                <div v-else-if="item.key === 'details'" class="space-y-4 mt-4">
                  <UFormField label="簡短描述">
                    <UTextarea v-model="productForm.shortDescription" :rows="2" />
                  </UFormField>
                  <UFormField label="詳細描述 (HTML)">
                    <UTextarea v-model="productForm.description" :rows="6" />
                  </UFormField>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="產地">
                      <UInput v-model="productForm.origin" />
                    </UFormField>
                    <UFormField label="保存期限 (天)">
                      <UInput v-model.number="productForm.shelfLife" type="number" min="0" />
                    </UFormField>
                  </div>
                </div>

                <!-- Images Tab -->
                <div v-else-if="item.key === 'images'" class="space-y-4 mt-4">
                  <UFormField label="主圖片 URL">
                    <UInput v-model="productForm.mainImage" placeholder="https://..." />
                    <div v-if="productForm.mainImage" class="mt-2">
                      <img :src="productForm.mainImage" class="h-32 object-contain border rounded" />
                    </div>
                  </UFormField>
                  <!-- Gallery implementation can be added here -->
                </div>

                <!-- SEO Tab -->
                <div v-else-if="item.key === 'seo'" class="space-y-4 mt-4">
                  <UFormField label="SEO 標題">
                    <UInput v-model="productForm.seoTitle" />
                  </UFormField>
                  <UFormField label="SEO 描述">
                    <UTextarea v-model="productForm.seoDescription" :rows="3" />
                  </UFormField>
                  <UFormField label="SEO 關鍵字">
                    <UInput v-model="productForm.seoKeywords" placeholder="以逗號分隔" />
                  </UFormField>
                </div>
              </template>
            </UTabs>
          </div>
        </form>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="取消"
              color="neutral"
              variant="soft"
              @click="isModalOpen = false"
            />
            <UButton
              label="儲存"
              :loading="isSaving"
              @click="saveProduct"
            />
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <!-- View Product Modal -->
    <UModal v-model:open="isViewModalOpen">
      <template #content>
        <UCard v-if="viewingProduct">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">產品詳情</h3>
            <UBadge
              :color="getStatusColor(viewingProduct.status)"
              size="lg"
            >
              {{ getStatusLabel(viewingProduct.status) }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Product Image -->
          <div v-if="viewingProduct.mainImage">
            <img
              :src="viewingProduct.mainImage"
              :alt="viewingProduct.name"
              class="w-full h-64 object-cover rounded-lg"
            />
          </div>

          <!-- Basic Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              基本資訊
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">產品名稱</p>
                <p class="font-medium">{{ viewingProduct.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">SKU</p>
                <p class="font-medium">{{ viewingProduct.sku }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">分類</p>
                <p class="font-medium">{{ viewingProduct.category?.name || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Slug</p>
                <p class="font-medium">{{ viewingProduct.slug }}</p>
              </div>
            </div>
          </div>

          <!-- Pricing Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              價格資訊
            </h4>
            <div class="grid grid-cols-3 gap-4">
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-blue-600">
                    ${{ viewingProduct.originalPrice?.toLocaleString() || 0 }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">原價</p>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-green-600">
                    ${{ viewingProduct.salePrice?.toLocaleString() || 0 }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">特價</p>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-purple-600">
                    {{ viewingProduct.stockQuantity || 0 }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">庫存數量</p>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Product Details -->
          <div v-if="viewingProduct.shortDescription">
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              簡短描述
            </h4>
            <p class="font-medium">{{ viewingProduct.shortDescription }}</p>
          </div>

          <!-- Other Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              其他資訊
            </h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="viewingProduct.isFeatured ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="viewingProduct.isFeatured ? 'text-green-500' : 'text-gray-400'"
                />
                <span>{{ viewingProduct.isFeatured ? '精選' : '非精選' }}產品</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon
                  :name="viewingProduct.isNew ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="viewingProduct.isNew ? 'text-green-500' : 'text-gray-400'"
                />
                <span>{{ viewingProduct.isNew ? '新品' : '舊品' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-calendar" class="text-gray-400" />
                <span>建立時間: {{ formatDateTime(viewingProduct.createdAt) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="text-gray-400" />
                <span>最後更新: {{ formatDateTime(viewingProduct.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="關閉"
              color="neutral"
              @click="isViewModalOpen = false"
            />
            <UButton
              label="編輯"
              @click="editFromView"
            />
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">確認刪除</h3>
        </template>

        <p class="text-gray-600 dark:text-gray-400">
          確定要刪除產品 <span class="font-semibold">{{ deletingProduct?.name }}</span> 嗎？
          此操作無法復原。
        </p>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="取消"
              color="neutral"
              variant="soft"
              @click="isDeleteModalOpen = false"
            />
            <UButton
              label="確認刪除"
              color="error"
              :loading="isDeleting"
              @click="deleteProduct"
            />
          </div>
        </template>
      </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from 'vue'
import { productsApi } from '@/api/products'
import { categoriesApi } from '@/api/categories'
import type { Product, Category } from '@/api/types'
import { useDebounceFn } from '@vueuse/core'

// Data
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

// Pagination
const page = ref(1)
const limit = ref(10)
const total = ref(0)

// Filters
const search = ref('')
const selectedCategory = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)

// Modals
const isModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Current Product
const editingProduct = ref<Product | null>(null)
const viewingProduct = ref<Product | null>(null)
const deletingProduct = ref<Product | null>(null)

// Form
const defaultForm = {
  name: '',
  sku: '',
  slug: '',
  categoryId: '',
  status: 'active',
  isFeatured: false,
  isNew: false,
  originalPrice: 0,
  salePrice: 0,
  costPrice: 0,
  stockQuantity: 0,
  lowStockThreshold: 10,
  trackInventory: true,
  shortDescription: '',
  description: '',
  origin: '',
  shelfLife: 0,
  mainImage: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
}

const productForm = ref({ ...defaultForm })

// Options
const statusOptions = [
  { label: '全部狀態', value: null },
  { label: '上架中', value: 'active' },
  { label: '下架', value: 'inactive' },
  { label: '缺貨', value: 'out_of_stock' },
]

const categoryOptions = computed(() => {
  return [
    { label: '全部分類', value: null },
    ...categories.value.map(c => ({ label: c.name, value: c.id }))
  ]
})

const tabItems = [
  { label: '基本資訊', key: 'basic' },
  { label: '價格設定', key: 'pricing' },
  { label: '庫存管理', key: 'inventory' },
  { label: '詳細資訊', key: 'details' },
  { label: '圖片管理', key: 'images' },
  { label: 'SEO 設定', key: 'seo' },
]

// Table Columns
const columns = [
  {
    id: 'image',
    accessorKey: 'mainImage',
    header: '圖片',
    cell: ({ row }: any) => {
      const UAvatar = resolveComponent('UAvatar')
      return h(UAvatar, {
        src: row.original.mainImage,
        alt: row.original.name,
        size: 'md'
      })
    }
  },
  {
    id: 'product',
    accessorKey: 'name',
    header: '產品',
    cell: ({ row }: any) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', [
          h('p', { class: 'font-medium text-gray-900 dark:text-white' }, row.original.name),
          h('p', { class: 'text-sm text-gray-500' }, row.original.sku)
        ])
      ])
    }
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: '分類',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      if (row.original.category) {
        return h(UBadge, { 
          color: 'gray', 
          variant: 'soft',
          size: 'md'
        }, () => row.original.category.name)
      }
      return h('span', { class: 'text-gray-400' }, '-')
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: '狀態',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, {
        color: getStatusColor(row.original.status),
        variant: 'soft',
        size: 'md'
      }, () => getStatusLabel(row.original.status))
    }
  },
  {
    id: 'price',
    accessorKey: 'originalPrice',
    header: '價格/庫存',
    cell: ({ row }: any) => {
      const p = row.original
      const currentPrice = p.salePrice || p.originalPrice
      return h('div', { class: 'space-y-1' }, [
        h('p', { class: 'text-sm text-gray-600 dark:text-gray-400' }, [
          '價格: ',
          h('span', { class: 'font-semibold' }, `$${Number(currentPrice || 0).toLocaleString()}`)
        ]),
        h('p', { class: 'text-sm text-gray-600 dark:text-gray-400' }, [
          '庫存: ',
          h('span', { class: 'font-semibold' }, p.stockQuantity || 0)
        ])
      ])
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }: any) => {
      const UButton = resolveComponent('UButton')
      const UTooltip = resolveComponent('UTooltip')
      
      return h('div', { class: 'flex items-center gap-2' }, [
        // 查看按鈕
        h(UTooltip, { text: '查看詳情' }, () => 
          h(UButton, {
            icon: 'i-heroicons-eye',
            size: 'sm',
            color: 'info',
            variant: 'soft',
            onClick: () => viewProduct(row.original)
          })
        ),
        // 編輯按鈕
        h(UTooltip, { text: '編輯產品' }, () =>
          h(UButton, {
            icon: 'i-heroicons-pencil',
            size: 'sm',
            color: 'warning',
            variant: 'soft',
            onClick: () => editProduct(row.original)
          })
        ),
        // 刪除按鈕
        h(UTooltip, { text: '刪除產品' }, () =>
          h(UButton, {
            icon: 'i-heroicons-trash',
            size: 'sm',
            color: 'error',
            variant: 'soft',
            onClick: () => confirmDelete(row.original)
          })
        )
      ])
    }
  }
]

// Computed
const hasActiveFilters = computed(() => {
  return search.value || selectedCategory.value || selectedStatus.value
})

const activeCount = computed(() => {
  return products.value.filter(p => p.status === 'active').length
})

const lowStockCount = computed(() => {
  return products.value.filter(p => 
    p.stockQuantity <= (p.lowStockThreshold || 10)
  ).length
})

const featuredCount = computed(() => {
  return products.value.filter(p => p.isFeatured).length
})

// Methods
const fetchCategories = async () => {
  try {
    const response = await categoriesApi.getAll()
    // @ts-ignore - API response type mismatch handling
    categories.value = Array.isArray(response) ? response : (response.data || [])
  } catch (error) {
    console.error('獲取分類失敗:', error)
  }
}

const fetchProducts = async () => {
  isLoading.value = true
  try {
    const params: any = {
      page: page.value,
      limit: limit.value,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }

    if (search.value) params.search = search.value
    if (selectedCategory.value) params.categoryId = selectedCategory.value
    if (selectedStatus.value) params.status = selectedStatus.value

    const response = await productsApi.getAll(params)
    products.value = response.data
    total.value = response.meta.total
  } catch (error: any) {
    console.error('獲取產品失敗:', error)
    // TODO: Show error toast
  } finally {
    isLoading.value = false
  }
}

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  fetchProducts()
}, 500)

const handleFilterChange = () => {
  page.value = 1
  fetchProducts()
}

const clearFilters = () => {
  search.value = ''
  selectedCategory.value = null
  selectedStatus.value = null
  page.value = 1
  fetchProducts()
}

const openCreateModal = () => {
  editingProduct.value = null
  productForm.value = { ...defaultForm }
  isModalOpen.value = true
}

const viewProduct = (product: Product) => {
  console.log('viewProduct clicked:', product)
  viewingProduct.value = product
  isViewModalOpen.value = true
  console.log('isViewModalOpen set to:', isViewModalOpen.value)
}

const editProduct = (product: Product) => {
  console.log('editProduct clicked:', product)
  editingProduct.value = product
  productForm.value = {
    ...defaultForm,
    ...product,
    categoryId: product.category?.id || '',
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    origin: product.origin || '',
    mainImage: product.imageUrl || '',
  }
  isModalOpen.value = true
  console.log('isModalOpen set to:', isModalOpen.value)
}

const editFromView = () => {
  if (viewingProduct.value) {
    isViewModalOpen.value = false
    editProduct(viewingProduct.value)
  }
}

const saveProduct = async () => {
  isSaving.value = true
  try {
    const data: any = { ...productForm.value }
    data.imageUrl = data.mainImage
    
    if (editingProduct.value) {
      await productsApi.update(editingProduct.value.id, data)
    } else {
      await productsApi.create(data)
    }
    isModalOpen.value = false
    fetchProducts()
    // TODO: Show success toast
  } catch (error: any) {
    console.error('儲存產品失敗:', error)
    // TODO: Show error toast
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (product: Product) => {
  deletingProduct.value = product
  isDeleteModalOpen.value = true
}

const deleteProduct = async () => {
  if (!deletingProduct.value) return

  isDeleting.value = true
  try {
    await productsApi.delete(deletingProduct.value.id)
    isDeleteModalOpen.value = false
    fetchProducts()
    // TODO: Show success toast
  } catch (error: any) {
    console.error('刪除產品失敗:', error)
    // TODO: Show error toast
  } finally {
    isDeleting.value = false
  }
}

// Helper Functions
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'success',
    'inactive': 'gray',
    'out_of_stock': 'error',
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status: string | null): string => {
  if (!status) return '全部狀態'
  const option = statusOptions.find(o => o.value === status)
  return option ? option.label : status
}

const getCategoryLabel = (categoryId: string | null): string => {
  if (!categoryId) return '全部分類'
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>
