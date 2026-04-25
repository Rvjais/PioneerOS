import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getNextSequenceValue } from '@/server/db/sequence'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const bulkInvoiceSchema = z.object({
  clientIds: z.array(z.string().min(1)).min(1),
})

// POST /api/accounts/auto-invoice/bulk - Quick bulk invoice generation
export const POST = withAuth(async (req, { user, params }) => {
  try {
const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = bulkInvoiceSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { clientIds } = parsed.data

    const now = new Date()
    const invoiceMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let generated = 0
    const errors: string[] = []

    for (const clientId of clientIds) {
      try {
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          include: { autoInvoiceConfig: true }
        })

        if (!client) {
          errors.push(`Client ${clientId} not found`)
          continue
        }

        const config = client.autoInvoiceConfig
        let amount = client.monthlyFee || 0

        if (config && !config.useClientMonthlyFee && config.customAmount) {
          amount = config.customAmount
        }

        if (amount <= 0) {
          errors.push(`${client.name}: No amount configured`)
          continue
        }

        // Calculate GST
        const includeGST = config?.includeGST ?? true
        const gstPct = config?.gstPercentage ?? 18
        const gstAmount = includeGST ? Math.round((amount * gstPct) / 100 * 100) / 100 : 0
        const total = Math.round((amount + gstAmount) * 100) / 100

        // Generate invoice number atomically to prevent race conditions
        const prefix = config?.invoicePrefix || 'INV'
        const year = now.getFullYear().toString().slice(-2)
        const month = (now.getMonth() + 1).toString().padStart(2, '0')

        const sequenceKey = `INVOICE_${prefix}_${year}${month}`
        const sequence = await getNextSequenceValue(sequenceKey, 0)

        const invoiceNumber = `${prefix}-${year}${month}-${sequence.toString().padStart(4, '0')}`

        // Due date
        const paymentDays = getPaymentDays(client.paymentTerms || 'NET_30', client.customPaymentDays)
        const dueDate = new Date(now)
        dueDate.setDate(dueDate.getDate() + paymentDays)

        // Create invoice in a transaction
        await prisma.$transaction(async (tx) => {
          await tx.invoice.create({
            data: {
              invoiceNumber,
              clientId,
              amount,
              tax: gstAmount,
              total,
              status: 'DRAFT',
              dueDate,
              serviceMonth: invoiceMonth,
              entityType: client.entityType || 'BRANDING_PIONEERS',
              items: JSON.stringify([{
                description: `Monthly Retainer - ${invoiceMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                quantity: 1,
                rate: amount,
                amount
              }])
            }
          })
        })

        generated++
      } catch (err) {
        console.error(`Failed for client ${clientId}:`, err)
        errors.push(`Failed for client ${clientId}`)
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Bulk invoice error:', error)
    return NextResponse.json({ error: 'Failed to generate invoices' }, { status: 500 })
  }
})

function getPaymentDays(terms: string, customDays?: number | null): number {
  switch (terms) {
    case 'IMMEDIATE': return 0
    case 'NET_15': return 15
    case 'NET_30': return 30
    case 'NET_45': return 45
    case 'CUSTOM': return customDays || 30
    default: return 30
  }
}
