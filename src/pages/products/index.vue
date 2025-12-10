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
          <SearchBox
            v-model="search"
            placeholder="搜尋產品（名稱、SKU）"
            size="lg"
            @search="handleFilterChange"
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
          分類: {{ selectedCategory?.label }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="filterCategory = undefined; handleFilterChange()"
          />
        </UBadge>
        <UBadge v-if="selectedStatus" color="info" variant="soft">
          狀態: {{ selectedStatus?.label }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="filterStatus = undefined; handleFilterChange()"
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
    <UModal
      v-model:open="isModalOpen"
      :title="editingProduct ? '編輯產品' : '新增產品'"
      :ui="{ content: 'sm:max-w-5xl' }"
    >
      <template #body>
        <UForm :schema="ProductFormSchema" :state="productForm" @submit="onFormSubmit">
          <div class="max-h-[75vh] overflow-y-auto px-1">
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <!-- Left Column: Core Fields (3/5) -->
              <div class="lg:col-span-3 space-y-6">
                <!-- 基本資訊區塊 -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <UIcon name="i-heroicons-cube" class="w-4 h-4" />
                    基本資訊
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="產品名稱" name="name" required>
                      <UInput v-model="productForm.name" placeholder="輸入產品名稱" />
                    </UFormField>
                    <UFormField label="Slug (網址代稱)" name="slug" required>
                      <UInput v-model="productForm.slug" placeholder="輸入 Slug" />
                    </UFormField>
                    <UFormField label="分類" name="categoryId" required>
                      <USelectMenu
                        v-model="formSelectedCategory"
                        :items="formCategoryOptions"
                        placeholder="選擇分類"
                      />
                    </UFormField>
                    <UFormField label="狀態" name="status" required>
                      <USelectMenu
                        v-model="formSelectedStatus"
                        :items="formStatusOptions"
                        placeholder="選擇狀態"
                      />
                    </UFormField>
                    <div class="flex items-end gap-4 pb-1">
                      <UCheckbox v-model="productForm.isFeatured" label="精選產品" />
                      <UCheckbox v-model="productForm.isNew" label="新品" />
                    </div>
                  </div>
                </div>

                <!-- 價格 & 庫存區塊 -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
                    價格 & 庫存
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <UFormField label="原價" required>
                      <UInput v-model.number="productForm.originalPrice" type="number" min="0">
                        <template #leading>
                          <span class="text-gray-500 text-sm">$</span>
                        </template>
                      </UInput>
                    </UFormField>
                    <UFormField label="特價">
                      <UInput v-model.number="productForm.salePrice" type="number" min="0">
                        <template #leading>
                          <span class="text-gray-500 text-sm">$</span>
                        </template>
                      </UInput>
                    </UFormField>
                    <UFormField label="成本價">
                      <UInput v-model.number="productForm.costPrice" type="number" min="0">
                        <template #leading>
                          <span class="text-gray-500 text-sm">$</span>
                        </template>
                      </UInput>
                    </UFormField>
                    <UFormField label="庫存數量" required>
                      <UInput v-model.number="productForm.stockQuantity" type="number" min="0" />
                    </UFormField>
                    <UFormField label="低庫存警示值">
                      <UInput v-model.number="productForm.lowStockThreshold" type="number" min="0" />
                    </UFormField>
                    <div class="flex items-end pb-1">
                      <UCheckbox v-model="productForm.trackInventory" label="追蹤庫存" />
                    </div>
                  </div>
                </div>

                <!-- 描述區塊 -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                    產品描述
                  </h3>
                  <div class="space-y-4">
                    <UFormField label="簡短描述">
                      <UTextarea v-model="productForm.shortDescription" :rows="2" placeholder="一句話描述產品特色" />
                    </UFormField>
                    <UFormField label="詳細描述">
                      <UTextarea v-model="productForm.description" :rows="4" placeholder="詳細的產品說明..." />
                    </UFormField>
                    <div class="grid grid-cols-2 gap-4">
                      <UFormField label="產地">
                        <UInput v-model="productForm.origin" placeholder="台灣" />
                      </UFormField>
                      <UFormField label="保存期限 (天)">
                        <UInput v-model.number="productForm.shelfLife" type="number" min="0" />
                      </UFormField>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Image & SEO (2/5) -->
              <div class="lg:col-span-2 space-y-6">
                <!-- 圖片區塊 -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <UIcon name="i-heroicons-photo" class="w-4 h-4" />
                    產品圖片
                  </h3>
                  <div class="space-y-4">
                    <!-- 主圖片 -->
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">主圖片</p>
                      <div
                        class="aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 relative group"
                      >
                        <img
                          v-if="productForm.mainImage"
                          :src="productForm.mainImage"
                          class="w-full h-full object-contain"
                          @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
                        />
                        <div v-if="!productForm.mainImage" class="text-center text-gray-400">
                          <UIcon name="i-heroicons-photo" class="w-10 h-10 mx-auto mb-1" />
                          <p class="text-xs">尚無主圖片</p>
                        </div>
                        <!-- 主圖片操作按鈕 -->
                        <div
                          v-if="productForm.mainImage"
                          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                        >
                          <UButton
                            icon="i-heroicons-trash"
                            size="sm"
                            color="error"
                            variant="solid"
                            @click="productForm.mainImage = ''"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- 上傳圖片 -->
                    <div
                      class="border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer hover:border-primary"
                      :class="isUploadingImage ? 'opacity-50 pointer-events-none' : 'border-gray-300 dark:border-gray-600'"
                      @click="triggerImageUpload"
                      @dragover.prevent
                      @drop.prevent="onImageDrop"
                    >
                      <input
                        ref="imageFileInput"
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="onImageSelect"
                      />
                      <UIcon
                        :name="isUploadingImage ? 'i-heroicons-arrow-path' : 'i-heroicons-cloud-arrow-up'"
                        :class="isUploadingImage ? 'animate-spin' : ''"
                        class="w-8 h-8 mx-auto mb-2 text-gray-400"
                      />
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ isUploadingImage ? '上傳中...' : '點擊或拖曳圖片上傳' }}
                      </p>
                    </div>

                    <!-- 附加圖片網格 -->
                    <div v-if="allImages.length > 0">
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        所有圖片 ({{ allImages.length }})
                        <span class="text-gray-400">· 點擊設為主圖</span>
                      </p>
                      <div class="grid grid-cols-3 gap-2">
                        <div
                          v-for="(img, index) in allImages"
                          :key="index"
                          class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative group cursor-pointer"
                          :class="{ 'ring-2 ring-primary ring-offset-2': img === productForm.mainImage }"
                          @click="setAsMainImage(img)"
                        >
                          <img
                            :src="img"
                            class="w-full h-full object-cover"
                            @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
                          />
                          <!-- 主圖標記 -->
                          <div
                            v-if="img === productForm.mainImage"
                            class="absolute top-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded"
                          >
                            主圖
                          </div>
                          <!-- 刪除按鈕 -->
                          <div
                            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <UButton
                              icon="i-heroicons-trash"
                              size="xs"
                              color="error"
                              variant="solid"
                              @click.stop="removeImage(index)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 提示文字 -->
                    <p class="text-xs text-gray-400 dark:text-gray-500">
                      建議圖片尺寸：800x800 像素以上，支援 JPG、PNG 格式
                    </p>
                  </div>
                </div>

                <!-- SEO 區塊 -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                    SEO 設定
                  </h3>
                  <div class="space-y-3">
                    <UFormField label="SEO 標題">
                      <UInput v-model="productForm.seoTitle" size="sm" placeholder="搜尋引擎標題" />
                    </UFormField>
                    <UFormField label="SEO 描述">
                      <UTextarea v-model="productForm.seoDescription" :rows="2" placeholder="搜尋引擎描述文字" />
                    </UFormField>
                    <UFormField label="SEO 關鍵字">
                      <UInput v-model="productForm.seoKeywords" size="sm" placeholder="關鍵字1, 關鍵字2, ..." />
                    </UFormField>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 表單按鈕 (移入 UForm 內以便驗證) -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <UButton
              label="取消"
              color="neutral"
              variant="soft"
              @click="isModalOpen = false"
            />
            <UButton
              type="submit"
              label="儲存"
              :loading="isSaving"
            />
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- View Product Modal -->
    <UModal
      v-model:open="isViewModalOpen"
      title="產品詳情"
    >
      <template #header v-if="viewingProduct">
        <div class="flex items-center justify-between w-full">
          <h3 class="text-lg font-semibold">產品詳情</h3>
          <StatusBadge :status="viewingProduct.status" type="product" size="lg" />
        </div>
      </template>

      <template #body v-if="viewingProduct">

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
      </template>

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
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal
      v-model:open="isDeleteModalOpen"
      title="確認刪除"
    >
      <template #body>
        <p class="text-gray-600 dark:text-gray-400">
          確定要刪除產品 <span class="font-semibold">{{ deletingProduct?.name }}</span> 嗎？
          此操作無法復原。
        </p>
      </template>

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
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { productsApi, categoriesApi, type Product, type Category } from '@/api'
import SearchBox from '@/components/common/SearchBox.vue'
import { useImageUpload } from '@/composables/useImageUpload'
import { ProductFormSchema, type ProductFormData } from '@/schemas/product'

