import { formatDateDDMMYYYY } from '@/shared/utils/cn'
// KPI Definitions for Tactical Meetings by Department

export interface KPIField {
  id: string
  label: string
  type: 'number' | 'float' | 'percentage'
  suffix?: string
  hasComparison: boolean
  growthLabel?: string
}

export interface DepartmentKPIs {
  label: string
  kpis: KPIField[]
}

export const DEPARTMENT_KPIS: Record<string, DepartmentKPIs> = {
  SEO: {
    label: 'SEO',
    kpis: [
      { id: 'gbpCalls', label: 'GBP Calls (Total)', type: 'number', hasComparison: true, growthLabel: 'Calls Growth' },
      { id: 'serpTraffic', label: 'SERP Traffic (Total)', type: 'number', hasComparison: true, growthLabel: 'Traffic Growth' },
      { id: 'organicTraffic', label: 'Organic Traffic', type: 'number', hasComparison: true, growthLabel: 'Organic Growth' },
      { id: 'keywordsSerpTop3', label: 'SERP Keywords (Top 3)', type: 'number', hasComparison: true },
      { id: 'keywordsSerpTop3Volume', label: 'SERP Top 3 Search Volume', type: 'number', hasComparison: true },
      { id: 'keywordsGbpTop3', label: 'GBP Keywords (Top 3)', type: 'number', hasComparison: true },
      { id: 'keywordsGbpTop3Volume', label: 'GBP Top 3 Search Volume', type: 'number', hasComparison: true },
      { id: 'aeoGeoTopics', label: 'AEO/GEO Topics Ranking', type: 'number', hasComparison: true },
      { id: 'websiteLeads', label: 'Website Leads Generated', type: 'number', hasComparison: true, growthLabel: 'Leads Growth' },
    ],
  },
  ADS: {
    label: 'Paid Ads',
    kpis: [
      { id: 'totalLeads', label: 'Total Leads Generated', type: 'number', hasComparison: true, growthLabel: 'Leads Growth' },
      { id: 'costPerLead', label: 'Cost per Lead', type: 'float', suffix: '₹', hasComparison: true },
      { id: 'costPerAcquisition', label: 'Cost per Acquisition', type: 'float', suffix: '₹', hasComparison: true },
      { id: 'adSpend', label: 'Ad Spend', type: 'float', suffix: '₹', hasComparison: true },
      { id: 'conversions', label: 'Conversions', type: 'number', hasComparison: true },
      { id: 'roas', label: 'ROAS', type: 'float', suffix: 'x', hasComparison: true },
    ],
  },
  SOCIAL: {
    label: 'Social Media',
    kpis: [
      { id: 'totalVideosPosted', label: 'Total Videos Posted', type: 'number', hasComparison: true },
      { id: 'leadsGenerated', label: 'Leads Generated', type: 'number', hasComparison: true, growthLabel: 'Leads Growth' },
      { id: 'totalReach', label: 'Total Reach', type: 'number', hasComparison: true, growthLabel: 'Reach Growth' },
      { id: 'followers', label: 'Total Followers', type: 'number', hasComparison: true, growthLabel: 'Follower Growth' },
      { id: 'watchTimeMinutes', label: 'Watch Time (minutes)', type: 'number', hasComparison: true },
      { id: 'totalPosts', label: 'Total Posts', type: 'number', hasComparison: true },
      { id: 'engagementRate', label: 'Engagement Rate', type: 'percentage', suffix: '%', hasComparison: true },
    ],
  },
  WEB: {
    label: 'Web Development',
    kpis: [
      { id: 'pagesDelivered', label: 'Pages Delivered (Approved)', type: 'number', hasComparison: true },
      { id: 'aiToolsSold', label: 'AI Tools Sold', type: 'number', hasComparison: true },
      { id: 'aiPitchMeetings', label: 'AI Pitch Meetings', type: 'number', hasComparison: true },
      { id: 'bugsFixed', label: 'Bugs Fixed', type: 'number', hasComparison: true },
      { id: 'pageSpeed', label: 'Page Speed Score', type: 'number', suffix: '/100', hasComparison: true },
    ],
  },
  ACCOUNTS: {
    label: 'Accounts',
    kpis: [
      { id: 'invoicesGenerated', label: 'Invoices Generated', type: 'number', hasComparison: true },
      { id: 'paymentsCollected', label: 'Payments Collected', type: 'float', suffix: '₹', hasComparison: true },
      { id: 'outstandingAmount', label: 'Outstanding Amount', type: 'float', suffix: '₹', hasComparison: true },
      { id: 'clientsServiced', label: 'Clients Serviced', type: 'number', hasComparison: true },
      { id: 'onboardingsCompleted', label: 'Onboardings Completed', type: 'number', hasComparison: true },
      { id: 'collectionRate', label: 'Collection Rate', type: 'percentage', suffix: '%', hasComparison: true },
    ],
  },
  SALES: {
    label: 'Sales / BD',
    kpis: [
      { id: 'leadsGenerated', label: 'Leads Generated', type: 'number', hasComparison: true },
      { id: 'callsMade', label: 'Calls Made', type: 'number', hasComparison: true },
      { id: 'meetingsScheduled', label: 'Meetings Scheduled', type: 'number', hasComparison: true },
      { id: 'proposalsSent', label: 'Proposals Sent', type: 'number', hasComparison: true },
      { id: 'dealsWon', label: 'Deals Won', type: 'number', hasComparison: true },
      { id: 'revenueGenerated', label: 'Revenue Generated', type: 'float', suffix: '₹', hasComparison: true },
      { id: 'conversionRate', label: 'Conversion Rate', type: 'percentage', suffix: '%', hasComparison: true },
    ],
  },
  HR: {
    label: 'HR',
    kpis: [
      { id: 'candidatesSourced', label: 'Candidates Sourced', type: 'number', hasComparison: true },
      { id: 'interviewsConducted', label: 'Interviews Conducted', type: 'number', hasComparison: true },
      { id: 'offersExtended', label: 'Offers Extended', type: 'number', hasComparison: true },
      { id: 'joineesOnboarded', label: 'Joinees Onboarded', type: 'number', hasComparison: true },
      { id: 'employeeNPS', label: 'Employee NPS', type: 'number', suffix: '/100', hasComparison: true },
      { id: 'attritionRate', label: 'Attrition Rate', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'trainingHoursDelivered', label: 'Training Hours', type: 'number', hasComparison: true },
    ],
  },
  OPERATIONS: {
    label: 'Operations / Client Servicing',
    kpis: [
      { id: 'clientsManaged', label: 'Clients Managed', type: 'number', hasComparison: true },
      { id: 'clientNPS', label: 'Client NPS', type: 'number', suffix: '/100', hasComparison: true },
      { id: 'tasksCompleted', label: 'Tasks Completed', type: 'number', hasComparison: true },
      { id: 'escalationsResolved', label: 'Escalations Resolved', type: 'number', hasComparison: true },
      { id: 'deliverablesMet', label: 'Deliverables Met', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'clientRetention', label: 'Client Retention', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'responseTime', label: 'Avg Response Time', type: 'number', suffix: 'hrs', hasComparison: true },
    ],
  },
  MANAGER: {
    label: 'Manager',
    kpis: [
      { id: 'teamSize', label: 'Team Size', type: 'number', hasComparison: true },
      { id: 'teamProductivity', label: 'Team Productivity', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'projectsDelivered', label: 'Projects Delivered', type: 'number', hasComparison: true },
      { id: 'clientSatisfaction', label: 'Client Satisfaction', type: 'number', suffix: '/10', hasComparison: true },
      { id: 'revenueManaged', label: 'Revenue Managed', type: 'float', suffix: '₹', hasComparison: true },
      { id: 'teamRetention', label: 'Team Retention', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'processImprovements', label: 'Process Improvements', type: 'number', hasComparison: true },
    ],
  },
  // Blended role for OM - Operations Manager handling HR + Social CS
  OM_BLENDED: {
    label: 'Operations Manager (HR + Social CS)',
    kpis: [
      // HR KPIs
      { id: 'candidatesSourced', label: 'Candidates Sourced', type: 'number', hasComparison: true },
      { id: 'interviewsConducted', label: 'Interviews Conducted', type: 'number', hasComparison: true },
      { id: 'joineesOnboarded', label: 'Joinees Onboarded', type: 'number', hasComparison: true },
      // Social CS KPIs
      { id: 'clientsManaged', label: 'Clients Managed', type: 'number', hasComparison: true },
      { id: 'clientNPS', label: 'Client NPS', type: 'number', suffix: '/100', hasComparison: true },
      { id: 'deliverablesMet', label: 'Deliverables Met', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'escalationsResolved', label: 'Escalations Resolved', type: 'number', hasComparison: true },
    ],
  },
  // YouTube specific for content managers
  YOUTUBE: {
    label: 'YouTube',
    kpis: [
      { id: 'videosPublished', label: 'Videos Published', type: 'number', hasComparison: true },
      { id: 'shortsPublished', label: 'Shorts Published', type: 'number', hasComparison: true },
      { id: 'subscribers', label: 'Subscribers', type: 'number', hasComparison: true },
      { id: 'totalViews', label: 'Total Views', type: 'number', hasComparison: true },
      { id: 'watchTimeHours', label: 'Watch Time (hrs)', type: 'number', hasComparison: true },
      { id: 'avgViewDuration', label: 'Avg View Duration', type: 'float', suffix: 'min', hasComparison: true },
      { id: 'ctr', label: 'CTR', type: 'percentage', suffix: '%', hasComparison: true },
    ],
  },
  // Video Editing - Auto-populated from daily tasks
  VIDEO_EDITING: {
    label: 'Video Editing',
    kpis: [
      { id: 'reelsEdited', label: 'Reels Edited', type: 'number', hasComparison: true },
      { id: 'youtubeVideos', label: 'YouTube Videos', type: 'number', hasComparison: true },
      { id: 'youtubeShorts', label: 'YouTube Shorts', type: 'number', hasComparison: true },
      { id: 'motionGraphics', label: 'Motion Graphics', type: 'number', hasComparison: true },
      { id: 'gifs', label: 'GIFs Created', type: 'number', hasComparison: true },
      { id: 'animations', label: 'Animations', type: 'number', hasComparison: true },
      { id: 'videoRevisions', label: 'Video Revisions', type: 'number', hasComparison: true },
      { id: 'totalVideos', label: 'Total Videos Delivered', type: 'number', hasComparison: true },
    ],
  },
  // Graphic Design - Auto-populated from daily tasks
  DESIGN: {
    label: 'Graphic Design',
    kpis: [
      { id: 'staticPosts', label: 'Static Posts', type: 'number', hasComparison: true },
      { id: 'carousels', label: 'Carousels', type: 'number', hasComparison: true },
      { id: 'stories', label: 'Stories', type: 'number', hasComparison: true },
      { id: 'reels', label: 'Reels/Videos', type: 'number', hasComparison: true },
      { id: 'thumbnails', label: 'Thumbnails', type: 'number', hasComparison: true },
      { id: 'banners', label: 'Banners/Ads', type: 'number', hasComparison: true },
      { id: 'revisions', label: 'Revisions', type: 'number', hasComparison: true },
      { id: 'totalDeliverables', label: 'Total Deliverables', type: 'number', hasComparison: true },
    ],
  },
  // AI / Automation
  AI: {
    label: 'AI & Automation',
    kpis: [
      { id: 'automationsBuilt', label: 'Automations Built', type: 'number', hasComparison: true },
      { id: 'workflowsDeployed', label: 'Workflows Deployed', type: 'number', hasComparison: true },
      { id: 'hoursAutomated', label: 'Hours Automated', type: 'number', hasComparison: true, growthLabel: 'Efficiency Gain' },
      { id: 'integrationsSetup', label: 'Integrations Setup', type: 'number', hasComparison: true },
      { id: 'chatbotsCreated', label: 'Chatbots Created', type: 'number', hasComparison: true },
      { id: 'clientsOnboarded', label: 'Clients on Automations', type: 'number', hasComparison: true },
      { id: 'errorRate', label: 'Error Rate', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'uptime', label: 'System Uptime', type: 'percentage', suffix: '%', hasComparison: true },
    ],
  },
  // Intern tracking
  INTERN: {
    label: 'Intern Progress',
    kpis: [
      { id: 'tasksAssigned', label: 'Tasks Assigned', type: 'number', hasComparison: true },
      { id: 'tasksCompleted', label: 'Tasks Completed', type: 'number', hasComparison: true },
      { id: 'completionRate', label: 'Completion Rate', type: 'percentage', suffix: '%', hasComparison: true },
      { id: 'learningHours', label: 'Learning Hours', type: 'number', hasComparison: true },
      { id: 'modulesCompleted', label: 'Modules Completed', type: 'number', hasComparison: true },
      { id: 'mentorSessions', label: 'Mentor Sessions', type: 'number', hasComparison: true },
      { id: 'skillsAcquired', label: 'Skills Acquired', type: 'number', hasComparison: true },
      { id: 'projectContributions', label: 'Project Contributions', type: 'number', hasComparison: true },
    ],
  },
}

