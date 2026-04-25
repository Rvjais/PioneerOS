import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { acquireLock, releaseLock, cleanupExpiredLocks, startLockHeartbeat } from '@/server/db/distributedLock'

export const maxDuration = 300

// Vercel Cron Job - Process due WhatsApp schedules
// Configure in vercel.json: { "path": "/api/cron/whatsapp/schedules", "schedule": "* * * * *" }

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Acquire distributed lock to prevent duplicate execution
    const lockName = 'whatsapp_schedule_cron'
    const lockTtl = 300 // 5 minutes — matches maxDuration
    const { acquired, lockId } = await acquireLock(lockName, lockTtl)

    if (!acquired) {
      return NextResponse.json({
        success: true,
        message: 'Another instance is processing schedules',
        skipped: true,
      })
    }

    const stopHeartbeat = startLockHeartbeat(lockId!, lockTtl)

    try {
      // Cleanup expired locks periodically
      await cleanupExpiredLocks()

      const now = new Date()

      // Find schedules that are due
      const dueSchedules = await prisma.whatsAppSchedule.findMany({
      where: {
        status: 'ACTIVE',
        nextRunAt: { lte: now },
      },
      include: {
        account: true,
      },
    })

    const results: Array<{ scheduleId: string; success: boolean; error?: string }> = []

    for (const schedule of dueSchedules) {
      try {
        // Process template variables
        let messageContent = schedule.messageTemplate
        const today = new Date()

        // Replace common variables
        messageContent = messageContent
          .replace(/\{\{date\}\}/g, today.toLocaleDateString('en-IN'))
          .replace(/\{\{time\}\}/g, today.toLocaleTimeString('en-IN'))
          .replace(/\{\{month\}\}/g, today.toLocaleDateString('en-IN', { month: 'long' }))
          .replace(/\{\{year\}\}/g, today.getFullYear().toString())

        // Get target phone number
        let targetPhone = schedule.targetPhone

        if (schedule.targetType === 'CLIENT' && schedule.targetClientId) {
          const client = await prisma.client.findUnique({
            where: { id: schedule.targetClientId },
            select: { contactPhone: true, whatsapp: true, name: true },
          })

          if (client) {
            targetPhone = client.whatsapp || client.contactPhone
            messageContent = messageContent.replace(/\{\{clientName\}\}/g, client.name)
          }
        }

        if (!targetPhone) {
          results.push({
            scheduleId: schedule.id,
            success: false,
            error: 'No target phone number',
          })
          continue
        }

        // Create message record
        const message = await prisma.whatsAppMessage.create({
          data: {
            accountId: schedule.accountId,
            direction: 'OUTBOUND',
            phoneNumber: targetPhone,
            messageType: 'TEXT',
            content: messageContent,
            status: 'PENDING',
            scheduleId: schedule.id,
            clientId: schedule.targetClientId,
          },
        })

        // Send via WBizTool API
        const sendResult = await sendWhatsAppMessage({
          phone: targetPhone,
          message: messageContent,
        })

        if (sendResult.status === 1) {
          await prisma.whatsAppMessage.update({
            where: { id: message.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              externalMsgId: sendResult.msg_id?.toString(),
            },
          })
        } else {
          await prisma.whatsAppMessage.update({
            where: { id: message.id },
            data: { status: 'FAILED' },
          })
          results.push({
            scheduleId: schedule.id,
            success: false,
            error: sendResult.message || 'Failed to send via WBizTool',
          })
          continue
        }

        // Calculate next run time
        let nextRunAt: Date | null = null

        if (schedule.scheduleType === 'RECURRING' && schedule.frequency) {
          nextRunAt = new Date(now)

          switch (schedule.frequency) {
            case 'DAILY':
              nextRunAt.setDate(nextRunAt.getDate() + 1)
              break
            case 'WEEKLY':
              nextRunAt.setDate(nextRunAt.getDate() + 7)
              break
            case 'MONTHLY': {
              // Calculate next month properly, clamping day to last day of target month
              const targetMonth = nextRunAt.getMonth() + 1
              const targetYear = nextRunAt.getFullYear() + (targetMonth > 11 ? 1 : 0)
              const normalizedTargetMonth = targetMonth % 12
              const lastDay = new Date(targetYear, normalizedTargetMonth + 1, 0).getDate()
              const day = schedule.dayOfMonth ? Math.min(schedule.dayOfMonth, lastDay) : Math.min(nextRunAt.getDate(), lastDay)
              nextRunAt = new Date(targetYear, normalizedTargetMonth, day, nextRunAt.getHours(), nextRunAt.getMinutes())
              break
            }
          }

          // Set time
          if (schedule.scheduledTime) {
            const [hours, minutes] = schedule.scheduledTime.split(':').map(Number)
            nextRunAt.setHours(hours, minutes, 0, 0)
          }
        }

        // Update schedule
        await prisma.whatsAppSchedule.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: now,
            nextRunAt,
            runCount: { increment: 1 },
            status: schedule.scheduleType === 'ONE_TIME' ? 'COMPLETED' : 'ACTIVE',
          },
        })

        results.push({ scheduleId: schedule.id, success: true })
      } catch (error) {
        console.error(`Failed to process schedule ${schedule.id}:`, error)
        results.push({
          scheduleId: schedule.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

      const failedResults = results.filter(r => !r.success)
      if (failedResults.length > 0) {
        console.error(`[Cron] Failed schedule IDs: ${failedResults.map(r => r.scheduleId).join(', ')}`)
      }

      return NextResponse.json({
        processed: results.length,
        succeeded: results.filter(r => r.success).length,
        failed: failedResults.length,
        failedScheduleIds: failedResults.map(r => r.scheduleId),
        results,
        timestamp: now.toISOString(),
      })
    } finally {
      // Stop heartbeat and release the lock
      stopHeartbeat()
      if (lockId) {
        await releaseLock(lockId)
      }
    }
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
