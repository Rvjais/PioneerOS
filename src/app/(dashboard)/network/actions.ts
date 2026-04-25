'use server'

import { prisma } from '@/server/db/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'

export async function createPost(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) throw new Error('Unauthorized')

        const content = formData.get('content') as string
        if (!content || content.trim() === '') return

        const type = (formData.get('type') as string) || 'POST'

        await prisma.post.create({
            data: {
                content: content.trim(),
                type,
                userId: session.user.id
            }
        })

        revalidatePath('/network')
        return { success: true }
    } catch (error: any) {
        console.error('SERVER ACTION ERROR in createPost:', error)
        return { error: error?.message || 'Failed to create post. Please try again.' }
    }
}

export async function toggleLike(postId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Unauthorized')

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

    revalidatePath('/network')
}

export async function createComment(postId: string, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Unauthorized')

    const content = formData.get('content') as string
    if (!content || content.trim() === '') return

    await prisma.comment.create({
        data: {
            content: content.trim(),
            postId,
            userId: session.user.id
        }
    })

    revalidatePath('/network')
}
