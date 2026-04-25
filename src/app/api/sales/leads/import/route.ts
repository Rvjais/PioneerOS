import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const SALES_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES']

const leadRowSchema = z.object({
  companyName: z.string().min(1).max(500),
  contactName: z.string().min(1).max(500),
  contactEmail: z.string().email().max(500).optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  value: z.union([z.string(), z.number()]).optional().nullable(),
  leadPriority: z.enum(['HOT', 'WARM', 'COLD']).optional(),
  pipeline: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

// POST /api/sales/leads/import - Bulk import leads from parsed CSV data
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!SALES_ROLES.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { leads: rawLeads, skipDuplicates } = body

    if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
    }

    if (rawLeads.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 leads per import' }, { status: 400 })
    }

    // Validate all rows
    const validLeads: Array<z.infer<typeof leadRowSchema>> = []
    const errors: Array<{ row: number; error: string }> = []

    for (let i = 0; i < rawLeads.length; i++) {
      const result = leadRowSchema.safeParse(rawLeads[i])
      if (result.success) {
        validLeads.push(result.data)
      } else {
        const fieldErrors = result.error.flatten().fieldErrors
        const firstError = Object.entries(fieldErrors)[0]
        errors.push({ row: i + 1, error: firstError ? `${firstError[0]}: ${firstError[1]?.[0]}` : 'Invalid data' })
      }
    }

    if (validLeads.length === 0) {
      return NextResponse.json({ error: 'No valid leads found', errors }, { status: 400 })
    }

    // Check for duplicates by email
    let skippedCount = 0
    let leadsToCreate = validLeads

    if (skipDuplicates) {
      const emails = validLeads.map(l => l.contactEmail).filter(Boolean) as string[]
      if (emails.length > 0) {
        const existingLeads = await prisma.lead.findMany({
          where: { contactEmail: { in: emails }, deletedAt: null },
          select: { contactEmail: true },
        })
        const existingEmails = new Set(existingLeads.map(l => l.contactEmail))
        const before = leadsToCreate.length
        leadsToCreate = leadsToCreate.filter(l => !l.contactEmail || !existingEmails.has(l.contactEmail))
        skippedCount = before - leadsToCreate.length
      }
    }

    // Bulk create
    const created = await prisma.lead.createMany({
      data: leadsToCreate.map(lead => ({
        companyName: lead.companyName,
        contactName: lead.contactName,
        contactEmail: lead.contactEmail || null,
        contactPhone: lead.contactPhone || null,
        source: lead.source || 'BULK_IMPORT',
        value: lead.value ? parseFloat(String(lead.value)) : null,
        leadPriority: lead.leadPriority || 'WARM',
        pipeline: lead.pipeline || 'BRANDING_PIONEERS',
        notes: lead.notes || null,
        stage: 'LEAD_RECEIVED',
        assignedToId: session.user.id,
        createdBy: session.user.id,
      })),
    })

    return NextResponse.json({
      imported: created.count,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors.slice(0, 20) : [],
      total: rawLeads.length,
    })
  } catch (error) {
    console.error('Failed to import leads:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
