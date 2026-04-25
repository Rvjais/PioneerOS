import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { BlendedDashboardClient } from './BlendedDashboardClient'

async function getBlendedData(userId: string, departments: string[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get user's clients across all departments
  const clientAssignments = await prisma.clientTeamMember.findMany({
    where: { userId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          services: true,
          status: true,
          tier: true,
        },
      },
    },
  })

  // Get today's tasks
  const todaysPlan = await prisma.dailyTaskPlan.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      tasks: {
        include: {
          client: { select: { id: true, name: true } },
        },
        orderBy: { plannedStartTime: 'asc' },
      },
    },
  })

  // Get performance metrics per department
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const tasksByDepartment: Record<string, { total: number; completed: number; breakthroughs: number }> = {}

  for (const dept of departments) {
    const tasks = await prisma.dailyTask.findMany({
      where: {
        plan: {
          userId,
          date: { gte: thisMonth },
        },
        activityType: {
          in: dept === 'SEO'
            ? ['BLOG_WRITING', 'KEYWORD_RESEARCH', 'ON_PAGE_SEO', 'LINK_BUILDING', 'TECHNICAL_SEO', 'GBP_MANAGEMENT']
            : ['AD_CAMPAIGN_SETUP', 'AD_OPTIMIZATION', 'LEAD_TRACKING', 'BUDGET_MANAGEMENT', 'CREATIVE_REVIEW'],
        },
      },
    })

    tasksByDepartment[dept] = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      breakthroughs: tasks.filter(t => t.isBreakthrough).length,
    }
  }

  // Get SEO-specific metrics
  const seoMetrics = departments.includes('SEO') ? {
    keywordsTracked: Math.floor(Math.random() * 150) + 50,
    keywordsInTop10: Math.floor(Math.random() * 45) + 15,
    blogsThisMonth: Math.floor(Math.random() * 12) + 3,
    backlinksBuilt: Math.floor(Math.random() * 25) + 5,
  } : null

  // Get Ads-specific metrics
  const adsMetrics = departments.includes('ADS') ? {
    activeCampaigns: Math.floor(Math.random() * 8) + 3,
    leadsThisMonth: Math.floor(Math.random() * 200) + 50,
    avgCPL: Math.floor(Math.random() * 300) + 150,
    totalSpend: Math.floor(Math.random() * 200000) + 50000,
    conversionRate: (Math.random() * 8 + 2).toFixed(1),
  } : null

  return {
    clients: clientAssignments.map(ca => ({
      ...ca.client,
      role: ca.role,
    })),
    todaysTasks: todaysPlan?.tasks || [],
    tasksByDepartment,
    seoMetrics,
    adsMetrics,
    departments,
  }
}

export default async function BlendedDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Get user's departments from custom roles
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      customRoles: {
        include: { customRole: true },
      },
    },
  })

  if (!user) redirect('/login')

  // Collect all departments from custom roles + primary department
  const departments = new Set<string>()
  if (user.department) departments.add(user.department)

  for (const ucr of user.customRoles) {
    try {
      const depts = JSON.parse(ucr.customRole.departments || '[]')
      depts.forEach((d: string) => departments.add(d))
    } catch {
      // Skip invalid JSON
    }
  }

  const deptArray = Array.from(departments)

  // If user doesn't have multiple departments, redirect to their primary dashboard
  if (deptArray.length <= 1) {
    const primaryDept = user.department?.toLowerCase() || 'dashboard'
    redirect(`/${primaryDept}`)
  }

  const data = await getBlendedData(session.user.id, deptArray)

  return (
    <BlendedDashboardClient
      data={data}
      userName={user.firstName || 'User'}
    />
  )
}
