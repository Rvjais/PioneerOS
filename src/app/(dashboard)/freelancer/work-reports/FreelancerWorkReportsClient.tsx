'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FreelancerExcelTracker } from '@/client/components/freelancer/FreelancerExcelTracker'

interface Client {
  id: string
  name: string
}

interface WorkReport {
  id: string
  periodStart: string
  periodEnd: string
  projectName: string
  clientId: string | null
  description: string
  hoursWorked: number
  billableAmount: number
  status: string
  deliverables: string | null
}

interface FreelancerWorkReportsClientProps {
  reports: WorkReport[]
  clients: Client[]
  hourlyRate: number
  profileId: string
}

export function FreelancerWorkReportsClient({
  reports: initialReports,
  clients,
  hourlyRate,
  profileId,
}: FreelancerWorkReportsClientProps) {
  const router = useRouter()
  const [reports, setReports] = useState(initialReports)

  const handleAddReport = async (data: {
    periodStart: string
    periodEnd: string
    projectName: string
    clientId: string | null
    description: string
    hoursWorked: number
    billableAmount: number
    deliverables: string[]
  }) => {
    const res = await fetch('/api/freelancer/work-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      const data = await res.json()
      const newReport = data.report || data
      setReports([{
        ...newReport,
        periodStart: newReport.periodStart,
        periodEnd: newReport.periodEnd,
      }, ...reports])
      router.refresh()
    } else {
      const error = await res.json()
      toast.error(error.error || 'Failed to add work entry')
    }
  }

  return (
    <FreelancerExcelTracker
      reports={reports}
      clients={clients}
      hourlyRate={hourlyRate}
      onAddReport={handleAddReport}
    />
  )
}
