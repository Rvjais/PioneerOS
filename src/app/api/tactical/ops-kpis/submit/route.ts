import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({
      userId: z.string().min(1),
      meetingId: z.string().min(1),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { userId, meetingId } = result.data

    // Security check
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date()
    const dayOfMonth = now.getDate()
    const submittedOnTime = dayOfMonth <= 5

    // Update meeting status
    const meeting = await prisma.tacticalMeeting.update({
      where: { id: meetingId },
      data: {
        status: 'SUBMITTED',
        submittedAt: now,
        submittedOnTime,
      },
    })

    // Notify managers
    const managers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'MANAGER' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
        id: { not: userId },
      },
      select: { id: true },
    })

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, department: true },
    })

    const notificationPromises = managers.map(manager =>
      prisma.notification.create({
        data: {
          userId: manager.id,
          type: 'TACTICAL',
          title: 'Monthly KPIs Submitted',
          message: `${dbUser?.firstName} ${dbUser?.lastName || ''} (${dbUser?.department}) submitted their monthly KPIs for review`,
          link: `/meetings/ops-tactical`,
        },
      })
    )

    await Promise.all(notificationPromises)

    return NextResponse.json({
      success: true,
      submittedOnTime,
    })
  } catch (error) {
    console.error('Failed to submit:', error)
    return NextResponse.json(
      { error: 'Failed to submit' },
      { status: 500 }
    )
  }
})
