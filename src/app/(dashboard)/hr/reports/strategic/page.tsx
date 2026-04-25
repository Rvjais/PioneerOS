import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

async function getStrategicHRData() {
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1)
  const today = new Date()

  // Get quarterly date ranges
  const q1Start = new Date(currentYear, 0, 1)
  const q1End = new Date(currentYear, 3, 1)
  const q2Start = new Date(currentYear, 3, 1)
  const q2End = new Date(currentYear, 6, 1)
  const q3Start = new Date(currentYear, 6, 1)
  const q3End = new Date(currentYear, 9, 1)
  const q4Start = new Date(currentYear, 9, 1)
  const q4End = new Date(currentYear + 1, 0, 1)

  const [
    totalEmployees,
    activeEmployees,
    newHiresYTD,
    exitsYTD,
    employeesWithTenure,
    trainingsCompleted,
    totalTrainingHours,
    q1Hires,
    q1Exits,
    q2Hires,
    q2Exits,
    q3Hires,
    q3Exits,
    q4Hires,
    q4Exits,
    headcountEndQ1,
    headcountEndQ2,
    headcountEndQ3,
  ] = await Promise.all([
    // Total employees (all time)
    prisma.user.count(),
    // Active employees
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    // New hires YTD
    prisma.user.count({
      where: {
        joiningDate: { gte: yearStart },
      },
    }),
    // Exits YTD
    prisma.exitProcess.count({
      where: {
        createdAt: { gte: yearStart },
      },
    }),
    // Employees with tenure data
    prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        joiningDate: { lte: new Date() },
      },
      select: { joiningDate: true },
    }),
    // Training completions
    prisma.userTraining.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: yearStart },
      },
    }),
    // Training hours (from training durations)
    prisma.userTraining.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: yearStart },
      },
      include: {
        training: { select: { duration: true } },
      },
    }),
    // Q1 hires
    prisma.user.count({
      where: { joiningDate: { gte: q1Start, lt: q1End } },
    }),
    // Q1 exits
    prisma.exitProcess.count({
      where: { createdAt: { gte: q1Start, lt: q1End } },
    }),
    // Q2 hires
    prisma.user.count({
      where: { joiningDate: { gte: q2Start, lt: q2End } },
    }),
    // Q2 exits
    prisma.exitProcess.count({
      where: { createdAt: { gte: q2Start, lt: q2End } },
    }),
    // Q3 hires
    prisma.user.count({
      where: { joiningDate: { gte: q3Start, lt: q3End } },
    }),
    // Q3 exits
    prisma.exitProcess.count({
      where: { createdAt: { gte: q3Start, lt: q3End } },
    }),
    // Q4 hires (so far)
    prisma.user.count({
      where: { joiningDate: { gte: q4Start, lt: q4End } },
    }),
    // Q4 exits (so far)
    prisma.exitProcess.count({
      where: { createdAt: { gte: q4Start, lt: q4End } },
    }),
    // Headcount at end of Q1
    prisma.user.count({
      where: {
        joiningDate: { lt: q1End },
        OR: [
          { status: 'ACTIVE' },
          { exitProcesses: { some: { createdAt: { gte: q1End } } } },
        ],
      },
    }),
    // Headcount at end of Q2
    prisma.user.count({
      where: {
        joiningDate: { lt: q2End },
        OR: [
          { status: 'ACTIVE' },
          { exitProcesses: { some: { createdAt: { gte: q2End } } } },
        ],
      },
    }),
    // Headcount at end of Q3
    prisma.user.count({
      where: {
        joiningDate: { lt: q3End },
        OR: [
          { status: 'ACTIVE' },
          { exitProcesses: { some: { createdAt: { gte: q3End } } } },
        ],
      },
    }),
  ])

  // Calculate metrics
  const avgTenureMonths = employeesWithTenure.length > 0
    ? Math.round(
        employeesWithTenure.reduce((acc, emp) => {
          const months = Math.floor(
            (today.getTime() - new Date(emp.joiningDate!).getTime()) / (1000 * 60 * 60 * 24 * 30)
          )
          return acc + months
        }, 0) / employeesWithTenure.length
      )
    : 0

  const trainingHoursTotal = totalTrainingHours.reduce(
    (acc, ut) => acc + (ut.training.duration || 0),
    0
  )
  const avgTrainingHours = activeEmployees > 0
    ? Math.round(trainingHoursTotal / activeEmployees)
    : 0

  const attritionRate = activeEmployees > 0
    ? Math.round((exitsYTD / (activeEmployees + exitsYTD)) * 100 * 10) / 10
    : 0

  // Determine current quarter
  const currentQuarter = Math.floor(today.getMonth() / 3) + 1

  return {
    currentYear,
    ytdMetrics: [
      { label: 'Total Headcount', value: activeEmployees, target: Math.round(activeEmployees * 1.15), ytdChange: `+${newHiresYTD - exitsYTD}` },
      { label: 'New Hires YTD', value: newHiresYTD, target: Math.round(newHiresYTD * 1.3), ytdChange: `+${newHiresYTD}` },
      { label: 'Attrition Rate', value: attritionRate, target: 10, ytdChange: attritionRate <= 10 ? `${attritionRate}%` : `${attritionRate}%` },
      { label: 'Avg Tenure (months)', value: avgTenureMonths, target: 24, ytdChange: `${avgTenureMonths}m` },
      { label: 'Training Hours/Employee', value: avgTrainingHours, target: 40, ytdChange: `+${avgTrainingHours}` },
      { label: 'Training Completions', value: trainingsCompleted, target: Math.round(activeEmployees * 2), ytdChange: `+${trainingsCompleted}` },
    ],
    quarterlyTrends: [
      { quarter: 'Q1', hires: q1Hires, exits: q1Exits, headcount: headcountEndQ1 || activeEmployees - newHiresYTD + exitsYTD + q1Hires - q1Exits },
      { quarter: 'Q2', hires: q2Hires, exits: q2Exits, headcount: headcountEndQ2 || (headcountEndQ1 || 0) + q2Hires - q2Exits },
      { quarter: 'Q3', hires: q3Hires, exits: q3Exits, headcount: headcountEndQ3 || (headcountEndQ2 || 0) + q3Hires - q3Exits },
      { quarter: currentQuarter >= 4 ? 'Q4' : 'Q4 (Proj)', hires: q4Hires, exits: q4Exits, headcount: activeEmployees },
    ],
    currentQuarter,
  }
}

