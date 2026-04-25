import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { sendBulkNotifications, NotificationTemplates } from '@/server/notifications/wbiztool'
import { z } from 'zod'

const bulkNotificationSchema = z.object({
  recipients: z.array(z.object({
    phone: z.string().min(1).max(20),
    templateArgs: z.array(z.unknown()).optional(),
  })).min(1, 'Recipients array is required').max(100, 'Maximum 100 recipients per batch'),
  template: z.string().max(200).optional(),
  templateArgs: z.array(z.unknown()).optional(),
  customMessage: z.string().max(5000).optional(),
  delayMs: z.number().min(0).max(10000).optional(),
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Check if user has permission for bulk messaging
    if (!['SUPER_ADMIN', 'MANAGER', 'SALES'].includes(user.role || '')) {
      return NextResponse.json(
        { error: 'Not authorized for bulk messaging' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = bulkNotificationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { recipients, template, templateArgs, customMessage, delayMs = 1000 } = parsed.data

    // Build messages for each recipient
    const messagesWithRecipients = recipients.map((recipient: typeof recipients[number]) => {
      let message = customMessage

      if (template && NotificationTemplates[template as keyof typeof NotificationTemplates]) {
        const templateFn = NotificationTemplates[template as keyof typeof NotificationTemplates] as (...args: string[]) => string
        // Use recipient-specific args if provided, otherwise use global templateArgs
        const args = (recipient.templateArgs || templateArgs || []).map(String)
        message = templateFn(...args)
      }

      return {
        phone: recipient.phone as string,
        message: message ?? '',
      }
    })

    // Send notifications with delay
    const results = await sendBulkNotifications(messagesWithRecipients, delayMs)

    // Log successful sends
    const successCount = results.filter(r => r.result.status === 1).length
    const failCount = results.length - successCount

    return NextResponse.json({
      success: true,
      total: results.length,
      sent: successCount,
      failed: failCount,
      results: results.map(r => ({
        phone: r.phone,
        success: r.result.status === 1,
        messageId: r.result.msg_id,
        error: r.result.status === 0 ? r.result.message : null,
      })),
    })
  } catch (error) {
    console.error('Bulk notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send bulk notifications' },
      { status: 500 }
    )
  }
})
