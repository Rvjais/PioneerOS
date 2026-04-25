import { NextResponse } from 'next/server'
import { validateClientPortalSession } from '@/server/auth/clientPortalAuth'
import { prisma } from '@/server/db/prisma'

// GET /api/web-portal/contracts - Get domain/hosting contracts with expiry info
export async function GET() {
  const auth = await validateClientPortalSession()
  if (!auth.success) return auth.error

  const { user } = auth

  if (!user.hasWebsiteAccess) {
    return NextResponse.json({ error: 'No website access' }, { status: 403 })
  }

  try {
    const contracts = await prisma.maintenanceContract.findMany({
      where: { clientId: user.clientId },
      select: {
        id: true,
        type: true,
        startDate: true,
        endDate: true,
        renewalDate: true,
        amount: true,
        status: true,
        autoRenew: true,
        notes: true,
        domainName: true,
        domainRegistrar: true,
        domainExpiryDate: true,
        serverProvider: true,
        serverExpiryDate: true,
        serverPlan: true,
        billingCycle: true,
        nextBillingDate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { endDate: 'asc' },
    })

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Calculate days until expiry and urgency level for each contract
    const contractsWithExpiry = contracts.map(contract => {
      const domainExpiry = contract.domainExpiryDate ? new Date(contract.domainExpiryDate) : null
      const serverExpiry = contract.serverExpiryDate ? new Date(contract.serverExpiryDate) : null
      const contractEnd = new Date(contract.endDate)

      // Calculate days until expiry
      const daysUntilDomainExpiry = domainExpiry
        ? Math.ceil((domainExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null
      const daysUntilServerExpiry = serverExpiry
        ? Math.ceil((serverExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null
      const daysUntilContractEnd = Math.ceil((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Determine urgency level
      let urgency: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'OK' = 'OK'
      const minDays = Math.min(
        daysUntilDomainExpiry ?? Number.MAX_SAFE_INTEGER,
        daysUntilServerExpiry ?? Number.MAX_SAFE_INTEGER,
        daysUntilContractEnd
      )

      if (minDays < 0) urgency = 'EXPIRED'
      else if (minDays <= 7) urgency = 'CRITICAL'
      else if (minDays <= 30) urgency = 'WARNING'

      return {
        ...contract,
        daysUntilDomainExpiry,
        daysUntilServerExpiry,
        daysUntilContractEnd,
        urgency,
      }
    })

    // Separate active and expired/cancelled contracts
    const activeContracts = contractsWithExpiry.filter(c => c.status === 'ACTIVE')
    const expiredContracts = contractsWithExpiry.filter(c => c.status !== 'ACTIVE')

    // Get summary
    const summary = {
      total: contracts.length,
      active: activeContracts.length,
      expiring: activeContracts.filter(c => c.urgency === 'WARNING' || c.urgency === 'CRITICAL').length,
      expired: contractsWithExpiry.filter(c => c.urgency === 'EXPIRED').length,
    }

    return NextResponse.json({
      contracts: activeContracts,
      expiredContracts,
      summary,
    })
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}
