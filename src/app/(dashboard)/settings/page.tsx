import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })
  return user
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await getUserData(session.user.id)
  if (!user) redirect('/login')

  return (
    <SettingsClient
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone,
        department: user.department,
        role: user.role,
        profilePicture: user.profile?.profilePicture || null,
        linkedIn: user.profile?.linkedIn || null,
        bio: user.profile?.bio || null,
        skills: user.profile?.skills || null,
        ndaSigned: user.profile?.ndaSigned || false,
        ndaSignedAt: user.profile?.ndaSignedAt?.toISOString() || null,
      }}
    />
  )
}
