'use client'

import { useState } from 'react'

interface Collection {
  id: string
  client: string
  amountDue: number
  amountCollected: number
  status: 'COLLECTED' | 'PARTIAL' | 'PENDING' | 'OVERDUE'
  dueDate: string
  lastFollowUp: string
  assignedTo: string
  notes: string
}

const COLLECTIONS: Collection[] = [
  { id: '1', client: 'Apollo Hospitals', amountDue: 150000, amountCollected: 150000, status: 'COLLECTED', dueDate: '2024-03-10', lastFollowUp: '2024-03-08', assignedTo: 'Vikram', notes: 'Paid on time' },
  { id: '2', client: 'MaxCare Hospital', amountDue: 200000, amountCollected: 100000, status: 'PARTIAL', dueDate: '2024-03-15', lastFollowUp: '2024-03-10', assignedTo: 'Vikram', notes: 'Balance promised by Mar 20' },
  { id: '3', client: 'MedPlus Clinics', amountDue: 80000, amountCollected: 0, status: 'OVERDUE', dueDate: '2024-03-05', lastFollowUp: '2024-03-09', assignedTo: 'Anita', notes: 'Budget constraints, needs escalation' },
  { id: '4', client: 'HealthFirst Labs', amountDue: 60000, amountCollected: 0, status: 'PENDING', dueDate: '2024-03-20', lastFollowUp: '2024-03-08', assignedTo: 'Vikram', notes: 'Payment being processed' },
  { id: '5', client: 'CareConnect', amountDue: 120000, amountCollected: 0, status: 'OVERDUE', dueDate: '2024-03-01', lastFollowUp: '2024-03-07', assignedTo: 'Anita', notes: 'Disputed deliverables, escalated' },
]

export default function ManagerAccountsCollectionsPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredCollections = filter === 'all' ? COLLECTIONS : COLLECTIONS.filter(c => c.status === filter)

  const totalDue = COLLECTIONS.reduce((sum, c) => sum + c.amountDue, 0)
  const totalCollected = COLLECTIONS.reduce((sum, c) => sum + c.amountCollected, 0)
  const overdueAmount = COLLECTIONS.filter(c => c.status === 'OVERDUE').reduce((sum, c) => sum + c.amountDue - c.amountCollected, 0)
  const collectionRate = Math.round((totalCollected / totalDue) * 100)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
    return `${(amount / 1000).toFixed(0)}K`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COLLECTED': return 'bg-green-500/20 text-green-400'
      case 'PARTIAL': return 'bg-amber-500/20 text-amber-400'
      case 'PENDING': return 'bg-blue-500/20 text-blue-400'
      case 'OVERDUE': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Collections Dashboard</h1>
            <p className="text-emerald-100">Payment collection tracking and follow-ups</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Collection Rate</p>
              <p className="text-3xl font-bold">{collectionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Collected</p>
              <p className="text-3xl font-bold">{formatCurrency(totalCollected)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Due</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalDue)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Collected</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Outstanding</p>
          <p className="text-3xl font-bold text-amber-400">{formatCurrency(totalDue - totalCollected)}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Overdue</p>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(overdueAmount)}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['all', 'COLLECTED', 'PARTIAL', 'PENDING', 'OVERDUE'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === status
                ? 'bg-emerald-500 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Collections Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">AMOUNT DUE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">COLLECTED</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DUE DATE</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ASSIGNED</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">NOTES</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollections.map(collection => (
              <tr key={collection.id} className="border-b border-white/5 hover:bg-slate-900/40">
                <td className="py-4 px-4">
                  <span className="font-medium text-white">{collection.client}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-medium text-white">{formatCurrency(collection.amountDue)}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-medium ${collection.amountCollected > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                    {formatCurrency(collection.amountCollected)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(collection.status)}`}>
                    {collection.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-400">
                    {new Date(collection.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-slate-300">{collection.assignedTo}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-slate-400">{collection.notes}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Items */}
      <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-800 mb-3">Urgent Collection Actions</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-red-400">
          <div>
            <p className="font-medium mb-1">Overdue - Immediate Follow-up</p>
            <ul className="space-y-1">
              <li>- MedPlus Clinics: 80K overdue 6 days</li>
              <li>- CareConnect: 1.2L overdue 10 days (escalated)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Partial Payments</p>
            <ul className="space-y-1">
              <li>- MaxCare: 1L balance due by Mar 20</li>
              <li>- Schedule reminder call for Mar 18</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
