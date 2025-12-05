<template>
  <UCard>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <slot />
      
      <div class="flex items-center gap-2">
        <UButton
          v-if="showReset"
          label="重置"
          icon="i-heroicons-arrow-path"
          variant="outline"
          size="sm"
          @click="$emit('reset')"
        />
        <UButton
          v-if="showSearch"
          label="搜尋"
          icon="i-heroicons-magnifying-glass"
          size="sm"
          @click="$emit('search')"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  showReset?: boolean
  showSearch?: boolean
}

withDefaults(defineProps<Props>(), {
  showReset: true,
  showSearch: false,
})

defineEmits<{
  reset: []
  search: []
}>()
</script>
