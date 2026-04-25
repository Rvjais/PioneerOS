import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

// POST /api/admin/sync-client-assignments - Auto-assign clients to employees based on department
export const POST = withAuth(async (req, { user, params }) => {
  try {
if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const schema = z.object({ mode: z.enum(['preview', 'execute']).optional().default('preview') })
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { mode } = parsed.data

    // Get all active clients
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true },
    })

    // Get all active employees (non-manager, non-admin)
    const employees = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        role: { in: ['EMPLOYEE', 'FREELANCER', 'SALES', 'ACCOUNTS'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
      },
    })

    // Get existing assignments
    const existingAssignments = await prisma.clientTeamMember.findMany({
      select: { clientId: true, userId: true },
    })
    const existingSet = new Set(existingAssignments.map(a => `${a.clientId}:${a.userId}`))

    // Map departments to client team roles
    const deptToRole: Record<string, string> = {
      WEB: 'WEB_DEVELOPER',
      SEO: 'SEO_SPECIALIST',
      ADS: 'ADS_SPECIALIST',
      SOCIAL: 'SOCIAL_MANAGER',
      DESIGN: 'DESIGNER',
      VIDEO_EDITING: 'VIDEO_EDITOR',
      ACCOUNTS: 'ACCOUNTS_MANAGER',
      SALES: 'SALES_MANAGER',
    }

    // Prepare assignments
    const proposedAssignments: Array<{
      clientId: string
      clientName: string
      userId: string
      userName: string
      role: string
    }> = []

    // Strategy: Distribute clients evenly among employees per department
    const employeesByDept: Record<string, typeof employees> = {}
    employees.forEach(emp => {
      if (!employeesByDept[emp.department]) {
        employeesByDept[emp.department] = []
      }
      employeesByDept[emp.department].push(emp)
    })

    // Assign each client to one employee from each relevant department
    const clientFacingDepts = ['WEB', 'SEO', 'ADS', 'SOCIAL', 'DESIGN', 'VIDEO_EDITING']

    clients.forEach((client, clientIdx) => {
      clientFacingDepts.forEach(dept => {
        const deptEmployees = employeesByDept[dept] || []
        if (deptEmployees.length > 0) {
          // Round-robin assignment
          const employee = deptEmployees[clientIdx % deptEmployees.length]
          const key = `${client.id}:${employee.id}`

          if (!existingSet.has(key)) {
            proposedAssignments.push({
              clientId: client.id,
              clientName: client.name,
              userId: employee.id,
              userName: `${employee.firstName} ${employee.lastName || ''}`.trim(),
              role: deptToRole[dept] || 'TEAM_MEMBER',
            })
          }
        }
      })
    })

    if (mode === 'execute' && proposedAssignments.length > 0) {
      // Execute the assignments one by one to handle duplicates gracefully
      let createdCount = 0
      for (const a of proposedAssignments) {
        try {
          await prisma.clientTeamMember.create({
            data: {
              clientId: a.clientId,
              userId: a.userId,
              role: a.role,
              isPrimary: false,
            },
          })
          createdCount++
        } catch {
          // Skip duplicates
        }
      }

      return NextResponse.json({
        success: true,
        mode: 'execute',
        created: createdCount,
        assignments: proposedAssignments,
      })
    }

    return NextResponse.json({
      success: true,
      mode: 'preview',
      totalClients: clients.length,
      totalEmployees: employees.length,
      existingAssignments: existingAssignments.length,
      proposedNewAssignments: proposedAssignments.length,
      assignments: proposedAssignments,
      employeesByDepartment: Object.fromEntries(
        Object.entries(employeesByDept).map(([dept, emps]) => [dept, emps.length])
      ),
    })
  } catch (error) {
    console.error('Failed to sync client assignments:', error)
    return NextResponse.json({ error: 'Failed to sync assignments' }, { status: 500 })
  }
})

// GET /api/admin/sync-client-assignments - Get current assignment status
export const GET = withAuth(async (req, { user, params }) => {
  try {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get assignment stats
    const [
      totalClients,
      totalEmployees,
      totalAssignments,
      clientsWithNoAssignments,
      employeesWithNoAssignments,
      assignmentsByRole,
    ] = await Promise.all([
      prisma.client.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null, role: { in: ['EMPLOYEE', 'FREELANCER'] } } }),
      prisma.clientTeamMember.count(),
      prisma.client.count({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          teamMembers: { none: {} },
        },
      }),
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          role: { in: ['EMPLOYEE', 'FREELANCER'] },
          clientAssignments: { none: {} },
        },
      }),
      prisma.clientTeamMember.groupBy({
        by: ['role'],
        _count: true,
      }),
    ])

    return NextResponse.json({
      totalClients,
      totalEmployees,
      totalAssignments,
      clientsWithNoAssignments,
      employeesWithNoAssignments,
      assignmentsByRole: Object.fromEntries(assignmentsByRole.map(r => [r.role, r._count])),
    })
  } catch (error) {
    console.error('Failed to get assignment stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
})
