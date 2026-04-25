import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { SALES_ROLES } from '@/shared/constants/roles'
import { z } from 'zod'

const createLeadSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactName: z.string().min(1, 'Contact name is required').max(200),
  contactEmail: z.string().max(255).optional().nullable()
    .transform(v => (v === '' ? null : v))
    .pipe(z.string().email('Invalid email').optional().nullable()),
  contactPhone: z.string().max(20).optional().nullable()
    .transform(v => (v === '' ? null : v)),
  source: z.string().max(50).optional(),
  value: z.union([z.string(), z.number()]).optional().nullable()
    .transform(v => (v === '' ? null : v)),
  notes: z.string().max(5000).optional().nullable()
    .transform(v => (v === '' ? null : v)),
  industry: z.string().max(100).optional().nullable()
    .transform(v => (v === '' ? null : v)),
  subIndustry: z.string().max(100).optional().nullable()
    .transform(v => (v === '' ? null : v)),
  ticketSize: z.union([z.string(), z.number()]).optional().nullable()
    .transform(v => (v === '' ? null : v)),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SALES, MANAGER, or SUPER_ADMIN can view all leads
    const canViewAllLeads = SALES_ROLES.includes(session.user.role)

    // If not authorized to view all, only show leads assigned to them
    const where = canViewAllLeads ? { deletedAt: null } : { assignedToId: session.user.id, deletedAt: null }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = (page - 1) * limit

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SALES, MANAGER, or SUPER_ADMIN can create leads
    const canCreateLeads = ['SUPER_ADMIN', 'MANAGER', 'SALES'].includes(session.user.role)
    if (!canCreateLeads) {
      return NextResponse.json({ error: 'Forbidden - Only sales team can create leads' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { companyName, contactName, contactEmail, contactPhone, source, value, notes } = parsed.data

    const lead = await prisma.lead.create({
      data: {
        companyName,
        contactName,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        source: source || 'WEBSITE',
        value: value ? parseFloat(String(value)) : null,
        notes: notes || null,
        stage: 'LEAD_RECEIVED',
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to create lead:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
