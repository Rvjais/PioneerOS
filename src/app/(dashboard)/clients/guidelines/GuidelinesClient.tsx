'use client'

import { useState } from 'react'

interface Props {
  allowedTipsDepartments: string[]
}

const LANGUAGE_POLICY = {
  english: {
    label: 'English',
    badge: 'CLIENT-READY',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-200',
    description: 'Use this version when messaging clients'
  },
  hinglish: {
    label: 'Hinglish',
    badge: 'INTERNAL ONLY',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-200',
    description: 'For internal team reference - translate to English before sending to client'
  }
}

const TABS = [
  { id: 'templates', label: 'Message Templates', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
  { id: 'faqs', label: 'Client Handling FAQs', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { id: 'tips', label: 'Department Tips', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> }
]

const MESSAGE_TEMPLATES = [
  {
    category: 'Onboarding & Kickoff',
    templates: [
      {
        title: 'Welcome Message',
        purpose: 'Sent after signing SLA/first payment.',
        content: `Hi [Client Name],\n\nWelcome to Branding Pioneers! We're thrilled to have you onboard.\n\nI will be your Account Manager. Could you please fill out this onboarding form? [Link]\n\nOnce filled, we will schedule our kickoff call.\n\nBest,\n[Your Name]`,
        channel: 'WhatsApp / Email'
      },
      {
        title: 'Missing Inputs Follow-up',
        purpose: 'When a client hasn\'t shared required assets.',
        content: `Hi [Client Name],\n\nJust a quick follow-up — we are ready to start, but we are awaiting [Asset Name / Credentials] from your end.\n\nCould you please share this by [Day/Date]?\n\nBest,\n[Your Name]`,
        channel: 'WhatsApp'
      }
    ]
  },
  {
    category: 'Operations & Reporting',
    templates: [
      {
        title: 'Approval Request',
        purpose: 'When sending content for approval.',
        content: `Hi [Client Name],\n\nPlease find attached the [Content Calendar / Designs] for the upcoming week.\n\nKindly share your feedback by [Time/Day]. If we don't hear back, we will assume approval and proceed.\n\nBest,\n[Your Name]`,
        channel: 'WhatsApp / Email'
      },
      {
        title: 'Month-End Report',
        purpose: 'Sending the performance report.',
        content: `Hi [Client Name],\n\nPlease find attached the performance report for [Month].\n\nKey Highlights:\n- [Highlight 1]\n- [Highlight 2]\n\nWould you like to discuss? Available for a call on [Day/Time].\n\nBest,\n[Your Name]`,
        channel: 'Email'
      }
    ]
  }
]

const FAQS = [
  {
    question: 'How to handle Scope Creep?',
    context: 'Client keeps asking for services outside the SLA.',
    action: `1. Acknowledge: Validate their request.\n2. Refer to SLA: Remind them of agreed scope.\n3. Provide Options: Offer as add-on or swap.\n\n**Script:** "That's a great idea! However, this falls outside our current SLA. We can do this as an add-on for ₹[Amount], or swap with [Other Deliverable]. Which do you prefer?"`
  },
  {
    question: 'How to handle an Angry Client?',
    context: 'Client is upset over poor performance or mistake.',
    action: `1. Move to a call immediately.\n2. Listen without interrupting.\n3. Own the problem if it's our fault.\n4. Provide an action plan.\n\n**Script:** "I completely understand your frustration. We dropped the ball on [Issue]. Here is what we're doing to fix it by [Date]."`
  }
]

const ALL_TIPS = [
  {
    department: 'Web Development',
    points: [
      '**Hosting Handoffs:** Never host client websites on your personal server.',
      '**Domain Access:** Get domain registrar access via delegated access, not actual password.',
      '**Go-Live Friday Rule:** Avoid pushing major updates on Friday at 5 PM.'
    ]
  },
  {
    department: 'Social Media & Design',
    points: [
      '**Grid Anxiety:** Remind clients 95% of users see posts in feed, not profile page.',
      '**Revisions:** Group feedback. Refuse "drip-feed" feedback with 1 change per message.',
      '**Shadowbanning:** Check if client bought fake followers or used banned hashtags.'
    ]
  },
  {
    department: 'Performance Marketing (Ads)',
    points: [
      '**Account Bans:** Meta bans happen automatically. Keep standard response ready.',
      '**The "Change it" Reflex:** Hold the line. Explain the 7-day learning phase.',
      '**Budget Scaling:** Never increase budget by more than 20% in 24 hours.'
    ]
  },
  {
    department: 'SEO',
    points: [
      '**The Sandbox:** New websites are in "Google Sandbox" for 3-6 months.',
      '**Algorithm Updates:** Send proactive email before clients notice traffic drops.',
      '**Content Is King:** Document when client refuses blog content.'
    ]
  },
  {
    department: 'Accounts & Billing',
    points: [
      '**Advance Payments:** Enforce "No Advance, No Work" rule for new clients.',
      '**GST Compliance:** Verify client\'s GST number on portal before invoicing.',
      '**Pause Protocol:** If 15 days overdue, notify Account Manager to pause campaigns.'
    ]
  }
]

export function GuidelinesClient({ allowedTipsDepartments }: Props) {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  // Filter tips based on allowed departments
  const filteredTips = ALL_TIPS.filter(tip =>
    allowedTipsDepartments.includes(tip.department)
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Client Guidelines</h1>
        <p className="text-slate-400 mt-1">Communication templates, FAQs, and best practices.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
              ? 'border-blue-600 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-8">
          {MESSAGE_TEMPLATES.map((category, idx) => (
            <div key={category.category}>
              <h2 className="text-lg font-bold text-white mb-4">{category.category}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {category.templates.map((template, tIdx) => (
                  <div key={tIdx} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                    <div className="bg-slate-900/40 px-4 py-3 border-b flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{template.title}</h3>
                        <p className="text-xs text-slate-400">{template.purpose}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {template.channel}
                      </span>
                    </div>
                    <div className="p-4 relative group">
                      <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono bg-slate-900/40 p-3 rounded-lg">
                        {template.content}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(template.content)}
                        className="absolute top-6 right-6 p-2 glass-card border rounded-md shadow-none opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedText === template.content ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={faq.question} className="glass-card rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-slate-400 italic mb-4">Context: {faq.context}</p>
              <div className="text-sm text-slate-200 whitespace-pre-wrap">{faq.action}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredTips.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-slate-400">
              No department-specific tips available.
            </div>
          ) : (
            filteredTips.map((dept, idx) => (
              <div key={dept.department} className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
                  <h3 className="font-bold text-white text-lg">{dept.department}</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-3">
                    {dept.points.map((point, pIdx) => {
                      const match = point.match(/\*\*(.*?)\*\*(.*)/)
                      if (match) {
                        return (
                          <li key={pIdx} className="flex gap-3 text-sm text-slate-300">
                            <span className="text-blue-500">•</span>
                            <span><strong className="text-white">{match[1]}</strong>{match[2]}</span>
                          </li>
                        )
                      }
                      return (
                        <li key={pIdx} className="flex gap-3 text-sm text-slate-300">
                          <span className="text-blue-500">•</span>
                          <span>{point}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
