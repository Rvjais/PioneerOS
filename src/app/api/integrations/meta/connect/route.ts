// POST /api/integrations/meta/connect - Start Meta OAuth flow
import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/server/integrations/oauth-config'
import { generateOAuthState } from '@/server/integrations/encryption'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({
      clientId: z.string().min(1),
      returnUrl: z.string().max(500).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { clientId, returnUrl } = result.data

    // Generate state with client info
    const state = generateOAuthState({
      clientId,
      platform: 'META',
      returnUrl: returnUrl || `/clients/${clientId}/integrations`,
    })

    // Generate authorization URL
    const authUrl = getAuthorizationUrl('META', state)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Failed to start Meta OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to start Meta OAuth' },
      { status: 500 }
    )
  }
})