// Toast (必須在 setup 頂層呼叫)
const toast = useToast()

// Data
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const categoryTree = ref<Category[]>([]) // 階層式分類樹
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

// Pagination
const page = ref(1)
const limit = ref(10)
const total = ref(0)

// Filters (internal simple values)
const search = ref('')
const filterCategory = ref<number | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)

// Convert simple values to SelectMenu option objects
const selectedCategory = computed({
  get: () => categoryOptions.value.find(opt => opt.value === filterCategory.value),
  set: (val) => { filterCategory.value = val?.value ?? undefined }
})

const selectedStatus = computed({
  get: () => statusOptions.find(opt => opt.value === filterStatus.value),
  set: (val) => { filterStatus.value = val?.value ?? undefined }
})

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
  categoryId: 0,
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
  images: [] as string[],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
}

const productForm = ref({ ...defaultForm })

// 圖片上傳 composable
const imageUpload = useImageUpload({ usage: 'product' })

// 計算屬性：合併顯示用的所有圖片
const allImages = computed(() => {
  const result = [...productForm.value.images]
  if (productForm.value.mainImage && !result.includes(productForm.value.mainImage)) {
    result.unshift(productForm.value.mainImage)
  }
  return result
})

// 圖片管理函式
const removeImage = (index: number) => {
  const img = allImages.value[index]
  if (!img) return

  // 從 images 陣列移除
  const imgIndex = productForm.value.images.indexOf(img)
  if (imgIndex > -1) {
    productForm.value.images.splice(imgIndex, 1)
  }

  // 如果刪除的是主圖，設定新的主圖
  if (productForm.value.mainImage === img) {
    productForm.value.mainImage = productForm.value.images[0] || ''
  }
}

