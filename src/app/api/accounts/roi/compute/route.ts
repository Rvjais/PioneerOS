import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'
import {
  ROI_CONFIG,
  getServiceCodeFromDepartment,
  parseClientServices,
  getTotalServiceCount,
  countServicesForDepartment
} from '@/shared/constants/config/accounts'

const computeRoiSchema = z.object({
  month: z.string().min(1),
})

const DEPARTMENTS = ROI_CONFIG.TRACKED_DEPARTMENTS

// POST /api/accounts/roi/compute - Compute ROI for a specific month
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = computeRoiSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { month } = parsed.data

    const monthDate = new Date(`${month}-01`)
    const nextMonth = new Date(monthDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const results: Array<{
      id: string
      department: string
      month: string
      baseSalaryComponent: number
      rbcComponent: number
      totalSalaryComponent: number
      toolsExpense: number
      freelancerExpense: number
      miscExpense: number
      totalExpense: number
      attributedRevenue: number
      clientCount: number
      roi: number | null
      costPerClient: number | null
      revenuePerClient: number | null
      calculatedAt: string | undefined
      createdAt: string
      updatedAt: string
      calculatedBy: string | null
      notes: string | null
    }> = []

    for (const department of DEPARTMENTS) {
      // Get salary allocation from HR (if verified)
      const salaryAllocation = await prisma.departmentSalaryAllocation.findUnique({
        where: {
          department_month: { department, month: monthDate }
        }
      })

      // Get active clients with this department's services
      const serviceCode = getServiceCodeFromDepartment(department)
      const clients = await prisma.client.findMany({
        where: {
          status: 'ACTIVE',
          services: { contains: serviceCode },
          deletedAt: null,
        },
        select: {
          id: true,
          services: true,
          monthlyFee: true,
          paymentCollections: {
            where: {
              retainerMonth: { gte: monthDate, lt: nextMonth },
              status: 'CONFIRMED'
            },
            select: { grossAmount: true }
          }
        }
      })

      // Calculate attributed revenue (from actual payments)
      // Revenue is split proportionally based on number of services client has
      const attributedRevenue = clients.reduce((sum, client) => {
        const clientPayments = client.paymentCollections.reduce((s, p) => s + p.grossAmount, 0)
        // Get actual service count from client.services
        const totalServices = getTotalServiceCount(client.services || '')
        // Attribute proportionally if client has multiple services
        const attribution = totalServices > 0 ? clientPayments / totalServices : clientPayments
        return sum + attribution
      }, 0)

      // Get existing expense record or create new one
      const existingExpense = await prisma.departmentExpense.findUnique({
        where: {
          department_month: { department, month: monthDate }
        }
      })

      // Use salary allocation if verified, otherwise use existing or 0
      const baseSalaryComponent = salaryAllocation?.isVerified
        ? salaryAllocation.totalBaseSalary
        : (existingExpense?.baseSalaryComponent || 0)

      const rbcComponent = salaryAllocation?.isVerified
        ? salaryAllocation.totalRBCAllocation
        : (existingExpense?.rbcComponent || 0)

      const totalSalaryComponent = baseSalaryComponent + rbcComponent

      // Get other expenses (tools, freelancer, misc) from existing record
      const toolsExpense = existingExpense?.toolsExpense || 0
      const freelancerExpense = existingExpense?.freelancerExpense || 0
      const miscExpense = existingExpense?.miscExpense || 0

      const totalExpense = totalSalaryComponent + toolsExpense + freelancerExpense + miscExpense
      const clientCount = clients.length

      // Calculate metrics
      const roi = totalExpense > 0 ? ((attributedRevenue - totalExpense) / totalExpense) * 100 : null
      const costPerClient = clientCount > 0 ? totalExpense / clientCount : null
      const revenuePerClient = clientCount > 0 ? attributedRevenue / clientCount : null

      // Upsert department expense
      const expense = await prisma.departmentExpense.upsert({
        where: {
          department_month: { department, month: monthDate }
        },
        update: {
          baseSalaryComponent,
          rbcComponent,
          totalSalaryComponent,
          totalExpense,
          attributedRevenue,
          clientCount,
          roi,
          costPerClient,
          revenuePerClient,
          calculatedAt: new Date(),
          calculatedBy: user.id
        },
        create: {
          department,
          month: monthDate,
          baseSalaryComponent,
          rbcComponent,
          totalSalaryComponent,
          toolsExpense,
          freelancerExpense,
          miscExpense,
          totalExpense,
          attributedRevenue,
          clientCount,
          roi,
          costPerClient,
          revenuePerClient,
          calculatedAt: new Date(),
          calculatedBy: user.id
        }
      })

      results.push({
        ...expense,
        month: expense.month.toISOString(),
        calculatedAt: expense.calculatedAt?.toISOString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString()
      })
    }

    // Calculate overall summary
    const totalRevenue = results.reduce((sum, r) => sum + r.attributedRevenue, 0)
    const totalExpenseSum = results.reduce((sum, r) => sum + r.totalExpense, 0)
    const overallROI = totalExpenseSum > 0 ? ((totalRevenue - totalExpenseSum) / totalExpenseSum) * 100 : 0

    return NextResponse.json({
      results,
      summary: {
        month,
        totalRevenue,
        totalExpense: totalExpenseSum,
        overallROI: Math.round(overallROI * 100) / 100,
        departmentsComputed: results.length
      }
    })
  } catch (error) {
    console.error('Failed to compute ROI:', error)
    return NextResponse.json({ error: 'Failed to compute ROI' }, { status: 500 })
  }
})

// Note: Service mapping and counting now handled by lib/config/accounts.ts
// - getServiceCodeFromDepartment(department) replaces mapDepartmentToService
// - getTotalServiceCount(servicesString) replaces countServices
// - parseClientServices(servicesString) for parsing service strings
