import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const updateVendorSchema = z.object({
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIFSC: z.string().optional(),
  bankName: z.string().optional(),
  serviceCategory: z.string().optional(),
  contractDuration: z.string().optional(),
  paymentTerms: z.string().optional(),
  monthlyRate: z.number().optional(),
  ndaSigned: z.boolean().optional(),
  contractSigned: z.boolean().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
}).passthrough()

// Roles that can manage vendors
const VENDOR_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'HR']

export const GET = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // SECURITY FIX: Only authorized roles can view vendor details
    if (!VENDOR_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await routeParams!
    const vendor = await prisma.vendorOnboarding.findUnique({
      where: { id },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Failed to get vendor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // SECURITY FIX: Only authorized roles can modify vendors
    if (!VENDOR_ROLES.includes(user.role || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await routeParams!
    const raw = await req.json()
    const parsed = updateVendorSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'companyName',
      'contactName',
      'contactEmail',
      'contactPhone',
      'address',
      'gstNumber',
      'panNumber',
      'bankAccountName',
      'bankAccountNumber',
      'bankIFSC',
      'bankName',
      'serviceCategory',
      'contractDuration',
      'paymentTerms',
      'monthlyRate',
      'ndaSigned',
      'contractSigned',
      'status',
      'notes',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Update timestamps for signing
    if (body.ndaSigned === true && !updateData.ndaSignedAt) {
      updateData.ndaSignedAt = new Date()
    }
    if (body.contractSigned === true && !updateData.contractSignedAt) {
      updateData.contractSignedAt = new Date()
    }

    // Auto-update status based on signing
    if (body.ndaSigned === true && body.status === 'PENDING') {
      updateData.status = 'NDA_SIGNED'
    }
    if (body.contractSigned === true && body.status && ['PENDING', 'NDA_SIGNED'].includes(body.status)) {
      updateData.status = 'CONTRACT_SIGNED'
    }

    const vendor = await prisma.vendorOnboarding.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Failed to update vendor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req, { user, params: routeParams }) => {
  try {

    // SECURITY FIX: Only SUPER_ADMIN or MANAGER can delete vendors
    const canDelete = ['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')
    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await routeParams!

    await prisma.vendorOnboarding.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete vendor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
