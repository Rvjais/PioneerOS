'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface MaintenanceLog {
  id: string
  date: Date
  hoursSpent: number
  description: string
  category: string
}

interface MaintenanceContract {
  id: string
  clientId: string
  type: string
  startDate: Date
  endDate: Date
  renewalDate: Date | null
  amount: number
  status: string
  allocatedHours: number | null
  usedHours: number
  hourlyRateAfter: number | null
  notes: string | null
  client: {
    id: string
    name: string
  }
  maintenanceLogs: MaintenanceLog[]
}

interface AMCTrackerProps {
  contract: MaintenanceContract
  variant?: 'active' | 'expiring' | 'expired'
}

// Category data with colors and icons
const categories = [
  { value: 'BUG_FIX', label: 'Bug Fix', icon: '🐛', bgColor: 'bg-red-500/20', textColor: 'text-red-400', borderColor: 'border-red-500' },
  { value: 'UPDATE', label: 'Update', icon: '📦', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400', borderColor: 'border-blue-500' },
  { value: 'SECURITY', label: 'Security', icon: '🔒', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400', borderColor: 'border-purple-500' },
  { value: 'BACKUP', label: 'Backup', icon: '💾', bgColor: 'bg-green-500/20', textColor: 'text-green-400', borderColor: 'border-green-500' },
  { value: 'CONTENT_UPDATE', label: 'Content', icon: '📝', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400', borderColor: 'border-amber-500' },
  { value: 'FEATURE', label: 'Feature', icon: '✨', bgColor: 'bg-indigo-500/20', textColor: 'text-indigo-400', borderColor: 'border-indigo-500' },
  { value: 'OTHER', label: 'Other', icon: '📋', bgColor: 'bg-slate-500/20', textColor: 'text-slate-400', borderColor: 'border-slate-500' },
]

const categoryMap = Object.fromEntries(categories.map(c => [c.value, c]))

export function AMCTracker({ contract, variant = 'active' }: AMCTrackerProps) {
  const [showLogs, setShowLogs] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logForm, setLogForm] = useState({
    hours: '0',
    minutes: '30',
    description: '',
    category: 'OTHER',
  })

  const now = new Date()
  const endDate = new Date(contract.endDate)
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysUntilExpiry < 0

  const hoursUsedPercent = contract.allocatedHours
    ? Math.min((contract.usedHours / contract.allocatedHours) * 100, 100)
    : 0
  const hoursRemaining = contract.allocatedHours
    ? Math.max(contract.allocatedHours - contract.usedHours, 0)
    : 0
  const isHoursLow = hoursUsedPercent > 80

  const borderColor = isExpired
    ? 'border-red-500/50'
    : daysUntilExpiry <= 30
      ? 'border-red-500/30'
      : daysUntilExpiry <= 60
        ? 'border-amber-500/30'
        : 'border-green-500/30'

  const statusBadgeColor = isExpired
    ? 'bg-red-500/20 text-red-400'
    : daysUntilExpiry <= 30
      ? 'bg-red-500/20 text-red-400'
      : daysUntilExpiry <= 60
        ? 'bg-amber-500/20 text-amber-400'
        : 'bg-green-500/20 text-green-400'

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Calculate total hours from hours + minutes
    const totalHours = parseFloat(logForm.hours) + (parseFloat(logForm.minutes) / 60)

    try {
      const response = await fetch(`/api/web/amc/${contract.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hoursSpent: totalHours,
          description: logForm.description,
          category: logForm.category,
        }),
      })

      if (!response.ok) throw new Error('Failed to add log')

      setShowLogForm(false)
      setLogForm({ hours: '0', minutes: '30', description: '', category: 'OTHER' })
      // Refresh page to get updated data
      window.location.reload()
    } catch (error) {
      console.error('Error adding log:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categoryMap[logForm.category]

  return (
    <div className={`bg-slate-800/50 backdrop-blur border ${borderColor} rounded-xl overflow-hidden transition-all hover:border-white/20`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <Link
              href={`/web/clients/${contract.clientId}`}
              className="font-semibold text-white hover:text-indigo-400 transition-colors"
            >
              {contract.client.name}
            </Link>
            <p className="text-sm text-slate-400">{contract.type.replace(/_/g, ' ')}</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadgeColor}`}>
            {isExpired ? 'Expired' : `${daysUntilExpiry}d remaining`}
          </span>
        </div>

        {/* Contract Value */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-slate-400">Contract Value</span>
          <span className="text-green-400 font-medium">
            ₹{contract.amount.toLocaleString('en-IN')}/year
          </span>
        </div>

        {/* Hours Tracking */}
        {contract.allocatedHours && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-400">Hours Used</span>
              <span className={`font-medium ${isHoursLow ? 'text-amber-400' : 'text-white'}`}>
                {contract.usedHours.toFixed(1)}h / {contract.allocatedHours}h
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHoursLow ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-green-400'
                }`}
                style={{ width: `${hoursUsedPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              <span className={isHoursLow ? 'text-amber-400' : 'text-emerald-400'}>{hoursRemaining.toFixed(1)}h</span> remaining
              {contract.hourlyRateAfter && (
                <span className="text-slate-500"> • ₹{contract.hourlyRateAfter}/h after</span>
              )}
            </p>
          </div>
        )}

        {/* Contract Period */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>📅</span>
          {formatDateDDMMYYYY(contract.startDate)} —{' '}
          {formatDateDDMMYYYY(endDate)}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setShowLogForm(!showLogForm)
              if (showLogs) setShowLogs(false)
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              showLogForm
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
            }`}
          >
            + Log Hours
          </button>
          <button
            onClick={() => {
              setShowLogs(!showLogs)
              if (showLogForm) setShowLogForm(false)
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              showLogs
                ? 'bg-slate-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {showLogs ? 'Hide' : 'View'} Logs
          </button>
        </div>
      </div>

      {/* Log Form - Smooth Animation */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showLogForm ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          <form onSubmit={handleLogSubmit} className="space-y-4">
            {/* Time Picker - Hours & Minutes */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Time Spent</label>
              <div className="flex gap-2">
                {/* Hours */}
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={logForm.hours}
                      onChange={(e) => setLogForm({ ...logForm, hours: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      {Array.from({ length: 13 }, (_, i) => (
                        <option key={`hour-${i}`} value={i.toString()}>{i}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">hrs</span>
                  </div>
                </div>
                <span className="text-slate-400 self-center">:</span>
                {/* Minutes */}
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={logForm.minutes}
                      onChange={(e) => setLogForm({ ...logForm, minutes: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      {['0', '15', '30', '45'].map((m) => (
                        <option key={m} value={m}>{m.padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">min</span>
                  </div>
                </div>
              </div>
              {/* Time Display */}
              <p className="text-xs text-slate-500 mt-1.5">
                Total: <span className="text-indigo-400">{(parseFloat(logForm.hours) + parseFloat(logForm.minutes) / 60).toFixed(2)} hours</span>
              </p>
            </div>

            {/* Category Pill Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setLogForm({ ...logForm, category: cat.value })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      logForm.category === cat.value
                        ? `${cat.bgColor} ${cat.textColor} ring-2 ring-offset-1 ring-offset-slate-900 ${cat.borderColor.replace('border', 'ring')}`
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Description</label>
              <textarea
                value={logForm.description}
                onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                required
                rows={2}
                placeholder="What did you work on?"
                className="w-full px-3 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting || (parseFloat(logForm.hours) === 0 && parseFloat(logForm.minutes) === 0)}
                className="flex-1 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Log'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Logs - Smooth Animation */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showLogs ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <span>📜</span> Recent Activity
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {contract.maintenanceLogs.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-2xl block mb-2">📝</span>
                <p className="text-sm text-slate-500">No logs recorded yet</p>
              </div>
            ) : (
              contract.maintenanceLogs.map((log) => {
                const cat = categoryMap[log.category] || categoryMap['OTHER']
                return (
                  <div key={log.id} className="p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-2 py-0.5 text-xs rounded-lg flex items-center gap-1 ${cat.bgColor} ${cat.textColor}`}>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                      <span className="text-xs font-medium text-indigo-400">{log.hoursSpent.toFixed(1)}h</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{log.description}</p>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {new Date(log.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )
              })
            )}
          </div>
          <Link
            href={`/web/amc/${contract.id}`}
            className="mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
          >
            <span>View all logs</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
