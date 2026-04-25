import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import prisma from '@/server/db/prisma'
import {
  ReportBuilder,
  ExportFormat,
  ReportColumn,
  DateRangePreset,
} from '@/server/reporting'

interface ExportRequest {
  reportType: string
  category: string
  datePreset?: DateRangePreset
  dateFrom?: string
  dateTo?: string
  format: ExportFormat
  filters?: Record<string, unknown>
}

/**
 * POST /api/reports/export
 * Generate and export a report
 *
 * NOTE: This endpoint is fully connected and uses ReportBuilder from @/server/reporting
 * to generate reports in various formats (CSV, etc.) for SALES, HR, ACCOUNTS categories.
 * Data is fetched from the database via fetchReportData() below.
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const body: ExportRequest = await request.json()
    const { reportType, category, datePreset, dateFrom, dateTo, format, filters } = body

    if (!reportType || !category || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: reportType, category, format' },
        { status: 400 }
      )
    }

    // Enforce role-to-category restrictions
    // Only SUPER_ADMIN and MANAGER can export all categories
    const roleCategoryMap: Record<string, string[]> = {
      'HR': ['HR'],
      'ACCOUNTS': ['ACCOUNTS'],
      'SALES': ['SALES'],
    }
    const userRole = user.role || ''
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'MANAGER') {
      const allowedCategories = roleCategoryMap[userRole] || []
      if (!allowedCategories.includes(category.toUpperCase())) {
        return NextResponse.json(
          { error: `Forbidden - ${userRole} role can only export ${allowedCategories.join(', ') || 'no'} reports` },
          { status: 403 }
        )
      }
    }

    // Build the report based on type and category
    const builder = ReportBuilder.create(`${category} ${reportType} Report`)
      .type(reportType.toUpperCase() as 'TACTICAL' | 'STRATEGIC' | 'OPERATIONS' | 'PERFORMANCE' | 'FINANCIAL')
      .category(category.toUpperCase() as 'SALES' | 'ADS' | 'SEO' | 'SOCIAL' | 'HR' | 'ACCOUNTS')
      .setMetadata(user.firstName || undefined)

    // Set date range
    if (datePreset && datePreset !== 'custom') {
      builder.dateRangePreset(datePreset)
    } else if (dateFrom && dateTo) {
      builder.dateRangeCustom(new Date(dateFrom), new Date(dateTo))
    } else {
      builder.dateRangePreset('this_month')
    }

    // Fetch data based on category
    const data = await fetchReportData(category, reportType, {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      filters,
    })

    if (data.columns) {
      builder.addColumns(data.columns)
    }
    if (data.rows) {
      builder.setData(data.rows)
    }
    if (data.metrics) {
      for (const metric of data.metrics) {
        builder.addCalculatedMetric(
          metric.key,
          metric.label,
          metric.current,
          metric.previous,
          { format: metric.format }
        )
      }
    }
    if (data.highlights) {
      for (const highlight of data.highlights) {
        builder.addHighlight(highlight)
      }
    }

    // Export
    const exported = builder.export(format)

    // Return the file
    return new NextResponse(exported.content, {
      headers: {
        'Content-Type': exported.mimeType,
        'Content-Disposition': `attachment; filename="${exported.filename}"`,
      },
    })
  } catch (error) {
    console.error('Failed to export report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'HR', 'SALES', 'OPERATIONS_HEAD'] })

/**
 * Fetch report data based on category and type
 */
