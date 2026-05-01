import { prisma } from '@/server/db/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/server/security/rateLimit'
import { generateEmployeeId } from '@/server/db/sequence'

// Input validation schema for employee onboarding
const employeeOnboardingSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().max(100).trim().optional(),
  phone: z.string().min(10).max(20).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  department: z.string().min(1),
  employeeType: z.string().default('FULL_TIME'),
  joiningDate: z.string().optional(),
  role: z.string().default('EMPLOYEE'),
  // Profile data
  profileData: z.object({
    profilePicture: z.string().optional(),
    panCard: z.string().optional(),
    aadhaar: z.string().optional(),
    linkedIn: z.string().optional(),
    favoriteFood: z.string().optional(),
    parentsPhone1: z.string().optional(),
    parentsPhone2: z.string().optional(),
    livingSituation: z.string().optional(),
    distanceFromOffice: z.string().optional(),
    educationCertUrl: z.string().optional(),
    ndaSigned: z.boolean().optional(),
    ndaSignedAt: z.string().nullable().optional(),
    // Bank details are stored separately and verified by HR
    bankDetailsUrl: z.string().optional(),
  }).optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  languages: z.string().optional(),
  aiTools: z.string().optional(),
  healthConditions: z.string().optional(),
})

// Public Employee Onboarding - GET to search for existing record
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Provide phone or email to search' },
        { status: 400 }
      )
    }

    const employee = await prisma.user.findFirst({
      where: {
        OR: [
          phone ? { phone } : undefined,
          email ? { email } : undefined,
        ].filter(Boolean) as any,
        deletedAt: null,
      },
      include: {
        profile: true,
      },
    })

    if (!employee) {
      return NextResponse.json({ employee: null })
    }

    // Map database model to form data structure for frontend consumption
    // Only return public/onboarding relevant data
    return NextResponse.json({
      employee: {
        employeeName: `${employee.firstName} ${employee.lastName || ''}`.trim(),
        department: employee.department,
        role: employee.role,
        employeeType: employee.employeeType.toLowerCase().replace('_', '-'),
        languagesKnown: employee.languages?.split(', ') || [],
        aiToolsKnown: employee.aiTools?.split(', ') || [],
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.toISOString().split('T')[0] : '',
        joiningDate: employee.joiningDate.toISOString().split('T')[0],
        personalPhone: employee.phone,
        email: employee.email,
        bloodGroup: employee.bloodGroup || '',
        livingSituation: employee.profile?.livingSituation || '',
        currentAddress: employee.address || '',
        parentsAddress: '', // Not stored in a single field
        fatherPhone: employee.profile?.parentsPhone1 || '',
        motherPhone: employee.profile?.parentsPhone2 || '',
        profilePictureLink: employee.profile?.profilePicture || '',
        documentsLink: employee.profile?.panCard || employee.profile?.aadhaar || '',
        educationCertificatesLink: employee.profile?.educationCertUrl || '',
        distanceFromOffice: employee.profile?.distanceFromOffice || '',
        linkedinProfile: employee.profile?.linkedIn || '',
        githubPortfolio: '', // Not in schema
        favoriteFood: employee.profile?.favoriteFood || '',
        healthConditions: employee.healthConditions || '',
        hobbiesInterests: '', // Not in schema
        accountHolderName: employee.profile?.emergencyContactName || '', // Close enough for placeholder
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        emergencyContactName: employee.profile?.emergencyContactName || '',
        emergencyContactPhone: employee.profile?.emergencyContactPhone || '',
        emergencyRelationship: '',
      }
    })
  } catch (error) {
    console.error('Failed to search employee:', error)
    return NextResponse.json(
      { error: 'Failed to search for employee record' },
      { status: 500 }
    )
  }
}

