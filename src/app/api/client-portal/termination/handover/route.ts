import { NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { scheduleHandoverCall, formatDate } from '@/server/services/termination'
import { z } from 'zod'

const scheduleHandoverSchema = z.object({
  preferredDate: z.string().min(1, 'Preferred date is required'),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  notes: z.string().max(2000).optional().nullable(),
})

// POST /api/client-portal/termination/handover - Schedule handover call
export const POST = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const parsed = scheduleHandoverSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { preferredDate, preferredTime, notes } = parsed.data

  // Get active termination for this client
  const termination = await prisma.serviceTermination.findFirst({
    where: {
      clientId: user.clientId,
      status: { in: ['PENDING', 'ACTIVE', 'HANDOVER'] },
    },
  })

  if (!termination) {
    return NextResponse.json(
      { error: 'No active termination request found' },
      { status: 404 }
    )
  }

  // Parse the scheduled date/time
  const scheduledDate = new Date(preferredDate)
  if (preferredTime) {
    const [hours, minutes] = preferredTime.split(':').map(Number)
    scheduledDate.setHours(hours, minutes, 0, 0)
  } else {
    // Default to 2 PM
    scheduledDate.setHours(14, 0, 0, 0)
  }

  // Validate date is within notice period
  const now = new Date()
  if (scheduledDate < now) {
    return NextResponse.json(
      { error: 'Handover call date must be in the future' },
      { status: 400 }
    )
  }

  if (scheduledDate > termination.noticeEndDate) {
    return NextResponse.json(
      { error: 'Handover call must be scheduled within the notice period' },
      { status: 400 }
    )
  }

  // Schedule the handover call
  const updated = await scheduleHandoverCall(termination.id, scheduledDate, notes ?? undefined)

  // Create a meeting record for the handover call
  const meeting = await prisma.meeting.create({
    data: {
      clientId: user.clientId,
      title: `Handover Call - ${user.client.name}`,
      description: `Service termination handover call.\n\nClient notes: ${notes || 'None'}`,
      date: scheduledDate,
      duration: 60, // 1 hour
      type: 'HANDOVER',
      status: 'SCHEDULED',
    },
  })

  // Update termination with meeting reference
  await prisma.serviceTermination.update({
    where: { id: termination.id },
    data: { handoverMeetingId: meeting.id },
  })

  return NextResponse.json({
    success: true,
    handover: {
      scheduled: true,
      date: scheduledDate.toISOString(),
      formattedDate: formatDate(scheduledDate),
      time: preferredTime || '14:00',
      notes,
      meetingId: meeting.id,
    },
    message: 'Handover call scheduled successfully. You will receive a calendar invite.',
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'WRITE' })

// GET /api/client-portal/termination/handover - Get available slots (optional)
export const GET = withClientAuth(async (req, { user }) => {
  // Get active termination
  const termination = await prisma.serviceTermination.findFirst({
    where: {
      clientId: user.clientId,
      status: { in: ['PENDING', 'ACTIVE', 'HANDOVER'] },
    },
  })

  if (!termination) {
    return NextResponse.json(
      { error: 'No active termination request found' },
      { status: 404 }
    )
  }

  // Generate available time slots for the next 2 weeks
  const slots: { date: string; formattedDate: string; availableTimes: string[] }[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 1) // Start from tomorrow
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(termination.noticeEndDate)

  while (startDate <= endDate && slots.length < 14) {
    // Skip weekends
    const dayOfWeek = startDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      slots.push({
        date: startDate.toISOString().split('T')[0],
        formattedDate: formatDate(startDate),
        availableTimes: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      })
    }
    startDate.setDate(startDate.getDate() + 1)
  }

  return NextResponse.json({
    terminationId: termination.id,
    noticeEndDate: termination.noticeEndDate.toISOString(),
    availableSlots: slots,
    handoverAlreadyScheduled: termination.handoverCallScheduled,
    existingHandover: termination.handoverCallScheduled
      ? {
          date: termination.handoverCallDate?.toISOString(),
          formattedDate: termination.handoverCallDate
            ? formatDate(termination.handoverCallDate)
            : null,
          completed: termination.handoverCallCompleted,
          notes: termination.handoverCallNotes,
        }
      : null,
  })
}, { requiredRole: 'PRIMARY', rateLimit: 'READ' })
