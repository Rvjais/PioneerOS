/**
 * Credential Alerts System
 *
 * Monitors credential health and sends alerts when issues are detected.
 */

import prisma from '@/server/db/prisma'
import { PROVIDERS } from './providers'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { Resend } from 'resend'
import { getCredentialsWithFallback } from '@/server/api-credentials'

// Send credential alert via email
async function sendCredentialAlertEmail(
  email: string,
  alert: {
    type: 'failure' | 'expiry' | 'stale'
    providerName: string
    message: string
    severity: 'warning' | 'critical'
  }
): Promise<boolean> {
  try {
    const credentials = await getCredentialsWithFallback('RESEND')
    const apiKey = credentials.apiKey || process.env.RESEND_API_KEY
    if (!apiKey) return false

    const resend = new Resend(apiKey)
    const fromEmail = credentials.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@brandingpioneers.in'

    const severityColor = alert.severity === 'critical' ? '#EF4444' : '#F59E0B'
    const severityLabel = alert.severity === 'critical' ? 'CRITICAL' : 'WARNING'

    const { error } = await resend.emails.send({
      from: `Pioneer OS Alerts <${fromEmail}>`,
      to: [email],
      subject: `[${severityLabel}] API Credential Alert: ${alert.providerName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #0B0E14;">
          <div style="max-width: 500px; margin: 0 auto; background: #141A25; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="display: inline-block; background: ${severityColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">
              ${severityLabel}
            </div>
            <h2 style="margin: 0 0 16px 0; color: white;">API Credential Alert</h2>
            <p style="color: #94A3B8; margin: 0 0 16px 0;">
              <strong style="color: white;">${alert.providerName}</strong> - ${alert.type}
            </p>
            <p style="color: #64748B; margin: 0 0 24px 0;">
              ${alert.message}
            </p>
            <a href="${process.env.NEXTAUTH_URL || 'https://app.brandingpioneers.in'}/admin/api-management"
               style="display: inline-block; background: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              View API Management
            </a>
          </div>
        </body>
        </html>
      `,
    })
    return !error
  } catch {
    return false
  }
}

// Send credential alert via WhatsApp
async function sendCredentialAlertWhatsApp(
  phone: string,
  alert: {
    type: 'failure' | 'expiry' | 'stale'
    providerName: string
    message: string
    severity: 'warning' | 'critical'
  }
): Promise<boolean> {
  try {
    const emoji = alert.severity === 'critical' ? '🚨' : '⚠️'
    const result = await sendWhatsAppMessage({
      phone,
      message: `${emoji} *API Credential Alert*\n\n*Provider:* ${alert.providerName}\n*Issue:* ${alert.type}\n*Severity:* ${alert.severity.toUpperCase()}\n\n${alert.message}\n\nPlease check the API Management dashboard.`,
    })
    return result.status === 1
  } catch {
    return false
  }
}

export interface AlertConfig {
  notifyOnFailure: boolean
  notifyOnExpiry: boolean
  notifyOnStale: boolean
  staleDays: number
  notificationChannels: ('app' | 'email' | 'whatsapp')[]
}

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  notifyOnFailure: true,
  notifyOnExpiry: true,
  notifyOnStale: true,
  staleDays: 30,
  notificationChannels: ['app'],
}

/**
 * Check credential health and generate alerts
 */
