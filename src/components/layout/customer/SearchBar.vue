<template>
  <div class="relative">
    <UInput
      v-model="searchQuery"
      :placeholder="placeholder"
      icon="i-heroicons-magnifying-glass"
      size="md"
      class="w-64"
      :autofocus="autofocus"
      @keyup.enter="handleSearch"
    >
      <template v-if="searchQuery" #trailing>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="xs"
          class="-mr-1"
          @click="clearSearch"
        />
      </template>
    </UInput>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  placeholder?: string
  autofocus?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '搜尋商品...',
  autofocus: false,
})

const emit = defineEmits<{
  search: [query: string]
}>()

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/shop/products',
      query: { search: searchQuery.value.trim() }
    })
    emit('search', searchQuery.value.trim())
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>
