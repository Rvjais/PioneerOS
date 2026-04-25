import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { parseAndMatchTransactions, validateStatementText } from '@/server/ai/bankStatementParser'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const processStatementSchema = z.object({
  statementText: z.string().min(1),
})

// POST /api/accounts/bank-statements/[id]/process - Process statement with pasted text
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = processStatementSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { statementText } = parsed.data

    // Get statement
    const statement = await prisma.bankStatement.findUnique({
      where: { id }
    })

    if (!statement) {
      return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
    }

    if (statement.status === 'PROCESSING') {
      return NextResponse.json({ error: 'Statement is already being processed' }, { status: 409 })
    }

    const validation = validateStatementText(statementText)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    // Update status to processing
    await prisma.bankStatement.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        processingError: null
      }
    })

    try {
      // Parse and match transactions
      const result = await parseAndMatchTransactions(id, statementText)

      if (!result.success) {
        // Update statement to failed state
        await prisma.bankStatement.update({
          where: { id },
          data: {
            status: 'FAILED',
            processingError: result.errors.join('; ')
          }
        })

        return NextResponse.json({
          success: false,
          errors: result.errors
        }, { status: 400 })
      }

      // Fetch updated statement
      const updatedStatement = await prisma.bankStatement.findUnique({
        where: { id }
      })

      return NextResponse.json({
        success: true,
        statement: updatedStatement ? {
          ...updatedStatement,
          statementMonth: updatedStatement.statementMonth.toISOString(),
          processedAt: updatedStatement.processedAt?.toISOString(),
          createdAt: updatedStatement.createdAt.toISOString(),
          updatedAt: updatedStatement.updatedAt.toISOString()
        } : null,
        summary: result.summary,
        transactions: result.transactions.map(t => ({
          ...t,
          date: t.date.toISOString()
        }))
      })
    } catch (processingError) {
      // Update statement to failed state
      await prisma.bankStatement.update({
        where: { id },
        data: {
          status: 'FAILED',
          processingError: processingError instanceof Error ? processingError.message : 'Unknown error'
        }
      })
      throw processingError
    }
  } catch (error) {
    console.error('Failed to process bank statement:', error)
    return NextResponse.json({ error: 'Failed to process bank statement' }, { status: 500 })
  }
})
