'use client'

import { useRef, useState } from 'react'

interface Props {
  data: {
    employeeHandbookAccepted: boolean
    socialMediaPolicyAccepted: boolean
    clientConfidentialityAccepted: boolean
    signature: string
  }
  onChange: (data: Partial<Props['data']>) => void
}

// Full policy content
const POLICY_CONTENT = {
  employeeHandbook: {
    title: 'Employee Handbook',
    lastUpdated: 'January 2024',
    sections: [
      {
        title: 'Code of Conduct',
        content: `All employees are expected to:
• Maintain professional behavior at all times
• Treat colleagues, clients, and partners with respect
• Avoid conflicts of interest
• Report any unethical behavior to management
• Maintain confidentiality of company information
• Use company resources responsibly`
      },
      {
        title: 'Attendance Policy',
        content: `Working Hours: 10:00 AM - 7:00 PM (Monday to Friday)
• Be punctual and regular in attendance
• Inform your manager in case of absence or late arrival
• Excessive absenteeism may lead to disciplinary action
• Work from home requires prior approval from manager
• Maintain minimum 90% attendance each month`
      },
      {
        title: 'Leave Policy',
        content: `Annual Leave Entitlement:
• Casual Leave: 12 days per year
• Sick Leave: 6 days per year
• Earned Leave: 15 days per year
• Public Holidays: As per company calendar

Leave Application:
• Apply at least 3 days in advance for planned leave
• Emergency leave must be informed within 2 hours of shift start
• Leaves during notice period require special approval`
      },
      {
        title: 'Workplace Guidelines',
        content: `• Maintain clean and organized workspace
• Follow dress code (smart casual)
• No smoking on office premises
• Personal calls should be limited during work hours
• Respect shared spaces and meeting rooms
• Report any maintenance issues to admin team`
      }
    ]
  },
  socialMedia: {
    title: 'Social Media Policy',
    lastUpdated: 'January 2024',
    sections: [
      {
        title: 'Representing the Company',
        content: `When posting about work or clients:
• Never disclose confidential client information
• Do not share internal metrics, revenue, or strategy
• Do not post client work without written approval
• Always add "Views are my own" disclaimer for personal opinions
• Report any negative mentions to the marketing team`
      },
      {
        title: 'Client Content Handling',
        content: `• Client logos, creatives, and data are confidential
• Never share client performance data publicly
• Do not discuss client strategies on social platforms
• Screenshots of client dashboards are strictly prohibited
• All case studies require client approval before publishing`
      },
      {
        title: 'Personal Social Media',
        content: `• Avoid controversial posts that may reflect poorly on the company
• Do not engage in online arguments while identifiable as an employee
• Keep work grievances off social media
• Connect with colleagues professionally on LinkedIn
• Notify HR if you have a large following (10k+) before joining`
      }
    ]
  },
  clientConfidentiality: {
    title: 'Client Confidentiality Agreement',
    lastUpdated: 'January 2024',
    sections: [
      {
        title: 'Non-Disclosure Agreement',
        content: `You agree to keep confidential all:
• Client business information, strategies, and plans
• Financial data including budgets, revenue, and costs
• Marketing campaigns before public launch
• Internal processes and proprietary methods
• Employee and customer personal information
• Any information marked as confidential`
      },
      {
        title: 'Data Protection',
        content: `• Access only data required for your role
• Never share login credentials
• Use strong passwords and enable 2FA
• Report any data breaches immediately
• Do not store client data on personal devices
• Delete client data when project ends`
      },
      {
        title: 'Security Protocols',
        content: `• Lock your computer when away from desk
• Do not discuss client matters in public places
• Use company VPN when working remotely
• Avoid public WiFi for sensitive work
• Report suspicious emails to IT team
• Participate in security awareness training`
      },
      {
        title: 'Consequences of Breach',
        content: `Violation of confidentiality may result in:
• Immediate termination of employment
• Legal action and financial penalties
• Industry blacklisting
• Criminal prosecution in severe cases

This agreement remains in effect for 2 years after employment ends.`
      }
    ]
  }
}

