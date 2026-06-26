import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
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

    // Generate next empId and create user atomically
    const dbUser = await prisma.$transaction(async (tx) => {
      // Block if phone/email belongs to an active user
      if (data.phone) {
        const active = await tx.user.findFirst({
          where: { phone: data.phone, deletedAt: null },
          select: { id: true, firstName: true, lastName: true },
        })
        if (active) {
          throw new Error(`Phone number already in use by ${active.firstName} ${active.lastName || ''}.`)
        }
      }
      if (data.email) {
        const active = await tx.user.findFirst({
          where: { email: data.email, deletedAt: null },
          select: { id: true, firstName: true, lastName: true },
        })
        if (active) {
          throw new Error(`Email already in use by ${active.firstName} ${active.lastName || ''}.`)
        }
      }

      // Permanently remove any soft-deleted records holding the same unique values
      if (data.phone) {
        await tx.user.deleteMany({ where: { phone: data.phone, deletedAt: { not: null } } })
      }
      if (data.email) {
        await tx.user.deleteMany({ where: { email: data.email, deletedAt: { not: null } } })
      }

      // Generate next empId (excluding soft-deleted)
      const usersWithBPId = await tx.user.findMany({
        where: { empId: { startsWith: 'BP-' }, deletedAt: null },
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
        },
      })
    })

    return NextResponse.json({ success: true, employee: dbUser })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add employee'
    if (message.includes('already in use')) {
      return NextResponse.json({ error: message }, { status: 409 })
    }
    console.error('Quick add employee error:', error)
    return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 })
  }
})
