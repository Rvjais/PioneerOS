import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { AssetSheet } from './AssetSheet'

async function getAssetData() {
    const assets = await prisma.asset.findMany({
        include: {
            assignments: {
                where: { returnedAt: null },
                include: { user: { select: { id: true, firstName: true, lastName: true, department: true } } },
                take: 1,
            },
        },
        orderBy: { createdAt: 'desc' },
    })
    return assets
}

export default async function AssetManagementPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const assets = await getAssetData()

    const stats = {
        total: assets.length,
        available: assets.filter(a => a.status === 'AVAILABLE').length,
        assigned: assets.filter(a => a.status === 'ASSIGNED').length,
        maintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
        totalValue: assets.reduce((s, a) => s + (a.purchasePrice || 0), 0),
    }

    // Group by type
    const byType: Record<string, number> = {}
    for (const a of assets) {
        byType[a.type] = (byType[a.type] || 0) + 1
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Asset Management
                </h1>
                <p className="text-slate-400 mt-1">Track and manage company equipment and hardware - Spreadsheet style</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="glass-card rounded-xl border border-white/10 p-4">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-slate-400">Total Assets</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                    <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
                    <p className="text-sm text-slate-400">Available</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4">
                    <p className="text-3xl font-bold text-blue-400">{stats.assigned}</p>
                    <p className="text-sm text-slate-400">Assigned</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4">
                    <p className="text-3xl font-bold text-amber-400">{stats.maintenance}</p>
                    <p className="text-sm text-slate-400">Maintenance</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-200 rounded-xl p-4">
                    <p className="text-3xl font-bold text-purple-400">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
                    <p className="text-sm text-slate-400">Total Value</p>
                </div>
            </div>

            {/* Asset Sheet */}
            <AssetSheet
                initialAssets={assets.map(a => ({
                    id: a.id,
                    assetTag: a.assetTag,
                    name: a.name,
                    type: a.type,
                    brand: a.brand,
                    model: a.model,
                    serialNumber: a.serialNumber,
                    purchasePrice: a.purchasePrice,
                    condition: a.condition,
                    status: a.status,
                    assignedTo: a.assignments?.[0]?.user || null,
                }))}
            />
        </div>
    )
}
