import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// Helper functions
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getQuarter(date: Date): string {
  const q = Math.floor(date.getMonth() / 3) + 1
  return `Q${q}-${date.getFullYear()}`
}

function getPreviousQuarter(date: Date): string {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month < 3) {
    return `Q4-${year - 1}`
  }
  const q = Math.floor(month / 3)
  return `Q${q}-${year}`
}

function isFirstWeekOfQuarter(date: Date): boolean {
  const month = date.getMonth()
  const day = date.getDate()
  return (month % 3 === 0) && day <= 7
}

// GET - Check meeting compliance status
export const GET = withAuth(async (req, { user, params }) => {
  try {
const now = new Date()
    const today = startOfDay(now)
    const currentMonth = startOfMonth(now)
    const dayOfMonth = now.getDate()

    const result: {
      allowed: boolean
      redirect?: string
      reason?: string
      message?: string
      compliance: {
        daily: { filled: boolean; isLate: boolean }
        tactical: { required: boolean; filled: boolean; deadline: string }
        strategic: { required: boolean; filled: boolean; deadline: string }
      }
    } = {
      allowed: true,
      compliance: {
        daily: { filled: false, isLate: false },
        tactical: { required: false, filled: false, deadline: '' },
        strategic: { required: false, filled: false, deadline: '' }
      }
    }

    // 1. Check Daily Meeting
    const dailyMeeting = await prisma.dailyMeeting.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today
        }
      }
    })

    result.compliance.daily.filled = !!dailyMeeting
    result.compliance.daily.isLate = now.getHours() >= 11

    if (!dailyMeeting) {
      result.allowed = false
      result.redirect = '/meetings/daily'
      result.reason = 'daily_meeting_required'
      result.message = 'Please complete your daily check-in to continue'
      return NextResponse.json(result)
    }

    // 2. Check Tactical Meeting (after 5th of month)
    if (dayOfMonth >= 5) {
      result.compliance.tactical.required = true
      result.compliance.tactical.deadline = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-07`

      const tacticalMeeting = await prisma.tacticalMeeting.findFirst({
        where: {
          userId: user.id,
          month: currentMonth,
          status: { in: ['SUBMITTED', 'REVIEWED', 'APPROVED'] }
        }
      })

      result.compliance.tactical.filled = !!tacticalMeeting

      // Block access after 7th if not filled
      if (dayOfMonth >= 7 && !tacticalMeeting) {
        result.allowed = false
        result.redirect = '/meetings/tactical'
        result.reason = 'tactical_meeting_required'
        result.message = 'Please complete your monthly tactical report to continue'
        return NextResponse.json(result)
      }
    }

    // 3. Check Strategic Meeting (first week of quarter)
    if (isFirstWeekOfQuarter(now)) {
      result.compliance.strategic.required = true
      const previousQuarter = getPreviousQuarter(now)
      result.compliance.strategic.deadline = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-07`

      const strategicMeeting = await prisma.strategicMeeting.findFirst({
        where: {
          quarter: parseInt(previousQuarter.split('-')[0].replace('Q', '')),
          year: parseInt(previousQuarter.split('-')[1]),
          // Check if user has submitted their review (has overall rating means completed)
          peerReviews: {
            some: {
              reviewerId: user.id,
              overallRating: { not: null }
            }
          }
        }
      })

      result.compliance.strategic.filled = !!strategicMeeting

      // Block access after 7th of quarter start if not filled
      if (dayOfMonth >= 7 && !strategicMeeting) {
        // For now, we'll just warn, not block for strategic
        // result.allowed = false
        // result.redirect = '/meetings/strategic'
        // result.reason = 'strategic_meeting_required'
        // result.message = 'Please complete your quarterly strategic review to continue'
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to check meeting compliance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
