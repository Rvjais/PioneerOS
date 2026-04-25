/**
 * Email Service for Accounts Notifications
 *
 * Supports both SMTP (nodemailer) and SendGrid for sending emails.
 * Configure via environment variables in .env
 */

import { EMAIL_CONFIG } from '@/shared/constants/config/accounts'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content?: string | Buffer
    path?: string
    contentType?: string
  }>
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send email using SMTP (nodemailer)
 * Note: nodemailer is imported dynamically to avoid build issues if not installed
 */
async function sendViaSMTP(options: EmailOptions): Promise<EmailResult> {
  try {
    // Dynamic import to handle cases where nodemailer isn't installed
    // @ts-ignore - nodemailer may not be installed
    const nodemailer = await import('nodemailer').catch(() => null)

    if (!nodemailer) {
      return {
        success: false,
        error: 'nodemailer package not installed. Run: npm install nodemailer @types/nodemailer',
      }
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.SMTP_HOST,
      port: EMAIL_CONFIG.SMTP_PORT,
      secure: EMAIL_CONFIG.SMTP_SECURE,
      auth: {
        user: EMAIL_CONFIG.SMTP_USER,
        pass: EMAIL_CONFIG.SMTP_PASS,
      },
    })

    const mailOptions = {
      from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo || EMAIL_CONFIG.REPLY_TO,
      attachments: options.attachments,
    }

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('SMTP Email Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email via SMTP',
    }
  }
}

/**
 * Send email using SendGrid API
 */
async function sendViaSendGrid(options: EmailOptions): Promise<EmailResult> {
  try {
    if (!EMAIL_CONFIG.SENDGRID_API_KEY) {
      return {
        success: false,
        error: 'SendGrid API key not configured',
      }
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_CONFIG.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: EMAIL_CONFIG.FROM_EMAIL, name: EMAIL_CONFIG.FROM_NAME },
        reply_to: { email: options.replyTo || EMAIL_CONFIG.REPLY_TO },
        subject: options.subject,
        content: [
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
          ...(options.html ? [{ type: 'text/html', value: options.html }] : []),
        ],
      }),
    })

    if (response.ok) {
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `SendGrid error: ${response.status} - ${JSON.stringify(errorData)}`,
      }
    }
  } catch (error) {
    console.error('SendGrid Email Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email via SendGrid',
    }
  }
}

/**
 * Main email sending function
 * Automatically chooses between SMTP and SendGrid based on configuration
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!EMAIL_CONFIG.ENABLED) {
    console.log('Email sending disabled. Would have sent:', options.subject, 'to', options.to)
    return {
      success: true,
      messageId: 'email-disabled-mock',
    }
  }

  if (EMAIL_CONFIG.USE_SENDGRID && EMAIL_CONFIG.SENDGRID_API_KEY) {
    return sendViaSendGrid(options)
  }

  if (EMAIL_CONFIG.SMTP_USER && EMAIL_CONFIG.SMTP_PASS) {
    return sendViaSMTP(options)
  }

  // Fallback: log the email intent
  console.log('Email not configured. Would have sent:', options.subject, 'to', options.to)
  return {
    success: false,
    error: 'Email service not configured. Set SMTP credentials or SendGrid API key.',
  }
}

/**
 * Invoice Email Templates
 */
