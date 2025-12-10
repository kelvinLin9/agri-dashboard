<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Customer Header -->
    <CustomerHeader />

    <!-- Main Content -->
    <main class="flex-1">
      <UContainer class="py-6">
        <slot />
      </UContainer>
    </main>

    <!-- Customer Footer -->
    <CustomerFooter />

    <!-- Floating Components -->
    <FloatingCart />
    <BackToTop />
    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
import CustomerHeader from '@/components/layout/customer/CustomerHeader.vue'
import CustomerFooter from '@/components/layout/customer/CustomerFooter.vue'
import FloatingCart from '@/components/FloatingCart.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import CookieConsent from '@/components/common/CookieConsent.vue'
</script>
