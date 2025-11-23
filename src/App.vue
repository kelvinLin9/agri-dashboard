<template>
  <UApp>
    <Header />
    <UContainer>
      <RouterView />
    </UContainer>
    <LoadingOverlay :is-open="isLoading" />
  </UApp>
</template>

<script setup lang="ts">
import Header from './layout/Header.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
// TODO: 研究為何沒有 auto-import
// import { isLoading } from '@/utils/loading'
</script>
