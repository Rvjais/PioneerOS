/**
 * Notification Service
 *
 * Central service for sending notifications via WhatsApp, Email, and in-app
 */

import { prisma } from '@/server/db/prisma'
import {
  sendWhatsAppMessage,
  sendWhatsAppGroupMessage,
  NotificationTemplates,
} from './wbiztool'

export { NotificationTemplates } from './wbiztool'

export type NotificationChannel = 'whatsapp' | 'email' | 'inapp' | 'all'

interface NotificationOptions {
  channels?: NotificationChannel[]
  userId?: string
  clientId?: string
  phone?: string
  email?: string
}

/**
 * Send client welcome notification
 */
export async function notifyClientWelcome(
  clientId: string,
  options: NotificationOptions = {}
) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) return { success: false, error: 'Client not found' }

  const results: Record<string, any> = {}

  // WhatsApp notification
  if (client.contactPhone || client.whatsapp) {
    const phone = client.whatsapp || client.contactPhone || ''
    const message = NotificationTemplates.welcomeClient(
      client.contactName || client.name,
      'Branding Pioneers'
    )

    const result = await sendWhatsAppMessage({ phone, message })
    results.whatsapp = { success: result.status === 1, messageId: result.msg_id }
  }

  // In-app notification (if linked to account manager)
  if (client.accountManagerId) {
    await prisma.notification.create({
      data: {
        userId: client.accountManagerId,
        type: 'GENERAL',
        title: 'Welcome Message Sent',
        message: `Welcome notification sent to ${client.name}`,
        link: `/clients/${clientId}`,
        priority: 'NORMAL',
      },
    })
    results.inapp = { success: true }
  }

  // Update client record
  await prisma.client.update({
    where: { id: clientId },
    data: { welcomeMessageSent: true },
  })

  return { success: true, results }
}

/**
 * Send onboarding link to client
 */
export async function notifyClientOnboarding(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client || !client.onboardingToken) {
    return { success: false, error: 'Client or onboarding token not found' }
  }

  const phone = client.whatsapp || client.contactPhone
  if (!phone) {
    return { success: false, error: 'No phone number available' }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://app.brandingpioneers.in'
  const onboardingLink = `${baseUrl}/onboard/${client.onboardingToken}`

  const message = NotificationTemplates.onboardingLink(
    client.contactName || client.name,
    onboardingLink
  )

  const result = await sendWhatsAppMessage({ phone, message })

  // Log the communication
  if (result.status === 1 && client.accountManagerId) {
    await prisma.communicationLog.create({
      data: {
        clientId,
        userId: client.accountManagerId,
        type: 'WHATSAPP',
        subject: 'Onboarding Link',
        content: message,
        status: 'SENT',
        sentAt: new Date(),
      },
    })
  }

  return {
    success: result.status === 1,
    messageId: result.msg_id,
  }
}

/**
 * Send payment reminder to client
 */
export async function notifyPaymentReminder(
  clientId: string,
  amount: number,
  dueDate: string
) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  })

  if (!client) return { success: false, error: 'Client not found' }

  const phone = client.whatsapp || client.contactPhone
  if (!phone) return { success: false, error: 'No phone number' }

  const message = NotificationTemplates.paymentReminder(
    client.contactName || client.name,
    amount,
    dueDate
  )

  const result = await sendWhatsAppMessage({ phone, message })

  return {
    success: result.status === 1,
    messageId: result.msg_id,
  }
}

/**
 * Notify employee of task assignment
 */
export async function notifyTaskAssignment(
  userId: string,
  taskTitle: string,
  clientName: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user) return { success: false, error: 'User not found' }

  // In-app notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'TASK',
      title: 'New Task Assigned',
      message: `${taskTitle} - ${clientName}`,
      link: '/tasks',
      priority: 'HIGH',
    },
  })

  // WhatsApp notification (if phone available)
  if (user.phone) {
    const message = NotificationTemplates.taskAssigned(
      user.firstName,
      taskTitle,
      clientName
    )

    await sendWhatsAppMessage({ phone: user.phone, message })
  }

  return { success: true }
}

