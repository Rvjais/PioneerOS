'use client'

import React, { useState, useEffect } from 'react'
import { ProfilePicture } from '@/client/components/ui/ProfilePicture'

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
}

interface CompanyData {
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
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
  competitor1: string | null
  competitor2: string | null
  competitor3: string | null
  // Brand fields
  tagline: string | null
  brandVoice: string | null
  targetAudience: string | null
  usp: string | null
  // Communication preferences
  communicationPreferences: {
    involvementLevel: string | null
    contentApproval: boolean
    strategyDecisions: boolean
    reportingFrequency: string | null
    preferredChannel: string | null
    meetingFrequency: string | null
    preferredTime: string | null
    escalationContact: string | null
    escalationPhone: string | null
  } | null
}

interface Preferences {
  emailNotifications: boolean
  whatsappNotifications: boolean
  pushNotifications: boolean
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'profile' | 'company' | 'brand' | 'communication' | 'preferences' | 'password'>('profile')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [editedProfile, setEditedProfile] = useState({ name: '', phone: '' })
  const [editedCompany, setEditedCompany] = useState<Partial<CompanyData>>({})
  const [editedBrand, setEditedBrand] = useState({
    tagline: '',
    brandVoice: '',
    targetAudience: '',
    usp: '',
  })
  const [editedCommunication, setEditedCommunication] = useState({
    involvementLevel: '',
    contentApproval: false,
    strategyDecisions: false,
    reportingFrequency: '',
    preferredChannel: '',
    meetingFrequency: '',
    preferredTime: '',
    escalationContact: '',
    escalationPhone: '',
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch user profile
      const profileRes = await fetch('/api/client-portal/profile/edit', { credentials: 'include' })
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.profile)
        setPreferences(profileData.preferences)
        setEditedProfile({
          name: profileData.profile.name || '',
          phone: profileData.profile.phone || '',
        })
        setIsPrimary(profileData.profile.role === 'PRIMARY')
      }

