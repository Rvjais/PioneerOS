'use client'

import Link from 'next/link'
import { 
  Palette, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Calendar,
  ArrowRight,
  Monitor,
  Printer,
  Sparkles,
  Play
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface DesignClientProps {
  stats: {
    total: number
    requested: number
    inDesign: number
    delivered: number
  }
  recentRequests: Array<{
    id: string
    title: string
    status: string
    priority: string
    dueDate: string | null
    clientName: string
    designType: string
  }>
  isAdmin: boolean
}

export function DesignClient({ stats, recentRequests, isAdmin }: DesignClientProps) {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Design Studio</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage creative assets and print workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/design/calendar"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-sm"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Link>
          <Link
            href="/design/requests/new"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-500/20 transition-all font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Requests', value: stats.total, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'New/Requested', value: stats.requested, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'In Design', value: stats.inDesign, icon: Palette, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Requests List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              <Link href="/design/requests" className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium italic">
                  No recent design requests found.
                </div>
              ) : (
                recentRequests.map((req) => (
                  <Link 
                    key={req.id} 
                    href={`/design/requests?id=${req.id}`}
                    className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-violet-600 transition-colors">{req.title}</p>
                        <p className="text-[11px] font-medium text-slate-400 truncate">{req.clientName} • {req.designType}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border",
                        req.status === 'REQUESTED' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        req.status === 'IN_DESIGN' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      )}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                      {req.dueDate && (
                        <span className="text-[10px] font-bold text-slate-400">
                          Due {new Date(req.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Categories / Quick Links Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Design Workflows</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'Print Designing', icon: Printer, href: '/design/requests?type=PRINT', desc: 'SLA, Banner, Flex, ID cards' },
                { name: 'Digital Graphics', icon: Monitor, href: '/design/requests?type=DIGITAL', desc: 'Social media, Website assets' },
                { name: 'Brand Identity', icon: Sparkles, href: '/design/requests?type=BRANDING', desc: 'Logos, Guidelines, Decks' },
                { name: 'Video Thumbnails', icon: Play, href: '/design/requests?type=THUMBNAILS', desc: 'YouTube & Social video covers' },
              ].map((cat) => (
                <Link 
                  key={cat.name} 
                  href={cat.href}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-violet-200 hover:bg-violet-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-violet-600 group-hover:border-violet-100 transition-all">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{cat.name}</p>
                    <p className="text-[10px] text-slate-500">{cat.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-violet-500/20">
            <h3 className="font-bold text-lg mb-2">Need a fast-track?</h3>
            <p className="text-violet-100 text-sm mb-6 leading-relaxed">
              Create a quick design request with all specifications and references in under 2 minutes.
            </p>
            <Link 
              href="/design/requests/new"
              className="block w-full text-center py-3 bg-white text-violet-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-violet-50 transition-colors"
            >
              Start Request
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
