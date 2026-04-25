import { NextRequest, NextResponse } from 'next/server'
import { validateClientPortalSession } from '@/server/auth/clientPortalAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { encrypt } from '@/server/security/encryption'

const credentialSchema = z.object({
  platform: z.string().min(1).max(100),
  category: z.enum(['DOMAIN', 'HOSTING', 'CMS', 'OTHER']).default('OTHER'),
  username: z.string().max(200).optional().nullable(),
  password: z.string().max(500).optional().nullable(),
  url: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

// GET /api/web-portal/credentials - Get client credentials for web services
export async function GET() {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  try {
    // Get credentials from ClientCredential table
    // Filter to only show web-related categories
    // Include password in select to compute hasPassword flag, then strip it
    const credentialsRaw = await prisma.clientCredential.findMany({
      where: {
        clientId: user.clientId,
        category: {
          in: ['HOSTING', 'DOMAIN', 'CMS', 'OTHER'],
        },
      },
      select: {
        id: true,
        platform: true,
        category: true,
        username: true,
        password: true,
        url: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { platform: 'asc' },
      take: 100,
    })

    // Add hasPassword flag and strip the actual password
    const credentialsWithFlags = credentialsRaw.map(({ password, ...cred }) => ({
      ...cred,
      hasPassword: !!password,
    }))

    // Group by category
    const grouped = {
      DOMAIN: credentialsWithFlags.filter(c => c.category === 'DOMAIN'),
      HOSTING: credentialsWithFlags.filter(c => c.category === 'HOSTING'),
      CMS: credentialsWithFlags.filter(c => c.category === 'CMS'),
      OTHER: credentialsWithFlags.filter(c => c.category === 'OTHER'),
    }

    return NextResponse.json({
      credentials: credentialsWithFlags,
      grouped,
      total: credentialsWithFlags.length,
    })
  } catch (error) {
    console.error('Failed to fetch credentials:', error)
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 })
  }
}

// POST /api/web-portal/credentials - Add new credential
export async function POST(req: NextRequest) {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  // Only PRIMARY users can add credentials
  if (user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'Only primary users can add credentials' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const validation = credentialSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const data = validation.data

    // Create credential
    const credential = await prisma.clientCredential.create({
      data: {
        clientId: user.clientId,
        platform: data.platform,
        category: data.category,
        username: data.username || null,
        password: data.password ? encrypt(data.password) : null,
        url: data.url || null,
        notes: data.notes || null,
      },
      select: {
        id: true,
        platform: true,
        category: true,
        username: true,
        url: true,
        notes: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      credential: {
        ...credential,
        hasPassword: !!data.password,
      },
    })
  } catch (error) {
    console.error('Failed to create credential:', error)
    return NextResponse.json({ error: 'Failed to add credential' }, { status: 500 })
  }
}

const updateCredentialSchema = z.object({
  id: z.string(),
  platform: z.string().min(1).max(100).optional(),
  category: z.enum(['DOMAIN', 'HOSTING', 'CMS', 'OTHER']).optional(),
  username: z.string().max(200).optional().nullable(),
  password: z.string().max(500).optional().nullable(),
  url: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

// PUT /api/web-portal/credentials - Update credential
export async function PUT(req: NextRequest) {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  if (user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'Only primary users can edit credentials' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const validation = updateCredentialSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { id, ...data } = validation.data

    // Verify credential belongs to this client
    const existing = await prisma.clientCredential.findFirst({
      where: { id, clientId: user.clientId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.platform !== undefined) updateData.platform = data.platform
    if (data.category !== undefined) updateData.category = data.category
    if (data.username !== undefined) updateData.username = data.username || null
    if (data.password !== undefined) updateData.password = data.password ? encrypt(data.password) : null
    if (data.url !== undefined) updateData.url = data.url || null
    if (data.notes !== undefined) updateData.notes = data.notes || null

    const credential = await prisma.clientCredential.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        platform: true,
        category: true,
        username: true,
        url: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      credential: {
        ...credential,
        hasPassword: data.password !== undefined ? !!data.password : !!existing.password,
      },
    })
  } catch (error) {
    console.error('Failed to update credential:', error)
    return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 })
  }
}

// DELETE /api/web-portal/credentials - Delete credential
export async function DELETE(req: NextRequest) {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  if (user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'Only primary users can delete credentials' }, { status: 403 })
  }

  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Credential ID required' }, { status: 400 })
    }

    // Verify credential belongs to this client
    const existing = await prisma.clientCredential.findFirst({
      where: { id, clientId: user.clientId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    await prisma.clientCredential.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete credential:', error)
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 })
  }
}
