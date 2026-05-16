import { withAuth } from '@/server/auth/withAuth'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json()
  const { taskId, phone, message } = body

  if (!taskId || !phone || !message) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: taskId, phone, message' },
      { status: 400 }
    )
  }

  const messageId = `msg_${randomUUID().replace(/-/g, '').slice(0, 16)}`

  return NextResponse.json({
    success: true,
    messageId
  })
})
