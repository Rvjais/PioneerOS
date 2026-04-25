/**
 * Cron Job: Update Client Health Scores
 * Schedule: Daily at 6 AM
 *
 * Updates health scores for all active clients based on:
 * - Payment status
 * - Deliverable completion
 * - Communication frequency
 * - Support ticket load
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateAllHealthScores, syncPaymentStatus } from '@/server/services/clientIntegrity'
import { prisma } from '@/server/db/prisma'

export const maxDuration = 300

// Verify cron secret to prevent unauthorized access
function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - cron jobs are disabled')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(req: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, sync payment statuses for all clients
    const activeClients = await prisma.client.findMany({
      where: { status: 'ACTIVE', isLost: false, deletedAt: null },
      select: { id: true },
    })

    let paymentSynced = 0
    let paymentErrors = 0
    for (const client of activeClients) {
      try {
        await syncPaymentStatus(client.id)
        paymentSynced++
      } catch (error) {
        paymentErrors++
        console.error(`[Cron] Failed to sync payment for ${client.id}:`, error)
      }
    }

    // Then update health scores
    const result = await updateAllHealthScores()

    // Check if more than 10% of clients failed
    const totalClients = activeClients.length
    const failureRate = totalClients > 0 ? paymentErrors / totalClients : 0
    const hasHighFailureRate = failureRate > 0.1

    // Log summary
    const summary = {
      timestamp: new Date().toISOString(),
      paymentStatusSynced: paymentSynced,
      paymentSyncErrors: paymentErrors,
      healthScoresUpdated: result.updated,
      errors: result.errors,
      ...(hasHighFailureRate ? {
        warning: `High failure rate: ${paymentErrors}/${totalClients} clients (${Math.round(failureRate * 100)}%) failed payment sync`,
      } : {}),
    }

    return NextResponse.json({
      success: !hasHighFailureRate,
      ...summary,
    })
  } catch (error) {
    console.error('[Cron] Health score update failed:', error)
    return NextResponse.json(
      { error: 'Failed to update health scores' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req)
}
