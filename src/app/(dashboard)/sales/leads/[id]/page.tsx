import prisma from '@/server/db/prisma'
import { requirePageAuth, SALES_ACCESS } from '@/server/auth/pageAuth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { SalesLeadDetail } from './SalesLeadDetail'

async function getLead(leadId: string) {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      proposals: {
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      reminders: {
        include: { user: { select: { firstName: true, lastName: true } } },
        where: { isCompleted: false },
        orderBy: { scheduledAt: 'asc' },
      },
      meetings: {
        orderBy: { scheduledAt: 'desc' },
        take: 10,
      },
      nurturingActions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      client: {
        select: { id: true, name: true },
      },
    },
  })
}

async function getSalesUsers() {
  return prisma.user.findMany({
    where: {
      OR: [
        { role: 'SALES' },
        { department: 'SALES' },
        { role: 'MANAGER' },
        { role: 'SUPER_ADMIN' },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })
}

export default async function SalesLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requirePageAuth(SALES_ACCESS)
  const { id } = await params

  const [lead, users] = await Promise.all([
    getLead(id),
    getSalesUsers(),
  ])

  if (!lead) notFound()

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/sales/leads"
          className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Leads
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{lead.companyName}</h1>
            <p className="text-slate-400">{lead.contactName} | {lead.contactPhone || lead.contactEmail || 'No contact'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              lead.leadPriority === 'HOT' ? 'bg-red-500/20 text-red-400' :
              lead.leadPriority === 'WARM' ? 'bg-amber-500/20 text-amber-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {lead.leadPriority}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              lead.stage === 'WON' ? 'bg-green-500/20 text-green-400' :
              lead.stage === 'LOST' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-800/50 text-slate-200'
            }`}>
              {lead.stage.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <SalesLeadDetail
        lead={{
          id: lead.id,
          companyName: lead.companyName,
          contactName: lead.contactName,
          contactEmail: lead.contactEmail,
          contactPhone: lead.contactPhone,
          source: lead.source,
          leadCategory: lead.leadCategory,
          leadPriority: lead.leadPriority,
          stage: lead.stage,
          pipeline: lead.pipeline,
          value: lead.value,
          budgetRange: lead.budgetRange,
          location: lead.location,
          notes: lead.notes,
          rfpStatus: lead.rfpStatus,
          isHealthcare: lead.isHealthcare,
          wonAt: lead.wonAt?.toISOString() || null,
          lostReason: lead.lostReason,
          clientId: lead.clientId,
          nextFollowUp: lead.nextFollowUp?.toISOString() || null,
          lastContactedAt: lead.lastContactedAt?.toISOString() || null,
          followUpNotes: lead.followUpNotes,
          callNotes: lead.callNotes,
          assignedToId: lead.assignedToId,
          assignedTo: lead.assignedTo,
          client: lead.client,
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt.toISOString(),
        }}
        activities={lead.activities.map(a => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          outcome: a.outcome,
          duration: a.duration,
          createdAt: a.createdAt.toISOString(),
          user: a.user,
        }))}
        proposals={lead.proposals.map(p => ({
          id: p.id,
          title: p.title,
          value: p.value,
          status: p.status,
          validUntil: p.validUntil.toISOString(),
          createdAt: p.createdAt.toISOString(),
        }))}
        meetings={lead.meetings?.map(m => ({
          id: m.id,
          title: m.title,
          meetingType: m.meetingType,
          scheduledAt: m.scheduledAt.toISOString(),
          status: m.status,
          outcome: m.outcome,
        })) || []}
        reminders={lead.reminders.map(r => ({
          id: r.id,
          title: r.title,
          notes: r.notes,
          scheduledAt: r.scheduledAt.toISOString(),
          priority: r.priority,
        }))}
        nurturingActions={lead.nurturingActions?.map(n => ({
          id: n.id,
          actionType: n.actionType,
          channel: n.channel,
          createdAt: n.createdAt.toISOString(),
          response: n.response,
        })) || []}
        users={users.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName || ''}`.trim(),
        }))}
      />
    </div>
  )
}
