'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { differenceInDays, format } from 'date-fns'
import { toast } from 'sonner'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface InternDashboardProps {
  user: {
    firstName: string
    lastName: string
    department: string
    joiningDate: string
    internshipEndDate?: string
  }
  mentor?: {
    id: string
    firstName: string
    lastName: string
    department: string
    phone: string
  }
  stats: {
    tasksCompleted: number
    tasksAssigned: number
    learningHours: number
    requiredLearningHours: number
    daysCompleted: number
    totalDays: number
    skillsAcquired: number
  }
  learningProgress: Array<{
    id: string
    title: string
    progress: number
    category: string
  }>
  recentTasks: Array<{
    id: string
    title: string
    status: string
    completedAt?: string
  }>
  skillsRoadmap: Array<{
    skill: string
    level: 'beginner' | 'intermediate' | 'advanced'
    progress: number
  }>
  upcomingDeadlines: Array<{
    id: string
    title: string
    dueDate: string
    type: string
  }>
}

export function InternDashboard({
  user,
  mentor,
  stats,
  learningProgress,
  recentTasks,
  skillsRoadmap,
  upcomingDeadlines,
}: InternDashboardProps) {
  const router = useRouter()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('10:00')
  const [meetingAgenda, setMeetingAgenda] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  const internshipProgress = (stats.daysCompleted / stats.totalDays) * 100
  const daysRemaining = stats.totalDays - stats.daysCompleted

  const handleScheduleMeeting = async () => {
    if (!mentor || !meetingDate) return
    setIsScheduling(true)
    try {
      // Create meeting via API
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `1:1 with ${mentor.firstName} ${mentor.lastName || ''}`,
          category: 'GENERAL',
          date: new Date(`${meetingDate}T${meetingTime}`).toISOString(),
          duration: 30,
          isOnline: true,
          agenda: meetingAgenda || `Weekly 1:1 check-in for ${user.firstName}`,
          participantIds: [mentor.id],
        }),
      })
      if (res.ok) {
        toast.success('Meeting scheduled successfully!')
        setShowScheduleModal(false)
        setMeetingDate('')
        setMeetingAgenda('')
        router.refresh()
      } else {
        toast.error('Failed to schedule meeting')
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      toast.error('Failed to schedule meeting')
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <div className="bg-slate-100 dark:bg-black rounded-2xl p-6 border border-slate-200 dark:border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome, {user.firstName}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {user.department} Intern &bull; Day {stats.daysCompleted} of {stats.totalDays}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-slate-900 dark:text-white">{daysRemaining}</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm">days remaining</p>
          </div>
        </div>

        {/* Internship Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 mb-2">
            <span>Internship Progress</span>
            <span>{Math.round(internshipProgress)}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
            <div
              className="h-full glass-card rounded-full transition-all"
              style={{ width: `${internshipProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-900">{stats.tasksCompleted}</p>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">Tasks Completed</p>
          <p className="text-xs text-slate-400">of {stats.tasksAssigned} assigned</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-900">{stats.learningHours}h</p>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">Learning Hours</p>
          <p className="text-xs text-slate-400">of {stats.requiredLearningHours}h required</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-900">{stats.skillsAcquired}</p>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">Skills Acquired</p>
          <p className="text-xs text-slate-400">Keep learning!</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-slate-900">
              {Math.round((stats.tasksCompleted / Math.max(stats.tasksAssigned, 1)) * 100)}%
            </p>
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-1">Completion Rate</p>
          <p className="text-xs text-slate-400">Great progress!</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mentor Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Mentor</h2>
          {mentor ? (
            <div className="flex items-center gap-4">
              <UserAvatar user={{ id: mentor.id, firstName: mentor.firstName, lastName: mentor.lastName, department: mentor.department, phone: mentor.phone }} size="xl" showPreview={false} />
              <div>
                <p className="font-semibold text-slate-800">{mentor.firstName} {mentor.lastName}</p>
                <p className="text-sm text-slate-600">{mentor.department}</p>
                <a href={`tel:${mentor.phone}`} className="text-sm text-blue-400 hover:text-blue-300 mt-1 inline-block">
                  {mentor.phone}
                </a>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No mentor assigned yet</p>
          )}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-400 mb-2">Need help? Reach out to your mentor for guidance.</p>
            <button
              onClick={() => mentor && setShowScheduleModal(true)}
              disabled={!mentor}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mentor
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                  : 'bg-white/5 text-slate-400 cursor-not-allowed'
              }`}
            >
              {mentor ? 'Schedule 1:1 Meeting' : 'No Mentor Assigned'}
            </button>
          </div>
        </div>

        {/* Skills Roadmap */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Skills Roadmap</h2>
          <div className="space-y-4">
            {skillsRoadmap.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No skills roadmap set yet</p>
            ) : (
              skillsRoadmap.map((skill, index) => (
                <div key={skill.skill}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">{skill.skill}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        skill.level === 'advanced' ? 'bg-purple-500/20 text-purple-300' :
                        skill.level === 'intermediate' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">{skill.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        skill.progress >= 80 ? 'bg-emerald-500' :
                        skill.progress >= 50 ? 'bg-blue-500/100' : 'bg-amber-500/100'
                      }`}
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Learning Progress</h2>
            <Link href="/learning" className="text-sm text-blue-400 hover:text-blue-300">
              View all courses
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {learningProgress.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No courses started yet</div>
            ) : (
              learningProgress.map((course) => (
                <div key={course.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900">{course.title}</p>
                      <p className="text-xs text-slate-400">{course.category}</p>
                    </div>
                    <span className="text-sm font-medium text-blue-400">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500/100 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Deadlines</h2>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-5 text-center text-slate-400">No upcoming deadlines</div>
            ) : (
              upcomingDeadlines.map((deadline) => {
                const daysUntil = differenceInDays(new Date(deadline.dueDate), new Date())
                return (
                  <div key={deadline.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                    <div>
                      <p className="font-medium text-slate-900">{deadline.title}</p>
                      <p className="text-xs text-slate-400">{deadline.type}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        daysUntil <= 1 ? 'text-red-400' :
                        daysUntil <= 3 ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(deadline.dueDate), 'MMM d')}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Recent Tasks</h2>
            <Link href="/tasks" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Task</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-slate-400">No tasks yet</td>
                  </tr>
                ) : (
                  recentTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-white/5">
                      <td className="px-5 py-4 text-sm text-slate-900">{task.title}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-white/5 text-slate-300'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {task.completedAt ? format(new Date(task.completedAt), 'MMM d, yyyy') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tips for Success */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Tips for Success</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Ask Questions</p>
              <p className="text-xs text-slate-400">Don&apos;t hesitate to reach out to your mentor or team.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Document Everything</p>
              <p className="text-xs text-slate-400">Keep notes of what you learn each day.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Take Initiative</p>
              <p className="text-xs text-slate-400">Look for ways to contribute beyond assigned tasks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule 1:1 Meeting Modal */}
      {showScheduleModal && mentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowScheduleModal(false)} />
          <div className="relative glass-card border border-white/10 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Schedule 1:1 with {mentor.firstName}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time *</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Agenda (optional)</label>
                <textarea
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  placeholder="What would you like to discuss?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMeeting}
                disabled={!meetingDate || isScheduling}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
