'use client'

import { useState } from 'react'

interface DailyTask {
  id: string
  timestamp: string
  taskName: string
  clientName: string
  allocatedBy: string
  status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED' | 'ON_HOLD'
  taskType: 'NEW_PAGE' | 'LANDING_PAGE' | 'MAINTENANCE' | 'BUG_FIX' | 'DESIGN' | 'OPTIMIZATION' | 'CONTENT_UPDATE' | 'RESPONSIVE_FIX' | 'SEO_IMPLEMENTATION' | 'FORM_INTEGRATION' | 'PLUGIN_SETUP' | 'API_INTEGRATION' | 'DATABASE_WORK' | 'SECURITY_FIX' | 'DEPLOYMENT'
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  rating: number | null
  inProgressTimestamp: string | null
  completedTimestamp: string | null
  deadline: string
  links: string[]
  remarks: string
  whatsappCommunicated: boolean
  duration: number | null // in minutes
}

const DAILY_TASKS: DailyTask[] = [
  {
    id: '1',
    timestamp: '2024-03-11T09:15:00',
    taskName: 'Homepage Hero Section',
    clientName: 'Apollo Hospitals',
    allocatedBy: 'Manish',
    status: 'IN_PROGRESS',
    taskType: 'NEW_PAGE',
    priority: 'HIGH',
    rating: null,
    inProgressTimestamp: '2024-03-11T09:30:00',
    completedTimestamp: null,
    deadline: '2024-03-12',
    links: ['https://figma.com/apollo-hero'],
    remarks: 'Client wants animated gradient background',
    whatsappCommunicated: true,
    duration: null
  },
  {
    id: '2',
    timestamp: '2024-03-11T09:00:00',
    taskName: 'Mobile Responsiveness Fix',
    clientName: 'MedPlus Clinics',
    allocatedBy: 'Manish',
    status: 'COMPLETED',
    taskType: 'RESPONSIVE_FIX',
    priority: 'URGENT',
    rating: 4,
    inProgressTimestamp: '2024-03-11T09:10:00',
    completedTimestamp: '2024-03-11T11:45:00',
    deadline: '2024-03-11',
    links: ['https://medplus.staging.com'],
    remarks: 'Fixed footer overlap on iPhone SE',
    whatsappCommunicated: true,
    duration: 155
  },
  {
    id: '3',
    timestamp: '2024-03-11T10:00:00',
    taskName: 'Contact Form Integration',
    clientName: 'CareConnect',
    allocatedBy: 'Shivam',
    status: 'REVIEW',
    taskType: 'FORM_INTEGRATION',
    priority: 'MEDIUM',
    rating: null,
    inProgressTimestamp: '2024-03-11T10:15:00',
    completedTimestamp: null,
    deadline: '2024-03-13',
    links: ['https://careconnect.staging.com/contact'],
    remarks: 'Waiting for API endpoint from backend',
    whatsappCommunicated: false,
    duration: null
  },
  {
    id: '4',
    timestamp: '2024-03-11T08:30:00',
    taskName: 'Image Optimization',
    clientName: 'HealthFirst Labs',
    allocatedBy: 'Manish',
    status: 'COMPLETED',
    taskType: 'OPTIMIZATION',
    priority: 'MEDIUM',
    rating: 5,
    inProgressTimestamp: '2024-03-11T08:45:00',
    completedTimestamp: '2024-03-11T10:30:00',
    deadline: '2024-03-11',
    links: ['https://healthfirst.com'],
    remarks: 'Reduced image sizes by 60%, PageSpeed improved to 78',
    whatsappCommunicated: true,
    duration: 105
  },
  {
    id: '5',
    timestamp: '2024-03-11T11:00:00',
    taskName: 'Service Pages - Cardiology',
    clientName: 'Akropolis Hospital',
    allocatedBy: 'Manish',
    status: 'PENDING',
    taskType: 'NEW_PAGE',
    priority: 'LOW',
    rating: null,
    inProgressTimestamp: null,
    completedTimestamp: null,
    deadline: '2024-03-14',
    links: ['https://figma.com/akropolis-services'],
    remarks: 'Content pending from client',
    whatsappCommunicated: false,
    duration: null
  },
  {
    id: '6',
    timestamp: '2024-03-11T09:45:00',
    taskName: 'Navigation Menu Update',
    clientName: 'Dr Anvesh',
    allocatedBy: 'Shivam',
    status: 'BLOCKED',
    taskType: 'MAINTENANCE',
    priority: 'HIGH',
    rating: null,
    inProgressTimestamp: '2024-03-11T10:00:00',
    completedTimestamp: null,
    deadline: '2024-03-12',
    links: [],
    remarks: 'Blocked - waiting for menu structure approval',
    whatsappCommunicated: true,
    duration: null
  },
  {
    id: '7',
    timestamp: '2024-03-11T14:00:00',
    taskName: 'Blog Section Design',
    clientName: 'Rapple Skincare',
    allocatedBy: 'Manish',
    status: 'PENDING',
    taskType: 'DESIGN',
    priority: 'LOW',
    rating: null,
    inProgressTimestamp: null,
    completedTimestamp: null,
    deadline: '2024-03-15',
    links: ['https://figma.com/rapple-blog'],
    remarks: '',
    whatsappCommunicated: false,
    duration: null
  },
  {
    id: '8',
    timestamp: '2024-03-11T13:30:00',
    taskName: 'SEO Meta Tags Update',
    clientName: 'Aitelz',
    allocatedBy: 'Aniket',
    status: 'IN_PROGRESS',
    taskType: 'SEO_IMPLEMENTATION',
    priority: 'MEDIUM',
    rating: null,
    inProgressTimestamp: '2024-03-11T13:45:00',
    completedTimestamp: null,
    deadline: '2024-03-11',
    links: ['https://aitelz.com'],
    remarks: 'Updating all page titles and descriptions',
    whatsappCommunicated: false,
    duration: null
  },
]

