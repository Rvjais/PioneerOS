/**
 * CredentialService - Centralized API Credential Management
 *
 * Manages API credentials with database storage and .env fallback.
 * All credentials are encrypted at rest using AES-256-GCM.
 */

import prisma from '@/server/db/prisma'
import { encrypt, decrypt, encryptJSON, decryptJSON, maskSensitive } from '@/server/security/encryption'
import { PROVIDERS, ProviderConfig } from './providers'

export type CredentialStatus = 'ACTIVE' | 'INVALID' | 'EXPIRED' | 'DISABLED'
export type CredentialType = 'OAUTH' | 'API_KEY' | 'WEBHOOK'
export type Environment = 'PRODUCTION' | 'SANDBOX'

export interface CredentialFields {
  [key: string]: string
}

export interface CredentialRecord {
  id: string
  provider: string
  credentialType: CredentialType
  name: string
  status: CredentialStatus
  environment: Environment
  lastVerifiedAt: Date | null
  lastVerifiedBy: string | null
  lastError: string | null
  usageCount: number
  lastUsedAt: Date | null
  createdAt: Date
  createdBy: string | null
  updatedAt: Date
  updatedBy: string | null
}

export interface CredentialWithMasked extends CredentialRecord {
  credentials: Record<string, string> // Masked values
}

export interface TestResult {
  success: boolean
  message: string
  details?: Record<string, unknown>
}

/**
 * Get decrypted credentials for a provider from the database
 */
