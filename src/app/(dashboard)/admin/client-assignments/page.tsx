'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AssignmentStats {
  totalClients: number
  totalEmployees: number
  totalAssignments: number
  clientsWithNoAssignments: number
  employeesWithNoAssignments: number
  assignmentsByRole: Record<string, number>
}

interface ProposedAssignment {
  clientId: string
  clientName: string
  userId: string
  userName: string
  role: string
}

interface SyncResult {
  success: boolean
  mode: string
  totalClients?: number
  totalEmployees?: number
  existingAssignments?: number
  proposedNewAssignments?: number
  assignments: ProposedAssignment[]
  employeesByDepartment?: Record<string, number>
  created?: number
}

export default function ClientAssignmentsPage() {
  const [stats, setStats] = useState<AssignmentStats | null>(null)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/sync-client-assignments')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/sync-client-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'preview' }),
      })
      if (res.ok) {
        const data = await res.json()
        setSyncResult(data)
      }
    } catch (error) {
      console.error('Failed to preview:', error)
      setToast({ message: 'Failed to preview assignments', type: 'error' })
    } finally {
      setSyncing(false)
    }
  }

  const handleExecute = async () => {
    if (!confirm('Are you sure you want to create these client assignments?')) return

    setSyncing(true)
    try {
      const res = await fetch('/api/admin/sync-client-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'execute' }),
      })
      if (res.ok) {
        const data = await res.json()
        setSyncResult(data)
        setToast({ message: `Created ${data.created} assignments successfully!`, type: 'success' })
        fetchStats() // Refresh stats
      }
    } catch (error) {
      console.error('Failed to execute:', error)
      setToast({ message: 'Failed to create assignments', type: 'error' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-none flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2">&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span>Client Assignments</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Client-Team Assignments</h1>
          <p className="text-slate-400 mt-1">
            Manage which employees are assigned to which clients
          </p>
        </div>
        <button
          onClick={handlePreview}
          disabled={syncing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {syncing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Auto-Assign Preview
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Active Clients</p>
            <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Employees</p>
            <p className="text-2xl font-bold text-white">{stats.totalEmployees}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Total Assignments</p>
            <p className="text-2xl font-bold text-green-400">{stats.totalAssignments}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Unassigned Clients</p>
            <p className={`text-2xl font-bold ${stats.clientsWithNoAssignments > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats.clientsWithNoAssignments}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Unassigned Employees</p>
            <p className={`text-2xl font-bold ${stats.employeesWithNoAssignments > 0 ? 'text-amber-400' : 'text-green-400'}`}>
              {stats.employeesWithNoAssignments}
            </p>
          </div>
        </div>
      ) : null}

      {/* Sync Result */}
      {syncResult && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                {syncResult.mode === 'execute' ? 'Assignment Results' : 'Preview: Proposed Assignments'}
              </h2>
              <p className="text-sm text-slate-400">
                {syncResult.mode === 'execute'
                  ? `Created ${syncResult.created} new assignments`
                  : `${syncResult.proposedNewAssignments} new assignments to create`}
              </p>
            </div>
            {syncResult.mode === 'preview' && syncResult.proposedNewAssignments! > 0 && (
              <button
                onClick={handleExecute}
                disabled={syncing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Execute Assignments
              </button>
            )}
          </div>

          {syncResult.employeesByDepartment && (
            <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-700">
              <p className="text-xs text-slate-400 mb-2">EMPLOYEES BY DEPARTMENT</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(syncResult.employeesByDepartment).map(([dept, count]) => (
                  <span key={dept} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                    {dept}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {syncResult.assignments.length > 0 ? (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-4 text-slate-400">Client</th>
                    <th className="text-left py-2 px-4 text-slate-400">Employee</th>
                    <th className="text-left py-2 px-4 text-slate-400">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {syncResult.assignments.map((a, idx) => (
                    <tr key={`${a.clientName}-${a.userName}`} className="border-t border-slate-700/50">
                      <td className="py-2 px-4 text-white">{a.clientName}</td>
                      <td className="py-2 px-4 text-slate-300">{a.userName}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                          {a.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              {syncResult.mode === 'execute'
                ? 'No new assignments were needed - all clients already have team members.'
                : 'All clients already have team members assigned.'}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">How Client Assignments Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div>
            <h3 className="font-medium text-purple-400 mb-2">For Managers</h3>
            <ul className="space-y-1 text-slate-400">
              <li>• See all active clients automatically</li>
              <li>• Can assign team members to any client</li>
              <li>• View team performance across all clients</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-purple-400 mb-2">For Employees</h3>
            <ul className="space-y-1 text-slate-400">
              <li>• Only see clients they are assigned to</li>
              <li>• Must be added to ClientTeamMember table</li>
              <li>• Assignments can be made per-client or via auto-assign</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            <strong>Auto-Assign Logic:</strong> Distributes clients evenly among employees in client-facing departments
            (WEB, SEO, ADS, SOCIAL, DESIGN, VIDEO_EDITING) using round-robin assignment.
          </p>
        </div>
      </div>
    </div>
  )
}
