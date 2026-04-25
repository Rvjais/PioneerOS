import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { LogoutButton } from './LogoutButton'

export default async function PendingVerificationPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  })

  if (!user) {
    redirect('/login')
  }

  // If already verified, go to dashboard
  if (user.profileCompletionStatus === 'VERIFIED') {
    redirect('/')
  }

  // If still incomplete, go back to wizard
  if (user.profileCompletionStatus === 'INCOMPLETE') {
    redirect('/profile-wizard')
  }

  return (
    <div className="w-full max-w-lg text-center">
      <div className="glass-card rounded-2xl shadow-none p-8">
        {/* Animated hourglass */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Verification in Progress
        </h1>

        <p className="text-slate-300 mb-6">
          Thank you for completing your profile, <span className="font-semibold">{user.firstName}</span>!
          Our HR team is reviewing your information.
        </p>

        <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-400 text-left space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>HR will verify your documents within 1-2 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>You&apos;ll receive an email once verification is complete</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Tool access credentials will be sent to your email</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Awaiting HR verification...</span>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <p className="text-sm text-slate-400">
            Need help? Contact HR at <a href="mailto:hr@brandingpioneers.in" className="text-blue-400 hover:underline">hr@brandingpioneers.in</a>
          </p>
          <LogoutButton />
        </div>
      </div>

      {/* Submitted info summary */}
      <div className="mt-6 bg-white/50 backdrop-blur-sm backdrop-blur rounded-lg p-4">
        <p className="text-sm text-slate-300">
          Submitted on {new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Employee ID: {user.empId}
        </p>
      </div>
    </div>
  )
}
