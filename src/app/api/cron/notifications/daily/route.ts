import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendWhatsAppMessage, sendBulkNotifications } from '@/server/notifications/wbiztool'

export const maxDuration = 300

// SECURITY: Cron secret must be set via environment variable
const CRON_SECRET = process.env.CRON_SECRET

/**
 * Daily Notification Cron Job
 * Triggers: Every day at 9:00 AM IST
 *
 * Sends:
 * 1. Task reminders for tasks due today
 * 2. Attendance alerts for employees who haven't punched in
 * 3. Meeting reminders for today's meetings
 * 4. Follow-up reminders for sales team
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret - REQUIRED for security
    const authHeader = req.headers.get('authorization')
    if (!CRON_SECRET) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
    }
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Atomically check and acquire lock for today (prevents TOCTOU race condition)
    const istOffset = 5.5 * 60 * 60 * 1000
    const today_date = new Date(Date.now() + istOffset).toISOString().split('T')[0]
    const lockId = `daily-notifications-${today_date}`
    try {
      await prisma.distributedLock.create({
        data: { id: lockId, lockName: lockId, expiresAt: new Date(Date.now() + 86400000) }
      })
    } catch {
      // Unique constraint violation means it already ran today
      return NextResponse.json({ message: 'Already ran today', skipped: true })
    }

    const results = {
      taskReminders: 0,
      attendanceAlerts: 0,
      meetingReminders: 0,
      followUpReminders: 0,
      errors: [] as string[],
    }

    // Use IST (UTC+5:30) for date boundaries since business operates in India.
    // new Date().setHours(0,0,0,0) uses server-local time which may be UTC on
    // cloud hosts, causing queries to target the wrong calendar day.
    const nowUtc = new Date()
    const istOffsetMs = 5.5 * 60 * 60 * 1000
    const istMidnightUtc = new Date(
      new Date(nowUtc.getTime() + istOffsetMs).setUTCHours(0, 0, 0, 0) - istOffsetMs
    )
    const today = istMidnightUtc
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    // 1. Send task reminders for tasks due today
    const tasksToday = await prisma.dailyTask.findMany({
      where: {
        plan: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        status: 'PLANNED',
      },
      include: {
        plan: {
          include: {
            user: {
              select: { firstName: true, phone: true },
            },
          },
        },
        client: { select: { name: true } },
      },
    })

    // Group tasks by user
    const tasksByUser = tasksToday.reduce((acc, task) => {
      const userId = task.plan.userId
      if (!acc[userId]) {
        acc[userId] = {
          userName: task.plan.user.firstName,
          phone: task.plan.user.phone,
          tasks: [],
        }
      }
      acc[userId].tasks.push({
        description: task.description,
        clientName: task.client?.name || 'Internal',
        hours: task.plannedHours,
      })
      return acc
    }, {} as Record<string, { userName: string; phone: string; tasks: { description: string; clientName: string; hours: number }[] }>)

    for (const [, userData] of Object.entries(tasksByUser)) {
      if (userData.phone && userData.tasks.length > 0) {
        const taskList = userData.tasks
          .map(t => `- ${t.description} (${t.clientName}) - ${t.hours}h`)
          .join('\n')

        const message = `Good morning ${userData.userName}!\n\nYour tasks for today:\n${taskList}\n\nTotal: ${userData.tasks.reduce((sum, t) => sum + t.hours, 0)} hours planned\n\nHave a productive day!`

        try {
          await sendWhatsAppMessage({ phone: userData.phone, message })
          results.taskReminders++
        } catch (error) {
          results.errors.push(`Task reminder failed for ${userData.userName}: ${error}`)
        }
      }
    }

    // 2. Send meeting reminders for today's meetings
    const meetingsToday = await prisma.meeting.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: 'SCHEDULED',
      },
      include: {
        client: { select: { name: true, contactPhone: true } },
        participants: {
          include: {
            user: { select: { firstName: true, phone: true } },
          },
        },
      },
    })

    for (const meeting of meetingsToday) {
      const meetingTime = meeting.date
        ? new Date(meeting.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : 'TBD'

      // Notify all participants
      for (const participant of meeting.participants) {
        if (participant.user?.phone) {
          const message = `Meeting Reminder:\n\n*${meeting.title}*\nClient: ${meeting.client?.name || 'Internal'}\nTime: ${meetingTime}\n${meeting.location ? `Location: ${meeting.location}` : ''}`

          try {
            await sendWhatsAppMessage({ phone: participant.user.phone, message })
            results.meetingReminders++
          } catch (error) {
            results.errors.push(`Meeting reminder failed: ${error}`)
          }
        }
      }
    }

    // 3. Send follow-up reminders for sales (leads with follow-up today)
    const followUpsToday = await prisma.lead.findMany({
      where: {
        nextFollowUp: {
          gte: today,
          lt: tomorrow,
        },
        stage: { notIn: ['WON', 'LOST'] },
        deletedAt: null,
      },
      include: {
        assignedTo: { select: { firstName: true, phone: true } },
      },
    })

    // Group by sales person
    const followUpsByUser = followUpsToday.reduce((acc, lead) => {
      if (lead.assignedTo?.phone) {
        if (!acc[lead.assignedToId!]) {
          acc[lead.assignedToId!] = {
            userName: lead.assignedTo.firstName,
            phone: lead.assignedTo.phone,
            leads: [],
          }
        }
        acc[lead.assignedToId!].leads.push({
          name: lead.companyName || lead.contactName,
          value: lead.value,
        })
      }
      return acc
    }, {} as Record<string, { userName: string; phone: string; leads: { name: string; value: number | null }[] }>)

    for (const [, userData] of Object.entries(followUpsByUser)) {
      const leadList = userData.leads
        .map(l => `- ${l.name}${l.value ? ` (₹${l.value.toLocaleString('en-IN')})` : ''}`)
        .join('\n')

      const message = `Follow-up Reminder for ${userData.userName}:\n\nYou have ${userData.leads.length} lead(s) to follow up today:\n${leadList}\n\nGood luck!`

      try {
        await sendWhatsAppMessage({ phone: userData.phone, message })
        results.followUpReminders++
      } catch (error) {
        results.errors.push(`Follow-up reminder failed: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Daily cron job failed:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Allow GET for testing (will require auth header)
export async function GET(req: NextRequest) {
  return POST(req)
}
