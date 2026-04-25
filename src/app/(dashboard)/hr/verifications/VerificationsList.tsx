'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface UserProfile {
  emergencyContactName: string
  emergencyContactPhone: string
  panCard: string
  aadhaar: string
  panCardUrl: string
  aadhaarUrl: string
  bankDetailsUrl: string
  educationCertUrl: string
  linkedIn: string
  skills: string
  bio: string
  completionPercentage: number
}

interface User {
  id: string
  empId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  joiningDate: string
  dateOfBirth: string
  bloodGroup: string
  address: string
  profile: UserProfile | null
  updatedAt: string
}

interface Props {
  users: User[]
}

// HR Verification Checklist Items
const DOCUMENT_CHECKLIST = [
  { id: 'panCard', label: 'PAN Card verified', required: true },
  { id: 'aadhaar', label: 'Aadhaar Card verified', required: true },
  { id: 'bankDetails', label: 'Bank details verified', required: true },
  { id: 'educationCert', label: 'Education certificate verified', required: false },
  { id: 'profilePhoto', label: 'Profile photo appropriate', required: true },
  { id: 'addressProof', label: 'Address verified', required: true },
]

const REFERENCE_CHECKLIST = [
  { id: 'managerCall', label: 'Called previous manager (not provided reference)', required: true },
  { id: 'managerVerified', label: 'Previous manager confirmed employment', required: true },
  { id: 'roleVerified', label: 'Role and responsibilities confirmed', required: true },
  { id: 'exitReasonVerified', label: 'Exit reason verified', required: true },
  { id: 'rehireEligible', label: 'Confirmed eligible for rehire', required: false },
]

const HR_QUESTIONS = [
  { id: 'whyLeaving', label: 'Why did you leave your last job?' },
  { id: 'expectedSalary', label: 'What are your salary expectations?' },
  { id: 'noticePeriod', label: 'Can you serve the notice period?' },
  { id: 'relocation', label: 'Are you willing to relocate if needed?' },
  { id: 'workFromOffice', label: 'Are you comfortable working from office?' },
  { id: 'references', label: 'Can you provide professional references?' },
]

