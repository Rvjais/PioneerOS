/**
 * Redis Cache Service
 *
 * Provides a caching layer for improved performance.
 * Falls back to in-memory cache if Redis is not available.
 */

import Redis from 'ioredis'

// Cache configuration
const REDIS_URL = process.env.REDIS_URL
if (!REDIS_URL) { console.warn('[Cache] REDIS_URL not set, Redis cache disabled'); }
const DEFAULT_TTL = 300 // 5 minutes in seconds

// Memory cache limits to prevent OOM
const MAX_MEMORY_CACHE_SIZE = 500 // max entries
const MAX_CACHE_ITEM_SIZE = 512 * 1024 // 512KB max per item

// Redis client singleton
let redis: Redis | null = null
let isConnected = false
let connectionAttempted = false

// In-memory fallback cache with LRU-like behavior
const memoryCache = new Map<string, { value: string; expiresAt: number; accessedAt: number }>()

/**
 * Initialize Redis connection
 */
function initRedis(): Redis | null {
  if (connectionAttempted) {
    return redis
  }

  connectionAttempted = true

  if (!REDIS_URL) {
    console.warn('[Cache] No REDIS_URL configured, using in-memory cache')
    return null
  }

  try {
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('Redis connection failed, using in-memory cache fallback')
          return null // Stop retrying
        }
        return Math.min(times * 200, 1000)
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    })

    client.on('connect', () => {
      isConnected = true
    })

    client.on('error', () => {
      isConnected = false
    })

    client.on('close', () => {
      isConnected = false
    })

    // Try to connect
    client.connect().catch(() => {
      console.warn('Redis connection failed, using in-memory cache')
    })

    redis = client
    return client
  } catch (error) {
    console.warn('Redis initialization failed, using in-memory cache')
    return null
  }
}

/**
 * Get Redis client (or null if not available)
 */
function getRedis(): Redis | null {
  if (!redis) {
    return initRedis()
  }
  return isConnected ? redis : null
}

/**
 * Clean expired + evicted entries from memory cache (event-driven, no timer).
 * Called lazily on every get/set — no background interval.
 */
function cleanMemoryCache(): void {
  const now = Date.now()

  // Remove expired entries
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt < now) {
      memoryCache.delete(key)
    }
  }

  // If still over limit, evict least recently accessed entries (LRU)
  if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
    const entries = Array.from(memoryCache.entries())
      .sort((a, b) => a[1].accessedAt - b[1].accessedAt)

    // Remove oldest 20%
    const toRemove = Math.ceil(memoryCache.size * 0.2)
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      memoryCache.delete(entries[i][0])
    }
  }
}

/**
 * Graceful shutdown - close Redis connection and clear memory cache
 */
function setupGracefulShutdown(): void {
  const cleanup = async () => {
    if (redis && isConnected) {
      try {
        await redis.quit()
        isConnected = false
      } catch (error) {
        console.warn('Error closing Redis:', error)
      }
    }
    memoryCache.clear()
  }

  if (typeof process !== 'undefined') {
    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)
  }
}

// Setup graceful shutdown on module load
setupGracefulShutdown()

/**
 * Cache Service API
 */
