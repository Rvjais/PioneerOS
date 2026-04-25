'use client'

import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
}

/**
 * Badge component for status indicators, tags, and labels
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
  removable = false,
  onRemove,
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-800/50 text-slate-200 dark:bg-slate-700 dark:text-slate-300',
    primary: 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/20 dark:text-blue-400',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400 dark:bg-amber-500/20 dark:text-amber-400',
    danger: 'bg-red-500/20 text-red-400 dark:bg-red-500/20 dark:text-red-400',
    info: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    outline: 'bg-transparent border border-white/20 text-slate-300 dark:border-slate-600 dark:text-slate-400',
  }

  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-slate-900/40',
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    outline: 'bg-slate-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  className?: string
}

/**
 * Common status badge with predefined colors for typical statuses
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<string, BadgeVariant> = {
    // General statuses
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    completed: 'success',
    cancelled: 'danger',
    failed: 'danger',

    // Task statuses
    todo: 'default',
    in_progress: 'primary',
    done: 'success',
    blocked: 'danger',

    // Payment statuses
    paid: 'success',
    unpaid: 'danger',
    overdue: 'danger',
    partial: 'warning',

    // Health statuses
    healthy: 'success',
    warning: 'warning',
    at_risk: 'danger',
    critical: 'danger',

    // User statuses
    online: 'success',
    offline: 'default',
    away: 'warning',
    busy: 'danger',

    // Lead statuses
    new: 'primary',
    contacted: 'info',
    qualified: 'success',
    lost: 'danger',
    converted: 'success',
  }

  const normalizedStatus = status.toLowerCase().replace(/[- ]/g, '_')
  const variant = statusMap[normalizedStatus] || 'default'

  return (
    <Badge variant={variant} className={className} dot>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  )
}

interface TierBadgeProps {
  tier: 'ENTERPRISE' | 'PREMIUM' | 'STANDARD' | string
  className?: string
}

/**
 * Tier badge for client/subscription tiers
 */
export function TierBadge({ tier, className }: TierBadgeProps) {
  const tierStyles: Record<string, string> = {
    ENTERPRISE: 'bg-purple-500/20 text-purple-400 dark:bg-purple-500/20 dark:text-purple-400',
    PREMIUM: 'bg-blue-500/20 text-blue-400 dark:bg-blue-500/20 dark:text-blue-400',
    STANDARD: 'bg-slate-800/50 text-slate-300 dark:bg-slate-700 dark:text-slate-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full',
        tierStyles[tier] || tierStyles.STANDARD,
        className
      )}
    >
      {tier}
    </span>
  )
}

interface CountBadgeProps {
  count: number
  max?: number
  variant?: BadgeVariant
  className?: string
}

/**
 * Count badge for showing notification counts, etc.
 */
export function CountBadge({ count, max = 99, variant = 'danger', className }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString()

  if (count === 0) return null

  return (
    <Badge variant={variant} size="sm" className={cn('min-w-[1.25rem] justify-center', className)}>
      {displayCount}
    </Badge>
  )
}

export default Badge
