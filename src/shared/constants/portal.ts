/**
 * Shared portal constants — status colors, priority styles, category labels.
 *
 * Consolidates patterns that were duplicated across 10+ portal pages.
 */

// ============================================
// STATUS COLORS (Tailwind badge classes)
// ============================================

/** Core color tokens reused across all status functions */
const STATUS_COLORS = {
  green: 'bg-green-500/20 text-green-400',
  blue: 'bg-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-red-500/20 text-red-400',
  purple: 'bg-purple-500/20 text-purple-400',
  orange: 'bg-orange-100 text-orange-700',
  muted: 'bg-slate-800/50 text-slate-200',
  mutedLight: 'bg-slate-800/50 text-slate-400',
} as const

/** Generic task/progress statuses (goals, onboarding, action items) */
export function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return STATUS_COLORS.green
    case 'IN_PROGRESS':
      return STATUS_COLORS.blue
    case 'PENDING':
      return STATUS_COLORS.amber
    case 'CANCELLED':
      return STATUS_COLORS.mutedLight
    default:
      return STATUS_COLORS.muted
  }
}

/** Meeting statuses */
export function getMeetingStatusColor(status: string): string {
  switch (status) {
    case 'SCHEDULED':
      return STATUS_COLORS.blue
    case 'COMPLETED':
      return STATUS_COLORS.green
    case 'CANCELLED':
      return STATUS_COLORS.red
    case 'RESCHEDULED':
      return STATUS_COLORS.amber
    default:
      return STATUS_COLORS.muted
  }
}

/** Invoice/payment statuses */
export function getInvoiceStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
      return STATUS_COLORS.green
    case 'SENT':
      return STATUS_COLORS.blue
    case 'DRAFT':
      return STATUS_COLORS.muted
    case 'OVERDUE':
      return STATUS_COLORS.red
    case 'CANCELLED':
      return STATUS_COLORS.mutedLight
    default:
      return STATUS_COLORS.muted
  }
}

/** Deliverable performance statuses */
export function getDeliverableStatusColor(status: string): string {
  switch (status) {
    case 'ON_TRACK':
      return STATUS_COLORS.green
    case 'OVER_DELIVERY':
      return STATUS_COLORS.blue
    case 'UNDER_DELIVERY':
      return STATUS_COLORS.amber
    default:
      return STATUS_COLORS.muted
  }
}

/** Contract statuses (with optional isFullySigned override) */
export function getContractStatusColor(status: string, isFullySigned?: boolean): string {
  if (isFullySigned) return STATUS_COLORS.green
  switch (status) {
    case 'DRAFT':
      return STATUS_COLORS.muted
    case 'PENDING_SIGNATURE':
      return STATUS_COLORS.amber
    case 'ACTIVE':
      return STATUS_COLORS.green
    case 'EXPIRED':
      return STATUS_COLORS.red
    default:
      return STATUS_COLORS.muted
  }
}

/** Contract status labels */
export function getContractStatusLabel(status: string, isFullySigned?: boolean): string {
  if (isFullySigned) return 'Active'
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'PENDING_SIGNATURE':
      return 'Pending Signature'
    case 'ACTIVE':
      return 'Active'
    case 'EXPIRED':
      return 'Expired'
    default:
      return status
  }
}

// ============================================
// PRIORITY STYLES
// ============================================

export const PRIORITY_STYLES: Record<string, string> = {
  LOW: STATUS_COLORS.muted,
  NORMAL: STATUS_COLORS.blue,
  MEDIUM: STATUS_COLORS.amber,
  HIGH: STATUS_COLORS.amber,
  URGENT: STATUS_COLORS.red,
}

export function getPriorityColor(priority: string): string {
  return PRIORITY_STYLES[priority] || STATUS_COLORS.muted
}

// ============================================
// TIER COLORS
// ============================================

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'ENTERPRISE':
      return STATUS_COLORS.purple
    case 'PREMIUM':
      return STATUS_COLORS.blue
    default:
      return STATUS_COLORS.muted
  }
}

// ============================================
// CATEGORY LABELS
// ============================================

export const NOTIFICATION_CATEGORIES: Record<string, string> = {
  GENERAL: 'General',
  BILLING: 'Billing',
  PROJECT: 'Project',
  APPROVAL: 'Approval',
  SYSTEM: 'System',
}

export const DOCUMENT_CATEGORIES: Record<string, string> = {
  GENERAL: 'General',
  CONTRACT: 'Contracts',
  REPORT: 'Reports',
  INVOICE: 'Invoices',
  BRAND_ASSET: 'Brand Assets',
  DELIVERABLE: 'Deliverables',
  OTHER: 'Other',
}

export const APPROVAL_TYPE_LABELS: Record<string, string> = {
  CONTENT: 'Content',
  CREATIVE: 'Creative',
  AD: 'Ad Campaign',
  CAMPAIGN: 'Campaign',
  REPORT: 'Report',
  OTHER: 'Other',
}

// ============================================
// NOTIFICATION TYPE STYLES
// ============================================

export const NOTIFICATION_TYPE_STYLES: Record<string, { bg: string; icon: string; iconColor: string }> = {
  INFO: {
    bg: 'bg-blue-500/10',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-blue-500',
  },
  SUCCESS: {
    bg: 'bg-green-500/10',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-green-500',
  },
  WARNING: {
    bg: 'bg-amber-500/10',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    iconColor: 'text-amber-500',
  },
  ERROR: {
    bg: 'bg-red-500/10',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-red-500',
  },
  ACTION_REQUIRED: {
    bg: 'bg-purple-500/10',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    iconColor: 'text-purple-500',
  },
}
