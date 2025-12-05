<template>
  <div class="flex items-center gap-2">
    <UInput
      :model-value="formattedStartDate"
      size="md"
      icon="i-heroicons-calendar"
      placeholder="開始日期"
      readonly
      @click="showPicker = true"
    />
    <span class="text-gray-500">至</span>
    <UInput
      :model-value="formattedEndDate"
      size="md"
      icon="i-heroicons-calendar"
      placeholder="結束日期"
      readonly
      @click="showPicker = true"
    />
    
    <UButton
      v-if="clearable && (startDate || endDate)"
      icon="i-heroicons-x-mark"
      size="sm"
      variant="ghost"
      @click="clearDates"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  startDate?: Date | null
  endDate?: Date | null
  clearable?: boolean
  format?: string
}

const props = withDefaults(defineProps<Props>(), {
  startDate: null,
  endDate: null,
  clearable: true,
  format: 'YYYY-MM-DD',
})

const emit = defineEmits<{
  'update:startDate': [date: Date | null]
  'update:endDate': [date: Date | null]
}>()

const showPicker = ref(false)

const formattedStartDate = computed(() => {
  if (!props.startDate) return ''
  return formatDate(props.startDate)
})

const formattedEndDate = computed(() => {
  if (!props.endDate) return ''
  return formatDate(props.endDate)
})

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const clearDates = () => {
  emit('update:startDate', null)
  emit('update:endDate', null)
}
</script>
