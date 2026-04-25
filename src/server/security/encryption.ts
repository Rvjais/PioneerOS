/**
 * Encryption Utility for Sensitive Data
 *
 * Uses AES-256-GCM for symmetric encryption of sensitive fields
 * like PAN, Aadhaar, bank details, API credentials, etc.
 */

import * as crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

// Track if we've warned about dev key usage
let hasWarnedAboutDevKey = false

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    // In production or staging, fail fast — never allow default keys
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable is REQUIRED in production. Refusing to start with default key.')
    }
    if (process.env.NODE_ENV !== 'development') {
      throw new Error(`ENCRYPTION_KEY environment variable is required in ${process.env.NODE_ENV}`)
    }
    if (!hasWarnedAboutDevKey) {
      console.warn('[ENCRYPTION] Using default development key - set ENCRYPTION_KEY env var for real encryption')
      hasWarnedAboutDevKey = true
    }
    return crypto.scryptSync('dev-encryption-key-not-for-production', 'dev-salt-not-for-production', 32)
  }

  // Enforce minimum key strength
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters for adequate security')
  }

  // If key is 64 hex characters, convert from hex
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex')
  }

  // Otherwise, derive a key from the provided string using per-deployment salt
  const salt = process.env.ENCRYPTION_SALT
  if (!salt) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_SALT is required in production. Set a unique ENCRYPTION_SALT environment variable.')
    }
    console.warn('[ENCRYPTION] ENCRYPTION_SALT not set — using default salt. Set a unique ENCRYPTION_SALT in production.')
  }
  return crypto.scryptSync(key, salt || 'pioneer-os-default-salt', 32)
}

/**
 * Validate encryption configuration at startup
 * Call this in app initialization to fail fast if misconfigured
 */
export function validateEncryptionConfig(): { valid: boolean; message: string } {
  const key = process.env.ENCRYPTION_KEY
  const salt = process.env.ENCRYPTION_SALT
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction && !key) {
    return {
      valid: false,
      message: 'ENCRYPTION_KEY environment variable is REQUIRED in production'
    }
  }

  if (isProduction && !salt) {
    return {
      valid: false,
      message: 'ENCRYPTION_SALT environment variable is REQUIRED in production'
    }
  }

  if (key && key.length < 32) {
    return {
      valid: false,
      message: 'ENCRYPTION_KEY must be at least 32 characters for adequate security'
    }
  }

  if (!isProduction && !key) {
    return {
      valid: true,
      message: 'Using default development encryption key (not for production)'
    }
  }

  return {
    valid: true,
    message: 'Encryption configured correctly'
  }
}

/**
 * Encrypt a string value
 * Returns format: iv:authTag:encryptedData (all base64)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext

  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'base64')
    encrypted += cipher.final('base64')

    const authTag = cipher.getAuthTag()

    // Format: iv:authTag:encrypted (all base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt an encrypted string
 * Expects format: iv:authTag:encryptedData (all base64)
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext

  // Check if already decrypted (not in encrypted format)
  if (!ciphertext.includes(':')) {
    return ciphertext
  }

  try {
    const key = getEncryptionKey()
    const parts = ciphertext.split(':')

    if (parts.length !== 3) {
      // Not in expected format, return as-is (might be unencrypted)
      return ciphertext
    }

    const [ivBase64, authTagBase64, encrypted] = parts
    const iv = Buffer.from(ivBase64, 'base64')
    const authTag = Buffer.from(authTagBase64, 'base64')

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error: failed to decrypt value')
    throw new Error('Failed to decrypt data. The encryption key may have changed or the data is corrupted.')
  }
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false
  const parts = value.split(':')
  if (parts.length !== 3) return false

  // Check if parts look like base64
  const base64Regex = /^[A-Za-z0-9+/]+=*$/
  return parts.every(part => base64Regex.test(part))
}

/**
 * Encrypt multiple fields in an object
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...obj }

  for (const field of fieldsToEncrypt) {
    const value = result[field]
    if (typeof value === 'string' && value && !isEncrypted(value)) {
      (result as Record<string, unknown>)[field as string] = encrypt(value)
    }
  }

  return result
}

/**
 * Decrypt multiple fields in an object
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj }

  for (const field of fieldsToDecrypt) {
    const value = result[field]
    if (typeof value === 'string' && value && isEncrypted(value)) {
      (result as Record<string, unknown>)[field as string] = decrypt(value)
    }
  }

  return result
}

/**
 * Encrypt JSON data (for credential fields)
 */
