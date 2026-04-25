import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { maskSensitive } from '@/server/security/encryption'
import { z } from 'zod'

// Check if user is super admin
async function checkSuperAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === 'SUPER_ADMIN'
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admin can add payment gateways
    const isSuperAdmin = await checkSuperAdmin(session.user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
    }

    const { entityId } = await params
    const body = await req.json()
    const schema = z.object({
      provider: z.string().min(1).max(100),
      displayName: z.string().max(200).optional(),
      merchantId: z.string().max(200).optional(),
      apiKeyId: z.string().max(500).optional(),
      apiKeySecret: z.string().max(500).optional(),
      webhookSecret: z.string().max(500).optional(),
      mode: z.string().max(20).optional(),
      defaultCurrency: z.string().max(10).optional(),
      feePercentage: z.union([z.string(), z.number()]).optional(),
      isPrimary: z.boolean().optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { provider, displayName, merchantId, apiKeyId, apiKeySecret, webhookSecret, mode, defaultCurrency, feePercentage, isPrimary } = result.data

    // If setting as primary, unset other primaries for this entity
    if (isPrimary) {
      await prisma.entityPaymentGateway.updateMany({
        where: { entityId, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    // Gateway credentials will be automatically encrypted by Prisma middleware
    const gateway = await prisma.entityPaymentGateway.create({
      data: {
        entityId,
        provider,
        displayName: displayName || provider,
        merchantId: merchantId || null,
        apiKeyId: apiKeyId || null,
        apiKeySecret: apiKeySecret || null,
        webhookSecret: webhookSecret || null,
        mode: mode || 'LIVE',
        defaultCurrency: defaultCurrency || 'INR',
        feePercentage: feePercentage ? parseFloat(String(feePercentage)) : null,
        isPrimary: isPrimary || false,
      },
    })

    // Return masked data in response
    return NextResponse.json({
      ...gateway,
      merchantId: gateway.merchantId ? maskSensitive(gateway.merchantId, 4) : null,
      apiKeyId: gateway.apiKeyId ? maskSensitive(gateway.apiKeyId, 4) : null,
      apiKeySecret: gateway.apiKeySecret ? '********' : null,
      webhookSecret: gateway.webhookSecret ? '********' : null,
    })
  } catch (error) {
    console.error('Failed to create payment gateway:', error)
    return NextResponse.json({ error: 'Failed to create payment gateway' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admin can delete payment gateways
    const isSuperAdmin = await checkSuperAdmin(session.user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const gatewayId = searchParams.get('gatewayId')

    if (!gatewayId) {
      return NextResponse.json({ error: 'Gateway ID required' }, { status: 400 })
    }

    await prisma.entityPaymentGateway.delete({
      where: { id: gatewayId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete payment gateway:', error)
    return NextResponse.json({ error: 'Failed to delete payment gateway' }, { status: 500 })
  }
}
