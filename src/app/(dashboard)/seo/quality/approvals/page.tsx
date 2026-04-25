'use client'

interface ClientApproval {
  id: string
  client: string
  deliverable: string
  deliverableType: 'Blog Topic' | 'Content Draft' | 'Landing Page' | 'Monthly Report'
  submittedDate: string
  reviewer: string
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'
  feedback?: string
}

const CLIENT_APPROVALS: ClientApproval[] = [
  { id: '1', client: 'Apollo Hospitals', deliverable: 'Blog: Best Cardiologist in Delhi - Final Draft', deliverableType: 'Content Draft', submittedDate: '2024-03-10', reviewer: 'Client - Dr. Reddy', status: 'PENDING' },
  { id: '2', client: 'MaxCare Clinic', deliverable: 'Blog Topics for March 2024', deliverableType: 'Blog Topic', submittedDate: '2024-03-08', reviewer: 'Client - Mr. Verma', status: 'APPROVED', feedback: 'All topics approved. Please prioritize the orthopedic content.' },
  { id: '3', client: 'HealthFirst Labs', deliverable: 'New Landing Page - Health Packages', deliverableType: 'Landing Page', submittedDate: '2024-03-09', reviewer: 'Client - Ms. Sharma', status: 'CHANGES_REQUESTED', feedback: 'Please add pricing table and change the hero image to show family.' },
  { id: '4', client: 'WellnessHub', deliverable: 'February 2024 SEO Report', deliverableType: 'Monthly Report', submittedDate: '2024-03-05', reviewer: 'Client - Mr. Kumar', status: 'APPROVED', feedback: 'Report looks comprehensive. Good progress on rankings.' },
  { id: '5', client: 'Dr Sharma Clinic', deliverable: 'Blog: Skin Care Tips for Pollution', deliverableType: 'Content Draft', submittedDate: '2024-03-11', reviewer: 'Client - Dr. Sharma', status: 'PENDING' },
  { id: '6', client: 'Apollo Hospitals', deliverable: 'Blog Topics for Q2 2024', deliverableType: 'Blog Topic', submittedDate: '2024-03-07', reviewer: 'Client - Dr. Reddy', status: 'CHANGES_REQUESTED', feedback: 'Need more topics on pediatrics and women health. Remove 2 cardiology topics.' },
]

export default function SeoClientApprovalsPage() {
  const pendingCount = CLIENT_APPROVALS.filter(a => a.status === 'PENDING').length
  const approvedCount = CLIENT_APPROVALS.filter(a => a.status === 'APPROVED').length
  const changesCount = CLIENT_APPROVALS.filter(a => a.status === 'CHANGES_REQUESTED').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400'
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'CHANGES_REQUESTED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Blog Topic': return 'bg-purple-500/20 text-purple-400'
      case 'Content Draft': return 'bg-emerald-500/20 text-emerald-400'
      case 'Landing Page': return 'bg-blue-500/20 text-blue-400'
      case 'Monthly Report': return 'bg-indigo-500/20 text-indigo-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Approvals</h1>
            <p className="text-teal-200">Track approval status from clients</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-teal-200 text-sm">Pending</p>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-sm">Changes Requested</p>
              <p className="text-3xl font-bold text-red-300">{changesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Awaiting Approval</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Approved</p>
          <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Changes Requested</p>
          <p className="text-3xl font-bold text-red-400">{changesCount}</p>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {CLIENT_APPROVALS.map(approval => (
          <div key={approval.id} className={`glass-card rounded-xl border-2 p-4 ${
            approval.status === 'CHANGES_REQUESTED' ? 'border-red-200' :
            approval.status === 'PENDING' ? 'border-amber-200' : 'border-white/10'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{approval.deliverable}</h3>
                <p className="text-sm text-slate-400">{approval.client}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded ${getStatusColor(approval.status)}`}>
                {approval.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(approval.deliverableType)}`}>
                {approval.deliverableType}
              </span>
              <span>Submitted: {new Date(approval.submittedDate).toLocaleDateString('en-IN')}</span>
              <span>Reviewer: {approval.reviewer}</span>
            </div>

            {approval.feedback && (
              <div className={`p-3 rounded-lg ${
                approval.status === 'APPROVED' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <p className="text-sm font-medium text-slate-200 mb-1">Client Feedback:</p>
                <p className={`text-sm ${approval.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                  {approval.feedback}
                </p>
              </div>
            )}

            {approval.status === 'CHANGES_REQUESTED' && (
              <div className="mt-3 flex gap-2">
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-teal-400 bg-teal-500/10 rounded-lg opacity-50 cursor-not-allowed">
                  Make Changes
                </button>
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg opacity-50 cursor-not-allowed">
                  View Details
                </button>
              </div>
            )}

            {approval.status === 'PENDING' && (
              <div className="mt-3 flex gap-2">
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg opacity-50 cursor-not-allowed">
                  Send Reminder
                </button>
                <button disabled title="Coming soon" className="px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900/40 rounded-lg opacity-50 cursor-not-allowed">
                  View Submission
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Required */}
      {changesCount > 0 && (
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <h3 className="font-semibold text-red-800 mb-2">Action Required</h3>
          <p className="text-sm text-red-400">
            {changesCount} deliverable(s) have changes requested by clients. Please review feedback and make necessary updates.
          </p>
        </div>
      )}
    </div>
  )
}
