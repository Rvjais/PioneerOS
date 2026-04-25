import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { LeadDetail } from './LeadDetail'

async function getLead(leadId: string) {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      proposals: {
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
      reminders: {
        include: { user: true },
        where: { isCompleted: false },
        orderBy: { scheduledAt: 'asc' },
      },
      assignedTo: true,
      client: true,
    },
  })
}

async function getUsers() {
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
      empId: true,
    },
  })
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { leadId } = await params
  const [lead, users] = await Promise.all([
    getLead(leadId),
    getUsers(),
  ])

  if (!lead) notFound()

  return (
    <LeadDetail
      lead={{
        id: lead.id,
        companyName: lead.companyName,
        contactName: lead.contactName,
        contactEmail: lead.contactEmail || '',
        contactPhone: lead.contactPhone || '',
        source: lead.source,
        value: lead.value || 0,
        notes: lead.notes || '',
        stage: lead.stage,
        lostReason: lead.lostReason || '',
        wonAt: lead.wonAt?.toISOString() || null,
        clientId: lead.clientId || null,
        nextFollowUp: lead.nextFollowUp?.toISOString() || null,
        lastContactedAt: lead.lastContactedAt?.toISOString() || null,
        followUpNotes: lead.followUpNotes || '',
        callNotes: lead.callNotes || '',
        assignedToId: lead.assignedToId || '',
        assignedTo: lead.assignedTo ? {
          firstName: lead.assignedTo.firstName,
          lastName: lead.assignedTo.lastName || '',
        } : null,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      }}
      activities={lead.activities.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description || '',
        outcome: a.outcome || '',
        duration: a.duration || 0,
        createdAt: a.createdAt.toISOString(),
        user: {
          firstName: a.user.firstName,
          lastName: a.user.lastName || '',
        },
      }))}
      reminders={lead.reminders.map(r => ({
        id: r.id,
        title: r.title,
        notes: r.notes || '',
        scheduledAt: r.scheduledAt.toISOString(),
        priority: r.priority,
        user: {
          firstName: r.user.firstName,
          lastName: r.user.lastName || '',
        },
      }))}
      proposals={lead.proposals.map(p => ({
        id: p.id,
        title: p.title,
        value: p.value,
        status: p.status,
        validUntil: p.validUntil.toISOString(),
      }))}
      users={users.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName || ''}`.trim(),
        empId: u.empId,
      }))}
      currentUserId={session.user.id}
    />
  )
}
