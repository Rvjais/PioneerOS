// ============================================
// CENTRALIZED FORM CONSTANTS & DROPDOWN OPTIONS
// ============================================
// All form options, enums, and configurations in one place

// ============================================
// USER & EMPLOYEE CONSTANTS
// ============================================

export const USER_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full system access, founders only' },
  { value: 'MANAGER', label: 'Manager', description: 'Department/team management access' },
  { value: 'OM', label: 'Operations Manager', description: 'HR + Social Media blended role' },
  { value: 'EMPLOYEE', label: 'Employee', description: 'Standard employee access' },
  { value: 'FREELANCER', label: 'Freelancer', description: 'External contractor access' },
  { value: 'SALES', label: 'Sales', description: 'Sales/BD team member' },
  { value: 'ACCOUNTS', label: 'Accounts', description: 'Finance/accounts team' },
  { value: 'HR', label: 'HR', description: 'Human resources team' },
  { value: 'INTERN', label: 'Intern', description: 'Trainee/intern access' },
] as const

export const DEPARTMENTS = [
  { value: 'OPERATIONS', label: 'Operations', icon: 'settings', color: 'slate' },
  { value: 'HR', label: 'Human Resources', icon: 'users', color: 'pink' },
  { value: 'SEO', label: 'SEO', icon: 'search', color: 'blue' },
  { value: 'SOCIAL', label: 'Social Media', icon: 'share', color: 'purple' },
  { value: 'ADS', label: 'Paid Ads', icon: 'target', color: 'orange' },
  { value: 'WEB', label: 'Web Development', icon: 'code', color: 'emerald' },
  { value: 'DESIGN', label: 'Design', icon: 'palette', color: 'violet' },
  { value: 'ACCOUNTS', label: 'Accounts', icon: 'calculator', color: 'green' },
  { value: 'SALES', label: 'Sales', icon: 'trending-up', color: 'amber' },
  { value: 'AI', label: 'AI & Automation', icon: 'cpu', color: 'cyan' },
  { value: 'CONTENT', label: 'Content', icon: 'file-text', color: 'rose' },
  { value: 'VIDEO', label: 'Video Production', icon: 'video', color: 'red' },
] as const

export const EMPLOYEE_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time', description: 'Regular full-time employee' },
  { value: 'PART_TIME', label: 'Part Time', description: 'Part-time employee' },
  { value: 'FREELANCER', label: 'Freelancer', description: 'External contractor' },
  { value: 'INTERN', label: 'Intern', description: 'Trainee/internship' },
  { value: 'CONSULTANT', label: 'Consultant', description: 'External consultant' },
] as const

export const EMPLOYEE_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'PROBATION', label: 'Probation', color: 'bg-amber-100 text-amber-700' },
  { value: 'PIP', label: 'PIP', color: 'bg-red-100 text-red-700' },
  { value: 'INACTIVE', label: 'Inactive', color: 'bg-slate-100 text-slate-700' },
  { value: 'NOTICE_PERIOD', label: 'Notice Period', color: 'bg-orange-100 text-orange-700' },
  { value: 'ON_LEAVE', label: 'On Leave', color: 'bg-blue-100 text-blue-700' },
] as const

export const BLOOD_GROUPS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
] as const

// ============================================
// CLIENT CONSTANTS
// ============================================

export const CLIENT_TIERS = [
  { value: 'MICRO', label: 'Micro', minValue: 0, maxValue: 14999, color: 'bg-gray-100 text-gray-700', revenue: 1 },
  { value: 'STARTER', label: 'Starter', minValue: 15000, maxValue: 24999, color: 'bg-slate-100 text-slate-700', revenue: 2 },
  { value: 'STANDARD', label: 'Standard', minValue: 25000, maxValue: 99999, color: 'bg-blue-100 text-blue-700', revenue: 2 },
  { value: 'PREMIUM', label: 'Premium', minValue: 100000, maxValue: 299999, color: 'bg-purple-100 text-purple-700', revenue: 3 },
  { value: 'ENTERPRISE', label: 'Enterprise', minValue: 300000, maxValue: null, color: 'bg-amber-100 text-amber-700', revenue: 4 },
] as const

