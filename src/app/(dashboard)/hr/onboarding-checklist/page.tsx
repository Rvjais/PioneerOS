'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'

interface Employee {
  id: string
  empId: string
  firstName: string
  lastName?: string
  department: string
  joiningDate: string
  status: string
}

interface ChecklistItem {
  key: string
  label: string
  category: string
  completed: boolean
  completedAt?: string
}

interface EmployeeChecklist {
  userId: string
  employee: Employee
  items: ChecklistItem[]
  completionPercentage: number
  status: string
}

const checklistCategories = [
  {
    name: 'Document Collection',
    items: [
      { key: 'offerLetterSigned', label: 'Offer Letter Signed' },
      { key: 'idProofSubmitted', label: 'ID Proof Submitted' },
      { key: 'addressProofSubmitted', label: 'Address Proof Submitted' },
      { key: 'panCardSubmitted', label: 'PAN Card Submitted' },
      { key: 'bankDetailsSubmitted', label: 'Bank Details Submitted' },
      { key: 'educationDocsSubmitted', label: 'Education Documents Submitted' },
      { key: 'profilePhotoSubmitted', label: 'Profile Photo Submitted' },
    ]
  },
  {
    name: 'IT Setup',
    items: [
      { key: 'emailCreated', label: 'Company Email Created' },
      { key: 'slackInviteSent', label: 'Slack Invite Sent' },
      { key: 'systemAccessGranted', label: 'System Access Granted' },
      { key: 'deviceAllocated', label: 'Device Allocated' },
      { key: 'softwareLicensesAssigned', label: 'Software Licenses Assigned' },
    ]
  },
  {
    name: 'HR Orientation',
    items: [
      { key: 'hrOrientationComplete', label: 'HR Orientation Complete' },
      { key: 'policiesAcknowledged', label: 'Policies Acknowledged' },
      { key: 'ndaSigned', label: 'NDA Signed' },
      { key: 'biometricRegistered', label: 'Biometric Registered' },
    ]
  },
  {
    name: 'Department Onboarding',
    items: [
      { key: 'buddyAssigned', label: 'Buddy Assigned' },
      { key: 'teamIntroductionDone', label: 'Team Introduction Done' },
      { key: 'departmentTrainingDone', label: 'Department Training Done' },
      { key: 'firstWeekCheckIn', label: 'First Week Check-in' },
      { key: 'thirtyDayReview', label: '30-Day Review' },
    ]
  }
]

export default function HROnboardingChecklistPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchNewEmployees()
  }, [])

  const fetchNewEmployees = async () => {
    try {
      const res = await fetch('/api/users?status=PROBATION,ACTIVE&recent=true')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChecklist = async (userId: string) => {
    try {
      const res = await fetch(`/api/hr/onboarding-checklist/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setChecklist(data.items || {})
        setNotes(data.hrNotes || '')
      } else {
        // Initialize empty checklist
        setChecklist({})
        setNotes('')
      }
    } catch (error) {
      console.error('Failed to fetch checklist:', error)
      setChecklist({})
    }
  }

  const handleEmployeeSelect = (userId: string) => {
    setSelectedEmployee(userId)
    fetchChecklist(userId)
  }

  const handleChecklistToggle = async (key: string) => {
    const newValue = !checklist[key]
    setChecklist(prev => ({ ...prev, [key]: newValue }))

    if (selectedEmployee) {
      setSaving(true)
      try {
        await fetch(`/api/hr/onboarding-checklist/${selectedEmployee}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: newValue })
        })
      } catch (error) {
        console.error('Failed to update checklist:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleNotesUpdate = async () => {
    if (!selectedEmployee) return

    setSaving(true)
    try {
      await fetch(`/api/hr/onboarding-checklist/${selectedEmployee}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrNotes: notes })
      })
    } catch (error) {
      console.error('Failed to update notes:', error)
    } finally {
      setSaving(false)
    }
  }

  const calculateProgress = () => {
    const totalItems = checklistCategories.reduce((sum, cat) => sum + cat.items.length, 0)
    const completedItems = Object.values(checklist).filter(Boolean).length
    return Math.round((completedItems / totalItems) * 100)
  }

  const getSelectedEmployee = () => employees.find(e => e.id === selectedEmployee)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/hr" className="text-sm text-blue-400 hover:underline mb-2 inline-block">
          &larr; Back to HR
        </Link>
        <h1 className="text-2xl font-bold text-white">Employee Onboarding Checklist</h1>
        <p className="text-slate-400">Track and manage new employee onboarding progress</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">New Employees</h2>
            <p className="text-sm text-slate-400">{employees.length} employees</p>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => handleEmployeeSelect(emp.id)}
                className={`w-full p-4 text-left hover:bg-slate-900/40 transition-colors ${
                  selectedEmployee === emp.id ? 'bg-blue-500/10 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-sm text-slate-400">{emp.empId} - {emp.department}</p>
                    <p className="text-xs text-slate-400">
                      Joined: {formatDateDDMMYYYY(emp.joiningDate)}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    emp.status === 'PROBATION' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {emp.status}
                  </span>
                </div>
              </button>
            ))}
            {employees.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No new employees to onboard
              </div>
            )}
          </div>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2">
          {selectedEmployee ? (
            <div className="glass-card rounded-xl border border-white/10">
              {/* Employee Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-white">
                      {getSelectedEmployee()?.firstName} {getSelectedEmployee()?.lastName}
                    </h2>
                    <p className="text-sm text-slate-400">{getSelectedEmployee()?.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{calculateProgress()}%</div>
                    <p className="text-xs text-slate-400">Complete</p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                {saving && (
                  <p className="text-xs text-blue-400 mt-2">Saving...</p>
                )}
              </div>

              {/* Checklist Items */}
              <div className="p-4 space-y-6">
                {checklistCategories.map(category => (
                  <div key={category.name}>
                    <h3 className="font-medium text-slate-200 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-800/50 rounded flex items-center justify-center text-xs">
                        {category.items.filter(item => checklist[item.key]).length}/{category.items.length}
                      </span>
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {category.items.map(item => (
                        <label
                          key={item.key}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            checklist[item.key]
                              ? 'bg-green-500/10 border-green-200'
                              : 'glass-card border-white/10 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checklist[item.key] || false}
                            onChange={() => handleChecklistToggle(item.key)}
                            className="w-5 h-5 rounded border-white/20 text-green-400 focus:ring-green-500"
                          />
                          <span className={`flex-1 ${checklist[item.key] ? 'text-green-400' : 'text-slate-200'}`}>
                            {item.label}
                          </span>
                          {checklist[item.key] && (
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* HR Notes */}
                <div className="pt-4 border-t border-white/10">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    HR Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesUpdate}
                    rows={3}
                    placeholder="Add any notes about this employee's onboarding..."
                    className="w-full px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl border border-white/10 p-12 text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-medium text-white mb-1">Select an Employee</h3>
              <p className="text-sm text-slate-400">
                Choose an employee from the list to view and update their onboarding checklist.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
