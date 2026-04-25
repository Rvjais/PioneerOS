'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface HostingAccount {
  id: string
  clientId: string
  provider: string
  planType: string
  planName: string | null
  serverLocation: string | null
  monthlyCost: number
  renewalDate: Date
  storageGB: number | null
  bandwidthGB: number | null
  ipAddress: string | null
  cpanelUrl: string | null
  sshAccess: boolean
  sshHost: string | null
  sshPort: number | null
  purchasedBy: string
  status: string
  loginUrl: string | null
  notes: string | null
  client: {
    id: string
    name: string
  }
}

interface HostingCardProps {
  account: HostingAccount
  variant?: 'warning' | 'healthy' | 'suspended'
}

const variantStyles = {
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-slate-800/50',
    badge: 'bg-amber-500/20 text-amber-400',
    badgeText: 'RENEWING SOON',
  },
  healthy: {
    border: 'border-green-500/30',
    bg: 'bg-slate-800/50',
    badge: 'bg-green-500/20 text-green-400',
    badgeText: 'ACTIVE',
  },
  suspended: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400',
    badgeText: 'SUSPENDED',
  },
}

const providerColors: Record<string, string> = {
  AWS: 'from-orange-500 to-yellow-500',
  DigitalOcean: 'from-blue-500 to-cyan-500',
  Hostinger: 'from-purple-500 to-pink-500',
  Vercel: 'from-slate-500 to-slate-600',
  Netlify: 'from-teal-500 to-emerald-500',
  GoDaddy: 'from-green-500 to-lime-500',
  Cloudflare: 'from-orange-500 to-red-500',
  default: 'from-indigo-500 to-purple-500',
}

export function HostingCard({ account, variant = 'healthy' }: HostingCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const styles = variantStyles[account.status === 'SUSPENDED' ? 'suspended' : variant]
  const now = new Date()
  const renewalDate = new Date(account.renewalDate)
  const daysUntilRenewal = Math.ceil(
    (renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const providerColor = providerColors[account.provider] || providerColors.default

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl overflow-hidden`}>
      <div className="p-4">
        {/* Provider Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${providerColor} flex items-center justify-center text-white font-bold text-sm`}
            >
              {account.provider.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-white">{account.provider}</h3>
              <Link
                href={`/web/clients/${account.clientId}`}
                className="text-sm text-slate-400 hover:text-indigo-400"
              >
                {account.client.name}
              </Link>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${styles.badge}`}>
            {styles.badgeText}
          </span>
        </div>

        {/* Plan Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Plan</span>
            <span className="text-white">
              {account.planType}
              {account.planName && ` - ${account.planName}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Monthly Cost</span>
            <span className="text-green-400 font-medium">
              ₹{account.monthlyCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Renewal</span>
            <span
              className={`font-medium ${daysUntilRenewal <= 30 ? 'text-amber-400' : 'text-green-400'}`}
            >
              {daysUntilRenewal} days
            </span>
          </div>

          {account.serverLocation && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Location</span>
              <span className="text-white">{account.serverLocation}</span>
            </div>
          )}
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 w-full py-2 text-sm text-slate-400 hover:text-white flex items-center justify-center gap-1"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
          <svg
            className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Extended Details */}
      {showDetails && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {account.storageGB && (
              <div>
                <p className="text-slate-500">Storage</p>
                <p className="text-white">{account.storageGB} GB</p>
              </div>
            )}
            {account.bandwidthGB && (
              <div>
                <p className="text-slate-500">Bandwidth</p>
                <p className="text-white">{account.bandwidthGB} GB</p>
              </div>
            )}
            {account.ipAddress && (
              <div>
                <p className="text-slate-500">IP Address</p>
                <p className="text-white font-mono text-xs">{account.ipAddress}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500">SSH Access</p>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${account.sshAccess ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}
              >
                {account.sshAccess ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <p className="text-slate-500">Purchased By</p>
              <p className="text-white">{account.purchasedBy}</p>
            </div>
            <div>
              <p className="text-slate-500">Renewal Date</p>
              <p className="text-white">{formatDateDDMMYYYY(renewalDate)}</p>
            </div>
          </div>

          {account.notes && (
            <div>
              <p className="text-slate-500 text-sm">Notes</p>
              <p className="text-sm text-white">{account.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {account.cpanelUrl && (
              <a
                href={account.cpanelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-center text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20"
              >
                cPanel
              </a>
            )}
            {account.loginUrl && (
              <a
                href={account.loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-center text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20"
              >
                Dashboard
              </a>
            )}
            <Link
              href={`/web/infrastructure/hosting/${account.id}/edit`}
              className="flex-1 py-2 text-center text-sm bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Edit
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
