'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  FormLayout,
  FormCard,
  TextInput,
  Textarea,
  SingleSelect,
  MultiSelect,
  DropdownSelect,
  FormButtons,
  Checkbox,
  SuccessScreen,
} from '@/client/components/forms/FormComponents'

// ============================================
// CONSTANTS
// ============================================

const DEPARTMENTS = [
  { value: 'WEB', label: 'Web Development', emoji: '💻' },
  { value: 'SOCIAL', label: 'Social Media', emoji: '📱' },
  { value: 'ADS', label: 'Performance Ads', emoji: '📈' },
  { value: 'SEO', label: 'SEO', emoji: '🔍' },
  { value: 'HR', label: 'Human Resources', emoji: '👥' },
  { value: 'ACCOUNTS', label: 'Accounts & Finance', emoji: '💰' },
  { value: 'SALES', label: 'Sales & BD', emoji: '🤝' },
  { value: 'OPERATIONS', label: 'Operations', emoji: '⚙️' },
]

const ROLES_BY_DEPARTMENT: Record<string, { value: string; label: string }[]> = {
  'WEB': [
    { value: 'web_developer', label: 'Web Developer' },
    { value: 'frontend_developer', label: 'Frontend Developer' },
    { value: 'fullstack_developer', label: 'Full Stack Developer' },
    { value: 'ui_ux_designer', label: 'UI/UX Designer' },
  ],
  'SOCIAL': [
    { value: 'client_servicing', label: 'Client Servicing Executive' },
    { value: 'designer', label: 'Graphic Designer' },
    { value: 'youtube_manager', label: 'YouTube Manager' },
    { value: 'content_writer', label: 'Content Writer' },
  ],
  'ADS': [
    { value: 'google_ads', label: 'Google Ads Specialist' },
    { value: 'meta_ads', label: 'Meta Ads Specialist' },
    { value: 'ppc_manager', label: 'PPC Manager' },
  ],
  'SEO': [
    { value: 'seo_executive', label: 'SEO Executive' },
    { value: 'seo_analyst', label: 'SEO Analyst' },
    { value: 'content_strategist', label: 'Content Strategist' },
  ],
  'HR': [
    { value: 'hr_executive', label: 'HR Executive' },
    { value: 'hr_manager', label: 'HR Manager' },
    { value: 'recruiter', label: 'Talent Acquisition' },
  ],
  'ACCOUNTS': [
    { value: 'accountant', label: 'Accountant' },
    { value: 'finance_manager', label: 'Finance Manager' },
  ],
  'SALES': [
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'bd_manager', label: 'Business Development Manager' },
  ],
  'OPERATIONS': [
    { value: 'operations_executive', label: 'Operations Executive' },
    { value: 'operations_manager', label: 'Operations Manager' },
  ],
}

const EMPLOYEE_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time', description: 'Standard 9-6 employment', emoji: '💼' },
  { value: 'PART_TIME', label: 'Part Time', description: 'Flexible hours arrangement', emoji: '⏰' },
  { value: 'INTERN', label: 'Intern', description: 'Internship position', emoji: '🎓' },
  { value: 'FREELANCER', label: 'Freelancer', description: 'Project-based work', emoji: '🏠' },
]

const BLOOD_GROUPS = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
]

const LIVING_SITUATIONS = [
  { value: 'with_parents', label: 'With Parents', emoji: '👨‍👩‍👧' },
  { value: 'with_spouse', label: 'With Spouse/Family', emoji: '💑' },
  { value: 'alone', label: 'Living Alone', emoji: '🏠' },
  { value: 'pg_hostel', label: 'PG / Hostel', emoji: '🏢' },
]

const LANGUAGES = [
  { value: 'english', label: 'English', emoji: '🇬🇧' },
  { value: 'hindi', label: 'Hindi', emoji: '🇮🇳' },
  { value: 'punjabi', label: 'Punjabi', emoji: '🪯' },
  { value: 'gujarati', label: 'Gujarati', emoji: '🎭' },
  { value: 'marathi', label: 'Marathi', emoji: '🏵️' },
  { value: 'tamil', label: 'Tamil', emoji: '🎶' },
  { value: 'telugu', label: 'Telugu', emoji: '🌸' },
  { value: 'bengali', label: 'Bengali', emoji: '🌺' },
]

