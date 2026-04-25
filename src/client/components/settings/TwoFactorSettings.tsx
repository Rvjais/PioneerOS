'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { Card, CardHeader, CardContent } from '@/client/components/ui'

type SetupStep = 'idle' | 'loading' | 'scan' | 'verify' | 'backup' | 'complete'

interface BackupCodesModalProps {
  codes: string[]
  onClose: () => void
}

function BackupCodesModal({ codes, onClose }: BackupCodesModalProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCodes = () => {
    const content = `Pioneer OS - Two-Factor Authentication Backup Codes\n\nThese codes can be used to access your account if you lose your authenticator device.\nEach code can only be used once.\n\n${codes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pioneer-os-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-xl shadow-none max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Save Your Backup Codes</h3>
            <p className="text-sm text-slate-400">Store these codes in a safe place</p>
          </div>
        </div>

        <div className="bg-slate-900/40 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-2">
            {codes.map((code, i) => (
              <div key={`code-${code}`} className="font-mono text-sm text-center py-2 glass-card rounded border border-white/10">
                {code}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          These codes can be used to sign in if you lose access to your authenticator app.
          Each code can only be used once.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={copyToClipboard}
            className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={downloadCodes}
            className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          I've Saved My Codes
        </button>
      </div>
    </div>
  )
}

export function TwoFactorSettings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [enabledAt, setEnabledAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [setupStep, setSetupStep] = useState<SetupStep>('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auth/2fa/status')
      if (res.ok) {
        const data = await res.json()
        setIsEnabled(data.enabled)
        setEnabledAt(data.enabledAt)
      }
    } catch (err) {
      console.error('Failed to fetch 2FA status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const startSetup = async () => {
    setSetupStep('loading')
    setError('')
    try {
      const res = await fetch('/api/auth/2fa/setup')
      if (res.ok) {
        const data = await res.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setBackupCodes(data.backupCodes)
        setSetupStep('scan')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to start 2FA setup')
        setSetupStep('idle')
      }
    } catch (err) {
      setError('Failed to start 2FA setup')
      setSetupStep('idle')
    }
  }

  const verifySetup = async () => {
    if (token.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setSetupStep('loading')
    setError('')
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, mode: 'setup' }),
      })

      if (res.ok) {
        setSetupStep('backup')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid code')
        setSetupStep('verify')
      }
    } catch (err) {
      setError('Failed to verify code')
      setSetupStep('verify')
    }
  }

  const completeSetup = () => {
    setIsEnabled(true)
    setEnabledAt(new Date().toISOString())
    setSetupStep('idle')
    setToken('')
    setQrCode('')
    setSecret('')
  }

  const disable2FA = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    setError('')
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setIsEnabled(false)
        setEnabledAt(null)
        setShowDisableModal(false)
        setPassword('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to disable 2FA')
      }
    } catch (err) {
      setError('Failed to disable 2FA')
    }
  }

  const regenerateBackupCodes = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    setError('')
    try {
      const res = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        const data = await res.json()
        setBackupCodes(data.backupCodes)
        setShowRegenerateModal(false)
        setShowBackupCodes(true)
        setPassword('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to regenerate backup codes')
      }
    } catch (err) {
      setError('Failed to regenerate backup codes')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-10 bg-white/10 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
            {isEnabled && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                Enabled
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEnabled && setupStep === 'idle' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Add an extra layer of security to your account by enabling two-factor authentication.
                You'll need to enter a code from your authenticator app each time you sign in.
              </p>
              <button
                onClick={startSetup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enable 2FA
              </button>
            </div>
          )}

          {setupStep === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}

          {setupStep === 'scan' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <p className="text-slate-300 text-center mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                {qrCode && (
                  <Image src={qrCode} alt="QR Code" width={192} height={192} className="w-48 h-48 border border-white/10 rounded-lg" unoptimized />
                )}
                <div className="mt-4 p-3 bg-slate-900/40 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Or enter this code manually:</p>
                  <code className="text-sm font-mono text-white">{secret}</code>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSetupStep('idle')}
                  className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSetupStep('verify')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {setupStep === 'verify' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Enter the 6-digit code from your authenticator app to verify setup:
              </p>
              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSetupStep('scan')
                    setError('')
                    setToken('')
                  }}
                  className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={verifySetup}
                  disabled={token.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {setupStep === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-green-800">2FA Enabled Successfully!</span>
                </div>
                <p className="text-sm text-green-400">
                  Please save your backup codes before continuing. You'll need them if you lose access to your authenticator app.
                </p>
              </div>

              <div className="bg-slate-900/40 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <div key={`backup-${code}`} className="font-mono text-sm text-center py-2 glass-card rounded border border-white/10">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}
                  className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Copy Codes
                </button>
                <button
                  onClick={completeSetup}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {isEnabled && setupStep === 'idle' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="font-medium text-green-800">Your account is protected</p>
                  <p className="text-sm text-green-400">
                    Enabled on {enabledAt ? formatDateDDMMYYYY(enabledAt) : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowRegenerateModal(true)}
                  className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Regenerate Backup Codes
                </button>
                <button
                  onClick={() => setShowDisableModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl shadow-none max-w-md w-full p-6">
            <h3 className="font-semibold text-white mb-2">Disable Two-Factor Authentication</h3>
            <p className="text-slate-300 text-sm mb-4">
              This will remove the extra security layer from your account. Enter your password to confirm.
            </p>
            {error && (
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDisableModal(false)
                  setPassword('')
                  setError('')
                }}
                className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={disable2FA}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Backup Codes Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl shadow-none max-w-md w-full p-6">
            <h3 className="font-semibold text-white mb-2">Regenerate Backup Codes</h3>
            <p className="text-slate-300 text-sm mb-4">
              This will invalidate all existing backup codes and generate new ones. Enter your password to confirm.
            </p>
            {error && (
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 glass-card border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRegenerateModal(false)
                  setPassword('')
                  setError('')
                }}
                className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={regenerateBackupCodes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Display Modal */}
      {showBackupCodes && (
        <BackupCodesModal
          codes={backupCodes}
          onClose={() => setShowBackupCodes(false)}
        />
      )}
    </>
  )
}
