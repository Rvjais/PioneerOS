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

        const { postId } = await req.json()
        if (!postId) {
            return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
        }

        const existingLike = await prisma.like.findFirst({
            where: {
                postId,
                userId: session.user.id
            }
        })

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            })
        } else {
            await prisma.like.create({
                data: {
                    postId,
                    userId: session.user.id
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('API ERROR in /api/network/like:', error)
        return NextResponse.json({ error: error.message || 'Failed to toggle like.' }, { status: 500 })
    }
}
