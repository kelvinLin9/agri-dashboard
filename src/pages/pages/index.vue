<template>
  <div class="p-6 space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">頁面管理</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          管理網站內容頁面（CMS）
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="fetchPages"
        >
          刷新
        </UButton>
        <UButton
          icon="i-heroicons-plus"
          @click="openCreateModal"
        >
          新增頁面
        </UButton>
      </div>
    </div>

    <!-- 頁面列表 -->
    <UCard>
      <div v-if="loading" class="flex items-center justify-center h-64">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8" />
        <span class="ml-2">載入中...</span>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center h-64 text-red-500">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mb-2" />
        <p>{{ error }}</p>
        <UButton size="sm" class="mt-4" @click="fetchPages">重試</UButton>
      </div>

      <div v-else-if="!pages.length" class="flex flex-col items-center justify-center h-64 text-gray-500">
        <UIcon name="i-heroicons-document" class="w-12 h-12 mb-2" />
        <p>暫無頁面</p>
        <UButton size="sm" class="mt-4" @click="openCreateModal">創建第一個頁面</UButton>
      </div>

      <UTable
        v-else
        :data="pages"
        :columns="tableColumns"
        :loading="loading"
      />
    </UCard>

    <!-- 新增/編輯 Modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              {{ editingPage ? '編輯頁面' : '新增頁面' }}
            </h3>
          </template>

          <div class="space-y-4">
            <!-- 標題 -->
            <UFormField label="頁面標題" required>
              <UInput v-model="form.title" placeholder="請輸入標題" />
            </UFormField>

            <!-- Slug -->
            <UFormField label="URL Slug" required>
              <UInput v-model="form.slug" placeholder="about-us" />
            </UFormField>

            <!-- 類型 -->
            <UFormField label="頁面類型">
              <USelectMenu
                v-model="form.type"
                :items="typeOptions"
              />
            </UFormField>

            <!-- 內容 -->
            <UFormField label="頁面內容">
              <UTextarea v-model="form.content" :rows="8" placeholder="支援 HTML" />
            </UFormField>

            <!-- SEO 設定 -->
            <div class="border-t pt-4">
              <h4 class="font-medium mb-3">SEO 設定</h4>
              
              <div class="space-y-3">
                <UFormField label="SEO 標題">
                  <UInput v-model="form.seoTitle" placeholder="留空則使用頁面標題" />
                </UFormField>

                <UFormField label="SEO 描述">
                  <UTextarea v-model="form.seoDescription" :rows="3" />
                </UFormField>

                <UFormField label="SEO 關鍵字">
                  <UInput v-model="form.seoKeywords" placeholder="逗號分隔" />
                </UFormField>
              </div>
            </div>

            <!-- 其他設定 -->
            <div class="border-t pt-4">
              <h4 class="font-medium mb-3">顯示設定</h4>
              
              <div class="space-y-3">
                <UFormField label="排序權重">
                  <UInput v-model.number="form.sortOrder" type="number" />
                </UFormField>

                <UFormField>
                  <UCheckbox v-model="form.showInMenu" label="顯示在選單" />
                </UFormField>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="取消" color="neutral" variant="soft" @click="closeModal" :disabled="saving" />
              <UButton :label="editingPage ? '更新' : '創建'" @click="handleSave" :loading="saving" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- 刪除確認 Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">確認刪除</h3>
          </template>

          <p class="text-gray-600 dark:text-gray-400">
            確定要刪除頁面 <span class="font-semibold">{{ deletingPage?.title }}</span> 嗎？
            此操作無法復原。
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                label="取消"
                color="neutral"
                variant="soft"
                @click="showDeleteModal = false"
              />
              <UButton
                label="確認刪除"
                color="error"
                @click="confirmDelete"
              />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, resolveComponent } from 'vue'
