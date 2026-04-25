/**
 * Re-authentication for Sensitive Operations
 *
 * Requires users to confirm their password before performing
 * sensitive actions like viewing decrypted credentials.
 */

import { compare } from 'bcryptjs'
import prisma from '@/server/db/prisma'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const reAuthSecretValue = process.env.REAUTH_SECRET || process.env.NEXTAUTH_SECRET
if (!reAuthSecretValue) {
  throw new Error('REAUTH_SECRET or NEXTAUTH_SECRET environment variable is required for re-authentication')
}
const RE_AUTH_SECRET = new TextEncoder().encode(reAuthSecretValue)

interface ReAuthPayload extends JWTPayload {
  userId: string
  scope: string
}

/**
 * Verify password and generate short-lived re-auth token
 */
export async function createReAuthToken(
  userId: string,
  password: string,
  scope: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Users using magic link may not have a password
    if (!user.password) {
      return { success: false, error: 'Password authentication not available. Please set a password in your profile.' }
    }

    // Verify password
    const isValid = await compare(password, user.password)
    if (!isValid) {
      return { success: false, error: 'Invalid password' }
    }

    // Generate short-lived token
    const token = await new SignJWT({
      userId,
      scope,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(RE_AUTH_SECRET)

    return { success: true, token }
  } catch (error) {
    console.error('Re-auth error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Verify a re-auth token
 */
export async function verifyReAuthToken(
  token: string,
  expectedUserId: string,
  expectedScope: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const { payload } = await jwtVerify(token, RE_AUTH_SECRET)

    const data = payload as ReAuthPayload

    // Verify user ID matches
    if (data.userId !== expectedUserId) {
      return { valid: false, error: 'Token user mismatch' }
    }

    // Verify scope
    if (data.scope !== expectedScope && data.scope !== 'all') {
      return { valid: false, error: 'Token scope mismatch' }
    }

    // Token is valid (expiry already checked by jwtVerify)
    return { valid: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes('expired')) {
      return { valid: false, error: 'Re-authentication expired. Please authenticate again.' }
    }
    return { valid: false, error: 'Invalid re-authentication token' }
  }
}

/**
 * Extract re-auth token from request headers
 */
export function getReAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('X-ReAuth-Token')
  return authHeader || null
}

/**
 * Scopes for re-authentication
 */
export const RE_AUTH_SCOPES = {
  VIEW_CREDENTIALS: 'view-credentials',
  ROTATE_CREDENTIALS: 'rotate-credentials',
  DELETE_CREDENTIALS: 'delete-credentials',
  ALL: 'all',
} as const

export type ReAuthScope = typeof RE_AUTH_SCOPES[keyof typeof RE_AUTH_SCOPES]
