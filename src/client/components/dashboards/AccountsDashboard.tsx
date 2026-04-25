'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

interface AccountsDashboardProps {
  user: {
    firstName: string
    lastName: string
  }
  onboardings: Array<{
    id: string
    client: string
    stage: string
    value: number
    days: number
  }>
  invoices: Array<{
    id: string
    client: string
    invoice: string
    amount: number
    daysOverdue: number
  }>
  recentPayments: Array<{
    id: string
    client: string
    amount: number
    date: string
    method: string
  }>
  stats: {
    pendingInvoices: number
    overdueAmount: number
    monthlyRevenue: number
    pendingOnboardings: number
    collectionsRate: number
  }
}

export default function AccountsDashboard({
  user,
  onboardings: initialOnboardings,
  invoices: initialInvoices,
  recentPayments,
  stats
}: AccountsDashboardProps) {
  const [onboardings, setOnboardings] = useState(initialOnboardings.map(o => ({ ...o, reminderSent: false })))
  const [invoices, setInvoices] = useState(initialInvoices.map(i => ({ ...i, reminderSent: false, isPaid: false })))

  const handleSendOnboardingReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts/onboarding/${id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendDays: 7, sendEmail: true }),
      })
      if (res.ok) {
        setOnboardings(prev => prev.map(o => o.id === id ? { ...o, reminderSent: true } : o))
        toast.success('Onboarding reminder sent successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send reminder')
      }
    } catch {
      toast.error('Failed to send onboarding reminder')
    }
  }

  const handleSendInvoiceReminder = async (id: string) => {
    try {
      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'paymentReminder',
          templateArgs: [
            invoices.find(i => i.id === id)?.client || 'Client',
            invoices.find(i => i.id === id)?.amount?.toLocaleString('en-IN') || '0',
            invoices.find(i => i.id === id)?.invoice || 'Invoice',
          ],
          clientId: id,
        }),
      })
      if (res.ok) {
        setInvoices(prev => prev.map(i => i.id === id ? { ...i, reminderSent: true } : i))
        toast.success('Payment reminder sent successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send payment reminder')
      }
    } catch {
      toast.error('Failed to send payment reminder')
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', paidAt: new Date().toISOString() })
      })
      if (res.ok) {
        setInvoices(prev => prev.filter(i => i.id !== id))
        toast.success('Invoice marked as paid!')
      }
    } catch {
      toast.error('Failed to update invoice')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
        <p className="text-violet-100">Finance, invoicing, and client onboarding</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.pendingInvoices}</p>
          <p className="text-sm text-slate-400">Pending Invoices</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.overdueAmount)}</p>
          <p className="text-sm text-slate-400">Overdue Amount</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.monthlyRevenue)}</p>
          <p className="text-sm text-slate-400">Monthly Revenue</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.pendingOnboardings}</p>
          <p className="text-sm text-slate-400">Pending Onboardings</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.collectionsRate}%</p>
          <p className="text-sm text-slate-400">Collection Rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Onboardings */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Pending Client Onboardings</h2>
            <Link href="/accounts/onboardings" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {onboardings.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No pending onboardings</p>
            ) : (
              onboardings.map((onboarding) => (
                <div key={onboarding.id} className="p-3 border border-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{onboarding.client}</p>
                      <p className="text-xs text-slate-400">{onboarding.stage} • {onboarding.days} days</p>
                    </div>
                    <p className="text-sm font-medium text-green-400">{formatCurrency(onboarding.value)}/mo</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/accounts/contracts/${onboarding.id}`} className="flex-1 px-3 py-1.5 text-xs text-center bg-blue-600 text-white rounded hover:bg-blue-700">
                      Manage
                    </Link>
                    <button
                      onClick={() => handleSendOnboardingReminder(onboarding.id)}
                      disabled={onboarding.reminderSent}
                      className={`px-3 py-1.5 text-xs rounded ${
                        onboarding.reminderSent
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {onboarding.reminderSent ? 'Sent!' : 'Send Reminder'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Overdue Invoices</h2>
            <Link href="/finance/invoices?status=overdue" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No overdue invoices. Great job!</p>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="p-3 border border-red-100 bg-red-500/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{invoice.client}</p>
                      <p className="text-xs text-slate-400">{invoice.invoice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-400">{formatCurrency(invoice.amount)}</p>
                      <p className="text-xs text-red-500">{invoice.daysOverdue} days overdue</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSendInvoiceReminder(invoice.id)}
                      disabled={invoice.reminderSent}
                      className={`flex-1 px-3 py-1.5 text-xs rounded ${
                        invoice.reminderSent
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {invoice.reminderSent ? 'Reminder Sent' : 'Send Reminder'}
                    </button>
                    <button
                      onClick={() => handleMarkPaid(invoice.id)}
                      className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-200"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Payments</h2>
            <Link href="/finance/invoices" className="text-sm text-blue-400 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No recent payments</p>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-100 rounded-lg">
                  <div>
                    <p className="font-medium text-white text-sm">{payment.client}</p>
                    <p className="text-xs text-slate-400">{payment.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-400">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-slate-400">{formatDate(payment.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl border border-white/10 p-6">
          <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/finance/invoices/create" className="p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-blue-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-400">Create Invoice</span>
            </Link>
            <Link href="/accounts/contracts" className="p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-purple-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-purple-400">Manage Contracts</span>
            </Link>
            <Link href="/finance/overview" className="p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-green-400">Finance Reports</span>
            </Link>
            <Link href="/accounts/ledger" className="p-4 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors text-center">
              <svg className="w-6 h-6 text-amber-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-amber-400">Client Ledger</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
