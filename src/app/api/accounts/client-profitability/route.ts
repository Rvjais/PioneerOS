import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const months = parseInt(searchParams.get('months') || '3') // Default last 3 months
    const segment = searchParams.get('segment') || ''

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    // Get active clients
    const clientWhere: Record<string, unknown> = { status: 'ACTIVE', deletedAt: null }
    if (segment) clientWhere.serviceSegment = segment

    const clients = await prisma.client.findMany({
      where: clientWhere,
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        tier: true,
        serviceSegment: true,
        entityType: true,
        status: true,
      },
    })

    // Get revenue (confirmed payments) per client
    const payments = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: startDate },
        status: 'CONFIRMED',
      },
      select: {
        clientId: true,
        grossAmount: true,
        netAmount: true,
      },
    })

    const revenueByClient = new Map<string, { gross: number; net: number; count: number }>()
    for (const p of payments) {
      const entry = revenueByClient.get(p.clientId) || { gross: 0, net: 0, count: 0 }
      entry.gross += p.grossAmount
      entry.net += p.netAmount
      entry.count++
      revenueByClient.set(p.clientId, entry)
    }

    // Get direct expenses per client
    const expenses = await prisma.expense.findMany({
      where: {
        clientId: { not: null },
        createdAt: { gte: startDate },
        status: { in: ['APPROVED', 'PAID'] },
      },
      select: {
        clientId: true,
        amount: true,
      },
    })

    const expenseByClient = new Map<string, number>()
    for (const e of expenses) {
      if (!e.clientId) continue
      expenseByClient.set(e.clientId, (expenseByClient.get(e.clientId) || 0) + e.amount)
    }

    // Get team member count per client (for salary cost estimation)
    const teamMembers = await prisma.clientTeamMember.findMany({
      select: {
        clientId: true,
        userId: true,
      },
    })

    const teamCountByClient = new Map<string, number>()
    for (const tm of teamMembers) {
      teamCountByClient.set(tm.clientId, (teamCountByClient.get(tm.clientId) || 0) + 1)
    }

    // Get total team members for salary distribution
    const totalTeamAssignments = teamMembers.length || 1

    // Get total salary expense for the period (from DepartmentExpense)
    const deptExpenses = await prisma.departmentExpense.findMany({
      where: {
        month: {
          gte: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
        },
      },
      select: {
        totalSalaryComponent: true,
      },
    })

    const totalSalaryPool = deptExpenses.reduce((s, d) => s + (d.totalSalaryComponent || 0), 0)
    const salaryPerAssignment = totalTeamAssignments > 0 ? totalSalaryPool / totalTeamAssignments : 0

    // Build profitability per client
    const profitability = clients.map(client => {
      const revenue = revenueByClient.get(client.id) || { gross: 0, net: 0, count: 0 }
      const directExpense = expenseByClient.get(client.id) || 0
      const teamCount = teamCountByClient.get(client.id) || 0
      const allocatedSalary = teamCount * salaryPerAssignment
      const totalCost = directExpense + allocatedSalary
      const profit = revenue.net - totalCost
      const margin = revenue.net > 0 ? (profit / revenue.net) * 100 : 0
      const expectedRevenue = (client.monthlyFee || 0) * months

      return {
        client: {
          id: client.id,
          name: client.name,
          tier: client.tier,
          serviceSegment: client.serviceSegment,
          entityType: client.entityType,
          monthlyFee: client.monthlyFee || 0,
        },
        revenue: {
          gross: Math.round(revenue.gross * 100) / 100,
          net: Math.round(revenue.net * 100) / 100,
          expected: expectedRevenue,
          collectionRate: expectedRevenue > 0 ? Math.round((revenue.gross / expectedRevenue) * 100) : 0,
          paymentCount: revenue.count,
        },
        costs: {
          directExpense: Math.round(directExpense * 100) / 100,
          allocatedSalary: Math.round(allocatedSalary * 100) / 100,
          totalCost: Math.round(totalCost * 100) / 100,
          teamMembers: teamCount,
        },
        profitability: {
          profit: Math.round(profit * 100) / 100,
          margin: Math.round(margin * 10) / 10,
          revenuePerTeamMember: teamCount > 0 ? Math.round((revenue.net / teamCount) * 100) / 100 : 0,
        },
      }
    }).sort((a, b) => b.profitability.profit - a.profitability.profit)

    // Summary stats
    const totals = profitability.reduce(
      (acc, p) => ({
        totalRevenue: acc.totalRevenue + p.revenue.net,
        totalCost: acc.totalCost + p.costs.totalCost,
        totalProfit: acc.totalProfit + p.profitability.profit,
        profitable: acc.profitable + (p.profitability.profit > 0 ? 1 : 0),
        unprofitable: acc.unprofitable + (p.profitability.profit <= 0 ? 1 : 0),
      }),
      { totalRevenue: 0, totalCost: 0, totalProfit: 0, profitable: 0, unprofitable: 0 }
    )

    return NextResponse.json({
      clients: profitability,
      summary: {
        ...totals,
        totalRevenue: Math.round(totals.totalRevenue * 100) / 100,
        totalCost: Math.round(totals.totalCost * 100) / 100,
        totalProfit: Math.round(totals.totalProfit * 100) / 100,
        avgMargin: totals.totalRevenue > 0
          ? Math.round((totals.totalProfit / totals.totalRevenue) * 1000) / 10
          : 0,
        totalClients: profitability.length,
      },
      period: { months, startDate: startDate.toISOString() },
    })
  } catch (error) {
    console.error('Failed to calculate profitability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
