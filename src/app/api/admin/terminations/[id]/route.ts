import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedUser } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import {
  recordTerminationPayment,
  completeHandoverCall,
  completeTermination,
  cancelTerminationRequest,
  TERMINATION_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from '@/server/services/termination'

// GET /api/admin/terminations/[id] - Get termination details
export const GET = withAuth(
  async (req: NextRequest, { params }) => {
    const id = params?.id

    if (!id) {
      return NextResponse.json({ error: 'Termination ID required' }, { status: 400 })
    }

    const termination = await prisma.serviceTermination.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            tier: true,
            monthlyFee: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            whatsapp: true,
            startDate: true,
            lifecycleStage: true,
            status: true,
            teamMembers: {
              where: { isPrimary: true },
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!termination) {
      return NextResponse.json({ error: 'Termination not found' }, { status: 404 })
    }

    // Parse pro-rata breakdown
    let proRataBreakdown = []
    try {
      if (termination.proRataBreakdown) {
        proRataBreakdown = JSON.parse(termination.proRataBreakdown)
      }
    } catch {
      // Ignore JSON parse errors
    }

    // Get related data
    const [requestedByUser, processedByUser, handoverMeeting] = await Promise.all([
      prisma.clientUser.findUnique({
        where: { id: termination.requestedBy },
        select: { id: true, name: true, email: true, role: true },
      }),
      termination.processedBy
        ? prisma.user.findUnique({
            where: { id: termination.processedBy },
            select: { id: true, firstName: true, lastName: true, email: true },
          })
        : null,
      termination.handoverMeetingId
        ? prisma.meeting.findUnique({
            where: { id: termination.handoverMeetingId },
            select: {
              id: true,
              title: true,
              date: true,
              status: true,
              location: true,
              notes: true,
            },
          })
        : null,
    ])

    const now = new Date()
    const daysRemaining = Math.max(
      0,
      Math.ceil((termination.noticeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )
    const daysElapsed = Math.max(
      0,
      Math.ceil((now.getTime() - termination.noticeStartDate.getTime()) / (1000 * 60 * 60 * 24))
    )
    const progress = Math.min(100, Math.round((daysElapsed / 30) * 100))

    const accountManager = termination.client.teamMembers[0]?.user

    return NextResponse.json({
      id: termination.id,
      client: {
        id: termination.client.id,
        name: termination.client.name,
        tier: termination.client.tier,
        monthlyFee: termination.client.monthlyFee,
        contactName: termination.client.contactName,
        contactEmail: termination.client.contactEmail,
        contactPhone: termination.client.contactPhone,
        whatsapp: termination.client.whatsapp,
        startDate: termination.client.startDate,
        lifecycleStage: termination.client.lifecycleStage,
        status: termination.client.status,
        accountManager: accountManager
          ? {
              id: accountManager.id,
              name: `${accountManager.firstName} ${accountManager.lastName || ''}`.trim(),
              email: accountManager.email,
              phone: accountManager.phone,
            }
          : null,
      },
      status: termination.status,
      statusLabel: TERMINATION_STATUS_LABELS[termination.status as keyof typeof TERMINATION_STATUS_LABELS] || termination.status,
      reason: termination.reason,
      feedback: termination.feedback,

      // Timeline
      noticeStartDate: termination.noticeStartDate.toISOString(),
      noticeEndDate: termination.noticeEndDate.toISOString(),
      lastServiceDate: termination.lastServiceDate.toISOString(),
      daysRemaining,
      daysElapsed,
      progress,

      // Payment
      monthlyFee: termination.monthlyFee,
      proRataBreakdown,
      proRataAmount: termination.proRataAmount,
      pendingDues: termination.pendingDues,
      totalDue: termination.totalDue,
      amountPaid: termination.amountPaid,
      amountRemaining: termination.totalDue - termination.amountPaid,
      paymentCleared: termination.paymentCleared,
      paymentClearedAt: termination.paymentClearedAt?.toISOString(),

      // Handover
      handoverCallScheduled: termination.handoverCallScheduled,
      handoverCallDate: termination.handoverCallDate?.toISOString(),
      handoverCallCompleted: termination.handoverCallCompleted,
      handoverCallNotes: termination.handoverCallNotes,
      handoverMeeting: handoverMeeting
        ? {
            ...handoverMeeting,
            date: handoverMeeting.date.toISOString(),
          }
        : null,

      // Data Export
      dataExportEnabled: termination.dataExportEnabled,
      dataExportedAt: termination.dataExportedAt?.toISOString(),
      dataExportUrl: termination.dataExportUrl,

      // Admin
      adminNotes: termination.adminNotes,
      processedBy: processedByUser
        ? {
            id: processedByUser.id,
            name: `${processedByUser.firstName} ${processedByUser.lastName || ''}`.trim(),
            email: processedByUser.email,
          }
        : null,
      processedAt: termination.processedAt?.toISOString(),

      // Request details
      requestedBy: requestedByUser
        ? {
            id: requestedByUser.id,
            name: requestedByUser.name,
            email: requestedByUser.email,
            role: requestedByUser.role,
          }
        : null,
      requestedAt: termination.requestedAt.toISOString(),

      // Formatted
      formatted: {
        noticeStartDate: formatDate(termination.noticeStartDate),
        noticeEndDate: formatDate(termination.noticeEndDate),
        lastServiceDate: formatDate(termination.lastServiceDate),
        monthlyFee: formatCurrency(termination.monthlyFee),
        proRataAmount: formatCurrency(termination.proRataAmount),
        pendingDues: formatCurrency(termination.pendingDues),
        totalDue: formatCurrency(termination.totalDue),
        amountPaid: formatCurrency(termination.amountPaid),
        amountRemaining: formatCurrency(termination.totalDue - termination.amountPaid),
        handoverCallDate: termination.handoverCallDate
          ? formatDate(termination.handoverCallDate)
          : null,
      },

      createdAt: termination.createdAt.toISOString(),
      updatedAt: termination.updatedAt.toISOString(),
    })
  },
  {
    roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
    departments: ['ACCOUNTS', 'OPERATIONS'],
  }
)

// PATCH /api/admin/terminations/[id] - Update termination (record payment, complete handover, etc.)
export const PATCH = withAuth(
  async (req: NextRequest, { user, params }) => {
    const id = params?.id

    if (!id) {
      return NextResponse.json({ error: 'Termination ID required' }, { status: 400 })
    }

    const body = await req.json()
    const schema = z.object({
      action: z.enum(['RECORD_PAYMENT', 'COMPLETE_HANDOVER', 'COMPLETE_TERMINATION', 'CANCEL', 'UPDATE_NOTES', 'ENABLE_DATA_EXPORT']),
      amount: z.number().optional(),
      notes: z.string().max(2000).optional(),
      reason: z.string().max(1000).optional(),
      adminNotes: z.string().max(2000).optional(),
    })
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { action, ...data } = parsed.data

    const termination = await prisma.serviceTermination.findUnique({
      where: { id },
    })

    if (!termination) {
      return NextResponse.json({ error: 'Termination not found' }, { status: 404 })
    }

    const userId = (user as AuthenticatedUser).id
    const userName = `${(user as AuthenticatedUser).firstName} ${(user as AuthenticatedUser).lastName || ''}`.trim()

    switch (action) {
      case 'RECORD_PAYMENT': {
        const { amount } = data
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: 'Valid payment amount required' },
            { status: 400 }
          )
        }

        const updated = await recordTerminationPayment(id, amount, userName)
        return NextResponse.json({
          success: true,
          message: `Payment of ${formatCurrency(amount)} recorded successfully`,
          termination: {
            amountPaid: updated.amountPaid,
            paymentCleared: updated.paymentCleared,
            dataExportEnabled: updated.dataExportEnabled,
          },
        })
      }

      case 'COMPLETE_HANDOVER': {
        const { notes } = data
        const updated = await completeHandoverCall(id, notes)
        return NextResponse.json({
          success: true,
          message: 'Handover call marked as completed',
          termination: {
            handoverCallCompleted: updated.handoverCallCompleted,
            handoverCallNotes: updated.handoverCallNotes,
          },
        })
      }

      case 'COMPLETE_TERMINATION': {
        const updated = await completeTermination(id, userId)
        return NextResponse.json({
          success: true,
          message: 'Termination completed. Client lifecycle updated to CHURNED.',
          termination: {
            status: updated.status,
            completedAt: updated.completedAt?.toISOString(),
          },
        })
      }

      case 'CANCEL': {
        const { reason } = data
        if (!reason) {
          return NextResponse.json(
            { error: 'Cancellation reason required' },
            { status: 400 }
          )
        }

        const updated = await cancelTerminationRequest(id, reason, userId)
        return NextResponse.json({
          success: true,
          message: 'Termination request cancelled',
          termination: {
            status: updated.status,
            cancelledAt: updated.cancelledAt?.toISOString(),
            cancelledReason: updated.cancelledReason,
          },
        })
      }

      case 'UPDATE_NOTES': {
        const { adminNotes } = data
        const updated = await prisma.serviceTermination.update({
          where: { id },
          data: {
            adminNotes,
            processedBy: userId,
            processedAt: new Date(),
          },
        })
        return NextResponse.json({
          success: true,
          message: 'Admin notes updated',
          termination: {
            adminNotes: updated.adminNotes,
          },
        })
      }

      case 'ENABLE_DATA_EXPORT': {
        // Manually enable data export (admin override)
        const updated = await prisma.serviceTermination.update({
          where: { id },
          data: {
            dataExportEnabled: true,
            adminNotes: termination.adminNotes
              ? `${termination.adminNotes}\n[${new Date().toISOString()}] Data export manually enabled by ${userName}`
              : `[${new Date().toISOString()}] Data export manually enabled by ${userName}`,
          },
        })
        return NextResponse.json({
          success: true,
          message: 'Data export enabled for client',
          termination: {
            dataExportEnabled: updated.dataExportEnabled,
          },
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  },
  {
    roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
    departments: ['ACCOUNTS', 'OPERATIONS'],
  }
)
