'use client'

import { useState } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

const guidelines = [
  {
    category: 'Billing Policies',
    icon: '💰',
    color: 'emerald',
    items: [
      { title: 'Invoice Generation', description: 'Invoices are generated on the 5th of every month for all active clients' },
      { title: 'Invoice Delivery', description: 'Invoices must be sent within 2 business days of generation via email and WhatsApp' },
      { title: 'GST Compliance', description: 'All invoices must include 18% GST. GSTIN must be verified before first invoice' },
      { title: 'Invoice Format', description: 'Use standardized invoice template with company branding. Include PO number if provided' },
      { title: 'Proforma Invoices', description: 'Proforma invoices to be sent for new clients before contract signing' },
    ]
  },
  {
    category: 'Payment Timelines',
    icon: '📅',
    color: 'blue',
    items: [
      { title: 'Standard Payment Terms', description: 'Net 15 days from invoice date for all regular clients' },
      { title: 'Enterprise Clients', description: 'Net 30 days for enterprise contracts above Rs. 2 lakhs/month' },
      { title: 'Grace Period', description: '5 day grace period after due date before marking as overdue' },
      { title: 'Advance Payment', description: 'New clients must pay first month in advance before service activation' },
      { title: 'Annual Contracts', description: 'Quarterly payment option available for annual contracts with 5% discount' },
    ]
  },
  {
    category: 'Refund Rules',
    icon: '🔄',
    color: 'purple',
    items: [
      { title: 'Full Refund', description: 'Available within 7 days of service start if deliverables not initiated' },
      { title: 'Partial Refund', description: 'Pro-rata refund for unused period if client exits mid-month' },
      { title: 'No Refund Cases', description: 'No refunds for completed deliverables or services already rendered' },
      { title: 'Refund Processing', description: 'All refunds processed within 7-10 business days after approval' },
      { title: 'Refund Approval', description: 'Refunds above Rs. 25,000 require manager approval' },
    ]
  },
  {
    category: 'Contract Obligations',
    icon: '📜',
    color: 'amber',
    items: [
      { title: 'Minimum Commitment', description: 'Standard contracts have 3-month minimum commitment period' },
      { title: 'Notice Period', description: '30 days written notice required for contract termination' },
      { title: 'Auto-Renewal', description: 'Contracts auto-renew unless notice given 30 days before expiry' },
      { title: 'Scope Changes', description: 'Any scope changes require written amendment to contract' },
      { title: 'Force Majeure', description: 'Standard force majeure clause applies for unforeseen circumstances' },
    ]
  },
  {
    category: 'Credit Policies',
    icon: '💳',
    color: 'cyan',
    items: [
      { title: 'Credit Limit', description: 'No credit extended to clients with outstanding dues beyond 30 days' },
      { title: 'Credit Terms', description: 'Credit terms only for clients with 6+ months clean payment history' },
      { title: 'Bad Debt', description: 'Accounts unpaid for 90+ days to be escalated for legal action' },
      { title: 'Payment Plans', description: 'Payment plans available for outstanding dues with manager approval' },
      { title: 'Service Suspension', description: 'Services may be suspended after 45 days of non-payment' },
    ]
  },
  {
    category: 'Discounts & Offers',
    icon: '🏷️',
    color: 'pink',
    items: [
      { title: 'Early Payment', description: '2% discount for payment within 7 days of invoice' },
      { title: 'Annual Payment', description: '10% discount for annual upfront payment' },
      { title: 'Referral Discount', description: '5% discount for clients who refer new business' },
      { title: 'Long-term Client', description: 'Loyalty discount negotiable for 2+ year clients' },
      { title: 'Bundle Discount', description: '15% discount for bundling 3+ services together' },
    ]
  }
]

const colorClasses = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10',
  blue: 'border-blue-500/30 bg-blue-500/10',
  purple: 'border-purple-500/30 bg-purple-500/10',
  amber: 'border-amber-500/30 bg-amber-500/10',
  cyan: 'border-cyan-500/30 bg-cyan-500/10',
  pink: 'border-pink-500/30 bg-pink-500/10'
}

export default function ClientGuidelinesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(guidelines[0].category)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Client Guidelines</h1>
            <InfoTooltip
              title="Client Guidelines"
              steps={[
                'Reference standard policies for client handling',
                'Billing, payment, and refund rules',
                'Contract obligations and credit policies',
                'Ensure consistent treatment across all clients'
              ]}
              tips={[
                'Review before client discussions',
                'Escalate exceptions to manager'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Standard guidelines for handling client accounts</p>
        </div>
      </div>

      {/* Quick Reference Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <h3 className="font-bold text-emerald-400">Standard Terms</h3>
          <p className="text-slate-300 text-sm mt-1">Net 15 days</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-bold text-blue-400">Grace Period</h3>
          <p className="text-slate-300 text-sm mt-1">5 days after due date</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <h3 className="font-bold text-purple-400">Notice Period</h3>
          <p className="text-slate-300 text-sm mt-1">30 days written</p>
        </div>
      </div>

      {/* Guidelines Accordion */}
      <div className="space-y-4">
        {guidelines.map(section => (
          <div
            key={section.category}
            className={`border rounded-2xl overflow-hidden transition-all ${colorClasses[section.color as keyof typeof colorClasses]}`}
          >
            <button
              onClick={() => setExpandedCategory(expandedCategory === section.category ? null : section.category)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-lg font-bold text-white">{section.category}</h2>
                <span className="text-sm text-slate-400">({section.items.length} items)</span>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${expandedCategory === section.category ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedCategory === section.category && (
              <div className="px-4 pb-4">
                <div className="bg-black/20 rounded-xl divide-y divide-white/5">
                  {section.items.map((item, index) => (
                    <div key={item.title} className="p-4">
                      <h3 className="font-medium text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Important Notes */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-amber-400 mb-4">Important Notes</h3>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Always document any exceptions to standard policies in the client notes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Manager approval required for any deviation from standard terms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Keep all client communications professional and documented</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400">•</span>
            <span>Escalate disputes immediately to the accounts lead</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
