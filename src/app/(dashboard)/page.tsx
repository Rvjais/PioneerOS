import React from 'react'
import dynamic from 'next/dynamic'
import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import Link from 'next/link'
import { DepartmentTargets } from '@/client/components/dashboard/DepartmentTargets'
import { InspirationWidget } from '@/client/components/dashboard/InspirationWidget'
import { QuickAccessPanel } from '@/client/components/dashboard/QuickAccessPanel'
import { PerformanceLeaderboard } from '@/client/components/dashboard/PerformanceLeaderboard'
import { CompanyNews } from '@/client/components/dashboard/CompanyNews'
import { UpdatesEventsTabs } from '@/client/components/dashboard/UpdatesEventsTabs'
import { ClientProjects } from '@/client/components/dashboard/ClientProjects'
import { QuickStats } from '@/client/components/dashboard/QuickStats'
import { PaymentStatus } from '@/client/components/dashboard/PaymentStatus'
import { CelebrationsCard } from '@/client/components/dashboards/CelebrationsCard'
import { DailyLearning } from '@/client/components/dashboard/DailyLearning'
import { WorkTimer } from '@/client/components/dashboard/WorkTimer'

// Role-based dashboards — dynamically imported so only the active variant is loaded
const AdminDashboard = dynamic(() => import('@/client/components/dashboards/AdminDashboard'))
const ManagerDashboard = dynamic(() => import('@/client/components/dashboards/ManagerDashboard'))
const SalesDashboard = dynamic(() => import('@/client/components/dashboards/SalesDashboard'))
const AccountsDashboard = dynamic(() => import('@/client/components/dashboards/AccountsDashboard'))
const EmployeeDashboard = dynamic(() => import('@/client/components/dashboards/EmployeeDashboard'))
const HRDashboard = dynamic(() => import('@/client/components/dashboards/HRDashboard').then(m => ({ default: m.HRDashboard })))
const InternDashboard = dynamic(() => import('@/client/components/dashboards/InternDashboard').then(m => ({ default: m.InternDashboard })))
const FreelancerDashboard = dynamic(() => import('@/client/components/dashboards/FreelancerDashboard').then(m => ({ default: m.FreelancerDashboard })))
const SEODashboard = dynamic(() => import('@/client/components/dashboards/SEODashboard').then(m => ({ default: m.SEODashboard })))
const SocialDashboard = dynamic(() => import('@/client/components/dashboards/SocialDashboard').then(m => ({ default: m.SocialDashboard })))
const AdsDashboard = dynamic(() => import('@/client/components/dashboards/AdsDashboard').then(m => ({ default: m.AdsDashboard })))
const WebDashboard = dynamic(() => import('@/client/components/dashboards/WebDashboard').then(m => ({ default: m.WebDashboard })))

async function getDashboardData(userId: string, userRole: string) {
  const fullAccessRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']
  const clientWhere = fullAccessRoles.includes(userRole)
    ? { deletedAt: null }
    : { deletedAt: null, teamMembers: { some: { userId } } }

  const [
    targets,
    quotes,
    employees,
    clients,
    news,
    events,
    scores
  ] = await Promise.all([
    prisma.departmentTarget.findMany({ where: { month: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    prisma.quote.findMany({ take: 20 }),
    prisma.user.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, firstName: true, lastName: true, department: true, role: true, email: true, profile: { select: { profilePicture: true } } },
      take: 50,
    }),
    prisma.client.findMany({ where: clientWhere, orderBy: { updatedAt: 'desc' }, take: 20, select: { id: true, name: true, status: true, tier: true, monthlyFee: true, updatedAt: true, healthStatus: true } }),
    prisma.companyNews.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.event.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: 'asc' }, take: 5 }),
    prisma.performanceScore.findMany({
      include: { user: true },
      orderBy: { score: 'desc' },
      take: 10
    })
  ])

  return { targets, quotes, employees, clients, news, events, scores }
}

