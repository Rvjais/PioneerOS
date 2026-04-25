'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface Domain {
  id: string
  clientId: string
  domainName: string
  registrar: string
  registrationDate: Date
  expiryDate: Date
  autoRenew: boolean
  nameservers: string | null
  dnsProvider: string | null
  sslStatus: string
  sslExpiryDate: Date | null
  sslProvider: string | null
  purchasedBy: string
  annualCost: number | null
  loginUrl: string | null
  notes: string | null
  client: {
    id: string
    name: string
  }
}

interface DomainCardProps {
  domain: Domain
  variant?: 'expired' | 'critical' | 'warning' | 'healthy'
}

const variantStyles = {
  expired: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400',
    badgeText: 'EXPIRED',
  },
  critical: {
    border: 'border-red-500/30',
    bg: 'bg-slate-800/50',
    badge: 'bg-red-500/20 text-red-400',
    badgeText: 'CRITICAL',
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-slate-800/50',
    badge: 'bg-amber-500/20 text-amber-400',
    badgeText: 'WARNING',
  },
  healthy: {
    border: 'border-green-500/30',
    bg: 'bg-slate-800/50',
    badge: 'bg-green-500/20 text-green-400',
    badgeText: 'HEALTHY',
  },
}

export function DomainCard({ domain, variant = 'healthy' }: DomainCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const styles = variantStyles[variant]
  const now = new Date()
  const expiryDate = new Date(domain.expiryDate)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const sslExpiryDate = domain.sslExpiryDate ? new Date(domain.sslExpiryDate) : null
  const sslDaysUntilExpiry = sslExpiryDate
    ? Math.ceil((sslExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl overflow-hidden`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{domain.domainName}</h3>
            <Link
              href={`/web/clients/${domain.clientId}`}
              className="text-sm text-slate-400 hover:text-indigo-400"
            >
              {domain.client.name}
            </Link>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${styles.badge}`}>
            {styles.badgeText}
          </span>
        </div>

        {/* Expiry Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Expires</span>
            <span
              className={`font-medium ${daysUntilExpiry < 0 ? 'text-red-400' : daysUntilExpiry <= 30 ? 'text-red-400' : daysUntilExpiry <= 90 ? 'text-amber-400' : 'text-green-400'}`}
            >
              {daysUntilExpiry < 0
                ? `${Math.abs(daysUntilExpiry)} days ago`
                : `${daysUntilExpiry} days`}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Registrar</span>
            <span className="text-white">{domain.registrar}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">SSL</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${domain.sslStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
            >
              {domain.sslStatus}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Auto-Renew</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${domain.autoRenew ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}
            >
              {domain.autoRenew ? 'ON' : 'OFF'}
            </span>
          </div>
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
            <div>
              <p className="text-slate-500">Registration Date</p>
              <p className="text-white">{formatDateDDMMYYYY(domain.registrationDate)}</p>
            </div>
            <div>
              <p className="text-slate-500">Expiry Date</p>
              <p className="text-white">{formatDateDDMMYYYY(expiryDate)}</p>
            </div>
            {domain.dnsProvider && (
              <div>
                <p className="text-slate-500">DNS Provider</p>
                <p className="text-white">{domain.dnsProvider}</p>
              </div>
            )}
            {domain.sslProvider && (
              <div>
                <p className="text-slate-500">SSL Provider</p>
                <p className="text-white">{domain.sslProvider}</p>
              </div>
            )}
            {sslExpiryDate && (
              <div>
                <p className="text-slate-500">SSL Expires</p>
                <p
                  className={
                    sslDaysUntilExpiry && sslDaysUntilExpiry < 30 ? 'text-red-400' : 'text-white'
                  }
                >
                  {formatDateDDMMYYYY(sslExpiryDate)}
                </p>
              </div>
            )}
            {domain.annualCost && (
              <div>
                <p className="text-slate-500">Annual Cost</p>
                <p className="text-white">₹{domain.annualCost.toLocaleString('en-IN')}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500">Purchased By</p>
              <p className="text-white">{domain.purchasedBy}</p>
            </div>
          </div>

          {domain.notes && (
            <div>
              <p className="text-slate-500 text-sm">Notes</p>
              <p className="text-sm text-white">{domain.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {domain.loginUrl && (
              <a
                href={domain.loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-center text-sm bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20"
              >
                Open Registrar
              </a>
            )}
            <Link
              href={`/web/infrastructure/domains/${domain.id}/edit`}
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