export const CLIENT_STATUS = [
  { value: 'LEAD', label: 'Lead', color: 'bg-slate-100 text-slate-700', description: 'Potential client' },
  { value: 'ONBOARDING', label: 'Onboarding', color: 'bg-blue-100 text-blue-700', description: 'In onboarding process' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-100 text-emerald-700', description: 'Active client' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-100 text-amber-700', description: 'Services paused' },
  { value: 'AT_RISK', label: 'At Risk', color: 'bg-orange-100 text-orange-700', description: 'Churn risk' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-700', description: 'Churned client' },
  { value: 'DORMANT', label: 'Dormant', color: 'bg-slate-100 text-slate-500', description: 'Inactive but may return' },
] as const

export const CLIENT_SEGMENTS = [
  { value: 'INDIAN', label: 'Indian Client', description: 'Domestic client' },
  { value: 'INTERNATIONAL', label: 'International', description: 'Overseas client' },
  { value: 'MYKOHI_WHITELABEL', label: 'MyKohi Whitelabel', description: 'Whitelabel partner' },
] as const

export const INDUSTRIES = [
  { value: 'Healthcare', label: 'Healthcare & Medical' },
  { value: 'Technology', label: 'Technology & SaaS' },
  { value: 'Education', label: 'Education & EdTech' },
  { value: 'Finance', label: 'Finance & Banking' },
  { value: 'Ecommerce', label: 'E-commerce & Retail' },
  { value: 'RealEstate', label: 'Real Estate' },
  { value: 'Hospitality', label: 'Hospitality & Travel' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Legal', label: 'Legal Services' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'FnB', label: 'Food & Beverage' },
  { value: 'Fashion', label: 'Fashion & Lifestyle' },
  { value: 'Fitness', label: 'Fitness & Wellness' },
  { value: 'Media', label: 'Media & Entertainment' },
  { value: 'NonProfit', label: 'Non-Profit & NGO' },
  { value: 'Professional', label: 'Professional Services' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Logistics', label: 'Logistics & Supply Chain' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Energy', label: 'Energy & Utilities' },
  { value: 'Telecom', label: 'Telecom' },
  { value: 'Other', label: 'Other' },
] as const

export const BUSINESS_TYPES = [
  { value: 'B2B', label: 'B2B', description: 'Business to Business' },
  { value: 'B2C', label: 'B2C', description: 'Business to Consumer' },
  { value: 'D2C', label: 'D2C', description: 'Direct to Consumer' },
  { value: 'B2B2C', label: 'B2B2C', description: 'Hybrid model' },
  { value: 'B2G', label: 'B2G', description: 'Business to Government' },
  { value: 'C2C', label: 'C2C', description: 'Consumer to Consumer' },
] as const

export const SERVICE_SEGMENTS = [
  { value: 'MARKETING', label: 'Marketing Retainer', description: 'Ongoing marketing services' },
  { value: 'WEBSITE', label: 'Website Project', description: 'One-time web development' },
  { value: 'AI_TOOLS', label: 'AI Tools', description: 'Automation & AI services' },
  { value: 'AMC', label: 'AMC', description: 'Annual maintenance contract' },
  { value: 'CONSULTING', label: 'Consulting', description: 'Strategy & consulting' },
  { value: 'TRAINING', label: 'Training', description: 'Training & workshops' },
] as const

export const BILLING_TYPES = [
  { value: 'MONTHLY', label: 'Monthly', days: 30 },
  { value: 'QUARTERLY', label: 'Quarterly', days: 90 },
  { value: 'HALF_YEARLY', label: 'Half Yearly', days: 180 },
  { value: 'ANNUAL', label: 'Annual', days: 365 },
  { value: 'ONE_TIME', label: 'One-time', days: null },
  { value: 'MILESTONE', label: 'Milestone-based', days: null },
] as const

// ============================================
// CLIENT TYPES (One-Time vs Recurring)
// ============================================

export const CLIENT_TYPES = [
  { value: 'RECURRING', label: 'Recurring', color: 'bg-emerald-100 text-emerald-700', description: 'Ongoing retainer client' },
  { value: 'ONE_TIME', label: 'One-Time', color: 'bg-orange-100 text-orange-700', description: 'Single project client' },
] as const

// ============================================
// WEB PROJECT PHASES
// ============================================

export const WEB_PROJECT_PHASES = [
  { value: 'CONTENT', label: 'Content', order: 1, icon: 'file-text', color: 'bg-blue-100 text-blue-700', description: 'Content gathering and copywriting' },
  { value: 'DESIGN', label: 'Design', order: 2, icon: 'palette', color: 'bg-purple-100 text-purple-700', description: 'UI/UX design and mockups' },
  { value: 'MEDIA', label: 'Media', order: 3, icon: 'image', color: 'bg-pink-100 text-pink-700', description: 'Images, videos, and assets' },
  { value: 'DEVELOPMENT', label: 'Development', order: 4, icon: 'code', color: 'bg-emerald-100 text-emerald-700', description: 'Frontend and backend development' },
  { value: 'TESTING', label: 'Testing', order: 5, icon: 'check-circle', color: 'bg-amber-100 text-amber-700', description: 'QA and cross-browser testing' },
  { value: 'DEPLOYMENT', label: 'Deployment', order: 6, icon: 'rocket', color: 'bg-teal-100 text-teal-700', description: 'Go-live and final handoff' },
] as const

export const PHASE_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-slate-100 text-slate-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'SKIPPED', label: 'Skipped', color: 'bg-slate-100 text-slate-500' },
] as const

// ============================================
// MAINTENANCE CONTRACT TYPES
// ============================================

export const MAINTENANCE_CONTRACT_TYPES = [
  { value: 'MONTHLY_MAINTENANCE', label: 'Monthly Maintenance', description: 'Monthly website maintenance' },
  { value: 'ANNUAL_HOSTING', label: 'Annual Hosting', description: 'Yearly hosting fees' },
  { value: 'DOMAIN_RENEWAL', label: 'Domain Renewal', description: 'Domain registration renewal' },
] as const

export const MAINTENANCE_CONTRACT_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'EXPIRED', label: 'Expired', color: 'bg-red-100 text-red-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
  { value: 'RENEWED', label: 'Renewed', color: 'bg-blue-100 text-blue-700' },
] as const

// ============================================
// CLIENT ACCESS REQUEST
// ============================================

export const ACCESS_REQUEST_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-700' },
] as const

// ============================================
// CLIENT TEAM ROLES
// ============================================

export const CLIENT_TEAM_ROLES = [
  { value: 'ACCOUNT_MANAGER', label: 'Account Manager', isPrimary: true, departments: ['OPERATIONS'] },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', isPrimary: false, departments: ['OPERATIONS', 'WEB'] },
  { value: 'SEO_SPECIALIST', label: 'SEO Specialist', isPrimary: false, departments: ['SEO'] },
  { value: 'SEO_LEAD', label: 'SEO Lead', isPrimary: false, departments: ['SEO'] },
  { value: 'ADS_SPECIALIST', label: 'Ads Specialist', isPrimary: false, departments: ['ADS'] },
  { value: 'ADS_MANAGER', label: 'Ads Manager', isPrimary: false, departments: ['ADS'] },
  { value: 'SOCIAL_MANAGER', label: 'Social Media Manager', isPrimary: false, departments: ['SOCIAL'] },
  { value: 'SOCIAL_EXECUTIVE', label: 'Social Media Executive', isPrimary: false, departments: ['SOCIAL'] },
  { value: 'CONTENT_WRITER', label: 'Content Writer', isPrimary: false, departments: ['CONTENT', 'SEO', 'SOCIAL'] },
  { value: 'CONTENT_LEAD', label: 'Content Lead', isPrimary: false, departments: ['CONTENT'] },
  { value: 'DESIGNER', label: 'Graphic Designer', isPrimary: false, departments: ['DESIGN'] },
  { value: 'SENIOR_DESIGNER', label: 'Senior Designer', isPrimary: false, departments: ['DESIGN'] },
  { value: 'VIDEO_EDITOR', label: 'Video Editor', isPrimary: false, departments: ['VIDEO', 'DESIGN'] },
  { value: 'WEB_DEVELOPER', label: 'Web Developer', isPrimary: false, departments: ['WEB'] },
  { value: 'FRONTEND_DEV', label: 'Frontend Developer', isPrimary: false, departments: ['WEB'] },
  { value: 'BACKEND_DEV', label: 'Backend Developer', isPrimary: false, departments: ['WEB'] },
  { value: 'AUTOMATION_ENGINEER', label: 'Automation Engineer', isPrimary: false, departments: ['AI', 'WEB'] },
  { value: 'STRATEGIST', label: 'Strategist', isPrimary: false, departments: ['OPERATIONS', 'SOCIAL', 'ADS'] },
] as const

// ============================================
// SERVICES & DELIVERABLES
// ============================================

