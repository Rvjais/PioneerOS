import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { requireAuth, isAuthError, MANAGEMENT_ROLES } from '@/server/auth/rbac'

export async function GET() {
  try {
    const auth = await requireAuth({ roles: MANAGEMENT_ROLES })
    if (isAuthError(auth)) return auth.error

    const { user } = auth
    const isManager = user.role === 'MANAGER'
    const deptFilter = isManager ? { department: user.department } : {}

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch active employees (managers only see their own department)
    const employees = await prisma.user.findMany({
      where: {
        status: { in: ['ACTIVE', 'PROBATION'] },
        role: { not: 'SUPER_ADMIN' },
        deletedAt: null,
        ...deptFilter,
      },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        status: true,
      },
    })

    const employeeIds = employees.map(e => e.id)

    // Get task statistics per employee
    const taskStats = await prisma.task.groupBy({
      by: ['assigneeId', 'status'],
      where: {
        assigneeId: { in: employeeIds },
      },
      _count: true,
    })

    // Get attendance this month
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['userId'],
      where: {
        userId: { in: employeeIds },
        date: { gte: startOfMonth },
        status: { in: ['PRESENT', 'WORK_FROM_HOME', 'HALF_DAY'] },
      },
      _count: true,
    })

    // Get total work days this month (exclude weekends)
    const totalWorkDays = (() => {
      let days = 0
      const current = new Date(startOfMonth)
      while (current <= now) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) days++
        current.setDate(current.getDate() + 1)
      }
      return days || 1
    })()

    // Get daily tasks completed (through plan relationship)
    const dailyTaskStats = await prisma.dailyTask.groupBy({
      by: ['planId'],
      where: {
        plan: { userId: { in: employeeIds } },
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth },
      },
      _count: true,
    })

    // Get plan to userId mapping
    const plans = await prisma.dailyTaskPlan.findMany({
      where: { userId: { in: employeeIds } },
      select: { id: true, userId: true },
    })
    const planUserMap = new Map(plans.map(p => [p.id, p.userId]))

    // Build team member data
    const teamMembers = employees.map(emp => {
      const empTasks = taskStats.filter(t => t.assigneeId === emp.id)
      const tasksCompleted = empTasks.find(t => t.status === 'COMPLETED')?._count || 0
      const tasksTotal = empTasks.reduce((sum, t) => sum + t._count, 0) || 1
      const dailyCompleted = dailyTaskStats.filter(d => planUserMap.get(d.planId) === emp.id).reduce((sum, d) => sum + d._count, 0)

      const attendance = attendanceStats.find(a => a.userId === emp.id)?._count || 0
      const attendancePercent = Math.round((attendance / totalWorkDays) * 100)

      // Calculate QC score (randomized for now - would need real QC data)
      const qcScore = null // TODO: Implement real QC scoring

      // Calculate rating
      const completionRate = (tasksCompleted + dailyCompleted) / Math.max(tasksTotal + dailyCompleted, 1)
      const rating = Math.min(5, Math.round((completionRate * 2 + attendancePercent / 25 + (qcScore ?? 0) / 25) * 10) / 10)

      // Determine status
      let status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'UNDERPERFORMING' = 'GOOD'
      if (rating >= 4.5 && (qcScore ?? 0) >= 90 && attendancePercent >= 95) {
        status = 'EXCELLENT'
      } else if (rating >= 3.5 && (qcScore ?? 0) >= 80 && attendancePercent >= 85) {
        status = 'GOOD'
      } else if (rating >= 2.5 || (qcScore ?? 0) >= 70 || attendancePercent >= 75) {
        status = 'NEEDS_IMPROVEMENT'
      } else {
        status = 'UNDERPERFORMING'
      }

      return {
        id: emp.id,
        empId: emp.empId,
        name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
        department: emp.department,
        role: emp.role,
        tasksCompleted: tasksCompleted + dailyCompleted,
        tasksTotal: tasksTotal + dailyCompleted,
        qcScore,
        attendance: attendancePercent,
        rating,
        status,
      }
    })

    // Sort by rating descending
    teamMembers.sort((a, b) => b.rating - a.rating)

    // Calculate summary stats
    const excellentCount = teamMembers.filter(m => m.status === 'EXCELLENT').length
    const goodCount = teamMembers.filter(m => m.status === 'GOOD').length
    const needsImprovementCount = teamMembers.filter(m => m.status === 'NEEDS_IMPROVEMENT').length
    const underperformingCount = teamMembers.filter(m => m.status === 'UNDERPERFORMING').length
    const avgQCScore = teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.qcScore ?? 0), 0) / teamMembers.length)
      : 0
    const avgAttendance = teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + m.attendance, 0) / teamMembers.length)
      : 0

    return NextResponse.json({
      teamMembers,
      stats: {
        teamSize: teamMembers.length,
        excellentCount,
        goodCount,
        needsImprovementCount,
        underperformingCount,
        avgQCScore,
        avgAttendance,
      },
    })
  } catch (error) {
    console.error('Team performance error:', error)
    return NextResponse.json({ error: 'Failed to load team performance data' }, { status: 500 })
  }
}