      // Fetch company data
      const companyRes = await fetch('/api/client-portal/profile', { credentials: 'include' })
      if (companyRes.ok) {
        const companyData = await companyRes.json()
        const clientData = companyData.client
        setCompany(clientData)
        setEditedCompany({
          name: clientData.name || '',
          contactName: clientData.contactName || '',
          contactEmail: clientData.contactEmail || '',
          contactPhone: clientData.contactPhone || '',
          whatsapp: clientData.whatsapp || '',
          websiteUrl: clientData.websiteUrl || '',
          address: clientData.address || '',
          city: clientData.city || '',
          state: clientData.state || '',
          pincode: clientData.pincode || '',
          gstNumber: clientData.gstNumber || '',
          businessType: clientData.businessType || '',
          industry: clientData.industry || '',
          facebookUrl: clientData.socialMedia?.facebook || '',
          instagramUrl: clientData.socialMedia?.instagram || '',
          linkedinUrl: clientData.socialMedia?.linkedin || '',
          twitterUrl: clientData.socialMedia?.twitter || '',
          youtubeUrl: clientData.socialMedia?.youtube || '',
          competitor1: clientData.competitors?.[0] || '',
          competitor2: clientData.competitors?.[1] || '',
          competitor3: clientData.competitors?.[2] || '',
        })
        // Set brand info
        setEditedBrand({
          tagline: clientData.tagline || '',
          brandVoice: clientData.brandVoice || '',
          targetAudience: clientData.targetAudience || '',
          usp: clientData.usp || '',
        })
        // Set communication preferences
        const commPrefs = clientData.communicationPreferences || {}
        setEditedCommunication({
          involvementLevel: commPrefs.involvementLevel || '',
          contentApproval: commPrefs.contentApproval || false,
          strategyDecisions: commPrefs.strategyDecisions || false,
          reportingFrequency: commPrefs.reportingFrequency || '',
          preferredChannel: commPrefs.preferredChannel || '',
          meetingFrequency: commPrefs.meetingFrequency || '',
          preferredTime: commPrefs.preferredTime || '',
          escalationContact: commPrefs.escalationContact || '',
          escalationPhone: commPrefs.escalationPhone || '',
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/client-portal/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          name: editedProfile.name,
          phone: editedProfile.phone || null,
        }),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setProfile(data.profile)
        setSuccess('Profile updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedCompany),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setCompany(data.client)
        setSuccess('Company profile updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update company profile')
      }
    } catch (err) {
      console.error('Failed to save company:', err)
      setError('Failed to save company profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagline: editedBrand.tagline || null,
          brandVoice: editedBrand.brandVoice || null,
          targetAudience: editedBrand.targetAudience || null,
          usp: editedBrand.usp || null,
        }),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess('Brand info updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update brand info')
      }
    } catch (err) {
      console.error('Failed to save brand info:', err)
      setError('Failed to save brand info')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCommunication = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationPreferences: {
            involvementLevel: editedCommunication.involvementLevel || null,
            contentApproval: editedCommunication.contentApproval,
            strategyDecisions: editedCommunication.strategyDecisions,
            reportingFrequency: editedCommunication.reportingFrequency || null,
            preferredChannel: editedCommunication.preferredChannel || null,
            meetingFrequency: editedCommunication.meetingFrequency || null,
            preferredTime: editedCommunication.preferredTime || null,
            escalationContact: editedCommunication.escalationContact || null,
            escalationPhone: editedCommunication.escalationPhone || null,
          },
        }),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess('Communication preferences updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update communication preferences')
      }
    } catch (err) {
      console.error('Failed to save communication preferences:', err)
      setError('Failed to save communication preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!preferences) return
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/client-portal/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'preferences',
          ...preferences,
        }),
        credentials: 'include',
      })

      if (res.ok) {
        setSuccess('Preferences updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update preferences')
      }
    } catch (err) {
      console.error('Failed to save preferences:', err)
      setError('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/client-portal/profile/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
        credentials: 'include',
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess('Password changed successfully')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (err) {
      console.error('Failed to change password:', err)
      setError('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-700 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'company', label: 'Company' },
            { id: 'brand', label: 'Brand' },
            { id: 'communication', label: 'Communication' },
            { id: 'preferences', label: 'Notifications' },
            { id: 'password', label: 'Password' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id as typeof activeSection)
                setError('')
                setSuccess('')
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}

              {/* Profile Section */}
              {activeSection === 'profile' && profile && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Contact support to change email</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      placeholder="+91 99999 99999"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Role</label>
                    <input
                      type="text"
                      value={profile.role === 'PRIMARY' ? 'Primary User' : profile.role === 'SECONDARY' ? 'Secondary User' : 'Viewer'}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {/* Company Section */}
              {activeSection === 'company' && company && (
                <form onSubmit={handleSaveCompany} className="space-y-4">
                  {!isPrimary && (
                    <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm mb-4">
                      Only primary users can edit company information
                    </div>
                  )}

                  {/* IDs Section */}
                  <div className="p-3 bg-slate-700/50 rounded-lg space-y-2 mb-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">IDs</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Client ID:</span>
                      <code className="text-xs text-blue-400 bg-slate-800 px-2 py-1 rounded font-mono">{company.id}</code>
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="flex items-center gap-4">
                    <ProfilePicture
                      src={company?.logoUrl}
                      name={company?.name || 'Company'}
                      size="xl"
                      editable={isPrimary}
                      onEdit={(url) => setEditedCompany({ ...editedCompany, logoUrl: url || null })}
                      type="client"
                    />
                    <div>
                      <p className="text-white font-medium">{company?.name}</p>
                      <p className="text-sm text-slate-400">
                        {isPrimary ? 'Click to change logo' : 'Only primary users can change logo'}
                      </p>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={editedCompany.name || ''}
                      onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                      disabled={!isPrimary}
                      className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={editedCompany.contactName || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, contactName: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={editedCompany.contactEmail || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, contactEmail: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={editedCompany.contactPhone || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, contactPhone: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        value={editedCompany.whatsapp || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, whatsapp: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={editedCompany.websiteUrl || ''}
                      onChange={(e) => setEditedCompany({ ...editedCompany, websiteUrl: e.target.value })}
                      disabled={!isPrimary}
                      placeholder="https://"
                      className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Address</label>
                    <input
                      type="text"
                      value={editedCompany.address || ''}
                      onChange={(e) => setEditedCompany({ ...editedCompany, address: e.target.value })}
                      disabled={!isPrimary}
                      className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">City</label>
                      <input
                        type="text"
                        value={editedCompany.city || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, city: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">State</label>
                      <input
                        type="text"
                        value={editedCompany.state || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, state: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={editedCompany.pincode || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, pincode: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">GST Number</label>
                      <input
                        type="text"
                        value={editedCompany.gstNumber || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, gstNumber: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Industry</label>
                      <input
                        type="text"
                        value={editedCompany.industry || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, industry: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 font-medium mb-3">Social Media Links</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 w-24 text-sm">Facebook</span>
                        <input
                          type="url"
                          value={editedCompany.facebookUrl || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, facebookUrl: e.target.value })}
                          disabled={!isPrimary}
                          placeholder="https://facebook.com/..."
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 w-24 text-sm">Instagram</span>
                        <input
                          type="url"
                          value={editedCompany.instagramUrl || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, instagramUrl: e.target.value })}
                          disabled={!isPrimary}
                          placeholder="https://instagram.com/..."
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 w-24 text-sm">LinkedIn</span>
                        <input
                          type="url"
                          value={editedCompany.linkedinUrl || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, linkedinUrl: e.target.value })}
                          disabled={!isPrimary}
                          placeholder="https://linkedin.com/..."
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 w-24 text-sm">Twitter</span>
                        <input
                          type="url"
                          value={editedCompany.twitterUrl || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, twitterUrl: e.target.value })}
                          disabled={!isPrimary}
                          placeholder="https://twitter.com/..."
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 w-24 text-sm">YouTube</span>
                        <input
                          type="url"
                          value={editedCompany.youtubeUrl || ''}
                          onChange={(e) => setEditedCompany({ ...editedCompany, youtubeUrl: e.target.value })}
                          disabled={!isPrimary}
                          placeholder="https://youtube.com/..."
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Competitors */}
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 font-medium mb-3">Competitors</p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editedCompany.competitor1 || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, competitor1: e.target.value })}
                        disabled={!isPrimary}
                        placeholder="Competitor 1"
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                      <input
                        type="text"
                        value={editedCompany.competitor2 || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, competitor2: e.target.value })}
                        disabled={!isPrimary}
                        placeholder="Competitor 2"
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                      <input
                        type="text"
                        value={editedCompany.competitor3 || ''}
                        onChange={(e) => setEditedCompany({ ...editedCompany, competitor3: e.target.value })}
                        disabled={!isPrimary}
                        placeholder="Competitor 3"
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      />
                    </div>
                  </div>

                  {isPrimary && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 mt-4"
                    >
                      {saving ? 'Saving...' : 'Save Company Info'}
                    </button>
                  )}
                </form>
              )}

              {/* Brand Section */}
              {activeSection === 'brand' && company && (
                <form onSubmit={handleSaveBrand} className="space-y-4">
                  {!isPrimary && (
                    <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm mb-4">
                      Only primary users can edit brand information
                    </div>
                  )}

                  <p className="text-sm text-slate-400 mb-4">
                    Help us understand your brand identity for better marketing
                  </p>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={editedBrand.tagline}
                      onChange={(e) => setEditedBrand({ ...editedBrand, tagline: e.target.value })}
                      disabled={!isPrimary}
                      placeholder="Your catchy tagline..."
                      className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Brand Voice</label>
                    <select
                      value={editedBrand.brandVoice}
                      onChange={(e) => setEditedBrand({ ...editedBrand, brandVoice: e.target.value })}
                      disabled={!isPrimary}
                      className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                      <option value="">Select brand voice...</option>
                      <option value="professional">Professional & Corporate</option>
                      <option value="friendly">Friendly & Approachable</option>
                      <option value="casual">Casual & Conversational</option>
                      <option value="authoritative">Authoritative & Expert</option>
                      <option value="playful">Playful & Fun</option>
                      <option value="inspirational">Inspirational & Motivating</option>
                      <option value="luxury">Luxury & Premium</option>
                      <option value="technical">Technical & Informative</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">How should your brand communicate?</p>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Target Audience</label>
                    <textarea
                      value={editedBrand.targetAudience}
                      onChange={(e) => setEditedBrand({ ...editedBrand, targetAudience: e.target.value })}
                      disabled={!isPrimary}
                      placeholder="Describe your ideal customers (age, interests, pain points...)"
                      rows={3}
                      className={`w-full px-4 py-2.5 border rounded-lg resize-none ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Unique Selling Proposition (USP)</label>
                    <textarea
                      value={editedBrand.usp}
                      onChange={(e) => setEditedBrand({ ...editedBrand, usp: e.target.value })}
                      disabled={!isPrimary}
                      placeholder="What makes you different from competitors?"
                      rows={3}
                      className={`w-full px-4 py-2.5 border rounded-lg resize-none ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    />
                  </div>

                  {isPrimary && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 mt-4"
                    >
                      {saving ? 'Saving...' : 'Save Brand Info'}
                    </button>
                  )}
                </form>
              )}

              {/* Communication Section */}
              {activeSection === 'communication' && company && (
                <form onSubmit={handleSaveCommunication} className="space-y-4">
                  {!isPrimary && (
                    <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm mb-4">
                      Only primary users can edit communication preferences
                    </div>
                  )}

                  <p className="text-sm text-slate-400 mb-4">
                    Tell us how you prefer to work with our team
                  </p>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Involvement Level</label>
                    <select
                      value={editedCommunication.involvementLevel}
                      onChange={(e) => setEditedCommunication({ ...editedCommunication, involvementLevel: e.target.value })}
                      disabled={!isPrimary}
                      className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                      <option value="">Select involvement level...</option>
                      <option value="hands-off">Hands-off - Trust your team completely</option>
                      <option value="moderate">Moderate - Check in weekly</option>
                      <option value="involved">Involved - Want to approve major decisions</option>
                      <option value="very-involved">Very Involved - Daily updates preferred</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                      <div>
                        <p className="font-medium text-white">Content Approval Required</p>
                        <p className="text-sm text-slate-400">Review content before publishing</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editedCommunication.contentApproval}
                        onChange={(e) => setEditedCommunication({ ...editedCommunication, contentApproval: e.target.checked })}
                        disabled={!isPrimary}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-400 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                      <div>
                        <p className="font-medium text-white">Strategy Decision Input</p>
                        <p className="text-sm text-slate-400">Be consulted on strategy changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editedCommunication.strategyDecisions}
                        onChange={(e) => setEditedCommunication({ ...editedCommunication, strategyDecisions: e.target.checked })}
                        disabled={!isPrimary}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-400 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Reporting Frequency</label>
                      <select
                        value={editedCommunication.reportingFrequency}
                        onChange={(e) => setEditedCommunication({ ...editedCommunication, reportingFrequency: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                        <option value="">Select...</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Meeting Frequency</label>
                      <select
                        value={editedCommunication.meetingFrequency}
                        onChange={(e) => setEditedCommunication({ ...editedCommunication, meetingFrequency: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                        <option value="">Select...</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="as-needed">As Needed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Preferred Channel</label>
                      <select
                        value={editedCommunication.preferredChannel}
                        onChange={(e) => setEditedCommunication({ ...editedCommunication, preferredChannel: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                        <option value="">Select...</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone Call</option>
                        <option value="portal">Client Portal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Preferred Time</label>
                      <select
                        value={editedCommunication.preferredTime}
                        onChange={(e) => setEditedCommunication({ ...editedCommunication, preferredTime: e.target.value })}
                        disabled={!isPrimary}
                        className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                        <option value="">Select...</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-slate-400 font-medium mb-3">Escalation Contact</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Contact Name</label>
                        <input
                          type="text"
                          value={editedCommunication.escalationContact}
                          onChange={(e) => setEditedCommunication({ ...editedCommunication, escalationContact: e.target.value })}
                          disabled={!isPrimary}
                          placeholder="For urgent matters..."
                          className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={editedCommunication.escalationPhone}
                          onChange={(e) => setEditedCommunication({ ...editedCommunication, escalationPhone: e.target.value })}
                          disabled={!isPrimary}
                          placeholder="+91 99999 99999"
                          className={`w-full px-4 py-2.5 border rounded-lg ${isPrimary ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {isPrimary && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 mt-4"
                    >
                      {saving ? 'Saving...' : 'Save Communication Preferences'}
                    </button>
                  )}
                </form>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && preferences && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 mb-4">
                    Choose how you want to receive notifications
                  </p>

                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'whatsappNotifications', label: 'WhatsApp Notifications', desc: 'Receive updates via WhatsApp' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                  ].map((pref) => (
                    <label
                      key={pref.key}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-white">{pref.label}</p>
                        <p className="text-sm text-slate-400">{pref.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences[pref.key as keyof Preferences]}
                        onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-400 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </label>
                  ))}

                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 mt-4"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              )}

              {/* Password Section */}
              {activeSection === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <p className="text-sm text-slate-400 mb-4">
                    Set or change your password for direct login access
                  </p>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Leave empty if not set"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
