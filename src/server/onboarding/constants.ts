// ============================================
// UNIFIED ONBOARDING CONSTANTS
// ============================================

// Services offered
export const SERVICES = [
  { id: 'seo', name: 'SEO', icon: '🔍', description: 'Search Engine Optimization' },
  { id: 'social', name: 'Social Media', icon: '📱', description: 'Social Media Marketing' },
  { id: 'ads', name: 'Performance Ads', icon: '📈', description: 'Google & Meta Ads' },
  { id: 'web', name: 'Website', icon: '💻', description: 'Website Design & Development' },
  { id: 'gbp', name: 'GBP/Local SEO', icon: '📍', description: 'Google Business Profile Management' },
  { id: 'video', name: 'Video Marketing', icon: '🎬', description: 'YouTube & Video Content' },
  { id: 'content', name: 'Content Marketing', icon: '✍️', description: 'Blog & Content Strategy' },
] as const

export type ServiceId = typeof SERVICES[number]['id']

// Contract durations
export const CONTRACT_DURATIONS = [
  { id: '6_MONTHS', label: '6 Months', months: 6 },
  { id: '12_MONTHS', label: '12 Months', months: 12 },
  { id: '24_MONTHS', label: '24 Months', months: 24 },
  { id: 'ONGOING', label: 'Ongoing (Month-to-Month)', months: 0 },
] as const

// Payment terms
export const PAYMENT_TERMS = [
  { id: 'ADVANCE_100', label: '100% Advance', advancePercent: 100 },
  { id: 'ADVANCE_50', label: '50% Advance', advancePercent: 50 },
  { id: 'NET_15', label: 'Net 15 Days', advancePercent: 0 },
  { id: 'NET_30', label: 'Net 30 Days', advancePercent: 0 },
] as const

// Entity types
export const ENTITY_TYPES = [
  {
    id: 'BRANDING_PIONEERS',
    name: 'Branding Pioneers',
    legalName: 'Branding Pioneers',
    address: '750, Udyog Vihar, Third Floor, Gurgaon, Haryana',
    gstin: process.env.COMPANY_GSTIN || '', // TODO: Add actual GSTIN for Branding Pioneers
    bank: {
      name: 'HDFC Bank',
      branch: 'Udyog Vihar, Gurgaon',
      accountName: 'Branding Pioneers',
      accountNumber: 'XXXXXXXXXXXX',
      ifsc: 'HDFC0001234',
      upi: 'brandingpioneers@hdfcbank'
    }
  },
  {
    id: 'ATZ_MEDAPPZ',
    name: 'ATZ Medappz',
    legalName: 'ATZ Medappz Pvt. Ltd.',
    address: '750, Udyog Vihar, Third Floor, Gurgaon, Haryana',
    gstin: '06AAICA5555L1ZP',
    bank: {
      name: 'HDFC Bank',
      branch: 'Udyog Vihar, Gurgaon',
      accountName: 'ATZ Medappz Pvt Ltd',
      accountNumber: 'XXXXXXXXXXXX',
      ifsc: 'HDFC0001234',
      upi: 'atzmedappz@hdfcbank'
    }
  },
] as const

// Indian states
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
] as const

// ============================================
// ACCOUNT ONBOARDING FORM OPTIONS
// ============================================

export const BRAND_VOICE_OPTIONS = [
  { id: 'FORMAL', label: 'Formal & Professional' },
  { id: 'CASUAL', label: 'Casual & Friendly' },
  { id: 'PROFESSIONAL', label: 'Professional but Approachable' },
  { id: 'FRIENDLY', label: 'Warm & Friendly' },
  { id: 'MIXED', label: 'Mix of Styles' },
] as const

export const COMMUNICATION_STYLE_OPTIONS = [
  { id: 'DETAILED', label: 'Detailed & Comprehensive' },
  { id: 'BRIEF', label: 'Brief & To-the-Point' },
  { id: 'VISUAL', label: 'Visual-Heavy (Screenshots, Videos)' },
] as const

export const REPORTING_FREQUENCY_OPTIONS = [
  { id: 'DAILY', label: 'Daily Updates' },
  { id: 'WEEKLY', label: 'Weekly Reports' },
  { id: 'BI_WEEKLY', label: 'Bi-Weekly Reports' },
  { id: 'MONTHLY', label: 'Monthly Reports' },
] as const

export const MEETING_PREFERENCE_OPTIONS = [
  { id: 'VIDEO', label: 'Video Calls (Zoom/Meet)' },
  { id: 'PHONE', label: 'Phone Calls' },
  { id: 'IN_PERSON', label: 'In-Person Meetings' },
  { id: 'ASYNC', label: 'Async (WhatsApp/Email Only)' },
] as const

export const RESPONSE_EXPECTATION_OPTIONS = [
  { id: 'SAME_DAY', label: 'Same Day Response' },
  { id: 'NEXT_DAY', label: 'Next Business Day' },
  { id: '48_HOURS', label: 'Within 48 Hours' },
  { id: 'FLEXIBLE', label: 'Flexible / No Rush' },
] as const

