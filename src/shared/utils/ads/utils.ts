/**
 * Shared utility functions for the Ads portal.
 * Extracted from duplicated code across campaign, creative, budget, and performance pages.
 */

// Status color mapping for campaigns
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    PAUSED: 'bg-yellow-500/20 text-yellow-400',
    DRAFT: 'bg-slate-500/20 text-slate-400',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
    ARCHIVED: 'bg-slate-700/20 text-slate-500',
    RUNNING: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
    PENDING_REVIEW: 'bg-yellow-500/20 text-yellow-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    REJECTED: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-slate-500/20 text-slate-400'
}

// Status dot color for inline indicators
export function getStatusDotColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-400',
    PAUSED: 'bg-yellow-400',
    DRAFT: 'bg-slate-400',
    COMPLETED: 'bg-blue-400',
    ARCHIVED: 'bg-slate-500',
    RUNNING: 'bg-green-400',
    CANCELLED: 'bg-red-400',
  }
  return colors[status] || 'bg-slate-400'
}

// Platform color mapping
export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    GOOGLE: 'bg-blue-500/20 text-blue-400',
    META: 'bg-indigo-500/20 text-indigo-400',
    LINKEDIN: 'bg-sky-500/20 text-sky-400',
    YOUTUBE: 'bg-red-500/20 text-red-400',
    GOOGLE_ADS: 'bg-blue-500/20 text-blue-400',
    META_ADS: 'bg-indigo-500/20 text-indigo-400',
  }
  return colors[platform] || 'bg-slate-500/20 text-slate-400'
}

// Platform icon label
export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    GOOGLE: 'Google Ads',
    META: 'Meta Ads',
    LINKEDIN: 'LinkedIn Ads',
    YOUTUBE: 'YouTube Ads',
    GOOGLE_ADS: 'Google Ads',
    META_ADS: 'Meta Ads',
  }
  return labels[platform] || platform
}

// Consistent currency formatting using Intl.NumberFormat
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const currencyFormatterDecimal = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number, showDecimals = false): string {
  if (showDecimals) return currencyFormatterDecimal.format(amount)
  return currencyFormatter.format(amount)
}

// Compact currency (e.g., ₹1.2L, ₹45K)
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toFixed(0)}`
}

// Number formatting with commas
const numberFormatter = new Intl.NumberFormat('en-IN')

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

// Compact number (e.g., 1.2K, 45K, 1.2M)
export function formatNumberCompact(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
}

// Percentage formatting
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Get client display name — handles both string and object shapes
export function getClientName(client: string | { name?: string; id?: string } | null | undefined): string {
  if (!client) return 'Unknown Client'
  if (typeof client === 'string') return client
  return client.name || client.id || 'Unknown Client'
}

// Pacing status colors
export function getPacingColor(status: string): string {
  const colors: Record<string, string> = {
    ON_TRACK: 'text-green-400',
    UNDERSPEND: 'text-yellow-400',
    OVERSPEND: 'text-red-400',
  }
  return colors[status] || 'text-slate-400'
}

export function getPacingBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    ON_TRACK: 'bg-green-500/20 text-green-400',
    UNDERSPEND: 'bg-yellow-500/20 text-yellow-400',
    OVERSPEND: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-slate-500/20 text-slate-400'
}