const TEAM_MEMBERS = ['All', 'Manish', 'Shivam', 'Aniket', 'Chitransh']

// ==================== WEB TASK CATEGORIES ====================
const TASK_CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'PAGE_DEV', label: 'Page Development', icon: '📄', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'DESIGN', label: 'Design & UI', icon: '🎨', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'BACKEND', label: 'Backend & Database', icon: '⚙️', color: 'bg-slate-800/50 text-slate-200' },
  { id: 'OPTIMIZATION', label: 'Optimization', icon: '⚡', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'MAINTENANCE', label: 'Maintenance', icon: '🔧', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'SEO', label: 'SEO & Analytics', icon: '🔍', color: 'bg-green-500/20 text-green-400' },
  { id: 'INTEGRATION', label: 'Integrations', icon: '🔗', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'DEVOPS', label: 'DevOps & Deployment', icon: '🚀', color: 'bg-indigo-500/20 text-indigo-400' },
]

// ==================== PAGE DEVELOPMENT ====================
const PAGE_DEV_TASKS = [
  { id: 'NEW_PAGE', label: 'New Page', icon: '📄', color: 'bg-blue-500/20 text-blue-400', category: 'PAGE_DEV' },
  { id: 'LANDING_PAGE', label: 'Landing Page', icon: '🎯', color: 'bg-purple-500/20 text-purple-400', category: 'PAGE_DEV' },
  { id: 'SERVICE_PAGE', label: 'Service Page', icon: '🏥', color: 'bg-teal-500/20 text-teal-400', category: 'PAGE_DEV' },
  { id: 'DOCTOR_PROFILE', label: 'Doctor Profile', icon: '👨‍⚕️', color: 'bg-green-500/20 text-green-400', category: 'PAGE_DEV' },
  { id: 'BLOG_POST', label: 'Blog Post Page', icon: '📝', color: 'bg-amber-500/20 text-amber-400', category: 'PAGE_DEV' },
  { id: 'CONTACT_PAGE', label: 'Contact Page', icon: '📞', color: 'bg-cyan-100 text-cyan-700', category: 'PAGE_DEV' },
  { id: 'GALLERY_PAGE', label: 'Gallery/Portfolio', icon: '🖼️', color: 'bg-pink-500/20 text-pink-400', category: 'PAGE_DEV' },
  { id: 'TESTIMONIAL_PAGE', label: 'Testimonials Page', icon: '⭐', color: 'bg-yellow-500/20 text-yellow-400', category: 'PAGE_DEV' },
  { id: 'FAQ_PAGE', label: 'FAQ Page', icon: '❓', color: 'bg-indigo-500/20 text-indigo-400', category: 'PAGE_DEV' },
  { id: 'CAREERS_PAGE', label: 'Careers Page', icon: '💼', color: 'bg-orange-500/20 text-orange-400', category: 'PAGE_DEV' },
  { id: 'PRICING_PAGE', label: 'Pricing Page', icon: '💰', color: 'bg-emerald-500/20 text-emerald-400', category: 'PAGE_DEV' },
  { id: 'THANK_YOU_PAGE', label: 'Thank You Page', icon: '🎉', color: 'bg-rose-100 text-rose-700', category: 'PAGE_DEV' },
]

