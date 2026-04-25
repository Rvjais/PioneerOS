import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { safeJsonParse } from '@/shared/utils/safeJson'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'
import { logAdminAction } from '@/server/services/adminAudit'

// GET /api/admin/custom-roles - Get all custom roles
export const GET = withAuth(async () => {
  try {
    const customRoles = await prisma.customRole.findMany({
      include: {
        userAssignments: {
          include: {
            user: {
              select: {
                id: true,
                empId: true,
                firstName: true,
                lastName: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      roles: customRoles.map(r => ({
        ...r,
        baseRoles: safeJsonParse(r.baseRoles, []),
        departments: safeJsonParse(r.departments, []),
        permissions: safeJsonParse(r.permissions, null),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        userAssignments: r.userAssignments.map(a => ({
          id: a.id,
          userId: a.userId,
          user: a.user,
          assignedAt: a.assignedAt.toISOString(),
        })),
      })),
    })
  } catch (error) {
    console.error('Failed to fetch custom roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER'] })

// POST /api/admin/custom-roles - Create a new custom role
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const postSchema = z.object({
      name: z.string().min(1).max(100),
      displayName: z.string().min(1).max(200),
      baseRoles: z.array(z.string()),
      departments: z.array(z.string()),
      permissions: z.record(z.string(), z.unknown()).optional(),
    })
    const postResult = postSchema.safeParse(body)
    if (!postResult.success) return NextResponse.json({ error: postResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { name, displayName, baseRoles, departments, permissions } = postResult.data

    // Check if role name already exists
    const existingRole = await prisma.customRole.findUnique({
      where: { name },
    })

    if (existingRole) {
      return NextResponse.json(
        { error: 'A role with this name already exists' },
        { status: 400 }
      )
    }

    const customRole = await prisma.customRole.create({
      data: {
        name: name.toUpperCase().replace(/\s+/g, '_'),
        displayName,
        baseRoles: JSON.stringify(baseRoles),
        departments: JSON.stringify(departments),
        permissions: permissions ? JSON.stringify(permissions) : null,
        isActive: true,
      },
    })

    await logAdminAction({
      userId: user.id,
      action: 'ROLE_CREATE',
      title: 'Custom Role Created',
      message: `Created role "${displayName}" (${name}) with base roles: ${baseRoles.join(', ')}`,
      link: '/admin/custom-roles',
    })

    return NextResponse.json({
      role: {
        ...customRole,
        baseRoles: safeJsonParse(customRole.baseRoles, []),
        departments: safeJsonParse(customRole.departments, []),
        permissions: safeJsonParse(customRole.permissions, null),
        createdAt: customRole.createdAt.toISOString(),
        updatedAt: customRole.updatedAt.toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create custom role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })

// PATCH /api/admin/custom-roles - Update a custom role
export const PATCH = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const patchSchema = z.object({
      roleId: z.string().min(1),
      displayName: z.string().min(1).max(200).optional(),
      baseRoles: z.array(z.string()).optional(),
      departments: z.array(z.string()).optional(),
      permissions: z.record(z.string(), z.unknown()).optional(),
      isActive: z.boolean().optional(),
    })
    const patchResult = patchSchema.safeParse(body)
    if (!patchResult.success) return NextResponse.json({ error: patchResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { roleId, displayName, baseRoles, departments, permissions, isActive } = patchResult.data

    const updateData: Record<string, unknown> = {}
    if (displayName !== undefined) updateData.displayName = displayName
    if (baseRoles !== undefined) updateData.baseRoles = JSON.stringify(baseRoles)
    if (departments !== undefined) updateData.departments = JSON.stringify(departments)
    if (permissions !== undefined) updateData.permissions = permissions ? JSON.stringify(permissions) : null
    if (isActive !== undefined) updateData.isActive = isActive

    const customRole = await prisma.customRole.update({
      where: { id: roleId },
      data: updateData,
    })

    const changedFields = Object.keys(updateData).join(', ')
    await logAdminAction({
      userId: user.id,
      action: 'ROLE_UPDATE',
      title: 'Custom Role Updated',
      message: `Updated role ${roleId}: changed ${changedFields}`,
      link: '/admin/custom-roles',
    })

    return NextResponse.json({
      role: {
        ...customRole,
        baseRoles: safeJsonParse(customRole.baseRoles, []),
        departments: safeJsonParse(customRole.departments, []),
        permissions: safeJsonParse(customRole.permissions, null),
        createdAt: customRole.createdAt.toISOString(),
        updatedAt: customRole.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to update custom role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })

// DELETE /api/admin/custom-roles - Delete a custom role
export const DELETE = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const roleId = searchParams.get('roleId')

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Hard delete: remove user assignments and delete the role
    await prisma.$transaction([
      prisma.userCustomRole.deleteMany({
        where: { customRoleId: roleId },
      }),
      prisma.customRole.delete({
        where: { id: roleId },
      }),
    ])

    await logAdminAction({
      userId: user.id,
      action: 'ROLE_DELETE',
      title: 'Custom Role Deleted',
      message: `Deleted role ${roleId} and removed all user assignments`,
      link: '/admin/custom-roles',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete custom role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN'] })
