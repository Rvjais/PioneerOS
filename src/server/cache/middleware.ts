/**
 * Cache Middleware and Decorators
 *
 * Provides caching utilities for API routes and functions
 */

import { NextRequest, NextResponse } from 'next/server'
import { cache, cacheKeys, cacheTTL } from './redis'

/**
 * Options for cache middleware
 */
interface CacheOptions {
  ttl?: number
  keyGenerator?: (req: NextRequest) => string
  shouldCache?: (req: NextRequest) => boolean
  staleWhileRevalidate?: boolean
}

/**
 * Create a cached API handler
 */
export function withCache<T>(
  handler: (req: NextRequest) => Promise<T>,
  options: CacheOptions = {}
): (req: NextRequest) => Promise<T | NextResponse> {
  const {
    ttl = cacheTTL.MEDIUM,
    keyGenerator = (req) => `api:${req.nextUrl.pathname}${req.nextUrl.search}`,
    shouldCache = () => true,
    staleWhileRevalidate = false,
  } = options

  return async (req: NextRequest) => {
    // Only cache GET requests by default
    if (req.method !== 'GET' || !shouldCache(req)) {
      return handler(req)
    }

    const cacheKey = keyGenerator(req)

    // Try to get from cache
    const cached = await cache.get<{ data: T; timestamp: number }>(cacheKey)

    if (cached) {
      if (staleWhileRevalidate) {
        // Return stale data and revalidate in background
        const age = (Date.now() - cached.timestamp) / 1000
        if (age > ttl) {
          // Revalidate in background
          handler(req)
            .then(async (data) => {
              await cache.set(cacheKey, { data, timestamp: Date.now() }, ttl * 2)
            })
            .catch(console.error)
        }
      }
      return cached.data
    }

    // Fetch and cache
    const data = await handler(req)
    await cache.set(cacheKey, { data, timestamp: Date.now() }, ttl)
    return data
  }
}

/**
 * Cache decorator for functions
 */
export function cached<TArgs extends unknown[], TResult>(
  keyPrefix: string,
  ttl: number = cacheTTL.MEDIUM
) {
  return function decorator(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: TArgs) => Promise<TResult>>
  ): TypedPropertyDescriptor<(...args: TArgs) => Promise<TResult>> {
    const originalMethod = descriptor.value!

    descriptor.value = async function (this: object, ...args: TArgs): Promise<TResult> {
      const cacheKey = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`

      const cachedResult = await cache.get<TResult>(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      const result = await originalMethod.apply(this, args)
      await cache.set(cacheKey, result, ttl)
      return result
    }

    return descriptor
  }
}

/**
 * Memoize an async function with caching
 */
export function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    keyPrefix: string
    ttl?: number
    keyGenerator?: (...args: TArgs) => string
  }
): (...args: TArgs) => Promise<TResult> {
  const { keyPrefix, ttl = cacheTTL.MEDIUM, keyGenerator } = options

  return async (...args: TArgs): Promise<TResult> => {
    const cacheKey = keyGenerator
      ? `${keyPrefix}:${keyGenerator(...args)}`
      : `${keyPrefix}:${JSON.stringify(args)}`

    return cache.getOrSet(cacheKey, () => fn(...args), ttl)
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(patterns: string[]): Promise<void> {
  for (const pattern of patterns) {
    await cache.delPattern(pattern)
  }
}

/**
 * Cache invalidation triggers
 */
export const cacheInvalidators = {
  // Invalidate when user data changes
  onUserUpdate: async (userId: string) => {
    await invalidateCache([
      cacheKeys.user(userId),
      cacheKeys.userProfile(userId),
      `dashboard:${userId}:*`,
    ])
  },

  // Invalidate when client data changes
  onClientUpdate: async (clientId: string) => {
    await invalidateCache([
      cacheKeys.client(clientId),
      'clients:list:*',
    ])
  },

  // Invalidate when task data changes
  onTaskUpdate: async (taskId: string, userId?: string) => {
    const patterns = [cacheKeys.task(taskId)]
    if (userId) {
      patterns.push(`tasks:${userId}:*`)
    }
    await invalidateCache(patterns)
  },

  // Invalidate when lead data changes
  onLeadUpdate: async (leadId: string) => {
    await invalidateCache([
      cacheKeys.lead(leadId),
      'leads:list:*',
    ])
  },

  // Invalidate dashboard data
  onDashboardInvalidate: async (department?: string) => {
    const patterns = ['dashboard:*']
    if (department) {
      patterns.push(cacheKeys.dashboardMetrics(department))
    }
    await invalidateCache(patterns)
  },

  // Invalidate all caches
  onFullInvalidate: async () => {
    await cache.flush()
  },
}

/**
 * Request deduplication to prevent thundering herd
 */
const pendingRequests = new Map<string, Promise<unknown>>()

export async function deduplicate<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request
  const pending = pendingRequests.get(key)
  if (pending) {
    return pending as Promise<T>
  }

  // Create new promise
  const promise = fn().finally(() => {
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, promise)
  return promise
}

/**
 * Batch cache operations
 */
export async function batchGet<T>(keys: string[]): Promise<Map<string, T | null>> {
  const results = new Map<string, T | null>()

  // Fetch all keys in parallel
  await Promise.all(
    keys.map(async (key) => {
      const value = await cache.get<T>(key)
      results.set(key, value)
    })
  )

  return results
}

export async function batchSet<T>(
  entries: Array<{ key: string; value: T; ttl?: number }>
): Promise<void> {
  await Promise.all(
    entries.map(({ key, value, ttl }) => cache.set(key, value, ttl))
  )
}
