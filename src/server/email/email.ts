/**
 * Unified Email Service
 *
 * Single source of truth for all email sending in Pioneer OS.
 * Uses Resend as the email provider with database credential fallback.
 *
 * Consolidates the previously separate implementations:
 * - src/lib/email.ts (magic link emails)
 * - src/lib/email/sender.ts (unused templates)
 * - src/lib/notifications/email.ts (SMTP/SendGrid for invoices)
 */

import { Resend } from 'resend'
import { getCredentialsWithFallback } from '@/server/api-credentials'
import { BRAND } from '@/shared/constants/constants'

// ---------------------------------------------------------------------------
// Resend client (lazy-loaded, auto-refreshed)
// ---------------------------------------------------------------------------

let resendClient: Resend | null = null
let resendClientCreatedAt: number = 0
const RESEND_CLIENT_TTL_MS = 60 * 60 * 1000 // 1 hour

async function getResendClient(): Promise<Resend> {
  const now = Date.now()
  if (resendClient && (now - resendClientCreatedAt) < RESEND_CLIENT_TTL_MS) {
    return resendClient
  }

  const credentials = await getCredentialsWithFallback('RESEND')
  const apiKey = credentials.apiKey || process.env.RESEND_API_KEY || ''
  resendClient = new Resend(apiKey)
  resendClientCreatedAt = now
  return resendClient
}

async function getFromEmail(): Promise<string> {
  const credentials = await getCredentialsWithFallback('RESEND')
  return credentials.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@brandingpioneers.in'
}

const APP_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

