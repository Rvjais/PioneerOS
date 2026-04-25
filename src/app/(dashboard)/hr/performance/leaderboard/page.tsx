'use client'

import { useState } from 'react'

interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  role: string
  avatar?: string
  score: number
  metrics: {
    hiresCompleted: number
    onboardingsCompleted: number
    taskCompletion: number
    responseTime: number // hours
  }
  trend: 'up' | 'down' | 'same'
  previousRank: number
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    id: '1',
    rank: 1,
    name: 'Priya Sharma',
    role: 'Senior Recruiter',
    score: 945,
    metrics: { hiresCompleted: 8, onboardingsCompleted: 6, taskCompletion: 95, responseTime: 2 },
    trend: 'up',
    previousRank: 2,
  },
  {
    id: '2',
    rank: 2,
    name: 'Rahul Verma',
    role: 'HR Manager',
    score: 890,
    metrics: { hiresCompleted: 6, onboardingsCompleted: 8, taskCompletion: 92, responseTime: 3 },
    trend: 'down',
    previousRank: 1,
  },
  {
    id: '3',
    rank: 3,
    name: 'Anita Desai',
    role: 'HR Executive',
    score: 820,
    metrics: { hiresCompleted: 4, onboardingsCompleted: 5, taskCompletion: 88, responseTime: 4 },
    trend: 'up',
    previousRank: 5,
  },
  {
    id: '4',
    rank: 4,
    name: 'Vikram Singh',
    role: 'Recruiter',
    score: 780,
    metrics: { hiresCompleted: 5, onboardingsCompleted: 3, taskCompletion: 85, responseTime: 5 },
    trend: 'same',
    previousRank: 4,
  },
  {
    id: '5',
    rank: 5,
    name: 'Neha Gupta',
    role: 'HR Coordinator',
    score: 720,
    metrics: { hiresCompleted: 2, onboardingsCompleted: 7, taskCompletion: 90, responseTime: 3 },
    trend: 'down',
    previousRank: 3,
  },
]

export default function HRLeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month')

  const top3 = LEADERBOARD_DATA.slice(0, 3)
  const rest = LEADERBOARD_DATA.slice(3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">HR Leaderboard</h1>
          <p className="text-sm text-slate-400">Team performance rankings</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
                timeframe === t
                  ? 'bg-purple-500 text-white'
                  : 'glass-card text-slate-300 border border-white/10 hover:bg-slate-900/40'
              }`}
            >
              This {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-end justify-center gap-4 pt-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold mb-2">
              {top3[1]?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <p className="font-semibold text-sm">{top3[1]?.name}</p>
            <p className="text-xs text-white/70">{top3[1]?.role}</p>
            <div className="w-24 h-24 bg-white/20 rounded-t-lg mt-4 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm">{top3[1]?.score} pts</p>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-8">
            <div className="text-4xl mb-2">👑</div>
            <div className="w-24 h-24 rounded-full bg-amber-400/30 border-4 border-amber-400 flex items-center justify-center text-3xl font-bold mb-2">
              {top3[0]?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <p className="font-bold">{top3[0]?.name}</p>
            <p className="text-xs text-white/70">{top3[0]?.role}</p>
            <div className="w-28 h-32 bg-amber-400/30 rounded-t-lg mt-4 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold">1</p>
                <p className="text-lg">{top3[0]?.score} pts</p>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold mb-2">
              {top3[2]?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <p className="font-semibold text-sm">{top3[2]?.name}</p>
            <p className="text-xs text-white/70">{top3[2]?.role}</p>
            <div className="w-24 h-20 bg-amber-700/30 rounded-t-lg mt-4 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm">{top3[2]?.score} pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Rankings */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40">
          <h2 className="font-semibold text-white">Full Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">RANK</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TEAM MEMBER</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">HIRES</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ONBOARDING</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TASK %</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RESPONSE</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">SCORE</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD_DATA.map(entry => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                        entry.rank === 2 ? 'bg-white/10 text-slate-200' :
                        entry.rank === 3 ? 'bg-amber-700/20 text-amber-800' :
                        'bg-slate-800/50 text-slate-300'
                      }`}>
                        {entry.rank}
                      </span>
                      {entry.trend === 'up' && <span className="text-green-500 text-xs">↑</span>}
                      {entry.trend === 'down' && <span className="text-red-500 text-xs">↓</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">
                        {entry.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{entry.name}</p>
                        <p className="text-sm text-slate-400">{entry.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium text-white">{entry.metrics.hiresCompleted}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium text-white">{entry.metrics.onboardingsCompleted}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-medium ${
                      entry.metrics.taskCompletion >= 90 ? 'text-green-400' :
                      entry.metrics.taskCompletion >= 80 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {entry.metrics.taskCompletion}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-slate-300">{entry.metrics.responseTime}h</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-purple-400">{entry.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Info */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-3">How Scores are Calculated</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-purple-400">
          <div>
            <p className="font-medium">Hires Completed</p>
            <p className="text-purple-400">50 points per hire</p>
          </div>
          <div>
            <p className="font-medium">Onboarding Completed</p>
            <p className="text-purple-400">40 points per onboarding</p>
          </div>
          <div>
            <p className="font-medium">Task Completion Rate</p>
            <p className="text-purple-400">Up to 200 bonus points</p>
          </div>
          <div>
            <p className="font-medium">Response Time</p>
            <p className="text-purple-400">Faster = more points</p>
          </div>
        </div>
      </div>
    </div>
  )
}
