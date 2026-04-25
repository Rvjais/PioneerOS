'use client'

interface StatItem {
  label: string
  value: number
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate'
}

interface StatsBarProps {
  stats: StatItem[]
}

const colorClasses = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
  slate: 'text-slate-300',
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-card rounded-xl border border-white/10 p-4 text-center"
        >
          <p className={`text-2xl font-bold ${colorClasses[stat.color]}`}>
            {stat.value}
          </p>
          <p className="text-sm text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
