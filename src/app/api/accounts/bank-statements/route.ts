import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const bankStatementCreateSchema = z.object({
  entityId: z.string().min(1, 'Entity ID is required').max(100),
  bankName: z.string().min(1, 'Bank name is required').max(200).regex(/^[a-zA-Z0-9\s\-&().]+$/, 'Bank name contains invalid characters'),
  accountType: z.string().min(1, 'Account type is required').max(50),
  accountNumber: z.string().max(50).optional().nullable(),
  statementMonth: z.string().min(1, 'Statement month is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid statement month date format' }
  ),
  fileName: z.string().min(1, 'File name is required').max(500),
  fileUrl: z.string().url('Invalid file URL').max(1000).optional().nullable(),
  openingBalance: z.number().min(-1e12, 'Opening balance out of range').max(1e12, 'Opening balance out of range').optional().nullable(),
  closingBalance: z.number().min(-1e12, 'Closing balance out of range').max(1e12, 'Closing balance out of range').optional().nullable(),
})

// GET /api/accounts/bank-statements - List all bank statements with filters
export const GET = withAuth(async (req, { user, params }) => {
  try {
// Check if user has accounts access
    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const entityId = searchParams.get('entityId')
    const bankName = searchParams.get('bankName')
    const accountType = searchParams.get('accountType')
    const month = searchParams.get('month') // Format: YYYY-MM
    const status = searchParams.get('status')

    const where: Prisma.BankStatementWhereInput = {}
    if (entityId) where.entityId = entityId
    if (bankName) where.bankName = bankName
    if (accountType) where.accountType = accountType
    if (status) where.status = status
    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      where.statementMonth = { gte: startDate, lt: endDate }
    }

    const statements = await prisma.bankStatement.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { statementMonth: 'desc' }
    })

    // Calculate summary stats
    const summary = {
      total: statements.length,
      processed: statements.filter(s => s.status === 'PROCESSED').length,
      pending: statements.filter(s => s.status === 'UPLOADED').length,
      failed: statements.filter(s => s.status === 'FAILED').length,
      totalCredits: statements.reduce((sum, s) => sum + (s.totalCredits || 0), 0),
      totalDebits: statements.reduce((sum, s) => sum + (s.totalDebits || 0), 0)
    }

    return NextResponse.json({
      statements: statements.map(s => ({
        ...s,
        statementMonth: s.statementMonth.toISOString(),
        processedAt: s.processedAt?.toISOString(),
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        transactionCount: s._count.transactions
      })),
      summary
    })
  } catch (error) {
    console.error('Failed to fetch bank statements:', error)
    return NextResponse.json({ error: 'Failed to fetch bank statements' }, { status: 500 })
  }
})

// POST /api/accounts/bank-statements - Upload a new bank statement
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Check if user has accounts access
    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = bankStatementCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const {
      entityId,
      bankName,
      accountType,
      accountNumber,
      statementMonth,
      fileName,
      fileUrl,
      openingBalance,
      closingBalance
    } = result.data

    // Check if statement already exists for this month/bank/entity
    const existing = await prisma.bankStatement.findFirst({
      where: {
        entityId,
        bankName,
        statementMonth: new Date(statementMonth)
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A statement for this bank and month already exists' },
        { status: 409 }
      )
    }

    const statement = await prisma.bankStatement.create({
      data: {
        entityId,
        bankName,
        accountType,
        accountNumber,
        statementMonth: new Date(statementMonth),
        fileName,
        fileUrl,
        openingBalance,
        closingBalance,
        status: 'UPLOADED',
        uploadedBy: user.id
      }
    })

    return NextResponse.json({
      statement: {
        ...statement,
        statementMonth: statement.statementMonth.toISOString(),
        createdAt: statement.createdAt.toISOString(),
        updatedAt: statement.updatedAt.toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create bank statement:', error)
    return NextResponse.json({ error: 'Failed to create bank statement' }, { status: 500 })
  }
})
