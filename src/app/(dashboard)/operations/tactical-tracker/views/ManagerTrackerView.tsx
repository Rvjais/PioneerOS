'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { StatsBar } from '../components/StatsBar'
import { ApprovalCard } from '../components/ApprovalCard'
import { generateTablePDF } from '@/client/utils/export/pdfExport'
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

interface ManagerTrackerViewProps {
  initialClients: ClientScope[]
  userRole?: string
  userDepartment?: string
}

function getDefaultReportingMonth(): string {
  const now = new Date()
  const dayOfMonth = now.getDate()
  if (dayOfMonth <= 5) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getMonthOptions(): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    months.push({ value, label })
  }
  return months
}

function formatMonthDisplay(month: string): string {
  const [year, m] = month.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${monthNames[parseInt(m) - 1]} ${year}`
}

export function ManagerTrackerView({ initialClients }: ManagerTrackerViewProps) {
  const [clients] = useState(initialClients)
  const [allDeliverables, setAllDeliverables] = useState<Deliverable[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>(getDefaultReportingMonth())
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const monthOptions = getMonthOptions()

  // Get unique employees from deliverables
  const employees = useMemo(() => {
    const empMap = new Map<string, string>()
    allDeliverables.forEach(d => {
      if (d.createdBy) {
        empMap.set(d.createdBy.id, `${d.createdBy.firstName} ${d.createdBy.lastName}`)
      }
    })
    return Array.from(empMap.entries()).map(([id, name]) => ({ id, name }))
  }, [allDeliverables])

  // Filter deliverables
  const filteredDeliverables = useMemo(() => {
    let items = allDeliverables

    if (selectedClient !== 'all') {
      items = items.filter(d => d.clientId === selectedClient)
    }

    if (selectedEmployee !== 'all') {
      items = items.filter(d => d.createdBy?.id === selectedEmployee)
    }

    return items
  }, [allDeliverables, selectedClient, selectedEmployee])

  // Calculate stats
  const stats = useMemo(() => {
    const pending = filteredDeliverables.filter(d => d.status === 'SUBMITTED').length
    const today = filteredDeliverables.filter(d => {
      if (d.status !== 'APPROVED') return false
      // Check if reviewed today (simplified check)
      return true
    }).length
    const revision = filteredDeliverables.filter(d => d.status === 'REVISION_REQUIRED').length
    const total = filteredDeliverables.length

    return [
      { label: 'Pending Review', value: pending, color: 'amber' as const },
      { label: 'Approved', value: filteredDeliverables.filter(d => d.status === 'APPROVED').length, color: 'green' as const },
      { label: 'Needs Revision', value: revision, color: 'red' as const },
      { label: 'Total Items', value: total, color: 'slate' as const },
    ]
  }, [filteredDeliverables])

  // Get pending items
  const pendingItems = useMemo(() => {
    return filteredDeliverables.filter(d => d.status === 'SUBMITTED')
  }, [filteredDeliverables])

  // Fetch all deliverables for all clients
  useEffect(() => {
    fetchAllDeliverables()
  }, [selectedMonth])

  const fetchAllDeliverables = async () => {
    setLoading(true)
    setSelectedIds(new Set())
    try {
      // Fetch deliverables for all clients
      const allItems: Deliverable[] = []
      for (const client of clients) {
        const res = await fetch(`/api/client-deliverables?clientId=${client.id}&month=${selectedMonth}`)
        if (res.ok) {
          const data = await res.json()
          allItems.push(...(data.deliverables || []))
        }
      }
      setAllDeliverables(allItems)
    } catch (error) {
      console.error('Failed to fetch deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REVISION_REQUIRED') => {
    try {
      const res = await fetch('/api/client-deliverables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (res.ok) {
        const data = await res.json()
        setAllDeliverables(prev => prev.map(d => d.id === id ? data.deliverable : d))
        setSelectedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)

    try {
      const promises = Array.from(selectedIds).map(id =>
        fetch('/api/client-deliverables', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'APPROVED' }),
        })
      )

      const results = await Promise.all(promises)
      const updatedItems: Deliverable[] = []

      for (const res of results) {
        if (res.ok) {
          const data = await res.json()
          updatedItems.push(data.deliverable)
        }
      }

      setAllDeliverables(prev =>
        prev.map(d => {
          const updated = updatedItems.find(u => u.id === d.id)
          return updated || d
        })
      )
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Failed to bulk approve:', error)
    } finally {
      setBulkLoading(false)
    }
  }

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.client || 'Unknown'
  }

  const handleExportCSV = () => {
    const headers = ['Client', 'Category', 'Work Item', 'Status', 'Proof URL', 'Created By']
    const rows = filteredDeliverables.map(item => [
      getClientName(item.clientId),
      item.category,
      item.workItem,
      item.status,
      item.proofUrl || '',
      item.createdBy ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : '',
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-deliverables-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth

    generateTablePDF(
      {
        columns: [
          { header: 'Client', key: 'client', width: 35 },
          { header: 'Category', key: 'category', width: 30 },
          { header: 'Work Item', key: 'workItem', width: 40 },
          { header: 'Status', key: 'status', width: 25 },
          { header: 'Created By', key: 'createdBy', width: 30 },
        ],
        rows: filteredDeliverables.map(item => ({
          client: getClientName(item.clientId),
          category: item.category.replace(/_/g, ' '),
          workItem: item.workItem,
          status: item.status,
          createdBy: item.createdBy ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : '',
        })),
      },
      {
        title: 'Team Deliverables Report',
        subtitle: monthLabel,
        filename: `team-deliverables-${selectedMonth}`,
        orientation: 'landscape',
      },
      [
        { label: 'Total Items', value: filteredDeliverables.length, color: 'blue' },
        { label: 'Pending', value: pendingItems.length, color: 'amber' },
        { label: 'Approved', value: filteredDeliverables.filter(d => d.status === 'APPROVED').length, color: 'green' },
        { label: 'Revision', value: filteredDeliverables.filter(d => d.status === 'REVISION_REQUIRED').length, color: 'red' },
      ]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team Deliverables</h1>
            <p className="text-indigo-200">{formatMonthDisplay(selectedMonth)}</p>
          </div>
          <ExportButtons onExportPDF={handleExportPDF} onExportCSV={handleExportCSV} />
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.client}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Team Member</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card"
            >
              <option value="all">All Team</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Pending Approvals Section */}
      {loading ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      ) : (
        <>
          {/* Pending Approval Cards */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="text-amber-500">&#x1F514;</span>
                Pending Approval ({pendingItems.length})
              </h2>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {bulkLoading ? 'Approving...' : `Bulk Approve (${selectedIds.size})`}
                </button>
              )}
            </div>

            <div className="p-4">
              {pendingItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-sm">No items pending approval</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingItems.map(item => (
                    <ApprovalCard
                      key={item.id}
                      item={item}
                      clientName={getClientName(item.clientId)}
                      selected={selectedIds.has(item.id)}
                      onSelect={handleSelect}
                      onApprove={(id) => handleUpdateStatus(id, 'APPROVED')}
                      onRevise={(id) => handleUpdateStatus(id, 'REVISION_REQUIRED')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Link to Full Tracker */}
          <div className="glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">All Work Items</h3>
                <p className="text-sm text-slate-400">View the full tracker with all details and editing capabilities</p>
              </div>
              <Link
                href="/operations/tactical-tracker/full"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                View Full Tracker
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