export const cache = {
  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const redisClient = getRedis()

    if (redisClient) {
      try {
        const value = await redisClient.get(key)
        if (value) {
          return JSON.parse(value) as T
        }
        return null
      } catch {
        // Redis unavailable, fall through to memory cache
      }
    }

    // Fallback to memory cache
    const entry = memoryCache.get(key)
    if (entry && entry.expiresAt > Date.now()) {
      // Update access time for LRU
      entry.accessedAt = Date.now()
      return JSON.parse(entry.value) as T
    }
    memoryCache.delete(key)
    return null
  },

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    const serialized = JSON.stringify(value)
    const redisClient = getRedis()

    if (redisClient) {
      try {
        await redisClient.setex(key, ttlSeconds, serialized)
        return
      } catch {
        // Redis unavailable, fall through to memory cache
      }
    }

    // Fallback to memory cache with size check
    if (serialized.length <= MAX_CACHE_ITEM_SIZE) {
      // Clean if approaching limit
      if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
        cleanMemoryCache()
      }

      memoryCache.set(key, {
        value: serialized,
        expiresAt: Date.now() + ttlSeconds * 1000,
        accessedAt: Date.now(),
      })
    }
  },

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<void> {
    const redisClient = getRedis()

    if (redisClient) {
      try {
        await redisClient.del(key)
      } catch {
        // Redis unavailable, silent fallback
      }
    }

    memoryCache.delete(key)
  },

  /**
   * Delete keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const redisClient = getRedis()

    if (redisClient) {
      try {
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) {
          await redisClient.del(...keys)
        }
      } catch {
        // Redis unavailable, silent fallback
      }
    }

    // For memory cache, iterate and delete matching keys
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key)
      }
    }
  },

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    const redisClient = getRedis()

    if (redisClient) {
      try {
        return (await redisClient.exists(key)) === 1
      } catch {
        // Redis unavailable, silent fallback
      }
    }

    const entry = memoryCache.get(key)
    return entry !== undefined && entry.expiresAt > Date.now()
  },

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = DEFAULT_TTL
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetchFn()
    await this.set(key, value, ttlSeconds)
    return value
  },

  /**
   * Increment a counter
   */
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const redisClient = getRedis()

    if (redisClient) {
      try {
        const value = await redisClient.incr(key)
        if (ttlSeconds) {
          await redisClient.expire(key, ttlSeconds)
        }
        return value
      } catch {
        // Redis unavailable, silent fallback
      }
    }

    // Fallback to memory cache
    const entry = memoryCache.get(key)
    let newValue = 1
    if (entry && entry.expiresAt > Date.now()) {
      newValue = parseInt(entry.value, 10) + 1
    }
    const expiresAt = ttlSeconds
      ? Date.now() + ttlSeconds * 1000
      : Date.now() + DEFAULT_TTL * 1000
    memoryCache.set(key, { value: String(newValue), expiresAt, accessedAt: Date.now() })
    return newValue
  },

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    type: 'redis' | 'memory'
    connected: boolean
    memoryKeys: number
  }> {
    const redisClient = getRedis()
    return {
      type: redisClient && isConnected ? 'redis' : 'memory',
      connected: isConnected,
      memoryKeys: memoryCache.size,
    }
  },

  /**
   * Flush all cache
   */
  async flush(): Promise<void> {
    const redisClient = getRedis()

    if (redisClient) {
      try {
        await redisClient.flushdb()
      } catch {
        // Redis unavailable, silent fallback
      }
    }

    memoryCache.clear()
  },
}

/**
 * Cache key generators for consistent naming
 */
export const cacheKeys = {
  // User-related
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userSessions: (userId: string) => `user:${userId}:sessions`,

  // Client-related
  client: (clientId: string) => `client:${clientId}`,
  clientList: (page: number, limit: number) => `clients:list:${page}:${limit}`,

  // Task-related
  task: (taskId: string) => `task:${taskId}`,
  taskList: (userId: string, status?: string) => `tasks:${userId}:${status || 'all'}`,

  // Lead-related
  lead: (leadId: string) => `lead:${leadId}`,
  leadList: (filters: string) => `leads:list:${filters}`,

  // API credentials
  credential: (provider: string) => `credential:${provider}`,
  credentialHealth: () => 'credentials:health',

  // Dashboard data
  dashboard: (userId: string, type: string) => `dashboard:${userId}:${type}`,
  dashboardMetrics: (department: string) => `dashboard:metrics:${department}`,

  // Reports
  report: (reportId: string) => `report:${reportId}`,
  reportData: (category: string, type: string, dateRange: string) =>
    `report:data:${category}:${type}:${dateRange}`,

  // Rate limiting
  rateLimit: (key: string) => `ratelimit:${key}`,

  // Misc
  settings: (key: string) => `settings:${key}`,
}

/**
 * TTL constants (in seconds)
 */
export const cacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
}

export default cache
