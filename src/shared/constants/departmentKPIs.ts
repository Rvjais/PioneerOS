/**
 * Department-specific KPI configurations for work entry tracking
 * Each department has different metrics they need to track
 */

export interface KPIField {
  key: string
  label: string
  type: 'number' | 'text' | 'url' | 'select' | 'rating'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  unit?: string
  helpText?: string
}

export interface DeliverableType {
  value: string
  label: string
  unitValue?: number // Value in rupees for accountability calculation
}

export interface DepartmentKPIConfig {
  department: string
  displayName: string
  deliverableTypes: DeliverableType[]
  // Common fields for all deliverables in this department
  commonFields: KPIField[]
  // Specific fields per deliverable type
  typeSpecificFields?: Record<string, KPIField[]>
  // Metrics tracked in the JSON metrics field
  metricsFields: KPIField[]
}

// ============================================
// DESIGN DEPARTMENT
// ============================================
export const DESIGN_KPI_CONFIG: DepartmentKPIConfig = {
  department: 'DESIGN',
  displayName: 'Design / Graphics',
  deliverableTypes: [
    { value: 'STATIC_POST', label: 'Static Post', unitValue: 300 },
    { value: 'CAROUSEL', label: 'Carousel', unitValue: 600 },
    { value: 'STORY', label: 'Story', unitValue: 200 },
    { value: 'BANNER', label: 'Banner/Ad Creative', unitValue: 500 },
    { value: 'LOGO', label: 'Logo Design', unitValue: 2000 },
    { value: 'BROCHURE', label: 'Brochure', unitValue: 1500 },
    { value: 'PRESENTATION', label: 'Presentation', unitValue: 1000 },
    { value: 'INFOGRAPHIC', label: 'Infographic', unitValue: 800 },
  ],
  commonFields: [
    {
      key: 'deliverableUrl',
      label: 'Design URL',
      type: 'url',
      required: true,
      placeholder: 'Link to design file (Canva, Drive, etc.)',
      helpText: 'Provide the link where the design can be viewed',
    },
    {
      key: 'qualityScore',
      label: 'Quality Score',
      type: 'rating',
      min: 1,
      max: 10,
      helpText: 'Self-assessment 1-10 (will be reviewed by manager)',
    },
    {
      key: 'revisionCount',
      label: 'Revisions Made',
      type: 'number',
      min: 0,
      helpText: 'How many revisions were needed?',
    },
    {
      key: 'turnaroundHours',
      label: 'Turnaround Time (hours)',
      type: 'number',
      min: 0,
      helpText: 'Time from assignment to first delivery',
    },
  ],
  metricsFields: [
    { key: 'clientApproved', label: 'Client Approved?', type: 'select', options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'pending', label: 'Pending' },
    ]},
  ],
}

// ============================================
// VIDEO DEPARTMENT
// ============================================
export const VIDEO_KPI_CONFIG: DepartmentKPIConfig = {
  department: 'VIDEO',
  displayName: 'Video Editing',
  deliverableTypes: [
    { value: 'REEL', label: 'Reel/Short', unitValue: 800 },
    { value: 'YOUTUBE_VIDEO', label: 'YouTube Video', unitValue: 2500 },
    { value: 'PRODUCT_VIDEO', label: 'Product Video', unitValue: 2000 },
    { value: 'TESTIMONIAL', label: 'Testimonial Video', unitValue: 1500 },
    { value: 'EXPLAINER', label: 'Explainer Video', unitValue: 3000 },
    { value: 'MOTION_GRAPHIC', label: 'Motion Graphic', unitValue: 1200 },
  ],
  commonFields: [
    {
      key: 'deliverableUrl',
      label: 'Video URL',
      type: 'url',
      required: true,
      placeholder: 'Link to video file or published post',
    },
    {
      key: 'qualityScore',
      label: 'Quality Score',
      type: 'rating',
      min: 1,
      max: 10,
    },
    {
      key: 'revisionCount',
      label: 'Revisions Made',
      type: 'number',
      min: 0,
    },
    {
      key: 'turnaroundHours',
      label: 'Turnaround Time (hours)',
      type: 'number',
      min: 0,
    },
  ],
  metricsFields: [
    { key: 'durationSeconds', label: 'Video Duration (seconds)', type: 'number' },
    { key: 'rawFootageMinutes', label: 'Raw Footage (minutes)', type: 'number' },
  ],
}

