/**
 * Security utilities for Pioneer OS
 */

export * from './rate-limiter'
export * from './re-auth'

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can be comma-separated list, first is client
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  return 'unknown'
}

/**
 * Mask sensitive data for logging (shows only last N characters)
 */
export function maskForLog(value: string, showLast: number = 4): string {
  if (!value || value.length <= showLast) {
    return '****'
  }
  return '*'.repeat(Math.min(value.length - showLast, 20)) + value.slice(-showLast)
}
