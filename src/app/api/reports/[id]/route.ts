import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { notifyClientOfNewReport } from '@/server/notifications/portalNotifications'

const REPORT_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD', 'HR']

// GET /api/reports/[id] - Get report details
export const GET = withAuth(async (
  request: NextRequest,
  { params, user }
) => {
  if (!REPORT_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const id = params?.id

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            brandName: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to fetch report:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
})

// PATCH /api/reports/[id] - Update report (including sending to client)
export const PATCH = withAuth(async (
  request: NextRequest,
  { params, user }
) => {
  if (!REPORT_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const id = params?.id
    const body = await request.json()
    const { title, type, status, fileUrl, data } = body

    // Fetch current report to check if we're changing status to SENT
    const currentReport = await prisma.report.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    if (!currentReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const wasNotSent = currentReport.status !== 'SENT'
    const isBeingSent = status === 'SENT'

    // Update the report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        title: title ?? undefined,
        type: type ?? undefined,
        status: status ?? undefined,
        fileUrl: fileUrl ?? undefined,
        data: data ?? undefined,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    })

    // Trigger notifications if status changed to SENT
    if (wasNotSent && isBeingSent && updatedReport.client) {
      try {
        await notifyClientOfNewReport({
          reportId: updatedReport.id,
          reportTitle: updatedReport.title,
          reportType: updatedReport.type,
          reportMonth: updatedReport.month,
          clientId: updatedReport.clientId,
        })
        // Notifications sent successfully
      } catch (notifyError) {
        // Log but don't fail the request
        console.error('[REPORT] Failed to send notifications:', notifyError)
      }
    }

    return NextResponse.json({
      report: updatedReport,
      notificationsSent: wasNotSent && isBeingSent,
    })
  } catch (error) {
    console.error('Failed to update report:', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
})

// DELETE /api/reports/[id] - Delete report
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const id = params?.id

    await prisma.report.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'] })
