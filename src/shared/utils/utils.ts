/**
 * Safely parse JSON with a fallback value
 * Prevents crashes from malformed JSON data in database
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    console.error('Failed to parse JSON:', json.substring(0, 100))
    return fallback
  }
}

/**
 * Safely parse integer from string with validation
 */
export function safeParseInt(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Safely parse float from string with validation
 */
export function safeParseFloat(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = parseFloat(value)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Safe division that returns 0 instead of NaN/Infinity
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (denominator === 0 || !isFinite(numerator) || !isFinite(denominator)) {
    return fallback
  }
  return numerator / denominator
}

/**
 * Get base URL from environment - throws if not configured
 * Use this for generating external-facing URLs (proposals, RFPs, etc)
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXTAUTH_URL
  if (!baseUrl) {
    throw new Error('NEXTAUTH_URL not configured')
  }
  return baseUrl
}

/**
 * Validate phone number format (Indian mobile numbers)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and country code
  const cleaned = phone.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^91/, '')
  // Indian mobile numbers are 10 digits starting with 6-9
  return /^[6-9]\d{9}$/.test(cleaned)
}

/**
 * Sanitize phone number to standard format
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  // If starts with 91 and is 12 digits, remove country code
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.slice(2)
  }
  // Return last 10 digits
  return cleaned.slice(-10)
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
 */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * Format enum/status values for display
 * Converts SNAKE_CASE to Title Case (e.g., ON_TIME → "On Time")
 */
export function formatStatusLabel(status: string | null | undefined): string {
  if (!status) return 'N/A'
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Get display value with fallback for empty/null values
 * Returns user-friendly text instead of "-" or blank
 */
export function displayValue(value: string | number | null | undefined, fallback: string = 'Not Set'): string {
  if (value === null || value === undefined || value === '' || value === '-') {
    return fallback
  }
  return String(value)
}

/**
 * Validate employee ID format (BP-XXX where XXX is a number)
 * Returns true if valid, false otherwise
 */
export function isValidEmployeeId(empId: string | null | undefined): boolean {
  if (!empId) return false
  // Valid format: BP-001, BP-123, BP-1234, etc.
  return /^BP-\d{3,}$/.test(empId)
}

/**
 * Sanitize employee ID for display
 * Fixes common issues like BP-NaN, invalid formats, etc.
 */
export function sanitizeEmployeeId(empId: string | null | undefined): string {
  if (!empId) return 'Not Assigned'

  // Check for BP-NaN or other invalid formats
  if (empId === 'BP-NaN' || empId.includes('NaN') || empId.includes('undefined')) {
    return 'ID Error - Contact Admin'
  }

  // Check if it's a valid format
  if (isValidEmployeeId(empId)) {
    return empId
  }

  // If it starts with BP- but has invalid suffix, show error
  if (empId.startsWith('BP-')) {
    return 'ID Error - Contact Admin'
  }

  // Return as-is for other formats (legacy IDs)
  return empId
}

/**
 * Format role values for display
 * Maps role enums to human-readable labels with special handling for certain roles
 */
export function formatRoleLabel(role: string | null | undefined): string {
  if (!role) return 'N/A'

  // Special mappings for roles that need custom labels
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    OPERATIONS_HEAD: 'Operations Head',
    HR: 'HR',
    OPS: 'Operations',
  }

  // Return special label if exists, otherwise convert SNAKE_CASE to Title Case
  return roleLabels[role] || role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format amount in INR using Indian number system
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

/**
 * Format amount in INR with compact notation (K, L, Cr)
 */
export function formatINRCompact(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₹0'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return formatINR(amount)
}

/**
 * Format currency values in INR (Indian Rupees)
 * Handles null/undefined/NaN gracefully with fallback
 *
 * @param amount - The amount to format
 * @param options - Formatting options
 * @param options.fallback - Text to show for null/undefined values (default: '-')
 * @param options.compact - Use compact notation (K, L for thousands, lakhs)
 * @param options.showDecimals - Show decimal places (default: false)
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: {
    fallback?: string
    compact?: boolean
    showDecimals?: boolean
  } = {}
): string {
  const { fallback = '-', compact = false, showDecimals = false } = options

  // Handle null, undefined, or NaN
  if (amount === null || amount === undefined || isNaN(amount)) {
    return fallback
  }

  // For compact notation (K = thousands, L = lakhs)
  if (compact) {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(showDecimals ? 1 : 0)}K`
    }
  }

  // Standard INR formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount)
}

/**
 * User-friendly error messages for common API errors
 * Maps technical error codes/messages to human-readable text
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'Unauthorized': 'Please log in to continue',
  'Forbidden': 'You don\'t have permission to perform this action',
  'Not authorized': 'You don\'t have permission to perform this action',

  // Validation errors
  'Missing required fields': 'Please fill in all required fields',
  'Invalid stage': 'Please select a valid status',
  'Invalid status': 'Please select a valid status',
  'Invalid leave type': 'Please select a valid leave type',

  // Resource errors
  'not found': 'The requested item could not be found',
  'Client not found': 'This client no longer exists or was deleted',
  'Leave request not found': 'This leave request no longer exists',
  'Task not found': 'This task no longer exists or was deleted',
  'User not found': 'This user account could not be found',
  'Invoice not found': 'This invoice no longer exists',

  // Business logic errors
  'already': 'This action has already been completed',
  'Insufficient': 'Insufficient balance for this request',
  'exceeds': 'The amount exceeds the allowed limit',
  'duplicate': 'This appears to be a duplicate entry',

  // Generic fallbacks
  'Failed to': 'Something went wrong. Please try again.',
  'Internal server error': 'A server error occurred. Please try again later.',
}

/**
 * Extract user-friendly error message from API response
 *
 * @param error - The error object or response
 * @param fallback - Fallback message if no specific message found
 * @returns User-friendly error message
 *
 * @example
 * try {
 *   const res = await fetch('/api/something')
 *   if (!res.ok) {
 *     const data = await res.json()
 *     showToast(getErrorMessage(data), 'error')
 *   }
 * } catch (err) {
 *   showToast(getErrorMessage(err), 'error')
 * }
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = 'Something went wrong. Please try again.'
): string {
  // Handle null/undefined
  if (!error) return fallback

  // Extract message from various error formats
  let message: string = fallback

  if (typeof error === 'string') {
    message = error
  } else if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    // Check common API response formats
    message = (
      errorObj.error ||
      errorObj.message ||
      errorObj.errorMessage ||
      errorObj.detail ||
      fallback
    ) as string
  }

  // Look for user-friendly replacements
  for (const [key, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      // For specific errors, return the API message if it's informative
      if (key === 'Insufficient' || key === 'already' || key === 'exceeds') {
        return message // Keep the specific details
      }
      return friendlyMessage
    }
  }

  // If the message looks like a technical error, replace with fallback
  if (
    message.includes('prisma') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT') ||
    message.includes('TypeError') ||
    message.includes('Cannot read') ||
    message.includes('undefined')
  ) {
    return 'A server error occurred. Please try again later.'
  }

  return message
}

/**
 * Extract error message from fetch Response object
 * Handles JSON parsing and falls back gracefully
 */
export async function getResponseError(
  response: Response,
  fallback: string = 'Something went wrong. Please try again.'
): Promise<string> {
  try {
    const data = await response.json()
    return getErrorMessage(data, fallback)
  } catch {
    // If response isn't JSON, return status-based message
    if (response.status === 401) return 'Please log in to continue'
    if (response.status === 403) return 'You don\'t have permission to perform this action'
    if (response.status === 404) return 'The requested item could not be found'
    if (response.status >= 500) return 'A server error occurred. Please try again later.'
    return fallback
  }
}