// ==================== DESIGN & UI ====================
const DESIGN_TASKS = [
  { id: 'UI_DESIGN', label: 'UI Design', icon: '🎨', color: 'bg-pink-500/20 text-pink-400', category: 'DESIGN' },
  { id: 'RESPONSIVE_FIX', label: 'Responsive Fix', icon: '📱', color: 'bg-violet-100 text-violet-700', category: 'DESIGN' },
  { id: 'MOBILE_OPTIMIZATION', label: 'Mobile Optimization', icon: '📲', color: 'bg-purple-500/20 text-purple-400', category: 'DESIGN' },
  { id: 'LAYOUT_CHANGE', label: 'Layout Change', icon: '📐', color: 'bg-indigo-500/20 text-indigo-400', category: 'DESIGN' },
  { id: 'HERO_SECTION', label: 'Hero Section', icon: '🦸', color: 'bg-blue-500/20 text-blue-400', category: 'DESIGN' },
  { id: 'HEADER_FOOTER', label: 'Header/Footer', icon: '🔝', color: 'bg-slate-800/50 text-slate-200', category: 'DESIGN' },
  { id: 'NAVIGATION', label: 'Navigation Menu', icon: '☰', color: 'bg-teal-500/20 text-teal-400', category: 'DESIGN' },
  { id: 'TYPOGRAPHY', label: 'Typography Update', icon: '🔤', color: 'bg-amber-500/20 text-amber-400', category: 'DESIGN' },
  { id: 'COLOR_SCHEME', label: 'Color Scheme', icon: '🌈', color: 'bg-cyan-100 text-cyan-700', category: 'DESIGN' },
  { id: 'ANIMATION', label: 'Animation/Effects', icon: '✨', color: 'bg-fuchsia-100 text-fuchsia-700', category: 'DESIGN' },
  { id: 'ICON_UPDATE', label: 'Icon Update', icon: '🎭', color: 'bg-orange-500/20 text-orange-400', category: 'DESIGN' },
  { id: 'IMAGE_WORK', label: 'Image Work', icon: '🖼️', color: 'bg-green-500/20 text-green-400', category: 'DESIGN' },
]

