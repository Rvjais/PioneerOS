import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function WebBillingInvoicesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-800/50 text-slate-200'
      case 'SENT': return 'bg-blue-500/20 text-blue-400'
      case 'PAID': return 'bg-green-500/20 text-green-400'
      case 'OVERDUE': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Invoices</h1>
          <p className="text-slate-500 mt-1">Manage web project invoices and billing</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + Create Invoice
        </button>
      </div>

      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/40 border-b border-white/10">
              <th className="p-4 font-semibold text-slate-200">Invoice Number</th>
              <th className="p-4 font-semibold text-slate-200">Client</th>
              <th className="p-4 font-semibold text-slate-200">Amount</th>
              <th className="p-4 font-semibold text-slate-200">Status</th>
              <th className="p-4 font-semibold text-slate-200">Due Date</th>
              <th className="p-4 font-semibold text-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40">
                  <td className="p-4 text-slate-200 font-medium">{inv.invoiceNumber}</td>
                  <td className="p-4 text-slate-300">{inv.client.name}</td>
                  <td className="p-4 text-slate-300">{inv.currency} {inv.total.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