// Public Employee Onboarding submission - no authentication required
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 3 submissions per hour per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const rateLimit = await checkRateLimit(`employee-onboarding:${ip}`, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter || 3600) }
        }
      )
    }

    const body = await request.json()

    // Normalize select fields to match internal standards if they exist
    if (body.department) body.department = String(body.department).toUpperCase().trim()
    if (body.employeeType) body.employeeType = String(body.employeeType).toUpperCase().replace('-', '_').trim()
    if (body.role) body.role = String(body.role).toUpperCase().trim()

    // Validate input with Zod
    const validation = employeeOnboardingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if user already exists with same email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone },
        ],
        deletedAt: null,
      },
    })

    if (existingUser) {
      const matchEmail = existingUser.email === data.email
      const field = matchEmail ? 'email address' : 'phone number'
      return NextResponse.json(
        { error: `An account with this ${field} already exists. If you want to update your details, please use the "Search existing record" option or contact HR.` },
        { status: 409 }
      )
    }

    // Generate employee ID with retry logic for race conditions
    let empId: string = ''
    let user
    let lastError: unknown = null

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        empId = await generateEmployeeId()

        // Create the user
        user = await prisma.user.create({
          data: {
            empId,
            firstName: data.firstName,
            lastName: data.lastName || '',
            phone: data.phone,
            email: data.email,
            role: data.role,
            department: data.department,
            employeeType: data.employeeType,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
            status: 'PROBATION',
            profileCompletionStatus: 'PENDING_HR', // HR needs to verify documents
            onboardingStep: 7, // Completed all steps
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            bloodGroup: data.bloodGroup || null,
            address: data.address || null,
            languages: data.languages || null,
            aiTools: data.aiTools || null,
            healthConditions: data.healthConditions || null,
          },
        })

        // Success - break out of retry loop
        break
      } catch (err) {
        lastError = err
        // Check if it's a unique constraint error on empId
        if (err && typeof err === 'object' && 'code' in err) {
          const prismaErr = err as { code: string; meta?: { target?: string[] } }
          if (prismaErr.code === 'P2002' && prismaErr.meta?.target?.[0] === 'empId') {
            // empId collision - retry with new ID
            continue
          }
        }
        // Not an empId collision - rethrow
        throw err
      }
    }

    // If we exhausted retries without creating user
    if (!user) {
      throw lastError || new Error('Failed to generate unique employee ID after 3 attempts')
    }

    // Create profile with additional data if provided
    if (data.profileData) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          profilePicture: data.profileData.profilePicture || null,
          panCard: data.profileData.panCard || null,
          aadhaar: data.profileData.aadhaar || null,
          linkedIn: data.profileData.linkedIn || null,
          favoriteFood: data.profileData.favoriteFood || null,
          parentsPhone1: data.profileData.parentsPhone1 || null,
          parentsPhone2: data.profileData.parentsPhone2 || null,
          livingSituation: data.profileData.livingSituation || null,
          distanceFromOffice: data.profileData.distanceFromOffice || null,
          educationCertUrl: data.profileData.educationCertUrl || null,
          ndaSigned: data.profileData.ndaSigned || false,
          ndaSignedAt: data.profileData.ndaSignedAt ? new Date(data.profileData.ndaSignedAt) : null,
          bankDetailsUrl: data.profileData.bankDetailsUrl || null,
        },
      })
    }

    // Create empty onboarding checklist
    await prisma.employeeOnboardingChecklist.create({
      data: {
        userId: user.id,
      },
    })

    // Notify HR team about new onboarding submission
    const hrUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'HR' },
          { department: 'HR' },
          { role: 'SUPER_ADMIN' },
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    if (hrUsers.length > 0) {
      await prisma.notification.createMany({
        data: hrUsers.map((hrUser) => ({
          userId: hrUser.id,
          type: 'GENERAL',
          title: 'New Employee Onboarding',
          message: `${data.firstName} ${data.lastName || ''} has completed their onboarding form. Employee ID: ${empId}`,
          link: '/hr/onboarding-checklist',
          priority: 'HIGH',
        })),
      })
    }

    return NextResponse.json({
      success: true,
      empId: user.empId,
      email: user.email,
      message: 'Onboarding completed successfully. HR will verify your documents and activate your account.',
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Failed to create employee via public onboarding:', error)

    // Handle Prisma errors (they have a 'code' property)
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }

      // P2002 = Unique constraint violation
      if (prismaError.code === 'P2002') {
        const field = prismaError.meta?.target?.[0] || 'information'
        // Map technical field names to user-friendly messages
        const fieldMessages: Record<string, string> = {
          email: 'email address',
          phone: 'phone number',
          empId: 'employee ID (please contact HR)',
        }
        const friendlyField = fieldMessages[field] || field
        return NextResponse.json(
          { error: `An account with this ${friendlyField} already exists. Please use different details or contact HR if you've already submitted.` },
          { status: 409 }
        )
      }

      // P2003 = Foreign key constraint failed
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid reference data. Please contact HR.' },
          { status: 400 }
        )
      }
    }

    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for Prisma unique constraint errors (fallback)
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'An account with this information already exists. Please contact HR.' },
          { status: 409 }
        )
      }

      // Check for validation errors
      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid data provided. Please check your information and try again.' },
          { status: 400 }
        )
      }

      // Log the actual error for debugging
      console.error('Error details:', error.message)
    }

    return NextResponse.json(
      { error: 'Failed to complete onboarding. Please try again or contact HR.' },
      { status: 500 }
    )
  }
}
