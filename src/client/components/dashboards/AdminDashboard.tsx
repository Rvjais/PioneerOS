'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totalEmployees: number
  activeClients: number
  monthlyRevenue: number
  pendingTasks: number
  openIssues: number
  newLeads: number
  pendingOnboardings: number
  pendingPayments: number
  atRiskClients: number
  clientsWithMissingDetails: number
}

interface MissingDetailsClient {
  id: string
  name: string
  missingFields: string[]
}

interface ClientMagicLink {
  clientId: string
  clientUserId: string
  clientName: string
  email: string
  services: string[]
  status: string
  paymentStatus: string | null
  magicLink: string
  token: string
}

interface RecentActivity {
  id: string
  type: string
  title: string
  time: string
  link: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    pendingTasks: 0,
    openIssues: 0,
    newLeads: 0,
    pendingOnboardings: 0,
    pendingPayments: 0,
    atRiskClients: 0,
    clientsWithMissingDetails: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [clientsWithMissingDetails, setClientsWithMissingDetails] = useState<MissingDetailsClient[]>([])
  const [clientMagicLinks, setClientMagicLinks] = useState<ClientMagicLink[]>([])
  const [showClientLinks, setShowClientLinks] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
    fetchClientMagicLinks()
  }, [])

  const fetchClientMagicLinks = async () => {
    try {
      const res = await fetch('/api/auth/client-magic')
      if (res.ok) {
        const data = await res.json()
        setClientMagicLinks(data.links || [])
      }
    } catch (error) {
      console.error('Failed to fetch client magic links:', error)
    }
  }

  const copyToClipboard = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(id)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const fetchDashboardStats = async () => {
    try {
      const [usersRes, clientsRes, leadsRes, issuesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/clients'),
        fetch('/api/crm/leads'),
        fetch('/api/issues')
      ])

      let employees = 0, clients = 0, revenue = 0, pendingOnboardings = 0
      let newLeads = 0, openIssues = 0, pendingPayments = 0, atRiskClients = 0

      if (usersRes.ok) {
        const data = await usersRes.json()
        employees = Array.isArray(data) ? data.length : (data.users?.length || 0)
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json()
        const clientList = Array.isArray(data) ? data : (data.clients || [])
        clients = clientList.filter((c: any) => c.status === 'ACTIVE').length
        revenue = clientList
          .filter((c: any) => c.status === 'ACTIVE')
          .reduce((sum: number, c: any) => sum + (c.monthlyFee || 0), 0)
        pendingOnboardings = clientList.filter((c: any) =>
          ['PENDING', 'IN_PROGRESS', 'AWAITING_SLA', 'AWAITING_PAYMENT'].includes(c.onboardingStatus)
        ).length
        pendingPayments = clientList.filter((c: any) => c.paymentStatus === 'PENDING' || c.paymentStatus === 'OVERDUE').length
        atRiskClients = clientList.filter((c: any) => c.healthStatus === 'AT_RISK').length

        // Check for clients with missing important details
        const missingDetailsClients: MissingDetailsClient[] = []
        clientList.forEach((c: any) => {
          if (c.status !== 'ACTIVE') return
          const missing: string[] = []
          if (!c.contactPhone) missing.push('Phone')
          if (!c.contactEmail) missing.push('Email')
          if (!c.invoiceDayOfMonth && !c.paymentDueDay) missing.push('Invoice Day')
          if (!c.monthlyFee || c.monthlyFee === 0) missing.push('Monthly Fee')
          if (!c.services || c.services === '[]') missing.push('Services')
          if (!c.contactName) missing.push('Contact Name')
          if (!c.industry) missing.push('Industry')
          if (missing.length > 0) {
            missingDetailsClients.push({ id: c.id, name: c.name, missingFields: missing })
          }
        })
        setClientsWithMissingDetails(missingDetailsClients.slice(0, 10))
      }

      if (leadsRes.ok) {
        const data = await leadsRes.json()
        newLeads = (Array.isArray(data) ? data : (data.leads || [])).filter((l: any) => l.status === 'NEW').length
      }

      if (issuesRes.ok) {
        const data = await issuesRes.json()
        openIssues = (Array.isArray(data) ? data : (data.issues || [])).filter((i: any) => i.status === 'OPEN').length
      }

      setStats({ totalEmployees: employees, activeClients: clients, monthlyRevenue: revenue, pendingTasks: 0, openIssues, newLeads, pendingOnboardings, pendingPayments, atRiskClients, clientsWithMissingDetails: clientsWithMissingDetails.length })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
  }

  return (
    <div className="space-y-6 pb-8 text-slate-800 bg-slate-50 border border-slate-200 rounded-3xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Command Center</h1>
          <p className="text-slate-500 mt-1">Complete overview of operations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-medium transition-colors">
            Manage Users
          </Link>
          <Link href="/analytics" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-medium shadow hover:shadow-md transition-all">
            Analytics
          </Link>
        </div>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard label="Active Clients" value={stats.activeClients} loading={loading} color="blue" />
        <MetricCard label="Team Members" value={stats.totalEmployees} loading={loading} color="emerald" />
        <MetricCard label="Monthly MRR" value={formatCurrency(stats.monthlyRevenue)} loading={loading} color="purple" isText />
        <MetricCard label="New Leads" value={stats.newLeads} loading={loading} color="amber" />
        <MetricCard label="Open Issues" value={stats.openIssues} loading={loading} color="red" alert={stats.openIssues > 0} />
        <MetricCard label="Pending Onboard" value={stats.pendingOnboardings} loading={loading} color="cyan" />
      </div>

      {/* Alert Banners */}
      {(stats.openIssues > 0 || stats.atRiskClients > 0 || stats.pendingPayments > 0) && (
        <div className="grid md:grid-cols-3 gap-4">
          {stats.openIssues > 0 && (
            <Link href="/issues" className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-700">{stats.openIssues} Open Issues</p>
                <p className="text-sm text-red-500">Require attention</p>
              </div>
            </Link>
          )}
          {stats.atRiskClients > 0 && (
            <Link href="/clients?filter=at_risk" className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-700">{stats.atRiskClients} At-Risk Clients</p>
                <p className="text-sm text-amber-500">Need intervention</p>
              </div>
            </Link>
          )}
          {stats.pendingPayments > 0 && (
            <Link href="/accounts/pending-payments" className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-orange-700">{stats.pendingPayments} Pending Payments</p>
                <p className="text-sm text-orange-500">Follow up required</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Missing Details Reminder */}
      {clientsWithMissingDetails.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-pink-900">Missing Client Details</h3>
                <p className="text-sm text-pink-600">{clientsWithMissingDetails.length} clients need data completion</p>
              </div>
            </div>
            <Link href="/clients?filter=incomplete" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="grid gap-3">
            {clientsWithMissingDetails.slice(0, 5).map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between p-3 bg-white hover:bg-pink-50 rounded-xl border border-pink-100 hover:border-pink-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-700 font-bold text-sm">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-pink-900">{client.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {client.missingFields.map((field) => (
                        <span key={field} className="text-[10px] px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded font-medium">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Client Portal Magic Links */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowClientLinks(!showClientLinks)}
          className="w-full p-4 flex items-center justify-between hover:bg-cyan-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-cyan-900">Client Portal Magic Links</h3>
              <p className="text-sm text-cyan-600">{clientMagicLinks.length} clients with portal access</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-cyan-400 transition-transform ${showClientLinks ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showClientLinks && (
          <div className="border-t border-cyan-100 p-4 max-h-96 overflow-y-auto">
            <div className="grid gap-2">
              {clientMagicLinks.map((client) => (
                <div
                  key={client.clientUserId}
                  className="flex items-center justify-between p-3 bg-white hover:bg-cyan-50 rounded-xl border border-cyan-100 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      client.services.includes('WEB')
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {client.clientName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{client.clientName}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {client.services.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                            {s}
                          </span>
                        ))}
                        {client.paymentStatus && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            client.paymentStatus === 'DONE'
                              ? 'bg-green-100 text-green-700'
                              : client.paymentStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {client.paymentStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => copyToClipboard(client.magicLink, client.clientUserId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        copiedLink === client.clientUserId
                          ? 'bg-green-500 text-white'
                          : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                      }`}
                    >
                      {copiedLink === client.clientUserId ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                      href={client.magicLink}
                      target="_blank"
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                      title="Open in new tab"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
              {clientMagicLinks.length === 0 && (
                <p className="text-center text-slate-500 py-4">No client portal users found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Clients & Projects */}
        <NavSection
          title="Clients & Projects"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          color="blue"
          links={[
            { href: '/clients', label: 'All Clients', badge: stats.activeClients },
            { href: '/clients/lifecycle', label: 'Client Lifecycle' },
            { href: '/projects', label: 'Projects' },
            { href: '/tasks', label: 'Task Board' },
            { href: '/meetings', label: 'Meetings' },
            { href: '/issues', label: 'Issues', badge: stats.openIssues, badgeColor: 'red' },
          ]}
        />

        {/* Sales & CRM */}
        <NavSection
          title="Sales & CRM"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          color="emerald"
          links={[
            { href: '/crm', label: 'CRM Pipeline', badge: stats.newLeads },
            { href: '/crm/leads', label: 'All Leads' },
            { href: '/clients/rfp', label: 'RFP Submissions' },
            { href: '/sales', label: 'Sales Dashboard' },
            { href: '/analytics', label: 'Analytics' },
          ]}
        />

        {/* HR & Team */}
        <NavSection
          title="HR & Team"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          color="purple"
          links={[
            { href: '/team', label: 'Team Directory' },
            { href: '/hr', label: 'HR Dashboard' },
            { href: '/hr/onboarding-checklist', label: 'Employee Onboarding' },
            { href: '/hr/verifications', label: 'Document Verification' },
            { href: '/hr/appraisals', label: 'Appraisals' },
            { href: '/hr/attendance', label: 'Attendance' },
            { href: '/hr/leaves', label: 'Leave Management' },
          ]}
        />

        {/* Finance & Accounts */}
        <NavSection
          title="Finance & Accounts"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="amber"
          links={[
            { href: '/finance/overview', label: 'Finance Overview' },
            { href: '/accounts/client-onboarding', label: 'Client Onboarding', badge: stats.pendingOnboardings },
            { href: '/accounts/contracts', label: 'Contracts' },
            { href: '/accounts/pending-payments', label: 'Pending Payments', badge: stats.pendingPayments },
            { href: '/finance/invoices', label: 'Invoices' },
            { href: '/expenses', label: 'Expenses' },
            { href: '/vendors', label: 'Vendors' },
          ]}
        />
      </div>

      {/* Quick Actions & Public Forms */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/admin/users" icon="user-plus" label="Add User" color="blue" />
            <QuickAction href="/clients/rfp/new" icon="file-plus" label="New Lead" color="emerald" />
            <QuickAction href="/tasks/daily" icon="calendar" label="Daily Planner" color="purple" />
            <QuickAction href="/meetings/new" icon="video" label="Schedule Meeting" color="amber" />
            <QuickAction href="/finance/invoices/new" icon="receipt" label="Create Invoice" color="cyan" />
            <QuickAction href="/hr/forms/appraisal" icon="star" label="Start Appraisal" color="pink" />
          </div>
        </div>

        {/* Public Forms & Links */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Public Forms & Gateways
          </h3>
          <div className="space-y-3">
            <PublicLink href="/accounts/onboarding/create" label="Create Client Onboarding" desc="Generate token-based onboarding link" />
            <PublicLink href="/employee-onboarding" label="Employee Onboarding" desc="For new hires to submit documents" />
            <PublicLink href="/hr/forms/exit" label="Exit Interview Form" desc="Trigger offboarding process" />
            <PublicLink href="/hr/vendor-onboarding" label="Vendor Registration" desc="For new vendor onboarding" />
          </div>
        </div>
      </div>

      {/* Knowledge & Culture */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Knowledge & Culture Hub</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <CompactLink href="/sop" icon="book" label="SOPs" />
          <CompactLink href="/policies" icon="shield" label="Policies" />
          <CompactLink href="/guidebook" icon="map" label="Guidebook" />
          <CompactLink href="/learning" icon="academic" label="Learning" />
          <CompactLink href="/ideas" icon="lightbulb" label="Ideas" />
          <CompactLink href="/recognition" icon="trophy" label="Recognition" />
          <CompactLink href="/arcade" icon="game" label="Arcade" />
          <CompactLink href="/performance" icon="chart" label="Leaderboard" />
          <CompactLink href="/knowledge" icon="database" label="Knowledge Base" />
          <CompactLink href="/clients/guidelines" icon="clipboard" label="Client Guidelines" />
          <CompactLink href="/clients/communication" icon="chat" label="Communication" />
          <CompactLink href="/profile" icon="user" label="My Profile" />
        </div>
      </div>

      {/* Admin Tools */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin Tools
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <CompactLink href="/admin/users" icon="users" label="User Management" />
          <CompactLink href="/admin/roles" icon="key" label="Roles & Permissions" />
          <CompactLink href="/admin/departments" icon="building" label="Departments" />
          <CompactLink href="/admin/settings" icon="cog" label="Settings" />
          <CompactLink href="/admin/audit-log" icon="list" label="Audit Log" />
          <CompactLink href="/admin/notifications" icon="bell" label="Notifications" />
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({ label, value, loading, color, alert, isText }: {
  label: string; value: number | string; loading: boolean; color: string; alert?: boolean; isText?: boolean
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
    cyan: 'bg-cyan-50 border-cyan-200',
  }

  const textClasses: Record<string, string> = {
    blue: 'text-blue-900', emerald: 'text-emerald-900', purple: 'text-purple-900',
    amber: 'text-amber-900', red: 'text-red-900', cyan: 'text-cyan-900'
  }

  const labelClasses: Record<string, string> = {
    blue: 'text-blue-700', emerald: 'text-emerald-700', purple: 'text-purple-700',
    amber: 'text-amber-700', red: 'text-red-700', cyan: 'text-cyan-700'
  }

  return (
    <div className={`${colorClasses[color]} border rounded-2xl p-4 ${alert ? 'animate-pulse' : ''}`}>
      <p className={`text-2xl font-bold ${textClasses[color]} ${isText ? 'text-xl' : ''}`}>
        {loading ? '...' : value}
      </p>
      <p className={`text-sm font-medium ${labelClasses[color]}`}>{label}</p>
    </div>
  )
}

// Navigation Section Component
function NavSection({ title, icon, color, links }: {
  title: string;
  icon: React.ReactNode;
  color: string;
  links: Array<{ href: string; label: string; badge?: number; badgeColor?: string }>
}) {
  const colorClasses: Record<string, { bg: string; border: string; iconBg: string }> = {
    blue: { bg: 'bg-white', border: 'border-blue-200', iconBg: 'bg-blue-100 text-blue-600' },
    emerald: { bg: 'bg-white', border: 'border-emerald-200', iconBg: 'bg-emerald-100 text-emerald-600' },
    purple: { bg: 'bg-white', border: 'border-purple-200', iconBg: 'bg-purple-100 text-purple-600' },
    amber: { bg: 'bg-white', border: 'border-amber-200', iconBg: 'bg-amber-100 text-amber-600' },
  }

  const colors = colorClasses[color]

  return (
    <div className={`${colors.bg} border ${colors.border} shadow-sm rounded-2xl overflow-hidden`}>
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className={`w-10 h-10 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium">{link.label}</span>
            {link.badge !== undefined && link.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                link.badgeColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-800'
              }`}>
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Quick Action Button
function QuickAction({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    'user-plus': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    'file-plus': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    'calendar': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    'video': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    'receipt': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    'star': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  }

  const colorClasses: Record<string, string> = {
    blue: 'bg-white border-blue-200 hover:bg-blue-50 text-blue-700',
    emerald: 'bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-700',
    purple: 'bg-white border-purple-200 hover:bg-purple-50 text-purple-700',
    amber: 'bg-white border-amber-200 hover:bg-amber-50 text-amber-700',
    cyan: 'bg-white border-cyan-200 hover:bg-cyan-50 text-cyan-700',
    pink: 'bg-white border-pink-200 hover:bg-pink-50 text-pink-700',
  }

  return (
    <Link href={href} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors shadow-sm ${colorClasses[color]}`}>
      {iconMap[icon]}
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  )
}

// Public Link Component
function PublicLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 bg-white hover:bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all group">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-purple-900 group-hover:text-purple-700 transition-colors">{label}</p>
        <p className="text-xs text-slate-500 font-medium">{desc}</p>
      </div>
      <svg className="w-5 h-5 text-purple-300 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

// Compact Link Component
function CompactLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    'book': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    'shield': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    'map': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    'academic': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    'lightbulb': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    'trophy': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    'game': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'chart': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    'database': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    'clipboard': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    'chat': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    'user': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    'users': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    'key': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    'building': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    'cog': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    'list': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    'bell': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  }

  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg text-slate-700 transition-colors">
      {iconMap[icon]}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
