import { ReactNode } from 'react'

interface QuickStatsProps {
  stats: {
    q4Target: string
    newClients: number
    totalEmployees: number
    activeDepartments: number
    // Optional growth percentages (calculated from historical data)
    q4TargetGrowth?: number
    newClientsGrowth?: number
    employeeGrowth?: number
    departmentGrowth?: number
  }
}

const Icons: Record<string, ReactNode> = {
  target: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  plus: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  building: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
}

export function QuickStats({ stats }: QuickStatsProps) {
  const items = [
    { label: 'Q4 Targets', value: stats.q4Target, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'target', growth: stats.q4TargetGrowth },
    { label: 'New Clients This Month', value: stats.newClients, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'plus', growth: stats.newClientsGrowth },
    { label: 'Total Employees', value: stats.totalEmployees, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'users', growth: stats.employeeGrowth },
    { label: 'Active Departments', value: stats.activeDepartments, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'building', growth: stats.departmentGrowth },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity ${item.bg.replace('/10', '')}`} />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} border ${item.border} ${item.color}`}>
              {Icons[item.icon]}
            </div>
            {/* Only show growth badge if we have actual data */}
            {item.growth !== undefined && item.growth !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                item.growth > 0
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-red-400 bg-red-500/10'
              }`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.growth > 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  )}
                </svg>
                <span>{item.growth > 0 ? '+' : ''}{item.growth}%</span>
              </div>
            )}
          </div>
          <p className="text-3xl font-extrabold text-white mb-1 relative z-10 tracking-tight">{item.value}</p>
          <p className={`text-sm font-semibold uppercase tracking-wider relative z-10 transition-colors ${item.color}`}>{item.label}</p>
        </div>
      ))}
    </div>
  )
}