export default async function HRStrategicReportPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const data = await getStrategicHRData()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Strategic goals - these would ideally come from a database table
  const strategicGoals = [
    {
      goal: `Grow team to ${Math.round(data.ytdMetrics[0].value * 1.3)} by year end`,
      progress: Math.round((data.ytdMetrics[0].value / (data.ytdMetrics[0].value * 1.3)) * 100),
      status: data.ytdMetrics[0].value >= data.ytdMetrics[0].target * 0.8 ? 'ON_TRACK' : 'AT_RISK' as const
    },
    {
      goal: 'Maintain attrition below 10%',
      progress: data.ytdMetrics[2].value <= 10 ? 100 : Math.round((10 / data.ytdMetrics[2].value) * 100),
      status: data.ytdMetrics[2].value <= 10 ? 'ON_TRACK' : data.ytdMetrics[2].value <= 15 ? 'AT_RISK' : 'BEHIND' as const
    },
    {
      goal: 'Average 40 training hours per employee',
      progress: Math.round((data.ytdMetrics[4].value / 40) * 100),
      status: data.ytdMetrics[4].value >= 32 ? 'ON_TRACK' : data.ytdMetrics[4].value >= 20 ? 'AT_RISK' : 'BEHIND' as const
    },
    {
      goal: 'Achieve 24+ month average tenure',
      progress: Math.round((data.ytdMetrics[3].value / 24) * 100),
      status: data.ytdMetrics[3].value >= 24 ? 'ON_TRACK' : data.ytdMetrics[3].value >= 18 ? 'AT_RISK' : 'BEHIND' as const
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-purple-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Strategic HR Review</h1>
            <p className="text-slate-300">Year-to-Date Analysis - {data.currentYear}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-300">Current Quarter</p>
            <p className="text-xl font-bold">Q{data.currentQuarter}</p>
          </div>
        </div>
      </div>

      {/* YTD Metrics */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Year-to-Date Performance</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 p-4">
          {data.ytdMetrics.map((metric, idx) => (
            <div key={metric.label} className="p-4 border border-white/5 rounded-lg">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-white">
                  {metric.value}{metric.label.includes('Rate') ? '%' : ''}
                </span>
                <span className="text-sm text-slate-400">/ {metric.target} target</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-sm font-medium ${
                  metric.ytdChange.startsWith('+') || metric.value <= metric.target ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {metric.ytdChange} YTD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quarterly Trends */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Quarterly Headcount Trends</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Quarter</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">New Hires</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Exits</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Net Change</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">End Headcount</th>
                </tr>
              </thead>
              <tbody>
                {data.quarterlyTrends.map((q, idx) => (
                  <tr key={q.quarter} className="border-b border-white/5">
                    <td className="py-3 px-4 font-medium text-white">{q.quarter}</td>
                    <td className="py-3 px-4 text-right text-green-400">+{q.hires}</td>
                    <td className="py-3 px-4 text-right text-red-400">-{q.exits}</td>
                    <td className="py-3 px-4 text-right font-medium text-white">
                      {q.hires - q.exits >= 0 ? '+' : ''}{q.hires - q.exits}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">{q.headcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Strategic Goals */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Strategic Goals Progress</h2>
        </div>
        <div className="divide-y divide-white/10">
          {strategicGoals.map((goal, idx) => (
            <div key={goal.goal} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-white text-sm">{goal.goal}</p>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  goal.status === 'ON_TRACK' ? 'bg-green-500/20 text-green-400' :
                  goal.status === 'AT_RISK' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {goal.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    goal.status === 'ON_TRACK' ? 'bg-green-500' :
                    goal.status === 'AT_RISK' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{Math.min(goal.progress, 100)}% complete</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <h3 className="font-semibold text-purple-800 mb-4">Strategic Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Talent Acquisition</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {data.ytdMetrics[1].value < data.ytdMetrics[1].target && (
                <li>- Accelerate hiring to meet growth targets</li>
              )}
              <li>- Implement employee referral incentive program</li>
              <li>- Explore talent acquisition partnerships</li>
            </ul>
          </div>
          <div className="glass-card rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Retention & Engagement</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {data.ytdMetrics[2].value > 10 && (
                <li>- Address attrition - currently at {data.ytdMetrics[2].value}%</li>
              )}
              <li>- Review compensation benchmarking</li>
              <li>- Enhance career growth pathways</li>
            </ul>
          </div>
          <div className="glass-card rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Learning & Development</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {data.ytdMetrics[4].value < 40 && (
                <li>- Increase training hours ({data.ytdMetrics[4].value}h avg vs 40h target)</li>
              )}
              <li>- Launch leadership development program</li>
              <li>- Digitize learning management</li>
            </ul>
          </div>
          <div className="glass-card rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Culture & Values</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>- Roll out diversity & inclusion initiatives</li>
              <li>- Strengthen employer branding</li>
              <li>- Quarterly town halls and feedback sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
