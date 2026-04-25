'use client'

import { useState, useEffect } from 'react'
import PageGuide from '@/client/components/ui/PageGuide'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

function getServiceLabel(service: string | Record<string, unknown>): string {
  if (typeof service === 'string') return service
  if (typeof service === 'object' && service !== null) {
    return (service.name as string) || (service.serviceId as string) || String(service)
  }
  return String(service)
}

interface DeliverableItem {
  name: string
  delivered: number
  total: number
}

interface DashboardData {
  client: {
    id: string
    name: string
    services?: (string | Record<string, unknown>)[]
  }
  deliverables: DeliverableItem[] | {
    total: number
    delivered: number
    pending: number
  }
  metrics?: {
    onTrack: number
    overDelivery: number
    underDelivery: number
  }
  stats?: {
    deliverablesOnTrack: number
    leadsGenerated: number
    leadsChange: number
    campaignScore: number
  }
}

export default function PerformancePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/client-portal/dashboard')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-40" statCards={4} listItems={3} />
  }

  if (!data) {
    return (
      <div className="glass-card rounded-xl p-8 text-center border border-white/10">
        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-1">No Performance Data</h3>
        <p className="text-slate-400">Performance metrics will appear once data is available.</p>
      </div>
    )
  }

  // Normalize deliverables: handle both array and object shapes
  const deliverableItems: DeliverableItem[] = Array.isArray(data.deliverables)
    ? data.deliverables
    : []

  const totalCount = Array.isArray(data.deliverables)
    ? data.deliverables.reduce((sum, d) => sum + d.total, 0)
    : data.deliverables?.total ?? 0

  const deliveredCount = Array.isArray(data.deliverables)
    ? data.deliverables.reduce((sum, d) => sum + d.delivered, 0)
    : data.deliverables?.delivered ?? 0

  const pendingCount = totalCount - deliveredCount

  const deliveryRate = totalCount > 0
    ? Math.round((deliveredCount / totalCount) * 100)
    : 0

  // Metrics may not be present when API returns array-style deliverables
  const metrics = data.metrics ?? { onTrack: 0, overDelivery: 0, underDelivery: 0 }
  const deliverablesOnTrack = data.stats?.deliverablesOnTrack ?? deliveryRate

  const totalMetrics = metrics.onTrack + metrics.overDelivery + metrics.underDelivery
  const onTrackPercent = totalMetrics > 0 ? Math.round((metrics.onTrack / totalMetrics) * 100) : deliverablesOnTrack
  const overDeliveryPercent = totalMetrics > 0 ? Math.round((metrics.overDelivery / totalMetrics) * 100) : 0

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="portal-performance"
        title="Performance Overview"
        description="See how your campaigns and projects are performing"
        steps={[
          { label: 'Review KPIs', description: 'Check delivery progress, on-track rate, and over-delivery metrics' },
          { label: 'Compare periods', description: 'See how deliverables break down across different service areas' },
          { label: 'Download reports', description: 'Visit the Reports page to download detailed performance reports' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Performance Overview</h1>
        <p className="text-slate-300 mt-1">Track your project performance and delivery metrics</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivery Progress */}
        <div className="glass-card rounded-xl p-6 shadow-none border border-white/10">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Overall Delivery Progress</h3>
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-white">{deliveryRate}%</span>
              <span className="text-sm text-slate-400">
                {deliveredCount} / {totalCount}
              </span>
            </div>
            <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${deliveryRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* On Track Rate */}
        <div className="glass-card rounded-xl p-6 shadow-none border border-white/10">
          <h3 className="text-sm font-medium text-slate-400 mb-4">On Track Rate</h3>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-green-400">{onTrackPercent}%</span>
            {totalMetrics > 0 && (
              <span className="text-slate-400 mb-1">
                {metrics.onTrack} items on track
              </span>
            )}
          </div>
          {totalMetrics > 0 && (
            <div className="mt-4 flex gap-2">
              <div className="flex-1 h-2 bg-green-200 rounded-full" style={{ flex: metrics.onTrack }} />
              <div className="flex-1 h-2 bg-blue-200 rounded-full" style={{ flex: metrics.overDelivery }} />
              <div className="flex-1 h-2 bg-amber-200 rounded-full" style={{ flex: metrics.underDelivery }} />
            </div>
          )}
        </div>

        {/* Over Delivery */}
        <div className="glass-card rounded-xl p-6 shadow-none border border-white/10">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Over Delivery</h3>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-blue-400">{overDeliveryPercent}%</span>
            {totalMetrics > 0 && (
              <span className="text-slate-400 mb-1">
                {metrics.overDelivery} items exceeding targets
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Deliverables Breakdown (when deliverables is an array) */}
      {deliverableItems.length > 0 && (
        <div className="glass-card rounded-xl p-6 shadow-none border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Deliverables Breakdown</h3>
          <div className="space-y-4">
            {deliverableItems.map((item, index) => {
              const pct = item.total > 0 ? Math.round((item.delivered / item.total) * 100) : 0
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">{item.name}</span>
                    <span className="text-sm text-slate-400">{item.delivered} / {item.total}</span>
                  </div>
                  <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Services (only if available) */}
      {data.client.services && data.client.services.length > 0 && (
        <div className="glass-card rounded-xl p-6 shadow-none border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Active Services</h3>
          <div className="flex flex-wrap gap-3">
            {data.client.services.map((service: string | Record<string, unknown>, index: number) => (
              <span
                key={String(service)}
                className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg font-medium"
              >
                {getServiceLabel(service)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Performance Breakdown (only if metrics data is present) */}
      {totalMetrics > 0 && (
        <div className="glass-card rounded-xl p-6 shadow-none border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Delivery Status Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-slate-200">On Track</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">{metrics.onTrack}</span>
                <div className="w-32 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${onTrackPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-slate-200">Over Delivery</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">{metrics.overDelivery}</span>
                <div className="w-32 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${overDeliveryPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-amber-500 rounded" />
                <span className="text-slate-200">Under Delivery</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">{metrics.underDelivery}</span>
                <div className="w-32 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${totalMetrics > 0 ? Math.round((metrics.underDelivery / totalMetrics) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Items Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-medium text-amber-800">Pending Deliverables</h4>
            <p className="text-amber-400 text-sm mt-1">
              You have {pendingCount} deliverable{pendingCount > 1 ? 's' : ''} pending this month.
              Check the Deliverables page for details.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
