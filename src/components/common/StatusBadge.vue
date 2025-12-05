<template>
  <UBadge
    :color="badgeColor"
    :variant="variant"
    :size="size"
  >
    {{ badgeLabel }}
  </UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StatusType = 'order' | 'payment' | 'refund' | 'member' | 'notification' | 'product'

interface Props {
  status: string
  type: StatusType
  variant?: 'solid' | 'soft' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'soft',
  size: 'sm',
})

// Status configurations by type
const statusConfigs = {
  // 訂單狀態
  order: {
    pending: { label: '待處理', color: 'neutral' },
    paid: { label: '已付款', color: 'info' },
    processing: { label: '處理中', color: 'blue' },
    shipping: { label: '配送中', color: 'purple' },
    delivered: { label: '已送達', color: 'success' },
    completed: { label: '已完成', color: 'success' },
    cancelled: { label: '已取消', color: 'neutral' },
    refunded: { label: '已退款', color: 'warning' },
  },
  
  // 支付狀態
  payment: {
    pending: { label: '待支付', color: 'warning' },
    processing: { label: '處理中', color: 'blue' },
    completed: { label: '已完成', color: 'success' },
    failed: { label: '失敗', color: 'error' },
    refunded: { label: '已退款', color: 'orange' },
  },
  
  // 退款狀態
  refund: {
    pending: { label: '待審核', color: 'warning' },
    approved: { label: '已批准', color: 'success' },
    rejected: { label: '已拒絕', color: 'error' },
    processing: { label: '處理中', color: 'blue' },
    completed: { label: '已完成', color: 'success' },
  },
  
  // 會員等級
  member: {
    bronze: { label: '銅牌會員', color: 'orange' },
    silver: { label: '銀牌會員', color: 'neutral' },
    gold: { label: '金牌會員', color: 'warning' },
    platinum: { label: '白金會員', color: 'purple' },
    diamond: { label: '鑽石會員', color: 'blue' },
  },
  
  // 通知狀態
  notification: {
    pending: { label: '待發送', color: 'neutral' },
    sent: { label: '已發送', color: 'blue' },
    delivered: { label: '已送達', color: 'info' },
    read: { label: '已讀', color: 'success' },
    failed: { label: '失敗', color: 'error' },
  },
  
  // 產品狀態
  product: {
    active: { label: '上架中', color: 'success' },
    inactive: { label: '已下架', color: 'neutral' },
    out_of_stock: { label: '缺貨', color: 'error' },
    draft: { label: '草稿', color: 'neutral' },
  },
} as const

// Computed properties
const badgeColor = computed(() => {
  const config = statusConfigs[props.type] as any
  if (!config) return 'neutral'
  
  const statusConfig = config[props.status]
  return statusConfig?.color || 'neutral'
})

const badgeLabel = computed(() => {
  const config = statusConfigs[props.type] as any
  if (!config) return props.status
  
  const statusConfig = config[props.status]
  return statusConfig?.label || props.status
})
</script>
