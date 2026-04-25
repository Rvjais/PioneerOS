import { formatDateDDMMYYYY } from '@/shared/utils/cn'
interface NewsItem {
  id: string
  title: string
  content: string
  pinned: boolean
  createdAt: Date
}

interface CompanyNewsProps {
  news: NewsItem[]
}

export function CompanyNews({ news }: CompanyNewsProps) {
  const displayNews = news.slice(0, 3)

  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
          </svg>
          MASH Dispatch
        </h3>
        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">Live</span>
      </div>
      <div className="divide-y divide-white/5 bg-[#141A25]/30">
        {displayNews.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm">No active dispatches</p>
        ) : (
          displayNews.map((item) => (
            <div key={item.id} className="p-5 hover:bg-white/5 transition-colors group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform" />
              <div className="flex items-start gap-3">
                {item.pinned && (
                  <div className="mt-1 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{item.content}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">{formatDateDDMMYYYY(item.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
