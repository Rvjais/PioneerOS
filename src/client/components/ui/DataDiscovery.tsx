'use client'

import { useState } from 'react'

interface DataDiscoveryProps {
  /** What type of data this list shows */
  dataType: 'clients' | 'tasks' | 'invoices' | 'leads' | 'employees' | 'meetings' | 'expenses' | 'custom'
  /** Custom tips (for dataType='custom') */
  customTips?: { label: string; instruction: string }[]
}

const discoveryTips: Record<string, { label: string; instruction: string }[]> = {
  clients: [
    { label: 'Churned clients', instruction: 'Set the Lifecycle filter to "CHURNED" to see clients who left.' },
    { label: 'Paused clients', instruction: 'Set the Lifecycle filter to "PAUSED" to see temporarily inactive clients.' },
    { label: 'Old clients', instruction: 'Use the Date Range filter and select a past period.' },
    { label: 'All clients at once', instruction: 'Set Status filter to "All" - this shows active, paused, and churned.' },
    { label: 'Deleted clients', instruction: 'Deleted clients can be restored by admins. Contact your Super Admin.' },
    { label: 'Client from another team', instruction: 'You only see clients where you\'re a team member. Ask your manager for access.' },
  ],
  tasks: [
    { label: 'Completed tasks', instruction: 'Set Status filter to "COMPLETED" or "All" to include finished tasks.' },
    { label: 'Cancelled tasks', instruction: 'Set Status filter to "CANCELLED" to see tasks that were cancelled.' },
    { label: 'Tasks from last month', instruction: 'Use the Date Range filter to select the previous month.' },
    { label: 'Tasks assigned to others', instruction: 'Change "My Tasks" filter to "All Tasks" (requires Manager role).' },
    { label: 'Overdue tasks', instruction: 'Filter by "Overdue" to see tasks past their due date.' },
  ],
  invoices: [
    { label: 'Paid invoices', instruction: 'Set Status filter to "PAID" to see all settled invoices.' },
    { label: 'Cancelled invoices', instruction: 'Set Status filter to "CANCELLED" to see voided invoices.' },
    { label: 'Invoices from a specific period', instruction: 'Use the Date Range filter with the invoice date column.' },
    { label: 'Invoices for a specific client', instruction: 'Use the Client dropdown filter to narrow results.' },
    { label: 'Download all invoices', instruction: 'Use Export to Excel with "All" status filter to get everything.' },
  ],
  leads: [
    { label: 'Lost leads', instruction: 'Set Status filter to "LOST" to see leads that didn\'t convert.' },
    { label: 'Old leads', instruction: 'Use Date Range filter. Leads older than 90 days may need re-engagement.' },
    { label: 'Leads assigned to other reps', instruction: 'Clear the "My Leads" filter or select "All Team" (Manager only).' },
    { label: 'Converted leads', instruction: 'Set Status to "WON" to see leads that became clients.' },
  ],
  employees: [
    { label: 'Inactive employees', instruction: 'Set Status filter to "INACTIVE" to see employees who left.' },
    { label: 'Employees on PIP', instruction: 'Set Status filter to "PIP" to see employees on performance improvement.' },
    { label: 'Employees on probation', instruction: 'Set Status filter to "PROBATION" to see new joiners in probation period.' },
    { label: 'Freelancers', instruction: 'Set Employee Type filter to "FREELANCER".' },
    { label: 'Interns', instruction: 'Set Employee Type filter to "INTERN".' },
  ],
  meetings: [
    { label: 'Past meetings', instruction: 'Switch from "Upcoming" tab to "Past" tab to see completed meetings.' },
    { label: 'Meetings from a specific date', instruction: 'Use the Calendar view and navigate to that date.' },
    { label: 'Action items from meetings', instruction: 'Click on any past meeting to see its action items and outcomes.' },
  ],
  expenses: [
    { label: 'Rejected expenses', instruction: 'Set Status filter to "REJECTED" to see denied claims.' },
    { label: 'Approved expenses', instruction: 'Set Status filter to "APPROVED" to see approved claims.' },
    { label: 'Team expenses', instruction: 'Managers can see department expenses. Use the Department filter.' },
    { label: 'Monthly expense report', instruction: 'Use Date Range filter and Export to Excel for accounting.' },
  ],
}

/**
 * DataDiscovery - Collapsible panel showing how to find old/hidden/filtered data
 *
 * Place at the top of any list page to help users discover that
 * data may be hidden behind filters.
 */
export default function DataDiscovery({ dataType, customTips }: DataDiscoveryProps) {
  const [expanded, setExpanded] = useState(false)
  const tips = customTips || discoveryTips[dataType] || []

  if (tips.length === 0) return null

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition group"
      >
        <svg
          className={`w-4 h-4 text-blue-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Can&apos;t find something? See how to find hidden or old data</span>
      </button>

      {expanded && (
        <div className="mt-3 bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to find data that isn&apos;t showing
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tips.map((tip, i) => (
              <div key={tip.label} className="flex gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <span className="text-white font-medium">{tip.label}: </span>
                  <span className="text-slate-400">{tip.instruction}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Universal tips */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-amber-400 font-medium mb-1">General tips:</p>
            <p className="text-xs text-slate-500">
              Most lists default to showing only active/recent items. Use the Status and Date Range filters to see everything.
              Export to Excel gives you all data matching your current filters.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
