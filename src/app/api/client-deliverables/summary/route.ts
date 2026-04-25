import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/client-deliverables/summary - Get summary statistics
// For ACCOUNTS: Returns per-client counts
// For HR: Returns per-employee counts
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const view = searchParams.get('view') // 'clients' | 'employees'

    if (!month) {
      return NextResponse.json({ error: 'Month parameter required' }, { status: 400 })
    }

    const role = user.role

    // Only specific roles can access summaries
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'ACCOUNTS', 'HR']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Not authorized for summary view' }, { status: 403 })
    }

    // Get all active clients
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true },
    })

    // Get all deliverables for the month
    const deliverables = await prisma.clientDeliverable.findMany({
      where: { month },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    // For ACCOUNTS or clients view: summarize by client
    if (role === 'ACCOUNTS' || view === 'clients') {
      const clientSummaries = clients.map(client => {
        const clientItems = deliverables.filter(d => d.clientId === client.id)
        return {
          clientId: client.id,
          clientName: client.name,
          total: clientItems.length,
          approved: clientItems.filter(d => d.status === 'APPROVED').length,
          pending: clientItems.filter(d => d.status === 'PENDING').length,
          submitted: clientItems.filter(d => d.status === 'SUBMITTED').length,
          revision: clientItems.filter(d => d.status === 'REVISION_REQUIRED').length,
        }
      }).filter(s => s.total > 0)

      const totals = clientSummaries.reduce(
        (acc, s) => ({
          total: acc.total + s.total,
          approved: acc.approved + s.approved,
          pending: acc.pending + s.pending,
          submitted: acc.submitted + s.submitted,
          revision: acc.revision + s.revision,
        }),
        { total: 0, approved: 0, pending: 0, submitted: 0, revision: 0 }
      )

      return NextResponse.json({
        view: 'clients',
        month,
        clients: clientSummaries,
        totals,
      })
    }

    // For HR or employees view: summarize by employee
    if (role === 'HR' || view === 'employees') {
      const employeeMap = new Map<string, {
        userId: string
        name: string
        total: number
        approved: number
        pending: number
        submitted: number
        revision: number
      }>()

      for (const d of deliverables) {
        if (!d.createdBy) continue

        const key = d.createdBy.id
        if (!employeeMap.has(key)) {
          employeeMap.set(key, {
            userId: key,
            name: `${d.createdBy.firstName} ${d.createdBy.lastName}`,
            total: 0,
            approved: 0,
            pending: 0,
            submitted: 0,
            revision: 0,
          })
        }

        const summary = employeeMap.get(key)!
        summary.total++
        switch (d.status) {
          case 'APPROVED':
            summary.approved++
            break
          case 'PENDING':
            summary.pending++
            break
          case 'SUBMITTED':
            summary.submitted++
            break
          case 'REVISION_REQUIRED':
            summary.revision++
            break
        }
      }

      const employeeSummaries = Array.from(employeeMap.values()).sort((a, b) => b.total - a.total)

      const totals = employeeSummaries.reduce(
        (acc, s) => ({
          total: acc.total + s.total,
          approved: acc.approved + s.approved,
          pending: acc.pending + s.pending,
          submitted: acc.submitted + s.submitted,
          revision: acc.revision + s.revision,
        }),
        { total: 0, approved: 0, pending: 0, submitted: 0, revision: 0 }
      )

      return NextResponse.json({
        view: 'employees',
        month,
        employees: employeeSummaries,
        totals,
      })
    }

    // Default: return both summaries for managers
    return NextResponse.json({
      error: 'Please specify view parameter: clients or employees',
    }, { status: 400 })

  } catch (error) {
    console.error('Failed to fetch summary:', error)
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
  }
})
