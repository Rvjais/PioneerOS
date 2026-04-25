'use client'

import { useState } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

interface Report {
  id: string
  name: string
  description: string
  icon: string
  href: string
  category: 'revenue' | 'collection' | 'client' | 'operations'
}

const reports: Report[] = [
  // Revenue Reports
  {
    id: 'monthly-revenue',
    name: 'Monthly Revenue Report',
    description: 'Total revenue collected month-wise with comparison to previous periods',
    icon: '📊',
    href: '/api/reports/revenue/monthly',
    category: 'revenue'
  },
  {
    id: 'revenue-by-service',
    name: 'Revenue by Service',
    description: 'Breakdown of revenue by service type (SEO, Social, Web, etc.)',
    icon: '📈',
    href: '/api/reports/revenue/by-service',
    category: 'revenue'
  },
  {
    id: 'revenue-by-client',
    name: 'Client Revenue Report',
    description: 'Revenue contribution by each client with lifetime value',
    icon: '👥',
    href: '/api/reports/revenue/by-client',
    category: 'revenue'
  },

  // Collection Reports
  {
    id: 'collections-summary',
    name: 'Collections Summary',
    description: 'Total collections with TDS breakdown and net receipts',
    icon: '💰',
    href: '/api/reports/collections/summary',
    category: 'collection'
  },
  {
    id: 'aging-report',
    name: 'Aging Report',
    description: 'Outstanding payments categorized by days overdue (30/60/90+)',
    icon: '⏰',
    href: '/api/reports/collections/aging',
    category: 'collection'
  },
  {
    id: 'collection-efficiency',
    name: 'Collection Efficiency',
    description: 'Collection rate trends and days sales outstanding (DSO)',
    icon: '📉',
    href: '/api/reports/collections/efficiency',
    category: 'collection'
  },

  // Client Reports
  {
    id: 'client-status',
    name: 'Client Status Report',
    description: 'All clients with current payment and contract status',
    icon: '📋',
    href: '/api/reports/clients/status',
    category: 'client'
  },
  {
    id: 'client-onboarding',
    name: 'Onboarding Report',
    description: 'New client onboarding status and timeline analysis',
    icon: '🎯',
    href: '/api/reports/clients/onboarding',
    category: 'client'
  },
  {
    id: 'contract-renewals',
    name: 'Contract Renewals',
    description: 'Upcoming contract renewals and expired contracts',
    icon: '📄',
    href: '/api/reports/clients/renewals',
    category: 'client'
  },

  // Operations Reports
  {
    id: 'invoice-summary',
    name: 'Invoice Summary',
    description: 'All invoices with status, amounts, and payment details',
    icon: '🧾',
    href: '/api/reports/operations/invoices',
    category: 'operations'
  },
  {
    id: 'reconciliation-report',
    name: 'Reconciliation Report',
    description: 'Bank statement reconciliation status and discrepancies',
    icon: '🔄',
    href: '/api/reports/operations/reconciliation',
    category: 'operations'
  },
  {
    id: 'expense-report',
    name: 'Expense Report',
    description: 'Company expenses by category with trends',
    icon: '💳',
    href: '/api/reports/operations/expenses',
    category: 'operations'
  }
]

const categoryColors = {
  revenue: 'border-emerald-500/30 bg-emerald-500/10',
  collection: 'border-blue-500/30 bg-blue-500/10',
  client: 'border-purple-500/30 bg-purple-500/10',
  operations: 'border-amber-500/30 bg-amber-500/10'
}

const categoryLabels = {
  revenue: 'Revenue Reports',
  collection: 'Collection Reports',
  client: 'Client Reports',
  operations: 'Operations Reports'
}

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [generating, setGenerating] = useState<string | null>(null)

  const filteredReports = selectedCategory === 'all'
    ? reports
    : reports.filter(r => r.category === selectedCategory)

  const groupedReports = Object.entries(categoryLabels).map(([key, label]) => ({
    category: key,
    label,
    reports: reports.filter(r => r.category === key)
  }))

  const generateReport = async (report: Report) => {
    setGenerating(report.id)
    try {
      const url = `${report.href}?from=${dateRange.from}&to=${dateRange.to}&format=excel`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setTimeout(() => setGenerating(null), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <InfoTooltip
              title="Financial Reports"
              steps={[
                'Generate various financial reports',
                'Export to Excel for analysis',
                'Share with stakeholders',
                'Track key metrics over time'
              ]}
              tips={[
                'Run monthly reports on 1st',
                'Archive important reports'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Generate and export financial reports</p>
        </div>
      </div>

      {/* Date Range & Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            {['all', ...Object.keys(categoryLabels)].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : categoryLabels[cat as keyof typeof categoryLabels]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {selectedCategory === 'all' ? (
        // Show grouped by category
        <div className="space-y-6">
          {groupedReports.map(group => (
            <div key={group.category}>
              <h2 className="text-lg font-semibold text-white mb-3">{group.label}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.reports.map(report => (
                  <div
                    key={report.id}
                    className={`border rounded-xl p-4 ${categoryColors[report.category as keyof typeof categoryColors]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{report.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{report.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{report.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => generateReport(report)}
                      disabled={generating === report.id}
                      className="w-full mt-4 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {generating === report.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export Excel
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show filtered reports
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map(report => (
            <div
              key={report.id}
              className={`border rounded-xl p-4 ${categoryColors[report.category as keyof typeof categoryColors]}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{report.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{report.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{report.description}</p>
                </div>
              </div>
              <button
                onClick={() => generateReport(report)}
                disabled={generating === report.id}
                className="w-full mt-4 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating === report.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Excel
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Export */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4">Quick Export All</h3>
        <p className="text-slate-400 text-sm mb-4">
          Generate a comprehensive report package with all key financial data
        </p>
        <button
          onClick={() => window.open(`/api/reports/all?from=${dateRange.from}&to=${dateRange.to}`, '_blank', 'noopener,noreferrer')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Complete Report Package
        </button>
      </div>
    </div>
  )
}
