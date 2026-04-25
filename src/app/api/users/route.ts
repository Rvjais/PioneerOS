import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { generateEmployeeId } from '@/server/db/sequence'
import { z } from 'zod'

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
  role: z.string().optional(),
  department: z.string().optional(),
  employeeType: z.string().optional(),
  joiningDate: z.string().optional(),
})

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Restrict sensitive contact data for FREELANCER/INTERN
    const restrictedRoles = ['FREELANCER', 'INTERN']
    const isRestricted = restrictedRoles.includes(user.role)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const recent = searchParams.get('recent')
    const department = searchParams.get('department')

    const where: Record<string, unknown> = { deletedAt: null }

    if (status) {
      const statuses = status.split(',')
      where.status = { in: statuses }
    }

    if (department) {
      where.department = department
    }

    // If recent flag is set, get employees who joined in last 90 days
    if (recent === 'true') {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      where.joiningDate = { gte: ninetyDaysAgo }
    }

    const users = await prisma.user.findMany({
      where,
      take: 200,
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        email: !isRestricted,
        phone: !isRestricted,
        role: true,
        department: true,
        status: !isRestricted, // Don't expose PIP/PROBATION status to freelancers/interns
        joiningDate: !isRestricted,
        profile: {
          select: { profilePicture: true }
        },
      },
      orderBy: { joiningDate: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    // Check if user has permission to create users
    if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = createUserSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data

    // Prevent privilege escalation: only SUPER_ADMIN can create SUPER_ADMIN accounts
    if (body.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only SUPER_ADMIN can create admin accounts' }, { status: 403 })
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      role,
      department,
      employeeType,
      joiningDate
    } = body

    // Generate employee ID atomically (prevents race conditions)
    const nextEmpId = await generateEmployeeId()

    const newUser = await prisma.user.create({
      data: {
        empId: nextEmpId,
        firstName,
        lastName: lastName ?? '',
        phone: phone ?? '',
        email,
        role: role || 'EMPLOYEE',
        department: department || 'OPERATIONS',
        employeeType: employeeType || 'FULL_TIME',
        joiningDate: new Date(joiningDate || Date.now()),
        status: 'PROBATION',
        profileCompletionStatus: 'INCOMPLETE',
        onboardingStep: 0
      }
    })

    // Create empty onboarding checklist
    await prisma.employeeOnboardingChecklist.create({
      data: {
        userId: newUser.id
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
