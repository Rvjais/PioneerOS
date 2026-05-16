'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CelebrationsCard } from '@/client/components/dashboard/CelebrationsCard'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import {
  Loader,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  ClipboardList,
  CalendarDays,
  BookOpen,
  MessageSquare,
  PlaneTakeoff,
  ChevronRight,
} from 'lucide-react'
import PageGuide from '@/client/components/ui/PageGuide'


interface Task {
  id: string
  title: string
  project: string
  status: string
  priority: string
  dueDate: string | null
}

interface Project {
  id: string
  name: string
  client: string
  progress: number
  status: string
  taskCount: number
}

interface Props {
  data: {
    tasks: Task[]
    stats: {
      assigned: number
      inProgress: number
      dueToday: number
    }
    projects: Project[]
    learning: {
      hours: number
      target: number
      isCompliant: boolean
    }
  }
  userName: string
  department: string
  today: string
  isManager: boolean
}

const DEPARTMENT_LABELS: Record<string, string> = {
  WEB: 'Web Development',
  SEO: 'SEO',
  SOCIAL: 'Social Media',
  ADS: 'Performance Marketing',
  HR: 'Human Resources',
  ACCOUNTS: 'Accounts',
  SALES: 'Sales',
  OPERATIONS: 'Operations',
}

const PRIORITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-blue-400',
  LOW: 'bg-slate-500',
}


function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDueTime(dueDate: string): string {
  const date = new Date(dueDate)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(todayStart.getTime() + 86400000)

  if (date < tomorrowStart && date >= todayStart) {
    return 'Today'
  }
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}-${mm}`
}

export function DashboardClient({ data, userName, department, today, isManager }: Props) {
  const firstName = userName.split(' ')[0]
  const todaysTasks = data.tasks.filter((t) => {
    if (!t.dueDate) return false
    const due = new Date(t.dueDate)
    const now = new Date()
    return (
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear()
    )
  })
  // If no tasks due today specifically, show all tasks (up to 5)
  const displayTasks = todaysTasks.length > 0 ? todaysTasks.slice(0, 5) : data.tasks.slice(0, 5)

  return (
    <div className="min-h-full space-y-6">
      <PageGuide
        pageKey="dashboard"
        title="Dashboard"
        description="Your daily overview showing tasks, metrics, and quick actions."
        steps={[
          { label: 'Check your pending tasks', description: 'See what needs your attention today' },
          { label: 'Review team metrics', description: 'Track project progress and learning hours' },
          { label: 'Use quick actions to navigate', description: 'Jump to tasks, meetings, or leave management' },
        ]}
      />

      {/* ── Welcome Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c96442] to-[#b5563a] flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-lg shadow-orange-500/20">
            {getInitials(userName)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {firstName}!{' '}
              <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] origin-[70%_70%]">
                👋
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-slate-500">{today}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#fbeee8] text-[#6e2f1c] border border-[#fbeee8]">
                {DEPARTMENT_LABELS[department] || department}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 1: Quick Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks Due Today */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.stats.dueToday > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}>
              <AlertCircle className={`w-6 h-6 ${data.stats.dueToday > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${data.stats.dueToday > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{data.stats.dueToday}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Due Today</p>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Loader className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.stats.inProgress}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
            </div>
          </div>
        </div>

        {/* Total Assigned */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.stats.assigned}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned</p>
            </div>
          </div>
        </div>

        {/* Learning Hours */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.learning.isCompliant ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <BookOpen className={`w-6 h-6 ${data.learning.isCompliant ? 'text-emerald-500' : 'text-amber-500'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {data.learning.hours}<span className="text-sm font-normal text-slate-400">/{data.learning.target}h</span>
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Learning</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Tasks + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks Today */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">My Tasks Today</h2>
            <Link href="/tasks/daily" className="text-xs font-bold text-[#c96442] hover:text-[#b5563a] transition-colors flex items-center gap-1 uppercase tracking-wider">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1">
            {displayTasks.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {displayTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all group"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${PRIORITY_DOT[task.priority] || 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-xs font-medium text-slate-500 truncate">{task.project}</p>
                    </div>
                    {task.dueDate && (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md shrink-0 uppercase">
                        {formatDueTime(task.dueDate)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">All caught up!</h3>
                <p className="text-sm text-slate-500">No tasks due for today. Great job!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/meetings/tactical" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-orange-700 uppercase tracking-wider text-center">Standup</span>
            </Link>
            <Link href="/tasks/daily" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <ClipboardList className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-orange-700 uppercase tracking-wider text-center">Log Work</span>
            </Link>
            <Link href="/hr/leave" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <PlaneTakeoff className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-orange-700 uppercase tracking-wider text-center">Leave</span>
            </Link>
            <Link href="/performance" className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                <CalendarDays className="w-5 h-5 text-slate-500 group-hover:text-orange-500" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 group-hover:text-orange-700 uppercase tracking-wider text-center">Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Row 3: Active Projects + Celebrations/Learning ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Active Projects</h2>
            <Link href="/projects" className="text-xs font-bold text-[#c96442] hover:text-[#b5563a] transition-colors flex items-center gap-1 uppercase tracking-wider">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1">
            {data.projects.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <CircleDot className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                        {project.name}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {project.taskCount} active task{project.taskCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full shrink-0 border uppercase tracking-wider ${
                      project.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : project.status === 'ONBOARDING'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CircleDot className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">No active projects</h3>
                <p className="text-sm text-slate-500">You haven&apos;t been assigned to any projects yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">Learning</h2>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                data.learning.isCompliant
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {data.learning.isCompliant ? 'Compliant' : 'Pending'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{data.learning.hours}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">/ {data.learning.target}h</span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-6 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  data.learning.isCompliant ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{
                  width: `${Math.min((data.learning.hours / data.learning.target) * 100, 100)}%`,
                }}
              />
            </div>

            <Link
              href="/learning"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold bg-orange-50 text-[#c96442] hover:bg-orange-100 border border-orange-100 transition-all uppercase tracking-widest"
            >
              {data.learning.isCompliant ? 'View Archive' : 'Add Progress'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Celebrations */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
             <CelebrationsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
