import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { PROVIDERS } from '@/server/api-credentials/providers'

/**
 * GET /api/admin/api-credentials/analytics
 *
 * Returns usage analytics for API credentials
 */
export async function GET() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all credentials with usage data
    const credentials = await prisma.agencyApiCredential.findMany({
      select: {
        id: true,
        provider: true,
        name: true,
        status: true,
        environment: true,
        usageCount: true,
        lastUsedAt: true,
        lastVerifiedAt: true,
        createdAt: true,
      },
    })

    // Get audit logs for the past 30 days
    const auditLogs = await prisma.apiCredentialAuditLog.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        credentialId: true,
        action: true,
        success: true,
        createdAt: true,
        credential: {
          select: { provider: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate usage by provider
    const usageByProvider = credentials.reduce(
      (acc, cred) => {
        const providerName = PROVIDERS[cred.provider]?.name || cred.provider
        if (!acc[cred.provider]) {
          acc[cred.provider] = {
            provider: cred.provider,
            name: providerName,
            totalCalls: 0,
            lastUsed: null as string | null,
          }
        }
        acc[cred.provider].totalCalls += cred.usageCount
        if (cred.lastUsedAt) {
          const lastUsedDate = new Date(cred.lastUsedAt).toISOString()
          if (!acc[cred.provider].lastUsed || lastUsedDate > acc[cred.provider].lastUsed!) {
            acc[cred.provider].lastUsed = lastUsedDate
          }
        }
        return acc
      },
      {} as Record<string, { provider: string; name: string; totalCalls: number; lastUsed: string | null }>
    )

    // Top used credentials
    const topCredentials = credentials
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map((cred) => ({
        id: cred.id,
        provider: cred.provider,
        name: PROVIDERS[cred.provider]?.name || cred.provider,
        usageCount: cred.usageCount,
        lastUsedAt: cred.lastUsedAt,
        status: cred.status,
      }))

    // Active vs inactive credentials
    const activeCredentials = credentials.filter(
      (c) => c.lastUsedAt && new Date(c.lastUsedAt) > sevenDaysAgo
    ).length
    const inactiveCredentials = credentials.filter(
      (c) => !c.lastUsedAt || new Date(c.lastUsedAt) <= sevenDaysAgo
    ).length

    // Audit activity by day (last 30 days)
    const dailyActivity: Record<string, { date: string; views: number; updates: number; verifications: number }> = {}

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyActivity[dateStr] = { date: dateStr, views: 0, updates: 0, verifications: 0 }
    }

    for (const log of auditLogs) {
      const dateStr = new Date(log.createdAt).toISOString().split('T')[0]
      if (dailyActivity[dateStr]) {
        if (log.action === 'VIEW') {
          dailyActivity[dateStr].views++
        } else if (log.action === 'UPDATE' || log.action === 'ROTATE') {
          dailyActivity[dateStr].updates++
        } else if (log.action === 'VERIFY') {
          dailyActivity[dateStr].verifications++
        }
      }
    }

    // Verification success rate
    const verificationLogs = auditLogs.filter((l) => l.action === 'VERIFY')
    const successfulVerifications = verificationLogs.filter((l) => l.success).length
    const verificationSuccessRate =
      verificationLogs.length > 0
        ? Math.round((successfulVerifications / verificationLogs.length) * 100)
        : 100

    // Activity by provider
    const activityByProvider: Record<string, number> = {}
    for (const log of auditLogs) {
      const provider = log.credential?.provider || 'unknown'
      activityByProvider[provider] = (activityByProvider[provider] || 0) + 1
    }

    // Sort and get top 5 most active
    const topActiveProviders = Object.entries(activityByProvider)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([provider, count]) => ({
        provider,
        name: PROVIDERS[provider]?.name || provider,
        activityCount: count,
      }))

    return NextResponse.json({
      summary: {
        totalCredentials: credentials.length,
        totalApiCalls: credentials.reduce((sum, c) => sum + c.usageCount, 0),
        activeCredentials,
        inactiveCredentials,
        verificationSuccessRate,
      },
      usageByProvider: Object.values(usageByProvider).sort((a, b) => b.totalCalls - a.totalCalls),
      topCredentials,
      dailyActivity: Object.values(dailyActivity),
      topActiveProviders,
    })
  } catch (error) {
    console.error('Failed to fetch credential analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
