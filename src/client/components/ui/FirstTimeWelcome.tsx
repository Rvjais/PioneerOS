'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FirstTimeWelcomeProps {
  userName: string
  userRole: string
  onClose: () => void
}

/**
 * FirstTimeWelcome - Modal shown to first-time users
 *
 * Shows on first login.
 * Tracks in localStorage so it only shows once.
 */
export default function FirstTimeWelcome({ userName, userRole, onClose }: FirstTimeWelcomeProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('welcome-seen')
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('welcome-seen', 'true')
    setShow(false)
    onClose()
  }

  const roleFeatures: Record<string, string[]> = {
    SUPER_ADMIN: ['Full admin panel with user management', 'System settings and audit logs', 'Impersonate any user for debugging', 'All module access'],
    MANAGER: ['Team management and approvals', 'Client oversight and escalations', 'Performance reviews and goal setting', 'Department reports and KPIs'],
    EMPLOYEE: ['Daily task planner and time tracking', 'Client deliverables and work logs', 'Learning hours and growth score', 'Team chat and meetings'],
    HR: ['Recruitment and hiring pipeline', 'Attendance and leave management', 'Performance appraisals', 'Employee onboarding and offboarding'],
    SALES: ['Lead pipeline and CRM', 'Deal tracking and proposals', 'Client outreach', 'Sales daily planning'],
    ACCOUNTS: ['Invoice creation and tracking', 'Payment collections and follow-ups', 'Bank reconciliation', 'Expense management'],
    FREELANCER: ['Work report submission', 'Payment tracking', 'Daily task planning', 'Team directory access'],
    INTERN: ['Assigned tasks and learning', 'Daily planner', 'Intern handbook', 'Team directory'],
  }

  const features = roleFeatures[userRole] || roleFeatures['EMPLOYEE'] || []

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-[10000] p-4"
          >
            <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-1">
                  Welcome, {userName}!
                </h2>
                <p className="text-white/80 text-sm">
                  Let&apos;s get you started with Pioneer OS
                </p>
              </div>

              <div className="p-6">
                {/* Role info */}
                <div className="mb-5">
                  <p className="text-sm text-slate-400 mb-3">
                    Based on your role as <span className="text-purple-400 font-medium">{userRole.replace(/_/g, ' ')}</span>, here&apos;s what you can do:
                  </p>
                  <div className="space-y-2">
                    {features.map((feature, i) => (
                      <div key={`feature-${feature}-${i}`} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help system info */}
                <div className="bg-slate-700/30 rounded-lg p-4 mb-5">
                  <p className="text-sm text-white font-medium mb-2">Finding help throughout the app:</p>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-500/30">i</span>
                      Blue info buttons explain what each field or section does
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">?</span>
                      Orange guide banners appear on your first visit to each page
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
