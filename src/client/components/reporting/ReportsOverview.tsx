'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import MetricCard from './MetricCard'
import DateRangePicker from './DateRangePicker'

type Preset = 'today' | '7d' | '30d' | '90d' | 'custom'

interface PlatformSummary {
  platform: string
  name: string
  color: string
  hasData: boolean
  primaryKPI: {
    label: string
    value: number
    formattedValue: string
    change?: number
    changePercent?: number
    trend: 'up' | 'down' | 'neutral'
  } | null
  accountCount: number
}

interface DashboardData {
  dateRange: { from: string; to: string }
  platforms: PlatformSummary[]
  totalAccounts: number
  recentImports: Array<{
    id: string
    platform: string
    importType: string
    status: string
    totalRows: number
    createdAt: string
  }>
}

const PLATFORM_CONFIG: Record<string, { name: string; color: string; shortName: string }> = {
  GOOGLE_ANALYTICS: { name: 'Google Analytics', color: '#F9AB00', shortName: 'GA' },
  GOOGLE_SEARCH_CONSOLE: { name: 'Search Console', color: '#4285F4', shortName: 'GSC' },
  GOOGLE_ADS: { name: 'Google Ads', color: '#34A853', shortName: 'GAds' },
  META_ADS: { name: 'Meta Ads', color: '#1877F2', shortName: 'Meta' },
  META_SOCIAL: { name: 'Meta Social', color: '#E4405F', shortName: 'Social' },
  LINKEDIN: { name: 'LinkedIn', color: '#0A66C2', shortName: 'LI' },
  YOUTUBE: { name: 'YouTube', color: '#FF0000', shortName: 'YT' },
}

interface Props {
  clientId: string
  clientName: string
  platformsWithData: string[]
}

export default function ReportsOverview({
  clientId,
  clientName,
  platformsWithData,
}: Props) {
  const [datePreset, setDatePreset] = useState<Preset>('30d')
  const [customFrom, setCustomFrom] = useState<string>()
  const [customTo, setCustomTo] = useState<string>()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [datePreset, customFrom, customTo])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      let url = `/api/clients/${clientId}/dashboard/overview?preset=${datePreset}`
      if (datePreset === 'custom' && customFrom && customTo) {
        url += `&from=${customFrom}&to=${customTo}`
      }

      const res = await fetch(url)
      if (res.ok) {
        const dashboardData = await res.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (preset: Preset, from?: string, to?: string) => {
    setDatePreset(preset)
    if (preset === 'custom' && from && to) {
      setCustomFrom(from)
      setCustomTo(to)
    }
  }

  const getPlatformLink = (platform: string) => {
    const routes: Record<string, string> = {
      GOOGLE_ANALYTICS: 'google-analytics',
      GOOGLE_SEARCH_CONSOLE: 'search-console',
      GOOGLE_ADS: 'google-ads',
      META_ADS: 'meta-ads',
      META_SOCIAL: 'meta-social',
      LINKEDIN: 'linkedin',
      YOUTUBE: 'youtube',
    }
    return `/clients/${clientId}/reports/${routes[platform] || platform.toLowerCase()}`
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center justify-between">
        <DateRangePicker
          value={datePreset}
          customFrom={customFrom}
          customTo={customTo}
          onChange={handleDateChange}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={`skeleton-${i}`} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-3" />
              <div className="h-8 bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Platform Cards */}
      {!isLoading && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.platforms
              .filter((p) => p.hasData)
              .map((platform) => (
                <Link
                  key={platform.platform}
                  href={getPlatformLink(platform.platform)}
                  className="block hover:scale-[1.02] transition-transform"
                >
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          <span
                            style={{ color: platform.color }}
                            className="text-xs font-bold"
                          >
                            {PLATFORM_CONFIG[platform.platform]?.shortName || platform.platform.slice(0, 2)}
                          </span>
                        </div>
                        <span className="font-medium text-white text-sm">
                          {platform.name}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    {platform.primaryKPI ? (
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {platform.primaryKPI.formattedValue}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-400 text-sm">
                            {platform.primaryKPI.label}
                          </span>
                          {platform.primaryKPI.changePercent !== undefined && (
                            <span
                              className={`text-xs ${
                                platform.primaryKPI.trend === 'up'
                                  ? 'text-emerald-400'
                                  : platform.primaryKPI.trend === 'down'
                                  ? 'text-red-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {platform.primaryKPI.changePercent > 0 ? '+' : ''}
                              {platform.primaryKPI.changePercent.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No data for period</p>
                    )}
                  </div>
                </Link>
              ))}
          </div>

          {/* Platforms without data */}
          {data.platforms.filter((p) => !p.hasData).length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Other Platforms</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {data.platforms
                  .filter((p) => !p.hasData)
                  .map((platform) => (
                    <Link
                      key={platform.platform}
                      href={`/clients/${clientId}/platforms`}
                      className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-center hover:border-slate-600 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: `${platform.color}20` }}
                      >
                        <span
                          style={{ color: platform.color }}
                          className="text-xs font-bold"
                        >
                          {PLATFORM_CONFIG[platform.platform]?.shortName || platform.platform.slice(0, 2)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        {platform.accountCount > 0 ? 'No data' : 'Not connected'}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Imports */}
          {data.recentImports.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Recent Imports</h3>
                <Link
                  href={`/clients/${clientId}/platforms`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {data.recentImports.map((imp) => (
                  <div
                    key={imp.id}
                    className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${PLATFORM_CONFIG[imp.platform]?.color || '#666'}20`,
                        }}
                      >
                        <span
                          style={{ color: PLATFORM_CONFIG[imp.platform]?.color || '#666' }}
                          className="text-xs font-bold"
                        >
                          {PLATFORM_CONFIG[imp.platform]?.shortName || imp.platform.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm">{imp.importType} Import</p>
                        <p className="text-slate-400 text-xs">
                          {formatDateDDMMYYYY(imp.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          imp.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : imp.status === 'FAILED'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {imp.status}
                      </span>
                      <p className="text-slate-400 text-xs mt-1">{imp.totalRows} rows</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
