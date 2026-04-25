'use client'

import { useState, useEffect, useMemo } from 'react'
import { generateDeliverablesReportPDF } from '@/client/utils/export/pdfExport'
import { ExportButtons } from '@/client/components/ExportButtons'

interface ClientScope {
  id: string
  client: string
  scope: string[]
  status: 'ACTIVE' | 'ON_HOLD' | 'CHURNED'
  accountManager: string
  monthlyRetainer: number
}

interface Deliverable {
  id: string
  clientId: string
  category: string
  workItem: string
  description: string | null
  month: string
  proofUrl: string | null
  kpi: string | null
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUIRED'
  submittedBy: { id: string; firstName: string; lastName: string } | null
  reviewedBy: { id: string; firstName: string; lastName: string } | null
  createdBy: { id: string; firstName: string; lastName: string } | null
  clientVisible: boolean
}

interface SalesTrackerViewProps {
  initialClients: ClientScope[]
}

function getMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    months.push({ value, label })
  }
  return months
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthDisplay(month: string): string {
  const [year, m] = month.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${monthNames[parseInt(m) - 1]} ${year}`
}

// Category groupings for display
const categoryGroups: Record<string, { label: string; categories: string[] }> = {
  social: {
    label: 'Social Media',
    categories: ['SOCIAL_VIDEOS', 'SOCIAL_POSTS', 'SOCIAL_STORIES', 'SOCIAL_CAROUSELS', 'POST', 'REEL', 'STORY', 'CAROUSEL', 'STATIC_POST'],
  },
  seo: {
    label: 'SEO',
    categories: ['SEO_ONPAGE', 'SEO_TECHNICAL', 'SEO_BLOG', 'SEO_LINKS', 'ONPAGE_SEO', 'TECHNICAL_SEO', 'BLOG', 'GBP_UPDATE', 'GBP_POST', 'GBP', 'LINK_BUILDING'],
  },
  ads: {
    label: 'Paid Ads',
    categories: ['GOOGLE_ADS', 'META_ADS', 'LINKEDIN_ADS', 'YOUTUBE_ADS', 'CAMPAIGN_SETUP', 'OPTIMIZATION', 'AD_CREATIVE'],
  },
  youtube: {
    label: 'YouTube',
    categories: ['YOUTUBE', 'YOUTUBE_VIDEO', 'SHORTS'],
  },
  web: {
    label: 'Web Development',
    categories: ['WEB', 'LANDING_PAGE', 'WEBSITE_DEV', 'BUG_FIX', 'UI_DESIGN', 'CMS_UPDATE'],
  },
  design: {
    label: 'Design',
    categories: ['DESIGN', 'LOGO', 'BANNER', 'INFOGRAPHIC', 'PRESENTATION', 'THUMBNAIL', 'MOTION_GRAPHICS', 'ANIMATION', 'GIF'],
  },
}

export function SalesTrackerView({ initialClients }: SalesTrackerViewProps) {
  const [clients] = useState(initialClients)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [selectedClient, setSelectedClient] = useState<string>(initialClients[0]?.id || '')
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth())
  const [loading, setLoading] = useState(false)

  const monthOptions = getMonthOptions()
  const currentClient = clients.find(c => c.id === selectedClient)

  // Only show approved items
  const approvedItems = useMemo(() => {
    return deliverables.filter(d => d.status === 'APPROVED')
  }, [deliverables])

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, { label: string; items: Deliverable[]; count: number }> = {}

    for (const [groupKey, group] of Object.entries(categoryGroups)) {
      const items = approvedItems.filter(d => group.categories.includes(d.category))
      if (items.length > 0) {
        groups[groupKey] = {
          label: group.label,
          items,
          count: items.length,
        }
      }
    }

    // Add "Other" for uncategorized
    const categorizedIds = new Set(Object.values(categoryGroups).flatMap(g => g.categories))
    const otherItems = approvedItems.filter(d => !categorizedIds.has(d.category))
    if (otherItems.length > 0) {
      groups['other'] = {
        label: 'Other',
        items: otherItems,
        count: otherItems.length,
      }
    }

    return groups
  }, [approvedItems])

  // Detailed breakdown within each group
  const detailedBreakdown = useMemo(() => {
    const breakdown: Record<string, Record<string, number>> = {}

    for (const [groupKey, group] of Object.entries(groupedItems)) {
      breakdown[groupKey] = {}
      for (const item of group.items) {
        const cat = item.category.replace(/_/g, ' ')
        breakdown[groupKey][cat] = (breakdown[groupKey][cat] || 0) + 1
      }
    }

    return breakdown
  }, [groupedItems])

  useEffect(() => {
    if (selectedClient) {
      fetchDeliverables()
    }
  }, [selectedClient, selectedMonth])

  const fetchDeliverables = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/client-deliverables?clientId=${selectedClient}&month=${selectedMonth}`)
      if (res.ok) {
        const data = await res.json()
        setDeliverables(data.deliverables || [])
      }
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Category Group', 'Category', 'Work Item', 'Description', 'Proof URL']
    const rows: string[][] = []

    for (const [groupKey, group] of Object.entries(groupedItems)) {
      for (const item of group.items) {
        rows.push([
          group.label,
          item.category.replace(/_/g, ' '),
          item.workItem,
          item.description || '',
          item.proofUrl || '',
        ])
      }
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentClient?.client || 'client'}-deliverables-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const categories = Object.entries(groupedItems).map(([key, group]) => ({
      name: group.label,
      items: Object.entries(detailedBreakdown[key] || {}).map(([cat, count]) => ({
        name: cat,
        count: count as number,
      })),
      total: group.count,
    }))

    generateDeliverablesReportPDF(
      currentClient?.client || 'Client',
      formatMonthDisplay(selectedMonth),
      categories,
      { total: approvedItems.length, approved: approvedItems.length }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Deliverables Portfolio</h1>
            <p className="text-emerald-100">Approved work for client presentations</p>
          </div>
          <ExportButtons
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            loading={approvedItems.length === 0}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white glass-card"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.client}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white glass-card"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Client Info */}
      {currentClient && (
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h2 className="text-xl font-bold text-white">{currentClient.client}</h2>
          <p className="text-slate-400">Account Manager: {currentClient.accountManager}</p>
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      ) : approvedItems.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <p className="text-slate-300">No approved deliverables for {formatMonthDisplay(selectedMonth)}.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <h3 className="font-semibold text-white mb-4">Deliverables Summary (Approved Only)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(groupedItems).map(([key, group]) => (
                <div key={key} className="bg-slate-900/40 rounded-xl p-4 text-center border border-white/10">
                  <p className="text-2xl font-bold text-white">{group.count}</p>
                  <p className="text-sm text-slate-400">{group.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <h3 className="font-semibold text-white mb-4">Detailed Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([key, group]) => (
                <div key={key} className="border border-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{group.label}</span>
                    <span className="text-sm text-slate-400">({group.count})</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    {Object.entries(detailedBreakdown[key] || {}).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{cat}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item List */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-white">All Approved Items ({approvedItems.length})</h3>
            </div>
            <div className="divide-y divide-white/10">
              {approvedItems.map(item => (
                <div key={item.id} className="p-4 hover:bg-slate-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{item.workItem}</p>
                      <p className="text-sm text-slate-400">{item.category.replace(/_/g, ' ')}</p>
                    </div>
                    {item.proofUrl && (
                      <a
                        href={item.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm text-emerald-600 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
