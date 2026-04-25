'use client'

import React, { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import WorkTrackerTab from '@/client/components/client-portal/WorkTrackerTab'
import ProfileModal from '@/client/components/client-portal/ProfileModal'
import CredentialModal from '@/client/components/client-portal/CredentialModal'
import NotificationBell from '@/client/components/client-portal/NotificationBell'
import TerminationTab from '@/client/components/client-portal/TerminationTab'

// Types
interface ClientData {
  id: string
  name: string
  brandName: string | null
  logoUrl: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  whatsapp: string | null
  websiteUrl: string | null
  services: string | null
  industry: string | null
  status: string
  monthlyFee: number | null
  currentPaymentStatus: string | null
  pendingAmount: number | null
  nextInvoiceDate: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  tier: string | null
  // Business details from onboarding
  targetAudience: string | null
  competitors: string[] | null
  usp: string | null
  brandVoice: string | null
  socialMedia: {
    facebook: string | null
    instagram: string | null
    linkedin: string | null
    twitter: string | null
    youtube: string | null
  } | null
}

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  status: string
  dueDate: string
  paidAt: string | null
  createdAt: string
  month: string | null
}

interface Payment {
  id: string
  grossAmount: number
  netAmount: number
  collectedAt: string
  paymentMethod: string
  retainerMonth: string | null
  status: string
}

interface Credential {
  id: string
  type: string
  label: string
  category: string
  url: string | null
  username: string | null
  email: string | null
  hasPassword: boolean
  notes: string | null
  password?: string
}

interface Meeting {
  id: string
  title: string
  date: string
  duration: number | null
  isOnline: boolean
  location: string | null
  status: string
  notes: string | null
  agenda: string | null
  participants: Array<{ id: string; role: string; attended: boolean; user: { id: string; name: string; role: string } }>
}

interface Report {
  id: string
  title: string
  type: string
  month: string
  fileUrl: string | null
  status: string
  createdAt: string
}

interface SupportTicket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
}

interface WorkEntryFile {
  id: string
  fileName: string
  webViewLink: string | null
  thumbnailUrl: string | null
  fileCategory: string | null
}

interface WorkEntryItem {
  id: string
  category: string
  deliverableType: string
  quantity: number
  deliverableUrl: string | null
  qualityScore: number | null
  description: string | null
  date: string
  hoursSpent: number | null
  files: WorkEntryFile[]
  user: { firstName: string | null; lastName: string | null; department: string | null }
}

interface DeliverableScope {
  id: string
  category: string
  item: string
  quantity: number
  delivered: number
  status: string
  month: string
}

interface DeliverablesData {
  deliverables: Record<string, DeliverableScope[]>
  workEntries: Record<string, WorkEntryItem[]>
  summary: {
    totalItems: number
    deliveredItems: number
    onTrackCount: number
    overDeliveryCount: number
    underDeliveryCount: number
    totalWorkEntries: number
    entriesWithProof: number
  }
  categories: string[]
}

type TabType = 'dashboard' | 'work-tracker' | 'credentials' | 'payments' | 'meetings' | 'reports' | 'deliverables' | 'support' | 'termination'

