'use client'

import { motion } from 'framer-motion'
import { CheckCircle, ChevronRight } from 'lucide-react'
import { STEP_CONFIG, formatCurrency } from './types'
import type { OnboardingData } from './types'

interface StepSidebarProps {
  data: OnboardingData
  activeStep: number
  onStepClick: (step: number) => void
}

export default function StepSidebar({ data, activeStep, onStepClick }: StepSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-32">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
        Onboarding Steps
      </h2>

      <nav className="space-y-1">
        {STEP_CONFIG.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = data.currentStep > step.id
          const isCurrent = activeStep === step.id
          const isClickable = step.id <= data.currentStep
          const isLast = index === STEP_CONFIG.length - 1

          return (
            <div key={step.id} className="relative">
              {/* Connecting Line */}
              {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-8 -ml-px">
                  <div
                    className={`w-full h-full ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}

              <button
                onClick={() => isClickable && onStepClick(step.id)}
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
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-xl bg-orange-500/30"
                    />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-gray-900'
                        : isCompleted
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Step {step.id} of 7</p>
                </div>

                {isCurrent && (
                  <ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0 mt-1" />
                )}
              </button>
            </div>
          )
        })}
      </nav>

      {/* Offer Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Offer Summary
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Position</span>
            <span className="text-gray-900 font-medium">{data.offer.position}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Department</span>
            <span className="text-gray-900 font-medium">{data.offer.department}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">CTC</span>
            <span className="text-emerald-600 font-semibold">
              {formatCurrency(data.offer.salary)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
