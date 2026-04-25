import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { checkClientAccess } from '@/server/services/clientAccess'
import { withAuth } from '@/server/auth/withAuth'

const UpdateLogoSchema = z.object({
  logoUrl: z.string().url('Invalid URL format').or(z.literal('')),
})

// PATCH /api/clients/[clientId]/logo - Update client's logo
export const PATCH = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canModify) {
    return NextResponse.json(
      { error: 'You do not have permission to modify this client' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parseResult = UpdateLogoSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Invalid request' },
      { status: 400 }
    )
  }

  const { logoUrl } = parseResult.data

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const updatedClient = await prisma.client.update({
    where: { id: clientId },
    data: { logoUrl: logoUrl || null },
    select: { id: true, name: true, logoUrl: true },
  })

  return NextResponse.json({ client: updatedClient })
})

// GET /api/clients/[clientId]/logo - Get client's logo
export const GET = withAuth(async (req, { user, params }) => {
  const clientId = params?.clientId
  if (!clientId) {
    return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
  }

  const access = await checkClientAccess(user, clientId)
  if (!access.canView) {
    return NextResponse.json(
      { error: 'You do not have permission to view this client' },
      { status: 403 }
    )
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, logoUrl: true },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ client })
})
