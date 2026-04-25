'use client'

import { Skeleton } from '@/client/components/ui/Skeleton'

interface PortalPageSkeletonProps {
  /** Page title skeleton width */
  titleWidth?: string
  /** Number of stat cards to show */
  statCards?: number
  /** Number of list items to show */
  listItems?: number
  /** Show filter bar skeleton */
  showFilters?: boolean
}

/**
 * Standard loading skeleton for portal pages.
 * Replaces inconsistent spinner patterns with a uniform skeleton layout.
 */
export default function PortalPageSkeleton({
  titleWidth = 'w-48',
  statCards = 4,
  listItems = 5,
  showFilters = true,
}: PortalPageSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading page content">
      {/* Title */}
      <Skeleton className={`h-8 ${titleWidth}`} />

      {/* Stat cards */}
      {statCards > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(statCards, 4)} gap-4`}>
          {Array.from({ length: statCards }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl border border-white/10 p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      {showFilters && (
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      )}

      {/* List items */}
      <div className="space-y-3">
        {Array.from({ length: listItems }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4 max-w-[300px]" />
                <Skeleton className="h-4 w-1/2 max-w-[200px]" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  )
}
