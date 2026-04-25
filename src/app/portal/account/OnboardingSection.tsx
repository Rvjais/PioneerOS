'use client'

import { getTaskStatusColor } from '@/shared/constants/portal'
import { OnboardingPhase, formatDate } from './types'

interface OnboardingSectionProps {
  onboarding: {
    completionPercentage: number
    status: string
    phases: Record<string, OnboardingPhase>
  }
  expandedPhase: string | null
  setExpandedPhase: (phase: string | null) => void
}

export default function OnboardingSection({ onboarding, expandedPhase, setExpandedPhase }: OnboardingSectionProps) {
  return (
    <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Onboarding Progress</h3>
            <p className="text-sm text-slate-400 mt-1">Track your onboarding completion status</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getTaskStatusColor(onboarding.status)}`}>
              {onboarding.status.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${onboarding.completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-300">{onboarding.completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {onboarding.phases && Object.entries(onboarding.phases).map(([key, phase]) => {
          const completedCount = phase.items.filter(item => item.completed).length
          const totalCount = phase.items.length
          const isExpanded = expandedPhase === key

          return (
            <div key={key}>
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : key)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    completedCount === totalCount ? 'bg-green-500/20' : 'bg-slate-800/50'
                  }`}>
                    {completedCount === totalCount ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium text-slate-300">{completedCount}/{totalCount}</span>
                    )}
                  </div>
                  <span className="font-medium text-white">{phase.label}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-6 pb-4 space-y-2">
                  {phase.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-2 px-4 rounded-lg bg-slate-900/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-green-500' : 'bg-white/20'
                        }`}>
                          {item.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${item.completed ? 'text-white' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                      </div>
                      {item.completedAt && (
                        <span className="text-xs text-slate-400">{formatDate(item.completedAt)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
