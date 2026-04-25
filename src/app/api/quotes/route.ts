import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const quoteSchema = z.object({
  text: z.string().min(5, 'Quote must be at least 5 characters').max(500),
  author: z.string().min(1, 'Author is required').max(100),
})

// GET /api/quotes - Public QOTD or authenticated management list
export const GET = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode')

  if (mode === 'all') {
    // Only HR/Admin roles can list all quotes for management
    const managementRoles = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR']
    if (!managementRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
    })
    return NextResponse.json({ quotes })
  }

  // Default: Quote of the Day (any authenticated user)
  const activeQuotes = await prisma.quote.findMany({
    where: { isActive: true },
    select: { id: true, text: true, author: true },
  })

  if (activeQuotes.length === 0) {
    return NextResponse.json({
      quote: { text: 'Work like an owner. Lead like a pioneer.', author: 'Pioneer OS' },
    })
  }

  // Deterministic daily pick based on date
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const index = dayOfYear % activeQuotes.length
  return NextResponse.json({ quote: activeQuotes[index] })
})

// POST /api/quotes - Create a new quote (HR/Admin only)
export const POST = withAuth(
  async (req, { user }) => {
    const body = await req.json()
    const result = quoteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const quote = await prisma.quote.create({
      data: {
        text: result.data.text,
        author: result.data.author,
        createdBy: user.id,
      },
    })

    return NextResponse.json({ quote })
  },
  { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'] }
)

// PUT /api/quotes - Update a quote
export const PUT = withAuth(
  async (req) => {
    const body = await req.json()
    const { id, text, author, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (text !== undefined) updateData.text = text
    if (author !== undefined) updateData.author = author
    if (isActive !== undefined) updateData.isActive = isActive

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ quote })
  },
  { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'] }
)

// DELETE /api/quotes - Delete a quote
export const DELETE = withAuth(
  async (req) => {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 })
    }

    await prisma.quote.delete({ where: { id } })
    return NextResponse.json({ success: true })
  },
  { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'] }
)
