'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  User,
  ChevronDown,
  ChevronUp,
  Phone,
  Heart,
  Briefcase,
  FileText,
  Shield,
  Linkedin,
  Calendar,
  AlertCircle,
  Banknote,
  GraduationCap,
  Pencil,
  ExternalLink,
  Check,
  X,
} from 'lucide-react'
import PageGuide from '@/client/components/ui/PageGuide'

// ---------- Types ----------

interface ProfileData {
  user: {
    id: string
    empId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    department: string
    role: string
    employeeType: string
    status: string
    joiningDate: string
    dateOfBirth: string
    bloodGroup: string
    address: string
    languages: string
    healthConditions: string
    profileCompletionStatus: string
  }
  profile: {
    profilePicture: string | null
    panCard: string | null
    aadhaar: string | null
    linkedIn: string | null
    bio: string | null
    skills: string | null
    favoriteFood: string | null
    parentsPhone1: string | null
    parentsPhone2: string | null
    livingSituation: string | null
    distanceFromOffice: string | null
    educationCertUrl: string | null
    ndaSigned: boolean
    ndaSignedAt: string | null
    employeeHandbookAccepted: boolean
    socialMediaPolicyAccepted: boolean
    clientConfidentialityAccepted: boolean
  } | null
  onboarding: {
    emergencyContact: { name: string; phone: string; relation: string }
    family: { fatherPhone: string; motherPhone: string; parentsAddress: string }
    address: { current: string; city: string; state: string; pincode: string }
    offer: {
      salary: string
      position: string
      type: string
      probation: string
      bondMonths: string
    }
    agreements: {
      nda: boolean
      ndaDate: string
      bond: boolean
      bondDate: string
      policies: boolean
      policiesDate: string
    }
    bank: { name: string; bank: string; ifsc: string }
  } | null
}

// ---------- Helpers ----------

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

function maskValue(val: string | null | undefined): string {
  if (!val) return '-'
  if (val.length <= 4) return '****'
  return '****' + val.slice(-4)
}

function getInitials(first: string, last: string): string {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase()
}

function statusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'PROBATION':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'PIP':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}

// ---------- Sub-components ----------

function FieldItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-200">{value || '-'}</p>
    </div>
  )
}

function AgreementItem({
  label,
  signed,
  date,
}: {
  label: string
  signed: boolean
  date?: string | null
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      {signed ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-emerald-400" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <X className="w-3 h-3 text-red-400" />
        </div>
      )}
      <div className="flex-1">
        <span className="text-sm text-slate-200">{label}</span>
      </div>
      <span className="text-xs text-slate-500">
        {signed ? (date ? formatDate(date) : 'Signed') : 'Pending'}
      </span>
    </div>
  )
}

function DocLink({
  label,
  url,
}: {
  label: string
  url: string | null | undefined
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-200">{label}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#F97316] hover:text-orange-300 transition-colors flex items-center gap-1 text-xs"
        >
          View <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-xs text-slate-600">Not uploaded</span>
      )}
    </div>
  )
}

function SkillTag({ skill }: { skill: string }) {
  return (
    <span className="inline-block bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 rounded-full px-3 py-1 text-xs font-medium">
      {skill.trim()}
    </span>
  )
}

function Section({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#F97316]" />
          </div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-0">{children}</div>
      </div>
    </div>
  )
}

