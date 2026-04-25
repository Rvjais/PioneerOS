'use client'

import { useState, useEffect } from 'react'

interface AdReport {
  id: string
  client: string
  reportType: 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  period: string
  status: 'GENERATED' | 'PENDING' | 'SENT'
  createdAt: string
  metrics: {
    spend: number
    leads: number
    conversions: number
    roas: number
  }
}

export default function AdReportsPage() {
  const [reports, setReports] = useState<AdReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/ads/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics data')
        const data = await res.json()

        // Build reports from top campaigns data
        const topCampaigns = data.topCampaigns || []
        const mapped: AdReport[] = topCampaigns.map((c: Record<string, unknown>, idx: number) => ({
          id: (c.id as string) || String(idx),
          client: (c.client as Record<string, string>)?.name || 'Unknown',
          reportType: 'WEEKLY' as const,
          period: 'Current Period',
          status: 'GENERATED' as const,
          createdAt: new Date().toISOString().split('T')[0],
          metrics: {
            spend: (c.spend as number) || 0,
            leads: (c.leads as number) || 0,
            conversions: (c.conversions as number) || 0,
            roas: (c.roas as number) || 0,
          },
        }))
        setReports(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">{error}</div>
  if (reports.length === 0) return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Ad Reports</h1>
        <p className="text-red-200">Generate and manage performance reports</p>
      </div>
      <div className="flex items-center justify-center h-64 text-slate-400">No reports found</div>
    </div>
  )

  const filteredReports = typeFilter === 'ALL' ? reports : reports.filter(r => r.reportType === typeFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-500/20 text-green-400'
      case 'GENERATED': return 'bg-blue-500/20 text-blue-400'
      case 'PENDING': return 'bg-amber-500/20 text-amber-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WEEKLY': return 'bg-purple-500/20 text-purple-400'
      case 'MONTHLY': return 'bg-blue-500/20 text-blue-400'
      case 'CUSTOM': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ad Reports</h1>
            <p className="text-red-200">Generate and manage performance reports</p>
          </div>
          <button className="px-4 py-2 glass-card text-red-400 rounded-lg font-medium hover:bg-red-500/10">
            + Generate Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Reports</p>
          <p className="text-3xl font-bold text-slate-200">{reports.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Sent</p>
          <p className="text-3xl font-bold text-green-400">{reports.filter(r => r.status === 'SENT').length}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Generated</p>
          <p className="text-3xl font-bold text-blue-400">{reports.filter(r => r.status === 'GENERATED').length}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{reports.filter(r => r.status === 'PENDING').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'WEEKLY', 'MONTHLY', 'CUSTOM'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === type
                ? 'bg-red-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-red-300'
            }`}
          >
            {type === 'ALL' ? 'All Reports' : type}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/10">
          {filteredReports.map(report => (
            <div key={report.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white">{report.client}</h3>
                  <p className="text-sm text-slate-400">{report.period}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(report.reportType)}`}>
                    {report.reportType}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Report Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div className="bg-slate-900/40 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Spend</p>
                  <p className="font-semibold text-slate-200">₹{(report.metrics.spend / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-slate-900/40 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Leads</p>
                  <p className="font-semibold text-green-400">{report.metrics.leads}</p>
                </div>
                <div className="bg-slate-900/40 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Conversions</p>
                  <p className="font-semibold text-blue-400">{report.metrics.conversions}</p>
                </div>
                <div className="bg-slate-900/40 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">ROAS</p>
                  <p className={`font-semibold ${report.metrics.roas >= 4 ? 'text-green-400' : report.metrics.roas >= 3 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {report.metrics.roas}x
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10">
                  View Report
                </button>
                <button className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10">
                  Download PDF
                </button>
                {report.status === 'GENERATED' && (
                  <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Send to Client
                  </button>
                )}
                {report.status === 'PENDING' && (
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Generate Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Report Templates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-white mb-2">Weekly Performance</h4>
            <p className="text-sm text-slate-300 mb-3">7-day campaign metrics with week-over-week comparison</p>
            <button className="text-sm text-red-400 font-medium hover:text-red-400">Use Template →</button>
          </div>
          <div className="glass-card rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-white mb-2">Monthly ROI Report</h4>
            <p className="text-sm text-slate-300 mb-3">Comprehensive ROI analysis with revenue attribution</p>
            <button className="text-sm text-red-400 font-medium hover:text-red-400">Use Template →</button>
          </div>
          <div className="glass-card rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-white mb-2">Campaign Deep Dive</h4>
            <p className="text-sm text-slate-300 mb-3">Detailed analysis of individual campaign performance</p>
            <button className="text-sm text-red-400 font-medium hover:text-red-400">Use Template →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
