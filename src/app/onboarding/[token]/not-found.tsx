import Link from 'next/link'
import { FileQuestion, ArrowLeft, Mail } from 'lucide-react'

export default function OnboardingNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-none p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Link Not Found
        </h1>

        <p className="text-gray-300 mb-6">
          This onboarding link doesn&apos;t exist or may have been removed.
          Please check with the person who shared this link.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Homepage
          </Link>

          <a
            href="mailto:support@brandingpioneers.in"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 border border-white/20 text-gray-200 rounded-lg hover:bg-gray-900/40 transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
