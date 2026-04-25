import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { hashPassword } from '@/server/security/password'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const schema = z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().max(20).optional(),
      department: z.string().max(50).optional(),
      role: z.string().max(50).optional(),
      employeeType: z.string().max(50).optional(),
      joiningDate: z.string().optional(),
      dateOfBirth: z.string().optional(),
    })
    const result = schema.safeParse(data)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    Object.assign(data, result.data)

    // Generate next empId atomically inside a transaction to prevent race conditions
    // Generate a random temporary password -- employee must use magic link to set their own
    const { randomBytes } = await import('crypto')
    const tempPassword = randomBytes(16).toString('hex')
    const hashedPassword = await hashPassword(tempPassword)

    const dbUser = await prisma.$transaction(async (tx) => {
      const usersWithBPId = await tx.user.findMany({
        where: { empId: { startsWith: 'BP-' } },
        select: { empId: true },
      })

      let maxNum = 0
      for (const u of usersWithBPId) {
        const match = u.empId.match(/^BP-(\d+)$/)
        if (match) {
          const num = parseInt(match[1], 10)
          if (!isNaN(num) && num > maxNum) {
            maxNum = num
          }
        }
      }

      const newEmpId = `BP-${String(maxNum + 1).padStart(3, '0')}`

      return tx.user.create({
        data: {
          empId: newEmpId,
          firstName: data.firstName,
          lastName: data.lastName || null,
          email: data.email || null,
          phone: data.phone || `temp-${newEmpId}`,
          department: data.department || 'OPERATIONS',
          role: data.role || 'EMPLOYEE',
          employeeType: data.employeeType || 'FULL_TIME',
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          status: 'ACTIVE',
          password: hashedPassword,
        },
      })
    })

    return NextResponse.json({ success: true, employee: dbUser })
  } catch (error) {
    console.error('Quick add employee error:', error)
    return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 })
  }
})
