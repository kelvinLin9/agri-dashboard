<template>
  <div class="flex items-center gap-2">
    <UButton
      v-for="page in visiblePages"
      :key="page"
      :label="page.toString()"
      :variant="page === currentPage ? 'solid' : 'ghost'"
      :color="page === currentPage ? 'primary' : 'neutral'"
      size="sm"
      @click="changePage(page)"
    />
    
    <div class="text-sm text-gray-600 dark:text-gray-400 ml-2">
      共 {{ total }} 筆
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  total: number
  pageSize?: number
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  maxVisible: 5,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const pages: number[] = []
  const half = Math.floor(props.maxVisible / 2)
  
  let start = Math.max(1, props.currentPage - half)
  const end = Math.min(totalPages.value, start + props.maxVisible - 1)
  
  if (end - start + 1 < props.maxVisible) {
    start = Math.max(1, end - props.maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const changePage = (page: number) => {
  if (page !== props.currentPage && page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}
</script>