export const DECISION_MAKER_OPTIONS = [
  { id: 'CLIENT_ONLY', label: 'Client Decides Alone' },
  { id: 'TEAM_INVOLVED', label: 'Internal Team Involved' },
  { id: 'AGENCY_LED', label: 'Agency-Led Decisions' },
] as const

export const INVOLVEMENT_LEVEL_OPTIONS = [
  { id: 'HANDS_ON', label: 'Hands-On (Review Everything)' },
  { id: 'MODERATE', label: 'Moderate (Key Milestones Only)' },
  { id: 'DELEGATE', label: 'Delegate (Trust the Agency)' },
] as const

export const PREFERRED_CHANNEL_OPTIONS = [
  { id: 'WHATSAPP', label: 'WhatsApp' },
  { id: 'EMAIL', label: 'Email' },
  { id: 'CALL', label: 'Phone Call' },
  { id: 'SLACK', label: 'Slack' },
  { id: 'ALL', label: 'Any Channel' },
] as const

export const CONTENT_TURNAROUND_OPTIONS = [
  { id: '24_HOURS', label: '24 Hours' },
  { id: '48_HOURS', label: '48 Hours' },
  { id: '72_HOURS', label: '72 Hours' },
  { id: 'FLEXIBLE', label: 'Flexible' },
] as const

// ============================================
// SEO-SPECIFIC OPTIONS
// ============================================

export const ACCESS_STATUS_OPTIONS = [
  { id: 'GRANTED', label: 'Access Granted' },
  { id: 'PENDING', label: 'Will Share Later' },
  { id: 'NEED_HELP', label: 'Need Help Setting Up' },
  { id: 'CREATE_NEW', label: 'Create New Account' },
] as const

export const SEO_GOAL_OPTIONS = [
  { id: 'TRAFFIC', label: 'Increase Website Traffic' },
  { id: 'LEADS', label: 'Generate Leads' },
  { id: 'SALES', label: 'Drive Sales/Conversions' },
  { id: 'BRAND_VISIBILITY', label: 'Brand Visibility' },
] as const

export const YES_NO_UNKNOWN_OPTIONS = [
  { id: 'YES', label: 'Yes' },
  { id: 'NO', label: 'No' },
  { id: 'UNKNOWN', label: 'Not Sure' },
] as const

// ============================================
// SOCIAL MEDIA OPTIONS
// ============================================

export const SOCIAL_PLATFORMS = [
  { id: 'FACEBOOK', label: 'Facebook', icon: '📘' },
  { id: 'INSTAGRAM', label: 'Instagram', icon: '📷' },
  { id: 'LINKEDIN', label: 'LinkedIn', icon: '💼' },
  { id: 'TWITTER', label: 'Twitter/X', icon: '🐦' },
  { id: 'YOUTUBE', label: 'YouTube', icon: '📺' },
  { id: 'PINTEREST', label: 'Pinterest', icon: '📌' },
] as const

export const POST_FREQUENCY_OPTIONS = [
  { id: 'DAILY', label: 'Daily Posts' },
  { id: '3_PER_WEEK', label: '3 Posts Per Week' },
  { id: 'WEEKLY', label: 'Weekly Posts' },
  { id: 'AS_NEEDED', label: 'As Needed' },
] as const

export const CONTENT_STYLE_OPTIONS = [
  { id: 'EDUCATIONAL', label: 'Educational & Informative' },
  { id: 'PROMOTIONAL', label: 'Promotional & Sales' },
  { id: 'ENTERTAINING', label: 'Entertaining & Fun' },
  { id: 'MIXED', label: 'Mix of All' },
] as const

export const BRAND_ASSETS_OPTIONS = [
  { id: 'WILL_PROVIDE', label: 'We Will Provide' },
  { id: 'NEED_CREATION', label: 'Need Agency to Create' },
  { id: 'BOTH', label: 'Some + Need More' },
] as const

export const SOCIAL_GOAL_OPTIONS = [
  { id: 'FOLLOWERS', label: 'Grow Followers' },
  { id: 'ENGAGEMENT', label: 'Increase Engagement' },
  { id: 'LEADS', label: 'Generate Leads' },
  { id: 'BRAND_AWARENESS', label: 'Brand Awareness' },
] as const

// ============================================
// ADS OPTIONS
// ============================================

export const ADS_PLATFORMS = [
  { id: 'GOOGLE', label: 'Google Ads', icon: '🔍' },
  { id: 'META', label: 'Meta (Facebook/Instagram)', icon: '📱' },
  { id: 'LINKEDIN', label: 'LinkedIn Ads', icon: '💼' },
  { id: 'YOUTUBE', label: 'YouTube Ads', icon: '📺' },
] as const

export const CAMPAIGN_GOAL_OPTIONS = [
  { id: 'LEADS', label: 'Lead Generation' },
  { id: 'SALES', label: 'Sales/Conversions' },
  { id: 'TRAFFIC', label: 'Website Traffic' },
  { id: 'BRAND_AWARENESS', label: 'Brand Awareness' },
  { id: 'APP_INSTALLS', label: 'App Installs' },
] as const

