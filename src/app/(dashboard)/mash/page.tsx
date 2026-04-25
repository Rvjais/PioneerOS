import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { MashClient } from './MashClient'

const DEPARTMENT_CHANNELS = [
  { slug: 'team-seo', name: 'SEO Team', department: 'SEO', icon: 'seo' },
  { slug: 'team-ads', name: 'Ads Team', department: 'ADS', icon: 'ads' },
  { slug: 'team-social', name: 'Social Media', department: 'SOCIAL', icon: 'social' },
  { slug: 'team-web', name: 'Web Dev', department: 'WEB', icon: 'web' },
  { slug: 'team-hr', name: 'HR Team', department: 'HR', icon: 'hr' },
  { slug: 'team-accounts', name: 'Accounts', department: 'ACCOUNTS', icon: 'accounts' },
  { slug: 'team-sales', name: 'Sales Team', department: 'SALES', icon: 'sales' },
  { slug: 'team-operations', name: 'Operations', department: 'OPERATIONS', icon: 'operations' },
]

async function ensureDepartmentChannels() {
  // Create department channels if they don't exist
  for (const dept of DEPARTMENT_CHANNELS) {
    const existing = await prisma.chatChannel.findUnique({
      where: { slug: dept.slug },
    })
    if (!existing) {
      await prisma.chatChannel.create({
        data: {
          name: dept.name,
          slug: dept.slug,
          description: `Team channel for ${dept.name}`,
          type: 'PUBLIC',
          icon: dept.icon,
          isReadOnly: false,
        },
      })
    }
  }
}

async function getChannels(userId: string) {
  // Ensure department channels exist
  await ensureDepartmentChannels()

  // Get all public channels and channels user is a member of
  const channels = await prisma.chatChannel.findMany({
    where: {
      OR: [
        { type: 'PUBLIC' },
        { type: 'MASH' },
        { members: { some: { userId } } },
      ],
      isArchived: false,
    },
    include: {
      _count: { select: { messages: true, members: true } },
      members: {
        where: { userId },
        select: { lastReadAt: true },
      },
    },
    orderBy: [
      { isMash: 'desc' },
      { name: 'asc' },
    ],
  })

  return channels.map(c => ({
    ...c,
    lastReadAt: c.members[0]?.lastReadAt || null,
  }))
}

async function getUsers() {
  return prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      role: true,
      profile: {
        select: { profilePicture: true },
      },
    },
    orderBy: { firstName: 'asc' },
  })
}

async function getUnreadDMCount(userId: string) {
  return prisma.directMessage.count({
    where: {
      receiverId: userId,
      isRead: false,
      isDeleted: false,
    },
  })
}

async function getUnreadDMCountsPerContact(userId: string) {
  const unreadCounts = await prisma.directMessage.groupBy({
    by: ['senderId'],
    where: {
      receiverId: userId,
      isRead: false,
      isDeleted: false,
    },
    _count: {
      id: true,
    },
  })

  const unreadMap: Record<string, number> = {}
  unreadCounts.forEach(({ senderId, _count }) => {
    unreadMap[senderId] = _count.id
  })
  return unreadMap
}

export default async function MashPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { channel: channelSlug } = await searchParams
  const userId = session.user.id
  const [channels, users, unreadDMs, unreadDMCounts] = await Promise.all([
    getChannels(userId),
    getUsers(),
    getUnreadDMCount(userId),
    getUnreadDMCountsPerContact(userId),
  ])

  // Ensure company-wide channel exists
  let companyChannel = channels.find(c => c.isMash)
  if (!companyChannel) {
    // Create the company-wide channel if it doesn't exist
    await prisma.chatChannel.create({
      data: {
        name: 'Company Announcements',
        slug: 'company',
        description: 'Company-wide announcements and updates for all employees',
        type: 'PUBLIC',
        isMash: true,
        isReadOnly: false,
        icon: 'megaphone',
      },
    })
  } else if (companyChannel.name === 'MASH') {
    // Update existing MASH channel to new name
    await prisma.chatChannel.update({
      where: { id: companyChannel.id },
      data: {
        name: 'Company Announcements',
        slug: 'company',
        description: 'Company-wide announcements and updates for all employees',
        type: 'PUBLIC',
        icon: 'megaphone',
      },
    })
  }

  // Find initial channel based on URL param or default to company announcements
  const initialChannelSlug = channelSlug || 'company'

  return (
    <MashClient
      initialChannels={channels}
      users={users}
      currentUserId={userId}
      currentUserRole={session.user.role}
      unreadDMs={unreadDMs}
      unreadDMCounts={unreadDMCounts}
      initialChannelSlug={initialChannelSlug}
    />
  )
}