export function VerificationsList({ users }: Props) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Checklist states
  const [documentChecks, setDocumentChecks] = useState<Record<string, boolean>>({})
  const [referenceChecks, setReferenceChecks] = useState<Record<string, boolean>>({})
  const [hrQuestionAnswers, setHrQuestionAnswers] = useState<Record<string, string>>({})
  const [hrComments, setHrComments] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerPhone, setManagerPhone] = useState('')
  const [previousCompany, setPreviousCompany] = useState('')
  const [callNotes, setCallNotes] = useState('')

  const resetChecklist = () => {
    setDocumentChecks({})
    setReferenceChecks({})
    setHrQuestionAnswers({})
    setHrComments('')
    setManagerName('')
    setManagerPhone('')
    setPreviousCompany('')
    setCallNotes('')
  }

  const handleVerify = async (userId: string) => {
    // Check if all required items are checked
    const missingDocs = DOCUMENT_CHECKLIST.filter(item => item.required && !documentChecks[item.id])
    const missingRefs = REFERENCE_CHECKLIST.filter(item => item.required && !referenceChecks[item.id])

    if (missingDocs.length > 0 || missingRefs.length > 0) {
      toast.error(`Please complete all required verification items: ${
        [...missingDocs, ...missingRefs].map(i => i.label).join(', ')
      }`)
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch(`/api/hr/verify/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          verificationData: {
            documentChecks,
            referenceChecks,
            hrQuestionAnswers,
            hrComments,
            managerVerification: {
              managerName,
              managerPhone,
              previousCompany,
              callNotes,
            },
          },
        }),
      })

      if (res.ok) {
        router.refresh()
        setSelectedUser(null)
        resetChecklist()
      }
    } catch (error) {
      console.error('Failed to verify:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (userId: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/hr/verify/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          reason: rejectionReason,
          verificationData: {
            documentChecks,
            referenceChecks,
            hrComments,
          },
        }),
      })

      if (res.ok) {
        router.refresh()
        setSelectedUser(null)
        setShowRejectModal(false)
        setRejectionReason('')
        resetChecklist()
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const skills = selectedUser?.profile?.skills ? JSON.parse(selectedUser.profile.skills) : []

  // Calculate completion percentage
  const totalRequired = DOCUMENT_CHECKLIST.filter(i => i.required).length + REFERENCE_CHECKLIST.filter(i => i.required).length
  const completedRequired = DOCUMENT_CHECKLIST.filter(i => i.required && documentChecks[i.id]).length +
    REFERENCE_CHECKLIST.filter(i => i.required && referenceChecks[i.id]).length
  const checklistProgress = Math.round((completedRequired / totalRequired) * 100)

  return (
    <>
      <div className="divide-y divide-slate-200">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 hover:bg-slate-900/40 cursor-pointer transition-colors"
            onClick={() => {
              setSelectedUser(user)
              resetChecklist()
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar user={{ id: user.id, firstName: user.firstName, lastName: user.lastName }} size="lg" showPreview={false} />
                <div>
                  <h3 className="font-medium text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-slate-300">{user.empId} - {user.department}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Pending Review
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 glass-card border-b border-white/10 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-slate-300">{selectedUser.empId} - {selectedUser.department}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Progress indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        checklistProgress === 100 ? 'bg-green-500' :
                        checklistProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${checklistProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{checklistProgress}%</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    resetChecklist()
                  }}
                  className="p-2 hover:bg-slate-800/50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 grid lg:grid-cols-2 gap-6">
              {/* Left Column - Employee Info */}
              <div className="space-y-6">
                {/* Personal Info */}
                <section className="bg-slate-900/40 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Phone</p>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Date of Birth</p>
                      <p className="font-medium">{formatDate(selectedUser.dateOfBirth)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Blood Group</p>
                      <p className="font-medium">{selectedUser.bloodGroup}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Address</p>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                  </div>
                </section>

                {/* Emergency Contact */}
                <section className="bg-slate-900/40 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Name</p>
                      <p className="font-medium">{selectedUser.profile?.emergencyContactName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Phone</p>
                      <p className="font-medium">{selectedUser.profile?.emergencyContactPhone || 'Not provided'}</p>
                    </div>
                  </div>
                </section>

                {/* Documents */}
                <section className="bg-slate-900/40 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Documents</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">PAN Card</p>
                      <p className="font-medium">{selectedUser.profile?.panCard || 'Not provided'}</p>
                      {selectedUser.profile?.panCardUrl && (
                        <a href={selectedUser.profile.panCardUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">
                          View Document
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-400">Aadhaar</p>
                      <p className="font-medium">{selectedUser.profile?.aadhaar || 'Not provided'}</p>
                      {selectedUser.profile?.aadhaarUrl && (
                        <a href={selectedUser.profile.aadhaarUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">
                          View Document
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-400">Bank Details</p>
                      {selectedUser.profile?.bankDetailsUrl ? (
                        <a href={selectedUser.profile.bankDetailsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          View Document
                        </a>
                      ) : (
                        <p className="text-slate-400">Not uploaded</p>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-400">Education Certificate</p>
                      {selectedUser.profile?.educationCertUrl ? (
                        <a href={selectedUser.profile.educationCertUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          View Document
                        </a>
                      ) : (
                        <p className="text-slate-400">Not uploaded</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Skills & Bio */}
                <section className="bg-slate-900/40 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-4">Professional Info</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-400">LinkedIn</p>
                      {selectedUser.profile?.linkedIn ? (
                        <a href={selectedUser.profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {selectedUser.profile.linkedIn}
                        </a>
                      ) : (
                        <p className="text-slate-400">Not provided</p>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-400">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skills.length > 0 ? skills.map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {skill}
                          </span>
                        )) : <p className="text-slate-400">Not provided</p>}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column - Verification Checklists */}
              <div className="space-y-6">
                {/* Document Verification Checklist */}
                <section className="bg-green-500/10 rounded-xl p-4 border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Document Verification
                  </h3>
                  <div className="space-y-2">
                    {DOCUMENT_CHECKLIST.map((item) => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={documentChecks[item.id] || false}
                          onChange={(e) => setDocumentChecks({ ...documentChecks, [item.id]: e.target.checked })}
                          className="w-4 h-4 rounded border-green-400 text-green-400 focus:ring-green-500"
                        />
                        <span className="text-sm text-green-800">
                          {item.label}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Previous Manager Verification */}
                <section className="bg-blue-500/10 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Previous Manager Verification
                  </h3>
                  <p className="text-xs text-blue-400 mb-3">
                    Important: Find and call the actual manager, NOT the reference provided by candidate.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Previous Company"
                      value={previousCompany}
                      onChange={(e) => setPreviousCompany(e.target.value)}
                      className="px-3 py-2 text-sm border border-blue-300 rounded-lg glass-card"
                    />
                    <input
                      type="text"
                      placeholder="Manager Name (found by HR)"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="px-3 py-2 text-sm border border-blue-300 rounded-lg glass-card"
                    />
                    <input
                      type="tel"
                      placeholder="Manager Phone"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      className="px-3 py-2 text-sm border border-blue-300 rounded-lg glass-card col-span-2"
                    />
                  </div>
                  <div className="space-y-2 mb-4">
                    {REFERENCE_CHECKLIST.map((item) => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={referenceChecks[item.id] || false}
                          onChange={(e) => setReferenceChecks({ ...referenceChecks, [item.id]: e.target.checked })}
                          className="w-4 h-4 rounded border-blue-400 text-blue-400 focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-800">
                          {item.label}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Call notes and manager feedback..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg glass-card"
                    rows={3}
                  />
                </section>

                {/* HR Questions */}
                <section className="bg-purple-500/10 rounded-xl p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    HR Interview Notes
                  </h3>
                  <div className="space-y-3">
                    {HR_QUESTIONS.map((q) => (
                      <div key={q.id}>
                        <label className="text-xs font-medium text-purple-800">{q.label}</label>
                        <input
                          type="text"
                          placeholder="Answer..."
                          value={hrQuestionAnswers[q.id] || ''}
                          onChange={(e) => setHrQuestionAnswers({ ...hrQuestionAnswers, [q.id]: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-purple-300 rounded glass-card mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* HR Comments */}
                <section className="bg-amber-500/10 rounded-xl p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    HR Comments & Notes
                  </h3>
                  <textarea
                    placeholder="Additional observations, concerns, or recommendations..."
                    value={hrComments}
                    onChange={(e) => setHrComments(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg glass-card"
                    rows={4}
                  />
                </section>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 glass-card border-t border-white/10 p-6 flex justify-between items-center">
              <div className="text-sm text-slate-300">
                <span className="font-medium">{completedRequired}/{totalRequired}</span> required items completed
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                  className="px-6 py-3 border border-red-300 text-red-400 font-medium rounded-lg hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleVerify(selectedUser.id)}
                  disabled={isProcessing || checklistProgress < 100}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verify & Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reject Verification</h3>
            <p className="text-slate-300 mb-4">
              Please provide a reason for rejecting {selectedUser.firstName}&apos;s profile verification.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="Enter reason for rejection..."
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedUser.id)}
                disabled={!rejectionReason || isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
