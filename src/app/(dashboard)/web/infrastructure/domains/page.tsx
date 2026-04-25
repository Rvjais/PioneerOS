import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DomainCard } from '@/client/components/web/DomainCard'
import { AddDomainModal } from '@/client/components/web/AddDomainModal'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'
import { ExportDomainsButton } from './ExportDomainsButton'

async function getDomains() {
  const domains = await prisma.domain.findMany({
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: { expiryDate: 'asc' },
  })

  return domains
}

export default async function DomainsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Check for manager access
  const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD', 'WEB_MANAGER'].includes(
    session.user.role
  )
  if (!isManager) {
    redirect('/web')
  }

  const domains = await getDomains()

  // Calculate stats
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const expiringIn30Days = domains.filter((d) => {
    const expiry = new Date(d.expiryDate)
    return expiry >= now && expiry <= thirtyDaysFromNow
  })
  const expiringIn90Days = domains.filter(
    (d) => new Date(d.expiryDate) > thirtyDaysFromNow && new Date(d.expiryDate) <= ninetyDaysFromNow
  )
  const sslIssues = domains.filter((d) => d.sslStatus !== 'ACTIVE')
  const autoRenewOff = domains.filter((d) => !d.autoRenew)

  // Group domains by status
  const expiredDomains = domains.filter((d) => new Date(d.expiryDate) < now)
  const criticalDomains = domains.filter(
    (d) => new Date(d.expiryDate) >= now && new Date(d.expiryDate) <= thirtyDaysFromNow
  )
  const warningDomains = domains.filter(
    (d) => new Date(d.expiryDate) > thirtyDaysFromNow && new Date(d.expiryDate) <= ninetyDaysFromNow
  )
  const healthyDomains = domains.filter((d) => new Date(d.expiryDate) > ninetyDaysFromNow)

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Web', href: '/web' },
        { label: 'Domains' },
      ]} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Domain Management</h1>
          <p className="text-slate-400 mt-1">Monitor and manage all client domains</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDomainsButton domains={domains.map(d => ({
            domainName: d.domainName,
            registrar: d.registrar,
            expiryDate: d.expiryDate.toISOString(),
            sslStatus: d.sslStatus,
            sslExpiryDate: d.sslExpiryDate ? d.sslExpiryDate.toISOString() : null,
            autoRenew: d.autoRenew,
            client: d.client,
          }))} />
          <AddDomainModal />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
          <p className="text-3xl font-bold text-white">{domains.length}</p>
          <p className="text-sm text-slate-400">Total Domains</p>
        </div>
        <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-red-400">{expiringIn30Days.length}</p>
          <p className="text-sm text-slate-400">Expiring in 30 days</p>
        </div>
        <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-400">{sslIssues.length}</p>
          <p className="text-sm text-slate-400">SSL Issues</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-500/30 rounded-xl p-4">
          <p className="text-3xl font-bold text-slate-400">{autoRenewOff.length}</p>
          <p className="text-sm text-slate-400">Auto-Renew Off</p>
        </div>
      </div>

      {/* Expired Domains */}
      {expiredDomains.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Expired Domains ({expiredDomains.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiredDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} variant="expired" />
            ))}
          </div>
        </div>
      )}

      {/* Critical - Expiring in 30 days */}
      {criticalDomains.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-red-400 mb-4">
            Expiring Within 30 Days ({criticalDomains.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} variant="critical" />
            ))}
          </div>
        </div>
      )}

      {/* Warning - Expiring in 30-90 days */}
      {warningDomains.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-400 mb-4">
            Expiring in 30-90 Days ({warningDomains.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warningDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} variant="warning" />
            ))}
          </div>
        </div>
      )}

      {/* Healthy Domains */}
      {healthyDomains.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-green-400 mb-4">
            Healthy Domains ({healthyDomains.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthyDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} variant="healthy" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {domains.length === 0 && (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 text-center">
          <svg
            className="w-12 h-12 text-slate-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
          <p className="text-slate-400">No domains registered yet. Add your first domain to get started.</p>
        </div>
      )}
    </div>
  )
}
