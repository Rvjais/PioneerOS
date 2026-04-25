import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'
import {
  addAccount,
  getAccounts,
  getPlatformSummary,
  PLATFORMS,
  ACCESS_TYPES,
  Platform,
  AccessType,
} from '@/server/reporting/platform-accounts'

// Validation schema for adding a platform account
const addAccountSchema = z.object({
  platform: z.enum(PLATFORMS),
  accountId: z.string().min(1).max(200),
  accountName: z.string().min(1).max(200),
  accessType: z.enum(ACCESS_TYPES),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// GET - List all platform accounts for a client
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const platformParam = searchParams.get('platform')
  if (platformParam && !(PLATFORMS as readonly string[]).includes(platformParam)) {
    return NextResponse.json({ error: `Invalid platform. Must be one of: ${PLATFORMS.join(', ')}` }, { status: 400 })
  }
  const platform = platformParam as Platform | null
  const includeInactive = searchParams.get('includeInactive') === 'true'
  const summary = searchParams.get('summary') === 'true'

  try {
    if (summary) {
      const platformSummary = await getPlatformSummary(clientId)
      return NextResponse.json({ summary: platformSummary })
    }

    const accounts = await getAccounts(clientId, {
      platform: platform || undefined,
      isActive: includeInactive ? undefined : true,
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching platform accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform accounts' },
      { status: 500 }
    )
  }
})

// POST - Add a new platform account
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json(
      { error: 'You do not have permission to modify this client' },
      { status: 403 }
    )
  }

  // Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = addAccountSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  try {
    const account = await addAccount({
      clientId,
      platform: validation.data.platform as Platform,
      accountId: validation.data.accountId,
      accountName: validation.data.accountName,
      accessType: validation.data.accessType as AccessType,
      metadata: validation.data.metadata,
      createdBy: user.id,
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('Error adding platform account:', error)

    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json(
      { error: 'Failed to add platform account' },
      { status: 500 }
    )
  }
})
