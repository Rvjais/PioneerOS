/**
 * Role Definitions Library
 * Defines responsibilities, work types, and app functions for each role
 */

// Internal role definitions (for employees viewing org chart)
export interface InternalRoleDefinition {
  title: string
  level: number
  description: string
  responsibilities: string[]
  workTypes: string[]
  appFunctions: {
    sendsforms: boolean
    approvesWork: boolean
    fillsDailyTracker: boolean
    reviewsDeliverables: boolean
    managesClients: boolean
    handlesEscalations: boolean
  }
  clientVisible: boolean
  escalationContact?: boolean
  billingContact?: boolean
}

export const INTERNAL_ROLE_DEFINITIONS: Record<string, InternalRoleDefinition> = {
  SUPER_ADMIN: {
    title: 'Super Admin / Leadership',
    level: 1,
    description: 'Company leadership with full system access',
    responsibilities: [
      'Strategic decision making',
      'Final approvals on major decisions',
      'Team hiring and performance management',
      'Client escalation resolution',
      'System configuration'
    ],
    workTypes: ['approvals', 'reviews', 'strategic'],
    appFunctions: {
      sendsforms: false,
      approvesWork: true,
      fillsDailyTracker: false,
      reviewsDeliverables: true,
      managesClients: true,
      handlesEscalations: true
    },
    clientVisible: true,
    escalationContact: true
  },
  MANAGER: {
    title: 'Department Manager',
    level: 2,
    description: 'Manages department operations and team performance',
    responsibilities: [
      'Approves daily work submissions',
      'Reviews team deliverables before client delivery',
      'Handles client escalations',
      'Conducts 1:1s and performance reviews',
      'Allocates work to team members'
    ],
    workTypes: ['approvals', 'reviews', 'daily_tracker'],
    appFunctions: {
      sendsforms: true,
      approvesWork: true,
      fillsDailyTracker: true,
      reviewsDeliverables: true,
      managesClients: true,
      handlesEscalations: true
    },
    clientVisible: true,
    escalationContact: true
  },
  OM: {
    title: 'Operations Manager',
    level: 2,
    description: 'HR + Operations blended role',
    responsibilities: [
      'Employee onboarding coordination',
      'HR policy enforcement',
      'Cross-team coordination',
      'Process improvement'
    ],
    workTypes: ['forms', 'reviews', 'daily_tracker'],
    appFunctions: {
      sendsforms: true,
      approvesWork: true,
      fillsDailyTracker: true,
      reviewsDeliverables: false,
      managesClients: false,
      handlesEscalations: true
    },
    clientVisible: false
  },
  EMPLOYEE: {
    title: 'Team Member',
    level: 3,
    description: 'Executes client deliverables and daily tasks',
    responsibilities: [
      'Creates client deliverables',
      'Logs daily work in tracker',
      'Maintains quality standards',
      'Communicates with clients (as assigned)',
      'Attends client and internal meetings'
    ],
    workTypes: ['daily_tracker', 'deliverables'],
    appFunctions: {
      sendsforms: false,
      approvesWork: false,
      fillsDailyTracker: true,
      reviewsDeliverables: false,
      managesClients: false,
      handlesEscalations: false
    },
    clientVisible: true
  },
  ACCOUNTS: {
    title: 'Accounts / Finance',
    level: 3,
    description: 'Handles invoicing, payments, and financial operations',
    responsibilities: [
      'Invoice generation and tracking',
      'Payment follow-ups',
      'Financial reporting',
      'Reimbursement processing'
    ],
    workTypes: ['billing', 'reporting'],
    appFunctions: {
      sendsforms: true,
      approvesWork: false,
      fillsDailyTracker: true,
      reviewsDeliverables: false,
      managesClients: false,
      handlesEscalations: false
    },
    clientVisible: true,
    billingContact: true
  },
  HR: {
    title: 'Human Resources',
    level: 3,
    description: 'Manages recruitment, onboarding, and employee relations',
    responsibilities: [
      'Candidate sourcing and screening',
      'Employee onboarding',
      'Policy administration',
      'Performance management support'
    ],
    workTypes: ['forms', 'daily_tracker'],
    appFunctions: {
      sendsforms: true,
      approvesWork: false,
      fillsDailyTracker: true,
      reviewsDeliverables: false,
      managesClients: false,
      handlesEscalations: false
    },
    clientVisible: false
  },
  SALES: {
    title: 'Sales Executive',
    level: 3,
    description: 'Handles lead generation and client acquisition',
    responsibilities: [
      'Lead qualification and nurturing',
      'Client pitches and proposals',
      'Contract negotiations',
      'Relationship building'
    ],
    workTypes: ['sales', 'daily_tracker'],
    appFunctions: {
      sendsforms: true,
      approvesWork: false,
      fillsDailyTracker: true,
      reviewsDeliverables: false,
      managesClients: false,
      handlesEscalations: false
    },
    clientVisible: false
  },
  FREELANCER: {
    title: 'Freelancer',
    level: 4,
    description: 'External contractor working on specific projects',
    responsibilities: [
      'Delivers assigned project work',
      'Maintains communication on progress',
      'Meets quality standards',
      'Submits work for review'
    ],
    workTypes: ['deliverables', 'daily_tracker'],
    appFunctions: {
      sendsforms: false,
      approvesWork: false,
      fillsDailyTracker: true,
      reviewsDeliverables: false,
      managesClients: false,
      handlesEscalations: false
    },
    clientVisible: true
  },
  INTERN: {
    title: 'Intern',
    level: 4,
    description: 'Learning and supporting team operations',
    responsibilities: [
      'Assists with daily tasks',
      'Learns department workflows',
      'Supports team deliverables',
      'Attends training sessions'
    ],
    workTypes: ['daily_tracker'],
    appFunctions: {
      sendsforms: false,
      approvesWork: false,
      fillsDailyTracker: true,
      reviewsDeliverables: false,
      managesClients: false,
      handlesEscalations: false
    },
    clientVisible: false
  }
}