export const SERVICES = [
  { value: 'SEO', label: 'SEO', category: 'Marketing', icon: 'search' },
  { value: 'LOCAL_SEO', label: 'Local SEO', category: 'Marketing', icon: 'map-pin' },
  { value: 'TECHNICAL_SEO', label: 'Technical SEO', category: 'Marketing', icon: 'settings' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media Management', category: 'Marketing', icon: 'share' },
  { value: 'CONTENT_CREATION', label: 'Content Creation', category: 'Marketing', icon: 'file-text' },
  { value: 'GOOGLE_ADS', label: 'Google Ads', category: 'Advertising', icon: 'target' },
  { value: 'META_ADS', label: 'Meta Ads (FB/IG)', category: 'Advertising', icon: 'facebook' },
  { value: 'LINKEDIN_ADS', label: 'LinkedIn Ads', category: 'Advertising', icon: 'linkedin' },
  { value: 'YOUTUBE_ADS', label: 'YouTube Ads', category: 'Advertising', icon: 'youtube' },
  { value: 'PPC', label: 'PPC Management', category: 'Advertising', icon: 'dollar-sign' },
  { value: 'WEBSITE_DEV', label: 'Website Development', category: 'Development', icon: 'code' },
  { value: 'LANDING_PAGE', label: 'Landing Pages', category: 'Development', icon: 'layout' },
  { value: 'ECOMMERCE', label: 'E-commerce Development', category: 'Development', icon: 'shopping-cart' },
  { value: 'WEB_MAINTENANCE', label: 'Website Maintenance', category: 'Development', icon: 'tool' },
  { value: 'GBP_MANAGEMENT', label: 'Google Business Profile', category: 'Local', icon: 'map' },
  { value: 'REPUTATION_MGMT', label: 'Reputation Management', category: 'Local', icon: 'star' },
  { value: 'EMAIL_MARKETING', label: 'Email Marketing', category: 'Marketing', icon: 'mail' },
  { value: 'WHATSAPP_MARKETING', label: 'WhatsApp Marketing', category: 'Marketing', icon: 'message-circle' },
  { value: 'INFLUENCER', label: 'Influencer Marketing', category: 'Marketing', icon: 'users' },
  { value: 'VIDEO_PRODUCTION', label: 'Video Production', category: 'Creative', icon: 'video' },
  { value: 'GRAPHIC_DESIGN', label: 'Graphic Design', category: 'Creative', icon: 'image' },
  { value: 'BRANDING', label: 'Branding & Identity', category: 'Creative', icon: 'award' },
  { value: 'AUTOMATION', label: 'Marketing Automation', category: 'Automation', icon: 'zap' },
  { value: 'CHATBOT', label: 'Chatbot Development', category: 'Automation', icon: 'message-square' },
  { value: 'CRM_SETUP', label: 'CRM Setup', category: 'Automation', icon: 'database' },
  { value: 'ANALYTICS', label: 'Analytics & Reporting', category: 'Strategy', icon: 'bar-chart' },
  { value: 'CONSULTING', label: 'Digital Strategy Consulting', category: 'Strategy', icon: 'compass' },
] as const

// ============================================
// PAYMENT & BILLING
// ============================================

export const PAYMENT_STATUS = [
  { value: 'DONE', label: 'Paid', color: 'bg-emerald-100 text-emerald-800', icon: 'check-circle' },
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: 'clock' },
  { value: 'PARTIAL', label: 'Partial', color: 'bg-blue-100 text-blue-800', icon: 'pie-chart' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-800', icon: 'alert-circle' },
  { value: 'IN_PROCESS', label: 'In Process', color: 'bg-purple-100 text-purple-800', icon: 'loader' },
  { value: 'HOLD', label: 'On Hold', color: 'bg-slate-100 text-slate-800', icon: 'pause-circle' },
  { value: 'DISPUTED', label: 'Disputed', color: 'bg-orange-100 text-orange-800', icon: 'alert-triangle' },
  { value: 'REFUNDED', label: 'Refunded', color: 'bg-pink-100 text-pink-800', icon: 'rotate-ccw' },
  { value: 'WILL_PAY', label: 'Will Pay', color: 'bg-cyan-100 text-cyan-800', icon: 'calendar' },
  { value: 'REMIND', label: 'Remind', color: 'bg-indigo-100 text-indigo-800', icon: 'bell' },
  { value: 'CALL_NOT_PICKED', label: 'No Answer', color: 'bg-slate-100 text-slate-600', icon: 'phone-off' },
] as const

export const PAYMENT_TERMS = [
  { value: 'IMMEDIATE', label: 'Immediate', days: 0 },
  { value: 'ADVANCE', label: 'Advance', days: -7 },
  { value: 'NET_7', label: 'Net 7', days: 7 },
  { value: 'NET_15', label: 'Net 15', days: 15 },
  { value: 'NET_30', label: 'Net 30', days: 30 },
  { value: 'NET_45', label: 'Net 45', days: 45 },
  { value: 'NET_60', label: 'Net 60', days: 60 },
  { value: 'ON_DELIVERY', label: 'On Delivery', days: null },
  { value: 'MILESTONE', label: 'Milestone-based', days: null },
] as const

export const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'building' },
  { value: 'UPI', label: 'UPI', icon: 'smartphone' },
  { value: 'RAZORPAY', label: 'Razorpay', icon: 'credit-card' },
  { value: 'PAYPAL', label: 'PayPal', icon: 'globe' },
  { value: 'STRIPE', label: 'Stripe', icon: 'credit-card' },
  { value: 'CHEQUE', label: 'Cheque', icon: 'file-text' },
  { value: 'CASH', label: 'Cash', icon: 'dollar-sign' },
  { value: 'WIRE', label: 'Wire Transfer', icon: 'send' },
] as const

export const INVOICE_STATUS = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  { value: 'SENT', label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 'VIEWED', label: 'Viewed', color: 'bg-purple-100 text-purple-700' },
  { value: 'PAID', label: 'Paid', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'PARTIAL', label: 'Partial', color: 'bg-amber-100 text-amber-700' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
] as const

// ============================================
// RECURRING EXPENSES
// ============================================

export const EXPENSE_CATEGORIES = [
  { value: 'TOOLS', label: 'Tools & Software', icon: 'tool', examples: ['Canva', 'Semrush', 'Ahrefs'] },
  { value: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: 'repeat', examples: ['Adobe CC', 'Figma', 'Slack'] },
  { value: 'HOSTING', label: 'Hosting & Domains', icon: 'server', examples: ['AWS', 'GoDaddy', 'Cloudflare'] },
  { value: 'ADS_PLATFORM', label: 'Ad Platform Fees', icon: 'target', examples: ['Google Ads', 'Meta Business'] },
  { value: 'COMMUNICATION', label: 'Communication', icon: 'phone', examples: ['Zoom', 'WhatsApp Business'] },
  { value: 'PRODUCTIVITY', label: 'Productivity', icon: 'check-square', examples: ['Notion', 'Monday.com'] },
  { value: 'ANALYTICS', label: 'Analytics', icon: 'bar-chart', examples: ['Hotjar', 'Mixpanel'] },
  { value: 'STOCK_MEDIA', label: 'Stock Media', icon: 'image', examples: ['Shutterstock', 'Envato'] },
  { value: 'AI_TOOLS', label: 'AI Tools', icon: 'cpu', examples: ['OpenAI', 'Anthropic', 'Midjourney'] },
  { value: 'OFFICE', label: 'Office & Utilities', icon: 'home', examples: ['Rent', 'Electricity', 'Internet'] },
  { value: 'PAYROLL', label: 'Payroll & Benefits', icon: 'users', examples: ['Salaries', 'PF', 'Insurance'] },
  { value: 'MARKETING', label: 'Marketing', icon: 'megaphone', examples: ['Ads for agency', 'Events'] },
  { value: 'LEGAL', label: 'Legal & Compliance', icon: 'shield', examples: ['GST', 'Legal fees'] },
  { value: 'BANKING', label: 'Banking & Finance', icon: 'credit-card', examples: ['Bank charges', 'Payment gateway'] },
  { value: 'TRAVEL', label: 'Travel & Conveyance', icon: 'map', examples: ['Client visits', 'Fuel'] },
  { value: 'OTHER', label: 'Other', icon: 'more-horizontal', examples: [] },
] as const