export const InvoiceEmailTemplates = {
  invoiceGenerated: (data: {
    clientName: string
    contactName: string
    invoiceNumber: string
    amount: string
    dueDate: string
    currency: string
    notes?: string
  }) => ({
    subject: `Invoice ${data.invoiceNumber} - Branding Pioneers`,
    text: `Dear ${data.contactName || data.clientName},

Greetings from Branding Pioneers!

Please find below the invoice details:

Invoice Number: ${data.invoiceNumber}
Amount: ${data.currency} ${data.amount}
Due Date: ${data.dueDate}

${data.notes || ''}

Please ensure timely payment to continue uninterrupted services.

For any queries, feel free to reach out to our accounts team.

Best regards,
Accounts Team
Branding Pioneers
accounts@brandingpioneers.com`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Branding Pioneers</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Invoice Notification</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Dear ${data.contactName || data.clientName},</p>

    <p>Greetings from Branding Pioneers!</p>

    <p>Please find below the invoice details for your review:</p>

    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <strong style="color: #6b7280;">Invoice Number</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
            <strong style="color: #1f2937;">${data.invoiceNumber}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <strong style="color: #6b7280;">Amount</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
            <strong style="color: #059669; font-size: 18px;">${data.currency} ${data.amount}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0;">
            <strong style="color: #6b7280;">Due Date</strong>
          </td>
          <td style="padding: 10px 0; text-align: right;">
            <strong style="color: #dc2626;">${data.dueDate}</strong>
          </td>
        </tr>
      </table>
    </div>

    ${data.notes ? `<p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;"><strong>Note:</strong> ${data.notes}</p>` : ''}

    <p>Please ensure timely payment to continue uninterrupted services.</p>

    <p>For any queries, feel free to reach out to our accounts team.</p>

    <p style="margin-bottom: 0;">
      Best regards,<br>
      <strong>Accounts Team</strong><br>
      Branding Pioneers
    </p>
  </div>

  <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      This is an automated email from Branding Pioneers Accounts System.<br>
      Please do not reply directly to this email.
    </p>
  </div>
</body>
</html>`,
  }),

  paymentReminder: (data: {
    clientName: string
    contactName: string
    invoiceNumber: string
    amount: string
    dueDate: string
    daysOverdue?: number
    currency: string
  }) => ({
    subject: `Payment Reminder: Invoice ${data.invoiceNumber} ${data.daysOverdue && data.daysOverdue > 0 ? `(${data.daysOverdue} days overdue)` : ''}`,
    text: `Dear ${data.contactName || data.clientName},

This is a friendly reminder regarding the pending payment for Invoice ${data.invoiceNumber}.

Amount Due: ${data.currency} ${data.amount}
Due Date: ${data.dueDate}
${data.daysOverdue && data.daysOverdue > 0 ? `Days Overdue: ${data.daysOverdue}` : ''}

Please process the payment at your earliest convenience to avoid any service interruption.

If you have already made the payment, please ignore this reminder.

Best regards,
Accounts Team
Branding Pioneers`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${data.daysOverdue && data.daysOverdue > 7 ? '#dc2626' : '#f59e0b'}; padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Payment Reminder</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Invoice ${data.invoiceNumber}</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Dear ${data.contactName || data.clientName},</p>

    <p>This is a friendly reminder regarding the pending payment:</p>

    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid ${data.daysOverdue && data.daysOverdue > 0 ? '#fecaca' : '#fef3c7'};">
      <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 10px; text-align: center;">
        ${data.currency} ${data.amount}
      </p>
      <p style="color: ${data.daysOverdue && data.daysOverdue > 0 ? '#dc2626' : '#6b7280'}; margin: 0; text-align: center;">
        Due: ${data.dueDate}
        ${data.daysOverdue && data.daysOverdue > 0 ? `<br><strong>(${data.daysOverdue} days overdue)</strong>` : ''}
      </p>
    </div>

    <p>Please process the payment at your earliest convenience to avoid any service interruption.</p>

    <p style="color: #6b7280; font-size: 14px;">If you have already made the payment, please ignore this reminder.</p>

    <p style="margin-bottom: 0;">
      Best regards,<br>
      <strong>Accounts Team</strong><br>
      Branding Pioneers
    </p>
  </div>

  <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      This is an automated reminder from Branding Pioneers.<br>
      For queries, contact accounts@brandingpioneers.com
    </p>
  </div>
</body>
</html>`,
  }),

  paymentReceived: (data: {
    clientName: string
    contactName: string
    invoiceNumber: string
    amount: string
    transactionRef?: string
    currency: string
  }) => ({
    subject: `Payment Received - Thank You! (Invoice ${data.invoiceNumber})`,
    text: `Dear ${data.contactName || data.clientName},

Thank you for your payment!

We have received your payment of ${data.currency} ${data.amount} for Invoice ${data.invoiceNumber}.
${data.transactionRef ? `Transaction Reference: ${data.transactionRef}` : ''}

We appreciate your prompt payment and look forward to continuing our partnership.

Best regards,
Accounts Team
Branding Pioneers`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 10px;">&#10003;</div>
    <h1 style="color: white; margin: 0; font-size: 24px;">Payment Received</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Thank you!</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Dear ${data.contactName || data.clientName},</p>

    <p>We have received your payment. Thank you!</p>

    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #d1fae5;">
      <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0 0 10px; text-align: center;">
        ${data.currency} ${data.amount}
      </p>
      <p style="color: #6b7280; margin: 0; text-align: center;">
        Invoice: ${data.invoiceNumber}
        ${data.transactionRef ? `<br>Ref: ${data.transactionRef}` : ''}
      </p>
    </div>

    <p>We appreciate your prompt payment and look forward to continuing our partnership.</p>

    <p style="margin-bottom: 0;">
      Best regards,<br>
      <strong>Accounts Team</strong><br>
      Branding Pioneers
    </p>
  </div>

  <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
      This is an automated receipt from Branding Pioneers.
    </p>
  </div>
</body>
</html>`,
  }),
}

/**
 * Send invoice email to client
 */
export async function sendInvoiceEmail(
  to: string,
  invoiceData: Parameters<typeof InvoiceEmailTemplates.invoiceGenerated>[0]
): Promise<EmailResult> {
  const template = InvoiceEmailTemplates.invoiceGenerated(invoiceData)
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  })
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminderEmail(
  to: string,
  reminderData: Parameters<typeof InvoiceEmailTemplates.paymentReminder>[0]
): Promise<EmailResult> {
  const template = InvoiceEmailTemplates.paymentReminder(reminderData)
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  })
}

/**
 * Send payment received confirmation email
 */
export async function sendPaymentReceivedEmail(
  to: string,
  paymentData: Parameters<typeof InvoiceEmailTemplates.paymentReceived>[0]
): Promise<EmailResult> {
  const template = InvoiceEmailTemplates.paymentReceived(paymentData)
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  })
}