async function fetchReportData(
  category: string,
  reportType: string,
  options: {
    dateFrom?: Date
    dateTo?: Date
    filters?: Record<string, unknown>
  }
): Promise<{
  columns?: ReportColumn[]
  rows?: Record<string, unknown>[]
  metrics?: Array<{ key: string; label: string; current: number; previous?: number; format?: 'currency' | 'number' | 'percentage' }>
  highlights?: string[]
}> {
  const { dateFrom, dateTo } = options
  const now = new Date()
  const startDate = dateFrom || new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = dateTo || now

  switch (category.toUpperCase()) {
    case 'SALES': {
      const leads = await prisma.lead.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
        select: {
          id: true,
          companyName: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          stage: true,
          source: true,
          value: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      const totalLeads = leads.length
      const convertedLeads = leads.filter(l => l.stage === 'WON').length
      const totalPipeline = leads.reduce((sum, l) => sum + (l.value || 0), 0)

      return {
        columns: [
          { key: 'companyName', label: 'Company', type: 'text' },
          { key: 'contactName', label: 'Contact', type: 'text' },
          { key: 'contactEmail', label: 'Email', type: 'text' },
          { key: 'contactPhone', label: 'Phone', type: 'text' },
          { key: 'stage', label: 'Stage', type: 'text' },
          { key: 'source', label: 'Source', type: 'text' },
          { key: 'value', label: 'Value', type: 'currency', align: 'right' },
          { key: 'createdAt', label: 'Created', type: 'date' },
        ],
        rows: leads,
        metrics: [
          { key: 'totalLeads', label: 'Total Leads', current: totalLeads, format: 'number' },
          { key: 'converted', label: 'Won', current: convertedLeads, format: 'number' },
          { key: 'conversionRate', label: 'Win Rate', current: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0, format: 'percentage' },
          { key: 'totalPipeline', label: 'Total Pipeline', current: totalPipeline, format: 'currency' },
        ],
        highlights: [
          `${totalLeads} leads generated`,
          `${convertedLeads} leads won (${totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0}%)`,
        ],
      }
    }

    case 'HR': {
      const employees = await prisma.user.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
        select: {
          empId: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          role: true,
          status: true,
          joiningDate: true,
        },
        orderBy: { joiningDate: 'desc' },
      })

      const totalEmployees = await prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } })
      const newHires = employees.length

      return {
        columns: [
          { key: 'empId', label: 'Employee ID', type: 'text' },
          { key: 'firstName', label: 'First Name', type: 'text' },
          { key: 'lastName', label: 'Last Name', type: 'text' },
          { key: 'email', label: 'Email', type: 'text' },
          { key: 'department', label: 'Department', type: 'text' },
          { key: 'role', label: 'Role', type: 'text' },
          { key: 'status', label: 'Status', type: 'text' },
          { key: 'joiningDate', label: 'Joining Date', type: 'date' },
        ],
        rows: employees,
        metrics: [
          { key: 'totalEmployees', label: 'Total Employees', current: totalEmployees, format: 'number' },
          { key: 'newHires', label: 'New Hires', current: newHires, format: 'number' },
        ],
      }
    }

    case 'ACCOUNTS': {
      const invoices = await prisma.invoice.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          client: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0)
      const pendingRevenue = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0)

      return {
        columns: [
          { key: 'invoiceNumber', label: 'Invoice #', type: 'text' },
          { key: 'clientName', label: 'Client', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
          { key: 'status', label: 'Status', type: 'text' },
          { key: 'dueDate', label: 'Due Date', type: 'date' },
          { key: 'createdAt', label: 'Created', type: 'date' },
        ],
        rows: invoices.map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          clientName: inv.client?.name || 'N/A',
          amount: inv.amount,
          status: inv.status,
          dueDate: inv.dueDate,
          createdAt: inv.createdAt,
        })),
        metrics: [
          { key: 'totalInvoices', label: 'Total Invoices', current: invoices.length, format: 'number' },
          { key: 'totalRevenue', label: 'Collected Revenue', current: totalRevenue, format: 'currency' },
          { key: 'pendingRevenue', label: 'Pending Revenue', current: pendingRevenue, format: 'currency' },
        ],
      }
    }

    default: {
      // Generic task-based report
      const tasks = await prisma.task.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          dueDate: true,
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
      })

      return {
        columns: [
          { key: 'title', label: 'Task', type: 'text' },
          { key: 'status', label: 'Status', type: 'text' },
          { key: 'priority', label: 'Priority', type: 'text' },
          { key: 'dueDate', label: 'Due Date', type: 'date' },
          { key: 'createdAt', label: 'Created', type: 'date' },
        ],
        rows: tasks,
        metrics: [
          { key: 'totalTasks', label: 'Total Tasks', current: tasks.length, format: 'number' },
          { key: 'completed', label: 'Completed', current: tasks.filter(t => t.status === 'COMPLETED').length, format: 'number' },
        ],
      }
    }
  }
}
