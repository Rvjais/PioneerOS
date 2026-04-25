import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single OAuth connection
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params

    const connection = await prisma.clientOAuthConnection.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        accounts: true,
      },
    })

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    return NextResponse.json({ connection })
  } catch (error) {
    console.error('Failed to fetch OAuth connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update OAuth connection (agency access fields)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const body = await request.json()
    const { agencyAccessGranted, delegatedToEmail, status } = body

    // Check exists
    const existing = await prisma.clientOAuthConnection.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (agencyAccessGranted !== undefined) {
      updateData.agencyAccessGranted = agencyAccessGranted
      if (agencyAccessGranted) {
        updateData.agencyAccessVerifiedAt = new Date()
      }
    }
    if (delegatedToEmail !== undefined) updateData.delegatedToEmail = delegatedToEmail
    if (status !== undefined) updateData.status = status

    const connection = await prisma.clientOAuthConnection.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      connection,
      message: 'Connection updated successfully',
    })
  } catch (error) {
    console.error('Failed to update OAuth connection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
