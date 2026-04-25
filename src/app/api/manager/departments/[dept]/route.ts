import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { requireAuth, isAuthError, MANAGEMENT_ROLES } from '@/server/auth/rbac'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dept: string }> }
) {
  try {
    const auth = await requireAuth({ roles: MANAGEMENT_ROLES })
    if (isAuthError(auth)) return auth.error

    const { user } = auth
    const { dept } = await params
    const department = dept.toUpperCase()

    // Validate department
    const validDepts = ['WEB', 'SEO', 'ADS', 'SOCIAL', 'AI', 'HR', 'ACCOUNTS', 'SALES', 'OPERATIONS']
    if (!validDepts.includes(department)) {
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 })
    }

    // Managers can only access their own department's data
    if (user.role === 'MANAGER' && user.department !== department) {
      return NextResponse.json({ error: 'You can only access your own department' }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch team members with their task stats
    const teamMembers = await prisma.user.findMany({
      where: {
        department,
        status: { in: ['ACTIVE', 'PROBATION'] },
        deletedAt: null,
      },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        department: true,
        leaveRequests: {
          where: {
            status: 'APPROVED',
            startDate: { lte: now },
            endDate: { gte: now },
          },
          select: { id: true },
        },
      },
    })

    // Get task statistics for each team member
    const teamMemberIds = teamMembers.map(m => m.id)

    // Task counts by user
    const taskStats = await prisma.task.groupBy({
      by: ['assigneeId', 'status'],
      where: {
        assigneeId: { in: teamMemberIds },
        department,
      },
      _count: true,
    })

    // Get daily tasks completed this month via DailyTaskPlan
    const dailyTaskPlans = await prisma.dailyTaskPlan.findMany({
      where: {
        userId: { in: teamMemberIds },
        date: { gte: startOfMonth },
      },
      select: {
        userId: true,
        tasks: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
      },
    })

    // Aggregate daily task counts by user
    const dailyTaskCountByUser = new Map<string, number>()
    for (const plan of dailyTaskPlans) {
      const current = dailyTaskCountByUser.get(plan.userId) || 0
      dailyTaskCountByUser.set(plan.userId, current + plan.tasks.length)
    }

    // Get client assignments per user
    const clientAssignments = await prisma.clientTeamMember.groupBy({
      by: ['userId'],
      where: {
        userId: { in: teamMemberIds },
      },
      _count: true,
    })

    // Get clients with active tasks/projects in this department
    const clientProjects = await prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        tasks: {
          some: {
            department,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        },
      },
      select: {
        id: true,
        name: true,
        tasks: {
          where: {
            department,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { dueDate: 'asc' },
          take: 1, // Get most urgent task per client
        },
      },
      take: 10,
    })

    // Build team member response with stats
    const enrichedTeamMembers = teamMembers.map(member => {
      const memberTasks = taskStats.filter(t => t.assigneeId === member.id)
      const completed = memberTasks.find(t => t.status === 'COMPLETED')?._count || 0
      const pending = memberTasks.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status)).reduce((sum, t) => sum + t._count, 0)
      const dailyDone = dailyTaskCountByUser.get(member.id) || 0
      const projectsActive = clientAssignments.find(c => c.userId === member.id)?._count || 0
      const isOnLeave = member.leaveRequests.length > 0

      return {
        id: member.id,
        empId: member.empId,
        name: `${member.firstName} ${member.lastName || ''}`.trim(),
        role: member.role,
        tasksCompleted: completed + dailyDone,
        tasksPending: pending,
        qcScore: null, // TODO: Implement real QC scoring
        projectsActive,
        availability: isOnLeave ? 'ON_LEAVE' : (pending > 10 ? 'BUSY' : 'AVAILABLE'),
      }
    })

    // Build project response
    const enrichedProjects = clientProjects.map(client => {
      const task = client.tasks[0]
      if (!task) return null

      const dueDate = task.dueDate ? new Date(task.dueDate) : null
      const isOverdue = dueDate && dueDate < now
      const isDueSoon = dueDate && !isOverdue && (dueDate.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000

      let status: 'ON_TRACK' | 'DELAYED' | 'AT_RISK' = 'ON_TRACK'
      if (isOverdue) status = 'DELAYED'
      else if (isDueSoon && task.status === 'TODO') status = 'AT_RISK'

      // Estimate progress based on status
      let progress = 0
      switch (task.status) {
        case 'TODO': progress = 10; break
        case 'IN_PROGRESS': progress = 50; break
        case 'REVIEW': progress = 80; break
        case 'COMPLETED': progress = 100; break
      }

      return {
        id: client.id,
        client: client.name,
        projectType: 'MAINTENANCE', // Would need project type field
        status,
        progress,
        deadline: dueDate?.toISOString().split('T')[0] || 'TBD',
        assignee: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName || ''}`.trim() : 'Unassigned',
      }
    }).filter(Boolean)

    // Calculate department stats
    const totalTasks = enrichedTeamMembers.reduce((sum, m) => sum + m.tasksCompleted + m.tasksPending, 0)
    const completedTasks = enrichedTeamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0)
    const avgQCScore = enrichedTeamMembers.length > 0
      ? Math.round(enrichedTeamMembers.reduce((sum, m) => sum + (m.qcScore ?? 0), 0) / enrichedTeamMembers.length)
      : 0
    const onLeaveCount = enrichedTeamMembers.filter(m => m.availability === 'ON_LEAVE').length
    const delayedProjects = enrichedProjects.filter(p => p && (p.status === 'DELAYED' || p.status === 'AT_RISK')).length

    return NextResponse.json({
      department,
      teamMembers: enrichedTeamMembers,
      projects: enrichedProjects,
      stats: {
        teamSize: enrichedTeamMembers.length,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0,
        avgQCScore,
        onLeaveCount,
        delayedProjects,
        activeProjects: enrichedProjects.length,
      },
    })
  } catch (error) {
    console.error('Department data error:', error)
    return NextResponse.json({ error: 'Failed to load department data' }, { status: 500 })
  }
}
