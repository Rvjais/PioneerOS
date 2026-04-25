import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single access request
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params

    const accessRequest = await prisma.oAuthAccessRequest.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            whatsapp: true,
          },
        },
      },
    })

    if (!accessRequest) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    return NextResponse.json({ request: accessRequest })
  } catch (error) {
    console.error('Failed to fetch access request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update access request
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const body = await request.json()
    const { status, notes, targetEmail } = body

    // Check exists
    const existing = await prisma.oAuthAccessRequest.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (targetEmail !== undefined) updateData.targetEmail = targetEmail

    const accessRequest = await prisma.oAuthAccessRequest.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      request: accessRequest,
      message: 'Access request updated successfully',
    })
  } catch (error) {
    console.error('Failed to update access request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete access request
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params

    // Check exists
    const existing = await prisma.oAuthAccessRequest.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    // Soft delete: set status to DELETED instead of hard delete
    await prisma.oAuthAccessRequest.update({
      where: { id },
      data: { status: 'DELETED' },
    })

    return NextResponse.json({ message: 'Access request deleted successfully' })
  } catch (error) {
    console.error('Failed to delete access request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
