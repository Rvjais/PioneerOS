'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Employee {
  id: string
  firstName: string
  lastName: string
  department: string
}

interface Client {
  id: string
  name: string
}

interface Giver {
  id: string
  firstName: string
  lastName: string
}

interface Appreciation {
  id: string
  employeeId: string
  type: string
  title: string
  description: string
  clientId: string | null
  givenBy: string
  xpAwarded: number
  isPublic: boolean
  createdAt: string
  employee: Employee
  client: Client | null
  giver: Giver
}

interface Stats {
  total: number
  thisMonth: number
  byType: Record<string, number>
  totalXP: number
}

const APPRECIATION_TYPES = [
  { id: 'CLIENT_PRAISE', label: 'Client Praise', color: 'bg-green-500/20 text-green-400', icon: '👏' },
  { id: 'TEAM_PLAYER', label: 'Team Player', color: 'bg-blue-500/20 text-blue-400', icon: '🤝' },
  { id: 'INNOVATION', label: 'Innovation', color: 'bg-purple-500/20 text-purple-400', icon: '💡' },
  { id: 'LEADERSHIP', label: 'Leadership', color: 'bg-amber-500/20 text-amber-400', icon: '⭐' },
  { id: 'ABOVE_AND_BEYOND', label: 'Above & Beyond', color: 'bg-rose-100 text-rose-700', icon: '🚀' },
]

export default function AppreciationsPage() {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])

  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'CLIENT_PRAISE',
    title: '',
    description: '',
    xpAwarded: 10,
    isPublic: true,
  })

  useEffect(() => {
    fetchAppreciations()
    fetchEmployees()
  }, [filter])

  const fetchAppreciations = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('type', filter)

      const res = await fetch(`/api/hr/appreciations?${params}`)
      const data = await res.json()
      setAppreciations(data.appreciations || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching appreciations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/hr/employees')
      const data = await res.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/hr/appreciations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          employeeId: '',
          type: 'CLIENT_PRAISE',
          title: '',
          description: '',
          xpAwarded: 10,
          isPublic: true,
        })
        fetchAppreciations()
      }
    } catch (error) {
      console.error('Error creating appreciation:', error)
    }
  }

  const getTypeInfo = (type: string) => {
    return APPRECIATION_TYPES.find(t => t.id === type) || APPRECIATION_TYPES[0]
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appreciations</h1>
          <p className="text-slate-300">Recognize and celebrate team achievements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Give Appreciation
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-xl">🎉</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-slate-400">Total Appreciations</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                <p className="text-sm text-slate-400">This Month</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalXP}</p>
                <p className="text-sm text-slate-400">Total XP Awarded</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(stats.byType).length}
                </p>
                <p className="text-sm text-slate-400">Categories Used</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {APPRECIATION_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setFilter(type.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-200 hover:bg-white/10'
            }`}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* Appreciations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-slate-400">Loading appreciations...</p>
          </div>
        ) : appreciations.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl border border-white/10">
            <span className="text-4xl">🎉</span>
            <p className="mt-2 text-slate-300">No appreciations yet</p>
            <p className="text-sm text-slate-400">Be the first to recognize someone!</p>
          </div>
        ) : (
          appreciations.map(appreciation => {
            const typeInfo = getTypeInfo(appreciation.type)
            return (
              <div
                key={appreciation.id}
                className="glass-card rounded-xl border border-white/10 p-5 hover:shadow-none transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <UserAvatar user={{ id: appreciation.employee.id, firstName: appreciation.employee.firstName, lastName: appreciation.employee.lastName }} size="lg" showPreview={false} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {appreciation.employee.firstName} {appreciation.employee.lastName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-200">{appreciation.title}</h3>
                      <p className="text-slate-300 mt-1">{appreciation.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                        <span>Given by {appreciation.giver.firstName} {appreciation.giver.lastName}</span>
                        <span>+{appreciation.xpAwarded} XP</span>
                        <span>{formatDateDDMMYYYY(appreciation.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Appreciation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl w-full max-w-lg">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">Give Appreciation</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {APPRECIATION_TYPES.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Outstanding Client Service"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe their achievement..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">XP Award</label>
                  <input
                    type="number"
                    value={formData.xpAwarded}
                    onChange={(e) => setFormData({ ...formData, xpAwarded: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={0}
                    max={100}
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                    <span className="text-sm text-slate-200">Make public</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Give Appreciation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
