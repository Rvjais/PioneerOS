import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/server/db/prisma'
import TestimonialsClient from './TestimonialsClient'

export const metadata: Metadata = {
  title: 'Video Testimonials | Pioneer OS',
  description: 'Request and manage client video testimonials',
}

export default async function TestimonialsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id
  const role = session.user.role
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(role)

  // Fetch testimonials
  const testimonials = await prisma.videoTestimonial.findMany({
    where: isManager
      ? {} // Managers see all
      : {
          OR: [
            { requestedById: userId },
            { status: { in: ['VERIFIED', 'REWARDED'] } },
          ],
        },
    include: {
      requestedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          profile: { select: { profilePicture: true } },
        },
      },
      client: {
        select: { id: true, name: true, logoUrl: true, contactName: true, contactEmail: true },
      },
      verifiedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch clients for dropdown (only assigned clients for non-managers)
  let clients
  if (isManager) {
    clients = await prisma.client.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, contactName: true, contactEmail: true },
      orderBy: { name: 'asc' },
    })
  } else {
    const assignments = await prisma.clientTeamMember.findMany({
      where: { userId },
      select: { clientId: true },
    })
    const clientIds = assignments.map((a) => a.clientId)

    clients = await prisma.client.findMany({
      where: { id: { in: clientIds }, status: 'ACTIVE' },
      select: { id: true, name: true, contactName: true, contactEmail: true },
      orderBy: { name: 'asc' },
    })
  }

  // Get stats
  const stats = await prisma.videoTestimonial.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const statsMap = stats.reduce(
    (acc, s) => {
      acc[s.status] = s._count.status
      return acc
    },
    {} as Record<string, number>
  )

  // Get user's personal stats
  const myStats = await prisma.videoTestimonial.aggregate({
    where: { requestedById: userId, status: { in: ['VERIFIED', 'REWARDED'] } },
    _count: true,
    _sum: { voucherAmount: true },
  })

  return (
    <TestimonialsClient
      testimonials={JSON.parse(JSON.stringify(testimonials))}
      clients={clients}
      currentUserId={userId}
      isManager={isManager}
      stats={{
        requested: statsMap['REQUESTED'] || 0,
        received: statsMap['RECEIVED'] || 0,
        verified: statsMap['VERIFIED'] || 0,
        rewarded: statsMap['REWARDED'] || 0,
      }}
      myStats={{
        count: myStats._count,
        totalEarned: myStats._sum.voucherAmount || 0,
      }}
    />
  )
}
