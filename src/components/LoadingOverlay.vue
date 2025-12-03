<template>
  <div v-if="isOpen">
    <!-- 頂部進度條 -->
    <div class="fixed top-0 left-0 right-0 z-[60]">
      <UProgress 
        :value="100"
        animation="carousel"
        size="xs"
        color="primary"
      />
    </div>
    
    <!-- 可選的半透明背景遮罩 -->
    <div 
      v-if="showBackdrop"
      class="fixed inset-0 z-50 bg-gray-900/10 dark:bg-gray-900/30 backdrop-blur-[2px] transition-opacity"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  text?: string
  showBackdrop?: boolean
}

withDefaults(defineProps<Props>(), {
  text: 'Loading...',
  showBackdrop: false,
})
</script>

