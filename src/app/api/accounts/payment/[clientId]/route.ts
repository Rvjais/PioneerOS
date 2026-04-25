import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { notifyClientWelcome } from '@/server/notifications'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const confirmPaymentSchema = z.object({
  confirmed: z.boolean(),
})

export const POST = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // Authorization: only SUPER_ADMIN, MANAGER, or ACCOUNTS can confirm payments
    const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
    if (!allowedRoles.includes(user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { clientId } = await routeParams!
    const raw = await req.json()
    const parsed = confirmPaymentSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 })
    }

    if (parsed.data.confirmed) {
      // Atomic transaction to prevent race conditions and ensure consistency
      await prisma.$transaction(async (tx) => {
        const existingClient = await tx.client.findUnique({
          where: { id: clientId },
          select: { initialPaymentConfirmed: true },
        })

        if (!existingClient) {
          throw new Error('CLIENT_NOT_FOUND')
        }

        if (existingClient.initialPaymentConfirmed) {
          throw new Error('ALREADY_CONFIRMED')
        }

        // Update client status
        await tx.client.update({
          where: { id: clientId },
          data: {
            initialPaymentConfirmed: true,
            initialPaymentDate: new Date(),
            onboardingStatus: 'COMPLETED',
            status: 'ACTIVE',
            lifecycleStage: 'ACTIVE',
          },
        })

        // Log lifecycle event
        await tx.clientLifecycleEvent.create({
          data: {
            clientId,
            fromStage: 'AWAITING_PAYMENT',
            toStage: 'ACTIVE',
            triggeredBy: user.id,
            notes: 'Initial payment confirmed - Project activated',
          },
        })
      })

      // Get client details for notifications
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: {
          name: true,
          contactEmail: true,
          monthlyFee: true,
          tier: true,
        },
      })

      // Notify all managers that a new project is activated
      const managers = await prisma.user.findMany({
        where: {
          role: { in: ['MANAGER', 'SUPER_ADMIN'] },
          deletedAt: null,
        },
        select: { id: true },
      })

      await prisma.notification.createMany({
        data: managers.map((user) => ({
          userId: user.id,
          type: 'GENERAL',
          title: 'New Project Activated',
          message: `${client?.name} (${client?.tier}) is now active. Monthly fee: ₹${((client?.monthlyFee || 0) / 1000).toFixed(0)}K`,
          link: `/clients/${clientId}`,
          priority: 'HIGH',
        })),
      })

      // Send WhatsApp welcome message
      await notifyClientWelcome(clientId)

      // Create client portal credentials if they don't exist
      const existingClientUser = await prisma.clientUser.findFirst({
        where: { clientId },
      })

      if (!existingClientUser && client?.contactEmail) {
        const otpCode = randomBytes(6).toString('hex').toUpperCase()
        await prisma.clientUser.create({
          data: {
            clientId,
            email: client.contactEmail,
            name: client.name,
            role: 'PRIMARY',
            isActive: true,
            otpCode,
            otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        })
        // Client portal credentials created - OTP should be sent via secure channel
      }

      // Project activated

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and project activated',
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    // Handle known transaction errors gracefully
    if (error instanceof Error) {
      if (error.message === 'ALREADY_CONFIRMED') {
        return NextResponse.json({ success: true, message: 'Already confirmed' })
      }
      if (error.message === 'CLIENT_NOT_FOUND') {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
    }
    console.error('Failed to confirm payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'] })
