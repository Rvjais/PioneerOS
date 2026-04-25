import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createDeptExpenseSchema = z.object({
  department: z.string().min(1),
  month: z.string().min(1),
  toolsExpense: z.number().optional(),
  freelancerExpense: z.number().optional(),
  miscExpense: z.number().optional(),
  notes: z.string().optional(),
})

const updateSalarySchema = z.object({
  department: z.string().min(1),
  month: z.string().min(1),
  headCount: z.number().optional(),
  totalBaseSalary: z.number().optional(),
  totalRBCAllocation: z.number().optional(),
  isVerified: z.boolean().optional(),
})

// GET /api/accounts/expenses/departments - List department expenses
export const GET = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')
    const month = searchParams.get('month') // Format: YYYY-MM
    const year = searchParams.get('year')

    const where: Prisma.DepartmentExpenseWhereInput = {}
    if (department) where.department = department
    if (month) where.month = new Date(`${month}-01`)
    if (year) {
      const startYear = new Date(`${year}-01-01`)
      const endYear = new Date(`${parseInt(year) + 1}-01-01`)
      where.month = { gte: startYear, lt: endYear }
    }

    const expenses = await prisma.departmentExpense.findMany({
      where,
      orderBy: [{ month: 'desc' }, { department: 'asc' }]
    })

    // Group by department for chart data
    const byDepartment = expenses.reduce((acc, e) => {
      if (!acc[e.department]) acc[e.department] = []
      acc[e.department].push({
        month: e.month.toISOString().slice(0, 7),
        revenue: e.attributedRevenue,
        expense: e.totalExpense,
        roi: e.roi,
        clientCount: e.clientCount
      })
      return acc
    }, {} as Record<string, { month: string; revenue: number; expense: number; roi: number | null; clientCount: number }[]>)

    return NextResponse.json({
      expenses: expenses.map(e => ({
        ...e,
        month: e.month.toISOString(),
        calculatedAt: e.calculatedAt?.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString()
      })),
      byDepartment
    })
  } catch (error) {
    console.error('Failed to fetch department expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch department expenses' }, { status: 500 })
  }
})

// POST /api/accounts/expenses/departments - Create/Update department expense
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createDeptExpenseSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      department,
      month,
      toolsExpense,
      freelancerExpense,
      miscExpense,
      notes
    } = parsed.data

    const monthDate = new Date(`${month}-01`)

    // Check if expense exists
    const existing = await prisma.departmentExpense.findUnique({
      where: {
        department_month: { department, month: monthDate }
      }
    })

    // Calculate totals
    const tools = toolsExpense ?? (existing?.toolsExpense || 0)
    const freelancer = freelancerExpense ?? (existing?.freelancerExpense || 0)
    const misc = miscExpense ?? (existing?.miscExpense || 0)
    const baseSalary = existing?.baseSalaryComponent || 0
    const rbc = existing?.rbcComponent || 0
    const totalSalary = baseSalary + rbc
    const totalExpense = totalSalary + tools + freelancer + misc

    // Calculate ROI if we have revenue
    const revenue = existing?.attributedRevenue || 0
    const roi = totalExpense > 0 ? ((revenue - totalExpense) / totalExpense) * 100 : null

    const expense = await prisma.departmentExpense.upsert({
      where: {
        department_month: { department, month: monthDate }
      },
      update: {
        ...(toolsExpense !== undefined && { toolsExpense }),
        ...(freelancerExpense !== undefined && { freelancerExpense }),
        ...(miscExpense !== undefined && { miscExpense }),
        totalExpense,
        roi,
        ...(notes && { notes })
      },
      create: {
        department,
        month: monthDate,
        toolsExpense: tools,
        freelancerExpense: freelancer,
        miscExpense: misc,
        totalExpense,
        notes
      }
    })

    return NextResponse.json({
      expense: {
        ...expense,
        month: expense.month.toISOString(),
        calculatedAt: expense.calculatedAt?.toISOString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString()
      }
    }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Failed to save department expense:', error)
    return NextResponse.json({ error: 'Failed to save department expense' }, { status: 500 })
  }
})

// PUT /api/accounts/expenses/departments - Update salary allocation (HR only)
export const PUT = withAuth(async (req, { user, params }) => {
  try {
// Only HR or SUPER_ADMIN can update salary allocations
    const hasAccess = ['SUPER_ADMIN'].includes(user.role) ||
                      user.department === 'HR'
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden - Only HR can update salary allocations' },
        { status: 403 }
      )
    }

    const rawPut = await req.json()
    const parsedPut = updateSalarySchema.safeParse(rawPut)
    if (!parsedPut.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsedPut.error.flatten() }, { status: 400 })
    }
    const {
      department,
      month,
      headCount,
      totalBaseSalary,
      totalRBCAllocation,
      isVerified
    } = parsedPut.data

    const monthDate = new Date(`${month}-01`)

    const allocation = await prisma.departmentSalaryAllocation.upsert({
      where: {
        department_month: { department, month: monthDate }
      },
      update: {
        ...(headCount !== undefined && { headCount }),
        ...(totalBaseSalary !== undefined && { totalBaseSalary }),
        ...(totalRBCAllocation !== undefined && { totalRBCAllocation }),
        ...(isVerified !== undefined && {
          isVerified,
          verifiedBy: isVerified ? user.id : null,
          verifiedAt: isVerified ? new Date() : null
        })
      },
      create: {
        department,
        month: monthDate,
        headCount: headCount || 0,
        totalBaseSalary: totalBaseSalary || 0,
        totalRBCAllocation: totalRBCAllocation || 0,
        isVerified: isVerified || false,
        ...(isVerified && {
          verifiedBy: user.id,
          verifiedAt: new Date()
        })
      }
    })

    // If verified, update the department expense with salary data
    if (allocation.isVerified) {
      await prisma.departmentExpense.upsert({
        where: {
          department_month: { department, month: monthDate }
        },
        update: {
          baseSalaryComponent: allocation.totalBaseSalary,
          rbcComponent: allocation.totalRBCAllocation,
          totalSalaryComponent: allocation.totalBaseSalary + allocation.totalRBCAllocation
        },
        create: {
          department,
          month: monthDate,
          baseSalaryComponent: allocation.totalBaseSalary,
          rbcComponent: allocation.totalRBCAllocation,
          totalSalaryComponent: allocation.totalBaseSalary + allocation.totalRBCAllocation
        }
      })
    }

    return NextResponse.json({
      allocation: {
        ...allocation,
        month: allocation.month.toISOString(),
        verifiedAt: allocation.verifiedAt?.toISOString(),
        createdAt: allocation.createdAt.toISOString(),
        updatedAt: allocation.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to save salary allocation:', error)
    return NextResponse.json({ error: 'Failed to save salary allocation' }, { status: 500 })
  }
})
