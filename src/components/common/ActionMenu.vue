<template>
  <UDropdown :items="menuItems" :popper="{ placement: 'bottom-end' }">
    <UButton
      :icon="triggerIcon"
      :size="size"
      :color="color"
      :variant="variant"
      :label="triggerLabel"
    />
  </UDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ActionItem {
  label: string
  icon?: string
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info' | 'neutral'
  click?: () => void
  disabled?: boolean
  slot?: string
}

interface Props {
  actions?: ActionItem[]
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  triggerIcon?: string
  triggerLabel?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: string
  variant?: 'solid' | 'soft' | 'outline' | 'ghost'
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  showView: true,
  showEdit: true,
  showDelete: true,
  triggerIcon: 'i-heroicons-ellipsis-vertical',
  size: 'sm',
  color: 'neutral',
  variant: 'ghost',
})

const emit = defineEmits<{
  view: []
  edit: []
  delete: []
}>()

// Computed
const menuItems = computed(() => {
  const items: any[] = []
  
  // 預設操作
  if (props.showView) {
    items.push({
      label: '查看',
      icon: 'i-heroicons-eye',
      click: () => emit('view'),
    })
  }
  
  if (props.showEdit) {
    items.push({
      label: '編輯',
      icon: 'i-heroicons-pencil',
      click: () => emit('edit'),
    })
  }
  
  // 自訂操作
  if (props.actions.length > 0) {
    if (items.length > 0) {
      items.push({ type: 'separator' })
    }
    
    props.actions.forEach(action => {
      items.push({
        label: action.label,
        icon: action.icon,
        click: action.click,
        disabled: action.disabled,
        color: action.color,
      })
    })
  }
  
  // 刪除操作（通常放最後）
  if (props.showDelete) {
    if (items.length > 0) {
      items.push({ type: 'separator' })
    }
    
    items.push({
      label: '刪除',
      icon: 'i-heroicons-trash',
      click: () => emit('delete'),
      color: 'error',
    })
  }
  
  return [items]
})
</script>
