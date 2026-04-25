'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MetricCard from './MetricCard'
import TrendChart from './TrendChart'
import DataTable from './DataTable'
import DateRangePicker from './DateRangePicker'

type Preset = 'today' | '7d' | '30d' | '90d' | 'custom'

interface KPI {
  id: string
  label: string
  value: number
  formattedValue: string
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'neutral'
  unit?: string
}

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    color?: string
  }>
}

interface BreakdownChart {
  title: string
  type: 'pie' | 'bar' | 'table'
  data: Array<{ label: string; value: number; percentage?: number }>
}

interface TableColumn {
  key: string
  label: string
  type: string
}

interface TableRow {
  id: string
  [key: string]: string | number | boolean | null
}

interface DashboardData {
  platform: string
  platformConfig: {
    name: string
    color: string
    metrics: string[]
  }
  dateRange: { from: string; to: string }
  accounts: Array<{
    id: string
    name: string
    isActive: boolean
    lastSyncAt: string | null
  }>
  kpis: KPI[]
  mainChart: ChartData
  breakdownCharts: BreakdownChart[]
  table: {
    columns: TableColumn[]
    rows: TableRow[]
  }
}

interface Props {
  clientId: string
  clientName: string
  platform: string
  platformKey: string
}

export default function PlatformDashboard({
  clientId,
  clientName,
  platform,
  platformKey,
}: Props) {
  const [datePreset, setDatePreset] = useState<Preset>('30d')
  const [customFrom, setCustomFrom] = useState<string>()
  const [customTo, setCustomTo] = useState<string>()
  const [selectedAccountId, setSelectedAccountId] = useState<string>()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [datePreset, customFrom, customTo, selectedAccountId])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let url = `/api/clients/${clientId}/dashboard/${platformKey}?preset=${datePreset}`
      if (datePreset === 'custom' && customFrom && customTo) {
        url += `&from=${customFrom}&to=${customTo}`
      }
      if (selectedAccountId) {
        url += `&accountId=${selectedAccountId}`
      }

      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const dashboardData = await res.json()
      setData(dashboardData)

      // Set default account if not selected
      if (!selectedAccountId && dashboardData.accounts.length > 0) {
        const activeAccount = dashboardData.accounts.find((a: DashboardData['accounts'][0]) => a.isActive)
        if (activeAccount) {
          setSelectedAccountId(activeAccount.id)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  const handleExport = (format: 'csv' | 'json') => {
    let url = `/api/clients/${clientId}/dashboard/${platformKey}?export=${format}&preset=${datePreset}`
    if (datePreset === 'custom' && customFrom && customTo) {
      url += `&from=${customFrom}&to=${customTo}`
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Link href="/clients" className="hover:text-white">
              Clients
            </Link>
            <span>/</span>
            <Link href={`/clients/${clientId}`} className="hover:text-white">
              {clientName}
            </Link>
            <span>/</span>
            <Link href={`/clients/${clientId}/reports`} className="hover:text-white">
              Reports
            </Link>
            <span>/</span>
            <span className="text-white">{platform}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{platform} Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <Link
            href={`/clients/${clientId}/platforms`}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            Import Data
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker
          value={datePreset}
          customFrom={customFrom}
          customTo={customTo}
          onChange={handleDateChange}
        />

        {data && data.accounts.length > 1 && (
          <select
            value={selectedAccountId || ''}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ colorScheme: 'dark' }}
          >
            {data.accounts.map((acc) => (
              <option key={acc.id} value={acc.id} className="bg-slate-800 text-white">
                {acc.name}
              </option>
            ))}
          </select>
        )}
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

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && data && data.kpis.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Data for This Period</h2>
          <p className="text-slate-400 mb-6">
            Try selecting a different date range or import more data.
          </p>
          <Link
            href={`/clients/${clientId}/platforms`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block"
          >
            Import Data
          </Link>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && !error && data && data.kpis.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.kpis.map((kpi) => (
              <MetricCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                formattedValue={kpi.formattedValue}
                change={kpi.change}
                changePercent={kpi.changePercent}
                trend={kpi.trend}
                unit={kpi.unit}
                color={data.platformConfig.color}
              />
            ))}
          </div>

          {/* Main Chart */}
          {data.mainChart.labels.length > 0 && (
            <TrendChart
              title="Performance Trend"
              labels={data.mainChart.labels}
              datasets={data.mainChart.datasets.map((ds) => ({
                ...ds,
                color: ds.color || data.platformConfig.color,
              }))}
              height={350}
            />
          )}

          {/* Breakdown Charts */}
          {data.breakdownCharts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.breakdownCharts.map((chart, index) => (
                <div key={chart.title} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-4">{chart.title}</h3>
                  <div className="space-y-2">
                    {chart.data.slice(0, 10).map((item, i) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-slate-300 truncate text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium text-sm">
                            {item.value.toLocaleString()}
                          </span>
                          {item.percentage !== undefined && (
                            <span className="text-slate-400 text-xs w-12 text-right">
                              {item.percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          {data.table.rows.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-4">Daily Breakdown</h3>
              <DataTable columns={data.table.columns} rows={data.table.rows} pageSize={15} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
