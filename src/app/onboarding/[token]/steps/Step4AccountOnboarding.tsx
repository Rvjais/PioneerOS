'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Users, Globe, Share2, Megaphone, MapPin,
  CheckCircle, Loader2, Sparkles, ArrowRight, Phone,
  Target, Search, Video, Pencil, Palette, Briefcase, TrendingUp,
  Key, Upload, ExternalLink, HelpCircle, Mail, Calendar,
  BarChart3, Clock, Cpu, Heart, FileText, Settings, UserCheck
} from 'lucide-react'
import PageGuide from '@/client/components/ui/PageGuide'
import SectionLabel from '@/client/components/ui/SectionLabel'
import InfoTip from '@/client/components/ui/InfoTip'

interface Step4Props {
  data: {
    token: string
    client: {
      name: string
      email: string
      phone: string
      company: string
    }
    services: Array<{ serviceId: string; name: string }>
  }
  onComplete: (newData?: object) => void
}

// Indian States
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep'
]

// Major Indian Cities
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
  'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur',
  'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh',
  'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Tiruchirappalli', 'Bareilly', 'Mysore',
  'Thiruvananthapuram', 'Moradabad', 'Tiruppur', 'Jalandhar', 'Bhubaneswar', 'Salem',
  'Aligarh', 'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner',
  'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi',
  'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded',
  'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri',
  'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj', 'Mangalore', 'Erode', 'Belgaum',
  'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Udaipur', 'Maheshtala', 'Davanagere'
]

// Industries
const INDUSTRIES = [
  { id: 'HEALTHCARE', label: 'Healthcare', customerTerm: 'patient' },
  { id: 'RETAIL', label: 'Retail', customerTerm: 'customer' },
  { id: 'RESTAURANT', label: 'Restaurant', customerTerm: 'customer' },
  { id: 'EDUCATION', label: 'Education', customerTerm: 'student' },
  { id: 'REAL_ESTATE', label: 'Real Estate', customerTerm: 'client' },
  { id: 'LEGAL', label: 'Legal Services', customerTerm: 'client' },
  { id: 'FITNESS', label: 'Fitness & Wellness', customerTerm: 'member' },
  { id: 'AUTOMOTIVE', label: 'Automotive', customerTerm: 'customer' },
  { id: 'TECHNOLOGY', label: 'Technology', customerTerm: 'user' },
  { id: 'OTHER', label: 'Other', customerTerm: 'customer' },
]

// Healthcare Business Types
const HEALTHCARE_TYPES = [
  'Doctor/Physician', 'Clinic', 'Hospital', 'Dental Practice', 'Veterinary Clinic',
  'Pharmacy', 'Medical Laboratory', 'Physiotherapy Center', 'Mental Health Practice',
  'Chiropractic Practice', 'Optometry/Eye Care', 'Dermatology Practice', 'Pediatric Practice',
  'Urgent Care Center', 'Rehabilitation Center'
]

// Business Registration Types
const BUSINESS_TYPES = [
  'Sole Proprietorship', 'Partnership Firm', 'LLP', 'Private Limited', 'Public Limited',
  'OPC', 'Section 8', 'Trust', 'Society', 'Cooperative Society', 'HUF', 'Unregistered'
]

// Section configuration
const ALL_SECTIONS = [
  { id: 'basic', title: 'Basic Information', icon: Building2, description: 'Business details & registration', requiredServices: null },
  { id: 'contact', title: 'Contact Information', icon: Phone, description: 'Communication details', requiredServices: null },
  { id: 'website', title: 'Website Access', icon: Globe, description: 'Technical credentials', requiredServices: ['WEB_DEVELOPMENT'] },
  { id: 'google', title: 'Google Services', icon: Search, description: 'Analytics & GMB access', requiredServices: ['SEO', 'GBP', 'PAID_ADS'] },
  { id: 'seo', title: 'SEO & Marketing', icon: TrendingUp, description: 'Search optimization', requiredServices: ['SEO', 'PAID_ADS', 'CONTENT'] },
  { id: 'social', title: 'Social Media', icon: Share2, description: 'Social platforms access', requiredServices: ['SOCIAL_MEDIA'] },
  { id: 'business', title: 'Business Understanding', icon: Target, description: 'Value proposition & audience', requiredServices: null },
  { id: 'operations', title: 'Business Operations', icon: Clock, description: 'Hours & competitive analysis', requiredServices: null },
  { id: 'psychology', title: 'Customer Psychology', icon: Heart, description: 'Fears, pain points & desires', requiredServices: null },
  { id: 'budget', title: 'Budget & Communication', icon: Briefcase, description: 'Investment & preferences', requiredServices: null },
  { id: 'technical', title: 'Technical Requirements', icon: Settings, description: 'Tech stack & KPIs', requiredServices: null },
  { id: 'team', title: 'Team & Timeline', icon: Users, description: 'Stakeholders & deadlines', requiredServices: null },
  { id: 'audience', title: 'Target Audience', icon: UserCheck, description: 'Ideal customer profile', requiredServices: null },
  { id: 'branding', title: 'Branding & Design', icon: Palette, description: 'Visual identity', requiredServices: ['BRANDING'] },
  { id: 'automation', title: 'AI & Automation', icon: Cpu, description: 'Automation services', requiredServices: null },
]

// Filter sections based on selected services
function getActiveSections(services: Array<{ serviceId: string }>) {
  const serviceIds = services.map(s => s.serviceId)
  return ALL_SECTIONS.filter(section => {
    if (!section.requiredServices) return true // Always show core sections
    return section.requiredServices.some(rs => serviceIds.includes(rs))
  })
}

// Keep SECTIONS as a reference for backward compat in render
const SECTIONS = ALL_SECTIONS

