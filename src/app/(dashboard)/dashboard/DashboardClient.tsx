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
import { dashboardTour } from '@/shared/constants/tourDefinitions'

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
    <div className="min-h-screen bg-[#0B0E14] p-4 sm:p-6 lg:p-8 space-y-6">
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
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
            {getInitials(userName)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">
              {getGreeting()}, {firstName}!{' '}
              <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] origin-[70%_70%]">
                👋
              </span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-slate-400">{formatDateDDMMYYYY(new Date())}</span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                {DEPARTMENT_LABELS[department] || department}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 1: Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tasks Due Today */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                data.stats.dueToday > 0 ? 'bg-orange-500/15' : 'bg-slate-800/60'
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 ${data.stats.dueToday > 0 ? 'text-orange-400' : 'text-slate-500'}`}
              />
            </div>
            <div>
              <p
                className={`text-2xl font-bold ${
                  data.stats.dueToday > 0 ? 'text-orange-400' : 'text-white'
                }`}
              >
                {data.stats.dueToday}
              </p>
              <p className="text-xs text-slate-500">Due Today</p>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Loader className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{data.stats.inProgress}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
        </div>

        {/* Completed / Assigned */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{data.stats.assigned}</p>
              <p className="text-xs text-slate-500">Total Assigned</p>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                data.learning.isCompliant ? 'bg-emerald-500/15' : 'bg-amber-500/15'
              }`}
            >
              <BookOpen
                className={`w-5 h-5 ${data.learning.isCompliant ? 'text-emerald-400' : 'text-amber-400'}`}
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {data.learning.hours}
                <span className="text-sm font-normal text-slate-500">/{data.learning.target}h</span>
              </p>
              <p className="text-xs text-slate-500">Learning Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Tasks + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks Today (2/3) */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-sm font-semibold text-white tracking-wide">My Tasks Today</h2>
            <Link
              href="/tasks/daily"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {displayTasks.length > 0 ? (
            <div className="divide-y divide-white/5">
              {displayTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Priority dot */}
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-slate-500'}`}
                  />

                  {/* Title + Client */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{task.project}</p>
                  </div>

                  {/* Due time */}
                  {task.dueDate && (
                    <span className="text-xs text-slate-500 shrink-0">
                      {formatDueTime(task.dueDate)}
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-3" />
              <p className="text-sm text-slate-400">All caught up! No tasks due today.</p>
            </div>
          )}
        </div>

        {/* Quick Actions (1/3) */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white tracking-wide mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/meetings/tactical"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
            >
              <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors text-center">
                Daily Standup
              </span>
            </Link>
            <Link
              href="/tasks/daily"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
            >
              <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors text-center">
                Log Work
              </span>
            </Link>
            <Link
              href="/hr/leave"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
            >
              <PlaneTakeoff className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors text-center">
                Request Leave
              </span>
            </Link>
            <Link
              href="/performance"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
            >
              <CalendarDays className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors" />
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors text-center">
                View Schedule
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Row 3: Active Projects + Celebrations/Learning ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects (2/3) */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-sm font-semibold text-white tracking-wide">Active Projects</h2>
            <Link
              href="/projects"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {data.projects.length > 0 ? (
            <div className="divide-y divide-white/5">
              {data.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <CircleDot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                      {project.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-full shrink-0 ${
                      project.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : project.status === 'ONBOARDING'
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {project.status.replace(/_/g, ' ')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <CircleDot className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">No active projects assigned.</p>
            </div>
          )}
        </div>

        {/* Right sidebar (1/3) */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white tracking-wide">Learning Progress</h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  data.learning.isCompliant
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {data.learning.isCompliant ? 'On Track' : 'Behind'}
              </span>
            </div>

            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-white">{data.learning.hours}</span>
              <span className="text-sm text-slate-500 mb-1">/ {data.learning.target} hours</span>
            </div>

            <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.learning.isCompliant ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{
                  width: `${Math.min((data.learning.hours / data.learning.target) * 100, 100)}%`,
                }}
              />
            </div>

            <Link
              href="/learning"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors"
            >
              {data.learning.isCompliant ? 'View Learning Log' : 'Add Learning Hours'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Celebrations */}
          <CelebrationsCard />
        </div>
      </div>
    </div>
  )
}
