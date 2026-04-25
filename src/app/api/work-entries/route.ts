import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { ADMIN_ROLES } from '@/shared/constants/roles'
import { z } from 'zod'
import { validateBody, validationError, idSchema, urlSchema, descriptionSchema, notesSchema } from '@/shared/validation/validation'
import { withAuth } from '@/server/auth/withAuth'

// Schema for creating work entry
const createWorkEntrySchema = z.object({
  clientId: idSchema.optional(),
  date: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ).refine(
    (val) => {
      const entryDate = new Date(val)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return entryDate < tomorrow
    },
    { message: 'Date cannot be in the future' }
  ).optional(),
  category: z.string().min(1, 'Category required'),
  deliverableType: z.string().min(1, 'Deliverable type required'),
  quantity: z.number().int().positive().optional().default(1),
  metrics: z.record(z.string(), z.unknown()).optional(),
  resultSummary: z.string().max(1000).optional(),
  resultMetrics: z.record(z.string(), z.unknown()).optional(),
  hoursSpent: z.number().min(0).max(24).optional(),
  description: descriptionSchema,
  notes: notesSchema,
  qualityScore: z.number().min(1).max(10).optional(),
  revisionCount: z.number().int().min(0).optional(),
  turnaroundHours: z.number().min(0).optional(),
  deliverableUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
})

// Helper to extract year, month, week from date
function extractDateParts(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 1-12

  // ISO week number
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7)

  return { year, month, week }
}

// GET: Fetch work entries with filtering and aggregation
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)

    // Filter params
    const userId = searchParams.get('userId') || user.id
    const clientId = searchParams.get('clientId')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    // Date range params
    const date = searchParams.get('date') // Single date (daily view)
    const rawYear = parseInt(searchParams.get('year') || '') || 0
    const rawMonth = parseInt(searchParams.get('month') || '') || 0
    const rawQuarter = parseInt(searchParams.get('quarter') || '') || 0
    const year = (rawYear >= 2000 && rawYear <= 2100) ? rawYear : undefined
    const month = (rawMonth >= 1 && rawMonth <= 12) ? rawMonth : undefined
    const quarter = (rawQuarter >= 1 && rawQuarter <= 4) ? rawQuarter : undefined

    // Aggregation mode
    const view = searchParams.get('view') || 'list' // list, daily, monthly, quarterly

    // Build where clause
    const where: Record<string, unknown> = {}

    // Only managers/admins can view other users' entries
    if (userId !== user.id && !ADMIN_ROLES.includes(user.role)) {
      where.userId = user.id
    } else {
      where.userId = userId
    }

    if (clientId) where.clientId = clientId
    if (category) where.category = category
    if (status) where.status = status

    // Date filtering
    if (date) {
      const targetDate = new Date(date)
      targetDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      where.date = { gte: targetDate, lt: nextDay }
    } else if (year && month) {
      where.year = year
      where.month = month
    } else if (year && quarter) {
      const startMonth = (quarter - 1) * 3 + 1
      where.year = year
      where.month = { gte: startMonth, lte: startMonth + 2 }
    } else if (year) {
      where.year = year
    }

    // Fetch entries
    const entries = await prisma.workEntry.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        files: true,
      },
      orderBy: { date: 'desc' },
      take: 500,
    })

    // Aggregation for different views
    if (view === 'monthly') {
      // Group by client and category
      const aggregated = entries.reduce((acc, entry) => {
        const key = `${entry.clientId || 'internal'}_${entry.category}`
        if (!acc[key]) {
          acc[key] = {
            clientId: entry.clientId,
            clientName: entry.client?.name || 'Internal',
            category: entry.category,
            totalQuantity: 0,
            totalHours: 0,
            entries: [],
            metrics: {},
          }
        }
        acc[key].totalQuantity += entry.quantity
        acc[key].totalHours += entry.hoursSpent || 0
        acc[key].entries.push(entry)

        // Aggregate metrics
        if (entry.metrics) {
          try {
            const m = JSON.parse(entry.metrics)
            for (const [k, v] of Object.entries(m)) {
              if (typeof v === 'number') {
                acc[key].metrics[k] = (acc[key].metrics[k] || 0) + v
              }
            }
          } catch {}
        }

        return acc
      }, {} as Record<string, { clientId: string | null; clientName: string; category: string; totalQuantity: number; totalHours: number; entries: typeof entries; metrics: Record<string, number> }>)

      return NextResponse.json({
        view: 'monthly',
        year,
        month,
        summary: Object.values(aggregated),
        totalEntries: entries.length,
      })
    }

    if (view === 'quarterly') {
      // Group by department/category with totals
      const byCategory = entries.reduce((acc, entry) => {
        if (!acc[entry.category]) {
          acc[entry.category] = { totalQuantity: 0, totalHours: 0, clients: new Set() }
        }
        acc[entry.category].totalQuantity += entry.quantity
        acc[entry.category].totalHours += entry.hoursSpent || 0
        if (entry.clientId) acc[entry.category].clients.add(entry.clientId)
        return acc
      }, {} as Record<string, { totalQuantity: number; totalHours: number; clients: Set<string> }>)

      return NextResponse.json({
        view: 'quarterly',
        year,
        quarter,
        byCategory: Object.entries(byCategory).map(([cat, data]) => ({
          category: cat,
          totalQuantity: data.totalQuantity,
          totalHours: data.totalHours,
          clientCount: data.clients.size,
        })),
        totalEntries: entries.length,
      })
    }

    // Default list view
    return NextResponse.json({
      view: 'list',
      entries,
      count: entries.length,
    })
  } catch (error) {
    console.error('Error fetching work entries:', error)
    return NextResponse.json({ error: 'Failed to fetch work entries' }, { status: 500 })
  }
})

// POST: Create a new work entry
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Validate request body
    const validation = await validateBody(req, createWorkEntrySchema)
    if (!validation.success) {
      return validationError(validation.error)
    }

    // Rate limiting: max 20 work entries per user per minute
    const recentCount = await prisma.workEntry.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 60000) } },
    })
    if (recentCount > 20) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    const {
      clientId,
      date,
      category,
      deliverableType,
      quantity,
      metrics,
      resultSummary,
      resultMetrics,
      hoursSpent,
      description,
      notes,
      qualityScore,
      revisionCount,
      turnaroundHours,
      deliverableUrl,
    } = validation.data

    // Parse date and extract parts
    const entryDate = date ? new Date(date) : new Date()
    entryDate.setHours(12, 0, 0, 0) // Normalize to noon

    const { year, month, week } = extractDateParts(entryDate)

    // Create work entry
    const entry = await prisma.workEntry.create({
      data: {
        userId: user.id,
        clientId: clientId || null,
        date: entryDate,
        year,
        month,
        week,
        category,
        deliverableType,
        quantity,
        metrics: metrics ? JSON.stringify(metrics) : null,
        resultSummary,
        resultMetrics: resultMetrics ? JSON.stringify(resultMetrics) : null,
        hoursSpent,
        description,
        notes,
        // Design/Creative-specific KPIs
        qualityScore: qualityScore || null,
        revisionCount: revisionCount || 0,
        turnaroundHours: turnaroundHours || null,
        deliverableUrl: deliverableUrl || null,
        status: 'DRAFT',
      },
      include: {
        client: { select: { id: true, name: true } },
        files: true,
      },
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error creating work entry:', error)
    return NextResponse.json({ error: 'Failed to create work entry' }, { status: 500 })
  }
})
