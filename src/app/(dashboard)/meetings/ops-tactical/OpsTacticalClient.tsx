'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  Save,
  Calendar,
  Minus,
  AlertTriangle,
} from 'lucide-react'

interface KPIField {
  id: string
  label: string
  type: 'number' | 'float' | 'percentage'
  suffix?: string
  hasComparison: boolean
  growthLabel?: string
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
  currentData: Record<string, unknown>
  prevData: Record<string, unknown>
  meetingId: string | null
  meetingStatus: string
}

const INVERTED_METRICS = ['outstandingAmount', 'attritionRate', 'responseTime']

const DEPARTMENT_ICONS: Record<string, Record<string, React.ComponentType<{ className?: string }>>> = {
  ACCOUNTS: {
    invoicesGenerated: FileText,
    paymentsCollected: DollarSign,
    outstandingAmount: AlertTriangle,
    clientsServiced: Users,
    onboardingsCompleted: CheckCircle,
    collectionRate: Target,
  },
  SALES: {
    leadsGenerated: Users,
    callsMade: Phone,
    meetingsScheduled: Calendar,
    proposalsSent: FileText,
    dealsWon: CheckCircle,
    revenueGenerated: DollarSign,
    conversionRate: Target,
  },
  HR: {
    candidatesSourced: Users,
    interviewsConducted: Calendar,
    offersExtended: FileText,
    joineesOnboarded: CheckCircle,
    employeeNPS: Target,
    attritionRate: AlertTriangle,
    trainingHoursDelivered: Clock,
  },
  OPERATIONS: {
    clientsManaged: Users,
    clientNPS: Target,
    tasksCompleted: CheckCircle,
    escalationsResolved: AlertTriangle,
    deliverablesMet: Target,
    clientRetention: Users,
    responseTime: Clock,
  },
}