// Fetch HR-specific dashboard data
async function getHRDashboardData(userId: string) {
  const [user, pendingVerifications, leaveRequests, activeEmployees, upcomingBirthdays, onboardingProgress] = await Promise.all([
    // User data
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    }),
    prisma.user.findMany({
      where: { profileCompletionStatus: { in: ['INCOMPLETE', 'PENDING_HR'] } },
      select: { id: true, firstName: true, lastName: true, department: true, joiningDate: true },
      take: 10
    }),
    prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        dateOfBirth: { not: null }
      },
      select: { id: true, firstName: true, lastName: true, department: true, dateOfBirth: true },
      take: 10
    }),
    prisma.employeeOnboardingChecklist.findMany({
      where: { status: { not: 'COMPLETED' } },
      include: { user: { select: { firstName: true, lastName: true, department: true } } },
      take: 10
    })
  ])

  const thisMonth = new Date()
  thisMonth.setDate(1)
  const newJoiners = await prisma.user.count({ where: { joiningDate: { gte: thisMonth } } })

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    },
    stats: {
      pendingVerifications: pendingVerifications.length,
      pendingLeaveRequests: leaveRequests.length,
      activeEmployees,
      newJoinersThisMonth: newJoiners,
      upcomingAppraisals: 0,
      openPositions: 0
    },
    pendingVerifications: pendingVerifications.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName || '',
      department: u.department,
      joiningDate: u.joiningDate?.toISOString() || new Date().toISOString()
    })),
    leaveRequests: leaveRequests.map(l => ({
      id: l.id,
      userId: l.userId,
      user: {
        firstName: l.user.firstName,
        lastName: l.user.lastName || ''
      },
      leaveType: l.type,
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      status: l.status
    })),
    upcomingBirthdays: upcomingBirthdays.filter(u => u.dateOfBirth).map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName || '',
      department: u.department,
      dateOfBirth: u.dateOfBirth?.toISOString() ?? ''
    })),
    onboardingProgress: onboardingProgress.map(o => ({
      id: o.id,
      userId: o.userId,
      user: {
        firstName: o.user.firstName,
        lastName: o.user.lastName || '',
        department: o.user.department
      },
      completedSteps: Object.values(o).filter(v => v === true).length,
      totalSteps: Object.keys(o).filter(k => !['id', 'userId', 'completionPercentage', 'status', 'hrNotes', 'lastUpdatedBy', 'createdAt', 'updatedAt'].includes(k)).length
    })),
    attendanceToday: await (async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const [present, wfh, onLeave] = await Promise.all([
        prisma.attendance.count({ where: { date: { gte: today }, status: 'PRESENT' } }),
        prisma.attendance.count({ where: { date: { gte: today }, status: 'WFH' } }),
        prisma.leaveRequest.count({ where: { startDate: { lte: new Date() }, endDate: { gte: new Date() }, status: 'APPROVED' } }),
      ])
      const totalActive = await prisma.user.count({ where: { status: 'ACTIVE' } })
      return { present, absent: Math.max(0, totalActive - present - wfh - onLeave), wfh, onLeave }
    })()
  }
}

