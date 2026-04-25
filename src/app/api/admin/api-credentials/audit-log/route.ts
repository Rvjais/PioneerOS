import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { getAuditLog } from '@/server/api-credentials'

// GET - Get credential audit log
export async function GET(request: Request) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('credentialId') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await getAuditLog({ credentialId, limit, offset })

    return NextResponse.json({
      logs: result.logs,
      total: result.total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Failed to fetch audit log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
