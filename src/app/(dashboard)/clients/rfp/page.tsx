import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RFPTableClient } from './RFPListClient'

export default async function RFPListPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const rfps = await prisma.rFPSubmission.findMany({
        orderBy: { createdAt: 'desc' },
    })

    const stats = {
        total: rfps.length,
        newCount: rfps.filter((r) => r.status === 'NEW').length,
        reviewed: rfps.filter((r) => r.status === 'REVIEWED').length,
        converted: rfps.filter((r) => r.status === 'CONVERTED').length,
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        RFP Submissions
                    </h1>
                    <p className="text-slate-400 mt-1">BD/Sales — Request for Proposal Tracking</p>
                </div>
                <Link href="/sales/rfp/send"
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-blue-500/20 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    Send RFP to Lead
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-slate-400">Total RFPs</p>
                </div>
                <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-blue-400">{stats.newCount}</p>
                    <p className="text-sm text-slate-400">New</p>
                </div>
                <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-amber-400">{stats.reviewed}</p>
                    <p className="text-sm text-slate-400">Under Review</p>
                </div>
                <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-emerald-400">{stats.converted}</p>
                    <p className="text-sm text-slate-400">Converted</p>
                </div>
            </div>

            {/* RFP List */}
            <RFPTableClient rfps={JSON.parse(JSON.stringify(rfps))} />
        </div>
    )
}