export const EXPENSE_FREQUENCY = [
  { value: 'DAILY', label: 'Daily', multiplier: 30 },
  { value: 'WEEKLY', label: 'Weekly', multiplier: 4 },
  { value: 'MONTHLY', label: 'Monthly', multiplier: 1 },
  { value: 'QUARTERLY', label: 'Quarterly', multiplier: 0.33 },
  { value: 'HALF_YEARLY', label: 'Half Yearly', multiplier: 0.167 },
  { value: 'ANNUAL', label: 'Annual', multiplier: 0.083 },
  { value: 'ONE_TIME', label: 'One-time', multiplier: null },
] as const

export const EXPENSE_STATUS = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'PAUSED', label: 'Paused', color: 'bg-amber-100 text-amber-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  { value: 'PENDING_RENEWAL', label: 'Pending Renewal', color: 'bg-blue-100 text-blue-700' },
  { value: 'EXPIRED', label: 'Expired', color: 'bg-slate-100 text-slate-500' },
] as const

// ============================================
// TASK MANAGEMENT
// ============================================

export const TASK_STATUS = [
  { value: 'TODO', label: 'To Do', color: 'bg-slate-100 text-slate-700', icon: 'circle' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: 'play-circle' },
  { value: 'REVIEW', label: 'In Review', color: 'bg-purple-100 text-purple-700', icon: 'eye' },
  { value: 'REVISION', label: 'Revision', color: 'bg-amber-100 text-amber-700', icon: 'edit' },
  { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 text-red-700', icon: 'x-circle' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: 'check-circle' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-100 text-slate-500', icon: 'slash' },
] as const

export const TASK_PRIORITY = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-700', weight: 1 },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700', weight: 2 },
  { value: 'HIGH', label: 'High', color: 'bg-amber-100 text-amber-700', weight: 3 },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700', weight: 4 },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-200 text-red-800', weight: 5 },
] as const

export const TASK_TYPES = [
  { value: 'TASK', label: 'Task', description: 'Standard task' },
  { value: 'RECURRING', label: 'Recurring', description: 'Repeating task' },
  { value: 'SUBTASK', label: 'Subtask', description: 'Part of larger task' },
  { value: 'MILESTONE', label: 'Milestone', description: 'Project milestone' },
  { value: 'BUG', label: 'Bug', description: 'Bug/issue to fix' },
  { value: 'FEATURE', label: 'Feature', description: 'New feature request' },
] as const

// ============================================
// SALES & CRM
// ============================================

export const LEAD_STAGES = [
  { value: 'NEW', label: 'New Lead', color: 'bg-slate-100 text-slate-700', order: 1 },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-blue-100 text-blue-700', order: 2 },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-100 text-purple-700', order: 3 },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-amber-100 text-amber-700', order: 4 },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-100 text-orange-700', order: 5 },
  { value: 'WON', label: 'Won', color: 'bg-emerald-100 text-emerald-700', order: 6 },
  { value: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-700', order: 7 },
  { value: 'NURTURING', label: 'Nurturing', color: 'bg-cyan-100 text-cyan-700', order: 8 },
] as const

// Simplified 4-stage pipeline for streamlined sales workflow
export const LEAD_STAGES_SIMPLE = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-700', order: 1 },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700', order: 2 },
  { value: 'NEGOTIATING', label: 'Negotiating', color: 'bg-purple-100 text-purple-700', order: 3 },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-700', order: 4 },
] as const

// Mapping from old 9-stage pipeline to simplified 4-stage
export const STAGE_MAPPING: Record<string, string> = {
  'LEAD_RECEIVED': 'NEW',
  'RFP_SENT': 'CONTACTED',
  'RFP_COMPLETED': 'CONTACTED',
  'PROPOSAL_SHARED': 'NEGOTIATING',
  'FOLLOW_UP_ONGOING': 'NEGOTIATING',
  'MEETING_SCHEDULED': 'NEGOTIATING',
  'PROPOSAL_DISCUSSION': 'NEGOTIATING',
  'WON': 'CLOSED',
  'LOST': 'CLOSED',
}

export const LEAD_SOURCES = [
  { value: 'WEBSITE', label: 'Website Form' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'GOOGLE_ADS', label: 'Google Ads' },
  { value: 'META_ADS', label: 'Meta Ads' },
  { value: 'COLD_OUTREACH', label: 'Cold Outreach' },
  { value: 'EVENT', label: 'Event/Conference' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'UPWORK', label: 'Upwork' },
  { value: 'CLUTCH', label: 'Clutch' },
  { value: 'DIRECTORY', label: 'Directory Listing' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'EXISTING_CLIENT', label: 'Existing Client' },
  { value: 'GOOGLE_ORGANIC', label: 'Google Organic' },
  { value: 'OTHER', label: 'Other' },
] as const

export const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Call', icon: 'phone', durationRequired: true },
  { value: 'EMAIL', label: 'Email', icon: 'mail', durationRequired: false },
  { value: 'MEETING', label: 'Meeting', icon: 'users', durationRequired: true },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: 'message-circle', durationRequired: false },
  { value: 'NOTE', label: 'Note', icon: 'file-text', durationRequired: false },
  { value: 'DEMO', label: 'Demo', icon: 'monitor', durationRequired: true },
  { value: 'PROPOSAL', label: 'Proposal', icon: 'file', durationRequired: false },
  { value: 'FOLLOW_UP', label: 'Follow Up', icon: 'repeat', durationRequired: false },
  { value: 'LINKEDIN', label: 'LinkedIn Message', icon: 'linkedin', durationRequired: false },
  { value: 'VIDEO_CALL', label: 'Video Call', icon: 'video', durationRequired: true },
] as const

