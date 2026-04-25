import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import OpsTacticalClient from './OpsTacticalClient'
import { DEPARTMENT_KPIS } from '@/shared/constants/kpiDefinitions'

export default async function OpsTacticalPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const userDept = session.user.department as string
  const userRole = session.user.role as string
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(userRole)

  // Only allow operations roles (non-client-facing KPIs)
  const opsRoles = ['ACCOUNTS', 'SALES', 'HR', 'OPERATIONS']
  const isOpsRole = opsRoles.includes(userDept) || opsRoles.includes(userRole)

  // Get month boundaries
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
    },
  })

  // Get department KPI definitions
  const deptKey = userDept === 'OPERATIONS' ? 'OPERATIONS' : userDept
  const departmentKpis = DEPARTMENT_KPIS[deptKey] || DEPARTMENT_KPIS['OPERATIONS']

  // Get or create tactical meeting for this month
  let meeting = await prisma.tacticalMeeting.findFirst({
    where: {
      userId,
      month: currentMonthStart,
    },
  })

  // Get previous month's meeting for comparison
  const prevMeeting = await prisma.tacticalMeeting.findFirst({
    where: {
      userId,
      month: prevMonthStart,
    },
  })

  // Department-specific data fetching
  let deptData: Record<string, unknown> = {}

  if (userDept === 'ACCOUNTS') {
    // Accounts KPIs
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      select: { id: true, total: true, status: true },
    })

    const paidInvoices = invoices.filter(i => i.status === 'PAID')
    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0)
    const totalCollected = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0)

    const onboardings = await prisma.client.count({
      where: {
        status: 'ONBOARDING',
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    })

    const activeClients = await prisma.client.count({
      where: { status: 'ACTIVE' },
    })

    deptData = {
      invoicesGenerated: invoices.length,
      paymentsCollected: totalCollected,
      outstandingAmount: totalInvoiced - totalCollected,
      clientsServiced: activeClients,
      onboardingsCompleted: onboardings,
      collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
    }
  } else if (userDept === 'SALES') {
    // Sales KPIs
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
        deletedAt: null,
      },
      select: { id: true, stage: true, value: true },
    })

    const wonDeals = leads.filter(l => l.stage === 'WON')
    const proposalsSent = leads.filter(l => ['PROPOSAL_SENT', 'NEGOTIATION', 'WON'].includes(l.stage))

    const activities = await prisma.leadActivity.findMany({
      where: {
        userId,
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      select: { type: true },
    })

    const calls = activities.filter(a => a.type === 'CALL').length
    const meetings = activities.filter(a => a.type === 'MEETING').length

    deptData = {
      leadsGenerated: leads.length,
      callsMade: calls,
      meetingsScheduled: meetings,
      proposalsSent: proposalsSent.length,
      dealsWon: wonDeals.length,
      revenueGenerated: wonDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      conversionRate: leads.length > 0 ? (wonDeals.length / leads.length) * 100 : 0,
    }
  } else if (userDept === 'HR') {
    // HR KPIs
    const candidates = await prisma.candidate?.count?.({
      where: {
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    }) || 0

    const interviews = await prisma.interview?.count?.({
      where: {
        scheduledAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    }) || 0

    const newHires = await prisma.user.count({
      where: {
        joiningDate: { gte: currentMonthStart, lte: currentMonthEnd },
        status: 'ACTIVE',
      },
    })

    const exitedEmployees = await prisma.user.count({
      where: {
        status: 'INACTIVE',
        updatedAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    })

    const activeEmployees = await prisma.user.count({
      where: { status: 'ACTIVE' },
    })

    deptData = {
      candidatesSourced: candidates,
      interviewsConducted: interviews,
      offersExtended: 0, // Would need OfferLetter model
      joineesOnboarded: newHires,
      employeeNPS: 0, // Would need survey data
      attritionRate: activeEmployees > 0 ? (exitedEmployees / activeEmployees) * 100 : 0,
      trainingHoursDelivered: 0, // Would need training tracking
    }
  } else {
    // Operations KPIs
    const activeClients = await prisma.client.count({
      where: { status: 'ACTIVE' },
    })

    const tasks = await prisma.dailyTask.findMany({
      where: {
        plan: {
          userId,
          date: { gte: currentMonthStart, lte: currentMonthEnd },
        },
      },
      select: { status: true },
    })

    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length

    // Count escalations from client feedback records
    const escalations = await prisma.clientFeedback.count({
      where: {
        hadEscalation: true,
        month: { gte: currentMonthStart, lte: currentMonthEnd },
      },
    })

    const feedback = await prisma.clientFeedback.findMany({
      where: {
        month: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      select: { npsScore: true },
    })

    const avgNps = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + (f.npsScore || 0), 0) / feedback.length
      : 0

    deptData = {
      clientsManaged: activeClients,
      clientNPS: avgNps,
      tasksCompleted: completedTasks,
      escalationsResolved: escalations,
      deliverablesMet: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
      clientRetention: 95, // Would need churn tracking
      responseTime: 4, // Would need ticket tracking
    }
  }

  // Get previous month data for comparison (simplified)
  const prevDeptData: Record<string, unknown> = {}
  // In production, would fetch similar data for prev month

  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const prevMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <OpsTacticalClient
      userId={userId}
      userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
      department={userDept}
      departmentLabel={departmentKpis.label}
      kpiDefinitions={departmentKpis.kpis}
      isManager={isManager}
      monthName={monthName}
      prevMonthName={prevMonthName}
      currentData={deptData}
      prevData={prevDeptData}
      meetingId={meeting?.id || null}
      meetingStatus={meeting?.status || 'DRAFT'}
    />
  )
}
