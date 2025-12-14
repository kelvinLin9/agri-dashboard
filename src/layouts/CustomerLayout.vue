<template>
  <div>
    <!-- Customer Header -->
    <CustomerHeader />

    <!-- Main Content -->
    <UMain>
      <UContainer>
        <slot />
      </UContainer>
    </UMain>

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
