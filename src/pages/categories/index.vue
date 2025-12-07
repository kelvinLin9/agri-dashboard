<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">分類管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理產品分類階層結構</p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        size="lg"
        label="新增分類"
        @click="openCreateModal"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總分類數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ totalCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-folder" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">根分類</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {{ rootCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-folder-open" class="w-8 h-8 text-green-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">啟用中</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {{ activeCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-purple-500" />
        </div>
      </UCard>
    </div>

    <!-- Categories Tree -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">分類樹狀結構</h3>
          <UButton
            label="重新載入"
            icon="i-heroicons-arrow-path"
            variant="ghost"
            size="sm"
            @click="fetchCategoryTree"
          />
        </div>
      </template>

      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500" />
      </div>

      <EmptyState
        v-else-if="categoryTree.length === 0"
        icon="i-heroicons-folder-open"
        title="尚無分類"
        description="請新增第一個分類"
        action-label="新增分類"
        action-icon="i-heroicons-plus"
        @action="openCreateModal"
      />

      <div v-else class="space-y-1">
        <CategoryTreeNode
          v-for="category in categoryTree"
          :key="category.id"
          :category="category"
          :level="0"
          @view="viewCategory"
          @edit="editCategory"
          @delete="confirmDelete"
        />
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              {{ editingCategory ? '編輯分類' : '新增分類' }}
            </h3>
          </template>

          <form @submit.prevent="saveCategory" class="space-y-4">
            <!-- Name -->
            <UFormField label="分類名稱" required>
              <UInput
                v-model="categoryForm.name"
                placeholder="請輸入分類名稱"
              />
            </UFormField>

            <!-- Slug -->
            <UFormField label="Slug (網址代稱)" required>
              <UInput
                v-model="categoryForm.slug"
                placeholder="例如: vegetables"
              />
            </UFormField>

            <!-- Parent Category -->
            <UFormField label="父分類">
              <USelectMenu
                v-model="selectedParent"
                :items="parentOptions"
                placeholder="選擇父分類（留空則為根分類）"
                searchable
              >
                <template #leading>
                  <UIcon name="i-heroicons-folder" class="w-5 h-5" />
                </template>
              </USelectMenu>
            </UFormField>

            <!-- Description -->
            <UFormField label="描述">
              <UTextarea
                v-model="categoryForm.description"
                :rows="3"
                placeholder="輸入分類描述"
              />
            </UFormField>

            <!-- Image URL -->
            <UFormField label="圖片網址">
              <UInput
                v-model="categoryForm.imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </UFormField>

            <!-- Sort Order -->
            <UFormField label="排序順序">
              <UInput
                v-model.number="categoryForm.sortOrder"
                type="number"
                min="0"
                placeholder="0"
              />
            </UFormField>

            <!-- Active Status -->
            <UFormField>
              <UCheckbox
                v-model="categoryForm.isActive"
                label="啟用此分類"
              />
            </UFormField>
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
                @click="saveCategory"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- View Modal -->
    <UModal v-model:open="isViewModalOpen">
      <template #content>
        <UCard v-if="viewingCategory">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">分類詳情</h3>
              <UBadge
                :color="viewingCategory.isActive ? 'success' : 'neutral'"
                size="lg"
              >
                {{ viewingCategory.isActive ? '啟用' : '停用' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Basic Info -->
            <div>
              <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                基本資訊
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">分類名稱</p>
                  <p class="font-medium">{{ viewingCategory.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Slug</p>
                  <p class="font-medium">{{ viewingCategory.slug }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-sm text-gray-500">描述</p>
                  <p class="font-medium">{{ viewingCategory.description || '-' }}</p>
                </div>
              </div>
            </div>

            <!-- Hierarchy -->
            <div v-if="viewingCategory.parentId">
              <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                層級資訊
              </h4>
              <p class="text-sm text-gray-600">
                父分類: <span class="font-semibold">{{ getParentName(viewingCategory.parentId) }}</span>
              </p>
            </div>

            <!-- Image -->
            <div v-if="viewingCategory.imageUrl">
              <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                分類圖片
              </h4>
              <img 
                :src="viewingCategory.imageUrl" 
                :alt="viewingCategory.name"
                class="w-full h-48 object-cover rounded-lg"
              />
            </div>

            <!-- Metadata -->
            <div>
              <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                其他資訊
              </h4>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-hashtag" class="text-gray-400" />
                  <span>排序順序: {{ viewingCategory.sortOrder }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-calendar" class="text-gray-400" />
                  <span>建立時間: {{ formatDateTime(viewingCategory.createdAt) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-clock" class="text-gray-400" />
                  <span>最後更新: {{ formatDateTime(viewingCategory.updatedAt) }}</span>
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

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              確定要刪除分類 <span class="font-semibold">{{ deletingCategory?.name }}</span> 嗎？
            </p>

            <div v-if="hasChildren(deletingCategory)" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-800 dark:text-red-200">
                ⚠️ 此分類包含子分類，刪除後所有子分類將移至根層級
              </p>
            </div>

            <p class="text-sm text-gray-500">
              此操作無法復原
            </p>
          </div>

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
                @click="deleteCategory"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { categoriesApi, type Category } from '@/api'
import CategoryTreeNode from './CategoryTreeNode.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// Data
const categoryTree = ref<any[]>([])
const allCategories = ref<Category[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

// Modals
const isModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Current Category
const editingCategory = ref<Category | null>(null)
const viewingCategory = ref<Category | null>(null)
const deletingCategory = ref<any | null>(null)

// Form
const categoryForm = ref({
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  parentId: '',
  isActive: true,
  sortOrder: 0,
})

const selectedParent = ref<{ label: string; value: string } | null>(null)

// Computed
const totalCount = computed(() => allCategories.value.length)

const rootCount = computed(() => categoryTree.value.length)

const activeCount = computed(() => 
  allCategories.value.filter(c => c.isActive).length
)

const parentOptions = computed(() => {
  // 過濾掉自身和自身的子孫
  const excludeIds = new Set<string>()
  
  if (editingCategory.value) {
    excludeIds.add(editingCategory.value.id)
    // TODO: 添加所有子孫ID到 excludeIds
  }

  const flattenOptions = (categories: any[], level = 0): any[] => {
    const result: any[] = []
    categories.forEach(cat => {
      if (!excludeIds.has(cat.id)) {
        const indent = '　'.repeat(level)
        result.push({
          label: `${indent}${cat.name}`,
          value: cat.id
        })
        if (cat.children && cat.children.length > 0) {
          result.push(...flattenOptions(cat.children, level + 1))
        }
      }
    })
    return result
  }

  return [
    { label: '無（根分類）', value: null },
    ...flattenOptions(categoryTree.value)
  ]
})

// Methods
const fetchCategoryTree = async () => {
  isLoading.value = true
  try {
    const response = await categoriesApi.getTree()
    categoryTree.value = Array.isArray(response) ? response : (response.data || [])
    
    // 同時獲取平面列表用於統計
    const allResponse = await categoriesApi.getAll()
    allCategories.value = Array.isArray(allResponse) ? allResponse : (allResponse.data || [])
  } catch (error) {
    console.error('獲取分類樹失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    parentId: '',
    isActive: true,
    sortOrder: 0,
  }
  selectedParent.value = null
  isModalOpen.value = true
}

const viewCategory = (category: any) => {
  viewingCategory.value = category
  isViewModalOpen.value = true
}

const editCategory = (category: any) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    imageUrl: category.imageUrl || '',
    parentId: category.parentId || '',
    isActive: category.isActive ?? true,
    sortOrder: category.sortOrder || 0,
  }
  
  if (category.parentId) {
    const parent = findCategoryById(categoryTree.value, category.parentId)
    selectedParent.value = parent ? { label: parent.name, value: parent.id } : null
  } else {
    selectedParent.value = null
  }
  
  isModalOpen.value = true
}

const editFromView = () => {
  if (viewingCategory.value) {
    isViewModalOpen.value = false
    editCategory(viewingCategory.value)
  }
}

const saveCategory = async () => {
  isSaving.value = true
  try {
    const dto = {
      ...categoryForm.value,
      parentId: selectedParent.value?.value || undefined
    }

    if (editingCategory.value) {
      await categoriesApi.update(editingCategory.value.id, dto)
    } else {
      await categoriesApi.create(dto)
    }

    isModalOpen.value = false
    await fetchCategoryTree()
  } catch (error) {
    console.error('儲存分類失敗:', error)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (category: any) => {
  deletingCategory.value = category
  isDeleteModalOpen.value = true
}

const deleteCategory = async () => {
  if (!deletingCategory.value) return

  isDeleting.value = true
  try {
    await categoriesApi.delete(deletingCategory.value.id)
    isDeleteModalOpen.value = false
    await fetchCategoryTree()
  } catch (error) {
    console.error('刪除分類失敗:', error)
  } finally {
    isDeleting.value = false
  }
}

// Helper Functions
const findCategoryById = (categories: any[], id: string): any | null => {
  for (const cat of categories) {
    if (cat.id === id) return cat
    if (cat.children) {
      const found = findCategoryById(cat.children, id)
      if (found) return found
    }
  }
  return null
}

const getParentName = (parentId: string): string => {
  const parent = findCategoryById(categoryTree.value, parentId)
  return parent ? parent.name : '未知'
}

const hasChildren = (category: any): boolean => {
  return category?.children && category.children.length > 0
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  fetchCategoryTree()
})
</script>
