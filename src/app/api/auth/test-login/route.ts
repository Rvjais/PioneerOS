import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import crypto from 'crypto'

// Only available in development
const isDev = process.env.NODE_ENV === 'development'

// GET: Return list of employees for quick login
export async function GET() {
    if (!isDev) {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const employees = await prisma.user.findMany({
        where: { status: { in: ['ACTIVE', 'PROBATION'] } },
        select: { id: true, empId: true, firstName: true, lastName: true, role: true, department: true },
        orderBy: [{ role: 'asc' }, { empId: 'asc' }],
        take: 50,
    })

    return NextResponse.json({ employees })
}

// POST: Generate a magic link token — returns raw token for client-side verify+signIn
export async function POST(request: NextRequest) {
    if (!isDev) {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
    }

    const body = await request.json()
    const { empId } = body

    if (!empId) {
        return NextResponse.json({ error: 'empId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { empId } })
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a magic link token (without usedAt — the verify endpoint will set it)
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    await prisma.magicLinkToken.create({
        data: {
            userId: user.id,
            token: tokenHash,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
    })

    // Return raw token — login page will call verify then signIn() directly
    return NextResponse.json({ token: rawToken })
}
