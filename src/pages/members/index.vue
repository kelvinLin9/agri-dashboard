<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">會員管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理系統會員資料</p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        size="lg"
        label="新增會員"
        @click="openCreateModal"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總會員數</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ pagination.total }}
            </p>
          </div>
          <UIcon name="i-heroicons-users" class="w-8 h-8 text-blue-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">活躍會員</p>
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
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">本月新增</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {{ newThisMonth }}
            </p>
          </div>
          <UIcon name="i-heroicons-arrow-trending-up" class="w-8 h-8 text-purple-500" />
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">VIP 會員</p>
            <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {{ vipCount }}
            </p>
          </div>
          <UIcon name="i-heroicons-star" class="w-8 h-8 text-yellow-500" />
        </div>
      </UCard>
    </div>

    <!-- Filters and Search -->
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="搜尋會員（帳號、Email、電話、地址）"
            size="lg"
            @input="debouncedSearch"
          />
        </div>

        <!-- Level Filter -->
        <USelectMenu
          v-model="selectedLevel"
          :items="levelOptions"
          placeholder="選擇會員等級"
          size="lg"
          @change="fetchMembers"
        />
      </div>

      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="mt-4 flex items-center gap-2">
        <UBadge v-if="searchQuery" color="info" variant="soft">
          搜尋: {{ searchQuery }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="searchQuery = ''; fetchMembers()"
          />
        </UBadge>
        <UBadge v-if="selectedLevel" color="info" variant="soft">
          等級: {{ getLevelLabel(selectedLevel) }}
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="selectedLevel = null; fetchMembers()"
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

    <!-- Members Table -->
    <UCard>
      <UTable
        :data="members"
        :columns="columns"
        :loading="isLoading"
        :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: '沒有會員資料' }"
      >
      </UTable>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          顯示 {{ (pagination.page - 1) * pagination.limit + 1 }} 到
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
          筆，共 {{ pagination.total }} 筆
        </div>
        <UPagination
          v-model:page="pagination.page"
          :items-per-page="pagination.limit"
          :total="pagination.total"
          @update:page="fetchMembers"
        />
      </div>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingMember ? '編輯會員' : '新增會員' }}
          </h3>
        </template>

        <form @submit.prevent="saveMember" class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="真實姓名" required>
              <UInput
                v-model="memberForm.realName"
                placeholder="請輸入真實姓名"
              />
            </UFormField>

            <UFormField label="電話" required>
              <UInput
                v-model="memberForm.phone"
                placeholder="0912345678"
              />
            </UFormField>

            <UFormField label="生日">
              <UInput
                v-model="memberForm.birthday"
                type="date"
              />
            </UFormField>

            <UFormField label="性別">
              <USelectMenu
                v-model="memberForm.gender"
                :items="genderOptions"
                placeholder="選擇性別"
              />
            </UFormField>
          </div>

          <!-- Address -->
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="郵遞區號">
              <UInput
                v-model="memberForm.postalCode"
                placeholder="100"
              />
            </UFormField>

            <UFormField label="城市">
              <UInput
                v-model="memberForm.city"
                placeholder="台北市"
              />
            </UFormField>

            <UFormField label="區域">
              <UInput
                v-model="memberForm.district"
                placeholder="中正區"
              />
            </UFormField>
          </div>

          <UFormField label="詳細地址">
            <UInput
              v-model="memberForm.address"
              placeholder="請輸入詳細地址"
            />
          </UFormField>

          <!-- Member Settings (Admin Only) -->
          <div v-if="editingMember" class="grid grid-cols-2 gap-4">
            <UFormField label="會員等級">
              <USelectMenu
                v-model="memberForm.level"
                :items="levelOptions"
              />
            </UFormField>

            <UFormField label="點數">
              <UInput
                v-model.number="memberForm.points"
                type="number"
                min="0"
              />
            </UFormField>
          </div>

          <!-- Newsletter -->
          <UFormField>
            <UCheckbox
              v-model="memberForm.newsletterSubscribed"
              label="訂閱電子報"
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
              @click="saveMember"
            />
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <!-- View Member Modal -->
    <UModal v-model:open="isViewModalOpen">
      <template #content>
        <UCard v-if="viewingMember">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">會員詳情</h3>
            <UBadge
              :color="getLevelColor(viewingMember.level)"
              size="lg"
            >
              {{ getLevelLabel(viewingMember.level) }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-6">
          <!-- User Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              基本資訊
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">帳號</p>
                <p class="font-medium">{{ viewingMember.user?.username }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium">{{ viewingMember.user?.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">真實姓名</p>
                <p class="font-medium">{{ viewingMember.realName || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">電話</p>
                <p class="font-medium">{{ viewingMember.phone || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">生日</p>
                <p class="font-medium">{{ formatDate(viewingMember.birthday) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">性別</p>
                <p class="font-medium">{{ getGenderLabel(viewingMember.gender) }}</p>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              地址資訊
            </h4>
            <p class="font-medium">
              {{ [
                viewingMember.postalCode,
                viewingMember.city,
                viewingMember.district,
                viewingMember.address
              ].filter(Boolean).join(' ') || '-' }}
            </p>
          </div>

          <!-- Stats -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              消費統計
            </h4>
            <div class="grid grid-cols-3 gap-4">
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-blue-600">
                    ${{ viewingMember.totalSpent?.toLocaleString() || 0 }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">總消費金額</p>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-green-600">
                    {{ viewingMember.orderCount || 0 }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">訂單數量</p>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-purple-600">
                    {{ viewingMember.points || 0 }}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">會員點數</p>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Other Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              其他資訊
            </h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="viewingMember.newsletterSubscribed ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="viewingMember.newsletterSubscribed ? 'text-green-500' : 'text-gray-400'"
                />
                <span>{{ viewingMember.newsletterSubscribed ? '已訂閱' : '未訂閱' }}電子報</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-calendar" class="text-gray-400" />
                <span>註冊時間: {{ formatDateTime(viewingMember.createdAt) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="text-gray-400" />
                <span>最後更新: {{ formatDateTime(viewingMember.updatedAt) }}</span>
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
          確定要刪除會員 <span class="font-semibold">{{ deletingMember?.user?.username }}</span> 嗎？
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
              @click="deleteMember"
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
import { membersApi, type Member, type MemberQueryParams, MemberLevel, SortOrder } from '@/api'

// Data
const members = ref<Member[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

// Pagination
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})

// Filters
const searchQuery = ref('')
const selectedLevel = ref<MemberLevel | null>(null)

// Modals
const isModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// Current Member
const editingMember = ref<Member | null>(null)
const viewingMember = ref<Member | null>(null)
const deletingMember = ref<Member | null>(null)

// Form
const memberForm = ref({
  realName: '',
  phone: '',
  birthday: '',
  gender: null as 'male' | 'female' | 'other' | null,
  postalCode: '',
  city: '',
  district: '',
  address: '',
  level: MemberLevel.BRONZE,
  points: 0,
  newsletterSubscribed: true,
})

// Options
const levelOptions = [
  { label: '全部等級', value: null },
  { label: '銅級 (BRONZE)', value: MemberLevel.BRONZE },
  { label: '銀級 (SILVER)', value: MemberLevel.SILVER },
  { label: '金級 (GOLD)', value: MemberLevel.GOLD },
  { label: '白金 (PLATINUM)', value: MemberLevel.PLATINUM },
  { label: '鑽石 (DIAMOND)', value: MemberLevel.DIAMOND },
]

const genderOptions = [
  { label: '男性', value: 'male' },
  { label: '女性', value: 'female' },
  { label: '其他', value: 'other' },
]

// Table Columns
const columns = [
  { 
    id: 'user',
    accessorKey: 'user.username',
    header: '會員',
    cell: ({ row }: any) => {
      const user = row.original.user
      const UAvatar = resolveComponent('UAvatar')
      
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, { 
          alt: user?.username,
          size: 'md'
        }),
        h('div', [
          h('p', { class: 'font-medium text-gray-900 dark:text-white' }, user?.username || '-'),
          h('p', { class: 'text-sm text-gray-500' }, user?.email || '-')
        ])
      ])
    }
  },
  { 
    id: 'level',
    accessorKey: 'level',
    header: '等級',
    cell: ({ row }: any) => {
      const level = row.original.level
      const UBadge = resolveComponent('UBadge')
      
      return h(UBadge, {
        color: getLevelColor(level),
        variant: 'soft',
        size: 'md'
      }, () => getLevelLabel(level))
    }
  },
  { 
    id: 'status',
    accessorKey: 'user.status',
    header: '狀態',
    cell: ({ row }: any) => {
      const status = row.original.user?.status
      const UBadge = resolveComponent('UBadge')
      
      return h(UBadge, {
        color: status === 'active' ? 'success' : 'error',
        variant: 'soft',
        size: 'md'
      }, () => status === 'active' ? '活躍' : '停用')
    }
  },
  { 
    id: 'stats',
    accessorKey: 'totalSpent',
    header: '消費/點數',
    cell: ({ row }: any) => {
      const { totalSpent, points } = row.original
      return h('div', { class: 'space-y-1' }, [
        h('p', { class: 'text-sm text-gray-600 dark:text-gray-400' }, [
          '消費: ',
          h('span', { class: 'font-semibold' }, `$${Number(totalSpent || 0).toLocaleString()}`)
        ]),
        h('p', { class: 'text-sm text-gray-600 dark:text-gray-400' }, [
          '點數: ',
          h('span', { class: 'font-semibold' }, points || 0)
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
            onClick: () => viewMember(row.original)
          })
        ),
        // 編輯按鈕
        h(UTooltip, { text: '編輯會員' }, () =>
          h(UButton, {
            icon: 'i-heroicons-pencil',
            size: 'sm',
            color: 'warning',
            variant: 'soft',
            onClick: () => editMember(row.original)
          })
        ),
        // 刪除按鈕
        h(UTooltip, { text: '刪除會員' }, () =>
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
  return searchQuery.value || selectedLevel.value
})

const activeCount = computed(() => {
  return members.value.filter(m => m.user?.status === 'active').length
})

const newThisMonth = computed(() => {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return members.value.filter(m => new Date(m.createdAt) >= thisMonthStart).length
})

const vipCount = computed(() => {
  return members.value.filter(m =>
    m.level === MemberLevel.PLATINUM || m.level === MemberLevel.DIAMOND
  ).length
})

// Methods
const fetchMembers = async () => {
  isLoading.value = true
  try {
    const params: MemberQueryParams = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      sortBy: 'createdAt',
      sortOrder: SortOrder.DESC,
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (selectedLevel.value) {
      params.level = selectedLevel.value
    }

    const result = await membersApi.getAll(params)
    members.value = result.data
    pagination.value = {
      ...pagination.value,
      total: result.meta.total,
      totalPages: result.meta.totalPages,
    }
  } catch (error: any) {
    console.error('獲取會員失敗:', error)
    // TODO: Show error toast
  } finally {
    isLoading.value = false
  }
}

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      pagination.value.page = 1
      fetchMembers()
    }, 500)
  }
})()

const clearFilters = () => {
  searchQuery.value = ''
  selectedLevel.value = null
  pagination.value.page = 1
  fetchMembers()
}

const openCreateModal = () => {
  editingMember.value = null
  memberForm.value = {
    realName: '',
    phone: '',
    birthday: '',
    gender: null,
    postalCode: '',
    city: '',
    district: '',
    address: '',
    level: MemberLevel.BRONZE,
    points: 0,
    newsletterSubscribed: true,
  }
  isModalOpen.value = true
}

const viewMember = (member: Member) => {
  console.log('viewMember clicked:', member)
  viewingMember.value = member
  isViewModalOpen.value = true
  console.log('isViewModalOpen set to:', isViewModalOpen.value)
}

const editMember = (member: Member) => {
  console.log('editMember clicked:', member)
  editingMember.value = member
  memberForm.value = {
    realName: member.realName || '',
    phone: member.phone || '',
    birthday: member.birthday || '',
    gender: member.gender || null,
    postalCode: member.postalCode || '',
    city: member.city || '',
    district: member.district || '',
    address: member.address || '',
    level: member.level,
    points: member.points,
    newsletterSubscribed: member.newsletterSubscribed,
  }
  isModalOpen.value = true
  console.log('isModalOpen set to:', isModalOpen.value)
}

const editFromView = () => {
  if (viewingMember.value) {
    isViewModalOpen.value = false
    editMember(viewingMember.value)
  }
}

const saveMember = async () => {
  isSaving.value = true
  try {
    if (editingMember.value) {
      await membersApi.update(editingMember.value.id, memberForm.value)
    } else {
      await membersApi.create(memberForm.value)
    }
    isModalOpen.value = false
    fetchMembers()
    // TODO: Show success toast
  } catch (error: any) {
    console.error('儲存會員失敗:', error)
    // TODO: Show error toast
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (member: Member) => {
  deletingMember.value = member
  isDeleteModalOpen.value = true
}

const deleteMember = async () => {
  if (!deletingMember.value) return

  isDeleting.value = true
  try {
    await membersApi.delete(deletingMember.value.id)
    isDeleteModalOpen.value = false
    fetchMembers()
    // TODO: Show success toast
  } catch (error: any) {
    console.error('刪除會員失敗:', error)
    // TODO: Show error toast
  } finally {
    isDeleting.value = false
  }
}

// Helper Functions
const getLevelLabel = (level: MemberLevel): string => {
  const labels = {
    [MemberLevel.BRONZE]: '銅級',
    [MemberLevel.SILVER]: '銀級',
    [MemberLevel.GOLD]: '金級',
    [MemberLevel.PLATINUM]: '白金',
    [MemberLevel.DIAMOND]: '鑽石',
  }
  return labels[level] || level
}

const getLevelColor = (level: MemberLevel): string => {
  const colors = {
    [MemberLevel.BRONZE]: 'orange',
    [MemberLevel.SILVER]: 'gray',
    [MemberLevel.GOLD]: 'yellow',
    [MemberLevel.PLATINUM]: 'cyan',
    [MemberLevel.DIAMOND]: 'purple',
  }
  return colors[level] || 'gray'
}

const getStatusLabel = (status: string): string => {
  return status === 'active' ? '活躍' : '停用'
}

const getGenderLabel = (gender?: string): string => {
  const labels = {
    male: '男性',
    female: '女性',
    other: '其他',
  }
  return gender ? labels[gender as keyof typeof labels] : '-'
}

const formatDate = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-TW')
}

const formatDateTime = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-TW')
}

// Lifecycle
onMounted(() => {
  fetchMembers()
})
</script>


<style scoped>
</style>
