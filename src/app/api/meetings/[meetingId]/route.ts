import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'

export async function PATCH(request: Request, { params }: { params: Promise<{ meetingId: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { meetingId } = await params
        const data = await request.json()
        const { status, minutesSummary } = data

        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
            include: { participants: true }
        })

        if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // SECURITY FIX: Verify user can modify this meeting
        const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(session.user.role || '')
        const isParticipant = meeting.participants.some((p: { userId: string }) => p.userId === session.user.id)
        if (!isAdmin && !isParticipant) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Enforcement: Online meetings cannot be COMPLETED without a MoM (Minutes of Meeting / minutesSummary)
        if (status === 'COMPLETED' && meeting.isOnline) {
            const isMomRecorded = minutesSummary || meeting.minutesSummary || meeting.momRecorded

            if (!isMomRecorded) {
                return NextResponse.json(
                    { error: 'Cannot complete an online meeting without Minutes of Meeting (MoM)' },
                    { status: 400 }
                )
            }
        }

        const updated = await prisma.meeting.update({
            where: { id: meetingId },
            data: {
                ...data,
                momRecorded: !!(minutesSummary || meeting.minutesSummary || data.momRecorded || meeting.momRecorded)
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
    }
}
