import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { z } from 'zod'
import { addManualEntry } from '@/server/reporting/data-import'
import { getAccount, PLATFORMS, Platform, PLATFORM_CONFIG } from '@/server/reporting/platform-accounts'

// Validation schema for manual entry
const manualEntrySchema = z.object({
  accountId: z.string().min(1),
  date: z.string().transform((val) => new Date(val)),
  metrics: z.array(
    z.object({
      metricType: z.string().min(1),
      value: z.number(),
      dimension: z.string().optional(),
      dimensionValue: z.string().optional(),
    })
  ).min(1),
})

// POST - Manual data entry
export const POST = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json(
      { error: 'You do not have permission to add data for this client' },
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

  const validation = manualEntrySchema.safeParse(body)
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

  // Validate metric types
  const validMetrics = PLATFORM_CONFIG[platform].metrics
  const invalidMetrics = validation.data.metrics.filter(
    (m) => !validMetrics.includes(m.metricType)
  )

  if (invalidMetrics.length > 0) {
    return NextResponse.json(
      {
        error: 'Invalid metric types',
        details: {
          invalidMetrics: invalidMetrics.map((m) => m.metricType),
          validMetrics,
        },
      },
      { status: 400 }
    )
  }

  try {
    const result = await addManualEntry(
      validation.data.accountId,
      validation.data.date,
      validation.data.metrics,
      user.id,
      clientId,
      platform
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error adding manual entry:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add manual entry' },
      { status: 500 }
    )
  }
})
