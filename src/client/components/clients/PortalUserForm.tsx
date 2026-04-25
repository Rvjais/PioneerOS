'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/client/components/ui/Modal'

interface PortalUser {
  id?: string
  email: string
  name: string
  phone?: string | null
  role: 'PRIMARY' | 'SECONDARY' | 'VIEWER'
  isActive?: boolean
}

interface PortalUserFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: PortalUser) => Promise<void>
  user?: PortalUser | null
  mode: 'create' | 'edit'
}

const ROLES = [
  {
    value: 'PRIMARY',
    label: 'Primary',
    description: 'Full access - can view all data, edit credentials, manage users, submit tickets',
  },
  {
    value: 'SECONDARY',
    label: 'Secondary',
    description: 'Limited access - can view data and submit support tickets, but cannot edit credentials',
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description: 'Read-only - can only view data, no editing or ticket submission',
  },
]

export function PortalUserForm({ isOpen, onClose, onSave, user, mode }: PortalUserFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PortalUser>({
    email: '',
    name: '',
    phone: '',
    role: 'SECONDARY',
    isActive: true,
  })

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive ?? true,
      })
    } else {
      setFormData({
        email: '',
        name: '',
        phone: '',
        role: 'SECONDARY',
        isActive: true,
      })
    }
    setError(null)
  }, [user, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Portal User' : 'Edit Portal User'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-400 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                placeholder="user@example.com"
                disabled={mode === 'edit'} // Email can't be changed after creation
                required
              />
              {mode === 'edit' && (
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed after creation</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full name"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 dark:border-slate-600 rounded-lg glass-card dark:bg-slate-800 text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-2">
                Role *
              </label>
              <div className="space-y-2">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-900/20'
                        : 'border-white/10 dark:border-slate-700 hover:border-white/20 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as PortalUser['role'] })}
                      className="mt-0.5 mr-3"
                    />
                    <div>
                      <div className="font-medium text-white dark:text-white">{role.label}</div>
                      <div className="text-sm text-slate-400 dark:text-slate-400">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Status (edit mode only) */}
            {mode === 'edit' && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 dark:border-slate-600 text-blue-400 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-white dark:text-white">Active</span>
                    <p className="text-sm text-slate-400 dark:text-slate-400">
                      Inactive users cannot log in to the portal
                    </p>
                  </div>
                </label>
              </div>
            )}
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
            {mode === 'create' ? 'Add User' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default PortalUserForm
