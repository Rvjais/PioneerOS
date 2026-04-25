import prisma from '@/server/db/prisma'
import { requirePageAuth, SALES_ACCESS } from '@/server/auth/pageAuth'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import { STAGE_MAPPING } from '@/shared/constants/formConstants'
import DashboardRefresher from './_components/DashboardRefresher'

// Map old stages to simplified stages
function getSimplifiedStage(stage: string): string {
  return STAGE_MAPPING[stage] || stage
}

async function getSalesData(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Scope leads and activities to the current user (unless admin/manager)
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(userId ? '' : '')
  const leadWhere = { deletedAt: null, assignedToId: userId }

  const [allLeads, recentActivities, overdueFollowUps] = await Promise.all([
    prisma.lead.findMany({
      where: leadWhere,
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 1 },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.leadActivity.findMany({
      where: { lead: { assignedToId: userId, deletedAt: null } },
      include: { lead: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.followUpReminder.findMany({
      where: {
        userId,
        isCompleted: false,
        scheduledAt: { lte: new Date() },
      },
      include: {
        lead: { select: { id: true, companyName: true, contactName: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    }),
  ])

  return { allLeads, recentActivities, overdueFollowUps }
}

export default async function SalesDashboardPage() {
  const session = await requirePageAuth(SALES_ACCESS)
  const { allLeads, recentActivities, overdueFollowUps } = await getSalesData(session.user.id)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Calculate simplified metrics using stage mapping
  const newLeads = allLeads.filter(l => getSimplifiedStage(l.stage) === 'NEW')
  const contactedLeads = allLeads.filter(l => getSimplifiedStage(l.stage) === 'CONTACTED')
  const negotiatingLeads = allLeads.filter(l => getSimplifiedStage(l.stage) === 'NEGOTIATING')
  const closedLeads = allLeads.filter(l => getSimplifiedStage(l.stage) === 'CLOSED')

  const activePipeline = [...newLeads, ...contactedLeads, ...negotiatingLeads]
  const pipelineValue = activePipeline.reduce((sum, l) => sum + (l.value || 0), 0)

  const wonThisMonth = allLeads.filter(l => l.stage === 'WON' && l.wonAt && l.wonAt >= startOfMonth)
  const lostThisMonth = allLeads.filter(l => l.stage === 'LOST' && l.updatedAt >= startOfMonth)
  const wonValue = wonThisMonth.reduce((sum, l) => sum + (l.value || 0), 0)
  const lostValue = lostThisMonth.reduce((sum, l) => sum + (l.value || 0), 0)

  // Hot leads (high priority in active stages)
  const hotLeads = allLeads.filter(l =>
    l.leadPriority === 'HOT' && !['WON', 'LOST'].includes(l.stage)
  ).slice(0, 5)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  return (
    <>
      <DashboardRefresher interval={30000} />
      <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
          <p className="text-slate-400 mt-1">Quick overview of your sales pipeline</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/sales/pipeline"
            className="px-4 py-2 border border-white/20 text-slate-200 rounded-xl hover:bg-slate-900/40 transition-colors"
          >
            View Pipeline
          </Link>
          <Link
            href="/sales/leads?action=new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/sales/pipeline?stage=NEW" className="bg-blue-500/10 hover:bg-blue-500/20 rounded-xl p-4 border border-blue-200 transition-colors">
          <p className="text-sm text-blue-400 font-medium">New Leads</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{newLeads.length}</p>
          <p className="text-xs text-blue-500 mt-2">Ready to contact</p>
        </Link>
        <Link href="/sales/pipeline" className="bg-purple-500/10 hover:bg-purple-500/20 rounded-xl p-4 border border-purple-200 transition-colors">
          <p className="text-sm text-purple-400 font-medium">Active Pipeline</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{activePipeline.length}</p>
          <p className="text-xs text-purple-500 mt-2">{formatCurrency(pipelineValue)} value</p>
        </Link>
        <Link href="/sales/deals?tab=won" className="bg-green-500/10 hover:bg-green-500/20 rounded-xl p-4 border border-green-200 transition-colors">
          <p className="text-sm text-green-400 font-medium">Won This Month</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{wonThisMonth.length}</p>
          <p className="text-xs text-green-500 mt-2">{formatCurrency(wonValue)} revenue</p>
        </Link>
        <Link href="/sales/deals?tab=lost" className="bg-red-500/10 hover:bg-red-500/20 rounded-xl p-4 border border-red-200 transition-colors">
          <p className="text-sm text-red-400 font-medium">Lost This Month</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{lostThisMonth.length}</p>
          <p className="text-xs text-red-500 mt-2">{formatCurrency(lostValue)} lost</p>
        </Link>
      </div>

      {/* Pipeline Stage Summary */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <h2 className="font-semibold text-white mb-4">Pipeline Stages</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/sales/pipeline?stage=NEW" className="text-center p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
            <p className="text-2xl font-bold text-blue-400">{newLeads.length}</p>
            <p className="text-sm text-blue-400 font-medium mt-1">New</p>
          </Link>
          <Link href="/sales/pipeline?stage=CONTACTED" className="text-center p-4 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-colors">
            <p className="text-2xl font-bold text-yellow-700">{contactedLeads.length}</p>
            <p className="text-sm text-yellow-600 font-medium mt-1">Contacted</p>
          </Link>
          <Link href="/sales/pipeline?stage=NEGOTIATING" className="text-center p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
            <p className="text-2xl font-bold text-purple-400">{negotiatingLeads.length}</p>
            <p className="text-sm text-purple-400 font-medium mt-1">Negotiating</p>
          </Link>
          <Link href="/sales/deals" className="text-center p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors">
            <p className="text-2xl font-bold text-green-400">{closedLeads.length}</p>
            <p className="text-sm text-green-400 font-medium mt-1">Closed</p>
          </Link>
        </div>
      </div>

      {/* Overdue Follow-ups */}
      {overdueFollowUps.length > 0 && (
        <div className="glass-card rounded-xl border border-red-500/20 overflow-hidden">
          <div className="p-4 border-b border-red-500/10 bg-red-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="font-semibold text-red-400">Overdue Follow-ups ({overdueFollowUps.length})</h2>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {overdueFollowUps.map((reminder) => {
              const daysOverdue = Math.floor((now.getTime() - new Date(reminder.scheduledAt).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link key={reminder.id} href={`/sales/leads/${reminder.leadId}`} className="p-3 hover:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{reminder.title}</p>
                    <p className="text-xs text-slate-400">{reminder.lead.companyName} · {reminder.lead.contactName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      reminder.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                      reminder.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {reminder.priority}
                    </span>
                    <p className="text-xs text-red-400 mt-1">{daysOverdue}d overdue</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hot Leads */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-red-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <h2 className="font-semibold text-red-800">Hot Leads</h2>
            </div>
            <Link href="/sales/leads?priority=HOT" className="text-xs text-red-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/10 max-h-80 overflow-y-auto">
            {hotLeads.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                No hot leads at the moment
              </div>
            ) : (
              hotLeads.map((lead) => (
                <Link key={lead.id} href={`/sales/leads/${lead.id}`} className="p-3 hover:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{lead.companyName}</p>
                    <p className="text-xs text-slate-400">{lead.contactName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-green-400">
                      {lead.value ? formatCurrency(lead.value) : '-'}
                    </span>
                    <p className="text-xs text-slate-400">{getSimplifiedStage(lead.stage)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-white/10 max-h-80 overflow-y-auto">
            {recentActivities.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                No recent activity
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-3 hover:bg-slate-900/40">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'CALL' ? 'bg-green-500/20 text-green-400' :
                      activity.type === 'EMAIL' ? 'bg-blue-500/20 text-blue-400' :
                      activity.type === 'MEETING' ? 'bg-purple-500/20 text-purple-400' :
                      activity.type === 'NOTE' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800/50 text-slate-300'
                    }`}>
                      {activity.type === 'CALL' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )}
                      {activity.type === 'EMAIL' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {activity.type === 'NOTE' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                      {!['CALL', 'EMAIL', 'NOTE'].includes(activity.type) && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.title}</p>
                      <p className="text-xs text-slate-400">{activity.lead.companyName}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDateShort(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
