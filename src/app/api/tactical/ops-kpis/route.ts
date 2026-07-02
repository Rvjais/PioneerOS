import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({
      userId: z.string().min(1),
      department: z.string().min(1).max(100),
      kpis: z.record(z.string(), z.unknown()),
      notes: z.string().max(2000).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { userId, department, kpis, notes } = result.data

    // Security check
    const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)
    if (userId !== user.id && !isManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get or create tactical meeting
    let meeting = await prisma.tacticalMeeting.findFirst({
      where: {
        userId,
        month: monthStart,
      },
    })

    if (!meeting) {
      meeting = await prisma.tacticalMeeting.create({
        data: {
          userId,
          month: monthStart,
          reportingMonth: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          status: 'DRAFT',
        },
      })
    }

    // Store KPIs and notes as structured JSON in managerNotes
    const storedData = JSON.stringify({
      kpis,
      notes: notes || '',
      updatedAt: now.toISOString(),
    })

    await prisma.tacticalMeeting.update({
      where: { id: meeting.id },
      data: {
        managerNotes: storedData,
        updatedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      saved: true,
    })
  } catch (error) {
    console.error('Failed to save ops KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to save KPIs' },
      { status: 500 }
    )
  }
})
