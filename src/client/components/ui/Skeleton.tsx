'use client'

import { cn } from '@/shared/utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rounded'
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Base Skeleton component for loading states
 */
export function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-white/5'

  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
    none: '',
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
    />
  )
}

/**
 * Text skeleton for loading text content
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`line-${i}`}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  )
}

/**
 * Table skeleton for loading table data
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-white/10 dark:border-slate-700">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`col-${i}`}
            className="h-4 flex-1"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                'h-4 flex-1',
                colIndex === 0 && 'max-w-[200px]'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Skeleton
