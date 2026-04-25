import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Verify agency access has been granted
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const body = await request.json()
    const { delegatedToEmail, verified } = body

    // Get connection
    const connection = await prisma.clientOAuthConnection.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // Update agency access status
    await prisma.clientOAuthConnection.update({
      where: { id },
      data: {
        agencyAccessGranted: verified !== false,
        agencyAccessVerifiedAt: new Date(),
        delegatedToEmail: delegatedToEmail || connection.delegatedToEmail,
      },
    })

    return NextResponse.json({
      success: true,
      message: verified !== false
        ? 'Agency access verified successfully'
        : 'Agency access marked as not granted',
    })
  } catch (error) {
    console.error('Failed to verify access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
