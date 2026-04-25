'use client'

import { useState } from 'react'
import { getCharterByDepartment, type Department, type CaseStudy, type CharterData } from '@/shared/constants/communicationCharter'

interface Props {
  initialDepartment: Department
  canViewAll: boolean
  allDepartments: Department[]
  userName: string
}

const departmentLabels: Record<Department, string> = {
  ACCOUNTS: 'Accounts',
  SOCIAL: 'Social Media',
  SEO: 'SEO',
  ADS: 'Paid Ads',
  WEB: 'Web Development',
  HR: 'Human Resources',
  SALES: 'Sales',
  OPERATIONS: 'Operations',
}

const departmentColors: Record<Department, { bg: string; text: string; border: string }> = {
  ACCOUNTS: { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  SOCIAL: { bg: 'from-pink-500/20 to-rose-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  SEO: { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  ADS: { bg: 'from-orange-500/20 to-amber-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  WEB: { bg: 'from-purple-500/20 to-violet-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  HR: { bg: 'from-red-500/20 to-pink-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  SALES: { bg: 'from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  OPERATIONS: { bg: 'from-slate-500/20 to-gray-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
}

export function CommunicationCharterClient({ initialDepartment, canViewAll, allDepartments, userName }: Props) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department>(initialDepartment)
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'cases'>('overview')
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null)

  const charter = getCharterByDepartment(selectedDepartment)
  const colors = departmentColors[selectedDepartment]

  if (!charter) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">Charter not found for department</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{charter.title}</h1>
          <p className="text-slate-400 mt-1">{charter.subtitle}</p>
        </div>
        {canViewAll && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Department:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as Department)}
              className="px-4 py-2 glass-card border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-none"
            >
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {departmentLabels[dept]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {charter.metrics.map((metric, i) => (
          <div key={metric.label} className="glass-card rounded-xl border border-white/10 p-4 shadow-none">
            <p className="text-3xl font-bold text-white">{metric.value}</p>
            <p className="text-sm font-medium text-slate-200 mt-1">{metric.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1.5">
        {[
          { id: 'overview' as const, label: 'Overview', icon: OverviewIcon },
          { id: 'rules' as const, label: 'Guidelines', icon: RulesIcon },
          { id: 'cases' as const, label: 'Case Studies', icon: CasesIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'glass-card text-white shadow-none'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="glass-card rounded-xl border border-white/10 p-6 shadow-none">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-white">Do&apos;s</h3>
            </div>
            <ul className="space-y-3">
              {charter.dos.map((item, i) => (
                <li key={`do-${item}-${i}`} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckIcon className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="glass-card rounded-xl border border-white/10 p-6 shadow-none">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XIcon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-white">Don&apos;ts</h3>
            </div>
            <ul className="space-y-3">
              {charter.donts.map((item, i) => (
                <li key={`dont-${item}-${i}`} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XIcon className="w-3 h-3 text-red-400" />
                  </div>
                  <span className="text-sm text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {charter.sections.map((section, i) => (
            <div key={section.title} className="glass-card rounded-xl border border-white/10 p-6 shadow-none">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.rules.map((rule, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="text-xs font-medium text-slate-300 bg-white/10 px-2 py-0.5 rounded mt-0.5">
                      {j + 1}
                    </span>
                    <span className="text-sm text-slate-200">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'cases' && (
        <div className="grid md:grid-cols-3 gap-4">
          {charter.caseStudies.map((caseStudy) => (
            <button
              key={caseStudy.id}
              onClick={() => setSelectedCase(caseStudy)}
              className="text-left glass-card rounded-xl border border-white/10 p-5 shadow-none hover:shadow-none hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <CasesIcon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase">Case Study</span>
              </div>
              <h4 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {caseStudy.title}
              </h4>
              <p className="text-sm text-slate-400 line-clamp-3">{caseStudy.scenario}</p>
              <div className="mt-4 flex items-center text-sm text-blue-400 font-medium">
                View Full Case
                <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Case Study Modal */}
      {selectedCase && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCase(null)}
        >
          <div
            className="glass-card rounded-2xl shadow-none w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CasesIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedCase.title}</h2>
                    <p className="text-sm text-slate-500">{departmentLabels[selectedDepartment]} Case Study</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Scenario */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center">
                    <QuestionIcon className="w-3 h-3 text-slate-500" />
                  </div>
                  Scenario
                </h3>
                <p className="text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4">{selectedCase.scenario}</p>
              </div>

              {/* Correct Response */}
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-emerald-700" />
                  </div>
                  Correct Response
                </h3>
                <p className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-4 whitespace-pre-wrap">
                  {selectedCase.correctResponse}
                </p>
              </div>

              {/* Wrong Response */}
              <div>
                <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                    <XIcon className="w-3 h-3 text-red-700" />
                  </div>
                  Wrong Response
                </h3>
                <p className="text-red-800 bg-red-50 border border-red-200 rounded-xl p-4 whitespace-pre-wrap">
                  {selectedCase.wrongResponse}
                </p>
              </div>

              {/* Key Takeaway */}
              <div>
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                    <LightbulbIcon className="w-3 h-3 text-blue-700" />
                  </div>
                  Key Takeaway
                </h3>
                <p className="text-blue-900 font-medium bg-blue-50 border border-blue-200 rounded-xl p-4">
                  {selectedCase.keyTakeaway}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedCase(null)}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Icons
function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function RulesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function CasesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}
