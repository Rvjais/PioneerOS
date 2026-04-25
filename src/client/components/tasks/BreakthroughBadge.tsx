'use client'

interface BreakthroughBadgeProps {
  isBreakthrough?: boolean
  isBreakdown?: boolean
  status: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function BreakthroughBadge({
  isBreakthrough,
  isBreakdown,
  status,
  size = 'md',
  showLabel = false,
}: BreakthroughBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  }

  // Only show for completed or breakdown tasks
  if (status !== 'COMPLETED' && status !== 'BREAKDOWN') {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-white/10 flex items-center justify-center`}>
        <span className="text-slate-400">○</span>
      </div>
    )
  }

  if (isBreakthrough) {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center`}>
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {showLabel && <span className="text-xs text-green-400 font-medium">Breakthrough</span>}
      </div>
    )
  }

  if (isBreakdown) {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClasses[size]} rounded-full bg-red-500 flex items-center justify-center`}>
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        {showLabel && <span className="text-xs text-red-400 font-medium">Breakdown</span>}
      </div>
    )
  }

  // Completed but not same-day (neither breakthrough nor breakdown)
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-500 flex items-center justify-center`}>
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
}
