import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const bulkUpdateSchema = z.object({
  reportIds: z.array(z.string()).min(1, 'At least one report ID is required'),
  status: z.enum(['SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'PAID']),
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only admin, manager, and accounts can bulk update
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = bulkUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { reportIds, status } = parsed.data

    // Get the reports with their current status and freelancer profile
    const reports = await prisma.freelancerWorkReport.findMany({
      where: { id: { in: reportIds } },
      include: { freelancerProfile: true },
    })

    // Build all operations and run in a single transaction
    const operations: Array<ReturnType<typeof prisma.freelancerWorkReport.updateMany> | ReturnType<typeof prisma.freelancerProfile.update>> = []

    // Update all reports with reviewer info
    operations.push(
      prisma.freelancerWorkReport.updateMany({
        where: { id: { in: reportIds } },
        data: {
          status,
          reviewedBy: user.id,
          reviewedAt: ['REVIEWED', 'APPROVED', 'REJECTED', 'PAID'].includes(status) ? new Date() : undefined,
        },
      })
    )

    // If marking as PAID, update freelancer profile balances
    if (status === 'PAID') {
      const byProfile = reports.reduce((acc, r) => {
        if (!acc[r.freelancerProfileId]) {
          acc[r.freelancerProfileId] = 0
        }
        acc[r.freelancerProfileId] += r.billableAmount
        return acc
      }, {} as Record<string, number>)

      for (const [profileId, amount] of Object.entries(byProfile)) {
        operations.push(
          prisma.freelancerProfile.update({
            where: { id: profileId },
            data: {
              totalEarned: { increment: amount },
              pendingAmount: { decrement: amount },
            },
          })
        )
      }
    }

    // If rejecting, reduce pending amount
    if (status === 'REJECTED') {
      const byProfile = reports.reduce((acc, r) => {
        if (!acc[r.freelancerProfileId]) {
          acc[r.freelancerProfileId] = 0
        }
        // Only reduce if it was previously counting towards pending
        if (['SUBMITTED', 'REVIEWED', 'APPROVED'].includes(r.status)) {
          acc[r.freelancerProfileId] += r.billableAmount
        }
        return acc
      }, {} as Record<string, number>)

      for (const [profileId, amount] of Object.entries(byProfile)) {
        if (amount > 0) {
          operations.push(
            prisma.freelancerProfile.update({
              where: { id: profileId },
              data: {
                pendingAmount: { decrement: amount },
              },
            })
          )
        }
      }
    }

    // Execute all operations atomically
    await prisma.$transaction(operations)

    return NextResponse.json({
      success: true,
      message: `${reportIds.length} reports updated to ${status}`,
      updatedCount: reportIds.length,
    })
  } catch (error) {
    console.error('Error bulk updating work reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
