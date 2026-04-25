'use client'

import React from 'react'

// ============================================
// MULTI-STEP FORM COMPONENTS
// ============================================

interface Step {
  id: number
  title: string
  description?: string
  icon?: React.ReactNode
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
  allowNavigation?: boolean | ((step: number) => boolean)
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
  variant = 'default',
  className = '',
}: StepIndicatorProps) {
  const canNavigateTo = (step: number): boolean => {
    if (!onStepClick) return false
    if (typeof allowNavigation === 'function') {
      return allowNavigation(step)
    }
    return allowNavigation && step < currentStep
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => canNavigateTo(step.id) && onStepClick?.(step.id)}
            disabled={!canNavigateTo(step.id)}
            aria-label={`Step ${step.id}: ${step.title}`}
            aria-current={currentStep === step.id ? 'step' : undefined}
            className={`
              w-2.5 h-2.5 rounded-full transition-all duration-300
              ${currentStep === step.id
                ? 'bg-blue-500 w-6'
                : currentStep > step.id
                  ? 'bg-blue-400'
                  : 'bg-slate-600'
              }
              ${canNavigateTo(step.id) ? 'cursor-pointer hover:bg-blue-400' : 'cursor-default'}
            `}
          />
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        {/* Mobile: Show current step text */}
        <div className="sm:hidden text-center mb-4">
          <p className="text-sm text-slate-400">
            Step {currentStep} of {steps.length}
          </p>
          <p className="text-white font-medium">{steps[currentStep - 1]?.title}</p>
        </div>

        {/* Desktop: Show all steps */}
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => canNavigateTo(step.id) && onStepClick?.(step.id)}
                disabled={!canNavigateTo(step.id)}
                aria-current={currentStep === step.id ? 'step' : undefined}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                  ${canNavigateTo(step.id) ? 'cursor-pointer hover:bg-slate-700/50' : 'cursor-default'}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }
                `}>
                  {currentStep > step.id ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <nav className={`${className}`} aria-label="Progress">
      {/* Mobile: Horizontal scrollable */}
      <div className="overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
        <ol className="flex items-center min-w-max sm:min-w-0">
          {steps.map((step, index) => (
            <li key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              <button
                onClick={() => canNavigateTo(step.id) && onStepClick?.(step.id)}
                disabled={!canNavigateTo(step.id)}
                aria-current={currentStep === step.id ? 'step' : undefined}
                className={`
                  group flex flex-col items-center text-center
                  ${canNavigateTo(step.id) ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <div className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${currentStep === step.id
                    ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                    : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                  }
                `}>
                  {step.icon ? (
                    step.icon
                  ) : currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <span className={`
                  mt-2 text-xs font-medium whitespace-nowrap
                  ${currentStep === step.id
                    ? 'text-blue-400'
                    : currentStep > step.id
                      ? 'text-green-400'
                      : 'text-slate-400'
                  }
                `}>
                  {step.title}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-xs text-slate-400 mt-0.5 max-w-[100px]">
                    {step.description}
                  </span>
                )}
              </button>

              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className={`
                    h-0.5 transition-all duration-500
                    ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'}
                  `} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

// ============================================
// STEP CONTENT WRAPPER
// ============================================

interface StepContentProps {
  step: number
  currentStep: number
  children: React.ReactNode
  animationDirection?: 'left' | 'right'
}

export function StepContent({
  step,
  currentStep,
  children,
  animationDirection = 'right',
}: StepContentProps) {
  if (step !== currentStep) return null

  return (
    <div
      className={`animate-in fade-in duration-300 ${
        animationDirection === 'right' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'
      }`}
    >
      {children}
    </div>
  )
}

// ============================================
// STEP NAVIGATION BUTTONS
// ============================================

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSubmit?: () => void
  isLoading?: boolean
  canProceed?: boolean
  previousLabel?: string
  nextLabel?: string
  submitLabel?: string
  showSkip?: boolean
  onSkip?: () => void
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isLoading = false,
  canProceed = true,
  previousLabel = 'Back',
  nextLabel = 'Continue',
  submitLabel = 'Submit',
  showSkip = false,
  onSkip,
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-700">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isLoading}
            className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {previousLabel}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showSkip && onSkip && !isLastStep && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="px-4 py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !canProceed}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                {submitLabel}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isLoading || !canProceed}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                {nextLabel}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================
// FORM SUMMARY CARD
// ============================================

interface SummaryItem {
  label: string
  value: string | string[] | boolean
  type?: 'text' | 'list' | 'boolean'
}

interface SummarySection {
  title: string
  items: SummaryItem[]
}

interface FormSummaryProps {
  sections: SummarySection[]
  onEdit?: (sectionIndex: number) => void
  className?: string
}

export function FormSummary({
  sections,
  onEdit,
  className = '',
}: FormSummaryProps) {
  const formatValue = (item: SummaryItem): React.ReactNode => {
    if (item.type === 'boolean') {
      return item.value ? (
        <span className="text-green-400">Yes</span>
      ) : (
        <span className="text-red-400">No</span>
      )
    }

    if (Array.isArray(item.value)) {
      if (item.value.length === 0) {
        return <span className="text-slate-400">None selected</span>
      }
      return (
        <div className="flex flex-wrap gap-1">
          {item.value.map((v, i) => (
            <span key={`${v}-${i}`} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
              {v}
            </span>
          ))}
        </div>
      )
    }

    return item.value || <span className="text-slate-400">Not provided</span>
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {sections.map((section, sectionIndex) => (
        <div key={section.title} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
            <h4 className="font-medium text-white">{section.title}</h4>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(sectionIndex)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>
          <div className="p-4">
            <dl className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex flex-col sm:flex-row sm:items-start">
                  <dt className="text-sm text-slate-400 sm:w-1/3 sm:flex-shrink-0">{item.label}</dt>
                  <dd className="text-sm text-white sm:w-2/3 mt-1 sm:mt-0">{formatValue(item)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// FORM LAYOUT
// ============================================

interface FormLayoutProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

export function FormLayout({
  children,
  maxWidth = 'lg',
  className = '',
}: FormLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  )
}
