import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'

export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Invoice Overdue Cron Job
 * Triggers: Every day at 10:30 AM IST (5:00 UTC)
 *
 * Finds all invoices with status 'SENT' and dueDate < now,
 * then updates them to status 'OVERDUE'.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
    }
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    const result = await prisma.invoice.updateMany({
      where: {
        status: 'SENT',
        dueDate: { lt: now },
      },
      data: {
        status: 'OVERDUE',
      },
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Invoice overdue cron job failed:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
