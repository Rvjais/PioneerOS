'use client'

import { useState, useEffect } from 'react'
import PortalPageSkeleton from '@/client/components/portal/PortalPageSkeleton'

interface PacingResult {
  status: 'ON_TRACK' | 'UNDERSPEND' | 'OVERSPEND'
  expectedSpend: number
  actualSpend: number
  variance: number
  dailyTarget: number
  projectedMonthEnd: number
}

interface SpendAlert {
  level: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
}

interface CampaignData {
  id: string
  name: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  leads: number
  ctr: number
  cpc: number
}

interface DailySpend {
  date: string
  spend: number
}

interface AdsData {
  hasAdAccounts: boolean
  totalSpend: number
  budget: number
  impressions: number
  clicks: number
  conversions: number
  leadsThisMonth: number
  leadsLastMonth: number
  roas: number
  cpl: number
  pacing: PacingResult | null
  alert: SpendAlert | null
  campaigns: CampaignData[]
  dailySpend: DailySpend[]
  accounts: Array<{
    id: string
    platform: string
    accountName: string
    lastSyncAt: string | null
    lastSyncStatus: string | null
  }>
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(value))
}

function PacingBadge({ status }: { status: 'ON_TRACK' | 'UNDERSPEND' | 'OVERSPEND' }) {
  const config = {
    ON_TRACK: { label: 'On Track', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    UNDERSPEND: { label: 'Underspend', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    OVERSPEND: { label: 'Overspend', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
      {c.label}
    </span>
  )
}

function AlertBanner({ alert }: { alert: SpendAlert }) {
  const config = {
    INFO: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    WARNING: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
    CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  }
  const c = config[alert.level]
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-center gap-3`}>
      <svg className={`w-5 h-5 ${c.text} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
      </svg>
      <span className={`text-sm ${c.text}`}>{alert.message}</span>
    </div>
  )
}

function SpendChart({ dailySpend }: { dailySpend: DailySpend[] }) {
  if (dailySpend.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No spend data available
      </div>
    )
  }

  const maxSpend = Math.max(...dailySpend.map((d) => d.spend), 1)

  return (
    <div className="flex items-end gap-1 h-48">
      {dailySpend.map((day, i) => {
        const height = (day.spend / maxSpend) * 100
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="glass-card border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap">
                <p className="text-slate-300">{day.date}</p>
                <p className="text-white font-medium">{formatCurrency(day.spend)}</p>
              </div>
            </div>
            <div
              className="w-full bg-blue-500/60 hover:bg-blue-400/80 rounded-t transition-colors min-h-[2px]"
              style={{ height: `${Math.max(height, 1)}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function AdsPage() {
  const [data, setData] = useState<AdsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/client-portal/ads')
      if (!res.ok) {
        throw new Error('Failed to fetch ads data')
      }
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error('Failed to fetch ads data:', err)
      setError('Unable to load ads data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <PortalPageSkeleton titleWidth="w-32" statCards={4} listItems={3} />
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-8 text-center border border-white/10">
        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
        <p className="text-slate-400">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!data || !data.hasAdAccounts) {
    return (
      <div className="glass-card rounded-xl p-8 text-center border border-white/10">
        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <h3 className="text-lg font-semibold text-white mb-2">No Ad Accounts Connected</h3>
        <p className="text-slate-400">
          Contact your account manager to set up Google Ads or Meta Ads tracking.
        </p>
      </div>
    )
  }

  const leadsChange =
    data.leadsLastMonth > 0
      ? Math.round(((data.leadsThisMonth - data.leadsLastMonth) / data.leadsLastMonth) * 100)
      : data.leadsThisMonth > 0
        ? 100
        : 0

  const budgetUtilization = data.budget > 0 ? (data.totalSpend / data.budget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ads Performance</h1>
          <p className="text-sm text-slate-400 mt-1">Track your paid advertising campaigns</p>
        </div>
        {data.pacing && <PacingBadge status={data.pacing.status} />}
      </div>

      {/* Alert Banner */}
      {data.alert && <AlertBanner alert={data.alert} />}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ad Spend vs Budget */}
        <div className="glass-card rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Ad Spend / Budget</p>
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(data.totalSpend)}</p>
          {data.budget > 0 && (
            <>
              <p className="text-xs text-slate-400 mt-1">of {formatCurrency(data.budget)} budget</p>
              <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    budgetUtilization > 100 ? 'bg-red-500' : budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Leads */}
        <div className="glass-card rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Leads This Month</p>
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(data.leadsThisMonth)}</p>
          <p className={`text-xs mt-1 ${leadsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {leadsChange >= 0 ? '+' : ''}{leadsChange}% vs last month
          </p>
        </div>

        {/* ROAS */}
        <div className="glass-card rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">ROAS</p>
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{data.roas.toFixed(2)}x</p>
          <p className="text-xs text-slate-400 mt-1">Return on ad spend</p>
        </div>

        {/* CPL */}
        <div className="glass-card rounded-xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Cost Per Lead</p>
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">{data.cpl > 0 ? formatCurrency(data.cpl) : '--'}</p>
          <p className="text-xs text-slate-400 mt-1">Average cost per lead</p>
        </div>
      </div>

      {/* Pacing Details */}
      {data.pacing && (
        <div className="glass-card rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Budget Pacing</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400">Daily Target</p>
              <p className="text-lg font-semibold text-white mt-1">{formatCurrency(data.pacing.dailyTarget)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Expected Spend</p>
              <p className="text-lg font-semibold text-white mt-1">{formatCurrency(data.pacing.expectedSpend)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Actual Spend</p>
              <p className="text-lg font-semibold text-white mt-1">{formatCurrency(data.pacing.actualSpend)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Projected Month-End</p>
              <p className="text-lg font-semibold text-white mt-1">{formatCurrency(data.pacing.projectedMonthEnd)}</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className={`text-sm ${data.pacing.variance > 0 ? 'text-red-400' : data.pacing.variance < -10 ? 'text-yellow-400' : 'text-green-400'}`}>
              {data.pacing.variance > 0 ? '+' : ''}{data.pacing.variance.toFixed(1)}% variance from expected
            </p>
          </div>
        </div>
      )}

      {/* Daily Spend Chart */}
      <div className="glass-card rounded-xl p-5 border border-white/10">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Daily Spend (Last 30 Days)</h3>
        <SpendChart dailySpend={data.dailySpend} />
      </div>

      {/* Top Campaigns Table */}
      {data.campaigns.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-sm font-medium text-slate-300">Top Performing Campaigns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Campaign performance data">
              <thead>
                <tr className="text-left text-slate-400 border-b border-white/5">
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium text-right">Impressions</th>
                  <th className="px-5 py-3 font-medium text-right">Clicks</th>
                  <th className="px-5 py-3 font-medium text-right">CTR</th>
                  <th className="px-5 py-3 font-medium text-right">CPC</th>
                  <th className="px-5 py-3 font-medium text-right">Spend</th>
                  <th className="px-5 py-3 font-medium text-right">Conversions</th>
                  <th className="px-5 py-3 font-medium text-right">Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{campaign.name || campaign.id}</td>
                    <td className="px-5 py-3 text-right text-slate-300">{formatNumber(campaign.impressions)}</td>
                    <td className="px-5 py-3 text-right text-slate-300">{formatNumber(campaign.clicks)}</td>
                    <td className="px-5 py-3 text-right text-slate-300">{campaign.ctr.toFixed(2)}%</td>
                    <td className="px-5 py-3 text-right text-slate-300">{formatCurrency(campaign.cpc)}</td>
                    <td className="px-5 py-3 text-right text-white font-medium">{formatCurrency(campaign.cost)}</td>
                    <td className="px-5 py-3 text-right text-slate-300">{formatNumber(campaign.conversions)}</td>
                    <td className="px-5 py-3 text-right text-slate-300">{formatNumber(campaign.leads)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Connected Accounts */}
      <div className="glass-card rounded-xl p-5 border border-white/10">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Connected Ad Accounts</h3>
        <div className="space-y-3">
          {data.accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  account.platform === 'GOOGLE_ADS' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {account.platform === 'GOOGLE_ADS' ? 'G' : 'M'}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{account.accountName}</p>
                  <p className="text-xs text-slate-400">
                    {account.platform === 'GOOGLE_ADS' ? 'Google Ads' : 'Meta Ads'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {account.lastSyncAt ? (
                  <p className="text-xs text-slate-400">
                    Synced {new Date(account.lastSyncAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">Not synced yet</p>
                )}
                {account.lastSyncStatus && (
                  <span className={`text-xs ${account.lastSyncStatus === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                    {account.lastSyncStatus === 'SUCCESS' ? 'Healthy' : 'Error'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