export const PREVIOUS_EXPERIENCE_OPTIONS = [
  { id: 'YES_GOOD', label: 'Yes, with good results' },
  { id: 'YES_BAD', label: 'Yes, but not satisfied' },
  { id: 'NO', label: 'No previous experience' },
  { id: 'UNKNOWN', label: 'Not sure' },
] as const

// ============================================
// WEB OPTIONS
// ============================================

export const PROJECT_TYPE_OPTIONS = [
  { id: 'NEW_WEBSITE', label: 'New Website' },
  { id: 'REDESIGN', label: 'Website Redesign' },
  { id: 'MAINTENANCE', label: 'Maintenance & Updates' },
  { id: 'E_COMMERCE', label: 'E-Commerce Store' },
  { id: 'LANDING_PAGE', label: 'Landing Page' },
] as const

export const PLATFORM_OPTIONS = [
  { id: 'WORDPRESS', label: 'WordPress' },
  { id: 'SHOPIFY', label: 'Shopify' },
  { id: 'WEBFLOW', label: 'Webflow' },
  { id: 'CUSTOM', label: 'Custom Development' },
  { id: 'UNDECIDED', label: 'Open to Suggestions' },
] as const

export const HAS_CONTENT_OPTIONS = [
  { id: 'YES', label: 'Yes, content ready' },
  { id: 'NEED_WRITING', label: 'Need content writing' },
  { id: 'PARTIAL', label: 'Some ready, need more' },
] as const

export const TIMELINE_OPTIONS = [
  { id: 'URGENT', label: 'Urgent (ASAP)' },
  { id: '1_MONTH', label: 'Within 1 Month' },
  { id: '2_MONTHS', label: 'Within 2 Months' },
  { id: 'FLEXIBLE', label: 'Flexible Timeline' },
] as const

export const WEB_GOAL_OPTIONS = [
  { id: 'LEAD_GENERATION', label: 'Lead Generation' },
  { id: 'E_COMMERCE', label: 'E-Commerce/Sales' },
  { id: 'BRANDING', label: 'Brand Presence' },
  { id: 'INFORMATION', label: 'Information/Portfolio' },
] as const

// ============================================
// GBP OPTIONS
// ============================================

export const GBP_STATUS_OPTIONS = [
  { id: 'YES', label: 'Yes, have GBP' },
  { id: 'NO', label: 'No GBP yet' },
  { id: 'MULTIPLE', label: 'Multiple Locations' },
] as const

export const GBP_ACCESS_OPTIONS = [
  { id: 'OWNER', label: 'Owner Access' },
  { id: 'MANAGER', label: 'Manager Access' },
  { id: 'PENDING', label: 'Will Share Access' },
  { id: 'CREATE_NEW', label: 'Need to Create' },
] as const

export const GBP_GOAL_OPTIONS = [
  { id: 'LOCAL_VISIBILITY', label: 'Local Visibility' },
  { id: 'REVIEWS', label: 'Get More Reviews' },
  { id: 'LEADS', label: 'Generate Local Leads' },
  { id: 'ALL', label: 'All of the Above' },
] as const

// ============================================
// ONBOARDING STATUS
// ============================================

export const ONBOARDING_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  VIEWED: 'VIEWED',
  DETAILS_CONFIRMED: 'DETAILS_CONFIRMED',
  SLA_SIGNED: 'SLA_SIGNED',
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  PAYMENT_DONE: 'PAYMENT_DONE',
  ONBOARDING_IN_PROGRESS: 'ONBOARDING_IN_PROGRESS',
  ONBOARDING_COMPLETE: 'ONBOARDING_COMPLETE',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACTIVATED: 'ACTIVATED',
} as const

export const ONBOARDING_STEPS = [
  { step: 1, key: 'details', label: 'Confirm Details', description: 'Review and confirm your business details' },
  { step: 2, key: 'sla', label: 'Service Agreement', description: 'Review and accept the SLA' },
  { step: 3, key: 'invoice', label: 'Payment', description: 'View invoice and make payment' },
  { step: 4, key: 'onboarding', label: 'Account Setup', description: 'Provide brand and service details' },
  { step: 5, key: 'complete', label: 'Complete', description: 'Welcome aboard!' },
] as const

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getServiceById(id: string) {
  return SERVICES.find(s => s.id === id)
}

export function getEntityById(id: string) {
  return ENTITY_TYPES.find(e => e.id === id)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateGST(amount: number, gstPercent: number = 18): number {
  return Math.round(amount * (gstPercent / 100) * 100) / 100
}

export function calculateTotal(baseAmount: number, gstPercent: number = 18): number {
  return baseAmount + calculateGST(baseAmount, gstPercent)
}

export function calculateAdvance(totalAmount: number, advancePercent: number): number {
  return Math.round(totalAmount * (advancePercent / 100))
}
