'use client'

import { useState, useEffect } from 'react'

interface DailyStats {
    breakthroughs: number
    breakdowns: number
    totalTimeSpent: number // in minutes
}

export function EndOfDayReport({ userId }: { userId: string }) {
    const [stats, setStats] = useState<DailyStats>({
        breakthroughs: 0,
        breakdowns: 0,
        totalTimeSpent: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchDailyStats() {
            try {
                const res = await fetch(`/api/tasks/daily-report?userId=${userId}`)
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Failed to fetch daily report:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDailyStats()
    }, [userId])

    const formatHours = (minutes: number) => {
        const hrs = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hrs}h ${mins}m`
    }

    if (loading) return null

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">End of Day Report</h2>
                    <p className="text-slate-500 text-sm">Your performance summary for today</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-center px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-emerald-600 text-2xl font-bold">{stats.breakthroughs}</p>
                    <p className="text-emerald-600 text-xs font-medium uppercase tracking-wider">Breakthroughs</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Completed Today</p>
                </div>

                <div className="text-center px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-2xl font-bold">{stats.breakdowns}</p>
                    <p className="text-red-600 text-xs font-medium uppercase tracking-wider">Breakdowns</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Rolled Over</p>
                </div>

                <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

                <div className="text-center px-4">
                    <p className="text-slate-900 text-2xl font-bold">{formatHours(stats.totalTimeSpent)}</p>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Time Logged</p>
                </div>
            </div>
        </div>
    )
}
