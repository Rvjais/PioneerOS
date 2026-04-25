import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { VendorSheet } from './VendorSheet'

export default async function VendorOnboardingPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const vendors = await prisma.vendorOnboarding.findMany({
        orderBy: { createdAt: 'desc' },
    })

    const stats = {
        total: vendors.length,
        pending: vendors.filter((v) => v.status === 'PENDING').length,
        active: vendors.filter((v) => v.status === 'ACTIVE').length,
        ndaPending: vendors.filter((v) => !v.ndaSigned).length,
    }

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Vendor Onboarding
                </h1>
                <p className="text-slate-400 mt-1">Manage vendor contracts, NDAs, and compliance - Spreadsheet style</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-slate-400">Total Vendors</p>
                </div>
                <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-xl p-4">
                    <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
                    <p className="text-sm text-slate-400">Pending</p>
                </div>
                <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-3xl font-bold text-emerald-400">{stats.active}</p>
                    <p className="text-sm text-slate-400">Active</p>
                </div>
                <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-4">
                    <p className="text-3xl font-bold text-red-400">{stats.ndaPending}</p>
                    <p className="text-sm text-slate-400">NDA Pending</p>
                </div>
            </div>

            {/* Vendor Sheet */}
            <VendorSheet
                initialVendors={vendors.map(v => ({
                    id: v.id,
                    companyName: v.companyName,
                    contactName: v.contactName,
                    contactEmail: v.contactEmail,
                    contactPhone: v.contactPhone,
                    serviceCategory: v.serviceCategory,
                    contractDuration: v.contractDuration,
                    paymentTerms: v.paymentTerms,
                    monthlyRate: v.monthlyRate,
                    ndaSigned: v.ndaSigned,
                    contractSigned: v.contractSigned,
                    status: v.status,
                    notes: v.notes,
                }))}
            />
        </div>
    )
}