// ==================== BACKEND & DATABASE ====================
const BACKEND_TASKS = [
  { id: 'DATABASE_WORK', label: 'Database Work', icon: '🗄️', color: 'bg-gray-800/50 text-gray-200', category: 'BACKEND' },
  { id: 'API_DEVELOPMENT', label: 'API Development', icon: '⚙️', color: 'bg-slate-800/50 text-slate-200', category: 'BACKEND' },
  { id: 'FORM_BACKEND', label: 'Form Backend', icon: '📝', color: 'bg-amber-500/20 text-amber-400', category: 'BACKEND' },
  { id: 'SERVER_CONFIG', label: 'Server Configuration', icon: '🖥️', color: 'bg-blue-500/20 text-blue-400', category: 'BACKEND' },
  { id: 'CRON_JOB', label: 'Cron Job Setup', icon: '⏰', color: 'bg-purple-500/20 text-purple-400', category: 'BACKEND' },
  { id: 'EMAIL_SETUP', label: 'Email Setup', icon: '📧', color: 'bg-cyan-100 text-cyan-700', category: 'BACKEND' },
  { id: 'AUTHENTICATION', label: 'Authentication', icon: '🔐', color: 'bg-red-500/20 text-red-400', category: 'BACKEND' },
  { id: 'PAYMENT_GATEWAY', label: 'Payment Gateway', icon: '💳', color: 'bg-emerald-500/20 text-emerald-400', category: 'BACKEND' },
  { id: 'DATA_MIGRATION', label: 'Data Migration', icon: '📦', color: 'bg-orange-500/20 text-orange-400', category: 'BACKEND' },
]

// ==================== OPTIMIZATION ====================
const OPTIMIZATION_TASKS = [
  { id: 'SPEED_OPTIMIZATION', label: 'Speed Optimization', icon: '⚡', color: 'bg-cyan-100 text-cyan-700', category: 'OPTIMIZATION' },
  { id: 'IMAGE_OPTIMIZATION', label: 'Image Optimization', icon: '🖼️', color: 'bg-green-500/20 text-green-400', category: 'OPTIMIZATION' },
  { id: 'CODE_OPTIMIZATION', label: 'Code Optimization', icon: '💻', color: 'bg-blue-500/20 text-blue-400', category: 'OPTIMIZATION' },
  { id: 'LAZY_LOADING', label: 'Lazy Loading', icon: '🔄', color: 'bg-purple-500/20 text-purple-400', category: 'OPTIMIZATION' },
  { id: 'CACHE_SETUP', label: 'Cache Setup', icon: '📦', color: 'bg-amber-500/20 text-amber-400', category: 'OPTIMIZATION' },
  { id: 'CDN_SETUP', label: 'CDN Setup', icon: '🌐', color: 'bg-indigo-500/20 text-indigo-400', category: 'OPTIMIZATION' },
  { id: 'MINIFICATION', label: 'CSS/JS Minification', icon: '📉', color: 'bg-teal-500/20 text-teal-400', category: 'OPTIMIZATION' },
  { id: 'CORE_WEB_VITALS', label: 'Core Web Vitals', icon: '📊', color: 'bg-orange-500/20 text-orange-400', category: 'OPTIMIZATION' },
]

// ==================== MAINTENANCE ====================
const MAINTENANCE_TASKS = [
  { id: 'MAINTENANCE', label: 'General Maintenance', icon: '🔧', color: 'bg-slate-800/50 text-slate-200', category: 'MAINTENANCE' },
  { id: 'BUG_FIX', label: 'Bug Fix', icon: '🐛', color: 'bg-red-500/20 text-red-400', category: 'MAINTENANCE' },
  { id: 'CONTENT_UPDATE', label: 'Content Update', icon: '✏️', color: 'bg-orange-500/20 text-orange-400', category: 'MAINTENANCE' },
  { id: 'BROKEN_LINKS', label: 'Fix Broken Links', icon: '🔗', color: 'bg-amber-500/20 text-amber-400', category: 'MAINTENANCE' },
  { id: 'PLUGIN_UPDATE', label: 'Plugin Update', icon: '🔌', color: 'bg-teal-500/20 text-teal-400', category: 'MAINTENANCE' },
  { id: 'THEME_UPDATE', label: 'Theme Update', icon: '🎨', color: 'bg-pink-500/20 text-pink-400', category: 'MAINTENANCE' },
  { id: 'WP_UPDATE', label: 'WordPress Update', icon: '📦', color: 'bg-blue-500/20 text-blue-400', category: 'MAINTENANCE' },
  { id: 'BACKUP', label: 'Backup', icon: '💾', color: 'bg-green-500/20 text-green-400', category: 'MAINTENANCE' },
  { id: 'SECURITY_FIX', label: 'Security Fix', icon: '🔒', color: 'bg-rose-100 text-rose-700', category: 'MAINTENANCE' },
  { id: 'ERROR_FIX', label: 'Error/404 Fix', icon: '⚠️', color: 'bg-yellow-500/20 text-yellow-400', category: 'MAINTENANCE' },
]

