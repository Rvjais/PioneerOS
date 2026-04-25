import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()

        // Validate required fields
        if (!body.companyName || !body.contactName) {
            return NextResponse.json({ error: 'Company name and contact name are required' }, { status: 400 })
        }

        const rfp = await prisma.rFPSubmission.create({
            data: {
                companyName: body.companyName,
                contactName: body.contactName,
                contactEmail: body.contactEmail || null,
                contactPhone: body.contactPhone || null,
                address: body.address || null,
                gstNumber: body.gstNumber || null,
                industry: body.industry || null,
                businessType: body.businessType || null,
                websiteUrl: body.websiteUrl || null,
                servicesRequested: body.servicesRequested || null,
                scopeDetails: body.scopeDetails || null,
                budgetRange: body.budgetRange || null,
                monthlyBudget: body.monthlyBudget || null,
                expectedStartDate: body.expectedStartDate ? new Date(body.expectedStartDate) : null,
                contractDuration: body.contractDuration || null,
                submittedById: session.user.id,
                status: 'NEW',
            },
        })

        return NextResponse.json({ success: true, rfp })
    } catch (error) {
        console.error('Failed to create RFP:', error)
        return NextResponse.json({ error: 'Failed to submit RFP. Please try again.' }, { status: 500 })
    }
}