const setAsMainImage = (url: string) => {
  productForm.value.mainImage = url
}

// 圖片上傳
const isUploadingImage = ref(false)
const imageFileInput = ref<HTMLInputElement | null>(null)

const triggerImageUpload = () => {
  imageFileInput.value?.click()
}

const handleUploadImages = async (files: File[]) => {
  if (files.length === 0) return

  isUploadingImage.value = true

  try {
    // 驗證檔案
    for (const file of files) {
      const validation = imageUpload.validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
    }

    // 上傳並添加到表單
    const urls = await imageUpload.uploadFiles(files)
    for (const url of urls) {
      if (!productForm.value.images.includes(url) && productForm.value.mainImage !== url) {
        productForm.value.images.push(url)
      }
      if (!productForm.value.mainImage) {
        productForm.value.mainImage = url
      }
    }

    toast.add({
      title: '上傳成功',
      description: `成功上傳 ${files.length} 張圖片`,
      color: 'success',
    })
  } catch (error: any) {
    console.error('圖片上傳失敗:', error)
    toast.add({
      title: '上傳失敗',
      description: error.message || '圖片上傳失敗，請稍後再試',
      color: 'error',
    })
  } finally {
    isUploadingImage.value = false
  }
}

const onImageSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await handleUploadImages(Array.from(target.files))
    target.value = ''
  }
}

const onImageDrop = async (e: DragEvent) => {
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      await handleUploadImages(imageFiles)
    }
  }
}

// Options
const statusOptions = [
  { label: '全部狀態', value: null },
  { label: '上架中', value: 'active' },
  { label: '下架', value: 'inactive' },
  { label: '缺貨', value: 'out_of_stock' },
]

// Helper function to flatten category tree with indentation
const flattenCategoryTree = (tree: any[], level = 0, parentPath = ''): { label: string, value: string, level: number }[] => {
  const result: { label: string, value: string, level: number }[] = []

  tree.forEach(category => {
    const currentPath = parentPath ? `${parentPath} > ${category.name}` : category.name
    const indent = '　'.repeat(level) // 全形空格用於縮排

    result.push({
      label: `${indent}${category.name}`,
      value: category.id.toString(), // 確保是字串
      level
    })

    if (category.children && Array.isArray(category.children) && category.children.length > 0) {
      result.push(...flattenCategoryTree(category.children, level + 1, currentPath))
    }
  })

  return result
}