export const ACTIVITY_OUTCOMES = [
  { value: 'POSITIVE', label: 'Positive', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'NEUTRAL', label: 'Neutral', color: 'bg-slate-100 text-slate-700' },
  { value: 'NEGATIVE', label: 'Negative', color: 'bg-red-100 text-red-700' },
  { value: 'NO_RESPONSE', label: 'No Response', color: 'bg-amber-100 text-amber-700' },
  { value: 'RESCHEDULED', label: 'Rescheduled', color: 'bg-blue-100 text-blue-700' },
  { value: 'INTERESTED', label: 'Interested', color: 'bg-green-100 text-green-700' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', color: 'bg-red-100 text-red-700' },
  { value: 'CALLBACK', label: 'Callback Requested', color: 'bg-purple-100 text-purple-700' },
] as const

export const LOST_REASONS = [
  { value: 'BUDGET', label: 'Budget Constraints' },
  { value: 'COMPETITOR', label: 'Went with Competitor' },
  { value: 'TIMING', label: 'Bad Timing' },
  { value: 'NO_NEED', label: 'No Longer Needed' },
  { value: 'INTERNAL', label: 'Doing In-house' },
  { value: 'NO_RESPONSE', label: 'No Response' },
  { value: 'PRICE', label: 'Price Too High' },
  { value: 'SCOPE', label: 'Scope Mismatch' },
  { value: 'OTHER', label: 'Other' },
] as const

// ============================================
// HR & HIRING
// ============================================

export const CANDIDATE_STATUS = [
  { value: 'APPLICATION', label: 'Application', color: 'bg-slate-100 text-slate-700' },
  { value: 'SCREENING', label: 'Screening', color: 'bg-blue-100 text-blue-700' },
  { value: 'INTERVIEW', label: 'Interview', color: 'bg-purple-100 text-purple-700' },
  { value: 'TEST_TASK', label: 'Test Task', color: 'bg-amber-100 text-amber-700' },
  { value: 'HR_ROUND', label: 'HR Round', color: 'bg-pink-100 text-pink-700' },
  { value: 'OFFER', label: 'Offer', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  { value: 'JOINED', label: 'Joined', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-slate-100 text-slate-500' },
  { value: 'WITHDREW', label: 'Withdrew', color: 'bg-slate-100 text-slate-500' },
] as const

export const CANDIDATE_SOURCES = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'NAUKRI', label: 'Naukri' },
  { value: 'INDEED', label: 'Indeed' },
  { value: 'REFERRAL', label: 'Employee Referral' },
  { value: 'DIRECT', label: 'Direct Application' },
  { value: 'CAMPUS', label: 'Campus Hiring' },
  { value: 'AGENCY', label: 'Recruitment Agency' },
  { value: 'INTERNSHALA', label: 'Internshala' },
  { value: 'ANGELIST', label: 'AngelList' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'JOB_FAIR', label: 'Job Fair' },
  { value: 'OTHER', label: 'Other' },
] as const

export const POSITIONS = [
  { value: 'SEO_SPECIALIST', label: 'SEO Specialist', department: 'SEO' },
  { value: 'SEO_EXECUTIVE', label: 'SEO Executive', department: 'SEO' },
  { value: 'SEO_LEAD', label: 'SEO Lead', department: 'SEO' },
  { value: 'CONTENT_WRITER', label: 'Content Writer', department: 'CONTENT' },
  { value: 'SENIOR_CONTENT_WRITER', label: 'Senior Content Writer', department: 'CONTENT' },
  { value: 'CONTENT_LEAD', label: 'Content Lead', department: 'CONTENT' },
  { value: 'ADS_MANAGER', label: 'Ads Manager', department: 'ADS' },
  { value: 'ADS_EXECUTIVE', label: 'Ads Executive', department: 'ADS' },
  { value: 'SOCIAL_MEDIA_MANAGER', label: 'Social Media Manager', department: 'SOCIAL' },
  { value: 'SOCIAL_MEDIA_EXECUTIVE', label: 'Social Media Executive', department: 'SOCIAL' },
  { value: 'WEB_DEVELOPER', label: 'Web Developer', department: 'WEB' },
  { value: 'FRONTEND_DEVELOPER', label: 'Frontend Developer', department: 'WEB' },
  { value: 'BACKEND_DEVELOPER', label: 'Backend Developer', department: 'WEB' },
  { value: 'FULLSTACK_DEVELOPER', label: 'Full Stack Developer', department: 'WEB' },
  { value: 'GRAPHIC_DESIGNER', label: 'Graphic Designer', department: 'DESIGN' },
  { value: 'SENIOR_DESIGNER', label: 'Senior Designer', department: 'DESIGN' },
  { value: 'UI_UX_DESIGNER', label: 'UI/UX Designer', department: 'DESIGN' },
  { value: 'VIDEO_EDITOR', label: 'Video Editor', department: 'VIDEO' },
  { value: 'MOTION_DESIGNER', label: 'Motion Designer', department: 'VIDEO' },
  { value: 'ACCOUNT_MANAGER', label: 'Account Manager', department: 'OPERATIONS' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', department: 'OPERATIONS' },
  { value: 'OPERATIONS_LEAD', label: 'Operations Lead', department: 'OPERATIONS' },
  { value: 'BUSINESS_DEVELOPMENT', label: 'Business Development', department: 'SALES' },
  { value: 'SALES_EXECUTIVE', label: 'Sales Executive', department: 'SALES' },
  { value: 'SALES_MANAGER', label: 'Sales Manager', department: 'SALES' },
  { value: 'HR_EXECUTIVE', label: 'HR Executive', department: 'HR' },
  { value: 'HR_MANAGER', label: 'HR Manager', department: 'HR' },
  { value: 'RECRUITER', label: 'Recruiter', department: 'HR' },
  { value: 'ACCOUNTS_EXECUTIVE', label: 'Accounts Executive', department: 'ACCOUNTS' },
  { value: 'ACCOUNTS_MANAGER', label: 'Accounts Manager', department: 'ACCOUNTS' },
  { value: 'AUTOMATION_ENGINEER', label: 'Automation Engineer', department: 'AI' },
  { value: 'AI_SPECIALIST', label: 'AI Specialist', department: 'AI' },
] as const

export const EXPERIENCE_LEVELS = [
  { value: 'FRESHER', label: 'Fresher (0-1 years)', minYears: 0, maxYears: 1 },
  { value: 'JUNIOR', label: 'Junior (1-3 years)', minYears: 1, maxYears: 3 },
  { value: 'MID', label: 'Mid-Level (3-5 years)', minYears: 3, maxYears: 5 },
  { value: 'SENIOR', label: 'Senior (5-8 years)', minYears: 5, maxYears: 8 },
  { value: 'LEAD', label: 'Lead (8+ years)', minYears: 8, maxYears: null },
] as const

// TODO: These leave types are hardcoded defaults. They should be configurable
// via admin settings (SystemSetting model, category: 'leave_policy', key: 'leave_types').
// An admin UI at /settings/leave-policy should allow adding/removing types and
// adjusting maxDays, paidLeave, etc. Until then, these serve as fallback defaults.
export const LEAVE_TYPES = [
  { value: 'CASUAL', label: 'Casual Leave', paidLeave: true, maxDays: 12 },
  { value: 'SICK', label: 'Sick Leave', paidLeave: true, maxDays: 6 },
  { value: 'EARNED', label: 'Earned Leave', paidLeave: true, maxDays: 15 },
  { value: 'UNPAID', label: 'Unpaid Leave', paidLeave: false, maxDays: null },
  { value: 'MATERNITY', label: 'Maternity Leave', paidLeave: true, maxDays: 182 },
  { value: 'PATERNITY', label: 'Paternity Leave', paidLeave: true, maxDays: 15 },
  { value: 'BEREAVEMENT', label: 'Bereavement Leave', paidLeave: true, maxDays: 5 },
  { value: 'COMP_OFF', label: 'Compensatory Off', paidLeave: true, maxDays: null },
  { value: 'WFH', label: 'Work From Home', paidLeave: true, maxDays: null },
  { value: 'HALF_DAY', label: 'Half Day', paidLeave: true, maxDays: null },
] as const

/**
 * Fetches leave policy from SystemSetting if available, otherwise returns LEAVE_TYPES defaults.
 * Usage: const types = await getLeavePolicy(prisma)
 */
export async function getLeavePolicy(prismaClient: { systemSetting: { findUnique: (args: { where: { key: string } }) => Promise<{ value: string } | null> } }) {
  try {
    const setting = await prismaClient.systemSetting.findUnique({
      where: { key: 'leave_types' }
    })
    if (setting?.value) {
      return JSON.parse(setting.value) as typeof LEAVE_TYPES[number][]
    }
  } catch {
    // Fall back to defaults
  }
  return [...LEAVE_TYPES]
}

// ============================================
// ASSETS & VENDORS
// ============================================

export const ASSET_TYPES = [
  { value: 'LAPTOP', label: 'Laptop', depreciationYears: 3 },
  { value: 'DESKTOP', label: 'Desktop', depreciationYears: 4 },
  { value: 'MONITOR', label: 'Monitor', depreciationYears: 5 },
  { value: 'KEYBOARD', label: 'Keyboard', depreciationYears: 2 },
  { value: 'MOUSE', label: 'Mouse', depreciationYears: 2 },
  { value: 'HEADSET', label: 'Headset', depreciationYears: 2 },
  { value: 'WEBCAM', label: 'Webcam', depreciationYears: 3 },
  { value: 'PHONE', label: 'Mobile Phone', depreciationYears: 2 },
  { value: 'TABLET', label: 'Tablet', depreciationYears: 3 },
  { value: 'CHARGER', label: 'Charger/Adapter', depreciationYears: 2 },
  { value: 'HDD', label: 'External HDD/SSD', depreciationYears: 3 },
  { value: 'FURNITURE', label: 'Furniture', depreciationYears: 10 },
  { value: 'PRINTER', label: 'Printer', depreciationYears: 5 },
  { value: 'ROUTER', label: 'Router/Network', depreciationYears: 4 },
  { value: 'OTHER', label: 'Other', depreciationYears: 3 },
] as const

export const ASSET_CONDITIONS = [
  { value: 'NEW', label: 'New', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'EXCELLENT', label: 'Excellent', color: 'bg-blue-100 text-blue-700' },
  { value: 'GOOD', label: 'Good', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'FAIR', label: 'Fair', color: 'bg-amber-100 text-amber-700' },
  { value: 'POOR', label: 'Poor', color: 'bg-orange-100 text-orange-700' },
  { value: 'DAMAGED', label: 'Damaged', color: 'bg-red-100 text-red-700' },
] as const

export const ASSET_STATUS = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'MAINTENANCE', label: 'In Maintenance', color: 'bg-amber-100 text-amber-700' },
  { value: 'REPAIR', label: 'Under Repair', color: 'bg-orange-100 text-orange-700' },
  { value: 'RETIRED', label: 'Retired', color: 'bg-slate-100 text-slate-700' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-700' },
] as const

export const ASSET_BRANDS = [
  { value: 'APPLE', label: 'Apple' },
  { value: 'DELL', label: 'Dell' },
  { value: 'HP', label: 'HP' },
  { value: 'LENOVO', label: 'Lenovo' },
  { value: 'ASUS', label: 'Asus' },
  { value: 'ACER', label: 'Acer' },
  { value: 'SAMSUNG', label: 'Samsung' },
  { value: 'LG', label: 'LG' },
  { value: 'LOGITECH', label: 'Logitech' },
  { value: 'MICROSOFT', label: 'Microsoft' },
  { value: 'REALME', label: 'Realme' },
  { value: 'BOAT', label: 'boAt' },
  { value: 'ONEPLUS', label: 'OnePlus' },
  { value: 'XIAOMI', label: 'Xiaomi' },
  { value: 'OTHER', label: 'Other' },
] as const

// Device request types (subset of assets that can be requested)
export const DEVICE_REQUEST_TYPES = [
  { value: 'LAPTOP', label: 'Laptop' },
  { value: 'DESKTOP', label: 'Desktop' },
  { value: 'MONITOR', label: 'Monitor' },
  { value: 'KEYBOARD', label: 'Keyboard' },
  { value: 'MOUSE', label: 'Mouse' },
  { value: 'HEADSET', label: 'Headset' },
  { value: 'WEBCAM', label: 'Webcam' },
  { value: 'PHONE', label: 'Mobile Phone' },
  { value: 'CHARGER', label: 'Charger/Adapter' },
  { value: 'OTHER', label: 'Other' },
] as const

export const DEVICE_REQUEST_REASONS = [
  { value: 'NEW_JOINER', label: 'New Joiner', description: 'Device for new employee' },
  { value: 'UPGRADE', label: 'Upgrade', description: 'Upgrading existing device' },
  { value: 'REPLACEMENT', label: 'Replacement', description: 'Replacing damaged/lost device' },
  { value: 'ADDITIONAL', label: 'Additional', description: 'Need additional device' },
  { value: 'WFH', label: 'Work From Home', description: 'Device for remote work' },
  { value: 'PROJECT', label: 'Project Requirement', description: 'Specific project needs' },
] as const

export const DEVICE_REQUEST_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'RETURNED', label: 'Returned', color: 'bg-slate-100 text-slate-700' },
] as const

