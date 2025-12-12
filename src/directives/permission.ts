import type { Directive } from 'vue'
import { hasRole } from '@/utils/roles'

/**
 * 權限指令 v-permission
 *
 * 用於聲明式的權限控制，如果用戶角色不符合要求，元素會被移除
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 單個角色 -->
 *   <UButton v-permission="'admin'">管理員專用</UButton>
 *
 *   <!-- 多個角色 -->
 *   <UButton v-permission="['admin', 'super_admin']">刪除</UButton>
 *
 *   <!-- 使用 UserRole enum -->
 *   <UButton v-permission="[UserRole.ADMIN, UserRole.SUPER_ADMIN]">
 *     刪除
 *   </UButton>
 * </template>
 * ```
 *
 * 注意：
 * - 如果用戶未登入，元素會被移除
 * - 這僅用於 UI 控制，不能替代後端權限驗證
 */
export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    // 獲取用戶資訊
    const userStr = localStorage.getItem('user')

    // 未登入，移除元素
    if (!userStr) {
      el.remove()
      return
    }

    try {
      const user = JSON.parse(userStr)
      const userRole = user?.role

      // 沒有角色資訊，移除元素
      if (!userRole) {
        el.remove()
        return
      }

      // 獲取允許的角色
      const allowedRoles = binding.value
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

      // 檢查權限
      if (!hasRole(userRole, roles)) {
        el.remove()
      }
    } catch (error) {
      console.error('v-permission: Failed to parse user data', error)
      el.remove()
    }
  },
}

/**
 * 反向權限指令 v-permission-not
 *
 * 與 v-permission 相反，當用戶擁有指定角色時移除元素
 * 主要用於「非管理員才顯示」的場景
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 非管理員才看到的升級提示 -->
 *   <UAlert v-permission-not="['admin', 'super_admin']">
 *     升級為管理員以解鎖更多功能
 *   </UAlert>
 * </template>
 * ```
 */
export const vPermissionNot: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const userStr = localStorage.getItem('user')

    // 未登入，保留元素（顯示給未登入用戶）
    if (!userStr) {
      return
    }

    try {
      const user = JSON.parse(userStr)
      const userRole = user?.role

      if (!userRole) {
        return
      }

      const allowedRoles = binding.value
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

      // 如果用戶有這個角色，移除元素
      if (hasRole(userRole, roles)) {
        el.remove()
      }
    } catch (error) {
      console.error('v-permission-not: Failed to parse user data', error)
    }
  },
}
