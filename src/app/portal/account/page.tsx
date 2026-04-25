'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getTaskStatusColor, getTierColor } from '@/shared/constants/portal'
import { Modal, ModalBody, ModalFooter, ConfirmModal } from '@/client/components/ui/Modal'
import PageGuide from '@/client/components/ui/PageGuide'

function getServiceLabel(service: string | Record<string, unknown>): string {
  if (typeof service === 'string') return service
  if (typeof service === 'object' && service !== null) {
    return (service.name as string) || (service.serviceId as string) || String(service)
  }
  return String(service)
}
import { ProfilePicture } from '@/client/components/ui/ProfilePicture'
import ServiceManagement from '@/client/components/portal/ServiceManagement'

interface OnboardingItem {
  key: string
  label: string
  completed: boolean
  completedAt: string | null
}

interface OnboardingPhase {
  label: string
  items: OnboardingItem[]
}

interface AccountManager {
  id: string
  name: string
  email: string
  phone: string | null
  profilePicture: string | null
}

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string | null
  department: string
  role: string
  userRole: string
  isPrimary: boolean
  profilePicture: string | null
}

interface Credential {
  id: string
  type: string
  label: string
  category: string
  username: string | null
  email: string | null
  hasPassword: boolean
  url: string | null
  notes: string | null
  password?: string // Only present when editing
}

