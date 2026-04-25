'use client'

import { useState } from 'react'

interface Appreciation {
  id: string
  client: string
  employee: string
  department: string
  feedback: string
  date: string
  category: 'QUALITY' | 'COMMUNICATION' | 'TIMELINESS' | 'INNOVATION' | 'SUPPORT'
}

const APPRECIATIONS: Appreciation[] = [
  { id: '1', client: 'MaxCare Hospital', employee: 'Priya Sharma', department: 'SEO', feedback: 'Excellent SEO work! Our rankings improved significantly.', date: '2024-03-10', category: 'QUALITY' },
  { id: '2', client: 'CareConnect', employee: 'Rahul Verma', department: 'Ads', feedback: 'The ad campaign exceeded our expectations. Great ROI!', date: '2024-03-09', category: 'INNOVATION' },
  { id: '3', client: 'HealthFirst Labs', employee: 'Anita Desai', department: 'Social', feedback: 'Very responsive team. Always available when needed.', date: '2024-03-08', category: 'COMMUNICATION' },
  { id: '4', client: 'WellnessHub', employee: 'Vikram Singh', department: 'Web', feedback: 'Website delivered ahead of schedule. Impressive work!', date: '2024-03-07', category: 'TIMELINESS' },
  { id: '5', client: 'MedPlus Clinics', employee: 'Neha Gupta', department: 'Support', feedback: 'Quick resolution of our technical issues. Thank you!', date: '2024-03-06', category: 'SUPPORT' },
  { id: '6', client: 'Apollo Hospitals', employee: 'Priya Sharma', department: 'SEO', feedback: 'Great strategic insights for our digital presence.', date: '2024-03-05', category: 'INNOVATION' },
]

export default function ClientAppreciationPage() {
  const [filter, setFilter] = useState<string>('all')

  const filteredAppreciations = filter === 'all'
    ? APPRECIATIONS
    : APPRECIATIONS.filter(a => a.category === filter)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'QUALITY': return 'bg-green-500/20 text-green-400'
      case 'COMMUNICATION': return 'bg-blue-500/20 text-blue-400'
      case 'TIMELINESS': return 'bg-purple-500/20 text-purple-400'
      case 'INNOVATION': return 'bg-amber-500/20 text-amber-400'
      case 'SUPPORT': return 'bg-pink-500/20 text-pink-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'QUALITY': return '⭐'
      case 'COMMUNICATION': return '💬'
      case 'TIMELINESS': return '⚡'
      case 'INNOVATION': return '💡'
      case 'SUPPORT': return '🤝'
      default: return '👍'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Appreciation</h1>
            <p className="text-pink-100">Positive feedback from our clients</p>
          </div>
          <div className="text-right">
            <p className="text-pink-100 text-sm">This Month</p>
            <p className="text-3xl font-bold">{APPRECIATIONS.length}</p>
          </div>
        </div>
      </div>

      {/* Stats by Category */}
      <div className="grid grid-cols-5 gap-4">
        {['QUALITY', 'COMMUNICATION', 'TIMELINESS', 'INNOVATION', 'SUPPORT'].map(cat => {
          const count = APPRECIATIONS.filter(a => a.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setFilter(filter === cat ? 'all' : cat)}
              className={`p-4 rounded-xl border-2 transition-all ${
                filter === cat ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 glass-card hover:border-purple-300'
              }`}
            >
              <div className="text-2xl mb-1">{getCategoryIcon(cat)}</div>
              <p className="text-sm text-slate-400">{cat}</p>
              <p className="text-xl font-bold text-white">{count}</p>
            </button>
          )
        })}
      </div>

      {/* Appreciations List */}
      <div className="space-y-4">
        {filteredAppreciations.map(appreciation => (
          <div key={appreciation.id} className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xl">
                {getCategoryIcon(appreciation.category)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{appreciation.client}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(appreciation.category)}`}>
                    {appreciation.category}
                  </span>
                </div>
                <p className="text-slate-300 mb-2">&quot;{appreciation.feedback}&quot;</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Recognized: {appreciation.employee}</span>
                  <span>Department: {appreciation.department}</span>
                  <span>{new Date(appreciation.date).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recognition Board */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <h3 className="font-semibold text-purple-800 mb-4">Top Recognized Employees</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Priya Sharma', count: 5, dept: 'SEO' },
            { name: 'Rahul Verma', count: 3, dept: 'Ads' },
            { name: 'Anita Desai', count: 2, dept: 'Social' },
          ].map((emp, idx) => (
            <div key={emp.name} className="flex items-center gap-3 glass-card rounded-lg p-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
              }`}>
                {idx + 1}
              </div>
              <div>
                <p className="font-medium text-white">{emp.name}</p>
                <p className="text-sm text-slate-400">{emp.dept} - {emp.count} appreciations</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
