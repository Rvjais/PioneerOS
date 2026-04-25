import { BreakthroughStats } from '@/client/components/tasks'
import type { Plan } from './types'

interface StatsRowProps {
  totalPlanned: number
  totalActual: number
  taskCount: number
  plan: Plan | null
}

export function StatsRow({ totalPlanned, totalActual, taskCount, plan }: StatsRowProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Planned Hours</p>
        <p className="text-2xl font-bold text-white">{totalPlanned.toFixed(1)}h</p>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Actual Hours</p>
        <p className={`text-2xl font-bold ${totalActual < 4 ? 'text-red-400' : 'text-green-400'}`}>
          {totalActual.toFixed(1)}h
        </p>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Tasks</p>
        <p className="text-2xl font-bold text-white">{taskCount}</p>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm">Status</p>
        <p className={`text-lg font-semibold ${plan?.status === 'SUBMITTED' ? 'text-green-400' : 'text-amber-400'}`}>
          {plan?.status || 'Not Started'}
        </p>
        {plan?.submittedAt && (
          <p className={`text-xs ${plan.submittedBeforeHuddle ? 'text-green-400' : 'text-red-400'}`}>
            {plan.submittedBeforeHuddle ? 'Submitted before huddle' : 'Submitted after huddle'}
          </p>
        )}
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <p className="text-slate-400 text-sm mb-2">Breakthrough Rate</p>
        <BreakthroughStats compact />
      </div>
    </div>
  )
}
