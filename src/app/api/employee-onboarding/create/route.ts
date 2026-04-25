import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

export const GET = withAuth(async (_req, { user: _user }) => {
  try {
    const proposals = await prisma.employeeProposal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        token: true,
        candidateName: true,
        candidateEmail: true,
        department: true,
        position: true,
        employmentType: true,
        offeredSalary: true,
        status: true,
        currentStep: true,
        joiningDate: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json({
      proposals: proposals.map(p => ({
        ...p,
        joiningDate: p.joiningDate.toISOString(),
        createdAt: p.createdAt.toISOString(),
        expiresAt: p.expiresAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch employee proposals:', error)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'] })

const createSchema = z.object({
  candidateName: z.string().min(1, 'Name is required'),
  candidateEmail: z.string().email('Valid email required'),
  candidatePhone: z.string().min(10, 'Valid phone required'),
  department: z.string().min(1, 'Department required'),
  position: z.string().min(1, 'Position required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'INTERN', 'FREELANCER']).default('FULL_TIME'),
  offeredSalary: z.number().min(0, 'Salary required'),
  joiningDate: z.string().min(1, 'Joining date required'),
  probationMonths: z.number().min(0).max(12).default(3),
  bondDurationMonths: z.number().min(0).max(36).default(12),
  entityType: z.enum(['BRANDING_PIONEERS', 'ATZ_MEDAPPZ']).default('BRANDING_PIONEERS'),
  expiresInDays: z.number().min(1).max(30).default(14),
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const validation = createSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays)

    const proposal = await prisma.employeeProposal.create({
      data: {
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        candidatePhone: data.candidatePhone,
        department: data.department,
        position: data.position,
        employmentType: data.employmentType,
        offeredSalary: data.offeredSalary,
        joiningDate: new Date(data.joiningDate),
        probationMonths: data.probationMonths,
        bondDurationMonths: data.bondDurationMonths,
        entityType: data.entityType,
        expiresAt,
        status: 'SENT',
        currentStep: 1,
        createdById: user.id,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const onboardingUrl = `${baseUrl}/join-team/${proposal.token}`

    // Notify HR team
    const hrUsers = await prisma.user.findMany({
      where: { OR: [{ role: 'HR' }, { department: 'HR' }, { role: 'SUPER_ADMIN' }], status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    })

    if (hrUsers.length > 0) {
      await prisma.notification.createMany({
        data: hrUsers.map(u => ({
          userId: u.id,
          type: 'GENERAL',
          title: 'Employee Onboarding Link Created',
          message: `Onboarding link generated for ${data.candidateName} (${data.position}, ${data.department}). Salary: ₹${data.offeredSalary.toLocaleString()}/mo.`,
          link: '/hr/employee-onboarding',
          priority: 'MEDIUM',
        })),
      })
    }

    return NextResponse.json({
      success: true,
      proposal: {
        id: proposal.id,
        token: proposal.token,
        url: onboardingUrl,
        expiresAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create employee onboarding:', error)
    return NextResponse.json({ error: 'Failed to create onboarding link' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'] })
