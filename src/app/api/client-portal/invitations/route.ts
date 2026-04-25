import { NextRequest, NextResponse } from 'next/server'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { prisma } from '@/server/db/prisma'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { Resend } from 'resend'
import { getCredentialsWithFallback } from '@/server/api-credentials'

// Get Resend client for sending emails
async function getResendClient(): Promise<Resend | null> {
  try {
    const credentials = await getCredentialsWithFallback('RESEND')
    const apiKey = credentials.apiKey || process.env.RESEND_API_KEY
    if (!apiKey) return null
    return new Resend(apiKey)
  } catch {
    return null
  }
}

async function getFromEmail(): Promise<string> {
  const credentials = await getCredentialsWithFallback('RESEND')
  return credentials.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@brandingpioneers.in'
}

// Send invitation email to new client user
async function sendInvitationEmail(
  email: string,
  name: string,
  clientName: string,
  inviteUrl: string,
  inviterName: string
): Promise<{ success: boolean; error?: string }> {
  const resend = await getResendClient()
  if (!resend) {
    console.error('[INVITATION] Email not configured, skipping email send')
    return { success: false, error: 'Email not configured' }
  }

  const fromEmail = await getFromEmail()

  try {
    const { error } = await resend.emails.send({
      from: `Pioneer OS <${fromEmail}>`,
      to: [email],
      subject: `You're invited to join ${clientName} on Pioneer OS`,
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
                <span style="color: white; font-size: 24px; font-weight: bold;">Pioneer<span style="opacity: 0.9;">OS</span></span>
              </div>
            </div>

            <div style="background: linear-gradient(180deg, #141A25 0%, #0F1419 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
                Hey ${name}!
              </h1>
              <p style="color: #94A3B8; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
                ${inviterName} has invited you to join <strong style="color: white;">${clientName}</strong> on Pioneer OS.
              </p>

              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>

              <p style="color: #64748B; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
                This invitation expires in <strong style="color: #F59E0B;">7 days</strong>
              </p>

              <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;"></div>

              <p style="color: #64748B; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link:
              </p>
              <p style="color: #3B82F6; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
                ${inviteUrl}
              </p>
            </div>

            <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
              Didn't expect this invitation? You can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('[INVITATION] Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[INVITATION] Email error:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

// Log activity
async function logActivity(clientUserId: string, action: string, resource?: string, resourceType?: string, details?: object) {
  await prisma.clientUserActivity.create({
    data: {
      clientUserId,
      action,
      resource,
      resourceType,
      details: details ? JSON.stringify(details) : null,
    },
  })
}

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['PRIMARY', 'SECONDARY', 'VIEWER']).default('SECONDARY'),
})

// GET /api/client-portal/invitations - List invitations (PRIMARY only)
export const GET = withClientAuth(async (req, { user }) => {
  if (user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'Only primary users can manage invitations' }, { status: 403 })
  }

  const invitations = await prisma.clientUserInvitation.findMany({
    where: { clientId: user.clientId },
    orderBy: { createdAt: 'desc' },
    include: {
      invitedBy: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json({ invitations })
}, { rateLimit: 'READ' })

// POST /api/client-portal/invitations - Create invitation (PRIMARY only)
export const POST = withClientAuth(async (req, { user }) => {
  if (user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'Only primary users can send invitations' }, { status: 403 })
  }

  const body = await req.json()
  const validation = inviteSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const { email, name, role } = validation.data

  // Check if user already exists
  const existingUser = await prisma.clientUser.findUnique({
    where: { email },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
  }

  // Check if there's already a pending invitation
  const existingInvite = await prisma.clientUserInvitation.findFirst({
    where: {
      clientId: user.clientId,
      email,
      status: 'PENDING',
    },
  })

  if (existingInvite) {
    return NextResponse.json({ error: 'An invitation is already pending for this email' }, { status: 409 })
  }

  // Create invitation
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invitation = await prisma.clientUserInvitation.create({
    data: {
      clientId: user.clientId,
      email,
      name,
      role,
      token,
      expiresAt,
      invitedById: user.id,
    },
  })

  // Log activity
  await logActivity(user.id, 'SEND_INVITATION', `invitation:${invitation.id}`, 'INVITATION', { email, role })

  // Send invitation email
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/client-login?invite=${token}`

  const emailResult = await sendInvitationEmail(
    email,
    name,
    user.client.name,
    inviteUrl,
    user.name
  )

  if (!emailResult.success) {
    console.error(`[INVITATION] Email not sent (${emailResult.error}), but invitation created. InvitationId: ${invitation.id}`)
  }

  return NextResponse.json({
    success: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
    },
    emailSent: emailResult.success,
    // Include invite URL for development/manual sharing
    inviteUrl,
  })
}, { rateLimit: 'WRITE' })

// DELETE /api/client-portal/invitations - Cancel invitation (PRIMARY only)
export const DELETE = withClientAuth(async (req, { user }) => {
  if (user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'Only primary users can cancel invitations' }, { status: 403 })
  }

  const searchParams = req.nextUrl.searchParams
  const invitationId = searchParams.get('id')

  if (!invitationId) {
    return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 })
  }

  const invitation = await prisma.clientUserInvitation.findFirst({
    where: {
      id: invitationId,
      clientId: user.clientId,
      status: 'PENDING',
    },
  })

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
  }

  await prisma.clientUserInvitation.update({
    where: { id: invitationId },
    data: { status: 'CANCELLED' },
  })

  await logActivity(user.id, 'CANCEL_INVITATION', `invitation:${invitationId}`, 'INVITATION', { email: invitation.email })

  return NextResponse.json({ success: true })
}, { rateLimit: 'WRITE' })