export const DEVICE_RETURN_REASONS = [
  { value: 'RESIGNATION', label: 'Resignation' },
  { value: 'UPGRADE', label: 'Device Upgrade' },
  { value: 'NOT_NEEDED', label: 'No Longer Needed' },
  { value: 'DAMAGED', label: 'Damaged/Repair' },
  { value: 'TERMINATION', label: 'Termination' },
  { value: 'OTHER', label: 'Other' },
] as const

export const VENDOR_CATEGORIES = [
  { value: 'CONTENT_WRITING', label: 'Content Writing' },
  { value: 'GRAPHIC_DESIGN', label: 'Graphic Design' },
  { value: 'VIDEO_PRODUCTION', label: 'Video Production' },
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'SEO_SERVICES', label: 'SEO Services' },
  { value: 'ADS_MANAGEMENT', label: 'Ads Management' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'TRANSLATION', label: 'Translation' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
  { value: 'LEGAL', label: 'Legal Services' },
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'HR_SERVICES', label: 'HR Services' },
  { value: 'PRINTING', label: 'Printing & Production' },
  { value: 'VOICE_OVER', label: 'Voice Over' },
  { value: 'OTHER', label: 'Other' },
] as const

export const VENDOR_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'NDA_SIGNED', label: 'NDA Signed', color: 'bg-blue-100 text-blue-700' },
  { value: 'CONTRACT_SIGNED', label: 'Contract Signed', color: 'bg-purple-100 text-purple-700' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-slate-100 text-slate-700' },
  { value: 'TERMINATED', label: 'Terminated', color: 'bg-red-100 text-red-700' },
] as const

