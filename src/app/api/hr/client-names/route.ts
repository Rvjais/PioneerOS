import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'

// GET - Returns only client names (no financial data) for HR
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only return name and id - no financial information
    const clients = await prisma.client.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching client names:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
