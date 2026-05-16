import { NextRequest, NextResponse } from 'next/server'
import { clearClientPortalSession, validateClientSession } from '@/server/auth/clientAuth'

export async function POST(req: NextRequest) {
  try {
    const session = await validateClientSession(req as unknown as Request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await clearClientPortalSession(session.clientUserId)

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' })
    response.cookies.delete('client_session')

    return response
  } catch (error) {
    console.error('Client logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}