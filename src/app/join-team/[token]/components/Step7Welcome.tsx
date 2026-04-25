'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle, User, ExternalLink, Mail, PartyPopper,
  Loader2, Building2, Calendar, Briefcase,
} from 'lucide-react'
import { GlassCard } from './ui'
import { formatDate } from './types'
import type { OnboardingData } from './types'

interface Step7Props {
  data: OnboardingData
  token: string
}

export default function Step7Welcome({ data, token }: Step7Props) {
  const [empId, setEmpId] = useState('')
  const [email, setEmail] = useState(data.candidate.email || '')
  const [magicLink, setMagicLink] = useState('')
  const [loading, setLoading] = useState(!data.completion.completed)
  const [error, setError] = useState('')

  useEffect(() => {
    const complete = async () => {
      try {
        const res = await fetch(`/api/employee-onboarding/${token}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const result = await res.json()
        if (!res.ok && !result.success) throw new Error(result.error || 'Failed to complete')
        if (result.empId) setEmpId(result.empId)
        if (result.email) setEmail(result.email)
        if (result.magicLink) setMagicLink(result.magicLink)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    complete()
  }, [token])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-gray-500 text-sm">Setting up your account...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Confetti CSS */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-container { position: fixed; inset: 0; pointer-events: none; z-index: 50; overflow: hidden; }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          animation: confetti-fall linear forwards;
        }
      `}</style>
      <div className="confetti-container">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'][i % 7],
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <PartyPopper className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Welcome to {data.entity.name}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 text-lg"
        >
          Your onboarding is complete. We are thrilled to have you on the team!
        </motion.p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Your Account Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {empId && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Employee ID</p>
                  <p className="text-gray-900 font-semibold">{empId}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-900 font-semibold">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="text-gray-900 font-semibold">{data.offer.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Joining Date</p>
                <p className="text-gray-900 font-semibold">{formatDate(data.offer.joiningDate)}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Portal Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your account is ready!</h3>
          <p className="text-gray-500 text-sm mb-5">
            Click below to access your employee portal. This magic link is valid for 7 days.
          </p>
          {magicLink ? (
            <a
              href={magicLink}
              className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-300"
            >
              <ExternalLink className="w-5 h-5" />
              Access Your Portal
            </a>
          ) : (
            <p className="text-sm text-gray-500">
              A magic link will be sent to your email shortly.
            </p>
          )}
        </GlassCard>
      </motion.div>

      {/* What Happens Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            What Happens Next
          </h3>
          <div className="space-y-4">
            {[
              {
                icon: Building2,
                title: 'IT Setup',
                desc: 'Your workstation, email account, and tool access will be configured before your joining date.',
              },
              {
                icon: User,
                title: 'Buddy Assignment',
                desc: 'A buddy from your team will be assigned to help you settle in during your first week.',
              },
              {
                icon: Calendar,
                title: 'Orientation Session',
                desc: 'An orientation session will be scheduled on your first day covering company culture, tools, and processes.',
              },
            ].map((item) => {
              const ItemIcon = item.icon
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ItemIcon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
