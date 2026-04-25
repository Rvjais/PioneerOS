import { prisma } from '@/server/db/prisma'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const { companyName, contactName, contactPhone, contactEmail, source } = body

    if (!companyName || !contactName) {
      return NextResponse.json(
        { error: 'Company name and contact name are required' },
        { status: 400 }
      )
    }

    // Create lead with minimal info, auto-assigned to current user
    const lead = await prisma.lead.create({
      data: {
        companyName,
        contactName,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        source: source || 'DIRECT',
        stage: 'LEAD_RECEIVED',
        leadPriority: 'WARM',
        assignedToId: user.id,
        createdBy: user.id,
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        contactPhone: true,
        stage: true,
        leadPriority: true,
      },
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Failed to quick-add lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
