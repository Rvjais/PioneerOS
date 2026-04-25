import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/shared/types/auth'

interface PageAuthOptions {
  roles?: UserRole[]
  departments?: string[]
  redirectTo?: string
}

/**
 * Page-level authentication and authorization guard
 *
 * Usage in a page.tsx:
 * ```ts
 * import { requirePageAuth } from '@/server/auth/pageAuth'
 *
 * export default async function AccountsPage() {
 *   const session = await requirePageAuth({
 *     roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
 *   })
 *   // ... rest of page
 * }
 * ```
 */
export async function requirePageAuth(options: PageAuthOptions = {}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const userRole = session.user?.role as UserRole
  const userDepartment = session.user?.department as string

  // Check role-based access
  if (options.roles && options.roles.length > 0) {
    // SUPER_ADMIN always has access
    if (userRole !== 'SUPER_ADMIN' && !options.roles.includes(userRole)) {
      // Check custom roles for any matching base role
      const customRoles = session.user?.customRoles || []
      const hasMatchingCustomRole = customRoles.some(
        (cr: { baseRoles: string[] }) => cr.baseRoles.some(br => options.roles?.includes(br as UserRole))
      )

      if (!hasMatchingCustomRole) {
        redirect(options.redirectTo || '/')
      }
    }
  }

  // Check department-based access
  if (options.departments && options.departments.length > 0) {
    // SUPER_ADMIN, MANAGER, OPERATIONS_HEAD, and OM always have access
    if (!['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM'].includes(userRole) && !options.departments.includes(userDepartment)) {
      // Also allow users in OPERATIONS department to bypass department checks
      if (userDepartment !== 'OPERATIONS') {
        // Check custom roles for any matching department
        const customRoles = session.user?.customRoles || []
        const hasMatchingDepartment = customRoles.some(
          (cr: { departments: string[] }) => cr.departments.some(d => options.departments?.includes(d))
        )

        if (!hasMatchingDepartment) {
          redirect(options.redirectTo || '/')
        }
      }
    }
  }

  return session
}

// Pre-defined access guards for common page types
export const ACCOUNTS_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  redirectTo: '/'
}

export const FINANCE_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
  redirectTo: '/'
}

export const HR_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR', 'OM'],
  redirectTo: '/'
}

export const SOCIAL_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM', 'EMPLOYEE', 'INTERN'],
  departments: ['SOCIAL'],
  redirectTo: '/'
}

export const SALES_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'SALES', 'EMPLOYEE', 'INTERN'],
  redirectTo: '/'
}

export const ADMIN_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN'],
  redirectTo: '/'
}

export const MANAGEMENT_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER'],
  redirectTo: '/'
}

export const OPERATIONS_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM', 'EMPLOYEE', 'INTERN'],
  departments: ['OPERATIONS'],
  redirectTo: '/'
}

// Broader management access that includes Operations Head and OM
export const LEADERSHIP_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM'],
  redirectTo: '/'
}

// OM has blended HR + Social Media access
export const OM_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OM'],
  redirectTo: '/'
}

export const WEB_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'EMPLOYEE', 'INTERN', 'WEB_DEVELOPER', 'WEB_DESIGNER', 'QA_TESTER', 'CONTENT_WRITER'],
  departments: ['WEB', 'AI'],
  redirectTo: '/'
}

export const SEO_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'INTERN'],
  departments: ['SEO'],
  redirectTo: '/'
}

export const ADS_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'EMPLOYEE', 'INTERN'],
  departments: ['ADS', 'MARKETING'],
  redirectTo: '/'
}

export const MANAGER_ACCESS: PageAuthOptions = {
  roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'],
  redirectTo: '/'
}
