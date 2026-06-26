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

  const [showSkillsModal, setShowSkillsModal] = useState(false)

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
            <p className="text-3xl font-bold text-white">{stats.tasksCompleted}</p>
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
            <p className="text-3xl font-bold text-white">{stats.learningHours}h</p>
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
            <p className="text-3xl font-bold text-white">{stats.skillsAcquired}</p>
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
            <p className="text-3xl font-bold text-white">
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
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Your Mentor</h2>
          {mentor ? (
            <div className="flex items-center gap-4">
              <UserAvatar user={{ id: mentor.id, firstName: mentor.firstName, lastName: mentor.lastName, department: mentor.department, phone: mentor.phone }} size="xl" showPreview={false} />
              <div>
                <p className="font-semibold text-slate-100">{mentor.firstName} {mentor.lastName}</p>
                <p className="text-sm text-slate-400">{mentor.department}</p>
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
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Skills Roadmap</h2>
          <div className="space-y-4">
            {skillsRoadmap.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No skills roadmap set yet</p>
          ) : (
            skillsRoadmap.slice(0, 3).map((skill, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-100">{skill.skill}</p>
                  <p className="text-xs text-slate-400">{skill.level}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${skill.progress === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {skill.progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'}
                </span>
              </div>
            ))
          )}
          <button
            onClick={() => setShowSkillsModal(true)}
            className="w-full mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            View Full Roadmap
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
    </div>
  )
}