// ==================== SEO & ANALYTICS ====================
const SEO_TASKS = [
  { id: 'SEO_IMPLEMENTATION', label: 'SEO Implementation', icon: '🔍', color: 'bg-green-500/20 text-green-400', category: 'SEO' },
  { id: 'META_TAGS', label: 'Meta Tags Update', icon: '🏷️', color: 'bg-blue-500/20 text-blue-400', category: 'SEO' },
  { id: 'SCHEMA_MARKUP', label: 'Schema Markup', icon: '📋', color: 'bg-purple-500/20 text-purple-400', category: 'SEO' },
  { id: 'SITEMAP', label: 'Sitemap Update', icon: '🗺️', color: 'bg-teal-500/20 text-teal-400', category: 'SEO' },
  { id: 'ROBOTS_TXT', label: 'Robots.txt', icon: '🤖', color: 'bg-slate-800/50 text-slate-200', category: 'SEO' },
  { id: 'CANONICAL_TAGS', label: 'Canonical Tags', icon: '🔗', color: 'bg-cyan-100 text-cyan-700', category: 'SEO' },
  { id: 'ALT_TAGS', label: 'Image Alt Tags', icon: '🖼️', color: 'bg-amber-500/20 text-amber-400', category: 'SEO' },
  { id: 'ANALYTICS_SETUP', label: 'Analytics Setup', icon: '📊', color: 'bg-indigo-500/20 text-indigo-400', category: 'SEO' },
  { id: 'GTM_SETUP', label: 'GTM Setup', icon: '📦', color: 'bg-orange-500/20 text-orange-400', category: 'SEO' },
  { id: 'CONVERSION_TRACKING', label: 'Conversion Tracking', icon: '🎯', color: 'bg-pink-500/20 text-pink-400', category: 'SEO' },
]

// ==================== INTEGRATIONS ====================
const INTEGRATION_TASKS = [
  { id: 'FORM_INTEGRATION', label: 'Form Integration', icon: '📝', color: 'bg-amber-500/20 text-amber-400', category: 'INTEGRATION' },
  { id: 'API_INTEGRATION', label: 'API Integration', icon: '🔗', color: 'bg-blue-500/20 text-blue-400', category: 'INTEGRATION' },
  { id: 'CRM_INTEGRATION', label: 'CRM Integration', icon: '👥', color: 'bg-purple-500/20 text-purple-400', category: 'INTEGRATION' },
  { id: 'WHATSAPP_INTEGRATION', label: 'WhatsApp Integration', icon: '💬', color: 'bg-green-500/20 text-green-400', category: 'INTEGRATION' },
  { id: 'CHAT_WIDGET', label: 'Chat Widget', icon: '🗨️', color: 'bg-cyan-100 text-cyan-700', category: 'INTEGRATION' },
  { id: 'BOOKING_SYSTEM', label: 'Booking System', icon: '📅', color: 'bg-teal-500/20 text-teal-400', category: 'INTEGRATION' },
  { id: 'SOCIAL_INTEGRATION', label: 'Social Integration', icon: '📱', color: 'bg-pink-500/20 text-pink-400', category: 'INTEGRATION' },
  { id: 'MAPS_INTEGRATION', label: 'Maps Integration', icon: '📍', color: 'bg-red-500/20 text-red-400', category: 'INTEGRATION' },
  { id: 'THIRD_PARTY', label: 'Third Party Tool', icon: '🔌', color: 'bg-indigo-500/20 text-indigo-400', category: 'INTEGRATION' },
  { id: 'PLUGIN_SETUP', label: 'Plugin Setup', icon: '⚙️', color: 'bg-slate-800/50 text-slate-200', category: 'INTEGRATION' },
]

