'use client'

import { useState, useEffect } from 'react'

interface TaskData {
  id: string
  clientName: string
  title: string
  taskType: string
  priority: string
  status: string
}

interface ClientPlan {
  client: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  priorities: { HIGH: number; MEDIUM: number; LOW: number; URGENT: number }
  taskTypes: { TECHNICAL: number; CONTENT: number; ON_PAGE: number; OFF_PAGE: number; OTHER: number }
}

export default function SeoPlansPage() {
  const [plans, setPlans] = useState<ClientPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seo/tasks')
      .then(res => res.json())
      .then(data => {
        const tasks: TaskData[] = data.tasks || data || []
        const clientMap: Record<string, ClientPlan> = {}

        tasks.forEach((task: TaskData) => {
          const name = task.clientName || 'Unknown'
          if (!clientMap[name]) {
            clientMap[name] = {
              client: name,
              totalTasks: 0,
              completedTasks: 0,
              inProgressTasks: 0,
              priorities: { HIGH: 0, MEDIUM: 0, LOW: 0, URGENT: 0 },
              taskTypes: { TECHNICAL: 0, CONTENT: 0, ON_PAGE: 0, OFF_PAGE: 0, OTHER: 0 },
            }
          }
          const plan = clientMap[name]
          plan.totalTasks++
          if (task.status === 'DONE' || task.status === 'COMPLETED') plan.completedTasks++
          if (task.status === 'IN_PROGRESS') plan.inProgressTasks++
          const p = task.priority as keyof typeof plan.priorities
          if (plan.priorities[p] !== undefined) plan.priorities[p]++
          const t = task.taskType as keyof typeof plan.taskTypes
          if (plan.taskTypes[t] !== undefined) plan.taskTypes[t]++
          else plan.taskTypes.OTHER++
        })

        setPlans(Object.values(clientMap))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0
    return Math.round((current / target) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client SEO Plans</h1>
            <p className="text-teal-200">Strategy and monthly targets for each client</p>
          </div>
          <button disabled title="Coming soon" className="px-4 py-2 glass-card text-teal-600 rounded-lg font-medium opacity-50 cursor-not-allowed">
            + New Plan
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-6">
        {plans.map(plan => (
          <div key={plan.client} className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
              <h2 className="font-semibold text-white">{plan.client}</h2>
              <button disabled title="Coming soon" className="text-teal-600 text-sm font-medium opacity-50 cursor-not-allowed">
                Edit Plan
              </button>
            </div>

            <div className="p-4 grid lg:grid-cols-2 gap-6">
              {/* Priorities & Task Types */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Task Priorities</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.priorities.URGENT > 0 && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        URGENT: {plan.priorities.URGENT}
                      </span>
                    )}
                    {plan.priorities.HIGH > 0 && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                        HIGH: {plan.priorities.HIGH}
                      </span>
                    )}
                    {plan.priorities.MEDIUM > 0 && (
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">
                        MEDIUM: {plan.priorities.MEDIUM}
                      </span>
                    )}
                    {plan.priorities.LOW > 0 && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        LOW: {plan.priorities.LOW}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Task Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.taskTypes.TECHNICAL > 0 && (
                      <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded">
                        Technical: {plan.taskTypes.TECHNICAL}
                      </span>
                    )}
                    {plan.taskTypes.CONTENT > 0 && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        Content: {plan.taskTypes.CONTENT}
                      </span>
                    )}
                    {plan.taskTypes.ON_PAGE > 0 && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                        On-Page: {plan.taskTypes.ON_PAGE}
                      </span>
                    )}
                    {plan.taskTypes.OFF_PAGE > 0 && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                        Off-Page: {plan.taskTypes.OFF_PAGE}
                      </span>
                    )}
                    {plan.taskTypes.OTHER > 0 && (
                      <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded">
                        Other: {plan.taskTypes.OTHER}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Task Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Completed</span>
                      <span className="font-medium text-white">
                        {plan.completedTasks}/{plan.totalTasks}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${calculateProgress(plan.completedTasks, plan.totalTasks)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">In Progress</span>
                      <span className="font-medium text-white">
                        {plan.inProgressTasks}/{plan.totalTasks}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${calculateProgress(plan.inProgressTasks, plan.totalTasks)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Remaining</span>
                      <span className="font-medium text-white">
                        {plan.totalTasks - plan.completedTasks - plan.inProgressTasks}/{plan.totalTasks}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${calculateProgress(plan.totalTasks - plan.completedTasks - plan.inProgressTasks, plan.totalTasks)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