const policies = [
  {
    id: 'employeeHandbook',
    title: 'Employee Handbook',
    description: 'Code of conduct, attendance policies, leave policies, and workplace guidelines.',
    field: 'employeeHandbookAccepted' as const,
  },
  {
    id: 'socialMedia',
    title: 'Social Media Policy',
    description: 'Guidelines for representing the company on social media and client content handling.',
    field: 'socialMediaPolicyAccepted' as const,
  },
  {
    id: 'clientConfidentiality',
    title: 'Client Confidentiality Agreement',
    description: 'Non-disclosure of client information, data protection, and security protocols.',
    field: 'clientConfidentialityAccepted' as const,
  },
]

export function PolicyStep({ data, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [viewingPolicy, setViewingPolicy] = useState<keyof typeof POLICY_CONTENT | null>(null)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1e293b'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL()
      onChange({ signature: dataUrl })
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange({ signature: '' })
  }

  const allPoliciesAccepted = data.employeeHandbookAccepted && data.socialMediaPolicyAccepted && data.clientConfidentialityAccepted

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 border border-white/10 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Please read and accept the following policies:</h4>
        <p className="text-sm text-slate-300">
          By accepting these policies, you agree to abide by the company guidelines and maintain professional conduct.
        </p>
      </div>

      <div className="space-y-4">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-white">{policy.title}</h3>
                <p className="text-sm text-slate-300 mt-1">{policy.description}</p>
                <button
                  type="button"
                  onClick={() => setViewingPolicy(policy.id as keyof typeof POLICY_CONTENT)}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  View Full Document →
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data[policy.field]}
                  onChange={(e) => onChange({ [policy.field]: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 text-blue-400 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-200">I Accept</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="font-semibold text-white mb-4">Digital Signature</h3>
        <p className="text-sm text-slate-300 mb-4">
          Please sign below to confirm your acceptance of all policies. This signature will be stored with your profile.
        </p>

        <div className={`relative border-2 rounded-lg overflow-hidden ${
          allPoliciesAccepted ? 'border-white/20' : 'border-white/10 opacity-50'
        }`}>
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className={`w-full glass-card ${allPoliciesAccepted ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
            onMouseDown={allPoliciesAccepted ? startDrawing : undefined}
            onMouseMove={allPoliciesAccepted ? draw : undefined}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={allPoliciesAccepted ? startDrawing : undefined}
            onTouchMove={allPoliciesAccepted ? draw : undefined}
            onTouchEnd={stopDrawing}
          />
          {!allPoliciesAccepted && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
              <p className="text-sm text-slate-400">Accept all policies to sign</p>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs text-slate-400">
            Sign here
          </div>
        </div>

        {data.signature && (
          <button
            type="button"
            onClick={clearSignature}
            className="mt-2 text-sm text-red-400 hover:text-red-400"
          >
            Clear Signature
          </button>
        )}
      </div>

      <div className="bg-green-500/10 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-green-900">Almost Done!</h4>
            <p className="text-sm text-green-400 mt-1">
              Once you submit, your profile will be reviewed by HR. This typically takes 1-2 business days.
              You&apos;ll be notified via email once your profile is verified.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Document Modal */}
      {viewingPolicy && POLICY_CONTENT[viewingPolicy] && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-slate-800 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{POLICY_CONTENT[viewingPolicy].title}</h2>
                <p className="text-sm text-slate-400">Last updated: {POLICY_CONTENT[viewingPolicy].lastUpdated}</p>
              </div>
              <button
                onClick={() => setViewingPolicy(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="space-y-6">
                {POLICY_CONTENT[viewingPolicy].sections.map((section, idx) => (
                  <div key={section.title}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
                        {idx + 1}
                      </span>
                      {section.title}
                    </h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-slate-400">
                Read completely before accepting
              </p>
              <button
                onClick={() => setViewingPolicy(null)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
