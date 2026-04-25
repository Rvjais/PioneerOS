import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { randomBytes } from 'crypto'
import { notifyClientWelcome, sendCustomNotification } from '@/server/notifications'
import { notifyAccountsTeam } from '@/server/services/clientBilling'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    const { clientId } = await routeParams!
    const body = await req.json()
    const schema = z.object({
      teamMembers: z.array(z.object({
        userId: z.string().min(1),
        role: z.string().min(1).max(100),
        isPrimary: z.boolean().optional(),
      })).optional(),
    }).passthrough()
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check prerequisites
    if (!client.slaSigned || !client.initialPaymentConfirmed) {
      return NextResponse.json({
        error: 'SLA must be signed and payment confirmed before activation',
      }, { status: 400 })
    }

    // Update client to active
    await prisma.client.update({
      where: { id: clientId },
      data: {
        status: 'ACTIVE',
        lifecycleStage: 'ACTIVE',
        onboardingStatus: 'COMPLETED',
        startDate: new Date(),
      },
    })

    // Assign team members if provided
    if (body.teamMembers && body.teamMembers.length > 0) {
      for (const member of body.teamMembers as { userId: string; role: string; isPrimary?: boolean }[]) {
        // Check if member already exists
        const existingMember = await prisma.clientTeamMember.findUnique({
          where: {
            clientId_userId: { clientId, userId: member.userId }
          }
        })
        if (!existingMember) {
          await prisma.clientTeamMember.create({
            data: {
              clientId,
              userId: member.userId,
              role: member.role,
              isPrimary: member.isPrimary || false,
            }
          })
        }
      }
    }

    // Create initial scope records
    const services = safeJsonParse(client.selectedServices as string, [])
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    // Default scope items based on tier
    const defaultScopes: Record<string, { category: string; item: string; quantity: number }[]> = {
      ENTERPRISE: [
        { category: 'SEO', item: 'blogs', quantity: 8 },
        { category: 'SOCIAL', item: 'posts', quantity: 20 },
        { category: 'SOCIAL', item: 'reels', quantity: 8 },
        { category: 'ADS', item: 'campaigns', quantity: 4 },
      ],
      PREMIUM: [
        { category: 'SEO', item: 'blogs', quantity: 4 },
        { category: 'SOCIAL', item: 'posts', quantity: 12 },
        { category: 'SOCIAL', item: 'reels', quantity: 4 },
        { category: 'ADS', item: 'campaigns', quantity: 2 },
      ],
      STANDARD: [
        { category: 'SEO', item: 'blogs', quantity: 2 },
        { category: 'SOCIAL', item: 'posts', quantity: 8 },
        { category: 'SOCIAL', item: 'reels', quantity: 2 },
      ],
    }

    const scopeItems = defaultScopes[client.tier] || defaultScopes.STANDARD

    await prisma.clientScope.createMany({
      data: scopeItems.map((item) => ({
        clientId,
        category: item.category,
        item: item.item,
        quantity: item.quantity,
        month: currentMonth,
      })),
    })

    // Log lifecycle event
    await prisma.clientLifecycleEvent.create({
      data: {
        clientId,
        fromStage: 'ONBOARDING',
        toStage: 'ACTIVE',
        triggeredBy: user.id,
        notes: 'Project activated - Team assigned, scope created',
      },
    })

    // Send welcome notification via WhatsApp
    await notifyClientWelcome(clientId)

    // Create client user for portal access
    if (client.contactEmail) {
      const otpCode = randomBytes(3).toString('hex').toUpperCase()

      await prisma.clientUser.upsert({
        where: { email: client.contactEmail },
        create: {
          clientId,
          email: client.contactEmail,
          name: client.contactName || client.name,
          phone: client.contactPhone,
          otpCode,
          otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        update: {
          otpCode,
          otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      // Send WhatsApp notification with portal access info
      if (client.contactPhone || client.whatsapp) {
        const phone = client.whatsapp || client.contactPhone || ''
        await sendCustomNotification(
          phone,
          `Hi ${client.contactName || client.name}!\n\nYour client portal is ready!\n\nLogin: ${client.contactEmail}\nOTP: ${otpCode}\n\nVisit your portal to track project progress.\n\nWelcome to Branding Pioneers!`,
          { clientId }
        )
      }
      // OTP sent via WhatsApp notification
    }

    // Notify assigned team members
    if (body.teamMembers && body.teamMembers.length > 0) {
      await prisma.notification.createMany({
        data: body.teamMembers.map((member: { userId: string }) => ({
          userId: member.userId,
          type: 'GENERAL',
          title: 'New Client Assignment',
          message: `You have been assigned to ${client.name}. The project is now active.`,
          link: `/clients/${clientId}`,
          priority: 'HIGH',
        })),
      })
    }

    // Notify accounts team to generate first invoice
    await notifyAccountsTeam('CLIENT_ACTIVATED', clientId).catch((err) => {
      console.error('Failed to notify accounts team:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Project activated successfully',
    })
  } catch (error) {
    console.error('Failed to activate project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
