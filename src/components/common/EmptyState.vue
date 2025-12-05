<template>
  <div class="flex flex-col items-center justify-center py-12 px-4">
    <!-- Icon -->
    <div
      class="mb-4 rounded-full p-4"
      :class="iconBgClass"
    >
      <UIcon
        :name="icon"
        :class="iconSizeClass"
        class="text-gray-400 dark:text-gray-500"
      />
    </div>

    <!-- Title -->
    <h3
      v-if="title"
      class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
    >
      {{ title }}
    </h3>

    <!-- Description -->
    <p
      v-if="description"
      class="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6"
    >
      {{ description }}
    </p>

    <!-- Custom Content Slot -->
    <div v-if="$slots.default" class="mb-6">
      <slot />
    </div>

    <!-- Action Button -->
    <UButton
      v-if="actionLabel"
      :label="actionLabel"
      :icon="actionIcon"
      :color="actionColor"
      :variant="actionVariant"
      @click="handleAction"
    />

    <!-- Custom Actions Slot -->
    <div v-if="$slots.actions" class="flex gap-3 mt-4">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  iconSize?: 'sm' | 'md' | 'lg' | 'xl'
  title?: string
  description?: string
  actionLabel?: string
  actionIcon?: string
  actionColor?: string
  actionVariant?: 'solid' | 'soft' | 'outline' | 'ghost'
  showBackground?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-heroicons-inbox',
  iconSize: 'xl',
  actionColor: 'primary',
  actionVariant: 'solid',
  showBackground: true,
})

const emit = defineEmits<{
  action: []
}>()

// Computed
const iconBgClass = computed(() => {
  if (!props.showBackground) return ''
  return 'bg-gray-100 dark:bg-gray-800'
})

const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }
  return sizes[props.iconSize]
})

// Methods
const handleAction = () => {
  emit('action')
}
</script>