export default function OpsTacticalClient({
  userId,
  userName,
  department,
  departmentLabel,
  kpiDefinitions,
  isManager,
  monthName,
  prevMonthName,
  currentData,
  prevData,
  meetingId,
  meetingStatus,
}: Props) {
  const router = useRouter()
  const [kpiValues, setKpiValues] = useState<Record<string, number | null>>({})
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  // Calculate growth
  const calcGrowth = (current: number | null | undefined, previous: number | null | undefined, isInverted = false) => {
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
    if (growth === null) return <Minus className="w-4 h-4" />
    return growth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  const getValue = (kpiId: string): number | null => {
    if (kpiValues[kpiId] !== undefined) return kpiValues[kpiId]
    const val = currentData[kpiId]
    return typeof val === 'number' ? val : null
  }

  const getPrevValue = (kpiId: string): number | null => {
    const val = prevData[kpiId]
    return typeof val === 'number' ? val : null
  }

  const updateValue = (kpiId: string, value: number | null) => {
    setKpiValues(prev => ({ ...prev, [kpiId]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/tactical/ops-kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          department,
          kpis: {
            ...Object.fromEntries(
              kpiDefinitions.map(kpi => [kpi.id, getValue(kpi.id)])
            ),
          },
          notes,
        }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to save:', error)
    }
    setSaving(false)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/tactical/ops-kpis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, meetingId }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to submit:', error)
    }
    setSaving(false)
  }

  // Calculate overall performance
  const calculateOverallScore = () => {
    let totalGrowth = 0
    let count = 0

    kpiDefinitions.forEach(kpi => {
      if (kpi.hasComparison) {
        const current = getValue(kpi.id)
        const prev = getPrevValue(kpi.id)
        const growth = calcGrowth(current, prev, INVERTED_METRICS.includes(kpi.id))
        if (growth !== null) {
          totalGrowth += growth
          count++
        }
      }
    })

    return count > 0 ? Math.min(100, Math.max(0, 50 + (totalGrowth / count))) : 50
  }

  const overallScore = calculateOverallScore()
  const icons = DEPARTMENT_ICONS[department] || {}

  const formatValue = (value: number | null, kpi: KPIField) => {
    if (value === null) return '-'
    if (kpi.type === 'float' && kpi.suffix === '%') return value.toFixed(1)
    if (kpi.type === 'float' && kpi.suffix === '₹') return `₹${value.toLocaleString('en-IN')}`
    if (kpi.type === 'percentage') return `${value.toFixed(1)}%`
    return value.toLocaleString('en-IN')
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{departmentLabel} Monthly KPIs</h1>
            <p className="text-slate-300 mt-1">{monthName} - {userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-slate-400">Performance Score</p>
              <p className={`text-3xl font-bold ${
                overallScore >= 70 ? 'text-emerald-400' :
                overallScore >= 50 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {overallScore.toFixed(0)}%
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              meetingStatus === 'SUBMITTED' ? 'bg-emerald-500' :
              meetingStatus === 'APPROVED' ? 'bg-green-500' :
              'bg-white/20 backdrop-blur-sm'
            }`}>
              {meetingStatus}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpiDefinitions.map(kpi => {
          const value = getValue(kpi.id)
          const prevValue = getPrevValue(kpi.id)
          const isInverted = INVERTED_METRICS.includes(kpi.id)
          const growth = calcGrowth(value, prevValue, isInverted)
          const IconComponent = icons[kpi.id] || BarChart3

          return (
            <div key={kpi.id} className="glass-card rounded-xl border border-white/10 p-4 hover:shadow-none transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isInverted && value && value > 0 ? 'bg-red-500/20' :
                  growth !== null && growth > 0 ? 'bg-emerald-500/20' :
                  'bg-slate-800/50'
                }`}>
                  <IconComponent className={`w-4 h-4 ${
                    isInverted && value && value > 0 ? 'text-red-400' :
                    growth !== null && growth > 0 ? 'text-emerald-600' :
                    'text-slate-300'
                  }`} />
                </div>
                <span className="text-sm font-medium text-slate-300">{kpi.label}</span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <input
                    type="number"
                    value={kpiValues[kpi.id] ?? value ?? ''}
                    onChange={(e) => updateValue(kpi.id, e.target.value ? parseFloat(e.target.value) : null)}
                    className="text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue-500 focus:outline-none w-full max-w-[120px]"
                    placeholder="-"
                    step={kpi.type === 'float' ? '0.01' : '1'}
                  />
                  {kpi.suffix && <span className="text-sm text-slate-400 ml-1">{kpi.suffix}</span>}
                </div>

                {kpi.hasComparison && (
                  <div className={`flex items-center gap-1 ${getGrowthColor(growth)}`}>
                    {getGrowthIcon(growth)}
                    <span className="text-sm font-medium">{formatGrowth(growth)}</span>
                  </div>
                )}
              </div>

              {prevValue !== null && (
                <p className="text-xs text-slate-400 mt-2">
                  Last month: {formatValue(prevValue, kpi)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Notes Section */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-3">Monthly Notes & Highlights</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any key achievements, challenges faced, or notes for this month..."
          className="w-full h-32 px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
        <h3 className="font-semibold text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 glass-card rounded-lg">
            <p className="text-sm text-slate-400 mb-1">KPIs Tracked</p>
            <p className="text-2xl font-bold text-white">{kpiDefinitions.length}</p>
          </div>
          <div className="text-center p-3 glass-card rounded-lg">
            <p className="text-sm text-slate-400 mb-1">Filled</p>
            <p className="text-2xl font-bold text-emerald-600">
              {kpiDefinitions.filter(k => getValue(k.id) !== null).length}
            </p>
          </div>
          <div className="text-center p-3 glass-card rounded-lg">
            <p className="text-sm text-slate-400 mb-1">Improving</p>
            <p className="text-2xl font-bold text-blue-400">
              {kpiDefinitions.filter(k => {
                const growth = calcGrowth(getValue(k.id), getPrevValue(k.id), INVERTED_METRICS.includes(k.id))
                return growth !== null && growth > 0
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 text-slate-200 rounded-xl font-medium hover:bg-white/20 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Draft'}
        </button>

        {meetingStatus !== 'SUBMITTED' && meetingStatus !== 'APPROVED' && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            {saving ? 'Submitting...' : 'Submit for Review'}
          </button>
        )}
      </div>

      {/* Deadline Warning */}
      {new Date().getDate() <= 5 && meetingStatus === 'DRAFT' && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-medium text-amber-800">Submission Deadline</p>
            <p className="text-sm text-amber-400">Please submit your monthly KPIs by the 5th to avoid penalties.</p>
          </div>
        </div>
      )}
    </div>
  )
}
