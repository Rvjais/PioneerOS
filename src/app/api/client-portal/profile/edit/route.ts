import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withClientAuth } from '@/server/auth/withClientAuth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Log activity
async function logActivity(clientUserId: string, action: string, resource?: string, resourceType?: string, details?: object) {
  await prisma.clientUserActivity.create({
    data: {
      clientUserId,
      action,
      resource,
      resourceType,
      details: details ? JSON.stringify(details) : null,
    },
  })
}

// Hash password using bcrypt
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
})

const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  whatsappNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
})

// GET /api/client-portal/profile/edit - Get editable profile data
export const GET = withClientAuth(async (req, { user }) => {
  // Fetch full user data for notification preferences
  const clientUser = await prisma.clientUser.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailNotifications: true,
      whatsappNotifications: true,
      pushNotifications: true,
    },
  })

  return NextResponse.json({
    profile: {
      id: clientUser!.id,
      name: clientUser!.name,
      email: clientUser!.email,
      phone: clientUser!.phone,
      role: clientUser!.role,
    },
    preferences: {
      emailNotifications: clientUser!.emailNotifications,
      whatsappNotifications: clientUser!.whatsappNotifications,
      pushNotifications: clientUser!.pushNotifications,
    },
  })
}, { rateLimit: 'READ' })

// PUT /api/client-portal/profile/edit - Update profile
export const PUT = withClientAuth(async (req, { user }) => {
  const body = await req.json()
  const { type } = body // 'profile', 'preferences', or 'password'

  if (type === 'preferences') {
    const validation = preferencesSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const data = validation.data

    await prisma.clientUser.update({
      where: { id: user.id },
      data: {
        emailNotifications: data.emailNotifications ?? undefined,
        whatsappNotifications: data.whatsappNotifications ?? undefined,
        pushNotifications: data.pushNotifications ?? undefined,
      },
    })

    await logActivity(user.id, 'UPDATE_PREFERENCES', undefined, 'PROFILE', data)

    return NextResponse.json({ success: true, message: 'Preferences updated' })
  }

  if (type === 'password') {
    const validation = passwordChangeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const { currentPassword, newPassword } = validation.data

    // Fetch user with password hash
    const userWithPassword = await prisma.clientUser.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    })

    // Verify current password if one exists
    if (userWithPassword?.passwordHash) {
      const currentMatch = await bcrypt.compare(currentPassword, userWithPassword.passwordHash)
      if (!currentMatch) {
        return NextResponse.json({
          error: 'Current password is incorrect',
        }, { status: 400 })
      }
    }

    // Hash and save new password
    const newPasswordHash = await hashPassword(newPassword)
    await prisma.clientUser.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    await logActivity(user.id, 'CHANGE_PASSWORD', undefined, 'PROFILE', { timestamp: new Date().toISOString() })

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  }

  // Profile update
  const validation = profileUpdateSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    }, { status: 400 })
  }

  const data = validation.data

  const updated = await prisma.clientUser.update({
    where: { id: user.id },
    data: {
      name: data.name ?? undefined,
      phone: data.phone !== undefined ? (data.phone || null) : undefined,
    },
  })

  await logActivity(user.id, 'UPDATE_PROFILE', undefined, 'PROFILE', data)

  return NextResponse.json({
    success: true,
    profile: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
    },
  })
}, { rateLimit: 'WRITE' })
