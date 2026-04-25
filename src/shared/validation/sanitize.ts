/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input before processing.
 * Use these for any user-provided text that will be:
 * - Stored in the database
 * - Displayed in the UI
 * - Used in emails or notifications
 */

/**
 * Remove HTML tags from a string
 */
export function stripHtml(input: string): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (!input) return ''
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  }
  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char])
}

/**
 * Sanitize a string for safe display (strips HTML and normalizes whitespace)
 */
export function sanitizeText(input: string): string {
  if (!input) return ''
  return stripHtml(input)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Sanitize a filename to remove potentially dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return ''
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove dangerous characters
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .trim()
    .slice(0, 255) // Limit length
}

/**
 * Sanitize a URL path segment
 */
export function sanitizePathSegment(segment: string): string {
  if (!segment) return ''
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-') // Replace invalid chars with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .slice(0, 100) // Limit length
}

/**
 * Sanitize a slug (URL-friendly string)
 */
export function sanitizeSlug(input: string): string {
  if (!input) return ''
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .slice(0, 100)
}

/**
 * Sanitize phone number (keep only digits and +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/[^\d+]/g, '').slice(0, 15)
}

/**
 * Sanitize email (lowercase, trim, validate format)
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null
  const sanitized = email.toLowerCase().trim()
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : null
}

/**
 * Sanitize a search query (remove potential injection patterns)
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return ''
  return query
    .replace(/[<>'"`;\\]/g, '') // Remove dangerous characters
    .replace(/--/g, '') // Remove SQL comment syntax
    .replace(/\/\*/g, '') // Remove SQL block comment start
    .replace(/\*\//g, '') // Remove SQL block comment end
    .trim()
    .slice(0, 200) // Limit length
}

/**
 * Sanitize a JSON string field (prevent JSON injection)
 */
export function sanitizeJsonField(input: string): string {
  if (!input) return ''
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape quotes
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(input: string, maxLength: number, suffix = '...'): string {
  if (!input) return ''
  if (input.length <= maxLength) return input
  return input.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Sanitize object keys (useful for preventing prototype pollution)
 */
export function sanitizeObjectKeys<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys?: string[]
): Partial<T> {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype']
  const result: Partial<T> = {}

  for (const key of Object.keys(obj)) {
    // Skip dangerous keys
    if (dangerousKeys.includes(key)) continue

    // If allowedKeys provided, only include those
    if (allowedKeys && !allowedKeys.includes(key)) continue

    result[key as keyof T] = obj[key as keyof T]
  }

  return result
}

/**
 * Remove null bytes from a string (prevents null byte injection)
 */
export function removeNullBytes(input: string): string {
  if (!input) return ''
  return input.replace(/\0/g, '')
}

/**
 * Comprehensive sanitization for user-provided text
 * Use this for general text fields like names, descriptions, etc.
 */
export function sanitizeUserInput(input: string, options?: {
  maxLength?: number
  allowNewlines?: boolean
  allowUnicode?: boolean
}): string {
  if (!input) return ''

  const { maxLength = 1000, allowNewlines = false, allowUnicode = true } = options || {}

  let sanitized = removeNullBytes(input)

  // Strip HTML
  sanitized = stripHtml(sanitized)

  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ')
  } else {
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  }

  // Remove non-printable characters (except newlines if allowed)
  if (allowUnicode) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  } else {
    sanitized = sanitized.replace(/[^\x20-\x7E\n]/g, '')
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/[ \t]+/g, ' ')

  // Trim
  sanitized = sanitized.trim()

  // Limit length
  if (maxLength > 0) {
    sanitized = sanitized.slice(0, maxLength)
  }

  return sanitized
}