export async function getCredentials(
  provider: string,
  environment: Environment = 'PRODUCTION'
): Promise<Record<string, string> | null> {
  try {
    const credential = await prisma.agencyApiCredential.findUnique({
      where: {
        provider_environment: {
          provider,
          environment,
        },
      },
    })

    if (!credential || credential.status !== 'ACTIVE') {
      return null
    }

    // Update usage stats
    await prisma.agencyApiCredential.update({
      where: { id: credential.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    })

    return decryptJSON<Record<string, string>>(credential.credentials)
  } catch (error) {
    console.error(`Error fetching credentials for ${provider}:`, error)
    return null
  }
}

/**
 * Get credentials with fallback to environment variables (for migration period)
 */
export async function getCredentialsWithFallback(
  provider: string,
  environment: Environment = 'PRODUCTION'
): Promise<Record<string, string>> {
  // First try database
  const dbCredentials = await getCredentials(provider, environment)
  if (dbCredentials) {
    return dbCredentials
  }

  // Fallback to environment variables
  const providerConfig = PROVIDERS[provider]
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const envCredentials: Record<string, string> = {}
  for (const field of providerConfig.fields) {
    const envValue = process.env[field.envKey]
    if (envValue) {
      envCredentials[field.key] = envValue
    }
  }

  return envCredentials
}

/**
 * Save credentials for a provider (encrypted)
 */
export async function saveCredentials(
  provider: string,
  credentialType: CredentialType,
  name: string,
  credentials: Record<string, string>,
  userId: string,
  environment: Environment = 'PRODUCTION'
): Promise<string> {
  const encryptedCredentials = encryptJSON(credentials)

  const existing = await prisma.agencyApiCredential.findUnique({
    where: {
      provider_environment: {
        provider,
        environment,
      },
    },
  })

  let credentialId: string

  if (existing) {
    const updated = await prisma.agencyApiCredential.update({
      where: { id: existing.id },
      data: {
        credentialType,
        name,
        credentials: encryptedCredentials,
        status: 'ACTIVE',
        updatedBy: userId,
        updatedAt: new Date(),
      },
    })
    credentialId = updated.id

    // Log the update
    await logCredentialAccess(credentialId, 'UPDATE', userId, true)
  } else {
    const created = await prisma.agencyApiCredential.create({
      data: {
        provider,
        credentialType,
        name,
        credentials: encryptedCredentials,
        environment,
        createdBy: userId,
      },
    })
    credentialId = created.id

    // Log the creation
    await logCredentialAccess(credentialId, 'CREATE', userId, true)
  }

  return credentialId
}

/**
 * Delete credentials for a provider
 */
export async function deleteCredentials(
  credentialId: string,
  userId: string
): Promise<void> {
  // Log the deletion before deleting
  await logCredentialAccess(credentialId, 'DELETE', userId, true)

  await prisma.agencyApiCredential.delete({
    where: { id: credentialId },
  })
}

/**
 * Update credential status
 */
export async function updateCredentialStatus(
  credentialId: string,
  status: CredentialStatus,
  error?: string,
  userId?: string
): Promise<void> {
  await prisma.agencyApiCredential.update({
    where: { id: credentialId },
    data: {
      status,
      lastError: error || null,
      updatedBy: userId,
      updatedAt: new Date(),
    },
  })
}

/**
 * Test credentials for a provider
 */
export async function testCredentials(
  provider: string,
  credentials?: Record<string, string>,
  environment: Environment = 'PRODUCTION'
): Promise<TestResult> {
  const providerConfig = PROVIDERS[provider]
  if (!providerConfig) {
    return { success: false, message: `Unknown provider: ${provider}` }
  }

  const creds = credentials || (await getCredentialsWithFallback(provider, environment))

  // Check required fields
  for (const field of providerConfig.fields) {
    if (field.required && !creds[field.key]) {
      return { success: false, message: `Missing required field: ${field.label}` }
    }
  }

  // Run provider-specific test
  if (providerConfig.testConnection) {
    try {
      const result = await providerConfig.testConnection(creds)

      // Update verification status in database
      const credential = await prisma.agencyApiCredential.findUnique({
        where: {
          provider_environment: {
            provider,
            environment,
          },
        },
      })

      if (credential) {
        await prisma.agencyApiCredential.update({
          where: { id: credential.id },
          data: {
            lastVerifiedAt: new Date(),
            status: result.success ? 'ACTIVE' : 'INVALID',
            lastError: result.success ? null : result.message,
          },
        })

        await logCredentialAccess(credential.id, 'VERIFY', undefined, result.success, result.message)
      }

      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection test failed'
      return { success: false, message }
    }
  }

  return { success: true, message: 'No test function available for this provider' }
}

/**
 * Get all credentials (with masked values for UI)
 */
export async function listCredentials(): Promise<CredentialWithMasked[]> {
  const credentials = await prisma.agencyApiCredential.findMany({
    orderBy: { provider: 'asc' },
  })

  return credentials.map((cred) => {
    const decrypted = decryptJSON<Record<string, string>>(cred.credentials) || {}
    const masked: Record<string, string> = {}

    for (const [key, value] of Object.entries(decrypted)) {
      masked[key] = maskSensitive(value, 4)
    }

    return {
      id: cred.id,
      provider: cred.provider,
      credentialType: cred.credentialType as CredentialType,
      name: cred.name,
      status: cred.status as CredentialStatus,
      environment: cred.environment as Environment,
      lastVerifiedAt: cred.lastVerifiedAt,
      lastVerifiedBy: cred.lastVerifiedBy,
      lastError: cred.lastError,
      usageCount: cred.usageCount,
      lastUsedAt: cred.lastUsedAt,
      createdAt: cred.createdAt,
      createdBy: cred.createdBy,
      updatedAt: cred.updatedAt,
      updatedBy: cred.updatedBy,
      credentials: masked,
    }
  })
}

/**
 * Get a single credential by ID (with full decrypted values - for viewing)
 */
export async function getCredentialById(
  credentialId: string,
  userId: string
): Promise<{ record: CredentialRecord; credentials: Record<string, string> } | null> {
  const credential = await prisma.agencyApiCredential.findUnique({
    where: { id: credentialId },
  })

  if (!credential) {
    return null
  }

  // Log the view access
  await logCredentialAccess(credentialId, 'VIEW', userId, true)

  const decrypted = decryptJSON<Record<string, string>>(credential.credentials) || {}

  return {
    record: {
      id: credential.id,
      provider: credential.provider,
      credentialType: credential.credentialType as CredentialType,
      name: credential.name,
      status: credential.status as CredentialStatus,
      environment: credential.environment as Environment,
      lastVerifiedAt: credential.lastVerifiedAt,
      lastVerifiedBy: credential.lastVerifiedBy,
      lastError: credential.lastError,
      usageCount: credential.usageCount,
      lastUsedAt: credential.lastUsedAt,
      createdAt: credential.createdAt,
      createdBy: credential.createdBy,
      updatedAt: credential.updatedAt,
      updatedBy: credential.updatedBy,
    },
    credentials: decrypted,
  }
}

/**
 * Rotate credentials (mark old as disabled, create new)
 */
export async function rotateCredentials(
  provider: string,
  newCredentials: Record<string, string>,
  userId: string,
  environment: Environment = 'PRODUCTION'
): Promise<string> {
  const existing = await prisma.agencyApiCredential.findUnique({
    where: {
      provider_environment: {
        provider,
        environment,
      },
    },
  })

  if (existing) {
    // Log the rotation
    await logCredentialAccess(existing.id, 'ROTATE', userId, true)
  }

  // Save new credentials
  const providerConfig = PROVIDERS[provider]
  return saveCredentials(
    provider,
    providerConfig?.type || 'API_KEY',
    providerConfig?.name || provider,
    newCredentials,
    userId,
    environment
  )
}

/**
 * Migrate credentials from environment variables to database
 */
export async function migrateFromEnv(userId: string): Promise<{
  migrated: string[]
  skipped: string[]
  errors: Array<{ provider: string; error: string }>
}> {
  const migrated: string[] = []
  const skipped: string[] = []
  const errors: Array<{ provider: string; error: string }> = []

  for (const [provider, config] of Object.entries(PROVIDERS)) {
    try {
      // Check if already exists in database
      const existing = await prisma.agencyApiCredential.findUnique({
        where: {
          provider_environment: {
            provider,
            environment: 'PRODUCTION',
          },
        },
      })

      if (existing) {
        skipped.push(provider)
        continue
      }

      // Get values from environment
      const credentials: Record<string, string> = {}
      let hasAnyValue = false

      for (const field of config.fields) {
        const value = process.env[field.envKey]
        if (value) {
          credentials[field.key] = value
          hasAnyValue = true
        }
      }

      if (hasAnyValue) {
        await saveCredentials(
          provider,
          config.type,
          config.name,
          credentials,
          userId
        )
        migrated.push(provider)
      } else {
        skipped.push(provider)
      }
    } catch (error) {
      errors.push({
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return { migrated, skipped, errors }
}

/**
 * Log credential access/changes
 */
export async function logCredentialAccess(
  credentialId: string,
  action: string,
  userId?: string,
  success: boolean = true,
  errorMessage?: string,
  userIp?: string
): Promise<void> {
  await prisma.apiCredentialAuditLog.create({
    data: {
      credentialId,
      action,
      userId: userId || 'system',
      success,
      errorMessage,
      userIp,
    },
  })
}

/**
 * Get audit log for credentials
 */
export async function getAuditLog(options: {
  credentialId?: string
  limit?: number
  offset?: number
}): Promise<{
  logs: Array<{
    id: string
    credentialId: string
    action: string
    userId: string
    userIp: string | null
    success: boolean
    errorMessage: string | null
    createdAt: Date
    provider?: string
  }>
  total: number
}> {
  const { credentialId, limit = 50, offset = 0 } = options

  const where = credentialId ? { credentialId } : {}

  const [logs, total] = await Promise.all([
    prisma.apiCredentialAuditLog.findMany({
      where,
      include: {
        credential: {
          select: { provider: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.apiCredentialAuditLog.count({ where }),
  ])

  return {
    logs: logs.map((log) => ({
      id: log.id,
      credentialId: log.credentialId,
      action: log.action,
      userId: log.userId,
      userIp: log.userIp,
      success: log.success,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
      provider: log.credential?.provider,
    })),
    total,
  }
}
