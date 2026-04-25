'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function InternHandbookPage() {
  const router = useRouter()
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAcknowledge = async () => {
    if (!acknowledged) return
    setLoading(true)

    try {
      const res = await fetch('/api/intern/acknowledge-handbook', {
        method: 'POST',
      })

      if (res.ok) {
        router.push('/intern')
      } else {
        toast.error('Failed to acknowledge handbook')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="mb-6">
        <Link href="/intern" className="text-blue-400 hover:text-blue-400 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="glass-card rounded-xl border border-white/10 p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Intern Handbook</h1>
        <p className="text-slate-400 mb-8">Please read all sections carefully before acknowledging.</p>

        <div className="space-y-8 text-slate-200">
          {/* Onboarding */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Onboarding</h2>
            <p>We&apos;re excited to have you on board! During your first few days, you will complete the following:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Documentation and ID verification</li>
              <li>System and tool setup</li>
              <li>Team introductions</li>
              <li>Buddy/Mentor assignment</li>
            </ul>
          </section>

          {/* Duration */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Duration</h2>
            <p>The internship period is <strong>3 to 6 months</strong>, depending on project requirements and your performance. Extensions are possible based on organizational needs.</p>
          </section>

          {/* Stipend */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Stipend Structure</h2>
            <div className="bg-slate-900/40 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Paid Intern (Own Laptop)</td>
                    <td className="py-2 font-medium">Rs. 10,000/month</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Paid Intern (Company Laptop)</td>
                    <td className="py-2 font-medium">Rs. 8,000/month</td>
                  </tr>
                  <tr>
                    <td className="py-2">New/Unpaid Intern</td>
                    <td className="py-2 font-medium">Unpaid (for initial period)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Leave Policy */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Leave Policy</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800">Important:</p>
              <ul className="list-disc pl-6 mt-2 text-yellow-700 space-y-1">
                <li>Interns are <strong>not entitled to regular leaves</strong> during the internship</li>
                <li>Only <strong>medical emergencies</strong> with valid documentation will be considered</li>
                <li>Unauthorized absences may affect your evaluation and certificate</li>
              </ul>
            </div>
          </section>

          {/* Work Environment */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Work Environment</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Internship is <strong>office-based</strong></li>
              <li>Remote work is only allowed during emergencies with prior approval</li>
              <li>Regular office hours must be followed</li>
              <li>Biometric attendance is mandatory</li>
            </ul>
          </section>

          {/* Training */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Training & Mentorship</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You will be assigned a mentor and a buddy</li>
              <li>Mandatory training modules must be completed</li>
              <li>Learning resources are available on the platform</li>
              <li>Ask questions and seek guidance proactively</li>
            </ul>
          </section>

          {/* Performance */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Performance Reviews</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Monthly reviews</strong> will be conducted</li>
              <li>Feedback will be provided on your work quality and behavior</li>
              <li>Performance affects stipend decisions and conversion eligibility</li>
            </ul>
          </section>

          {/* Exit */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Exit Procedure</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Complete handover of all tasks and documents</li>
              <li>Return company assets (laptop, ID card, etc.)</li>
              <li>Exit interview with HR</li>
              <li>Certificate issued upon successful completion</li>
              <li>LinkedIn recommendation based on performance</li>
            </ul>
          </section>

          {/* Conduct */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Professional Conduct</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintain professional behavior at all times</li>
              <li>Respect confidentiality of client and company information</li>
              <li>Follow dress code guidelines</li>
              <li>Be punctual for meetings and deadlines</li>
              <li>Communicate professionally on all channels</li>
            </ul>
          </section>

          {/* Tools */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Communication Tools</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>WhatsApp:</strong> Quick updates and team communication</li>
              <li><strong>Google Meet:</strong> Client calls and internal meetings</li>
              <li><strong>Pioneer OS:</strong> Task tracking, project management, and reporting</li>
              <li><strong>Email:</strong> Formal communications</li>
            </ul>
          </section>
        </div>

        {/* Acknowledgement */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-white/20 text-blue-400 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-200">
              I have read and understood all the policies mentioned in this Intern Handbook.
              I agree to abide by these guidelines during my internship period at the organization.
            </span>
          </label>

          <button
            onClick={handleAcknowledge}
            disabled={!acknowledged || loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'I Acknowledge & Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
