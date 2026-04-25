'use client'

import { Suspense, useState, useCallback } from 'react'
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
  StepIndicator,
} from '@/client/components/forms/FormComponents'

// ============================================
// CONSTANTS
// ============================================

const TOTAL_STEPS = 9

const STEP_LABELS = [
  'Start',
  'Basic Info',
  'Personal',
  'Documents',
  'Professional',
  'Bank',
  'Emergency',
  'IT Setup',
  'Agreements',
]

const DEPARTMENTS = [
  { value: 'WEB', label: 'Web', emoji: '\u{1F4BB}' },
  { value: 'SOCIAL', label: 'Social', emoji: '\u{1F4F1}' },
  { value: 'ADS', label: 'Ads', emoji: '\u{1F4C8}' },
  { value: 'SEO', label: 'SEO', emoji: '\u{1F50D}' },
  { value: 'HR', label: 'HR', emoji: '\u{1F465}' },
  { value: 'ACCOUNTS', label: 'Accounts', emoji: '\u{1F4B0}' },
  { value: 'SALES', label: 'Sales', emoji: '\u{1F91D}' },
  { value: 'OPERATIONS', label: 'Operations', emoji: '\u2699\uFE0F' },
  { value: 'DESIGN', label: 'Design', emoji: '\u{1F3A8}' },
  { value: 'VIDEO', label: 'Video', emoji: '\u{1F3AC}' },
]

const POSITIONS_MAP: Record<string, { value: string; label: string }[]> = {
  WEB: [
    { value: 'WEB_DEVELOPER', label: 'Web Developer' },
    { value: 'FRONTEND_DEVELOPER', label: 'Frontend Developer' },
    { value: 'BACKEND_DEVELOPER', label: 'Backend Developer' },
    { value: 'FULLSTACK_DEVELOPER', label: 'Full Stack Developer' },
  ],
  SOCIAL: [
    { value: 'SOCIAL_MEDIA_MANAGER', label: 'Social Media Manager' },
    { value: 'SOCIAL_MEDIA_EXECUTIVE', label: 'Social Media Executive' },
  ],
  ADS: [
    { value: 'ADS_MANAGER', label: 'Ads Manager' },
    { value: 'ADS_EXECUTIVE', label: 'Ads Executive' },
  ],
  SEO: [
    { value: 'SEO_SPECIALIST', label: 'SEO Specialist' },
    { value: 'SEO_EXECUTIVE', label: 'SEO Executive' },
    { value: 'SEO_LEAD', label: 'SEO Lead' },
    { value: 'CONTENT_WRITER', label: 'Content Writer' },
    { value: 'SENIOR_CONTENT_WRITER', label: 'Senior Content Writer' },
    { value: 'CONTENT_LEAD', label: 'Content Lead' },
  ],
  HR: [
    { value: 'HR_EXECUTIVE', label: 'HR Executive' },
    { value: 'HR_MANAGER', label: 'HR Manager' },
    { value: 'RECRUITER', label: 'Recruiter' },
  ],
  ACCOUNTS: [
    { value: 'ACCOUNTS_EXECUTIVE', label: 'Accounts Executive' },
    { value: 'ACCOUNTS_MANAGER', label: 'Accounts Manager' },
  ],
  SALES: [
    { value: 'BUSINESS_DEVELOPMENT', label: 'Business Development' },
    { value: 'SALES_EXECUTIVE', label: 'Sales Executive' },
    { value: 'SALES_MANAGER', label: 'Sales Manager' },
  ],
  OPERATIONS: [
    { value: 'ACCOUNT_MANAGER', label: 'Account Manager' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
    { value: 'OPERATIONS_LEAD', label: 'Operations Lead' },
  ],
  DESIGN: [
    { value: 'GRAPHIC_DESIGNER', label: 'Graphic Designer' },
    { value: 'SENIOR_DESIGNER', label: 'Senior Designer' },
    { value: 'UI_UX_DESIGNER', label: 'UI/UX Designer' },
  ],
  VIDEO: [
    { value: 'VIDEO_EDITOR', label: 'Video Editor' },
    { value: 'MOTION_DESIGNER', label: 'Motion Designer' },
  ],
}

const EMPLOYEE_TYPES = [
  { value: 'full-time', label: 'Full-time', emoji: '\u{1F4BC}' },
  { value: 'part-time', label: 'Part-time', emoji: '\u{1F552}' },
  { value: 'intern', label: 'Intern', emoji: '\u{1F393}' },
  { value: 'freelancer', label: 'Freelancer', emoji: '\u{1F310}' },
]

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'other', label: 'Other' },
]

const AI_TOOLS = [
  { value: 'chatgpt', label: 'ChatGPT', emoji: '\u{1F916}' },
  { value: 'claude', label: 'Claude', emoji: '\u{1F9E0}' },
  { value: 'midjourney', label: 'Midjourney', emoji: '\u{1F3A8}' },
  { value: 'dall-e', label: 'DALL-E', emoji: '\u{1F5BC}\uFE0F' },
  { value: 'copilot', label: 'Copilot', emoji: '\u{1F468}\u200D\u{1F4BB}' },
  { value: 'jasper', label: 'Jasper', emoji: '\u270D\uFE0F' },
  { value: 'canva-ai', label: 'Canva AI', emoji: '\u2728' },
  { value: 'none', label: 'None', emoji: '\u274C' },
]

