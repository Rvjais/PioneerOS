import Redis from 'ioredis'
import crypto from 'crypto'

// ============================================
// RATE LIMIT CONFIGURATION
// ============================================

interface RateLimitConfig {
  maxRequests: number      // Maximum requests allowed
  windowMs: number         // Time window in milliseconds
  keyPrefix?: string       // Prefix for rate limit keys
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  retryAfter?: number      // Seconds until rate limit resets (only when limited)
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60 * 1000,     // 1 minute
  keyPrefix: 'ratelimit:',
}

// ============================================
// REDIS CLIENT (SINGLETON)
// ============================================

let redis: Redis | null = null
let redisAvailable = false

function getRedisClient(): Redis | null {
  if (redis) return redis

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[RateLimit] WARNING: REDIS_URL not set in production — using in-memory rate limiting. This is NOT safe across multiple instances.')
    } else {
      console.warn('[RateLimit] REDIS_URL not set, using in-memory rate limiting')
    }
    return null
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('[RateLimit] Redis connection failed, falling back to in-memory')
          redisAvailable = false
          return null
        }
        return Math.min(times * 100, 1000)
      },
    })

    redis.on('connect', () => {
      redisAvailable = true
    })

    redis.on('error', () => {
      redisAvailable = false
    })

    return redis
  } catch (error) {
    console.error('[RateLimit] Failed to create Redis client:', error)
    return null
  }
}

// ============================================
// IN-MEMORY FALLBACK
// ============================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically (only in long-lived server environments)
let cleanupInterval: ReturnType<typeof setInterval> | null = null
if (typeof setInterval !== 'undefined' && typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt < now) {
        memoryStore.delete(key)
      }
    }
  }, 60 * 1000)

  // Prevent the interval from keeping the process alive
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref()
  }
}

async function checkMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now()
  let entry = memoryStore.get(key)

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    memoryStore.set(key, entry)
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: entry.resetAt,
    }
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count++
  memoryStore.set(key, entry)

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

// ============================================
// REDIS RATE LIMITING (Sliding Window)
// ============================================

async function checkRedisRateLimit(
  client: Redis,
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - windowMs

  // Use Redis pipeline for atomic operations
  const pipeline = client.pipeline()

  // Remove old entries outside the window
  pipeline.zremrangebyscore(key, '-inf', windowStart)

  // Add current request with timestamp as score
  pipeline.zadd(key, now.toString(), `${now}:${crypto.randomUUID()}`)

  // Count requests in window
  pipeline.zcard(key)

  // Set expiry on key
  pipeline.pexpire(key, windowMs)

  const results = await pipeline.exec()

  if (!results) {
    // Fallback to memory if pipeline fails
    return checkMemoryRateLimit(key, maxRequests, windowMs)
  }

  const count = (results[2]?.[1] as number) || 0
  const resetAt = now + windowMs

  if (count > maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil(windowMs / 1000),
    }
  }

  return {
    success: true,
    remaining: maxRequests - count,
    resetAt,
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Check if a request should be rate limited
 * Uses Redis if available, falls back to in-memory
 */
export async function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, keyPrefix } = { ...DEFAULT_CONFIG, ...config }
  const key = `${keyPrefix}${identifier}`

  const client = getRedisClient()

  if (client && redisAvailable) {
    try {
      return await checkRedisRateLimit(client, key, maxRequests, windowMs)
    } catch (error) {
      console.error('[RateLimit] Redis error, falling back to memory:', error)
    }
  }

  return checkMemoryRateLimit(key, maxRequests, windowMs)
}

/**
 * Synchronous rate limit check (in-memory only)
 * Use for simple cases where async isn't needed
 */
export function checkRateLimitSync(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): RateLimitResult {
  const { maxRequests, windowMs, keyPrefix } = { ...DEFAULT_CONFIG, ...config }
  const key = `${keyPrefix}${identifier}`
  const now = Date.now()

  let entry = memoryStore.get(key)

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs }
    memoryStore.set(key, entry)
    return { success: true, remaining: maxRequests - 1, resetAt: entry.resetAt }
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

// ============================================
// PRESET RATE LIMITERS
// ============================================

/**
 * WhatsApp message rate limiter
 * 30 messages per minute per user
 */
export async function checkWhatsAppMessageRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`whatsapp:message:${userId}`, {
    maxRequests: 30,
    windowMs: 60 * 1000,
  })
}

/**
 * API endpoint rate limiter
 * 100 requests per minute per user per endpoint
 */
export async function checkApiRateLimit(userId: string, endpoint: string): Promise<RateLimitResult> {
  return checkRateLimit(`api:${endpoint}:${userId}`, {
    maxRequests: 100,
    windowMs: 60 * 1000,
  })
}

/**
 * Session creation rate limiter
 * 5 session operations per 5 minutes
 */
export async function checkSessionRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`whatsapp:session:${userId}`, {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000,
  })
}

/**
 * Login attempt rate limiter
 * 5 attempts per 15 minutes per IP
 */
export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit(`login:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  })
}

/**
 * Password reset rate limiter
 * 3 requests per hour per email
 */
export async function checkPasswordResetRateLimit(email: string): Promise<RateLimitResult> {
  return checkRateLimit(`password-reset:${email}`, {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  })
}

/**
 * 2FA verification rate limiter
 * 5 attempts per 15 minutes per user (strict to prevent brute force)
 */
export async function check2FAVerifyRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`2fa-verify:${userId}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  })
}

/**
 * 2FA setup rate limiter
 * 3 setup attempts per hour per user
 */
export async function check2FASetupRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`2fa-setup:${userId}`, {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  })
}

// ============================================
// ADMIN UTILITIES
// ============================================

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  const key = `${DEFAULT_CONFIG.keyPrefix}${identifier}`
  memoryStore.delete(key)

  const client = getRedisClient()
  if (client && redisAvailable) {
    try {
      await client.del(key)
    } catch (error) {
      console.error('[RateLimit] Failed to reset Redis key:', error)
    }
  }
}

/**
 * Clear all rate limits (use with caution)
 */
export async function clearAllRateLimits(): Promise<void> {
  memoryStore.clear()

  const client = getRedisClient()
  if (client && redisAvailable) {
    try {
      const keys = await client.keys(`${DEFAULT_CONFIG.keyPrefix}*`)
      if (keys.length > 0) {
        await client.del(...keys)
      }
    } catch (error) {
      console.error('[RateLimit] Failed to clear Redis keys:', error)
    }
  }
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(identifier: string): Promise<RateLimitResult | null> {
  const key = `${DEFAULT_CONFIG.keyPrefix}${identifier}`

  const entry = memoryStore.get(key)
  if (entry && entry.resetAt > Date.now()) {
    return {
      success: entry.count < DEFAULT_CONFIG.maxRequests,
      remaining: Math.max(0, DEFAULT_CONFIG.maxRequests - entry.count),
      resetAt: entry.resetAt,
    }
  }

  return null
}

/**
 * Check if Redis is available for rate limiting
 */
export function isRedisAvailable(): boolean {
  return redisAvailable
}
