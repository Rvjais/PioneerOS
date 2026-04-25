import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { postId, content } = await req.json()
        if (!postId || !content || content.trim() === '') {
            return NextResponse.json({ error: 'Missing postId or content' }, { status: 400 })
        }

        await prisma.comment.create({
            data: {
                content: content.trim(),
                postId,
                userId: session.user.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('API ERROR in /api/network/comment:', error)
        return NextResponse.json({ error: error.message || 'Failed to add comment.' }, { status: 500 })
    }
}
