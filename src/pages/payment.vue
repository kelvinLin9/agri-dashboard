<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="container mx-auto px-6 max-w-2xl">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold">支付</h1>
        </template>

        <div class="space-y-6">
          <div class="text-center">
            <p class="text-gray-600 dark:text-gray-400">訂單編號: {{ orderId }}</p>
            <p class="text-3xl font-bold text-green-600 mt-2">${{ amount.toLocaleString() }}</p>
          </div>

          <UButton block size="xl" @click="proceedToPayment">
            前往支付
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const orderId = ref(route.query.orderId as string || '')
const amount = ref(1000)

const proceedToPayment = () => {
  router.push('/payment/success')
}

onMounted(() => {
  if (!orderId.value) {
    router.push('/cart')
  }
})
</script>
