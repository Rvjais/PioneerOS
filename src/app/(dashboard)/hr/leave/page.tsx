import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { LeaveActionButtons } from './LeaveActionButtons'
import { ApplyLeaveButton } from './ApplyLeaveButton'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import PageGuide from '@/client/components/ui/PageGuide'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

async function getLeaveData() {
    const [requests, balances, users] = await Promise.all([
        prisma.leaveRequest.findMany({
            include: { user: { select: { id: true, firstName: true, lastName: true, department: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        }),
        prisma.leaveBalance.findMany({
            include: { user: { select: { id: true, firstName: true } } },
        }),
        prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, firstName: true, lastName: true, department: true },
        }),
    ])
    return { requests, balances, users }
}

const leaveTypeConfig: Record<string, { label: string; iconType: string; color: string }> = {
    PL: { label: 'Privilege Leave', iconType: 'palm', color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30' },
    CL: { label: 'Casual Leave', iconType: 'coffee', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
    SL: { label: 'Sick Leave', iconType: 'medical', color: 'from-red-500/20 to-rose-500/20 border-red-500/30' },
    COMP_OFF: { label: 'Comp Off', iconType: 'refresh', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30' },
}

const renderLeaveIcon = (iconType: string, className: string = "w-5 h-5") => {
    switch (iconType) {
        case 'palm':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        case 'coffee':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        case 'medical':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        case 'refresh':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        default:
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    }
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    APPROVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    REJECTED: 'bg-red-500/20 text-red-300 border-red-500/30',
}

export default async function LeaveManagementPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const { requests, balances, users } = await getLeaveData()

    // User balances
    const myBalances = balances.filter(b => b.userId === session.user.id)
    const pendingRequests = requests.filter(r => r.status === 'PENDING')
    const myRequests = requests.filter(r => r.userId === session.user.id)

    // Stats
    const onLeaveToday = requests.filter(r => {
        const start = new Date(r.startDate)
        const end = new Date(r.endDate)
        const today = new Date()
        return r.status === 'APPROVED' && start <= today && end >= today
    })

    return (
        <div className="space-y-6 pb-8">
            <PageGuide
                pageKey="leave"
                title="Leave Management"
                description="Review and approve/reject employee leave requests."
                steps={[
                    { label: 'Check balances', description: 'View your PL, CL, SL, and comp-off balance' },
                    { label: 'Apply for leave', description: 'Submit a new leave request' },
                    { label: 'Approve or reject', description: 'Process pending requests from your team' },
                ]}
            />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Leave Management</h1>
                        <p className="text-slate-400 mt-1">Apply, track, and manage leaves</p>
                    </div>
                    <InfoTooltip
                        title="Leave Management Guide"
                        steps={[
                            "Check your balance in the cards above",
                            "Click 'Apply Leave' to submit a request",
                            "HR will review and approve/reject",
                            "Use the approve/reject buttons for pending requests",
                        ]}
                        tips={[
                            "PL can be carried forward, CL cannot",
                            "Apply at least 3 days in advance for PL",
                        ]}
                    />
                </div>
                <ApplyLeaveButton />
            </div>

            {/* My Leave Balance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(leaveTypeConfig).map(([type, config]) => {
                    const balance = myBalances.find(b => b.type === type)
                    return (
                        <div key={type} role="status" aria-label={`${config.label}: ${balance?.remaining?.toFixed(1) || '0'} remaining of ${balance?.total?.toFixed(1) || '0'}`} className={`bg-gradient-to-br ${config.color} backdrop-blur-xl border rounded-2xl p-4`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-white">{renderLeaveIcon(config.iconType)}</span>
                                <p className="text-sm font-medium text-white">{config.label}</p>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-white">{balance?.remaining?.toFixed(1) || '0'}</p>
                                    <p className="text-xs text-slate-400">remaining</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">{balance?.used?.toFixed(1) || '0'} used</p>
                                    <p className="text-xs text-slate-400">of {balance?.total?.toFixed(1) || '0'}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-amber-400">{pendingRequests.length}</p>
                    <p className="text-sm text-slate-400">Pending Approvals</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-blue-400">{onLeaveToday.length}</p>
                    <p className="text-sm text-slate-400">On Leave Today</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-bold text-white">{myRequests.length}</p>
                    <p className="text-sm text-slate-400">My Requests</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Pending Approvals */}
                <div className="lg:col-span-2">
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Leave Requests</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {requests.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">No leave requests</div>
                            ) : (
                                requests.slice(0, 15).map((req) => {
                                    const config = leaveTypeConfig[req.type] || leaveTypeConfig.CL
                                    const days = Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                                    return (
                                        <div key={req.id} className="p-4 hover:bg-white/5 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={{ id: req.user.id, firstName: req.user.firstName, lastName: req.user.lastName, department: req.user.department }} size="md" showPreview={false} />
                                                    <div>
                                                        <p className="font-medium text-white">{req.user.firstName} {req.user.lastName || ''}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-slate-400">{req.user.department}</span>
                                                            <span className="text-[10px] text-slate-300">•</span>
                                                            <span className="text-xs text-slate-400 flex items-center gap-1">{renderLeaveIcon(config.iconType, "w-3 h-3")} {config.label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-sm text-white">
                                                            {new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            {days > 1 && ` - ${new Date(req.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{days} day{days > 1 ? 's' : ''}</p>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[req.status]}`}>
                                                        {req.status}
                                                    </span>
                                                    {req.status === 'PENDING' && (
                                                        <LeaveActionButtons requestId={req.id} />
                                                    )}
                                                </div>
                                            </div>
                                            {req.reason && <p className="text-xs text-slate-400 mt-2 ml-[52px]">{req.reason}</p>}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* On Leave Today */}
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> On Leave Today</h3>
                    <div className="space-y-3">
                        {onLeaveToday.length === 0 ? (
                            <p className="text-center text-slate-400 py-4 flex items-center justify-center gap-2">Everyone is present today <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></p>
                        ) : (
                            onLeaveToday.map((req) => (
                                <div key={req.id} className="flex items-center gap-3 p-2 bg-white/5 backdrop-blur-sm rounded-xl">
                                    <UserAvatar user={{ id: req.user.id, firstName: req.user.firstName }} size="sm" showPreview={false} />
                                    <div>
                                        <p className="text-sm text-white">{req.user.firstName}</p>
                                        <p className="text-xs text-slate-400">{req.type}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
