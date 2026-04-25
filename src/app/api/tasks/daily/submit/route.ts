import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user }) => {
  try {
    const { date: dateStr } = await req.json()

    const date = dateStr ? new Date(dateStr) : new Date()
    date.setHours(0, 0, 0, 0)

    // Get the plan
    const plan = await prisma.dailyTaskPlan.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      include: {
        tasks: true,
      },
    })

    if (!plan) {
      return NextResponse.json({ error: 'No plan found for this date' }, { status: 404 })
    }

    if (plan.tasks.length === 0) {
      return NextResponse.json({ error: 'Cannot submit empty plan' }, { status: 400 })
    }

    if (plan.status === 'SUBMITTED') {
      return NextResponse.json({ error: 'Plan already submitted' }, { status: 400 })
    }

    const now = new Date()
    const isBeforeHuddle = now.getHours() < 11

    // Submit the plan
    const updatedPlan = await prisma.dailyTaskPlan.update({
      where: { id: plan.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: now,
        submittedBeforeHuddle: isBeforeHuddle,
      },
      include: {
        tasks: {
          include: {
            client: { select: { id: true, name: true } },
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })

    return NextResponse.json({ plan: updatedPlan })
  } catch (error) {
    console.error('Failed to submit plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