// Fetch department-specific data for employees
async function getEmployeeDashboardData(userId: string, department: string) {
  const clientIds = (await prisma.clientTeamMember.findMany({
    where: { userId },
    select: { clientId: true }
  })).map(a => a.clientId)

  const [user, clientAssignments, todaysTasks, allTasks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    }),
    prisma.clientTeamMember.findMany({
      where: { userId },
      include: { client: { select: { id: true, name: true, healthScore: true, services: true, selectedServices: true, updatedAt: true } } }
    }),
    prisma.dailyTask.findMany({
      where: {
        plan: { userId },
        status: { not: 'COMPLETED' }
      },
      include: {
        client: { select: { name: true } }
      },
      take: 10
    }),
    // Get all tasks for this user's clients in their department
    prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: userId },
          { clientId: { in: clientIds } }
        ],
        department: department
      },
      include: {
        client: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ])

  // Calculate real stats based on actual data
  const scheduledContent = allTasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS')
  const completedContent = allTasks.filter(t => t.status === 'DONE')
  const activeCampaigns = allTasks.filter(t => t.status === 'IN_PROGRESS')
  const activeProjects = allTasks.filter(t => !['DONE', 'CANCELLED'].includes(t.status))
  const completedProjects = allTasks.filter(t => t.status === 'DONE')

  // Map tasks to content calendar format (for Social dashboard)
  const contentCalendar = scheduledContent.slice(0, 10).map(t => ({
    id: t.id,
    client: t.client?.name || 'Internal',
    platform: t.type || 'Social',
    type: t.type || 'Post',
    scheduledFor: t.dueDate?.toISOString() || new Date().toISOString(),
    status: t.status === 'TODO' ? 'PENDING' : t.status === 'IN_PROGRESS' ? 'DRAFT' : 'APPROVED'
  }))

  // Map tasks to campaigns format (for Ads dashboard)
  const campaigns = activeCampaigns.slice(0, 10).map(t => ({
    id: t.id,
    name: t.title,
    client: t.client?.name || 'Internal',
    platform: t.type || 'Ads',
    status: t.status,
    spend: 0,
    leads: 0,
    cpl: 0
  }))

  // Map tasks to projects format (for Web dashboard)
  const projects = activeProjects.slice(0, 10).map(t => ({
    id: t.id,
    name: t.title,
    client: t.client?.name || 'Internal',
    status: t.status,
    progress: t.status === 'DONE' ? 100 : t.status === 'IN_PROGRESS' ? 50 : 10,
    dueDate: t.dueDate?.toISOString() || new Date().toISOString(),
    technology: t.type || 'Web'
  }))

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    },
    stats: {
      clientsManaged: clientAssignments.length,
      keywordsTracked: 0, // Populated from SEO tracking when available
      avgRanking: 0,
      gbpListings: clientAssignments.length,
      tasksToday: todaysTasks.length,
      completedToday: todaysTasks.filter(t => t.status === 'COMPLETED').length,
      postsScheduled: scheduledContent.length,
      postsPublished: completedContent.length,
      videosEdited: completedContent.filter(t => t.type === 'VIDEO' || t.type === 'REEL').length,
      engagementRate: 0, // Populated from social analytics when available
      activeCampaigns: activeCampaigns.length,
      totalSpend: 0, // Populated from ads platform data when available
      totalLeads: 0,
      avgCPL: 0,
      avgROAS: 0,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      avgLighthouseScore: 0, // Populated from web audits when available
      deploymentsThisMonth: completedProjects.length
    },
    clients: clientAssignments.map(a => {
      let services: string[] = []
      try { if (a.client.services) services = JSON.parse(a.client.services) } catch { /* */ }
      if (!services.length) try { if (a.client.selectedServices) { const parsed = JSON.parse(a.client.selectedServices); services = parsed.map((s: string | {serviceId?: string; name?: string}) => typeof s === 'string' ? s : s.name || s.serviceId || '') } } catch { /* */ }
      return {
        id: a.client.id,
        name: a.client.name,
        healthScore: a.client.healthScore || 0,
        keywordsRanked: 0,
        lastAudit: a.client.updatedAt?.toISOString() || new Date().toISOString(),
        services,
        platforms: services.filter(s => ['SOCIAL_MEDIA', 'SOCIAL'].includes(s)).length > 0 ? ['Instagram', 'Facebook'] : [],
        nextPost: '',
        pendingApprovals: 0
      }
    }),
    todaysTasks: todaysTasks.map(t => ({
      id: t.id,
      title: t.description,
      client: t.client?.name || 'Internal',
      project: t.description || 'Task',
      type: t.activityType || 'Task',
      priority: t.priority,
      status: t.status
    })),
    keywordAlerts: [],
    contentCalendar,
    campaigns,
    budgetAlerts: [],
    projects,
    recentDeployments: completedProjects.slice(0, 5).map(p => ({
      id: p.id,
      project: p.title,
      environment: 'Production',
      deployedAt: p.updatedAt.toISOString(),
      status: 'success'
    }))
  }
}

