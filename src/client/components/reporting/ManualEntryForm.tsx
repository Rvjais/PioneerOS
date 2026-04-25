'use client'

import { useState } from 'react'
import { Account, ImportBatch } from './types'

interface Props {
  clientId: string
  account: Account
  onBack: () => void
  onClose: () => void
  onComplete: (batch: ImportBatch) => void
}

// Platform metrics
const PLATFORM_METRICS: Record<string, Array<{ key: string; label: string; type: string }>> = {
  GOOGLE_ANALYTICS: [
    { key: 'sessions', label: 'Sessions', type: 'number' },
    { key: 'users', label: 'Users', type: 'number' },
    { key: 'newUsers', label: 'New Users', type: 'number' },
    { key: 'pageviews', label: 'Pageviews', type: 'number' },
    { key: 'bounceRate', label: 'Bounce Rate (%)', type: 'percentage' },
    { key: 'avgSessionDuration', label: 'Avg. Session Duration (sec)', type: 'duration' },
  ],
  GOOGLE_SEARCH_CONSOLE: [
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'percentage' },
    { key: 'position', label: 'Avg. Position', type: 'number' },
  ],
  GOOGLE_ADS: [
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'cost', label: 'Cost (INR)', type: 'currency' },
    { key: 'conversions', label: 'Conversions', type: 'number' },
    { key: 'cpc', label: 'CPC (INR)', type: 'currency' },
    { key: 'cpa', label: 'CPA (INR)', type: 'currency' },
  ],
  META_ADS: [
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'reach', label: 'Reach', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'spend', label: 'Spend (INR)', type: 'currency' },
    { key: 'conversions', label: 'Conversions', type: 'number' },
    { key: 'cpm', label: 'CPM (INR)', type: 'currency' },
  ],
  META_SOCIAL: [
    { key: 'followers', label: 'Total Followers', type: 'number' },
    { key: 'followersGained', label: 'New Followers', type: 'number' },
    { key: 'posts', label: 'Posts', type: 'number' },
    { key: 'reach', label: 'Reach', type: 'number' },
    { key: 'engagement', label: 'Engagements', type: 'number' },
    { key: 'engagementRate', label: 'Engagement Rate (%)', type: 'percentage' },
  ],
  LINKEDIN: [
    { key: 'followers', label: 'Total Followers', type: 'number' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'engagement', label: 'Engagements', type: 'number' },
    { key: 'engagementRate', label: 'Engagement Rate (%)', type: 'percentage' },
  ],
  YOUTUBE: [
    { key: 'subscribers', label: 'Subscribers', type: 'number' },
    { key: 'views', label: 'Views', type: 'number' },
    { key: 'watchTime', label: 'Watch Time (min)', type: 'duration' },
    { key: 'avgViewDuration', label: 'Avg. View Duration (sec)', type: 'duration' },
    { key: 'likes', label: 'Likes', type: 'number' },
    { key: 'comments', label: 'Comments', type: 'number' },
  ],
}

export default function ManualEntryForm({
  clientId,
  account,
  onBack,
  onClose,
  onComplete,
}: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [values, setValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const metrics = PLATFORM_METRICS[account.platform] || []

  const handleValueChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Build metrics array
    const metricsData = Object.entries(values)
      .filter(([, value]) => value !== '' && !isNaN(parseFloat(value)))
      .map(([metricType, value]) => ({
        metricType,
        value: parseFloat(value),
      }))

    if (metricsData.length === 0) {
      setError('Please enter at least one metric value')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/clients/${clientId}/import/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          date,
          metrics: metricsData,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add entry')
      }

      onComplete({
        id: data.batchId,
        platform: account.platform,
        importType: 'MANUAL',
        status: 'COMPLETED',
        totalRows: metricsData.length,
        successRows: metricsData.length,
        failedRows: 0,
        createdAt: new Date().toISOString(),
        errorLog: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-white">Manual Entry</h2>
              <p className="text-slate-400 text-sm">{account.accountName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Metrics
            </label>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div key={metric.key}>
                  <label className="block text-xs text-slate-400 mb-1">
                    {metric.label}
                  </label>
                  <input
                    type="number"
                    step={metric.type === 'percentage' ? '0.01' : '1'}
                    value={values[metric.key] || ''}
                    onChange={(e) => handleValueChange(metric.key, e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