function SkeletonBlock() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex-shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-7 w-52 bg-slate-800 rounded" />
          <div className="h-4 w-36 bg-slate-800 rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`skeleton-card-${i}`}
          className="bg-slate-900/40 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800" />
            <div className="h-5 w-44 bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- Main Page ----------

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/users/profile')
        if (!res.ok) throw new Error('Failed to fetch profile')
        const json = await res.json()
        setData(json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] p-6 md:p-10 max-w-5xl mx-auto">
        <SkeletonBlock />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Error loading profile</p>
          <p className="text-sm text-slate-400">
            {error || 'No data available'}
          </p>
        </div>
      </div>
    )
  }

  const { user, profile, onboarding } = data

  return (
    <div className="min-h-screen bg-[#0B0E14] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageGuide
          pageKey="profile"
          title="My Profile"
          description="Your complete employee profile with personal, professional, and onboarding details."
          steps={[
            { label: 'Review your info', description: 'Check personal and professional details' },
            { label: 'Verify agreements', description: 'Ensure NDA and policies are signed' },
            { label: 'Update via Settings', description: 'Go to Settings to edit your profile' },
          ]}
        />
        {/* -------- Profile Header -------- */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#F97316]/30 flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#F97316]/10 border-2 border-[#F97316]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-[#F97316]">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h1>
                <span className="bg-slate-800 text-slate-300 border border-white/10 text-xs font-mono px-3 py-1 rounded-full">
                  {user.empId || '-'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 text-xs px-3 py-1 rounded-full">
                  {user.department || '-'}
                </span>
                <span className="bg-slate-800 text-slate-300 border border-white/10 text-xs px-3 py-1 rounded-full">
                  {user.role || '-'}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full border font-medium ${statusColor(user.status)}`}
                >
                  {user.status || '-'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.joiningDate)}</span>
              </div>
            </div>

            {/* Edit button */}
            <Link
              href="/settings"
              className="flex items-center gap-2 bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* -------- 1. Personal Details -------- */}
        <Section icon={User} title="Personal Details" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FieldItem label="Date of Birth" value={formatDate(user.dateOfBirth)} />
            <FieldItem label="Blood Group" value={user.bloodGroup} />
            <FieldItem label="Languages" value={(() => {
              try {
                const items = JSON.parse(user.languages)
                return Array.isArray(items) ? items.join(', ') : user.languages
              } catch { return user.languages }
            })()} />
            <FieldItem label="Favorite Food" value={profile?.favoriteFood} />
            <FieldItem label="Health Conditions" value={user.healthConditions} />
            <FieldItem label="Living Situation" value={profile?.livingSituation} />
            <FieldItem
              label="Distance from Office"
              value={profile?.distanceFromOffice}
            />
          </div>
        </Section>

        {/* -------- 2. Contact Information -------- */}
        <Section icon={Phone} title="Contact Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FieldItem label="Phone" value={user.phone} />
            <FieldItem label="Email" value={user.email} />
            <FieldItem
              label="Address"
              value={onboarding?.address?.current || user.address}
            />
            <FieldItem label="City" value={onboarding?.address?.city} />
            <FieldItem label="State" value={onboarding?.address?.state} />
            <FieldItem label="Pincode" value={onboarding?.address?.pincode} />
          </div>
        </Section>

        {/* -------- 3. Family & Emergency -------- */}
        <Section icon={Heart} title="Family & Emergency">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FieldItem
              label="Emergency Contact"
              value={onboarding?.emergencyContact?.name}
            />
            <FieldItem
              label="Emergency Phone"
              value={onboarding?.emergencyContact?.phone}
            />
            <FieldItem
              label="Relation"
              value={onboarding?.emergencyContact?.relation}
            />
            <FieldItem
              label="Father's Phone"
              value={onboarding?.family?.fatherPhone || profile?.parentsPhone1}
            />
            <FieldItem
              label="Mother's Phone"
              value={onboarding?.family?.motherPhone || profile?.parentsPhone2}
            />
            <FieldItem
              label="Parents Address"
              value={onboarding?.family?.parentsAddress}
            />
          </div>
        </Section>

        {/* -------- 4. Employment Details -------- */}
        <Section icon={Briefcase} title="Employment Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FieldItem
              label="Position"
              value={onboarding?.offer?.position || user.role}
            />
            <FieldItem label="Department" value={user.department} />
            <FieldItem label="Employee Type" value={user.employeeType} />
            <FieldItem
              label="Salary"
              value={
                onboarding?.offer?.salary
                  ? `₹${Number(onboarding.offer.salary).toLocaleString('en-IN')}`
                  : '-'
              }
            />
            <FieldItem
              label="Joining Date"
              value={formatDate(user.joiningDate)}
            />
            <FieldItem
              label="Probation Period"
              value={onboarding?.offer?.probation || '-'}
            />
            <FieldItem
              label="Bond Duration"
              value={
                onboarding?.offer?.bondMonths
                  ? `${onboarding.offer.bondMonths} months`
                  : '-'
              }
            />
          </div>
        </Section>

        {/* -------- 5. Bank Details -------- */}
        <Section icon={Banknote} title="Bank Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FieldItem label="Account Name" value={onboarding?.bank?.name} />
            <FieldItem label="Bank Name" value={onboarding?.bank?.bank} />
            <FieldItem label="IFSC" value={maskValue(onboarding?.bank?.ifsc)} />
          </div>
        </Section>

        {/* -------- 6. Documents -------- */}
        <Section icon={FileText} title="Documents">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y divide-white/5 sm:divide-y-0">
            <DocLink label="PAN Card" url={profile?.panCard} />
            <DocLink label="Aadhaar Card" url={profile?.aadhaar} />
            <DocLink
              label="Education Certificate"
              url={profile?.educationCertUrl}
            />
            <DocLink label="Profile Picture" url={profile?.profilePicture} />
          </div>
        </Section>

        {/* -------- 7. Agreements -------- */}
        <Section icon={Shield} title="Agreements">
          <div className="divide-y divide-white/5">
            <AgreementItem
              label="Non-Disclosure Agreement (NDA)"
              signed={
                onboarding?.agreements?.nda || profile?.ndaSigned || false
              }
              date={
                onboarding?.agreements?.ndaDate || profile?.ndaSignedAt
              }
            />
            <AgreementItem
              label="Bond Agreement"
              signed={onboarding?.agreements?.bond || false}
              date={onboarding?.agreements?.bondDate}
            />
            <AgreementItem
              label="Company Policies"
              signed={onboarding?.agreements?.policies || false}
              date={onboarding?.agreements?.policiesDate}
            />
            <AgreementItem
              label="Employee Handbook"
              signed={profile?.employeeHandbookAccepted || false}
            />
            <AgreementItem
              label="Social Media Policy"
              signed={profile?.socialMediaPolicyAccepted || false}
            />
            <AgreementItem
              label="Client Confidentiality"
              signed={profile?.clientConfidentialityAccepted || false}
            />
          </div>
        </Section>

        {/* -------- 8. Professional -------- */}
        <Section icon={GraduationCap} title="Professional">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  LinkedIn
                </p>
                {profile?.linkedIn ? (
                  <a
                    href={profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#F97316] hover:text-orange-300 transition-colors flex items-center gap-1"
                  >
                    <Linkedin className="w-4 h-4" />
                    View Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-sm text-slate-200">-</p>
                )}
              </div>
              <FieldItem label="Bio" value={profile?.bio} />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Skills
              </p>
              {profile?.skills ? (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    try {
                      const parsed = JSON.parse(profile.skills!)
                      if (Array.isArray(parsed)) return parsed.map((skill: string, idx: number) => (
                        <SkillTag key={`skill-${skill}`} skill={skill} />
                      ))
                    } catch { /* not JSON, fall through to comma split */ }
                    return profile.skills!.split(',').map((skill, idx) => (
                      <SkillTag key={`skill-${skill.trim()}`} skill={skill} />
                    ))
                  })()}
                </div>
              ) : (
                <p className="text-sm text-slate-200">-</p>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
