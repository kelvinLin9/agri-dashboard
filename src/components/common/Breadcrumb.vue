<template>
  <nav v-if="items.length > 0" aria-label="麵包屑導航" class="text-sm">
    <ol class="flex flex-wrap items-center gap-1.5">
      <!-- Home -->
      <li>
        <router-link
          to="/"
          class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
        >
          <UIcon name="i-heroicons-home" class="w-4 h-4" />
          <span class="sr-only sm:not-sr-only">首頁</span>
        </router-link>
      </li>

      <!-- Separator -->
      <li class="text-gray-400 dark:text-gray-500">
        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
      </li>

      <!-- Dynamic Items -->
      <template v-for="(item, index) in items" :key="index">
        <li>
          <router-link
            v-if="item.to && index < items.length - 1"
            :to="item.to"
            class="text-gray-500 dark:text-gray-400 hover:text-harvest-600 dark:hover:text-harvest-400 transition-colors"
          >
            {{ item.label }}
          </router-link>
          <span
            v-else
            class="font-medium text-gray-800 dark:text-gray-200"
            aria-current="page"
          >
            {{ item.label }}
          </span>
        </li>

        <!-- Separator (except for last item) -->
        <li v-if="index < items.length - 1" class="text-gray-400 dark:text-gray-500">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
        </li>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
