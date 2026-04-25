import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'

export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Tactical Sheet Reminder Cron Job
 * Triggers: 3rd and 5th of every month at 10:00 AM IST
 *
 * Sends:
 * 1. Day 3: Soft reminder to all employees to submit tactical data
 * 2. Day 5: Final warning - last day to submit without penalty
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
    }
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      reminders: 0,
      warnings: 0,
      errors: [] as string[],
    }

    const today = new Date()
    const dayOfMonth = today.getDate()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    const monthName = today.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

    // Only run on 3rd and 5th of the month
    if (dayOfMonth !== 3 && dayOfMonth !== 5) {
      return NextResponse.json({
        success: true,
        message: 'Not a reminder day',
        dayOfMonth,
      })
    }

    // Get all active employees
    const employees = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        role: { in: ['EMPLOYEE', 'MANAGER', 'INTERN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        department: true,
      },
    })

    // Get users who have already submitted for this month
    const submittedUserIds = await prisma.monthlyGrowthScore.findMany({
      where: {
        month: { gte: monthStart, lte: monthEnd },
        tacticalDataSubmitted: true,
      },
      select: { userId: true },
    }).then(scores => scores.map(s => s.userId))

    // Filter to only those who haven't submitted
    const pendingEmployees = employees.filter(e => !submittedUserIds.includes(e.id))

    if (pendingEmployees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All employees have submitted their tactical data',
        results,
      })
    }

    for (const employee of pendingEmployees) {
      let message: string

      if (dayOfMonth === 3) {
        // Soft reminder
        message = `Tactical Data Reminder - ${monthName}\n\nHi ${employee.firstName}!\n\nThis is a friendly reminder to submit your tactical KPI data for ${monthName}.\n\nDeadline: 5th of this month\n\nSubmit your work summary, page metrics, and engagement data to ensure accurate growth score calculation.\n\nLink: https://pioneer.brandingpioneers.in/meetings/tactical-sheet\n\nTeam BP`
        results.reminders++
      } else {
        // Day 5 - Final warning
        message = `FINAL REMINDER - Tactical Data Due Today!\n\nHi ${employee.firstName}!\n\nToday is the last day to submit your tactical KPI data for ${monthName} without penalty.\n\nSubmissions after today will receive a -5 point penalty on your growth score.\n\nPlease submit now: https://pioneer.brandingpioneers.in/meetings/tactical-sheet\n\nTeam BP`
        results.warnings++
      }

      if (employee.phone) {
        try {
          await sendWhatsAppMessage({ phone: employee.phone, message })
        } catch (error) {
          results.errors.push(`Reminder failed for ${employee.firstName}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      // Also create in-app notification
      await prisma.notification.create({
        data: {
          userId: employee.id,
          type: 'TACTICAL',
          title: dayOfMonth === 3
            ? 'Submit Your Tactical Data'
            : 'Final Day: Tactical Data Due',
          message: dayOfMonth === 3
            ? `Don't forget to submit your tactical KPI data for ${monthName}. Deadline is the 5th.`
            : `Last day to submit tactical data without penalty! Submit now to avoid -5 points.`,
          link: '/meetings/tactical-sheet',
          priority: dayOfMonth === 5 ? 'HIGH' : 'NORMAL',
        },
      })
    }

    // Notify managers about pending submissions
    if (dayOfMonth === 5) {
      const managers = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'SUPER_ADMIN' },
            { role: 'MANAGER' },
          ],
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true, firstName: true, phone: true },
      })

      const pendingCount = pendingEmployees.length
      const pendingNames = pendingEmployees.slice(0, 5).map(e => e.firstName).join(', ')
      const moreCount = pendingEmployees.length > 5 ? ` and ${pendingEmployees.length - 5} more` : ''

      for (const manager of managers) {
        const managerMessage = `Tactical Data Alert\n\n${pendingCount} team member(s) haven't submitted their tactical data yet:\n${pendingNames}${moreCount}\n\nToday is the deadline. Please follow up if needed.`

        if (manager.phone) {
          try {
            await sendWhatsAppMessage({ phone: manager.phone, message: managerMessage })
          } catch (error) {
            results.errors.push(`Manager alert failed for ${manager.firstName}: ${error instanceof Error ? error.message : String(error)}`)
          }
        }

        await prisma.notification.create({
          data: {
            userId: manager.id,
            type: 'TACTICAL',
            title: 'Pending Tactical Submissions',
            message: `${pendingCount} team member(s) haven't submitted their tactical data yet. Deadline is today.`,
            link: '/meetings/tactical-sheet',
            priority: 'HIGH',
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      dayOfMonth,
      pendingEmployees: pendingEmployees.length,
      results,
    })
  } catch (error) {
    console.error('Tactical reminder cron job failed:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
