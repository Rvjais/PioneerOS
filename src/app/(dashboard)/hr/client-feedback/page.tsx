'use client'

import { useEffect, useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useSession } from 'next-auth/react'

interface Employee {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  department: string
}

interface Client {
  id: string
  name: string
}

interface Feedback {
  id: string
  employeeId: string
  employeeName: string
  clientId: string
  clientName: string
  type: 'FEEDBACK' | 'REMARK' | 'RATING'
  rating: number | null
  content: string
  createdAt: string
  createdBy: string
}

export default function ClientFeedbackPage() {
  const { data: session } = useSession()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [feedbackType, setFeedbackType] = useState<'FEEDBACK' | 'REMARK' | 'RATING'>('FEEDBACK')
  const [rating, setRating] = useState<number>(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch employees
      const empRes = await fetch('/api/hr/employees')
      if (empRes.ok) {
        const data = await empRes.json()
        setEmployees(data)
      }

      // Fetch clients (only names for HR - no financial data)
      const clientRes = await fetch('/api/hr/client-names')
      if (clientRes.ok) {
        const data = await clientRes.json()
        setClients(data)
      }

      // Fetch existing feedbacks
      const feedbackRes = await fetch('/api/hr/client-feedback')
      if (feedbackRes.ok) {
        const data = await feedbackRes.json()
        setFeedbacks(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEmployee || !selectedClient || !content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/hr/client-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          clientId: selectedClient,
          type: feedbackType,
          rating: feedbackType === 'RATING' ? rating : null,
          content: content.trim(),
        }),
      })

      if (res.ok) {
        await fetchData()
        setShowForm(false)
        setSelectedEmployee('')
        setSelectedClient('')
        setFeedbackType('FEEDBACK')
        setRating(5)
        setContent('')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Feedback</h1>
          <p className="text-slate-400 mt-1">Record feedback, remarks, and ratings from clients about employees</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          + Add Feedback
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Total Feedbacks</p>
          <p className="text-2xl font-bold text-white mt-1">{feedbacks.filter(f => f.type === 'FEEDBACK').length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Remarks</p>
          <p className="text-2xl font-bold text-white mt-1">{feedbacks.filter(f => f.type === 'REMARK').length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Ratings</p>
          <p className="text-2xl font-bold text-white mt-1">{feedbacks.filter(f => f.type === 'RATING').length}</p>
        </div>
      </div>

      {/* Add Feedback Form */}
      {showForm && (
        <div className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Record Client Feedback</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.empId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white"
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as 'FEEDBACK' | 'REMARK' | 'RATING')}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white"
                >
                  <option value="FEEDBACK">Feedback</option>
                  <option value="REMARK">Remark</option>
                  <option value="RATING">Rating</option>
                </select>
              </div>
              {feedbackType === 'RATING' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter feedback details..."
                rows={4}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-slate-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Feedback'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Feedback</h3>
        </div>
        <div className="divide-y divide-white/5">
          {feedbacks.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No feedback recorded yet. Click "Add Feedback" to record client feedback about employees.
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div key={fb.id} className="p-5 hover:bg-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{fb.employeeName}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-400">{fb.clientName}</span>
                    </div>
                    <p className="text-slate-300 mt-2">{fb.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      fb.type === 'FEEDBACK' ? 'bg-blue-500/20 text-blue-400' :
                      fb.type === 'REMARK' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {fb.type}
                      {fb.type === 'RATING' && fb.rating && `: ${fb.rating}/10`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span>Recorded by {fb.createdBy}</span>
                  <span>{formatDateDDMMYYYY(fb.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
