'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description: string | null
  date: Date
  type: string
}

interface NewsItem {
  id: string
  title: string
  content: string
}

interface UpdatesEventsTabsProps {
  events: Event[]
  news: NewsItem[]
}

export function UpdatesEventsTabs({ events, news }: UpdatesEventsTabsProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'updates' | 'feedback'>('events')
  const [feedback, setFeedback] = useState('')

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, submit to API
    toast.success('Feedback submitted!')
    setFeedback('')
  }

  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full bg-[#141A25]/50">
      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/20 shrink-0">
        {(['events', 'updates', 'feedback'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/5 border-b-2 border-transparent'
              }`}
          >
            {tab === 'events' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {tab === 'updates' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {tab === 'feedback' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'events' && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium tracking-wide">No upcoming events scheduled</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-start gap-5 p-4 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 hover:border-blue-500/30 transition-all group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex flex-col items-center justify-center shrink-0 border border-blue-500/20 shadow-inner group-hover:scale-105 transition-transform text-center pt-1">
                    <span className="text-[10px] uppercase font-bold text-blue-400 leading-none">
                      {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-xl font-black text-white leading-tight">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{event.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${event.type === 'MEETING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          event.type === 'TRAINING' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium tracking-wide">No system updates</p>
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="p-4 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                  <h4 className="font-bold text-slate-200 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <form onSubmit={handleSubmitFeedback} className="space-y-4 flex flex-col h-full">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h4 className="font-bold text-blue-400 text-sm">Direct Line to MASH</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Log anomalies, request system upgrades, or share raw feedback. Submitted tickets land directly in the Hub priority queue.
                </p>
              </div>
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe your request or feedback in detail..."
              className="w-full flex-1 min-h-[120px] px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-medium transition-all"
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-widest uppercase text-[11px] rounded-xl transition-all shadow-none shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <span>Transmit Protocol</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
