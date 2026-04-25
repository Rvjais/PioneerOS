import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import {
  parseAndMatchAttendance,
  validateAttendanceText,
  type AttendanceSource
} from '@/server/ai/attendanceParser'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const attendanceImportSchema = z.object({
  source: z.enum(['MYZEN', 'BIOMETRIC']),
  rawData: z.string().min(1),
})

// POST - Create import batch and parse data
export const POST = withAuth(async (req, { user, params }) => {
  try {
// Check if user is HR or Admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true },
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = attendanceImportSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { source, rawData } = parsed.data

    // Validate the text
    const validation = validateAttendanceText(rawData)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    // Create import batch first
    const importBatch = await prisma.attendanceImport.create({
      data: {
        source,
        rawData,
        status: 'PROCESSING',
        importedBy: user.id,
      }
    })

    // Parse and match the data
    const parseResult = await parseAndMatchAttendance(rawData, source)

    // Update batch with parsed data (JSON stringified since SQLite doesn't support JSON type)
    await prisma.attendanceImport.update({
      where: { id: importBatch.id },
      data: {
        parsedData: JSON.stringify(parseResult.records.map(r => ({
          ...r,
          date: r.date.toISOString(),
        }))),
        recordCount: parseResult.records.length,
        status: parseResult.success ? 'PENDING' : 'FAILED',
        errorMessage: parseResult.errors.length > 0 ? parseResult.errors.join('; ') : null,
      }
    })

    return NextResponse.json({
      success: parseResult.success,
      batchId: importBatch.id,
      records: parseResult.records.map(r => ({
        ...r,
        date: r.date.toISOString(),
      })),
      summary: parseResult.summary,
      warnings: parseResult.warnings,
      errors: parseResult.errors,
    })
  } catch (error) {
    console.error('Failed to create attendance import:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// GET - List recent import batches
export const GET = withAuth(async (req, { user, params }) => {
  try {
// Check if user is HR or Admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true, department: true },
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const batches = await prisma.attendanceImport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        importedByUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: { records: true }
        }
      }
    })

    return NextResponse.json({
      batches: batches.map(b => ({
        id: b.id,
        source: b.source,
        recordCount: b.recordCount,
        savedCount: b._count.records,
        status: b.status,
        importedBy: `${b.importedByUser.firstName} ${b.importedByUser.lastName || ''}`.trim(),
        createdAt: b.createdAt.toISOString(),
        errorMessage: b.errorMessage,
      }))
    })
  } catch (error) {
    console.error('Failed to list import batches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
