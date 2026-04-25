import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'
import {
  roundMoney,
  addMoney,
  subtractMoney,
  divideMoney,
  multiplyMoney,
  calculatePercentage,
} from '@/shared/utils/money'
import { TDS_PERCENTAGE, DEFAULT_MONTHLY_SALARY } from '@/shared/constants/hr'

const createSchema = z.object({
  exitProcessId: z.string().min(1, 'Exit process ID is required'),
  customLineItems: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
        amount: z.number().min(0),
        isDeduction: z.boolean(),
      })
    )
    .optional(),
})

// ---------- GET /api/hr/fnf ----------
export const GET = withAuth(async (req, { user, params }) => {
  try {
const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR', 'ACCOUNTS', 'OPERATIONS_HEAD', 'OM']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Department-scope MANAGER: only see settlements for employees in their own department
    const managerDeptFilter = user.role === 'MANAGER' ? { user: { department: user.department } } : {}

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const employeeSearch = searchParams.get('search')

    const settlements = await prisma.fnFSettlement.findMany({
      where: {
        ...(status && status !== 'all' ? { status } : {}),
        ...managerDeptFilter,
        ...(employeeSearch
          ? {
              user: {
                OR: [
                  { firstName: { contains: employeeSearch, mode: 'insensitive' as const } },
                  { lastName: { contains: employeeSearch, mode: 'insensitive' as const } },
                  { empId: { contains: employeeSearch, mode: 'insensitive' as const } },
                ],
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            empId: true,
            firstName: true,
            lastName: true,
            department: true,
            email: true,
            joiningDate: true,
          },
        },
        exitProcess: {
          select: {
            id: true,
            type: true,
            noticeDate: true,
            lastWorkingDate: true,
            status: true,
          },
        },
        lineItems: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(settlements)
  } catch (error) {
    console.error('Failed to fetch FnF settlements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// ---------- POST /api/hr/fnf ----------
export const POST = withAuth(async (req, { user, params }) => {
  try {
const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'HR']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = createSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { exitProcessId, customLineItems } = result.data

    // Validate exit process exists and has no settlement yet
    const exitProcess = await prisma.exitProcess.findUnique({
      where: { id: exitProcessId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            joiningDate: true,
            department: true,
          },
        },
        settlement: true,
      },
    })

    if (!exitProcess) {
      return NextResponse.json({ error: 'Exit process not found' }, { status: 404 })
    }

    if (exitProcess.settlement) {
      return NextResponse.json(
        { error: 'A settlement already exists for this exit process' },
        { status: 400 }
      )
    }

    // Department-scope MANAGER: can only create settlements for employees in their own department
    if (user.role === 'MANAGER' && exitProcess.user.department !== user.department) {
      return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
    }

    const userId = exitProcess.userId

    // ---- Auto-calculate line items ----
    const lineItems: { type: string; description: string; amount: number; isDeduction: boolean }[] =
      []

    // 1. SALARY_DUES: estimate remaining salary based on notice period
    // Calculate days remaining in notice period from today to last working day
    const today = new Date()
    const lastWorkingDate = exitProcess.lastWorkingDate || today
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (lastWorkingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
    )

    // Use DepartmentBaseline baseSalary as a reference if available, else default 30000
    const baseline = await prisma.departmentBaseline.findUnique({
      where: { department: exitProcess.user.department },
    })

    const monthlySalary = baseline?.baseSalary || DEFAULT_MONTHLY_SALARY
    const dailyRate = roundMoney(divideMoney(monthlySalary, 30))
    const salaryDues = roundMoney(multiplyMoney(dailyRate, daysRemaining))

    if (salaryDues > 0) {
      lineItems.push({
        type: 'SALARY_DUES',
        description: `Salary for ${daysRemaining} remaining day(s) @ ${dailyRate}/day`,
        amount: salaryDues,
        isDeduction: false,
      })
    }

    // 2. LEAVE_ENCASHMENT: remaining PL balance x daily rate
    const currentYear = new Date().getFullYear()
    const leaveBalance = await prisma.leaveBalance.findFirst({
      where: {
        userId,
        type: 'PL',
        year: currentYear,
        remaining: { gt: 0 },
      },
    })

    if (leaveBalance && leaveBalance.remaining > 0) {
      const leaveEncashment = roundMoney(multiplyMoney(leaveBalance.remaining, dailyRate))
      lineItems.push({
        type: 'LEAVE_ENCASHMENT',
        description: `${leaveBalance.remaining} PL day(s) encashment @ ${dailyRate}/day`,
        amount: leaveEncashment,
        isDeduction: false,
      })
    }

    // 3. Custom line items from the request
    if (customLineItems && customLineItems.length > 0) {
      for (const item of customLineItems) {
        lineItems.push({
          type: item.type,
          description: item.description,
          amount: roundMoney(item.amount),
          isDeduction: item.isDeduction,
        })
      }
    }

    // 4. TDS: 10% on total earnings
    const totalEarnings = lineItems
      .filter((li) => !li.isDeduction)
      .reduce((sum, li) => addMoney(sum, li.amount), 0)

    const tdsAmount = roundMoney(calculatePercentage(totalEarnings, TDS_PERCENTAGE))
    if (tdsAmount > 0) {
      lineItems.push({
        type: 'TDS',
        description: `TDS @ ${TDS_PERCENTAGE}% on total earnings`,
        amount: tdsAmount,
        isDeduction: true,
      })
    }

    // Compute totals
    const totalDeductions = lineItems
      .filter((li) => li.isDeduction)
      .reduce((sum, li) => addMoney(sum, li.amount), 0)

    const netPayable = roundMoney(subtractMoney(totalEarnings, totalDeductions))

    // Create settlement + line items in a transaction
    const settlement = await prisma.$transaction(async (tx) => {
      const s = await tx.fnFSettlement.create({
        data: {
          userId,
          exitProcessId,
          status: 'DRAFT',
          totalAmount: roundMoney(totalEarnings),
          netPayable: Math.max(0, netPayable),
          lineItems: {
            create: lineItems.map((li) => ({
              type: li.type,
              description: li.description,
              amount: li.amount,
              isDeduction: li.isDeduction,
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              empId: true,
              firstName: true,
              lastName: true,
              department: true,
            },
          },
          exitProcess: {
            select: { id: true, type: true, lastWorkingDate: true },
          },
          lineItems: { orderBy: { createdAt: 'asc' } },
        },
      })
      return s
    })

    return NextResponse.json(settlement)
  } catch (error) {
    console.error('Failed to create FnF settlement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
