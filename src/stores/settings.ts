import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { settingsApi } from '@/api/settings'
import type { Setting, UpdateSettingItem, ShippingConfig, SettingGroup } from '@/api/types/settings'

/**
 * 系統設定 Store
 */
export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<Setting[]>([])
  const shippingConfig = ref<ShippingConfig | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const storeSettings = computed(() =>
    settings.value.filter(s => s.group === 'store')
  )

  const shippingSettings = computed(() =>
    settings.value.filter(s => s.group === 'shipping')
  )

  const orderSettings = computed(() =>
    settings.value.filter(s => s.group === 'order')
  )

  const getSetting = (key: string) => {
    return settings.value.find(s => s.key === key)?.value
  }

  // Actions
  const fetchAll = async () => {
    isLoading.value = true
    error.value = null
    try {
      settings.value = await settingsApi.getAll()
    } catch (err: any) {
      error.value = err.message || '載入設定失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchByGroup = async (group: SettingGroup) => {
    isLoading.value = true
    error.value = null
    try {
      const groupSettings = await settingsApi.getByGroup(group)
      // 合併到 settings，替換同 key 的
      groupSettings.forEach((gs: Setting) => {
        const idx = settings.value.findIndex(s => s.key === gs.key)
        if (idx >= 0) {
          settings.value[idx] = gs
        } else {
          settings.value.push(gs)
        }
      })
    } catch (err: any) {
      error.value = err.message || '載入設定失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchShippingConfig = async () => {
    try {
      shippingConfig.value = await settingsApi.getShippingConfig()
      return shippingConfig.value
    } catch (err: any) {
      error.value = err.message || '載入運費設定失敗'
      throw err
    }
  }

  const updateSettings = async (items: UpdateSettingItem[]) => {
    isSaving.value = true
    error.value = null
    try {
      const updated = await settingsApi.updateSettings({ settings: items })
      // 更新本地狀態
      updated.forEach((us: Setting) => {
        const idx = settings.value.findIndex(s => s.key === us.key)
        if (idx >= 0) {
          settings.value[idx] = us
        } else {
          settings.value.push(us)
        }
      })
      return updated
    } catch (err: any) {
      error.value = err.message || '儲存設定失敗'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  return {
    // State
    settings,
    shippingConfig,
    isLoading,
    isSaving,
    error,
    // Getters
    storeSettings,
    shippingSettings,
    orderSettings,
    getSetting,
    // Actions
    fetchAll,
    fetchByGroup,
    fetchShippingConfig,
    updateSettings,
  }
})