// ==================== DEVOPS & DEPLOYMENT ====================
const DEVOPS_TASKS = [
  { id: 'DEPLOYMENT', label: 'Deployment', icon: '🚀', color: 'bg-emerald-500/20 text-emerald-400', category: 'DEVOPS' },
  { id: 'STAGING_SETUP', label: 'Staging Setup', icon: '🏗️', color: 'bg-amber-500/20 text-amber-400', category: 'DEVOPS' },
  { id: 'DNS_CONFIG', label: 'DNS Configuration', icon: '🌐', color: 'bg-blue-500/20 text-blue-400', category: 'DEVOPS' },
  { id: 'SSL_SETUP', label: 'SSL Certificate', icon: '🔒', color: 'bg-green-500/20 text-green-400', category: 'DEVOPS' },
  { id: 'DOMAIN_SETUP', label: 'Domain Setup', icon: '🔗', color: 'bg-purple-500/20 text-purple-400', category: 'DEVOPS' },
  { id: 'HOSTING_MIGRATION', label: 'Hosting Migration', icon: '📦', color: 'bg-orange-500/20 text-orange-400', category: 'DEVOPS' },
  { id: 'SERVER_MAINTENANCE', label: 'Server Maintenance', icon: '🖥️', color: 'bg-slate-800/50 text-slate-200', category: 'DEVOPS' },
  { id: 'GO_LIVE', label: 'Go Live', icon: '🎉', color: 'bg-pink-500/20 text-pink-400', category: 'DEVOPS' },
  { id: 'ROLLBACK', label: 'Rollback', icon: '⏪', color: 'bg-red-500/20 text-red-400', category: 'DEVOPS' },
]

// Combine all task types
const ALL_TASK_TYPES = [
  ...PAGE_DEV_TASKS,
  ...DESIGN_TASKS,
  ...BACKEND_TASKS,
  ...OPTIMIZATION_TASKS,
  ...MAINTENANCE_TASKS,
  ...SEO_TASKS,
  ...INTEGRATION_TASKS,
  ...DEVOPS_TASKS,
]

// Web Team Deliverable Types - Comprehensive list
const TASK_TYPES = [
  { id: 'ALL', label: 'All Types' },
  ...ALL_TASK_TYPES,
]

