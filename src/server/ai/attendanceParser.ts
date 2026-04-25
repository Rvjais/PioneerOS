/**
 * Attendance Data Parser
 *
 * Parses attendance data from pasted text (from MyZen or Biometric systems)
 * Supports multiple formats:
 * - Tab-separated (Excel copy)
 * - Comma-separated (CSV)
 * - Space-separated (PDF copy)
 * - Common attendance report formats
 */

import { prisma } from '@/server/db/prisma'

export type AttendanceSource = 'MYZEN' | 'BIOMETRIC'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'WFH' | 'LEAVE'

export interface ParsedAttendanceRecord {
  employeeName: string
  employeeId?: string      // BP-XXX if found
  matchedUserId?: string   // Matched from database
  matchConfidence: number  // 0-1
  date: Date
  checkIn?: string         // HH:MM format
  checkOut?: string
  totalHours?: number
  status: AttendanceStatus
  isLate?: boolean         // Check-in after 11:05
  rawLine: string          // Original text for debugging
}

export interface MergedAttendanceRecord extends ParsedAttendanceRecord {
  myZenActive: boolean
  biometricPresent: boolean
  finalStatus: 'OFFICE' | 'WFH' | 'ABSENT' | 'DISCREPANCY'
  deductions: {
    lateArrival: number
    earlyDeparture: number
    shortHours: number
    absence: number
    total: number
  }
}

export interface AttendanceParseResult {
  success: boolean
  records: ParsedAttendanceRecord[]
  summary: {
    totalRecords: number
    matched: number
    unmatched: number
    present: number
    absent: number
    wfh: number
    late: number
  }
  warnings: string[]
  errors: string[]
}

// Common date formats in attendance reports
const DATE_FORMATS = [
  /(\d{2})[-\/](\d{2})[-\/](\d{4})/,      // DD-MM-YYYY or DD/MM/YYYY
  /(\d{2})[-\/](\d{2})[-\/](\d{2})/,      // DD-MM-YY or DD/MM/YY
  /(\d{4})[-\/](\d{2})[-\/](\d{2})/,      // YYYY-MM-DD
  /(\d{2})-([A-Za-z]{3})-(\d{4})/,        // DD-MMM-YYYY (e.g., 15-Jan-2024)
  /(\d{2})-([A-Za-z]{3})-(\d{2})/,        // DD-MMM-YY
]

const MONTH_MAP: Record<string, number> = {
  'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
  'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
}

// Time formats
const TIME_FORMATS = [
  /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i,  // HH:MM, HH:MM:SS, HH:MM AM/PM
  /(\d{1,2})\.(\d{2})(?:\.(\d{2}))?\s*(AM|PM)?/i, // HH.MM format
]

// Status keywords
const STATUS_KEYWORDS: Record<string, AttendanceStatus> = {
  'present': 'PRESENT',
  'p': 'PRESENT',
  'pr': 'PRESENT',
  'absent': 'ABSENT',
  'a': 'ABSENT',
  'ab': 'ABSENT',
  'half day': 'HALF_DAY',
  'half-day': 'HALF_DAY',
  'hd': 'HALF_DAY',
  'halfday': 'HALF_DAY',
  'wfh': 'WFH',
  'work from home': 'WFH',
  'remote': 'WFH',
  'leave': 'LEAVE',
  'l': 'LEAVE',
  'on leave': 'LEAVE',
  'cl': 'LEAVE',
  'pl': 'LEAVE',
  'sl': 'LEAVE',
}

