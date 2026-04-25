import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'

// GET /api/client-portal/reports - Get reports for client
export const GET = withClientAuth(async (req, { user }) => {
  const clientId = user.clientId

  // Get query params
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')

  // Build filter
  const where: Record<string, unknown> = { clientId }

  if (type) {
    where.type = type
  }

  // Only show sent/approved reports to clients
  where.status = status === 'all' ? undefined : { in: ['APPROVED', 'SENT'] }

  // Fetch reports
  const reports = await prisma.report.findMany({
    where,
    orderBy: { month: 'desc' },
    take: 20,
  })

  // Group reports by type
  const reportsByType = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    reports: reports.map(r => ({
      id: r.id,
      title: r.title,
      type: r.type,
      month: r.month.toISOString(),
      status: r.status,
      fileUrl: r.fileUrl,
      createdAt: r.createdAt.toISOString(),
    })),
    summary: {
      total: reports.length,
      byType: reportsByType,
    },
    types: [...new Set(reports.map(r => r.type))],
  })
}, { rateLimit: 'READ' })
