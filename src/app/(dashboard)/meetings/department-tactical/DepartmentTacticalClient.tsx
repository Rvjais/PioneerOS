'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Save,
  Target,
  Package,
  FileText,
  Minus,
} from 'lucide-react'

interface KPIField {
  id: string
  label: string
  type: 'number' | 'float' | 'percentage'
  suffix?: string
  hasComparison: boolean
  growthLabel?: string
}

interface Client {
  id: string
  name: string
  brandName: string | null
  platform: string | null
  services: string[]
  selectedServices: string[]
  tier: string | null
  monthlyFee: number | null
}

interface Deliverable {
  id: string
  clientId: string
  category: string
  item: string
  quantity: number
  delivered: number
  status: string
  month: Date
  client: {
    id: string
    name: string
    brandName: string | null
  }
}

interface WorkDeliverable {
  id: string
  clientId: string | null
  category: string
  deliverableType: string
  quantity: number
  proofUrl: string | null
  status: string
  client: {
    id: string
    name: string
    brandName: string | null
  } | null
}

interface KPIEntry {
  id: string
  clientId: string
  department: string | null
  // SEO KPIs
  organicTraffic: number | null
  prevOrganicTraffic: number | null
  leads: number | null
  prevLeads: number | null
  gbpCalls: number | null
  gbpDirections: number | null
  keywordsTop3: number | null
  keywordsTop10: number | null
  keywordsTop20: number | null
  backlinksBuilt: number | null
  // ADS KPIs
  adSpend: number | null
  impressions: number | null
  clicks: number | null
  conversions: number | null
  prevConversions: number | null
  costPerConversion: number | null
  roas: number | null
  prevRoas: number | null
  // Social KPIs
  followers: number | null
  prevFollowers: number | null
  reachTotal: number | null
  prevReachTotal: number | null
  engagement: number | null
  prevEngagement: number | null
  // Web KPIs
  pageSpeed: number | null
  bounceRate: number | null
  avgSessionDuration: number | null
  pagesBuilt: number | null
  bugsFixed: number | null
  // General
  notes: string | null
  client?: {
    id: string
    name: string
    brandName: string | null
  }
}

interface Props {
  userId: string
  userName: string
  department: string
  departmentLabel: string
  kpiDefinitions: KPIField[]
  isManager: boolean
  monthName: string
  prevMonthName: string
  clients: Client[]
  deliverables: Deliverable[]
  workDeliverables: WorkDeliverable[]
  currentKpis: Record<string, KPIEntry>
  prevKpis: Record<string, KPIEntry>
  tacticalMeetingId: string | null
  tacticalMeetingStatus: string
  stats: {
    totalDeliverables: number
    completedDeliverables: number
    underDelivery: number
    clientsManaged: number
    clientCapacity: number
  }
}

const INVERTED_METRICS = ['bounceRate', 'costPerConversion', 'revisionRate', 'attritionRate']

