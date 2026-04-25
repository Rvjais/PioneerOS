import prisma from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getSOPData() {
  const categories = await prisma.sOPCategory.findMany({
    include: {
      sops: { where: { status: 'ACTIVE' } }
    },
    orderBy: { order: 'asc' }
  })
  return categories
}

const renderCategoryIcon = (category: string) => {
  const iconClass = "w-8 h-8"
  switch (category) {
    case 'SEO':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    case 'ADS':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    case 'SOCIAL':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    case 'WEB':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
    case 'AUTOMATION':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    case 'HR':
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    default:
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  }
}

export default async function SOPPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const categories = await getSOPData()

  const totalSOPs = categories.reduce((sum, cat) => sum + cat.sops.length, 0)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SOP Library</h1>
          <p className="text-slate-400 mt-1">Standard Operating Procedures and Guidelines</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search SOPs..."
            className="pl-10 pr-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-white">{categories.length}</p>
          <p className="text-sm text-slate-400">Categories</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-blue-400">{totalSOPs}</p>
          <p className="text-sm text-slate-400">Total SOPs</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-green-400">12</p>
          <p className="text-sm text-slate-400">Recently Updated</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-3xl font-bold text-purple-400">5</p>
          <p className="text-sm text-slate-400">New This Month</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl border border-white/10 p-8 text-center text-slate-400">
            No SOPs available yet. Check back soon!
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="glass-card rounded-2xl border border-white/10 overflow-hidden hover:shadow-none transition-shadow">
              <div className="p-5 border-b border-white/5 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">{renderCategoryIcon(category.name)}</span>
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-slate-400">{category.sops.length} documents</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {category.sops.slice(0, 4).map((sop) => (
                  <Link
                    key={sop.id}
                    href={`/sop/${sop.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900/40 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-slate-200 group-hover:text-blue-400">{sop.title}</span>
                  </Link>
                ))}
                {category.sops.length > 4 && (
                  <Link
                    href={`/sop/category/${category.id}`}
                    className="block text-center text-sm text-blue-400 hover:text-blue-400 py-2"
                  >
                    View all {category.sops.length} SOPs →
                  </Link>
                )}
                {category.sops.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-4">No SOPs in this category</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Access */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Access</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {['Client Onboarding', 'Monthly Reporting', 'SEO Audit', 'Campaign Setup'].map((sop) => (
            <button
              key={sop}
              className="p-4 glass-card rounded-xl border border-blue-200/50 text-left hover:shadow-none transition-shadow bg-white/50 hover:bg-white"
            >
              <p className="font-medium text-slate-900">{sop}</p>
              <p className="text-xs text-slate-500 mt-1">View SOP</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
