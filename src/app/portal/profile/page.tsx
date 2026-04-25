'use client'

import { useState, useEffect } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PageGuide from '@/client/components/ui/PageGuide'
import SectionLabel from '@/client/components/ui/SectionLabel'
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Shield,
  ChevronDown,
  ChevronRight,
  Users,
  Target,
  Briefcase,
  Swords,
  Brain,
  MessageSquare,
  TrendingUp,
  Palette,
  Server,
  CheckCircle2,
  Circle,
  Clock,
  BadgeCheck,
  Crown,
  IndianRupee,
  Calendar,
  Hash,
  Loader2,
  AlertCircle,
  Star,
  Heart,
  Lightbulb,
  Search,
  Megaphone,
  Share2,
  Monitor,
  Zap,
  BarChart3,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BasicInfo {
  businessName?: string | null
  contactName?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  gst?: string | null
  pan?: string | null
  industry?: string | null
  businessType?: string | null
  logo?: string | null
}

interface Contract {
  services?: string[] | null
  tier?: string | null
  monthlyFee?: number | string | null
  contractDuration?: string | null
  startDate?: string | null
  slaAccepted?: boolean | null
  slaSignedAt?: string | null
  slaSignerName?: string | null
  paymentConfirmed?: boolean | null
}

interface Business {
  identity?: string | null
  valueProposition?: string | null
  biggestStrength?: string | null
  topServices?: string[] | null
  contentTopics?: string[] | null
  questionsBeforeBuying?: string | null
  businessHours?: string | null
  timeZone?: string | null
  seasonalVariations?: string | null
  peakBusinessPeriods?: string | null
  marketPosition?: string | null
}

interface Audience {
  primaryTarget?: string | null
  ageGroup?: string | null
  gender?: string | null
  occupation?: string | null
  incomeLevel?: string | null
  location?: string | null
  preferredChannels?: string[] | null
  commonConditions?: string | null
  insuranceTypes?: string | null
  healthEducationTopics?: string[] | null
}

interface Competitors {
  competitor1?: string | null
  competitor2?: string | null
  competitor3?: string | null
  advantages?: string | null
}

interface Psychology {
  fears?: string[] | null
  painPoints?: string[] | null
  problems?: string[] | null
  needsDesires?: string[] | null
}

interface Communication {
  preferredMethod?: string | null
  reportingFrequency?: string | null
  meetingPreferences?: string | null
  expectedRoiTimeline?: string | null
  investmentPriorities?: string[] | null
}

interface SeoMarketing {
  targetKeywords?: string | null
  seoInvolvement?: string | null
  seoRemarks?: string | null
  previousSeoReport?: string | null
  adsPlatforms?: string | null
  adsBudget?: string | null
  adsInvolvement?: string | null
  socialInvolvement?: string | null
  monthlyBudget?: string | null
}

interface Branding {
  hasLogo?: boolean | null
  logoUrl?: string | null
  brandGuidelinesUrl?: string | null
  brandPersonality?: string | null
  preferredColors?: string | null
  designStyle?: string | null
  brandsAdmired?: string | null
  designMaterials?: string[] | null
}

interface Technical {
  techStack?: string | null
  integrationNeeds?: string | null
  kpis?: string[] | null
  successDefinition?: string | null
}

interface AccountManager {
  name?: string | null
  email?: string | null
  phone?: string | null
  profilePicture?: string | null
}

interface TeamMember {
  name?: string | null
  role?: string | null
  department?: string | null
  email?: string | null
  profilePicture?: string | null
}

interface Checklist {
  completionPercentage?: number | null
  status?: string | null
  contractSigned?: boolean | null
  invoicePaid?: boolean | null
  kickoffDone?: boolean | null
  [key: string]: unknown
}

