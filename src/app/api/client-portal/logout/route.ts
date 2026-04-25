import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('client_session')?.value

    if (sessionToken) {
      // Clear session token in database
      await prisma.clientUser.updateMany({
        where: { sessionToken },
        data: { sessionToken: null },
      })
    }

    // Clear cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('client_session')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