// Client team role definitions (what clients see)
export interface ClientTeamRoleDefinition {
  title: string
  description: string
  responsibilities: string[]
  isPrimary?: boolean
  escalationContact?: boolean
  billingContact?: boolean
  department: string
}

export const CLIENT_TEAM_ROLE_DEFINITIONS: Record<string, ClientTeamRoleDefinition> = {
  ACCOUNT_MANAGER: {
    title: 'Account Manager',
    description: 'Your primary point of contact for all project matters',
    responsibilities: [
      'Daily communication and updates',
      'Project coordination',
      'Escalation handling',
      'Monthly performance reviews',
      'Strategy discussions'
    ],
    isPrimary: true,
    escalationContact: true,
    department: 'OPERATIONS'
  },
  SEO_SPECIALIST: {
    title: 'SEO Specialist',
    description: 'Handles search engine optimization for your website',
    responsibilities: [
      'Keyword research and tracking',
      'On-page optimization',
      'Content optimization',
      'Monthly SEO reports'
    ],
    isPrimary: false,
    department: 'SEO'
  },
  SEO_LEAD: {
    title: 'SEO Lead',
    description: 'Leads SEO strategy and oversees optimization efforts',
    responsibilities: [
      'SEO strategy development',
      'Technical SEO audits',
      'Team coordination for SEO tasks',
      'Performance analysis and reporting'
    ],
    isPrimary: false,
    department: 'SEO'
  },
  ADS_SPECIALIST: {
    title: 'Ads Specialist',
    description: 'Manages paid advertising campaigns across platforms',
    responsibilities: [
      'Campaign setup and optimization',
      'Budget management',
      'A/B testing',
      'Performance reporting'
    ],
    isPrimary: false,
    department: 'ADS'
  },
  ADS_MANAGER: {
    title: 'Ads Manager',
    description: 'Oversees all paid advertising strategies',
    responsibilities: [
      'Ads strategy development',
      'Multi-platform campaign management',
      'ROI optimization',
      'Client reporting on ad performance'
    ],
    isPrimary: false,
    department: 'ADS'
  },
  SOCIAL_MANAGER: {
    title: 'Social Media Manager',
    description: 'Manages your social media presence and engagement',
    responsibilities: [
      'Content calendar management',
      'Post scheduling and publishing',
      'Community engagement',
      'Social media analytics'
    ],
    isPrimary: false,
    department: 'SOCIAL'
  },
  SOCIAL_SPECIALIST: {
    title: 'Social Media Specialist',
    description: 'Executes social media content and engagement',
    responsibilities: [
      'Content creation for social platforms',
      'Daily posting and scheduling',
      'Engagement monitoring',
      'Trend research'
    ],
    isPrimary: false,
    department: 'SOCIAL'
  },
  CONTENT_WRITER: {
    title: 'Content Writer',
    description: 'Creates written content for your marketing efforts',
    responsibilities: [
      'Blog post writing',
      'Website copy creation',
      'Social media captions',
      'Email content'
    ],
    isPrimary: false,
    department: 'CONTENT'
  },
  CONTENT_LEAD: {
    title: 'Content Lead',
    description: 'Leads content strategy and quality assurance',
    responsibilities: [
      'Content strategy development',
      'Editorial calendar management',
      'Quality review and editing',
      'Team content coordination'
    ],
    isPrimary: false,
    department: 'CONTENT'
  },
  WEB_DEVELOPER: {
    title: 'Web Developer',
    description: 'Handles website development and maintenance',
    responsibilities: [
      'Website updates and changes',
      'Bug fixes and maintenance',
      'New feature development',
      'Performance optimization'
    ],
    isPrimary: false,
    department: 'WEB'
  },
  WEB_LEAD: {
    title: 'Web Team Lead',
    description: 'Leads web development projects and team',
    responsibilities: [
      'Project planning and execution',
      'Technical architecture decisions',
      'Code review and quality assurance',
      'Client technical consultations'
    ],
    isPrimary: false,
    department: 'WEB'
  },
  DESIGNER: {
    title: 'Graphic Designer',
    description: 'Creates visual assets for your brand',
    responsibilities: [
      'Social media graphics',
      'Marketing collaterals',
      'Brand consistency',
      'Creative concepts'
    ],
    isPrimary: false,
    department: 'DESIGN'
  },
  DESIGN_LEAD: {
    title: 'Design Lead',
    description: 'Leads creative direction and design quality',
    responsibilities: [
      'Brand visual strategy',
      'Design team coordination',
      'Creative direction',
      'Quality assurance for all designs'
    ],
    isPrimary: false,
    department: 'DESIGN'
  },
  VIDEO_EDITOR: {
    title: 'Video Editor',
    description: 'Creates and edits video content for your brand',
    responsibilities: [
      'Video editing and post-production',
      'Reels and shorts creation',
      'Motion graphics',
      'Video optimization for platforms'
    ],
    isPrimary: false,
    department: 'VIDEO'
  },
  AUTOMATION_ENGINEER: {
    title: 'Automation Engineer',
    description: 'Builds automated workflows and integrations',
    responsibilities: [
      'Marketing automation setup',
      'CRM integrations',
      'Workflow optimization',
      'Technical implementations'
    ],
    isPrimary: false,
    department: 'WEB'
  },
  PROJECT_COORDINATOR: {
    title: 'Project Coordinator',
    description: 'Coordinates project timelines and deliverables',
    responsibilities: [
      'Timeline management',
      'Task coordination',
      'Status updates',
      'Resource allocation'
    ],
    isPrimary: false,
    department: 'OPERATIONS'
  },
  BILLING_CONTACT: {
    title: 'Billing Contact',
    description: 'Handles invoicing and payment matters',
    responsibilities: [
      'Invoice generation',
      'Payment follow-ups',
      'Billing queries',
      'Account statements'
    ],
    isPrimary: false,
    billingContact: true,
    department: 'ACCOUNTS'
  },
  STRATEGIST: {
    title: 'Marketing Strategist',
    description: 'Develops marketing strategies for your business',
    responsibilities: [
      'Marketing strategy development',
      'Campaign planning',
      'Market research',
      'Performance optimization'
    ],
    isPrimary: false,
    department: 'OPERATIONS'
  }
}

