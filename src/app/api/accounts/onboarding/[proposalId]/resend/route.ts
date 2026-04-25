import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { z } from 'zod'
import { sendOnboardingEmail } from '@/server/email/email'
import { sendWhatsAppMessage } from '@/server/notifications/wbiztool'
import { withAuth } from '@/server/auth/withAuth'

// Schema for resending link
const resendSchema = z.object({
  extendDays: z.number().min(1).max(30).default(7),
  sendEmail: z.boolean().default(true),
  newEmail: z.string().email().optional(),
})

// POST: Resend onboarding link and extend expiration
export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { proposalId } = await routeParams!
    const body = await req.json()

    // Validate input
    const validation = resendSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Find proposal
    const proposal = await prisma.clientProposal.findUnique({
      where: { id: proposalId },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Cannot resend if already completed
    if (proposal.status === 'ACTIVATED') {
      return NextResponse.json(
        { error: 'Cannot resend link for activated proposals' },
        { status: 400 }
      )
    }

    // Calculate new expiration
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + data.extendDays)

    // Update proposal
    const updated = await prisma.clientProposal.update({
      where: { id: proposalId },
      data: {
        expiresAt: newExpiresAt,
        prospectEmail: data.newEmail || proposal.prospectEmail,
        // Reset to SENT if was expired
        status: proposal.status === 'EXPIRED' ? 'SENT' : proposal.status,
      },
    })

    // Generate URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const onboardingUrl = `${baseUrl}/onboarding/${proposal.token}`

    // Send notifications if requested
    let emailSent = false
    let whatsappSent = false

    if (data.sendEmail) {
      const email = data.newEmail || proposal.prospectEmail
      if (email) {
        const result = await sendOnboardingEmail({
          to: email,
          name: proposal.prospectName || '',
          onboardingUrl,
          expiresAt: newExpiresAt,
        })
        emailSent = result.success
      }

      // Also try WhatsApp if phone is available
      if (proposal.prospectPhone) {
        try {
          const whatsappResult = await sendWhatsAppMessage({
            phone: proposal.prospectPhone,
            message: `Hi ${proposal.prospectName || 'there'}!\n\nHere's your onboarding link for Branding Pioneers:\n${onboardingUrl}\n\nPlease complete your onboarding to get started.\n\nThank you!`,
          })
          whatsappSent = whatsappResult.status === 1
        } catch (err) {
          console.error('[ONBOARDING_RESEND] WhatsApp error:', err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Link extended successfully',
      proposal: {
        id: updated.id,
        token: updated.token,
        url: onboardingUrl,
        expiresAt: newExpiresAt,
        email: updated.prospectEmail,
      },
      notificationsSent: {
        email: emailSent,
        whatsapp: whatsappSent,
      },
    })
  } catch (error) {
    console.error('Error resending link:', error)
    return NextResponse.json(
      { error: 'Failed to resend link' },
      { status: 500 }
    )
  }
})