// Task Statuses
const STATUSES = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'PENDING', label: 'Pending', color: 'bg-slate-800/50 text-slate-200', description: 'Not started' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', description: 'Being worked on' },
  { id: 'REVIEW', label: 'In Review', color: 'bg-amber-500/20 text-amber-400', description: 'Awaiting QC' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-green-500/20 text-green-400', description: 'Done' },
  { id: 'BLOCKED', label: 'Blocked', color: 'bg-red-500/20 text-red-400', description: 'Waiting on dependency' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-400', description: 'Paused' },
]

// Priority Levels
const PRIORITIES = [
  { id: 'ALL', label: 'All Priorities' },
  { id: 'URGENT', label: 'Urgent', color: 'bg-red-500 text-white' },
  { id: 'HIGH', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'LOW', label: 'Low', color: 'bg-slate-800/50 text-slate-300' },
]

export default function DailyTaskTrackerPage() {
  const [tasks, setTasks] = useState<DailyTask[]>(DAILY_TASKS)
  const [filterMember, setFilterMember] = useState('All')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [showAddTask, setShowAddTask] = useState(false)

  const filteredTasks = tasks.filter(task => {
    if (filterMember !== 'All' && task.allocatedBy !== filterMember) return false
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false
    if (filterType !== 'ALL' && task.taskType !== filterType) return false
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false
    return true
  })

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const blockedCount = tasks.filter(t => t.status === 'BLOCKED').length
  const totalDuration = tasks
    .filter(t => t.duration)
    .reduce((acc, t) => acc + (t.duration || 0), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-800/50 text-slate-200'
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400'
      case 'REVIEW': return 'bg-amber-500/20 text-amber-400'
      case 'COMPLETED': return 'bg-green-500/20 text-green-400'
      case 'BLOCKED': return 'bg-red-500/20 text-red-400'
      case 'ON_HOLD': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-slate-800/50 text-slate-200'
    }
  }

  const getTypeColor = (type: string) => {
    const typeInfo = ALL_TASK_TYPES.find(t => t.id === type)
    return typeInfo?.color || 'bg-slate-800/50 text-slate-200'
  }

  const getPriorityColor = (priority: string) => {
    const priorityInfo = PRIORITIES.find(p => p.id === priority)
    return priorityInfo?.color || 'bg-slate-800/50 text-slate-300'
  }

  const getTypeIcon = (type: string) => {
    const typeInfo = ALL_TASK_TYPES.find(t => t.id === type)
    return typeInfo?.icon || '📄'
  }

  const getTypeLabel = (type: string) => {
    const typeInfo = ALL_TASK_TYPES.find(t => t.id === type)
    return typeInfo?.label || type.replace(/_/g, ' ')
  }

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const updateTaskStatus = (taskId: string, newStatus: DailyTask['status']) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task
      const updates: Partial<DailyTask> = { status: newStatus }
      if (newStatus === 'IN_PROGRESS' && !task.inProgressTimestamp) {
        updates.inProgressTimestamp = new Date().toISOString()
      }
      if (newStatus === 'COMPLETED' && !task.completedTimestamp) {
        updates.completedTimestamp = new Date().toISOString()
        if (task.inProgressTimestamp) {
          const start = new Date(task.inProgressTimestamp).getTime()
          const end = new Date().getTime()
          updates.duration = Math.round((end - start) / 60000)
        }
      }
      return { ...task, ...updates }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daily Task Tracker</h1>
            <p className="text-indigo-200">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 glass-card text-indigo-600 rounded-lg font-medium hover:bg-indigo-50"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-400">Total Tasks</p>
          <p className="text-3xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Completed</p>
          <p className="text-3xl font-bold text-green-400">{completedCount}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgressCount}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-400">Blocked</p>
          <p className="text-3xl font-bold text-red-400">{blockedCount}</p>
        </div>
        <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
          <p className="text-sm text-indigo-600">Total Time</p>
          <p className="text-3xl font-bold text-indigo-700">{formatDuration(totalDuration)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Allocated By</label>
            <select
              value={filterMember}
              onChange={e => setFilterMember(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {TEAM_MEMBERS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {STATUSES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Task Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {TASK_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {PRIORITIES.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1" />
          <div className="flex items-end">
            <button
              onClick={() => { setFilterMember('All'); setFilterStatus('ALL'); setFilterType('ALL'); setFilterPriority('ALL') }}
              className="px-3 py-2 text-sm text-slate-300 hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TIME</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">TASK NAME</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">ALLOCATED BY</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TYPE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PRIORITY</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RATING</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STARTED</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">COMPLETED</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DEADLINE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DURATION</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">WA</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">REMARKS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} className={`border-b border-white/5 hover:bg-slate-900/40 ${
                  task.status === 'BLOCKED' ? 'bg-red-500/10' : ''
                }`}>
                  <td className="py-3 px-4 text-sm text-slate-300">
                    {formatTime(task.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-white text-sm">{task.taskName}</p>
                    {task.links.length > 0 && (
                      <a
                        href={task.links[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        View Link
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-300">{task.clientName}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{task.allocatedBy}</td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value as DailyTask['status'])}
                      className={`px-2 py-1 text-xs font-medium rounded border-0 cursor-pointer ${getStatusColor(task.status)}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="ON_HOLD">ON HOLD</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded inline-flex items-center gap-1 ${getTypeColor(task.taskType)}`}>
                      <span>{getTypeIcon(task.taskType)}</span>
                      {getTypeLabel(task.taskType)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {task.rating ? (
                      <span className="text-amber-500 font-medium">{task.rating}/5</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-slate-300">
                    {formatTime(task.inProgressTimestamp)}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-slate-300">
                    {formatTime(task.completedTimestamp)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-medium ${
                      new Date(task.deadline) < new Date() && task.status !== 'COMPLETED'
                        ? 'text-red-400'
                        : 'text-slate-300'
                    }`}>
                      {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-slate-300">
                    {task.duration ? formatDuration(task.duration) : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {task.whatsappCommunicated ? (
                      <span className="text-green-400 text-lg">✓</span>
                    ) : (
                      <span className="text-slate-300 text-lg">○</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 max-w-[150px] truncate" title={task.remarks}>
                    {task.remarks || '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Client */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3">Tasks by Client</h3>
          <div className="space-y-2">
            {Array.from(new Set(tasks.map(t => t.clientName))).map(client => {
              const clientTasks = tasks.filter(t => t.clientName === client)
              const completed = clientTasks.filter(t => t.status === 'COMPLETED').length
              return (
                <div key={client} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{client}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{completed}/{clientTasks.length}</span>
                    <div className="w-20 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(completed / clientTasks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* By Team Member */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-3">Tasks by Team Member (Allocated)</h3>
          <div className="space-y-2">
            {TEAM_MEMBERS.filter(m => m !== 'All').map(member => {
              const memberTasks = tasks.filter(t => t.allocatedBy === member)
              const completed = memberTasks.filter(t => t.status === 'COMPLETED').length
              if (memberTasks.length === 0) return null
              return (
                <div key={member} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{member}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{completed}/{memberTasks.length}</span>
                    <div className="w-20 h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(completed / memberTasks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-200 mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-4">
            {STATUSES.filter(s => s.id !== 'ALL').map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${s.color}`}>{s.label.toUpperCase()}</span>
                <span className="text-xs text-slate-400">{s.description}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-xs text-slate-400">WhatsApp communicated</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-200 mb-3">Task Types</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_TASK_TYPES.map(t => (
              <span key={t.id} className={`px-2 py-1 text-xs font-medium rounded inline-flex items-center gap-1 ${t.color}`}>
                <span>{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-200 mb-3">Priority Levels</h3>
          <div className="flex flex-wrap gap-3">
            {PRIORITIES.filter(p => p.id !== 'ALL').map(p => (
              <span key={p.id} className={`px-2 py-1 text-xs font-medium rounded ${p.color}`}>{p.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddTask(false)}>
          <div className="glass-card rounded-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">Add New Task</h2>
              <button onClick={() => setShowAddTask(false)} className="text-slate-400 hover:text-slate-300">
                Close
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Task Name *</label>
                <input type="text" className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Enter task name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Client *</label>
                  <select className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option>Select client</option>
                    <option>Apollo Hospitals</option>
                    <option>MedPlus Clinics</option>
                    <option>CareConnect</option>
                    <option>HealthFirst Labs</option>
                    <option>Akropolis Hospital</option>
                    <option>Dr Anvesh</option>
                    <option>Rapple Skincare</option>
                    <option>Aitelz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Allocated By *</label>
                  <select className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option>Manish</option>
                    <option>Shivam</option>
                    <option>Aniket</option>
                    <option>Chitransh</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Task Type *</label>
                  <select className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    {ALL_TASK_TYPES.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Priority *</label>
                  <select className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    {PRIORITIES.filter(p => p.id !== 'ALL').map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Deadline *</label>
                <input type="date" className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Links</label>
                <input type="url" className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Remarks</label>
                <textarea className="w-full px-3 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Any additional notes..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="whatsapp" className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="whatsapp" className="text-sm text-slate-200">Communicated with client on WhatsApp</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-slate-900/40"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
