'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
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
  { value: 'WEB', label: 'Web Development', description: 'Build websites & apps', emoji: '💻' },
  { value: 'SOCIAL', label: 'Social Media', description: 'Content & community', emoji: '📱' },
  { value: 'ADS', label: 'Performance Ads', description: 'Google & Meta Ads', emoji: '📈' },
  { value: 'SEO', label: 'SEO', description: 'Search optimization', emoji: '🔍' },
  { value: 'SALES', label: 'Sales & BD', description: 'Business development', emoji: '🤝' },
  { value: 'DESIGN', label: 'Design', description: 'Visual & UI/UX', emoji: '🎨' },
  { value: 'VIDEO', label: 'Video Production', description: 'Shoots & editing', emoji: '🎬' },
  { value: 'HR', label: 'Human Resources', description: 'People operations', emoji: '👥' },
]

const POSITIONS: Record<string, { value: string; label: string }[]> = {
  'WEB': [
    { value: 'web_developer', label: 'Web Developer' },
    { value: 'frontend_developer', label: 'Frontend Developer' },
    { value: 'fullstack_developer', label: 'Full Stack Developer' },
    { value: 'wordpress_developer', label: 'WordPress Developer' },
    { value: 'ui_ux_designer', label: 'UI/UX Designer' },
  ],
  'SOCIAL': [
    { value: 'social_media_manager', label: 'Social Media Manager' },
    { value: 'content_writer', label: 'Content Writer' },
    { value: 'client_servicing', label: 'Client Servicing Executive' },
    { value: 'community_manager', label: 'Community Manager' },
  ],
  'ADS': [
    { value: 'google_ads_specialist', label: 'Google Ads Specialist' },
    { value: 'meta_ads_specialist', label: 'Meta Ads Specialist' },
    { value: 'ppc_manager', label: 'PPC Manager' },
    { value: 'performance_analyst', label: 'Performance Analyst' },
  ],
  'SEO': [
    { value: 'seo_executive', label: 'SEO Executive' },
    { value: 'seo_analyst', label: 'SEO Analyst' },
    { value: 'content_strategist', label: 'Content Strategist' },
    { value: 'link_building_specialist', label: 'Link Building Specialist' },
  ],
  'SALES': [
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'bd_manager', label: 'Business Development Manager' },
    { value: 'account_manager', label: 'Account Manager' },
  ],
  'DESIGN': [
    { value: 'graphic_designer', label: 'Graphic Designer' },
    { value: 'motion_designer', label: 'Motion Graphics Designer' },
    { value: 'brand_designer', label: 'Brand Designer' },
  ],
  'VIDEO': [
    { value: 'video_editor', label: 'Video Editor' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'motion_graphics', label: 'Motion Graphics Artist' },
  ],
  'HR': [
    { value: 'hr_executive', label: 'HR Executive' },
    { value: 'recruiter', label: 'Talent Acquisition Specialist' },
  ],
}

const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher', description: '0-1 years', emoji: '🌱' },
  { value: 'junior', label: 'Junior', description: '1-2 years', emoji: '📗' },
  { value: 'mid', label: 'Mid-Level', description: '2-4 years', emoji: '📘' },
  { value: 'senior', label: 'Senior', description: '4-6 years', emoji: '📙' },
  { value: 'expert', label: 'Expert', description: '6+ years', emoji: '📕' },
]

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time', description: 'Standard 9-6 role', emoji: '💼' },
  { value: 'part_time', label: 'Part Time', description: 'Flexible hours', emoji: '⏰' },
  { value: 'internship', label: 'Internship', description: '3-6 months program', emoji: '🎓' },
  { value: 'freelance', label: 'Freelance', description: 'Project-based work', emoji: '🏠' },
]

const NOTICE_PERIODS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '15_days', label: '15 Days' },
  { value: '30_days', label: '30 Days' },
  { value: '60_days', label: '60 Days' },
  { value: '90_days', label: '90 Days' },
]

