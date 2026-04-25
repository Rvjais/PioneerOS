'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'

interface Credential {
  id?: string
  platform: string
  category: string
  username?: string | null
  password?: string | null
  email?: string | null
  url?: string | null
  apiKey?: string | null
  notes?: string | null
}

interface CredentialFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (credential: Credential) => Promise<void>
  credential?: Credential | null
  mode: 'create' | 'edit'
}

const CATEGORIES = [
  { value: 'PLATFORM', label: 'Platform' },
  { value: 'SOCIAL', label: 'Social Media' },
  { value: 'HOSTING', label: 'Hosting' },
  { value: 'ANALYTICS', label: 'Analytics' },
  { value: 'ADS', label: 'Advertising' },
  { value: 'OTHER', label: 'Other' },
]

const PLATFORM_SUGGESTIONS = [
  'Google Analytics',
  'Google Search Console',
  'Google Ads',
  'Google Business Profile',
  'Meta Business Suite',
  'Facebook Ads',
  'Instagram',
  'LinkedIn',
  'LinkedIn Ads',
  'Twitter/X',
  'YouTube',
  'TikTok',
  'WordPress',
  'Shopify',
  'Web Hosting (cPanel)',
  'Domain Registrar',
  'Mailchimp',
  'HubSpot',
  'SEMrush',
  'Ahrefs',
  'Canva',
]

export function CredentialForm({ isOpen, onClose, onSave, credential, mode }: CredentialFormProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Credential>({
    platform: '',
    category: 'PLATFORM',
    username: '',
    password: '',
    email: '',
    url: '',
    apiKey: '',
    notes: '',
  })

  useEffect(() => {
    if (credential && mode === 'edit') {
      setFormData({
        id: credential.id,
        platform: credential.platform || '',
        category: credential.category || 'PLATFORM',
        username: credential.username || '',
        password: credential.password || '',
        email: credential.email || '',
        url: credential.url || '',
        apiKey: credential.apiKey || '',
        notes: credential.notes || '',
      })
    } else {
      setFormData({
        platform: '',
        category: 'PLATFORM',
        username: '',
        password: '',
        email: '',
        url: '',
        apiKey: '',
        notes: '',
      })
    }
    setShowPassword(false)
    setError(null)
  }, [credential, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.platform.trim()) {
      setError('Platform name is required')
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credential')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Credential' : 'Edit Credential'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-400 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                  Platform *
                </label>
                <input
                  type="text"
                  list="platform-suggestions"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Google Analytics"
                  required
                />
                <datalist id="platform-suggestions">
                  {PLATFORM_SUGGESTIONS.map((platform) => (
                    <option key={platform} value={platform} />
                  ))}
                </datalist>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ colorScheme: 'dark' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-slate-800 text-white">{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                Login URL
              </label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/login"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="username"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                API Key (optional)
              </label>
              <input
                type="text"
                value={formData.apiKey || ''}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="API key if applicable"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-200 dark:text-slate-300 bg-slate-800/50 dark:bg-slate-800 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {mode === 'create' ? 'Add Credential' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default CredentialForm
