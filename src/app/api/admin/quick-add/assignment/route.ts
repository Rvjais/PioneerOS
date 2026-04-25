import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const schema = z.object({
      clientId: z.string().min(1),
      userId: z.string().min(1),
      role: z.string().max(100).optional(),
      isPrimary: z.boolean().optional(),
    })
    const result = schema.safeParse(data)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    Object.assign(data, result.data)

    const assignment = await prisma.clientTeamMember.upsert({
      where: {
        clientId_userId: {
          clientId: data.clientId,
          userId: data.userId,
        },
      },
      update: {
        role: data.role || 'TEAM_MEMBER',
        isPrimary: data.isPrimary || false,
      },
      create: {
        clientId: data.clientId,
        userId: data.userId,
        role: data.role || 'TEAM_MEMBER',
        isPrimary: data.isPrimary || false,
      },
      include: {
        client: { select: { name: true } },
        user: { select: { firstName: true, lastName: true, empId: true } },
      },
    })

    return NextResponse.json({ success: true, assignment })
  } catch (error) {
    console.error('Quick add assignment error:', error)
    return NextResponse.json({ error: 'Failed to add assignment' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const userId = searchParams.get('userId')

    if (!clientId || !userId) {
      return NextResponse.json({ error: 'Missing clientId or userId' }, { status: 400 })
    }

    await prisma.clientTeamMember.delete({
      where: {
        clientId_userId: { clientId, userId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove assignment error:', error)
    return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 })
  }
})
