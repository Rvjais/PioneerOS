'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { StatsBar } from '../components/StatsBar'
import { InlineAddForm } from '../components/InlineAddForm'
import { QuickLogCard } from '../components/QuickLogCard'
import { getWorkCategoriesForUser } from '@/shared/constants/departmentActivities'

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

interface EmployeeTrackerViewProps {
  initialClients: ClientScope[]
  userRole?: string
  userDepartment?: string
  userId: string
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

export function EmployeeTrackerView({ initialClients, userRole, userDepartment, userId }: EmployeeTrackerViewProps) {
  const [clients] = useState(initialClients)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [selectedClient, setSelectedClient] = useState<string>(initialClients[0]?.id || '')
  const [loading, setLoading] = useState(false)

  // Always use current month for employees
  const currentMonth = getCurrentMonth()

  // Get role-specific categories
  const userCategories = useMemo(() => {
    const role = userRole || ''
    const dept = userDepartment || ''
    return getWorkCategoriesForUser(role, dept)
  }, [userRole, userDepartment])

  // Filter to show only user's own items
  const myDeliverables = useMemo(() => {
    return deliverables.filter(d => d.createdBy?.id === userId)
  }, [deliverables, userId])

  // Calculate stats
  const stats = useMemo(() => {
    const pending = myDeliverables.filter(d => d.status === 'PENDING').length
    const submitted = myDeliverables.filter(d => d.status === 'SUBMITTED').length
    const approved = myDeliverables.filter(d => d.status === 'APPROVED').length
    const revision = myDeliverables.filter(d => d.status === 'REVISION_REQUIRED').length

    return [
      { label: 'Pending', value: pending, color: 'slate' as const },
      { label: 'Submitted', value: submitted, color: 'blue' as const },
      { label: 'Approved', value: approved, color: 'green' as const },
      { label: 'Needs Revision', value: revision, color: 'red' as const },
    ]
  }, [myDeliverables])

  // Fetch deliverables when client changes
  useEffect(() => {
    if (selectedClient) {
      fetchDeliverables()
    }
  }, [selectedClient])

  const fetchDeliverables = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/client-deliverables?clientId=${selectedClient}&month=${currentMonth}`)
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

  const handleAddWorkItem = async (data: { category: string; workItem: string; proofUrl: string }) => {
    try {
      const res = await fetch('/api/client-deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient,
          category: data.category,
          workItem: data.workItem,
          description: '',
          month: currentMonth,
          proofUrl: data.proofUrl || undefined,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        setDeliverables(prev => [...prev, result.deliverable])
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to add item')
      }
    } catch (error) {
      console.error('Failed to add work item:', error)
      toast.error('Failed to add work item')
    }
  }

  const handleUpdateProof = async (id: string, proofUrl: string) => {
    try {
      const res = await fetch('/api/client-deliverables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, proofUrl }),
      })

      if (res.ok) {
        const data = await res.json()
        setDeliverables(prev => prev.map(d => d.id === id ? data.deliverable : d))
      }
    } catch (error) {
      console.error('Failed to update proof:', error)
    }
  }

  const currentClient = clients.find(c => c.id === selectedClient)

  // Group items by status for display
  const pendingItems = myDeliverables.filter(d => d.status === 'PENDING')
  const submittedItems = myDeliverables.filter(d => d.status === 'SUBMITTED')
  const approvedItems = myDeliverables.filter(d => d.status === 'APPROVED')
  const revisionItems = myDeliverables.filter(d => d.status === 'REVISION_REQUIRED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Log Your Work</h1>
        <p className="text-indigo-200">{formatMonthDisplay(currentMonth)}</p>
      </div>

      {/* Client Selector - Simplified dropdown */}
      {clients.length > 1 && (
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <label className="block text-sm font-medium text-slate-200 mb-2">Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white glass-card"
          >
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.client}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Single client display */}
      {clients.length === 1 && currentClient && (
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Client</p>
          <p className="text-lg font-semibold text-white">{currentClient.client}</p>
        </div>
      )}

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Quick Add Form */}
      <InlineAddForm
        categories={userCategories}
        onAdd={handleAddWorkItem}
        disabled={!selectedClient || loading}
      />

      {/* Work Items - Card Grid */}
      {loading ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      ) : myDeliverables.length === 0 ? (
        <div className="glass-card rounded-xl border border-white/10 p-8 text-center">
          <p className="text-slate-300">No work items yet for {formatMonthDisplay(currentMonth)}.</p>
          <p className="text-sm text-slate-400 mt-1">Use the form above to add your first work item.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Needs Revision - Show first with warning */}
          {revisionItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Needs Revision ({revisionItems.length})
              </h3>
              <div className="grid gap-3">
                {revisionItems.map(item => (
                  <QuickLogCard key={item.id} item={item} onUpdateProof={handleUpdateProof} />
                ))}
              </div>
            </div>
          )}

          {/* Pending - Need proof */}
          {pendingItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Pending - Add Proof ({pendingItems.length})
              </h3>
              <div className="grid gap-3">
                {pendingItems.map(item => (
                  <QuickLogCard key={item.id} item={item} onUpdateProof={handleUpdateProof} />
                ))}
              </div>
            </div>
          )}

          {/* Submitted - Awaiting Review */}
          {submittedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-3">
                Submitted - Awaiting Review ({submittedItems.length})
              </h3>
              <div className="grid gap-3">
                {submittedItems.map(item => (
                  <QuickLogCard key={item.id} item={item} onUpdateProof={handleUpdateProof} />
                ))}
              </div>
            </div>
          )}

          {/* Approved */}
          {approvedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-3">
                Approved ({approvedItems.length})
              </h3>
              <div className="grid gap-3">
                {approvedItems.map(item => (
                  <QuickLogCard key={item.id} item={item} onUpdateProof={handleUpdateProof} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
