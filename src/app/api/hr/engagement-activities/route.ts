import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch engagement activities
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (type) where.type = type

    if (from || to) {
      where.scheduledDate = {}
      if (from) (where.scheduledDate as Record<string, unknown>).gte = new Date(from)
      if (to) (where.scheduledDate as Record<string, unknown>).lte = new Date(to)
    }

    const activities = await prisma.engagementActivity.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    })

    // Get stats
    const stats = {
      total: activities.length,
      proposed: activities.filter(a => a.status === 'PROPOSED').length,
      pendingApproval: activities.filter(a => a.status === 'PENDING_APPROVAL').length,
      approved: activities.filter(a => a.status === 'APPROVED').length,
      completed: activities.filter(a => a.status === 'COMPLETED').length,
      totalBudget: activities.filter(a => a.budgetApproved).reduce((sum, a) => sum + (a.estimatedBudget || 0), 0),
      totalSpent: activities.reduce((sum, a) => sum + (a.actualSpent || 0), 0),
    }

    // Get upcoming activities (next 30 days)
    const today = new Date()
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    const upcoming = activities.filter(a =>
      new Date(a.scheduledDate) >= today &&
      new Date(a.scheduledDate) <= thirtyDaysLater &&
      a.status !== 'CANCELLED' &&
      a.status !== 'COMPLETED'
    )

    return NextResponse.json({ activities, stats, upcoming })
  } catch (error) {
    console.error('Error fetching engagement activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
})

// POST: Create new engagement activity
export const POST = withAuth(async (req, { user }) => {
  try {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      type,
      scheduledDate,
      endDate,
      location,
      estimatedBudget,
      targetAudience = 'ALL',
      department,
      expectedCount
    } = body

    if (!title || !type || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const activity = await prisma.engagementActivity.create({
      data: {
        title,
        description,
        type,
        scheduledDate: new Date(scheduledDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        estimatedBudget,
        targetAudience,
        department,
        expectedCount,
        organizedBy: user.id,
        status: estimatedBudget > 0 ? 'PENDING_APPROVAL' : 'PROPOSED'
      },
      include: {
        organizer: true
      }
    })

    // If has budget, notify founder for approval
    if (estimatedBudget > 0) {
      const founders = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN', deletedAt: null },
        select: { id: true }
      })

      for (const founder of founders) {
        await prisma.notification.create({
          data: {
            userId: founder.id,
            type: 'ACTIVITY_APPROVAL',
            title: 'Activity Budget Approval Required',
            message: `${activity.organizer.firstName} proposed "${title}" with budget ₹${estimatedBudget}`,
            link: `/hr/engagement-activities/${activity.id}`
          }
        })
      }
    }

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Error creating engagement activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
})
