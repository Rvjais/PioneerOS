import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { parseExcel, importMetrics, ColumnMapping } from '@/server/reporting/data-import'
import { getAccount, PLATFORMS, Platform } from '@/server/reporting/platform-accounts'
import { validateFileUpload } from '@/server/fileUpload'

// POST - Import Excel data
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

  // Parse multipart form data
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const accountId = formData.get('accountId') as string | null
  const sheetName = formData.get('sheetName') as string | null
  const columnMappingStr = formData.get('columnMapping') as string | null

  if (!file || !accountId) {
    return NextResponse.json(
      { error: 'File and accountId are required' },
      { status: 400 }
    )
  }

  // Validate file upload (size, type, extension)
  const fileValidation = validateFileUpload(file, { category: 'excel' })
  if (!fileValidation.valid) {
    return NextResponse.json(
      { error: fileValidation.error },
      { status: 400 }
    )
  }

  // Verify account exists and belongs to this client
  const account = await getAccount(accountId)
  if (!account || account.clientId !== clientId) {
    return NextResponse.json({ error: 'Account not found for this client' }, { status: 404 })
  }

  const platform = account.platform as Platform
  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  try {
    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse column mapping if provided
    let columnMapping: ColumnMapping | undefined
    if (columnMappingStr) {
      try {
        columnMapping = JSON.parse(columnMappingStr) as ColumnMapping
      } catch {
        // Ignore invalid JSON
      }
    }

    // Parse Excel
    const { rows, headers, sheets } = await parseExcel(
      buffer,
      platform,
      sheetName || undefined,
      columnMapping
    )

    // Check if this is a preview request
    const { searchParams } = new URL(req.url)
    if (searchParams.get('preview') === 'true') {
      return NextResponse.json({
        headers,
        sheets,
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

    // Import data (use sanitized filename for security)
    const result = await importMetrics(
      accountId,
      rows,
      'EXCEL_IMPORT',
      user.id,
      clientId,
      platform,
      fileValidation.sanitizedFilename || file.name
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error importing Excel:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import Excel data' },
      { status: 500 }
    )
  }
})