export async function checkCredentialHealth(): Promise<{
  alerts: Array<{
    type: 'failure' | 'expiry' | 'stale'
    provider: string
    providerName: string
    credentialId: string
    message: string
    severity: 'warning' | 'critical'
  }>
}> {
  const alerts: Array<{
    type: 'failure' | 'expiry' | 'stale'
    provider: string
    providerName: string
    credentialId: string
    message: string
    severity: 'warning' | 'critical'
  }> = []

  const now = new Date()
  const staleCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get all credentials
  const credentials = await prisma.agencyApiCredential.findMany({
    select: {
      id: true,
      provider: true,
      status: true,
      lastVerifiedAt: true,
      lastError: true,
    },
  })

  for (const cred of credentials) {
    const providerName = PROVIDERS[cred.provider]?.name || cred.provider

    // Check for failures
    if (cred.status === 'INVALID') {
      alerts.push({
        type: 'failure',
        provider: cred.provider,
        providerName,
        credentialId: cred.id,
        message: cred.lastError || `${providerName} credentials are invalid`,
        severity: 'critical',
      })
    }

    // Check for expiry
    if (cred.status === 'EXPIRED') {
      alerts.push({
        type: 'expiry',
        provider: cred.provider,
        providerName,
        credentialId: cred.id,
        message: `${providerName} credentials have expired`,
        severity: 'critical',
      })
    }

    // Check for stale credentials
    if (cred.status === 'ACTIVE' && (!cred.lastVerifiedAt || cred.lastVerifiedAt < staleCutoff)) {
      alerts.push({
        type: 'stale',
        provider: cred.provider,
        providerName,
        credentialId: cred.id,
        message: `${providerName} credentials haven't been verified in over 30 days`,
        severity: 'warning',
      })
    }
  }

  return { alerts }
}

/**
 * Send credential failure notification to super admins
 */
export async function sendCredentialAlert(
  alert: {
    type: 'failure' | 'expiry' | 'stale'
    provider: string
    providerName: string
    credentialId: string
    message: string
    severity: 'warning' | 'critical'
  },
  channels: ('app' | 'email' | 'whatsapp')[] = ['app']
): Promise<void> {
  // Get super admins
  const superAdmins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
    select: { id: true, email: true, phone: true },
  })

  if (superAdmins.length === 0) return

  // Create in-app notifications
  if (channels.includes('app')) {
    const notificationType =
      alert.type === 'failure'
        ? 'CREDENTIAL_FAILURE'
        : alert.type === 'expiry'
        ? 'CREDENTIAL_EXPIRY'
        : 'CREDENTIAL_STALE'

    await prisma.notification.createMany({
      data: superAdmins.map((admin) => ({
        userId: admin.id,
        type: notificationType,
        title: `API Credential ${alert.severity === 'critical' ? 'Alert' : 'Warning'}: ${alert.providerName}`,
        message: alert.message,
        link: `/admin/api-management?credential=${alert.credentialId}`,
      })),
    })
  }

  // Send email alerts to admins with email
  if (channels.includes('email')) {
    for (const admin of superAdmins) {
      if (admin.email) {
        await sendCredentialAlertEmail(admin.email, {
          type: alert.type,
          providerName: alert.providerName,
          message: alert.message,
          severity: alert.severity,
        })
      }
    }
  }

  // Send WhatsApp alerts to admins with phone
  if (channels.includes('whatsapp')) {
    for (const admin of superAdmins) {
      if (admin.phone) {
        await sendCredentialAlertWhatsApp(admin.phone, {
          type: alert.type,
          providerName: alert.providerName,
          message: alert.message,
          severity: alert.severity,
        })
      }
    }
  }
}

/**
 * Process credential verification result and send alerts if needed
 */
export async function handleVerificationResult(
  credentialId: string,
  provider: string,
  success: boolean,
  error?: string
): Promise<void> {
  if (success) return

  const providerName = PROVIDERS[provider]?.name || provider

  await sendCredentialAlert({
    type: 'failure',
    provider,
    providerName,
    credentialId,
    message: error || `${providerName} credential verification failed`,
    severity: 'critical',
  })
}

/**
 * Run periodic health check and send all necessary alerts
 */
export async function runHealthCheckAlerts(): Promise<{
  checked: number
  alerts: number
}> {
  const { alerts } = await checkCredentialHealth()

  // Send alerts for critical issues
  for (const alert of alerts.filter((a) => a.severity === 'critical')) {
    await sendCredentialAlert(alert)
  }

  return {
    checked: alerts.length,
    alerts: alerts.filter((a) => a.severity === 'critical').length,
  }
}
