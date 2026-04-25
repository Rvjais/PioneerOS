import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'SALES'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const schema = z.object({
      name: z.string().min(1).max(300),
      contactName: z.string().max(200).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().max(20).optional(),
      industry: z.string().max(100).optional(),
      tier: z.string().max(50).optional(),
      monthlyFee: z.union([z.string(), z.number()]).optional(),
      paymentDueDay: z.union([z.string(), z.number()]).optional(),
      gstNumber: z.string().max(50).optional(),
      websiteUrl: z.string().max(500).optional(),
      parentClientName: z.string().max(300).optional(),
      brandName: z.string().max(300).optional(),
    })
    const result = schema.safeParse(data)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    Object.assign(data, result.data)

    // Find parent client if specified
    let parentClientId: string | null = null
    if (data.parentClientName) {
      const parent = await prisma.client.findFirst({
        where: { name: data.parentClientName, deletedAt: null },
      })
      parentClientId = parent?.id || null
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        contactName: data.contactName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        industry: data.industry || 'Healthcare',
        tier: data.tier || 'STANDARD',
        monthlyFee: data.monthlyFee ? parseFloat(data.monthlyFee) : null,
        paymentDueDay: data.paymentDueDay ? parseInt(data.paymentDueDay) : null,
        gstNumber: data.gstNumber || null,
        websiteUrl: data.websiteUrl || null,
        status: 'ACTIVE',
        parentClientId,
        brandName: data.brandName || null,
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error('Quick add client error:', error)
    return NextResponse.json({ error: 'Failed to add client' }, { status: 500 })
  }
})