/**
 * Notify team about meeting
 */
export async function notifyMeetingReminder(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      participants: {
        include: { user: true }
      },
      client: true,
    },
  })

  if (!meeting) return { success: false, error: 'Meeting not found' }

  const meetingTime = new Date(meeting.date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const results: Array<{ userId: string; success: boolean }> = []

  // Notify all participants
  for (const participant of meeting.participants) {
    if (participant.user.phone) {
      const message = NotificationTemplates.meetingReminder(
        participant.user.firstName,
        meetingTime,
        meeting.location || undefined
      )

      const result = await sendWhatsAppMessage({
        phone: participant.user.phone,
        message,
      })

      results.push({
        userId: participant.userId,
        success: result.status === 1,
      })
    }

    // In-app notification
    await prisma.notification.create({
      data: {
        userId: participant.userId,
        type: 'MEETING',
        title: 'Meeting Reminder',
        message: `${meeting.title} - ${meetingTime}`,
        link: `/meetings/${meetingId}`,
        priority: 'HIGH',
      },
    })
  }

  // Notify client
  if (meeting.client?.contactPhone) {
    const clientMessage = NotificationTemplates.meetingReminder(
      meeting.client.contactName || meeting.client.name,
      meetingTime,
      meeting.location || undefined
    )

    await sendWhatsAppMessage({
      phone: meeting.client.contactPhone,
      message: clientMessage,
    })
  }

  return { success: true, results }
}

/**
 * Notify employee about leave status
 */
export async function notifyLeaveStatus(
  userId: string,
  leaveType: string,
  approved: boolean,
  dates: string,
  reason?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return { success: false, error: 'User not found' }

  // In-app notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'GENERAL',
      title: approved ? 'Leave Approved' : 'Leave Request Update',
      message: approved
        ? `Your ${leaveType} leave for ${dates} has been approved`
        : `Your ${leaveType} leave request was not approved`,
      link: '/hr/leave',
      priority: 'HIGH',
    },
  })

  // WhatsApp notification
  if (user.phone) {
    const message = approved
      ? NotificationTemplates.leaveApproved(user.firstName, leaveType, dates)
      : NotificationTemplates.leaveRejected(user.firstName, leaveType, reason)

    await sendWhatsAppMessage({ phone: user.phone, message })
  }

  return { success: true }
}

/**
 * Send custom message to a contact
 */
export async function sendCustomNotification(
  phone: string,
  message: string,
  options: {
    imageUrl?: string
    fileUrl?: string
    fileName?: string
    userId?: string
    clientId?: string
  } = {}
) {
  const result = await sendWhatsAppMessage({
    phone,
    message,
    imageUrl: options.imageUrl,
    fileUrl: options.fileUrl,
    fileName: options.fileName,
  })

  // Log if user context provided
  if (options.userId && result.status === 1) {
    await prisma.communicationLog.create({
      data: {
        clientId: options.clientId,
        userId: options.userId,
        type: 'WHATSAPP',
        subject: 'Custom Message',
        content: message,
        status: 'SENT',
        sentAt: new Date(),
      },
    })
  }

  return {
    success: result.status === 1,
    messageId: result.msg_id,
    error: result.status === 0 ? result.message : undefined,
  }
}

/**
 * Send to WhatsApp group
 */
export async function sendGroupNotification(
  groupName: string,
  message: string,
  options: {
    imageUrl?: string
    fileUrl?: string
    fileName?: string
  } = {}
) {
  const result = await sendWhatsAppGroupMessage({
    groupName,
    message,
    imageUrl: options.imageUrl,
    fileUrl: options.fileUrl,
    fileName: options.fileName,
  })

  return {
    success: result.status === 1,
    messageId: result.msg_id,
    error: result.status === 0 ? result.message : undefined,
  }
}
