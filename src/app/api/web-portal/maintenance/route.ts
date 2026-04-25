import { NextRequest, NextResponse } from 'next/server'
import { validateClientPortalSession } from '@/server/auth/clientPortalAuth'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// Notify admin/web team about new maintenance request
async function notifyMaintenanceRequest(
  clientId: string,
  clientName: string,
  planName: string,
  amount: number,
  contractId: string
) {
  try {
    // Get client info
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { name: true, accountManagerId: true },
    })

    const displayName = client?.name || clientName

    // Find admin and web team members
    const teamUsers = await prisma.user.findMany({
      where: {
        OR: [
          { department: 'WEB' },
          { department: 'ACCOUNTS' },
          { role: 'ADMIN' },
          { role: 'MANAGER' },
          // Also notify account manager if assigned
          ...(client?.accountManagerId ? [{ id: client.accountManagerId }] : []),
        ],
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    })

    // Remove duplicates
    const uniqueUserIds = [...new Set(teamUsers.map(u => u.id))]

    if (uniqueUserIds.length > 0) {
      await prisma.notification.createMany({
        data: uniqueUserIds.map(userId => ({
          userId,
          type: 'GENERAL',
          title: 'New Maintenance Plan Request',
          message: `${displayName} requested ${planName} (Rs.${amount.toLocaleString('en-IN')})`,
          link: `/accounts/contracts/${contractId}`,
          priority: 'HIGH',
        })),
      })
    }
  } catch (error) {
    console.error('[MAINTENANCE] Failed to notify team:', error)
  }
}

// Maintenance plan options
const MAINTENANCE_PLANS = [
  {
    id: 'basic-monthly',
    name: 'Basic Monthly',
    billingCycle: 'MONTHLY',
    price: 5000,
    currency: 'INR',
    features: [
      'Security updates',
      'Plugin/dependency updates',
      'Monthly backup',
      'Email support',
      'Up to 2 content updates',
    ],
    recommended: false,
  },
  {
    id: 'standard-monthly',
    name: 'Standard Monthly',
    billingCycle: 'MONTHLY',
    price: 10000,
    currency: 'INR',
    features: [
      'Everything in Basic',
      'Weekly backups',
      'Performance monitoring',
      'Priority email support',
      'Up to 5 content updates',
      'SSL certificate management',
    ],
    recommended: true,
  },
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    billingCycle: 'MONTHLY',
    price: 20000,
    currency: 'INR',
    features: [
      'Everything in Standard',
      'Daily backups',
      '24/7 uptime monitoring',
      'Phone support',
      'Unlimited content updates',
      'Speed optimization',
      'SEO health checks',
    ],
    recommended: false,
  },
  {
    id: 'basic-annual',
    name: 'Basic Annual',
    billingCycle: 'ANNUAL',
    price: 50000,
    currency: 'INR',
    monthlyEquivalent: 4167,
    savings: 10000,
    features: [
      'Security updates',
      'Plugin/dependency updates',
      'Monthly backup',
      'Email support',
      'Up to 2 content updates',
    ],
    recommended: false,
  },
  {
    id: 'standard-annual',
    name: 'Standard Annual',
    billingCycle: 'ANNUAL',
    price: 100000,
    currency: 'INR',
    monthlyEquivalent: 8333,
    savings: 20000,
    features: [
      'Everything in Basic',
      'Weekly backups',
      'Performance monitoring',
      'Priority email support',
      'Up to 5 content updates',
      'SSL certificate management',
    ],
    recommended: true,
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual',
    billingCycle: 'ANNUAL',
    price: 200000,
    currency: 'INR',
    monthlyEquivalent: 16667,
    savings: 40000,
    features: [
      'Everything in Standard',
      'Daily backups',
      '24/7 uptime monitoring',
      'Phone support',
      'Unlimited content updates',
      'Speed optimization',
      'SEO health checks',
    ],
    recommended: false,
  },
]