interface ProfileData {
  client: {
    id: string
    name: string
    logoUrl: string | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    whatsapp: string | null
    websiteUrl: string | null
    address: string | null
    city: string | null
    state: string | null
    pincode: string | null
    gstNumber: string | null
    businessType: string | null
    industry: string | null
    tier: string
    status: string
    services: (string | Record<string, unknown>)[]
    startDate: string | null
    onboardingStatus: string
    lifecycleStage: string
  }
  portal: {
    logoUrl: string | null
    themeColor: string
    isActive: boolean
    lastAccessed: string | null
  } | null
  accountManager: AccountManager | null
  teamMembers?: TeamMember[]
  onboarding: {
    completionPercentage: number
    status: string
    phases: Record<string, OnboardingPhase>
  } | null
  user: {
    id: string
    name: string
    email: string
    role: string
  }
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
  'Twitter/X',
  'YouTube',
  'WordPress',
  'Shopify',
  'Web Hosting',
  'Mailchimp',
  'HubSpot',
]

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [credentialsLoading, setCredentialsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPhase, setExpandedPhase] = useState<string | null>('preKickoff')

  // Credential management state (for PRIMARY users)
  const [showCredentialModal, setShowCredentialModal] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [credentialForm, setCredentialForm] = useState({
    platform: '',
    category: 'PLATFORM',
    username: '',
    email: '',
    password: '',
    url: '',
    notes: '',
  })
  const [savingCredential, setSavingCredential] = useState(false)
  const [credentialError, setCredentialError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deletingCredential, setDeletingCredential] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({})

  // Profile editing state
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    whatsappNotifications: false,
    pushNotifications: true,
  })
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [preferencesSuccess, setPreferencesSuccess] = useState(false)

  // Data export state
  const [exporting, setExporting] = useState<string | null>(null)

  // Company info edit state (for PRIMARY users)
  const [showCompanyEdit, setShowCompanyEdit] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    websiteUrl: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    businessType: '',
    industry: '',
  })
  const [savingCompany, setSavingCompany] = useState(false)
  const [companySuccess, setCompanySuccess] = useState(false)

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'GENERAL',
    rating: 5,
    message: '',
  })
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  // Team member profile modal state
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | AccountManager | null>(null)

  const isPrimaryUser = profile?.user?.role === 'PRIMARY'
  const canExport = profile?.user?.role === 'PRIMARY' || profile?.user?.role === 'SECONDARY'

  useEffect(() => {
    fetchProfile()
    fetchProfileEdit()
  }, [])

  // Initialize company form when profile loads
  useEffect(() => {
    if (profile?.client) {
      setCompanyForm({
        name: profile.client.name || '',
        contactName: profile.client.contactName || '',
        contactEmail: profile.client.contactEmail || '',
        contactPhone: profile.client.contactPhone || '',
        whatsapp: profile.client.whatsapp || '',
        websiteUrl: profile.client.websiteUrl || '',
        address: profile.client.address || '',
        city: profile.client.city || '',
        state: profile.client.state || '',
        pincode: profile.client.pincode || '',
        gstNumber: profile.client.gstNumber || '',
        businessType: profile.client.businessType || '',
        industry: profile.client.industry || '',
      })
    }
  }, [profile?.client])

  useEffect(() => {
    if (profile) {
      fetchCredentials()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.user?.role])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/client-portal/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else if (res.status === 401) {
        setError('Please log in to view your profile')
      } else {
        setError('Failed to load profile. Please try again.')
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Unable to connect to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const fetchCredentials = async () => {
    setCredentialsLoading(true)
    try {
      // Fetch with reveal=true if PRIMARY user (for editing)
      const reveal = profile?.user?.role === 'PRIMARY'
      const res = await fetch(`/api/client-portal/credentials${reveal ? '?reveal=true' : ''}`)
      if (res.ok) {
        const data = await res.json()
        setCredentials(data.credentials || [])
      }
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
    } finally {
      setCredentialsLoading(false)
    }
  }

  const fetchProfileEdit = async () => {
    try {
      const res = await fetch('/api/client-portal/profile/edit')
      if (res.ok) {
        const data = await res.json()
        setProfileForm({
          name: data.profile?.name || '',
          phone: data.profile?.phone || '',
        })
        setPreferences({
          emailNotifications: data.preferences?.emailNotifications ?? true,
          whatsappNotifications: data.preferences?.whatsappNotifications ?? false,
          pushNotifications: data.preferences?.pushNotifications ?? true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile edit data:', error)
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileSuccess(false)
    try {
      const res = await fetch('/api/client-portal/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          name: profileForm.name,
          phone: profileForm.phone || null,
        }),
      })
      if (res.ok) {
        setProfileSuccess(true)
        setShowEditProfile(false)
        fetchProfile()
        setTimeout(() => setProfileSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePreferences = async () => {
    setSavingPreferences(true)
    setPreferencesSuccess(false)
    try {
      const res = await fetch('/api/client-portal/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'preferences',
          ...preferences,
        }),
      })
      if (res.ok) {
        setPreferencesSuccess(true)
        setTimeout(() => setPreferencesSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleExport = async (type: string) => {
    setExporting(type)
    try {
      const res = await fetch(`/api/client-portal/export?type=${type}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `${type}_export.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => window.URL.revokeObjectURL(url), 1000)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    } finally {
      setExporting(null)
    }
  }

  const handleUpdateLogo = async (newUrl: string) => {
    if (!isPrimaryUser) return
    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: newUrl || null }),
      })
      if (res.ok) {
        // Update local state - update BOTH client.logoUrl and portal.logoUrl
        if (profile) {
          setProfile({
            ...profile,
            client: { ...profile.client, logoUrl: newUrl || null } as typeof profile.client,
            portal: profile.portal ? { ...profile.portal, logoUrl: newUrl || null } : null,
          })
        }
        // Dispatch event to update layout header
        window.dispatchEvent(new CustomEvent('client-logo-updated', {
          detail: { logoUrl: newUrl || null }
        }))
      }
    } catch (error) {
      console.error('Failed to update logo:', error)
    }
  }

  const handleSaveCompany = async () => {
    setSavingCompany(true)
    setCompanySuccess(false)
    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      })
      if (res.ok) {
        setCompanySuccess(true)
        setShowCompanyEdit(false)
        fetchProfile()
        setTimeout(() => setCompanySuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save company info:', error)
    } finally {
      setSavingCompany(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.message.trim()) return
    setSavingFeedback(true)
    try {
      const res = await fetch('/api/client-portal/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm),
      })
      if (res.ok) {
        setFeedbackSuccess(true)
        setShowFeedbackModal(false)
        setFeedbackForm({ type: 'GENERAL', rating: 5, message: '' })
        setTimeout(() => setFeedbackSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSavingFeedback(false)
    }
  }

  // Open credential form for adding/editing
  const openCredentialForm = (credential?: Credential) => {
    if (credential) {
      setEditingCredential(credential)
      setCredentialForm({
        platform: credential.label || '',
        category: credential.category || 'PLATFORM',
        username: credential.username || '',
        email: credential.email || '',
        password: credential.password || '',
        url: credential.url || '',
        notes: credential.notes || '',
      })
    } else {
      setEditingCredential(null)
      setCredentialForm({
        platform: '',
        category: 'PLATFORM',
        username: '',
        email: '',
        password: '',
        url: '',
        notes: '',
      })
    }
    setShowPassword(false)
    setCredentialError(null)
    setShowCredentialModal(true)
  }

  // Save credential (create or update)
  const handleSaveCredential = async () => {
    if (!credentialForm.platform.trim()) {
      setCredentialError('Platform name is required')
      return
    }

    setSavingCredential(true)
    setCredentialError(null)

    try {
      const method = editingCredential ? 'PUT' : 'POST'
      const body = editingCredential
        ? { id: editingCredential.id, ...credentialForm }
        : credentialForm

      const res = await fetch('/api/client-portal/credentials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save credential')
      }

      setShowCredentialModal(false)
      setEditingCredential(null)
      fetchCredentials()
    } catch (err) {
      setCredentialError(err instanceof Error ? err.message : 'Failed to save credential')
    } finally {
      setSavingCredential(false)
    }
  }

  // Delete credential
  const handleDeleteCredential = async (id: string) => {
    setDeletingCredential(true)
    try {
      const res = await fetch(`/api/client-portal/credentials?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setShowDeleteConfirm(null)
        fetchCredentials()
      }
    } catch (err) {
      console.error('Failed to delete credential:', err)
    } finally {
      setDeletingCredential(false)
    }
  }

  const toggleRevealPassword = (credentialId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }))
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}-${month}-${d.getFullYear()}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="glass-card rounded-xl p-8 text-center border border-white/10">
        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-1">{error || 'Profile not found'}</h3>
        <p className="text-slate-400">Unable to load your profile information.</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchProfile() }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const { client, portal, accountManager, onboarding, user } = profile

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="portal-account"
        title="Your Account"
        description="Manage your account details and preferences"
        steps={[
          { label: 'View account info', description: 'See your profile, company details, and assigned account manager' },
          { label: 'Update contact details', description: 'Keep your email, phone, and address information current' },
          { label: 'Manage preferences', description: 'Configure notification preferences and portal settings' },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Account</h1>
        <p className="text-slate-300 mt-1">View your profile and account information</p>
      </div>

      {/* Profile Header */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <div className="flex items-center gap-4">
            <ProfilePicture
              src={client.logoUrl || portal?.logoUrl}
              name={client.name}
              size="2xl"
              editable={isPrimaryUser}
              onEdit={handleUpdateLogo}
              type="client"
              className="border-4 border-white/30 rounded-xl"
            />
            <div className="text-white">
              <h2 className="text-2xl font-bold">{client.name}</h2>
              {client.industry && (
                <p className="text-white/80">{client.industry}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTierColor(client.tier)}`}>
                  {client.tier}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTaskStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/40">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Logged in as:</span>
              <span className="font-medium text-white">{user.name}</span>
              <span className="text-slate-400">({user.email})</span>
            </div>
            <span className={`px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Company Information</h3>
            {isPrimaryUser && !showCompanyEdit && (
              <button
                onClick={() => setShowCompanyEdit(true)}
                className="text-sm text-blue-400 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>

          {companySuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-200 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Company information updated successfully!
            </div>
          )}

          {showCompanyEdit ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Industry</label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={companyForm.contactName}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Business Type</label>
                  <input
                    type="text"
                    value={companyForm.businessType}
                    onChange={(e) => setCompanyForm({ ...companyForm, businessType: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
                  <input
                    type="email"
                    value={companyForm.contactEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={companyForm.contactPhone}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={companyForm.whatsapp}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Website</label>
                  <input
                    type="url"
                    value={companyForm.websiteUrl}
                    onChange={(e) => setCompanyForm({ ...companyForm, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Address</label>
                <input
                  type="text"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">City</label>
                  <input
                    type="text"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">State</label>
                  <input
                    type="text"
                    value={companyForm.state}
                    onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={companyForm.pincode}
                    onChange={(e) => setCompanyForm({ ...companyForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">GST Number</label>
                <input
                  type="text"
                  value={companyForm.gstNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCompanyEdit(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCompany}
                  disabled={savingCompany || !companyForm.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingCompany && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            {client.contactName && (
              <div>
                <p className="text-sm text-slate-400">Contact Person</p>
                <p className="font-medium text-white">{client.contactName}</p>
              </div>
            )}
            {client.contactEmail && (
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="font-medium text-white">{client.contactEmail}</p>
              </div>
            )}
            {client.contactPhone && (
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="font-medium text-white">{client.contactPhone}</p>
              </div>
            )}
            {client.websiteUrl && (
              <div>
                <p className="text-sm text-slate-400">Website</p>
                <a
                  href={client.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:underline"
                >
                  {client.websiteUrl}
                </a>
              </div>
            )}
            {(client.address || client.city || client.state) && (
              <div>
                <p className="text-sm text-slate-400">Address</p>
                <p className="font-medium text-white">
                  {[client.address, client.city, client.state, client.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
            {client.gstNumber && (
              <div>
                <p className="text-sm text-slate-400">GST Number</p>
                <p className="font-medium text-white">{client.gstNumber}</p>
              </div>
            )}
            {client.businessType && (
              <div>
                <p className="text-sm text-slate-400">Business Type</p>
                <p className="font-medium text-white">{client.businessType}</p>
              </div>
            )}
            {client.services.length > 0 && (
              <div>
                <p className="text-sm text-slate-400">Active Services</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {client.services.map((service) => (
                    <span
                      key={getServiceLabel(service)}
                      className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400"
                    >
                      {getServiceLabel(service)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {client.startDate && (
              <div>
                <p className="text-sm text-slate-400">Client Since</p>
                <p className="font-medium text-white">{formatDate(client.startDate)}</p>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Your Team */}
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Team</h3>

          {/* Account Manager */}
          {accountManager && (
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Account Manager</p>
              <button
                onClick={() => setSelectedTeamMember(accountManager)}
                className="flex items-center gap-4 w-full text-left hover:bg-slate-900/40 rounded-lg p-2 -m-2 transition-colors"
              >
                {accountManager.profilePicture ? (
                  <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={accountManager.profilePicture}
                      alt={accountManager.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {accountManager.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white">{accountManager.name}</h4>
                  <p className="text-sm text-slate-400">Account Manager</p>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Team Members */}
          {profile.teamMembers && profile.teamMembers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Team Working on Your Project</p>
              <div className="space-y-3">
                {profile.teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedTeamMember(member)}
                    className="flex items-center gap-4 w-full text-left hover:bg-slate-900/40 rounded-lg p-2 -m-2 transition-colors"
                  >
                    {member.profilePicture ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={member.profilePicture}
                          alt={member.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{member.name}</h4>
                        {member.isPrimary && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">Primary</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{member.role.replace(/_/g, ' ')} • {member.department}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!accountManager && (!profile.teamMembers || profile.teamMembers.length === 0) && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-400">Team assignment in progress</p>
              <p className="text-sm text-slate-400 mt-1">Your team will be assigned soon</p>
            </div>
          )}

          {/* Quick Contact */}
          {accountManager && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-sm font-medium text-slate-200 mb-3">Quick Contact</p>
              <div className="flex gap-3">
                <a
                  href={`mailto:${accountManager.email}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
                {accountManager.phone && (
                  <a
                    href={`tel:${accountManager.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile & Preferences Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Profile */}
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Your Profile</h3>
            {!showEditProfile && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="text-sm text-blue-400 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-200 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Profile updated successfully!
            </div>
          )}

          {showEditProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 bg-slate-900/40 border border-white/20 rounded-lg text-slate-400 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !profileForm.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProfile && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="font-medium text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="font-medium text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Role</p>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400">
                  {user.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>

          {preferencesSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-200 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Preferences updated!
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive updates via email</p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                className={`relative w-11 h-6 rounded-full transition-colors ${preferences.emailNotifications ? 'bg-blue-600' : 'bg-white/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 glass-card rounded-full transition-transform ${preferences.emailNotifications ? 'translate-x-5' : ''}`} />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-white">WhatsApp Notifications</p>
                <p className="text-sm text-slate-400">Get updates on WhatsApp</p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, whatsappNotifications: !preferences.whatsappNotifications })}
                className={`relative w-11 h-6 rounded-full transition-colors ${preferences.whatsappNotifications ? 'bg-green-600' : 'bg-white/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 glass-card rounded-full transition-transform ${preferences.whatsappNotifications ? 'translate-x-5' : ''}`} />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-white">Push Notifications</p>
                <p className="text-sm text-slate-400">Browser push notifications</p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
                className={`relative w-11 h-6 rounded-full transition-colors ${preferences.pushNotifications ? 'bg-blue-600' : 'bg-white/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 glass-card rounded-full transition-transform ${preferences.pushNotifications ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {savingPreferences && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Service Management */}
      {isPrimaryUser && (
        <ServiceManagement
          isPrimaryUser={isPrimaryUser}
          clientStartDate={client.startDate}
        />
      )}

      {/* Data Export */}
      {canExport && (
        <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Export Your Data</h3>
          <p className="text-sm text-slate-400 mb-4">Download your data as CSV files for reporting or analysis.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleExport('leads')}
              disabled={!!exporting}
              className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-slate-900/40 transition-colors disabled:opacity-50"
            >
              {exporting === 'leads' ? (
                <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <span className="mt-2 text-sm font-medium text-slate-200">Leads</span>
            </button>

            <button
              onClick={() => handleExport('deliverables')}
              disabled={!!exporting}
              className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-slate-900/40 transition-colors disabled:opacity-50"
            >
              {exporting === 'deliverables' ? (
                <svg className="w-6 h-6 text-green-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )}
              <span className="mt-2 text-sm font-medium text-slate-200">Deliverables</span>
            </button>

            <button
              onClick={() => handleExport('goals')}
              disabled={!!exporting}
              className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-slate-900/40 transition-colors disabled:opacity-50"
            >
              {exporting === 'goals' ? (
                <svg className="w-6 h-6 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              <span className="mt-2 text-sm font-medium text-slate-200">Goals</span>
            </button>

            {isPrimaryUser && (
              <button
                onClick={() => handleExport('activity')}
                disabled={!!exporting}
                className="flex flex-col items-center p-4 border border-white/10 rounded-lg hover:bg-slate-900/40 transition-colors disabled:opacity-50"
              >
                {exporting === 'activity' ? (
                  <svg className="w-6 h-6 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )}
                <span className="mt-2 text-sm font-medium text-slate-200">Activity Log</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share Feedback */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Share Your Feedback</h3>
            <p className="text-sm text-slate-400 mt-1">
              We value your feedback! Help us improve our services by sharing your thoughts, suggestions, or reporting any issues.
            </p>
            {feedbackSuccess && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-200 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Thank you for your feedback! We&apos;ll review it shortly.
              </div>
            )}
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Share Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Onboarding Checklist */}
      {onboarding && (
        <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Onboarding Progress</h3>
                <p className="text-sm text-slate-400 mt-1">Track your onboarding completion status</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getTaskStatusColor(onboarding.status)}`}>
                  {onboarding.status.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${onboarding.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{onboarding.completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {onboarding.phases && Object.entries(onboarding.phases).map(([key, phase]) => {
              const completedCount = phase.items.filter(item => item.completed).length
              const totalCount = phase.items.length
              const isExpanded = expandedPhase === key

              return (
                <div key={key}>
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : key)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        completedCount === totalCount ? 'bg-green-500/20' : 'bg-slate-800/50'
                      }`}>
                        {completedCount === totalCount ? (
                          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium text-slate-300">{completedCount}/{totalCount}</span>
                        )}
                      </div>
                      <span className="font-medium text-white">{phase.label}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-4 space-y-2">
                      {phase.items.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-2 px-4 rounded-lg bg-slate-900/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              item.completed ? 'bg-green-500' : 'bg-white/20'
                            }`}>
                              {item.completed && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm ${item.completed ? 'text-white' : 'text-slate-400'}`}>
                              {item.label}
                            </span>
                          </div>
                          {item.completedAt && (
                            <span className="text-xs text-slate-400">{formatDate(item.completedAt)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stored Credentials */}
      <div className="glass-card rounded-xl shadow-none border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Stored Credentials</h3>
              <p className="text-sm text-slate-400 mt-1">Access credentials shared with our team</p>
            </div>
            <div className="flex items-center gap-3">
              {isPrimaryUser && (
                <button
                  onClick={() => openCredentialForm()}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Credential
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Securely stored
              </div>
            </div>
          </div>
        </div>

        {credentialsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : credentials.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="text-slate-400">No credentials have been stored yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {credentials.map((cred) => (
              <div key={cred.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{cred.label}</p>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800/50 text-slate-300">{cred.category}</span>
                      </div>
                      {cred.url && (
                        <a
                          href={cred.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline"
                        >
                          {cred.url}
                        </a>
                      )}

                      {/* Credential details */}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {cred.username && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase">Username</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{cred.username}</span>
                              <button
                                onClick={() => copyToClipboard(cred.username!)}
                                className="p-1 hover:bg-slate-800/50 rounded"
                                title="Copy"
                                aria-label="Copy username"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {cred.email && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase">Email</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{cred.email}</span>
                              <button
                                onClick={() => copyToClipboard(cred.email!)}
                                className="p-1 hover:bg-slate-800/50 rounded"
                                title="Copy"
                                aria-label="Copy email"
                              >
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {cred.hasPassword && (
                          <div>
                            <p className="text-xs text-slate-400 uppercase">Password</p>
                            <div className="flex items-center gap-2">
                              {isPrimaryUser && cred.password ? (
                                <>
                                  <span className="text-sm font-medium text-white font-mono">
                                    {revealedPasswords[cred.id] ? cred.password : '********'}
                                  </span>
                                  <button
                                    onClick={() => toggleRevealPassword(cred.id)}
                                    className="p-1 hover:bg-slate-800/50 rounded"
                                    title={revealedPasswords[cred.id] ? 'Hide' : 'Reveal'}
                                    aria-label={revealedPasswords[cred.id] ? 'Hide password' : 'Show password'}
                                  >
                                    {revealedPasswords[cred.id] ? (
                                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    )}
                                  </button>
                                  {revealedPasswords[cred.id] && (
                                    <button
                                      onClick={() => copyToClipboard(cred.password!)}
                                      className="p-1 hover:bg-slate-800/50 rounded"
                                      title="Copy"
                                      aria-label="Copy password"
                                    >
                                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm font-medium text-slate-400">********</span>
                              )}
                            </div>
                          </div>
                        )}
                        {cred.notes && (
                          <div className="col-span-2 md:col-span-3">
                            <p className="text-xs text-slate-400 uppercase">Notes</p>
                            <p className="text-sm text-slate-300">{cred.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit/Delete buttons for PRIMARY users */}
                  {isPrimaryUser && (
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => openCredentialForm(cred)}
                        className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(cred.id)}
                        className="p-2 text-red-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credential Form Modal */}
      <Modal
        isOpen={showCredentialModal}
        onClose={() => { setShowCredentialModal(false); setEditingCredential(null) }}
        title={editingCredential ? 'Edit Credential' : 'Add Credential'}
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            {credentialError && (
              <div className="p-3 bg-red-500/10 border border-red-200 rounded-lg">
                <p className="text-sm text-red-400">{credentialError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Platform *</label>
                <input
                  type="text"
                  list="platform-suggestions"
                  value={credentialForm.platform}
                  onChange={(e) => setCredentialForm({ ...credentialForm, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Google Analytics"
                />
                <datalist id="platform-suggestions">
                  {PLATFORM_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
                <select
                  value={credentialForm.category}
                  onChange={(e) => setCredentialForm({ ...credentialForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ colorScheme: 'dark' }}
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-slate-800 text-white">{c.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Login URL</label>
              <input
                type="url"
                value={credentialForm.url}
                onChange={(e) => setCredentialForm({ ...credentialForm, url: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/login"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Username</label>
                <input
                  type="text"
                  value={credentialForm.username}
                  onChange={(e) => setCredentialForm({ ...credentialForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
                <input
                  type="email"
                  value={credentialForm.email}
                  onChange={(e) => setCredentialForm({ ...credentialForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentialForm.password}
                  onChange={(e) => setCredentialForm({ ...credentialForm, password: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
              <textarea
                value={credentialForm.notes}
                onChange={(e) => setCredentialForm({ ...credentialForm, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => { setShowCredentialModal(false); setEditingCredential(null) }}
            disabled={savingCredential}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCredential}
            disabled={savingCredential}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingCredential && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {editingCredential ? 'Save Changes' : 'Add Credential'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Share Your Feedback"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Feedback Type</label>
              <select
                value={feedbackForm.type}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ colorScheme: 'dark' }}
              >
                <option value="GENERAL" className="bg-slate-800 text-white">General Feedback</option>
                <option value="SERVICE_QUALITY" className="bg-slate-800 text-white">Service Quality</option>
                <option value="DELIVERABLES" className="bg-slate-800 text-white">Deliverables</option>
                <option value="COMMUNICATION" className="bg-slate-800 text-white">Communication</option>
                <option value="SUGGESTION" className="bg-slate-800 text-white">Suggestion</option>
                <option value="ISSUE" className="bg-slate-800 text-white">Report an Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className="p-1 transition-colors"
                  >
                    <svg
                      className={`w-8 h-8 ${star <= feedbackForm.rating ? 'text-amber-400' : 'text-slate-300'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Your Message</label>
              <textarea
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                rows={4}
                placeholder="Tell us about your experience or share your suggestions..."
                className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setShowFeedbackModal(false)}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitFeedback}
            disabled={savingFeedback || !feedbackForm.message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingFeedback && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Submit Feedback
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteCredential(showDeleteConfirm)}
        title="Delete Credential"
        message="Are you sure you want to delete this credential? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deletingCredential}
      />

      {/* Team Member Profile Modal */}
      <Modal
        isOpen={!!selectedTeamMember}
        onClose={() => setSelectedTeamMember(null)}
        title="Team Member Profile"
      >
        {selectedTeamMember && (
          <ModalBody>
            <div className="text-center mb-6">
              {selectedTeamMember.profilePicture ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                  <Image
                    src={selectedTeamMember.profilePicture}
                    alt={selectedTeamMember.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {selectedTeamMember.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{selectedTeamMember.name}</h3>
              <p className="text-slate-400">
                {'role' in selectedTeamMember && selectedTeamMember.role ? selectedTeamMember.role.replace(/_/g, ' ') : 'Account Manager'}
              </p>
              {'department' in selectedTeamMember && selectedTeamMember.department && (
                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-slate-800/50 text-slate-300 rounded-full">
                  {selectedTeamMember.department}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <a href={`mailto:${selectedTeamMember.email}`} className="text-sm font-medium text-blue-400 hover:underline">
                    {selectedTeamMember.email}
                  </a>
                </div>
              </div>

              {selectedTeamMember.phone && (
                <div className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <a href={`tel:${selectedTeamMember.phone}`} className="text-sm font-medium text-blue-400 hover:underline">
                      {selectedTeamMember.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <div className="flex gap-3 w-full">
            {selectedTeamMember?.email && (
              <a
                href={`mailto:${selectedTeamMember.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
            )}
            {selectedTeamMember?.phone && (
              <a
                href={`tel:${selectedTeamMember.phone}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            )}
          </div>
        </ModalFooter>
      </Modal>
    </div>
  )
}
