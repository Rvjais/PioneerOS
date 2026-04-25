import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import crypto from 'crypto'
import AllAccessClient from './AllAccessClient'

export const dynamic = 'force-dynamic'

type UserWithMagicLink = {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  role: string
  department: string
  status: string
  magicLinkTokens: {
    id: string
    token: string
    expiresAt: Date
    usedAt: Date | null
    createdAt: Date
  }[]
}

export default async function AllAccessPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Check if user is SUPER_ADMIN
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-slate-300">All Access is only available to Super Admin users.</p>
        </div>
      </div>
    )
  }

  // Fetch all active users with their latest magic link tokens
  const users = await prisma.user.findMany({
    where: {
      status: { in: ['ACTIVE', 'PROBATION'] },
    },
    select: {
      id: true,
      empId: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      status: true,
      magicLinkTokens: {
        where: {
          usedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          token: true,
          expiresAt: true,
          usedAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: [{ department: 'asc' }, { firstName: 'asc' }],
  }) as UserWithMagicLink[]

  // Generate magic links for users without one
  const usersNeedingLinks = users.filter(
    (u) => u.magicLinkTokens.length === 0
  )

  for (const user of usersNeedingLinks) {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year

    const created = await prisma.magicLinkToken.create({
      data: {
        token,
        userId: user.id,
        channel: 'EMAIL',
        expiresAt,
      },
    })

    user.magicLinkTokens = [
      {
        id: created.id,
        token: created.token,
        expiresAt: created.expiresAt,
        usedAt: null,
        createdAt: created.createdAt,
      },
    ]
  }

  // Group by department
  const departments = new Map<string, typeof users>()
  for (const user of users) {
    const dept = user.department || 'UNASSIGNED'
    if (!departments.has(dept)) {
      departments.set(dept, [])
    }
    departments.get(dept)!.push(user)
  }

  // Serialize for client component
  const groupedUsers = Array.from(departments.entries()).map(([dept, deptUsers]) => ({
    department: dept,
    users: deptUsers.map((u) => {
      const link = u.magicLinkTokens[0]
      return {
        id: u.id,
        empId: u.empId,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        department: u.department,
        status: u.status,
        token: link?.token || null,
        tokenExpiry: link?.expiresAt?.toISOString() || null,
        tokenCreated: link?.createdAt?.toISOString() || null,
      }
    }),
  }))

  const totalUsers = users.length
  const withLinks = users.filter((u) => u.magicLinkTokens.length > 0).length
  const expiredLinks = users.filter(
    (u) =>
      u.magicLinkTokens.length > 0 &&
      new Date(u.magicLinkTokens[0].expiresAt) < new Date()
  ).length

  return (
    <AllAccessClient
      groupedUsers={groupedUsers}
      totalUsers={totalUsers}
      withLinks={withLinks}
      expiredLinks={expiredLinks}
      departmentCount={departments.size}
    />
  )
}
