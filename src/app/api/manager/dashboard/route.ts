import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { requireAuth, isAuthError, MANAGEMENT_ROLES } from '@/server/auth/rbac'

export async function GET() {
  try {
    const auth = await requireAuth({ roles: MANAGEMENT_ROLES })
    if (isAuthError(auth)) return auth.error

    const { user } = auth
    const isManager = user.role === 'MANAGER'
    const managerDept = user.department

    // Get date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    // Department filter for scoping manager queries
    const deptTaskFilter = isManager ? { department: managerDept } : {}

    // Fetch all data in parallel
    const [
      clientCounts,
      atRiskClients,
      taskStats,
      delayedCount,
      escalatedCount,
      invoiceStats,
      leadStats,
      hiringStats,
      escalations,
      departmentStats,
    ] = await Promise.all([
      // Client health counts
      prisma.client.groupBy({
        by: ['status'],
        where: {
          deletedAt: null,
          ...(isManager ? { tasks: { some: { department: managerDept } } } : {}),
        },
        _count: true,
      }),
      // At-risk clients (clients with health score < 70 or status issues)
      prisma.client.findMany({
        where: {
          deletedAt: null,
          OR: [
            { healthScore: { lt: 70 } },
            { status: { in: ['ON_HOLD', 'LOST'] } },
          ],
          ...(isManager ? { tasks: { some: { department: managerDept } } } : {}),
        },
        select: {
          id: true,
          name: true,
          healthScore: true,
          status: true,
          updatedAt: true,
        },
        take: 5,
        orderBy: { healthScore: 'asc' },
      }),
      // Task statistics (scoped to department for manager)
      prisma.task.groupBy({
        by: ['status'],
        ...(isManager ? { where: { department: managerDept } } : {}),
        _count: true,
      }),
      // Delayed tasks: past due date and not completed/cancelled
      prisma.task.count({
        where: {
          ...deptTaskFilter,
          dueDate: { lt: now },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),
      // Escalated tasks: past due date by more than 3 days
      prisma.task.count({
        where: {
          ...deptTaskFilter,
          dueDate: { lt: threeDaysAgo },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),
      // Invoice/Finance statistics
      Promise.all([
        prisma.invoice.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
        prisma.invoice.count({ where: { status: 'OVERDUE' } }),
        prisma.invoice.aggregate({
          where: { status: 'PAID', paidAt: { gte: startOfMonth } },
          _sum: { total: true },
        }),
      ]),
      // Lead statistics
      Promise.all([
        prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
        prisma.lead.count({ where: { deletedAt: null, stage: 'WON', updatedAt: { gte: startOfMonth } } }),
        prisma.lead.aggregate({
          where: { deletedAt: null, stage: { in: ['PROPOSAL_SHARED', 'PROPOSAL_DISCUSSION', 'FOLLOW_UP_ONGOING'] } },
          _sum: { value: true },
        }),
      ]),
      // Hiring statistics (scoped to department for manager if applicable)
      Promise.all([
        prisma.candidate.count({ where: { status: 'NEW', ...(isManager ? { department: managerDept } : {}) } }),
        prisma.candidate.count({ where: { status: { in: ['INTERVIEWING', 'SHORTLISTED'] }, ...(isManager ? { department: managerDept } : {}) } }),
        prisma.candidate.count({ where: { status: 'HIRED', updatedAt: { gte: startOfMonth }, ...(isManager ? { department: managerDept } : {}) } }),
      ]),
      // Recent escalations (issues)
      prisma.issue.findMany({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          clientId: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      // Department task statistics (scoped for manager)
      prisma.task.groupBy({
        by: ['department', 'status'],
        ...(isManager ? { where: { department: managerDept } } : {}),
        _count: true,
      }),
    ])

    // Process client health
    const clientHealth = {
      active: clientCounts.find(c => c.status === 'ACTIVE')?._count || 0,
      atRisk: atRiskClients.length,
      escalated: clientCounts.find(c => c.status === 'ON_HOLD')?._count || 0,
      appreciations: 0, // Would need a separate appreciation tracking
    }

    // Process risk clients
    const riskClients = atRiskClients.map(client => {
      const daysAtRisk = Math.floor((now.getTime() - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
      let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
      let reason = 'Minor issues'

      if (client.healthScore !== null && client.healthScore < 50) {
        riskLevel = 'HIGH'
        reason = 'Low health score'
      } else if (client.healthScore !== null && client.healthScore < 70) {
        riskLevel = 'MEDIUM'
        reason = 'Declining health score'
      } else if (client.status === 'ON_HOLD') {
        riskLevel = 'HIGH'
        reason = 'Account on hold'
      } else if (client.status === 'LOST') {
        riskLevel = 'HIGH'
        reason = 'Client lost'
      }

      return {
        id: client.id,
        name: client.name,
        riskLevel,
        reason,
        daysAtRisk,
      }
    })

    // Process work delivery
    const workDelivery = {
      pendingQC: taskStats.find(t => t.status === 'REVIEW')?._count || 0,
      delayed: delayedCount,
      escalated: escalatedCount,
    }

    // Process finance
    const [pendingInvoices, overduePayments, paidAgg] = invoiceStats
    const finance = {
      pendingInvoices,
      overduePayments,
      collectionsThisMonth: paidAgg._sum.total || 0,
    }

    // Process sales
    const [newLeads, dealsWon, pipelineAgg] = leadStats
    const sales = {
      newLeads,
      dealsWon,
      pipelineValue: pipelineAgg._sum.value || 0,
    }

    // Process hiring
    const [openPositions, interviewing, filled] = hiringStats
    const hiring = {
      openPositions,
      interviewing,
      filled,
    }

    // Resolve client names for escalations
    const clientIds = escalations.map(e => e.clientId).filter((id): id is string => !!id)
    const clients = clientIds.length > 0
      ? await prisma.client.findMany({
          where: { id: { in: clientIds }, deletedAt: null },
          select: { id: true, name: true },
        })
      : []
    const clientNameMap = new Map(clients.map(c => [c.id, c.name]))

    // Process escalations
    const recentEscalations = escalations.map(esc => ({
      id: esc.id,
      client: (esc.clientId && clientNameMap.get(esc.clientId)) || 'Internal',
      issue: esc.title,
      status: esc.status,
      createdAt: esc.createdAt.toISOString(),
    }))

    // Process department health
    const departments = ['SEO', 'ADS', 'SOCIAL', 'WEB', 'OPERATIONS']
    const departmentHealth = departments.map(dept => {
      const deptTasks = departmentStats.filter(t => t.department === dept)
      const completed = deptTasks.find(t => t.status === 'COMPLETED')?._count || 0
      const pending = deptTasks.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status)).reduce((sum, t) => sum + t._count, 0)
      const escalationsCount = deptTasks.find(t => t.status === 'TODO')?._count || 0

      let health: 'GOOD' | 'MODERATE' | 'POOR' = 'GOOD'
      if (escalationsCount > 5 || pending > completed * 2) {
        health = 'POOR'
      } else if (escalationsCount > 2 || pending > completed) {
        health = 'MODERATE'
      }

      return {
        name: dept,
        tasksCompleted: completed,
        tasksPending: pending,
        escalations: escalationsCount,
        health,
      }
    }).filter(d => d.tasksCompleted > 0 || d.tasksPending > 0)

    // Only include financial data for SUPER_ADMIN
    const includeFinancials = user.role === 'SUPER_ADMIN'

    return NextResponse.json({
      clientHealth,
      workDelivery,
      ...(includeFinancials ? { finance } : {}),
      ...(includeFinancials ? { sales } : {}),
      hiring,
      riskClients,
      recentEscalations,
      departmentHealth,
    })
  } catch (error) {
    console.error('Manager dashboard error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
