'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ClientOrgChart from '@/client/components/client-portal/ClientOrgChart'

interface TeamMember {
  id: string
  firstName: string
  lastName: string | null
  role: string
  department: string
  avatarUrl: string | null
  isPrimary: boolean
}

interface TeamData {
  teamMembers: TeamMember[]
  accountManager: TeamMember | null
  accountsContact: TeamMember | null
  clientWhatsApp: string | null
}

export default function ClientTeamPage() {
  const router = useRouter()
  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      const res = await fetch('/api/client-portal/org-chart', { credentials: 'include' })
      if (res.ok) {
        const teamData = await res.json()
        setData(teamData)
      } else if (res.status === 401) {
        router.push('/client-portal/login')
      } else {
        setError('Failed to load team data')
      }
    } catch (err) {
      console.error('Failed to fetch team data:', err)
      setError('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={fetchTeamData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/client-portal"
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <div>
                <h1 className="text-xl font-bold text-white">Your Team</h1>
                <p className="text-sm text-slate-400">Meet the people working on your account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data && (
          <ClientOrgChart
            teamMembers={data.teamMembers}
            accountManager={data.accountManager}
            accountsContact={data.accountsContact}
            clientWhatsApp={data.clientWhatsApp}
          />
        )}
      </main>
    </div>
  )
}
