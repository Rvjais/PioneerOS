'use client'

import { useState } from 'react'

interface InfoTooltipProps {
  title: string
  steps: string[]
  tips?: string[]
  position?: 'left' | 'right' | 'center'
}

/**
 * Information tooltip component
 * Shows a help icon that displays instructions on hover
 * Written in simple language for easy understanding
 */
export function InfoTooltip({ title, steps, tips, position = 'right' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    left: 'right-0',
    right: 'left-0',
    center: 'left-1/2 -translate-x-1/2'
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className="w-6 h-6 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 flex items-center justify-center transition-all duration-200 text-sm font-medium border border-blue-500/30"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Help information"
      >
        i
      </button>

      {isVisible && (
        <div
          className={`absolute top-8 ${positionClasses[position]} z-50 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-800 border-l border-t border-slate-600 transform rotate-45" />

          {/* Title */}
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {title}
          </h4>

          {/* Steps */}
          <div className="space-y-2 mb-3">
            {steps.map((step, index) => (
              <div key={`step-${index}`} className="flex gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-slate-300">{step}</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="border-t border-slate-700 pt-3 mt-3">
              <p className="text-xs text-amber-400 font-medium mb-1">Pro Tips:</p>
              {tips.map((tip, index) => (
                <p key={`tip-${index}`} className="text-xs text-slate-400 flex gap-1 mb-1">
                  <span>•</span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Page header with integrated help tooltip
 */
interface PageHeaderProps {
  title: string
  subtitle?: string
  helpTitle: string
  helpSteps: string[]
  helpTips?: string[]
  children?: React.ReactNode
}

export function PageHeader({ title, subtitle, helpTitle, helpSteps, helpTips, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <InfoTooltip
              title={helpTitle}
              steps={helpSteps}
              tips={helpTips}
            />
          </div>
          {subtitle && (
            <p className="text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Section header with help tooltip
 */
interface SectionHeaderProps {
  title: string
  helpText: string
  className?: string
}

export function SectionHeader({ title, helpText, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <InfoTooltip
        title={`About ${title}`}
        steps={[helpText]}
      />
    </div>
  )
}

export default InfoTooltip
