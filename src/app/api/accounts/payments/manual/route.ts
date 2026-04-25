import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { parseMoney } from '@/shared/utils/money'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const manualPaymentSchema = z.object({
  proposalId: z.string().optional(),
  clientId: z.string().min(1),
  amount: z.union([z.string().min(1), z.number()]),
  paymentMethod: z.string().optional(),
  transactionRef: z.string().optional(),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
})

// POST - Record manual/offline payment
export const POST = withAuth(async (req, { user, params }) => {
  try {
const raw = await req.json()
    const parsed = manualPaymentSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      proposalId,
      clientId,
      amount,
      paymentMethod,
      transactionRef,
      paymentDate,
      notes,
    } = parsed.data

    // Get client and proposal
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for duplicate payments (same client, similar amount within 3 days)
    const parsedAmountForCheck = typeof amount === 'string' ? parseFloat(amount) : amount
    const checkDate = paymentDate ? new Date(paymentDate) : new Date()
    const dupStart = new Date(checkDate)
    dupStart.setDate(dupStart.getDate() - 3)
    const dupEnd = new Date(checkDate)
    dupEnd.setDate(dupEnd.getDate() + 3)

    // Also check around "now" to catch backdated duplicate entries
    const nowStart = new Date()
    nowStart.setDate(nowStart.getDate() - 3)
    const nowEnd = new Date()
    nowEnd.setDate(nowEnd.getDate() + 1)

    const existingPayments = await prisma.clientLedger.findMany({
      where: {
        clientId,
        type: 'CREDIT',
        OR: [
          { createdAt: { gte: dupStart, lte: dupEnd } },
          { createdAt: { gte: nowStart, lte: nowEnd } },
        ],
      },
      select: { amount: true, referenceId: true },
    })

    const potentialDuplicate = existingPayments.find(p => {
      const tolerance = parsedAmountForCheck * 0.01
      const amountMatch = Math.abs(p.amount - parsedAmountForCheck) <= tolerance
      const refMatch = transactionRef && p.referenceId === transactionRef
      return amountMatch || refMatch
    })

    if (potentialDuplicate) {
      return NextResponse.json({
        error: 'Potential duplicate payment detected. A similar payment was recorded recently.',
        duplicate: { amount: potentialDuplicate.amount, referenceId: potentialDuplicate.referenceId },
      }, { status: 409 })
    }

    let proposal: Awaited<ReturnType<typeof prisma.clientProposal.findUnique>> = null
    if (proposalId) {
      proposal = await prisma.clientProposal.findUnique({
        where: { id: proposalId },
      })
    } else if (client.proposalId) {
      proposal = await prisma.clientProposal.findUnique({
        where: { id: client.proposalId },
      })
    }

    // Process payment in transaction
    await prisma.$transaction(async (tx) => {
      // Update invoice if exists - compare payment against invoice total
      if (proposal?.invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: proposal.invoiceId },
          select: { total: true },
        })

        // Sum all existing payments for this invoice
        const existingPayments = await tx.clientLedger.findMany({
          where: { clientId, type: 'CREDIT', category: 'PAYMENT' },
          select: { amount: true },
        })
        const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0) + parsedAmountForCheck
        const invoiceTotal = invoice?.total || 0

        const invoiceStatus = totalPaid >= invoiceTotal ? 'PAID' : 'PARTIAL'
        await tx.invoice.update({
          where: { id: proposal.invoiceId },
          data: {
            status: invoiceStatus,
            ...(invoiceStatus === 'PAID' ? { paidAt: paymentDate ? new Date(paymentDate) : new Date() } : {}),
          },
        })
      }

      // Update client - only set to ONBOARDING if not already ACTIVE
      const clientUpdateData: Record<string, unknown> = {
        paymentConfirmedAt: new Date(),
        initialPaymentConfirmed: true,
        initialPaymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        ledgerStartedAt: client.ledgerStartedAt || new Date(),
      }

      // Only transition to ONBOARDING if client hasn't been onboarded yet
      if (!['ACTIVE', 'ONBOARDING'].includes(client.status)) {
        clientUpdateData.status = 'ONBOARDING'
        clientUpdateData.onboardingStatus = 'IN_PROGRESS'
      }

      await tx.client.update({
        where: { id: clientId },
        data: clientUpdateData,
      })

      // Update proposal if exists
      if (proposal) {
        await tx.clientProposal.update({
          where: { id: proposal.id },
          data: { status: 'CONVERTED' },
        })
      }

      // Get last ledger balance
      const lastEntry = await tx.clientLedger.findFirst({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        select: { balance: true },
      })
      const previousBalance = lastEntry?.balance || 0
      const parsedAmount = parseMoney(amount)
      const newBalance = previousBalance - parsedAmount // CREDIT reduces balance owed

      // Create ledger entry
      await tx.clientLedger.create({
        data: {
          clientId,
          type: 'CREDIT',
          category: 'PAYMENT',
          description: `${paymentMethod || 'Manual'} payment - ${transactionRef || 'No ref'}${notes ? ` - ${notes}` : ''}`,
          amount: parsedAmount,
          balance: newBalance,
          referenceId: transactionRef,
          recordedBy: user.id,
        },
      })

      // Create or update onboarding checklist
      const existingChecklist = await tx.clientOnboardingChecklist.findUnique({
        where: { clientId },
      })

      if (existingChecklist) {
        await tx.clientOnboardingChecklist.update({
          where: { clientId },
          data: {
            invoicePaid: true,
            invoicePaidAt: new Date(),
          },
        })
      } else if (proposal) {
        await tx.clientOnboardingChecklist.create({
          data: {
            clientId,
            selectedServices: proposal.selectedServices,
            scopeItems: proposal.selectedScope,
            invoicePaid: true,
            invoicePaidAt: new Date(),
            status: 'PENDING',
          },
        })
      }

      // Create lifecycle event
      await tx.clientLifecycleEvent.create({
        data: {
          clientId,
          fromStage: client.status || 'ONBOARDING',
          toStage: client.status === 'ACTIVE' ? 'ACTIVE' : 'ONBOARDING',
          triggeredBy: 'MANUAL_PAYMENT',
          notes: `Manual payment recorded by ${user.firstName || user.id}. Amount: Rs.${amount}`,
        },
      })

      // Notify operations team
      const opsUsers = await tx.user.findMany({
        where: {
          OR: [
            { department: 'OPERATIONS' },
            { role: 'MANAGER' },
          ]
        },
        select: { id: true }
      })

      if (opsUsers.length > 0) {
        await tx.notification.createMany({
          data: opsUsers.map(user => ({
            userId: user.id,
            type: 'NEW_CLIENT_ONBOARDING',
            title: 'New Client Ready for Onboarding',
            message: `${client.name} payment confirmed. Ready for onboarding.`,
            link: `/operations/onboarding/${clientId}`,
          }))
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to record manual payment:', error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }
})
