'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClientDashboardClient } from './ClientDashboardClient'

export default function ClientDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client-portal/dashboard')
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace('/client-login')
          return
        }
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          router.replace('/client-login')
        }
      })
      .catch(() => {
        router.replace('/client-login')
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) return null

  return <ClientDashboardClient data={data} />
}
