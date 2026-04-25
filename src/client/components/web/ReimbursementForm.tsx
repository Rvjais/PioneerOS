'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
}

interface ReimbursementFormProps {
  clients: Client[]
}

const expenseTypes = [
  { value: 'DOMAIN', label: 'Domain', icon: '🌐', description: 'Registration/Renewal' },
  { value: 'HOSTING', label: 'Hosting', icon: '🖥️', description: 'Server/Hosting' },
  { value: 'SSL', label: 'SSL', icon: '🔒', description: 'Certificate' },
  { value: 'PLUGIN', label: 'Plugin', icon: '🧩', description: 'Extension/Add-on' },
  { value: 'THEME', label: 'Theme', icon: '🎨', description: 'Template' },
  { value: 'SUBSCRIPTION', label: 'Subscription', icon: '📦', description: 'Software/SaaS' },
  { value: 'OTHER', label: 'Other', icon: '📝', description: 'Miscellaneous' },
]

export function ReimbursementForm({ clients }: ReimbursementFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState({
    clientId: '',
    type: '',
    description: '',
    vendor: '',
    amount: '',
    paidDate: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    notes: '',
  })

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    return num ? '₹ ' + parseInt(num).toLocaleString('en-IN') : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/web/reimbursements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount.replace(/[^0-9.]/g, '')),
        }),
      })

      if (!response.ok) throw new Error('Failed to submit reimbursement')

      setIsOpen(false)
      setFormData({
        clientId: '',
        type: '',
        description: '',
        vendor: '',
        amount: '',
        paidDate: new Date().toISOString().split('T')[0],
        receiptUrl: '',
        notes: '',
      })
      setCurrentSection(0)
      router.refresh()
    } catch (error) {
      console.error('Error submitting reimbursement:', error)
    } finally {
      setLoading(false)
    }
  }

  const isSection1Valid = formData.clientId && formData.type
  const isSection2Valid = formData.description && formData.amount
  const canSubmit = isSection1Valid && isSection2Valid

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 font-medium flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Submit Reimbursement
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Submit Reimbursement</h2>
                    <p className="text-sm text-slate-400">Request expense reimbursement</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {['Client & Type', 'Details', 'Review'].map((label, i) => (
                  <button
                    key={`section-${label}`}
                    onClick={() => setCurrentSection(i)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      currentSection === i
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : i < currentSection || (i === 1 && isSection1Valid) || (i === 2 && canSubmit)
                          ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-800/30 text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Section 1: Client & Type */}
              {currentSection === 0 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Client Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      Select Client <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="">Choose a client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Expense Type Grid */}
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-3">
                      Expense Type <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {expenseTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.value })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            formData.type === type.value
                              ? 'bg-indigo-500/10 border-indigo-500 ring-4 ring-indigo-500/10'
                              : 'bg-slate-800/30 border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="text-2xl">{type.icon}</span>
                          <p className={`font-medium mt-2 ${formData.type === type.value ? 'text-indigo-400' : 'text-white'}`}>
                            {type.label}
                          </p>
                          <p className="text-xs text-slate-500">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Details */}
              {currentSection === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., Domain renewal for example.com"
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Vendor</label>
                      <input
                        type="text"
                        value={formData.vendor}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        placeholder="e.g., GoDaddy"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Amount <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: formatCurrency(e.target.value) })}
                        placeholder="₹ 1,500"
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Payment Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.paidDate}
                      onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Receipt URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.receiptUrl}
                        onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      Upload receipt to Google Drive/Dropbox and paste the link
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional information..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Section 3: Review */}
              {currentSection === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-800/30 border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-400">Client</span>
                        <span className="font-medium text-white">{clients.find(c => c.id === formData.clientId)?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-400">Type</span>
                        <span className="font-medium text-white">{expenseTypes.find(t => t.value === formData.type)?.label || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-400">Description</span>
                        <span className="font-medium text-white truncate max-w-[200px]">{formData.description || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-400">Vendor</span>
                        <span className="font-medium text-white">{formData.vendor || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-semibold text-emerald-400">{formData.amount || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/5">
                        <span className="text-slate-400">Date</span>
                        <span className="font-medium text-white">{formData.paidDate}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Receipt</span>
                        <span className={`font-medium ${formData.receiptUrl ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {formData.receiptUrl ? 'Attached' : 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-slate-800/30 flex items-center justify-between">
              <button
                type="button"
                onClick={() => currentSection > 0 ? setCurrentSection(currentSection - 1) : setIsOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                {currentSection === 0 ? 'Cancel' : 'Back'}
              </button>
              {currentSection < 2 ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection(currentSection + 1)}
                  disabled={currentSection === 0 ? !isSection1Valid : !isSection2Valid}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !canSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Request
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
