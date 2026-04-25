import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getNextSequenceValue } from '@/server/db/sequence'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const generateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  clientIds: z.array(z.string().min(1)).optional(),
  serviceMonth: z.string().optional(),
})

// POST /api/accounts/auto-invoice/generate - Manually trigger invoice generation
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = generateInvoiceSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { clientId, clientIds, serviceMonth } = parsed.data

    // Support single client or batch
    const targetClientIds = clientIds || (clientId ? [clientId] : null)

    if (!targetClientIds || targetClientIds.length === 0) {
      return NextResponse.json(
        { error: 'Client ID(s) required' },
        { status: 400 }
      )
    }

    const now = new Date()
    const invoiceMonth = serviceMonth
      ? new Date(serviceMonth)
      : new Date(now.getFullYear(), now.getMonth(), 1)

    const results: Array<{
      clientId: string
      clientName: string
      invoiceId: string
      invoiceNumber: string
      amount: number
      total: number
      dueDate: string
      status: string
    }> = []
    const errors: Array<{ clientId: string; error: string }> = []

    for (const cId of targetClientIds) {
      try {
        // Get client with config
        const client = await prisma.client.findUnique({
          where: { id: cId },
          include: {
            autoInvoiceConfig: true
          }
        })

        if (!client) {
          errors.push({ clientId: cId, error: 'Client not found' })
          continue
        }

        if (client.haltReminders) {
          errors.push({ clientId: cId, error: 'Reminders halted for this client' })
          continue
        }

        // Determine invoice amount
        const config = client.autoInvoiceConfig
        let amount = client.monthlyFee || 0

        if (config && !config.useClientMonthlyFee && config.customAmount) {
          amount = config.customAmount
        }

        if (amount <= 0) {
          errors.push({ clientId: cId, error: 'No amount configured' })
          continue
        }

        // Calculate GST
        const includeGST = config?.includeGST ?? true
        const gstPct = config?.gstPercentage ?? 18
        const gstAmount = includeGST ? (amount * gstPct) / 100 : 0
        const total = amount + gstAmount

        // Generate invoice number atomically to prevent race conditions
        const prefix = config?.invoicePrefix || 'INV'
        const year = now.getFullYear().toString().slice(-2)
        const month = (now.getMonth() + 1).toString().padStart(2, '0')

        // SECURITY FIX: Use atomic sequence generator to prevent duplicate invoice numbers
        const sequenceKey = `INVOICE_${prefix}_${year}${month}`
        const sequence = await getNextSequenceValue(sequenceKey, 0)

        const invoiceNumber = `${prefix}-${year}${month}-${sequence.toString().padStart(4, '0')}`

        // Calculate due date based on payment terms
        const paymentTerms = client.paymentTerms || 'NET_30'
        const paymentDays = getPaymentDays(paymentTerms, client.customPaymentDays)
        const dueDate = new Date(now)
        dueDate.setDate(dueDate.getDate() + paymentDays)

        // SECURITY FIX: Wrap invoice creation and config update in transaction
        const invoice = await prisma.$transaction(async (tx) => {
          // Create invoice
          const newInvoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              clientId: cId,
              amount,
              tax: gstAmount,
              total,
              status: 'DRAFT',
              dueDate,
              serviceMonth: invoiceMonth,
              entityType: client.entityType || 'BRANDING_PIONEERS',
              notes: config?.defaultNotes,
              items: JSON.stringify([
                {
                  description: `Monthly Retainer Fee - ${invoiceMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                  quantity: 1,
                  rate: amount,
                  amount
                }
              ])
            }
          })

          // Update config if exists
          if (config) {
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, config.generateOnDay)
            await tx.autoInvoiceConfig.update({
              where: { clientId: cId },
              data: {
                lastGeneratedAt: now,
                nextScheduledAt: nextMonth
              }
            })
          }

          return newInvoice
        })

        results.push({
          clientId: cId,
          clientName: client.name,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          total: invoice.total,
          dueDate: invoice.dueDate.toISOString(),
          status: invoice.status
        })
      } catch (clientError) {
        console.error(`Failed to generate invoice for client ${cId}:`, clientError)
        errors.push({
          clientId: cId,
          error: clientError instanceof Error ? clientError.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      generated: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    }, { status: results.length > 0 ? 201 : 400 })
  } catch (error) {
    console.error('Failed to generate invoices:', error)
    return NextResponse.json({ error: 'Failed to generate invoices' }, { status: 500 })
  }
})

function getPaymentDays(terms: string, customDays?: number | null): number {
  switch (terms) {
    case 'IMMEDIATE':
      return 0
    case 'NET_15':
      return 15
    case 'NET_30':
      return 30
    case 'NET_45':
      return 45
    case 'CUSTOM':
      return customDays || 30
    default:
      return 30
  }
}
