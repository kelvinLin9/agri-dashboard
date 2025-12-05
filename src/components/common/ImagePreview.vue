<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'max-w-4xl' }">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">圖片預覽</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div class="relative">
          <img
            :src="src"
            :alt="alt"
            class="w-full h-auto max-h-[70vh] object-contain"
          />
          
          <div v-if="title" class="mt-4 text-center text-gray-600 dark:text-gray-400">
            {{ title }}
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <UButton
              v-if="downloadable"
              label="下載"
              icon="i-heroicons-arrow-down-tray"
              variant="outline"
              @click="downloadImage"
            />
            <UButton
              label="關閉"
              @click="isOpen = false"
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
  src: string
  alt?: string
  title?: string
  downloadable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  downloadable: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = props.src
  link.download = props.alt || 'image'
  link.click()
}
</script>