export default function ClientPortalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  // Data states
  const [client, setClient] = useState<ClientData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [deliverables, setDeliverables] = useState<DeliverablesData | null>(null)

  // UI states
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' })
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('VIEWER')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showCredentialModal, setShowCredentialModal] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const fetchAllData = async () => {
      try {
        // Fetch all data in parallel
        const [
          portalRes,
          credentialsRes,
          meetingsRes,
          reportsRes,
          invoicesRes,
          deliverablesRes,
          profileRes,
          paymentsRes,
        ] = await Promise.all([
          fetch('/api/client-portal', { credentials: 'include', signal }),
          fetch('/api/client-portal/credentials', { credentials: 'include', signal }),
          fetch('/api/client-portal/meetings', { credentials: 'include', signal }),
          fetch('/api/client-portal/reports', { credentials: 'include', signal }),
          fetch('/api/client-portal/invoices', { credentials: 'include', signal }),
          fetch('/api/client-portal/deliverables', { credentials: 'include', signal }),
          fetch('/api/client-portal/profile/edit', { credentials: 'include', signal }),
          fetch('/api/client-portal/payments', { credentials: 'include', signal }),
        ])

        if (portalRes.status === 401) {
          router.push('/client-login')
          return
        }

        if (portalRes.ok) {
          const data = await portalRes.json()
          setClient(data.client)
          setTickets(data.tickets || [])
        }

        if (credentialsRes.ok) {
          const data = await credentialsRes.json()
          setCredentials(data.credentials || [])
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserRole(profileData.profile?.role || 'VIEWER')
        }

        if (meetingsRes.ok) {
          const data = await meetingsRes.json()
          setMeetings(data.meetings || [])
        }

        if (reportsRes.ok) {
          const data = await reportsRes.json()
          setReports(data.reports || [])
        }

        if (invoicesRes.ok) {
          const data = await invoicesRes.json()
          setInvoices(data.invoices || [])
        }

        if (deliverablesRes.ok) {
          const data = await deliverablesRes.json()
          setDeliverables(data)
        }

        if (paymentsRes.ok) {
          const data = await paymentsRes.json()
          setPayments(data.payments || [])
        }

      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to fetch client data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
    return () => controller.abort()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/client-portal/logout', { method: 'POST', credentials: 'include' })
    router.push('/client-login')
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/client-portal/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTicket.subject, description: newTicket.message }),
        credentials: 'include',
      })
      if (res.ok) {
        const newTicketData = await res.json()
        setNewTicket({ subject: '', message: '' })
        setShowTicketForm(false)
        // Refresh tickets list
        const ticketsRes = await fetch('/api/client-portal', { credentials: 'include' })
        if (ticketsRes.ok) {
          const data = await ticketsRes.json()
          setTickets(data.tickets || [])
        }
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedCredential(id)
    setTimeout(() => setCopiedCredential(null), 2000)
  }

  const handleDeleteCredential = async (id: string) => {
    try {
      const res = await fetch(`/api/client-portal/credentials?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setCredentials(credentials.filter(c => c.id !== id))
        setDeleteConfirmId(null)
      }
    } catch (error) {
      console.error('Failed to delete credential:', error)
    }
  }

  const handleCredentialSaved = async () => {
    // Refresh credentials
    const res = await fetch('/api/client-portal/credentials', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setCredentials(data.credentials || [])
    }
  }

  const parseServices = (services: string | null): string[] => {
    if (!services) return []
    try {
      return JSON.parse(services)
    } catch {
      return services.split(',').map(s => s.trim())
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-slate-400 mb-4">Session expired or invalid</p>
          <Link href="/client-login" className="text-blue-400 hover:underline">
            Login again
          </Link>
        </div>
      </div>
    )
  }

  const services = parseServices(client.services)
  const upcomingMeetings = meetings.filter(m => new Date(m.date) > new Date())
  const pastMeetings = meetings.filter(m => new Date(m.date) <= new Date())

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      id: 'work-tracker',
      label: 'Work Tracker',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      id: 'credentials',
      label: 'Logins',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
      count: credentials.length,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      count: invoices.filter(i => i.status === 'PENDING' || i.status === 'SENT').length,
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      count: upcomingMeetings.length,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      count: reports.length,
    },
    {
      id: 'deliverables',
      label: 'Deliverables',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
      count: deliverables?.summary?.totalWorkEntries || 0,
    },
    {
      id: 'support',
      label: 'Support',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      count: tickets.filter(t => t.status !== 'RESOLVED').length,
    },
    {
      id: 'termination',
      label: 'End Services',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt={`${client.brandName || client.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{client.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-white">{client.brandName || client.name}</h1>
                <p className="text-xs text-slate-400">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {client.status}
              </span>
              <NotificationBell onNavigate={(tab) => setActiveTab(tab as TabType)} />
              <Link
                href="/client-portal/team"
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="View your team"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Open my profile"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                aria-label="Log out of portal"
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav aria-label="Portal sections" className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div role="tablist" aria-label="Portal tabs" className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span aria-label={`${tab.count} items`} className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 backdrop-blur-sm' : 'bg-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {client.contactName?.split(' ')[0] || client.name || 'Guest'}!</h2>
              <p className="text-white/80">Here&apos;s an overview of your account and services.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Monthly Retainer</p>
                <p className="text-xl font-bold text-white">
                  {client.monthlyFee ? formatCurrency(client.monthlyFee) : '-'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Payment Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  client.currentPaymentStatus === 'DONE' ? 'bg-green-500/20 text-green-400' :
                  client.currentPaymentStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {client.currentPaymentStatus || 'N/A'}
                </span>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Pending Amount</p>
                <p className={`text-xl font-bold ${client.pendingAmount && client.pendingAmount > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {client.pendingAmount ? formatCurrency(client.pendingAmount) : '₹0'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Active Services</p>
                <p className="text-xl font-bold text-white">{services.length}</p>
              </div>
            </div>

            {/* Service Tags */}
            <div className="flex flex-wrap gap-2">
              {services.map((s: string) => (
                <span key={s} className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                  s === 'WEB' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  s === 'SEO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  s === 'SM' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  s === 'ADS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  s === 'GMB' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-slate-900/20 text-slate-400 border border-slate-500/30'
                }`}>
                  {s === 'WEB' ? 'Website Development' :
                   s === 'SEO' ? 'SEO' :
                   s === 'SM' ? 'Social Media' :
                   s === 'ADS' ? 'Paid Ads' :
                   s === 'GMB' ? 'Google Business' : s}
                </span>
              ))}
            </div>

            {/* Business Details from Onboarding */}
            {(client?.targetAudience || client?.usp || client?.brandVoice || (client?.competitors && client.competitors.length > 0) || client?.socialMedia) && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Business Details</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Target Audience */}
                  {client?.targetAudience && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Target Audience</p>
                      <p className="text-slate-200">{client.targetAudience}</p>
                    </div>
                  )}

                  {/* USP */}
                  {client?.usp && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Unique Selling Proposition</p>
                      <p className="text-slate-200">{client.usp}</p>
                    </div>
                  )}

                  {/* Brand Voice */}
                  {client?.brandVoice && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Brand Voice</p>
                      <p className="text-slate-200">{client.brandVoice}</p>
                    </div>
                  )}

                  {/* Competitors */}
                  {client?.competitors && client.competitors.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Competitors</p>
                      <div className="flex flex-wrap gap-2">
                        {client.competitors.map((competitor, idx) => (
                          <span key={`competitor-${competitor}-${idx}`} className="px-2 py-1 bg-slate-700 text-slate-300 text-sm rounded">
                            {competitor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {client?.socialMedia && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Social Media</p>
                    <div className="flex flex-wrap gap-3">
                      {client.socialMedia.facebook && (
                        <a href={client.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </a>
                      )}
                      {client.socialMedia.instagram && (
                        <a href={client.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </a>
                      )}
                      {client.socialMedia.linkedin && (
                        <a href={client.socialMedia.linkedin} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 bg-blue-700/20 hover:bg-blue-700/30 text-blue-300 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </a>
                      )}
                      {client.socialMedia.twitter && (
                        <a href={client.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          X (Twitter)
                        </a>
                      )}
                      {client.socialMedia.youtube && (
                        <a href={client.socialMedia.youtube} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Access Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Upcoming Meeting */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">Next Meeting</span>
                </div>
                {upcomingMeetings.length > 0 ? (
                  <div>
                    <p className="text-white font-medium">{upcomingMeetings[0].title}</p>
                    <p className="text-sm text-slate-400 mt-1">{formatDateTime(upcomingMeetings[0].date)}</p>
                    {upcomingMeetings[0].location && upcomingMeetings[0].isOnline && (
                      <a
                        href={upcomingMeetings[0].location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Meeting
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No upcoming meetings</p>
                )}
              </div>

              {/* Latest Report */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">Latest Report</span>
                </div>
                {reports.length > 0 ? (
                  <div>
                    <p className="text-white font-medium">{reports[0].title}</p>
                    <p className="text-sm text-slate-400 mt-1">{reports[0].type} • {formatDate(reports[0].month)}</p>
                    {reports[0].fileUrl && (
                      <a
                        href={reports[0].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View Report
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No reports available yet</p>
                )}
              </div>

              {/* Pending Invoice */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">Pending Invoice</span>
                </div>
                {invoices.filter(i => i.status === 'PENDING' || i.status === 'SENT').length > 0 ? (
                  <div>
                    {invoices.filter(i => i.status === 'PENDING' || i.status === 'SENT').slice(0, 1).map(inv => (
                      <div key={inv.id}>
                        <p className="text-white font-medium">{inv.invoiceNumber}</p>
                        <p className="text-sm text-slate-400 mt-1">Due: {formatDate(inv.dueDate)}</p>
                        <p className="text-xl font-bold text-amber-400 mt-2">{formatCurrency(inv.total)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400 text-sm">All invoices paid ✓</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Work Tracker Tab */}
        {activeTab === 'work-tracker' && (
          <WorkTrackerTab />
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Login Credentials</h2>
                <p className="text-slate-400 text-sm mt-1">All your platform login details in one place</p>
              </div>
              {userRole === 'PRIMARY' && (
                <button
                  onClick={() => {
                    setEditingCredential(null)
                    setShowCredentialModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Credential
                </button>
              )}
            </div>

            {credentials.length === 0 ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="text-slate-400">No credentials have been added yet</p>
                <p className="text-slate-400 text-sm mt-1">Your account manager will add login details here</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {credentials.map((cred) => (
                  <div key={cred.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          cred.type === 'WEBSITE_ADMIN' ? 'bg-purple-500/20' :
                          cred.type === 'GOOGLE_ANALYTICS' ? 'bg-orange-500/20' :
                          cred.type === 'GOOGLE_ADS' ? 'bg-blue-500/20' :
                          cred.type === 'META_BUSINESS' ? 'bg-indigo-500/20' :
                          cred.type === 'INSTAGRAM' ? 'bg-pink-500/20' :
                          cred.type === 'LINKEDIN' ? 'bg-blue-600/20' :
                          cred.type === 'GOOGLE_SEARCH_CONSOLE' ? 'bg-green-500/20' :
                          'bg-slate-600'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            cred.type === 'WEBSITE_ADMIN' ? 'text-purple-400' :
                            cred.type === 'GOOGLE_ANALYTICS' ? 'text-orange-400' :
                            cred.type === 'GOOGLE_ADS' ? 'text-blue-400' :
                            cred.type === 'META_BUSINESS' ? 'text-indigo-400' :
                            cred.type === 'INSTAGRAM' ? 'text-pink-400' :
                            cred.type === 'LINKEDIN' ? 'text-blue-400' :
                            cred.type === 'GOOGLE_SEARCH_CONSOLE' ? 'text-green-400' :
                            'text-slate-400'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-white">{cred.label}</p>
                          <p className="text-xs text-slate-400">{cred.type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {cred.url && (
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">URL</label>
                          <div className="flex items-center gap-2">
                            <a
                              href={cred.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm truncate flex-1"
                            >
                              {cred.url}
                            </a>
                            <button
                              onClick={() => copyToClipboard(cred.url!, cred.id + '-url')}
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                              title="Copy URL"
                            >
                              {copiedCredential === cred.id + '-url' ? (
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {cred.username && (
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Username / Email</label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-slate-300 bg-slate-700/50 px-2 py-1 rounded flex-1 truncate">
                              {cred.username}
                            </code>
                            <button
                              onClick={() => copyToClipboard(cred.username!, cred.id + '-user')}
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                              title="Copy username"
                            >
                              {copiedCredential === cred.id + '-user' ? (
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Password</label>
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded flex-1">
                            {cred.hasPassword ? '••••••••••••' : 'Not set'}
                          </code>
                          <span className="text-xs text-slate-400">Contact us for password</span>
                        </div>
                      </div>

                      {cred.notes && (
                        <p className="text-xs text-slate-400 bg-slate-700/30 p-2 rounded">
                          {cred.notes}
                        </p>
                      )}

                      {/* Edit/Delete buttons for PRIMARY users */}
                      {userRole === 'PRIMARY' && (
                        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-700">
                          <button
                            onClick={() => {
                              setEditingCredential(cred)
                              setShowCredentialModal(true)
                            }}
                            className="flex-1 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          {deleteConfirmId === cred.id ? (
                            <div className="flex-1 flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteCredential(cred.id)}
                                className="flex-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(cred.id)}
                              className="flex-1 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                      {userRole !== 'PRIMARY' && (
                        <p className="text-xs text-slate-400 pt-3 mt-3 border-t border-slate-700">
                          Contact your primary account holder to edit credentials
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Payment History</h2>
              <p className="text-slate-400 text-sm mt-1">Track your invoices and payment history</p>
            </div>

            {/* Payment Summary */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Monthly Retainer</p>
                <p className="text-xl font-bold text-white">{client.monthlyFee ? formatCurrency(client.monthlyFee) : '-'}</p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Total Paid (This Year)</p>
                <p className="text-xl font-bold text-green-400">
                  {formatCurrency(invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0))}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Pending</p>
                <p className="text-xl font-bold text-amber-400">
                  {formatCurrency(invoices.filter(i => i.status === 'PENDING' || i.status === 'SENT').reduce((sum, i) => sum + i.total, 0))}
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-xs text-slate-400 mb-1">Next Due Date</p>
                <p className="text-xl font-bold text-white">
                  {client.nextInvoiceDate ? formatDate(client.nextInvoiceDate) : '-'}
                </p>
              </div>
            </div>

            {/* Contract Period */}
            {(client.contractStartDate || client.contractEndDate) && (
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-700/30 p-5">
                <h3 className="font-medium text-white mb-3">Contract Period</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Start Date</p>
                    <p className="text-white font-medium">{client.contractStartDate ? formatDate(client.contractStartDate) : '-'}</p>
                  </div>
                  <div className="h-8 border-l border-slate-600" />
                  <div>
                    <p className="text-xs text-slate-400">End Date</p>
                    <p className="text-white font-medium">{client.contractEndDate ? formatDate(client.contractEndDate) : 'Ongoing'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">All Invoices</h3>
              </div>
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No invoices yet
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          invoice.status === 'PAID' ? 'bg-green-500/20' :
                          invoice.status === 'OVERDUE' ? 'bg-red-500/20' :
                          'bg-amber-500/20'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            invoice.status === 'PAID' ? 'text-green-400' :
                            invoice.status === 'OVERDUE' ? 'text-red-400' :
                            'text-amber-400'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-slate-400">
                            {invoice.month ? `For ${formatDateDDMMYYYY(invoice.month)}` : `Due: ${formatDate(invoice.dueDate)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatCurrency(invoice.total)}</p>
                          {invoice.paidAt && (
                            <p className="text-xs text-slate-400">Paid on {formatDate(invoice.paidAt)}</p>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                          invoice.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {invoice.status}
                        </span>
                        <a
                          href={`/api/client-portal/invoices/${invoice.id}/download`}
                          target="_blank"
                          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          title="View & Print Invoice"
                        >
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Meetings</h2>
              <p className="text-slate-400 text-sm mt-1">Upcoming and past meetings with your team</p>
            </div>

            {/* Upcoming Meetings */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                Upcoming Meetings ({upcomingMeetings.length})
              </h3>
              {upcomingMeetings.length === 0 ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center text-slate-400">
                  No upcoming meetings scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{meeting.title}</h4>
                            {meeting.isOnline && (
                              <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">Online</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {formatDateTime(meeting.date)}
                            {meeting.duration && <span> • {meeting.duration} min</span>}
                          </p>
                          {meeting.participants.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-slate-400">Participants:</span>
                              {meeting.participants.slice(0, 3).map((p, i) => (
                                <span key={p.user.name} className="text-xs text-slate-300">{p.user.name}{i < meeting.participants.length - 1 ? ',' : ''}</span>
                              ))}
                              {meeting.participants.length > 3 && (
                                <span className="text-xs text-slate-400">+{meeting.participants.length - 3} more</span>
                              )}
                            </div>
                          )}
                          {meeting.agenda && (
                            <p className="text-sm text-slate-400 mt-2">{meeting.agenda}</p>
                          )}
                        </div>
                        {meeting.location && meeting.isOnline && (
                          <a
                            href={meeting.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Meetings */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Past Meetings ({pastMeetings.length})</h3>
              {pastMeetings.length === 0 ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center text-slate-400">
                  No past meetings
                </div>
              ) : (
                <div className="space-y-3">
                  {pastMeetings.slice(0, 10).map((meeting) => (
                    <div key={meeting.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{meeting.title}</h4>
                          <p className="text-sm text-slate-400">{formatDateTime(meeting.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            meeting.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            meeting.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-600 text-slate-300'
                          }`}>
                            {meeting.status}
                          </span>
                          {meeting.notes && (
                            <button
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                              title="View meeting notes"
                            >
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Monthly Reports</h2>
              <p className="text-slate-400 text-sm mt-1">Performance reports and analytics</p>
            </div>

            {reports.length === 0 ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-400">No reports available yet</p>
                <p className="text-slate-400 text-sm mt-1">Reports will appear here once generated</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        report.type === 'SEO' ? 'bg-emerald-500/20' :
                        report.type === 'SOCIAL' ? 'bg-blue-500/20' :
                        report.type === 'ADS' ? 'bg-amber-500/20' :
                        report.type === 'MONTHLY_SUMMARY' ? 'bg-purple-500/20' :
                        'bg-slate-600'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          report.type === 'SEO' ? 'text-emerald-400' :
                          report.type === 'SOCIAL' ? 'text-blue-400' :
                          report.type === 'ADS' ? 'text-amber-400' :
                          report.type === 'MONTHLY_SUMMARY' ? 'text-purple-400' :
                          'text-slate-400'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        report.type === 'SEO' ? 'bg-emerald-500/20 text-emerald-400' :
                        report.type === 'SOCIAL' ? 'bg-blue-500/20 text-blue-400' :
                        report.type === 'ADS' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {report.type}
                      </span>
                    </div>
                    <h4 className="font-medium text-white mb-1">{report.title}</h4>
                    <p className="text-sm text-slate-400 mb-4">
                      {formatDateDDMMYYYY(report.month)}
                    </p>
                    {report.fileUrl ? (
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors w-full justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Report
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">Processing...</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliverables Tab */}
        {activeTab === 'deliverables' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Work Deliverables</h2>
              <p className="text-slate-400 text-sm mt-1">Track what&apos;s being delivered for your account</p>
            </div>

            {/* Deliverables Summary */}
            {deliverables?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <p className="text-xs text-slate-400 mb-1">Total Target</p>
                  <p className="text-xl font-bold text-white">{deliverables.summary.totalItems}</p>
                </div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <p className="text-xs text-slate-400 mb-1">Delivered</p>
                  <p className="text-xl font-bold text-green-400">{deliverables.summary.deliveredItems}</p>
                </div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <p className="text-xs text-slate-400 mb-1">Work Entries</p>
                  <p className="text-xl font-bold text-blue-400">{deliverables.summary.totalWorkEntries}</p>
                </div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <p className="text-xs text-slate-400 mb-1">With Proof</p>
                  <p className="text-xl font-bold text-purple-400">{deliverables.summary.entriesWithProof}</p>
                </div>
              </div>
            )}

            {/* Status Overview */}
            {deliverables?.summary && (
              <div className="flex gap-3">
                <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
                  {deliverables.summary.onTrackCount} On Track
                </span>
                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                  {deliverables.summary.overDeliveryCount} Over Delivered
                </span>
                {deliverables.summary.underDeliveryCount > 0 && (
                  <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-sm rounded-full border border-amber-500/30">
                    {deliverables.summary.underDeliveryCount} Under Delivery
                  </span>
                )}
              </div>
            )}

            {/* Work Entries by Category */}
            {deliverables?.workEntries && Object.keys(deliverables.workEntries).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(deliverables.workEntries).map(([category, entries]) => (
                  <div key={category} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          category === 'DESIGN' ? 'bg-purple-500/20' :
                          category === 'VIDEO' ? 'bg-red-500/20' :
                          category === 'SOCIAL' ? 'bg-blue-500/20' :
                          category === 'SEO' ? 'bg-emerald-500/20' :
                          category === 'ADS' ? 'bg-amber-500/20' :
                          category === 'WEB' ? 'bg-indigo-500/20' :
                          'bg-slate-600'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            category === 'DESIGN' ? 'text-purple-400' :
                            category === 'VIDEO' ? 'text-red-400' :
                            category === 'SOCIAL' ? 'text-blue-400' :
                            category === 'SEO' ? 'text-emerald-400' :
                            category === 'ADS' ? 'text-amber-400' :
                            category === 'WEB' ? 'text-indigo-400' :
                            'text-slate-400'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{
                            category === 'DESIGN' ? 'Design / Graphics' :
                            category === 'VIDEO' ? 'Video Production' :
                            category === 'SOCIAL' ? 'Social Media' :
                            category === 'SEO' ? 'SEO & Content' :
                            category === 'ADS' ? 'Paid Advertising' :
                            category === 'WEB' ? 'Web Development' :
                            category
                          }</h3>
                          <p className="text-sm text-slate-400">{entries.length} items delivered</p>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-700">
                      {entries.map((entry) => (
                        <div key={entry.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">
                                  {entry.deliverableType.replace(/_/g, ' ')}
                                </span>
                                <span className="px-2 py-0.5 text-xs bg-slate-600 text-slate-300 rounded">
                                  x{entry.quantity}
                                </span>
                                {entry.qualityScore && (
                                  <span className={`px-2 py-0.5 text-xs rounded ${
                                    entry.qualityScore >= 8 ? 'bg-green-500/20 text-green-400' :
                                    entry.qualityScore >= 6 ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    Quality: {entry.qualityScore}/10
                                  </span>
                                )}
                              </div>
                              {entry.description && (
                                <p className="text-sm text-slate-400 mt-1">{entry.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                <span className="text-xs text-slate-400">{formatDate(entry.date)}</span>
                                {entry.user?.firstName && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {entry.user.firstName}{entry.user.lastName ? ` ${entry.user.lastName}` : ''}
                                    {entry.user.department && (
                                      <span className="text-slate-400">({entry.user.department})</span>
                                    )}
                                  </span>
                                )}
                                {entry.hoursSpent && entry.hoursSpent > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 rounded text-xs text-blue-400">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {entry.hoursSpent}h
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Proof links */}
                              {entry.deliverableUrl && (
                                <a
                                  href={entry.deliverableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View
                                </a>
                              )}
                              {entry.files && entry.files.length > 0 && (
                                <div className="flex gap-1">
                                  {entry.files.slice(0, 3).map((file) => (
                                    <a
                                      key={file.id}
                                      href={file.webViewLink || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                                      title={file.fileName}
                                    >
                                      {file.thumbnailUrl ? (
                                        <img
                                          src={file.thumbnailUrl}
                                          alt={file.fileName}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      ) : (
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                      )}
                                    </a>
                                  ))}
                                  {entry.files.length > 3 && (
                                    <span className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400">
                                      +{entry.files.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-400">No deliverables tracked yet</p>
                <p className="text-slate-400 text-sm mt-1">Work entries will appear here once they&apos;re approved</p>
              </div>
            )}

            {/* Monthly Scope Progress */}
            {deliverables?.deliverables && Object.keys(deliverables.deliverables).length > 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white">Monthly Scope Progress</h3>
                </div>
                <div className="divide-y divide-slate-700">
                  {Object.entries(deliverables.deliverables).map(([monthKey, scopes]) => (
                    <div key={monthKey} className="p-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">
                        {formatDateDDMMYYYY(monthKey)}
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {scopes.map((scope) => {
                          const progress = scope.quantity > 0
                            ? Math.min(100, (scope.delivered / scope.quantity) * 100)
                            : 0
                          return (
                            <div key={scope.id} className="bg-slate-700/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{scope.item.replace(/_/g, ' ')}</span>
                                <span className={`px-1.5 py-0.5 text-xs rounded ${
                                  scope.status === 'OVER_DELIVERY' ? 'bg-green-500/20 text-green-400' :
                                  scope.status === 'ON_TRACK' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {scope.delivered}/{scope.quantity}
                                </span>
                              </div>
                              <div className="w-full bg-slate-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    scope.status === 'OVER_DELIVERY' ? 'bg-green-500' :
                                    scope.status === 'ON_TRACK' ? 'bg-blue-500' :
                                    'bg-amber-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Support</h2>
                <p className="text-slate-400 text-sm mt-1">Get help and track your support tickets</p>
              </div>
              <button
                onClick={() => setShowTicketForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Ticket
              </button>
            </div>

            {/* New Ticket Form */}
            {showTicketForm && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                <h3 className="font-medium text-white mb-4">Create Support Ticket</h3>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      required
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Message</label>
                    <textarea
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                      placeholder="Describe your issue in detail..."
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="px-6 py-2.5 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tickets List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">Your Tickets</h3>
              </div>
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No support tickets yet
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{ticket.title}</h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              ticket.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                              ticket.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-600 text-slate-300'
                            }`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{ticket.description}</p>
                          <p className="text-xs text-slate-400 mt-2">{formatDate(ticket.createdAt)}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          ticket.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-medium text-white mb-4">Need Immediate Help?</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="tel:+919999999999"
                  className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Call Us</p>
                    <p className="font-medium text-white">+91 99999 99999</p>
                  </div>
                </a>

                <a
                  href="mailto:support@pioneermedia.in"
                  className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email Us</p>
                    <p className="font-medium text-white">support@pioneermedia.in</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">WhatsApp</p>
                    <p className="font-medium text-white">Chat with us</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Termination Tab */}
        {activeTab === 'termination' && (
          <TerminationTab isPrimary={userRole === 'PRIMARY'} />
        )}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <CredentialModal
        isOpen={showCredentialModal}
        onClose={() => {
          setShowCredentialModal(false)
          setEditingCredential(null)
        }}
        credential={editingCredential}
        onSave={handleCredentialSaved}
      />
    </div>
  )
}
