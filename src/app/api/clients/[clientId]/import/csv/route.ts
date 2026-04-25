import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'
import { parseCSV, importMetrics, ColumnMapping } from '@/server/reporting/data-import'
import { getAccount, PLATFORMS, Platform } from '@/server/reporting/platform-accounts'

// Validation schema for CSV import
const csvImportSchema = z.object({
  accountId: z.string().min(1),
  content: z.string().min(1),
  columnMapping: z.record(z.string(), z.string()).optional(),
  fileName: z.string().optional(),
})

// POST - Import CSV data
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json(
      { error: 'You do not have permission to import data for this client' },
      { status: 403 }
    )
  }

  // Parse and validate body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = csvImportSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  // Verify account exists and belongs to this client
  const account = await getAccount(validation.data.accountId)
  if (!account || account.clientId !== clientId) {
    return NextResponse.json({ error: 'Account not found for this client' }, { status: 404 })
  }

  const platform = account.platform as Platform
  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  try {
    // Parse CSV
    const { rows, headers } = await parseCSV(
      validation.data.content,
      platform,
      validation.data.columnMapping as ColumnMapping | undefined
    )

    // Check if this is a preview request
    const { searchParams } = new URL(req.url)
    if (searchParams.get('preview') === 'true') {
      // Return preview data
      return NextResponse.json({
        headers,
        preview: rows.slice(0, 5).map((row, index) => ({
          rowNumber: index + 2,
          date: row.date,
          metrics: row.metrics,
          errors: row.errors,
        })),
        totalRows: rows.length,
        validRows: rows.filter((r) => r.errors.length === 0 && r.metrics.length > 0).length,
      })
    }

    // Import data
    const result = await importMetrics(
      validation.data.accountId,
      rows,
      'CSV_IMPORT',
      user.id,
      clientId,
      platform,
      validation.data.fileName
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import CSV data' },
      { status: 500 }
    )
  }
})
