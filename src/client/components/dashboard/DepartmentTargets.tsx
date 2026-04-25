interface Target {
  id: string
  department: string
  metric: string
  target: number
  completed: number
  tip: string | null
}

interface DepartmentTargetsProps {
  targets: Target[]
}

const deptColors: Record<string, string> = {
  AGENCY: 'blue',
  SEO: 'green',
  ADS: 'orange',
  WEB: 'purple',
  SOCIAL: 'pink',
}

export function DepartmentTargets({ targets }: DepartmentTargetsProps) {
  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden relative group">
      <div className="absolute -left-32 -top-32 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>

      <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between relative z-10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Velocity Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Real-time KPI Tracking</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <span className="text-blue-400 font-bold text-sm">Q4</span>
        </div>
      </div>

      <div className="p-6 space-y-7 bg-[#141A25]/30 relative z-10">
        {targets.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium tracking-wide">Awaiting fresh velocity targets</p>
          </div>
        ) : (
          targets.map((target) => {
            const progress = Math.round((target.completed / target.target) * 100)
            const color = deptColors[target.department] || 'blue'

            return (
              <div key={target.id} className="space-y-3 group/target">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className={`inline-flex items-center w-fit px-2.5 py-1 bg-${color}-500/20 text-${color}-400 text-[10px] uppercase tracking-widest font-bold rounded-lg border border-${color}-500/30 group-hover/target:bg-${color}-500/30 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.02)]`}>
                      {target.department}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{target.metric}</span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-lg font-bold text-white tracking-tight">
                      {target.completed} <span className="text-slate-400 text-sm font-medium">/ {target.target}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-${color}-400 bg-${color}-500/10 uppercase tracking-wider`}>{progress}% Achieved</span>
                  </div>
                </div>

                <div className="relative h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm animate-pulse-glow"></div>
                  </div>
                </div>

                {target.tip && (
                  <p className="text-[11px] text-slate-400 flex items-start gap-2 bg-white/5 backdrop-blur-sm p-2.5 rounded-lg border border-white/5 mt-2">
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="leading-relaxed">{target.tip}</span>
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
