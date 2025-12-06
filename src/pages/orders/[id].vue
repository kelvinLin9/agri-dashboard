<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="container mx-auto px-6">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        class="mb-6"
        @click="router.back()"
      >
        返回訂單列表
      </UButton>

      <UCard>
        <div class="text-center py-16">
          <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 dark:text-gray-400 text-lg mb-4">訂單詳情頁面開發中...</p>
          <p class="text-sm text-gray-400">訂單 ID: {{ orderId }}</p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const orderId = route.params.id as string
</script>
