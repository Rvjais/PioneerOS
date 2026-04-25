import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import prisma from '@/server/db/prisma'
import { ACCESS_INSTRUCTIONS } from '@/server/integrations/service-accounts'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Send access instructions to client
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const { id } = await params
    const body = await request.json()
    const { channel } = body // 'whatsapp' or 'email'

    // Get access request with client details
    const accessRequest = await prisma.oAuthAccessRequest.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            whatsapp: true,
          },
        },
      },
    })

    if (!accessRequest) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    // Get instructions for this service type
    const instructions =
      ACCESS_INSTRUCTIONS[accessRequest.serviceType as keyof typeof ACCESS_INSTRUCTIONS]

    if (!instructions) {
      return NextResponse.json(
        { error: 'No instructions available for this service type' },
        { status: 400 }
      )
    }

    // Format message
    const message = formatInstructionMessage(
      accessRequest.client.name,
      instructions.title,
      instructions.steps,
      instructions.targetEmail
    )

    // Send via chosen channel
    if (channel === 'whatsapp') {
      const phone = accessRequest.client.whatsapp || accessRequest.client.contactPhone
      if (!phone) {
        return NextResponse.json(
          { error: 'No WhatsApp number available for client' },
          { status: 400 }
        )
      }

      // For now, return the message for manual sending
      // In production, integrate with WBizTool
      return NextResponse.json({
        success: true,
        channel: 'whatsapp',
        phone,
        message,
        instructions: instructions.steps,
        targetEmail: instructions.targetEmail,
        note: 'Message prepared for WhatsApp. Copy and send manually or integrate with WBizTool.',
      })
    } else if (channel === 'email') {
      const email = accessRequest.client.contactEmail
      if (!email) {
        return NextResponse.json(
          { error: 'No email address available for client' },
          { status: 400 }
        )
      }

      // For now, return the message for manual sending
      // In production, integrate with Resend
      return NextResponse.json({
        success: true,
        channel: 'email',
        email,
        subject: `Action Required: ${instructions.title}`,
        message,
        instructions: instructions.steps,
        targetEmail: instructions.targetEmail,
        note: 'Email prepared. Copy and send manually or integrate with Resend.',
      })
    }

    // Update request status
    await prisma.oAuthAccessRequest.update({
      where: { id },
      data: {
        instructionsSentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Instructions sent successfully',
    })
  } catch (error) {
    console.error('Failed to send instructions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatInstructionMessage(
  clientName: string,
  title: string,
  steps: string[],
  targetEmail: string
): string {
  const stepsText = steps.map((step, i) => `${i + 1}. ${step}`).join('\n')

  return `Hi ${clientName},

We need you to grant us access to your ${title.toLowerCase().replace(' access', '')} account for managing your marketing campaigns.

Please follow these steps:
${stepsText}

The email to add is: ${targetEmail}

Once done, please let us know and we'll confirm the access on our end.

Thank you!
Team Branding Pioneers`
}
