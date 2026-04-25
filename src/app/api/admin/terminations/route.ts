import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import {
  TERMINATION_STATUS,
  TERMINATION_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from '@/server/services/termination'

// GET /api/admin/terminations - List all termination requests
export const GET = withAuth(
  async (req: NextRequest) => {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20')), 100)
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    // Fetch terminations with count
    const [terminations, total] = await Promise.all([
      prisma.serviceTermination.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              tier: true,
              monthlyFee: true,
              contactName: true,
              contactEmail: true,
              whatsapp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.serviceTermination.count({ where }),
    ])

    // Calculate status counts
    const statusCounts = await prisma.serviceTermination.groupBy({
      by: ['status'],
      _count: true,
    })

    const counts = {
      ALL: total,
      PENDING: 0,
      ACTIVE: 0,
      HANDOVER: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }

    statusCounts.forEach((sc) => {
      counts[sc.status as keyof typeof counts] = sc._count
    })

    // Format terminations for response
    const formattedTerminations = terminations.map((t) => {
      let proRataBreakdown = []
      try {
        if (t.proRataBreakdown) {
          proRataBreakdown = JSON.parse(t.proRataBreakdown)
        }
      } catch {
        // Ignore JSON parse errors
      }

      const now = new Date()
      const daysRemaining = Math.max(
        0,
        Math.ceil((t.noticeEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )
      const daysElapsed = Math.max(
        0,
        Math.ceil((now.getTime() - t.noticeStartDate.getTime()) / (1000 * 60 * 60 * 24))
      )
      const progress = Math.min(100, Math.round((daysElapsed / 30) * 100))

      return {
        id: t.id,
        client: {
          id: t.client.id,
          name: t.client.name,
          tier: t.client.tier,
          monthlyFee: t.client.monthlyFee,
          contactName: t.client.contactName,
          contactEmail: t.client.contactEmail,
          whatsapp: t.client.whatsapp,
        },
        status: t.status,
        statusLabel: TERMINATION_STATUS_LABELS[t.status as keyof typeof TERMINATION_STATUS_LABELS] || t.status,
        reason: t.reason,
        feedback: t.feedback,

        // Timeline
        noticeStartDate: t.noticeStartDate.toISOString(),
        noticeEndDate: t.noticeEndDate.toISOString(),
        lastServiceDate: t.lastServiceDate.toISOString(),
        daysRemaining,
        daysElapsed,
        progress,

        // Payment
        monthlyFee: t.monthlyFee,
        proRataBreakdown,
        proRataAmount: t.proRataAmount,
        pendingDues: t.pendingDues,
        totalDue: t.totalDue,
        amountPaid: t.amountPaid,
        amountRemaining: t.totalDue - t.amountPaid,
        paymentCleared: t.paymentCleared,
        paymentClearedAt: t.paymentClearedAt?.toISOString(),

        // Handover
        handoverCallScheduled: t.handoverCallScheduled,
        handoverCallDate: t.handoverCallDate?.toISOString(),
        handoverCallCompleted: t.handoverCallCompleted,

        // Data Export
        dataExportEnabled: t.dataExportEnabled,
        dataExportedAt: t.dataExportedAt?.toISOString(),

        // Admin
        adminNotes: t.adminNotes,
        processedBy: t.processedBy,
        processedAt: t.processedAt?.toISOString(),

        // Formatted
        formatted: {
          noticeStartDate: formatDate(t.noticeStartDate),
          noticeEndDate: formatDate(t.noticeEndDate),
          totalDue: formatCurrency(t.totalDue),
          amountPaid: formatCurrency(t.amountPaid),
          amountRemaining: formatCurrency(t.totalDue - t.amountPaid),
        },

        requestedAt: t.requestedAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      terminations: formattedTerminations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts,
      statuses: Object.keys(TERMINATION_STATUS),
    })
  },
  {
    roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'],
    departments: ['ACCOUNTS', 'OPERATIONS'],
  }
)
