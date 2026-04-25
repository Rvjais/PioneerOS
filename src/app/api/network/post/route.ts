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

        const { content, type } = await req.json()

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
        }

        const postType = type || 'POST'

        const newPost = await prisma.post.create({
            data: {
                content: content.trim(),
                type: postType,
                userId: session.user.id
            }
        })

        return NextResponse.json({ success: true, post: newPost })
    } catch (error: any) {
        console.error('API ERROR in /api/network/post:', error)
        return NextResponse.json({ error: error.message || 'Failed to create post. Please try again.' }, { status: 500 })
    }
}
