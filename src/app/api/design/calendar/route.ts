import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params }) => {
  try {
    const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    // Fetch creative content approvals with due dates in the month
    const approvals = await prisma.contentApproval.findMany({
      where: {
        type: 'CREATIVE',
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        reviewedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Transform data into calendar events
    const events = approvals.map(approval => {
      // Determine event type based on status
      let eventType: 'DESIGN' | 'REVIEW' | 'APPROVAL' | 'DELIVERY' | 'CLIENT' | 'MEETING' = 'DESIGN'

      switch (approval.status) {
        case 'PENDING':
          eventType = 'REVIEW'
          break
        case 'APPROVED':
          eventType = 'APPROVAL'
          break
        case 'REJECTED':
        case 'REVISION_REQUESTED':
          eventType = 'DESIGN'
          break
        case 'CANCELLED':
          eventType = 'DELIVERY'
          break
        default:
          eventType = 'DESIGN'
      }

      return {
        id: approval.id,
        title: approval.title,
        type: eventType,
        date: approval.dueDate?.toISOString().split('T')[0] || '',
        time: approval.dueDate?.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        personName: approval.client?.name,
        personId: approval.clientId,
        status: approval.status,
        priority: approval.priority,
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to fetch Design calendar events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
