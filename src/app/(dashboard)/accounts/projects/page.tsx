'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Project {
  id: string
  name: string
  client: { id: string; name: string }
  type: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  billingType: 'fixed' | 'monthly' | 'milestone' | 'hourly'
  totalValue: number
  billedAmount: number
  paidAmount: number
  startDate: string
  endDate?: string
  currentMilestone?: string
  milestones: Array<{
    name: string
    amount: number
    status: 'pending' | 'completed' | 'billed' | 'paid'
  }>
}

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-blue-500/20 text-blue-400',
  on_hold: 'bg-amber-500/20 text-amber-400',
  cancelled: 'bg-red-500/20 text-red-400'
}

const billingTypeColors = {
  fixed: 'bg-purple-500/20 text-purple-400',
  monthly: 'bg-blue-500/20 text-blue-400',
  milestone: 'bg-cyan-500/20 text-cyan-400',
  hourly: 'bg-amber-500/20 text-amber-400'
}

export default function AccountsProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [billingFilter, setBillingFilter] = useState<string>('all')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?includeBilling=true')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => billingFilter === 'all' || p.billingType === billingFilter)

  const stats = {
    active: projects.filter(p => p.status === 'active').length,
    totalValue: projects.reduce((sum, p) => sum + p.totalValue, 0),
    billed: projects.reduce((sum, p) => sum + p.billedAmount, 0),
    collected: projects.reduce((sum, p) => sum + p.paidAmount, 0),
    pending: projects.reduce((sum, p) => sum + (p.billedAmount - p.paidAmount), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <InfoTooltip
              title="Projects - Accounts View"
              steps={[
                'Track projects tied to billing',
                'View billing milestones and status',
                'Monitor collection per project',
                'Track pending invoices'
              ]}
              tips={[
                'Bill milestones upon completion',
                'Check with delivery team before billing'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Projects with billing milestones</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Active Projects</p>
          <p className="text-2xl font-bold text-emerald-300">{stats.active}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Total Value</p>
          <p className="text-xl font-bold text-blue-300">Rs. {stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-purple-400 text-sm">Billed</p>
          <p className="text-xl font-bold text-purple-300">Rs. {stats.billed.toLocaleString()}</p>
        </div>
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
          <p className="text-teal-400 text-sm">Collected</p>
          <p className="text-xl font-bold text-teal-300">Rs. {stats.collected.toLocaleString()}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm">Pending</p>
          <p className="text-xl font-bold text-amber-300">Rs. {stats.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={billingFilter}
          onChange={e => setBillingFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Billing Types</option>
          <option value="fixed">Fixed Price</option>
          <option value="monthly">Monthly</option>
          <option value="milestone">Milestone</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center text-slate-400">
            No projects found
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-white">{project.name}</h3>
                      <Link
                        href={`/clients/${project.client.id}`}
                        className="text-sm text-slate-400 hover:text-emerald-400"
                      >
                        {project.client.name}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[project.status]}`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${billingTypeColors[project.billingType]}`}>
                      {project.billingType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Total Value</p>
                    <p className="font-medium text-white">Rs. {project.totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Billed</p>
                    <p className="font-medium text-blue-400">Rs. {project.billedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Collected</p>
                    <p className="font-medium text-emerald-400">Rs. {project.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Pending</p>
                    <p className="font-medium text-amber-400">
                      Rs. {(project.billedAmount - project.paidAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Collection Progress</span>
                    <span>{project.totalValue > 0 ? Math.round((project.paidAmount / project.totalValue) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${project.totalValue > 0 ? (project.paidAmount / project.totalValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Billing Milestones</p>
                    <div className="flex flex-wrap gap-2">
                      {project.milestones.map((milestone, index) => (
                        <div
                          key={milestone.name || `milestone-${index}`}
                          className={`px-3 py-1 rounded-lg text-xs border ${
                            milestone.status === 'paid' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                            milestone.status === 'billed' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                            milestone.status === 'completed' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' :
                            'bg-slate-900/20 border-slate-500/30 text-slate-400'
                          }`}
                        >
                          {milestone.name}: Rs. {milestone.amount.toLocaleString()}
                          <span className="ml-1 opacity-70">({milestone.status})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
