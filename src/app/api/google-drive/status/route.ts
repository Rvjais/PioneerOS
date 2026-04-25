import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET: Check Google Drive connection status
export const GET = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userDrive = await prisma.userGoogleDrive.findUnique({
      where: { userId: user.id },
      select: {
        email: true,
        isConnected: true,
        lastSyncAt: true,
        rootFolderId: true,
      },
    })

    if (!userDrive) {
      return NextResponse.json({
        connected: false,
        email: null,
        lastSync: null,
      })
    }

    return NextResponse.json({
      connected: userDrive.isConnected,
      email: userDrive.email,
      lastSync: userDrive.lastSyncAt,
      hasFolderSetup: !!userDrive.rootFolderId,
    })
  } catch (error) {
    console.error('Error checking Google Drive status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
})

// DELETE: Disconnect Google Drive
export const DELETE = withAuth(async (req, { user }) => {
  try {
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.userGoogleDrive.delete({
      where: { userId: user.id },
    }).catch(() => {
      // Ignore if not found
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Google Drive:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
})
