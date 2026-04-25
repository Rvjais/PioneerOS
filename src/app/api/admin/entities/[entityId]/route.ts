import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { maskEntityData } from '@/server/admin/maskEntity'
import { z } from 'zod'
import { logAdminAction } from '@/server/services/adminAudit'

// Check if user has super admin or accounts role
async function checkFinanceAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, department: true },
  })
  return {
    hasAccess: user?.role === 'SUPER_ADMIN' || user?.role === 'ACCOUNTS' || user?.department === 'ACCOUNTS',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hasAccess, isSuperAdmin } = await checkFinanceAccess(session.user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied. Finance/Admin only.' }, { status: 403 })
    }

    const { entityId } = await params
    const searchParams = req.nextUrl.searchParams
    const showFull = searchParams.get('showFull') === 'true' && isSuperAdmin

    const entity = await prisma.companyEntity.findUnique({
      where: { id: entityId },
      include: {
        bankAccounts: true,
        paymentGateways: true,
      },
    })

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }

    return NextResponse.json(maskEntityData(entity, showFull))
  } catch (error) {
    console.error('Failed to fetch entity:', error)
    return NextResponse.json({ error: 'Failed to fetch entity' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admin can modify entities
    const { isSuperAdmin } = await checkFinanceAccess(session.user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
    }

    const { entityId } = await params
    const body = await req.json()
    const patchSchema = z.object({
      name: z.string().min(1).max(300).optional(),
      tradeName: z.string().max(300).optional(),
      type: z.string().max(50).optional(),
      country: z.string().max(10).optional(),
      gstNumber: z.string().max(50).optional(),
      panNumber: z.string().max(50).optional(),
      cinNumber: z.string().max(50).optional(),
      einNumber: z.string().max(50).optional(),
      tanNumber: z.string().max(50).optional(),
      email: z.string().email().optional(),
      phone: z.string().max(20).optional(),
      website: z.string().max(500).optional(),
      invoicePrefix: z.string().max(20).optional(),
      registeredAddress: z.string().max(500).optional(),
      operatingAddress: z.string().max(500).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      pincode: z.string().max(20).optional(),
      logoUrl: z.string().max(1000).optional(),
      isActive: z.boolean().optional(),
      isPrimary: z.boolean().optional(),
    })
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const validData = parsed.data
    const updateData: Record<string, unknown> = {}

    if (validData.name !== undefined) updateData.name = validData.name
    if (validData.tradeName !== undefined) updateData.tradeName = validData.tradeName || null
    if (validData.type !== undefined) updateData.type = validData.type
    if (validData.country !== undefined) updateData.country = validData.country
    if (validData.gstNumber !== undefined) updateData.gstNumber = validData.gstNumber || null
    if (validData.panNumber !== undefined) updateData.panNumber = validData.panNumber || null
    if (validData.cinNumber !== undefined) updateData.cinNumber = validData.cinNumber || null
    if (validData.einNumber !== undefined) updateData.einNumber = validData.einNumber || null
    if (validData.tanNumber !== undefined) updateData.tanNumber = validData.tanNumber || null
    if (validData.email !== undefined) updateData.email = validData.email || null
    if (validData.phone !== undefined) updateData.phone = validData.phone || null
    if (validData.website !== undefined) updateData.website = validData.website || null
    if (validData.invoicePrefix !== undefined) updateData.invoicePrefix = validData.invoicePrefix
    if (validData.registeredAddress !== undefined) updateData.registeredAddress = validData.registeredAddress || null
    if (validData.operatingAddress !== undefined) updateData.operatingAddress = validData.operatingAddress || null
    if (validData.city !== undefined) updateData.city = validData.city || null
    if (validData.state !== undefined) updateData.state = validData.state || null
    if (validData.pincode !== undefined) updateData.pincode = validData.pincode || null
    if (validData.logoUrl !== undefined) updateData.logoUrl = validData.logoUrl || null
    if (validData.isActive !== undefined) updateData.isActive = validData.isActive

    // Handle primary flag
    if (validData.isPrimary === true) {
      updateData.isPrimary = true
    } else if (validData.isPrimary === false) {
      updateData.isPrimary = false
    }

    // Use transaction to prevent race condition when toggling primary
    const entity = await prisma.$transaction(async (tx) => {
      if (validData.isPrimary === true) {
        await tx.companyEntity.updateMany({
          where: { isPrimary: true },
          data: { isPrimary: false },
        })
      }
      return tx.companyEntity.update({
        where: { id: entityId },
        data: updateData,
      })
    })

    const changedFields = Object.keys(updateData).join(', ')
    await logAdminAction({
      userId: session.user.id,
      action: 'ENTITY_UPDATE',
      title: 'Company Entity Updated',
      message: `Updated entity ${entityId}: changed ${changedFields}`,
      link: '/admin/entities',
    })

    return NextResponse.json(entity)
  } catch (error) {
    console.error('Failed to update entity:', error)
    return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 })
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

    // Only super admin can delete entities
    const { isSuperAdmin } = await checkFinanceAccess(session.user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
    }

    const { entityId } = await params

    // Check for related records before deleting
    const entityForCode = await prisma.companyEntity.findUnique({
      where: { id: entityId },
      select: { code: true },
    })
    const [invoiceCount, bankAccountCount, gatewayCount] = await Promise.all([
      prisma.invoice.count({ where: { entityType: entityForCode?.code ?? entityId } }),
      prisma.entityBankAccount.count({ where: { entityId } }),
      prisma.entityPaymentGateway.count({ where: { entityId } }),
    ])

    if (invoiceCount > 0 || bankAccountCount > 0 || gatewayCount > 0) {
      return NextResponse.json({
        error: 'Cannot delete entity with existing invoices, bank accounts, or payment gateways. Remove related records first.',
        related: { invoices: invoiceCount, bankAccounts: bankAccountCount, paymentGateways: gatewayCount },
      }, { status: 409 })
    }

    // Get entity name before deleting for audit trail
    const entity = await prisma.companyEntity.findUnique({
      where: { id: entityId },
      select: { name: true, code: true },
    })

    await prisma.companyEntity.delete({
      where: { id: entityId },
    })

    await logAdminAction({
      userId: session.user.id,
      action: 'ENTITY_DELETE',
      title: 'Company Entity Deleted',
      message: `Deleted entity "${entity?.name}" (${entity?.code})`,
      link: '/admin/entities',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete entity:', error)
    return NextResponse.json({ error: 'Failed to delete entity' }, { status: 500 })
  }
}