/**
 * Send an email via Resend.
 * This is the single low-level function all other helpers call.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const resend = await getResendClient()
    const fromEmail = await getFromEmail()

    const toAddresses = Array.isArray(options.to) ? options.to : [options.to]

    const { data, error } = await resend.emails.send({
      from: options.from || `${BRAND.appName} <${fromEmail}>`,
      to: toAddresses,
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('[Email] Send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

// ---------------------------------------------------------------------------
// Magic Link Email
// ---------------------------------------------------------------------------

interface SendMagicLinkOptions {
  to: string
  token: string
  firstName: string
}

export async function sendMagicLinkEmail({ to, token, firstName }: SendMagicLinkOptions) {
  const magicLink = `${APP_URL}/auth/magic?token=${token}`

  return sendEmail({
    to,
    subject: 'Your Login Link - Pioneer OS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0B0E14;">
        <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 16px 24px; border-radius: 16px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">Pioneer<span style="opacity: 0.9;">OS</span></span>
            </div>
          </div>

          <div style="background: linear-gradient(180deg, #141A25 0%, #0F1419 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
              Hey ${firstName}!
            </h1>
            <p style="color: #94A3B8; font-size: 16px; margin: 0 0 32px 0; text-align: center;">
              Click the button below to sign in to Pioneer OS
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Sign In to Pioneer OS
              </a>
            </div>

            <p style="color: #64748B; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
              This link expires in <strong style="color: #F59E0B;">30 minutes</strong>
            </p>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;"></div>

            <p style="color: #64748B; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="color: #3B82F6; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
              ${magicLink}
            </p>
          </div>

          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Didn't request this? You can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

// ---------------------------------------------------------------------------
// Admin Magic Link Email (Branding Pioneers branding)
// ---------------------------------------------------------------------------

interface SendAdminMagicLinkOptions {
  to: string
  token: string
  firstName: string
}

export async function sendAdminMagicLinkEmail({ to, token, firstName }: SendAdminMagicLinkOptions) {
  // Use brandingpioneers.in URL for admin magic links
  const magicLink = `https://brandingpioneers.in/auth/magic?token=${token}`

  return sendEmail({
    to,
    subject: 'Your Admin Login Link - Branding Pioneers',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 16px 24px; border-radius: 12px;">
              <span style="color: white; font-size: 20px; font-weight: bold;">Branding Pioneers</span>
            </div>
          </div>

          <div style="background: #f8f9fa; border-radius: 20px; padding: 40px; border: 1px solid #e5e7eb;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
              Hey ${firstName}!
            </h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0; text-align: center;">
              Click the button below to sign in to Branding Pioneers Admin
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Sign In to Branding Pioneers
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
              This link expires in <strong style="color: #f59e0b;">24 hours</strong>
            </p>

            <div style="border-top: 1px solid #e5e7eb; margin: 24px 0;"></div>

            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="color: #1a1a2e; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
              ${magicLink}
            </p>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <img src="https://media.licdn.com/dms/image/v2/D560BAQGT-4AkgFOddw/company-logo_200_200/company-logo_200_200/0/1707465236952/branding_pioneers_logo?e=2147483647&v=beta&t=ija9ZpUW4n7IqvXbi0baAKUyo2q20DBV2dDH5g5rJm8" alt="Branding Pioneers" style="width: 48px; height: 48px; border-radius: 50%; margin-bottom: 12px;" />
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Branding Pioneers<br />
              <a href="https://brandingpioneers.in" style="color: #1a1a2e; text-decoration: none;">brandingpioneers.in</a>
            </p>
          </div>

          <p style="color: #d1d5db; font-size: 12px; text-align: center; margin-top: 24px;">
            Didn't request this? You can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

// ---------------------------------------------------------------------------
// Onboarding Email
// ---------------------------------------------------------------------------

interface SendOnboardingEmailOptions {
  to: string
  name: string
  onboardingUrl: string
  expiresAt: Date
}

export async function sendOnboardingEmail({ to, name, onboardingUrl, expiresAt }: SendOnboardingEmailOptions) {
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return sendEmail({
    to,
    subject: `Complete Your Onboarding - ${BRAND.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0B0E14;">
        <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 16px 24px; border-radius: 16px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">Branding<span style="opacity: 0.9;">Pioneers</span></span>
            </div>
          </div>

          <div style="background: linear-gradient(180deg, #141A25 0%, #0F1419 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
              Hi ${name || 'there'}!
            </h1>
            <p style="color: #94A3B8; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
              Please complete your onboarding to get started with our services.
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${onboardingUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Complete Onboarding
              </a>
            </div>

            <p style="color: #64748B; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
              This link expires in <strong style="color: #F59E0B;">${daysUntilExpiry} days</strong>
            </p>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;"></div>

            <p style="color: #64748B; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="color: #3B82F6; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
              ${onboardingUrl}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// ---------------------------------------------------------------------------
// Invoice Emails
// ---------------------------------------------------------------------------

interface InvoiceEmailData {
  clientName: string
  contactName?: string
  invoiceNumber: string
  amount: string
  dueDate: string
  currency: string
  notes?: string
}

export async function sendInvoiceEmail(to: string, data: InvoiceEmailData): Promise<EmailResult> {
  const displayName = data.contactName || data.clientName
  return sendEmail({
    to,
    subject: `Invoice ${data.invoiceNumber} - ${BRAND.name}`,
    replyTo: 'accounts@brandingpioneers.com',
    text: `Dear ${displayName},

Greetings from ${BRAND.name}!

Please find below the invoice details:

Invoice Number: ${data.invoiceNumber}
Amount: ${data.currency} ${data.amount}
Due Date: ${data.dueDate}

${data.notes || ''}

Please ensure timely payment to continue uninterrupted services.

For any queries, feel free to reach out to our accounts team.

Best regards,
Accounts Team
${BRAND.name}
accounts@brandingpioneers.com`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${BRAND.name}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Invoice Notification</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin-top: 0;">Dear ${displayName},</p>
          <p>Greetings from ${BRAND.name}!</p>
          <p>Please find below the invoice details for your review:</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><strong style="color: #6b7280;">Invoice Number</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;"><strong style="color: #1f2937;">${data.invoiceNumber}</strong></td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><strong style="color: #6b7280;">Amount</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;"><strong style="color: #059669; font-size: 18px;">${data.currency} ${data.amount}</strong></td></tr>
              <tr><td style="padding: 10px 0;"><strong style="color: #6b7280;">Due Date</strong></td><td style="padding: 10px 0; text-align: right;"><strong style="color: #dc2626;">${data.dueDate}</strong></td></tr>
            </table>
          </div>
          ${data.notes ? `<p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;"><strong>Note:</strong> ${data.notes}</p>` : ''}
          <p>Please ensure timely payment to continue uninterrupted services.</p>
          <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong><br>${BRAND.name}</p>
        </div>
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated email from ${BRAND.name}.</p>
        </div>
      </body>
      </html>
    `,
  })
}

interface PaymentReminderData {
  clientName: string
  contactName?: string
  invoiceNumber: string
  amount: string
  dueDate: string
  daysOverdue?: number
  currency: string
}

export async function sendPaymentReminderEmail(to: string, data: PaymentReminderData): Promise<EmailResult> {
  const displayName = data.contactName || data.clientName
  const isOverdue = data.daysOverdue && data.daysOverdue > 0
  return sendEmail({
    to,
    subject: `Payment Reminder: Invoice ${data.invoiceNumber} ${isOverdue ? `(${data.daysOverdue} days overdue)` : ''}`,
    replyTo: 'accounts@brandingpioneers.com',
    text: `Dear ${displayName},

This is a friendly reminder regarding the pending payment for Invoice ${data.invoiceNumber}.

Amount Due: ${data.currency} ${data.amount}
Due Date: ${data.dueDate}
${isOverdue ? `Days Overdue: ${data.daysOverdue}` : ''}

Please process the payment at your earliest convenience.

If you have already made the payment, please ignore this reminder.

Best regards,
Accounts Team
${BRAND.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${isOverdue && data.daysOverdue! > 7 ? '#dc2626' : '#f59e0b'}; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Payment Reminder</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Invoice ${data.invoiceNumber}</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin-top: 0;">Dear ${displayName},</p>
          <p>This is a friendly reminder regarding the pending payment:</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid ${isOverdue ? '#fecaca' : '#fef3c7'};">
            <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 10px; text-align: center;">${data.currency} ${data.amount}</p>
            <p style="color: ${isOverdue ? '#dc2626' : '#6b7280'}; margin: 0; text-align: center;">Due: ${data.dueDate}${isOverdue ? `<br><strong>(${data.daysOverdue} days overdue)</strong>` : ''}</p>
          </div>
          <p>Please process the payment at your earliest convenience.</p>
          <p style="color: #6b7280; font-size: 14px;">If you have already made the payment, please ignore this reminder.</p>
          <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong><br>${BRAND.name}</p>
        </div>
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated reminder from ${BRAND.name}.</p>
        </div>
      </body>
      </html>
    `,
  })
}

interface PaymentReceivedData {
  clientName: string
  contactName?: string
  invoiceNumber: string
  amount: string
  transactionRef?: string
  currency: string
}

export async function sendPaymentReceivedEmail(to: string, data: PaymentReceivedData): Promise<EmailResult> {
  const displayName = data.contactName || data.clientName
  return sendEmail({
    to,
    subject: `Payment Received - Thank You! (Invoice ${data.invoiceNumber})`,
    replyTo: 'accounts@brandingpioneers.com',
    text: `Dear ${displayName},

Thank you for your payment!

We have received your payment of ${data.currency} ${data.amount} for Invoice ${data.invoiceNumber}.
${data.transactionRef ? `Transaction Reference: ${data.transactionRef}` : ''}

We appreciate your prompt payment and look forward to continuing our partnership.

Best regards,
Accounts Team
${BRAND.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">&#10003;</div>
          <h1 style="color: white; margin: 0; font-size: 24px;">Payment Received</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Thank you!</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin-top: 0;">Dear ${displayName},</p>
          <p>We have received your payment. Thank you!</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #d1fae5;">
            <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0 0 10px; text-align: center;">${data.currency} ${data.amount}</p>
            <p style="color: #6b7280; margin: 0; text-align: center;">Invoice: ${data.invoiceNumber}${data.transactionRef ? `<br>Ref: ${data.transactionRef}` : ''}</p>
          </div>
          <p>We appreciate your prompt payment and look forward to continuing our partnership.</p>
          <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong><br>${BRAND.name}</p>
        </div>
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated receipt from ${BRAND.name}.</p>
        </div>
      </body>
      </html>
    `,
  })
}
