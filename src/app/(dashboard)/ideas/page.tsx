import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import IdeasClient from './IdeasClient'

async function getIdeas() {
  return prisma.idea.findMany({
    include: {
      user: true,
      votes: true,
      _count: { select: { votes: true } }
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
  })
}

export default async function IdeasPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const ideas = await getIdeas()

  const serializedIdeas = ideas.map(idea => ({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    status: idea.status,
    user: { id: idea.user.id, firstName: idea.user.firstName },
    votes: idea.votes.map(v => ({ userId: v.userId })),
    _count: idea._count,
  }))

  return (
    <Suspense fallback={<div className="text-slate-400 p-8">Loading...</div>}>
      <IdeasClient ideas={serializedIdeas} userId={session.user.id} />
    </Suspense>
  )
}
