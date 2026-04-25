/**
 * =====================================
 * API AUTHENTICATION PATTERNS GUIDE
 * =====================================
 *
 * This codebase has multiple authentication utilities. Here's when to use each:
 *
 * ## RECOMMENDED PATTERNS:
 *
 * ### 1. `withAuth` (THIS FILE) - Use for simple authenticated routes
 * ```ts
 * import { withAuth } from '@/server/auth/withAuth'
 *
 * export const GET = withAuth(async (req, { user }) => {
 *   return NextResponse.json({ data: user.firstName })
 * })
 *
 * // With role restriction:
 * export const POST = withAuth(handler, { roles: ['SUPER_ADMIN', 'MANAGER'] })
 * ```
 *
 * ### 2. `createRoute` - Use for routes with validation needs
 * ```ts
 * import { createRoute } from '@/server/apiRoute'
 *
 * export const POST = createRoute(
 *   async ({ user, body }) => {
 *     // body is validated
 *     return { success: true }
 *   },
 *   {
 *     auth: { roles: ['ADMIN'] },
 *     bodySchema: myZodSchema,
 *   }
 * )
 * ```
 *
 * ## PATTERNS TO AVOID:
 *
 * - Don't use `getServerSession(authOptions)` directly in routes
 *   - Use `withAuth` or `createRoute` instead
 *
 * - Don't use `requireAuth` for new code
 *   - It requires more boilerplate; use `withAuth` instead
 *
 * ## CHOOSING THE RIGHT PATTERN:
 *
 * | Use Case                      | Pattern      |
 * |-------------------------------|--------------|
 * | Simple GET with auth          | withAuth     |
 * | POST with body validation     | createRoute  |
 * | Role/department restriction   | Either       |
 * | Pagination needed             | createRoute  |
 * | Public endpoint               | publicRoute  |
 * | Admin-only endpoint           | adminRoute   |
 *
 * =====================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, CustomRoleData } from './auth'
import { prisma } from '@/server/db/prisma'
import type { AuthenticatedUser } from '@/shared/types/auth'

// Re-export for backward compatibility
export type { AuthenticatedUser }

// Handler types
type AuthenticatedHandler = (
  req: NextRequest,
  context: { user: AuthenticatedUser; params?: Record<string, string> }
) => Promise<NextResponse | Response>

interface AuthOptions {
  // Allowed roles (user must have at least one)
  roles?: string[]
  // Allowed departments (user must be in at least one)
  departments?: string[]
  // Custom permission check function
  check?: (user: AuthenticatedUser) => boolean | Promise<boolean>
  // Require NDA to be signed
  requireNda?: boolean
  // Require profile to be complete
  requireCompleteProfile?: boolean
}

// Standard error responses
function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Centralized authentication middleware for API routes
 *
 * Usage:
 * ```ts
 * export const GET = withAuth(async (req, { user }) => {
 *   // user is guaranteed to be authenticated
 *   return NextResponse.json({ data: user.id })
 * })
 *
 * // With role restriction
 * export const POST = withAuth(async (req, { user }) => {
 *   // Only ADMIN or MANAGER can access
 * }, { roles: ['SUPER_ADMIN', 'MANAGER'] })
 *
 * // With department restriction
 * export const PUT = withAuth(async (req, { user }) => {
 *   // Only HR department can access
 * }, { departments: ['HR'] })
 *
 * // With custom check
 * export const DELETE = withAuth(async (req, { user }) => {
 *   // Custom permission check
 * }, { check: (user) => user.customRoles.some(r => r.permissions?.canDelete) })
 * ```
 */
export function withAuth(handler: AuthenticatedHandler, options?: AuthOptions) {
  return async (req: NextRequest, context?: { params?: Promise<Record<string, string>> }) => {
    try {
      // Get session
      const session = await getServerSession(authOptions)

      if (!session?.user) {
        return unauthorized('Not authenticated')
      }

      const user = session.user as AuthenticatedUser

      // SECURITY FIX: Check user status from database - inactive users should not access APIs
      // JWT may not contain current status, so we query the DB
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true } })
      if (dbUser && !['ACTIVE', 'PROBATION'].includes(dbUser.status)) {
        return forbidden('Account is inactive')
      }

      // Check NDA requirement
      if (options?.requireNda && !user.ndaSigned) {
        return forbidden('NDA signature required')
      }

      // Check profile completion requirement
      if (options?.requireCompleteProfile && user.profileCompletionStatus !== 'VERIFIED') {
        return forbidden('Profile completion required')
      }

      // Check role restriction
      if (options?.roles && options.roles.length > 0) {
        const hasRole = options.roles.includes(user.role) ||
          user.customRoles.some(cr =>
            cr.baseRoles.some(br => options.roles!.includes(br))
          )

        if (!hasRole) {
          return forbidden('Insufficient role permissions')
        }
      }

      // Check department restriction
      if (options?.departments && options.departments.length > 0) {
        const inDepartment = options.departments.includes(user.department) ||
          user.customRoles.some(cr =>
            cr.departments.some(d => options.departments!.includes(d))
          )

        if (!inDepartment) {
          return forbidden('Department access denied')
        }
      }

      // Custom permission check
      if (options?.check) {
        const allowed = await options.check(user)
        if (!allowed) {
          return forbidden('Permission denied')
        }
      }

      // Resolve params if provided
      const params = context?.params ? await context.params : undefined

      // Call the handler with authenticated user
      return handler(req, { user, params })

    } catch (error) {
      console.error('[withAuth] Error:', error)
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 })
    }
  }
}

/**
 * Helper to check if user has specific permission from custom roles
 */
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  return user.customRoles.some(cr =>
    cr.permissions && cr.permissions[permission] === true
  )
}

/**
 * Helper to check if user can access a specific department's data
 */
export function canAccessDepartment(user: AuthenticatedUser, targetDepartment: string): boolean {
  // Super Admin can access all
  if (user.role === 'SUPER_ADMIN') return true

  // Same department
  if (user.department === targetDepartment) return true

  // Custom roles with department access
  return user.customRoles.some(cr =>
    cr.departments.includes(targetDepartment) || cr.departments.includes('ALL')
  )
}

/**
 * Helper to check if user is admin or has admin-level custom role
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  if (user.role === 'SUPER_ADMIN') return true
  return user.customRoles.some(cr => cr.baseRoles.includes('SUPER_ADMIN'))
}

/**
 * Helper to check if user is manager or above
 */
export function isManagerOrAbove(user: AuthenticatedUser): boolean {
  const managerRoles = ['SUPER_ADMIN', 'MANAGER']
  if (managerRoles.includes(user.role)) return true
  return user.customRoles.some(cr =>
    cr.baseRoles.some(br => managerRoles.includes(br))
  )
}
