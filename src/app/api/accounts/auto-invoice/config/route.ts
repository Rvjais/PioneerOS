import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createAutoInvoiceConfigSchema = z.object({
  clientId: z.string().min(1),
  isEnabled: z.boolean().optional(),
  generateOnDay: z.number().min(1).max(28).optional(),
  sendOnDay: z.number().min(1).max(28).optional(),
  sendViaWhatsApp: z.boolean().optional(),
  sendViaEmail: z.boolean().optional(),
  useClientMonthlyFee: z.boolean().optional(),
  customAmount: z.number().optional(),
  includeGST: z.boolean().optional(),
  gstPercentage: z.number().optional(),
  invoicePrefix: z.string().optional(),
  defaultNotes: z.string().optional(),
})

// GET /api/accounts/auto-invoice/config - List all auto-invoice configs
export const GET = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const isEnabled = searchParams.get('isEnabled')
    const clientStatus = searchParams.get('clientStatus')

    const configs = await prisma.autoInvoiceConfig.findMany({
      where: {
        ...(isEnabled !== null && { isEnabled: isEnabled === 'true' }),
        ...(clientStatus && {
          client: { status: clientStatus }
        })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            status: true,
            monthlyFee: true,
            billingType: true,
            haltReminders: true,
            contactEmail: true,
            whatsapp: true
          }
        }
      },
      orderBy: { client: { name: 'asc' } }
    })

    // Get clients without config for overview
    const clientsWithoutConfig = await prisma.client.findMany({
      where: {
        status: 'ACTIVE',
        autoInvoiceConfig: null,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        billingType: true
      }
    })

    // Get upcoming scheduled invoices
    const today = new Date()
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const upcomingInvoices = configs
      .filter(c => c.isEnabled && !c.client.haltReminders)
      .filter(c => {
        const generateDay = c.generateOnDay
        const currentDay = today.getDate()
        return generateDay >= currentDay
      })
      .map(c => ({
        clientId: c.clientId,
        clientName: c.client.name,
        generateOnDay: c.generateOnDay,
        sendOnDay: c.sendOnDay,
        amount: c.useClientMonthlyFee ? c.client.monthlyFee : c.customAmount,
        channels: {
          whatsApp: c.sendViaWhatsApp,
          email: c.sendViaEmail
        }
      }))

    return NextResponse.json({
      configs: configs.map(c => ({
        ...c,
        lastGeneratedAt: c.lastGeneratedAt?.toISOString(),
        lastSentAt: c.lastSentAt?.toISOString(),
        nextScheduledAt: c.nextScheduledAt?.toISOString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      })),
      clientsWithoutConfig,
      upcomingInvoices,
      summary: {
        total: configs.length,
        enabled: configs.filter(c => c.isEnabled).length,
        disabled: configs.filter(c => !c.isEnabled).length,
        haltedReminders: configs.filter(c => c.client.haltReminders).length
      }
    })
  } catch (error) {
    console.error('Failed to fetch auto-invoice configs:', error)
    return NextResponse.json({ error: 'Failed to fetch auto-invoice configs' }, { status: 500 })
  }
})

// POST /api/accounts/auto-invoice/config - Create config for a client
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createAutoInvoiceConfigSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const {
      clientId,
      isEnabled,
      generateOnDay,
      sendOnDay,
      sendViaWhatsApp,
      sendViaEmail,
      useClientMonthlyFee,
      customAmount,
      includeGST,
      gstPercentage,
      invoicePrefix,
      defaultNotes
    } = parsed.data

    // Validate generate/send days
    const genDay = generateOnDay || 1
    const sndDay = sendOnDay || genDay

    // Check if config already exists
    const existing = await prisma.autoInvoiceConfig.findUnique({
      where: { clientId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Config already exists for this client. Use PUT to update.' },
        { status: 409 }
      )
    }

    // Calculate next scheduled date
    const now = new Date()
    // Clamp genDay to the last day of the target month to prevent date overflow
    const targetMonth = now.getDate() >= genDay ? now.getMonth() + 1 : now.getMonth()
    const targetYear = targetMonth > 11 ? now.getFullYear() + 1 : now.getFullYear()
    const normalizedMonth = targetMonth > 11 ? 0 : targetMonth
    const lastDayOfMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate()
    const clampedDay = Math.min(genDay, lastDayOfMonth)
    const nextScheduledAt = new Date(targetYear, normalizedMonth, clampedDay)

    const config = await prisma.autoInvoiceConfig.create({
      data: {
        clientId,
        isEnabled: isEnabled ?? false,
        generateOnDay: genDay,
        sendOnDay: sndDay,
        sendViaWhatsApp: sendViaWhatsApp ?? true,
        sendViaEmail: sendViaEmail ?? true,
        useClientMonthlyFee: useClientMonthlyFee ?? true,
        customAmount,
        includeGST: includeGST ?? true,
        gstPercentage: gstPercentage ?? 18,
        invoicePrefix,
        defaultNotes,
        nextScheduledAt
      },
      include: {
        client: {
          select: { id: true, name: true, monthlyFee: true }
        }
      }
    })

    return NextResponse.json({
      config: {
        ...config,
        nextScheduledAt: config.nextScheduledAt?.toISOString(),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create auto-invoice config:', error)
    return NextResponse.json({ error: 'Failed to create auto-invoice config' }, { status: 500 })
  }
})
