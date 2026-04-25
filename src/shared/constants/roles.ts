export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  OPERATIONS_HEAD: 'OPERATIONS_HEAD',
  OM: 'OM',
  EMPLOYEE: 'EMPLOYEE',
  SALES: 'SALES',
  ACCOUNTS: 'ACCOUNTS',
  HR: 'HR',
  WEB_MANAGER: 'WEB_MANAGER',
  FREELANCER: 'FREELANCER',
  INTERN: 'INTERN',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

export const ADMIN_ROLES: readonly string[] = ['SUPER_ADMIN', 'MANAGER'] as const
export const HR_ROLES: readonly string[] = ['SUPER_ADMIN', 'MANAGER', 'HR'] as const
export const SALES_ROLES: readonly string[] = ['SUPER_ADMIN', 'MANAGER', 'SALES'] as const
export const ACCOUNTS_ROLES: readonly string[] = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'] as const
export const WEB_ROLES: readonly string[] = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER'] as const

export function isAdmin(user: { role?: string }): boolean {
  return ADMIN_ROLES.includes(user.role as UserRole)
}

export function hasRole(user: { role?: string; department?: string }, roles: string[], departments?: string[]): boolean {
  if (roles.includes(user.role || '')) return true
  if (departments && departments.includes(user.department || '')) return true
  return false
}
