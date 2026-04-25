/**
 * File Upload Security Utilities
 *
 * Provides validation for file uploads including:
 * - File size limits
 * - MIME type validation
 * - File extension validation
 * - Filename sanitization
 */

import { sanitizeFilename } from '@/shared/validation/sanitize'

// Maximum file sizes in bytes
export const MAX_FILE_SIZES = {
  document: 10 * 1024 * 1024, // 10MB for general documents
  excel: 25 * 1024 * 1024, // 25MB for Excel files
  image: 5 * 1024 * 1024, // 5MB for images
  pdf: 20 * 1024 * 1024, // 20MB for PDFs
  default: 10 * 1024 * 1024, // 10MB default
} as const

// Allowed MIME types by category
export const ALLOWED_MIME_TYPES = {
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    'text/csv',
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  pdf: ['application/pdf'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
} as const

// Allowed extensions by category (for double-checking)
export const ALLOWED_EXTENSIONS = {
  excel: ['.xls', '.xlsx', '.csv', '.ods'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  pdf: ['.pdf'],
  document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
} as const

export type FileCategory = keyof typeof ALLOWED_MIME_TYPES

export interface FileValidationResult {
  valid: boolean
  error?: string
  sanitizedFilename?: string
}

export interface FileValidationOptions {
  category: FileCategory
  maxSize?: number
  allowedMimeTypes?: readonly string[]
  allowedExtensions?: readonly string[]
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

/**
 * Check if MIME type is valid for the category
 */
function isValidMimeType(
  mimeType: string,
  category: FileCategory,
  allowedMimeTypes?: readonly string[]
): boolean {
  const allowed = allowedMimeTypes ?? ALLOWED_MIME_TYPES[category]
  return allowed.includes(mimeType)
}

/**
 * Check if file extension is valid for the category
 */
function isValidExtension(
  filename: string,
  category: FileCategory,
  allowedExtensions?: readonly string[]
): boolean {
  const ext = getFileExtension(filename)
  if (!ext) return false
  const allowed = allowedExtensions ?? ALLOWED_EXTENSIONS[category]
  return allowed.includes(ext)
}

/**
 * Validate a file upload
 *
 * @param file - The File object to validate
 * @param options - Validation options
 * @returns Validation result with sanitized filename if valid
 */
export function validateFileUpload(
  file: File,
  options: FileValidationOptions
): FileValidationResult {
  const {
    category,
    maxSize = MAX_FILE_SIZES[category] ?? MAX_FILE_SIZES.default,
    allowedMimeTypes,
    allowedExtensions,
  } = options

  // Check if file exists
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file provided' }
  }

  // Check file size
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' }
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxSizeMB}MB)`,
    }
  }

  // Check MIME type
  if (!isValidMimeType(file.type, category, allowedMimeTypes)) {
    const allowed = allowedMimeTypes ?? ALLOWED_MIME_TYPES[category]
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowed.join(', ')}`,
    }
  }

  // Check file extension (double-check for security)
  if (!isValidExtension(file.name, category, allowedExtensions)) {
    const allowed = allowedExtensions ?? ALLOWED_EXTENSIONS[category]
    return {
      valid: false,
      error: `Invalid file extension. Allowed extensions: ${allowed.join(', ')}`,
    }
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name)
  if (!sanitizedFilename) {
    return { valid: false, error: 'Invalid filename' }
  }

  return {
    valid: true,
    sanitizedFilename,
  }
}

/**
 * Validate a URL-based file reference
 *
 * @param fileUrl - The file URL to validate
 * @param fileType - Optional MIME type to validate
 * @param category - File category for validation
 * @returns Validation result
 */
export function validateFileUrl(
  fileUrl: string,
  fileType?: string,
  category?: FileCategory
): FileValidationResult {
  // Basic URL validation
  try {
    const url = new URL(fileUrl)

    // Only allow HTTPS URLs (or localhost for development)
    if (
      url.protocol !== 'https:' &&
      !(
        process.env.NODE_ENV === 'development' &&
        (url.protocol === 'http:' || url.hostname === 'localhost')
      )
    ) {
      return { valid: false, error: 'Only HTTPS URLs are allowed' }
    }

    // Validate MIME type if provided
    if (fileType && category) {
      if (!isValidMimeType(fileType, category)) {
        return { valid: false, error: `Invalid file type for ${category}` }
      }
    }

    // Extract and sanitize filename from URL
    const pathname = url.pathname
    const filename = pathname.split('/').pop() || 'file'
    const sanitizedFilename = sanitizeFilename(decodeURIComponent(filename))

    return {
      valid: true,
      sanitizedFilename,
    }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
