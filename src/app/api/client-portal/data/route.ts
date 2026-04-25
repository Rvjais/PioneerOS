import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'

export const GET = withClientAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
  }

  // Verify the authenticated user's clientId matches the requested clientId
  if (clientId !== user.clientId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              profile: {
                select: { profilePicture: true }
              }
            }
          }
        }
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      tasks: {
        where: {
          status: { not: 'CANCELLED' }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          assignee: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        }
      }
    }
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Get account manager (first team member or primary contact)
  const accountManager = client.teamMembers[0]?.user || null

  // Calculate task stats
  const taskStats = {
    total: client.tasks.length,
    completed: client.tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length,
    inProgress: client.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    pending: client.tasks.filter(t => t.status === 'TODO' || t.status === 'REVIEW').length,
  }

  // Calculate invoice stats
  const invoiceStats = {
    total: client.invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: client.invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
    pending: client.invoices.filter(i => ['SENT', 'DRAFT'].includes(i.status)).reduce((sum, inv) => sum + inv.total, 0),
  }

  return NextResponse.json({
    client: {
      id: client.id,
      name: client.name,
      brandName: client.brandName,
      logoUrl: client.logoUrl,
      industry: client.industry,
      status: client.status,
      tier: client.tier,
      monthlyFee: client.monthlyFee,
    },
    accountManager: accountManager ? {
      name: `${accountManager.firstName} ${accountManager.lastName || ''}`.trim(),
      email: accountManager.email,
      phone: accountManager.phone,
      profilePicture: accountManager.profile?.profilePicture,
    } : null,
    teamMembers: client.teamMembers.map(tm => ({
      id: tm.user.id,
      name: `${tm.user.firstName} ${tm.user.lastName || ''}`.trim(),
      role: tm.role,
      email: tm.user.email,
    })),
    taskStats,
    invoiceStats,
    recentTasks: client.tasks.slice(0, 5).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignee: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName || ''}`.trim() : null,
    })),
    recentInvoices: client.invoices.slice(0, 5).map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate,
    })),
  })
}, { rateLimit: 'READ' })
