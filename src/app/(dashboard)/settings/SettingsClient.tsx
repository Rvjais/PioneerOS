'use client'

import { useState, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardHeader, CardContent } from '@/client/components/ui'
import { TwoFactorSettings } from '@/client/components/settings/TwoFactorSettings'
import { SessionManagement } from '@/client/components/settings/SessionManagement'
import PageGuide from '@/client/components/ui/PageGuide'

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  role: string
  profilePicture: string | null
  linkedIn: string | null
  bio: string | null
  skills: string | null
  ndaSigned: boolean
  ndaSignedAt: string | null
}

interface Props {
  user: UserData
}

export function SettingsClient({ user }: Props) {
  const { update: updateSession } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'system'>('profile')
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [phone, setPhone] = useState(user.phone)
  const [linkedIn, setLinkedIn] = useState(user.linkedIn || '')
  const [bio, setBio] = useState(user.bio || '')
  const [skills, setSkills] = useState(user.skills || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '')
  const [profilePictureUrl, setProfilePictureUrl] = useState(user.profilePicture || '')
  const [urlError, setUrlError] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const initials = `${user.firstName[0]}${user.lastName?.[0] || ''}`
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'pioneer-os/profiles')

      const uploadRes = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const { url } = await uploadRes.json()

      // Save URL to user profile
      const profileRes = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: url }),
      })

      if (profileRes.ok) {
        setProfilePicture(url)
        await updateSession({ profilePicture: url })
        setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' })
      } else {
        throw new Error('Failed to save profile picture')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred during upload' })
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true)
    setMessage(null)

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: '' }),
      })

      if (res.ok) {
        setProfilePicture('')
        // Update NextAuth session to clear profile picture
        await updateSession({ profilePicture: null })
        setMessage({ type: 'success', text: 'Profile photo removed' })
      } else {
        setMessage({ type: 'error', text: 'Failed to remove profile photo' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, linkedIn, bio, skills }),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfilePictureUrl = async () => {
    if (!profilePictureUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid URL' })
      return
    }
    setIsUploadingPhoto(true)
    setMessage(null)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: profilePictureUrl }),
      })
      if (res.ok) {
        setProfilePicture(profilePictureUrl)
        setShowUrlInput(false)
        // Update NextAuth session with new profile picture
        await updateSession({ profilePicture: profilePictureUrl })
        setMessage({ type: 'success', text: 'Profile picture updated!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile picture' })
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageGuide
        pageKey="settings"
        title="Settings"
        description="Configure your profile, notification preferences, and account settings."
        steps={[
          { label: 'Update profile', description: 'Edit your name, phone, bio, and skills' },
          { label: 'Manage notifications', description: 'Control email and in-app alerts' },
          { label: 'Security settings', description: 'Set up 2FA and manage active sessions' },
        ]}
      />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and system preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'security', label: 'Security' },
          { id: 'system', label: 'System' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-200' : 'bg-red-500/10 text-red-400 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="font-semibold text-white">Personal Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                  <input
                    type="text"
                    value={user.department}
                    disabled
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <input
                    type="text"
                    value={user.role.replace(/_/g, ' ')}
                    disabled
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your experience, and interests..."
                  rows={3}
                  className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., SEO, Content Writing, Analytics, Google Ads"
                  className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {skills && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.split(',').map((skill, i) => skill.trim() && (
                      <span key={`skill-${skill.trim()}`} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white">Profile Photo <span className="text-red-500">*</span></h3>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-4">
                {profilePicture ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10">
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white/10">
                    <span className="text-white font-bold text-3xl">{initials}</span>
                  </div>
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>

              {!profilePicture && (
                <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full mb-3">
                  Profile photo is required
                </p>
              )}

              <div className="w-full space-y-3">
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadPhoto}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {isUploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
                  </button>
                  {profilePicture && (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto}
                      className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Supported formats: JPG, PNG, WebP
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">Notification Preferences</h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">Coming soon</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-slate-400">Notification preferences will be configurable in a future update. The settings below show default values.</p>
            {[
              { id: 'whatsapp', label: 'WhatsApp Notifications', description: 'Get WhatsApp messages for reminders and updates', enabled: true },
              { id: 'email', label: 'Email Notifications', description: 'Receive email alerts for task assignments and leave updates', enabled: true },
              { id: 'push', label: 'Push Notifications', description: 'Browser push notifications for real-time alerts', enabled: false },
              { id: 'task', label: 'Task Assignments', description: 'Notify when new tasks are assigned to you', enabled: true },
              { id: 'meeting', label: 'Meeting Reminders', description: 'Get reminded 15 minutes before meetings', enabled: true },
              { id: 'arcade', label: 'Arcade Updates', description: 'XP gains, achievements, and leaderboard changes', enabled: false },
            ].map((pref) => (
              <div key={pref.id} className="flex items-center justify-between opacity-60">
                <div>
                  <p className="text-white font-medium">{pref.label}</p>
                  <p className="text-sm text-slate-400">{pref.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input
                    type="checkbox"
                    defaultChecked={pref.enabled}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:glass-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <TwoFactorSettings />

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white">Authentication</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-medium">Passwordless Authentication</p>
                  <p className="text-sm text-slate-400 mt-1">Authentication is handled via magic links. No password required. You will receive a secure login link via email each time you sign in.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white">Document Verification Status</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { doc: 'Perpetual NDA', status: user.ndaSigned ? 'signed' : 'pending', date: user.ndaSignedAt || '-' },
                  { doc: 'Policy Charter', status: 'pending', date: '-' },
                  { doc: 'Aadhar Verification', status: 'pending', date: '-' },
                  { doc: 'PAN Verification', status: 'pending', date: '-' },
                ].map((doc) => (
                  <div key={doc.doc} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      {doc.status === 'signed' || doc.status === 'verified' ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className="text-white">{doc.doc}</span>
                    </div>
                    <span className="text-sm text-slate-400">
                      {doc.date !== '-' ? new Date(doc.date).toLocaleDateString('en-IN') : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <SessionManagement />
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white">System Information</h3>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Version', value: 'PioneerOS v1.0.0' },
                  { label: 'Environment', value: 'Production' },
                  { label: 'Last Updated', value: 'March 2026' },
                  { label: 'Database', value: 'SQLite (Healthy)' },
                ].map((info) => (
                  <div key={info.label} className="p-3 bg-slate-900/40 rounded-lg border border-white/10">
                    <p className="text-sm text-slate-400">{info.label}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white">Danger Zone</h3>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg">
                <h4 className="text-red-400 font-medium">Clear Local Data</h4>
                <p className="text-sm text-red-400 mt-1">This will clear all cached data and log you out. Your account data will not be affected.</p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all local data and log out? This action cannot be undone.')) {
                      localStorage.clear()
                      sessionStorage.clear()
                      signOut({ callbackUrl: '/login' })
                    }
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Data
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
