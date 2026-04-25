'use client'

import dynamic from 'next/dynamic'

// Lazy-load ResponsiveContainer (the Recharts wrapper) — prevents SSR/client bundle bloat
const ResponsiveContainer = dynamic(
  () => import('recharts').then(m => m.ResponsiveContainer),
  { ssr: false, loading: () => <div style={{ height: 300 }} className="animate-pulse bg-slate-800/50 rounded-xl" /> }
)

// Chart sub-components — these ARE rendered, so keep them direct imports
// Recharts is tree-shaken well enough at the component level
// The real win is lazy-loading the wrapper + using ssr: false
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface Dataset {
  label: string
  data: number[]
  color?: string
}

interface Props {
  title?: string
  labels: string[]
  datasets: Dataset[]
  height?: number
  showLegend?: boolean
  type?: 'area' | 'line'
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
]

export default function TrendChart({
  title,
  labels,
  datasets,
  height = 300,
  showLegend = false,
  type = 'area',
}: Props) {
  // Transform data for Recharts
  const chartData = labels.map((label, index) => {
    const point: Record<string, string | number> = { name: label }
    datasets.forEach((dataset) => {
      point[dataset.label] = dataset.data[index] || 0
    })
    return point
  })

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toFixed(0)
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      {title && (
        <h3 className="text-white font-medium mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {datasets.map((dataset, index) => (
              <linearGradient
                key={dataset.label}
                id={`gradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={dataset.color || COLORS[index % COLORS.length]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={dataset.color || COLORS[index % COLORS.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />

          <XAxis
            dataKey="name"
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />

          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#F8FAFC',
            }}
            formatter={(value) => formatValue(Number(value))}
            labelStyle={{ color: '#94A3B8' }}
          />

          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '16px' }}
              formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
            />
          )}

          {datasets.map((dataset, index) => (
            <Area
              key={dataset.label}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              fill={type === 'area' ? `url(#gradient-${index})` : 'none'}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
