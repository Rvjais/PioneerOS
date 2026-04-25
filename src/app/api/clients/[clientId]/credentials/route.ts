import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'
import { encrypt, decrypt } from '@/server/security/encryption'

// Roles that can manage client credentials
const CREDENTIAL_ACCESS_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']

// Validation schema for credential
const credentialSchema = z.object({
  platform: z.string().min(1).max(100),
  category: z.enum(['PLATFORM', 'SOCIAL', 'HOSTING', 'ANALYTICS', 'ADS', 'OTHER']).default('PLATFORM'),
  username: z.string().max(200).optional().nullable(),
  password: z.string().max(500).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.literal('')),
  url: z.string().url().max(500).optional().nullable().or(z.literal('')),
  apiKey: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

// GET /api/clients/[clientId]/credentials - List all credentials for a client
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check if user has access to this client
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Check if user can view credentials (admin roles or account manager)
  const canViewCredentials = CREDENTIAL_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canViewCredentials) {
    return NextResponse.json({ error: 'You do not have permission to view credentials' }, { status: 403 })
  }

  const credentials = await prisma.clientCredential.findMany({
    where: { clientId },
    take: 100,
    orderBy: [{ isActive: 'desc' }, { platform: 'asc' }],
    select: {
      id: true,
      platform: true,
      category: true,
      username: true,
      password: true,
      email: true,
      url: true,
      apiKey: true,
      notes: true,
      isActive: true,
      lastUpdated: true,
      createdAt: true,
    },
  })

  // SECURITY FIX: Decrypt sensitive fields before returning
  const decryptedCredentials = credentials.map(cred => {
    let password: string | null = null
    let apiKey: string | null = null
    try {
      password = cred.password ? decrypt(cred.password) : null
    } catch {
      password = null
    }
    try {
      apiKey = cred.apiKey ? decrypt(cred.apiKey) : null
    } catch {
      apiKey = null
    }
    return { ...cred, password, apiKey }
  })

  return NextResponse.json({ credentials: decryptedCredentials })
})

// POST /api/clients/[clientId]/credentials - Create a new credential
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check access
  const access = await checkClientAccess(user, clientId)
  const canManageCredentials = CREDENTIAL_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManageCredentials) {
    return NextResponse.json({ error: 'You do not have permission to manage credentials' }, { status: 403 })
  }

  // Verify client exists
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = credentialSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  // SECURITY FIX: Encrypt sensitive fields before storing
  const credential = await prisma.clientCredential.create({
    data: {
      clientId,
      platform: data.platform,
      category: data.category,
      username: data.username || null,
      password: data.password ? encrypt(data.password) : null,
      email: data.email || null,
      url: data.url || null,
      apiKey: data.apiKey ? encrypt(data.apiKey) : null,
      notes: data.notes || null,
    },
  })

  // Log for audit
  console.error(`[ADMIN_CREDENTIAL_CREATED] ClientId: ${clientId}, CredentialId: ${credential.id}, Platform: ${data.platform}, CreatedBy: ${user.empId}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({ success: true, credential })
})

// PUT /api/clients/[clientId]/credentials - Update a credential
export const PUT = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check access
  const access = await checkClientAccess(user, clientId)
  const canManageCredentials = CREDENTIAL_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManageCredentials) {
    return NextResponse.json({ error: 'You do not have permission to manage credentials' }, { status: 403 })
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id, ...updateData } = body as { id?: string } & Record<string, unknown>

  if (!id) {
    return NextResponse.json({ error: 'Credential ID is required' }, { status: 400 })
  }

  // Verify credential belongs to this client
  const existing = await prisma.clientCredential.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
  }

  const validation = credentialSchema.partial().safeParse(updateData)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  // SECURITY FIX: Encrypt sensitive fields before storing
  const credential = await prisma.clientCredential.update({
    where: { id },
    data: {
      platform: data.platform ?? undefined,
      category: data.category ?? undefined,
      username: data.username !== undefined ? (data.username || null) : undefined,
      password: data.password !== undefined ? (data.password ? encrypt(data.password) : null) : undefined,
      email: data.email !== undefined ? (data.email || null) : undefined,
      url: data.url !== undefined ? (data.url || null) : undefined,
      apiKey: data.apiKey !== undefined ? (data.apiKey ? encrypt(data.apiKey) : null) : undefined,
      notes: data.notes !== undefined ? (data.notes || null) : undefined,
      lastUpdated: new Date(),
    },
  })

  // Log for audit
  console.error(`[ADMIN_CREDENTIAL_UPDATED] ClientId: ${clientId}, CredentialId: ${id}, UpdatedBy: ${user.empId}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({ success: true, credential })
})

// DELETE /api/clients/[clientId]/credentials - Delete a credential
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check access
  const access = await checkClientAccess(user, clientId)
  const canManageCredentials = CREDENTIAL_ACCESS_ROLES.includes(user.role) || access.accessReason === 'account_manager'
  if (!canManageCredentials) {
    return NextResponse.json({ error: 'You do not have permission to manage credentials' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')
  const hardDelete = searchParams.get('hard') === 'true'

  if (!id) {
    return NextResponse.json({ error: 'Credential ID is required' }, { status: 400 })
  }

  // Verify credential belongs to this client
  const existing = await prisma.clientCredential.findFirst({
    where: { id, clientId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
  }

  if (hardDelete && ['SUPER_ADMIN'].includes(user.role)) {
    // Hard delete for super admins
    await prisma.clientCredential.delete({
      where: { id },
    })
    console.error(`[ADMIN_CREDENTIAL_HARD_DELETED] ClientId: ${clientId}, CredentialId: ${id}, DeletedBy: ${user.empId}, Timestamp: ${new Date().toISOString()}`)
  } else {
    // Soft delete by marking as inactive
    await prisma.clientCredential.update({
      where: { id },
      data: { isActive: false },
    })
    console.error(`[ADMIN_CREDENTIAL_SOFT_DELETED] ClientId: ${clientId}, CredentialId: ${id}, DeletedBy: ${user.empId}, Timestamp: ${new Date().toISOString()}`)
  }

  return NextResponse.json({ success: true })
})
