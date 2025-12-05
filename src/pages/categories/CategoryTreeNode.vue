<template>
  <div class="category-tree-node">
    <!-- Node Content -->
    <div 
      class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      :style="{ paddingLeft: `${level * 1.5 + 0.75}rem` }"
    >
      <!-- Expand/Collapse Button -->
      <button
        v-if="hasChildren"
        @click="toggleExpand"
        class="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <UIcon 
          :name="isExpanded ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
          class="w-4 h-4"
        />
      </button>
      <div v-else class="w-6 flex-shrink-0" />

      <!-- Folder Icon -->
      <UIcon 
        :name="hasChildren ? (isExpanded ? 'i-heroicons-folder-open' : 'i-heroicons-folder') : 'i-heroicons-document'"
        :class="category.isActive ? 'text-blue-500' : 'text-gray-400'"
        class="w-5 h-5 flex-shrink-0"
      />

      <!-- Category Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-900 dark:text-white truncate">
            {{ category.name }}
          </span>
          <UBadge
            v-if="!category.isActive"
            color="neutral"
            variant="soft"
            size="xs"
          >
            停用
          </UBadge>
        </div>
        <p class="text-xs text-gray-500 truncate">
          {{ category.slug }}
        </p>
      </div>

      <!-- Product Count (if available) -->
      <div v-if="category.productCount !== undefined" class="text-sm text-gray-500">
        {{ category.productCount }} 個產品
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <UTooltip text="查看詳情">
          <UButton
            icon="i-heroicons-eye"
            size="xs"
            color="info"
            variant="soft"
            @click="$emit('view', category)"
          />
        </UTooltip>
        <UTooltip text="編輯">
          <UButton
            icon="i-heroicons-pencil"
            size="xs"
            color="warning"
            variant="soft"
            @click="$emit('edit', category)"
          />
        </UTooltip>
        <UTooltip text="刪除">
          < UButton
            icon="i-heroicons-trash"
            size="xs"
            color="error"
            variant="soft"
            @click="$emit('delete', category)"
          />
        </UTooltip>
      </div>
    </div>

    <!-- Children (Recursive) -->
    <div v-if="hasChildren && isExpanded" class="children">
      <CategoryTreeNode
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :level="level + 1"
        @view="$emit('view', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  category: any
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
})

defineEmits<{
  view: [category: any]
  edit: [category: any]
  delete: [category: any]
}>()

const isExpanded = ref(props.level < 2) // 預設展開前兩層

const hasChildren = computed(() => {
  return props.category.children && props.category.children.length > 0
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.category-tree-node {
  @apply relative;
}

.children {
  @apply space-y-1;
}
</style>
