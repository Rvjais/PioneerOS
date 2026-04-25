import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const createWorkReportSchema = z.object({
  periodStart: z.string().min(1, 'Period start is required'),
  periodEnd: z.string().min(1, 'Period end is required'),
  projectName: z.string().min(1, 'Project name is required').max(200),
  clientId: z.string().optional().nullable(),
  description: z.string().min(1, 'Description is required').max(5000),
  hoursWorked: z.union([z.string(), z.number()]).refine(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return !isNaN(num) && num > 0 && num <= 744
  }, 'Hours worked must be a positive number'),
  deliverables: z.array(z.string().max(500)).max(50).optional().nullable(),
  attachments: z.array(z.string().url().max(1000)).max(20).optional().nullable(),
  billableAmount: z.union([z.string(), z.number()]).refine(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return !isNaN(num) && num >= 0 && num <= 10000000
  }, 'Billable amount must be between 0 and 10,000,000'),
})

// GET - List work reports
export const GET = withAuth(async (req, { user, params }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const freelancerId = searchParams.get('freelancerId')

    // Build where clause
    const where: Record<string, unknown> = {}

    // If user is a freelancer, only show their reports
    if (user.role === 'FREELANCER') {
      const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: { userId: user.id },
      })
      if (!freelancerProfile) {
        return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 })
      }
      where.freelancerProfileId = freelancerProfile.id
    } else {
      // Non-freelancers must be admin/manager/accounts to view reports
      const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS']
      if (!allowedRoles.includes(user.role || '')) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
      }
      if (freelancerId) {
        where.freelancerProfileId = freelancerId
      }
    }

    if (status) where.status = status

    const reports = await prisma.freelancerWorkReport.findMany({
      where,
      include: {
        freelancerProfile: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    // Map user details to top-level for API compatibility
    const reportsWithUsers = reports.map((report) => ({
      ...report,
      user: report.freelancerProfile.user,
    }))

    return NextResponse.json({ reports: reportsWithUsers })
  } catch (error) {
    console.error('Error fetching work reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// POST - Create work report
export const POST = withAuth(async (req, { user, params }) => {
  try {
    // Check if user is a freelancer
    if (user.role !== 'FREELANCER' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only freelancers can submit work reports' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createWorkReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const {
      periodStart,
      periodEnd,
      projectName,
      clientId,
      description,
      hoursWorked,
      deliverables,
      attachments,
      billableAmount,
    } = parsed.data

    // Get or create freelancer profile
    const freelancerProfile = await prisma.freelancerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    })

    const report = await prisma.freelancerWorkReport.create({
      data: {
        freelancerProfileId: freelancerProfile.id,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        projectName,
        clientId,
        description,
        hoursWorked: parseFloat(String(hoursWorked)),
        deliverables: deliverables ? JSON.stringify(deliverables) : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        billableAmount: parseFloat(String(billableAmount)),
      },
    })

    // Update pending amount
    await prisma.freelancerProfile.update({
      where: { id: freelancerProfile.id },
      data: {
        pendingAmount: { increment: parseFloat(String(billableAmount)) },
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Error creating work report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
