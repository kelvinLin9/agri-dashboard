import { defineStore } from 'pinia'

export const useLogsStore = defineStore('logs', () => {
  const logs = ref<unknown[]>([])
  const isLoading = ref(false)

  return {
    logs,
    isLoading,
  }
})

