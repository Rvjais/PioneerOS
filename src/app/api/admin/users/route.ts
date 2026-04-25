import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/server/security/password'
import { requireAuth, isAuthError, ADMIN_ROLES } from '@/server/auth/rbac'
import { randomBytes, createHash } from 'crypto'
import { z } from 'zod'

// Generate a secure random temporary password with 128-bit entropy
function generateTempPassword(): string {
  return randomBytes(16).toString('base64url') // 128-bit entropy, URL-safe characters
}

// Generate a magic link token for newly created users
function generateMagicToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  return { token, tokenHash }
}

// Validation schema for user creation
const createUserSchema = z.object({
  empId: z.string().min(1).max(20).regex(/^[A-Z0-9-]+$/i, 'Employee ID must be alphanumeric with dashes'),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().max(100).trim().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().min(10).max(15).regex(/^[0-9+\-\s]+$/, 'Invalid phone number format'),
  role: z.enum(['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'OM', 'EMPLOYEE', 'FREELANCER', 'SALES', 'ACCOUNTS', 'HR', 'INTERN', 'WEB_MANAGER', 'WEB_DESIGNER', 'WEB_DEVELOPER', 'CONTENT_WRITER', 'QA_TESTER']),
  department: z.enum(['WEB', 'SEO', 'ADS', 'SOCIAL', 'HR', 'ACCOUNTS', 'SALES', 'OPERATIONS']),
  employeeType: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCER', 'INTERN']).optional().default('FULL_TIME'),
  joiningDate: z.string().datetime().optional(),
})

// GET - List all users
export async function GET() {
  try {
    const auth = await requireAuth({ roles: ADMIN_ROLES })
    if (isAuthError(auth)) return auth.error

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        empId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        employeeType: true,
        status: true,
        joiningDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    const auth = await requireAuth({ roles: ADMIN_ROLES })
    if (isAuthError(auth)) return auth.error

    const body = await request.json()

    // Validate with Zod
    const validation = createUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors
      }, { status: 400 })
    }

    const { empId, firstName, lastName, email, phone, role, department, employeeType, joiningDate } = validation.data

    // Check for duplicate empId
    const existingByEmpId = await prisma.user.findUnique({
      where: { empId },
    })
    if (existingByEmpId) {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 })
    }

    // Check for duplicate phone
    const existingByPhone = await prisma.user.findUnique({
      where: { phone },
    })
    if (existingByPhone) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 409 })
    }

    // Generate secure temporary password
    const tempPassword = generateTempPassword()
    const hashedPassword = await hashPassword(tempPassword)

    const user = await prisma.user.create({
      data: {
        empId,
        firstName,
        lastName: lastName || null,
        email: email || null,
        phone,
        password: hashedPassword,
        role,
        department,
        employeeType,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        status: 'ACTIVE',
        profileCompletionStatus: 'INCOMPLETE',
      },
    })

    // Create empty profile
    await prisma.profile.create({
      data: {
        userId: user.id,
      },
    })

    // Generate a magic link token for first login (consistent with auth system)
    const { token: magicToken, tokenHash } = generateMagicToken()
    const magicLinkExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours for new users

    await prisma.magicLinkToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        channel: 'EMAIL',
        expiresAt: magicLinkExpiry,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        empId: user.empId,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        department: user.department,
      },
      magicLinkToken: magicToken, // Admin shares this link securely with the new user
      magicLinkExpiry: magicLinkExpiry.toISOString(),
      tempPassword, // Legacy: still generated for backward compatibility
      message: 'User created. Share the magic link for first login (valid 72 hours).',
    })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
