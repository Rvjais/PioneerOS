import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { Resend } from 'resend'
import { getCredentialsWithFallback } from '@/server/api-credentials'

// Get Resend client for portal emails
async function getResendClient(): Promise<Resend | null> {
  try {
    const credentials = await getCredentialsWithFallback('RESEND')
    const apiKey = credentials.apiKey || process.env.RESEND_API_KEY
    if (!apiKey) return null
    return new Resend(apiKey)
  } catch {
    return null
  }
}

async function getFromEmail(): Promise<string> {
  const credentials = await getCredentialsWithFallback('RESEND')
  return credentials.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@brandingpioneers.in'
}

// Send report notification email
async function sendReportReadyEmail(
  email: string,
  reportTitle: string,
  monthStr: string,
  portalUrl: string
): Promise<boolean> {
  const resend = await getResendClient()
  if (!resend) return false

  try {
    const fromEmail = await getFromEmail()
    const { error } = await resend.emails.send({
      from: `Branding Pioneers <${fromEmail}>`,
      to: [email],
      subject: `Your ${reportTitle} is Ready`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 16px 0; color: #1a1a1a;">Your Report is Ready</h2>
            <p style="color: #666; margin: 0 0 24px 0;">
              Your <strong>${reportTitle}</strong> for <strong>${monthStr}</strong> is now available in your client portal.
            </p>
            <a href="${portalUrl}" style="display: inline-block; background: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              View Report
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              Branding Pioneers - Your Growth Partners
            </p>
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

// Send report notification via WhatsApp
async function sendReportReadyWhatsApp(
  phone: string,
  reportTitle: string,
  monthStr: string
): Promise<boolean> {
  try {
    const result = await sendWhatsAppMessage({
      phone,
      message: `Hi! Your ${reportTitle} for ${monthStr} is now ready.\n\nView it in your client portal at Branding Pioneers.\n\nThank you!`,
    })
    return result.status === 1
  } catch {
    return false
  }
}

interface ReportNotificationData {
  reportId: string
  reportTitle: string
  reportType: string
  reportMonth: Date
  clientId: string
}

/**
 * Create notification for all active client users when a report is sent
 */
export async function notifyClientOfNewReport(data: ReportNotificationData) {
  const { reportId, reportTitle, reportType, reportMonth, clientId } = data

  try {
    // Get all active client users for this client
    const clientUsers = await prisma.clientUser.findMany({
      where: {
        clientId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        emailNotifications: true,
        whatsappNotifications: true,
      },
    })

    if (clientUsers.length === 0) {
      console.log(`[REPORT_NOTIFICATION] No active client users found for client ${clientId}`)
      return
    }

    const monthStr = formatDateDDMMYYYY(reportMonth)

    // Create in-portal notification for all users
    const notifications = clientUsers.map((user) => ({
      clientId,
      clientUserId: user.id,
      title: `New ${reportType} Report Available`,
      message: `Your ${reportTitle} for ${monthStr} is now ready to view.`,
      type: 'SUCCESS',
      category: 'REPORT',
      actionUrl: '/client-portal?tab=reports',
      actionLabel: 'View Report',
      sourceType: 'SYSTEM',
      sourceId: reportId,
    }))

    await prisma.portalNotification.createMany({
      data: notifications,
    })

    console.log(`[REPORT_NOTIFICATION] Created ${notifications.length} portal notifications for report ${reportId}`)

    // Send email notifications to users with emailNotifications enabled
    const portalUrl = `${process.env.NEXTAUTH_URL || 'https://app.brandingpioneers.in'}/client-portal?tab=reports`
    const emailUsers = clientUsers.filter(u => u.emailNotifications && u.email)
    let emailsSent = 0
    for (const user of emailUsers) {
      const sent = await sendReportReadyEmail(user.email, reportTitle, monthStr, portalUrl)
      if (sent) emailsSent++
    }
    if (emailsSent > 0) {
      console.log(`[REPORT_NOTIFICATION] Sent ${emailsSent} email notifications`)
    }

    // Send WhatsApp notifications to users with whatsappNotifications enabled
    const whatsappUsers = clientUsers.filter(u => u.whatsappNotifications && u.phone)
    let whatsappSent = 0
    for (const user of whatsappUsers) {
      if (user.phone) {
        const sent = await sendReportReadyWhatsApp(user.phone, reportTitle, monthStr)
        if (sent) whatsappSent++
      }
    }
    if (whatsappSent > 0) {
      console.log(`[REPORT_NOTIFICATION] Sent ${whatsappSent} WhatsApp notifications`)
    }

    return { success: true, notifiedCount: notifications.length, emailsSent }
  } catch (error) {
    console.error('[REPORT_NOTIFICATION] Failed to notify client users:', error)
    throw error
  }
}

interface InvoiceNotificationData {
  invoiceId: string
  invoiceNumber: string
  amount: number
  dueDate: Date
  clientId: string
}

/**
 * Create notification for all active client users when an invoice is generated
 */
export async function notifyClientOfNewInvoice(data: InvoiceNotificationData) {
  const { invoiceId, invoiceNumber, amount, dueDate, clientId } = data

  try {
    const clientUsers = await prisma.clientUser.findMany({
      where: {
        clientId,
        isActive: true,
      },
      select: {
        id: true,
      },
    })

    if (clientUsers.length === 0) return

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)

    const dueDateStr = formatDateDDMMYYYY(dueDate)

    const notifications = clientUsers.map((user) => ({
      clientId,
      clientUserId: user.id,
      title: 'New Invoice Generated',
      message: `Invoice ${invoiceNumber} for ${formattedAmount} is due on ${dueDateStr}.`,
      type: 'INFO',
      category: 'INVOICE',
      actionUrl: '/client-portal?tab=payments',
      actionLabel: 'View Invoice',
      sourceType: 'SYSTEM',
      sourceId: invoiceId,
    }))

    await prisma.portalNotification.createMany({
      data: notifications,
    })

    console.log(`[INVOICE_NOTIFICATION] Created ${notifications.length} portal notifications for invoice ${invoiceId}`)

    return { success: true, notifiedCount: notifications.length }
  } catch (error) {
    console.error('[INVOICE_NOTIFICATION] Failed to notify client users:', error)
    throw error
  }
}

interface MeetingNotificationData {
  meetingId: string
  title: string
  date: Date
  clientId: string
  isOnline: boolean
}

/**
 * Create notification for all active client users when a meeting is scheduled
 */
export async function notifyClientOfMeeting(data: MeetingNotificationData) {
  const { meetingId, title, date, clientId, isOnline } = data

  try {
    const clientUsers = await prisma.clientUser.findMany({
      where: {
        clientId,
        isActive: true,
      },
      select: {
        id: true,
      },
    })

    if (clientUsers.length === 0) return

    const dateStr = date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const notifications = clientUsers.map((user) => ({
      clientId,
      clientUserId: user.id,
      title: 'Meeting Scheduled',
      message: `${title} is scheduled for ${dateStr}.${isOnline ? ' Join link available in portal.' : ''}`,
      type: 'INFO',
      category: 'MEETING',
      actionUrl: '/client-portal?tab=meetings',
      actionLabel: 'View Details',
      sourceType: 'SYSTEM',
      sourceId: meetingId,
    }))

    await prisma.portalNotification.createMany({
      data: notifications,
    })

    console.log(`[MEETING_NOTIFICATION] Created ${notifications.length} portal notifications for meeting ${meetingId}`)

    return { success: true, notifiedCount: notifications.length }
  } catch (error) {
    console.error('[MEETING_NOTIFICATION] Failed to notify client users:', error)
    throw error
  }
}

interface DeliverableNotificationData {
  clientId: string
  category: string
  deliverableType: string
  quantity: number
}

/**
 * Create notification when work is completed/approved for a client
 */
export async function notifyClientOfDeliverable(data: DeliverableNotificationData) {
  const { clientId, category, deliverableType, quantity } = data

  try {
    // Create notification for the client (not per-user, as this could be frequent)
    await prisma.portalNotification.create({
      data: {
        clientId,
        clientUserId: null, // Visible to all client users
        title: 'New Work Completed',
        message: `${quantity} ${deliverableType.replace(/_/g, ' ')} (${category}) has been completed and approved.`,
        type: 'SUCCESS',
        category: 'DELIVERABLE',
        actionUrl: '/client-portal?tab=work-tracker',
        actionLabel: 'View Work',
        sourceType: 'SYSTEM',
      },
    })

    console.log(`[DELIVERABLE_NOTIFICATION] Created notification for ${category} - ${deliverableType}`)

    return { success: true }
  } catch (error) {
    console.error('[DELIVERABLE_NOTIFICATION] Failed to create notification:', error)
    throw error
  }
}