import { pagesApi, PageType, PageStatus, type Page, type CreatePageDto } from '@/api/pages'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const pages = ref<Page[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showModal = ref(false)
const saving = ref(false)
const editingPage = ref<Page | null>(null)
const showDeleteModal = ref(false)
const deletingPage = ref<Page | null>(null)

// 表單
const form = ref({
  title: '',
  slug: '',
  content: '',
  type: { value: PageType.CUSTOM, label: '自訂頁面' },
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  sortOrder: 0,
  showInMenu: false,
})

// 表格欄位 (UTable format)
const tableColumns = [
  {
    id: 'title',
    header: '標題',
    cell: ({ row }: any) => {
      const page = row.original
      return h('div', {}, [
        h('p', { class: 'font-medium' }, page.title),
        h('p', { class: 'text-xs text-gray-500' }, `/${page.slug}`)
      ])
    }
  },
  {
    id: 'type',
    header: '類型',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      const page = row.original
      return h(UBadge, {
        color: getTypeColor(page.type),
        variant: 'subtle'
      }, () => getTypeLabel(page.type))
    }
  },
  {
    id: 'status',
    header: '狀態',
    cell: ({ row }: any) => {
      const UBadge = resolveComponent('UBadge')
      const page = row.original
      return h(UBadge, {
        color: getStatusColor(page.status)
      }, () => getStatusLabel(page.status))
    }
  },
  {
    id: 'showInMenu',
    header: '選單顯示',
    cell: ({ row }: any) => {
      const UIcon = resolveComponent('UIcon')
      const page = row.original
      return h(UIcon, {
        name: page.showInMenu ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle',
        class: page.showInMenu ? 'text-green-500 w-5 h-5' : 'text-gray-400 w-5 h-5'
      })
    }
  },
  {
    id: 'publishedAt',
    header: '發布時間',
    cell: ({ row }: any) => {
      const page = row.original
      return page.publishedAt ? formatDate(page.publishedAt) : '-'
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }: any) => {
      const UButton = resolveComponent('UButton')
      const page = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UButton, {
          size: 'sm',
          variant: 'ghost',
          icon: 'i-heroicons-pencil',
          onClick: () => openEditModal(page)
        }),
        page.status === 'draft' ? h(UButton, {
          size: 'sm',
          variant: 'ghost',
          color: 'success',
          icon: 'i-heroicons-check',
          onClick: () => handlePublish(page.id)
        }) : null,
        page.status === 'published' ? h(UButton, {
          size: 'sm',
          variant: 'ghost',
          color: 'warning',
          icon: 'i-heroicons-archive-box',
          onClick: () => handleUnpublish(page.id)
        }) : null,
        h(UButton, {
          size: 'sm',
          variant: 'ghost',
          color: 'error',
          icon: 'i-heroicons-trash',
          onClick: () => handleDelete(page)
        })
      ].filter(Boolean))
    }
  }
]

// 類型選項
const typeOptions = [
  { value: PageType.CUSTOM, label: '自訂頁面' },
  { value: PageType.HOME, label: '首頁' },
  { value: PageType.ABOUT, label: '關於我們' },
  { value: PageType.CONTACT, label: '聯絡我們' },
  { value: PageType.TERMS, label: '服務條款' },
  { value: PageType.PRIVACY, label: '隱私政策' },
]

// 獲取頁面列表
async function fetchPages() {
  loading.value = true
  error.value = null

  try {
    pages.value = await pagesApi.getAll()
  } catch (err: any) {
    error.value = err.message || '獲取頁面列表失敗'
    console.error('Failed to fetch pages:', err)
  } finally {
    loading.value = false
  }
}

// 打開新增 Modal
function openCreateModal() {
  editingPage.value = null
  form.value = {
    title: '',
    slug: '',
    content: '',
    type: { value: PageType.CUSTOM, label: '自訂頁面' },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    sortOrder: 0,
    showInMenu: false,
  }
  showModal.value = true
}