interface OnboardingData {
  basicInfo?: BasicInfo | null
  contract?: Contract | null
  business?: Business | null
  audience?: Audience | null
  competitors?: Competitors | null
  psychology?: Psychology | null
  communication?: Communication | null
  seoMarketing?: SeoMarketing | null
  branding?: Branding | null
  technical?: Technical | null
  accountManager?: AccountManager | null
  team?: TeamMember[] | null
  checklist?: Checklist | null
  onboardingStatus?: string | null
}

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function ValueDisplay({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-500">-</span>
  }
  if (typeof value === 'boolean') {
    return value ? (
      <span className="flex items-center gap-1.5 text-emerald-400">
        <CheckCircle2 className="w-4 h-4" /> Yes
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-slate-400">
        <Circle className="w-4 h-4" /> No
      </span>
    )
  }
  return <span className="text-white">{String(value)}</span>
}

function FieldRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm">
        <ValueDisplay value={value} />
      </dd>
    </div>
  )
}

function TagList({ items, color = 'blue' }: { items: string[] | null | undefined; color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' }) {
  if (!items || items.length === 0) return <span className="text-slate-500 text-sm">-</span>

  const colorMap = {
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorMap[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-700/50" />
        <div className="h-5 w-48 bg-slate-700/50 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="space-y-2">
            <div className="h-3 w-20 bg-slate-700/30 rounded" />
            <div className="h-4 w-32 bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------

interface SectionProps {
  icon: React.ReactNode
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ icon, title, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            {icon}
          </div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>
        <div className="text-slate-400 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: open ? '2000px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-6 pb-6 pt-0">{children}</div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Checklist item labels
// ---------------------------------------------------------------------------

const checklistLabels: Record<string, string> = {
  contractSigned: 'Contract Signed',
  invoicePaid: 'Invoice Paid',
  kickoffDone: 'Kickoff Completed',
  brandingCollected: 'Branding Assets Collected',
  accessesCollected: 'Accesses Collected',
  strategyApproved: 'Strategy Approved',
  firstDeliverable: 'First Deliverable Sent',
  onboardingComplete: 'Onboarding Complete',
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BusinessProfilePage() {
  const router = useRouter()
  const [data, setData] = useState<OnboardingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/client-portal/onboarding-data')
        if (!res.ok) throw new Error('Failed to load profile data')
        const json = await res.json()
        setData(json)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] p-6 lg:p-10 space-y-6">
        {/* Header skeleton */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/50" />
            <div className="space-y-2">
              <div className="h-6 w-64 bg-slate-700/50 rounded" />
              <div className="flex gap-2">
                <div className="h-5 w-24 bg-slate-700/30 rounded-full" />
                <div className="h-5 w-20 bg-slate-700/30 rounded-full" />
              </div>
            </div>
          </div>
          <div className="mt-6 h-2.5 w-full bg-slate-700/30 rounded-full" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`skeleton-card-${i}`} />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6">
        <div className="bg-slate-900/40 border border-red-500/20 rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Unable to Load Profile</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const {
    basicInfo,
    contract,
    business,
    audience,
    competitors,
    psychology,
    communication,
    seoMarketing,
    branding,
    technical,
    accountManager,
    team,
    checklist,
    onboardingStatus,
  } = data

  const completionPct = checklist?.completionPercentage ?? 0

  // Build checklist items from data
  const checklistItems = checklist
    ? Object.entries(checklist).filter(
        ([key]) => !['completionPercentage', 'status'].includes(key) && typeof checklist[key] === 'boolean'
      )
    : []

  return (
    <div className="min-h-screen bg-[#0B0E14] p-6 lg:p-10 space-y-5">
      <PageGuide
        title="Business Profile"
        description="Your business profile with all onboarding details. This information helps us serve you better."
        pageKey="portal-profile"
      />

      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Logo / avatar */}
          {basicInfo?.logo ? (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
              <Image src={basicInfo.logo} alt={basicInfo.businessName || 'Business'} fill className="object-cover" sizes="64px" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {basicInfo?.businessName?.charAt(0)?.toUpperCase() || 'B'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
              {basicInfo?.businessName || 'My Business Profile'}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {basicInfo?.industry && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20">
                  <Building2 className="w-3 h-3" />
                  {basicInfo.industry}
                </span>
              )}
              {contract?.tier && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/20">
                  <Crown className="w-3 h-3" />
                  {contract.tier}
                </span>
              )}
              {onboardingStatus && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  onboardingStatus === 'completed'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                    : 'bg-slate-500/15 text-slate-300 border-slate-500/20'
                }`}>
                  {onboardingStatus === 'completed' ? <BadgeCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {onboardingStatus.charAt(0).toUpperCase() + onboardingStatus.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {checklist && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Onboarding Progress</span>
              <span className="text-xs font-semibold text-blue-400">{completionPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. Business Information */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Building2 className="w-4 h-4" />} title="Business Information" defaultOpen>
        <SectionLabel title="Business Details" type="view" />
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <FieldRow label="Business Name" value={basicInfo?.businessName} />
          <FieldRow label="Contact Name" value={basicInfo?.contactName} />
          <FieldRow label="Email" value={basicInfo?.email} />
          <FieldRow label="Phone" value={basicInfo?.phone} />
          <FieldRow label="WhatsApp" value={basicInfo?.whatsapp} />
          <FieldRow label="Website" value={basicInfo?.website} />
          <FieldRow label="Address" value={basicInfo?.address} />
          <FieldRow label="City" value={basicInfo?.city} />
          <FieldRow label="State" value={basicInfo?.state} />
          <FieldRow label="Pincode" value={basicInfo?.pincode} />
          <FieldRow label="GST Number" value={basicInfo?.gst} />
          <FieldRow label="PAN" value={basicInfo?.pan} />
          <FieldRow label="Industry" value={basicInfo?.industry} />
          <FieldRow label="Business Type" value={basicInfo?.businessType} />
        </dl>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Contract & Services */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<FileText className="w-4 h-4" />} title="Contract & Services">
        <SectionLabel title="Contract Details" type="view" />
        <div className="space-y-5">
          {/* Services pills */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Services</p>
            <TagList items={contract?.services} color="blue" />
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <FieldRow label="Tier" value={contract?.tier} />
            <FieldRow label="Monthly Fee" value={contract?.monthlyFee != null ? `₹${contract.monthlyFee}` : null} />
            <FieldRow label="Contract Duration" value={contract?.contractDuration} />
            <FieldRow label="Start Date" value={contract?.startDate ? formatDateDDMMYYYY(contract.startDate) : null} />
            <FieldRow label="SLA Accepted" value={contract?.slaAccepted} />
            <FieldRow label="SLA Signed At" value={contract?.slaSignedAt ? formatDateDDMMYYYY(contract.slaSignedAt) : null} />
            <FieldRow label="SLA Signer" value={contract?.slaSignerName} />
            <FieldRow label="Payment Confirmed" value={contract?.paymentConfirmed} />
          </dl>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Your Team */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Users className="w-4 h-4" />} title="Your Team">
        <SectionLabel title="Team Members" type="view" />
        <div className="space-y-5">
          {/* Account Manager */}
          {accountManager ? (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Account Manager</p>
              <div className="flex items-center gap-4 bg-slate-800/40 border border-white/5 rounded-xl p-4">
                {accountManager.profilePicture ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                    <Image src={accountManager.profilePicture} alt={accountManager.name || ''} fill className="object-cover" sizes="48px" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {accountManager.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{accountManager.name || '-'}</p>
                  <p className="text-xs text-slate-400 truncate">{accountManager.email || '-'}</p>
                  {accountManager.phone && <p className="text-xs text-slate-400">{accountManager.phone}</p>}
                </div>
                <span className="ml-auto px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/20 rounded-full flex-shrink-0">
                  Manager
                </span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Account Manager</p>
              <p className="text-sm text-slate-500">Not yet assigned</p>
            </div>
          )}

          {/* Team members */}
          {team && team.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Team Members</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {team.map((member, i) => (
                  <div key={member.name || `member-${i}`} className="flex items-center gap-3 bg-slate-800/40 border border-white/5 rounded-xl p-3">
                    {member.profilePicture ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                        <Image src={member.profilePicture} alt={member.name || ''} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{member.name || '-'}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {[member.role, member.department].filter(Boolean).join(' · ') || '-'}
                      </p>
                      {member.email && <p className="text-xs text-slate-500 truncate">{member.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!team || team.length === 0) && !accountManager && (
            <p className="text-sm text-slate-500">No team information available yet.</p>
          )}
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 4. Target Audience */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Target className="w-4 h-4" />} title="Target Audience">
        <SectionLabel title="Audience Profile" type="view" />
        <div className="space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <FieldRow label="Primary Target" value={audience?.primaryTarget} />
            <FieldRow label="Age Group" value={audience?.ageGroup} />
            <FieldRow label="Gender" value={audience?.gender} />
            <FieldRow label="Occupation" value={audience?.occupation} />
            <FieldRow label="Income Level" value={audience?.incomeLevel} />
            <FieldRow label="Location" value={audience?.location} />
            <FieldRow label="Common Conditions" value={audience?.commonConditions} />
            <FieldRow label="Insurance Types" value={audience?.insuranceTypes} />
          </dl>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Preferred Channels</p>
            <TagList items={audience?.preferredChannels} color="cyan" />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Health Education Topics</p>
            <TagList items={audience?.healthEducationTopics} color="emerald" />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 5. Business Strategy */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Briefcase className="w-4 h-4" />} title="Business Strategy">
        <SectionLabel title="Strategy Details" type="view" />
        <div className="space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <FieldRow label="Business Identity" value={business?.identity} />
            <FieldRow label="Value Proposition" value={business?.valueProposition} />
            <FieldRow label="Biggest Strength" value={business?.biggestStrength} />
            <FieldRow label="Market Position" value={business?.marketPosition} />
            <FieldRow label="Questions Before Buying" value={business?.questionsBeforeBuying} />
            <FieldRow label="Business Hours" value={business?.businessHours} />
            <FieldRow label="Time Zone" value={business?.timeZone} />
            <FieldRow label="Seasonal Variations" value={business?.seasonalVariations} />
            <FieldRow label="Peak Business Periods" value={business?.peakBusinessPeriods} />
          </dl>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Top Services</p>
            <TagList items={business?.topServices} color="blue" />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Content Topics</p>
            <TagList items={business?.contentTopics} color="purple" />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 6. Competitors */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Swords className="w-4 h-4" />} title="Competitors">
        <SectionLabel title="Competitor Analysis" type="view" />
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Competitor 1', value: competitors?.competitor1 },
              { label: 'Competitor 2', value: competitors?.competitor2 },
              { label: 'Competitor 3', value: competitors?.competitor3 },
            ].map((comp, i) => (
              <div key={comp.label} className="bg-slate-800/40 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">{comp.label}</p>
                <p className="text-sm font-medium text-white">{comp.value || <span className="text-slate-500">-</span>}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Your Advantages</p>
            <p className="text-sm text-white">{competitors?.advantages || <span className="text-slate-500">-</span>}</p>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 7. Customer Psychology */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Brain className="w-4 h-4" />} title="Customer Psychology">
        <SectionLabel title="Psychology Insights" type="view" />
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-rose-400" /> Fears
            </p>
            <TagList items={psychology?.fears} color="rose" />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" /> Pain Points
            </p>
            <TagList items={psychology?.painPoints} color="amber" />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-cyan-400" /> Problems
            </p>
            <TagList items={psychology?.problems} color="cyan" />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-emerald-400" /> Needs & Desires
            </p>
            <TagList items={psychology?.needsDesires} color="emerald" />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 8. Communication Preferences */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<MessageSquare className="w-4 h-4" />} title="Communication Preferences">
        <SectionLabel title="Communication" type="view" />
        <div className="space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <FieldRow label="Preferred Method" value={communication?.preferredMethod} />
            <FieldRow label="Reporting Frequency" value={communication?.reportingFrequency} />
            <FieldRow label="Meeting Preferences" value={communication?.meetingPreferences} />
            <FieldRow label="Expected ROI Timeline" value={communication?.expectedRoiTimeline} />
          </dl>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Investment Priorities</p>
            <TagList items={communication?.investmentPriorities} color="blue" />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 9. Marketing Strategy */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<TrendingUp className="w-4 h-4" />} title="Marketing Strategy">
        <SectionLabel title="Marketing Info" type="view" />
        <div className="space-y-5">
          {/* SEO */}
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Search className="w-3 h-3" /> SEO
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <FieldRow label="Target Keywords" value={seoMarketing?.targetKeywords} />
              <FieldRow label="SEO Involvement" value={seoMarketing?.seoInvolvement} />
              <FieldRow label="SEO Remarks" value={seoMarketing?.seoRemarks} />
              <FieldRow label="Previous SEO Report" value={seoMarketing?.previousSeoReport} />
            </dl>
          </div>

          {/* Ads */}
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Megaphone className="w-3 h-3" /> Paid Advertising
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <FieldRow label="Platforms" value={seoMarketing?.adsPlatforms} />
              <FieldRow label="Ads Budget" value={seoMarketing?.adsBudget} />
              <FieldRow label="Ads Involvement" value={seoMarketing?.adsInvolvement} />
            </dl>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Share2 className="w-3 h-3" /> Social Media
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
              <FieldRow label="Social Involvement" value={seoMarketing?.socialInvolvement} />
              <FieldRow label="Monthly Budget" value={seoMarketing?.monthlyBudget} />
            </dl>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 10. Branding & Design */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Palette className="w-4 h-4" />} title="Branding & Design">
        <SectionLabel title="Branding Assets" type="view" />
        <div className="space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <FieldRow label="Has Logo" value={branding?.hasLogo} />
            <FieldRow label="Logo URL" value={branding?.logoUrl} />
            <FieldRow label="Brand Guidelines" value={branding?.brandGuidelinesUrl} />
            <FieldRow label="Brand Personality" value={branding?.brandPersonality} />
            <FieldRow label="Preferred Colors" value={branding?.preferredColors} />
            <FieldRow label="Design Style" value={branding?.designStyle} />
            <FieldRow label="Brands Admired" value={branding?.brandsAdmired} />
          </dl>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Design Materials</p>
            <TagList items={branding?.designMaterials} color="purple" />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 11. Technical Requirements */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<Server className="w-4 h-4" />} title="Technical Requirements">
        <SectionLabel title="Technical Setup" type="view" />
        <div className="space-y-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <FieldRow label="Tech Stack" value={technical?.techStack} />
            <FieldRow label="Integration Needs" value={technical?.integrationNeeds} />
            <FieldRow label="Success Definition" value={technical?.successDefinition} />
          </dl>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">KPIs</p>
            <TagList items={technical?.kpis} color="emerald" />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* 12. Onboarding Progress */}
      {/* ----------------------------------------------------------------- */}
      <Section icon={<CheckCircle2 className="w-4 h-4" />} title="Onboarding Progress">
        <SectionLabel title="Progress Checklist" type="view" />
        {checklistItems.length > 0 ? (
          <div className="space-y-3">
            {/* Overall status */}
            {checklist?.status && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-slate-400">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  checklist.status === 'completed'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                    : checklist.status === 'in_progress'
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/20'
                    : 'bg-slate-500/15 text-slate-300 border-slate-500/20'
                }`}>
                  {checklist.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            )}

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checklistItems.map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    value
                      ? 'bg-emerald-500/5 border-emerald-500/15'
                      : 'bg-slate-800/30 border-white/5'
                  }`}
                >
                  {value ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${value ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {checklistLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No checklist data available.</p>
        )}
      </Section>
    </div>
  )
}
