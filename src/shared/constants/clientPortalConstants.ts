/**
 * Client Portal Constants
 *
 * Centralized configuration for the client portal.
 * Avoids magic numbers and hardcoded values scattered across routes.
 */

// ============================================
// SESSION
// ============================================

/** Default session TTL in milliseconds (24 hours) */
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000

/** Magic link session TTL in milliseconds (7 days) */
export const MAGIC_LINK_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** Cookie name for client portal session */
export const SESSION_COOKIE_NAME = 'client_session'

// ============================================
// PAGINATION
// ============================================

/** Default page size for list endpoints */
export const DEFAULT_PAGE_SIZE = 50

/** Maximum page size allowed */
export const MAX_PAGE_SIZE = 100

/** Default notification fetch limit */
export const DEFAULT_NOTIFICATION_LIMIT = 50

// ============================================
// RATE LIMITING (requests per window)
// ============================================

export const RATE_LIMITS = {
  /** Public/auth endpoints: 5 req / 1 min */
  AUTH: { maxRequests: 5, windowMs: 60 * 1000 },
  /** Write operations (POST/PUT/DELETE): 20 req / 1 min */
  WRITE: { maxRequests: 20, windowMs: 60 * 1000 },
  /** Read operations (GET): 60 req / 1 min */
  READ: { maxRequests: 60, windowMs: 60 * 1000 },
  /** Sensitive operations (credentials, termination): 10 req / 1 min */
  SENSITIVE: { maxRequests: 10, windowMs: 60 * 1000 },
} as const

// ============================================
// CONTACT
// ============================================

/** Official support email */
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'official@brandingpioneers.com'

// ============================================
// CATEGORY COLORS
// ============================================

export const CATEGORY_COLORS: Record<string, string> = {
  SEO: '#10B981',
  SOCIAL: '#8B5CF6',
  ADS: '#F59E0B',
  WEB: '#3B82F6',
  DESIGN: '#EC4899',
  VIDEO: '#EF4444',
  ACCOUNTS: '#6366F1',
  HR: '#14B8A6',
  SALES: '#F97316',
  OPERATIONS: '#6B7280',
}