export function encryptJSON(data: object): string {
  return encrypt(JSON.stringify(data))
}

/**
 * Decrypt JSON data
 */
export function decryptJSON<T = any>(encrypted: string): T | null {
  if (!encrypted) return null

  try {
    const decrypted = decrypt(encrypted)
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}

/**
 * Mask sensitive data for display (show only last 4 characters)
 */
export function maskSensitive(value: string, showLast = 4): string {
  if (!value) return ''
  if (value.length <= showLast) return '*'.repeat(value.length)

  return '*'.repeat(value.length - showLast) + value.slice(-showLast)
}

/**
 * Mask PAN number (format: ****1234A)
 */
export function maskPAN(pan: string): string {
  if (!pan || pan.length !== 10) return maskSensitive(pan)
  return '****' + pan.slice(4)
}

/**
 * Mask Aadhaar number (format: XXXX XXXX 1234)
 */
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return ''
  const cleaned = aadhaar.replace(/\s/g, '')
  if (cleaned.length !== 12) return maskSensitive(aadhaar)
  return 'XXXX XXXX ' + cleaned.slice(-4)
}

/**
 * Mask bank account number (show only last 4 digits)
 */
export function maskBankAccount(account: string): string {
  if (!account) return ''
  if (account.length <= 4) return '*'.repeat(account.length)
  return '*'.repeat(account.length - 4) + account.slice(-4)
}

/**
 * Hash sensitive data for logging/comparison (one-way)
 */
export function hashSensitive(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16)
}

// Field definitions for different models
export const SENSITIVE_FIELDS = {
  profile: ['panCard', 'aadhaar', 'parentsPhone1', 'parentsPhone2', 'emergencyContactPhone'] as const,
  client: ['gstNumber', 'panNumber', 'bankAccount', 'credentials'] as const,
  freelancerProfile: ['panNumber', 'gstNumber', 'bankAccountNumber', 'bankIfscCode', 'upiId'] as const,
  vendorOnboarding: ['gstNumber', 'panNumber', 'bankAccountNumber', 'bankIFSC'] as const,
  entityBankAccount: ['accountNumber', 'ifscCode', 'swiftCode', 'routingNumber'] as const,
  entityPaymentGateway: ['apiKeyId', 'apiKeySecret', 'webhookSecret', 'merchantId'] as const,
  companyEntity: ['gstNumber', 'panNumber', 'tanNumber', 'einNumber', 'cinNumber'] as const,
}

// Salary/Finance fields that should be hidden from non-authorized users
export const SALARY_FIELDS = {
  candidate: ['salary'] as const,
  internProfile: ['stipendAmount'] as const,
  freelancerProfile: ['hourlyRate', 'projectRate', 'retainerAmount', 'totalEarned', 'pendingAmount'] as const,
  freelancerWorkReport: ['billableAmount'] as const,
  freelancerPayment: ['amount'] as const,
  departmentBaseline: ['baseSalary', 'baseUnits'] as const,
  fnfSettlement: ['totalAmount', 'netPayable'] as const,
  fnfLineItem: ['amount'] as const,
  incentivePayout: ['unitIncentive', 'achievementBonus', 'referralBonus', 'attendanceBonus', 'totalIncentive', 'deductions'] as const,
  rbcAccrual: ['amount'] as const,
  rbcPayout: ['amount'] as const,
}

/**
 * Check if user can view salary data
 * Only SUPER_ADMIN, HR, and ACCOUNTS can view all salaries
 */
export function canViewSalaryData(role: string, department?: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'ACCOUNTS' || department === 'HR' || department === 'ACCOUNTS'
}

/**
 * Mask salary field for display (shows "Hidden" for unauthorized)
 */
export function maskSalaryField(value: number | null | undefined, authorized: boolean): string {
  if (!authorized) return 'Hidden'
  if (value === null || value === undefined) return '-'
  return `₹${value.toLocaleString('en-IN')}`
}

/**
 * Remove salary fields from object if user is not authorized
 */
export function filterSalaryFields<T extends Record<string, any>>(
  data: T,
  modelName: keyof typeof SALARY_FIELDS,
  authorized: boolean
): T {
  if (authorized) return data

  const fields = SALARY_FIELDS[modelName]
  if (!fields) return data

  const result = { ...data }
  for (const field of fields) {
    if (result[field] !== undefined) {
      (result as Record<string, unknown>)[field as string] = null // Hide the value
    }
  }
  return result
}

/**
 * Generate a new encryption key (for initial setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
