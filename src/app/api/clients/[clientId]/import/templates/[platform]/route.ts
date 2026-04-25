import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { getCSVTemplate, getExcelTemplate } from '@/server/reporting/data-import'
import { PLATFORMS, Platform, PLATFORM_CONFIG } from '@/server/reporting/platform-accounts'

// GET - Download import template for a platform
export const GET = withAuth(async (req: NextRequest, { user, params }) => {
  const { clientId, platform: platformParam } = params || {}
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  // Validate platform
  const platform = platformParam as Platform
  if (!platform || !PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: 'Invalid platform', validPlatforms: PLATFORMS },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') || 'csv'

  try {
    const platformConfig = PLATFORM_CONFIG[platform]
    const fileName = `${platformConfig.shortName.toLowerCase()}_import_template`

    if (format === 'excel' || format === 'xlsx') {
      const buffer = getExcelTemplate(platform)

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
        },
      })
    }

    // Default to CSV
    const csv = getCSVTemplate(platform)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
})
