import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { sendInvoiceEmail } from '@/server/email/email'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const sendInvoiceSchema = z.object({
  sendViaWhatsApp: z.boolean().optional(),
  sendViaEmail: z.boolean().optional(),
  customMessage: z.string().optional(),
})

// POST /api/accounts/auto-invoice/send/[invoiceId] - Send invoice to client
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const hasAccess = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(user.role) ||
                      user.department === 'ACCOUNTS'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { invoiceId } = await routeParams!
    const raw = await req.json()
    const parsed = sendInvoiceSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { sendViaWhatsApp, sendViaEmail, customMessage } = parsed.data

    // Get invoice with client
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          include: {
            autoInvoiceConfig: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    const client = invoice.client
    const config = client.autoInvoiceConfig

    // Determine channels
    const useWhatsApp = sendViaWhatsApp ?? config?.sendViaWhatsApp ?? true
    const useEmail = sendViaEmail ?? config?.sendViaEmail ?? true

    const results = {
      whatsApp: { sent: false, error: null as string | null },
      email: { sent: false, error: null as string | null }
    }

    // Format invoice message
    const message = customMessage || formatInvoiceMessage(invoice, client)

    // Send via WhatsApp
    if (useWhatsApp && client.whatsapp) {
      try {
        const whatsappResult = await sendWhatsAppMessage({
          phone: client.whatsapp,
          message
        })
        if (whatsappResult.status === 1) {
          results.whatsApp.sent = true

          // Log communication
          await prisma.communicationLog.create({
            data: {
              clientId: client.id,
              type: 'WHATSAPP',
              subject: `Invoice ${invoice.invoiceNumber}`,
              content: message,
              status: 'SENT',
              sentAt: new Date(),
              userId: user.id
            }
          })
        } else {
          results.whatsApp.error = whatsappResult.message || 'Failed to send'
        }
      } catch (whatsappError) {
        results.whatsApp.error = whatsappError instanceof Error ? whatsappError.message : 'WhatsApp error'
      }
    } else if (useWhatsApp && !client.whatsapp) {
      results.whatsApp.error = 'No WhatsApp number configured'
    }

    // Send via Email
    if (useEmail && client.contactEmail) {
      try {
        const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })

        const amount = new Intl.NumberFormat('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(invoice.total)

        const emailResult = await sendInvoiceEmail(client.contactEmail, {
          clientName: client.name,
          contactName: client.contactName || client.name,
          invoiceNumber: invoice.invoiceNumber,
          amount,
          dueDate,
          currency: invoice.currency || 'INR',
          notes: invoice.notes || undefined
        })

        if (emailResult.success) {
          results.email.sent = true

          // Log communication
          await prisma.communicationLog.create({
            data: {
              clientId: client.id,
              type: 'EMAIL',
              subject: `Invoice ${invoice.invoiceNumber} - ${client.name}`,
              content: message,
              status: 'SENT',
              sentAt: new Date(),
              userId: user.id
            }
          })
        } else {
          results.email.error = emailResult.error || 'Failed to send email'

          // Log failed attempt
          await prisma.communicationLog.create({
            data: {
              clientId: client.id,
              type: 'EMAIL',
              subject: `Invoice ${invoice.invoiceNumber} - ${client.name}`,
              content: message,
              status: 'FAILED',
              userId: user.id
            }
          })
        }
      } catch (emailError) {
        results.email.error = emailError instanceof Error ? emailError.message : 'Email error'
      }
    } else if (useEmail && !client.contactEmail) {
      results.email.error = 'No email configured'
    }

    // Update invoice status if at least one channel succeeded
    const anySuccess = results.whatsApp.sent || results.email.sent
    if (anySuccess) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'SENT' }
      })

      // Update config if exists
      if (config) {
        await prisma.autoInvoiceConfig.update({
          where: { clientId: client.id },
          data: { lastSentAt: new Date() }
        })
      }
    }

    return NextResponse.json({
      success: anySuccess,
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      clientName: client.name,
      results,
      invoiceStatus: anySuccess ? 'SENT' : invoice.status
    })
  } catch (error) {
    console.error('Failed to send invoice:', error)
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 })
  }
})

interface InvoiceForMessage {
  invoiceNumber: string
  dueDate: string | Date
  currency?: string | null
  total: number
  notes?: string | null
}

interface ClientForMessage {
  name: string
  contactName?: string | null
}

function formatInvoiceMessage(invoice: InvoiceForMessage, client: ClientForMessage): string {
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const amount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: invoice.currency || 'INR'
  }).format(invoice.total)

  return `Dear ${client.contactName || client.name},

Greetings from Branding Pioneers!

Please find below the invoice details for your review:

📄 *Invoice #${invoice.invoiceNumber}*
💰 Amount: ${amount}
📅 Due Date: ${dueDate}

${invoice.notes || ''}

Please ensure timely payment to continue uninterrupted services.

For any queries, feel free to reach out.

Best regards,
Accounts Team
Branding Pioneers`
}