// Work type icons/labels for display
export const WORK_TYPE_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  forms: {
    label: 'Forms',
    icon: 'clipboard-list',
    description: 'Sends forms and collects information'
  },
  approvals: {
    label: 'Approvals',
    icon: 'check-circle',
    description: 'Approves work submissions'
  },
  daily_tracker: {
    label: 'Daily Tracker',
    icon: 'calendar-check',
    description: 'Fills daily work tracker'
  },
  reviews: {
    label: 'Reviews',
    icon: 'eye',
    description: 'Reviews deliverables'
  },
  deliverables: {
    label: 'Deliverables',
    icon: 'package',
    description: 'Creates client deliverables'
  },
  billing: {
    label: 'Billing',
    icon: 'credit-card',
    description: 'Handles invoicing and payments'
  },
  reporting: {
    label: 'Reporting',
    icon: 'bar-chart',
    description: 'Creates reports'
  },
  sales: {
    label: 'Sales',
    icon: 'trending-up',
    description: 'Handles sales activities'
  },
  strategic: {
    label: 'Strategic',
    icon: 'target',
    description: 'Strategic planning and decisions'
  }
}

// Department display info
export const DEPARTMENT_INFO: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  WEB: {
    label: 'Web Development',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  SEO: {
    label: 'SEO',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30'
  },
  ADS: {
    label: 'Paid Advertising',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30'
  },
  SOCIAL: {
    label: 'Social Media',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30'
  },
  DESIGN: {
    label: 'Design',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  CONTENT: {
    label: 'Content',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30'
  },
  VIDEO: {
    label: 'Video',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  HR: {
    label: 'Human Resources',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/30'
  },
  ACCOUNTS: {
    label: 'Accounts',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    borderColor: 'border-teal-500/30'
  },
  SALES: {
    label: 'Sales',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  OPERATIONS: {
    label: 'Operations',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30'
  }
}

// Helper functions
export function getRoleDefinition(role: string): InternalRoleDefinition | undefined {
  return INTERNAL_ROLE_DEFINITIONS[role]
}

export function getClientTeamRoleDefinition(role: string): ClientTeamRoleDefinition | undefined {
  return CLIENT_TEAM_ROLE_DEFINITIONS[role]
}

export function getDepartmentInfo(department: string) {
  return DEPARTMENT_INFO[department] || {
    label: department,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30'
  }
}

export function getRoleLevel(role: string): number {
  return INTERNAL_ROLE_DEFINITIONS[role]?.level || 3
}

export function isLeadershipRole(role: string): boolean {
  const level = getRoleLevel(role)
  return level <= 2
}

export function canApproveWork(role: string): boolean {
  return INTERNAL_ROLE_DEFINITIONS[role]?.appFunctions?.approvesWork || false
}

export function isClientVisible(role: string): boolean {
  return INTERNAL_ROLE_DEFINITIONS[role]?.clientVisible || false
}
