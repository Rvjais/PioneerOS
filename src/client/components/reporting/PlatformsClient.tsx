'use client'

import { useState } from 'react'
import PlatformAccountCard from './PlatformAccountCard'
import AddAccountModal from './AddAccountModal'
import ImportDataModal from './ImportDataModal'
import ImportHistory from './ImportHistory'
import { Account, ImportBatch } from './types'

// Platform configuration
const PLATFORMS = [
  { key: 'GOOGLE_ANALYTICS', name: 'Google Analytics', shortName: 'GA', color: '#F9AB00', icon: 'BarChart2' },
  { key: 'GOOGLE_SEARCH_CONSOLE', name: 'Google Search Console', shortName: 'GSC', color: '#4285F4', icon: 'Search' },
  { key: 'GOOGLE_ADS', name: 'Google Ads', shortName: 'GAds', color: '#34A853', icon: 'Target' },
  { key: 'META_ADS', name: 'Meta Ads', shortName: 'Meta', color: '#1877F2', icon: 'DollarSign' },
  { key: 'META_SOCIAL', name: 'Meta Social', shortName: 'Social', color: '#E4405F', icon: 'Users' },
  { key: 'LINKEDIN', name: 'LinkedIn', shortName: 'LI', color: '#0A66C2', icon: 'Linkedin' },
  { key: 'YOUTUBE', name: 'YouTube', shortName: 'YT', color: '#FF0000', icon: 'Youtube' },
] as const

interface Props {
  clientId: string
  clientName: string
  initialAccounts: Account[]
  initialImportBatches: ImportBatch[]
}

export default function PlatformsClient({
  clientId,
  clientName,
  initialAccounts,
  initialImportBatches,
}: Props) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [importBatches, setImportBatches] = useState<ImportBatch[]>(initialImportBatches)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  // Group accounts by platform
  const accountsByPlatform = PLATFORMS.map((platform) => ({
    ...platform,
    accounts: accounts.filter((a) => a.platform === platform.key),
  }))

  // Handle account added
  const handleAccountAdded = (account: Account) => {
    setAccounts((prev) => [...prev, account])
    setShowAddModal(false)
  }

  // Handle account updated
  const handleAccountUpdated = (updated: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  // Handle account deleted
  const handleAccountDeleted = (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId))
  }

  // Handle import completed
  const handleImportCompleted = (batch: ImportBatch) => {
    setImportBatches((prev) => [batch, ...prev])
    // Refresh accounts to get updated metrics count
    fetchAccounts()
  }

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/platform-accounts`)
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    }
  }

  // Open import modal for specific account
  const openImportForAccount = (account: Account) => {
    setSelectedAccount(account)
    setShowImportModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {accountsByPlatform.map((platform) => (
          <div
            key={platform.key}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <span style={{ color: platform.color }} className="text-sm font-bold">
                    {platform.shortName}
                  </span>
                </div>
                <span className="font-medium text-white">{platform.name}</span>
              </div>
              <span className="text-xs text-slate-400">
                {platform.accounts.length} account{platform.accounts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {platform.accounts.length > 0 ? (
              <div className="space-y-2">
                {platform.accounts.map((account) => (
                  <PlatformAccountCard
                    key={account.id}
                    account={account}
                    clientId={clientId}
                    onUpdate={handleAccountUpdated}
                    onDelete={handleAccountDeleted}
                    onImport={() => openImportForAccount(account)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-sm">
                No accounts connected
              </div>
            )}

            <button
              onClick={() => {
                setSelectedPlatform(platform.key)
                setShowAddModal(true)
              }}
              className="mt-3 w-full px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Account
            </button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-medium text-white">Add Account</p>
            <p className="text-slate-400 text-sm">Add a manual account</p>
          </button>

          <button
            onClick={() => {
              setSelectedAccount(null)
              setShowImportModal(true)
            }}
            className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="font-medium text-white">Import Data</p>
            <p className="text-slate-400 text-sm">CSV, Excel, or paste</p>
          </button>

          <a
            href={`/api/clients/${clientId}/import/templates/GOOGLE_ANALYTICS?format=csv`}
            className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-white">Download Template</p>
            <p className="text-slate-400 text-sm">Get CSV template</p>
          </a>

          <a
            href={`/clients/${clientId}/integrations`}
            className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="font-medium text-white">OAuth Connect</p>
            <p className="text-slate-400 text-sm">Auto-sync via OAuth</p>
          </a>
        </div>
      </div>

      {/* Import History */}
      <ImportHistory
        batches={importBatches}
        clientId={clientId}
        onBatchDeleted={(batchId) => {
          setImportBatches((prev) => prev.filter((b) => b.id !== batchId))
        }}
      />

      {/* Add Account Modal */}
      {showAddModal && (
        <AddAccountModal
          clientId={clientId}
          clientName={clientName}
          defaultPlatform={selectedPlatform}
          onClose={() => {
            setShowAddModal(false)
            setSelectedPlatform(null)
          }}
          onAccountAdded={handleAccountAdded}
        />
      )}

      {/* Import Data Modal */}
      {showImportModal && (
        <ImportDataModal
          clientId={clientId}
          accounts={accounts}
          selectedAccount={selectedAccount}
          onClose={() => {
            setShowImportModal(false)
            setSelectedAccount(null)
          }}
          onImportCompleted={handleImportCompleted}
        />
      )}
    </div>
  )
}
