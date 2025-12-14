/**
 * 系統設定相關類型
 */

// 設定值類型
export type SettingType = 'string' | 'number' | 'boolean' | 'json'

// 設定群組
export type SettingGroup = 'store' | 'shipping' | 'order' | 'notification'

// 設定項目
export interface Setting {
  key: string
  value: any
  type: SettingType
  group: SettingGroup
  description: string | null
  updatedAt: string
}

// 更新設定 DTO
export interface UpdateSettingItem {
  key: string
  value: any
  type?: SettingType
}

// 批量更新設定 DTO
export interface UpdateSettingsDto {
  settings: UpdateSettingItem[]
}

// 運費設定
export interface ShippingConfig {
  freeThreshold: number
  baseFee: number
  coldFee: number
  islandFee: number
}
