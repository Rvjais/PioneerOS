// POST /api/integrations/meta/disconnect - Disconnect Meta OAuth
import { NextRequest, NextResponse } from 'next/server'
import { disconnectPlatform } from '@/server/integrations/connection-service'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({ clientId: z.string().min(1) })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { clientId } = result.data

    await disconnectPlatform(clientId, 'META')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Meta disconnect error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Disconnect failed' },
      { status: 500 }
    )
  }
})
