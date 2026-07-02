import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { generateEmployeeId } from '@/server/db/sequence'
import { z } from 'zod'

const joinFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  employeeType: z.string().min(1, 'Employee type is required'),
  joiningDate: z.string().optional(),
  role: z.string().optional(),
  profileData: z.object({
    profilePicture: z.string().optional(),
    panCard: z.string().optional(),
    aadhaar: z.string().optional(),
    linkedIn: z.string().optional(),
    parentsPhone1: z.string().optional(),
    parentsPhone2: z.string().optional(),
    livingSituation: z.string().optional(),
    educationCertUrl: z.string().optional(),
    ndaSigned: z.boolean().optional(),
    ndaSignedAt: z.string().nullable().optional(),
    bankAccountName: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
  }).optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  languages: z.string().optional(),
  aiTools: z.string().optional(),
  healthConditions: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = joinFormSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 409 }
      )
    }

    // Generate atomic employee ID
    const empId = await generateEmployeeId()

    // Run in a transaction to ensure User, Profile, and Onboarding Checklist all succeed together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the User (Status PENDING_HR)
      const user = await tx.user.create({
        data: {
          empId,
          firstName: data.firstName,
          lastName: data.lastName || '',
          phone: data.phone,
          email: data.email,
          role: data.role || 'EMPLOYEE',
          department: data.department,
          employeeType: data.employeeType,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          bloodGroup: data.bloodGroup || '',
          address: data.address || '',
          status: 'PROBATION',
          profileCompletionStatus: 'PENDING_HR',
          onboardingStep: 4, // Because they submitted the final join form
        },
      })

      // 2. Create the Profile
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          profilePicture: data.profileData?.profilePicture || '',
          linkedIn: data.profileData?.linkedIn || '',
          emergencyContactName: '',
          emergencyContactPhone: data.profileData?.parentsPhone1 || '',
          completionPercentage: 100, // They filled the form
          ndaSigned: data.profileData?.ndaSigned || false,
          ndaSignedAt: data.profileData?.ndaSignedAt ? new Date(data.profileData.ndaSignedAt) : null,
        },
      })

      // 3. Create Employee Onboarding Checklist
      await tx.employeeOnboardingChecklist.create({
        data: {
          userId: user.id,
        },
      })

      return user
    })

    // Notify HR about the new application in the background
    prisma.user.findMany({
      where: {
        OR: [{ role: 'HR' }, { role: 'SUPER_ADMIN' }, { department: 'HR' }],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    }).then(async (hrUsers) => {
      if (hrUsers.length > 0) {
        await prisma.notification.createMany({
          data: hrUsers.map((hr) => ({
            userId: hr.id,
            type: 'TASK',
            title: 'New Employee Application Received',
            message: `${result.firstName} ${result.lastName} has submitted their onboarding forms for ${result.department}. Please verify.`,
            priority: 'HIGH',
            link: '/hr/verifications',
          })),
        })
      }
    }).catch(err => console.error('Failed to notify HR', err))

    return NextResponse.json({ empId: result.empId, email: result.email }, { status: 201 })
  } catch (error) {
    console.error('Join API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error while processing your application' },
      { status: 500 }
    )
  }
}
