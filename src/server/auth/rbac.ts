/**
 * Role-Based Access Control (RBAC) Utility
 *
 * @deprecated For new API routes, prefer using:
 * - `withAuth` from '@/server/auth/withAuth' for simple routes
 * - `createRoute` from '@/server/apiRoute' for routes with validation
 *
 * Both provide cleaner syntax with less boilerplate.
 *
 * Legacy usage (still supported):
 *   const auth = await requireAuth({ roles: ['SUPER_ADMIN', 'MANAGER'] })
 *   if (auth.error) return auth.error
 *   const { session, user } = auth
 */

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import type { UserRole, Department } from '@/shared/types/auth'

// Re-export for convenience
export type { UserRole, Department }

export interface AuthOptions {
  // Require specific roles (any of these)
  roles?: UserRole[]
  // Require specific departments (any of these)
  departments?: Department[]
  // Allow all authenticated users
  allowAny?: boolean
  // Custom authorization check
  customCheck?: (user: { id: string; role: string; department: string }) => boolean | Promise<boolean>
}

export interface AuthResult {
  session: {
    user: {
      id: string
      role: string
      department: string
      empId: string
      firstName: string
      lastName?: string
      email?: string
    }
  }
  user: {
    id: string
    role: string
    department: string
    empId: string
    firstName: string
    lastName: string | null
    email: string | null
    phone: string
    status: string
  }
}

export interface AuthError {
  error: NextResponse
}

/**
 * Require authentication and optionally specific roles/departments
 */
export async function requireAuth(
  options: AuthOptions = { allowAny: true }
): Promise<AuthResult | AuthError> {
  const session = await getServerSession(authOptions)

  // Check if authenticated
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Get user with current role/department
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      department: true,
      empId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
    },
  })

  if (!user) {
    return {
      error: NextResponse.json({ error: 'User not found' }, { status: 401 }),
    }
  }

  // Check if user is active
  if (user.status !== 'ACTIVE' && user.status !== 'PROBATION') {
    return {
      error: NextResponse.json({ error: 'Account inactive' }, { status: 403 }),
    }
  }

  // If allowAny, return authenticated user
  if (options.allowAny) {
    return { session: session as AuthResult['session'], user }
  }

  // Check roles
  if (options.roles && options.roles.length > 0) {
    if (!options.roles.includes(user.role as UserRole)) {
      return {
        error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      }
    }
  }

  // Check departments
  if (options.departments && options.departments.length > 0) {
    if (!options.departments.includes(user.department as Department)) {
      return {
        error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      }
    }
  }

  // Custom check
  if (options.customCheck) {
    const allowed = await options.customCheck(user)
    if (!allowed) {
      return {
        error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      }
    }
  }

  return { session: session as AuthResult['session'], user }
}

/**
 * Check if the result is an error
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result
}

// Common role combinations for convenience
export const ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN']
export const MANAGEMENT_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM']
export const LEADERSHIP_ROLES = MANAGEMENT_ROLES
export const SALES_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'SALES']
export const HR_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'HR', 'OM']
export const ACCOUNTS_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS']
export const SOCIAL_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'OM']
export const OM_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'OM'] // OM has HR + Social access

// Web Team role combinations
export const WEB_MANAGEMENT_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER']
export const WEB_DESIGN_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'WEB_DESIGNER']
export const WEB_DEV_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'WEB_DEVELOPER']
export const WEB_CONTENT_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'CONTENT_WRITER']
export const WEB_QA_ROLES: UserRole[] = ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'QA_TESTER']
export const WEB_ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'MANAGER',
  'WEB_MANAGER',
  'WEB_DESIGNER',
  'WEB_DEVELOPER',
  'CONTENT_WRITER',
  'QA_TESTER',
]

export const ALL_STAFF_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'MANAGER',
  'OPERATIONS_HEAD',
  'OM',
  'EMPLOYEE',
  'FREELANCER',
  'SALES',
  'ACCOUNTS',
  'HR',
  'INTERN',
  'WEB_MANAGER',
  'WEB_DESIGNER',
  'WEB_DEVELOPER',
  'CONTENT_WRITER',
  'QA_TESTER',
]

/**
 * Helper to check if user can perform action on a resource
 */
export function canAccessResource(
  user: { id: string; role: string },
  resourceOwnerId: string | null,
  allowedRoles: UserRole[] = MANAGEMENT_ROLES
): boolean {
  // Admins and managers can access anything
  if (allowedRoles.includes(user.role as UserRole)) {
    return true
  }
  // Otherwise only the owner can access
  return resourceOwnerId === user.id
}

/**
 * Helper to check if user is admin, manager, or operations head
 */
export function isAdminOrManager(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM'].includes(role)
}

/**
 * Helper to check if user is in leadership (can see all data)
 */
export function isLeadership(role: string, department?: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM'].includes(role) || department === 'OPERATIONS'
}

/**
 * Helper to check if user has HR access (OM has HR access)
 */
export function hasHRAccess(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'HR', 'OM'].includes(role)
}

/**
 * Helper to check if user has Social Media access (OM has Social access)
 */
export function hasSocialAccess(role: string, department?: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OM'].includes(role) || department === 'SOCIAL'
}

/**
 * Helper to check if user is super admin
 */
export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN'
}

/**
 * Helper to check if user has Web Team management access
 */
export function hasWebManagementAccess(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER'].includes(role)
}

/**
 * Helper to check if user has Web Team access (any web role)
 */
export function hasWebTeamAccess(role: string, department?: string): boolean {
  return (
    ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER', 'WEB_DESIGNER', 'WEB_DEVELOPER', 'CONTENT_WRITER', 'QA_TESTER'].includes(
      role
    ) || department === 'WEB'
  )
}

/**
 * Helper to check if user is a Web Manager
 */
export function isWebManager(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'WEB_MANAGER'].includes(role)
}

/**
 * Helper to check if user is a Web Designer
 */
export function isWebDesigner(role: string): boolean {
  return ['WEB_DESIGNER', 'WEB_MANAGER', 'SUPER_ADMIN', 'MANAGER'].includes(role)
}

/**
 * Helper to check if user is a Web Developer
 */
export function isWebDeveloper(role: string): boolean {
  return ['WEB_DEVELOPER', 'WEB_MANAGER', 'SUPER_ADMIN', 'MANAGER'].includes(role)
}

/**
 * Helper to check if user can manage infrastructure (domains, hosting)
 */
export function canManageInfrastructure(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER'].includes(role)
}

/**
 * Helper to check if user can manage AMC contracts
 */
export function canManageAMC(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'ACCOUNTS'].includes(role)
}

/**
 * Helper to check if user can manage upsells
 */
export function canManageUpsells(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'SALES'].includes(role)
}

/**
 * Helper to check if user can approve reimbursements
 */
export function canApproveReimbursements(role: string): boolean {
  return ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER', 'ACCOUNTS'].includes(role)
}
