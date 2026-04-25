'use client'

type Activity = {
  id: string
  type: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'COMMENT' | 'CREATED'
  description: string
  user: string
  createdAt: string
  metadata?: {
    oldStatus?: string
    newStatus?: string
    comment?: string
  }
}

const typeIcons = {
  CREATED: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  STATUS_CHANGE: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  ASSIGNMENT: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  COMMENT: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
}

const typeColors = {
  CREATED: 'bg-green-500/20 text-green-400',
  STATUS_CHANGE: 'bg-purple-500/20 text-purple-400',
  ASSIGNMENT: 'bg-blue-500/20 text-blue-400',
  COMMENT: 'bg-slate-800/50 text-slate-300',
}

export default function IssueTimeline({ activities }: { activities: Activity[] }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

      <div className="space-y-6">
        {sortedActivities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4">
            {/* Icon */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[activity.type]}`}>
              {typeIcons[activity.type]}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-white">
                    <span className="font-medium">{activity.user}</span>
                    {' '}
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(activity.createdAt)}</p>
                </div>
              </div>

              {/* Comment content */}
              {activity.type === 'COMMENT' && activity.metadata?.comment && (
                <div className="mt-2 p-3 bg-slate-900/40 rounded-lg border border-white/5">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{activity.metadata.comment}</p>
                </div>
              )}

              {/* Status change badge */}
              {activity.type === 'STATUS_CHANGE' && activity.metadata && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800/50 text-slate-300">
                    {activity.metadata.oldStatus}
                  </span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                    {activity.metadata.newStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
