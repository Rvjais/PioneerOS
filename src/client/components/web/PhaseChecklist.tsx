'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'

// Phase-specific checklist items
export const PHASE_CHECKLISTS: Record<string, { id: string; label: string; required: boolean }[]> = {
  CONTENT: [
    { id: 'brand_guidelines', label: 'Brand guidelines received', required: true },
    { id: 'content_document', label: 'Content document approved', required: true },
    { id: 'sitemap_finalized', label: 'Site map finalized', required: true },
    { id: 'seo_keywords', label: 'SEO keywords identified', required: false },
    { id: 'domain_confirmed', label: 'Domain name confirmed', required: true },
    { id: 'hosting_setup', label: 'Hosting account setup', required: false },
  ],
  DESIGN: [
    { id: 'wireframes', label: 'Wireframes approved', required: true },
    { id: 'homepage_mockup', label: 'Homepage mockup approved', required: true },
    { id: 'inner_pages', label: 'Inner pages designed', required: true },
    { id: 'mobile_review', label: 'Mobile responsive review', required: true },
    { id: 'design_signoff', label: 'Design sign-off received', required: true },
    { id: 'style_guide', label: 'Style guide documented', required: false },
  ],
  MEDIA: [
    { id: 'product_images', label: 'Product images collected', required: true },
    { id: 'team_photos', label: 'Team photos received', required: false },
    { id: 'stock_images', label: 'Stock images sourced', required: false },
    { id: 'videos_optimized', label: 'Videos optimized', required: false },
    { id: 'icons_ready', label: 'Icons and graphics ready', required: true },
    { id: 'logo_files', label: 'Logo files (all formats) received', required: true },
  ],
  DEVELOPMENT: [
    { id: 'frontend_complete', label: 'Frontend development complete', required: true },
    { id: 'backend_integration', label: 'Backend integration done', required: true },
    { id: 'cms_configured', label: 'CMS configured', required: false },
    { id: 'forms_tested', label: 'Forms tested', required: true },
    { id: 'third_party', label: 'Third-party integrations working', required: false },
    { id: 'seo_implemented', label: 'SEO meta tags implemented', required: true },
    { id: 'analytics_setup', label: 'Analytics tracking setup', required: true },
    { id: 'responsive_check', label: 'Responsive design verified', required: true },
  ],
  TESTING: [
    { id: 'cross_browser', label: 'Cross-browser testing', required: true },
    { id: 'mobile_device', label: 'Mobile device testing', required: true },
    { id: 'performance', label: 'Performance optimization', required: true },
    { id: 'security_audit', label: 'Security audit', required: true },
    { id: 'client_uat', label: 'Client UAT sign-off', required: true },
    { id: 'broken_links', label: 'Broken links check', required: true },
    { id: 'form_testing', label: 'All forms submission test', required: true },
    { id: 'load_testing', label: 'Load time under 3 seconds', required: true },
  ],
  DEPLOYMENT: [
    { id: 'dns_configured', label: 'DNS configured', required: true },
    { id: 'ssl_installed', label: 'SSL certificate installed', required: true },
    { id: 'go_live_checklist', label: 'Go-live checklist complete', required: true },
    { id: 'client_training', label: 'Client training done', required: false },
    { id: 'documentation', label: 'Documentation handed over', required: true },
    { id: 'backup_setup', label: 'Backup system configured', required: true },
    { id: 'monitoring_setup', label: 'Uptime monitoring setup', required: false },
    { id: 'launch_announcement', label: 'Launch announcement sent', required: false },
  ],
}

interface ChecklistItem {
  id: string
  label: string
  required: boolean
  completed: boolean
  completedAt?: string
  completedBy?: string
}

interface PhaseChecklistProps {
  phase: string
  projectId: string
  checklist: ChecklistItem[]
  onUpdate?: (checklist: ChecklistItem[]) => void
  readOnly?: boolean
}

export function PhaseChecklist({
  phase,
  projectId,
  checklist,
  onUpdate,
  readOnly = false,
}: PhaseChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(checklist)
  const [saving, setSaving] = useState(false)

  const phaseTemplate = PHASE_CHECKLISTS[phase] || []
  const completedCount = items.filter((i) => i.completed).length
  const requiredCount = phaseTemplate.filter((i) => i.required).length
  const requiredCompleted = items.filter(
    (i) => i.completed && phaseTemplate.find((t) => t.id === i.id)?.required
  ).length

  const handleToggle = async (itemId: string) => {
    if (readOnly) return

    const updatedItems = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : undefined,
          }
        : item
    )

    setItems(updatedItems)

    // Save to server
    setSaving(true)
    try {
      await fetch(`/api/web/projects/${projectId}/phases/${phase}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: updatedItems }),
      })
      onUpdate?.(updatedItems)
    } catch (error) {
      console.error('Failed to save checklist:', error)
    } finally {
      setSaving(false)
    }
  }

  const progressPercentage = phaseTemplate.length > 0 ? Math.round((completedCount / phaseTemplate.length) * 100) : 0

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{phase} Phase Checklist</h3>
            <p className="text-sm text-slate-400">
              {completedCount}/{phaseTemplate.length} items completed
              {requiredCompleted < requiredCount && (
                <span className="text-amber-400 ml-2">
                  ({requiredCount - requiredCompleted} required items pending)
                </span>
              )}
            </p>
          </div>
          {saving && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercentage === 100
                  ? 'bg-green-500'
                  : progressPercentage >= 50
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{progressPercentage}% complete</p>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-white/5">
        {phaseTemplate.map((template) => {
          const item = items.find((i) => i.id === template.id) || {
            ...template,
            completed: false,
          }

          return (
            <div
              key={template.id}
              className={`p-4 flex items-center gap-4 ${
                readOnly ? '' : 'cursor-pointer hover:bg-slate-700/30'
              }`}
              onClick={() => handleToggle(template.id)}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-500 hover:border-slate-400'
                }`}
              >
                {item.completed && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    item.completed ? 'text-slate-400 line-through' : 'text-white'
                  }`}
                >
                  {template.label}
                  {template.required && !item.completed && (
                    <span className="ml-2 text-xs text-red-400">Required</span>
                  )}
                </p>
                {item.completedAt && (
                  <p className="text-xs text-slate-500">
                    Completed {formatDateDDMMYYYY(item.completedAt)}
                  </p>
                )}
              </div>

              {/* Status */}
              {item.completed ? (
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                  Done
                </span>
              ) : template.required ? (
                <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                  Required
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded-full">
                  Optional
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper to initialize checklist from template
export function initializeChecklist(phase: string): ChecklistItem[] {
  const template = PHASE_CHECKLISTS[phase] || []
  return template.map((item) => ({
    ...item,
    completed: false,
  }))
}

// Helper to check if all required items are completed
export function isPhaseComplete(phase: string, checklist: ChecklistItem[]): boolean {
  const template = PHASE_CHECKLISTS[phase] || []
  const requiredIds = template.filter((t) => t.required).map((t) => t.id)
  return requiredIds.every((id) => checklist.find((c) => c.id === id)?.completed)
}
