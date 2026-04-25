/**
 * Cache Module
 *
 * Provides Redis-based caching with in-memory fallback
 *
 * @example
 * ```typescript
 * import { cache, cacheKeys, cacheTTL, memoize } from '@/server/cache'
 *
 * // Simple get/set
 * await cache.set('key', { data: 'value' }, cacheTTL.HOUR)
 * const data = await cache.get('key')
 *
 * // Get or set pattern
 * const user = await cache.getOrSet(
 *   cacheKeys.user(userId),
 *   () => fetchUserFromDB(userId),
 *   cacheTTL.MEDIUM
 * )
 *
 * // Memoize a function
 * const cachedFetch = memoize(fetchExpensiveData, {
 *   keyPrefix: 'expensive',
 *   ttl: cacheTTL.LONG,
 * })
 * ```
 */

// Core cache service
export { cache, cacheKeys, cacheTTL } from './redis'
export type { } from './redis'

// Middleware and utilities
export {
  withCache,
  cached,
  memoize,
  invalidateCache,
  cacheInvalidators,
  deduplicate,
  batchGet,
  batchSet,
} from './middleware'

// Default export
export { cache as default } from './redis'
