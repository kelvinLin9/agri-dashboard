<template>
  <UCard>
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ title }}
        </p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {{ formattedValue }}
        </p>

        <!-- 趨勢指示器 -->
        <div v-if="trend" class="flex items-center mt-2 text-sm">
          <UIcon
            :name="
              trend.direction === 'up'
                ? 'i-heroicons-arrow-trending-up'
                : trend.direction === 'down'
                  ? 'i-heroicons-arrow-trending-down'
                  : 'i-heroicons-minus'
            "
            :class="getTrendColor(trend.direction)"
            class="w-4 h-4"
          />
          <span :class="getTrendColor(trend.direction)" class="ml-1 font-semibold">
            {{ Math.abs(trend.percentage) }}%
          </span>
          <span class="text-gray-500 dark:text-gray-400 ml-1">{{ trend.label || 'vs. 昨日' }}</span>
        </div>
      </div>

      <!-- 圖標 -->
      <div
        :class="`bg-${color}-100 dark:bg-${color}-900/20 p-3 rounded-lg flex items-center justify-center`"
      >
        <UIcon :name="icon" :class="`text-${color}-600 dark:text-${color}-400 w-6 h-6`" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TrendData {
  percentage: number
  direction: 'up' | 'down' | 'stable'
  label?: string
}

const props = withDefaults(
  defineProps<{
    title: string
    value: number | string
    icon: string
    color?: string
    trend?: TrendData
    formatter?: (value: number | string) => string
  }>(),
  {
    color: 'primary',
  }
)

const formattedValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value)
  }
  
  // 如果是數字，自動格式化
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  
  return props.value
})

function getTrendColor(direction: string): string {
  if (direction === 'up') {
    return 'text-green-600 dark:text-green-400'
  } else if (direction === 'down') {
    return 'text-red-600 dark:text-red-400'
  }
  return 'text-gray-500 dark:text-gray-400'
}
</script>
