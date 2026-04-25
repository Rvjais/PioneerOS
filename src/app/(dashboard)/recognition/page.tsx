import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getRecognitions() {
  return prisma.recognition.findMany({
    include: {
      receiver: true,
      giver: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

const typeColors: Record<string, { bg: string; iconType: string; iconColor: string }> = {
  APPRECIATION: { bg: 'bg-green-500/20 border-green-200', iconType: 'party', iconColor: 'text-green-400' },
  EMPLOYEE_OF_MONTH: { bg: 'bg-yellow-500/20 border-yellow-500/30', iconType: 'trophy', iconColor: 'text-yellow-600' },
  TOP_PERFORMER: { bg: 'bg-purple-500/20 border-purple-200', iconType: 'star', iconColor: 'text-purple-400' },
  INNOVATION: { bg: 'bg-blue-500/20 border-blue-200', iconType: 'lightbulb', iconColor: 'text-blue-400' },
  CLIENT_PRAISE: { bg: 'bg-pink-500/20 border-pink-500/30', iconType: 'heart', iconColor: 'text-pink-600' },
}

const renderRecognitionIcon = (iconType: string, iconColor: string) => {
  const iconClass = `w-8 h-8 ${iconColor}`
  switch (iconType) {
    case 'party':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
    case 'trophy':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
    case 'star':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    case 'lightbulb':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    case 'heart':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    default:
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  }
}

export default async function RecognitionPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const recognitions = await getRecognitions()

  const thisMonth = recognitions.filter(r => {
    const now = new Date()
    const rDate = new Date(r.createdAt)
    return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear()
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recognition Wall</h1>
          <p className="text-slate-400 mt-1">Celebrate achievements and appreciate your colleagues</p>
        </div>
        <Link
          href="/recognition?action=give"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          Give Recognition
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{thisMonth.length}</p>
          <p className="text-sm text-slate-400">This Month</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">
            {thisMonth.filter(r => r.type === 'APPRECIATION').length}
          </p>
          <p className="text-sm text-slate-400">Appreciations</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-yellow-600">
            {thisMonth.reduce((sum, r) => sum + r.xpAwarded, 0)}
          </p>
          <p className="text-sm text-slate-400">XP Awarded</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-purple-400">
            {[...new Set(thisMonth.map(r => r.receiverId))].length}
          </p>
          <p className="text-sm text-slate-400">People Recognized</p>
        </div>
      </div>

      {/* Employee of the Month */}
      <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 rounded-2xl border-2 border-yellow-200 p-6">
        <div className="flex items-center gap-4">
          <div className="text-yellow-600">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-700 uppercase tracking-wider">Employee of the Month</p>
            <h2 className="text-2xl font-bold text-white mt-1">Coming Soon</h2>
            <p className="text-slate-300 mt-1">The top performer will be announced at month end</p>
          </div>
        </div>
      </div>

      {/* Recognition Feed */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Recognitions</h2>
        </div>
        <div className="divide-y divide-white/10">
          {recognitions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No recognitions yet. Be the first to appreciate someone!
            </div>
          ) : (
            recognitions.slice(0, 10).map((recognition) => {
              const config = typeColors[recognition.type] || typeColors.APPRECIATION
              return (
                <div key={recognition.id} className={`p-5 ${config.bg} border-l-4 ${config.bg.replace('bg-', 'border-')}`}>
                  <div className="flex items-start gap-4">
                    {renderRecognitionIcon(config.iconType, config.iconColor)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {recognition.receiver.firstName} {recognition.receiver.lastName || ''}
                        </span>
                        <span className="text-xs text-slate-400">received</span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/50 backdrop-blur-sm">
                          {recognition.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-medium text-white">{recognition.title}</h3>
                      <p className="text-sm text-slate-300 mt-1">{recognition.message}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>From: {recognition.giver.firstName}</span>
                        {recognition.xpAwarded > 0 && (
                          <span className="text-green-400 font-medium">+{recognition.xpAwarded} XP</span>
                        )}
                        <span>{new Date(recognition.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
