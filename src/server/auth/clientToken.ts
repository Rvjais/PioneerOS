/**
 * Secure Client Token Utility
 *
 * Generates and verifies HMAC-signed tokens for client portal magic links.
 * Uses NEXTAUTH_SECRET as the signing key.
 *
 * Token format: base64url(payload).base64url(signature)
 */

import { createHmac, timingSafeEqual } from 'crypto'

interface ClientTokenPayload {
  clientUserId: string
  exp: number // Expiration timestamp (ms)
  iat: number // Issued at timestamp (ms)
}

// Token expires in 7 days (reduced from 30 for security)
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Get the secret key for signing tokens
 */
function getSecretKey(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET must be set')
  }
  // In production, don't allow the default placeholder
  if (process.env.NODE_ENV === 'production' && secret === 'your-super-secret-key-change-in-production') {
    throw new Error('NEXTAUTH_SECRET must be set to a secure value in production')
  }
  return secret
}

/**
 * Create HMAC-SHA256 signature for data
 */
function createSignature(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

/**
 * Verify HMAC-SHA256 signature using timing-safe comparison
 */
function verifySignature(data: string, signature: string, secret: string): boolean {
  const expectedSignature = createSignature(data, secret)

  // Timing-safe comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signature, 'base64url')
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url')

    if (sigBuffer.length !== expectedBuffer.length) {
      return false
    }

    return timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

/**
 * Create a signed client token
 *
 * @param clientUserId - The client user ID to encode in the token
 * @param expiryMs - Optional custom expiry in milliseconds (default: 7 days)
 * @returns Signed token string
 */
export function createClientToken(clientUserId: string, expiryMs?: number): string {
  const secret = getSecretKey()
  const now = Date.now()

  const payload: ClientTokenPayload = {
    clientUserId,
    iat: now,
    exp: now + (expiryMs ?? TOKEN_EXPIRY_MS),
  }

  const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createSignature(payloadString, secret)

  return `${payloadString}.${signature}`
}

/**
 * Verify and decode a client token
 *
 * @param token - The token to verify
 * @returns The decoded payload if valid, null if invalid or expired
 */
export function verifyClientToken(token: string): ClientTokenPayload | null {
  if (!token || typeof token !== 'string') {
    return null
  }

  // Split token into payload and signature
  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [payloadString, signature] = parts

  // Verify signature
  try {
    const secret = getSecretKey()
    if (!verifySignature(payloadString, signature, secret)) {
      return null
    }
  } catch {
    return null
  }

  // Decode and validate payload
  try {
    const payload = JSON.parse(
      Buffer.from(payloadString, 'base64url').toString()
    ) as ClientTokenPayload

    // Validate required fields
    if (!payload.clientUserId || !payload.exp || !payload.iat) {
      return null
    }

    // Check expiration
    if (payload.exp < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Decode a token without verifying (for debugging only)
 * WARNING: Do not use this for authentication - always use verifyClientToken
 */
export function decodeClientTokenUnsafe(token: string): ClientTokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null

    return JSON.parse(
      Buffer.from(parts[0], 'base64url').toString()
    ) as ClientTokenPayload
  } catch {
    return null
  }
}

/**
 * Check if a token is expired (without full verification)
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeClientTokenUnsafe(token)
  if (!payload) return true
  return payload.exp < Date.now()
}
