import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single service account
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params

    const serviceAccount = await prisma.agencyServiceAccount.findUnique({
      where: { id },
    })

    if (!serviceAccount) {
      return NextResponse.json({ error: 'Service account not found' }, { status: 404 })
    }

    return NextResponse.json({ serviceAccount })
  } catch (error) {
    console.error('Failed to fetch service account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update service account
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const body = await request.json()
    const { email, name, description, isActive } = body

    // Check exists
    const existing = await prisma.agencyServiceAccount.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Service account not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (email !== undefined) updateData.email = email
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive

    const serviceAccount = await prisma.agencyServiceAccount.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      serviceAccount,
      message: 'Service account updated successfully',
    })
  } catch (error) {
    console.error('Failed to update service account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete service account
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params

    // Check exists
    const existing = await prisma.agencyServiceAccount.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Service account not found' }, { status: 404 })
    }

    // Soft delete: deactivate instead of hard delete
    await prisma.agencyServiceAccount.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Service account deactivated successfully' })
  } catch (error) {
    console.error('Failed to delete service account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
