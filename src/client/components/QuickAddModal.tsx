'use client'

import { useState } from 'react'
import InfoTip from '@/client/components/ui/InfoTip'
import { cn } from '@/shared/utils/cn'

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
    <div className="fixed inset-0 z-[110] overflow-y-auto" suppressHydrationWarning>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.name} className={field.name === 'email' || field.name === 'phone' || field.name === 'name' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
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
                      className={cn(
                        "w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 outline-none transition-all focus:ring-4 focus:ring-orange-500/10",
                        fieldErrors[field.name] ? "border-red-300 ring-4 ring-red-500/10" : "border-slate-200 focus:border-orange-500"
                      )}
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
                      className={cn(
                        "w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 outline-none transition-all focus:ring-4 focus:ring-orange-500/10",
                        fieldErrors[field.name] ? "border-red-300 ring-4 ring-red-500/10" : "border-slate-200 focus:border-orange-500"
                      )}
                    />
                  )}
                  {fieldErrors[field.name] && (
                    <p className="text-[11px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-tight">{fieldErrors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#c96442] hover:bg-[#b5563a] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 order-1 sm:order-2"
              >
                {loading ? 'Adding...' : submitLabel}
              </button>
            </div>
          </form>
        </div>
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
