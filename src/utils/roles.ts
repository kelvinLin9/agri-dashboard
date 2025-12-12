/**
 * 用戶角色定義
 * 與後端 UserRole enum 保持同步
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  CUSTOMER_SERVICE = 'customer_service',
  CUSTOMER = 'customer',
}

/**
 * 管理員角色列表
 * 包含所有具有後台管理權限的角色
 */
export const ADMIN_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.OPERATOR,
  UserRole.CUSTOMER_SERVICE,
]

/**
 * 檢查是否為管理員角色
 * @param role 用戶角色
 * @returns 是否為管理員
 */
export function isAdmin(role: string | undefined | null): boolean {
  if (!role) return false
  return ADMIN_ROLES.includes(role as UserRole)
}

/**
 * 檢查用戶是否擁有指定角色之一
 * @param userRole 用戶的當前角色
 * @param allowedRoles 允許的角色列表
 * @returns 是否有權限
 */
export function hasRole(
  userRole: string | undefined | null,
  allowedRoles: UserRole[] | string[]
): boolean {
  if (!userRole) return false
  return (allowedRoles as string[]).includes(userRole)
}

/**
 * 檢查是否為超級管理員
 * @param role 用戶角色
 * @returns 是否為超級管理員
 */
export function isSuperAdmin(role: string | undefined | null): boolean {
  return role === UserRole.SUPER_ADMIN
}

/**
 * 檢查是否為一般客戶
 * @param role 用戶角色
 * @returns 是否為客戶
 */
export function isCustomer(role: string | undefined | null): boolean {
  return role === UserRole.CUSTOMER
}
