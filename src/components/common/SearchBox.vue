<template>
  <UInput
    v-model="searchValue"
    :icon="icon"
    :placeholder="placeholder"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    @input="handleInput"
    @keyup.enter="handleEnter"
  >
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>
    
    <template #trailing>
      <UButton
        v-if="searchValue && clearable"
        icon="i-heroicons-x-mark"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="handleClear"
      />
      <slot v-else name="trailing" />
    </template>
  </UInput>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  debounce?: number
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  immediate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜尋...',
  icon: 'i-heroicons-magnifying-glass',
  size: 'md',
  debounce: 500,
  disabled: false,
  loading: false,
  clearable: true,
  immediate: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
  enter: [value: string]
}>()

// Local state
const searchValue = ref(props.modelValue)
let debounceTimeout: NodeJS.Timeout | null = null

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue
})

// Methods
const handleInput = () => {
  // Update model immediately
  emit('update:modelValue', searchValue.value)
  
  // Clear existing timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  // Set new timeout for search event
  if (props.debounce > 0) {
    debounceTimeout = setTimeout(() => {
      emit('search', searchValue.value)
    }, props.debounce)
  } else {
    // No debounce, emit immediately
    emit('search', searchValue.value)
  }
}

const handleClear = () => {
  searchValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
  
  // Emit search immediately when clearing
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  emit('search', '')
}

const handleEnter = () => {
  // Cancel debounce and search immediately on Enter
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  emit('enter', searchValue.value)
  emit('search', searchValue.value)
}

// Cleanup on unmount
const cleanup = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
}

// Lifecycle
if (props.immediate && searchValue.value) {
  emit('search', searchValue.value)
}

// Expose cleanup for parent component
defineExpose({
  cleanup,
})
</script>
