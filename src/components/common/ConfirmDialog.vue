<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <!-- Icon based on type -->
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              :class="iconBgClass"
            >
              <UIcon :name="iconName" class="w-6 h-6" :class="iconColorClass" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ title }}
            </h3>
          </div>
        </template>

        <!-- Message Content -->
        <div class="py-4">
          <p class="text-gray-600 dark:text-gray-400" v-html="message" />
          
          <!-- Warning box for danger type -->
          <div
            v-if="type === 'danger' && showWarning"
            class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-800 dark:text-red-200">
              ⚠️ {{ warningMessage || '此操作無法復原，請謹慎操作。' }}
            </p>
          </div>

          <!-- Custom slot for additional content -->
          <slot name="content" />
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              :label="cancelLabel"
              color="neutral"
              variant="soft"
              :disabled="loading"
              @click="handleCancel"
            />
            <UButton
              :label="confirmLabel"
              :color="confirmButtonColor"
              :loading="loading"
              @click="handleConfirm"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  open?: boolean
  title?: string
  message: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  showWarning?: boolean
  warningMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '確認操作',
  type: 'info',
  confirmLabel: '確認',
  cancelLabel: '取消',
  loading: false,
  showWarning: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

// Computed
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const iconName = computed(() => {
  const icons = {
    danger: 'i-heroicons-exclamation-triangle',
    warning: 'i-heroicons-exclamation-circle',
    info: 'i-heroicons-information-circle',
    success: 'i-heroicons-check-circle',
  }
  return icons[props.type]
})

const iconBgClass = computed(() => {
  const classes = {
    danger: 'bg-red-100 dark:bg-red-900/30',
    warning: 'bg-orange-100 dark:bg-orange-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
  }
  return classes[props.type]
})

const iconColorClass = computed(() => {
  const classes = {
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-orange-600 dark:text-orange-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
  }
  return classes[props.type]
})

const confirmButtonColor = computed(() => {
  const colors = {
    danger: 'error',
    warning: 'warning',
    info: 'primary',
    success: 'success',
  }
  return colors[props.type]
})

// Methods
const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>