// Late threshold (11:05 AM)
const LATE_THRESHOLD_MINUTES = 11 * 60 + 5 // 665 minutes from midnight

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  const cleaned = dateStr.trim()

  for (const format of DATE_FORMATS) {
    const match = cleaned.match(format)
    if (match) {
      let day: number, month: number, year: number

      if (format.source.includes('[A-Za-z]')) {
        // Month name format
        day = parseInt(match[1])
        month = MONTH_MAP[match[2].toLowerCase()] ?? 0
        year = parseInt(match[3])
        if (year < 100) year += 2000
      } else if (match[1].length === 4) {
        // YYYY-MM-DD
        year = parseInt(match[1])
        month = parseInt(match[2]) - 1
        day = parseInt(match[3])
      } else {
        // DD-MM-YYYY or DD-MM-YY
        day = parseInt(match[1])
        month = parseInt(match[2]) - 1
        year = parseInt(match[3])
        if (year < 100) year += 2000
      }

      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  return null
}

/**
 * Parse time from string and return HH:MM format
 */
function parseTime(timeStr: string): string | null {
  if (!timeStr) return null
  const cleaned = timeStr.trim()

  for (const format of TIME_FORMATS) {
    const match = cleaned.match(format)
    if (match) {
      let hours = parseInt(match[1])
      const minutes = parseInt(match[2])
      const ampm = match[4]?.toUpperCase()

      // Handle AM/PM
      if (ampm === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
  }

  return null
}

/**
 * Check if check-in time is late (after 11:05 AM)
 */
function isLateCheckIn(checkInTime: string | undefined): boolean {
  if (!checkInTime) return false

  const [hours, minutes] = checkInTime.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return false
  const totalMinutes = hours * 60 + minutes
  return totalMinutes > LATE_THRESHOLD_MINUTES
}

/**
 * Parse total hours from string
 */
function parseHours(hoursStr: string): number | undefined {
  if (!hoursStr) return undefined

  // Handle formats like "8h 30m", "8:30", "8.5"
  const cleaned = hoursStr.trim().toLowerCase()

  // Format: "8h 30m" or "8 hrs 30 mins"
  const hmsMatch = cleaned.match(/(\d+)\s*h(?:rs?)?\s*(?:(\d+)\s*m(?:ins?)?)?/i)
  if (hmsMatch) {
    const hours = parseInt(hmsMatch[1])
    const mins = hmsMatch[2] ? parseInt(hmsMatch[2]) : 0
    return hours + mins / 60
  }

  // Format: "8:30"
  const colonMatch = cleaned.match(/^(\d+):(\d+)$/)
  if (colonMatch) {
    return parseInt(colonMatch[1]) + parseInt(colonMatch[2]) / 60
  }

  // Format: "8.5" or just "8"
  const numMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)?$/)
  if (numMatch) {
    return parseFloat(numMatch[1])
  }

  return undefined
}

/**
 * Detect status from text
 */
function detectStatus(text: string): AttendanceStatus {
  const lower = text.toLowerCase().trim()

  for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
    if (lower === keyword || lower.includes(keyword)) {
      return status
    }
  }

  // Default based on context
  return 'PRESENT'
}

/**
 * Detect the format of attendance data
 */
export function detectAttendanceFormat(text: string): 'CSV' | 'TAB_SEPARATED' | 'SPACE_SEPARATED' | 'UNKNOWN' {
  const lines = text.split('\n').filter(l => l.trim().length > 0)

  if (lines.length < 2) return 'UNKNOWN'

  const firstDataLines = lines.slice(0, 5)

  // Check for tabs
  const hasTabs = firstDataLines.some(l => l.includes('\t'))
  if (hasTabs) return 'TAB_SEPARATED'

  // Check for commas (but not in names)
  const hasCSV = firstDataLines.some(l => {
    const commaCount = (l.match(/,/g) || []).length
    return commaCount >= 2
  })
  if (hasCSV) return 'CSV'

  // Check for multiple spaces
  const hasSpaces = firstDataLines.some(l => /\s{2,}/.test(l))
  if (hasSpaces) return 'SPACE_SEPARATED'

  return 'UNKNOWN'
}

/**
 * Extract employee ID (BP-XXX pattern)
 */
function extractEmployeeId(text: string): string | undefined {
  const match = text.match(/BP-?\d{3,4}/i)
  return match ? match[0].toUpperCase() : undefined
}

/**
 * Parse attendance text from MyZen or Biometric systems
 */
