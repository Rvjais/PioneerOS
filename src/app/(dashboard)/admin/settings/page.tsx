'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: string
  settings: Setting[]
}

interface Setting {
  key: string
  label: string
  value: string | boolean
  type: 'text' | 'toggle' | 'select'
  options?: string[]
}

const SETTING_SECTIONS: SettingSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Basic application configuration',
    icon: '⚙️',
    settings: [
      { key: 'company_name', label: 'Company Name', value: 'Branding Pioneers', type: 'text' },
      { key: 'timezone', label: 'Timezone', value: 'Asia/Kolkata', type: 'select', options: ['Asia/Kolkata', 'UTC', 'America/New_York'] },
      { key: 'date_format', label: 'Date Format', value: 'DD/MM/YYYY', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
      { key: 'fiscal_year_start', label: 'Fiscal Year Start', value: 'April', type: 'select', options: ['January', 'April'] },
    ],
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Configure system notifications',
    icon: '🔔',
    settings: [
      { key: 'email_notifications', label: 'Email Notifications', value: true, type: 'toggle' },
      { key: 'whatsapp_notifications', label: 'WhatsApp Notifications', value: true, type: 'toggle' },
      { key: 'task_reminders', label: 'Task Reminders', value: true, type: 'toggle' },
      { key: 'daily_digest', label: 'Daily Digest Email', value: false, type: 'toggle' },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance Settings',
    description: 'Configure attendance tracking',
    icon: '📅',
    settings: [
      { key: 'work_start_time', label: 'Work Start Time', value: '09:00', type: 'text' },
      { key: 'work_end_time', label: 'Work End Time', value: '18:00', type: 'text' },
      { key: 'late_threshold_mins', label: 'Late Threshold (mins)', value: '15', type: 'text' },
      { key: 'auto_checkout', label: 'Auto Checkout', value: true, type: 'toggle' },
    ],
  },
  {
    id: 'meetings',
    title: 'Meeting Settings',
    description: 'Configure meeting defaults',
    icon: '📆',
    settings: [
      { key: 'huddle_time', label: 'Daily Huddle Time', value: '11:00', type: 'text' },
      { key: 'tactical_deadline', label: 'Tactical Submission Day', value: '3', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { key: 'mom_required', label: 'Require MoM for Online', value: true, type: 'toggle' },
      { key: 'auto_reminders', label: 'Auto Meeting Reminders', value: true, type: 'toggle' },
    ],
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Security and access controls',
    icon: '🔒',
    settings: [
      { key: 'session_timeout', label: 'Session Timeout (hours)', value: '24', type: 'select', options: ['8', '12', '24', '72'] },
      { key: 'require_2fa', label: 'Require 2FA for Admins', value: false, type: 'toggle' },
      { key: 'ip_whitelist', label: 'IP Whitelist Enabled', value: false, type: 'toggle' },
      { key: 'audit_logging', label: 'Audit Logging', value: true, type: 'toggle' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integration Settings',
    description: 'Third-party integrations',
    icon: '🔗',
    settings: [
      { key: 'whatsapp_enabled', label: 'WhatsApp Integration', value: true, type: 'toggle' },
      { key: 'google_calendar', label: 'Google Calendar Sync', value: false, type: 'toggle' },
      { key: 'slack_enabled', label: 'Slack Integration', value: false, type: 'toggle' },
      { key: 'ai_suggestions', label: 'AI Suggestions', value: true, type: 'toggle' },
    ],
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {}
    SETTING_SECTIONS.forEach(section => {
      section.settings.forEach(setting => {
        initial[setting.key] = setting.value
      })
    })
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch settings from API on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setToast({ message: 'Failed to load settings', type: 'error' })
        setTimeout(() => setToast(null), 3000)
      })
  }, [])

  const handleChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ message: 'Settings saved successfully', type: 'success' })
      } else {
        setToast({ message: data.error || 'Failed to save settings', type: 'error' })
      }
    } catch {
      setToast({ message: 'Failed to save settings', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 text-white rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {toast.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          {toast.message}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-purple-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-white">Loading settings...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span>Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 mt-1">Configure application-wide settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SETTING_SECTIONS.map(section => (
          <div key={section.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center gap-3">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <h2 className="font-semibold text-white">{section.title}</h2>
                <p className="text-xs text-slate-400">{section.description}</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {section.settings.map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <label htmlFor={setting.key} className="text-sm text-slate-300">
                    {setting.label}
                  </label>
                  {setting.type === 'toggle' ? (
                    <button
                      onClick={() => handleChange(setting.key, !settings[setting.key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[setting.key] ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full glass-card transition-transform ${
                          settings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : setting.type === 'select' ? (
                    <select
                      id={setting.key}
                      value={settings[setting.key] as string}
                      onChange={e => handleChange(setting.key, e.target.value)}
                      className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    >
                      {setting.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={setting.key}
                      type="text"
                      value={settings[setting.key] as string}
                      onChange={e => handleChange(setting.key, e.target.value)}
                      className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm w-32"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/entities"
            className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">🏢</span>
            <span className="text-white text-sm">Company Entities</span>
          </Link>
          <Link
            href="/admin/custom-roles"
            className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">👤</span>
            <span className="text-white text-sm">Custom Roles</span>
          </Link>
          <Link
            href="/whatsapp/admin"
            className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">💬</span>
            <span className="text-white text-sm">WhatsApp Config</span>
          </Link>
          <Link
            href="/admin/audit-log"
            className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📋</span>
            <span className="text-white text-sm">Audit Logs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
