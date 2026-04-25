import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/client-portal/work-tracker - Get work entries for client with team info
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId
  const searchParams = req.nextUrl.searchParams

  // Parse query params
  const view = (searchParams.get('view') || 'weekly') as 'daily' | 'weekly' | 'monthly'
  const category = searchParams.get('category')
  const employeeId = searchParams.get('employeeId')
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  // Calculate date range based on view
  const now = new Date()
  let startDate: Date
  let endDate: Date

  if (startDateParam && endDateParam) {
    startDate = new Date(startDateParam)
    endDate = new Date(endDateParam)
  } else {
    endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    switch (view) {
      case 'daily':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'monthly':
        startDate = new Date(now)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
      default:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
    }
  }

  // Build work entries query
  const workEntriesWhere: Record<string, unknown> = {
    clientId,
    status: { in: ['SUBMITTED', 'APPROVED'] }, // Only show submitted and approved work
    date: {
      gte: startDate,
      lte: endDate,
    },
  }

  if (category) {
    workEntriesWhere.category = category
  }

  if (employeeId) {
    workEntriesWhere.userId = employeeId
  }

  // Fetch work entries with files and employee info (no contact details)
  const workEntries = await prisma.workEntry.findMany({
    where: workEntriesWhere,
    select: {
      id: true,
      category: true,
      deliverableType: true,
      quantity: true,
      deliverableUrl: true,
      qualityScore: true,
      description: true,
      date: true,
      hoursSpent: true,
      status: true,
      files: {
        select: {
          id: true,
          fileName: true,
          webViewLink: true,
          thumbnailUrl: true,
          fileCategory: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          // Explicitly NOT including: email, phone, etc.
        },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Group entries by date
  const entriesByDate = workEntries.reduce<Record<string, typeof workEntries>>((acc, entry) => {
    const dateKey = entry.date.toISOString().split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(entry)
    return acc
  }, {})

  // Format as array of { date, tasks }
  const groupedEntries = Object.entries(entriesByDate)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, tasks]) => ({
      date,
      tasks: tasks.map(task => ({
        id: task.id,
        category: task.category,
        deliverableType: task.deliverableType,
        description: task.description,
        hoursSpent: task.hoursSpent,
        status: task.status,
        qualityScore: task.qualityScore,
        deliverableUrl: task.deliverableUrl,
        files: task.files,
        employee: {
          id: task.user.id,
          firstName: task.user.firstName,
          lastName: task.user.lastName,
          department: task.user.department,
        },
      })),
    }))

  // Calculate summary
  const totalHours = workEntries.reduce((sum, e) => sum + (e.hoursSpent || 0), 0)
  const totalTasks = workEntries.length
  const approvedTasks = workEntries.filter(e => e.status === 'APPROVED').length
  const completionRate = totalTasks > 0 ? (approvedTasks / totalTasks) * 100 : 0
  const avgQualityScore = workEntries.filter(e => e.qualityScore).length > 0
    ? workEntries.reduce((sum, e) => sum + (e.qualityScore || 0), 0) / workEntries.filter(e => e.qualityScore).length
    : null

  // Count by category
  const categoryCounts = workEntries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1
    return acc
  }, {})

  // Fetch team members assigned to this client
  const teamMembers = await prisma.clientTeamMember.findMany({
    where: { clientId },
    select: {
      userId: true,
      role: true,
      isPrimary: true,
      assignedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          profile: {
            select: {
              profilePicture: true,
            },
          },
        },
      },
    },
  })

  // Get work stats for each team member in the current period
  const teamMemberIds = teamMembers.map(tm => tm.userId)
  const teamWorkStats = await prisma.workEntry.groupBy({
    by: ['userId'],
    where: {
      clientId,
      userId: { in: teamMemberIds },
      status: { in: ['SUBMITTED', 'APPROVED'] },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: { id: true },
    _sum: { hoursSpent: true },
  })

  // Get last activity date for each team member
  const lastActivities = await prisma.workEntry.findMany({
    where: {
      clientId,
      userId: { in: teamMemberIds },
      status: { in: ['SUBMITTED', 'APPROVED'] },
    },
    distinct: ['userId'],
    orderBy: { date: 'desc' },
    select: {
      userId: true,
      date: true,
    },
  })

  const lastActivityMap = lastActivities.reduce<Record<string, Date>>((acc, la) => {
    acc[la.userId] = la.date
    return acc
  }, {})

  const statsMap = teamWorkStats.reduce<Record<string, { tasks: number; hours: number }>>((acc, stat) => {
    acc[stat.userId] = {
      tasks: stat._count.id,
      hours: stat._sum.hoursSpent || 0,
    }
    return acc
  }, {})

  const team = teamMembers.map(tm => ({
    userId: tm.user.id,
    firstName: tm.user.firstName,
    lastName: tm.user.lastName,
    department: tm.user.department,
    role: tm.role,
    isPrimary: tm.isPrimary,
    avatarUrl: tm.user.profile?.profilePicture || null,
    tasksThisPeriod: statsMap[tm.userId]?.tasks || 0,
    hoursThisPeriod: statsMap[tm.userId]?.hours || 0,
    lastActiveDate: lastActivityMap[tm.userId]?.toISOString() || null,
  }))

  // Get available categories for filtering
  const availableCategories = await prisma.workEntry.findMany({
    where: {
      clientId,
      status: { in: ['SUBMITTED', 'APPROVED'] },
    },
    distinct: ['category'],
    select: { category: true },
  })

  return NextResponse.json({
    summary: {
      totalHours: Math.round(totalHours * 10) / 10,
      totalTasks,
      categoryCounts,
      completionRate: Math.round(completionRate),
      avgQualityScore: avgQualityScore ? Math.round(avgQualityScore * 10) / 10 : null,
      approvedCount: approvedTasks,
      submittedCount: totalTasks - approvedTasks,
    },
    entries: groupedEntries,
    team,
    filters: {
      view,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      category,
      employeeId,
      availableCategories: availableCategories.map(c => c.category),
    },
  })
}, { rateLimit: 'READ' })