export function parseAttendanceText(
  rawText: string,
  source: AttendanceSource
): ParsedAttendanceRecord[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const records: ParsedAttendanceRecord[] = []

  // Detect format
  const format = detectAttendanceFormat(rawText)

  for (const line of lines) {
    try {
      // Skip header-like lines
      const lowerLine = line.toLowerCase()
      if (
        lowerLine.includes('employee') && lowerLine.includes('date') ||
        lowerLine.includes('name') && lowerLine.includes('time') ||
        lowerLine.includes('s.no') || lowerLine.includes('sl.no') ||
        lowerLine.includes('total') && lowerLine.includes('hours')
      ) {
        continue
      }

      // Split line based on format
      let columns: string[]
      if (format === 'TAB_SEPARATED') {
        columns = line.split('\t').map(c => c.trim())
      } else if (format === 'CSV') {
        columns = line.match(/(".*?"|[^,]+)/g)?.map(c => c.replace(/"/g, '').trim()) || []
      } else {
        columns = line.split(/\s{2,}/).map(c => c.trim())
      }

      if (columns.length < 2) continue

      // Try to identify columns
      let employeeName = ''
      let employeeId: string | undefined
      let date: Date | null = null
      let checkIn: string | undefined
      let checkOut: string | undefined
      let totalHours: number | undefined
      let status: AttendanceStatus = 'PRESENT'

      // Look for employee ID first
      for (const col of columns) {
        const id = extractEmployeeId(col)
        if (id) {
          employeeId = id
          break
        }
      }

      // Parse columns based on source type
      if (source === 'MYZEN') {
        // MyZen format typically: Name | Date | Hours | Status
        // Or: Name | Date | Login Time | Logout Time | Total Hours
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i]

          // Check for date
          if (!date) {
            const parsedDate = parseDate(col)
            if (parsedDate) {
              date = parsedDate
              continue
            }
          }

          // Check for hours
          const hours = parseHours(col)
          if (hours !== undefined && hours > 0 && hours < 24) {
            totalHours = hours
            continue
          }

          // Check for time
          const time = parseTime(col)
          if (time) {
            if (!checkIn) {
              checkIn = time
            } else if (!checkOut) {
              checkOut = time
            }
            continue
          }

          // Check for status
          const detectedStatus = detectStatus(col)
          if (detectedStatus !== 'PRESENT' || col.match(/^(p|a|wfh|hd|l|present|absent|leave)$/i)) {
            status = detectedStatus
            continue
          }

          // First text column is likely the name
          if (!employeeName && col.length > 2 && !parseDate(col) && !parseTime(col)) {
            employeeName = col
          }
        }
      } else {
        // Biometric format typically: Name | Date | In Time | Out Time | Status
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i]

          // Check for date
          if (!date) {
            const parsedDate = parseDate(col)
            if (parsedDate) {
              date = parsedDate
              continue
            }
          }

          // Check for time
          const time = parseTime(col)
          if (time) {
            if (!checkIn) {
              checkIn = time
            } else if (!checkOut) {
              checkOut = time
            }
            continue
          }

          // Check for status
          const statusMatch = col.match(/^(present|absent|half.?day|wfh|leave|p|a|hd|l)$/i)
          if (statusMatch) {
            status = detectStatus(col)
            continue
          }

          // First text column is likely the name
          if (!employeeName && col.length > 2 && !parseDate(col) && !parseTime(col)) {
            employeeName = col
          }
        }
      }

      // Skip if no meaningful data
      if (!employeeName && !employeeId) continue

      // Default date to today if not found
      if (!date) {
        date = new Date()
      }

      // Calculate total hours if we have check-in and check-out
      if (!totalHours && checkIn && checkOut) {
        const [inH, inM] = checkIn.split(':').map(Number)
        const [outH, outM] = checkOut.split(':').map(Number)
        if (!isNaN(inH) && !isNaN(inM) && !isNaN(outH) && !isNaN(outM)) {
          totalHours = (outH * 60 + outM - inH * 60 - inM) / 60
          if (totalHours < 0) totalHours += 24 // Handle overnight
        }
      }

      // Determine if late
      const isLate = isLateCheckIn(checkIn)

      records.push({
        employeeName: employeeName || `Employee ${employeeId}`,
        employeeId,
        matchConfidence: 0,
        date,
        checkIn,
        checkOut,
        totalHours,
        status,
        isLate,
        rawLine: line
      })
    } catch (err) {
      console.error(`Failed to parse line: ${line}`, err)
    }
  }

  return records
}

