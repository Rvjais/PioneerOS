'use client'

import { useState } from 'react'
import { HealthOverview } from './components/HealthOverview'
import { ApiCredentialsTab } from './components/ApiCredentialsTab'
import { ServiceAccountsTab } from './components/ServiceAccountsTab'
import { OAuthConnectionsTab } from './components/OAuthConnectionsTab'
import { AccessRequestsTab } from './components/AccessRequestsTab'
import { AuditLogTab } from './components/AuditLogTab'
import { AnalyticsTab } from './components/AnalyticsTab'

type TabId = 'credentials' | 'service-accounts' | 'oauth' | 'access-requests' | 'analytics' | 'audit'

const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  {
    id: 'credentials',
    label: 'API Credentials',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'service-accounts',
    label: 'Service Accounts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'oauth',
    label: 'OAuth Connections',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    id: 'access-requests',
    label: 'Access Requests',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'audit',
    label: 'Audit Log',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

export function ApiManagementDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('credentials')

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <HealthOverview />

      {/* Tab Navigation */}
      <div className="glass-card rounded-xl border border-white/10 p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass-card rounded-xl border border-white/10">
        {activeTab === 'credentials' && <ApiCredentialsTab />}
        {activeTab === 'service-accounts' && <ServiceAccountsTab />}
        {activeTab === 'oauth' && <OAuthConnectionsTab />}
        {activeTab === 'access-requests' && <AccessRequestsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'audit' && <AuditLogTab />}
      </div>
    </div>
  )
}
