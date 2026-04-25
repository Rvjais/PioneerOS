import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/server/auth/withAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/social/content-ideas — List content ideas with filters
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const theme = searchParams.get('theme')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const skip = (page - 1) * limit

    const where: Record<string, any> = {}

    if (status) where.status = status
    if (type) where.type = type
    if (theme) where.theme = theme
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [ideas, total] = await Promise.all([
      prisma.contentIdea.findMany({
        where,
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true, profilePicture: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contentIdea.count({ where }),
    ])

    return NextResponse.json({
      ideas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Content Ideas GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content ideas' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'] })

// POST /api/social/content-ideas — Create a new content idea
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()

    const { title, description, type, theme, tags } = body

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type' },
        { status: 400 }
      )
    }

    const validTypes = ['POST', 'REEL', 'STORY', 'BLOG', 'VIDEO']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const idea = await prisma.contentIdea.create({
      data: {
        title,
        description: description || null,
        type,
        theme: theme || null,
        tags: tags ? JSON.stringify(tags) : null,
        status: 'BANK',
        createdBy: user.id,
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    return NextResponse.json(idea, { status: 201 })
  } catch (error) {
    console.error('[Content Ideas POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create content idea' },
      { status: 500 }
    )
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'] })