const BLOOD_GROUPS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

const LIVING_SITUATIONS = [
  { value: 'with-family', label: 'With Family', emoji: '\u{1F3E0}' },
  { value: 'pg-hostel', label: 'PG/Hostel', emoji: '\u{1F3E2}' },
  { value: 'rented-flat', label: 'Rented Flat', emoji: '\u{1F3D8}\uFE0F' },
  { value: 'own-house', label: 'Own House', emoji: '\u{1F3E1}' },
]

const RELATIONSHIPS = [
  { value: 'parent', label: 'Parent' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
]

const LAPTOP_OPTIONS = [
  { value: 'yes', label: 'Yes', emoji: '\u2705' },
  { value: 'no', label: 'No', emoji: '\u274C' },
]

const OS_OPTIONS = [
  { value: 'windows', label: 'Windows', emoji: '\u{1FA9F}' },
  { value: 'macos', label: 'macOS', emoji: '\u{1F34E}' },
  { value: 'linux', label: 'Linux', emoji: '\u{1F427}' },
]

const NDA_TEXT = `This Non-Disclosure Agreement ("Agreement") is entered into between the Employee and Branding Pioneers Private Limited ("Company").

1. CONFIDENTIAL INFORMATION: The Employee agrees to keep all proprietary information, trade secrets, client data, business strategies, internal processes, financial data, and any other confidential information strictly confidential during and after employment.

2. NON-COMPETE: During employment and for a period of 6 months after termination, the Employee shall not engage in any business that directly competes with the Company or solicit Company clients.

3. INTELLECTUAL PROPERTY: All work product, designs, code, content, strategies, and creative materials produced during employment are the sole property of the Company.

4. DATA PROTECTION: The Employee shall not copy, transfer, or share any Company data, client information, login credentials, or proprietary tools to any external party or personal devices without written authorization.

5. SOCIAL MEDIA: The Employee shall not disclose Company strategies, client names, or internal information on social media or public platforms.

6. BREACH: Any breach of this agreement may result in immediate termination and legal action including claims for damages.`

const EMPLOYMENT_TERMS_TEXT = `EMPLOYMENT AGREEMENT TERMS - Branding Pioneers Private Limited

1. PROBATION PERIOD: The first 3 months of employment constitute a probation period. Performance will be evaluated, and confirmation is subject to satisfactory performance.

2. WORKING HOURS: Standard working hours are 10:00 AM to 7:00 PM, Monday through Saturday. Flexibility may be required based on project needs.

3. LEAVE POLICY: Employees are entitled to 1 paid leave per month (12 annually) after probation. Sick leave and other leaves as per Company policy.

4. NOTICE PERIOD: A minimum of 30 days written notice is required for resignation. The Company may require up to 60 days notice for senior positions.

5. SALARY & COMPENSATION: Salary will be credited on the last working day of each month. Any bonuses or incentives are discretionary and subject to performance.

6. CODE OF CONDUCT: Employees must maintain professional behavior, respect colleagues, follow Company policies, and represent the Company positively.

7. REMOTE WORK: Remote work arrangements, if applicable, are subject to manager approval and Company policy. Employees must maintain productivity and availability during working hours.

8. EQUIPMENT: Company-provided equipment must be maintained in good condition and returned upon termination of employment.

9. TERMINATION: The Company reserves the right to terminate employment for cause including but not limited to misconduct, poor performance, policy violations, or breach of agreements.`

// ============================================
// FORM STATE TYPE
// ============================================

interface FormData {
  // Step 1
  mode: 'new' | 'search' | ''
  searchPhone: string
  searchEmail: string

  // Step 2 - Basic
  employeeName: string
  department: string
  role: string
  employeeType: string
  languagesKnown: string[]
  aiToolsKnown: string[]

  // Step 3 - Personal
  dateOfBirth: string
  joiningDate: string
  personalPhone: string
  email: string
  bloodGroup: string
  livingSituation: string
  currentAddress: string
  parentsAddress: string
  fatherPhone: string
  motherPhone: string

  // Step 4 - Documents
  profilePictureLink: string
  documentsLink: string
  educationCertificatesLink: string

  // Step 5 - Professional
  distanceFromOffice: string
  linkedinProfile: string
  githubPortfolio: string
  favoriteFood: string
  healthConditions: string
  hobbiesInterests: string

  // Step 6 - Bank
  accountHolderName: string
  bankName: string
  accountNumber: string
  ifscCode: string

  // Step 7 - Emergency
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyRelationship: string

  // Step 8 - IT
  hasPersonalLaptop: string
  laptopSpecs: string
  preferredOS: string

  // Step 9 - Agreements
  ndaAgreed: boolean
  employmentAgreed: boolean
  digitalSignature: string
}

const initialFormData: FormData = {
  mode: '',
  searchPhone: '',
  searchEmail: '',
  employeeName: '',
  department: '',
  role: '',
  employeeType: '',
  languagesKnown: [],
  aiToolsKnown: [],
  dateOfBirth: '',
  joiningDate: '',
  personalPhone: '',
  email: '',
  bloodGroup: '',
  livingSituation: '',
  currentAddress: '',
  parentsAddress: '',
  fatherPhone: '',
  motherPhone: '',
  profilePictureLink: '',
  documentsLink: '',
  educationCertificatesLink: '',
  distanceFromOffice: '',
  linkedinProfile: '',
  githubPortfolio: '',
  favoriteFood: '',
  healthConditions: '',
  hobbiesInterests: '',
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyRelationship: '',
  hasPersonalLaptop: '',
  laptopSpecs: '',
  preferredOS: '',
  ndaAgreed: false,
  employmentAgreed: false,
  digitalSignature: '',
}

// ============================================
// VALIDATION
// ============================================

type ValidationErrors = Partial<Record<keyof FormData, string>>

function validateStep(step: number, data: FormData): ValidationErrors {
  const errors: ValidationErrors = {}

  switch (step) {
    case 1: {
      if (!data.mode) {
        errors.mode = 'Please select an option to continue'
      }
      if (data.mode === 'search') {
        if (!data.searchPhone && !data.searchEmail) {
          errors.searchPhone = 'Enter phone or email to search'
        }
      }
      break
    }
    case 2: {
      if (!data.employeeName.trim()) {
        errors.employeeName = 'Employee name is required'
      } else if (data.employeeName.trim().split(/\s+/).length < 2) {
        errors.employeeName = 'Please enter full name (at least first and last name)'
      }
      if (!data.department) {
        errors.department = 'Please select a department'
      }
      if (!data.role) {
        errors.role = 'Please select a role'
      }
      if (!data.employeeType) {
        errors.employeeType = 'Please select employee type'
      }
      break
    }
    case 3: {
      if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
      if (!data.joiningDate) errors.joiningDate = 'Joining date is required'
      if (!data.personalPhone.trim()) {
        errors.personalPhone = 'Phone number is required'
      } else if (!/^\d{10}$/.test(data.personalPhone.trim())) {
        errors.personalPhone = 'Enter a valid 10-digit phone number'
      }
      if (!data.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = 'Enter a valid email address'
      }
      if (!data.currentAddress.trim()) {
        errors.currentAddress = 'Current address is required'
      }
      if (data.fatherPhone && !/^\d{10}$/.test(data.fatherPhone.trim())) {
        errors.fatherPhone = 'Enter a valid 10-digit phone number'
      }
      if (data.motherPhone && !/^\d{10}$/.test(data.motherPhone.trim())) {
        errors.motherPhone = 'Enter a valid 10-digit phone number'
      }
      break
    }
    case 4: {
      if (!data.documentsLink.trim()) {
        errors.documentsLink = 'PAN & AADHAR documents link is required'
      }
      break
    }
    case 5: {
      // All optional
      break
    }
    case 6: {
      if (!data.accountHolderName.trim()) errors.accountHolderName = 'Account holder name is required'
      if (!data.bankName.trim()) errors.bankName = 'Bank name is required'
      if (!data.accountNumber.trim()) errors.accountNumber = 'Account number is required'
      if (!data.ifscCode.trim()) {
        errors.ifscCode = 'IFSC code is required'
      } else if (data.ifscCode.trim().length !== 11) {
        errors.ifscCode = 'IFSC code must be exactly 11 characters'
      }
      break
    }
    case 7: {
      if (!data.emergencyContactName.trim()) errors.emergencyContactName = 'Emergency contact name is required'
      if (!data.emergencyContactPhone.trim()) {
        errors.emergencyContactPhone = 'Emergency contact phone is required'
      } else if (!/^\d{10}$/.test(data.emergencyContactPhone.trim())) {
        errors.emergencyContactPhone = 'Enter a valid 10-digit phone number'
      }
      break
    }
    case 8: {
      // All optional
      break
    }
    case 9: {
      if (!data.ndaAgreed) errors.ndaAgreed = 'You must agree to the NDA terms'
      if (!data.employmentAgreed) errors.employmentAgreed = 'You must agree to the employment terms'
      if (!data.digitalSignature.trim()) {
        errors.digitalSignature = 'Digital signature is required'
      }
      break
    }
  }

  return errors
}

// ============================================
// REVIEW SECTION COMPONENT
// ============================================

function ReviewSection({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-800/40 border-b border-white/5">
        <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-2.5 flex justify-between items-start gap-4">
            <span className="text-sm text-slate-500 flex-shrink-0">{item.label}</span>
            <span className="text-sm text-slate-300 text-right break-words">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// MAIN FORM COMPONENT
// ============================================

function EmployeeOnboardingForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({ ...initialFormData })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [ndaExpanded, setNdaExpanded] = useState(false)
  const [termsExpanded, setTermsExpanded] = useState(false)

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      // Reset role when department changes
      if (field === 'department') {
        next.role = ''
      }
      return next
    })
    // Clear error for the field being updated
    setErrors(prev => {
      if (prev[field]) {
        const next = { ...prev }
        delete next[field]
        return next
      }
      return prev
    })
  }, [])

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(step, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step, formData])

  const handleBack = useCallback(() => {
    setErrors({})
    setStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearch = useCallback(async () => {
    if (!formData.searchPhone && !formData.searchEmail) {
      setErrors({ searchPhone: 'Enter phone or email to search' })
      return
    }
    setSearchLoading(true)
    setSearchMessage('')
    try {
      const params = new URLSearchParams()
      if (formData.searchPhone) params.set('phone', formData.searchPhone)
      if (formData.searchEmail) params.set('email', formData.searchEmail)
      const res = await fetch(`/api/public/employee-onboarding?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.employee) {
          const e = data.employee
          setFormData(prev => ({
            ...prev,
            employeeName: e.employeeName || prev.employeeName,
            department: e.department || prev.department,
            role: e.role || prev.role,
            employeeType: e.employeeType || prev.employeeType,
            languagesKnown: e.languagesKnown || prev.languagesKnown,
            aiToolsKnown: e.aiToolsKnown || prev.aiToolsKnown,
            dateOfBirth: e.dateOfBirth || prev.dateOfBirth,
            joiningDate: e.joiningDate || prev.joiningDate,
            personalPhone: e.personalPhone || prev.personalPhone,
            email: e.email || prev.email,
            bloodGroup: e.bloodGroup || prev.bloodGroup,
            livingSituation: e.livingSituation || prev.livingSituation,
            currentAddress: e.currentAddress || prev.currentAddress,
            parentsAddress: e.parentsAddress || prev.parentsAddress,
            fatherPhone: e.fatherPhone || prev.fatherPhone,
            motherPhone: e.motherPhone || prev.motherPhone,
            profilePictureLink: e.profilePictureLink || prev.profilePictureLink,
            documentsLink: e.documentsLink || prev.documentsLink,
            educationCertificatesLink: e.educationCertificatesLink || prev.educationCertificatesLink,
            distanceFromOffice: e.distanceFromOffice || prev.distanceFromOffice,
            linkedinProfile: e.linkedinProfile || prev.linkedinProfile,
            githubPortfolio: e.githubPortfolio || prev.githubPortfolio,
            favoriteFood: e.favoriteFood || prev.favoriteFood,
            healthConditions: e.healthConditions || prev.healthConditions,
            hobbiesInterests: e.hobbiesInterests || prev.hobbiesInterests,
            accountHolderName: e.accountHolderName || prev.accountHolderName,
            bankName: e.bankName || prev.bankName,
            accountNumber: e.accountNumber || prev.accountNumber,
            ifscCode: e.ifscCode || prev.ifscCode,
            emergencyContactName: e.emergencyContactName || prev.emergencyContactName,
            emergencyContactPhone: e.emergencyContactPhone || prev.emergencyContactPhone,
            emergencyRelationship: e.emergencyRelationship || prev.emergencyRelationship,
            hasPersonalLaptop: e.hasPersonalLaptop || prev.hasPersonalLaptop,
            laptopSpecs: e.laptopSpecs || prev.laptopSpecs,
            preferredOS: e.preferredOS || prev.preferredOS,
          }))
          setSearchMessage('Record found! Data has been loaded. Proceeding to next step...')
          setTimeout(() => {
            setStep(2)
            setSearchMessage('')
          }, 1500)
        } else {
          setSearchMessage('No existing record found. You can start fresh.')
        }
      } else {
        setSearchMessage('No existing record found. You can start fresh.')
      }
    } catch {
      setSearchMessage('Search failed. Please try again or start fresh.')
    } finally {
      setSearchLoading(false)
    }
  }, [formData.searchPhone, formData.searchEmail])

  const handleSubmit = useCallback(async () => {
    const stepErrors = validateStep(9, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setLoading(true)
    try {
      // Transform form data to match API schema
      const nameParts = formData.employeeName.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const roleMap: Record<string, string> = {
        'FULL_TIME': 'EMPLOYEE',
        'PART_TIME': 'EMPLOYEE',
        'INTERN': 'INTERN',
        'FREELANCER': 'FREELANCER',
      }

      const apiData = {
        firstName,
        lastName,
        phone: formData.personalPhone,
        email: formData.email,
        department: formData.department,
        employeeType: formData.employeeType,
        role: roleMap[formData.employeeType] || 'EMPLOYEE',
        joiningDate: formData.joiningDate || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        address: formData.currentAddress || undefined,
        languages: formData.languagesKnown?.join(', ') || undefined,
        aiTools: formData.aiToolsKnown?.join(', ') || undefined,
        healthConditions: formData.healthConditions || undefined,
        profileData: {
          profilePicture: formData.profilePictureLink || undefined,
          panCard: formData.documentsLink || undefined,
          aadhaar: formData.documentsLink || undefined,
          linkedIn: formData.linkedinProfile || undefined,
          favoriteFood: formData.favoriteFood || undefined,
          parentsPhone1: formData.fatherPhone || undefined,
          parentsPhone2: formData.motherPhone || undefined,
          livingSituation: formData.livingSituation || undefined,
          distanceFromOffice: formData.distanceFromOffice || undefined,
          educationCertUrl: formData.educationCertificatesLink || undefined,
          ndaSigned: formData.ndaAgreed || false,
          ndaSignedAt: formData.ndaAgreed ? new Date().toISOString() : null,
          bankDetailsUrl: undefined,
        },
      }

      const res = await fetch('/api/public/employee-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const errData = await res.json().catch(() => null)
        setErrors({ digitalSignature: errData?.error || errData?.message || 'Submission failed. Please try again.' })
      }
    } catch {
      setErrors({ digitalSignature: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }, [formData])

  // ============================================
  // SUCCESS SCREEN
  // ============================================

  if (submitted) {
    return (
      <SuccessScreen
        theme="dark"
        title="Your onboarding is complete!"
        message="Welcome to Branding Pioneers. Your details have been submitted successfully. The HR team will review and get in touch shortly."
        details={[
          { label: 'Name', value: formData.employeeName },
          { label: 'Department', value: DEPARTMENTS.find(d => d.value === formData.department)?.label || formData.department },
          { label: 'Role', value: POSITIONS_MAP[formData.department]?.find(r => r.value === formData.role)?.label || formData.role },
          { label: 'Email', value: formData.email },
          { label: 'Phone', value: formData.personalPhone },
        ]}
        primaryAction={{
          label: 'Start New Onboarding',
          onClick: () => {
            setFormData({ ...initialFormData })
            setStep(1)
            setSubmitted(false)
            setErrors({})
          },
        }}
      />
    )
  }

  // ============================================
  // STEP RENDERERS
  // ============================================

  const renderStep1 = () => (
    <div className="space-y-6">
      <FormCard
        title="Getting Started"
        description="Begin your onboarding journey at Branding Pioneers"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <SingleSelect
            label="How would you like to start?"
            name="mode"
            value={formData.mode}
            onChange={(v) => updateField('mode', v as 'new' | 'search')}
            options={[
              { value: 'new', label: "I'm a new employee", description: 'Start a fresh onboarding form', emoji: '\u{1F31F}' },
              { value: 'search', label: 'Search existing record', description: 'Load previously saved data', emoji: '\u{1F50E}' },
            ]}
            required
            error={errors.mode}
            accentColor="orange"
          />

          {formData.mode === 'search' && (
            <div className="space-y-4 p-5 rounded-xl border border-white/10 bg-slate-800/30">
              <p className="text-sm text-slate-400">Enter your phone number or email to find your existing record.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextInput
                  label="Phone Number"
                  name="searchPhone"
                  value={formData.searchPhone}
                  onChange={(v) => updateField('searchPhone', v)}
                  type="tel"
                  placeholder="10-digit phone number"
                  error={errors.searchPhone}
                />
                <TextInput
                  label="Email"
                  name="searchEmail"
                  value={formData.searchEmail}
                  onChange={(v) => updateField('searchEmail', v)}
                  type="email"
                  placeholder="your@email.com"
                  error={errors.searchEmail}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {searchLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search &amp; Load
                  </>
                )}
              </button>
              {searchMessage && (
                <p className={`text-sm ${searchMessage.includes('found!') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {searchMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </FormCard>

      {formData.mode && (
        <FormButtons
          onNext={formData.mode === 'new' ? handleNext : undefined}
          showBack={false}
          accentColor="orange"
          nextLabel="Get Started"
        />
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <FormCard
        title="Basic Information"
        description="Tell us about yourself and your role"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <TextInput
            label="Employee Name"
            name="employeeName"
            value={formData.employeeName}
            onChange={(v) => updateField('employeeName', v)}
            placeholder="Enter full name (first and last)"
            required
            error={errors.employeeName}
          />

          <SingleSelect
            label="Department"
            name="department"
            value={formData.department}
            onChange={(v) => updateField('department', v)}
            options={DEPARTMENTS}
            required
            error={errors.department}
            columns={5}
            size="sm"
            accentColor="orange"
          />

          {formData.department && (
            <DropdownSelect
              label="Role"
              name="role"
              value={formData.role}
              onChange={(v) => updateField('role', v)}
              options={POSITIONS_MAP[formData.department] || []}
              placeholder="Select your role"
              required
              error={errors.role}
            />
          )}

          <SingleSelect
            label="Employee Type"
            name="employeeType"
            value={formData.employeeType}
            onChange={(v) => updateField('employeeType', v)}
            options={EMPLOYEE_TYPES}
            required
            error={errors.employeeType}
            columns={4}
            size="sm"
            accentColor="orange"
          />

          <MultiSelect
            label="Languages Known"
            name="languagesKnown"
            value={formData.languagesKnown}
            onChange={(v) => updateField('languagesKnown', v)}
            options={LANGUAGES}
            columns={3}
            accentColor="orange"
          />

          <MultiSelect
            label="AI Tools Known"
            name="aiToolsKnown"
            value={formData.aiToolsKnown}
            onChange={(v) => updateField('aiToolsKnown', v)}
            options={AI_TOOLS}
            columns={4}
            accentColor="orange"
          />
        </div>
      </FormCard>

      <FormButtons
        onBack={handleBack}
        onNext={handleNext}
        accentColor="orange"
      />
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <FormCard
        title="Personal Details"
        description="We need some personal information for your records"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="Date of Birth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(v) => updateField('dateOfBirth', v)}
              type="date"
              required
              error={errors.dateOfBirth}
            />
            <TextInput
              label="Joining Date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={(v) => updateField('joiningDate', v)}
              type="date"
              required
              error={errors.joiningDate}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="Personal Phone Number"
              name="personalPhone"
              value={formData.personalPhone}
              onChange={(v) => updateField('personalPhone', v)}
              type="tel"
              placeholder="10-digit phone number"
              required
              error={errors.personalPhone}
            />
            <TextInput
              label="Email ID"
              name="email"
              value={formData.email}
              onChange={(v) => updateField('email', v)}
              type="email"
              placeholder="your@email.com"
              required
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DropdownSelect
              label="Blood Group"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={(v) => updateField('bloodGroup', v)}
              options={BLOOD_GROUPS}
              placeholder="Select blood group"
            />
            <SingleSelect
              label="Living Situation"
              name="livingSituation"
              value={formData.livingSituation}
              onChange={(v) => updateField('livingSituation', v)}
              options={LIVING_SITUATIONS}
              columns={2}
              size="sm"
              accentColor="orange"
            />
          </div>

          <Textarea
            label="Current Address"
            name="currentAddress"
            value={formData.currentAddress}
            onChange={(v) => updateField('currentAddress', v)}
            placeholder="Enter your complete current address"
            required
            error={errors.currentAddress}
            rows={3}
          />

          <Textarea
            label="Parents/Guardians Address with Name"
            name="parentsAddress"
            value={formData.parentsAddress}
            onChange={(v) => updateField('parentsAddress', v)}
            placeholder="Enter parent/guardian name and complete address"
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="Father's Phone Number"
              name="fatherPhone"
              value={formData.fatherPhone}
              onChange={(v) => updateField('fatherPhone', v)}
              type="tel"
              placeholder="10-digit phone number"
              error={errors.fatherPhone}
            />
            <TextInput
              label="Mother's Phone Number"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={(v) => updateField('motherPhone', v)}
              type="tel"
              placeholder="10-digit phone number"
              error={errors.motherPhone}
            />
          </div>
        </div>
      </FormCard>

      <FormButtons
        onBack={handleBack}
        onNext={handleNext}
        accentColor="orange"
      />
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Instruction Card */}
      <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-300 mb-1">Upload Instructions</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              For file uploads, please email to:{' '}
              <span className="font-semibold text-blue-300">brandingpioneers@gmail.in</span>.
              Or upload to Google Drive and paste the shareable links below.
            </p>
          </div>
        </div>
      </div>

      <FormCard
        title="Profile & Documents"
        description="Share your documents via Google Drive links"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <TextInput
            label="Profile Picture (Google Drive Link)"
            name="profilePictureLink"
            value={formData.profilePictureLink}
            onChange={(v) => updateField('profilePictureLink', v)}
            placeholder="Paste Google Drive link for profile picture"
          />

          <TextInput
            label="Documents - PAN, AADHAR (Google Drive Link)"
            name="documentsLink"
            value={formData.documentsLink}
            onChange={(v) => updateField('documentsLink', v)}
            placeholder="Paste Google Drive link for PAN, AADHAR documents"
            required
            error={errors.documentsLink}
          />

          <TextInput
            label="Education Certificates (Google Drive Link)"
            name="educationCertificatesLink"
            value={formData.educationCertificatesLink}
            onChange={(v) => updateField('educationCertificatesLink', v)}
            placeholder="Paste Google Drive link for education certificates"
          />
        </div>
      </FormCard>

      <FormButtons
        onBack={handleBack}
        onNext={handleNext}
        accentColor="orange"
      />
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <FormCard
        title="Professional & Lifestyle"
        description="Help us get to know you better"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <TextInput
            label="Distance from Office & Living Details"
            name="distanceFromOffice"
            value={formData.distanceFromOffice}
            onChange={(v) => updateField('distanceFromOffice', v)}
            placeholder="e.g., 15 km from office, living with parents"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="LinkedIn Profile"
              name="linkedinProfile"
              value={formData.linkedinProfile}
              onChange={(v) => updateField('linkedinProfile', v)}
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
            />
            <TextInput
              label="GitHub/Portfolio URL"
              name="githubPortfolio"
              value={formData.githubPortfolio}
              onChange={(v) => updateField('githubPortfolio', v)}
              type="url"
              placeholder="https://github.com/username"
            />
          </div>

          <TextInput
            label="Favorite Food"
            name="favoriteFood"
            value={formData.favoriteFood}
            onChange={(v) => updateField('favoriteFood', v)}
            placeholder="What do you love to eat?"
          />

          <TextInput
            label="Any Existing Health Conditions"
            name="healthConditions"
            value={formData.healthConditions}
            onChange={(v) => updateField('healthConditions', v)}
            placeholder="Enter any existing health conditions or 'None'"
          />

          <TextInput
            label="Hobbies/Interests"
            name="hobbiesInterests"
            value={formData.hobbiesInterests}
            onChange={(v) => updateField('hobbiesInterests', v)}
            placeholder="What do you enjoy doing in your free time?"
          />
        </div>
      </FormCard>

      <FormButtons
        onBack={handleBack}
        onNext={handleNext}
        accentColor="orange"
      />
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <FormCard
        title="Bank Details"
        description="Your salary account information"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="Account Holder Name"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={(v) => updateField('accountHolderName', v)}
              placeholder="Name as per bank account"
              required
              error={errors.accountHolderName}
            />
            <TextInput
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={(v) => updateField('bankName', v)}
              placeholder="e.g., State Bank of India"
              required
              error={errors.bankName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={(v) => updateField('accountNumber', v)}
              placeholder="Enter account number"
              required
              error={errors.accountNumber}
            />
            <TextInput
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={(v) => updateField('ifscCode', v.toUpperCase())}
              placeholder="e.g., SBIN0001234"
              required
              error={errors.ifscCode}
              helper="11-character bank branch code"
            />
          </div>
        </div>
      </FormCard>

      <FormButtons
        onBack={handleBack}
        onNext={handleNext}
        accentColor="orange"
      />
    </div>
  )

  const renderStep7 = () => (
    <div className="space-y-6">
      <FormCard
        title="Emergency Contact"
        description="Who should we contact in case of an emergency?"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <TextInput
            label="Emergency Contact Name"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(v) => updateField('emergencyContactName', v)}
            placeholder="Full name of emergency contact"
            required
            error={errors.emergencyContactName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextInput
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(v) => updateField('emergencyContactPhone', v)}
              type="tel"
              placeholder="10-digit phone number"
              required
              error={errors.emergencyContactPhone}
            />
            <DropdownSelect
              label="Relationship"
              name="emergencyRelationship"
              value={formData.emergencyRelationship}
              onChange={(v) => updateField('emergencyRelationship', v)}
              options={RELATIONSHIPS}
              placeholder="Select relationship"
            />
          </div>
        </div>
      </FormCard>

      <FormButtons
        onBack={handleBack}
        onNext={handleNext}
        accentColor="orange"
      />
    </div>
  )

  const renderStep8 = () => (
    <div className="space-y-6">
      <FormCard
        title="IT Setup & Preferences"
        description="Help us prepare your workspace"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <SingleSelect
            label="Do you have a personal laptop?"
            name="hasPersonalLaptop"
            value={formData.hasPersonalLaptop}
            onChange={(v) => updateField('hasPersonalLaptop', v)}
            options={LAPTOP_OPTIONS}
            columns={2}
            accentColor="orange"
          />

          {formData.hasPersonalLaptop === 'yes' && (
            <TextInput
              label="Laptop Specifications"
              name="laptopSpecs"
              value={formData.laptopSpecs}
              onChange={(v) => updateField('laptopSpecs', v)}
              placeholder="e.g., MacBook Air M2, 8GB RAM, 256GB SSD"
            />
          )}

          <SingleSelect
            label="Preferred Operating System"
            name="preferredOS"
            value={formData.preferredOS}
            onChange={(v) => updateField('preferredOS', v)}
            options={OS_OPTIONS}
            columns={3}
            accentColor="orange"
          />
        </div>
      </FormCard>

      <FormButtons
        onBack={handleBack}
        onNext={handleNext}
        accentColor="orange"
      />
    </div>
  )

  const renderStep9 = () => {
    const getDeptLabel = (val: string) => DEPARTMENTS.find(d => d.value === val)?.label || val
    const getRoleLabel = (dept: string, role: string) => POSITIONS_MAP[dept]?.find(r => r.value === role)?.label || role
    const getEmpTypeLabel = (val: string) => EMPLOYEE_TYPES.find(e => e.value === val)?.label || val
    const getLivingLabel = (val: string) => LIVING_SITUATIONS.find(l => l.value === val)?.label || val
    const getRelLabel = (val: string) => RELATIONSHIPS.find(r => r.value === val)?.label || val
    const getOsLabel = (val: string) => OS_OPTIONS.find(o => o.value === val)?.label || val

    return (
      <div className="space-y-6">
        {/* NDA Agreement */}
        <FormCard
          title="Non-Disclosure Agreement (NDA)"
          description="Please read and agree to the NDA terms"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        >
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setNdaExpanded(!ndaExpanded)}
              className="flex items-center justify-between w-full p-4 rounded-xl border border-white/10 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-300">
                {ndaExpanded ? 'Hide NDA Terms' : 'Read NDA Terms'}
              </span>
              <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${ndaExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {ndaExpanded && (
              <div className="p-4 rounded-xl border border-white/5 bg-slate-800/20 max-h-64 overflow-y-auto">
                <pre className="text-sm text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">{NDA_TEXT}</pre>
              </div>
            )}
            <Checkbox
              label="I have read and agree to the Non-Disclosure Agreement terms"
              name="ndaAgreed"
              checked={formData.ndaAgreed}
              onChange={(v) => updateField('ndaAgreed', v)}
              required
              error={errors.ndaAgreed}
              accentColor="orange"
            />
          </div>
        </FormCard>

        {/* Employment Agreement */}
        <FormCard
          title="Employment Agreement"
          description="Please read and agree to the employment terms"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        >
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setTermsExpanded(!termsExpanded)}
              className="flex items-center justify-between w-full p-4 rounded-xl border border-white/10 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-300">
                {termsExpanded ? 'Hide Employment Terms' : 'Read Employment Terms'}
              </span>
              <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${termsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {termsExpanded && (
              <div className="p-4 rounded-xl border border-white/5 bg-slate-800/20 max-h-64 overflow-y-auto">
                <pre className="text-sm text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">{EMPLOYMENT_TERMS_TEXT}</pre>
              </div>
            )}
            <Checkbox
              label="I have read and agree to the Employment Agreement terms"
              name="employmentAgreed"
              checked={formData.employmentAgreed}
              onChange={(v) => updateField('employmentAgreed', v)}
              required
              error={errors.employmentAgreed}
              accentColor="orange"
            />
          </div>
        </FormCard>

        {/* Digital Signature */}
        <FormCard
          title="Digital Signature"
          description="Type your full legal name as your digital signature"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          }
        >
          <TextInput
            label="Full Name as Signature"
            name="digitalSignature"
            value={formData.digitalSignature}
            onChange={(v) => updateField('digitalSignature', v)}
            placeholder="Type your full legal name"
            required
            error={errors.digitalSignature}
          />
        </FormCard>

        {/* Review Summary */}
        <FormCard
          title="Review Your Information"
          description="Please verify all details before submitting"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        >
          <div className="space-y-4">
            <ReviewSection title="Basic Information" items={[
              { label: 'Name', value: formData.employeeName },
              { label: 'Department', value: getDeptLabel(formData.department) },
              { label: 'Role', value: getRoleLabel(formData.department, formData.role) },
              { label: 'Employee Type', value: getEmpTypeLabel(formData.employeeType) },
              { label: 'Languages', value: formData.languagesKnown.join(', ') || '-' },
              { label: 'AI Tools', value: formData.aiToolsKnown.join(', ') || '-' },
            ]} />

            <ReviewSection title="Personal Details" items={[
              { label: 'Date of Birth', value: formData.dateOfBirth || '-' },
              { label: 'Joining Date', value: formData.joiningDate || '-' },
              { label: 'Phone', value: formData.personalPhone || '-' },
              { label: 'Email', value: formData.email || '-' },
              { label: 'Blood Group', value: formData.bloodGroup || '-' },
              { label: 'Living Situation', value: formData.livingSituation ? getLivingLabel(formData.livingSituation) : '-' },
              { label: 'Current Address', value: formData.currentAddress || '-' },
            ]} />

            <ReviewSection title="Bank Details" items={[
              { label: 'Account Holder', value: formData.accountHolderName || '-' },
              { label: 'Bank', value: formData.bankName || '-' },
              { label: 'Account No.', value: formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : '-' },
              { label: 'IFSC', value: formData.ifscCode || '-' },
            ]} />

            <ReviewSection title="Emergency Contact" items={[
              { label: 'Name', value: formData.emergencyContactName || '-' },
              { label: 'Phone', value: formData.emergencyContactPhone || '-' },
              { label: 'Relationship', value: formData.emergencyRelationship ? getRelLabel(formData.emergencyRelationship) : '-' },
            ]} />

            <ReviewSection title="IT Setup" items={[
              { label: 'Personal Laptop', value: formData.hasPersonalLaptop === 'yes' ? `Yes - ${formData.laptopSpecs || 'No specs provided'}` : formData.hasPersonalLaptop === 'no' ? 'No' : '-' },
              { label: 'Preferred OS', value: formData.preferredOS ? getOsLabel(formData.preferredOS) : '-' },
            ]} />
          </div>
        </FormCard>

        <FormButtons
          onBack={handleBack}
          onSubmit={handleSubmit}
          loading={loading}
          accentColor="orange"
          submitLabel="Complete Onboarding"
        />
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      case 7: return renderStep7()
      case 8: return renderStep8()
      case 9: return renderStep9()
      default: return null
    }
  }

  return (
    <FormLayout
      title="Employee Onboarding"
      subtitle="Branding Pioneers \u2014 Welcome Aboard"
      step={step}
      totalSteps={TOTAL_STEPS}
      brandColor="orange"
      theme="dark"
      maxWidth="4xl"
    >
      <StepIndicator
        currentStep={step - 1}
        totalSteps={TOTAL_STEPS}
        labels={STEP_LABELS}
        accentColor="orange"
      />
      <div className="transition-all duration-300 ease-in-out">
        {renderCurrentStep()}
      </div>
    </FormLayout>
  )
}

// ============================================
// PAGE EXPORT WITH SUSPENSE
// ============================================

export default function EmployeeOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading onboarding form...</p>
          </div>
        </div>
      }
    >
      <EmployeeOnboardingForm />
    </Suspense>
  )
}
