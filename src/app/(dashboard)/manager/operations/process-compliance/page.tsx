'use client'

interface ProcessCompliance {
  id: string
  process: string
  department: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  compliance: number
  lastCheck: string
  status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT'
  owner: string
}

interface ComplianceIssue {
  id: string
  process: string
  department: string
  issue: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  dateIdentified: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
}

const PROCESS_COMPLIANCE: ProcessCompliance[] = [
  { id: '1', process: 'Daily Task Updates', department: 'All', frequency: 'DAILY', compliance: 95, lastCheck: '2024-03-11', status: 'COMPLIANT', owner: 'Team Leads' },
  { id: '2', process: 'Client Communication Logs', department: 'All', frequency: 'DAILY', compliance: 88, lastCheck: '2024-03-11', status: 'PARTIAL', owner: 'Account Managers' },
  { id: '3', process: 'QC Before Delivery', department: 'All', frequency: 'DAILY', compliance: 92, lastCheck: '2024-03-11', status: 'COMPLIANT', owner: 'QC Team' },
  { id: '4', process: 'Weekly Client Reports', department: 'All', frequency: 'WEEKLY', compliance: 85, lastCheck: '2024-03-08', status: 'PARTIAL', owner: 'Department Heads' },
  { id: '5', process: 'Invoice Generation', department: 'Accounts', frequency: 'MONTHLY', compliance: 100, lastCheck: '2024-03-01', status: 'COMPLIANT', owner: 'Accounts Team' },
  { id: '6', process: 'Payment Follow-up', department: 'Accounts', frequency: 'WEEKLY', compliance: 78, lastCheck: '2024-03-08', status: 'NON_COMPLIANT', owner: 'Accounts Team' },
  { id: '7', process: 'Lead Response Time (<24h)', department: 'Sales', frequency: 'DAILY', compliance: 82, lastCheck: '2024-03-11', status: 'PARTIAL', owner: 'Sales Team' },
  { id: '8', process: 'Monthly Performance Reviews', department: 'HR', frequency: 'MONTHLY', compliance: 70, lastCheck: '2024-03-01', status: 'NON_COMPLIANT', owner: 'HR Team' },
]

const COMPLIANCE_ISSUES: ComplianceIssue[] = [
  { id: '1', process: 'Payment Follow-up', department: 'Accounts', issue: '3 clients missed follow-up schedule', severity: 'HIGH', dateIdentified: '2024-03-08', status: 'IN_PROGRESS' },
  { id: '2', process: 'Monthly Performance Reviews', department: 'HR', issue: 'February reviews not completed for 4 employees', severity: 'MEDIUM', dateIdentified: '2024-03-05', status: 'IN_PROGRESS' },
  { id: '3', process: 'Lead Response Time', department: 'Sales', issue: '5 leads had response time >48 hours', severity: 'HIGH', dateIdentified: '2024-03-10', status: 'OPEN' },
]

export default function ManagerProcessCompliancePage() {
  const compliantCount = PROCESS_COMPLIANCE.filter(p => p.status === 'COMPLIANT').length
  const partialCount = PROCESS_COMPLIANCE.filter(p => p.status === 'PARTIAL').length
  const nonCompliantCount = PROCESS_COMPLIANCE.filter(p => p.status === 'NON_COMPLIANT').length
  const avgCompliance = PROCESS_COMPLIANCE.length > 0 ? Math.round(PROCESS_COMPLIANCE.reduce((sum, p) => sum + p.compliance, 0) / PROCESS_COMPLIANCE.length) : 0
  const openIssues = COMPLIANCE_ISSUES.filter(i => i.status !== 'RESOLVED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-green-500/20 text-green-400'
      case 'PARTIAL': return 'bg-amber-500/20 text-amber-400'
      case 'NON_COMPLIANT': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-500/20 text-red-400'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-slate-800/50 text-slate-200'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Process Compliance</h1>
            <p className="text-purple-200">Monitor adherence to standard operating procedures</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-purple-200 text-sm">Overall Compliance</p>
              <p className="text-3xl font-bold">{avgCompliance}%</p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Open Issues</p>
              <p className="text-3xl font-bold text-red-300">{openIssues}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Compliant</p>
          <p className="text-3xl font-bold text-green-400">{compliantCount}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Partial</p>
          <p className="text-3xl font-bold text-amber-400">{partialCount}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Non-Compliant</p>
          <p className="text-3xl font-bold text-red-400">{nonCompliantCount}</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Processes</p>
          <p className="text-3xl font-bold text-white">{PROCESS_COMPLIANCE.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Process Compliance Table */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-slate-900/40">
            <h2 className="font-semibold text-white">Process Compliance Status</h2>
          </div>
          <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
            {PROCESS_COMPLIANCE.map(process => (
              <div key={process.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-white">{process.process}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{process.department}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">{process.frequency}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(process.status)}`}>
                    {process.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        process.compliance >= 90 ? 'bg-green-500' :
                        process.compliance >= 80 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${process.compliance}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{process.compliance}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Owner: {process.owner}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Issues */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-red-500/10">
            <h2 className="font-semibold text-red-800">Compliance Issues ({COMPLIANCE_ISSUES.length})</h2>
          </div>
          <div className="divide-y divide-white/10">
            {COMPLIANCE_ISSUES.map(issue => (
              <div key={issue.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">{issue.process}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{issue.issue}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{issue.department}</span>
                  <span className={`px-2 py-0.5 rounded ${
                    issue.status === 'OPEN' ? 'bg-red-500/20 text-red-400' :
                    issue.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {issue.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
        <h3 className="font-semibold text-purple-800 mb-3">Compliance Action Plan</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-purple-400">
          <div>
            <p className="font-medium mb-1">Immediate Actions</p>
            <ul className="space-y-1">
              <li>- Fix payment follow-up process</li>
              <li>- Address lead response delays</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">This Week</p>
            <ul className="space-y-1">
              <li>- Complete pending reviews</li>
              <li>- Train team on client logs</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Process Improvements</p>
            <ul className="space-y-1">
              <li>- Automate daily reminders</li>
              <li>- Setup compliance dashboards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
