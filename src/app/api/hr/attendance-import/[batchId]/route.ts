import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

interface RouteParams {
  params: Promise<{ batchId: string }>
}

const confirmRecordsSchema = z.object({
  records: z.array(z.object({
    matchedUserId: z.string().min(1),
    date: z.string().min(1),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    status: z.string().min(1),
    totalHours: z.number().optional(),
    isLate: z.boolean().optional(),
    rawLine: z.string().optional(),
    matchConfidence: z.number().optional(),
  })).min(1),
})

// GET - Get batch details with parsed records
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check if user is HR or Admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true },
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { batchId } = await routeParams!

    const batch = await prisma.attendanceImport.findUnique({
      where: { id: batchId },
      include: {
        importedByUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        records: {
          include: {
            user: {
              select: {
                id: true,
                empId: true,
                firstName: true,
                lastName: true,
                department: true,
              }
            }
          }
        }
      }
    })

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    // Parse the JSON string for parsedData
    let parsedDataObj = null
    if (batch.parsedData) {
      try {
        parsedDataObj = JSON.parse(batch.parsedData)
      } catch {
        parsedDataObj = null
      }
    }

    return NextResponse.json({
      id: batch.id,
      source: batch.source,
      rawData: batch.rawData,
      parsedData: parsedDataObj,
      recordCount: batch.recordCount,
      status: batch.status,
      errorMessage: batch.errorMessage,
      importedBy: `${batch.importedByUser.firstName} ${batch.importedByUser.lastName || ''}`.trim(),
      createdAt: batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt.toISOString(),
      savedRecords: batch.records.map(r => ({
        id: r.id,
        userId: r.userId,
        user: r.user,
        date: r.date.toISOString(),
        checkIn: r.checkIn?.toISOString(),
        checkOut: r.checkOut?.toISOString(),
        status: r.status,
        myZenHours: r.myZenHours,
        huddleLate: r.huddleLate,
      }))
    })
  } catch (error) {
    console.error('Failed to get import batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Confirm and save parsed records to Attendance table
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check if user is HR or Admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true },
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { batchId } = await routeParams!
    const raw = await req.json()
    const parsed = confirmRecordsSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { records } = parsed.data

    // Verify batch exists and is in correct state
    const batch = await prisma.attendanceImport.findUnique({
      where: { id: batchId },
    })

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    if (batch.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Batch already completed' }, { status: 400 })
    }

    // Filter out records without matched users
    const validRecords = records.filter(r => r.matchedUserId)

    if (validRecords.length === 0) {
      return NextResponse.json({ error: 'No valid records with matched employees' }, { status: 400 })
    }

    // Create attendance records
    const created: string[] = []
    const updated: string[] = []
    const errors: string[] = []

    for (const record of validRecords) {
      try {
        const recordDate = new Date(record.date)
        // Normalize to start of day
        recordDate.setHours(0, 0, 0, 0)

        // Check if attendance already exists for this user and date
        const existing = await prisma.attendance.findFirst({
          where: {
            userId: record.matchedUserId,
            date: {
              gte: recordDate,
              lt: new Date(recordDate.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        })

        // Parse check-in and check-out times
        let checkIn: Date | undefined
        let checkOut: Date | undefined

        if (record.checkIn) {
          const [h, m] = record.checkIn.split(':').map(Number)
          checkIn = new Date(recordDate)
          checkIn.setHours(h, m, 0, 0)
        }

        if (record.checkOut) {
          const [h, m] = record.checkOut.split(':').map(Number)
          checkOut = new Date(recordDate)
          checkOut.setHours(h, m, 0, 0)
        }

        const attendanceData = {
          userId: record.matchedUserId,
          date: recordDate,
          checkIn,
          checkOut,
          status: record.status,
          myZenHours: record.totalHours || 0,
          huddleLate: record.isLate || false,
          biometricPunch: batch.source === 'BIOMETRIC',
          importBatchId: batchId,
          sourceType: `${batch.source}_IMPORT`,
          rawSourceData: record.rawLine,
          parseConfidence: record.matchConfidence,
        }

        if (existing) {
          // Update existing record
          await prisma.attendance.update({
            where: { id: existing.id },
            data: attendanceData,
          })
          updated.push(record.matchedUserId)
        } else {
          // Create new record
          await prisma.attendance.create({
            data: attendanceData,
          })
          created.push(record.matchedUserId)
        }
      } catch (err) {
        console.error(`Failed to save record for user ${record.matchedUserId}:`, err)
        errors.push(`Failed to save record for user ${record.matchedUserId}`)
      }
    }

    // Update batch status
    await prisma.attendanceImport.update({
      where: { id: batchId },
      data: {
        status: errors.length === validRecords.length ? 'FAILED' : 'COMPLETED',
        recordCount: created.length + updated.length,
        errorMessage: errors.length > 0 ? errors.join('; ') : null,
      }
    })

    return NextResponse.json({
      success: true,
      created: created.length,
      updated: updated.length,
      errors,
    })
  } catch (error) {
    console.error('Failed to confirm import batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE - Delete an import batch
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Check if user is HR or Admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true },
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { batchId } = await routeParams!

    // Delete the batch (cascade will handle related attendance records)
    await prisma.attendanceImport.delete({
      where: { id: batchId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete import batch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