// ============================================
// MEETINGS & COMMUNICATION
// ============================================

export const MEETING_TYPES = [
  { value: 'HUDDLE', label: 'Daily Huddle', duration: 15, recurring: true },
  { value: 'TACTICAL', label: 'Tactical Meeting', duration: 60, recurring: true },
  { value: 'STRATEGIC', label: 'Strategic Meeting', duration: 120, recurring: false },
  { value: 'ONE_ON_ONE', label: '1:1 Meeting', duration: 30, recurring: true },
  { value: 'CLIENT_CALL', label: 'Client Call', duration: 45, recurring: false },
  { value: 'DISCOVERY', label: 'Discovery Call', duration: 30, recurring: false },
  { value: 'DEMO', label: 'Demo Call', duration: 45, recurring: false },
  { value: 'PROPOSAL', label: 'Proposal Discussion', duration: 60, recurring: false },
  { value: 'TRAINING', label: 'Training Session', duration: 60, recurring: false },
  { value: 'TEAM_SYNC', label: 'Team Sync', duration: 30, recurring: true },
  { value: 'REVIEW', label: 'Review Meeting', duration: 60, recurring: false },
  { value: 'KICKOFF', label: 'Project Kickoff', duration: 60, recurring: false },
] as const

export const COMMUNICATION_CHANNELS = [
  { value: 'EMAIL', label: 'Email', icon: 'mail' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: 'message-circle' },
  { value: 'PHONE', label: 'Phone Call', icon: 'phone' },
  { value: 'SLACK', label: 'Slack', icon: 'hash' },
  { value: 'ZOOM', label: 'Zoom', icon: 'video' },
  { value: 'GOOGLE_MEET', label: 'Google Meet', icon: 'video' },
  { value: 'TEAMS', label: 'Microsoft Teams', icon: 'video' },
  { value: 'IN_PERSON', label: 'In Person', icon: 'users' },
  { value: 'PORTAL', label: 'Client Portal', icon: 'layout' },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: 'linkedin' },
] as const

// ============================================
// GOAL HIERARCHY (for Paperclip-style alignment)
// ============================================

// Paperclip-style goal hierarchy (tasks trace to company mission)
export const GOAL_LEVELS = [
  { value: 'MISSION', label: 'Mission', description: 'Company mission - highest level purpose' },
  { value: 'STRATEGIC', label: 'Strategic', description: 'Strategic objectives aligned to mission' },
  { value: 'DEPARTMENTAL', label: 'Departmental', description: 'Department-level goals' },
  { value: 'TEAM', label: 'Team', description: 'Team-specific goals' },
  { value: 'INDIVIDUAL', label: 'Individual', description: 'Personal goals' },
  { value: 'TASK', label: 'Task', description: 'Task-level goal links' },
] as const

export const GOAL_STATUS = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-slate-100 text-slate-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'ON_TRACK', label: 'On Track', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'AT_RISK', label: 'At Risk', color: 'bg-amber-100 text-amber-700' },
  { value: 'BEHIND', label: 'Behind', color: 'bg-red-100 text-red-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-100 text-slate-500' },
] as const

// ============================================
// QUARTERLY GOAL CATEGORIES
// ============================================

export const GOAL_CATEGORIES = [
  { value: 'CLIENT', label: 'Client Goals', description: 'Individual client goals to achieve this quarter', icon: '👤', clientFacing: true },
  { value: 'LEARNING', label: 'Learning Goal', description: 'Learning plan for the next 3 months', icon: '📚', clientFacing: false },
  { value: 'SKILL', label: 'Skill Goal', description: 'New tools to implement and skills to acquire that benefit the agency', icon: '🛠️', clientFacing: false },
  { value: 'SALES', label: 'Sales Goal', description: 'New clients to talk to regarding upsell - services or AI tools', icon: '💰', clientFacing: false },
  { value: 'CLIENT_SATISFACTION', label: 'Client Satisfaction Goal', description: 'Target NPS score for your clients', icon: '⭐', clientFacing: false },
  { value: 'PROCESS', label: 'Process Improvement', description: 'Improve internal processes and workflows', icon: '⚙️', clientFacing: false },
  { value: 'RECRUITMENT', label: 'Recruitment Goal', description: 'Hiring targets and talent acquisition', icon: '🤝', clientFacing: false },
  { value: 'COMPLIANCE', label: 'Compliance Goal', description: 'Regulatory and policy compliance targets', icon: '📋', clientFacing: false },
  { value: 'REPORTING', label: 'Reporting Goal', description: 'Financial reporting and audit targets', icon: '📊', clientFacing: false },
  { value: 'TEAM_BUILDING', label: 'Team Building', description: 'Team engagement and culture initiatives', icon: '👥', clientFacing: false },
] as const

// Client-facing roles get these goal categories
export const CLIENT_ROLE_CATEGORIES = ['CLIENT', 'LEARNING', 'SKILL', 'SALES', 'CLIENT_SATISFACTION'] as const

