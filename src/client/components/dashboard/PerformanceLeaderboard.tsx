import Link from 'next/link'

interface Score {
  id: string
  score: number
  department: string
  rank: number | null
  user: {
    id: string
    firstName: string
    lastName: string | null
  }
}

interface PerformanceLeaderboardProps {
  scores: Score[]
}

export function PerformanceLeaderboard({ scores }: PerformanceLeaderboardProps) {
  const topScores = scores.slice(0, 5)

  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden relative group">
      <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>

      <div className="p-6 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-2 sm:gap-0">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Apex Board
          </h3>
          <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mt-1">Real-time Performance</p>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/5 backdrop-blur-sm border border-white/10 text-slate-400 tracking-wider">
          Season Q4
        </span>
      </div>
      <div className="divide-y divide-white/5 bg-[#141A25]/30 relative z-10">
        {topScores.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium tracking-wide">No active scorings</p>
          </div>
        ) : (
          topScores.map((score, index) => (
            <div key={score.id} className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors group/item relative overflow-hidden">
              <div className={`absolute inset-y-0 left-0 w-1 transform -translate-x-full group-hover/item:translate-x-0 transition-transform ${index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-white/20' :
                    index === 2 ? 'bg-orange-500' :
                      'bg-blue-500'
                }`} />
              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-sm shrink-0 border shadow-inner ${index === 0 ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-400 border-amber-500/30 group-hover/item:shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                  index === 1 ? 'bg-gradient-to-br from-slate-300/20 to-slate-500/20 text-slate-300 border-slate-400/30' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400/20 to-orange-600/20 text-orange-400 border-orange-500/30' :
                      'bg-white/5 backdrop-blur-sm text-slate-400 border-white/10'
                }`}>
                {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : `${index + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/team/${score.user.id}`} className="hover:underline">
                  <p className={`text-sm font-bold truncate transition-colors ${index === 0 ? 'text-amber-400' : 'text-slate-200 group-hover/item:text-white'}`}>
                    {score.user.firstName} {score.user.lastName}
                  </p>
                </Link>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-widest bg-black/40 text-slate-400 border border-white/5">
                  <span className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                  {score.department}
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className={`text-xl font-black tracking-tight ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                  {score.score}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PTs</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
