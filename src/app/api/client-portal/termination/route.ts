import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import {
  createTerminationRequest,
  cancelTerminationRequest,
  getActiveTermination,
  calculateFullProRata,
  calculateNoticeEndDate,
  getDaysElapsed,
  getNoticeProgress,
  formatCurrency,
  formatDate,
  NOTICE_PERIOD_DAYS,
  TERMINATION_STATUS_LABELS,
} from '@/server/services/termination'
import { z } from 'zod'

const terminationRequestSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(2000),
  feedback: z.string().max(5000).optional().nullable(),
})

// GET /api/client-portal/termination - Get current termination status
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Get active termination request if any
  const termination = await getActiveTermination(clientId)

  if (!termination) {
    // No active termination - return info for potential request
    const monthlyFee = user.client.monthlyFee || 0
    const noticeStartDate = new Date()
    const noticeEndDate = calculateNoticeEndDate(noticeStartDate)
    const proRataCalc = await calculateFullProRata(
      clientId,
      monthlyFee,
      noticeStartDate,
      noticeEndDate
    )

    return NextResponse.json({
      hasActiveTermination: false,
      client: {
        id: clientId,
        name: user.client.name,
        monthlyFee,
        startDate: user.client.startDate,
      },
      preview: {
        noticeStartDate: noticeStartDate.toISOString(),
        noticeEndDate: noticeEndDate.toISOString(),
        noticePeriodDays: NOTICE_PERIOD_DAYS,
        proRataBreakdown: proRataCalc.months,
        totalProRata: proRataCalc.totalProRata,
        pendingDues: proRataCalc.pendingDues,
        totalDue: proRataCalc.totalDue,
        formatted: {
          totalProRata: formatCurrency(proRataCalc.totalProRata),
          pendingDues: formatCurrency(proRataCalc.pendingDues),
          totalDue: formatCurrency(proRataCalc.totalDue),
        },
      },
    })
  }

  // Parse pro-rata breakdown if stored as JSON
  let proRataBreakdown = []
  try {
    if (termination.proRataBreakdown) {
      proRataBreakdown = JSON.parse(termination.proRataBreakdown)
    }
  } catch {
    // Ignore JSON parse errors
  }

  // Calculate timeline progress
  const daysElapsed = getDaysElapsed(termination.noticeStartDate)
  const progress = getNoticeProgress(termination.noticeStartDate, termination.noticeEndDate)

  // Compute status flags
  const balanceDue = termination.totalDue - termination.amountPaid
  const isPaid = balanceDue <= 0 || termination.paymentCleared
  const isNoticePeriodComplete = new Date() >= termination.noticeEndDate
  const canAccessHandover = isPaid && isNoticePeriodComplete

  return NextResponse.json({
    hasActiveTermination: true,
    termination: {
      id: termination.id,
      status: termination.status,
      statusLabel: TERMINATION_STATUS_LABELS[termination.status as keyof typeof TERMINATION_STATUS_LABELS] || termination.status,
      reason: termination.reason,
      feedback: termination.feedback,

      // Timeline
      noticeStartDate: termination.noticeStartDate.toISOString(),
      noticeEndDate: termination.noticeEndDate.toISOString(),
      lastServiceDate: termination.lastServiceDate.toISOString(),
      daysElapsed,
      daysRemaining: Math.max(0, NOTICE_PERIOD_DAYS - daysElapsed),
      progress,

      // Payment
      monthlyFee: termination.monthlyFee,
      proRataBreakdown,
      proRataAmount: termination.proRataAmount,
      pendingDues: termination.pendingDues,
      totalDue: termination.totalDue,
      totalProRata: termination.proRataAmount,
      amountPaid: termination.amountPaid,
      amountRemaining: balanceDue,
      paymentCleared: termination.paymentCleared,
      paymentClearedAt: termination.paymentClearedAt?.toISOString(),

      // Computed status flags
      isPaid,
      isNoticePeriodComplete,
      canAccessHandover,

      // Handover
      handoverCallScheduled: termination.handoverCallScheduled,
      handoverCallDate: termination.handoverCallDate?.toISOString(),
      handoverCallCompleted: termination.handoverCallCompleted,
      handoverCallNotes: termination.handoverCallNotes,

      // Data Export
      dataExportEnabled: termination.dataExportEnabled,
      dataExportedAt: termination.dataExportedAt?.toISOString(),
      dataExportUrl: termination.dataExportUrl,

      // Formatted values
      formatted: {
        noticeStartDate: formatDate(termination.noticeStartDate),
        noticeEndDate: formatDate(termination.noticeEndDate),
        lastServiceDate: formatDate(termination.lastServiceDate),
        monthlyFee: formatCurrency(termination.monthlyFee),
        proRataAmount: formatCurrency(termination.proRataAmount),
        totalProRata: formatCurrency(termination.proRataAmount),
        pendingDues: formatCurrency(termination.pendingDues),
        totalDue: formatCurrency(termination.totalDue),
        amountPaid: formatCurrency(termination.amountPaid),
        amountRemaining: formatCurrency(balanceDue),
        balanceDue: formatCurrency(balanceDue),
        handoverCallDate: termination.handoverCallDate
          ? formatDate(termination.handoverCallDate)
          : null,
      },

      requestedAt: termination.requestedAt.toISOString(),
      createdAt: termination.createdAt.toISOString(),
    },
    client: {
      id: clientId,
      name: user.client.name,
      monthlyFee: user.client.monthlyFee,
      startDate: user.client.startDate,
    },
  })
}, { rateLimit: 'READ' })

