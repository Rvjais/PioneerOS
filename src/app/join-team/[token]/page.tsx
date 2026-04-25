'use client'

import { Suspense, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Loader2, Building2, Sparkles } from 'lucide-react'
import PageGuide from '@/client/components/ui/PageGuide'

import type { OnboardingData } from './components/types'
import { formatDate } from './components/types'
import StepSidebar from './components/StepSidebar'
import Step1ConfirmDetails from './components/Step1ConfirmDetails'
import Step2ReviewOffer from './components/Step2ReviewOffer'
import Step3SignNDA from './components/Step3SignNDA'
import Step4SignBond from './components/Step4SignBond'
import Step5CompanyPolicies from './components/Step5CompanyPolicies'
import Step6SubmitDocuments from './components/Step6SubmitDocuments'
import Step7Welcome from './components/Step7Welcome'

// ============================================
// MAIN WIZARD
// ============================================

function JoinTeamWizard() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<OnboardingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/employee-onboarding/${token}`)
        if (res.status === 404) {
          setError('This onboarding link is not valid. Please contact HR for a new link.')
          return
        }
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Failed to load')
        setData(result)
        setActiveStep(result.currentStep)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load onboarding data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  // Warn users about unsaved changes when navigating away mid-form
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (data && activeStep < 7 && activeStep > 1) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [data, activeStep])

  const handleStepComplete = (completedStep: number) => {
    const nextStep = Math.min(completedStep + 1, 7)
    setActiveStep(nextStep)
    setData((prev) =>
      prev ? { ...prev, currentStep: nextStep } : prev
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your onboarding...</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md w-full text-center shadow-lg"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Oops!</h1>
          <p className="text-gray-600">{error || 'Something went wrong. Please try again.'}</p>
        </motion.div>
      </div>
    )
  }

  // Expired state
  if (data.isExpired) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md w-full text-center shadow-lg"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Link Expired</h1>
          <p className="text-gray-600 mb-6">
            This onboarding link has expired. Please contact HR for a new link.
          </p>
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Expired on: {formatDate(data.expiresAt)}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  const progressPercentage = Math.round(((data.currentStep - 1) / 6) * 100)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{data.entity.name}</h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-orange-500" />
                  Employee Onboarding
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Welcome</p>
              <p className="text-lg font-bold text-gray-900">
                {data.candidate.name}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span className="text-orange-500 font-medium">{progressPercentage}% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageGuide
          title="Team Onboarding"
          description="Complete your onboarding to join the team. You'll sign your NDA, bond, and submit documents."
          pageKey="join-team-form"
          steps={[
            { label: 'Personal info', description: 'Confirm your personal details' },
            { label: 'NDA signing', description: 'Review and sign the non-disclosure agreement' },
            { label: 'Bond agreement', description: 'Review and sign the employment bond' },
            { label: 'Policy acknowledgment', description: 'Acknowledge company policies' },
            { label: 'Document upload', description: 'Upload required documents' },
            { label: 'Complete', description: 'Finalize your onboarding' },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <StepSidebar
              data={data}
              activeStep={activeStep}
              onStepClick={setActiveStep}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeStep === 1 && (
                  <Step1ConfirmDetails
                    data={data}
                    token={token}
                    onComplete={() => handleStepComplete(1)}
                  />
                )}
                {activeStep === 2 && (
                  <Step2ReviewOffer
                    data={data}
                    onComplete={() => handleStepComplete(2)}
                  />
                )}
                {activeStep === 3 && (
                  <Step3SignNDA
                    data={data}
                    token={token}
                    onComplete={() => handleStepComplete(3)}
                  />
                )}
                {activeStep === 4 && (
                  <Step4SignBond
                    data={data}
                    token={token}
                    onComplete={() => handleStepComplete(4)}
                  />
                )}
                {activeStep === 5 && (
                  <Step5CompanyPolicies
                    data={data}
                    token={token}
                    onComplete={() => handleStepComplete(5)}
                  />
                )}
                {activeStep === 6 && (
                  <Step6SubmitDocuments
                    data={data}
                    token={token}
                    onComplete={() => handleStepComplete(6)}
                  />
                )}
                {activeStep === 7 && (
                  <Step7Welcome data={data} token={token} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PAGE EXPORT WITH SUSPENSE
// ============================================

export default function JoinTeamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      }
    >
      <JoinTeamWizard />
    </Suspense>
  )
}
