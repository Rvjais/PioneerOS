import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Mark access request as verified (access granted)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const body = await request.json()
    const { granted, notes } = body

    // Get access request
    const accessRequest = await prisma.oAuthAccessRequest.findUnique({
      where: { id },
      include: {
        client: {
          select: { name: true },
        },
      },
    })

    if (!accessRequest) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    // Update request status
    await prisma.oAuthAccessRequest.update({
      where: { id },
      data: {
        status: granted !== false ? 'GRANTED' : 'DENIED',
        accessVerifiedAt: new Date(),
        notes: notes || accessRequest.notes,
      },
    })

    // If granted, also update any related OAuth connection
    if (granted !== false) {
      // Find related OAuth connection
      const connection = await prisma.clientOAuthConnection.findFirst({
        where: {
          clientId: accessRequest.clientId,
          platform: accessRequest.platform,
        },
      })

      if (connection) {
        await prisma.clientOAuthConnection.update({
          where: { id: connection.id },
          data: {
            agencyAccessGranted: true,
            agencyAccessVerifiedAt: new Date(),
            delegatedToEmail: accessRequest.targetEmail,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message:
        granted !== false
          ? 'Access verified and marked as granted'
          : 'Access request marked as denied',
    })
  } catch (error) {
    console.error('Failed to verify access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
