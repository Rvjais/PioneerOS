/**
 * Two-Factor Authentication Service
 *
 * Implements TOTP-based 2FA with backup codes
 */

import { generateSecret, generateURI, verify } from 'otplib'
import QRCode from 'qrcode'
import prisma from '@/server/db/prisma'
import { encrypt, decrypt } from '@/server/security/encryption'
import crypto from 'crypto'

const APP_NAME = 'Pioneer OS'

/**
 * Generate a new TOTP secret and QR code for 2FA setup
 */
export async function generate2FASetup(userId: string): Promise<{
  secret: string
  qrCode: string
  backupCodes: string[]
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, empId: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Generate new secret
  const secret = generateSecret()

  // Generate account label
  const accountLabel = user.email || user.empId

  // Generate OTP Auth URL
  const otpAuthUrl = generateURI({
    issuer: APP_NAME,
    label: accountLabel,
    secret,
  })

  // Generate QR code as data URL
  const qrCode = await QRCode.toDataURL(otpAuthUrl)

  // Generate backup codes
  const backupCodes = generateBackupCodes(8)

  // Store encrypted secret and backup codes temporarily
  // (Will be permanently saved after verification)
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encrypt(secret),
      twoFactorBackupCodes: encrypt(JSON.stringify(backupCodes)),
    },
  })

  return {
    secret,
    qrCode,
    backupCodes,
  }
}

/**
 * Verify TOTP token and enable 2FA
 */
export async function verify2FASetup(
  userId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  })

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  if (user.twoFactorEnabled) {
    return { success: false, error: '2FA is already enabled' }
  }

  if (!user.twoFactorSecret) {
    return { success: false, error: 'No 2FA setup in progress' }
  }

  // Decrypt and verify
  const secret = decrypt(user.twoFactorSecret)
  const result = await verify({ secret, token, epochTolerance: 1 })

  if (!result.valid) {
    return { success: false, error: 'Invalid verification code' }
  }

  // Enable 2FA
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorVerifiedAt: new Date(),
    },
  })

  return { success: true }
}

/**
 * Verify 2FA token during login
 */
export async function verify2FAToken(
  userId: string,
  token: string
): Promise<{ success: boolean; error?: string; usedBackupCode?: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true, twoFactorBackupCodes: true },
  })

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false, error: '2FA is not enabled' }
  }

  const secret = decrypt(user.twoFactorSecret)

  // Try TOTP token first
  const result = await verify({ secret, token, epochTolerance: 1 })
  if (result.valid) {
    return { success: true }
  }

  // Try backup codes
  if (user.twoFactorBackupCodes) {
    const backupCodes: string[] = JSON.parse(decrypt(user.twoFactorBackupCodes))
    const codeIndex = backupCodes.indexOf(token.toUpperCase())

    if (codeIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(codeIndex, 1)
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorBackupCodes: encrypt(JSON.stringify(backupCodes)),
        },
      })

      return { success: true, usedBackupCode: true }
    }
  }

  return { success: false, error: 'Invalid verification code' }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(
  userId: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const { compare } = await import('bcryptjs')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, twoFactorEnabled: true },
  })

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  if (!user.twoFactorEnabled) {
    return { success: false, error: '2FA is not enabled' }
  }

  if (!user.password) {
    return { success: false, error: 'Password not set' }
  }

  // Verify password
  const isValid = await compare(password, user.password)
  if (!isValid) {
    return { success: false, error: 'Invalid password' }
  }

  // Disable 2FA
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorVerifiedAt: null,
    },
  })

  return { success: true }
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(
  userId: string,
  password: string
): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
  const { compare } = await import('bcryptjs')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, twoFactorEnabled: true },
  })

  if (!user) {
    return { success: false, error: 'User not found' }
  }

  if (!user.twoFactorEnabled) {
    return { success: false, error: '2FA is not enabled' }
  }

  if (!user.password) {
    return { success: false, error: 'Password not set' }
  }

  // Verify password
  const isValid = await compare(password, user.password)
  if (!isValid) {
    return { success: false, error: 'Invalid password' }
  }

  // Generate new backup codes
  const backupCodes = generateBackupCodes(8)

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorBackupCodes: encrypt(JSON.stringify(backupCodes)),
    },
  })

  return { success: true, backupCodes }
}

/**
 * Check if 2FA is enabled for a user
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true },
  })

  return user?.twoFactorEnabled ?? false
}

/**
 * Generate random backup codes
 */
function generateBackupCodes(count: number): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }
  return codes
}