// Fetch intern dashboard data
async function getInternDashboardData(userId: string) {
  const [user, tasks, dailyTasks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.dailyTask.findMany({
      where: { plan: { userId } },
      include: {
        client: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  const joiningDate = user?.joiningDate || new Date()
  const daysCompleted = Math.floor((Date.now() - joiningDate.getTime()) / (1000 * 60 * 60 * 24))

  const completedTasks = tasks.filter(t => t.status === 'DONE')
  const pendingTasks = tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELLED')

  // Map tasks to recent tasks format - matches InternDashboardProps interface
  const recentTasks = tasks.slice(0, 5).map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    completedAt: t.status === 'DONE' ? t.updatedAt.toISOString() : undefined
  }))

  // Calculate upcoming deadlines from tasks with due dates - matches InternDashboardProps interface
  const upcomingDeadlines = pendingTasks
    .filter(t => t.dueDate && new Date(t.dueDate) > new Date())
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate!.toISOString(),
      type: t.type || 'Task'
    }))

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      department: user?.department || '',
      joiningDate: joiningDate.toISOString(),
      internshipEndDate: undefined
    },
    stats: {
      tasksCompleted: completedTasks.length,
      tasksAssigned: tasks.length,
      learningHours: await (async () => {
        const logs = await prisma.learningLog.aggregate({
          where: { userId },
          _sum: { minutesWatched: true },
        })
        return Math.round((logs._sum.minutesWatched || 0) / 60 * 10) / 10
      })(),
      requiredLearningHours: 36,
      daysCompleted: Math.min(daysCompleted, 90),
      totalDays: 90,
      skillsAcquired: Math.floor(completedTasks.length / 3)
    },
    learningProgress: dailyTasks.slice(0, 5).map(t => ({
      id: t.id,
      title: t.description,
      progress: t.status === 'COMPLETED' ? 100 : t.status === 'IN_PROGRESS' ? 50 : 0,
      category: t.activityType || 'Learning'
    })),
    recentTasks,
    skillsRoadmap: (() => {
      // Dynamic skills based on department
      const dept = user?.department || 'WEB'
      const base = completedTasks.length
      const deptSkills: Record<string, Array<{skill: string; level: 'beginner' | 'intermediate' | 'advanced'}>> = {
        WEB: [{ skill: 'HTML/CSS', level: 'intermediate' }, { skill: 'JavaScript', level: 'beginner' }, { skill: 'React', level: 'beginner' }],
        SEO: [{ skill: 'On-Page SEO', level: 'intermediate' }, { skill: 'Technical SEO', level: 'beginner' }, { skill: 'Analytics', level: 'beginner' }],
        SOCIAL: [{ skill: 'Content Creation', level: 'intermediate' }, { skill: 'Copywriting', level: 'beginner' }, { skill: 'Analytics', level: 'beginner' }],
        ADS: [{ skill: 'Google Ads', level: 'intermediate' }, { skill: 'Meta Ads', level: 'beginner' }, { skill: 'Analytics', level: 'beginner' }],
        DESIGN: [{ skill: 'Canva/Figma', level: 'intermediate' }, { skill: 'Brand Design', level: 'beginner' }, { skill: 'UI/UX', level: 'beginner' }],
        HR: [{ skill: 'Recruitment', level: 'intermediate' }, { skill: 'Onboarding', level: 'beginner' }, { skill: 'Employee Relations', level: 'beginner' }],
      }
      const skills = deptSkills[dept] || deptSkills.WEB
      return skills.map((s, i) => ({ ...s, progress: Math.min(90, base * (10 - i * 2)) }))
    })(),
    upcomingDeadlines
  }
}

