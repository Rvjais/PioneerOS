'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface SuccessData {
  empId?: string
  email?: string
  name?: string
}

export default function EmployeeOnboardingSuccess() {
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([])
  const [successData, setSuccessData] = useState<SuccessData | null>(null)

  useEffect(() => {
    // Generate confetti on mount
    const colors = ['#10b981', '#22c55e', '#34d399', '#6ee7b7', '#a7f3d0']
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setConfetti(pieces)

    // Get success data from sessionStorage
    const stored = sessionStorage.getItem('onboarding_success')
    if (stored) {
      try {
        setSuccessData(JSON.parse(stored))
        sessionStorage.removeItem('onboarding_success')
      } catch (e) {
        console.error('Failed to parse success data', e)
      }
    }

    // Clear localStorage
    localStorage.removeItem('employee_onboarding_v3')
    localStorage.removeItem('employee_onboarding_v2')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      <div className="max-w-lg text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          {successData?.name ? `Welcome, ${successData.name.split(' ')[0]}!` : 'Welcome to the Team!'}
        </h1>
        {successData?.empId && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mb-4">
            <span className="text-emerald-700 font-medium">Your Employee ID:</span>
            <span className="bg-emerald-500 text-white px-3 py-0.5 rounded-full font-bold text-sm">{successData.empId}</span>
          </div>
        )}
        <p className="text-lg text-slate-300 mb-8">
          Your onboarding form has been submitted successfully. Our HR team will verify your documents and get in touch soon.
        </p>

        {/* What's Next Card */}
        <div className="glass-card border border-white/10 rounded-2xl p-6 mb-8 text-left shadow-none shadow-slate-200/50">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            What happens next?
          </h2>
          <div className="space-y-4">
            {[
              { done: true, label: 'Onboarding form submitted', desc: 'Your information is with HR' },
              { done: false, label: 'Document verification', desc: 'HR will verify your documents (1-2 business days)' },
              { done: false, label: 'Account activation', desc: 'You\'ll receive your login credentials via email' },
              { done: false, label: 'IT setup', desc: 'Email, Slack, and system access will be configured' },
              { done: false, label: 'First day orientation', desc: 'Your buddy will welcome you on Day 1' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? 'bg-emerald-500' : 'bg-white/10'
                }`}>
                  {step.done ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${step.done ? 'text-emerald-600' : 'text-slate-200'}`}>{step.label}</p>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium">Questions?</p>
              <p className="text-sm text-blue-400">Contact HR at <span className="font-medium">hr@brandingpioneers.in</span></p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl shadow-none shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </Link>
          <a
            href="mailto:hr@brandingpioneers.in"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card border border-white/10 text-slate-200 font-medium rounded-xl hover:bg-slate-900/40 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact HR
          </a>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}
