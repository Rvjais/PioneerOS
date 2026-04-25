'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ComplianceStatus {
  allowed: boolean
  redirect?: string
  reason?: string
  message?: string
  compliance: {
    daily: { filled: boolean; isLate: boolean }
    tactical: { required: boolean; filled: boolean; deadline: string }
    strategic: { required: boolean; filled: boolean; deadline: string }
  }
}

interface MeetingBlockerProps {
  children: React.ReactNode
}

// Pages that don't require meeting compliance
const EXEMPT_PATHS = [
  '/login',
  '/logout',
  '/meetings',
  '/api',
  '/onboarding',
  '/_next',
  '/favicon'
]

export function MeetingBlocker({ children }: MeetingBlockerProps) {
  const pathname = usePathname()
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if current path is exempt
  const isExemptPath = EXEMPT_PATHS.some(path => pathname?.startsWith(path))

  useEffect(() => {
    if (isExemptPath) {
      setLoading(false)
      return
    }

    checkCompliance()
  }, [pathname, isExemptPath])

  const checkCompliance = async () => {
    try {
      const res = await fetch('/api/meetings/compliance')
      if (res.ok) {
        const data: ComplianceStatus = await res.json()
        setCompliance(data)
      }
    } catch (error) {
      console.error('Failed to check compliance:', error)
      // Don't block on errors - let users proceed
    } finally {
      setLoading(false)
    }
  }

  // Show tactical meeting reminder banner (non-blocking)
  const tacticalBanner = compliance && compliance.compliance.tactical.required && !compliance.compliance.tactical.filled && !isExemptPath && (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 px-4 py-2 text-center text-sm font-medium">
      <span>Monthly tactical report due by {compliance.compliance.tactical.deadline}. </span>
      <a href="/meetings/tactical" className="underline font-bold hover:no-underline">
        Complete Now
      </a>
    </div>
  )

  return (
    <>
      {tacticalBanner && <div className="pt-10">{children}</div>}
      {!tacticalBanner && children}
    </>
  )
}
