import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { encrypt } from '@/server/security/encryption'
import { withAuth } from '@/server/auth/withAuth'

// GET - Get single SaaS tool
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Check user role for credential access
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    const canViewCredentials = ['SUPER_ADMIN', 'MANAGER'].includes(dbUser?.role || '')

    const tool = await prisma.saasTool.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        url: true,
        loginType: true,
        notes: true,
        isActive: true,
        accessLevel: true,
        lastAccessedAt: true,
        ...(canViewCredentials
          ? {
              email: true,
              password: true,
            }
          : {}),
      },
    })

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // Log access
    await prisma.saasTool.update({
      where: { id },
      data: {
        lastAccessedAt: new Date(),
        lastAccessedBy: user.id,
      },
    })

    return NextResponse.json({ tool, canViewCredentials })
  } catch (error) {
    console.error('Failed to fetch SaaS tool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// PATCH - Update SaaS tool (admin only)
export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Check if super admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (dbUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, category, description, url, loginType, email, password, notes, isActive, accessLevel } =
      body

    const tool = await prisma.saasTool.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(url !== undefined && { url }),
        ...(loginType !== undefined && { loginType }),
        ...(email !== undefined && { email }),
        ...(password !== undefined && { password: password ? encrypt(password) : undefined }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive }),
        ...(accessLevel !== undefined && { accessLevel }),
      },
    })

    return NextResponse.json({ tool })
  } catch (error) {
    console.error('Failed to update SaaS tool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE - Delete SaaS tool (admin only)
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    // Check if super admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    })

    if (dbUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete by setting isActive to false
    await prisma.saasTool.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete SaaS tool:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