// Get KPIs for a specific department
export function getKPIsForDepartment(department: string): KPIField[] {
  return DEPARTMENT_KPIS[department]?.kpis || []
}

// Calculate growth percentage
export function calculateGrowth(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null
  return ((current - previous) / previous) * 100
}

// Format growth for display
export function formatGrowth(growth: number | null): string {
  if (growth === null) return '-'
  const sign = growth >= 0 ? '+' : ''
  return `${sign}${growth.toFixed(1)}%`
}

// Get growth color class
export function getGrowthColor(growth: number | null, isInverted = false): string {
  if (growth === null) return 'text-slate-500'
  // Some metrics like bounce rate are better when lower (inverted)
  const isPositive = isInverted ? growth < 0 : growth > 0
  return isPositive ? 'text-green-600' : growth === 0 ? 'text-slate-500' : 'text-red-600'
}

// Inverted metrics (lower is better)
export const INVERTED_METRICS = ['bounceRate', 'costPerLead', 'costPerAcquisition', 'costPerConversion', 'outstandingAmount', 'revisions', 'videoRevisions']

// KPIs that can be auto-populated from daily task data
export const AUTO_POPULATE_DEPARTMENTS = ['DESIGN', 'VIDEO_EDITING', 'GRAPHIC_DESIGNER', 'VIDEO_EDITOR']