// ============================================
// SOCIAL MEDIA DEPARTMENT
// ============================================
export const SOCIAL_KPI_CONFIG: DepartmentKPIConfig = {
  department: 'SOCIAL',
  displayName: 'Social Media',
  deliverableTypes: [
    { value: 'POST_PUBLISHED', label: 'Post Published', unitValue: 200 },
    { value: 'STORY_PUBLISHED', label: 'Story Published', unitValue: 100 },
    { value: 'REEL_PUBLISHED', label: 'Reel Published', unitValue: 300 },
    { value: 'COMMUNITY_ENGAGEMENT', label: 'Community Management', unitValue: 500 },
    { value: 'CONTENT_CALENDAR', label: 'Content Calendar', unitValue: 1000 },
    { value: 'COMPETITOR_ANALYSIS', label: 'Competitor Analysis', unitValue: 800 },
  ],
  commonFields: [
    {
      key: 'deliverableUrl',
      label: 'Post URL',
      type: 'url',
      placeholder: 'Link to published post',
    },
  ],
  metricsFields: [
    { key: 'reach', label: 'Reach', type: 'number' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'engagement', label: 'Engagement (likes + comments)', type: 'number' },
    { key: 'shares', label: 'Shares', type: 'number' },
    { key: 'saves', label: 'Saves', type: 'number' },
    { key: 'followersGained', label: 'Followers Gained', type: 'number' },
  ],
}

// ============================================
// SEO DEPARTMENT
// ============================================
export const SEO_KPI_CONFIG: DepartmentKPIConfig = {
  department: 'SEO',
  displayName: 'SEO',
  deliverableTypes: [
    { value: 'BLOG_POST', label: 'Blog Post', unitValue: 1500 },
    { value: 'KEYWORD_RESEARCH', label: 'Keyword Research', unitValue: 1000 },
    { value: 'BACKLINK', label: 'Backlink Built', unitValue: 500 },
    { value: 'TECHNICAL_AUDIT', label: 'Technical Audit', unitValue: 2000 },
    { value: 'ON_PAGE_OPTIMIZATION', label: 'On-Page Optimization', unitValue: 800 },
    { value: 'GMB_POST', label: 'GMB Post', unitValue: 300 },
    { value: 'LOCAL_CITATION', label: 'Local Citation', unitValue: 200 },
  ],
  commonFields: [
    {
      key: 'deliverableUrl',
      label: 'URL',
      type: 'url',
      placeholder: 'Link to blog/page/backlink',
    },
  ],
  metricsFields: [
    { key: 'targetKeyword', label: 'Target Keyword', type: 'text' },
    { key: 'searchVolume', label: 'Search Volume', type: 'number' },
    { key: 'currentRank', label: 'Current Rank', type: 'number' },
    { key: 'previousRank', label: 'Previous Rank', type: 'number' },
    { key: 'wordCount', label: 'Word Count', type: 'number' },
    { key: 'domainAuthority', label: 'DA (for backlinks)', type: 'number' },
  ],
}

// ============================================
// ADS DEPARTMENT
// ============================================
export const ADS_KPI_CONFIG: DepartmentKPIConfig = {
  department: 'ADS',
  displayName: 'Paid Ads',
  deliverableTypes: [
    { value: 'CAMPAIGN_SETUP', label: 'Campaign Setup', unitValue: 2000 },
    { value: 'AD_CREATIVE', label: 'Ad Creative', unitValue: 500 },
    { value: 'CAMPAIGN_OPTIMIZATION', label: 'Campaign Optimization', unitValue: 800 },
    { value: 'AUDIENCE_RESEARCH', label: 'Audience Research', unitValue: 1000 },
    { value: 'REPORT', label: 'Performance Report', unitValue: 1500 },
    { value: 'A_B_TEST', label: 'A/B Test', unitValue: 600 },
  ],
  commonFields: [
    {
      key: 'deliverableUrl',
      label: 'Campaign/Report URL',
      type: 'url',
      placeholder: 'Link to campaign or report',
    },
  ],
  metricsFields: [
    { key: 'platform', label: 'Platform', type: 'select', options: [
      { value: 'google', label: 'Google Ads' },
      { value: 'meta', label: 'Meta (FB/IG)' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'other', label: 'Other' },
    ]},
    { key: 'spend', label: 'Ad Spend (INR)', type: 'number' },
    { key: 'impressions', label: 'Impressions', type: 'number' },
    { key: 'clicks', label: 'Clicks', type: 'number' },
    { key: 'conversions', label: 'Conversions', type: 'number' },
    { key: 'cpc', label: 'CPC (INR)', type: 'number' },
    { key: 'ctr', label: 'CTR (%)', type: 'number' },
    { key: 'roas', label: 'ROAS', type: 'number' },
  ],
}

