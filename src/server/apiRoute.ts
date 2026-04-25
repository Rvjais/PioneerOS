/**
 * Unified API Route Builder
 * Combines authentication, validation, and error handling into a single wrapper
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { z, ZodSchema } from 'zod'
import {
  handleApiError,
  successResponse,
  createdResponse,
  ApiError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '@/server/apiResponse'
import { paginatedResponse, getPaginationParams, PaginationParams } from '@/shared/utils/pagination'

// Re-export error classes for convenience
export { ApiError, AuthenticationError, AuthorizationError, ValidationError, NotFoundError }

// ============================================
// TYPES
// ============================================

import type { AuthenticatedUser } from '@/shared/types/auth'

// Re-export for backward compatibility
export type { AuthenticatedUser }

export interface RouteContext<TBody = unknown, TQuery = unknown> {
  user: AuthenticatedUser
  params: Record<string, string>
  body: TBody
  query: TQuery
  pagination: PaginationParams
  req: NextRequest
}

export interface RouteOptions<TBody = unknown, TQuery = unknown> {
  // Authentication options
  auth?: boolean | {
    roles?: string[]
    departments?: string[]
    requireNda?: boolean
  }
  // Validation schemas
  bodySchema?: ZodSchema<TBody>
  querySchema?: ZodSchema<TQuery>
  // Include pagination params
  paginated?: boolean
}

type RouteHandler<TBody = unknown, TQuery = unknown> = (
  ctx: RouteContext<TBody, TQuery>
) => Promise<NextResponse | unknown>

// ============================================
// ADMIN/ROLE HELPERS
// ============================================

const ADMIN_ROLES = ['SUPER_ADMIN']
const MANAGER_ROLES = [...ADMIN_ROLES, 'MANAGER']

export function isAdmin(user: AuthenticatedUser): boolean {
  return ADMIN_ROLES.includes(user.role)
}

export function isManagerOrAbove(user: AuthenticatedUser): boolean {
  return MANAGER_ROLES.includes(user.role)
}

// ============================================
// ROUTE BUILDER
// ============================================

/**
 * Create a standardized API route handler
 *
 * @example
 * // Simple authenticated route
 * export const GET = createRoute(async ({ user }) => {
 *   return { message: `Hello ${user.firstName}` }
 * })
 *
 * @example
 * // With validation and role restriction
 * export const POST = createRoute(
 *   async ({ user, body, params }) => {
 *     const item = await prisma.item.create({ data: body })
 *     return { item }
 *   },
 *   {
 *     auth: { roles: ['SUPER_ADMIN', 'MANAGER'] },
 *     bodySchema: createItemSchema,
 *   }
 * )
 *
 * @example
 * // Public route (no auth)
 * export const GET = createRoute(
 *   async ({ query }) => {
 *     return { status: 'ok' }
 *   },
 *   { auth: false }
 * )
 */
export function createRoute<TBody = unknown, TQuery = unknown>(
  handler: RouteHandler<TBody, TQuery>,
  options: RouteOptions<TBody, TQuery> = {}
) {
  const {
    auth = true,
    bodySchema,
    querySchema,
    paginated = false,
  } = options

  return async (
    req: NextRequest,
    routeContext?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      // Initialize context
      let user: AuthenticatedUser | null = null
      let body: TBody = {} as TBody
      let query: TQuery = {} as TQuery
      const params = routeContext?.params ? await routeContext.params : {}

      // Authentication
      if (auth !== false) {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
          throw new AuthenticationError('Not authenticated')
        }

        user = session.user as AuthenticatedUser

        // Role check (also checks custom roles' baseRoles)
        if (typeof auth === 'object' && auth.roles?.length) {
          const hasRole = auth.roles.includes(user.role) ||
            user.customRoles?.some((cr: { baseRoles?: string[] }) =>
              cr.baseRoles?.some((br: string) => auth.roles!.includes(br))
            )
          if (!hasRole) {
            throw new AuthorizationError('Insufficient permissions')
          }
        }

        // Department check
        if (typeof auth === 'object' && auth.departments?.length) {
          if (!auth.departments.includes(user.department)) {
            throw new AuthorizationError('Department access denied')
          }
        }

        // NDA check
        if (typeof auth === 'object' && auth.requireNda && !user.ndaSigned) {
          throw new AuthorizationError('NDA signature required')
        }
      }

      // Body validation (for POST, PUT, PATCH)
      if (bodySchema && ['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
        try {
          const rawBody = await req.json()
          const result = bodySchema.safeParse(rawBody)

          if (!result.success) {
            const details: Record<string, string[]> = {}
            for (const issue of result.error.issues) {
              const path = issue.path.join('.') || 'root'
              if (!details[path]) details[path] = []
              details[path].push(issue.message)
            }
            throw new ValidationError('Validation failed', details)
          }

          body = result.data
        } catch (error) {
          if (error instanceof ValidationError) throw error
          throw new ValidationError('Invalid JSON body')
        }
      }

      // Query validation
      if (querySchema) {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries())
        const result = querySchema.safeParse(searchParams)

        if (!result.success) {
          const details: Record<string, string[]> = {}
          for (const issue of result.error.issues) {
            const path = issue.path.join('.') || 'root'
            if (!details[path]) details[path] = []
            details[path].push(issue.message)
          }
          throw new ValidationError('Invalid query parameters', details)
        }

        query = result.data
      }

      // Pagination
      const pagination = paginated ? getPaginationParams(req) : {
        page: 1,
        limit: 50,
        skip: 0,
        take: 50,
      }

      // Build context
      const ctx: RouteContext<TBody, TQuery> = {
        user: user!,
        params,
        body,
        query,
        pagination,
        req,
      }

      // Execute handler
      const result = await handler(ctx)

      // If handler returns NextResponse, use it directly
      if (result instanceof NextResponse) {
        return result
      }

      // Otherwise, wrap in success response
      return successResponse(result)

    } catch (error) {
      return handleApiError(error)
    }
  }
}

// ============================================
// CONVENIENCE WRAPPERS
// ============================================

/**
 * Create an admin-only route
 */
export function adminRoute<TBody = unknown, TQuery = unknown>(
  handler: RouteHandler<TBody, TQuery>,
  options: Omit<RouteOptions<TBody, TQuery>, 'auth'> = {}
) {
  return createRoute(handler, {
    ...options,
    auth: { roles: ADMIN_ROLES },
  })
}

/**
 * Create a manager-or-above route
 */
export function managerRoute<TBody = unknown, TQuery = unknown>(
  handler: RouteHandler<TBody, TQuery>,
  options: Omit<RouteOptions<TBody, TQuery>, 'auth'> = {}
) {
  return createRoute(handler, {
    ...options,
    auth: { roles: MANAGER_ROLES },
  })
}

/**
 * Create a public route (no auth required)
 */
export function publicRoute<TBody = unknown, TQuery = unknown>(
  handler: RouteHandler<TBody, TQuery>,
  options: Omit<RouteOptions<TBody, TQuery>, 'auth'> = {}
) {
  return createRoute(handler, {
    ...options,
    auth: false,
  })
}

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Return a paginated list response
 */
export function listResponse<T>(
  items: T[],
  total: number,
  pagination: PaginationParams
): NextResponse {
  return successResponse(paginatedResponse(items, total, pagination.page, pagination.limit))
}

/**
 * Return a created response (201)
 */
export { createdResponse }

/**
 * Return a no content response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
