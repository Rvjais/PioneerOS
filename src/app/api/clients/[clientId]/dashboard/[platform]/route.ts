import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { getPlatformDashboard, exportDashboard } from '@/server/reporting/dashboard-data'
import { getDateRange, DateRangePreset } from '@/server/reporting/metrics-aggregator'
import { PLATFORMS, Platform } from '@/server/reporting/platform-accounts'

// GET - Get platform-specific dashboard data
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
  const preset = (searchParams.get('preset') || '30d') as DateRangePreset
  const customFrom = searchParams.get('from')
  const customTo = searchParams.get('to')
  const accountId = searchParams.get('accountId') || undefined
  const exportFormat = searchParams.get('export') as 'csv' | 'excel' | 'json' | null

  try {
    // If export requested, return file
    if (exportFormat) {
      const dateRange = getDateRange(
        preset,
        customFrom ? new Date(customFrom) : undefined,
        customTo ? new Date(customTo) : undefined
      )

      const { data, filename, contentType } = await exportDashboard(
        clientId,
        platform,
        dateRange,
        exportFormat
      )

      return new NextResponse(data as string, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // Return dashboard data
    const dashboard = await getPlatformDashboard(
      clientId,
      platform,
      preset,
      customFrom ? new Date(customFrom) : undefined,
      customTo ? new Date(customTo) : undefined,
      accountId
    )

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching platform dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
})
