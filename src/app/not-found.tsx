import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
          <span className="text-white font-extrabold text-4xl">P</span>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          404
        </h1>

        <h2 className="text-2xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-none"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-all"
          >
            Back to Login
          </Link>
        </div>

        {/* Help Link */}
        <p className="mt-8 text-sm text-slate-400">
          Need help?{' '}
          <a href="mailto:support@brandingpioneers.in" className="text-blue-400 hover:text-blue-300">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