const maintenanceRequestSchema = z.object({
  planId: z.string(),
  notes: z.string().max(1000).optional(),
})

// GET /api/web-portal/maintenance - Get maintenance options and current plan
export async function GET() {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  try {
    // Get current maintenance contracts
    const currentContracts = await prisma.maintenanceContract.findMany({
      where: {
        clientId: user.clientId,
        type: 'MONTHLY_MAINTENANCE',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        type: true,
        startDate: true,
        endDate: true,
        amount: true,
        billingCycle: true,
        nextBillingDate: true,
        autoRenew: true,
        status: true,
      },
      orderBy: { startDate: 'desc' },
      take: 1,
    })

    const currentPlan = currentContracts[0] || null

    // Get client's web project status
    const client = await prisma.client.findUnique({
      where: { id: user.clientId },
      select: {
        webProjectStatus: true,
        websiteUrl: true,
      },
    })

    // Determine if maintenance is needed based on project status
    const maintenanceNeeded = client?.webProjectStatus === 'COMPLETED' || client?.webProjectStatus === 'MAINTENANCE'

    return NextResponse.json({
      plans: MAINTENANCE_PLANS,
      currentPlan: currentPlan ? {
        ...currentPlan,
        daysRemaining: Math.ceil((new Date(currentPlan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      } : null,
      maintenanceNeeded,
      websiteUrl: client?.websiteUrl,
      // AI tools upsell placeholder
      upsellOptions: [
        {
          id: 'ai-chatbot',
          name: 'AI Chatbot',
          description: 'Intelligent chatbot for customer support',
          status: 'COMING_SOON',
        },
        {
          id: 'ai-content',
          name: 'AI Content Assistant',
          description: 'AI-powered content generation and optimization',
          status: 'COMING_SOON',
        },
        {
          id: 'ai-analytics',
          name: 'AI Analytics',
          description: 'Smart insights and recommendations',
          status: 'COMING_SOON',
        },
      ],
    })
  } catch (error) {
    console.error('Failed to fetch maintenance options:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance options' }, { status: 500 })
  }
}

// POST /api/web-portal/maintenance - Request maintenance plan
export async function POST(req: NextRequest) {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  // Only PRIMARY users can request plans
  if (user.role !== 'PRIMARY') {
    return NextResponse.json({ error: 'Only primary users can request maintenance plans' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const validation = maintenanceRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const { planId, notes } = validation.data

    // Find the selected plan
    const selectedPlan = MAINTENANCE_PLANS.find(p => p.id === planId)
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Calculate dates based on billing cycle
    const startDate = new Date()
    const endDate = new Date()
    if (selectedPlan.billingCycle === 'ANNUAL') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (selectedPlan.billingCycle === 'QUARTERLY') {
      endDate.setMonth(endDate.getMonth() + 3)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Create maintenance contract request (status PENDING until admin approves/invoices)
    const contract = await prisma.maintenanceContract.create({
      data: {
        clientId: user.clientId,
        type: 'MONTHLY_MAINTENANCE',
        startDate,
        endDate,
        renewalDate: endDate,
        amount: selectedPlan.price,
        status: 'PENDING',
        billingCycle: selectedPlan.billingCycle,
        nextBillingDate: endDate,
        autoRenew: true,
        notes: notes ? `Plan: ${selectedPlan.name}\n\nClient Notes: ${notes}` : `Plan: ${selectedPlan.name}`,
      },
    })

    // Send notification to admin/web team about new maintenance request
    await notifyMaintenanceRequest(
      user.clientId,
      user.name,
      selectedPlan.name,
      selectedPlan.price,
      contract.id
    )

    return NextResponse.json({
      success: true,
      message: 'Maintenance plan request submitted. Our team will contact you shortly.',
      contract: {
        id: contract.id,
        plan: selectedPlan.name,
        amount: selectedPlan.price,
        billingCycle: selectedPlan.billingCycle,
        status: 'PENDING',
      },
    })
  } catch (error) {
    console.error('Failed to request maintenance plan:', error)
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
