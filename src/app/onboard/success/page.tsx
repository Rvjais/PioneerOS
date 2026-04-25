import Link from 'next/link'

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="glass-card rounded-2xl shadow-none p-8">
          {/* Success Animation */}
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Onboarding Complete!
          </h1>

          <p className="text-slate-300 mb-6">
            Thank you for providing your information. Our team is now preparing your Service Level Agreement.
          </p>

          <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-400 space-y-2 list-decimal list-inside">
              <li>You&apos;ll receive an email with your SLA within 24-48 hours</li>
              <li>Review and digitally sign the agreement</li>
              <li>Complete the initial payment</li>
              <li>Your project goes live!</li>
            </ol>
          </div>

          <div className="bg-slate-900/40 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-300">
              Have questions? Contact us at
            </p>
            <a href="mailto:accounts@brandingpioneers.com" className="text-blue-400 font-medium hover:underline">
              accounts@brandingpioneers.com
            </a>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