// Fetch freelancer dashboard data
async function getFreelancerDashboardData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const freelancerProfile = await prisma.freelancerProfile.findUnique({ where: { userId } })

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const [workReports, payments, tasks] = await Promise.all([
    freelancerProfile ? prisma.freelancerWorkReport.findMany({
      where: { freelancerProfileId: freelancerProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    }) : Promise.resolve([]),
    freelancerProfile ? prisma.freelancerPayment.findMany({
      where: { freelancerProfileId: freelancerProfile.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    }) : Promise.resolve([]),
    prisma.task.findMany({
      where: { assigneeId: userId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  ])

  const activeTasks = tasks.filter(t => !['DONE', 'CANCELLED'].includes(t.status))
  const completedThisMonth = tasks.filter(t => t.status === 'DONE' && t.updatedAt >= thisMonth)
  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const paidPayments = payments.filter(p => p.status === 'PAID')
  const totalHours = workReports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      department: user?.department || ''
    },
    stats: {
      activeAssignments: activeTasks.length,
      completedThisMonth: completedThisMonth.length,
      pendingPayment: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      totalEarnings: paidPayments.reduce((sum, p) => sum + p.amount, 0),
      hoursLogged: totalHours,
      invoicesPending: pendingPayments.length
    },
    assignments: activeTasks.map(t => ({
      id: t.id,
      client: t.client?.name || 'Internal',
      project: t.title,
      deadline: t.dueDate?.toISOString() || new Date().toISOString(),
      status: t.status,
      rate: freelancerProfile?.hourlyRate || 0
    })),
    recentPayments: payments.map(p => ({
      id: p.id,
      amount: p.amount,
      date: p.createdAt.toISOString(),
      status: p.status,
      project: 'Freelance Task'
    })),
    workReports: workReports.map(r => ({
      id: r.id,
      date: r.createdAt.toISOString(),
      hours: r.hoursWorked,
      description: r.description,
      status: r.status
    }))
  }
}

// Fetch Accounts dashboard data
async function getAccountsDashboardData(userId: string) {
  const now = new Date()

  const [user, onboardingClients, overdueInvoices, recentPayments, allInvoices] = await Promise.all([
    // User data
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    }),
    // Clients in onboarding status
    prisma.client.findMany({
      where: { status: 'ONBOARDING', deletedAt: null },
      select: { id: true, name: true, monthlyFee: true, createdAt: true, status: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    // Overdue invoices
    prisma.invoice.findMany({
      where: {
        status: 'OVERDUE',
        dueDate: { lt: now }
      },
      include: { client: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10
    }),
    // Recent paid invoices
    prisma.invoice.findMany({
      where: { status: 'PAID' },
      include: { client: { select: { name: true } } },
      orderBy: { paidAt: 'desc' },
      take: 5
    }),
    // All invoices for stats
    prisma.invoice.findMany({
      select: { status: true, total: true }
    })
  ])

  const pendingInvoices = allInvoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
  const paidThisMonth = allInvoices.filter(i => i.status === 'PAID')

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    },
    onboardings: onboardingClients.map(c => ({
      id: c.id,
      client: c.name,
      stage: 'Onboarding',
      value: c.monthlyFee || 0,
      days: Math.floor((now.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    })),
    invoices: overdueInvoices.map(i => ({
      id: i.id,
      client: i.client.name,
      invoice: i.invoiceNumber,
      amount: i.total,
      daysOverdue: Math.floor((now.getTime() - i.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    })),
    recentPayments: recentPayments.map(p => ({
      id: p.id,
      client: p.client.name,
      amount: p.total,
      date: p.paidAt?.toISOString() || p.updatedAt.toISOString(),
      method: 'Bank Transfer'
    })),
    stats: {
      pendingInvoices: pendingInvoices.length,
      overdueAmount: overdueInvoices.reduce((sum, i) => sum + i.total, 0),
      monthlyRevenue: paidThisMonth.reduce((sum, i) => sum + i.total, 0),
      pendingOnboardings: onboardingClients.length,
      collectionsRate: allInvoices.length > 0
        ? Math.round((paidThisMonth.length / allInvoices.length) * 100)
        : 100
    }
  }
}

// Fetch Sales dashboard data
async function getSalesDashboardData(userId: string) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [user, leads, recentLeads] = await Promise.all([
    // User data
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    }),
    // All leads with follow-up dates
    prisma.lead.findMany({
      where: {
        nextFollowUp: { not: null },
        deletedAt: null
      },
      include: {
        assignedTo: { select: { firstName: true, lastName: true } }
      },
      orderBy: { nextFollowUp: 'asc' },
      take: 20
    }),
    // Recent leads
    prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  // Calculate pipeline stages
  const stageCount: Record<string, { count: number; value: number }> = {
    'NEW': { count: 0, value: 0 },
    'CONTACTED': { count: 0, value: 0 },
    'QUALIFIED': { count: 0, value: 0 },
    'PROPOSAL': { count: 0, value: 0 },
    'NEGOTIATION': { count: 0, value: 0 },
    'WON': { count: 0, value: 0 }
  }

  leads.forEach(lead => {
    if (stageCount[lead.stage]) {
      stageCount[lead.stage].count++
      stageCount[lead.stage].value += lead.value || 0
    }
  })

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    },
    followUps: leads.slice(0, 10).map(l => ({
      id: l.id,
      company: l.companyName,
      contact: l.contactName || '',
      time: l.nextFollowUp ? new Date(l.nextFollowUp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
      type: l.source || 'Call',
      status: l.stage === 'WON' ? 'completed' : 'pending'
    })),
    recentLeads: recentLeads.map(l => ({
      id: l.id,
      company: l.companyName,
      source: l.source || 'Direct',
      value: l.value || 0,
      time: getRelativeTime(l.createdAt)
    })),
    pipeline: Object.entries(stageCount).map(([stage, data]) => ({
      stage: stage.replace(/_/g, ' '),
      count: data.count,
      value: data.value
    })),
    stats: {
      newLeads: stageCount['NEW'].count,
      followUpsToday: leads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp) >= startOfDay).length,
      proposalsSent: stageCount['PROPOSAL'].count,
      dealsWon: stageCount['WON'].count,
      pipelineValue: Object.values(stageCount).reduce((sum, s) => sum + s.value, 0),
      conversionRate: leads.length > 0
        ? Math.round((stageCount['WON'].count / leads.length) * 100)
        : 0
    }
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hours ago`
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function formatDueDate(date: Date | null): string {
  if (!date) return 'No date'
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return 'Overdue'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

// Fetch default employee dashboard data
async function getDefaultEmployeeDashboardData(userId: string) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const [user, tasks, completedToday, reviewTasks, events, announcements] = await Promise.all([
    // User data
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    }),
    // Assigned tasks
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' }
      },
      include: {
        client: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    }),
    // Completed today
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: 'DONE',
        completedAt: { gte: startOfDay }
      }
    }),
    // Pending review
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: 'REVIEW'
      }
    }),
    // Today's events/meetings
    prisma.event.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: { date: 'asc' },
      take: 10
    }),
    // Recent announcements (company news)
    prisma.companyNews.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  // Count meetings this week
  const meetingsThisWeek = await prisma.event.count({
    where: {
      date: {
        gte: startOfWeek,
        lt: endOfWeek
      }
    }
  })

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    },
    stats: {
      assignedTasks: tasks.length,
      completedToday,
      pendingReview: reviewTasks,
      upcomingMeetings: meetingsThisWeek
    },
    tasks: tasks.slice(0, 4).map(t => ({
      id: t.id,
      title: t.title,
      client: t.client?.name || 'Internal',
      priority: t.priority || 'MEDIUM',
      due: formatDueDate(t.dueDate)
    })),
    schedule: events.map(e => ({
      id: e.id,
      title: e.title,
      time: e.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      type: e.type === 'MEETING' ? 'CLIENT' : e.type === 'BREAK' ? 'BREAK' : 'INTERNAL',
      duration: '30 min',
      client: undefined
    })),
    announcements: announcements.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category || 'General',
      time: getRelativeTime(a.createdAt)
    }))
  }
}

// Fetch Manager dashboard data
async function getManagerDashboardData(userId: string) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [user, teamMembers, pendingReviews, clients, completedTasksCount] = await Promise.all([
    // User data
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    }),
    // Team members (all employees except managers/admins)
    prisma.user.findMany({
      where: {
        role: { in: ['EMPLOYEE', 'INTERN', 'FREELANCER'] },
        status: 'ACTIVE'
      },
      include: {
        assignedTasks: {
          where: { status: { not: 'DONE' } },
          select: { id: true }
        }
      },
      take: 10
    }),
    // Tasks pending review
    prisma.task.findMany({
      where: { status: 'REVIEW' },
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        client: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    }),
    // Active clients with projects
    prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      include: {
        tasks: {
          select: { status: true }
        }
      },
      take: 10
    }),
    // Completed tasks this week
    prisma.task.count({
      where: {
        status: 'DONE',
        completedAt: { gte: weekAgo }
      }
    })
  ])

  return {
    user: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    },
    stats: {
      teamSize: teamMembers.length,
      activeProjects: clients.length,
      completedTasks: completedTasksCount,
      pendingReviews: pendingReviews.length,
      teamUtilization: Math.round(
        (teamMembers.filter(m => m.assignedTasks.length > 0).length / Math.max(teamMembers.length, 1)) * 100
      )
    },
    teamMembers: teamMembers.map(m => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName || ''}`.trim(),
      role: m.department,
      tasks: m.assignedTasks.length,
      status: m.assignedTasks.length > 5 ? 'busy' : 'active'
    })),
    pendingReviews: pendingReviews.map(t => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee?.firstName || 'Unassigned',
      client: t.client?.name || 'Internal',
      time: getRelativeTime(t.updatedAt)
    })),
    projects: clients.slice(0, 5).map(c => {
      const totalTasks = c.tasks.length
      const completedTasks = c.tasks.filter(t => t.status === 'DONE').length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      return {
        id: c.id,
        client: c.name,
        progress,
        status: progress >= 70 ? 'On Track' : progress >= 40 ? 'In Progress' : progress > 0 ? 'At Risk' : 'New'
      }
    })
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role as string | undefined
  const userDepartment = session?.user?.department as string | undefined
  const userId = session?.user?.id as string | undefined

  // Helper to wrap dashboard with celebrations, daily learning, and work timer
  const DashboardWithCelebrations = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-6">
      {/* Top Banner: Celebrations + Daily Learning + Work Timer */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <CelebrationsCard />
        </div>
        <div className="lg:col-span-1">
          <DailyLearning />
        </div>
        <div className="lg:col-span-1">
          <WorkTimer />
        </div>
      </div>
      {children}
    </div>
  )

  // Render role-specific dashboard
  if (userRole && userId) {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return (
          <DashboardWithCelebrations>
            <AdminDashboard />
          </DashboardWithCelebrations>
        )
      case 'MANAGER': {
        const managerData = await getManagerDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <ManagerDashboard {...managerData} />
          </DashboardWithCelebrations>
        )
      }
      case 'SALES': {
        const salesData = await getSalesDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <SalesDashboard {...salesData} />
          </DashboardWithCelebrations>
        )
      }
      case 'ACCOUNTS': {
        const accountsData = await getAccountsDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <AccountsDashboard {...accountsData} />
          </DashboardWithCelebrations>
        )
      }
      case 'OPERATIONS_HEAD': {
        // Operations Head gets manager-level dashboard
        const managerData = await getManagerDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <ManagerDashboard {...managerData} />
          </DashboardWithCelebrations>
        )
      }
      case 'INTERN': {
        const internData = await getInternDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <InternDashboard {...internData} />
          </DashboardWithCelebrations>
        )
      }
      case 'FREELANCER': {
        const freelancerData = await getFreelancerDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <FreelancerDashboard {...freelancerData} />
          </DashboardWithCelebrations>
        )
      }
      case 'HR': {
        const hrData = await getHRDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <HRDashboard {...hrData} />
          </DashboardWithCelebrations>
        )
      }
      case 'EMPLOYEE': {
        // Route to department-specific dashboard based on work type
        // Note: HR department employees get employee dashboard, not HR admin dashboard
        // HR admin dashboard is only for HR role users
        if (userDepartment === 'SEO') {
          const seoData = await getEmployeeDashboardData(userId, 'SEO')
          return (
            <DashboardWithCelebrations>
              <SEODashboard {...seoData} />
            </DashboardWithCelebrations>
          )
        }
        if (userDepartment === 'SOCIAL') {
          const socialData = await getEmployeeDashboardData(userId, 'SOCIAL')
          return (
            <DashboardWithCelebrations>
              <SocialDashboard {...socialData} />
            </DashboardWithCelebrations>
          )
        }
        if (userDepartment === 'ADS') {
          const adsData = await getEmployeeDashboardData(userId, 'ADS')
          return (
            <DashboardWithCelebrations>
              <AdsDashboard {...adsData} />
            </DashboardWithCelebrations>
          )
        }
        if (userDepartment === 'WEB') {
          const webData = await getEmployeeDashboardData(userId, 'WEB')
          return (
            <DashboardWithCelebrations>
              <WebDashboard {...webData} />
            </DashboardWithCelebrations>
          )
        }
        // Default employee dashboard
        const employeeData = await getDefaultEmployeeDashboardData(userId)
        return (
          <DashboardWithCelebrations>
            <EmployeeDashboard {...employeeData} />
          </DashboardWithCelebrations>
        )
      }
    }
  }

  // Default dashboard for unrecognized roles or unauthenticated users
  const data = await getDashboardData(userId || '', userRole || '')

  const stats = {
    q4Target: '₹12.5L',
    newClients: data.clients.filter((c) => {
      const thisMonth = new Date()
      thisMonth.setDate(1)
      return new Date(c.createdAt) >= thisMonth
    }).length,
    totalEmployees: data.employees.length,
    activeDepartments: [...new Set(data.employees.map((e) => e.department))].length
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Quick Stats Row */}
      <QuickStats stats={stats} />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Targets */}
          <DepartmentTargets targets={data.targets} />

          {/* Client Projects */}
          <ClientProjects clients={data.clients} />

          {/* Updates & Events Tabs */}
          <UpdatesEventsTabs events={data.events} news={data.news} />
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Celebrations */}
          <CelebrationsCard />

          {/* Daily Learning — Term + Quote */}
          <DailyLearning />

          {/* Quick Access Panel */}
          <QuickAccessPanel isLoggedIn={!!session} />

          {/* Performance Leaderboard */}
          <PerformanceLeaderboard scores={data.scores} />

          {/* Company News */}
          <CompanyNews news={data.news} />
        </div>
      </div>

      {/* Payment Status Section */}
      <PaymentStatus clients={data.clients.filter((c) => c.paymentStatus !== 'PAID')} />

      {/* Onboarding & Management Section */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
        <h3 className="text-xl font-bold text-white mb-1 relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          MASH Protocols
        </h3>
        <p className="text-sm text-slate-400 mb-6 relative z-10">Trigger core Hub-and-Spoke automated workflows.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <Link
            href="/hr/onboarding-checklist"
            className="flex items-center gap-4 px-5 py-4 bg-[#141A25]/50 border border-white/5 hover:border-emerald-500/30 rounded-xl hover:bg-emerald-500/5 hover:-translate-y-1 transition-all group/item shadow-inner"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover/item:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-200 group-hover/item:text-emerald-400 transition-colors">HR Setup</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Internal Protocol</p>
            </div>
          </Link>
          <Link
            href="/accounts/client-onboarding"
            className="flex items-center gap-4 px-5 py-4 bg-[#141A25]/50 border border-white/5 hover:border-purple-500/30 rounded-xl hover:bg-purple-500/5 hover:-translate-y-1 transition-all group/item shadow-inner"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover/item:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-200 group-hover/item:text-purple-400 transition-colors">Client Setup</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">External Protocol</p>
            </div>
          </Link>
          <Link
            href="/employee-onboarding"
            className="flex items-center gap-4 px-5 py-4 bg-[#141A25]/50 border border-white/5 hover:border-blue-500/30 rounded-xl hover:bg-blue-500/5 hover:-translate-y-1 transition-all group/item shadow-inner"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover/item:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-200 group-hover/item:text-blue-400 transition-colors">New Hire Form</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Public Gateway</p>
            </div>
          </Link>
          <Link
            href="/accounts/onboarding/create"
            className="flex items-center gap-4 px-5 py-4 bg-[#141A25]/50 border border-white/5 hover:border-amber-500/30 rounded-xl hover:bg-amber-500/5 hover:-translate-y-1 transition-all group/item shadow-inner"
          >
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover/item:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-200 group-hover/item:text-amber-400 transition-colors">Client Onboarding</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Create Token Link</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
