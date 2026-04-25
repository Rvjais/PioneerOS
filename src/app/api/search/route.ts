import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import prisma from '@/server/db/prisma'

export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({
        clients: [],
        employees: [],
        tasks: [],
      })
    }

    // Determine if user has admin-level access for full employee data
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role)

    // Search in parallel
    const [clients, employees, tasks] = await Promise.all([
      // Search clients
      prisma.client.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: query } },
            { brandName: { contains: query } },
            { contactName: { contains: query } },
            { contactEmail: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          tier: true,
        },
        take: 10,
      }),

      // Search employees - limit fields for non-admin roles
      prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            ...(isAdmin ? [
              { email: { contains: query } },
            ] : []),
            { empId: { contains: query } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          empId: true,
          department: true,
          ...(isAdmin ? {
            profile: { select: { profilePicture: true } },
          } : {}),
        },
        take: 10,
      }),

      // Search tasks
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        select: {
          id: true,
          title: true,
          status: true,
        },
        take: 10,
      }),
    ])

    return NextResponse.json({
      clients,
      employees,
      tasks,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
})
