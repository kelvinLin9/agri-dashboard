import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', () => {
  const products = ref<unknown[]>([])
  const isLoading = ref(false)

  return {
    products,
    isLoading,
  }
})

