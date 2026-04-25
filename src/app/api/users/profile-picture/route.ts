import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const UpdateProfilePictureSchema = z.object({
  profilePicture: z.string().url('Invalid URL format').or(z.literal('')),
})

// PATCH /api/users/profile-picture - Update current user's profile picture
export const PATCH = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json()

    const parseResult = UpdateProfilePictureSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    const { profilePicture } = parseResult.data

    // Upsert the profile with the new profile picture
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        profilePicture: profilePicture || null,
      },
      create: {
        userId: user.id,
        profilePicture: profilePicture || null,
      },
      select: {
        profilePicture: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json({
      user: {
        ...updatedProfile.user,
        profilePicture: updatedProfile.profilePicture,
      },
    })
  } catch (error) {
    console.error('Failed to update profile picture:', error)
    return NextResponse.json({ error: 'Failed to update profile picture' }, { status: 500 })
  }
})

// GET /api/users/profile-picture - Get current user's profile picture
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: {
          select: { profilePicture: true },
        },
      },
    })

    return NextResponse.json({
      user: dbUser
        ? {
            id: dbUser.id,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            profilePicture: dbUser.profile?.profilePicture || null,
          }
        : null,
    })
  } catch (error) {
    console.error('Failed to fetch profile picture:', error)
    return NextResponse.json({ error: 'Failed to fetch profile picture' }, { status: 500 })
  }
})
