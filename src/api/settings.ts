import apiClient from './apiClient'
import type { Setting, UpdateSettingsDto, ShippingConfig, SettingGroup } from './types/settings'

/**
 * 系統設定 API
 */
export const settingsApi = {
  /**
   * 取得所有設定
   */
  getAll: async (): Promise<Setting[]> => {
    const response = await apiClient.get<{ data: Setting[] }>('/settings')
    return response.data.data
  },

  /**
   * 依群組取得設定
   */
  getByGroup: async (group: SettingGroup): Promise<Setting[]> => {
    const response = await apiClient.get<{ data: Setting[] }>(`/settings/group/${group}`)
    return response.data.data
  },

  /**
   * 取得運費設定（公開）
   */
  getShippingConfig: async (): Promise<ShippingConfig> => {
    const response = await apiClient.get<{ data: ShippingConfig }>('/settings/shipping')
    return response.data.data
  },

  /**
   * 批量更新設定
   */
  updateSettings: async (data: UpdateSettingsDto): Promise<Setting[]> => {
    const response = await apiClient.put<{ data: Setting[] }>('/settings', data)
    return response.data.data
  },
}
