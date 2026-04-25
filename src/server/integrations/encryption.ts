// Token encryption utilities for secure storage
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const secret = process.env.OAUTH_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('OAUTH_ENCRYPTION_SECRET or NEXTAUTH_SECRET must be set')
  }
  // Derive a 32-byte key from the secret using per-deployment salt
  const salt = process.env.ENCRYPTION_SALT || process.env.OAUTH_ENCRYPTION_SALT
  if (!salt && process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_SALT or OAUTH_ENCRYPTION_SALT is required in production for OAuth token encryption')
  }
  return crypto.scryptSync(secret, salt || 'oauth-tokens-dev-salt', 32)
}

/**
 * Encrypt sensitive data (tokens)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Combine IV + authTag + encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt sensitive data (tokens)
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey()

  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const [ivHex, authTagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Generate an encrypted state parameter for OAuth
 * Uses AES-256-GCM encryption instead of plain base64 encoding
 */
export function generateOAuthState(data: {
  clientId: string
  platform: string
  returnUrl?: string
}): string {
  const payload = {
    ...data,
    nonce: crypto.randomBytes(16).toString('hex'),
    timestamp: Date.now(),
  }
  return encrypt(JSON.stringify(payload))
}

/**
 * Parse and validate OAuth state parameter (decrypts first)
 */
export function parseOAuthState(state: string): {
  clientId: string
  platform: string
  returnUrl?: string
  timestamp: number
} | null {
  try {
    const decrypted = decrypt(state)
    const payload = JSON.parse(decrypted)

    // Validate state is not too old (15 minutes)
    const maxAge = 15 * 60 * 1000
    if (Date.now() - payload.timestamp > maxAge) {
      console.error('OAuth state expired')
      return null
    }

    return payload
  } catch (error) {
    console.error('Failed to parse OAuth state:', error)
    return null
  }
}
