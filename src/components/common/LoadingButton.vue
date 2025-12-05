<template>
  <UButton
    :label="computedLabel"
    :icon="computedIcon"
    :loading="loading"
    :disabled="disabled || loading"
    :color="color"
    :variant="variant"
    :size="size"
    :block="block"
    @click="handleClick"
  >
    <slot />
  </UButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  icon?: string
  loadingText?: string
  loadingIcon?: string
  loading?: boolean
  disabled?: boolean
  color?: string
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'solid',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Computed
const computedLabel = computed(() => {
  if (props.loading && props.loadingText) {
    return props.loadingText
  }
  return props.label
})

const computedIcon = computed(() => {
  if (props.loading && props.loadingIcon) {
    return props.loadingIcon
  }
  return props.icon
})

// Methods
const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>
