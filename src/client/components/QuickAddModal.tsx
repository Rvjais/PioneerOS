'use client'

import { useState } from 'react'
import InfoTip from '@/client/components/ui/InfoTip'

interface Field {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  tooltip?: string
}

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: Field[]
  onSubmit: (data: Record<string, string>) => Promise<void>
  submitLabel?: string
}

export function QuickAddModal({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  submitLabel = 'Add',
}: QuickAddModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`
      }
    })
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit(formData)
      setFormData({})
      setFieldErrors({})
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-800 rounded-2xl border border-white/10 p-6">
        <div className="p-6 border-b border-white/10 -m-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-white mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.tooltip && <InfoTip text={field.tooltip} />}
              </label>

              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, [field.name]: e.target.value })
                    if (fieldErrors[field.name]) {
                      setFieldErrors({ ...fieldErrors, [field.name]: '' })
                    }
                  }}
                  className={`w-full px-4 py-2.5 bg-slate-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${
                    fieldErrors[field.name] ? 'border-red-500' : 'border-white/10'
                  }`}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, [field.name]: e.target.value })
                    if (fieldErrors[field.name]) {
                      setFieldErrors({ ...fieldErrors, [field.name]: '' })
                    }
                  }}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-2.5 bg-slate-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${
                    fieldErrors[field.name] ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              )}
              {fieldErrors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors[field.name]}</p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Pre-configured modals for common use cases
export const EMPLOYEE_FIELDS: Field[] = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true, tooltip: 'Legal first name as on government ID. Used for payroll and official documents.' },
  { name: 'lastName', label: 'Last Name', type: 'text', tooltip: 'Legal last name / surname as on ID.' },
  { name: 'email', label: 'Email', type: 'email', tooltip: 'Personal email for sending offer letter and login credentials.' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, tooltip: 'WhatsApp-enabled mobile number with country code for team communication.' },
  {
    name: 'department',
    label: 'Department',
    type: 'select',
    required: true,
    tooltip: 'Primary department - determines sidebar navigation, KPIs, and daily activities.',
    options: [
      { value: 'OPERATIONS', label: 'Operations' },
      { value: 'HR', label: 'HR' },
      { value: 'SEO', label: 'SEO' },
      { value: 'SOCIAL', label: 'Social Media' },
      { value: 'ADS', label: 'Paid Ads' },
      { value: 'WEB', label: 'Web Development' },
      { value: 'ACCOUNTS', label: 'Accounts' },
      { value: 'SALES', label: 'Sales' },
    ],
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    tooltip: 'System role controlling what features and data they can access.',
    options: [
      { value: 'EMPLOYEE', label: 'Employee' },
      { value: 'MANAGER', label: 'Manager' },
      { value: 'FREELANCER', label: 'Freelancer' },
      { value: 'INTERN', label: 'Intern' },
      { value: 'SALES', label: 'Sales' },
      { value: 'ACCOUNTS', label: 'Accounts' },
    ],
  },
  { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true, tooltip: 'First day of employment. Probation, tenure, and appraisal eligibility calculated from this.' },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', tooltip: 'For birthday celebrations and age verification.' },
]

export const CLIENT_FIELDS: Field[] = [
  { name: 'name', label: 'Client/Company Name', type: 'text', required: true, tooltip: 'Full business name as it appears on letterhead. Used on invoices and SLA.' },
  { name: 'contactName', label: 'Contact Person', type: 'text', tooltip: 'Primary point of contact who receives all communications.' },
  { name: 'contactEmail', label: 'Contact Email', type: 'email', tooltip: 'Official email for invoices, reports, and portal access.' },
  { name: 'contactPhone', label: 'Contact Phone', type: 'tel', tooltip: 'WhatsApp-enabled number for quick communication and reminders.' },
  {
    name: 'industry',
    label: 'Industry',
    type: 'select',
    tooltip: 'Business sector - helps team tailor strategy and communication.',
    options: [
      { value: 'Healthcare', label: 'Healthcare' },
      { value: 'Technology', label: 'Technology' },
      { value: 'Education', label: 'Education' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Lifestyle', label: 'Lifestyle' },
      { value: 'Ecommerce', label: 'E-commerce' },
      { value: 'RealEstate', label: 'Real Estate' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    name: 'tier',
    label: 'Tier',
    type: 'select',
    required: true,
    tooltip: 'Service tier based on budget. STANDARD: ₹25-75K, PREMIUM: ₹75-150K, ENTERPRISE: ₹150K+.',
    options: [
      { value: 'STANDARD', label: 'Standard (₹25k)' },
      { value: 'PREMIUM', label: 'Premium (₹50k)' },
      { value: 'ENTERPRISE', label: 'Enterprise (₹100k+)' },
    ],
  },
  { name: 'monthlyFee', label: 'Monthly Fee (₹)', type: 'number', placeholder: '50000', tooltip: 'Exact monthly fee excluding GST. Must match signed contract.' },
  { name: 'websiteUrl', label: 'Website URL', type: 'text', placeholder: 'example.com', tooltip: 'Current website URL for SEO audits and analytics setup.' },
  { name: 'gstNumber', label: 'GST Number', type: 'text', tooltip: '15-character GSTIN for tax-compliant invoices. Format: 22AAAAA0000A1Z5.' },
]
