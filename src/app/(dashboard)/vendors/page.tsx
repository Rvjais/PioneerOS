import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { VendorTableClient } from './VendorsClient'

export default async function VendorsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Only allow admin and accounts
  if (!['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const vendors = await prisma.vendorOnboarding.findMany({
    orderBy: { companyName: 'asc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-slate-400 mt-1">Manage vendor relationships and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hr/vendor-onboarding"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Vendor
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Total Vendors</p>
          <p className="text-2xl font-bold text-white">{vendors.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400">
            {vendors.filter(v => v.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber-400">
            {vendors.filter(v => v.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <p className="text-slate-400 text-sm">Inactive</p>
          <p className="text-2xl font-bold text-slate-400">
            {vendors.filter(v => v.status === 'INACTIVE').length}
          </p>
        </div>
      </div>

      {/* Vendor List */}
      <VendorTableClient vendors={JSON.parse(JSON.stringify(vendors))} />
    </div>
  )
}
