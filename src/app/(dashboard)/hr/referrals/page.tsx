import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

async function getReferralData() {
    const referrals = await prisma.referralBonus.findMany({
        include: {
            referrer: { select: { firstName: true, lastName: true, department: true } },
            referredUser: { select: { firstName: true, lastName: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
    return referrals
}

const statusConfig: Record<string, { label: string; color: string; iconType: string }> = {
    PENDING: { label: 'Pending', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', iconType: 'clock' },
    QUALIFIED: { label: 'Qualified', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', iconType: 'check' },
    APPROVED: { label: 'Approved', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', iconType: 'thumbs-up' },
    PAID: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', iconType: 'currency' },
    REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-300 border-red-500/30', iconType: 'x' },
}

const renderStatusIcon = (iconType: string, className: string = "w-3.5 h-3.5 inline-block mr-1") => {
    switch (iconType) {
        case 'clock':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        case 'check':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        case 'thumbs-up':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
        case 'currency':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        case 'x':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        default:
            return null
    }
}

const renderMedalIcon = (position: number, className: string = "w-5 h-5") => {
    const colors = ['text-yellow-400', 'text-slate-300', 'text-amber-400']
    const color = colors[position] || 'text-slate-400'
    return (
        <svg className={`${className} ${color}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    )
}

export default async function ReferralBonusPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const referrals = await getReferralData()

    const myReferrals = referrals.filter(r => r.referrerId === session.user.id)
    const totalPaid = referrals.filter(r => r.status === 'PAID').reduce((s, r) => s + r.amount, 0)
    const pendingAmount = referrals.filter(r => r.status === 'QUALIFIED' || r.status === 'APPROVED').reduce((s, r) => s + r.amount, 0)

    // Top referrers
    const referrerMap = new Map<string, { name: string; count: number; earned: number }>()
    for (const r of referrals) {
        const name = `${r.referrer.firstName} ${r.referrer.lastName || ''}`.trim()
        const existing = referrerMap.get(r.referrerId) || { name, count: 0, earned: 0 }
        existing.count++
        if (r.status === 'PAID') existing.earned += r.amount
        referrerMap.set(r.referrerId, existing)
    }
    const topReferrers = Array.from(referrerMap.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 5)

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Referral Bonus
                    </h1>
                    <p className="text-slate-400 mt-1">Track employee and client referral bonuses</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 text-slate-400 rounded-xl font-medium cursor-not-allowed">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Referral
                    <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded ml-2">Coming Soon</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-white">{referrals.length}</p>
                    <p className="text-sm text-slate-400">Total Referrals</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-blue-400">{myReferrals.length}</p>
                    <p className="text-sm text-slate-400">My Referrals</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-emerald-400">₹{(totalPaid / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-slate-400">Total Paid Out</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-amber-400">₹{(pendingAmount / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-slate-400">Pending Payout</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Referral List */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">All Referrals</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {referrals.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No referrals submitted yet</div>
                            ) : (
                                referrals.map((ref) => {
                                    const config = statusConfig[ref.status] || statusConfig.PENDING
                                    return (
                                        <div key={ref.id} className="p-4 hover:bg-white/5 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {ref.referredName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{ref.referredName}</p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <span>Referred by {ref.referrer.firstName}</span>
                                                            <span>•</span>
                                                            <span className={`px-1.5 py-0.5 rounded ${ref.type === 'EMPLOYEE' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                                                {ref.type}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {ref.amount > 0 && (
                                                        <span className="text-sm font-bold text-amber-400">₹{ref.amount.toLocaleString('en-IN')}</span>
                                                    )}
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} inline-flex items-center`}>
                                                        {renderStatusIcon(config.iconType)} {config.label}
                                                    </span>
                                                </div>
                                            </div>
                                            {ref.notes && <p className="text-xs text-slate-400 mt-2 ml-[52px]">{ref.notes}</p>}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Referrers */}
                <div className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            Top Referrers
                        </h3>
                        <div className="space-y-3">
                            {topReferrers.length === 0 ? (
                                <p className="text-center text-slate-400 py-4">No referral data yet</p>
                            ) : (
                                topReferrers.map(([id, data], i) => (
                                    <div key={id} className="flex items-center gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-xl">
                                        <span className="w-6 flex justify-center">
                                            {i < 3 ? renderMedalIcon(i, "w-5 h-5") : <span className="text-sm font-bold text-slate-400">#{i + 1}</span>}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{data.name}</p>
                                            <p className="text-xs text-slate-400">{data.count} referrals</p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-400">₹{(data.earned / 1000).toFixed(0)}K</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bonus Structure */}
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Bonus Structure
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-300">Employee Referral</span>
                                <span className="font-bold text-emerald-400">₹10,000</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-slate-300">Client Referral</span>
                                <span className="font-bold text-emerald-400">₹5,000</span>
                            </div>
                            <div className="text-xs text-slate-400 pt-2">
                                <p>* Employee referral paid after 90 days of hired referral</p>
                                <p>* Client referral paid after first invoice cleared</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