const AI_TOOLS = [
  { value: 'chatgpt', label: 'ChatGPT', emoji: '🤖' },
  { value: 'claude', label: 'Claude AI', emoji: '🧠' },
  { value: 'midjourney', label: 'Midjourney', emoji: '🎨' },
  { value: 'canva_ai', label: 'Canva AI', emoji: '✨' },
  { value: 'github_copilot', label: 'GitHub Copilot', emoji: '👨‍💻' },
  { value: 'figma_ai', label: 'Figma AI', emoji: '🎯' },
  { value: 'grammarly', label: 'Grammarly', emoji: '📝' },
  { value: 'none', label: 'None / Learning', emoji: '📚' },
]

const PREFERRED_OS = [
  { value: 'macos', label: 'macOS', description: 'Apple Mac computer', emoji: '🍎' },
  { value: 'windows', label: 'Windows', description: 'Microsoft Windows', emoji: '🪟' },
  { value: 'linux', label: 'Linux', description: 'Linux distribution', emoji: '🐧' },
  { value: 'no_preference', label: 'No Preference', description: 'Any system works', emoji: '💻' },
]

const STEPS = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Personal Info' },
  { num: 3, label: 'Documents' },
  { num: 4, label: 'NDA Agreement' },
  { num: 5, label: 'Final Details' },
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function EmployeeJoinPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [createdUser, setCreatedUser] = useState<{ empId: string; email: string } | null>(null)
  const signatureRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const [form, setForm] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    department: '',
    role: '',
    employeeType: '',
    joiningDate: '',
    offeredCTC: '',
    offerAccepted: false,

    // Step 2: Personal Details
    dateOfBirth: '',
    bloodGroup: '',
    livingSituation: '',
    languages: [] as string[],
    aiTools: [] as string[],
    address: '',
    parentsPhone1: '',
    parentsPhone2: '',

    // Step 3: Documents & Bank
    profilePicture: '',
    panCard: '',
    panNumber: '',
    aadhaar: '',
    aadhaarNumber: '',
    educationCertificates: '',
    bankAccountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',

    // Step 4: NDA
    ndaAgreed: false,
    agreementAgreed: false,
    ndaSignature: '',
    ndaSignerName: '',

    // Step 5: Final Details
    personalLaptop: false,
    preferredOS: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    linkedIn: '',
    hobbies: '',
    healthConditions: '',
  })

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Signature handlers
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureRef.current
    if (!canvas) return
    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = signatureRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const endDraw = () => {
    setIsDrawing(false)
    const canvas = signatureRef.current
    if (canvas) {
      updateField('ndaSignature', canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = signatureRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    updateField('ndaSignature', '')
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.firstName && form.phone && form.email && form.department && form.employeeType && form.offerAccepted
      case 2:
        return form.dateOfBirth && form.address
      case 3:
        return form.bankAccountName && form.bankName && form.accountNumber && form.ifscCode
      case 4:
        return form.ndaAgreed && form.agreementAgreed && form.ndaSignerName
      case 5:
        return form.emergencyContactName && form.emergencyContactPhone
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          department: form.department,
          employeeType: form.employeeType,
          joiningDate: form.joiningDate,
          role: form.employeeType === 'INTERN' ? 'INTERN' : 'EMPLOYEE',
          profileData: {
            profilePicture: form.profilePicture,
            panCard: form.panCard,
            aadhaar: form.aadhaar,
            linkedIn: form.linkedIn,
            parentsPhone1: form.parentsPhone1,
            parentsPhone2: form.parentsPhone2,
            livingSituation: form.livingSituation,
            educationCertUrl: form.educationCertificates,
            ndaSigned: form.ndaAgreed,
            ndaSignedAt: form.ndaAgreed ? new Date().toISOString() : null,
            bankAccountName: form.bankAccountName,
            bankName: form.bankName,
            accountNumber: form.accountNumber,
            ifscCode: form.ifscCode,
          },
          dateOfBirth: form.dateOfBirth,
          bloodGroup: form.bloodGroup,
          address: form.address,
          languages: form.languages.join(', '),
          aiTools: form.aiTools.join(', '),
          healthConditions: form.healthConditions,
        }),
      })

      if (res.ok) {
        const user = await res.json()
        setCreatedUser({ empId: user.empId, email: user.email || form.email })
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success && createdUser) {
    return (
      <SuccessScreen
        title="Welcome to the Team!"
        message="Your onboarding is complete. HR will review your details and you'll receive login credentials soon."
        details={[
          { label: 'Employee ID', value: createdUser.empId },
          { label: 'Email', value: createdUser.email },
          { label: 'Department', value: DEPARTMENTS.find(d => d.value === form.department)?.label || form.department },
        ]}
        primaryAction={{
          label: 'Done',
          onClick: () => router.push('/'),
        }}
      />
    )
  }

  return (
    <FormLayout
      title="Join Branding Pioneers"
      subtitle="New Employee Onboarding"
      step={step}
      totalSteps={STEPS.length}
      brandColor="orange"
      theme="dark"
    >
      <div className="space-y-6">
        {/* Step 1: Welcome & Basic Info */}
        {step === 1 && (
          <>
            <FormCard
              title="Welcome! Let's get started"
              description="Fill in your basic details to begin the onboarding process"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={(v) => updateField('firstName', v)}
                    placeholder="Your first name"
                    required
                  />
                  <TextInput
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={(v) => updateField('lastName', v)}
                    placeholder="Your last name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={(v) => updateField('phone', v)}
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                  />
                  <TextInput
                    label="Email Address"
                    name="email"
                    value={form.email}
                    onChange={(v) => updateField('email', v)}
                    type="email"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <SingleSelect
                  label="Which department are you joining?"
                  name="department"
                  value={form.department}
                  onChange={(v) => updateField('department', v)}
                  options={DEPARTMENTS}
                  columns={2}
                  required
                />

                {form.department && (
                  <DropdownSelect
                    label="Your Role"
                    name="role"
                    value={form.role}
                    onChange={(v) => updateField('role', v)}
                    options={ROLES_BY_DEPARTMENT[form.department] || []}
                    placeholder="Select your role"
                  />
                )}

                <SingleSelect
                  label="Employment Type"
                  name="employeeType"
                  value={form.employeeType}
                  onChange={(v) => updateField('employeeType', v)}
                  options={EMPLOYEE_TYPES}
                  columns={4}
                  size="sm"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Joining Date"
                    name="joiningDate"
                    value={form.joiningDate}
                    onChange={(v) => updateField('joiningDate', v)}
                    type="date"
                  />
                  <TextInput
                    label="Offered CTC / Stipend"
                    name="offeredCTC"
                    value={form.offeredCTC}
                    onChange={(v) => updateField('offeredCTC', v)}
                    placeholder="₹ per month"
                  />
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <Checkbox
                    label={
                      <span>
                        <strong>I accept the offer</strong> and confirm my intention to join Branding Pioneers on the mentioned date.
                      </span>
                    }
                    name="offerAccepted"
                    checked={form.offerAccepted}
                    onChange={(v) => updateField('offerAccepted', v)}
                    required
                  />
                </div>
              </div>
            </FormCard>

            <FormButtons
              onNext={() => setStep(2)}
              disabled={!canProceed()}
              showBack={false}
            />
          </>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <>
            <FormCard
              title="Personal Information"
              description="Help us know you better"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={(v) => updateField('dateOfBirth', v)}
                    type="date"
                    required
                  />
                  <DropdownSelect
                    label="Blood Group"
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={(v) => updateField('bloodGroup', v)}
                    options={BLOOD_GROUPS}
                    placeholder="Select blood group"
                  />
                </div>

                <SingleSelect
                  label="Current Living Situation"
                  name="livingSituation"
                  value={form.livingSituation}
                  onChange={(v) => updateField('livingSituation', v)}
                  options={LIVING_SITUATIONS}
                  columns={4}
                  size="sm"
                />

                <Textarea
                  label="Residential Address"
                  name="address"
                  value={form.address}
                  onChange={(v) => updateField('address', v)}
                  placeholder="Your complete residential address"
                  rows={2}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Parent/Guardian Phone 1"
                    name="parentsPhone1"
                    value={form.parentsPhone1}
                    onChange={(v) => updateField('parentsPhone1', v)}
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                  <TextInput
                    label="Parent/Guardian Phone 2"
                    name="parentsPhone2"
                    value={form.parentsPhone2}
                    onChange={(v) => updateField('parentsPhone2', v)}
                    type="tel"
                    placeholder="Optional"
                  />
                </div>

                <MultiSelect
                  label="Languages You Know"
                  name="languages"
                  value={form.languages}
                  onChange={(v) => updateField('languages', v)}
                  options={LANGUAGES}
                  columns={4}
                />

                <MultiSelect
                  label="AI Tools You Use"
                  name="aiTools"
                  value={form.aiTools}
                  onChange={(v) => updateField('aiTools', v)}
                  options={AI_TOOLS}
                  columns={4}
                />
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 3: Documents & Bank Details */}
        {step === 3 && (
          <>
            <FormCard
              title="Documents & Bank Details"
              description="Upload documents to Google Drive and paste the shareable links"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            >
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Upload your documents to Google Drive, make them accessible via link, and paste the URL below. All documents are stored securely and only accessible to HR.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Profile Photo"
                    name="profilePicture"
                    value={form.profilePicture}
                    onChange={(v) => updateField('profilePicture', v)}
                    type="url"
                    placeholder="Google Drive link"
                  />
                  <TextInput
                    label="PAN Card"
                    name="panCard"
                    value={form.panCard}
                    onChange={(v) => updateField('panCard', v)}
                    type="url"
                    placeholder="Google Drive link"
                  />
                  <TextInput
                    label="PAN Number"
                    name="panNumber"
                    value={form.panNumber}
                    onChange={(v) => updateField('panNumber', v)}
                    placeholder="ABCDE1234F"
                  />
                  <TextInput
                    label="Aadhaar Card"
                    name="aadhaar"
                    value={form.aadhaar}
                    onChange={(v) => updateField('aadhaar', v)}
                    type="url"
                    placeholder="Google Drive link"
                  />
                  <TextInput
                    label="Aadhaar Number"
                    name="aadhaarNumber"
                    value={form.aadhaarNumber}
                    onChange={(v) => updateField('aadhaarNumber', v)}
                    placeholder="XXXX XXXX XXXX"
                  />
                  <TextInput
                    label="Education Certificates"
                    name="educationCertificates"
                    value={form.educationCertificates}
                    onChange={(v) => updateField('educationCertificates', v)}
                    type="url"
                    placeholder="Drive folder link"
                  />
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Bank Details for Salary
                  </h3>
                  <div className="bg-blue-500/10 border border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-800">Your bank details are encrypted and only accessible to the Accounts team for salary processing.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                      label="Account Holder Name"
                      name="bankAccountName"
                      value={form.bankAccountName}
                      onChange={(v) => updateField('bankAccountName', v)}
                      placeholder="As per bank records"
                      required
                    />
                    <TextInput
                      label="Bank Name"
                      name="bankName"
                      value={form.bankName}
                      onChange={(v) => updateField('bankName', v)}
                      placeholder="e.g., State Bank of India"
                      required
                    />
                    <TextInput
                      label="Account Number"
                      name="accountNumber"
                      value={form.accountNumber}
                      onChange={(v) => updateField('accountNumber', v)}
                      placeholder="Your account number"
                      required
                    />
                    <TextInput
                      label="IFSC Code"
                      name="ifscCode"
                      value={form.ifscCode}
                      onChange={(v) => updateField('ifscCode', v)}
                      placeholder="e.g., SBIN0001234"
                      required
                    />
                  </div>
                </div>
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 4: NDA Agreement */}
        {step === 4 && (
          <>
            <FormCard
              title="Non-Disclosure Agreement"
              description="Please read and sign the NDA carefully"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            >
              <div className="space-y-6">
                {/* NDA Content */}
                <div className="bg-slate-900/40 border border-white/10 rounded-xl overflow-hidden">
                  <div className="bg-slate-800/50 px-5 py-3 border-b border-white/10">
                    <h3 className="font-semibold text-white">Non-Disclosure Agreement</h3>
                    <p className="text-xs text-slate-400">Branding Pioneers — Confidentiality Agreement</p>
                  </div>
                  <div className="p-5 text-sm text-slate-200 space-y-4 max-h-64 overflow-y-auto">
                    <p>This Non-Disclosure Agreement (&quot;Agreement&quot;) is entered into between <strong>Branding Pioneers</strong> (&quot;Company&quot;) and <strong>{form.firstName} {form.lastName || '[Employee]'}</strong> (&quot;Employee&quot;).</p>

                    <h4 className="font-semibold text-white">1. Confidential Information</h4>
                    <p>Employee agrees not to disclose any proprietary information, including but not limited to: client lists, business strategies, financial data, marketing plans, software, source code, trade secrets, and any other information marked or treated as confidential.</p>

                    <h4 className="font-semibold text-white">2. Non-Competition</h4>
                    <p>During employment and for 6 months after termination, Employee shall not directly or indirectly solicit clients of the Company, or compete in the same line of business within the geographic areas served.</p>

                    <h4 className="font-semibold text-white">3. Intellectual Property</h4>
                    <p>All work product, inventions, designs, code, and creative assets produced during employment are the exclusive property of the Company.</p>

                    <h4 className="font-semibold text-white">4. Data Protection</h4>
                    <p>Employee shall not store any company data on personal devices without authorization. All client credentials, access keys, and sensitive data must be handled through approved company systems only.</p>

                    <h4 className="font-semibold text-white">5. Social Media & Public Statements</h4>
                    <p>Employee shall not share internal company information, client work, financial data, or any proprietary materials on social media or public platforms without prior written approval.</p>

                    <h4 className="font-semibold text-white">6. Term & Termination</h4>
                    <p>This agreement remains in effect during employment and for a period of 24 months following separation. Breach may result in legal action.</p>

                    <h4 className="font-semibold text-white">7. Governing Law</h4>
                    <p>This Agreement shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Gurgaon, Haryana.</p>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="glass-card border border-white/10 rounded-xl p-4">
                    <Checkbox
                      label={<span><strong>I have read and agree to the NDA</strong> — I understand the confidentiality obligations and agree to abide by them.</span>}
                      name="ndaAgreed"
                      checked={form.ndaAgreed}
                      onChange={(v) => updateField('ndaAgreed', v)}
                      required
                    />
                  </div>
                  <div className="glass-card border border-white/10 rounded-xl p-4">
                    <Checkbox
                      label={<span><strong>I agree to the Employment Terms & Policies</strong> — Including attendance policy, code of conduct, and IT usage guidelines.</span>}
                      name="agreementAgreed"
                      checked={form.agreementAgreed}
                      onChange={(v) => updateField('agreementAgreed', v)}
                      required
                    />
                  </div>
                </div>

                {/* Digital Signature */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-200">Digital Signature</label>
                  <div className="glass-card border-2 border-dashed border-white/20 rounded-xl p-2">
                    <canvas
                      ref={signatureRef}
                      width={500}
                      height={120}
                      className="w-full bg-slate-900/40 rounded-lg cursor-crosshair"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                    />
                    <div className="flex items-center justify-between mt-2 px-2">
                      <span className="text-xs text-slate-400">Sign above using your mouse or touchpad</span>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-xs text-red-500 hover:text-red-400 font-medium"
                      >
                        Clear Signature
                      </button>
                    </div>
                  </div>
                  <TextInput
                    label="Type Your Full Name"
                    name="ndaSignerName"
                    value={form.ndaSignerName}
                    onChange={(v) => updateField('ndaSignerName', v)}
                    placeholder="Your full legal name as confirmation"
                    required
                  />
                </div>
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 5: Final Details */}
        {step === 5 && (
          <>
            <FormCard
              title="Almost Done!"
              description="Just a few more details to complete your onboarding"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
            >
              <div className="space-y-6">
                {/* IT Setup */}
                <div className="bg-slate-900/40 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    IT Setup
                  </h3>
                  <div className="space-y-4">
                    <Checkbox
                      label="I will bring my own laptop"
                      name="personalLaptop"
                      checked={form.personalLaptop}
                      onChange={(v) => updateField('personalLaptop', v)}
                    />
                    <SingleSelect
                      label="Preferred Operating System"
                      name="preferredOS"
                      value={form.preferredOS}
                      onChange={(v) => updateField('preferredOS', v)}
                      options={PREFERRED_OS}
                      columns={4}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-red-500/10 border border-red-200 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                      label="Contact Name"
                      name="emergencyContactName"
                      value={form.emergencyContactName}
                      onChange={(v) => updateField('emergencyContactName', v)}
                      placeholder="Full name"
                      required
                    />
                    <TextInput
                      label="Phone Number"
                      name="emergencyContactPhone"
                      value={form.emergencyContactPhone}
                      onChange={(v) => updateField('emergencyContactPhone', v)}
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                    />
                    <TextInput
                      label="Relationship"
                      name="emergencyContactRelation"
                      value={form.emergencyContactRelation}
                      onChange={(v) => updateField('emergencyContactRelation', v)}
                      placeholder="e.g., Father, Spouse"
                    />
                  </div>
                </div>

                {/* Fun Facts */}
                <div className="space-y-4">
                  <TextInput
                    label="LinkedIn Profile"
                    name="linkedIn"
                    value={form.linkedIn}
                    onChange={(v) => updateField('linkedIn', v)}
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <Textarea
                    label="Hobbies & Interests"
                    name="hobbies"
                    value={form.hobbies}
                    onChange={(v) => updateField('hobbies', v)}
                    placeholder="What do you enjoy outside work? (Movies, sports, music, travel...)"
                    rows={2}
                  />
                  <Textarea
                    label="Health Conditions (if any)"
                    name="healthConditions"
                    value={form.healthConditions}
                    onChange={(v) => updateField('healthConditions', v)}
                    placeholder="Any allergies or medical conditions we should be aware of"
                    rows={2}
                    helper="This information is confidential and only used for emergency purposes"
                  />
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Ready to Submit</h3>
                      <p className="text-sm text-green-400 mt-1">
                        Click submit to complete your onboarding. You&apos;ll receive your login credentials via email once HR verifies your details.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-200 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
              submitLabel="Complete Onboarding"
              disabled={!canProceed()}
              loading={loading}
            />
          </>
        )}
      </div>
    </FormLayout>
  )
}
