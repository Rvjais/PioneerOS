import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { DailyMeetingForm } from '@/client/components/meetings/DailyMeetingForm'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default async function DailyMeetingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const today = startOfDay(new Date())

  // Check if already filled today
  const existingMeeting = await prisma.dailyMeeting.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today
      }
    }
  })

  // Get recent meetings for context
  const recentMeetings = await prisma.dailyMeeting.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    orderBy: { date: 'desc' },
    take: 7
  })

  // Get user's assigned clients for quick selection
  const userClients = await prisma.clientTeamMember.findMany({
    where: { userId: session.user.id },
    include: {
      client: {
        select: { id: true, name: true }
      }
    },
    take: 20
  })

  // If already filled, show summary
  if (existingMeeting) {
    const yesterdayWork = JSON.parse(existingMeeting.yesterdayWork || '[]')
    const todayPlan = JSON.parse(existingMeeting.todayPlan || '[]')

    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Daily Check-in Complete</h1>
          <p className="text-slate-400 mt-1">
            Submitted at {existingMeeting.checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {existingMeeting.isLate && <span className="text-amber-400 ml-2">(Late)</span>}
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 space-y-6">
          {/* Yesterday's Work */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Completed Yesterday</h3>
            <ul className="space-y-2">
              {yesterdayWork.map((item: string, i: number) => (
                <li key={`yesterday-${item}-${i}`} className="flex items-start gap-2 text-slate-200">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Today's Plan */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Today&apos;s Plan</h3>
            <ul className="space-y-2">
              {todayPlan.map((item: string, i: number) => (
                <li key={`today-${item}-${i}`} className="flex items-start gap-2 text-slate-200">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{existingMeeting.estimatedHours}h</p>
              <p className="text-xs text-slate-500">Estimated</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white capitalize">{existingMeeting.workload.toLowerCase()}</p>
              <p className="text-xs text-slate-500">Workload</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{existingMeeting.workLocation.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-500">Location</p>
            </div>
          </div>

          {existingMeeting.needsHelp && existingMeeting.helpDescription && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-400 mb-1">Help Requested</p>
              <p className="text-sm text-slate-300">{existingMeeting.helpDescription}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        {/* Recent Check-ins */}
        {recentMeetings.length > 1 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Recent Check-ins</h3>
            <div className="grid grid-cols-7 gap-2">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`p-2 rounded-lg text-center text-xs ${meeting.isLate
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                >
                  <p className="font-medium">
                    {meeting.date.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </p>
                  <p className="text-[10px] opacity-75">
                    {meeting.checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show form if not filled
  return (
    <div className="py-8">
      <DailyMeetingForm />
    </div>
  )
}
