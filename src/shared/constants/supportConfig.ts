/**
 * Support Contact Configuration
 *
 * Centralizes all support contact details used across the application.
 * Values come from environment variables with sensible fallbacks.
 */

export const supportConfig = {
  // Phone numbers
  phone: {
    display: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91 99999 99999',
    raw: process.env.NEXT_PUBLIC_SUPPORT_PHONE_RAW || '919999999999',
    href: `tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE_RAW || '+919999999999'}`,
  },

  // WhatsApp
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999',
    url: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999'}`,
  },

  // Email addresses
  email: {
    support: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@brandingpioneers.in',
    accounts: process.env.NEXT_PUBLIC_ACCOUNTS_EMAIL || 'accounts@brandingpioneers.in',
    hr: process.env.NEXT_PUBLIC_HR_EMAIL || 'hr@brandingpioneers.in',
    hello: process.env.NEXT_PUBLIC_HELLO_EMAIL || 'hello@brandingpioneers.in',
    noreply: process.env.RESEND_FROM_EMAIL || 'noreply@brandingpioneers.in',
  },

  // Business hours (IST)
  businessHours: {
    display: process.env.NEXT_PUBLIC_BUSINESS_HOURS || 'Mon-Sat, 10:00 AM - 7:00 PM IST',
    start: 10, // 10 AM
    end: 19, // 7 PM
    timezone: 'Asia/Kolkata',
  },

  // Company details
  company: {
    name: 'Branding Pioneers',
    shortName: 'BP',
    website: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://brandingpioneers.in',
    appUrl: process.env.NEXTAUTH_URL || 'https://app.brandingpioneers.in',
  },
}

/**
 * Get mailto link with optional subject
 */
export function getMailtoLink(email: keyof typeof supportConfig.email, subject?: string): string {
  const emailAddress = supportConfig.email[email]
  if (subject) {
    return `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}`
  }
  return `mailto:${emailAddress}`
}

/**
 * Get WhatsApp link with optional message
 */
export function getWhatsAppLink(message?: string): string {
  if (message) {
    return `${supportConfig.whatsapp.url}?text=${encodeURIComponent(message)}`
  }
  return supportConfig.whatsapp.url
}

/**
 * Check if current time is within business hours
 */
export function isWithinBusinessHours(): boolean {
  const now = new Date()
  const istOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }
  const hour = parseInt(new Intl.DateTimeFormat('en-US', istOptions).format(now))
  const day = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getDay()

  // Sunday = 0, Saturday = 6
  if (day === 0) return false // Closed on Sunday

  return hour >= supportConfig.businessHours.start && hour < supportConfig.businessHours.end
}