export default function DepartmentTacticalClient({
  userId,
  userName,
  department,
  departmentLabel,
  kpiDefinitions,
  isManager,
  monthName,
  prevMonthName,
  clients,
  deliverables,
  workDeliverables,
  currentKpis,
  prevKpis,
  tacticalMeetingId,
  tacticalMeetingStatus,
  stats,
}: Props) {
  const router = useRouter()
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'deliverables' | 'kpis' | 'summary'>('deliverables')
  const [kpiValues, setKpiValues] = useState<Record<string, Record<string, number | null>>>({})
  const [saving, setSaving] = useState(false)
  const [showAddDeliverable, setShowAddDeliverable] = useState<string | null>(null)

  // Calculate growth percentage
  const calcGrowth = (current: number | null, previous: number | null, isInverted = false) => {
    if (!current || !previous || previous === 0) return null
    const growth = ((current - previous) / previous) * 100
    return isInverted ? -growth : growth
  }

  const formatGrowth = (growth: number | null) => {
    if (growth === null) return '-'
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}%`
  }

  const getGrowthColor = (growth: number | null) => {
    if (growth === null) return 'text-slate-400'
    return growth > 0 ? 'text-emerald-600' : growth < 0 ? 'text-red-400' : 'text-slate-400'
  }

  const getGrowthIcon = (growth: number | null) => {
    if (growth === null) return <Minus className="w-3 h-3" />
    return growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  }

  // Get deliverables for a client
  const getClientDeliverables = (clientId: string) => deliverables.filter(d => d.clientId === clientId)
  const getClientWorkDeliverables = (clientId: string) => workDeliverables.filter(d => d.clientId === clientId)

  // Get KPI value for a client
  const getKpiValue = (clientId: string, kpiId: string): number | null => {
    // Check local state first
    if (kpiValues[clientId]?.[kpiId] !== undefined) {
      return kpiValues[clientId][kpiId]
    }
    // Fall back to database value
    const entry = currentKpis[clientId]
    if (!entry) return null
    // Dynamic KPI field access requires cast — kpiId is a runtime string key
    return (entry as unknown as Record<string, unknown>)[kpiId] as number | null
  }

  const getPrevKpiValue = (clientId: string, kpiId: string): number | null => {
    const entry = prevKpis[clientId]
    if (!entry) return null
    const prevKey = `prev${kpiId.charAt(0).toUpperCase()}${kpiId.slice(1)}`
    // Dynamic KPI field access requires cast — kpiId is a runtime string key
    return ((entry as unknown as Record<string, unknown>)[prevKey] as number | null) || ((entry as unknown as Record<string, unknown>)[kpiId] as number | null)
  }

  const updateKpiValue = (clientId: string, kpiId: string, value: number | null) => {
    setKpiValues(prev => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [kpiId]: value,
      },
    }))
  }

  const handleSaveKpis = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/tactical/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          department,
          kpiEntries: Object.entries(kpiValues).map(([clientId, kpis]) => ({
            clientId,
            ...kpis,
          })),
        }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to save KPIs:', error)
    }
    setSaving(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
      case 'OVER_DELIVERY':
        return 'bg-emerald-500/20 text-emerald-400'
      case 'UNDER_DELIVERY':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SEO: 'bg-blue-500/20 text-blue-400 border-blue-200',
      ADS: 'bg-amber-500/20 text-amber-400 border-amber-200',
      SOCIAL: 'bg-pink-500/20 text-pink-400 border-pink-200',
      WEB: 'bg-purple-500/20 text-purple-400 border-purple-200',
      AUTOMATION: 'bg-emerald-500/20 text-emerald-400 border-emerald-200',
    }
    return colors[category] || 'bg-slate-800/50 text-slate-200 border-white/10'
  }

  // Calculate overall performance score
  const calculatePerformance = () => {
    let totalGrowth = 0
    let kpiCount = 0

    clients.forEach(client => {
      kpiDefinitions.forEach(kpi => {
        if (kpi.hasComparison) {
          const current = getKpiValue(client.id, kpi.id)
          const prev = getPrevKpiValue(client.id, kpi.id)
          const growth = calcGrowth(current, prev, INVERTED_METRICS.includes(kpi.id))
          if (growth !== null) {
            totalGrowth += growth
            kpiCount++
          }
        }
      })
    })

    return kpiCount > 0 ? Math.min(100, Math.max(0, 50 + (totalGrowth / kpiCount))) : 0
  }

  const performanceScore = calculatePerformance()
  const accountabilityScore = stats.clientCapacity > 0
    ? Math.min(100, (stats.clientsManaged / stats.clientCapacity) * 100)
    : 0
  const deliveryScore = stats.totalDeliverables > 0
    ? (stats.completedDeliverables / stats.totalDeliverables) * 100
    : 0

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{departmentLabel} Tactical Sheet</h1>
            <p className="text-indigo-200 mt-1">{monthName} - {userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              tacticalMeetingStatus === 'SUBMITTED' ? 'bg-emerald-500' :
              tacticalMeetingStatus === 'APPROVED' ? 'bg-green-500' :
              'bg-white/20 backdrop-blur-sm'
            }`}>
              {tacticalMeetingStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-400">Clients Managed</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.clientsManaged}</p>
          <p className="text-xs text-slate-400">of {stats.clientCapacity} capacity</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-slate-400">Deliverables</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.completedDeliverables}/{stats.totalDeliverables}</p>
          <p className="text-xs text-slate-400">{stats.underDelivery} under-delivery</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-slate-400">Performance</span>
          </div>
          <p className={`text-2xl font-bold ${performanceScore >= 70 ? 'text-emerald-600' : performanceScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {performanceScore.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400">KPI growth score</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-400">Accountability</span>
          </div>
          <p className={`text-2xl font-bold ${accountabilityScore >= 80 ? 'text-emerald-600' : accountabilityScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
            {accountabilityScore.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400">capacity utilization</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-slate-400">Delivery Rate</span>
          </div>
          <p className={`text-2xl font-bold ${deliveryScore >= 90 ? 'text-emerald-600' : deliveryScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {deliveryScore.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-400">on-track deliverables</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('deliverables')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'deliverables'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Deliverables
        </button>
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'kpis'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          KPI Metrics
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Monthly Summary
        </button>
      </div>

      {/* Deliverables Tab */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          {clients.length === 0 ? (
            <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400">No clients assigned to you yet.</p>
            </div>
          ) : (
            clients.map(client => {
              const clientDeliverables = getClientDeliverables(client.id)
              const clientWorkDeliverables = getClientWorkDeliverables(client.id)
              const isExpanded = expandedClient === client.id

              const completed = clientDeliverables.filter(d => d.delivered >= d.quantity).length
              const total = clientDeliverables.length

              return (
                <div key={client.id} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                  {/* Client Header */}
                  <button
                    onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                      <div className="text-left">
                        <h3 className="font-semibold text-white">
                          {client.brandName || client.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {client.selectedServices?.slice(0, 3).map((service: string) => (
                            <span key={service} className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-white">{completed}/{total}</p>
                        <p className="text-xs text-slate-400">Scope Items</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white">{clientWorkDeliverables.length}</p>
                        <p className="text-xs text-slate-400">Submitted</p>
                      </div>
                      {client.tier && (
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          client.tier === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
                          client.tier === 'PREMIUM' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-800/50 text-slate-200'
                        }`}>
                          {client.tier}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {/* Scope Deliverables */}
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-slate-200 mb-3">Scope Deliverables</h4>
                        {clientDeliverables.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">No scope items defined for this month</p>
                        ) : (
                          <div className="space-y-2">
                            {clientDeliverables.map(del => (
                              <div key={del.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(del.category)}`}>
                                    {del.category}
                                  </span>
                                  <span className="text-sm text-slate-200">{del.item}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <span className="text-sm font-medium text-white">{del.delivered} / {del.quantity}</span>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(del.status)}`}>
                                    {del.status.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Work Deliverables */}
                      {clientWorkDeliverables.length > 0 && (
                        <div className="p-4 border-t border-white/5">
                          <h4 className="text-sm font-semibold text-slate-200 mb-3">Submitted Work</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-800/50 text-xs">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium text-slate-300">Type</th>
                                  <th className="px-3 py-2 text-left font-medium text-slate-300">Category</th>
                                  <th className="px-3 py-2 text-center font-medium text-slate-300">Qty</th>
                                  <th className="px-3 py-2 text-left font-medium text-slate-300">Proof</th>
                                  <th className="px-3 py-2 text-center font-medium text-slate-300">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {clientWorkDeliverables.map(wd => (
                                  <tr key={wd.id}>
                                    <td className="px-3 py-2 font-medium text-white">{wd.deliverableType.replace(/_/g, ' ')}</td>
                                    <td className="px-3 py-2">
                                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(wd.category)}`}>
                                        {wd.category}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">{wd.quantity}</td>
                                    <td className="px-3 py-2">
                                      {wd.proofUrl ? (
                                        <a
                                          href={wd.proofUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                          <ExternalLink className="w-3 h-3" /> View
                                        </a>
                                      ) : (
                                        <span className="text-slate-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                                        wd.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                        wd.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                        'bg-amber-500/20 text-amber-400'
                                      }`}>
                                        {wd.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* KPIs Tab */}
      {activeTab === 'kpis' && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 bg-slate-900/40 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{departmentLabel} KPIs</h3>
                <p className="text-xs text-slate-400 mt-1">Enter metrics for {monthName} (compared with {prevMonthName})</p>
              </div>
              <button
                onClick={handleSaveKpis}
                disabled={saving || Object.keys(kpiValues).length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save KPIs'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase sticky left-0 bg-slate-800/50">Client</th>
                    {kpiDefinitions.map(kpi => (
                      <th key={kpi.id} className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase min-w-[120px]">
                        {kpi.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {clients.map(client => (
                    <tr key={client.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 sticky left-0 glass-card">
                        <div className="font-medium text-white">{client.brandName || client.name}</div>
                      </td>
                      {kpiDefinitions.map(kpi => {
                        const currentValue = getKpiValue(client.id, kpi.id)
                        const prevValue = getPrevKpiValue(client.id, kpi.id)
                        const isInverted = INVERTED_METRICS.includes(kpi.id)
                        const growth = calcGrowth(currentValue, prevValue, isInverted)

                        return (
                          <td key={kpi.id} className="px-4 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={kpiValues[client.id]?.[kpi.id] ?? currentValue ?? ''}
                                  onChange={(e) => updateKpiValue(client.id, kpi.id, e.target.value ? parseFloat(e.target.value) : null)}
                                  className="w-20 px-2 py-1 text-center border border-white/10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="-"
                                  step={kpi.type === 'float' ? '0.01' : '1'}
                                />
                                {kpi.suffix && <span className="text-xs text-slate-400">{kpi.suffix}</span>}
                              </div>
                              {kpi.hasComparison && prevValue !== null && (
                                <div className={`flex items-center gap-1 text-xs ${getGrowthColor(growth)}`}>
                                  {getGrowthIcon(growth)}
                                  <span>{formatGrowth(growth)}</span>
                                </div>
                              )}
                              {prevValue !== null && (
                                <span className="text-xs text-slate-400">prev: {prevValue}{kpi.suffix || ''}</span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Score Breakdown */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h3 className="font-semibold text-white mb-4">Monthly Performance Summary</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Performance */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-blue-800">KPI Performance</span>
                </div>
                <p className={`text-3xl font-bold ${performanceScore >= 70 ? 'text-emerald-600' : performanceScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {performanceScore.toFixed(0)}%
                </p>
                <p className="text-sm text-blue-400 mt-2">Based on month-over-month growth</p>
              </div>

              {/* Accountability */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-purple-800">Accountability</span>
                </div>
                <p className={`text-3xl font-bold ${accountabilityScore >= 80 ? 'text-emerald-600' : accountabilityScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {accountabilityScore.toFixed(0)}%
                </p>
                <p className="text-sm text-purple-400 mt-2">{stats.clientsManaged} of {stats.clientCapacity} client capacity</p>
              </div>

              {/* Delivery */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-emerald-800">Delivery Rate</span>
                </div>
                <p className={`text-3xl font-bold ${deliveryScore >= 90 ? 'text-emerald-600' : deliveryScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                  {deliveryScore.toFixed(0)}%
                </p>
                <p className="text-sm text-emerald-600 mt-2">{stats.completedDeliverables} of {stats.totalDeliverables} deliverables on track</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {stats.underDelivery > 0 && (
            <div className="bg-red-500/10 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="font-medium text-red-800">Under-Delivery Alert</p>
                  <p className="text-sm text-red-400">
                    {stats.underDelivery} deliverable(s) are behind schedule. Review and take corrective action.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Client-wise Summary */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 bg-slate-900/40 border-b border-white/10">
              <h3 className="font-semibold text-white">Client-wise Summary</h3>
            </div>
            <div className="divide-y divide-white/10">
              {clients.map(client => {
                const clientDeliverables = getClientDeliverables(client.id)
                const completed = clientDeliverables.filter(d => d.delivered >= d.quantity).length
                const total = clientDeliverables.length
                const percentage = total > 0 ? (completed / total) * 100 : 0

                return (
                  <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40">
                    <div>
                      <p className="font-medium text-white">{client.brandName || client.name}</p>
                      <p className="text-sm text-slate-400">{total} scope items</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${percentage >= 90 ? 'bg-emerald-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${percentage >= 90 ? 'text-emerald-600' : percentage >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
