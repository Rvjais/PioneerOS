/**
 * Accounts Module Configuration
 *
 * Centralizes all configurable business logic for the accounts module.
 * Values can be overridden via environment variables.
 */

// Tax Configuration
export const TAX_CONFIG = {
  // TDS (Tax Deducted at Source)
  TDS_DEFAULT_PERCENTAGE: parseFloat(process.env.TDS_DEFAULT_PERCENTAGE || '10'),
  TDS_MIN_PERCENTAGE: 0,
  TDS_MAX_PERCENTAGE: 30,

  // GST (Goods and Services Tax)
  GST_DEFAULT_PERCENTAGE: parseFloat(process.env.GST_DEFAULT_PERCENTAGE || '18'),
  GST_CGST_PERCENTAGE: 9, // Central GST
  GST_SGST_PERCENTAGE: 9, // State GST
  GST_IGST_PERCENTAGE: 18, // Integrated GST (for inter-state)
}

// Invoice Configuration
export const INVOICE_CONFIG = {
  // Day of month limits for scheduling
  MIN_GENERATE_DAY: 1,
  MAX_GENERATE_DAY: 28,
  MIN_SEND_DAY: 1,
  MAX_SEND_DAY: 28,

  // Default payment terms
  DEFAULT_PAYMENT_TERMS: 'NET_15' as const,
  PAYMENT_TERMS_DAYS: {
    'IMMEDIATE': 0,
    'NET_7': 7,
    'NET_15': 15,
    'NET_30': 30,
    'NET_45': 45,
    'NET_60': 60,
    'CUSTOM': 0,
  },

  // Invoice number format
  DEFAULT_PREFIX: 'BP',
  NUMBER_FORMAT: 'PREFIX-YYMMNNNN', // e.g., BP-24030001

  // Currency
  DEFAULT_CURRENCY: 'INR',
  SUPPORTED_CURRENCIES: ['INR', 'USD', 'EUR', 'GBP'],
}

// Email Configuration
export const EMAIL_CONFIG = {
  ENABLED: process.env.EMAIL_ENABLED === 'true',
  FROM_EMAIL: process.env.EMAIL_FROM || 'accounts@brandingpioneers.com',
  FROM_NAME: process.env.EMAIL_FROM_NAME || 'Branding Pioneers Accounts',
  REPLY_TO: process.env.EMAIL_REPLY_TO || 'accounts@brandingpioneers.com',

  // SMTP Settings (for nodemailer)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  // SendGrid (alternative)
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  USE_SENDGRID: process.env.USE_SENDGRID === 'true',
}

// Payment Configuration
export const PAYMENT_CONFIG = {
  // Payment methods
  DEFAULT_PAYMENT_METHOD: 'NEFT' as const,
  SUPPORTED_METHODS: ['NEFT', 'RTGS', 'IMPS', 'UPI', 'CHEQUE', 'CASH', 'CARD', 'OTHER'],

  // Payment status
  PAYMENT_STATUSES: ['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED', 'PARTIAL'],

  // Follow-up statuses for payment tracking
  FOLLOW_UP_STATUSES: [
    'DONE',
    'PENDING',
    'REMIND',
    'IN_PROCESS',
    'CALL_NOT_PICKED',
    'WILL_PAY',
    'PAYMENT_RECEIVED',
    'WIP',
    'PARTIAL',
    'HOLD'
  ],

  // Overdue thresholds (days)
  OVERDUE_WARNING_DAYS: 7,
  OVERDUE_CRITICAL_DAYS: 15,
  OVERDUE_SEVERE_DAYS: 30,
}

// ROI Configuration
export const ROI_CONFIG = {
  // Department to service code mapping
  DEPARTMENT_SERVICE_MAP: {
    'SEO': 'SEO',
    'SOCIAL': 'SM',
    'ADS': 'ADS',
    'WEB': 'WEB',
    'AI_TOOLS': 'AI',
  } as Record<string, string>,

  // Departments tracked for ROI
  TRACKED_DEPARTMENTS: ['SEO', 'SOCIAL', 'ADS', 'WEB', 'AI_TOOLS'],

  // ROI thresholds for color coding
  ROI_THRESHOLDS: {
    NEGATIVE: 0,
    LOW: 20,
    GOOD: 40,
    EXCELLENT: 60,
  },

  // Default attribution weight when client has multiple services
  DEFAULT_EQUAL_WEIGHT: true, // If true, revenue split equally among services
}

