import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'

export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Weekly Notification Cron Job
 * Triggers: Every Monday at 9:00 AM IST
 *
 * Sends:
 * 1. Weekly performance summary to managers
 * 2. Weekly task completion summary to employees
 * 3. Sales pipeline summary to sales team
 * 4. Client health alerts to account managers
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
    }
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Atomically check and acquire lock (prevents TOCTOU race condition)
    const istOffset = 5.5 * 60 * 60 * 1000
    const today_date = new Date(Date.now() + istOffset).toISOString().split('T')[0]
    const lockId = `weekly-notifications-${today_date}`
    try {
      await prisma.distributedLock.create({
        data: { id: lockId, lockName: lockId, expiresAt: new Date(Date.now() + 86400000) }
      })
    } catch {
      return NextResponse.json({ message: 'Already ran today', skipped: true })
    }

    const results = {
      managerSummaries: 0,
      employeeSummaries: 0,
      salesSummaries: 0,
      clientAlerts: 0,
      errors: [] as string[],
    }

    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    // 1. Weekly summary for managers
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER', status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        firstName: true,
        phone: true,
        department: true,
      },
    })

    // Fetch all department user counts in one query
    const departmentUserCounts = await prisma.user.groupBy({
      by: ['department'],
      where: { status: 'ACTIVE', department: { in: managers.map(m => m.department).filter(Boolean) as string[] } },
      _count: { id: true },
    })
    const deptUserMap = new Map(departmentUserCounts.map(d => [d.department, d._count.id]))

    // Fetch all task counts grouped by department and status in one query
    const managerDepartments = managers.map(m => m.department).filter(Boolean) as string[]
    const taskCounts = await prisma.dailyTask.groupBy({
      by: ['status'],
      where: {
        plan: {
          date: { gte: lastWeek, lte: today },
          user: { department: { in: managerDepartments } },
        },
      },
      _count: { id: true },
    })

    // Also get per-department task counts
    const allDeptTasks = await prisma.dailyTask.findMany({
      where: {
        plan: {
          date: { gte: lastWeek, lte: today },
          user: { department: { in: managerDepartments } },
        },
      },
      select: {
        status: true,
        plan: { select: { user: { select: { department: true } } } },
      },
    })

    // Group task counts by department
    const deptTaskStats = new Map<string, { total: number; completed: number; breakdowns: number }>()
    for (const task of allDeptTasks) {
      const dept = task.plan.user.department || ''
      if (!deptTaskStats.has(dept)) {
        deptTaskStats.set(dept, { total: 0, completed: 0, breakdowns: 0 })
      }
      const stats = deptTaskStats.get(dept)!
      stats.total++
      if (task.status === 'COMPLETED') stats.completed++
      if (task.status === 'BREAKDOWN') stats.breakdowns++
    }

    for (const manager of managers) {
      const dept = manager.department || ''
      const departmentUsers = deptUserMap.get(dept) || 0
      const stats = deptTaskStats.get(dept) || { total: 0, completed: 0, breakdowns: 0 }
      const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

      const message = `Weekly Summary - ${manager.department}\n\nTeam Size: ${departmentUsers}\nTasks Completed: ${stats.completed}/${stats.total} (${completionRate}%)\nBreakdowns: ${stats.breakdowns}\n\nKeep up the great work!`

      if (manager.phone) {
        try {
          await sendWhatsAppMessage({ phone: manager.phone, message })
          results.managerSummaries++
        } catch (error) {
          results.errors.push(`Manager summary failed for ${manager.firstName}: ${error}`)
        }
      }
    }

    // 2. Weekly summary for employees
    const employees = await prisma.user.findMany({
      where: { status: 'ACTIVE', deletedAt: null, role: { in: ['EMPLOYEE', 'INTERN'] } },
      select: { id: true, firstName: true, phone: true },
    })

    // Fetch all employee tasks in one query
    const employeeIds = employees.map(e => e.id)
    const allEmployeeTasks = await prisma.dailyTask.findMany({
      where: {
        plan: {
          userId: { in: employeeIds },
          date: { gte: lastWeek, lte: today },
        },
      },
      select: {
        status: true,
        plannedHours: true,
        actualHours: true,
        plan: { select: { userId: true } },
      },
    })

    // Group tasks by userId
    const tasksByEmployee = new Map<string, typeof allEmployeeTasks>()
    for (const task of allEmployeeTasks) {
      const uid = task.plan.userId
      if (!tasksByEmployee.has(uid)) {
        tasksByEmployee.set(uid, [])
      }
      tasksByEmployee.get(uid)!.push(task)
    }

    for (const employee of employees) {
      const tasks = tasksByEmployee.get(employee.id) || []

      if (tasks.length === 0) continue

      const completed = tasks.filter(t => t.status === 'COMPLETED').length
      const breakdowns = tasks.filter(t => t.status === 'BREAKDOWN').length
      const totalPlanned = tasks.reduce((sum, t) => sum + t.plannedHours, 0)
      const totalActual = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)

      const message = `Weekly Performance Summary for ${employee.firstName}:\n\nTasks: ${completed}/${tasks.length} completed\nBreakdowns: ${breakdowns}\nHours: ${totalActual.toFixed(1)}h worked / ${totalPlanned}h planned\n\nGreat job this week!`

      if (employee.phone) {
        try {
          await sendWhatsAppMessage({ phone: employee.phone, message })
          results.employeeSummaries++
        } catch (error) {
          results.errors.push(`Employee summary failed for ${employee.firstName}: ${error}`)
        }
      }
    }

    // 3. Sales pipeline summary
    const salesUsers = await prisma.user.findMany({
      where: { role: 'SALES', status: 'ACTIVE', deletedAt: null },
      select: { id: true, firstName: true, phone: true },
    })

    for (const salesUser of salesUsers) {
      const leads = await prisma.lead.findMany({
        where: { assignedToId: salesUser.id, deletedAt: null },
        select: { stage: true, value: true },
      })

      const pipelineValue = leads
        .filter(l => !['WON', 'LOST'].includes(l.stage))
        .reduce((sum, l) => sum + (l.value || 0), 0)

      const wonThisWeek = await prisma.lead.count({
        where: {
          assignedToId: salesUser.id,
          deletedAt: null,
          stage: 'WON',
          updatedAt: { gte: lastWeek },
        },
      })

      const stageCounts = leads.reduce((acc, l) => {
        acc[l.stage] = (acc[l.stage] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const message = `Weekly Sales Summary for ${salesUser.firstName}:\n\nPipeline Value: ₹${pipelineValue.toLocaleString('en-IN')}\nDeals Won This Week: ${wonThisWeek}\n\nLead Status:\n- Lead Received: ${stageCounts['LEAD_RECEIVED'] || 0}\n- RFP Sent: ${stageCounts['RFP_SENT'] || 0}\n- Proposal Shared: ${stageCounts['PROPOSAL_SHARED'] || 0}\n- Meeting Scheduled: ${stageCounts['MEETING_SCHEDULED'] || 0}\n\nKeep closing!`

      if (salesUser.phone) {
        try {
          await sendWhatsAppMessage({ phone: salesUser.phone, message })
          results.salesSummaries++
        } catch (error) {
          results.errors.push(`Sales summary failed for ${salesUser.firstName}: ${error}`)
        }
      }
    }

    // 4. Client health alerts to account managers
    const atRiskClients = await prisma.client.findMany({
      where: {
        OR: [
          { healthStatus: 'AT_RISK' },
          { healthStatus: 'WARNING' },
          { paymentStatus: 'OVERDUE' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        teamMembers: {
          where: { role: 'ACCOUNT_MANAGER' },
          include: { user: { select: { firstName: true, phone: true } } },
        },
      },
    })

    // Group by account manager
    const alertsByAM = atRiskClients.reduce((acc, client) => {
      const am = client.teamMembers[0]?.user
      if (am?.phone) {
        const key = am.phone
        if (!acc[key]) {
          acc[key] = { name: am.firstName, phone: am.phone, clients: [] }
        }
        acc[key].clients.push({
          name: client.name,
          health: client.healthStatus || 'Unknown',
          payment: client.paymentStatus,
        })
      }
      return acc
    }, {} as Record<string, { name: string; phone: string; clients: { name: string; health: string | null; payment: string }[] }>)

    for (const [, data] of Object.entries(alertsByAM)) {
      const clientList = data.clients
        .map(c => `- ${c.name} (Health: ${c.health}, Payment: ${c.payment})`)
        .join('\n')

      const message = `Client Health Alert for ${data.name}:\n\n${data.clients.length} client(s) need attention:\n${clientList}\n\nPlease review and take action.`

      try {
        await sendWhatsAppMessage({ phone: data.phone, message })
        results.clientAlerts++
      } catch (error) {
        results.errors.push(`Client alert failed for ${data.name}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Weekly cron job failed:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
