import { unstable_noStore as noStore } from 'next/cache'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { getClientSession } from '@/server/auth/clientSession'
import { prisma } from '@/server/db/prisma'
import { redirect } from 'next/navigation'
import { BRAND } from '@/shared/constants/constants'
import { SUPPORT_EMAIL } from '@/shared/constants/clientPortalConstants'
import PageGuide from '@/client/components/ui/PageGuide'

async function getTickets(clientId: string) {
  return prisma.supportTicket.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      type: true,
      status: true,
      priority: true,
      createdAt: true,
    },
  })
}

export default async function SupportPage() {
  noStore()
  const session = await getClientSession()

  // Allow page to load even without session - just show empty state
  const tickets = session ? await getTickets(session.clientId) : []

  return (
    <div className="space-y-6">
      <PageGuide
        title="Support"
        description="Submit and track support requests. Our team typically responds within 24 hours."
        pageKey="portal-support"
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-slate-400 mt-1">Get help or raise requests</p>
        </div>
        <Link
          href="/portal/support/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </Link>
      </div>

      {/* Quick Help */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2">Email Support</h3>
          <p className="text-sm text-slate-400 mb-3">Get help via email</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-blue-400 hover:underline text-sm">
            {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2">Phone Support</h3>
          <p className="text-sm text-slate-400 mb-3">Mon-Fri, 10 AM - 7 PM</p>
          <a href={`tel:+${BRAND.supportPhone.replace(/[^0-9]/g, '')}`} className="text-blue-400 hover:underline text-sm">
            {BRAND.supportPhone}
          </a>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-6 text-center">
          <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2">WhatsApp</h3>
          <p className="text-sm text-slate-400 mb-3">Quick responses</p>
          <a href={`https://wa.me/${BRAND.supportPhone.replace(/[^0-9]/g, '')}`} className="text-blue-400 hover:underline text-sm">
            Message us
          </a>
        </div>
      </div>

      {/* Tickets */}
      <div className="glass-card rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Your Requests</h2>
          <span className="text-sm text-slate-400">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
          </span>
        </div>
        {tickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-800/60 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No support requests yet</h3>
            <p className="text-slate-400 mb-4">Need help? Create a support request and our team will get back to you.</p>
            <Link
              href="/portal/support/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first support request
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-slate-400">{ticket.ticketNumber}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                      ticket.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800/50 text-slate-200'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="font-medium text-white mt-1">{ticket.title}</p>
                  <p className="text-sm text-slate-400">
                    Created {formatDateDDMMYYYY(ticket.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  ticket.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-400' :
                  ticket.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                  'bg-slate-800/50 text-slate-200'
                }`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