// Mapping of activity types to KPI fields for auto-population
export const ACTIVITY_KPI_MAPPING: Record<string, Record<string, string>> = {
  DESIGN: {
    'STATIC_POST': 'staticPosts',
    'static_post': 'staticPosts',
    'CAROUSEL': 'carousels',
    'carousel_design': 'carousels',
    'STORY': 'stories',
    'story_design': 'stories',
    'REEL': 'reels',
    'THUMBNAIL': 'thumbnails',
    'BANNER': 'banners',
    'banner_ad': 'banners',
    'REVISION': 'revisions',
    'graphic_revision': 'revisions',
    'INFOGRAPHIC': 'staticPosts',
    'PRESENTATION': 'staticPosts',
  },
  VIDEO_EDITING: {
    'reel_editing': 'reelsEdited',
    'REEL_EDITING': 'reelsEdited',
    'youtube_video': 'youtubeVideos',
    'YOUTUBE_VIDEO': 'youtubeVideos',
    'youtube_shorts': 'youtubeShorts',
    'SHORTS': 'youtubeShorts',
    'motion_graphics': 'motionGraphics',
    'MOTION_GRAPHICS': 'motionGraphics',
    'gif_creation': 'gifs',
    'GIF': 'gifs',
    'ANIMATION': 'animations',
    'video_revision': 'videoRevisions',
    'VIDEO_REVISION': 'videoRevisions',
  },
}

