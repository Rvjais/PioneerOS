'use client'

import { useState, useEffect } from 'react'
import {
  CLIENT_TIERS,
  getLabelForValue,
  getColorForValue,
} from '@/shared/constants/formConstants'

interface ClientProfitability {
  clientId: string
  clientName: string
  tier: string
  status: string
  monthlyFee: number
  totalRevenue: number
  directExpenses: number
  allocatedExpenses: number
  laborCost: number
  totalCosts: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
  hoursWorked: number
  effectiveHourlyRate: number
  teamSize: number
}

interface Summary {
  totalClients: number
  totalRevenue: number
  totalCosts: number
  totalProfit: number
  averageMargin: number
  profitableClients: number
  unprofitableClients: number
  topPerformer: string
  highestMargin: number
  lowestMargin: number
}

export default function ProfitabilityDashboard() {
  const [clients, setClients] = useState<ClientProfitability[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('MONTHLY')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [sortBy, setSortBy] = useState<'netProfit' | 'netMargin' | 'revenue'>('netProfit')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchProfitability()
  }, [period, month])

  const fetchProfitability = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period, month })
      const res = await fetch(`/api/analytics/profitability?${params}`)
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch profitability:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 40) return 'text-emerald-600'
    if (margin >= 20) return 'text-blue-400'
    if (margin >= 0) return 'text-amber-400'
    return 'text-red-400'
  }

  const getMarginBgColor = (margin: number) => {
    if (margin >= 40) return 'bg-emerald-500/20'
    if (margin >= 20) return 'bg-blue-500/20'
    if (margin >= 0) return 'bg-amber-500/20'
    return 'bg-red-500/20'
  }

  const sortedClients = [...clients].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
  })

  const handleSort = (key: 'netProfit' | 'netMargin' | 'revenue') => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(key)
      setSortOrder('desc')
    }
  }

  if (loading && !clients.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Profitability</h1>
          <p className="text-slate-300 mt-1">Analyze revenue, costs, and profitability per client</p>
        </div>
        <div className="flex gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-lg text-white"
            style={{ colorScheme: 'dark' }}
          >
            <option value="MONTHLY" className="bg-slate-800 text-white">Monthly</option>
            <option value="QUARTERLY" className="bg-slate-800 text-white">Quarterly</option>
            <option value="YEARLY" className="bg-slate-800 text-white">Yearly</option>
          </select>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-white/20 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Total Revenue</p>
            <p className="text-xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Total Costs</p>
            <p className="text-xl font-bold text-white">{formatCurrency(summary.totalCosts)}</p>
          </div>
          <div className={`glass-card rounded-xl border p-4 ${summary.totalProfit >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
            <p className="text-sm text-slate-300">Net Profit</p>
            <p className={`text-xl font-bold ${summary.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-400'}`}>
              {formatCurrency(summary.totalProfit)}
            </p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Avg. Margin</p>
            <p className={`text-xl font-bold ${getMarginColor(summary.averageMargin)}`}>
              {summary.averageMargin.toFixed(1)}%
            </p>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <p className="text-sm text-slate-300">Profitable / Total</p>
            <p className="text-xl font-bold text-white">
              <span className="text-emerald-600">{summary.profitableClients}</span>
              <span className="text-slate-400"> / </span>
              <span>{summary.totalClients}</span>
            </p>
          </div>
        </div>
      )}

      {/* Profitability Distribution */}
      {summary && (
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4">Margin Distribution</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-8 bg-slate-800/50 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(clients.filter(c => c.netMargin >= 40).length / clients.length * 100) || 0}%` }}
              >
                {clients.filter(c => c.netMargin >= 40).length > 0 && '40%+'}
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(clients.filter(c => c.netMargin >= 20 && c.netMargin < 40).length / clients.length * 100) || 0}%` }}
              >
                {clients.filter(c => c.netMargin >= 20 && c.netMargin < 40).length > 0 && '20-40%'}
              </div>
              <div
                className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(clients.filter(c => c.netMargin >= 0 && c.netMargin < 20).length / clients.length * 100) || 0}%` }}
              >
                {clients.filter(c => c.netMargin >= 0 && c.netMargin < 20).length > 0 && '0-20%'}
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(clients.filter(c => c.netMargin < 0).length / clients.length * 100) || 0}%` }}
              >
                {clients.filter(c => c.netMargin < 0).length > 0 && 'Loss'}
              </div>
            </div>
          </div>
          <div className="flex gap-6 mt-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-500 rounded"></span>
              Excellent (40%+): {clients.filter(c => c.netMargin >= 40).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span>
              Good (20-40%): {clients.filter(c => c.netMargin >= 20 && c.netMargin < 40).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-500 rounded"></span>
              Low (0-20%): {clients.filter(c => c.netMargin >= 0 && c.netMargin < 20).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              Loss: {clients.filter(c => c.netMargin < 0).length}
            </span>
          </div>
        </div>
      )}

      {/* Client Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tier</th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('revenue')}
                >
                  Revenue {sortBy === 'revenue' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Costs</th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('netProfit')}
                >
                  Profit {sortBy === 'netProfit' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('netMargin')}
                >
                  Margin {sortBy === 'netMargin' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Hours</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Rate/Hr</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedClients.map(client => (
                <tr key={client.clientId} className="hover:bg-slate-900/40">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{client.clientName}</p>
                    <p className="text-xs text-slate-400">{client.status}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getColorForValue(CLIENT_TIERS, client.tier)}`}>
                      {getLabelForValue(CLIENT_TIERS, client.tier)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-medium text-white">{formatCurrency(client.totalRevenue)}</p>
                    <p className="text-xs text-slate-400">Fee: {formatCurrency(client.monthlyFee)}/mo</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-medium text-white">{formatCurrency(client.totalCosts)}</p>
                    <p className="text-xs text-slate-400">
                      Labor: {formatCurrency(client.laborCost)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className={`font-bold ${client.netProfit >= 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                      {formatCurrency(client.netProfit)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-flex px-2 py-1 text-sm font-medium rounded ${getMarginBgColor(client.netMargin)} ${getMarginColor(client.netMargin)}`}>
                      {client.netMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-slate-200">{client.hoursWorked}h</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-medium ${client.effectiveHourlyRate >= 1000 ? 'text-emerald-600' : client.effectiveHourlyRate >= 500 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {formatCurrency(client.effectiveHourlyRate)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-800/50 rounded-full text-sm font-medium text-slate-200">
                      {client.teamSize}
                    </span>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No profitability data available for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      {summary && clients.length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4">Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500/10 rounded-lg">
              <p className="text-sm text-emerald-700 font-medium">Top Performer</p>
              <p className="text-lg font-bold text-emerald-800">{summary.topPerformer}</p>
              <p className="text-sm text-emerald-600">Highest net margin: {summary.highestMargin.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <p className="text-sm text-red-400 font-medium">Needs Attention</p>
              <p className="text-lg font-bold text-red-800">
                {clients.filter(c => c.netMargin < 0).length} clients at loss
              </p>
              <p className="text-sm text-red-400">Lowest margin: {summary.lowestMargin.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <p className="text-sm text-blue-400 font-medium">Average Effective Rate</p>
              <p className="text-lg font-bold text-blue-800">
                {formatCurrency(
                  clients.reduce((sum, c) => sum + c.effectiveHourlyRate, 0) / clients.length
                )}/hour
              </p>
              <p className="text-sm text-blue-400">Based on revenue per hour worked</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg">
              <p className="text-sm text-amber-400 font-medium">Labor Cost Efficiency</p>
              <p className="text-lg font-bold text-amber-800">
                {((summary.totalCosts / summary.totalRevenue) * 100).toFixed(1)}% of revenue
              </p>
              <p className="text-sm text-amber-400">Target: Under 60%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