// POST /api/client-portal/termination - Request service termination
export const POST = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const parsed = terminationRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { reason, feedback } = parsed.data

  const termination = await createTerminationRequest({
    clientId: user.clientId,
    requestedBy: user.id,
    reason,
    feedback: feedback ?? undefined,
  })

  // Parse pro-rata breakdown
  let proRataBreakdown = []
  try {
    if (termination.proRataBreakdown) {
      proRataBreakdown = JSON.parse(termination.proRataBreakdown)
    }
  } catch {
    // Ignore JSON parse errors
  }

  return NextResponse.json({
    success: true,
    termination: {
      id: termination.id,
      status: termination.status,
      noticeStartDate: termination.noticeStartDate.toISOString(),
      noticeEndDate: termination.noticeEndDate.toISOString(),
      lastServiceDate: termination.lastServiceDate.toISOString(),
      proRataBreakdown,
      totalDue: termination.totalDue,
      formatted: {
        noticeStartDate: formatDate(termination.noticeStartDate),
        noticeEndDate: formatDate(termination.noticeEndDate),
        totalDue: formatCurrency(termination.totalDue),
      },
    },
    message: 'Termination request submitted successfully. Your 30-day notice period has begun.',
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'SENSITIVE' })

// DELETE /api/client-portal/termination - Cancel termination request
export const DELETE = withClientAuth(async (req, { user }) => {
  const url = new URL(req.url)
  let terminationId = url.searchParams.get('id')

  // If no ID provided, find the active termination for this client
  if (!terminationId) {
    const activeTermination = await getActiveTermination(user.clientId)
    if (!activeTermination) {
      return NextResponse.json({ error: 'No active termination request found' }, { status: 404 })
    }
    terminationId = activeTermination.id
  } else {
    // Verify the termination belongs to this client
    const termination = await prisma.serviceTermination.findFirst({
      where: {
        id: terminationId,
        clientId: user.clientId,
      },
    })

    if (!termination) {
      return NextResponse.json({ error: 'Termination request not found' }, { status: 404 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const reason = body.reason || 'Cancelled by client'

  await cancelTerminationRequest(terminationId, reason, user.id)

  return NextResponse.json({
    success: true,
    message: 'Termination request cancelled successfully.',
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'WRITE' })
