import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { getOverview } from '@/server/reporting/dashboard-data'
import { DateRangePreset } from '@/server/reporting/metrics-aggregator'

// GET - Get overview dashboard data
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json({ error: 'Access denied to this client' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const preset = (searchParams.get('preset') || '30d') as DateRangePreset
  const customFrom = searchParams.get('from')
  const customTo = searchParams.get('to')

  try {
    const dashboard = await getOverview(
      clientId,
      preset,
      customFrom ? new Date(customFrom) : undefined,
      customTo ? new Date(customTo) : undefined
    )

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching overview dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
})
