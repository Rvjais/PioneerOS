import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

// Log activity
async function logActivity(clientUserId: string, action: string, resource?: string, resourceType?: string, details?: object) {
  await prisma.clientUserActivity.create({
    data: {
      clientUserId,
      action,
      resource,
      resourceType,
      details: details ? JSON.stringify(details) : null,
    },
  })
}

// Convert data to CSV
function toCSV(data: Record<string, unknown>[], columns: { key: string; label: string }[]): string {
  const headers = columns.map((c) => `"${c.label}"`).join(',')
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const value = row[c.key]
        if (value === null || value === undefined) return '""'
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
        if (value instanceof Date) return `"${value.toISOString()}"`
        return `"${String(value)}"`
      })
      .join(',')
  )
  return [headers, ...rows].join('\n')
}

// GET /api/client-portal/export - Export data as CSV
export const GET = withClientAuth(async (req: NextRequest, { user }) => {
  // Only PRIMARY and SECONDARY can export
  if (user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Viewers cannot export data' }, { status: 403 })
  }

  // Fetch client name for filenames
  const client = await prisma.client.findUnique({
    where: { id: user.clientId },
    select: { name: true },
  })
  const clientName = client?.name || 'client'

  const searchParams = req.nextUrl.searchParams
  const type = searchParams.get('type') // leads, deliverables, goals, activity

  if (!type) {
    return NextResponse.json({ error: 'Export type required' }, { status: 400 })
  }

  let csvData = ''
  let filename = ''

  switch (type) {
    case 'leads': {
      const leads = await prisma.lead.findMany({
        where: { clientId: user.clientId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      })

      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'source', label: 'Source' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At' },
      ]

      csvData = toCSV(leads as Record<string, unknown>[], columns)
      filename = `leads_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      break
    }

    case 'deliverables': {
      const deliverables = await prisma.clientScope.findMany({
        where: { clientId: user.clientId },
        orderBy: { month: 'desc' },
      })

      const columns = [
        { key: 'category', label: 'Category' },
        { key: 'item', label: 'Item' },
        { key: 'quantity', label: 'Target' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'unit', label: 'Unit' },
        { key: 'month', label: 'Month' },
      ]

      csvData = toCSV(deliverables as Record<string, unknown>[], columns)
      filename = `deliverables_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      break
    }

    case 'goals': {
      const goals = await prisma.clientGoal.findMany({
        where: { clientId: user.clientId, isVisible: true },
        orderBy: { endDate: 'desc' },
      })

      const columns = [
        { key: 'name', label: 'Goal' },
        { key: 'category', label: 'Category' },
        { key: 'targetValue', label: 'Target' },
        { key: 'currentValue', label: 'Current' },
        { key: 'unit', label: 'Unit' },
        { key: 'status', label: 'Status' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
      ]

      csvData = toCSV(goals as Record<string, unknown>[], columns)
      filename = `goals_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      break
    }

    case 'activity': {
      // Only PRIMARY can export activity
      if (user.role !== 'PRIMARY') {
        return NextResponse.json({ error: 'Only primary users can export activity' }, { status: 403 })
      }

      const clientUsers = await prisma.clientUser.findMany({
        where: { clientId: user.clientId },
        select: { id: true },
      })

      const activities = await prisma.clientUserActivity.findMany({
        where: { clientUserId: { in: clientUsers.map((u) => u.id) } },
        orderBy: { createdAt: 'desc' },
        include: {
          clientUser: { select: { name: true, email: true } },
        },
        take: 1000,
      })

      const columns = [
        { key: 'userName', label: 'User' },
        { key: 'userEmail', label: 'Email' },
        { key: 'action', label: 'Action' },
        { key: 'resourceType', label: 'Resource Type' },
        { key: 'resource', label: 'Resource' },
        { key: 'createdAt', label: 'Date' },
      ]

      const data = activities.map((a) => ({
        userName: a.clientUser.name,
        userEmail: a.clientUser.email,
        action: a.action,
        resourceType: a.resourceType,
        resource: a.resource,
        createdAt: a.createdAt,
      }))

      csvData = toCSV(data as Record<string, unknown>[], columns)
      filename = `activity_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
      break
    }

    default:
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
  }

  // Log activity
  await logActivity(user.id, 'EXPORT_DATA', undefined, 'EXPORT', { type, filename })

  // Return CSV file
  return new NextResponse(csvData, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}, { rateLimit: 'READ' })
