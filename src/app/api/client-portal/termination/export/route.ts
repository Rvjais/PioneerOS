import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'

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

// GET /api/client-portal/termination/export - Download comprehensive data export
export const GET = withClientAuth(async (req, { user }) => {
  // Get active termination
  const termination = await prisma.serviceTermination.findFirst({
    where: {
      clientId: user.clientId,
      status: { in: ['PENDING', 'ACTIVE', 'HANDOVER', 'COMPLETED'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!termination) {
    return NextResponse.json(
      { error: 'No termination request found' },
      { status: 404 }
    )
  }

  // Check if data export is enabled (payment cleared)
  if (!termination.dataExportEnabled && !termination.paymentCleared) {
    return NextResponse.json(
      { error: 'Data export is only available after payment clearance' },
      { status: 403 }
    )
  }

  const clientId = user.clientId
  const clientName = user.client.name.replace(/\s+/g, '_')
  const exportDate = new Date().toISOString().split('T')[0]

  // Fetch all data for export
  const [
    deliverables,
    workEntries,
    goals,
    meetings,
    documents,
    invoices,
    leads,
    credentials,
    communications,
  ] = await Promise.all([
    // Deliverables/Scope
    prisma.clientScope.findMany({
      where: { clientId },
      orderBy: { month: 'desc' },
    }),

    // Work Entries
    prisma.workEntry.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),

    // Goals
    prisma.clientGoal.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    }),

    // Meetings
    prisma.meeting.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
    }),

    // Documents
    prisma.clientDocument.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    }),

    // Invoices
    prisma.invoice.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    }),

    // Leads
    prisma.lead.findMany({
      where: { clientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),

    // Credentials (masked)
    prisma.clientCredential.findMany({
      where: { clientId },
      select: {
        id: true,
        platform: true,
        category: true,
        username: true,
        email: true,
        url: true,
        notes: true,
        // Exclude password for security
      },
    }),

    // Communication logs
    prisma.communicationLog.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ])

  // Generate CSV files
  const files: { name: string; content: string }[] = []

  // 1. Deliverables
  if (deliverables.length > 0) {
    files.push({
      name: `deliverables_${clientName}_${exportDate}.csv`,
      content: toCSV(
        deliverables.map((d) => ({
          ...d,
          month: d.month.toISOString().split('T')[0],
        })) as Record<string, unknown>[],
        [
          { key: 'category', label: 'Category' },
          { key: 'item', label: 'Item' },
          { key: 'quantity', label: 'Target' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'status', label: 'Status' },
          { key: 'month', label: 'Month' },
        ]
      ),
    })
  }

  // 2. Work Entries
  if (workEntries.length > 0) {
    files.push({
      name: `work_entries_${clientName}_${exportDate}.csv`,
      content: toCSV(
        workEntries.map((w) => ({
          date: w.date.toISOString().split('T')[0],
          deliverableType: w.deliverableType,
          quantity: w.quantity,
          category: w.category,
          assignee: w.user ? `${w.user.firstName} ${w.user.lastName || ''}`.trim() : '',
        })) as Record<string, unknown>[],
        [
          { key: 'date', label: 'Date' },
          { key: 'deliverableType', label: 'Deliverable Type' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'category', label: 'Category' },
          { key: 'assignee', label: 'Assignee' },
        ]
      ),
    })
  }

  // 3. Goals
  if (goals.length > 0) {
    files.push({
      name: `goals_${clientName}_${exportDate}.csv`,
      content: toCSV(
        goals.map((g) => ({
          name: g.name,
          description: g.description,
          category: g.category,
          targetValue: g.targetValue,
          currentValue: g.currentValue,
          unit: g.unit,
          status: g.status,
          startDate: g.startDate?.toISOString().split('T')[0],
          endDate: g.endDate?.toISOString().split('T')[0],
        })) as Record<string, unknown>[],
        [
          { key: 'name', label: 'Goal' },
          { key: 'description', label: 'Description' },
          { key: 'category', label: 'Category' },
          { key: 'targetValue', label: 'Target' },
          { key: 'currentValue', label: 'Current' },
          { key: 'unit', label: 'Unit' },
          { key: 'status', label: 'Status' },
          { key: 'startDate', label: 'Start Date' },
          { key: 'endDate', label: 'End Date' },
        ]
      ),
    })
  }

  // 4. Meetings
  if (meetings.length > 0) {
    files.push({
      name: `meetings_${clientName}_${exportDate}.csv`,
      content: toCSV(
        meetings.map((m) => ({
          title: m.title,
          type: m.type,
          date: m.date.toISOString(),
          duration: m.duration,
          status: m.status,
          location: m.location,
          notes: m.notes,
          meetingLink: m.meetingLink,
        })) as Record<string, unknown>[],
        [
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type' },
          { key: 'date', label: 'Date' },
          { key: 'duration', label: 'Duration (mins)' },
          { key: 'status', label: 'Status' },
          { key: 'location', label: 'Location' },
          { key: 'notes', label: 'Notes' },
          { key: 'meetingLink', label: 'Meeting Link' },
        ]
      ),
    })
  }

  // 5. Documents
  if (documents.length > 0) {
    files.push({
      name: `documents_${clientName}_${exportDate}.csv`,
      content: toCSV(
        documents.map((d) => ({
          name: d.name,
          category: d.category,
          description: d.description,
          fileUrl: d.fileUrl,
          createdAt: d.createdAt.toISOString().split('T')[0],
        })) as Record<string, unknown>[],
        [
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          { key: 'fileUrl', label: 'File URL' },
          { key: 'createdAt', label: 'Uploaded At' },
        ]
      ),
    })
  }

  // 6. Invoices
  if (invoices.length > 0) {
    files.push({
      name: `invoices_${clientName}_${exportDate}.csv`,
      content: toCSV(
        invoices.map((i) => ({
          invoiceNumber: i.invoiceNumber,
          status: i.status,
          total: i.total,
          paidAmount: i.paidAmount,
          dueDate: i.dueDate?.toISOString().split('T')[0],
          paidAt: i.paidAt?.toISOString().split('T')[0],
          createdAt: i.createdAt.toISOString().split('T')[0],
        })) as Record<string, unknown>[],
        [
          { key: 'invoiceNumber', label: 'Invoice Number' },
          { key: 'status', label: 'Status' },
          { key: 'total', label: 'Total Amount' },
          { key: 'paidAmount', label: 'Paid Amount' },
          { key: 'dueDate', label: 'Due Date' },
          { key: 'paidAt', label: 'Paid At' },
          { key: 'createdAt', label: 'Created At' },
        ]
      ),
    })
  }

  // 7. Leads
  if (leads.length > 0) {
    files.push({
      name: `leads_${clientName}_${exportDate}.csv`,
      content: toCSV(
        leads.map((l) => ({
          contactName: l.contactName,
          contactEmail: l.contactEmail,
          contactPhone: l.contactPhone,
          companyName: l.companyName,
          source: l.source,
          stage: l.stage,
          createdAt: l.createdAt.toISOString().split('T')[0],
        })) as Record<string, unknown>[],
        [
          { key: 'contactName', label: 'Contact Name' },
          { key: 'contactEmail', label: 'Email' },
          { key: 'contactPhone', label: 'Phone' },
          { key: 'companyName', label: 'Company' },
          { key: 'source', label: 'Source' },
          { key: 'stage', label: 'Stage' },
          { key: 'createdAt', label: 'Created At' },
        ]
      ),
    })
  }

  // 8. Credentials (without passwords)
  if (credentials.length > 0) {
    files.push({
      name: `credentials_${clientName}_${exportDate}.csv`,
      content: toCSV(credentials as Record<string, unknown>[], [
        { key: 'platform', label: 'Platform' },
        { key: 'category', label: 'Category' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'url', label: 'URL' },
        { key: 'notes', label: 'Notes' },
      ]),
    })
  }

  // 9. Communications
  if (communications.length > 0) {
    files.push({
      name: `communications_${clientName}_${exportDate}.csv`,
      content: toCSV(
        communications.map((c) => ({
          type: c.type,
          subject: c.subject,
          content: c.content,
          user: c.user ? `${c.user.firstName} ${c.user.lastName || ''}`.trim() : '',
          createdAt: c.createdAt.toISOString(),
        })) as Record<string, unknown>[],
        [
          { key: 'type', label: 'Type' },
          { key: 'subject', label: 'Subject' },
          { key: 'content', label: 'Content' },
          { key: 'user', label: 'User' },
          { key: 'createdAt', label: 'Date' },
        ]
      ),
    })
  }

  // If no data, return error
  if (files.length === 0) {
    return NextResponse.json(
      { error: 'No data available for export' },
      { status: 404 }
    )
  }

  // Create a combined export file with all data separated by sections
  let combinedCsv = `# SERVICE TERMINATION DATA EXPORT\n`
  combinedCsv += `# Client: ${user.client.name}\n`
  combinedCsv += `# Export Date: ${exportDate}\n`
  combinedCsv += `# Termination ID: ${termination.id}\n`
  combinedCsv += `\n`

  for (const file of files) {
    combinedCsv += `\n# ========================================\n`
    combinedCsv += `# ${file.name.split('_')[0].toUpperCase()}\n`
    combinedCsv += `# ========================================\n\n`
    combinedCsv += file.content
    combinedCsv += `\n`
  }

  // Update termination with export timestamp
  await prisma.serviceTermination.update({
    where: { id: termination.id },
    data: {
      dataExportedAt: new Date(),
    },
  })

  // Log activity
  await prisma.clientUserActivity.create({
    data: {
      clientUserId: user.id,
      action: 'TERMINATION_DATA_EXPORT',
      resourceType: 'EXPORT',
      details: JSON.stringify({
        terminationId: termination.id,
        fileCount: files.length,
        exportDate,
      }),
    },
  })

  const filename = `termination_export_${clientName}_${exportDate}.csv`

  return new NextResponse(combinedCsv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'READ' })
