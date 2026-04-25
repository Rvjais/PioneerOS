'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  profilePicture?: string
  collectionsAmount: number
  invoicesProcessed: number
  collectionRate: number
  points: number
  trend: 'up' | 'down' | 'same'
  previousRank?: number
}

export default function AccountsLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'collections' | 'invoices' | 'rate' | 'points'>('collections')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedMetric, selectedPeriod])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/accounts/leaderboard?metric=${selectedMetric}&period=${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white'
      case 2:
        return 'bg-gradient-to-r from-slate-400 to-slate-300 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-700 to-amber-600 text-white'
      default:
        return 'bg-white/10 backdrop-blur-sm text-slate-300'
    }
  }

  const getTrendIcon = (trend: string, previousRank?: number, currentRank?: number) => {
    if (trend === 'up') {
      return (
        <span className="flex items-center text-emerald-400 text-xs">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          {previousRank && currentRank && previousRank - currentRank > 0 && `+${previousRank - currentRank}`}
        </span>
      )
    } else if (trend === 'down') {
      return (
        <span className="flex items-center text-red-400 text-xs">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {previousRank && currentRank && currentRank - previousRank > 0 && `-${currentRank - previousRank}`}
        </span>
      )
    }
    return <span className="text-slate-400 text-xs">-</span>
  }

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (selectedMetric) {
      case 'collections':
        return `Rs. ${(entry.collectionsAmount / 100000).toFixed(1)}L`
      case 'invoices':
        return `${entry.invoicesProcessed} invoices`
      case 'rate':
        return `${entry.collectionRate}%`
      case 'points':
        return `${entry.points} pts`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <InfoTooltip
              title="Accounts Leaderboard"
              steps={[
                'See top performers in the accounts team',
                'Compare collections and invoice processing',
                'Track your ranking over time',
                'Earn recognition for achievements'
              ]}
              tips={[
                'Top 3 get special recognition monthly',
                'Consistent performance matters more than spikes'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Top performers in the accounts team</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {([
            { key: 'collections', label: 'Collections' },
            { key: 'invoices', label: 'Invoices' },
            { key: 'rate', label: 'Collection Rate' },
            { key: 'points', label: 'Total Points' }
          ] as const).map(metric => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-white/20 backdrop-blur-sm text-white'
                  : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 py-4">
              {/* 2nd Place */}
              <div className="text-center mt-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-slate-400 to-slate-300 flex items-center justify-center text-white text-2xl font-bold shadow-none">
                  {leaderboard[1].profilePicture ? (
                    <Image src={leaderboard[1].profilePicture} alt="Profile picture" width={80} height={80} className="w-full h-full rounded-full object-cover" unoptimized />
                  ) : (
                    leaderboard[1].name.charAt(0)
                  )}
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-400 text-white font-bold text-sm">
                    2
                  </span>
                </div>
                <p className="font-medium text-white mt-2">{leaderboard[1].name}</p>
                <p className="text-sm text-slate-400">{getMetricValue(leaderboard[1])}</p>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                    </svg>
                  </div>
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-white text-3xl font-bold shadow-none ring-4 ring-amber-500/30">
                    {leaderboard[0].profilePicture ? (
                      <Image src={leaderboard[0].profilePicture} alt="Profile picture" width={96} height={96} className="w-full h-full rounded-full object-cover" unoptimized />
                    ) : (
                      leaderboard[0].name.charAt(0)
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 text-white font-bold">
                    1
                  </span>
                </div>
                <p className="font-bold text-white mt-2 text-lg">{leaderboard[0].name}</p>
                <p className="text-emerald-400 font-medium">{getMetricValue(leaderboard[0])}</p>
              </div>

              {/* 3rd Place */}
              <div className="text-center mt-12">
                <div className="w-18 h-18 mx-auto rounded-full bg-gradient-to-br from-amber-700 to-amber-600 flex items-center justify-center text-white text-xl font-bold shadow-none" style={{ width: '4.5rem', height: '4.5rem' }}>
                  {leaderboard[2].profilePicture ? (
                    <Image src={leaderboard[2].profilePicture} alt="Profile picture" width={72} height={72} className="w-full h-full rounded-full object-cover" unoptimized />
                  ) : (
                    leaderboard[2].name.charAt(0)
                  )}
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-sm">
                    3
                  </span>
                </div>
                <p className="font-medium text-white mt-2">{leaderboard[2].name}</p>
                <p className="text-sm text-slate-400">{getMetricValue(leaderboard[2])}</p>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-bold text-white">Full Rankings</h3>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No leaderboard data available
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 ${entry.rank <= 3 ? 'bg-white/5 backdrop-blur-sm' : ''}`}
                  >
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankStyle(entry.rank)}`}>
                      {entry.rank}
                    </span>

                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-medium">
                      {entry.profilePicture ? (
                        <Image src={entry.profilePicture} alt="Profile picture" width={40} height={40} className="w-full h-full rounded-full object-cover" unoptimized />
                      ) : (
                        entry.name.charAt(0)
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-white">{entry.name}</p>
                      <div className="flex gap-4 text-xs text-slate-400">
                        <span>Collections: Rs. {(entry.collectionsAmount / 100000).toFixed(1)}L</span>
                        <span>Invoices: {entry.invoicesProcessed}</span>
                        <span>Rate: {entry.collectionRate}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-white">{getMetricValue(entry)}</p>
                      {getTrendIcon(entry.trend, entry.previousRank, entry.rank)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Info */}
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <p className="font-medium text-amber-400">How Rankings Work</p>
                <p className="text-sm text-slate-300 mt-1">
                  Rankings are calculated based on your selected metric. Points combine all metrics with weights:
                  Collections (40%), Invoices Processed (30%), Collection Rate (30%).
                  Top performers are recognized monthly with special badges.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
