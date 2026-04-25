import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

interface StoredCredential {
  type: string
  label: string
  url?: string
  username?: string
  password?: string
  notes?: string
}

interface SafeCredential {
  id: string
  type: string
  label: string
  category: string
  url: string | null
  username: string | null
  email: string | null
  hasPassword: boolean
  notes: string | null
  password?: string // Only returned for editing when reveal=true
}

// Validation schema for credential creation/update
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

// Helper function to format credential type as a readable label
function formatLabel(type: string): string {
  const labels: Record<string, string> = {
    website: 'Website Admin',
    websiteAdmin: 'Website Admin',
    analytics: 'Google Analytics',
    googleAnalytics: 'Google Analytics',
    searchConsole: 'Google Search Console',
    googleAds: 'Google Ads',
    metaAds: 'Meta Ads (Facebook)',
    facebookAds: 'Facebook Ads',
    instagram: 'Instagram',
    facebook: 'Facebook Page',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    linkedinAds: 'LinkedIn Ads',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    shopify: 'Shopify',
    wordpress: 'WordPress',
    hosting: 'Web Hosting',
    domain: 'Domain Registrar',
    email: 'Email Marketing',
    mailchimp: 'Mailchimp',
    hubspot: 'HubSpot',
    crm: 'CRM',
    semrush: 'SEMrush',
    ahrefs: 'Ahrefs',
    gmb: 'Google Business Profile',
    googleMyBusiness: 'Google Business Profile',
    canva: 'Canva',
    social: 'Social Media',
  }

  return labels[type] || type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// GET /api/client-portal/credentials - Get credentials for client
// If ?reveal=true and user is PRIMARY, returns passwords for editing
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId
  const searchParams = req.nextUrl.searchParams
  const reveal = searchParams.get('reveal') === 'true' && user.role === 'PRIMARY'
  const safeCredentials: SafeCredential[] = []

  // First, try to fetch from ClientCredential model (new structured approach)
  const structuredCredentials = await prisma.clientCredential.findMany({
    where: { clientId, isActive: true },
    orderBy: { platform: 'asc' },
    take: 100,
  })

  if (structuredCredentials.length > 0) {
    // Use structured credentials from the new model
    for (const cred of structuredCredentials) {
      const safeCred: SafeCredential = {
        id: cred.id,
        type: cred.platform.toUpperCase().replace(/\s+/g, '_'),
        label: cred.platform,
        category: cred.category,
        url: cred.url,
        username: cred.username,
        email: cred.email,
        hasPassword: !!cred.password || !!cred.apiKey,
        notes: cred.notes,
      }
      // Include password only if reveal=true and user is PRIMARY
      if (reveal) {
        safeCred.password = cred.password || cred.apiKey || undefined
      }
      safeCredentials.push(safeCred)
    }
  } else {
    // Fall back to legacy JSON field
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        credentials: true,
      },
    })

    if (client?.credentials) {
      try {
        const parsed = JSON.parse(client.credentials)
        let storedCredentials: StoredCredential[] = []

        // Handle both array format and object format
        if (Array.isArray(parsed)) {
          storedCredentials = parsed
        } else if (typeof parsed === 'object') {
          // Convert object format to array format
          storedCredentials = Object.entries(parsed).map(([key, value]) => {
            const cred = value as { username?: string; password?: string; url?: string; notes?: string }
            return {
              type: key,
              label: formatLabel(key),
              url: cred.url,
              username: cred.username,
              password: cred.password,
              notes: cred.notes,
            }
          })
        }

        // Transform to safe credentials
        for (const cred of storedCredentials) {
          safeCredentials.push({
            id: `legacy-${cred.type}`,
            type: cred.type,
            label: cred.label || formatLabel(cred.type),
            category: 'PLATFORM',
            url: cred.url || null,
            username: cred.username || null,
            email: null,
            hasPassword: !!cred.password,
            notes: cred.notes || null,
          })
        }
      } catch {
        console.error('Failed to parse legacy credentials JSON')
      }
    }
  }

  // Log access for security audit
  console.error(`[CREDENTIALS_ACCESS] ClientId: ${clientId}, ClientUserId: ${user.id}, Count: ${safeCredentials.length}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({
    credentials: safeCredentials,
    accessedAt: new Date().toISOString(),
    message: safeCredentials.length === 0 ? 'No credentials stored for this client' : undefined,
  })
}, { rateLimit: 'SENSITIVE' })

// POST /api/client-portal/credentials - Create new credential (PRIMARY users only)
export const POST = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const validation = credentialSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const credential = await prisma.clientCredential.create({
    data: {
      clientId: user.clientId,
      platform: data.platform,
      category: data.category,
      username: data.username || null,
      password: data.password || null,
      email: data.email || null,
      url: data.url || null,
      apiKey: data.apiKey || null,
      notes: data.notes || null,
    },
  })

  // Log for audit
  console.error(`[CREDENTIAL_CREATED] ClientId: ${user.clientId}, CredentialId: ${credential.id}, Platform: ${data.platform}, CreatedBy: ${user.id}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({
    success: true,
    credential: {
      id: credential.id,
      platform: credential.platform,
      category: credential.category,
    },
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'SENSITIVE' })

// PUT /api/client-portal/credentials - Update credential (PRIMARY users only)
export const PUT = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const { id, ...updateData } = body

  if (!id) {
    return NextResponse.json({ error: 'Credential ID is required' }, { status: 400 })
  }

  // Verify credential belongs to this client
  const existing = await prisma.clientCredential.findFirst({
    where: {
      id,
      clientId: user.clientId,
    },
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

  const credential = await prisma.clientCredential.update({
    where: { id },
    data: {
      platform: data.platform ?? undefined,
      category: data.category ?? undefined,
      username: data.username !== undefined ? (data.username || null) : undefined,
      password: data.password !== undefined ? (data.password || null) : undefined,
      email: data.email !== undefined ? (data.email || null) : undefined,
      url: data.url !== undefined ? (data.url || null) : undefined,
      apiKey: data.apiKey !== undefined ? (data.apiKey || null) : undefined,
      notes: data.notes !== undefined ? (data.notes || null) : undefined,
      lastUpdated: new Date(),
    },
  })

  // Log for audit
  console.error(`[CREDENTIAL_UPDATED] ClientId: ${user.clientId}, CredentialId: ${id}, UpdatedBy: ${user.id}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({
    success: true,
    credential: {
      id: credential.id,
      platform: credential.platform,
      category: credential.category,
    },
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'SENSITIVE' })

// DELETE /api/client-portal/credentials - Delete credential (PRIMARY users only)
export const DELETE = withClientAuth(async (req, { user }) => {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Credential ID is required' }, { status: 400 })
  }

  // Verify credential belongs to this client
  const existing = await prisma.clientCredential.findFirst({
    where: {
      id,
      clientId: user.clientId,
    },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
  }

  // Soft delete by marking as inactive
  await prisma.clientCredential.update({
    where: { id },
    data: { isActive: false },
  })

  // Log for audit
  console.error(`[CREDENTIAL_DELETED] ClientId: ${user.clientId}, CredentialId: ${id}, DeletedBy: ${user.id}, Timestamp: ${new Date().toISOString()}`)

  return NextResponse.json({ success: true })
}, { requiredRole: 'PRIMARY', rateLimit: 'SENSITIVE' })
