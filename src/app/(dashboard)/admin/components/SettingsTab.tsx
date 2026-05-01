'use client'

import Link from 'next/link'
import { SystemSettings } from './types'

interface SettingsTabProps {
  settings: SystemSettings
}

export default function SettingsTab({ settings }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Company Entities */}
      <div className="glass-card rounded-xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Company Entities</h3>
            <p className="text-sm text-slate-400">Manage your business entities and bank accounts</p>
          </div>
          <Link
            href="/admin/entities"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Manage Entities
          </Link>
        </div>
        <div className="space-y-3">
          {settings.entities.map(entity => (
            <div key={entity.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg">
              <div>
                <p className="font-medium text-white">{entity.name}</p>
                <p className="text-xs text-slate-400">{entity.code} {entity.tradeName ? `- ${entity.tradeName}` : ''}</p>
              </div>
              {entity.isPrimary && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">Primary</span>
              )}
            </div>
          ))}
          {settings.entities.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No entities configured</p>
          )}
        </div>
      </div>

      {/* System Configuration */}
      <div className="glass-card rounded-xl border border-white/10 p-5">
        <h3 className="font-semibold text-white mb-4">System Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-xs text-slate-400">Configure email settings</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">WhatsApp Integration</p>
                <p className="text-xs text-slate-400">WBizTool API settings</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Payment Gateways</p>
                <p className="text-xs text-slate-400">Razorpay, Stripe settings</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Attendance Settings</p>
                <p className="text-xs text-slate-400">MyZen biometric integration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Notifications */}
      <div className="glass-card rounded-xl border border-white/10 p-5">
        <h3 className="font-semibold text-white mb-2">Scheduled WhatsApp Notifications</h3>
        <p className="text-sm text-slate-400 mb-4">Automated notifications sent to employees and clients via WhatsApp</p>

        <div className="space-y-4">
          {/* Daily Notifications */}
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Daily Notifications</p>
                  <p className="text-xs text-slate-400">9:00 AM IST every day</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Active</span>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <p>- Task reminders for planned tasks</p>
              <p>- Meeting reminders</p>
              <p>- Follow-up reminders for sales</p>
            </div>
          </div>

          {/* Weekly Notifications */}
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Weekly Summaries</p>
                  <p className="text-xs text-slate-400">Every Monday at 9:00 AM IST</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Active</span>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <p>- Performance summary to managers</p>
              <p>- Task completion summary to employees</p>
              <p>- Sales pipeline summary</p>
              <p>- Client health alerts</p>
            </div>
          </div>

          {/* Monthly Notifications */}
          <div className="border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Monthly Reports</p>
                  <p className="text-xs text-slate-400">1st of every month at 10:00 AM IST</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Active</span>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <p>- Monthly performance reports to employees</p>
              <p>- Revenue summary to super admins</p>
              <p>- Client retention report to managers</p>
              <p>- Invoice reminders to clients</p>
              <p>- Report ready notifications to clients</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-slate-400">
            Notifications are powered by WBizTool WhatsApp API. Make sure the WBIZTOOL_CLIENT_ID, WBIZTOOL_API_KEY, and WBIZTOOL_WHATSAPP_CLIENT environment variables are configured.
          </p>
        </div>
      </div>
    </div>
  )
}
