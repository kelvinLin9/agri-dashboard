import { defineStore } from 'pinia'

export const usePagesStore = defineStore('pages', () => {
  const pages = ref<unknown[]>([])
  const isLoading = ref(false)

  return {
    pages,
    isLoading,
  }
})