// Bank Reconciliation Configuration
export const RECONCILIATION_CONFIG = {
  // Matching confidence thresholds
  AUTO_MATCH_THRESHOLD: 0.85, // 85% confidence for auto-match
  SUGGEST_MATCH_THRESHOLD: 0.60, // 60% confidence for suggestions

  // Duplicate detection
  DUPLICATE_AMOUNT_TOLERANCE: 0.01, // 1% tolerance for amount matching
  DUPLICATE_DATE_RANGE_DAYS: 3, // Consider duplicates within 3 days

  // Transaction categories
  TRANSACTION_CATEGORIES: [
    'CLIENT_PAYMENT',
    'SALARY',
    'VENDOR_PAYMENT',
    'TOOLS_SUBSCRIPTION',
    'OFFICE_EXPENSE',
    'TAX_PAYMENT',
    'REFUND',
    'TRANSFER',
    'OTHER'
  ],
}

// Client Tier Thresholds
export const TIER_CONFIG = {
  ENTERPRISE_MIN_VALUE: 300000, // Rs. 3 Lakh+ monthly value
  PREMIUM_MIN_VALUE: 100000,    // Rs. 1 Lakh+ monthly value
  STANDARD_MIN_VALUE: 25000,    // Rs. 25,000+ monthly value
  STARTER_MIN_VALUE: 15000,     // Rs. 15,000+ monthly value
  // Below STARTER_MIN_VALUE is MICRO tier
}

// Entity Configuration (for multi-entity support)
export const ENTITY_CONFIG = {
  DEFAULT_ENTITY: 'BRANDING_PIONEERS',
  ENTITIES: [
    { id: 'BRANDING_PIONEERS', name: 'Branding Pioneers', gstNumber: '' },
    { id: 'ATZ_MEDAPPZ', name: 'ATZ Medappz', gstNumber: '' },
  ],
}

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  // Payment reminders
  PAYMENT_REMINDER_DAYS_BEFORE: [7, 3, 1, 0], // Days before due date
  PAYMENT_REMINDER_DAYS_AFTER: [1, 3, 7, 14], // Days after due date

  // Channels
  DEFAULT_CHANNELS: {
    INVOICE: ['WHATSAPP', 'EMAIL'],
    REMINDER: ['WHATSAPP'],
    RECEIPT: ['EMAIL'],
  },
}

// Helper functions
export function calculateTDS(amount: number, percentage?: number): number {
  const tdsPercent = percentage ?? TAX_CONFIG.TDS_DEFAULT_PERCENTAGE
  return Math.round((amount * tdsPercent / 100) * 100) / 100
}

export function calculateGST(amount: number, percentage?: number): number {
  const gstPercent = percentage ?? TAX_CONFIG.GST_DEFAULT_PERCENTAGE
  return Math.round((amount * gstPercent / 100) * 100) / 100
}

export function calculateNetAmount(grossAmount: number, tds: number): number {
  return Math.round((grossAmount - tds) * 100) / 100
}

export function getDueDateFromTerms(terms: keyof typeof INVOICE_CONFIG.PAYMENT_TERMS_DAYS, customDays?: number): Date {
  const days = terms === 'CUSTOM' ? (customDays || 0) : INVOICE_CONFIG.PAYMENT_TERMS_DAYS[terms]
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + days)
  return dueDate
}

export function getServiceCodeFromDepartment(department: string): string {
  return ROI_CONFIG.DEPARTMENT_SERVICE_MAP[department] || department
}

export function getDepartmentFromServiceCode(serviceCode: string): string | null {
  const entry = Object.entries(ROI_CONFIG.DEPARTMENT_SERVICE_MAP)
    .find(([, code]) => code === serviceCode)
  return entry ? entry[0] : null
}

/**
 * Parse client services string and count unique services
 * Supports formats: "SEO,SM,ADS" or "SEO, SM, ADS" or "SEO|SM|ADS"
 */
export function parseClientServices(servicesString: string): string[] {
  if (!servicesString) return []

  // Handle different separators
  const separator = servicesString.includes('|') ? '|' : ','
  return servicesString
    .split(separator)
    .map(s => s.trim().toUpperCase())
    .filter(s => s.length > 0)
}

/**
 * Count services for a department from client services string
 */
export function countServicesForDepartment(servicesString: string, department: string): number {
  const services = parseClientServices(servicesString)
  const serviceCode = getServiceCodeFromDepartment(department)
  return services.filter(s => s === serviceCode).length > 0 ? 1 : 0
}

/**
 * Get total service count from services string
 */
export function getTotalServiceCount(servicesString: string): number {
  return parseClientServices(servicesString).length
}
