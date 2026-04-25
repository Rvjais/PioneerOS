import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const templateCreateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(200, 'Name must be 200 characters or less'),
  category: z.string().min(1, 'Category is required').max(100),
  type: z.enum(['EMAIL', 'WHATSAPP', 'SMS', 'NOTIFICATION', 'SLACK']),
  subject: z.string().max(500, 'Subject must be 500 characters or less').optional().nullable(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be 10000 characters or less'),
  variables: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]).optional().nullable(),
})

// GET - List all templates
export const GET = withAuth(async () => {
  try {
    const templates = await prisma.communicationTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}, { roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'HR'] })

// POST - Create a new template
export const POST = withAuth(async (req, { user, params }) => {
if (!['SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = templateCreateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { name, category, type, subject, content, variables } = result.data

    const template = await prisma.communicationTemplate.create({
      data: {
        name,
        category,
        type,
        subject,
        content,
        variables: variables ? JSON.stringify(variables) : null,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
})
