import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import {
  mergeMyZenAndBiometric,
  type ParsedAttendanceRecord,
  type MergedAttendanceRecord
} from '@/server/ai/attendanceParser'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const mergeSchema = z.object({
  myzenBatchId: z.string().optional(),
  biometricBatchId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// POST - Merge MyZen + Biometric data for final attendance
export const POST = withAuth(async (req, { user, params }) => {
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

    const raw = await req.json()
    const parsed = mergeSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { myzenBatchId, biometricBatchId, startDate, endDate } = parsed.data

    // Build the date range
    const dateRange = {
      gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      lte: endDate ? new Date(endDate) : new Date()
    }

    // Get MyZen records
    let myzenRecords: ParsedAttendanceRecord[] = []
    if (myzenBatchId) {
      const myzenBatch = await prisma.attendanceImport.findUnique({
        where: { id: myzenBatchId },
      })
      if (myzenBatch?.parsedData) {
        // Parse the JSON string
        const parsedData = safeJsonParse<ParsedAttendanceRecord[]>(myzenBatch.parsedData, [])
        myzenRecords = parsedData.map(r => ({
          ...r,
          date: new Date(r.date)
        }))
      }
    } else {
      // Get from attendance table - MyZen records are those without biometric punch
      const myzenAttendance = await prisma.attendance.findMany({
        where: {
          date: dateRange,
          biometricPunch: false,
          myZenHours: { gt: 0 }
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, empId: true }
          }
        }
      })
      myzenRecords = myzenAttendance.map(a => ({
        employeeName: `${a.user.firstName} ${a.user.lastName || ''}`.trim(),
        employeeId: a.user.empId,
        matchedUserId: a.userId,
        matchConfidence: 1,
        date: a.date,
        checkIn: a.checkIn?.toTimeString().slice(0, 5),
        checkOut: a.checkOut?.toTimeString().slice(0, 5),
        totalHours: a.myZenHours,
        status: a.status as ParsedAttendanceRecord['status'],
        isLate: a.huddleLate,
        rawLine: ''
      }))
    }

    // Get Biometric records
    let biometricRecords: ParsedAttendanceRecord[] = []
    if (biometricBatchId) {
      const biometricBatch = await prisma.attendanceImport.findUnique({
        where: { id: biometricBatchId },
      })
      if (biometricBatch?.parsedData) {
        // Parse the JSON string
        const parsedData = safeJsonParse<ParsedAttendanceRecord[]>(biometricBatch.parsedData, [])
        biometricRecords = parsedData.map(r => ({
          ...r,
          date: new Date(r.date)
        }))
      }
    } else {
      // Get from attendance table - biometric records have biometricPunch = true
      const biometricAttendance = await prisma.attendance.findMany({
        where: {
          date: dateRange,
          biometricPunch: true
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, empId: true }
          }
        }
      })
      biometricRecords = biometricAttendance.map(a => ({
        employeeName: `${a.user.firstName} ${a.user.lastName || ''}`.trim(),
        employeeId: a.user.empId,
        matchedUserId: a.userId,
        matchConfidence: 1,
        date: a.date,
        checkIn: a.checkIn?.toTimeString().slice(0, 5),
        checkOut: a.checkOut?.toTimeString().slice(0, 5),
        totalHours: a.myZenHours,
        status: a.status as ParsedAttendanceRecord['status'],
        isLate: a.huddleLate,
        rawLine: ''
      }))
    }

    // #90 Duplicate check: remove duplicate records (same user + same date)
    // before merging, keeping the latest entry for each user+date pair.
    const deduplicateRecords = (records: ParsedAttendanceRecord[]): ParsedAttendanceRecord[] => {
      const seen = new Map<string, ParsedAttendanceRecord>()
      for (const record of records) {
        const dateStr = new Date(record.date).toISOString().split('T')[0]
        const key = `${record.matchedUserId || record.employeeId}_${dateStr}`
        // Later records overwrite earlier ones (last-write-wins)
        seen.set(key, record)
      }
      return Array.from(seen.values())
    }

    myzenRecords = deduplicateRecords(myzenRecords)
    biometricRecords = deduplicateRecords(biometricRecords)

    // Merge the records
    const merged = mergeMyZenAndBiometric(myzenRecords, biometricRecords)

    // Get employee details for merged records
    const userIds = [...new Set(merged.map(r => r.matchedUserId).filter(Boolean))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] }, deletedAt: null },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        department: true
      }
    })
    const userMap = new Map(users.map(u => [u.id, u]))

    // Calculate summary
    const summary = {
      totalRecords: merged.length,
      office: merged.filter(r => r.finalStatus === 'OFFICE').length,
      wfh: merged.filter(r => r.finalStatus === 'WFH').length,
      absent: merged.filter(r => r.finalStatus === 'ABSENT').length,
      discrepancy: merged.filter(r => r.finalStatus === 'DISCREPANCY').length,
      totalDeductions: merged.reduce((sum, r) => sum + r.deductions.total, 0)
    }

    // Group by employee for analysis
    const byEmployee: Record<string, {
      user: typeof users[0]
      records: MergedAttendanceRecord[]
      stats: {
        officeDays: number
        wfhDays: number
        absentDays: number
        discrepancyDays: number
        lateDays: number
        totalDeductions: number
      }
    }> = {}

    for (const record of merged) {
      if (!record.matchedUserId) continue
      const userId = record.matchedUserId
      const userData = userMap.get(userId)
      if (!userData) continue

      if (!byEmployee[userId]) {
        byEmployee[userId] = {
          user: userData,
          records: [],
          stats: {
            officeDays: 0,
            wfhDays: 0,
            absentDays: 0,
            discrepancyDays: 0,
            lateDays: 0,
            totalDeductions: 0
          }
        }
      }

      byEmployee[userId].records.push(record)

      const stats = byEmployee[userId].stats
      if (record.finalStatus === 'OFFICE') stats.officeDays++
      if (record.finalStatus === 'WFH') stats.wfhDays++
      if (record.finalStatus === 'ABSENT') stats.absentDays++
      if (record.finalStatus === 'DISCREPANCY') stats.discrepancyDays++
      if (record.isLate) stats.lateDays++
      stats.totalDeductions += record.deductions.total
    }

    return NextResponse.json({
      success: true,
      dateRange: {
        start: dateRange.gte.toISOString(),
        end: dateRange.lte.toISOString()
      },
      summary,
      byEmployee: Object.values(byEmployee).map(e => ({
        user: e.user,
        stats: e.stats,
        records: e.records.map(r => ({
          ...r,
          date: r.date.toISOString()
        }))
      })),
      mergedRecords: merged.map(r => ({
        ...r,
        date: r.date.toISOString(),
        user: userMap.get(r.matchedUserId || '')
      }))
    })
  } catch (error) {
    console.error('Failed to merge attendance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
