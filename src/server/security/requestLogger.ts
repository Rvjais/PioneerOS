/**
 * Request Logging Utility
 *
 * Provides optional request logging for debugging API issues.
 * Sensitive data is automatically redacted.
 *
 * Enable logging by setting LOG_API_REQUESTS=true in environment.
 */

import { NextRequest } from 'next/server'

// Fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'ssn',
  'aadhaar',
  'pan',
  'panCard',
  'bankAccount',
  'accountNumber',
  'ifsc',
  'sessionToken',
  'refreshToken',
  'accessToken',
]

// Headers that should never be logged
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
]

interface LogEntry {
  timestamp: string
  requestId: string
  method: string
  path: string
  query?: Record<string, string>
  body?: Record<string, unknown>
  headers?: Record<string, string>
  userId?: string
  clientIp?: string
  userAgent?: string
  duration?: number
  status?: number
  error?: string
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${crypto.randomUUID()}`
}

/**
 * Redact sensitive fields from an object
 */
function redactSensitive(obj: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > 5) return { _truncated: true }

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()

    // Check if field should be redacted
    if (SENSITIVE_FIELDS.some(f => lowerKey.includes(f.toLowerCase()))) {
      result[key] = '[REDACTED]'
      continue
    }

    // Recursively handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactSensitive(value as Record<string, unknown>, depth + 1)
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        item && typeof item === 'object'
          ? redactSensitive(item as Record<string, unknown>, depth + 1)
          : item
      )
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Extract safe headers from request
 */
function getSafeHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}

  req.headers.forEach((value, key) => {
    if (!SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      headers[key] = value
    } else {
      headers[key] = '[REDACTED]'
    }
  })

  return headers
}

/**
 * Get client IP from request
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Check if logging is enabled
 */
function isLoggingEnabled(): boolean {
  return process.env.LOG_API_REQUESTS === 'true'
}

/**
 * Log a request
 */
export async function logRequest(
  req: NextRequest,
  options?: {
    userId?: string
    body?: Record<string, unknown>
  }
): Promise<string> {
  const requestId = generateRequestId()

  if (!isLoggingEnabled()) {
    return requestId
  }

  const url = new URL(req.url)
  const query: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    query[key] = SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))
      ? '[REDACTED]'
      : value
  })

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    path: url.pathname,
    clientIp: getClientIp(req),
    userAgent: req.headers.get('user-agent') || undefined,
  }

  if (Object.keys(query).length > 0) {
    entry.query = query
  }

  if (options?.body) {
    entry.body = redactSensitive(options.body)
  }

  if (options?.userId) {
    entry.userId = options.userId
  }

  // Log in a structured format
  console.log(JSON.stringify({
    type: 'API_REQUEST',
    ...entry,
  }))

  return requestId
}

/**
 * Log a response
 */
export function logResponse(
  requestId: string,
  status: number,
  startTime: number,
  error?: string
): void {
  if (!isLoggingEnabled()) return

  const duration = Date.now() - startTime

  console.log(JSON.stringify({
    type: 'API_RESPONSE',
    timestamp: new Date().toISOString(),
    requestId,
    status,
    duration,
    ...(error ? { error } : {}),
  }))
}

/**
 * Create a logged route handler wrapper
 *
 * Usage:
 * ```ts
 * export const GET = withRequestLogging(async (req) => {
 *   // your handler code
 *   return NextResponse.json({ data })
 * })
 * ```
 */
export function withRequestLogging(
  handler: (req: NextRequest, context?: { params?: Promise<Record<string, string>> }) => Promise<Response>
) {
  return async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<Response> => {
    const startTime = Date.now()
    const requestId = await logRequest(req)

    try {
      const response = await handler(req, context)
      logResponse(requestId, response.status, startTime)
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logResponse(requestId, 500, startTime, errorMessage)
      throw error
    }
  }
}

/**
 * Simple debug log that respects LOG_API_REQUESTS setting
 */
export function debugLog(message: string, data?: Record<string, unknown>): void {
  if (!isLoggingEnabled()) return

  console.log(JSON.stringify({
    type: 'DEBUG',
    timestamp: new Date().toISOString(),
    message,
    ...(data ? { data: redactSensitive(data) } : {}),
  }))
}
