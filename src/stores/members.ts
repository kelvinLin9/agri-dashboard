import { defineStore } from 'pinia'

export const useMembersStore = defineStore('members', () => {
  const members = ref<unknown[]>([])
  const isLoading = ref(false)

  return {
    members,
    isLoading,
  }
})

