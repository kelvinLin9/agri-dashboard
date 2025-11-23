<template>
  <UModal
    :open="isOpen"
    :dismissible="false"
    :close="false"
  >
    <template #default>
      <div class="flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p v-if="text" class="text-sm text-gray-600">{{ text }}</p>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: 'Loading...',
})
</script>

