'use client'

import { useState } from 'react'
import { InfoTooltip } from '@/client/components/ui/InfoTooltip'

const sections = [
  {
    title: 'Payment Follow-up Etiquette',
    icon: '📞',
    rules: [
      { title: 'Timing', description: 'Follow-up calls between 10 AM - 6 PM on business days only' },
      { title: 'Frequency', description: 'Maximum 2 follow-ups per week for pending payments' },
      { title: 'Tone', description: 'Always maintain professional and courteous tone, never threatening' },
      { title: 'Documentation', description: 'Log every follow-up call with date, time, and outcome' },
      { title: 'Voicemail', description: 'Leave polite voicemail if call not answered, with callback number' },
      { title: 'Email Backup', description: 'Always follow up phone calls with email summary' }
    ]
  },
  {
    title: 'Escalation Rules',
    icon: '⬆️',
    rules: [
      { title: 'Level 1 (0-15 days overdue)', description: 'Standard follow-up by accounts executive' },
      { title: 'Level 2 (15-30 days overdue)', description: 'Escalate to accounts manager for personal follow-up' },
      { title: 'Level 3 (30-45 days overdue)', description: 'Escalate to department head with service pause warning' },
      { title: 'Level 4 (45-60 days overdue)', description: 'Escalate to leadership with formal notice' },
      { title: 'Level 5 (60+ days overdue)', description: 'Legal notice and collection process initiated' },
      { title: 'VIP Clients', description: 'Always involve account manager for VIP client escalations' }
    ]
  },
  {
    title: 'Payment Reminder Frequency',
    icon: '🔔',
    rules: [
      { title: '7 days before due', description: 'Friendly reminder via email with invoice copy' },
      { title: '3 days before due', description: 'WhatsApp reminder with payment link' },
      { title: 'On due date', description: 'Morning reminder via preferred channel' },
      { title: '3 days after due', description: 'First overdue notice via email and WhatsApp' },
      { title: '7 days after due', description: 'Phone call + formal overdue email' },
      { title: 'Weekly after', description: 'Weekly reminders until payment or escalation' }
    ]
  },
  {
    title: 'Dispute Handling Process',
    icon: '⚖️',
    rules: [
      { title: 'Acknowledgment', description: 'Acknowledge all disputes within 24 hours' },
      { title: 'Investigation', description: 'Complete investigation within 3 business days' },
      { title: 'Response', description: 'Provide detailed response with supporting documents' },
      { title: 'Resolution', description: 'Aim to resolve within 7 business days' },
      { title: 'Credit Notes', description: 'Issue credit notes within 48 hours if dispute valid' },
      { title: 'Documentation', description: 'Maintain complete dispute trail in CRM' }
    ]
  },
  {
    title: 'Communication Channels',
    icon: '📱',
    rules: [
      { title: 'Email', description: 'Primary channel for invoices, formal notices, and documentation' },
      { title: 'WhatsApp', description: 'Quick reminders, payment confirmations, and informal updates' },
      { title: 'Phone', description: 'Overdue follow-ups, dispute discussions, and urgent matters' },
      { title: 'Client Portal', description: 'Invoice access, payment history, and self-service queries' },
      { title: 'Video Call', description: 'Complex discussions, onboarding, and relationship building' },
      { title: 'In-Person', description: 'Annual reviews, major disputes, and VIP client meetings' }
    ]
  },
  {
    title: 'Response Time Standards',
    icon: '⏰',
    rules: [
      { title: 'Payment Queries', description: 'Respond within 4 business hours' },
      { title: 'Invoice Requests', description: 'Provide within 24 hours' },
      { title: 'Dispute Acknowledgment', description: 'Acknowledge within 24 hours' },
      { title: 'General Queries', description: 'Respond within 48 hours' },
      { title: 'Urgent Matters', description: 'Same day response required' },
      { title: 'After Hours', description: 'Auto-reply with next business day commitment' }
    ]
  }
]

export default function CommunicationCharterPage() {
  const [selectedSection, setSelectedSection] = useState(sections[0].title)

  const currentSection = sections.find(s => s.title === selectedSection)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Communication Charter</h1>
            <InfoTooltip
              title="Communication Charter"
              steps={[
                'Standard rules for client communication',
                'Follow-up etiquette and frequency',
                'Escalation procedures',
                'Response time commitments'
              ]}
              tips={[
                'Consistency builds trust',
                'Document all communications'
              ]}
            />
          </div>
          <p className="text-slate-400 mt-1">Rules for how Accounts communicates with clients</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">4h</p>
          <p className="text-sm text-slate-400">Payment Query Response</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">24h</p>
          <p className="text-sm text-slate-400">Dispute Acknowledgment</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">7d</p>
          <p className="text-sm text-slate-400">Dispute Resolution</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">2/wk</p>
          <p className="text-sm text-slate-400">Max Follow-ups</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map(section => (
          <button
            key={section.title}
            onClick={() => setSelectedSection(section.title)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedSection === section.title
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{section.icon}</span>
            <span className="text-sm font-medium">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Selected Section Content */}
      {currentSection && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <span className="text-2xl">{currentSection.icon}</span>
            <h2 className="text-xl font-bold text-white">{currentSection.title}</h2>
          </div>

          <div className="divide-y divide-white/5">
            {currentSection.rules.map((rule, index) => (
              <div key={rule.title} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{rule.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{rule.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Do's and Don'ts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <span>✓</span> Do's
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Always greet professionally and introduce yourself</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Provide specific invoice/payment details in every communication</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Offer payment options and flexibility when appropriate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>Thank clients for their business and timely payments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">•</span>
              <span>End calls with clear next steps and timelines</span>
            </li>
          </ul>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <span>✗</span> Don'ts
          </h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Never use threatening or aggressive language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Don't discuss client matters with unauthorized parties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Avoid calling outside business hours without permission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Don't make commitments without checking policies first</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Never share payment links via unsecured channels</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
