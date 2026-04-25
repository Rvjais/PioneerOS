export interface OnboardingItem {
  key: string
  label: string
  completed: boolean
  completedAt: string | null
}

export interface OnboardingPhase {
  label: string
  items: OnboardingItem[]
}

export interface AccountManager {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
}

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string | null
  department: string
  role: string
  userRole: string
  isPrimary: boolean
  avatarUrl: string | null
}

export interface Credential {
  id: string
  type: string
  label: string
  category: string
  username: string | null
  email: string | null
  hasPassword: boolean
  url: string | null
  notes: string | null
  password?: string // Only present when editing
}

export interface ProfileData {
  client: {
    id: string
    name: string
    logoUrl: string | null
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    whatsapp: string | null
    websiteUrl: string | null
    address: string | null
    city: string | null
    state: string | null
    pincode: string | null
    gstNumber: string | null
    businessType: string | null
    industry: string | null
    tier: string
    status: string
    services: (string | Record<string, unknown>)[]
    startDate: string | null
    onboardingStatus: string
    lifecycleStage: string
  }
  portal: {
    logoUrl: string | null
    themeColor: string
    isActive: boolean
    lastAccessed: string | null
  } | null
  accountManager: AccountManager | null
  teamMembers?: TeamMember[]
  onboarding: {
    completionPercentage: number
    status: string
    phases: Record<string, OnboardingPhase>
  } | null
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function getServiceLabel(service: string | Record<string, unknown>): string {
  if (typeof service === 'string') return service
  if (typeof service === 'object' && service !== null) {
    return (service.name as string) || (service.serviceId as string) || String(service)
  }
  return String(service)
}

export function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}-${month}-${d.getFullYear()}`
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text)
}
