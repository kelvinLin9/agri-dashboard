import { computed } from 'vue'
import { useAuth } from './useAuth'
import { UserRole, isAdmin as checkIsAdmin, isSuperAdmin as checkIsSuperAdmin, isCustomer as checkIsCustomer } from '@/utils/roles'

/**
 * 權限檢查 Composable
 *
 * 用於檢查用戶角色權限，主要用於管理後台的操作控制
 * 例如：顯示/隱藏「刪除」按鈕
 *
 * 注意：前端權限檢查僅用於 UX 優化，實際安全性由後端 API Guards 保證
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePermissions } from '@/composables/usePermissions'
 * import { UserRole } from '@/utils/roles'
 *
 * const { can, isAdmin } = usePermissions()
 * </script>
 *
 * <template>
 *   <div>
 *     <!-- 檢查特定角色 -->
 *     <UButton v-if="can([UserRole.ADMIN, UserRole.SUPER_ADMIN])">
 *       刪除商品
 *     </UButton>
 *
 *     <!-- 檢查是否為管理員 -->
 *     <NuxtLink v-if="isAdmin" to="/dashboard">
 *       管理後台
 *     </NuxtLink>
 *   </div>
 * </template>
 * ```
 */
export function usePermissions() {
  const { user, isAuthenticated, userRole } = useAuth()

  /**
   * 檢查用戶是否擁有指定角色之一
   *
   * @param allowedRoles 允許的角色，可以是單個角色或角色陣列
   * @returns 是否有權限
   *
   * @example
   * ```typescript
   * // 單個角色
   * can(UserRole.ADMIN)
   *
   * // 多個角色
   * can([UserRole.ADMIN, UserRole.SUPER_ADMIN])
   *
   * // 使用字串（不推薦，但支援）
   * can(['admin', 'super_admin'])
   * ```
   */
  const can = (allowedRoles: UserRole | UserRole[] | string | string[]): boolean => {
    // 未登入或沒有用戶資料
    if (!isAuthenticated.value || !userRole.value) {
      return false
    }

    // 標準化為陣列
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    // 檢查用戶角色是否在允許列表中
    return roles.includes(userRole.value as UserRole)
  }

  /**
   * 是否為管理員（任何管理角色）
   */
  const isAdmin = computed(() => {
    return checkIsAdmin(userRole.value)
  })

  /**
   * 是否為超級管理員
   */
  const isSuperAdmin = computed(() => {
    return checkIsSuperAdmin(userRole.value)
  })

  /**
   * 是否為一般客戶
   */
  const isCustomer = computed(() => {
    return checkIsCustomer(userRole.value)
  })

  /**
   * 檢查是否為指定角色
   *
   * @param role 要檢查的角色
   * @returns 是否為該角色
   */
  const is = (role: UserRole | string): boolean => {
    return userRole.value === role
  }

  return {
    can,
    is,
    isAdmin,
    isSuperAdmin,
    isCustomer,
    userRole,
    user,
  }
}
