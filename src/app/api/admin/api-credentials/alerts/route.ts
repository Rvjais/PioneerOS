import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import { checkCredentialHealth, runHealthCheckAlerts } from '@/server/api-credentials/alerts'

/**
 * GET /api/admin/api-credentials/alerts
 *
 * Get current credential alerts
 */
export async function GET() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { alerts } = await checkCredentialHealth()

    // Group by severity
    const critical = alerts.filter((a) => a.severity === 'critical')
    const warnings = alerts.filter((a) => a.severity === 'warning')

    return NextResponse.json({
      total: alerts.length,
      critical: critical.length,
      warnings: warnings.length,
      alerts: {
        critical,
        warnings,
      },
    })
  } catch (error) {
    console.error('Failed to fetch credential alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/api-credentials/alerts
 *
 * Run health check and send alerts
 */
export async function POST() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const result = await runHealthCheckAlerts()

    return NextResponse.json({
      success: true,
      checked: result.checked,
      alertsSent: result.alerts,
      message: result.alerts > 0
        ? `Sent ${result.alerts} critical alert(s) to super admins`
        : 'No critical issues found',
    })
  } catch (error) {
    console.error('Failed to run health check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