// Check if a department supports auto-population
export function supportsAutoPopulation(department: string): boolean {
  return AUTO_POPULATE_DEPARTMENTS.includes(department)
}

// Check if tactical meeting deadline has passed (3rd of month)
export function isTacticalDeadlinePassed(): boolean {
  const now = new Date()
  return now.getDate() > 3
}

// Get reporting month (previous month)
export function getReportingMonth(date?: Date): Date {
  const d = date || new Date()
  const reportMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  return reportMonth
}

// Format month for display
export function formatMonth(date: Date): string {
  return formatDateDDMMYYYY(date)
}

// Check if learning requirement is met (6 hours = 360 minutes)
export function isLearningRequirementMet(minutesCompleted: number): boolean {
  return minutesCompleted >= 360 // 6 hours
}

// Calculate appraisal delay months
export function calculateAppraisalDelay(missedLearningMonths: number): number {
  return missedLearningMonths
}

// Weight configuration for overall score calculation
export const SCORE_WEIGHTS = {
  performance: 0.4,    // 40% - Growth of results
  accountability: 0.3, // 30% - Projects managed vs expected
  clientSatisfaction: 0.3, // 30% - NPS + feedback
}

// Calculate overall score
export function calculateOverallScore(
  performanceScore: number,
  accountabilityScore: number,
  clientSatisfactionScore: number
): number {
  return (
    performanceScore * SCORE_WEIGHTS.performance +
    accountabilityScore * SCORE_WEIGHTS.accountability +
    clientSatisfactionScore * SCORE_WEIGHTS.clientSatisfaction
  )
}

// Property types for clients
export const PROPERTY_TYPES = [
  { id: 'GBP', label: 'Google Business Profile' },
  { id: 'WEBSITE', label: 'Website' },
  { id: 'SOCIAL_PAGE', label: 'Social Media Page' },
]