export default function Step4AccountOnboarding({ data, onComplete }: Step4Props) {
  const activeSections = getActiveSections(data.services || [])
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // ========== STEP 1: BASIC INFORMATION ==========
    clientName: data.client.name || '',
    primaryEmail: data.client.email || '',
    phoneNumber: data.client.phone || '',
    businessAddress: '',
    websiteUrl: '',

    // Indian Business Details
    gstin: '',
    panNumber: '',
    state: '',
    city: '',
    pinCode: '',
    businessRegistrationType: '',
    udyamRegistrationNumber: '',

    // Healthcare Licenses (shown when industry is Healthcare)
    medicalCouncilRegistration: '',
    clinicalEstablishmentLicense: '',
    drugLicense: '',
    nabhAccreditation: '',
    fssaiLicense: '',
    biomedicalWasteAuthorization: '',

    // Business Classification
    industry: 'HEALTHCARE',
    healthcareBusinessType: '',
    monthlyMarketingBudget: '',

    // ========== STEP 2: CONTACT INFORMATION ==========
    emailForLeads: '',
    phoneForPromotion: data.client.phone || '',
    targetLocations: '',

    // ========== STEP 3: WEBSITE ACCESS ==========
    adminPanelUrl: '',
    adminUsername: '',
    adminPassword: '',

    // ========== STEP 4: GOOGLE SERVICES ==========
    gmbAccessGranted: false,
    analyticsAccessGranted: false,
    searchConsoleAccessGranted: false,

    // ========== STEP 5: SEO & MARKETING ==========
    previousSeoReportUrl: '',
    seoInvolvement: 'MODERATE',
    seoRemarks: '',
    advertisingPlatforms: [] as string[],
    adsBudgetLevel: '',
    adsInvolvement: 'APPROVAL_REQUIRED',
    targetLocationsForAds: '',
    adsRemarks: '',

    // ========== STEP 6: SOCIAL MEDIA ==========
    facebookAccessGranted: false,
    linkedinAccessGranted: false,
    socialMediaInvolvement: 'FULL_MANAGEMENT',
    youtubeAccessGranted: false,
    youtubeInvolvement: 'FULL_PRODUCTION',
    currentLogoUrl: '',

    // ========== STEP 7: BUSINESS UNDERSTANDING ==========
    biggestStrength: '',
    identity: '',
    valueProposition: '',
    targetAgeGroup: '',
    targetGender: '',
    targetOccupation: '',
    targetIncomeLevel: '',
    primaryLocation: '',
    customerAcquisitionCost: '',
    averageOrderValue: '',
    topServices: ['', '', '', '', ''],
    contentTopics: ['', '', '', '', ''],
    questionsBeforeBuying: '',
    healthEducationTopics: ['', '', '', '', ''],
    targetKeywords: '',

    // ========== STEP 8: BUSINESS OPERATIONS ==========
    businessHours: '',
    timeZone: 'IST',
    seasonalVariations: '',
    peakBusinessPeriods: '',
    competitor1: '',
    competitor2: '',
    competitor3: '',
    competitiveAdvantages: '',
    marketPosition: '',

    // ========== STEP 9: PSYCHOLOGY & FOLLOW-UP ==========
    customerFears: ['', '', '', '', '', '', '', '', '', ''],
    customerPainPoints: ['', '', '', '', '', '', '', '', '', ''],
    customerProblems: ['', '', '', '', '', '', '', '', '', ''],
    customerNeedsDesires: ['', '', '', '', '', '', '', '', '', ''],
    reviewMeetingDate: '',

    // ========== STEP 10: BUDGET & COMMUNICATION ==========
    additionalBudgetAllocation: '',
    investmentPriorities: [] as string[],
    expectedRoiTimeline: '',
    preferredCommunicationMethod: 'WHATSAPP',
    reportingFrequency: 'MONTHLY',
    meetingPreferences: '',

    // ========== STEP 11: TECHNICAL REQUIREMENTS ==========
    currentTechStack: '',
    integrationNeeds: '',
    analyticsRequirements: '',
    kpis: ['', '', '', '', ''],
    successDefinition: '',
    currentPerformanceMetrics: '',

    // ========== STEP 12: TEAM & TIMELINE ==========
    internalTeamSize: '',
    stakeholder1: '',
    stakeholder2: '',
    stakeholder3: '',
    decisionMakers: '',
    projectUrgency: '',
    launchDeadlines: '',
    milestonePreferences: '',

    // ========== STEP 13: TARGET AUDIENCE ==========
    primaryTargetAudience: '',
    geographicFocus: '',
    audienceAgeRange: '',
    audienceIncomeLevel: '',
    commonConditions: '',
    insuranceTypesAccepted: '',
    preferredChannels: [] as string[],

    // ========== STEP 14: BRANDING ==========
    hasExistingLogo: 'YES',
    logoUrl: '',
    brandGuidelinesUrl: '',
    brandPersonality: '',
    preferredColors: '',
    designStylePreference: '',
    brandsYouAdmire: '',
    designMaterialsNeeded: [] as string[],
    designTimeline: '',
    additionalDesignRequirements: '',

    // ========== STEP 15: AI AUTOMATION ==========
    currentAutomationLevel: 'NO_AUTOMATION',
    currentToolsPlatforms: '',
    aiServicesInterested: [] as string[],
    priorityAutomationGoals: '',
    automationBudgetRange: '',
    implementationTimeline: '',
    technicalComplexityPreference: 'SIMPLE',
    additionalAutomationRequirements: '',
  })

  // Auto-save to localStorage (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasRestoredRef = useRef(false)

  // Restore from localStorage on mount
  useEffect(() => {
    if (hasRestoredRef.current) return
    hasRestoredRef.current = true
    try {
      const saved = localStorage.getItem('onboarding-step4-' + data.token)
      if (saved) {
        const parsed = JSON.parse(saved)
        setFormData((prev: typeof formData) => ({ ...prev, ...parsed }))
      }
    } catch {
      // Ignore parse errors
    }
  }, [data.token])

  // Save to localStorage on formData change (debounced)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('onboarding-step4-' + data.token, JSON.stringify(formData))
      } catch {
        // Ignore storage errors
      }
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [formData, data.token])

  // Get customer term based on industry
  const getCustomerTerm = () => {
    const industry = INDUSTRIES.find(i => i.id === formData.industry)
    return industry?.customerTerm || 'customer'
  }

  // Helper components
  const inputClasses = 'w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
  const selectClasses = 'w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all'
  const textareaClasses = 'w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none'
  const checkboxClasses = 'w-5 h-5 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0'

  const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
    <div className="mb-6 pb-4 border-b border-slate-700">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
  )

  const InfoBanner = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
      <p className="text-sm text-orange-300">{children}</p>
    </div>
  )

  const TutorialLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-orange-400 hover:text-orange-300 text-sm">
      <ExternalLink className="w-3 h-3 mr-1" />
      {children}
    </a>
  )

  const CheckboxOption = ({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className={checkboxClasses} />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  )

  const RadioOption = ({ name, value, currentValue, onChange, label }: { name: string; value: string; currentValue: string; onChange: (v: string) => void; label: string }) => (
    <label className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
      currentValue === value ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600'
    }`}>
      <input type="radio" name={name} value={value} checked={currentValue === value} onChange={() => onChange(value)} className="sr-only" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  )

  // Render sections
  const renderSection = () => {
    const section = activeSections[currentSection]
    const customerTerm = getCustomerTerm()
    const CustomerTerm = customerTerm.charAt(0).toUpperCase() + customerTerm.slice(1)

    switch (section.id) {
      case 'basic':
        return (
          <div className="space-y-6">
            <InfoBanner>
              For file uploads, please email to: <strong>files@brandingpioneers.in</strong>
            </InfoBanner>

            <SectionHeader title="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Client Name * <InfoTip text="Your official registered business name." type="action" /></label>
                <input type="text" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} className={inputClasses} placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Email * <InfoTip text="Email for project communications and report delivery." type="action" /></label>
                <input type="email" value={formData.primaryEmail} onChange={e => setFormData({ ...formData, primaryEmail: e.target.value })} className={inputClasses} placeholder="email@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number * <InfoTip text="Best number to reach you. WhatsApp preferred." type="action" /></label>
                <input type="tel" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className={inputClasses} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Website URL <InfoTip text="Your current website. We'll audit it for SEO and performance." type="action" /></label>
                <input type="url" value={formData.websiteUrl} onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })} className={inputClasses} placeholder="https://yourwebsite.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Address</label>
              <textarea value={formData.businessAddress} onChange={e => setFormData({ ...formData, businessAddress: e.target.value })} className={textareaClasses} rows={2} placeholder="Complete business address" />
            </div>

            <SectionHeader title="Indian Business Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">GSTIN</label>
                <input type="text" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} className={inputClasses} placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">PAN Number</label>
                <input type="text" value={formData.panNumber} onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })} className={inputClasses} placeholder="AAAAA0000A" maxLength={10} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className={selectClasses}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className={selectClasses}>
                  <option value="">Select City</option>
                  {INDIAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">PIN Code</label>
                <input type="text" value={formData.pinCode} onChange={e => setFormData({ ...formData, pinCode: e.target.value })} className={inputClasses} placeholder="110001" maxLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Business Registration Type <InfoTip text="Legal structure of your company (Pvt Ltd, LLP, Sole Proprietorship, etc.)." type="action" /></label>
                <select value={formData.businessRegistrationType} onChange={e => setFormData({ ...formData, businessRegistrationType: e.target.value })} className={selectClasses}>
                  <option value="">Select Type</option>
                  {BUSINESS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Udyam Registration Number (MSME)</label>
                <input type="text" value={formData.udyamRegistrationNumber} onChange={e => setFormData({ ...formData, udyamRegistrationNumber: e.target.value.toUpperCase() })} className={inputClasses} placeholder="UDYAM-XX-00-0000000" />
              </div>
            </div>

            {formData.industry === 'HEALTHCARE' && (
              <>
                <SectionHeader title="Healthcare Licenses & Registrations" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Medical Council Registration</label>
                    <input type="text" value={formData.medicalCouncilRegistration} onChange={e => setFormData({ ...formData, medicalCouncilRegistration: e.target.value })} className={inputClasses} placeholder="Registration number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Clinical Establishment License</label>
                    <input type="text" value={formData.clinicalEstablishmentLicense} onChange={e => setFormData({ ...formData, clinicalEstablishmentLicense: e.target.value })} className={inputClasses} placeholder="License number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Drug License (if applicable)</label>
                    <input type="text" value={formData.drugLicense} onChange={e => setFormData({ ...formData, drugLicense: e.target.value })} className={inputClasses} placeholder="License number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">NABH/JCI Accreditation</label>
                    <input type="text" value={formData.nabhAccreditation} onChange={e => setFormData({ ...formData, nabhAccreditation: e.target.value })} className={inputClasses} placeholder="Accreditation details" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">FSSAI License (if applicable)</label>
                    <input type="text" value={formData.fssaiLicense} onChange={e => setFormData({ ...formData, fssaiLicense: e.target.value })} className={inputClasses} placeholder="License number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Biomedical Waste Authorization</label>
                    <input type="text" value={formData.biomedicalWasteAuthorization} onChange={e => setFormData({ ...formData, biomedicalWasteAuthorization: e.target.value })} className={inputClasses} placeholder="Authorization number" />
                  </div>
                </div>
              </>
            )}

            <SectionHeader title="Business Classification" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Industry * <InfoTip text="Your business sector. Helps us tailor our marketing strategy." type="action" /></label>
                <select value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className={selectClasses}>
                  {INDUSTRIES.map(ind => <option key={ind.id} value={ind.id}>{ind.label}</option>)}
                </select>
              </div>
              {formData.industry === 'HEALTHCARE' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Healthcare Business Type</label>
                  <select value={formData.healthcareBusinessType} onChange={e => setFormData({ ...formData, healthcareBusinessType: e.target.value })} className={selectClasses}>
                    <option value="">Select Type</option>
                    {HEALTHCARE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              )}
              <div className={formData.industry !== 'HEALTHCARE' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-300 mb-2">Monthly Marketing Budget <InfoTip text="Total monthly marketing budget in INR." type="action" /></label>
                <select value={formData.monthlyMarketingBudget} onChange={e => setFormData({ ...formData, monthlyMarketingBudget: e.target.value })} className={selectClasses}>
                  <option value="">Select Budget</option>
                  <option value="UNDER_50K">Under ₹50,000</option>
                  <option value="50K_1L">₹50,000 - ₹1,00,000</option>
                  <option value="1L_2L">₹1,00,000 - ₹2,00,000</option>
                  <option value="2L_5L">₹2,00,000 - ₹5,00,000</option>
                  <option value="5L_10L">₹5,00,000 - ₹10,00,000</option>
                  <option value="ABOVE_10L">₹10,00,000+</option>
                  <option value="PROJECT_BASED">Project-based</option>
                  <option value="TO_DISCUSS">To be discussed</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-6">
            <SectionHeader title="Contact Information" description="How should we reach you and your leads?" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Email * <InfoTip text="Email for project communications and report delivery." type="action" /></label>
                <input type="email" value={formData.primaryEmail} onChange={e => setFormData({ ...formData, primaryEmail: e.target.value })} className={inputClasses} placeholder="email@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email for Leads & Communication</label>
                <input type="email" value={formData.emailForLeads} onChange={e => setFormData({ ...formData, emailForLeads: e.target.value })} className={inputClasses} placeholder="leads@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number for Promotion * <InfoTip text="Best number to reach you. WhatsApp preferred." type="action" /></label>
                <input type="tel" value={formData.phoneForPromotion} onChange={e => setFormData({ ...formData, phoneForPromotion: e.target.value })} className={inputClasses} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Website URL <InfoTip text="Your current website. We'll audit it for SEO and performance." type="action" /></label>
                <input type="url" value={formData.websiteUrl} onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })} className={inputClasses} placeholder="https://yourwebsite.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Locations (City/State/Country) <InfoTip text="Cities, states, or regions you want to target." type="action" /></label>
              <textarea value={formData.targetLocations} onChange={e => setFormData({ ...formData, targetLocations: e.target.value })} className={textareaClasses} rows={3} placeholder="List your target service areas..." />
            </div>
          </div>
        )

      case 'website':
        return (
          <div className="space-y-6">
            <SectionHeader title="Website & Technical Access" description="Credentials for website management" />
            <InfoBanner>
              These credentials are stored securely and used only for authorized work on your website.
            </InfoBanner>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Admin Panel URL <InfoTip text="Direct link to your WordPress login page (usually /wp-admin)." type="action" /></label>
                <input type="url" value={formData.adminPanelUrl} onChange={e => setFormData({ ...formData, adminPanelUrl: e.target.value })} className={inputClasses} placeholder="https://yoursite.com/wp-admin" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Username <InfoTip text="Login username for your website admin panel." type="action" /></label>
                  <input type="text" value={formData.adminUsername} onChange={e => setFormData({ ...formData, adminUsername: e.target.value })} className={inputClasses} placeholder="admin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password <InfoTip text="Login password. Stored encrypted and visible only to assigned team." type="action" /></label>
                  <input type="password" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'google':
        return (
          <div className="space-y-6">
            <SectionHeader title="Google Services Access" description="Grant access to our SEO team" />
            <InfoBanner>
              Please add the following emails as users/managers to your Google properties:
              <br /><strong>seowithbp@gmail.com</strong>, <strong>seobrandingpioneers@gmail.in</strong>, <strong>brandingpioneers@gmail.in</strong>
            </InfoBanner>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked={formData.gmbAccessGranted} onChange={e => setFormData({ ...formData, gmbAccessGranted: e.target.checked })} className={checkboxClasses} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Google My Business (GMB) Access <InfoTip text="What level of access you're granting us to your Google Business Profile." type="action" /></p>
                    <p className="text-xs text-slate-400">Add us as a manager to your GMB listing</p>
                  </div>
                </div>
                <TutorialLink href="https://youtu.be/LwgbdTrCI3A?t=19">How to give GMB access</TutorialLink>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked={formData.analyticsAccessGranted} onChange={e => setFormData({ ...formData, analyticsAccessGranted: e.target.checked })} className={checkboxClasses} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Google Analytics Access <InfoTip text="Your GA4 Measurement ID. Format: G-XXXXXXXXXX. Found in GA4 → Admin → Data Streams." type="action" /></p>
                    <p className="text-xs text-slate-400">Add us as an editor to your Analytics property</p>
                  </div>
                </div>
                <TutorialLink href="https://youtu.be/QAUB1LLljg8?t=35">How to give Analytics access</TutorialLink>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked={formData.searchConsoleAccessGranted} onChange={e => setFormData({ ...formData, searchConsoleAccessGranted: e.target.checked })} className={checkboxClasses} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Google Search Console Access <InfoTip text="Your verified property URL in Search Console." type="action" /></p>
                    <p className="text-xs text-slate-400">Add us as a user to your Search Console</p>
                  </div>
                </div>
                <TutorialLink href="https://youtu.be/LqabOT-PF-U?t=9">How to give Search Console access</TutorialLink>
              </div>
            </div>
          </div>
        )

      case 'seo':
        return (
          <div className="space-y-6">
            <SectionHeader title="SEO Information" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Previous SEO Report (File URL/Link)</label>
              <input type="url" value={formData.previousSeoReportUrl} onChange={e => setFormData({ ...formData, previousSeoReportUrl: e.target.value })} className={inputClasses} placeholder="Google Drive or Dropbox link" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Involvement in SEO Process</label>
              <select value={formData.seoInvolvement} onChange={e => setFormData({ ...formData, seoInvolvement: e.target.value })} className={selectClasses}>
                <option value="MINIMAL">Minimal</option>
                <option value="MODERATE">Moderate</option>
                <option value="COLLABORATIVE">Collaborative</option>
                <option value="HANDS_ON">Hands-on</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">SEO Remarks</label>
              <textarea value={formData.seoRemarks} onChange={e => setFormData({ ...formData, seoRemarks: e.target.value })} className={textareaClasses} rows={3} placeholder="Any specific SEO requirements or notes..." />
            </div>

            <SectionHeader title="Advertising Information" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Advertising Platforms</label>
              <div className="flex flex-wrap gap-3">
                {['Google Ads', 'Meta Ads (Facebook/Instagram)', 'Both'].map(platform => (
                  <CheckboxOption
                    key={platform}
                    id={platform}
                    label={platform}
                    checked={formData.advertisingPlatforms.includes(platform)}
                    onChange={checked => {
                      if (checked) {
                        setFormData({ ...formData, advertisingPlatforms: [...formData.advertisingPlatforms, platform] })
                      } else {
                        setFormData({ ...formData, advertisingPlatforms: formData.advertisingPlatforms.filter(p => p !== platform) })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Paid Advertising Investment Comfort Level</label>
              <select value={formData.adsBudgetLevel} onChange={e => setFormData({ ...formData, adsBudgetLevel: e.target.value })} className={selectClasses}>
                <option value="">Select Level</option>
                <option value="CONSERVATIVE">Conservative ₹500-₹2,500/day</option>
                <option value="MODERATE">Moderate ₹2,500-₹7,500/day</option>
                <option value="AGGRESSIVE">Aggressive ₹7,500-₹15,000/day</option>
                <option value="PREMIUM">Premium ₹15,000+/day</option>
                <option value="VARIABLE">Variable</option>
                <option value="ROI_BASED">Discuss based on ROI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Involvement in Ads Management</label>
              <select value={formData.adsInvolvement} onChange={e => setFormData({ ...formData, adsInvolvement: e.target.value })} className={selectClasses}>
                <option value="FULL_MANAGEMENT">Full Management</option>
                <option value="APPROVAL_REQUIRED">Approval Required</option>
                <option value="COLLABORATIVE">Collaborative</option>
                <option value="CONSULTATION_ONLY">Consultation Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Locations for Ads</label>
              <textarea value={formData.targetLocationsForAds} onChange={e => setFormData({ ...formData, targetLocationsForAds: e.target.value })} className={textareaClasses} rows={2} placeholder="Cities, states, or countries to target..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ads Remarks</label>
              <textarea value={formData.adsRemarks} onChange={e => setFormData({ ...formData, adsRemarks: e.target.value })} className={textareaClasses} rows={3} placeholder="Any specific advertising requirements..." />
            </div>
          </div>
        )

      case 'social':
        return (
          <div className="space-y-6">
            <SectionHeader title="Facebook Access" />
            <InfoBanner>
              Admin access email: <strong>arush.thapar@yahoo.com</strong>
              <br />Facebook profile: <a href="https://www.facebook.com/arush.thapar" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">facebook.com/arush.thapar</a>
            </InfoBanner>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked={formData.facebookAccessGranted} onChange={e => setFormData({ ...formData, facebookAccessGranted: e.target.checked })} className={checkboxClasses} />
                <div>
                  <p className="text-sm font-medium text-slate-200">Facebook Page Admin Access Granted <InfoTip text="Which social media platforms you're active on or want to be." type="action" /></p>
                </div>
              </div>
              <div className="flex gap-2">
                <TutorialLink href="https://youtu.be/d0qfd15Pdlc?t=126">Desktop</TutorialLink>
                <TutorialLink href="https://youtu.be/d0qfd15Pdlc?t=243">Mobile</TutorialLink>
              </div>
            </div>

            <SectionHeader title="LinkedIn Access" />
            <InfoBanner>
              For doctors: We need your LinkedIn profile login<br />
              For hospitals: Connection request will be sent
            </InfoBanner>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked={formData.linkedinAccessGranted} onChange={e => setFormData({ ...formData, linkedinAccessGranted: e.target.checked })} className={checkboxClasses} />
                <div>
                  <p className="text-sm font-medium text-slate-200">LinkedIn Access Granted</p>
                </div>
              </div>
              <TutorialLink href="https://youtu.be/yjvdwyjg25w?t=8">How to give LinkedIn access</TutorialLink>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Social Media Involvement <InfoTip text="Your social media usernames/URLs." type="action" /></label>
              <select value={formData.socialMediaInvolvement} onChange={e => setFormData({ ...formData, socialMediaInvolvement: e.target.value })} className={selectClasses}>
                <option value="FULL_MANAGEMENT">Full Management</option>
                <option value="CONTENT_APPROVAL">Content Approval</option>
                <option value="COLLABORATIVE">Collaborative</option>
                <option value="CONTENT_PROVIDER">Content Provider</option>
              </select>
            </div>

            <SectionHeader title="YouTube Management" />
            <InfoBanner>
              Access emails: <strong>ytbpworks@gmail.com</strong>, <strong>brandingpioneers@gmail.in</strong>
            </InfoBanner>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked={formData.youtubeAccessGranted} onChange={e => setFormData({ ...formData, youtubeAccessGranted: e.target.checked })} className={checkboxClasses} />
                <div>
                  <p className="text-sm font-medium text-slate-200">YouTube Channel Access Granted</p>
                </div>
              </div>
              <TutorialLink href="https://youtu.be/iw1m3FaY-g4?t=46">How to give YouTube access</TutorialLink>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">YouTube Involvement</label>
              <select value={formData.youtubeInvolvement} onChange={e => setFormData({ ...formData, youtubeInvolvement: e.target.value })} className={selectClasses}>
                <option value="FULL_PRODUCTION">Full Production</option>
                <option value="EDITING_ONLY">Editing Only</option>
                <option value="GUIDANCE_STRATEGY">Guidance & Strategy</option>
                <option value="CHANNEL_SETUP">Channel Setup</option>
              </select>
            </div>

            <SectionHeader title="Current Logo & Branding" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Logo Files (Google Drive/Dropbox link) <InfoTip text="If you use a password manager, share the vault link for social accounts." type="action" /></label>
              <input type="url" value={formData.currentLogoUrl} onChange={e => setFormData({ ...formData, currentLogoUrl: e.target.value })} className={inputClasses} placeholder="Link to PNG, JPG, SVG, AI, EPS, PDF files" />
              <p className="text-xs text-slate-500 mt-1">Accepted formats: PNG, JPG, SVG, AI, EPS, PDF</p>
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6">
            <SectionHeader title="Business Identity" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What is your biggest strength? <InfoTip text="Your unique selling points - what sets you apart from competitors." type="action" /></label>
              <textarea value={formData.biggestStrength} onChange={e => setFormData({ ...formData, biggestStrength: e.target.value })} className={textareaClasses} rows={3} placeholder="Your key differentiator..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">IDENTITY: Who are you?</label>
              <textarea value={formData.identity} onChange={e => setFormData({ ...formData, identity: e.target.value })} className={textareaClasses} rows={3} placeholder="Describe your business identity..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">VALUE PROPOSITION: What&apos;s the UVP for your {CustomerTerm}? <InfoTip text="What makes your business unique? Your core offering in 1-2 sentences." type="action" /></label>
              <textarea value={formData.valueProposition} onChange={e => setFormData({ ...formData, valueProposition: e.target.value })} className={textareaClasses} rows={3} placeholder="Your unique value proposition..." />
            </div>

            <SectionHeader title="Target Audience" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Age of your {customerTerm}s</label>
                <select value={formData.targetAgeGroup} onChange={e => setFormData({ ...formData, targetAgeGroup: e.target.value })} className={selectClasses}>
                  <option value="">Select Age Group</option>
                  <option value="18_25">18-25</option>
                  <option value="26_35">26-35</option>
                  <option value="36_45">36-45</option>
                  <option value="46_55">46-55</option>
                  <option value="56_65">56-65</option>
                  <option value="65_PLUS">65+</option>
                  <option value="ALL_AGES">All ages</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Gender of your {customerTerm}s</label>
                <select value={formData.targetGender} onChange={e => setFormData({ ...formData, targetGender: e.target.value })} className={selectClasses}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="BOTH">Both</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Occupation of your {customerTerm}s</label>
                <select value={formData.targetOccupation} onChange={e => setFormData({ ...formData, targetOccupation: e.target.value })} className={selectClasses}>
                  <option value="">Select Occupation</option>
                  <option value="PROFESSIONALS">Professionals</option>
                  <option value="BUSINESS_OWNERS">Business Owners</option>
                  <option value="STUDENTS">Students</option>
                  <option value="HOMEMAKERS">Homemakers</option>
                  <option value="RETIREES">Retirees</option>
                  <option value="GOVERNMENT">Government Employees</option>
                  <option value="IT_TECH">IT/Tech</option>
                  <option value="HEALTHCARE_WORKERS">Healthcare Workers</option>
                  <option value="TEACHERS">Teachers/Educators</option>
                  <option value="BLUE_COLLAR">Blue Collar Workers</option>
                  <option value="FREELANCERS">Freelancers</option>
                  <option value="EXECUTIVES">Executives/Management</option>
                  <option value="ARTISTS">Artists/Creatives</option>
                  <option value="ATHLETES">Athletes</option>
                  <option value="VARIES">Varies</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Income Level</label>
                <select value={formData.targetIncomeLevel} onChange={e => setFormData({ ...formData, targetIncomeLevel: e.target.value })} className={selectClasses}>
                  <option value="">Select Income Level</option>
                  <option value="UNDER_3L">Under ₹3 Lakhs</option>
                  <option value="3L_6L">₹3-6 Lakhs</option>
                  <option value="6L_10L">₹6-10 Lakhs</option>
                  <option value="10L_20L">₹10-20 Lakhs</option>
                  <option value="20L_50L">₹20-50 Lakhs</option>
                  <option value="ABOVE_50L">₹50 Lakhs+</option>
                  <option value="VARIES">Varies</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Primary Location of your {customerTerm}s</label>
                <input type="text" value={formData.primaryLocation} onChange={e => setFormData({ ...formData, primaryLocation: e.target.value })} className={inputClasses} placeholder="City, State, or Region" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Customer Acquisition Cost</label>
                <input type="text" value={formData.customerAcquisitionCost} onChange={e => setFormData({ ...formData, customerAcquisitionCost: e.target.value })} className={inputClasses} placeholder="e.g., ₹500 per lead" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Average Order Value</label>
                <input type="text" value={formData.averageOrderValue} onChange={e => setFormData({ ...formData, averageOrderValue: e.target.value })} className={inputClasses} placeholder="e.g., ₹5,000" />
              </div>
            </div>

            <SectionHeader title="Services & Content Strategy" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Top 5 Services/Products</label>
              <div className="space-y-2">
                {formData.topServices.map((service, idx) => (
                  <input key={`service-${idx}`} type="text" value={service} onChange={e => {
                    const newServices = [...formData.topServices]
                    newServices[idx] = e.target.value
                    setFormData({ ...formData, topServices: newServices })
                  }} className={inputClasses} placeholder={`Service ${idx + 1}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What would your target {customerTerm} love to learn?</label>
              <div className="space-y-2">
                {formData.contentTopics.map((topic, idx) => (
                  <input key={`content-topic-${idx}`} type="text" value={topic} onChange={e => {
                    const newTopics = [...formData.contentTopics]
                    newTopics[idx] = e.target.value
                    setFormData({ ...formData, contentTopics: newTopics })
                  }} className={inputClasses} placeholder={`Topic ${idx + 1}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Questions {customerTerm}s ask before buying</label>
              <textarea value={formData.questionsBeforeBuying} onChange={e => setFormData({ ...formData, questionsBeforeBuying: e.target.value })} className={textareaClasses} rows={4} placeholder="Common questions and objections..." />
            </div>
            {formData.industry === 'HEALTHCARE' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Top 5 Health Education Topics</label>
                <div className="space-y-2">
                  {formData.healthEducationTopics.map((topic, idx) => (
                    <input key={`health-topic-${idx}`} type="text" value={topic} onChange={e => {
                      const newTopics = [...formData.healthEducationTopics]
                      newTopics[idx] = e.target.value
                      setFormData({ ...formData, healthEducationTopics: newTopics })
                    }} className={inputClasses} placeholder={`Health Topic ${idx + 1}`} />
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Top 15 keywords for your {formData.industry === 'HEALTHCARE' ? 'medical practice' : 'business'} <InfoTip text="Primary keywords you want to rank for. Separate with commas." type="action" /></label>
              <textarea value={formData.targetKeywords} onChange={e => setFormData({ ...formData, targetKeywords: e.target.value })} className={textareaClasses} rows={4} placeholder="e.g., best dentist near me, root canal cost..." />
            </div>
          </div>
        )

      case 'operations':
        return (
          <div className="space-y-6">
            <SectionHeader title="Business Operations" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Business Hours</label>
                <input type="text" value={formData.businessHours} onChange={e => setFormData({ ...formData, businessHours: e.target.value })} className={inputClasses} placeholder="e.g., Mon-Sat 9AM-6PM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time Zone</label>
                <select value={formData.timeZone} onChange={e => setFormData({ ...formData, timeZone: e.target.value })} className={selectClasses}>
                  <option value="IST">IST (Indian Standard Time)</option>
                  <option value="EST">EST (Eastern)</option>
                  <option value="CST">CST (Central)</option>
                  <option value="MST">MST (Mountain)</option>
                  <option value="PST">PST (Pacific)</option>
                  <option value="GMT">GMT</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Seasonal Variations</label>
              <textarea value={formData.seasonalVariations} onChange={e => setFormData({ ...formData, seasonalVariations: e.target.value })} className={textareaClasses} rows={2} placeholder="Any seasonal patterns in your business..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Peak Business Periods</label>
              <textarea value={formData.peakBusinessPeriods} onChange={e => setFormData({ ...formData, peakBusinessPeriods: e.target.value })} className={textareaClasses} rows={2} placeholder="When is your business busiest..." />
            </div>

            <SectionHeader title="Competitive Analysis" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Main Competitors <InfoTip text="Websites of your main competitors. One per line." type="action" /></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" value={formData.competitor1} onChange={e => setFormData({ ...formData, competitor1: e.target.value })} className={inputClasses} placeholder="Competitor 1" />
                  <input type="text" value={formData.competitor2} onChange={e => setFormData({ ...formData, competitor2: e.target.value })} className={inputClasses} placeholder="Competitor 2" />
                  <input type="text" value={formData.competitor3} onChange={e => setFormData({ ...formData, competitor3: e.target.value })} className={inputClasses} placeholder="Competitor 3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Competitive Advantages <InfoTip text="Your unique selling points - what sets you apart from competitors." type="action" /></label>
                <textarea value={formData.competitiveAdvantages} onChange={e => setFormData({ ...formData, competitiveAdvantages: e.target.value })} className={textareaClasses} rows={3} placeholder="What sets you apart from competitors..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Market Position</label>
                <select value={formData.marketPosition} onChange={e => setFormData({ ...formData, marketPosition: e.target.value })} className={selectClasses}>
                  <option value="">Select Position</option>
                  <option value="PREMIUM">Premium/Luxury</option>
                  <option value="MID_MARKET">Mid-Market</option>
                  <option value="BUDGET">Budget/Value</option>
                  <option value="NICHE">Niche Specialist</option>
                  <option value="MARKET_LEADER">Market Leader</option>
                  <option value="CHALLENGER">Challenger</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'psychology':
        return (
          <div className="space-y-6">
            <SectionHeader title={`${CustomerTerm} Psychology & Follow-up`} description={`Understanding your ${customerTerm}s' mindset`} />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Fears of {customerTerm}s before they take your service <InfoTip text="What concerns stop potential customers from buying?" type="action" /></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.customerFears.map((fear, idx) => (
                  <input key={`fear-${idx}`} type="text" value={fear} onChange={e => {
                    const newFears = [...formData.customerFears]
                    newFears[idx] = e.target.value
                    setFormData({ ...formData, customerFears: newFears })
                  }} className={inputClasses} placeholder={`Fear ${idx + 1}`} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Pain points of {customerTerm}s <InfoTip text="What problems do your customers face that you solve?" type="action" /></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.customerPainPoints.map((point, idx) => (
                  <input key={`pain-${idx}`} type="text" value={point} onChange={e => {
                    const newPoints = [...formData.customerPainPoints]
                    newPoints[idx] = e.target.value
                    setFormData({ ...formData, customerPainPoints: newPoints })
                  }} className={inputClasses} placeholder={`Pain Point ${idx + 1}`} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Problems of {customerTerm}s before they take your service</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.customerProblems.map((problem, idx) => (
                  <input key={`problem-${idx}`} type="text" value={problem} onChange={e => {
                    const newProblems = [...formData.customerProblems]
                    newProblems[idx] = e.target.value
                    setFormData({ ...formData, customerProblems: newProblems })
                  }} className={inputClasses} placeholder={`Problem ${idx + 1}`} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Needs and desires of your {customerTerm}s after your service <InfoTip text="What outcomes do customers want from your product/service?" type="action" /></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.customerNeedsDesires.map((need, idx) => (
                  <input key={`need-${idx}`} type="text" value={need} onChange={e => {
                    const newNeeds = [...formData.customerNeedsDesires]
                    newNeeds[idx] = e.target.value
                    setFormData({ ...formData, customerNeedsDesires: newNeeds })
                  }} className={inputClasses} placeholder={`Need/Desire ${idx + 1}`} />
                ))}
              </div>
            </div>

            <SectionHeader title="Follow-up & Next Steps" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Review Meeting Date</label>
              <input type="date" value={formData.reviewMeetingDate} onChange={e => setFormData({ ...formData, reviewMeetingDate: e.target.value })} className={inputClasses} />
            </div>
          </div>
        )

      case 'budget':
        return (
          <div className="space-y-6">
            <SectionHeader title="Budget Allocation & Investment Priorities" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Additional Marketing Budget Allocation</label>
              <textarea value={formData.additionalBudgetAllocation} onChange={e => setFormData({ ...formData, additionalBudgetAllocation: e.target.value })} className={textareaClasses} rows={3} placeholder="How would you like to allocate additional budget..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Investment Priorities</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Paid Advertising', 'Content Creation & Photography', 'Marketing Tools & Software',
                  'Website Enhancements', 'SEO & Content Marketing', 'Social Media Management',
                  'Email Marketing Automation', 'Analytics & Tracking Tools'
                ].map(priority => (
                  <CheckboxOption
                    key={priority}
                    id={priority}
                    label={priority}
                    checked={formData.investmentPriorities.includes(priority)}
                    onChange={checked => {
                      if (checked) {
                        setFormData({ ...formData, investmentPriorities: [...formData.investmentPriorities, priority] })
                      } else {
                        setFormData({ ...formData, investmentPriorities: formData.investmentPriorities.filter(p => p !== priority) })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Expected ROI Timeline</label>
              <select value={formData.expectedRoiTimeline} onChange={e => setFormData({ ...formData, expectedRoiTimeline: e.target.value })} className={selectClasses}>
                <option value="">Select Timeline</option>
                <option value="1_3_MONTHS">1-3 months</option>
                <option value="3_6_MONTHS">3-6 months</option>
                <option value="6_12_MONTHS">6-12 months</option>
                <option value="12_PLUS_MONTHS">12+ months</option>
              </select>
            </div>

            <SectionHeader title="Communication Preferences" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Communication Method <InfoTip text="How you prefer we communicate - WhatsApp, Email, or Call." type="action" /></label>
                <select value={formData.preferredCommunicationMethod} onChange={e => setFormData({ ...formData, preferredCommunicationMethod: e.target.value })} className={selectClasses}>
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="VIDEO_CALL">Video Call</option>
                  <option value="SLACK">Slack</option>
                  <option value="TEAMS">Microsoft Teams</option>
                  <option value="IN_PERSON">In-Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reporting Frequency</label>
                <select value={formData.reportingFrequency} onChange={e => setFormData({ ...formData, reportingFrequency: e.target.value })} className={selectClasses}>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Meeting Preferences</label>
              <textarea value={formData.meetingPreferences} onChange={e => setFormData({ ...formData, meetingPreferences: e.target.value })} className={textareaClasses} rows={2} placeholder="Preferred meeting times, frequency, format..." />
            </div>
          </div>
        )

      case 'technical':
        return (
          <div className="space-y-6">
            <SectionHeader title="Technical Requirements" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Tech Stack <InfoTip text="Tools and platforms you currently use (CRM, email, analytics, etc.)." type="action" /></label>
              <textarea value={formData.currentTechStack} onChange={e => setFormData({ ...formData, currentTechStack: e.target.value })} className={textareaClasses} rows={3} placeholder="CMS, CRM, email platforms, analytics tools..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Integration Needs <InfoTip text="Any specific integrations needed with your existing systems." type="action" /></label>
              <textarea value={formData.integrationNeeds} onChange={e => setFormData({ ...formData, integrationNeeds: e.target.value })} className={textareaClasses} rows={3} placeholder="What systems need to be integrated..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Analytics Requirements <InfoTip text="What metrics matter most to you (leads, traffic, revenue, engagement, etc.)." type="action" /></label>
              <textarea value={formData.analyticsRequirements} onChange={e => setFormData({ ...formData, analyticsRequirements: e.target.value })} className={textareaClasses} rows={3} placeholder="What metrics and reports do you need..." />
            </div>

            <SectionHeader title="Success Metrics & KPIs" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary KPIs <InfoTip text="What metrics matter most to you (leads, traffic, revenue, engagement, etc.)." type="action" /></label>
              <div className="space-y-2">
                {formData.kpis.map((kpi, idx) => (
                  <input key={`kpi-${idx}`} type="text" value={kpi} onChange={e => {
                    const newKpis = [...formData.kpis]
                    newKpis[idx] = e.target.value
                    setFormData({ ...formData, kpis: newKpis })
                  }} className={inputClasses} placeholder={`KPI ${idx + 1}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">How do you define success?</label>
              <textarea value={formData.successDefinition} onChange={e => setFormData({ ...formData, successDefinition: e.target.value })} className={textareaClasses} rows={3} placeholder="What does success look like for this engagement..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Performance Metrics</label>
              <textarea value={formData.currentPerformanceMetrics} onChange={e => setFormData({ ...formData, currentPerformanceMetrics: e.target.value })} className={textareaClasses} rows={3} placeholder="Current traffic, leads, conversions..." />
            </div>
          </div>
        )

      case 'team':
        return (
          <div className="space-y-6">
            <SectionHeader title="Team & Resources" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Internal Team Size</label>
              <select value={formData.internalTeamSize} onChange={e => setFormData({ ...formData, internalTeamSize: e.target.value })} className={selectClasses}>
                <option value="">Select Size</option>
                <option value="1_5">1-5</option>
                <option value="6_10">6-10</option>
                <option value="11_25">11-25</option>
                <option value="26_50">26-50</option>
                <option value="50_PLUS">50+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Key Stakeholders</label>
              <div className="space-y-2">
                <input type="text" value={formData.stakeholder1} onChange={e => setFormData({ ...formData, stakeholder1: e.target.value })} className={inputClasses} placeholder="Stakeholder 1 - Name & Role" />
                <input type="text" value={formData.stakeholder2} onChange={e => setFormData({ ...formData, stakeholder2: e.target.value })} className={inputClasses} placeholder="Stakeholder 2 - Name & Role" />
                <input type="text" value={formData.stakeholder3} onChange={e => setFormData({ ...formData, stakeholder3: e.target.value })} className={inputClasses} placeholder="Stakeholder 3 - Name & Role" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Decision Makers <InfoTip text="Person who approves budgets and strategic decisions." type="action" /></label>
              <textarea value={formData.decisionMakers} onChange={e => setFormData({ ...formData, decisionMakers: e.target.value })} className={textareaClasses} rows={2} placeholder="Who makes final decisions on marketing..." />
            </div>

            <SectionHeader title="Project Timeline" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Project Urgency <InfoTip text="How soon you need results or when the project should launch." type="action" /></label>
              <select value={formData.projectUrgency} onChange={e => setFormData({ ...formData, projectUrgency: e.target.value })} className={selectClasses}>
                <option value="">Select Urgency</option>
                <option value="ASAP">ASAP</option>
                <option value="1_MONTH">Within 1 month</option>
                <option value="2_3_MONTHS">2-3 months</option>
                <option value="3_6_MONTHS">3-6 months</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Launch Deadlines <InfoTip text="Target date for launching the project or campaign." type="action" /></label>
              <textarea value={formData.launchDeadlines} onChange={e => setFormData({ ...formData, launchDeadlines: e.target.value })} className={textareaClasses} rows={2} placeholder="Any fixed deadlines or events..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Milestone Preferences <InfoTip text="Target date for launching the project or campaign." type="action" /></label>
              <textarea value={formData.milestonePreferences} onChange={e => setFormData({ ...formData, milestonePreferences: e.target.value })} className={textareaClasses} rows={2} placeholder="How would you like milestones structured..." />
            </div>
          </div>
        )

      case 'audience':
        return (
          <div className="space-y-6">
            <SectionHeader title="Target Audience Analysis" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary Target Audience <InfoTip text="Who is your ideal customer? Age, location, interests, income level." type="action" /></label>
              <textarea value={formData.primaryTargetAudience} onChange={e => setFormData({ ...formData, primaryTargetAudience: e.target.value })} className={textareaClasses} rows={3} placeholder="Describe your ideal customer..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Geographic Focus <InfoTip text="Cities, states, or regions you want to target." type="action" /></label>
                <input type="text" value={formData.geographicFocus} onChange={e => setFormData({ ...formData, geographicFocus: e.target.value })} className={inputClasses} placeholder="Regions, cities, countries" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Age Range</label>
                <input type="text" value={formData.audienceAgeRange} onChange={e => setFormData({ ...formData, audienceAgeRange: e.target.value })} className={inputClasses} placeholder="e.g., 25-45" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Income Level</label>
                <select value={formData.audienceIncomeLevel} onChange={e => setFormData({ ...formData, audienceIncomeLevel: e.target.value })} className={selectClasses}>
                  <option value="">Select Level</option>
                  <option value="LOW">Low Income (₹0-3L)</option>
                  <option value="LOWER_MIDDLE">Lower Middle (₹3-6L)</option>
                  <option value="MIDDLE">Middle (₹6-12L)</option>
                  <option value="UPPER_MIDDLE">Upper Middle (₹12-25L)</option>
                  <option value="HIGH">High Income (₹25L+)</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>
              {formData.industry === 'HEALTHCARE' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Common Health Conditions/Specialties</label>
                    <input type="text" value={formData.commonConditions} onChange={e => setFormData({ ...formData, commonConditions: e.target.value })} className={inputClasses} placeholder="Conditions you treat" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Insurance Types Accepted</label>
                    <input type="text" value={formData.insuranceTypesAccepted} onChange={e => setFormData({ ...formData, insuranceTypesAccepted: e.target.value })} className={inputClasses} placeholder="Insurance providers you work with" />
                  </div>
                </>
              )}
            </div>

            <SectionHeader title="Ideal Customer Profile (ICP)" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Preferred Communication Channels</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Email', 'Phone', 'WhatsApp', 'Text/SMS', 'Social Media', 'Website',
                  'In-Person', 'Online Reviews', 'Content Marketing', 'Referrals'
                ].map(channel => (
                  <CheckboxOption
                    key={channel}
                    id={channel}
                    label={channel}
                    checked={formData.preferredChannels.includes(channel)}
                    onChange={checked => {
                      if (checked) {
                        setFormData({ ...formData, preferredChannels: [...formData.preferredChannels, channel] })
                      } else {
                        setFormData({ ...formData, preferredChannels: formData.preferredChannels.filter(c => c !== channel) })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )

      case 'branding':
        return (
          <div className="space-y-6">
            <SectionHeader title="Current Brand Status" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Do you have an existing logo?</label>
              <div className="flex gap-4">
                <RadioOption name="hasLogo" value="YES" currentValue={formData.hasExistingLogo} onChange={v => setFormData({ ...formData, hasExistingLogo: v })} label="Yes" />
                <RadioOption name="hasLogo" value="NEEDS_REDESIGN" currentValue={formData.hasExistingLogo} onChange={v => setFormData({ ...formData, hasExistingLogo: v })} label="Yes, but needs redesign" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL (Drive/Dropbox link)</label>
                <input type="url" value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} className={inputClasses} placeholder="Link to logo files" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Brand Guidelines URL</label>
                <input type="url" value={formData.brandGuidelinesUrl} onChange={e => setFormData({ ...formData, brandGuidelinesUrl: e.target.value })} className={inputClasses} placeholder="Link to brand guidelines" />
              </div>
            </div>

            <SectionHeader title="Brand Preferences & Style" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Brand Personality</label>
              <textarea value={formData.brandPersonality} onChange={e => setFormData({ ...formData, brandPersonality: e.target.value })} className={textareaClasses} rows={2} placeholder="How would you describe your brand's personality..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Colors</label>
                <input type="text" value={formData.preferredColors} onChange={e => setFormData({ ...formData, preferredColors: e.target.value })} className={inputClasses} placeholder="Colors you like (hex codes or names)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Design Style Preference</label>
                <select value={formData.designStylePreference} onChange={e => setFormData({ ...formData, designStylePreference: e.target.value })} className={selectClasses}>
                  <option value="">Select Style</option>
                  <option value="MODERN_MINIMALIST">Modern & Minimalist</option>
                  <option value="PROFESSIONAL_CORPORATE">Professional & Corporate</option>
                  <option value="CREATIVE_ARTISTIC">Creative & Artistic</option>
                  <option value="WARM_APPROACHABLE">Warm & Approachable</option>
                  <option value="BOLD_DYNAMIC">Bold & Dynamic</option>
                  <option value="CLASSIC_TRADITIONAL">Classic & Traditional</option>
                  <option value="HEALTHCARE_MEDICAL">Healthcare & Medical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Brands You Admire</label>
              <textarea value={formData.brandsYouAdmire} onChange={e => setFormData({ ...formData, brandsYouAdmire: e.target.value })} className={textareaClasses} rows={2} placeholder="Brands whose design/style you like..." />
            </div>

            <SectionHeader title="Design Needs & Requirements" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">What design materials do you need?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Logo Design/Redesign', 'Business Cards', 'Letterhead', 'Brochures/Flyers',
                  'Website Graphics', 'Social Media Templates', 'Email Signatures',
                  'Presentation Templates', 'Signage Design', 'Marketing Materials'
                ].map(material => (
                  <CheckboxOption
                    key={material}
                    id={material}
                    label={material}
                    checked={formData.designMaterialsNeeded.includes(material)}
                    onChange={checked => {
                      if (checked) {
                        setFormData({ ...formData, designMaterialsNeeded: [...formData.designMaterialsNeeded, material] })
                      } else {
                        setFormData({ ...formData, designMaterialsNeeded: formData.designMaterialsNeeded.filter(m => m !== material) })
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Timeline for Design Work</label>
              <select value={formData.designTimeline} onChange={e => setFormData({ ...formData, designTimeline: e.target.value })} className={selectClasses}>
                <option value="">Select Timeline</option>
                <option value="ASAP">ASAP (Rush)</option>
                <option value="1_2_WEEKS">1-2 weeks</option>
                <option value="3_4_WEEKS">3-4 weeks</option>
                <option value="1_2_MONTHS">1-2 months</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Additional Design Requirements</label>
              <textarea value={formData.additionalDesignRequirements} onChange={e => setFormData({ ...formData, additionalDesignRequirements: e.target.value })} className={textareaClasses} rows={3} placeholder="Any other design needs or specifications..." />
            </div>
          </div>
        )

      case 'automation':
        return (
          <div className="space-y-6">
            <SectionHeader title="Current Automation Status" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What&apos;s your current level of automation?</label>
              <select value={formData.currentAutomationLevel} onChange={e => setFormData({ ...formData, currentAutomationLevel: e.target.value })} className={selectClasses}>
                <option value="NO_AUTOMATION">No automation</option>
                <option value="BASIC">Basic</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Current Tools & Platforms</label>
              <textarea value={formData.currentToolsPlatforms} onChange={e => setFormData({ ...formData, currentToolsPlatforms: e.target.value })} className={textareaClasses} rows={3} placeholder="List tools you currently use..." />
            </div>

            <SectionHeader title="AI Automation Services Needed" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Which AI automation services interest you?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'AI Chatbots for Customer Service', 'Email Marketing Automation', 'Lead Qualification & Scoring',
                  'Appointment Scheduling', 'Social Media Automation', 'Content Generation (AI Writing)',
                  'Customer Segmentation', 'Predictive Analytics', 'Voice Assistants',
                  'Workflow Automation', 'Data Analysis & Reporting', 'Personalized Recommendations'
                ].map(service => (
                  <CheckboxOption
                    key={service}
                    id={service}
                    label={service}
                    checked={formData.aiServicesInterested.includes(service)}
                    onChange={checked => {
                      if (checked) {
                        setFormData({ ...formData, aiServicesInterested: [...formData.aiServicesInterested, service] })
                      } else {
                        setFormData({ ...formData, aiServicesInterested: formData.aiServicesInterested.filter(s => s !== service) })
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <SectionHeader title="Goals & Preferences" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority Automation Goals</label>
              <textarea value={formData.priorityAutomationGoals} onChange={e => setFormData({ ...formData, priorityAutomationGoals: e.target.value })} className={textareaClasses} rows={3} placeholder="What do you want to achieve with automation..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Automation Budget Range</label>
                <select value={formData.automationBudgetRange} onChange={e => setFormData({ ...formData, automationBudgetRange: e.target.value })} className={selectClasses}>
                  <option value="">Select Range</option>
                  <option value="UNDER_50K">Under ₹50,000/mo</option>
                  <option value="50K_1L">₹50,000 - ₹1,00,000/mo</option>
                  <option value="1L_2L">₹1,00,000 - ₹2,00,000/mo</option>
                  <option value="2L_5L">₹2,00,000 - ₹5,00,000/mo</option>
                  <option value="ABOVE_5L">₹5,00,000+/mo</option>
                  <option value="PROJECT_BASED">Project-based</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Implementation Timeline</label>
                <select value={formData.implementationTimeline} onChange={e => setFormData({ ...formData, implementationTimeline: e.target.value })} className={selectClasses}>
                  <option value="">Select Timeline</option>
                  <option value="IMMEDIATELY">Start immediately</option>
                  <option value="1_MONTH">Within 1 month</option>
                  <option value="2_3_MONTHS">2-3 months</option>
                  <option value="6_MONTHS">Within 6 months</option>
                  <option value="PLANNING">Still planning</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Technical Complexity Preference</label>
              <div className="flex flex-wrap gap-3">
                <RadioOption name="complexity" value="SIMPLE" currentValue={formData.technicalComplexityPreference} onChange={v => setFormData({ ...formData, technicalComplexityPreference: v })} label="Simple & User-friendly" />
                <RadioOption name="complexity" value="MODERATE" currentValue={formData.technicalComplexityPreference} onChange={v => setFormData({ ...formData, technicalComplexityPreference: v })} label="Moderate complexity" />
                <RadioOption name="complexity" value="ADVANCED" currentValue={formData.technicalComplexityPreference} onChange={v => setFormData({ ...formData, technicalComplexityPreference: v })} label="Advanced & Customizable" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Additional AI Automation Requirements</label>
              <textarea value={formData.additionalAutomationRequirements} onChange={e => setFormData({ ...formData, additionalAutomationRequirements: e.target.value })} className={textareaClasses} rows={3} placeholder="Any other automation needs..." />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/onboarding/${data.token}/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit details')
      }

      // Clear auto-saved data on successful submission
      try { localStorage.removeItem('onboarding-step4-' + data.token) } catch {}

      onComplete({
        accountOnboarding: {
          completed: true,
          completedAt: new Date().toISOString(),
        },
      })
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const customerTerm = getCustomerTerm()

  return (
    <div className="space-y-6">
      <PageGuide
        title="Account Setup"
        description="Provide your business and marketing details so we can set up your accounts properly."
        pageKey="onboarding-step4"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-600/10 rounded-2xl border border-white/10 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <SectionLabel title="Client Discovery Form" type="action" description="Fill in your business details" />
            <p className="mt-1 text-slate-400">
              Help us understand your business better to deliver the best results
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>{activeSections[currentSection].title}</span>
            <span className="text-emerald-400">{Math.round(((currentSection + 1) / activeSections.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${((currentSection + 1) / activeSections.length) * 100}%` }} className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />
          </div>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </motion.div>
      )}

      {/* Section Navigation Pills */}
      <div className="flex flex-wrap gap-2">
        {activeSections.map((section, idx) => (
          <button key={section.id} onClick={() => setCurrentSection(idx)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
            currentSection === idx ? 'bg-orange-500/20 text-orange-400 border border-orange-500' : idx < currentSection ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-500'
          }`}>
            <section.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{section.title}</span>
            {idx < currentSection && <CheckCircle className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Current Section */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center space-x-4 mb-6">
          {(() => {
            const section = activeSections[currentSection]
            const Icon = section.icon
            return (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                  <p className="text-sm text-slate-500">{section.description}</p>
                </div>
              </>
            )
          })()}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0} className="px-6 py-3 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
          ← Previous
        </button>
        {currentSection < activeSections.length - 1 ? (
          <motion.button onClick={() => setCurrentSection(currentSection + 1)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all">
            Next <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        ) : (
          <motion.button onClick={handleSubmit} disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all">
            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Complete Setup</>}
          </motion.button>
        )}
      </div>
    </div>
  )
}
