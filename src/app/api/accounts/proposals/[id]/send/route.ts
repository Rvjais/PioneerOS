import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/utils'
import { sendWhatsAppMessage, NotificationTemplates } from '@/server/notifications/wbiztool'
import { Resend } from 'resend'
import { getCredentialsWithFallback } from '@/server/api-credentials'
import { withAuth } from '@/server/auth/withAuth'

// Send proposal notification to client via WhatsApp and/or Email
async function sendProposalNotification(
  proposal: {
    prospectName: string | null
    prospectEmail: string | null
    prospectPhone: string | null
    totalPrice: number
  },
  proposalUrl: string
): Promise<{ whatsapp?: boolean; email?: boolean }> {
  const results: { whatsapp?: boolean; email?: boolean } = {}
  const clientName = proposal.prospectName || 'Valued Client'

  // Send WhatsApp notification if phone available
  if (proposal.prospectPhone) {
    try {
      const message = `Hi ${clientName},\n\nYour proposal from Branding Pioneers is ready!\n\nTotal: Rs.${proposal.totalPrice.toLocaleString('en-IN')}\n\nView your proposal here:\n${proposalUrl}\n\nPlease review and let us know if you have any questions.\n\nThank you!`

      const result = await sendWhatsAppMessage({
        phone: proposal.prospectPhone,
        message,
      })
      results.whatsapp = result.status === 1
    } catch (err) {
      console.error('[PROPOSAL] WhatsApp send error:', err)
      results.whatsapp = false
    }
  }

  // Send email notification if email available
  if (proposal.prospectEmail) {
    try {
      const credentials = await getCredentialsWithFallback('RESEND')
      const apiKey = credentials.apiKey || process.env.RESEND_API_KEY

      if (apiKey) {
        const resend = new Resend(apiKey)
        const fromEmail = credentials.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@brandingpioneers.in'

        const { error } = await resend.emails.send({
          from: `Pioneer OS <${fromEmail}>`,
          to: [proposal.prospectEmail],
          subject: 'Your Proposal from Branding Pioneers',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0B0E14;">
              <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 16px 24px; border-radius: 16px;">
                    <span style="color: white; font-size: 24px; font-weight: bold;">Branding<span style="opacity: 0.9;">Pioneers</span></span>
                  </div>
                </div>

                <div style="background: linear-gradient(180deg, #141A25 0%, #0F1419 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
                  <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
                    Hi ${clientName}!
                  </h1>
                  <p style="color: #94A3B8; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
                    Your proposal is ready for review.
                  </p>

                  <div style="background: rgba(59, 130, 246, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                    <p style="color: #64748B; font-size: 14px; margin: 0 0 8px 0;">Total Amount</p>
                    <p style="color: white; font-size: 28px; font-weight: bold; margin: 0;">Rs.${proposal.totalPrice.toLocaleString('en-IN')}</p>
                  </div>

                  <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${proposalUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      View Proposal
                    </a>
                  </div>

                  <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;"></div>

                  <p style="color: #64748B; font-size: 12px; margin: 0;">
                    If the button doesn't work, copy and paste this link:
                  </p>
                  <p style="color: #3B82F6; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
                    ${proposalUrl}
                  </p>
                </div>

                <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
                  Questions? Reply to this email or contact us.
                </p>
              </div>
            </body>
            </html>
          `,
        })

        results.email = !error
        if (error) {
          console.error('[PROPOSAL] Email send error:', error)
        }
      }
    } catch (err) {
      console.error('[PROPOSAL] Email error:', err)
      results.email = false
    }
  }

  return results
}

type RouteParams = {
  params: Promise<{ id: string }>
}

// POST - Send proposal to client (update status to SENT)
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { id } = await routeParams!

    const proposal = await prisma.clientProposal.findUnique({
      where: { id },
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (proposal.status !== 'DRAFT') {
      return NextResponse.json(
        { error: `Cannot send a proposal with status: ${proposal.status}` },
        { status: 400 }
      )
    }

    // Check if proposal has expired
    if (new Date(proposal.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Proposal has expired. Please extend the validity or create a new proposal.' },
        { status: 400 }
      )
    }

    // Update status to SENT
    const updatedProposal = await prisma.clientProposal.update({
      where: { id },
      data: {
        status: 'SENT',
      },
    })

    // Generate the proposal URL
    const baseUrl = process.env.NEXTAUTH_URL
    if (!baseUrl) {
      console.error('NEXTAUTH_URL not configured - cannot generate proposal URL')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 503 })
    }
    const proposalUrl = `${baseUrl}/proposal/${proposal.token}`

    // Send notification to client via WhatsApp and/or Email
    const notificationResults = await sendProposalNotification(
      {
        prospectName: proposal.prospectName,
        prospectEmail: proposal.prospectEmail,
        prospectPhone: proposal.prospectPhone,
        totalPrice: proposal.totalPrice,
      },
      proposalUrl
    )

    const notificationsSent = Object.entries(notificationResults)
      .filter(([, sent]) => sent)
      .map(([channel]) => channel)

    return NextResponse.json({
      success: true,
      proposalUrl,
      message: notificationsSent.length > 0
        ? `Proposal sent via ${notificationsSent.join(' and ')}.`
        : 'Proposal marked as sent. Share the link with the client manually.',
      notificationsSent,
      proposal: {
        ...updatedProposal,
        services: safeJsonParse(updatedProposal.services, []),
        scopeItems: safeJsonParse(updatedProposal.scopeItems, []),
      },
    })
  } catch (error) {
    console.error('Failed to send proposal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
