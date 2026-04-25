'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, AlertCircle, Clock, FileText, CreditCard, UserCheck,
  Rocket, Sparkles, Shield, ChevronRight
} from 'lucide-react'
import Step1ConfirmDetails from './steps/Step1ConfirmDetails'
import Step2SignSLA from './steps/Step2SignSLA'
import Step3PaymentInvoice from './steps/Step3PaymentInvoice'
import Step4AccountOnboarding from './steps/Step4AccountOnboarding'
import Step5AwaitingActivation from './steps/Step5AwaitingActivation'
import Step6Activated from './steps/Step6Activated'

interface OnboardingData {
  id: string
  token: string
  status: string
  currentStep: number
  isExpired: boolean
  steps: Array<{ id: number; title: string; description: string }>
  prospect: {
    name: string
    email: string
    phone: string
    company: string | null
  }
  client: {
    name: string
    email: string
    phone: string
    company: string
    gst: string
    address: string
    city: string
    state: string
    pincode: string
  }
  services: Array<{ serviceId: string; name: string; price?: number }>
  basePrice: number
  gstPercentage: number
  gstAmount: number
  totalPrice: number
  advanceAmount: number
  advancePercentage: number
  allowServiceModification?: boolean
  contractDuration: string | null
  paymentTerms: string | null
  entity: {
    id: string
    name: string
    legalName: string
    address: string
    gstin: string
    bank: {
      name: string
      account: string
      ifsc: string
      branch: string
      upi?: string
    }
  }
  sla: {
    accepted: boolean
    acceptedAt: string | null
    signerName: string | null
  }
  invoice: {
    generated: boolean
    generatedAt: string | null
    number: string | null
  }
  payment: {
    confirmed: boolean
    confirmedAt: string | null
    method: string | null
    reference: string | null
  }
  accountOnboarding: {
    completed: boolean
    completedAt: string | null
  }
  createdAt: string
  expiresAt: string
}

interface OnboardingWizardProps {
  initialData: OnboardingData
}

const stepConfig = [
  { id: 1, title: 'Confirm Details', icon: FileText, description: 'Verify your information' },
  { id: 2, title: 'Service Agreement', icon: Shield, description: 'Review & sign SLA' },
  { id: 3, title: 'Payment', icon: CreditCard, description: 'Complete payment' },
  { id: 4, title: 'Account Setup', icon: UserCheck, description: 'Setup your account' },
  { id: 5, title: 'Activation', icon: Clock, description: 'Awaiting activation' },
  { id: 6, title: 'Complete', icon: Rocket, description: 'You\'re all set!' },
]

export default function OnboardingWizard({ initialData }: OnboardingWizardProps) {
  const [data, setData] = useState<OnboardingData>(initialData)
  const [activeStep, setActiveStep] = useState(initialData.currentStep)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Handle step completion
  const handleStepComplete = (step: number, newData?: Partial<OnboardingData>) => {
    if (newData) {
      setData(prev => ({ ...prev, ...newData }))
    }
    const nextStep = Math.min(step + 1, 6)
    setActiveStep(nextStep)
    setData(prev => ({ ...prev, currentStep: nextStep }))
  }

  // Refresh data from server
  const refreshData = async () => {
    try {
      setRefreshError(null)
      const res = await fetch(`/api/onboarding/${data.token}`)
      if (res.ok) {
        const newData = await res.json()
        setData(prev => ({
          ...prev,
          ...newData,
          currentStep: newData.currentStep,
        }))
        setActiveStep(newData.currentStep)
      } else {
        setRefreshError('Failed to refresh data. Please try again.')
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
      setRefreshError('Unable to connect to server. Please check your connection and try again.')
    }
  }

  // Calculate progress percentage
  const progressPercentage = Math.round(((data.currentStep - 1) / 5) * 100)

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
            This onboarding link has expired. Please contact the team for a new link.
          </p>
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Expired on: {new Date(data.expiresAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src="/bp-logo-full.png"
                  alt={data.entity.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{data.entity.name}</h1>
                <p className="text-sm text-gray-500 flex items-center">
                  Client Onboarding
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Contract Value</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(data.totalPrice)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span className="text-orange-600 font-medium">{progressPercentage}% Complete</span>
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

      {refreshError && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{refreshError}</p>
            </div>
            <button
              onClick={() => { setRefreshError(null); refreshData() }}
              className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Progress Steps */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-32">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                Your Journey
              </h2>

              <nav className="space-y-1">
                {stepConfig.map((step, index) => {
                  const StepIcon = step.icon
                  const isCompleted = data.currentStep > step.id
                  const isCurrent = activeStep === step.id
                  const isClickable = step.id <= data.currentStep
                  const isLast = index === stepConfig.length - 1

                  return (
                    <div key={step.id} className="relative">
                      {/* Connecting Line */}
                      {!isLast && (
                        <div className="absolute left-5 top-12 w-0.5 h-8 -ml-px">
                          <div className={`w-full h-full ${isCompleted ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                      )}

                      <button
                        onClick={() => isClickable && setActiveStep(step.id)}
                        disabled={!isClickable}
                        className={`w-full flex items-start space-x-4 p-3 rounded-xl transition-all duration-300 ${
                          isCurrent
                            ? 'bg-orange-50 border border-orange-200'
                            : isCompleted
                            ? 'hover:bg-gray-50'
                            : 'opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : isCurrent
                              ? 'bg-orange-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <StepIcon className="w-5 h-5 text-white" />
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-gray-900' : isCompleted ? 'text-emerald-600' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {step.description}
                          </p>
                        </div>

                        {isCurrent && (
                          <ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </nav>

              {/* Services Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Selected Services
                </h3>
                <div className="space-y-2">
                  {data.services.map(service => (
                    <div
                      key={service.serviceId}
                      className="flex items-center text-sm bg-gray-100 rounded-lg p-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-3" />
                      <span className="text-gray-700">{service.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {data.contractDuration?.replace(/_/g, ' ').replace('MONTHS', 'Mo') || '12 Mo'}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Advance</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    {formatCurrency(data.advanceAmount)}
                  </p>
                </div>
              </div>
            </div>
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
                    onComplete={(newData) => handleStepComplete(1, newData)}
                  />
                )}
                {activeStep === 2 && (
                  <Step2SignSLA
                    data={data}
                    onComplete={(newData) => handleStepComplete(2, newData)}
                  />
                )}
                {activeStep === 3 && (
                  <Step3PaymentInvoice
                    data={data}
                    onComplete={(newData) => handleStepComplete(3, newData)}
                    onRefresh={refreshData}
                  />
                )}
                {activeStep === 4 && (
                  <Step4AccountOnboarding
                    data={data}
                    onComplete={(newData) => handleStepComplete(4, newData)}
                  />
                )}
                {activeStep === 5 && (
                  <Step5AwaitingActivation
                    data={data}
                    onRefresh={refreshData}
                  />
                )}
                {activeStep === 6 && (
                  <Step6Activated data={data} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
