import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'SALES']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()

    // Get all proposals
    const proposals = await prisma.clientProposal.findMany({
      select: {
        id: true,
        prospectName: true,
        prospectCompany: true,
        status: true,
        currentStep: true,
        totalPrice: true,
        createdAt: true,
        viewedAt: true,
        acceptedAt: true,
        slaAcceptedAt: true,
        paymentConfirmedAt: true,
        accountOnboardingCompletedAt: true,
        createdByRole: true,
        entityType: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const STEP_NAMES = [
      '', 'Details', 'SLA Sign-off', 'Invoice', 'Payment', 'Onboarding', 'Activation',
    ]

    const STATUS_ORDER = [
      'DRAFT', 'SENT', 'DETAILS_CONFIRMED', 'SLA_SIGNED',
      'INVOICE_GENERATED', 'PAYMENT_DONE', 'ONBOARDING_COMPLETE', 'ACTIVATED',
    ]

    // Time-in-stage calculation
    const stageTimings: Record<string, number[]> = {}
    for (const p of proposals) {
      if (p.status === 'DRAFT') continue

      const timestamps: (Date | null)[] = [
        p.createdAt,
        p.viewedAt,
        p.acceptedAt,
        p.slaAcceptedAt,
        p.paymentConfirmedAt,
        p.accountOnboardingCompletedAt,
      ]

      for (let i = 0; i < timestamps.length - 1; i++) {
        if (timestamps[i] && timestamps[i + 1]) {
          const stageName = STEP_NAMES[i + 1] || `Step ${i + 1}`
          const days = (timestamps[i + 1]!.getTime() - timestamps[i]!.getTime()) / (1000 * 60 * 60 * 24)
          if (!stageTimings[stageName]) stageTimings[stageName] = []
          stageTimings[stageName].push(days)
        }
      }
    }

    const avgStageTime = Object.entries(stageTimings).map(([stage, times]) => ({
      stage,
      avgDays: Math.round((times.reduce((s, t) => s + t, 0) / times.length) * 10) / 10,
      minDays: Math.round(Math.min(...times) * 10) / 10,
      maxDays: Math.round(Math.max(...times) * 10) / 10,
      count: times.length,
    }))

    // Stuck proposals (not completed, created > 7 days ago, not progressing)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const stuckProposals = proposals.filter(p => {
      if (['ACTIVATED', 'ONBOARDING_COMPLETE'].includes(p.status)) return false
      return p.createdAt < sevenDaysAgo
    }).map(p => {
      const daysSinceCreated = Math.floor((now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: p.id,
        prospectName: p.prospectName,
        prospectCompany: p.prospectCompany,
        status: p.status,
        currentStep: p.currentStep,
        stepName: STEP_NAMES[p.currentStep] || `Step ${p.currentStep}`,
        totalPrice: p.totalPrice,
        daysSinceCreated,
        createdAt: p.createdAt.toISOString(),
      }
    }).sort((a, b) => b.daysSinceCreated - a.daysSinceCreated)

    // Conversion funnel
    const funnel = STATUS_ORDER.map(status => ({
      status,
      count: proposals.filter(p => STATUS_ORDER.indexOf(p.status) >= STATUS_ORDER.indexOf(status)).length,
      dropoff: 0,
    }))

    for (let i = 1; i < funnel.length; i++) {
      funnel[i].dropoff = funnel[i - 1].count > 0
        ? Math.round(((funnel[i - 1].count - funnel[i].count) / funnel[i - 1].count) * 100)
        : 0
    }

    // Pipeline value
    const activeProposals = proposals.filter(p => !['ACTIVATED', 'DRAFT'].includes(p.status))
    const pipelineValue = activeProposals.reduce((s, p) => s + (p.totalPrice || 0), 0)
    const activatedValue = proposals
      .filter(p => p.status === 'ACTIVATED')
      .reduce((s, p) => s + (p.totalPrice || 0), 0)

    // Monthly trend
    const monthlyTrend: Record<string, { created: number; activated: number; value: number }> = {}
    for (const p of proposals) {
      const monthKey = p.createdAt.toISOString().slice(0, 7)
      if (!monthlyTrend[monthKey]) monthlyTrend[monthKey] = { created: 0, activated: 0, value: 0 }
      monthlyTrend[monthKey].created++
      if (p.status === 'ACTIVATED') {
        monthlyTrend[monthKey].activated++
        monthlyTrend[monthKey].value += p.totalPrice || 0
      }
    }

    return NextResponse.json({
      summary: {
        totalProposals: proposals.length,
        activeInPipeline: activeProposals.length,
        activated: proposals.filter(p => p.status === 'ACTIVATED').length,
        stuck: stuckProposals.length,
        pipelineValue: Math.round(pipelineValue),
        activatedValue: Math.round(activatedValue),
        conversionRate: proposals.length > 0
          ? Math.round((proposals.filter(p => p.status === 'ACTIVATED').length / proposals.length) * 100)
          : 0,
      },
      avgStageTime,
      stuckProposals: stuckProposals.slice(0, 15),
      funnel,
      monthlyTrend: Object.entries(monthlyTrend)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({ month, ...data })),
    })
  } catch (error) {
    console.error('Failed to generate onboarding analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
