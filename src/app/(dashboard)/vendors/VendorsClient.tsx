'use client'

import { useState, useMemo } from 'react'
import PageGuide from '@/client/components/ui/PageGuide'
import InfoTip from '@/client/components/ui/InfoTip'

interface Vendor {
  id: string
  companyName: string
  contactEmail: string | null
  contactPhone: string | null
  serviceCategory: string | null
  bankName: string | null
  bankAccountNumber: string | null
  ifscCode: string | null
  gstNumber: string | null
  panNumber: string | null
  address: string | null
  status: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-500/20 text-green-400'
    case 'PENDING': return 'bg-amber-500/20 text-amber-400'
    case 'INACTIVE': return 'bg-slate-900/20 text-slate-400'
    default: return 'bg-slate-900/20 text-slate-400'
  }
}

export function VendorTableClient({ vendors }: { vendors: Vendor[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return vendors
    return vendors.filter(v =>
      v.companyName.toLowerCase().includes(q) ||
      (v.contactEmail && v.contactEmail.toLowerCase().includes(q))
    )
  }, [vendors, search])

  return (
    <div>
      <PageGuide
        pageKey="vendors"
        title="Vendors"
        description="Manage external vendor relationships, contracts, and contact details."
        steps={[
          { label: 'Browse vendors', description: 'Search by company name or email' },
          { label: 'Review details', description: 'Check bank info, GST, and status' },
          { label: 'Manage status', description: 'Track active, pending, and inactive vendors' },
        ]}
      />
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="font-semibold text-white">All Vendors</h2>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-purple-500"
          />
          <InfoTip text="Filter vendors by company name or email address" type="action" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {search ? 'No Matching Vendors' : 'No Vendors Yet'}
          </h3>
          <p className="text-slate-400 mb-4">
            {search ? `No results found for "${search}". Try adjusting your search terms.` : 'Add your first vendor to get started'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Vendor</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Contact</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Bank</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(vendor => (
                <tr key={vendor.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4">
                    <p className="text-white font-medium">{vendor.companyName}</p>
                    <p className="text-xs text-slate-400">{vendor.contactEmail || '-'}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{vendor.serviceCategory || '-'}</td>
                  <td className="py-3 px-4 text-slate-300">{vendor.contactPhone || '-'}</td>
                  <td className="py-3 px-4">
                    {vendor.bankName ? (
                      <span className="text-slate-300 text-xs">{vendor.bankName}</span>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 relative">
                    <VendorViewButton vendor={vendor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  )
}

export function VendorViewButton({ vendor }: { vendor: Vendor }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-purple-400 hover:text-purple-300 text-sm"
      >
        {expanded ? 'Hide' : 'View'}
      </button>
      {expanded && (
        <div className="absolute right-4 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl z-10 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">{vendor.companyName}</h4>
            <button
              onClick={() => setExpanded(false)}
              className="text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm">
            {vendor.contactEmail && (
              <div>
                <span className="text-slate-400">Email: </span>
                <span className="text-white">{vendor.contactEmail}</span>
              </div>
            )}
            {vendor.contactPhone && (
              <div>
                <span className="text-slate-400">Phone: </span>
                <span className="text-white">{vendor.contactPhone}</span>
              </div>
            )}
            {vendor.serviceCategory && (
              <div>
                <span className="text-slate-400">Category: </span>
                <span className="text-white">{vendor.serviceCategory}</span>
              </div>
            )}
            {vendor.gstNumber && (
              <div>
                <span className="text-slate-400">GST: </span>
                <span className="text-white">{vendor.gstNumber}</span>
              </div>
            )}
            {vendor.panNumber && (
              <div>
                <span className="text-slate-400">PAN: </span>
                <span className="text-white">{vendor.panNumber}</span>
              </div>
            )}
            {vendor.bankName && (
              <div>
                <span className="text-slate-400">Bank: </span>
                <span className="text-white">{vendor.bankName}</span>
              </div>
            )}
            {vendor.bankAccountNumber && (
              <div>
                <span className="text-slate-400">Account: </span>
                <span className="text-white">{vendor.bankAccountNumber}</span>
              </div>
            )}
            {vendor.ifscCode && (
              <div>
                <span className="text-slate-400">IFSC: </span>
                <span className="text-white">{vendor.ifscCode}</span>
              </div>
            )}
            {vendor.address && (
              <div>
                <span className="text-slate-400">Address: </span>
                <span className="text-white">{vendor.address}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
