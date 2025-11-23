import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<unknown[]>([])
  const isLoading = ref(false)

  return {
    notifications,
    isLoading,
  }
})

