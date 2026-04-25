import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

async function getRBCData(userId: string) {
    const [pot, accruals, payouts, allPots] = await Promise.all([
        prisma.rBC_Pot.findUnique({ where: { userId } }),
        prisma.rBCAccrual.findMany({
            where: { userId },
            orderBy: { month: 'desc' },
            take: 12,
        }),
        prisma.rBCPayout.findMany({
            where: { userId },
            orderBy: { vestingMonth: 'desc' },
        }),
        prisma.rBC_Pot.findMany({
            include: { user: { select: { firstName: true, lastName: true, department: true, joiningDate: true } } },
            orderBy: { totalAccrued: 'desc' },
        }),
    ])
    return { pot, accruals, payouts, allPots }
}

export default async function RBCTrackingPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const { pot, accruals, payouts, allPots } = await getRBCData(session.user.id)

    const totalAccrued = accruals.reduce((s, a) => s + a.amount, 0)
    const totalPaid = payouts.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
    const pendingPayouts = payouts.filter(p => p.status === 'PENDING')

    // Loyalty multiplier based on tenure (policy: 2x after 2 years, 4x after 4 years)
    const getMultiplier = (joiningDate: Date) => {
        const years = (Date.now() - new Date(joiningDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        if (years >= 4) return { mult: '4.0x', label: 'Platinum', color: 'text-purple-400' }
        if (years >= 2) return { mult: '2.0x', label: 'Gold', color: 'text-amber-400' }
        return { mult: '1.0x', label: 'Standard', color: 'text-white' }
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        RBC Tracking
                    </h1>
                    <p className="text-slate-400 mt-1">Retention Bonus Component — 8% Loyalty Accruals</p>
                </div>
            </div>

            {/* My RBC Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-amber-400">₹{((pot?.totalAccrued || 0) / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-slate-400">Current Balance</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-emerald-400">₹{(totalAccrued / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-slate-400">Total Accrued</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-blue-400">₹{(totalPaid / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-slate-400">Total Paid Out</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-purple-400">{pot?.milestoneMultiplier || 1.0}x</p>
                    <p className="text-sm text-slate-400">Loyalty Multiplier</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Monthly Accruals */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Monthly Accrual History
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {accruals.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No accruals recorded yet</div>
                            ) : (
                                accruals.map((accrual) => (
                                    <div key={accrual.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                {accrual.reason === 'MONTHLY_ACCRUAL' ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                ) : accrual.reason === 'BONUS' ? (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {formatDateDDMMYYYY(accrual.month)}
                                                </p>
                                                <p className="text-xs text-slate-400">{accrual.reason.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-400">+₹{accrual.amount.toLocaleString('en-IN')}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${accrual.status === 'VESTED' ? 'bg-emerald-500/20 text-emerald-300' :
                                                accrual.status === 'FORFEITED' ? 'bg-red-500/20 text-red-300' :
                                                    'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                {accrual.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Payouts */}
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mt-4">
                        <div className="p-5 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Payout Schedule
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {payouts.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No payouts scheduled</div>
                            ) : (
                                payouts.map((payout) => (
                                    <div key={payout.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div>
                                            <p className="font-medium text-white">
                                                {formatDateDDMMYYYY(payout.vestingMonth)}
                                            </p>
                                            <p className="text-xs text-slate-400">Multiplier: {payout.multiplier}x</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">₹{(payout.amount * payout.multiplier).toLocaleString('en-IN')}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${payout.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' :
                                                'bg-amber-500/20 text-amber-300'
                                                }`}>
                                                {payout.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Team RBC Overview */}
                <div>
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Team RBC Pots
                        </h3>
                        <div className="space-y-3">
                            {allPots.slice(0, 10).map((p) => {
                                const multiplierInfo = getMultiplier(p.user.joiningDate)
                                return (
                                    <div key={p.id} className="flex items-center gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-xl">
                                        <UserAvatar user={{ id: p.id, firstName: p.user.firstName, lastName: p.user.lastName, department: p.user.department }} size="sm" showPreview={false} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{p.user.firstName} {p.user.lastName || ''}</p>
                                            <p className="text-xs text-slate-400">{p.user.department}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-amber-400">₹{(p.totalAccrued / 1000).toFixed(1)}K</p>
                                            <p className={`text-xs font-medium ${multiplierInfo.color}`}>{multiplierInfo.mult} {multiplierInfo.label}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            {allPots.length === 0 && (
                                <p className="text-center text-slate-400 py-4">No RBC pots</p>
                            )}
                        </div>
                    </div>

                    {/* Vesting Schedule Info */}
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5 mt-4">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Vesting Rules
                        </h3>
                        <div className="space-y-2 text-sm">
                            {[
                                { tenure: '0-2 years', mult: '1.0x', label: 'Standard', color: 'text-white' },
                                { tenure: '2-4 years', mult: '2.0x', label: 'Gold', color: 'text-amber-400' },
                                { tenure: '4+ years', mult: '4.0x', label: 'Platinum', color: 'text-purple-400' },
                            ].map((rule) => (
                                <div key={rule.tenure} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                    <span className="text-slate-300">{rule.tenure}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded text-slate-400">{rule.label}</span>
                                        <span className={`font-bold ${rule.color}`}>{rule.mult}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
