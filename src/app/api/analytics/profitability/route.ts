import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

interface ClientProfitability {
  clientId: string
  clientName: string
  tier: string
  status: string
  // Revenue
  monthlyFee: number
  totalRevenue: number
  // Costs
  directExpenses: number
  allocatedExpenses: number
  laborCost: number
  totalCosts: number
  // Profitability
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
  // Efficiency
  hoursWorked: number
  effectiveHourlyRate: number
  teamSize: number
}

// Only ACCOUNTS, MANAGER, SUPER_ADMIN can view profitability
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'MONTHLY' // MONTHLY, QUARTERLY, YEARLY
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    // Parse the month/year
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0)

    // Adjust for period
    let periodStartDate = startDate
    if (period === 'QUARTERLY') {
      const quarter = Math.floor((monthNum - 1) / 3)
      periodStartDate = new Date(year, quarter * 3, 1)
    } else if (period === 'YEARLY') {
      periodStartDate = new Date(year, 0, 1)
    }

    // Get all active clients
    const clients = await prisma.client.findMany({
      where: {
        status: { in: ['ACTIVE', 'ON_HOLD'] },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        tier: true,
        status: true,
        monthlyFee: true,
        teamMembers: {
          select: { userId: true },
        },
      },
    })

    // Get expense allocations for clients
    const expenseAllocations = await prisma.expenseAllocation.findMany({
      where: {
        clientId: { in: clients.map(c => c.id) },
      },
      include: {
        expense: {
          select: {
            amount: true,
            frequency: true,
            status: true,
          },
        },
      },
    })

    // Get work entries (hours worked per client)
    const workEntries = await prisma.workEntry.findMany({
      where: {
        clientId: { in: clients.map(c => c.id) },
        date: {
          gte: periodStartDate,
          lte: endDate,
        },
      },
      select: {
        clientId: true,
        hoursSpent: true,
        userId: true,
      },
    })

    // Get daily tasks hours per client
    const dailyTasks = await prisma.dailyTask.findMany({
      where: {
        clientId: { in: clients.map(c => c.id) },
        addedAt: {
          gte: periodStartDate,
          lte: endDate,
        },
      },
      select: {
        clientId: true,
        actualHours: true,
        plannedHours: true,
      },
    })

    // Get payment collections for revenue tracking
    const payments = await prisma.paymentCollection.findMany({
      where: {
        clientId: { in: clients.map(c => c.id) },
        collectedAt: {
          gte: periodStartDate,
          lte: endDate,
        },
        status: 'CONFIRMED',
      },
      select: {
        clientId: true,
        netAmount: true,
      },
    })

    // Average hourly labor cost (configurable, default Rs 500/hour)
    const HOURLY_LABOR_COST = 500

    // Calculate profitability per client
    const profitabilityData: ClientProfitability[] = clients.map(client => {
      // Revenue
      const monthlyFee = client.monthlyFee || 0
      const periodMonths = period === 'YEARLY' ? 12 : period === 'QUARTERLY' ? 3 : 1
      const expectedRevenue = monthlyFee * periodMonths
      const actualPayments = payments
        .filter(p => p.clientId === client.id)
        .reduce((sum, p) => sum + (p.netAmount || 0), 0)
      const totalRevenue = actualPayments || expectedRevenue

      // Direct expenses (allocated expenses)
      const clientAllocations = expenseAllocations.filter(a => a.clientId === client.id)
      const allocatedExpenses = clientAllocations.reduce((sum, alloc) => {
        if (alloc.expense.status !== 'ACTIVE') return sum
        const monthlyAmount = calculateMonthlyAmount(alloc.expense.amount, alloc.expense.frequency)
        const allocatedAmount = alloc.fixedAmount || (monthlyAmount * alloc.percentage / 100)
        return sum + (allocatedAmount * periodMonths)
      }, 0)

      // Labor cost (hours * hourly rate)
      const workHours = workEntries
        .filter(w => w.clientId === client.id)
        .reduce((sum, w) => sum + (w.hoursSpent || 0), 0)
      const taskHours = dailyTasks
        .filter(t => t.clientId === client.id)
        .reduce((sum, t) => sum + (t.actualHours || t.plannedHours || 0), 0)
      const totalHours = workHours + taskHours
      const laborCost = totalHours * HOURLY_LABOR_COST

      // Total costs
      const totalCosts = allocatedExpenses + laborCost

      // Profitability calculations
      const grossProfit = totalRevenue - allocatedExpenses
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const netProfit = totalRevenue - totalCosts
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

      // Efficiency metrics
      const effectiveHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0
      const teamSize = client.teamMembers.length

      return {
        clientId: client.id,
        clientName: client.name,
        tier: client.tier,
        status: client.status,
        monthlyFee,
        totalRevenue,
        directExpenses: 0, // Could be expanded with direct expense tracking
        allocatedExpenses,
        laborCost,
        totalCosts,
        grossProfit,
        grossMargin: Math.round(grossMargin * 10) / 10,
        netProfit,
        netMargin: Math.round(netMargin * 10) / 10,
        hoursWorked: Math.round(totalHours * 10) / 10,
        effectiveHourlyRate: Math.round(effectiveHourlyRate),
        teamSize,
      }
    })

    // Sort by net profit descending
    profitabilityData.sort((a, b) => b.netProfit - a.netProfit)

    // Calculate summary
    const summary = {
      totalClients: profitabilityData.length,
      totalRevenue: profitabilityData.reduce((sum, c) => sum + c.totalRevenue, 0),
      totalCosts: profitabilityData.reduce((sum, c) => sum + c.totalCosts, 0),
      totalProfit: profitabilityData.reduce((sum, c) => sum + c.netProfit, 0),
      averageMargin: profitabilityData.length > 0
        ? profitabilityData.reduce((sum, c) => sum + c.netMargin, 0) / profitabilityData.length
        : 0,
      profitableClients: profitabilityData.filter(c => c.netProfit > 0).length,
      unprofitableClients: profitabilityData.filter(c => c.netProfit < 0).length,
      topPerformer: profitabilityData[0]?.clientName || 'N/A',
      highestMargin: Math.max(...profitabilityData.map(c => c.netMargin), 0),
      lowestMargin: Math.min(...profitabilityData.map(c => c.netMargin), 0),
    }

    return NextResponse.json({
      clients: profitabilityData,
      summary,
      period: {
        type: period,
        start: periodStartDate.toISOString(),
        end: endDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch profitability data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profitability data' },
      { status: 500 }
    )
  }
}, { roles: ['ACCOUNTS', 'MANAGER', 'SUPER_ADMIN'] })

// Helper to calculate monthly amount from different frequencies
function calculateMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'DAILY':
      return amount * 30
    case 'WEEKLY':
      return amount * 4.33
    case 'MONTHLY':
      return amount
    case 'QUARTERLY':
      return amount / 3
    case 'HALF_YEARLY':
      return amount / 6
    case 'YEARLY':
    case 'ANNUAL':
      return amount / 12
    default:
      return amount
  }
}
