import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/accounts/roi/departments - Get department ROI summary
export const GET = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // Format: YYYY-MM
    const department = searchParams.get('department')

    const where: Prisma.DepartmentExpenseWhereInput = {}
    if (department) where.department = department
    if (month) {
      where.month = new Date(`${month}-01`)
    }

    const expenses = await prisma.departmentExpense.findMany({
      where,
      orderBy: [{ month: 'desc' }, { department: 'asc' }]
    })

    // Get salary allocations for reference (only shows aggregated data)
    const salaryAllocations = await prisma.departmentSalaryAllocation.findMany({
      where: month ? { month: new Date(`${month}-01`) } : {},
      orderBy: { department: 'asc' }
    })

    // Calculate overall metrics
    const totalRevenue = expenses.reduce((sum, e) => sum + e.attributedRevenue, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.totalExpense, 0)
    const overallROI = totalExpense > 0 ? ((totalRevenue - totalExpense) / totalExpense) * 100 : 0

    // Group by department for summary
    const departmentSummary = expenses.reduce((acc, e) => {
      if (!acc[e.department]) {
        acc[e.department] = {
          department: e.department,
          totalRevenue: 0,
          totalExpense: 0,
          avgROI: 0,
          dataPoints: 0
        }
      }
      acc[e.department].totalRevenue += e.attributedRevenue
      acc[e.department].totalExpense += e.totalExpense
      acc[e.department].dataPoints += 1
      if (e.roi !== null) {
        acc[e.department].avgROI = (acc[e.department].avgROI * (acc[e.department].dataPoints - 1) + e.roi) / acc[e.department].dataPoints
      }
      return acc
    }, {} as Record<string, { department: string; totalRevenue: number; totalExpense: number; avgROI: number; dataPoints: number }>)

    return NextResponse.json({
      expenses: expenses.map(e => ({
        ...e,
        month: e.month.toISOString(),
        calculatedAt: e.calculatedAt?.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      })),
      salaryAllocations: salaryAllocations.map(s => ({
        ...s,
        month: s.month.toISOString(),
        verifiedAt: s.verifiedAt?.toISOString(),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString()
      })),
      summary: {
        totalRevenue,
        totalExpense,
        overallROI: Math.round(overallROI * 100) / 100,
        departmentSummary: Object.values(departmentSummary)
      }
    })
  } catch (error) {
    console.error('Failed to fetch department ROI:', error)
    return NextResponse.json({ error: 'Failed to fetch department ROI' }, { status: 500 })
  }
})
