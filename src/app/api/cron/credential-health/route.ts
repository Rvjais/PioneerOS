import { NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { testCredentials, checkCredentialHealth, sendCredentialAlert } from '@/server/api-credentials'
import { PROVIDERS } from '@/server/api-credentials/providers'

export const maxDuration = 300

/**
 * GET /api/cron/credential-health
 *
 * Scheduled health check for API credentials.
 * Should be called by a cron job (e.g., Vercel Cron, external scheduler).
 *
 * Security: Requires CRON_SECRET header to prevent unauthorized access.
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In development, allow without secret
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const staleCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days

    // Get all credentials
    const credentials = await prisma.agencyApiCredential.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        provider: true,
        status: true,
        environment: true,
        lastVerifiedAt: true,
      },
    })

    const results = {
      checked: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      alerts: 0,
      details: [] as Array<{
        provider: string
        action: string
        success?: boolean
        message?: string
      }>,
    }

    // Identify credentials that need verification
    const needsVerification = credentials.filter((cred) => {
      // Verify if never verified or last verified more than 7 days ago
      if (!cred.lastVerifiedAt) return true
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return cred.lastVerifiedAt < sevenDaysAgo
    })

    // Verify each credential
    for (const cred of needsVerification) {
      results.checked++

      try {
        const result = await testCredentials(
          cred.provider,
          undefined,
          cred.environment as 'PRODUCTION' | 'SANDBOX'
        )

        if (result.success) {
          results.passed++
          results.details.push({
            provider: cred.provider,
            action: 'verified',
            success: true,
          })
        } else {
          results.failed++
          results.details.push({
            provider: cred.provider,
            action: 'verification_failed',
            success: false,
            message: result.message,
          })

          // Send alert for failed verification
          const providerName = PROVIDERS[cred.provider]?.name || cred.provider
          await sendCredentialAlert({
            type: 'failure',
            provider: cred.provider,
            providerName,
            credentialId: cred.id,
            message: result.message,
            severity: 'critical',
          })
          results.alerts++
        }
      } catch (error) {
        results.failed++
        results.details.push({
          provider: cred.provider,
          action: 'verification_error',
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      // Small delay between checks to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Check for stale credentials (not verified in 30 days)
    const { alerts: healthAlerts } = await checkCredentialHealth()
    const staleAlerts = healthAlerts.filter((a) => a.type === 'stale')

    // Send stale credential alerts (only once per day - check if already sent today)
    for (const alert of staleAlerts) {
      // Check if we already sent an alert for this credential today
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)

      const existingAlert = await prisma.notification.findFirst({
        where: {
          type: 'CREDENTIAL_STALE',
          link: { contains: alert.credentialId },
          createdAt: { gte: todayStart },
        },
      })

      if (!existingAlert) {
        await sendCredentialAlert(alert)
        results.alerts++
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary: {
        totalCredentials: credentials.length,
        checked: results.checked,
        passed: results.passed,
        failed: results.failed,
        skipped: credentials.length - results.checked,
        alertsSent: results.alerts,
      },
      details: results.details,
    })
  } catch (error) {
    console.error('Credential health check failed:', error)
    return NextResponse.json(
      { error: 'Health check failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
