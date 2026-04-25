'use client'

import { useState } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Image from 'next/image'
import {
  Video, Plus, CheckCircle, Clock, Award, Gift, Play,
  ExternalLink, X, Send, Eye, Loader2, Star, User
} from 'lucide-react'

interface Testimonial {
  id: string
  requestedById: string
  requestedBy: {
    id: string
    firstName: string
    lastName: string | null
    department: string
    profile?: { profilePicture: string | null }
  }
  clientId: string
  client: {
    id: string
    name: string
    logoUrl: string | null
    contactName: string | null
    contactEmail: string | null
  }
  requestedAt: string
  requestMessage: string | null
  clientContactName: string | null
  youtubeUrl: string | null
  thumbnailUrl: string | null
  title: string | null
  description: string | null
  status: string
  receivedAt: string | null
  verifiedAt: string | null
  verifiedBy: { id: string; firstName: string; lastName: string | null } | null
  verificationNotes: string | null
  voucherCode: string | null
  voucherAmount: number
  rewardedAt: string | null
  badgeColor: string
  isFeatured: boolean
}

interface Client {
  id: string
  name: string
  contactName: string | null
  contactEmail: string | null
}

interface Props {
  testimonials: Testimonial[]
  clients: Client[]
  currentUserId: string
  isManager: boolean
  stats: { requested: number; received: number; verified: number; rewarded: number }
  myStats: { count: number; totalEarned: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  REQUESTED: { label: 'Requested', color: 'bg-blue-500/20 text-blue-400', icon: <Send className="w-3 h-3" /> },
  RECEIVED: { label: 'Received', color: 'bg-amber-500/20 text-amber-400', icon: <Video className="w-3 h-3" /> },
  VERIFIED: { label: 'Verified', color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
  REWARDED: { label: 'Rewarded', color: 'bg-purple-500/20 text-purple-400', icon: <Gift className="w-3 h-3" /> },
}

export default function TestimonialsClient({
  testimonials: initialTestimonials,
  clients,
  currentUserId,
  isManager,
  stats,
  myStats,
}: Props) {
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showAddUrlModal, setShowAddUrlModal] = useState<Testimonial | null>(null)
  const [showVerifyModal, setShowVerifyModal] = useState<Testimonial | null>(null)
  const [showRewardModal, setShowRewardModal] = useState<Testimonial | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  // Request form state
  const [requestForm, setRequestForm] = useState({
    clientId: '',
    requestMessage: '',
    clientContactName: '',
    clientContactEmail: '',
  })

  // Add URL form state
  const [urlForm, setUrlForm] = useState({
    youtubeUrl: '',
    title: '',
    description: '',
  })

  // Verify form state
  const [verifyNotes, setVerifyNotes] = useState('')

  // Reward form state
  const [voucherCode, setVoucherCode] = useState('')

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'mine') return t.requestedById === currentUserId
    return t.status === filter
  })

  const handleRequestTestimonial = async () => {
    if (!requestForm.clientId) return

    setLoading(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestForm),
      })

      if (res.ok) {
        const data = await res.json()
        setTestimonials([data.testimonial, ...testimonials])
        setShowRequestModal(false)
        setRequestForm({ clientId: '', requestMessage: '', clientContactName: '', clientContactEmail: '' })
      }
    } catch (error) {
      console.error('Failed to request testimonial:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddYoutubeUrl = async () => {
    if (!showAddUrlModal || !urlForm.youtubeUrl) return

    setLoading(true)
    try {
      const res = await fetch(`/api/testimonials/${showAddUrlModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(urlForm),
      })

      if (res.ok) {
        const data = await res.json()
        setTestimonials(testimonials.map((t) => (t.id === data.testimonial.id ? data.testimonial : t)))
        setShowAddUrlModal(null)
        setUrlForm({ youtubeUrl: '', title: '', description: '' })
      }
    } catch (error) {
      console.error('Failed to add URL:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (approve: boolean) => {
    if (!showVerifyModal) return

    setLoading(true)
    try {
      const res = await fetch(`/api/testimonials/${showVerifyModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: approve ? 'verify' : 'reject',
          verificationNotes: verifyNotes,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTestimonials(testimonials.map((t) => (t.id === data.testimonial.id ? data.testimonial : t)))
        setShowVerifyModal(null)
        setVerifyNotes('')
      }
    } catch (error) {
      console.error('Failed to verify:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReward = async () => {
    if (!showRewardModal || !voucherCode) return

    setLoading(true)
    try {
      const res = await fetch(`/api/testimonials/${showRewardModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reward',
          voucherCode,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTestimonials(testimonials.map((t) => (t.id === data.testimonial.id ? data.testimonial : t)))
        setShowRewardModal(null)
        setVoucherCode('')
      }
    } catch (error) {
      console.error('Failed to reward:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Video Testimonials</h1>
          <p className="text-slate-400">Request video testimonials from clients and earn rewards</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Request Testimonial
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Requested</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.requested}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Video className="w-4 h-4" />
            <span className="text-sm font-medium">Received</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.received}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Verified</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.verified}</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Rewarded</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.rewarded}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">My Earnings</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(myStats.totalEarned)}</p>
          <p className="text-xs text-white/80">{myStats.count} testimonials</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'mine', label: 'My Requests' },
          { id: 'REQUESTED', label: 'Pending' },
          { id: 'RECEIVED', label: 'Awaiting Verification' },
          { id: 'VERIFIED', label: 'Verified' },
          { id: 'REWARDED', label: 'Rewarded' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {filteredTestimonials.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center border border-white/10">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No testimonials found</p>
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => {
            const statusConfig = STATUS_CONFIG[testimonial.status]
            const isOwner = testimonial.requestedById === currentUserId

            return (
              <div
                key={testimonial.id}
                className="glass-card rounded-xl p-5 border border-white/10 hover:shadow-none transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail or Client Logo */}
                  <div className="w-20 h-20 rounded-lg bg-slate-800/50 overflow-hidden flex-shrink-0 relative">
                    {testimonial.thumbnailUrl ? (
                      <>
                        <Image
                          src={testimonial.thumbnailUrl}
                          alt="Thumbnail"
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </>
                    ) : testimonial.client.logoUrl ? (
                      <Image
                        src={testimonial.client.logoUrl}
                        alt={testimonial.client.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-white">
                          {testimonial.title || `Testimonial from ${testimonial.client.name}`}
                        </h3>
                        <p className="text-sm text-slate-400">{testimonial.client.name}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {testimonial.requestedBy.firstName} {testimonial.requestedBy.lastName}
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateDDMMYYYY(testimonial.requestedAt)}
                      </div>
                      {testimonial.voucherAmount && testimonial.status === 'REWARDED' && (
                        <>
                          <span className="text-slate-300">|</span>
                          <div className="flex items-center gap-1 text-green-400">
                            <Gift className="w-3.5 h-3.5" />
                            {formatCurrency(testimonial.voucherAmount)}
                          </div>
                        </>
                      )}
                    </div>

                    {testimonial.description && (
                      <p className="mt-2 text-sm text-slate-300 line-clamp-2">{testimonial.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {/* Owner can add URL if REQUESTED */}
                      {isOwner && testimonial.status === 'REQUESTED' && (
                        <button
                          onClick={() => {
                            setShowAddUrlModal(testimonial)
                            setUrlForm({
                              youtubeUrl: '',
                              title: testimonial.title || '',
                              description: testimonial.description || '',
                            })
                          }}
                          className="text-sm px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-200"
                        >
                          Add YouTube URL
                        </button>
                      )}

                      {/* View on YouTube */}
                      {testimonial.youtubeUrl && (
                        <a
                          href={testimonial.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-200 flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Watch
                        </a>
                      )}

                      {/* Manager: Verify */}
                      {isManager && testimonial.status === 'RECEIVED' && (
                        <button
                          onClick={() => {
                            setShowVerifyModal(testimonial)
                            setVerifyNotes('')
                          }}
                          className="text-sm px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-200"
                        >
                          Verify
                        </button>
                      )}

                      {/* Manager: Reward */}
                      {isManager && testimonial.status === 'VERIFIED' && (
                        <button
                          onClick={() => {
                            setShowRewardModal(testimonial)
                            setVoucherCode('')
                          }}
                          className="text-sm px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-200"
                        >
                          Issue Reward
                        </button>
                      )}

                      {/* Show voucher code if rewarded and owner */}
                      {isOwner && testimonial.status === 'REWARDED' && testimonial.voucherCode && (
                        <span className="text-sm px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg font-mono">
                          {testimonial.voucherCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Request Video Testimonial</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Client *</label>
                <select
                  value={requestForm.clientId}
                  onChange={(e) => {
                    const client = clients.find((c) => c.id === e.target.value)
                    setRequestForm({
                      ...requestForm,
                      clientId: e.target.value,
                      clientContactName: client?.contactName || '',
                      clientContactEmail: client?.contactEmail || '',
                    })
                  }}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={requestForm.clientContactName}
                  onChange={(e) => setRequestForm({ ...requestForm, clientContactName: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  placeholder="Person to contact"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={requestForm.clientContactEmail}
                  onChange={(e) => setRequestForm({ ...requestForm, clientContactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Request Message (optional)</label>
                <textarea
                  value={requestForm.requestMessage}
                  onChange={(e) => setRequestForm({ ...requestForm, requestMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  rows={3}
                  placeholder="Any specific message for the client..."
                />
              </div>

              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-800 text-sm">
                <Award className="w-4 h-4 inline-block mr-1" />
                You will earn <strong>{formatCurrency(1000)}</strong> Amazon voucher when the client provides a video testimonial!
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestTestimonial}
                disabled={!requestForm.clientId || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Request Testimonial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add YouTube URL</h3>
              <button onClick={() => setShowAddUrlModal(null)} className="text-slate-400 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">YouTube URL *</label>
                <input
                  type="url"
                  value={urlForm.youtubeUrl}
                  onChange={(e) => setUrlForm({ ...urlForm, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Title</label>
                <input
                  type="text"
                  value={urlForm.title}
                  onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  placeholder="Testimonial title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  value={urlForm.description}
                  onChange={(e) => setUrlForm({ ...urlForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  rows={2}
                  placeholder="Brief description or key quote"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddUrlModal(null)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddYoutubeUrl}
                disabled={!urlForm.youtubeUrl || loading}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Verify Testimonial</h3>
              <button onClick={() => setShowVerifyModal(null)} className="text-slate-400 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900/40 rounded-lg">
                <p className="font-medium text-white">{showVerifyModal.client.name}</p>
                <p className="text-sm text-slate-400">
                  Requested by {showVerifyModal.requestedBy.firstName} {showVerifyModal.requestedBy.lastName}
                </p>
                {showVerifyModal.youtubeUrl && (
                  <a
                    href={showVerifyModal.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Watch Video
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Verification Notes</label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white"
                  rows={2}
                  placeholder="Any notes about verification..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleVerify(false)}
                disabled={loading}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                Reject
              </button>
              <button
                onClick={() => handleVerify(true)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Issue Amazon Voucher</h3>
              <button onClick={() => setShowRewardModal(null)} className="text-slate-400 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <p className="font-medium text-white">
                  {showRewardModal.requestedBy.firstName} {showRewardModal.requestedBy.lastName}
                </p>
                <p className="text-sm text-slate-400">{showRewardModal.client.name}</p>
                <p className="mt-2 text-xl font-bold text-amber-400">{formatCurrency(1000)} Amazon Voucher</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Voucher Code *</label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg text-white font-mono"
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRewardModal(null)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReward}
                disabled={!voucherCode || loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Gift className="w-4 h-4" />
                Issue Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
