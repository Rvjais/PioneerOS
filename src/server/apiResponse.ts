/**
 * Standardized API Response Utilities
 * Provides consistent error handling and response formatting
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ============================================
// ERROR TYPES
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter })
    this.name = 'RateLimitError'
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(service: string, retryAfter?: number) {
    super(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE', retryAfter ? { retryAfter } : undefined)
    this.name = 'ServiceUnavailableError'
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details)
    this.name = 'BadRequestError'
  }
}

// ============================================
// RESPONSE HELPERS
// ============================================

interface SuccessResponseOptions {
  status?: number
  headers?: Record<string, string>
}

/**
 * Create a successful JSON response
 */
export function successResponse<T>(
  data: T,
  options: SuccessResponseOptions = {}
): NextResponse {
  const { status = 200, headers } = options
  return NextResponse.json(data, { status, headers })
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(data: T): NextResponse {
  return successResponse(data, { status: 201 })
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ============================================
// ERROR RESPONSE HELPERS
// ============================================

interface ErrorResponseFormat {
  error: string
  code?: string
  details?: Record<string, unknown>
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  message: string,
  statusCode = 500,
  code?: string,
  details?: Record<string, unknown>
): NextResponse {
  const body: ErrorResponseFormat = { error: message }
  if (code) body.code = code
  if (details) body.details = details

  return NextResponse.json(body, { status: statusCode })
}

/**
 * Handle any error and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle known API errors
  if (error instanceof ApiError) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.code,
      error.details
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {}
    for (const issue of error.issues) {
      const path = issue.path.join('.') || 'root'
      if (!details[path]) details[path] = []
      details[path].push(issue.message)
    }
    return errorResponse('Validation failed', 400, 'VALIDATION_ERROR', details)
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[]; cause?: string } }

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.join(', ') || 'field'
      return errorResponse(`A record with this ${target} already exists`, 409, 'DUPLICATE_ENTRY')
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return errorResponse('Record not found', 404, 'NOT_FOUND')
    }

    // Foreign key constraint failed
    if (prismaError.code === 'P2003') {
      return errorResponse('Related record not found', 400, 'FOREIGN_KEY_ERROR')
    }

    // Required field missing
    if (prismaError.code === 'P2011') {
      return errorResponse('Required field is missing', 400, 'REQUIRED_FIELD_MISSING')
    }

    // Invalid value provided
    if (prismaError.code === 'P2006') {
      return errorResponse('Invalid value provided', 400, 'INVALID_VALUE')
    }

    // Database connection error
    if (prismaError.code === 'P1001' || prismaError.code === 'P1002') {
      console.error('Database connection error:', prismaError)
      return errorResponse('Database temporarily unavailable', 503, 'DATABASE_ERROR')
    }
  }

  // Log unknown errors
  console.error('Unhandled API error:', error)

  // Generic error response
  return errorResponse('Internal server error', 500, 'INTERNAL_ERROR')
}

// ============================================
// CLIENT-SIDE DATA EXTRACTION UTILITIES
// ============================================

/**
 * Extract array data from API response that may be paginated or plain array
 * Use this on the client side when fetching data from APIs that may return
 * either a plain array or a paginated response object.
 *
 * Handles both formats:
 * - Plain array: [...]
 * - Paginated object: { data: [...], total: n, ... }
 *
 * Usage:
 * ```ts
 * const res = await fetch('/api/clients')
 * const data = await res.json()
 * const clients = extractArrayData(data)
 * ```
 */
export function extractArrayData<T>(response: any): T[] {
  if (!response) return []
  if (Array.isArray(response)) return response
  
  if (typeof response === 'object') {
    // 1. Check for standard 'data' key
    if ('data' in response && Array.isArray(response.data)) {
      return response.data
    }
    
    // 2. Fallback: Search for any key that is an array (e.g., 'clients', 'users', 'tasks')
    // We prioritize the first array found that isn't metadata
    const keys = Object.keys(response)
    for (const key of keys) {
      if (Array.isArray(response[key]) && key !== 'pagination' && key !== 'errors') {
        return response[key]
      }
    }
  }
  
  return []
}

/**
 * Type guard to check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: T[] | { data: T[]; total: number }
): response is { data: T[]; total: number } {
  return !Array.isArray(response) && typeof response === 'object' && 'data' in response && 'total' in response
}

/**
 * Extract pagination info from response
 */
export function extractPagination(response: unknown): { total: number; page: number; limit: number } | null {
  if (
    response &&
    typeof response === 'object' &&
    'total' in response &&
    'page' in response &&
    'limit' in response
  ) {
    return {
      total: (response as { total: number }).total,
      page: (response as { page: number }).page,
      limit: (response as { limit: number }).limit,
    }
  }
  return null
}

// ============================================
// ROUTE WRAPPER
// ============================================

type RouteHandler = (
  req: Request,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse>

/**
 * Wrap a route handler with automatic error handling
 *
 * Usage:
 * ```ts
 * export const GET = withErrorHandling(async (req) => {
 *   const data = await fetchSomething()
 *   return successResponse(data)
 * })
 * ```
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// ============================================
// SHORTHAND RESPONSE HELPERS
// ============================================

/**
 * Quick helper for error responses with status + message
 */
export function apiError(status: number, message: string, details?: Record<string, unknown>) {
  const body: Record<string, unknown> = { error: message }
  if (details) body.details = details
  return NextResponse.json(body, { status })
}

/**
 * Quick helper for success responses
 */
export function apiSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export const unauthorized = () => apiError(401, 'Unauthorized')
export const forbidden = (msg = 'Forbidden') => apiError(403, msg)
export const notFound = (msg = 'Not found') => apiError(404, msg)
export const badRequest = (msg: string) => apiError(400, msg)
