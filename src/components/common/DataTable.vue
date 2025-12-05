<template>
  <div class="space-y-4">
    <UTable
      :data="data"
      :columns="columns"
      :loading="loading"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </UTable>
    
    <div v-if="showPagination" class="flex justify-between items-center">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        顯示 {{ paginationInfo.start }} 到 {{ paginationInfo.end }} 筆，共 {{ total }} 筆
      </div>
      
      <Pagination
        v-model:current-page="currentPageModel"
        :total="total"
        :page-size="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Pagination from './Pagination.vue'

interface Props {
  data: any[]
  columns: any[]
  loading?: boolean
  currentPage?: number
  total?: number
  pageSize?: number
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentPage: 1,
  total: 0,
  pageSize: 10,
  showPagination: true,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value),
})

const paginationInfo = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return { start, end }
})
</script>
