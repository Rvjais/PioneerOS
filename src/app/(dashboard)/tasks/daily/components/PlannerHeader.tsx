import Link from 'next/link'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import type { ViewType } from './types'

interface PlannerHeaderProps {
  selectedDate: string
  setSelectedDate: (date: string) => void
  isMonday: boolean
  viewType: ViewType
  activeView: ViewType
  setActiveView: (view: ViewType) => void
  isManager: boolean
  viewMode: 'my' | 'team'
  setViewMode: (mode: 'my' | 'team') => void
}

export function PlannerHeader({
  selectedDate,
  setSelectedDate,
  isMonday,
  viewType,
  activeView,
  setActiveView,
  isManager,
  viewMode,
  setViewMode,
}: PlannerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Task Planner</h1>
        <p className="text-slate-400 mt-1">
          {isMonday && <span className="text-purple-400 font-medium">Weekly Planning Day - </span>}
          Plan and track your daily tasks. Submit before 11 AM huddle.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/tasks/daily/history"
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 text-sm flex items-center gap-2 transition-colors font-medium"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View History
        </Link>
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() - 1)
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            className="px-2 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-l-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative flex items-center gap-2 px-2 cursor-pointer">
            <span className="text-slate-900 font-medium">
              {formatDateDDMMYYYY(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <svg className="w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <button
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() + 1)
              setSelectedDate(d.toISOString().split('T')[0])
            }}
            className="px-2 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-r-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* Role-specific view toggle */}
        {viewType !== 'default' && (
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setActiveView('default')}
              className={`px-3 py-2 rounded-md text-sm transition-colors font-medium ${
                activeView === 'default' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveView(viewType)}
              className={`px-3 py-2 rounded-md text-sm transition-colors font-medium ${
                activeView === viewType ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {viewType === 'bd' ? 'CRM Tracker' : viewType === 'hr' ? 'HR Pipeline' : 'Client Ops'}
            </button>
          </div>
        )}
        {isManager && activeView === 'default' && (
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('my')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'my' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'team' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Team View
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
