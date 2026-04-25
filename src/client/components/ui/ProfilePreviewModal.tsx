'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface UserProfileData {
  id: string
  name: string
  image?: string | null
  subtitle?: string | null
  email?: string | null
  phone?: string | null
  department?: string | null
  role?: string | null
  empId?: string | null
}

interface ClientProfileData {
  id: string
  name: string
  image?: string | null
  subtitle?: string | null
  email?: string | null
  phone?: string | null
  status?: string | null
  monthlyFee?: number | null
}

interface ProfilePreviewModalProps {
  open: boolean
  onClose: () => void
  type: 'user' | 'client'
  data: UserProfileData | ClientProfileData
}

/**
 * ProfilePreviewModal - Quick profile preview popup
 *
 * Shows a brief profile overview with:
 * - Large profile picture/logo
 * - Name and subtitle
 * - Quick info (email, phone, department)
 * - Action buttons (View Profile, Message)
 */
export function ProfilePreviewModal({
  open,
  onClose,
  type,
  data
}: ProfilePreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [imgError, setImgError] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) {
      setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  const showImage = data.image && !imgError

  // Generate initials and color
  const initials = data.name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const colors = [
    'from-blue-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-indigo-500 to-blue-600',
    'from-red-500 to-pink-600',
  ]
  let hash = 0
  for (let i = 0; i < data.name.length; i++) {
    hash = data.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const gradientColor = colors[Math.abs(hash) % colors.length]

  const profileLink = type === 'user' ? `/team/${data.id}` : `/clients/${data.id}`
  const messageLink = type === 'user' ? `/mash?dm=${data.id}` : `/clients/${data.id}/messages`

  const isUser = type === 'user'
  const userData = isUser ? (data as UserProfileData) : null
  const clientData = !isUser ? (data as ClientProfileData) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className="glass-card dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-scaleIn"
      >
        {/* Header with gradient background */}
        <div className={`h-20 bg-gradient-to-br ${gradientColor}`} />

        {/* Profile picture overlapping header */}
        <div className="px-6 -mt-12">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-800 ${
              showImage ? 'glass-card' : `bg-gradient-to-br ${gradientColor}`
            }`}>
              {showImage ? (
                <img
                  src={data.image!}
                  alt={data.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            {/* Status indicator for users */}
            {isUser && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
            )}
          </div>
        </div>

        {/* Profile info */}
        <div className="px-6 pt-3 pb-4">
          <h3 className="text-xl font-bold text-white dark:text-white">
            {data.name}
          </h3>
          {data.subtitle && (
            <p className="text-sm text-slate-400 dark:text-slate-400 mt-0.5">
              {data.subtitle}
            </p>
          )}

          {/* User-specific info */}
          {isUser && userData && (
            <div className="mt-4 space-y-2">
              {userData.empId && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span className="text-slate-300 dark:text-slate-300">{userData.empId}</span>
                </div>
              )}
              {userData.department && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-slate-300 dark:text-slate-300">{userData.department}</span>
                </div>
              )}
              {userData.email && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-300 dark:text-slate-300 truncate">{userData.email}</span>
                </div>
              )}
              {userData.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-slate-300 dark:text-slate-300">{userData.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Client-specific info */}
          {!isUser && clientData && (
            <div className="mt-4 space-y-2">
              {clientData.status && (
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    clientData.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                    clientData.status === 'ONBOARDING' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-800/50 text-slate-200'
                  }`}>
                    {clientData.status}
                  </span>
                </div>
              )}
              {clientData.monthlyFee && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-300 dark:text-slate-300">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(clientData.monthlyFee)}/mo
                  </span>
                </div>
              )}
              {clientData.email && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-300 dark:text-slate-300 truncate">{clientData.email}</span>
                </div>
              )}
              {clientData.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-slate-300 dark:text-slate-300">{clientData.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <Link
            href={profileLink}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl text-center transition-colors"
            onClick={onClose}
          >
            View Profile
          </Link>
          {isUser && (
            <Link
              href={messageLink}
              className="px-4 py-2.5 bg-slate-800/50 hover:bg-white/10 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-200 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800/50 hover:bg-white/10 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-200 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ProfilePreviewModal
