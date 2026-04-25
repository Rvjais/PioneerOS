import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { z } from 'zod'

const SALES_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'OPERATIONS_HEAD']

const sendSalesMessageSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  messageType: z.string().max(50).optional(),
  content: z.string().min(1, 'Content is required').max(5000),
  recipientPhone: z.string().max(20).optional().nullable(),
  recipientName: z.string().max(200).optional().nullable(),
})

export const GET = withAuth(async (req, { user }) => {
  try {
    const messages = await prisma.salesWhatsAppMessage.findMany({
      where: {
        userId: user.id,
      },
      include: {
        lead: {
          select: { id: true, companyName: true, contactName: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}, { roles: SALES_ROLES })

export const POST = withAuth(async (req, { user }) => {
  try {

    const body = await req.json()
    const parsed = sendSalesMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const {
      leadId,
      messageType,
      content,
      recipientPhone,
      recipientName,
    } = parsed.data

    const message = await prisma.salesWhatsAppMessage.create({
      data: {
        leadId,
        userId: user.id,
        messageType: messageType || 'CUSTOM',
        content,
        recipientPhone: recipientPhone || null,
        recipientName: recipientName || null,
        status: 'PENDING',
        sentAt: new Date(),
      },
      include: {
        lead: {
          select: { id: true, companyName: true, contactName: true }
        },
      },
    })

    // Actually send the WhatsApp message
    if (recipientPhone) {
      try {
        const result = await sendWhatsAppMessage({ phone: recipientPhone, message: content })
        await prisma.salesWhatsAppMessage.update({
          where: { id: message.id },
          data: { status: result.status === 1 ? 'SENT' : 'FAILED' },
        })
        message.status = result.status === 1 ? 'SENT' : 'FAILED'
      } catch (sendError) {
        console.error('WhatsApp send failed:', sendError)
        await prisma.salesWhatsAppMessage.update({
          where: { id: message.id },
          data: { status: 'FAILED' },
        })
        message.status = 'FAILED'
      }
    }

    // Create activity log
    await prisma.leadActivity.create({
      data: {
        leadId,
        userId: user.id,
        type: 'NOTE',
        title: `WhatsApp message sent: ${messageType}`,
        description: content.slice(0, 100) + '...',
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}, { roles: SALES_ROLES })
