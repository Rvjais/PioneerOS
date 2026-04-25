import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { PROVIDERS } from '@/server/api-credentials/providers'

/**
 * GET /api/admin/api-credentials/health
 *
 * Returns credential health overview stats
 */
export async function GET() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    // Get all credentials
    const credentials = await prisma.agencyApiCredential.findMany({
      select: {
        id: true,
        provider: true,
        status: true,
        environment: true,
        lastVerifiedAt: true,
        lastUsedAt: true,
        usageCount: true,
        lastError: true,
        createdAt: true,
      },
    })

    // Calculate stats
    const totalProviders = Object.keys(PROVIDERS).length
    const configuredCount = credentials.length
    const unconfiguredCount = totalProviders - configuredCount

    // Status breakdown
    const statusCounts = {
      active: credentials.filter((c) => c.status === 'ACTIVE').length,
      invalid: credentials.filter((c) => c.status === 'INVALID').length,
      expired: credentials.filter((c) => c.status === 'EXPIRED').length,
      disabled: credentials.filter((c) => c.status === 'DISABLED').length,
    }

    // Verification stats
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const recentlyVerified = credentials.filter(
      (c) => c.lastVerifiedAt && new Date(c.lastVerifiedAt) > sevenDaysAgo
    ).length

    const staleCredentials = credentials.filter(
      (c) => !c.lastVerifiedAt || new Date(c.lastVerifiedAt) < thirtyDaysAgo
    )

    // Usage stats
    const totalUsage = credentials.reduce((sum, c) => sum + c.usageCount, 0)
    const activelyUsed = credentials.filter(
      (c) => c.lastUsedAt && new Date(c.lastUsedAt) > sevenDaysAgo
    ).length

    // Get failing credentials
    const failingCredentials = credentials
      .filter((c) => c.status === 'INVALID' || c.status === 'EXPIRED')
      .map((c) => ({
        id: c.id,
        provider: c.provider,
        name: PROVIDERS[c.provider]?.name || c.provider,
        status: c.status,
        lastError: c.lastError,
        lastVerifiedAt: c.lastVerifiedAt,
      }))

    // Get recently used credentials
    const recentlyUsedCredentials = credentials
      .filter((c) => c.lastUsedAt)
      .sort((a, b) => {
        const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0
        const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        provider: c.provider,
        name: PROVIDERS[c.provider]?.name || c.provider,
        usageCount: c.usageCount,
        lastUsedAt: c.lastUsedAt,
      }))

    // Calculate health score (0-100)
    let healthScore = 100

    // Deduct for invalid/expired credentials
    healthScore -= statusCounts.invalid * 15
    healthScore -= statusCounts.expired * 10

    // Deduct for stale credentials
    healthScore -= staleCredentials.length * 5

    // Deduct for unconfigured critical providers
    const criticalProviders = ['RAZORPAY', 'RESEND', 'GOOGLE']
    const unconfiguredCritical = criticalProviders.filter(
      (p) => !credentials.some((c) => c.provider === p)
    )
    healthScore -= unconfiguredCritical.length * 10

    // Ensure score is within bounds
    healthScore = Math.max(0, Math.min(100, healthScore))

    return NextResponse.json({
      overview: {
        totalProviders,
        configuredCount,
        unconfiguredCount,
        healthScore,
      },
      status: statusCounts,
      verification: {
        recentlyVerified,
        staleCount: staleCredentials.length,
        staleCredentials: staleCredentials.map((c) => ({
          id: c.id,
          provider: c.provider,
          name: PROVIDERS[c.provider]?.name || c.provider,
          lastVerifiedAt: c.lastVerifiedAt,
        })),
      },
      usage: {
        totalCalls: totalUsage,
        activelyUsed,
        topCredentials: recentlyUsedCredentials,
      },
      alerts: {
        failing: failingCredentials,
        unconfiguredCritical,
      },
    })
  } catch (error) {
    console.error('Failed to fetch credential health:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
