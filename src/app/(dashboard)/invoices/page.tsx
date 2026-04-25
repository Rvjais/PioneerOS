import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateShort } from '@/shared/utils/cn'
import PageGuide from '@/client/components/ui/PageGuide'
import DataDiscovery from '@/client/components/ui/DataDiscovery'
import { requirePageAuth, ACCOUNTS_ACCESS } from '@/server/auth/pageAuth'

async function getInvoices() {
  return prisma.invoice.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  })
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-800/50 text-slate-200',
  SENT: 'bg-blue-500/20 text-blue-400',
  PAID: 'bg-green-500/20 text-green-400',
  OVERDUE: 'bg-red-500/20 text-red-400',
  CANCELLED: 'bg-slate-800/50 text-slate-400',
}

export default async function InvoicesPage() {
  await requirePageAuth(ACCOUNTS_ACCESS)

  const invoices = await getInvoices()

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
    pending: invoices.filter(i => ['SENT', 'DRAFT'].includes(i.status)).reduce((sum, inv) => sum + inv.total, 0),
    overdue: invoices.filter(i => i.status === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0),
  }

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="invoices"
        title="Invoices"
        description="Create, send, and track proforma invoices for clients."
        steps={[
          { label: 'Create invoices', description: 'Generate new proforma invoices for clients' },
          { label: 'Track payment status', description: 'Monitor which invoices are paid, pending, or overdue' },
          { label: 'Send to clients', description: 'Send invoices directly to client contacts' },
          { label: 'Export data', description: 'Download invoice data for reporting and records' },
        ]}
      />
      <DataDiscovery dataType="invoices" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Proforma Invoices (PI)</h1>
          <p className="text-slate-400 mt-1">Create and manage client proforma invoices</p>
        </div>
        <Link
          href="/finance/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New PI
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">₹{(stats.total / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Total PI Amount</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">₹{(stats.paid / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Collected</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-yellow-600">₹{(stats.pending / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Pending</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-red-400">₹{(stats.overdue / 100000).toFixed(1)}L</p>
          <p className="text-sm text-slate-400">Overdue</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">PI #</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Due Date</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No proforma invoices created yet
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-slate-400">
                        {formatDateShort(invoice.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{invoice.client.name}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">₹{invoice.total.toLocaleString('en-IN')}</p>
                      {invoice.tax > 0 && (
                        <p className="text-xs text-slate-400">incl. GST ₹{invoice.tax.toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">
                      {formatDateShort(invoice.dueDate)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/finance/invoices/${invoice.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          View
                        </Link>
                        {invoice.status === 'DRAFT' && (
                          <Link
                            href={`/finance/invoices/${invoice.id}?action=send`}
                            className="px-3 py-1.5 text-xs font-medium text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors"
                          >
                            Send
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
