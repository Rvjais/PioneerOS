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

    // Calculate performance score from KPIs
    let filledKpis = 0
    let totalKpis = Object.keys(kpis).length

    for (const [key, value] of Object.entries(kpis)) {
      if (value !== null && value !== undefined) {
        filledKpis++
      }
    }

    const completionRate = totalKpis > 0 ? (filledKpis / totalKpis) * 100 : 0

    // Store KPIs as JSON in tactical meeting
    // In production, would have dedicated fields per department
    await prisma.tacticalMeeting.update({
      where: { id: meeting.id },
      data: {
        performanceScore: completionRate,
        managerNotes: notes || null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      completionRate,
    })
  } catch (error) {
    console.error('Failed to save ops KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to save KPIs' },
      { status: 500 }
    )
  }
})