const SOURCES = [
  { value: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { value: 'naukri', label: 'Naukri', emoji: '📋' },
  { value: 'indeed', label: 'Indeed', emoji: '🔍' },
  { value: 'referral', label: 'Employee Referral', emoji: '👥' },
  { value: 'website', label: 'Company Website', emoji: '🌐' },
  { value: 'social', label: 'Social Media', emoji: '📱' },
  { value: 'other', label: 'Other', emoji: '📌' },
]

const SKILLS_BY_DEPT: Record<string, { value: string; label: string }[]> = {
  'WEB': [
    { value: 'html_css', label: 'HTML/CSS' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React.js' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'wordpress', label: 'WordPress' },
    { value: 'php', label: 'PHP' },
    { value: 'figma', label: 'Figma' },
  ],
  'SOCIAL': [
    { value: 'content_writing', label: 'Content Writing' },
    { value: 'copywriting', label: 'Copywriting' },
    { value: 'canva', label: 'Canva' },
    { value: 'hootsuite', label: 'Hootsuite' },
    { value: 'meta_suite', label: 'Meta Business Suite' },
    { value: 'analytics', label: 'Social Analytics' },
  ],
  'ADS': [
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'meta_ads', label: 'Meta Ads' },
    { value: 'analytics', label: 'Google Analytics' },
    { value: 'tag_manager', label: 'Tag Manager' },
    { value: 'data_studio', label: 'Looker Studio' },
    { value: 'excel', label: 'Advanced Excel' },
  ],
  'SEO': [
    { value: 'on_page', label: 'On-Page SEO' },
    { value: 'off_page', label: 'Off-Page SEO' },
    { value: 'technical_seo', label: 'Technical SEO' },
    { value: 'ahrefs', label: 'Ahrefs' },
    { value: 'semrush', label: 'SEMrush' },
    { value: 'search_console', label: 'Search Console' },
  ],
  'DESIGN': [
    { value: 'photoshop', label: 'Photoshop' },
    { value: 'illustrator', label: 'Illustrator' },
    { value: 'figma', label: 'Figma' },
    { value: 'after_effects', label: 'After Effects' },
    { value: 'premiere', label: 'Premiere Pro' },
  ],
  'VIDEO': [
    { value: 'premiere', label: 'Premiere Pro' },
    { value: 'after_effects', label: 'After Effects' },
    { value: 'davinci', label: 'DaVinci Resolve' },
    { value: 'final_cut', label: 'Final Cut Pro' },
    { value: 'camera_ops', label: 'Camera Operation' },
  ],
}

const STEPS = [
  { num: 1, label: 'Personal Info' },
  { num: 2, label: 'Position' },
  { num: 3, label: 'Experience' },
  { num: 4, label: 'Submit' },
]

// ============================================
// MAIN COMPONENT
// ============================================

function CareersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledDept = searchParams.get('dept')
  const prefilledPosition = searchParams.get('position')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [applicationId, setApplicationId] = useState('')

  const [form, setForm] = useState({
    // Step 1: Personal Info
    name: '',
    email: '',
    phone: '',
    city: '',
    linkedIn: '',
    portfolio: '',

    // Step 2: Position
    department: prefilledDept || '',
    position: prefilledPosition || '',
    employmentType: '',
    source: '',
    referredBy: '',

    // Step 3: Experience
    experienceLevel: '',
    totalExperience: '',
    currentCompany: '',
    currentRole: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '',
    skills: [] as string[],
    resumeUrl: '',

    // Step 4: Submit
    coverLetter: '',
    whyJoin: '',
    availability: '',
    privacyAccepted: false,
  })

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return form.name && form.email && form.phone
      case 2:
        return form.department && form.position && form.employmentType
      case 3:
        return form.experienceLevel && form.expectedSalary && form.noticePeriod
      case 4:
        return form.privacyAccepted
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const data = await res.json()
        setApplicationId(data.applicationId || 'Submitted')
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

  if (success) {
    return (
      <SuccessScreen
        title="Application Submitted!"
        message="Thank you for your interest in joining Branding Pioneers. Our HR team will review your application and get back to you within 3-5 business days."
        details={[
          { label: 'Application ID', value: applicationId },
          { label: 'Position', value: form.position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
          { label: 'Department', value: form.department },
        ]}
        primaryAction={{
          label: 'View Careers Page',
          onClick: () => window.open('https://brandingpioneers.in/careers', '_blank'),
        }}
        secondaryAction={{
          label: 'Apply for Another Position',
          onClick: () => router.refresh(),
        }}
      />
    )
  }

  return (
    <FormLayout
      title="Join Our Team"
      subtitle="Career Application"
      step={step}
      totalSteps={STEPS.length}
      brandColor="orange"
      theme="dark"
    >
      <div className="space-y-6">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <>
            <FormCard
              title="Tell us about yourself"
              description="Your basic information to get started"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            >
              <div className="space-y-6">
                <TextInput
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={(v) => updateField('name', v)}
                  placeholder="Your full name"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Email Address"
                    name="email"
                    value={form.email}
                    onChange={(v) => updateField('email', v)}
                    type="email"
                    placeholder="your.email@example.com"
                    required
                  />
                  <TextInput
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={(v) => updateField('phone', v)}
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <TextInput
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={(v) => updateField('city', v)}
                  placeholder="Current city of residence"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="LinkedIn Profile"
                    name="linkedIn"
                    value={form.linkedIn}
                    onChange={(v) => updateField('linkedIn', v)}
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <TextInput
                    label="Portfolio / Website"
                    name="portfolio"
                    value={form.portfolio}
                    onChange={(v) => updateField('portfolio', v)}
                    type="url"
                    placeholder="Your portfolio or personal website"
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

        {/* Step 2: Position */}
        {step === 2 && (
          <>
            <FormCard
              title="What position are you applying for?"
              description="Tell us about the role you're interested in"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            >
              <div className="space-y-6">
                <SingleSelect
                  label="Which department interests you?"
                  name="department"
                  value={form.department}
                  onChange={(v) => {
                    updateField('department', v)
                    updateField('position', '') // Reset position when department changes
                  }}
                  options={DEPARTMENTS}
                  columns={4}
                  size="sm"
                  required
                />

                {form.department && POSITIONS[form.department] && (
                  <DropdownSelect
                    label="Select Position"
                    name="position"
                    value={form.position}
                    onChange={(v) => updateField('position', v)}
                    options={POSITIONS[form.department]}
                    placeholder="Choose a position"
                    required
                  />
                )}

                <SingleSelect
                  label="Employment Type"
                  name="employmentType"
                  value={form.employmentType}
                  onChange={(v) => updateField('employmentType', v)}
                  options={EMPLOYMENT_TYPES}
                  columns={4}
                  size="sm"
                  required
                />

                <SingleSelect
                  label="How did you hear about us?"
                  name="source"
                  value={form.source}
                  onChange={(v) => updateField('source', v)}
                  options={SOURCES}
                  columns={4}
                  size="sm"
                />

                {form.source === 'referral' && (
                  <TextInput
                    label="Referred By (Employee Name or ID)"
                    name="referredBy"
                    value={form.referredBy}
                    onChange={(v) => updateField('referredBy', v)}
                    placeholder="Name of the employee who referred you"
                  />
                )}
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <>
            <FormCard
              title="Your Experience & Skills"
              description="Help us understand your background"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
            >
              <div className="space-y-6">
                <SingleSelect
                  label="Experience Level"
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={(v) => updateField('experienceLevel', v)}
                  options={EXPERIENCE_LEVELS}
                  columns={5}
                  size="sm"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Total Years of Experience"
                    name="totalExperience"
                    value={form.totalExperience}
                    onChange={(v) => updateField('totalExperience', v)}
                    placeholder="e.g., 2.5 years"
                  />
                  <TextInput
                    label="Current Company"
                    name="currentCompany"
                    value={form.currentCompany}
                    onChange={(v) => updateField('currentCompany', v)}
                    placeholder="Your current employer"
                  />
                  <TextInput
                    label="Current Role"
                    name="currentRole"
                    value={form.currentRole}
                    onChange={(v) => updateField('currentRole', v)}
                    placeholder="Your current designation"
                  />
                  <TextInput
                    label="Current Salary (LPA)"
                    name="currentSalary"
                    value={form.currentSalary}
                    onChange={(v) => updateField('currentSalary', v)}
                    placeholder="e.g., 5 LPA or ₹50,000/month"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    label="Expected Salary (LPA)"
                    name="expectedSalary"
                    value={form.expectedSalary}
                    onChange={(v) => updateField('expectedSalary', v)}
                    placeholder="e.g., 7 LPA"
                    required
                  />
                  <DropdownSelect
                    label="Notice Period"
                    name="noticePeriod"
                    value={form.noticePeriod}
                    onChange={(v) => updateField('noticePeriod', v)}
                    options={NOTICE_PERIODS}
                    placeholder="Select notice period"
                    required
                  />
                </div>

                {form.department && SKILLS_BY_DEPT[form.department] && (
                  <MultiSelect
                    label="Select Your Skills"
                    name="skills"
                    value={form.skills}
                    onChange={(v) => updateField('skills', v)}
                    options={SKILLS_BY_DEPT[form.department]}
                    columns={4}
                  />
                )}

                <TextInput
                  label="Resume / CV Link"
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={(v) => updateField('resumeUrl', v)}
                  type="url"
                  placeholder="Google Drive or Dropbox link to your resume"
                  helper="Upload to Google Drive and paste the shareable link"
                />
              </div>
            </FormCard>

            <FormButtons
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
              disabled={!canProceed()}
            />
          </>
        )}

        {/* Step 4: Submit */}
        {step === 4 && (
          <>
            <FormCard
              title="Almost Done!"
              description="A few final questions before you submit"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            >
              <div className="space-y-6">
                <Textarea
                  label="Why do you want to join Branding Pioneers?"
                  name="whyJoin"
                  value={form.whyJoin}
                  onChange={(v) => updateField('whyJoin', v)}
                  placeholder="Tell us what excites you about this opportunity..."
                  rows={3}
                />

                <Textarea
                  label="Cover Letter / Introduction"
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={(v) => updateField('coverLetter', v)}
                  placeholder="Introduce yourself and highlight your key achievements..."
                  rows={4}
                />

                <TextInput
                  label="Earliest Available Start Date"
                  name="availability"
                  value={form.availability}
                  onChange={(v) => updateField('availability', v)}
                  type="date"
                />

                {/* Application Summary */}
                <div className="bg-slate-900/40 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4">Application Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Name</p>
                      <p className="font-medium text-white truncate">{form.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Department</p>
                      <p className="font-medium text-white">{form.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Position</p>
                      <p className="font-medium text-white truncate">{form.position.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Experience</p>
                      <p className="font-medium text-white capitalize">{form.experienceLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
                  <Checkbox
                    label={
                      <span>
                        I confirm that the information provided is accurate and I consent to Branding Pioneers processing my application. I have read and agree to the <a href="/policies" className="text-blue-400 hover:underline">Privacy Policy</a>.
                      </span>
                    }
                    name="privacyAccepted"
                    checked={form.privacyAccepted}
                    onChange={(v) => updateField('privacyAccepted', v)}
                    required
                  />
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
              onBack={() => setStep(3)}
              onSubmit={handleSubmit}
              submitLabel="Submit Application"
              disabled={!canProceed()}
              loading={loading}
            />
          </>
        )}
      </div>
    </FormLayout>
  )
}

export default function CareersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CareersContent />
    </Suspense>
  )
}
