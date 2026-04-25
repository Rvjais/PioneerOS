import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

function getCurrentQuarter(): { quarter: number; year: number } {
  const now = new Date()
  const month = now.getMonth()
  const quarter = Math.floor(month / 3) + 1
  return { quarter, year: now.getFullYear() }
}

// GET - Fetch strategic meetings
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const quarterParam = searchParams.get('quarter')
    const yearParam = searchParams.get('year')
    const department = searchParams.get('department') || user.department

    const { quarter: currentQuarter, year: currentYear } = getCurrentQuarter()
    const quarter = quarterParam ? parseInt(quarterParam) : currentQuarter
    const year = yearParam ? parseInt(yearParam) : currentYear

    const meeting = await prisma.strategicMeeting.findUnique({
      where: {
        quarter_year_department: {
          quarter,
          year,
          department,
        },
      },
      include: {
        goals: true,
        peerReviews: {
          where: {
            OR: [
              { isPublic: true },
              { reviewerId: user.id },
              { revieweeId: user.id },
            ],
          },
        },
      },
    })

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Failed to fetch strategic meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Create or update strategic meeting
export const POST = withAuth(async (req, { user }) => {
  try {
    // Only managers can create strategic meetings
    if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { quarter, year, department, summary, goals } = body

    // Upsert the meeting
    const meeting = await prisma.strategicMeeting.upsert({
      where: {
        quarter_year_department: {
          quarter,
          year,
          department: department || user.department,
        },
      },
      create: {
        quarter,
        year,
        department: department || user.department,
        conductedAt: new Date(),
        summary,
      },
      update: {
        summary,
        conductedAt: new Date(),
      },
    })

    // Handle goals
    if (goals && Array.isArray(goals)) {
      // Delete existing goals
      await prisma.strategicGoal.deleteMany({
        where: { meetingId: meeting.id },
      })

      // Create new goals
      for (const goal of goals) {
        await prisma.strategicGoal.create({
          data: {
            meetingId: meeting.id,
            userId: goal.userId || null,
            department: goal.department || null,
            clientId: goal.clientId || null,
            title: goal.title,
            description: goal.description,
            targetMetric: goal.targetMetric,
            targetValue: goal.targetValue,
            deadline: goal.deadline ? new Date(goal.deadline) : null,
            status: goal.status || 'PENDING',
          },
        })
      }
    }

    const updatedMeeting = await prisma.strategicMeeting.findUnique({
      where: { id: meeting.id },
      include: {
        goals: true,
        peerReviews: true,
      },
    })

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error('Failed to save strategic meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