// 打開編輯 Modal
function openEditModal(page: Page) {
  editingPage.value = page
  const typeOption = typeOptions.find(opt => opt.value === page.type) || typeOptions[0]!
  form.value = {
    title: page.title,
    slug: page.slug,
    content: page.content,
    type: typeOption,
    seoTitle: page.seoTitle || '',
    seoDescription: page.seoDescription || '',
    seoKeywords: page.seoKeywords || '',
    sortOrder: page.sortOrder,
    showInMenu: page.showInMenu,
  }
  showModal.value = true
}

// 保存
async function handleSave() {
  saving.value = true

  try {
    const dto = {
      ...form.value,
      type: form.value.type.value, // Convert to PageType
    }
    
    if (editingPage.value) {
      await pagesApi.update(editingPage.value.id, dto)
    } else {
      await pagesApi.create(dto)
    }
    
    await fetchPages()
    closeModal()
    toast.success(editingPage.value ? '更新成功' : '建立成功')
  } catch (err: any) {
    console.error('Failed to save page:', err)
    toast.error('保存失敗', err.message || '無法保存頁面')
  } finally {
    saving.value = false
  }
}

// 關閉 Modal
function closeModal() {
  showModal.value = false
  editingPage.value = null
}

// 發布
async function handlePublish(id: string) {
  try {
    await pagesApi.publish(id)
    await fetchPages()
    toast.success('發布成功', '頁面已發布')
  } catch (err: any) {
    console.error('Failed to publish page:', err)
    toast.error('發布失敗', err.message || '無法發布頁面')
  }
}

// 取消發布
async function handleUnpublish(id: string) {
  try {
    await pagesApi.unpublish(id)
    await fetchPages()
    toast.success('已取消發布', '頁面已改為草稿')
  } catch (err: any) {
    console.error('Failed to unpublish page:', err)
    toast.error('取消發布失敗', err.message || '無法取消發布')
  }
}

// 刪除
function handleDelete(page: Page) {
  deletingPage.value = page
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deletingPage.value) return

  try {
    await pagesApi.delete(deletingPage.value.id)
    await fetchPages()
    showDeleteModal.value = false
    deletingPage.value = null
    toast.success('刪除成功', '頁面已刪除')
  } catch (err: any) {
    console.error('Failed to delete page:', err)
    toast.error('刪除失敗', err.message || '無法刪除頁面')
  }
}

// 格式化日期
function formatDate(date: Date | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW')
}

// 類型顏色
function getTypeColor(type: PageType): string {
  const colors = {
    [PageType.HOME]: 'purple',
    [PageType.ABOUT]: 'blue',
    [PageType.CONTACT]: 'green',
    [PageType.TERMS]: 'yellow',
    [PageType.PRIVACY]: 'orange',
    [PageType.CUSTOM]: 'gray',
  }
  return colors[type] || 'gray'
}

// 類型標籤
function getTypeLabel(type: PageType): string {
  const labels = {
    [PageType.HOME]: '首頁',
    [PageType.ABOUT]: '關於',
    [PageType.CONTACT]: '聯絡',
    [PageType.TERMS]: '條款',
    [PageType.PRIVACY]: '隱私',
    [PageType.CUSTOM]: '自訂',
  }
  return labels[type] || type
}

// 狀態顏色
function getStatusColor(status: PageStatus): string {
  const colors = {
    [PageStatus.DRAFT]: 'gray',
    [PageStatus.PUBLISHED]: 'green',
    [PageStatus.ARCHIVED]: 'orange',
  }
  return colors[status] || 'gray'
}

// 狀態標籤
function getStatusLabel(status: PageStatus): string {
  const labels = {
    [PageStatus.DRAFT]: '草稿',
    [PageStatus.PUBLISHED]: '已發布',
    [PageStatus.ARCHIVED]: '已歸檔',
  }
  return labels[status] || status
}

// 頁面載入時獲取數據
onMounted(async () => {
  await fetchPages()
})
</script>
