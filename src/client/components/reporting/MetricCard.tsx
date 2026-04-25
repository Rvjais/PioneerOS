'use client'

interface Props {
  label: string
  value: string | number
  formattedValue?: string
  change?: number
  changePercent?: number
  trend?: 'up' | 'down' | 'neutral'
  unit?: string
  color?: string
}

export default function MetricCard({
  label,
  value,
  formattedValue,
  change,
  changePercent,
  trend = 'neutral',
  unit,
  color,
}: Props) {
  const displayValue = formattedValue || String(value)

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-400'
      case 'down':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    }
    if (trend === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-slate-400 text-sm">{label}</p>
        {color && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            {unit && unit !== '%' && <span className="text-lg">{unit}</span>}
            {displayValue}
            {unit === '%' && <span className="text-lg">%</span>}
          </p>
        </div>

        {changePercent !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {changePercent > 0 ? '+' : ''}
              {changePercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {change !== undefined && (
        <p className="text-slate-400 text-xs mt-1">
          {change >= 0 ? '+' : ''}
          {change.toLocaleString()} vs previous
        </p>
      )}
    </div>
  )
}
