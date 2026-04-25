import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

async function getPIPData() {
    const [plans, users] = await Promise.all([
        prisma.pIPPlan.findMany({
            include: {
                user: { select: { id: true, firstName: true, lastName: true, department: true } },
                manager: { select: { firstName: true, lastName: true } },
                milestones: { orderBy: { dayMark: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, firstName: true, lastName: true, department: true },
        }),
    ])
    return { plans, users }
}

const statusConfig: Record<string, { color: string; iconType: string }> = {
    ACTIVE: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', iconType: 'clock' },
    EXTENDED: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', iconType: 'refresh' },
    COMPLETED: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', iconType: 'check' },
    TERMINATED: { color: 'bg-red-500/20 text-red-300 border-red-500/30', iconType: 'x' },
}

const milestoneStatusConfig: Record<string, { color: string; iconType: string }> = {
    PENDING: { color: 'bg-slate-900/20 text-slate-300', iconType: 'clock' },
    MET: { color: 'bg-emerald-500/20 text-emerald-300', iconType: 'check' },
    MISSED: { color: 'bg-red-500/20 text-red-300', iconType: 'x' },
    PARTIALLY_MET: { color: 'bg-amber-500/20 text-amber-300', iconType: 'warning' },
}

const renderIcon = (iconType: string, className: string = "w-4 h-4") => {
    switch (iconType) {
        case 'clock':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        case 'refresh':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        case 'check':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        case 'x':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        case 'warning':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        case 'calendar':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        default:
            return null
    }
}

export default async function PIPPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const { plans, users } = await getPIPData()

    const activePlans = plans.filter(p => p.status === 'ACTIVE' || p.status === 'EXTENDED')
    const completedPlans = plans.filter(p => p.status === 'COMPLETED')
    const terminatedPlans = plans.filter(p => p.status === 'TERMINATED')

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">PIP System</h1>
                    <p className="text-slate-400 mt-1">Performance Improvement Plans — 30/60/90 Day Tracking</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-none transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Initiate PIP
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-amber-400">{activePlans.length}</p>
                    <p className="text-sm text-slate-400">Active PIPs</p>
                </div>
                <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-emerald-400">{completedPlans.length}</p>
                    <p className="text-sm text-slate-400">Improved</p>
                </div>
                <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-red-400">{terminatedPlans.length}</p>
                    <p className="text-sm text-slate-400">Terminated</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-white">{plans.length}</p>
                    <p className="text-sm text-slate-400">Total PIPs</p>
                </div>
            </div>

            {/* PIP Plans */}
            <div className="space-y-4">
                {plans.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                        <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        <p className="text-slate-400">No PIP plans created yet</p>
                    </div>
                ) : (
                    plans.map((plan) => {
                        const config = statusConfig[plan.status] || statusConfig.ACTIVE
                        const daysRemaining = Math.max(0, Math.ceil((new Date(plan.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        const totalDays = Math.ceil((new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24))
                        const progress = Math.min(100, Math.round(((totalDays - daysRemaining) / totalDays) * 100))

                        return (
                            <div key={plan.id} className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={{ id: plan.user.id || plan.id, firstName: plan.user.firstName, lastName: plan.user.lastName, department: plan.user.department }} size="lg" showPreview={false} />
                                            <div>
                                                <h3 className="font-semibold text-white">{plan.user.firstName} {plan.user.lastName || ''}</h3>
                                                <p className="text-xs text-slate-400">{plan.user.department} • Manager: {plan.manager.firstName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} inline-flex items-center gap-1`}>
                                                {renderIcon(config.iconType, "w-3.5 h-3.5")} {plan.status}
                                            </span>
                                            {plan.status === 'ACTIVE' && (
                                                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-slate-300 rounded-full text-xs">
                                                    {daysRemaining}d remaining
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-400 mb-3">
                                        <span className="text-white font-medium">Reason:</span> {plan.reason}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                        <span className="inline-flex items-center gap-1">{renderIcon('calendar', "w-3.5 h-3.5")} {formatDateDDMMYYYY(plan.startDate)}</span>
                                        <span>→</span>
                                        <span className="inline-flex items-center gap-1">{renderIcon('calendar', "w-3.5 h-3.5")} {formatDateDDMMYYYY(plan.endDate)}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-2">
                                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>

                                    {/* 30/60/90 Day Milestones */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[30, 60, 90].map((day) => {
                                            const milestone = plan.milestones.find((m) => m.dayMark === day)
                                            const msConfig = milestone ? (milestoneStatusConfig[milestone.status] || milestoneStatusConfig.PENDING) : milestoneStatusConfig.PENDING
                                            return (
                                                <div key={day} className={`p-3 rounded-xl ${milestone ? msConfig.color : 'bg-white/5 backdrop-blur-sm'}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-white">Day {day}</span>
                                                        <span className="text-sm">{renderIcon(milestone ? msConfig.iconType : 'clock', "w-4 h-4")}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-300 truncate">{milestone?.title || 'Not set'}</p>
                                                    {milestone?.status && <p className="text-[10px] text-slate-400 mt-1">{milestone.status}</p>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
