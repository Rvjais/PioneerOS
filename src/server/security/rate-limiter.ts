/**
 * Rate Limiter for API Credential Management
 *
 * Simple in-memory rate limiting for sensitive endpoints.
 * In production, consider using Redis for distributed rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (per-instance)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  keyPrefix?: string    // Prefix for the rate limit key
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfterMs?: number
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const { windowMs, maxRequests, keyPrefix = '' } = config
  const key = `${keyPrefix}:${identifier}`
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // Create new entry if doesn't exist or window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfterMs: entry.resetAt - now,
    }
  }

  // Increment counter
  entry.count++

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: new Date(entry.resetAt),
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Strict limit for credential viewing (prevents brute force)
  credentialView: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 10,         // 10 views per minute
    keyPrefix: 'cred-view',
  },

  // Moderate limit for credential testing
  credentialTest: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 5,          // 5 tests per minute
    keyPrefix: 'cred-test',
  },

  // Strict limit for credential rotation
  credentialRotate: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,           // 3 rotations per hour
    keyPrefix: 'cred-rotate',
  },

  // Moderate limit for credential updates
  credentialUpdate: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 10,         // 10 updates per minute
    keyPrefix: 'cred-update',
  },

  // Very strict for failed auth attempts
  authAttempt: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 failed attempts
    keyPrefix: 'auth-fail',
  },
} as const

/**
 * Reset rate limit for an identifier (useful after successful re-auth)
 */
export function resetRateLimit(identifier: string, keyPrefix: string): void {
  const key = `${keyPrefix}:${identifier}`
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): { count: number; resetAt: Date | null } {
  const key = `${config.keyPrefix || ''}:${identifier}`
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < Date.now()) {
    return { count: 0, resetAt: null }
  }

  return { count: entry.count, resetAt: new Date(entry.resetAt) }
}
