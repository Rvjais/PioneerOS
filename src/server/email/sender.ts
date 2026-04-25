import { BRAND } from '@/shared/constants/constants'

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email')
    return false
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: options.from || `${BRAND.name} <${BRAND.email}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })
    return resp.ok
  } catch (err) {
    console.error('[Email] Failed to send:', err)
    return false
  }
}

// Pre-built email templates
export function onboardingLinkEmail(name: string, link: string, type: 'client' | 'employee'): EmailOptions {
  return {
    to: '',
    subject: type === 'client' ? `Complete Your Onboarding - ${BRAND.name}` : `Welcome! Complete Your Onboarding - ${BRAND.name}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2>Hi ${name},</h2><p>${type === 'client' ? 'We\'re excited to get started!' : 'Welcome to the team!'} Please complete your onboarding by clicking the link below:</p><a href="${link}" style="display:inline-block;background:#F97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Complete Onboarding</a><p style="color:#666;margin-top:20px">This link is valid for 30 days. If you have questions, reply to this email.</p><p>Best regards,<br>${BRAND.name}</p></div>`,
  }
}

export function magicLinkEmail(name: string, link: string): EmailOptions {
  return {
    to: '',
    subject: `Your Login Link - ${BRAND.name}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2>Hi ${name},</h2><p>Click below to access your portal:</p><a href="${link}" style="display:inline-block;background:#3B82F6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Access Portal</a><p style="color:#666;margin-top:20px">This link is for your use only.</p><p>Best regards,<br>${BRAND.name}</p></div>`,
  }
}

export function paymentConfirmationEmail(clientName: string, amount: string, invoiceNumber: string): EmailOptions {
  return {
    to: '',
    subject: `Payment Confirmed - ${invoiceNumber}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><h2>Payment Confirmed</h2><p>Dear ${clientName},</p><p>We've received your payment of <strong>${amount}</strong> against invoice <strong>${invoiceNumber}</strong>.</p><p>Thank you for your prompt payment!</p><p>Best regards,<br>${BRAND.name}</p></div>`,
  }
}
