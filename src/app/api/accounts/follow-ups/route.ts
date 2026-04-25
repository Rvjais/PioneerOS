import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createFollowUpSchema = z.object({
  clientId: z.string().min(1),
  date: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().optional(),
})

// GET /api/accounts/follow-ups - Get all clients with their follow-up status
export const GET = withAuth(async (req, { user, params }) => {
  try {
// Only accounts, operations, or admins can view follow-ups
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS']
    const allowedDepartments = ['ACCOUNTS', 'OPERATIONS', 'MANAGEMENT']
    if (!allowedRoles.includes(user.role || '') && !allowedDepartments.includes(user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    // Get the start and end of the month
    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    // Get all active clients with their follow-ups for the month
    const clients = await prisma.client.findMany({
      where: {
        status: { in: ['ACTIVE', 'ON_HOLD'] },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        contactPhone: true,
        services: true,
        invoiceDayOfMonth: true,
        invoiceStatus: true,
        currentPaymentStatus: true,
        pendingAmount: true,
        notes: true,
        status: true,
        paymentFollowUps: {
          where: {
            date: {
              gte: startDate,
              lt: endDate,
            }
          },
          orderBy: { date: 'asc' },
        }
      },
      orderBy: { name: 'asc' },
    })

    // Generate date range for the month
    const dates: string[] = []
    const currentDate = new Date(startDate)
    while (currentDate < endDate) {
      dates.push(currentDate.toISOString().slice(0, 10))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Format the response
    const formattedClients = clients.map(client => {
      const followUpMap: Record<string, { status: string; notes: string | null }> = {}
      client.paymentFollowUps.forEach(fu => {
        const dateKey = fu.date.toISOString().slice(0, 10)
        followUpMap[dateKey] = { status: fu.status, notes: fu.notes }
      })

      return {
        id: client.id,
        name: client.name,
        phone: client.contactPhone,
        services: safeJsonParse(client.services, []),
        invoiceDay: client.invoiceDayOfMonth,
        invoiceStatus: client.invoiceStatus,
        currentStatus: client.currentPaymentStatus,
        pendingAmount: client.pendingAmount,
        notes: client.notes,
        status: client.status,
        followUps: followUpMap,
      }
    })

    return NextResponse.json({
      clients: formattedClients,
      dates,
      month,
    })
  } catch (error) {
    console.error('Failed to fetch follow-ups:', error)
    return NextResponse.json({ error: 'Failed to fetch follow-ups' }, { status: 500 })
  }
})

// POST /api/accounts/follow-ups - Record a follow-up for a client
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Only accounts, operations, or admins can record follow-ups
    const postAllowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS']
    const postAllowedDepartments = ['ACCOUNTS', 'OPERATIONS', 'MANAGEMENT']
    if (!postAllowedRoles.includes(user.role || '') && !postAllowedDepartments.includes(user.department || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createFollowUpSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { clientId, date, status, notes, nextAction, nextActionDate } = parsed.data

    const followUpDate = new Date(date)
    const monthName = followUpDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })

    // Upsert the follow-up (update if exists for that date, create if not)
    const followUp = await prisma.paymentFollowUp.upsert({
      where: {
        clientId_date: {
          clientId,
          date: followUpDate,
        }
      },
      update: {
        status,
        notes,
        nextAction,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        recordedBy: user.id,
      },
      create: {
        clientId,
        date: followUpDate,
        status,
        notes,
        nextAction,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        recordedBy: user.id,
        month: monthName,
      },
    })

    // Also update the client's current payment status
    await prisma.client.update({
      where: { id: clientId },
      data: { currentPaymentStatus: status },
    })

    return NextResponse.json({ followUp }, { status: 201 })
  } catch (error) {
    console.error('Failed to record follow-up:', error)
    return NextResponse.json({ error: 'Failed to record follow-up' }, { status: 500 })
  }
})
