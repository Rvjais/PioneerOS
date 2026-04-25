'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FinanceStats {
  totalRevenue: number
  pendingPayments: number
  receivedThisMonth: number
  overdueAmount: number
  clientCount: number
  invoiceCount: number
}

interface Client {
  id: string
  name: string
  monthlyFee: number
  paymentStatus: string
  status: string
  paymentDueDay?: number
  pendingAmount?: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  amount: number
  status: string
  dueDate: string
  client?: {
    name: string
  }
}

export default function FinanceOverviewPage() {
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    receivedThisMonth: 0,
    overdueAmount: 0,
    clientCount: 0,
    invoiceCount: 0
  })
  const [pendingClients, setPendingClients] = useState<Client[]>([])
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      const [clientsRes, invoicesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/invoices')
      ])

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        // Handle both array and {clients: []} formats
        const clients: Client[] = Array.isArray(clientsData) ? clientsData : (clientsData.clients || [])

        // Only count active clients for revenue
        const activeClients = clients.filter(c => c.status === 'ACTIVE')
        const totalRevenue = activeClients.reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

        // Calculate pending payments from clients with non-PAID status
        const pendingClients = clients.filter(c => c.paymentStatus !== 'PAID')
        const pendingPayments = pendingClients.reduce((sum, c) => sum + (c.pendingAmount || c.monthlyFee || 0), 0)

        // Calculate overdue from client data
        const overdueFromClients = clients
          .filter(c => c.paymentStatus === 'OVERDUE')
          .reduce((sum, c) => sum + (c.pendingAmount || c.monthlyFee || 0), 0)

        setStats(prev => ({
          ...prev,
          totalRevenue,
          pendingPayments,
          overdueAmount: overdueFromClients,
          clientCount: activeClients.length
        }))

        setPendingClients(pendingClients.slice(0, 5))
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        // Handle both array and {invoices: []} formats
        const invoices: Invoice[] = Array.isArray(invoicesData) ? invoicesData : (invoicesData.invoices || [])
        setRecentInvoices(invoices.slice(0, 5))

        // Calculate overdue from invoices
        const overdueInvoices = invoices
          .filter(i => i.status === 'OVERDUE')
          .reduce((sum, i) => sum + i.amount, 0)

        // Calculate received this month
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const receivedThisMonth = invoices
          .filter(i => i.status === 'PAID')
          .reduce((sum, i) => sum + i.amount, 0)

        setStats(prev => ({
          ...prev,
          overdueAmount: prev.overdueAmount > 0 ? prev.overdueAmount : overdueInvoices,
          receivedThisMonth,
          invoiceCount: invoices.length
        }))
      }
    } catch (error) {
      console.error('Failed to fetch finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Overview</h1>
          <p className="text-slate-400">Track revenue, payments, and invoices</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/finance/invoices"
            className="px-4 py-2 text-sm font-medium text-slate-200 glass-card border border-white/10 rounded-lg hover:bg-slate-900/40"
          >
            View PIs
          </Link>
          <Link
            href="/finance/invoices/new"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Create PI
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-400 mt-2">From {stats.clientCount} active clients</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pending Payments</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {formatCurrency(stats.pendingPayments)}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Awaiting collection</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Received This Month</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {formatCurrency(stats.receivedThisMonth)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">{stats.invoiceCount} PIs processed</p>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Overdue Amount</p>
              <p className={`text-2xl font-bold mt-1 ${stats.overdueAmount > 0 ? 'text-red-400' : 'text-white'}`}>
                {formatCurrency(stats.overdueAmount)}
              </p>
            </div>
            <div className={`w-12 h-12 ${stats.overdueAmount > 0 ? 'bg-red-500/20' : 'bg-green-500/20'} rounded-lg flex items-center justify-center`}>
              {stats.overdueAmount > 0 ? (
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <p className={`text-xs mt-2 ${stats.overdueAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {stats.overdueAmount > 0 ? 'Requires immediate attention' : 'All payments on track'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="glass-card rounded-xl border border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Pending Payments</h2>
            <Link href="/finance/invoices" className="text-sm text-blue-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {pendingClients.length > 0 ? (
              pendingClients.map(client => (
                <div key={client.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{client.name}</p>
                    <p className="text-sm text-slate-400">
                      Due: {client.paymentDueDay ? `Day ${client.paymentDueDay}` : 'Not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(client.pendingAmount || client.monthlyFee || 0)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      client.paymentStatus === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                      client.paymentStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800/50 text-slate-200'
                    }`}>
                      {client.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                No pending payments
              </div>
            )}
          </div>
        </div>

        {/* Recent Proforma Invoices */}
        <div className="glass-card rounded-xl border border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Proforma Invoices</h2>
            <Link href="/finance/invoices" className="text-sm text-blue-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {recentInvoices.length > 0 ? (
              recentInvoices.map(invoice => (
                <div key={invoice.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-400">
                      {invoice.client?.name || 'Unknown Client'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      invoice.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                      invoice.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                      invoice.status === 'SENT' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-800/50 text-slate-200'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                No proforma invoices found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl border border-white/10 p-6">
        <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/accounts/contracts"
            className="p-4 border border-white/10 rounded-lg hover:border-blue-300 hover:bg-blue-500/10 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-white">Manage Contracts</p>
          </Link>
          <Link
            href="/finance/expenses"
            className="p-4 border border-white/10 rounded-lg hover:border-blue-300 hover:bg-blue-500/10 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-medium text-white">Track Expenses</p>
          </Link>
          <Link
            href="/accounts/onboardings"
            className="p-4 border border-white/10 rounded-lg hover:border-blue-300 hover:bg-blue-500/10 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm font-medium text-white">Client Onboarding</p>
          </Link>
          <Link
            href="/finance/reports"
            className="p-4 border border-white/10 rounded-lg hover:border-blue-300 hover:bg-blue-500/10 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium text-white">Generate Reports</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
