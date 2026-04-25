import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params }) => {
  try {
// Fetch deliverables that are awaiting approval
    const deliverables = await prisma.workDeliverable.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'APPROVED', 'REJECTED'],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactName: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const approvals = deliverables.map(deliverable => ({
      id: deliverable.id,
      project: deliverable.client?.name || 'Internal',
      client: deliverable.client?.name || 'Internal',
      deliverable: `${deliverable.category} - ${deliverable.deliverableType} (x${deliverable.quantity})`,
      submittedDate: deliverable.createdAt.toISOString().split('T')[0],
      status: deliverable.status === 'APPROVED' ? 'APPROVED' :
              deliverable.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
      reviewer: deliverable.client?.contactName ? `Client - ${deliverable.client.contactName}` : 'Manager',
      feedback: deliverable.notes || undefined,
    }))

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error('Failed to fetch approvals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