// ============================================
// WEB DEVELOPMENT DEPARTMENT
// ============================================
export const WEB_KPI_CONFIG: DepartmentKPIConfig = {
  department: 'WEB',
  displayName: 'Web Development',
  deliverableTypes: [
    { value: 'LANDING_PAGE', label: 'Landing Page', unitValue: 5000 },
    { value: 'PAGE_UPDATE', label: 'Page Update', unitValue: 1000 },
    { value: 'BUG_FIX', label: 'Bug Fix', unitValue: 500 },
    { value: 'FEATURE', label: 'Feature Development', unitValue: 3000 },
    { value: 'INTEGRATION', label: 'Integration', unitValue: 2500 },
    { value: 'SPEED_OPTIMIZATION', label: 'Speed Optimization', unitValue: 2000 },
    { value: 'SECURITY_UPDATE', label: 'Security Update', unitValue: 1500 },
  ],
  commonFields: [
    {
      key: 'deliverableUrl',
      label: 'Page/Feature URL',
      type: 'url',
      placeholder: 'Link to the page or feature',
    },
  ],
  metricsFields: [
    { key: 'pageSpeedBefore', label: 'Page Speed Before', type: 'number' },
    { key: 'pageSpeedAfter', label: 'Page Speed After', type: 'number' },
    { key: 'linesOfCode', label: 'Lines of Code', type: 'number' },
    { key: 'bugSeverity', label: 'Bug Severity', type: 'select', options: [
      { value: 'critical', label: 'Critical' },
      { value: 'major', label: 'Major' },
      { value: 'minor', label: 'Minor' },
      { value: 'trivial', label: 'Trivial' },
    ]},
  ],
}

// ============================================
// ACCOUNTS DEPARTMENT
// ============================================
export const ACCOUNTS_KPI_CONFIG: DepartmentKPIConfig = {
  department: 'ACCOUNTS',
  displayName: 'Accounts',
  deliverableTypes: [
    { value: 'INVOICE_GENERATED', label: 'Invoice Generated', unitValue: 200 },
    { value: 'PAYMENT_COLLECTED', label: 'Payment Collected', unitValue: 300 },
    { value: 'FOLLOW_UP', label: 'Payment Follow-up', unitValue: 100 },
    { value: 'SLA_PREPARED', label: 'SLA Prepared', unitValue: 500 },
    { value: 'CONTRACT_RENEWED', label: 'Contract Renewed', unitValue: 1000 },
    { value: 'RECONCILIATION', label: 'Bank Reconciliation', unitValue: 400 },
  ],
  commonFields: [],
  metricsFields: [
    { key: 'amountInvoiced', label: 'Amount Invoiced (INR)', type: 'number' },
    { key: 'amountCollected', label: 'Amount Collected (INR)', type: 'number' },
    { key: 'daysOverdue', label: 'Days Overdue', type: 'number' },
  ],
}

// Export all configs
export const DEPARTMENT_KPI_CONFIGS: Record<string, DepartmentKPIConfig> = {
  DESIGN: DESIGN_KPI_CONFIG,
  VIDEO: VIDEO_KPI_CONFIG,
  SOCIAL: SOCIAL_KPI_CONFIG,
  SEO: SEO_KPI_CONFIG,
  ADS: ADS_KPI_CONFIG,
  WEB: WEB_KPI_CONFIG,
  ACCOUNTS: ACCOUNTS_KPI_CONFIG,
}

// Get config by department
export function getDepartmentKPIConfig(department: string): DepartmentKPIConfig | null {
  return DEPARTMENT_KPI_CONFIGS[department] || null
}

// Get all deliverable types across all departments
export function getAllDeliverableTypes(): DeliverableType[] {
  return Object.values(DEPARTMENT_KPI_CONFIGS).flatMap(config => config.deliverableTypes)
}

// Calculate expected units based on department and salary
export function calculateExpectedUnits(department: string, monthlySalary: number): number {
  // Base expectations per department (at 25K salary)
  const baseSalary = 25000
  const baseUnits: Record<string, number> = {
    DESIGN: 50, // 50 designs at 25K
    VIDEO: 20, // 20 videos at 25K
    SOCIAL: 60, // 60 posts at 25K
    SEO: 30, // 30 blogs/backlinks at 25K
    ADS: 20, // 20 campaigns/optimizations at 25K
    WEB: 15, // 15 pages/features at 25K
    ACCOUNTS: 40, // 40 invoices/collections at 25K
  }

  const base = baseUnits[department] || 30
  const ratio = baseSalary > 0 ? monthlySalary / baseSalary : 1

  return Math.round(base * ratio)
}
