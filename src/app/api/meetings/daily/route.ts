import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const dailyMeetingSchema = z.object({
  yesterdayWork: z.array(z.unknown()).min(1, 'Yesterday work is required'),
  yesterdayBlockers: z.string().max(2000).optional().nullable(),
  todayPlan: z.array(z.unknown()).min(1, 'Today plan is required'),
  todayClients: z.array(z.unknown()).optional(),
  estimatedHours: z.number().min(0).max(24).optional(),
  workload: z.enum(['LOW', 'NORMAL', 'HIGH', 'OVERLOADED']).optional(),
  mood: z.enum(['GREAT', 'GOOD', 'OKAY', 'STRUGGLING']).optional(),
  needsHelp: z.boolean().optional(),
  helpDescription: z.string().max(2000).optional().nullable(),
  workLocation: z.enum(['OFFICE', 'REMOTE', 'HYBRID', 'CLIENT_SITE']).optional(),
})

// Helper to get start of day
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// GET - Check if daily meeting is filled for today
export const GET = withAuth(async (req, { user, params }) => {
  try {
const today = startOfDay(new Date())

    const dailyMeeting = await prisma.dailyMeeting.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      }
    })

    // Get recent meetings for history
    const recentMeetings = await prisma.dailyMeeting.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { date: 'desc' },
      take: 7
    })

    // Check if it's late (after 11 AM)
    const now = new Date()
    const isLateTime = now.getHours() >= 11

    return NextResponse.json({
      filled: !!dailyMeeting,
      isLateTime,
      todayMeeting: dailyMeeting ? {
        ...dailyMeeting,
        yesterdayWork: safeJsonParse(dailyMeeting.yesterdayWork, []),
        todayPlan: safeJsonParse(dailyMeeting.todayPlan, []),
        todayClients: safeJsonParse(dailyMeeting.todayClients, []),
      } : null,
      recentMeetings: recentMeetings.map(m => ({
        ...m,
        yesterdayWork: safeJsonParse(m.yesterdayWork, []),
        todayPlan: safeJsonParse(m.todayPlan, []),
        todayClients: safeJsonParse(m.todayClients, []),
      }))
    })
  } catch (error) {
    console.error('Failed to get daily meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Submit daily meeting
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const parsed = dailyMeetingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      yesterdayWork,
      yesterdayBlockers,
      todayPlan,
      todayClients,
      estimatedHours,
      workload,
      mood,
      needsHelp,
      helpDescription,
      workLocation
    } = parsed.data

    const today = startOfDay(new Date())
    const now = new Date()
    const isLate = now.getHours() >= 11 // After 11 AM is late

    // Check if already exists
    const existing = await prisma.dailyMeeting.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      }
    })

    if (existing) {
      // Update existing
      const updated = await prisma.dailyMeeting.update({
        where: { id: existing.id },
        data: {
          yesterdayWork: JSON.stringify(yesterdayWork),
          yesterdayBlockers,
          todayPlan: JSON.stringify(todayPlan),
          todayClients: JSON.stringify(todayClients || []),
          estimatedHours: estimatedHours || 8,
          workload: workload || 'NORMAL',
          mood: mood || 'GOOD',
          needsHelp: needsHelp || false,
          helpDescription,
          workLocation: workLocation || 'OFFICE',
        }
      })

      return NextResponse.json({
        success: true,
        meeting: updated,
        isLate: updated.isLate
      })
    }

    // Create new
    const meeting = await prisma.dailyMeeting.create({
      data: {
        userId: user.id,
        date: today,
        checkInTime: now,
        yesterdayWork: JSON.stringify(yesterdayWork),
        yesterdayBlockers,
        todayPlan: JSON.stringify(todayPlan),
        todayClients: JSON.stringify(todayClients || []),
        estimatedHours: estimatedHours || 8,
        workload: workload || 'NORMAL',
        mood: mood || 'GOOD',
        needsHelp: needsHelp || false,
        helpDescription,
        workLocation: workLocation || 'OFFICE',
        isLate
      }
    })

    // Update compliance tracking
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    await prisma.meetingCompliance.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month: monthStart
        }
      },
      update: {
        dailyMeetingsFilled: { increment: 1 },
        dailyMeetingsLate: isLate ? { increment: 1 } : undefined
      },
      create: {
        userId: user.id,
        month: monthStart,
        dailyMeetingsFilled: 1,
        dailyMeetingsLate: isLate ? 1 : 0
      }
    })

    // If user needs help, create notification for manager
    if (needsHelp && helpDescription) {
      // Get user's manager or team lead
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { firstName: true, department: true }
      })

      // Find managers in the same department
      const managers = await prisma.user.findMany({
        where: {
          department: dbUser?.department,
          role: { in: ['MANAGER', 'SUPER_ADMIN'] },
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true }
      })

      // Create notifications
      for (const manager of managers) {
        await prisma.notification.create({
          data: {
            userId: manager.id,
            title: 'Team Member Needs Help',
            message: `${dbUser?.firstName} needs assistance: ${helpDescription}`,
            type: 'WARNING',
            link: '/team/daily-meetings'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      meeting,
      isLate,
      message: isLate
        ? 'Daily check-in submitted (late). Please try to submit before 11:00 AM.'
        : 'Daily check-in submitted successfully!'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to submit daily meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
