import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { checkClientAccess } from '@/server/services/clientAccess'
import { getImportBatches, deleteImportBatch } from '@/server/reporting/data-import'
import { Platform, PLATFORMS } from '@/server/reporting/platform-accounts'

// GET - List import batches for a client
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
  const platform = searchParams.get('platform') as Platform | null
  const limitStr = searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : 50

  try {
    const batches = await getImportBatches(clientId, {
      platform: platform && PLATFORMS.includes(platform) ? platform : undefined,
      limit,
    })

    return NextResponse.json({ batches })
  } catch (error) {
    console.error('Error fetching import batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch import batches' },
      { status: 500 }
    )
  }
})

// DELETE - Delete an import batch and its data
export const DELETE = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  // Check authorization
  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json(
      { error: 'You do not have permission to delete import batches' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')

  if (!batchId) {
    return NextResponse.json({ error: 'Batch ID required' }, { status: 400 })
  }

  try {
    const result = await deleteImportBatch(batchId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting import batch:', error)
    return NextResponse.json(
      { error: 'Failed to delete import batch' },
      { status: 500 }
    )
  }
})
