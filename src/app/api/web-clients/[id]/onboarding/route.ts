import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET /api/web-clients/[id]/onboarding - Get onboarding submissions for client
export const GET = withAuth(async (req, { user, params: routeParams }) => {

  const { id: clientId } = await routeParams!

  try {
    const onboardings = await prisma.webOnboarding.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ onboardings })
  } catch (error) {
    console.error('Failed to fetch onboardings:', error)
    return NextResponse.json({ error: 'Failed to fetch onboardings' }, { status: 500 })
  }
})

// POST /api/web-clients/[id]/onboarding - Create new onboarding link
export const POST = withAuth(async (req, { user, params: routeParams }) => {

  const { id: clientId } = await routeParams!

  try {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        contactName: true,
        contactEmail: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Create new onboarding record
    const onboarding = await prisma.webOnboarding.create({
      data: {
        clientId,
        status: 'PENDING',
        businessName: client.name,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
      },
    })

    // Generate link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const onboardingLink = `${baseUrl}/web-onboarding/${onboarding.token}`

    return NextResponse.json({
      success: true,
      onboarding: {
        id: onboarding.id,
        token: onboarding.token,
        status: onboarding.status,
        createdAt: onboarding.createdAt,
      },
      link: onboardingLink,
    })
  } catch (error) {
    console.error('Failed to create onboarding:', error)
    return NextResponse.json({ error: 'Failed to create onboarding link' }, { status: 500 })
  }
})
