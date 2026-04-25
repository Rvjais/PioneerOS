import { prisma } from '@/server/db/prisma'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { InitiateExitButton } from './InitiateExitButton'
import { ExitChecklistClient } from './ExitChecklistClient'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'
import PageGuide from '@/client/components/ui/PageGuide'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

async function getExitData() {
    const processes = await prisma.exitProcess.findMany({
        include: {
            user: { select: { id: true, firstName: true, lastName: true, department: true, empId: true } },
            checklist: { orderBy: { category: 'asc' } },
            settlement: true,
        },
        orderBy: { createdAt: 'desc' },
    })
    return processes
}

const statusConfig: Record<string, { color: string; iconType: string }> = {
    INITIATED: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', iconType: 'document' },
    IN_PROGRESS: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', iconType: 'clock' },
    CLEARANCE: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', iconType: 'check' },
    COMPLETED: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', iconType: 'flag' },
}

const typeLabels: Record<string, { label: string; iconType: string }> = {
    RESIGNATION: { label: 'Resignation', iconType: 'mail' },
    TERMINATION: { label: 'Termination', iconType: 'ban' },
    END_OF_CONTRACT: { label: 'Contract End', iconType: 'document' },
    LAYOFF: { label: 'Layoff', iconType: 'chart-down' },
}

const checklistCategories: Record<string, { label: string; iconType: string }> = {
    HR: { label: 'HR Documentation', iconType: 'clipboard' },
    IT_ACCESS: { label: 'IT & Access', iconType: 'lock' },
    DEPARTMENT: { label: 'Department Handover', iconType: 'book' },
    FINANCE: { label: 'Finance Clearance', iconType: 'currency' },
}

const renderStatusIcon = (iconType: string, className: string = "w-3.5 h-3.5 inline-block mr-1") => {
    switch (iconType) {
        case 'document':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        case 'clock':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        case 'check':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        case 'flag':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
        case 'mail':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        case 'ban':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        case 'chart-down':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
        case 'book':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        case 'box':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        case 'lock':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        case 'currency':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        case 'clipboard':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        default:
            return null
    }
}

const renderTypeIcon = (iconType: string, className: string = "w-4 h-4") => {
    switch (iconType) {
        case 'mail':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        case 'ban':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        case 'document':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        case 'chart-down':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
        default:
            return null
    }
}

export default async function ExitPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const canInitiateExit = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(session.user.role)

    const processes = await getExitData()
    const activeExits = processes.filter(p => p.status !== 'COMPLETED')

    return (
        <div className="space-y-6 pb-8">
            <PageGuide
                pageKey="exit-process"
                title="Exit Process Management"
                description="Manage employee exits from initiation to clearance completion. Track checklist items across departments."
                steps={[
                    { label: 'Initiate exit process', description: 'Select the employee, exit type, and last working day to begin the process' },
                    { label: 'Generate checklist', description: 'Auto-generate clearance checklist items across HR, IT, Department, and Finance categories' },
                    { label: 'Track completion', description: 'Toggle checklist items through Pending → In Progress → Completed states' },
                    { label: 'F&F settlement', description: 'Once all items are cleared, process the Full & Final settlement' },
                ]}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Exit & Offboarding</h1>
                        <p className="text-slate-400 mt-1">Manage employee exits and clearance processes</p>
                    </div>
                    <InfoTooltip
                        title="Exit Process Guide"
                        steps={[
                            "Click 'Initiate Exit' to start the process",
                            "Complete all checklist items in each category",
                            "Ensure knowledge transfer is documented",
                            "Process F&F settlement after clearance",
                        ]}
                        tips={[
                            "Start process at least 2 weeks before LWD",
                            "Coordinate with IT for access revocation",
                        ]}
                    />
                </div>
                {canInitiateExit && <InitiateExitButton />}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-white">{processes.length}</p>
                    <p className="text-sm text-slate-400">Total Exits</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-amber-400">{activeExits.length}</p>
                    <p className="text-sm text-slate-400">In Progress</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-emerald-400">{processes.filter(p => p.status === 'COMPLETED').length}</p>
                    <p className="text-sm text-slate-400">Completed</p>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
                    <p className="text-3xl font-bold text-purple-400">{processes.filter(p => p.settlement).length}</p>
                    <p className="text-sm text-slate-400">With F&F</p>
                </div>
            </div>

            {/* Exit Process Cards */}
            <div className="space-y-4">
                {processes.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                        <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <p className="text-slate-400">No exit processes initiated</p>
                    </div>
                ) : (
                    processes.map((process) => {
                        const config = statusConfig[process.status] || statusConfig.INITIATED
                        const completedItems = process.checklist.filter((c) => c.status === 'COMPLETED').length
                        const totalItems = process.checklist.length
                        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

                        return (
                            <div key={process.id} className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar user={{ id: process.user.id || process.id, firstName: process.user.firstName, lastName: process.user.lastName, empId: process.user.empId, department: process.user.department }} size="lg" showPreview={false} />
                                            <div>
                                                <h3 className="font-semibold text-white">{process.user.firstName} {process.user.lastName || ''}</h3>
                                                <p className="text-xs text-slate-400">{process.user.empId} • {process.user.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-300 inline-flex items-center gap-1">
                                                {typeLabels[process.type] && renderTypeIcon(typeLabels[process.type].iconType)}
                                                {typeLabels[process.type]?.label || process.type}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} inline-flex items-center`}>
                                                {renderStatusIcon(config.iconType)} {process.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-400">Notice Date</p>
                                            <p className="text-white">{formatDateDDMMYYYY(process.noticeDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Last Working Day</p>
                                            <p className="text-white">{process.lastWorkingDate ? formatDateDDMMYYYY(process.lastWorkingDate) : 'TBD'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">F&F Status</p>
                                            <p className="text-white">{process.settlement ? process.settlement.status : 'Not Started'}</p>
                                        </div>
                                    </div>

                                    {/* Checklist Progress */}
                                    {totalItems > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                                <span>Clearance Progress</span>
                                                <span>{completedItems}/{totalItems} ({progress}%)</span>
                                            </div>
                                            <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-2 mb-3">
                                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {Object.entries(checklistCategories).map(([cat, info]) => {
                                                    const catItems = process.checklist.filter((c) => c.category === cat)
                                                    const catDone = catItems.filter((c) => c.status === 'COMPLETED').length
                                                    return (
                                                        <div key={cat} className={`p-2 rounded-lg text-center ${catDone === catItems.length && catItems.length > 0 ? 'bg-emerald-500/10' : 'bg-white/5 backdrop-blur-sm'}`}>
                                                            <span className="text-slate-300 flex justify-center">{renderStatusIcon(info.iconType, "w-5 h-5")}</span>
                                                            <p className="text-[10px] text-slate-400 mt-1">{info.label}</p>
                                                            <p className="text-xs font-bold text-white">{catDone}/{catItems.length}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Interactive Checklist */}
                                    <ExitChecklistClient
                                        exitProcessId={process.id}
                                        checklist={JSON.parse(JSON.stringify(process.checklist))}
                                        processStatus={process.status}
                                    />
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