const categoryOptions = computed(() => {
  const flattened = flattenCategoryTree(categoryTree.value)
  return [
    { label: '全部分類', value: null, level: 0 },
    ...flattened.map(c => ({ label: c.label, value: parseInt(c.value, 10) }))
  ]
})

// 給表單用的分類選項（不含「全部分類」）
const formCategoryOptions = computed(() => {
  const flattened = flattenCategoryTree(categoryTree.value)
  return flattened.map(c => ({ label: c.label, value: parseInt(c.value, 10) }))
})

// 給表單用的狀態選項（不含「全部狀態」）
const formStatusOptions = [
  { label: '上架中', value: 'active' },
  { label: '下架', value: 'inactive' },
  { label: '缺貨', value: 'out_of_stock' },
]

// 表單分類 computed（處理物件和純值的轉換）
const formSelectedCategory = computed({
  get: () => formCategoryOptions.value.find(opt => opt.value === productForm.value.categoryId),
  set: (val) => { productForm.value.categoryId = val?.value ?? 0 }
})

// 表單狀態 computed（處理物件和純值的轉換）
const formSelectedStatus = computed({
  get: () => formStatusOptions.find(opt => opt.value === productForm.value.status),
  set: (val) => { productForm.value.status = val?.value ?? 'active' }
})

// Tab items removed as not used in current implementation

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
      return h(StatusBadge, {
        status: row.original.status,
        type: 'product',
        size: 'sm'
      })
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
const fetchCategoryTree = async () => {
  const response = await categoriesApi.getTree()
  // getTree returns ApiResponse<Category[]>, need to extract .data
  categoryTree.value = Array.isArray(response) ? response : (response.data || [])
}

const fetchCategories = async () => {
  const response = await categoriesApi.getAll()
  // @ts-ignore - API response type mismatch handling
  categories.value = Array.isArray(response) ? response : (response.data || [])
}

const fetchProducts = async () => {
  isLoading.value = true
  const params: any = {
    page: page.value,
    limit: limit.value,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  }

  if (search.value) params.search = search.value
  if (filterCategory.value) params.categoryId = filterCategory.value
  if (filterStatus.value) params.status = filterStatus.value

  const response = await productsApi.getAll(params)
  products.value = response.data
  total.value = response.meta.total
  isLoading.value = false
}


const handleFilterChange = () => {
  page.value = 1
  fetchProducts()
}

const clearFilters = () => {
  search.value = ''
  filterCategory.value = undefined
  filterStatus.value = undefined
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
    categoryId: product.categoryId || 0,
    status: product.status || 'active',
    originalPrice: product.originalPrice || 0,
    salePrice: product.salePrice || 0,
    costPrice: product.costPrice || 0,
    stockQuantity: product.stockQuantity || 0,
    lowStockThreshold: product.lowStockThreshold || 10,
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    origin: product.origin || '',
    shelfLife: product.shelfLife || 0,
    mainImage: product.mainImage || '',
    images: product.images || [],
    seoTitle: product.seoTitle || '',
    seoDescription: product.seoDescription || '',
    seoKeywords: product.seoKeywords || '',
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

// 表單提交 (驗證通過後)
const onFormSubmit = async (event: FormSubmitEvent<ProductFormData>) => {
  console.log('Form validated:', event.data)
  await saveProduct()
}

const saveProduct = async () => {
  isSaving.value = true
  try {
    const data: any = { ...productForm.value }

    if (editingProduct.value) {
      await productsApi.update(editingProduct.value.id, data)
      toast.add({ title: '更新成功', description: '產品已成功更新', color: 'success' })
    } else {
      await productsApi.create(data)
      toast.add({ title: '新增成功', description: '產品已成功建立', color: 'success' })
    }
    isModalOpen.value = false
    fetchProducts()
  } catch (error: any) {
    console.error('儲存產品失敗:', error)
    toast.add({ title: '儲存失敗', description: error.message || '請稍後再試', color: 'error' })
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
  await productsApi.delete(deletingProduct.value.id)
  isDeleteModalOpen.value = false
  isDeleting.value = false
  fetchProducts()
}

// Helper Functions

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
  fetchProducts()
  fetchCategories()
  fetchCategoryTree() // 獲取階層式分類樹
})
</script>
```
