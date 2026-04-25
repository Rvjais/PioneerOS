'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useParams } from 'next/navigation'

interface ClientData {
  id: string
  name: string
  status: string
  startDate: string
  package: string
  healthScore: number
  accountManager?: {
    name: string
    email: string
  }
  tasks: Array<{
    id: string
    title: string
    status: string
    dueDate: string
  }>
  metrics: Array<{
    id: string
    label: string
    value: string
    trend: string
  }>
}

export default function MykohiClientPortal() {
  const params = useParams()
  const clientId = params.clientId as string
  const [activeTab, setActiveTab] = useState('overview')
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clientId) {
      fetchClientData()
    }
  }, [clientId])

  const fetchClientData = async () => {
    try {
      const res = await fetch(`/api/client-portal/data?clientId=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setClientData(data)
      } else {
        setError('Failed to load client data')
      }
    } catch (err) {
      console.error('Failed to fetch client data:', err)
      setError('Failed to load client data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900/40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-slate-900/40 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Portal</h2>
          <p className="text-slate-400">{error || 'Client data not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900/40 text-white font-sans">
      {/* Whitelabel Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-none">
              M
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              Mykohi Client Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${
              clientData.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-900/40 text-slate-200 border-white/10'
            }`}>
              {clientData.status}
            </span>
            <div className="w-8 h-8 bg-white/10 rounded-full border border-white/20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Client Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {clientData.name}
          </h1>
          <p className="text-slate-400">
            {clientData.package || 'Digital Services'} {clientData.startDate && `• Started on ${formatDateDDMMYYYY(clientData.startDate)}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/10 mb-8">
          {['overview', 'tasks & approvals', 'analytics', 'files'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            {clientData.metrics.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {clientData.metrics.map(m => (
                  <div key={m.id} className="glass-card p-6 rounded-2xl border border-white/10 shadow-none">
                    <p className="text-sm font-medium text-slate-400 mb-1">{m.label}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold text-white">{m.value}</p>
                      <span className={`text-sm font-medium ${m.trend.startsWith('+') ? 'text-emerald-600' : m.trend.startsWith('-') ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                        {m.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 rounded-2xl border border-white/10 text-center">
                <p className="text-slate-400">Metrics will appear here once data is available</p>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column: Tasks */}
              <div className="md:col-span-2 glass-card rounded-2xl border border-white/10 shadow-none overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Current Tasks & Milestones</h2>
                  <button onClick={() => setActiveTab('tasks & approvals')} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View All</button>
                </div>
                <div className="p-0">
                  {clientData.tasks.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/40">
                          <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Milestone</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {clientData.tasks.map(task => (
                          <tr key={task.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-white">{task.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                task.status === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                task.status === 'REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-200' :
                                'bg-blue-500/10 text-blue-400 border-blue-200'
                              }`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No active tasks at the moment
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Account Manager */}
              <div className="glass-card rounded-2xl border border-white/10 shadow-none p-6">
                <h2 className="text-lg font-bold text-white mb-6">Your Team</h2>
                {clientData.accountManager ? (
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 font-semibold border border-white/10">
                      {clientData.accountManager.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{clientData.accountManager.name}</p>
                      <p className="text-sm text-slate-400 mb-2">Account Manager</p>
                      <a href={`mailto:${clientData.accountManager.email}`} className="text-sm text-emerald-600 font-medium hover:underline block mb-1">
                        {clientData.accountManager.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 font-semibold border border-white/10">
                      AM
                    </div>
                    <div>
                      <p className="font-semibold text-white">Account Manager</p>
                      <p className="text-sm text-slate-400 mb-2">Will be assigned shortly</p>
                      <a href="mailto:support@mykohi.com" className="text-sm text-emerald-600 font-medium hover:underline block mb-1">support@mykohi.com</a>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Need Help?</p>
                  <p className="text-sm text-slate-300 mb-3 block">Reach out to your dedicated account manager for any urgent requests.</p>
                  <button className="w-full px-4 py-2 glass-card border border-white/10 text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-900/40 transition-colors shadow-none">
                    Schedule Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="glass-card rounded-2xl border border-white/10 shadow-none p-12 text-center">
            <div className="w-16 h-16 bg-slate-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-slate-400 max-w-sm mx-auto">This section is currently being developed.</p>
          </div>
        )}
      </main>
    </div>
  )
}
