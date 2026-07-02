import { withAuth } from '@/server/auth/withAuth'
import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'

export const GET = withAuth(async () => {
  const templates = await prisma.whatsAppTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const mapped = templates.map(t => ({
    id: t.id,
    name: t.name,
    content: t.content,
    category: t.category,
    status: t.isApproved ? 'active' : (t.isActive ? 'pending' : 'rejected'),
    usageCount: t.usageCount,
  }))

  return NextResponse.json({ templates: mapped })
})
