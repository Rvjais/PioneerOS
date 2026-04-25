/**
 * Shared Authentication & Authorization Types
 *
 * Single source of truth for UserRole, Department, and AuthenticatedUser types.
 * Import from here instead of re-declaring in individual files.
 */

import type { CustomRoleData } from '@/server/auth/auth'

// ============================================
// ROLE & DEPARTMENT ENUMS
// ============================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'MANAGER'
  | 'OPERATIONS_HEAD'
  | 'OM'
  | 'EMPLOYEE'
  | 'FREELANCER'
  | 'SALES'
  | 'ACCOUNTS'
  | 'INTERN'
  | 'HR'
  // Web-specific roles
  | 'WEB_MANAGER'
  | 'WEB_DESIGNER'
  | 'WEB_DEVELOPER'
  | 'CONTENT_WRITER'
  | 'QA_TESTER'

export type Department =
  | 'WEB'
  | 'SEO'
  | 'ADS'
  | 'SOCIAL'
  | 'HR'
  | 'ACCOUNTS'
  | 'SALES'
  | 'OPERATIONS'

// ============================================
// AUTHENTICATED USER
// ============================================

/**
 * Represents a fully authenticated user in the system.
 * Used across withAuth, apiRoute, and rbac middlewares.
 */
export interface AuthenticatedUser {
  id: string
  empId: string
  firstName: string
  lastName: string
  role: string
  department: string
  status?: string
  ndaSigned?: boolean
  profileCompletionStatus?: string
  profilePicture?: string | null
  customRoles: CustomRoleData[]
  isImpersonating?: boolean
  originalAdminId?: string
  originalRole?: string
  impersonationSessionId?: string
}