/**
 * Match parsed records with database employees
 */
export async function matchEmployeeNames(
  records: ParsedAttendanceRecord[]
): Promise<ParsedAttendanceRecord[]> {
  // Get all active employees
  const employees = await prisma.user.findMany({
    where: { status: { in: ['ACTIVE', 'PROBATION'] } },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
    }
  })

  return records.map(record => {
    let bestMatch: typeof employees[0] | null = null
    let bestConfidence = 0

    // First try exact employee ID match
    if (record.employeeId) {
      const idMatch = employees.find(e =>
        e.empId.toLowerCase() === record.employeeId?.toLowerCase()
      )
      if (idMatch) {
        return {
          ...record,
          matchedUserId: idMatch.id,
          matchConfidence: 1.0
        }
      }
    }

    // Then try name matching
    const recordName = record.employeeName.toLowerCase().trim()

    for (const employee of employees) {
      const firstName = employee.firstName.toLowerCase()
      const lastName = employee.lastName?.toLowerCase() || ''
      const fullName = `${firstName} ${lastName}`.trim()

      let confidence = 0

      // Exact full name match
      if (recordName === fullName) {
        confidence = 0.95
      }
      // First name + last name initial
      else if (recordName === `${firstName} ${lastName.charAt(0)}` ||
               recordName === `${firstName.charAt(0)} ${lastName}`) {
        confidence = 0.85
      }
      // Just first name
      else if (recordName === firstName) {
        confidence = 0.7
      }
      // Contains first name
      else if (recordName.includes(firstName)) {
        confidence = 0.6
      }
      // Contains last name
      else if (lastName && recordName.includes(lastName)) {
        confidence = 0.5
      }
      // Fuzzy match - name starts with same letters
      else if (recordName.startsWith(firstName.substring(0, 3))) {
        confidence = 0.4
      }

      if (confidence > bestConfidence) {
        bestConfidence = confidence
        bestMatch = employee
      }
    }

    if (bestMatch && bestConfidence >= 0.4) {
      return {
        ...record,
        matchedUserId: bestMatch.id,
        matchConfidence: bestConfidence
      }
    }

    return record
  })
}

/**
 * Merge MyZen and Biometric data to determine final attendance
 */
export function mergeMyZenAndBiometric(
  myzenRecords: ParsedAttendanceRecord[],
  biometricRecords: ParsedAttendanceRecord[]
): MergedAttendanceRecord[] {
  const merged: MergedAttendanceRecord[] = []

  // Group records by user and date
  const recordMap = new Map<string, {
    myzen?: ParsedAttendanceRecord
    biometric?: ParsedAttendanceRecord
  }>()

  // Add MyZen records
  for (const record of myzenRecords) {
    if (!record.matchedUserId) continue
    const key = `${record.matchedUserId}_${record.date.toISOString().split('T')[0]}`
    const existing = recordMap.get(key) || {}
    recordMap.set(key, { ...existing, myzen: record })
  }

  // Add Biometric records
  for (const record of biometricRecords) {
    if (!record.matchedUserId) continue
    const key = `${record.matchedUserId}_${record.date.toISOString().split('T')[0]}`
    const existing = recordMap.get(key) || {}
    recordMap.set(key, { ...existing, biometric: record })
  }

  // Process each employee-date combination
  for (const [, data] of recordMap) {
    const myzen = data.myzen
    const biometric = data.biometric

    // Determine if active on each system
    const myZenActive = !!(myzen && (myzen.totalHours || 0) > 0)
    const biometricPresent = !!(biometric && biometric.status !== 'ABSENT')

    // Determine final status based on logic table
    let finalStatus: MergedAttendanceRecord['finalStatus']
    if (myZenActive && biometricPresent) {
      finalStatus = 'OFFICE'
    } else if (myZenActive && !biometricPresent) {
      finalStatus = 'WFH'
    } else if (!myZenActive && biometricPresent) {
      finalStatus = 'DISCREPANCY' // Computer inactive but physically present
    } else {
      finalStatus = 'ABSENT'
    }

    // Calculate deductions
    const deductions = {
      lateArrival: 0,
      earlyDeparture: 0,
      shortHours: 0,
      absence: 0,
      total: 0
    }

    // Late arrival deduction (biometric check-in after 11:05)
    if (biometric?.isLate) {
      deductions.lateArrival = 100
    }

    // Early departure (check-out before 6 PM = 18:00)
    if (biometric?.checkOut) {
      const [hours] = biometric.checkOut.split(':').map(Number)
      if (!isNaN(hours) && hours < 18) {
        deductions.earlyDeparture = 100
      }
    }

    // Short hours (MyZen < 8 hours)
    if (myzen?.totalHours && myzen.totalHours < 8) {
      // No specific deduction mentioned, could add if needed
    }

    // Absence deduction
    if (finalStatus === 'ABSENT') {
      deductions.absence = 500 // As per plan
    }

    deductions.total = deductions.lateArrival + deductions.earlyDeparture +
                       deductions.shortHours + deductions.absence

    // Use the more complete record as base
    const baseRecord = myzen || biometric!

    merged.push({
      ...baseRecord,
      myZenActive,
      biometricPresent,
      finalStatus,
      deductions
    })
  }

  return merged
}

