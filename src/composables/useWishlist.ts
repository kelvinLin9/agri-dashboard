import { ref, computed } from 'vue'
import { wishlistApi, type WishlistItem } from '@/api/wishlist'

// 全域狀態
const wishlistItems = ref<WishlistItem[]>([])
const isLoading = ref(false)
const isInitialized = ref(false)

export function useWishlist() {
  // 收藏的商品 ID Set（用於快速查詢）
  const wishlistProductIds = computed(() => {
    return new Set(wishlistItems.value.map(item => item.productId))
  })

  // 收藏數量
  const wishlistCount = computed(() => wishlistItems.value.length)

  // 檢查商品是否已收藏
  const isInWishlist = (productId: number | string) => {
    const numId = typeof productId === 'string' ? parseInt(productId, 10) : productId
    return wishlistProductIds.value.has(numId)
  }

  // 載入收藏清單
  const fetchWishlist = async () => {
    if (isLoading.value) return

    isLoading.value = true
    try {
      wishlistItems.value = await wishlistApi.getAll()
      isInitialized.value = true
    } catch (error) {
      console.error('載入收藏清單失敗:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 切換收藏狀態
  const toggleWishlist = async (productId: number | string) => {
    const numId = typeof productId === 'string' ? parseInt(productId, 10) : productId
    try {
      const result = await wishlistApi.toggle(numId)

      if (result.isInWishlist) {
        // 新增到本地狀態（簡化版，不包含完整 product 資料）
        wishlistItems.value.push({
          id: `temp-${numId}`,
          productId: numId,
          product: {} as any,
          createdAt: new Date().toISOString(),
        })
      } else {
        // 從本地狀態移除
        wishlistItems.value = wishlistItems.value.filter(
          item => item.productId !== numId
        )
      }

      return result.isInWishlist
    } catch (error) {
      console.error('切換收藏狀態失敗:', error)
      throw error
    }
  }

  // 從收藏清單移除
  const removeFromWishlist = async (productId: number) => {
    try {
      await wishlistApi.remove(productId)
      wishlistItems.value = wishlistItems.value.filter(
        item => item.productId !== productId
      )
    } catch (error) {
      console.error('移除收藏失敗:', error)
      throw error
    }
  }

  return {
    wishlistItems,
    wishlistCount,
    isLoading,
    isInitialized,
    isInWishlist,
    fetchWishlist,
    toggleWishlist,
    removeFromWishlist,
  }
}
