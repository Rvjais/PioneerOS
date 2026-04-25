import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { createRoute, listResponse, createdResponse, isManagerOrAbove } from '@/server/apiRoute'

// Validation schemas
const createLeadSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactEmail: z.string().email('Invalid email').optional().nullable(),
  contactPhone: z.string().max(20).regex(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format').optional().nullable(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_CALL', 'EVENT', 'RFP']).optional().default('WEBSITE'),
  pipeline: z.enum(['BRANDING_PIONEERS', 'BRAINMINDS', 'PROPERTY_JEEVES']).optional().default('BRANDING_PIONEERS'),
  value: z.number().min(0).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  leadCategory: z.enum(['DOCTOR', 'CLINIC', 'HOSPITAL', 'HEALTHCARE_STARTUP', 'NON_HEALTHCARE']).optional().nullable(),
  leadPriority: z.enum(['HOT', 'WARM', 'COLD']).optional().default('WARM'),
  location: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
})

// Roles that can view all leads
const SALES_ROLES = ['SUPER_ADMIN', 'MANAGER', 'SALES', 'ACCOUNTS']

// GET /api/sales/leads - List leads
export const GET = createRoute(
  async ({ user, pagination }) => {
    const canViewAllLeads = SALES_ROLES.includes(user.role) || user.department === 'SALES'
    const where = canViewAllLeads ? { deletedAt: null } : { assignedToId: user.id, deletedAt: null }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true }
          },
          _count: {
            select: { nurturingActions: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ])

    return listResponse(leads, total, pagination)
  },
  { paginated: true }
)

// POST /api/sales/leads - Create a new lead
export const POST = createRoute(
  async ({ user, body }) => {
    // Authorization check
    const canCreateLeads = SALES_ROLES.includes(user.role) || user.department === 'SALES'
    if (!canCreateLeads) {
      throw new Error('Forbidden')
    }

    // Check for duplicate leads by email or phone
    if (body.contactEmail || body.contactPhone) {
      const duplicateWhere: Array<Record<string, unknown>> = []
      if (body.contactEmail) duplicateWhere.push({ contactEmail: body.contactEmail })
      if (body.contactPhone) duplicateWhere.push({ contactPhone: body.contactPhone })

      const existing = await prisma.lead.findFirst({
        where: { OR: duplicateWhere, deletedAt: null },
        select: { id: true, companyName: true, contactEmail: true, contactPhone: true },
      })

      if (existing) {
        throw new Error(`A lead with this contact already exists: ${existing.companyName}`)
      }
    }

    // Determine if healthcare category
    const healthcareCategories = ['DOCTOR', 'CLINIC', 'HOSPITAL', 'HEALTHCARE_STARTUP']
    const isHealthcare = body.leadCategory ? healthcareCategories.includes(body.leadCategory) : false

    const lead = await prisma.lead.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        contactEmail: body.contactEmail ?? null,
        contactPhone: body.contactPhone ?? null,
        source: body.source,
        pipeline: body.pipeline,
        value: body.value ?? null,
        notes: body.notes ?? null,
        leadCategory: body.leadCategory ?? null,
        leadPriority: body.leadPriority,
        location: body.location ?? null,
        state: body.state ?? null,
        isHealthcare,
        stage: 'LEAD_RECEIVED',
        createdBy: user.id,
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true }
        },
        _count: {
          select: { nurturingActions: true }
        }
      },
    })

    return createdResponse({ lead })
  },
  {
    bodySchema: createLeadSchema,
  }
)