/**
 * Main parsing function with employee matching
 */
export async function parseAndMatchAttendance(
  rawText: string,
  source: AttendanceSource
): Promise<AttendanceParseResult> {
  const warnings: string[] = []
  const errors: string[] = []

  try {
    // Parse the text
    const parsed = parseAttendanceText(rawText, source)

    if (parsed.length === 0) {
      return {
        success: false,
        records: [],
        summary: {
          totalRecords: 0,
          matched: 0,
          unmatched: 0,
          present: 0,
          absent: 0,
          wfh: 0,
          late: 0
        },
        warnings,
        errors: ['No attendance records could be parsed from the provided text. Please check the format.']
      }
    }

    // Match with employees
    const matched = await matchEmployeeNames(parsed)

    // Generate warnings for low-confidence matches
    for (const record of matched) {
      if (record.matchConfidence > 0 && record.matchConfidence < 0.7) {
        warnings.push(`Low confidence match for "${record.employeeName}" (${Math.round(record.matchConfidence * 100)}%)`)
      }
      if (!record.matchedUserId) {
        warnings.push(`Could not match employee: "${record.employeeName}"`)
      }
    }

    // Calculate summary
    const summary = {
      totalRecords: matched.length,
      matched: matched.filter(r => r.matchedUserId).length,
      unmatched: matched.filter(r => !r.matchedUserId).length,
      present: matched.filter(r => r.status === 'PRESENT').length,
      absent: matched.filter(r => r.status === 'ABSENT').length,
      wfh: matched.filter(r => r.status === 'WFH').length,
      late: matched.filter(r => r.isLate).length
    }

    return {
      success: true,
      records: matched,
      summary,
      warnings,
      errors
    }
  } catch (error) {
    console.error('Failed to parse attendance:', error)
    return {
      success: false,
      records: [],
      summary: {
        totalRecords: 0,
        matched: 0,
        unmatched: 0,
        present: 0,
        absent: 0,
        wfh: 0,
        late: 0
      },
      warnings,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

/**
 * Validate pasted attendance text
 */
export function validateAttendanceText(text: string): { valid: boolean; message: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, message: 'Please paste your attendance data' }
  }

  if (text.length < 20) {
    return { valid: false, message: 'The pasted text seems too short. Please paste the full attendance data.' }
  }

  const lines = text.split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 1) {
    return { valid: false, message: 'Please paste at least one attendance record.' }
  }

  // Check if any line contains a name-like pattern or date
  const hasNameOrDate = lines.some(line =>
    DATE_FORMATS.some(fmt => fmt.test(line)) ||
    /[A-Za-z]{2,}/.test(line)
  )

  if (!hasNameOrDate) {
    return { valid: false, message: 'No valid employee names or dates found in the data.' }
  }

  return { valid: true, message: 'Data looks valid' }
}
