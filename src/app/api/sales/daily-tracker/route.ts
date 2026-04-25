import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// Sales Daily Tracker API - Returns everything a salesperson needs for their day
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(startOfToday)
    endOfToday.setDate(endOfToday.getDate() + 1)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    // Fetch all data in parallel
    const [
      myLeads,
      todayTasks,
      todayReminders,
      todayMeetings,
      recentActivities,
      teamMembers,
    ] = await Promise.all([
      // My assigned leads (active ones)
      prisma.lead.findMany({
        where: {
          assignedToId: userId,
          stage: { notIn: ['WON', 'LOST'] },
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              activities: true,
              nurturingActions: true,
              meetings: true
            }
          },
        },
        orderBy: [
          { leadPriority: 'asc' }, // HOT first (alphabetically)
          { updatedAt: 'desc' },
        ],
      }),

      // Today's tasks
      prisma.salesDailyTask.findMany({
        where: {
          userId,
          dueDate: { gte: startOfToday, lt: endOfToday },
        },
        include: {
          lead: { select: { id: true, companyName: true } },
        },
        orderBy: [
          { status: 'asc' }, // TODO before DONE
          { priority: 'desc' },
        ],
      }),

      // Today's follow-up reminders
      prisma.followUpReminder.findMany({
        where: {
          userId,
          scheduledAt: { gte: startOfToday, lt: endOfToday },
          isCompleted: false,
        },
        include: {
          lead: { select: { id: true, companyName: true, contactName: true, contactPhone: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),

      // Today's meetings
      prisma.salesMeeting.findMany({
        where: {
          userId,
          scheduledAt: { gte: startOfToday, lt: endOfToday },
          status: { not: 'CANCELLED' },
        },
        include: {
          lead: { select: { id: true, companyName: true, contactName: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),

      // Recent activities by me
      prisma.leadActivity.findMany({
        where: { userId },
        include: {
          lead: { select: { id: true, companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Team members for sales (for assignment)
      prisma.user.findMany({
        where: {
          role: { in: ['SALES', 'MANAGER'] },
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true, firstName: true, lastName: true },
      }),
    ])

    // Organize leads by priority for easier frontend display
    const leadsByPriority = {
      HOT: myLeads.filter(l => l.leadPriority === 'HOT'),
      WARM: myLeads.filter(l => l.leadPriority === 'WARM'),
      COLD: myLeads.filter(l => l.leadPriority === 'COLD'),
    }

    // Calculate stats
    const stats = {
      totalActive: myLeads.length,
      hotLeads: leadsByPriority.HOT.length,
      todayTasks: todayTasks.filter(t => t.status !== 'DONE').length,
      todayTasksDone: todayTasks.filter(t => t.status === 'DONE').length,
      todayReminders: todayReminders.length,
      todayMeetings: todayMeetings.length,
      overdueFollowups: myLeads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp) < startOfToday).length,
    }

    return NextResponse.json({
      leads: myLeads,
      leadsByPriority,
      todayTasks,
      todayReminders,
      todayMeetings,
      recentActivities,
      teamMembers,
      stats,
    })
  } catch (error) {
    console.error('Failed to fetch daily tracker data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
