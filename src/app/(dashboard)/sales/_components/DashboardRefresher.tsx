'use client'

import { useEffect, useCallback } from 'react'

interface DashboardRefresherProps {
  /** Interval in milliseconds to refresh (default: 30000 = 30 seconds) */
  interval?: number
  /** Optional custom refresh key to trigger additional refreshes */
  refreshKey?: string
}

/**
 * DashboardRefresher - Auto-refreshes server components on a given interval
 * Add this to any server component page to enable real-time updates
 */
export default function DashboardRefresher({
  interval = 30000,
  refreshKey,
}: DashboardRefresherProps) {
  const triggerRefresh = useCallback(() => {
    // Force a re-render by manipulating the router
    // This is a simple implementation that triggers a full page refresh
    window.location.reload()
  }, [])

  useEffect(() => {
    const timer = setInterval(triggerRefresh, interval)
    return () => clearInterval(timer)
  }, [interval, triggerRefresh])

  // Allow manual refresh via custom event
  useEffect(() => {
    const handleRefresh = () => {
      triggerRefresh()
    }
    window.addEventListener('dashboard-refresh', handleRefresh)
    return () => window.removeEventListener('dashboard-refresh', handleRefresh)
  }, [triggerRefresh])

  return null
}