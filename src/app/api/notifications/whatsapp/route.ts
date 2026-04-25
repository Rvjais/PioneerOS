import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import {
  sendWhatsAppMessage,
  sendWhatsAppGroupMessage,
  NotificationTemplates,
} from '@/server/notifications/wbiztool'
import { z } from 'zod'

const sendNotificationSchema = z.object({
  type: z.enum(['individual', 'group']).optional(),
  phone: z.string().max(20).optional(),
  groupName: z.string().max(200).optional(),
  message: z.string().max(5000).optional(),
  template: z.string().max(100).optional(),
  templateArgs: z.array(z.unknown()).optional(),
  imageUrl: z.string().url().max(2000).optional().nullable(),
  fileUrl: z.string().url().max(2000).optional().nullable(),
  fileName: z.string().max(200).optional().nullable(),
  clientId: z.string().optional().nullable(),
}).refine(
  (data) => data.message || data.template,
  { message: 'Either message or template is required' }
)

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '') && user.department !== 'SALES') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = sendNotificationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { type, phone, groupName, message, template, templateArgs, imageUrl, fileUrl, fileName, clientId } = parsed.data

    // Build the message
    let finalMessage = message
    if (template && NotificationTemplates[template as keyof typeof NotificationTemplates]) {
      const templateFn = NotificationTemplates[template as keyof typeof NotificationTemplates] as (...args: string[]) => string
      finalMessage = templateFn(...(templateArgs || []).map(String))
    }

    if (!finalMessage) {
      return NextResponse.json({ error: 'Message content is empty' }, { status: 400 })
    }

    let result

    if (type === 'group' && groupName) {
      // Send to WhatsApp group
      result = await sendWhatsAppGroupMessage({
        groupName,
        message: finalMessage,
        imageUrl: imageUrl ?? undefined,
        fileUrl: fileUrl ?? undefined,
        fileName: fileName ?? undefined,
      })
    } else if (phone) {
      // Send to phone number
      result = await sendWhatsAppMessage({
        phone,
        message: finalMessage,
        imageUrl: imageUrl ?? undefined,
        fileUrl: fileUrl ?? undefined,
        fileName: fileName ?? undefined,
      })
    } else {
      return NextResponse.json(
        { error: 'Either phone or groupName is required' },
        { status: 400 }
      )
    }

    // Log the notification
    if (result.status === 1) {
      await prisma.communicationLog.create({
        data: {
          clientId: clientId || undefined,
          userId: user.id,
          type: 'WHATSAPP',
          subject: template || 'Custom Message',
          content: finalMessage,
          status: 'SENT',
          sentAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: result.status === 1,
      messageId: result.msg_id,
      message: result.message,
    })
  } catch (error) {
    console.error('WhatsApp notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
})

// Get notification templates
export async function GET() {
  return NextResponse.json({
    templates: Object.keys(NotificationTemplates),
    descriptions: {
      welcomeClient: 'Welcome message for new clients',
      onboardingLink: 'Send onboarding form link',
      paymentReminder: 'Payment due reminder',
      invoiceSent: 'Invoice/PI sent notification',
      reportReady: 'Monthly report ready notification',
      meetingReminder: 'Meeting reminder with optional link',
      taskAssigned: 'Task assignment notification for employees',
      leaveApproved: 'Leave approval notification',
      leaveRejected: 'Leave rejection notification',
      attendanceAlert: 'Attendance reminder',
      salaryProcessed: 'Salary credited notification',
    },
  })
}
