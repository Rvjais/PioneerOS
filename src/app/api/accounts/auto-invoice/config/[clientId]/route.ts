import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateAutoInvoiceConfigSchema = z.object({
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

// GET /api/accounts/auto-invoice/config/[clientId] - Get config for a specific client
export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { clientId } = await routeParams!

    const config = await prisma.autoInvoiceConfig.findUnique({
      where: { clientId },
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
            whatsapp: true,
            gstNumber: true,
            entityType: true
          }
        }
      }
    })

    if (!config) {
      // Return client info without config
      const client = await prisma.client.findUnique({
        where: { id: clientId },
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
      })

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      return NextResponse.json({
        config: null,
        client
      })
    }

    // Get recent invoice history
    const recentInvoices = await prisma.invoice.findMany({
      where: { clientId },
      select: {
        id: true,
        invoiceNumber: true,
        amount: true,
        status: true,
        dueDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      config: {
        ...config,
        lastGeneratedAt: config.lastGeneratedAt?.toISOString(),
        lastSentAt: config.lastSentAt?.toISOString(),
        nextScheduledAt: config.nextScheduledAt?.toISOString(),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      },
      recentInvoices: recentInvoices.map(i => ({
        ...i,
        dueDate: i.dueDate.toISOString(),
        createdAt: i.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Failed to fetch auto-invoice config:', error)
    return NextResponse.json({ error: 'Failed to fetch auto-invoice config' }, { status: 500 })
  }
})

// PUT /api/accounts/auto-invoice/config/[clientId] - Update config for a client
export const PUT = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { clientId } = await routeParams!
    const raw = await req.json()
    const parsed = updateAutoInvoiceConfigSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    // Check if config exists
    const existing = await prisma.autoInvoiceConfig.findUnique({
      where: { clientId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Config not found. Use POST to create.' },
        { status: 404 }
      )
    }

    // Calculate next scheduled date if generate day changed
    let nextScheduledAt = existing.nextScheduledAt
    if (body.generateOnDay !== undefined && body.generateOnDay !== existing.generateOnDay) {
      const now = new Date()
      nextScheduledAt = new Date(now.getFullYear(), now.getMonth(), body.generateOnDay)
      if (nextScheduledAt <= now) {
        nextScheduledAt.setMonth(nextScheduledAt.getMonth() + 1)
      }
    }

    const config = await prisma.autoInvoiceConfig.update({
      where: { clientId },
      data: {
        ...(body.isEnabled !== undefined && { isEnabled: body.isEnabled }),
        ...(body.generateOnDay !== undefined && { generateOnDay: body.generateOnDay }),
        ...(body.sendOnDay !== undefined && { sendOnDay: body.sendOnDay }),
        ...(body.sendViaWhatsApp !== undefined && { sendViaWhatsApp: body.sendViaWhatsApp }),
        ...(body.sendViaEmail !== undefined && { sendViaEmail: body.sendViaEmail }),
        ...(body.useClientMonthlyFee !== undefined && { useClientMonthlyFee: body.useClientMonthlyFee }),
        ...(body.customAmount !== undefined && { customAmount: body.customAmount }),
        ...(body.includeGST !== undefined && { includeGST: body.includeGST }),
        ...(body.gstPercentage !== undefined && { gstPercentage: body.gstPercentage }),
        ...(body.invoicePrefix !== undefined && { invoicePrefix: body.invoicePrefix }),
        ...(body.defaultNotes !== undefined && { defaultNotes: body.defaultNotes }),
        ...(nextScheduledAt && { nextScheduledAt })
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
        lastGeneratedAt: config.lastGeneratedAt?.toISOString(),
        lastSentAt: config.lastSentAt?.toISOString(),
        nextScheduledAt: config.nextScheduledAt?.toISOString(),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to update auto-invoice config:', error)
    return NextResponse.json({ error: 'Failed to update auto-invoice config' }, { status: 500 })
  }
})

// DELETE /api/accounts/auto-invoice/config/[clientId] - Delete config
export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'ACCOUNTS'].includes(user.role)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { clientId } = await routeParams!

    await prisma.autoInvoiceConfig.delete({
      where: { clientId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete auto-invoice config:', error)
    return NextResponse.json({ error: 'Failed to delete auto-invoice config' }, { status: 500 })
  }
})
