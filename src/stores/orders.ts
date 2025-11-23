import { defineStore } from 'pinia'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<unknown[]>([])
  const isLoading = ref(false)

  return {
    orders,
    isLoading,
  }
})

