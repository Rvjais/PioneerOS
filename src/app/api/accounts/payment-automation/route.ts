import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// GET - Fetch automation status and suggestions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const currentMonthIndex = now.getMonth()
    const currentYear = now.getFullYear()
    const currentMonth = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`

    // Get all active clients with payment info
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        paymentDueDay: true,
        paymentStatus: true,
        pendingAmount: true,
        haltReminders: true,
        preferredContact: true,
        contactPhone: true,
        contactEmail: true,
        tier: true,
      },
    })

    // Get this month's follow-ups
    const followUps = await prisma.paymentFollowUp.findMany({
      where: { month: currentMonth },
      select: {
        clientId: true,
        date: true,
        status: true,
        notes: true,
      },
    })

    const followUpMap = new Map<string, typeof followUps>()
    for (const f of followUps) {
      const list = followUpMap.get(f.clientId) || []
      list.push(f)
      followUpMap.set(f.clientId, list)
    }

    // Get this month's payments
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const payments = await prisma.paymentCollection.findMany({
      where: {
        collectedAt: { gte: monthStart },
        status: 'CONFIRMED',
      },
      select: { clientId: true, grossAmount: true },
    })

    const paidClients = new Set(payments.map(p => p.clientId))

    // Categorize clients into action buckets
    const autoEscalations: Array<{
      client: (typeof clients)[0]
      reason: string
      suggestedAction: string
      priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
      daysOverdue: number
    }> = []

    const todayDue: typeof clients = []
    const upcomingDue: typeof clients = []
    const alreadyPaid: typeof clients = []

    for (const client of clients) {
      if (client.haltReminders) continue

      // Already paid this month
      if (paidClients.has(client.id)) {
        alreadyPaid.push(client)
        continue
      }

      const dueDay = client.paymentDueDay || 1

      // Construct the due date for this month, clamping to the last day of the month
      const lastDayThisMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate()
      const dueDateThisMonth = new Date(currentYear, currentMonthIndex, Math.min(dueDay, lastDayThisMonth))
      const daysUntilThisMonthDue = Math.floor((dueDateThisMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Check if this month's due date is today or upcoming (within 3 days)
      if (daysUntilThisMonthDue === 0) {
        todayDue.push(client)
        continue
      } else if (daysUntilThisMonthDue > 0 && daysUntilThisMonthDue <= 3) {
        upcomingDue.push(client)
        continue
      }

      // Due date has passed this month — calculate actual days overdue
      let dueDate = dueDateThisMonth
      if (dueDateThisMonth > now) {
        // Due date this month is far in the future; check last month's due date
        const lastDayPrevMonth = new Date(currentYear, currentMonthIndex, 0).getDate()
        dueDate = new Date(currentYear, currentMonthIndex - 1, Math.min(dueDay, lastDayPrevMonth))
      }

      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysOverdue > 0) {
        // Check follow-up history
        const clientFollowUps = followUpMap.get(client.id) || []
        const lastFollowUp = clientFollowUps.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]

        let reason = ''
        let suggestedAction = ''
        let priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'

        if (daysOverdue > 15) {
          priority = 'URGENT'
          reason = `${daysOverdue} days overdue, pending: ₹${client.pendingAmount || client.monthlyFee || 0}`
          suggestedAction = 'Escalate to manager, consider service pause'
        } else if (daysOverdue > 7) {
          priority = 'HIGH'
          reason = `${daysOverdue} days overdue`
          if (!lastFollowUp || lastFollowUp.status === 'PENDING') {
            suggestedAction = 'Send formal reminder via email + WhatsApp'
          } else if (lastFollowUp.status === 'WILL_PAY') {
            suggestedAction = 'Follow up on payment commitment'
          } else if (lastFollowUp.status === 'CALL_NOT_PICKED') {
            suggestedAction = 'Try WhatsApp message, then escalate'
          } else {
            suggestedAction = 'Call and confirm payment date'
          }
        } else if (daysOverdue > 3) {
          priority = 'MEDIUM'
          reason = `${daysOverdue} days past due`
          suggestedAction = 'Send gentle reminder'
        } else {
          priority = 'LOW'
          reason = `${daysOverdue} days past due`
          suggestedAction = 'Auto-remind via WhatsApp'
        }

        autoEscalations.push({
          client,
          reason,
          suggestedAction,
          priority,
          daysOverdue,
        })
      }
    }

    // Sort escalations by priority
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    autoEscalations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    // Summary
    const totalExpected = clients.reduce((s, c) => s + (c.monthlyFee || 0), 0)
    const totalCollected = payments.reduce((s, p) => s + p.grossAmount, 0)

    return NextResponse.json({
      escalations: autoEscalations,
      todayDue: todayDue.map(c => ({ ...c, dueDay: c.paymentDueDay })),
      upcomingDue: upcomingDue.map(c => {
        const cDueDay = c.paymentDueDay || 1
        const cLastDay = new Date(currentYear, currentMonthIndex + 1, 0).getDate()
        const cDueDate = new Date(currentYear, currentMonthIndex, Math.min(cDueDay, cLastDay))
        return {
          ...c,
          dueDay: c.paymentDueDay,
          daysUntilDue: Math.floor((cDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        }
      }),
      summary: {
        totalClients: clients.length,
        paidThisMonth: alreadyPaid.length,
        pendingCount: autoEscalations.length + todayDue.length,
        urgentCount: autoEscalations.filter(e => e.priority === 'URGENT').length,
        highCount: autoEscalations.filter(e => e.priority === 'HIGH').length,
        dueToday: todayDue.length,
        upcomingIn3Days: upcomingDue.length,
        totalExpected: Math.round(totalExpected),
        totalCollected: Math.round(totalCollected),
        collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
        haltedReminders: clients.filter(c => c.haltReminders).length,
      },
      currentMonth,
    })
  } catch (error) {
    console.error('Failed to fetch payment automation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
