import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { createRoute, listResponse, createdResponse } from '@/server/apiRoute'

// Validation schemas
const createVendorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable(),
  serviceCategory: z.string().max(100).optional().nullable(),
  contractDuration: z.string().max(50).optional().nullable(),
  paymentTerms: z.string().max(100).optional().nullable(),
  monthlyRate: z.number().min(0).optional().nullable(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED']).optional().default('PENDING'),
})

const querySchema = z.object({
  status: z.string().optional(),
})

// GET /api/vendors - List vendors with pagination
export const GET = createRoute(
  async ({ query, pagination }) => {
    const where: Record<string, unknown> = {}
    if (query.status) {
      where.status = query.status
    }

    const [total, vendors] = await Promise.all([
      prisma.vendorOnboarding.count({ where }),
      prisma.vendorOnboarding.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ])

    return listResponse(vendors, total, pagination)
  },
  {
    querySchema,
    paginated: true,
  }
)

// POST /api/vendors - Create a new vendor
export const POST = createRoute(
  async ({ body }) => {
    const vendor = await prisma.vendorOnboarding.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        contactEmail: body.contactEmail ?? null,
        contactPhone: body.contactPhone ?? null,
        serviceCategory: body.serviceCategory ?? null,
        contractDuration: body.contractDuration ?? null,
        paymentTerms: body.paymentTerms ?? null,
        monthlyRate: body.monthlyRate ?? null,
        status: body.status,
      },
    })

    return createdResponse({ vendor })
  },
  {
    bodySchema: createVendorSchema,
  }
)