// Role-based default goal categories (non-client-facing roles)
export const ROLE_DEFAULT_GOALS: Record<string, Array<{ category: string; title: string; description: string; unit?: string; targetValue?: number }>> = {
  HR: [
    { category: 'RECRUITMENT', title: 'Hiring Target', description: 'Number of positions to fill this quarter', unit: 'positions', targetValue: 5 },
    { category: 'TEAM_BUILDING', title: 'Employee Engagement', description: 'Organize team engagement activities and maintain retention', unit: 'activities', targetValue: 3 },
    { category: 'COMPLIANCE', title: 'Policy Compliance', description: 'Ensure all HR policies are up to date and communicated', unit: '%', targetValue: 100 },
    { category: 'LEARNING', title: 'Learning Goal', description: 'HR certifications or training to complete', unit: 'courses' },
    { category: 'PROCESS', title: 'Process Improvement', description: 'Streamline HR workflows and documentation', unit: 'processes' },
  ],
  ACCOUNTS: [
    { category: 'REPORTING', title: 'Financial Reporting', description: 'Ensure timely and accurate financial reports', unit: 'reports', targetValue: 12 },
    { category: 'COMPLIANCE', title: 'Audit Compliance', description: 'Complete all quarterly audit requirements', unit: '%', targetValue: 100 },
    { category: 'PROCESS', title: 'Collections Target', description: 'Reduce outstanding receivables', unit: '%', targetValue: 95 },
    { category: 'LEARNING', title: 'Learning Goal', description: 'Accounting tools or compliance certifications', unit: 'courses' },
    { category: 'SKILL', title: 'Skill Goal', description: 'New accounting/finance tools to implement', unit: 'tools' },
  ],
  MANAGER: [
    { category: 'TEAM_BUILDING', title: 'Team Performance', description: 'Improve team productivity and morale', unit: '%', targetValue: 90 },
    { category: 'PROCESS', title: 'Process Optimization', description: 'Identify and improve department bottlenecks', unit: 'processes', targetValue: 3 },
    { category: 'SALES', title: 'Revenue Growth', description: 'Upsell or expand services for existing clients', unit: 'clients', targetValue: 5 },
    { category: 'LEARNING', title: 'Learning Goal', description: 'Leadership or management training', unit: 'courses' },
    { category: 'CLIENT_SATISFACTION', title: 'Department NPS', description: 'Maintain high client satisfaction across team', unit: 'NPS', targetValue: 8 },
  ],
  SALES: [
    { category: 'SALES', title: 'New Client Acquisition', description: 'Number of new clients to close this quarter', unit: 'clients', targetValue: 10 },
    { category: 'SALES', title: 'Upsell Revenue', description: 'Revenue from upselling to existing clients', unit: '₹', targetValue: 500000 },
    { category: 'LEARNING', title: 'Learning Goal', description: 'Sales methodology or tool training', unit: 'courses' },
    { category: 'SKILL', title: 'Skill Goal', description: 'New sales tools or CRM features to master', unit: 'tools' },
    { category: 'PROCESS', title: 'Pipeline Management', description: 'Maintain healthy sales pipeline', unit: 'leads', targetValue: 50 },
  ],
  SUPER_ADMIN: [
    { category: 'PROCESS', title: 'Strategic Initiative', description: 'Key business initiative for the quarter', unit: 'milestones' },
    { category: 'TEAM_BUILDING', title: 'Organization Growth', description: 'Scale team and organizational capacity', unit: 'hires' },
    { category: 'SALES', title: 'Revenue Target', description: 'Quarterly revenue target', unit: '₹' },
    { category: 'LEARNING', title: 'Learning Goal', description: 'Industry or leadership development', unit: 'courses' },
    { category: 'CLIENT_SATISFACTION', title: 'Overall NPS', description: 'Company-wide client satisfaction target', unit: 'NPS', targetValue: 8 },
  ],
} as const

// ============================================
// BUDGET THRESHOLDS (for alerts)
// ============================================

export const BUDGET_THRESHOLDS = {
  WARNING: 80,      // Alert at 80%
  SOFT_LIMIT: 90,   // Soft warning at 90%
  CRITICAL: 100,    // Block/pause at 100%
} as const

export const BUDGET_SCOPES = [
  { value: 'CLIENT', label: 'Client', description: 'Per-client budget' },
  { value: 'PROJECT', label: 'Project', description: 'Per-project budget' },
  { value: 'DEPARTMENT', label: 'Department', description: 'Department-wide budget' },
  { value: 'COMPANY', label: 'Company', description: 'Company-wide budget' },
] as const

export const BUDGET_PERIODS = [
  { value: 'MONTHLY', label: 'Monthly', months: 1 },
  { value: 'QUARTERLY', label: 'Quarterly', months: 3 },
  { value: 'HALF_YEARLY', label: 'Half Yearly', months: 6 },
  { value: 'YEARLY', label: 'Yearly', months: 12 },
  { value: 'PROJECT', label: 'Project Duration', months: null },
] as const

export const BUDGET_ALERT_LEVELS = [
  { value: 'NORMAL', label: 'Normal', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'WARNING', label: 'Warning', color: 'bg-amber-100 text-amber-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-orange-100 text-orange-700' },
  { value: 'EXCEEDED', label: 'Exceeded', color: 'bg-red-100 text-red-700' },
] as const

// Alias for EXPENSE_FREQUENCY (more descriptive name)
export const EXPENSE_FREQUENCIES = EXPENSE_FREQUENCY

// ============================================
// DURATIONS (for dropdowns)
// ============================================

export const CALL_DURATIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
] as const

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getOptionByValue<T extends readonly { value: string }[]>(
  options: T,
  value: string
): T[number] | undefined {
  return options.find(opt => opt.value === value)
}

export function getOptionsForSelect<T extends readonly { value: string; label: string }[]>(
  options: T
): Array<{ value: string; label: string }> {
  return options.map(({ value, label }) => ({ value, label }))
}

export function getColorForValue<T extends readonly { value: string; color?: string }[]>(
  options: T,
  value: string,
  defaultColor = 'bg-slate-100 text-slate-700'
): string {
  const option = options.find(opt => opt.value === value)
  return option?.color || defaultColor
}

export function getLabelForValue<T extends readonly { value: string; label: string }[]>(
  options: T,
  value: string,
  defaultLabel = 'Unknown'
): string {
  const option = options.find(opt => opt.value === value)
  return option?.label || defaultLabel
}

export function filterByDepartment<T extends readonly { value: string; departments?: readonly string[] }[]>(
  options: T,
  department: string
): T[number][] {
  return options.filter(opt => !opt.departments || opt.departments.includes(department))
}

// Type exports for TypeScript usage
export type UserRole = typeof USER_ROLES[number]['value']
export type Department = typeof DEPARTMENTS[number]['value']
export type EmployeeType = typeof EMPLOYEE_TYPES[number]['value']
export type ClientTier = typeof CLIENT_TIERS[number]['value']
export type ClientStatus = typeof CLIENT_STATUS[number]['value']
export type PaymentStatus = typeof PAYMENT_STATUS[number]['value']
export type TaskStatus = typeof TASK_STATUS[number]['value']
export type TaskPriority = typeof TASK_PRIORITY[number]['value']
export type LeadStage = typeof LEAD_STAGES[number]['value']
export type LeadStageSimple = typeof LEAD_STAGES_SIMPLE[number]['value']
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['value']
export type ExpenseFrequency = typeof EXPENSE_FREQUENCY[number]['value']
export type GoalLevel = typeof GOAL_LEVELS[number]['value']
export type GoalStatus = typeof GOAL_STATUS[number]['value']
