import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const logSchema = z.object({
  clientId: z.string().min(1),
  remarks: z.string().min(1),
  flagStatus: z.string().default('GREEN'),
  paymentStatus: z.string().default('PENDING'),
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = logSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { clientId, remarks, flagStatus, paymentStatus } = parsed.data

    const log = await prisma.clientOperationsLog.create({
      data: {
        clientId,
        remarks,
        flagStatus,
        paymentStatus,
        loggedBy: user.id,
      },
    })

    return NextResponse.json({ success: true, log }, { status: 201 })
  } catch (error) {
    console.error('Failed to log operations remark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})