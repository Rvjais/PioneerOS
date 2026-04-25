// POST /api/integrations/sync - Trigger manual sync for a connection
import { NextRequest, NextResponse } from 'next/server'
import { syncConnectionMetrics, getClientMetrics, getClientMetricsSummary } from '@/server/integrations/sync-service'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// POST - Trigger sync
export const POST = withAuth(async (req, { user, params }) => {
  try {
const body = await req.json()
    const schema = z.object({
      connectionId: z.string().min(1).optional(),
      clientId: z.string().min(1).optional(),
      daysBack: z.number().int().min(1).max(365).optional().default(30),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { connectionId, clientId, daysBack } = result.data

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    if (connectionId) {
      // Sync specific connection
      const result = await syncConnectionMetrics(connectionId, startDate, endDate)
      return NextResponse.json(result)
    } else if (clientId) {
      // Sync all connections for a client
      const connections = await prisma.clientOAuthConnection.findMany({
        where: { clientId, status: 'ACTIVE' },
      })

      const results: Array<{
        connectionId: string
        platform: string
        success: boolean
        recordsProcessed: number
        recordsFailed: number
        errors?: string[]
      }> = []

      for (const conn of connections) {
        const result = await syncConnectionMetrics(conn.id, startDate, endDate)
        results.push({
          connectionId: conn.id,
          platform: conn.platform,
          ...result,
        })
      }

      return NextResponse.json({
        success: results.every(r => r.success),
        results,
      })
    } else {
      return NextResponse.json(
        { error: 'connectionId or clientId is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Sync failed:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})

// GET - Get metrics for a client
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')
    const type = searchParams.get('type') || 'detailed' // 'detailed' or 'summary'
    const daysBack = parseInt(searchParams.get('daysBack') || '30')
    const month = searchParams.get('month') // YYYY-MM for summary

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    if (type === 'summary' && month) {
      const [year, monthNum] = month.split('-').map(Number)
      const summary = await getClientMetricsSummary(clientId, new Date(year, monthNum - 1, 1))
      return NextResponse.json({ summary })
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const metrics = await getClientMetrics(clientId, startDate, endDate)
    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Failed to get metrics:', error)
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
})
