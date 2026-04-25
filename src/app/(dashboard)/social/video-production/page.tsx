'use client'

import { useState } from 'react'

// ==================== VIDEO CATEGORIES ====================
const VIDEO_CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'SHORT_FORM', label: 'Short Form Content', icon: '📱', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'LONG_FORM', label: 'Long Form Content', icon: '🎬', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'TESTIMONIAL', label: 'Testimonials', icon: '🗣️', color: 'bg-green-500/20 text-green-400' },
  { id: 'CORPORATE', label: 'Corporate Videos', icon: '🏢', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'PROMOTIONAL', label: 'Promotional', icon: '📢', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'EDUCATIONAL', label: 'Educational', icon: '📚', color: 'bg-teal-500/20 text-teal-400' },
  { id: 'SOCIAL', label: 'Social Media', icon: '📲', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'EVENT', label: 'Event Coverage', icon: '🎉', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'ANIMATION', label: 'Animation/Motion', icon: '🎨', color: 'bg-red-500/20 text-red-400' },
]

// ==================== SHORT FORM CONTENT ====================
const SHORT_FORM_VIDEO_TYPES = [
  { id: 'INSTAGRAM_REEL', label: 'Instagram Reel', icon: '📸', color: 'bg-pink-500/20 text-pink-400', category: 'SHORT_FORM' },
  { id: 'YOUTUBE_SHORT', label: 'YouTube Short', icon: '▶️', color: 'bg-red-500/20 text-red-400', category: 'SHORT_FORM' },
  { id: 'TIKTOK', label: 'TikTok Video', icon: '🎵', color: 'bg-slate-800/50 text-slate-200', category: 'SHORT_FORM' },
  { id: 'FACEBOOK_REEL', label: 'Facebook Reel', icon: '📘', color: 'bg-blue-500/20 text-blue-400', category: 'SHORT_FORM' },
  { id: 'LINKEDIN_SHORT', label: 'LinkedIn Short', icon: '💼', color: 'bg-sky-100 text-sky-700', category: 'SHORT_FORM' },
  { id: 'STORY_VIDEO', label: 'Story Video', icon: '⭕', color: 'bg-purple-500/20 text-purple-400', category: 'SHORT_FORM' },
  { id: 'QUICK_TIP', label: 'Quick Tip/Hack', icon: '💡', color: 'bg-yellow-500/20 text-yellow-400', category: 'SHORT_FORM' },
  { id: 'TRENDING_AUDIO', label: 'Trending Audio Edit', icon: '🎶', color: 'bg-fuchsia-100 text-fuchsia-700', category: 'SHORT_FORM' },
  { id: 'MEME_VIDEO', label: 'Meme/Trend Video', icon: '😂', color: 'bg-lime-100 text-lime-700', category: 'SHORT_FORM' },
  { id: 'CAROUSEL_VIDEO', label: 'Carousel Video', icon: '🎠', color: 'bg-rose-100 text-rose-700', category: 'SHORT_FORM' },
]

// ==================== LONG FORM CONTENT ====================
const LONG_FORM_VIDEO_TYPES = [
  { id: 'YOUTUBE_VIDEO', label: 'YouTube Video', icon: '▶️', color: 'bg-red-500/20 text-red-400', category: 'LONG_FORM' },
  { id: 'DOCUMENTARY', label: 'Documentary', icon: '🎥', color: 'bg-amber-500/20 text-amber-400', category: 'LONG_FORM' },
  { id: 'INTERVIEW', label: 'Interview', icon: '🎤', color: 'bg-purple-500/20 text-purple-400', category: 'LONG_FORM' },
  { id: 'PODCAST_VIDEO', label: 'Podcast Video', icon: '🎙️', color: 'bg-indigo-500/20 text-indigo-400', category: 'LONG_FORM' },
  { id: 'WEBINAR_EDIT', label: 'Webinar Edit', icon: '💻', color: 'bg-blue-500/20 text-blue-400', category: 'LONG_FORM' },
  { id: 'VLOG', label: 'Vlog', icon: '📹', color: 'bg-green-500/20 text-green-400', category: 'LONG_FORM' },
  { id: 'TUTORIAL', label: 'Tutorial/How-To', icon: '📖', color: 'bg-teal-500/20 text-teal-400', category: 'LONG_FORM' },
  { id: 'REVIEW_VIDEO', label: 'Review Video', icon: '⭐', color: 'bg-yellow-500/20 text-yellow-400', category: 'LONG_FORM' },
  { id: 'CASE_STUDY_VIDEO', label: 'Case Study Video', icon: '📊', color: 'bg-slate-800/50 text-slate-200', category: 'LONG_FORM' },
]

// ==================== TESTIMONIALS ====================
const TESTIMONIAL_VIDEO_TYPES = [
  { id: 'PATIENT_TESTIMONIAL', label: 'Patient Testimonial', icon: '🏥', color: 'bg-green-500/20 text-green-400', category: 'TESTIMONIAL' },
  { id: 'CUSTOMER_TESTIMONIAL', label: 'Customer Testimonial', icon: '👤', color: 'bg-blue-500/20 text-blue-400', category: 'TESTIMONIAL' },
  { id: 'SUCCESS_STORY', label: 'Success Story', icon: '🏆', color: 'bg-amber-500/20 text-amber-400', category: 'TESTIMONIAL' },
  { id: 'BEFORE_AFTER', label: 'Before & After', icon: '🔄', color: 'bg-purple-500/20 text-purple-400', category: 'TESTIMONIAL' },
  { id: 'REVIEW_COMPILATION', label: 'Review Compilation', icon: '⭐', color: 'bg-yellow-500/20 text-yellow-400', category: 'TESTIMONIAL' },
  { id: 'DOCTOR_SPEAK', label: 'Doctor Speak', icon: '👨‍⚕️', color: 'bg-teal-500/20 text-teal-400', category: 'TESTIMONIAL' },
  { id: 'EXPERT_INTERVIEW', label: 'Expert Interview', icon: '🎓', color: 'bg-indigo-500/20 text-indigo-400', category: 'TESTIMONIAL' },
]

// ==================== CORPORATE VIDEOS ====================
const CORPORATE_VIDEO_TYPES = [
  { id: 'BRAND_FILM', label: 'Brand Film', icon: '🎬', color: 'bg-purple-500/20 text-purple-400', category: 'CORPORATE' },
  { id: 'COMPANY_PROFILE', label: 'Company Profile', icon: '🏢', color: 'bg-blue-500/20 text-blue-400', category: 'CORPORATE' },
  { id: 'FACILITY_TOUR', label: 'Facility Tour', icon: '🚶', color: 'bg-green-500/20 text-green-400', category: 'CORPORATE' },
  { id: 'TEAM_INTRO', label: 'Team Introduction', icon: '👥', color: 'bg-cyan-100 text-cyan-700', category: 'CORPORATE' },
  { id: 'CEO_MESSAGE', label: 'CEO/Leadership Message', icon: '👔', color: 'bg-slate-800/50 text-slate-200', category: 'CORPORATE' },
  { id: 'CULTURE_VIDEO', label: 'Culture Video', icon: '🎉', color: 'bg-pink-500/20 text-pink-400', category: 'CORPORATE' },
  { id: 'RECRUITMENT', label: 'Recruitment Video', icon: '📋', color: 'bg-amber-500/20 text-amber-400', category: 'CORPORATE' },
  { id: 'ANNUAL_REPORT', label: 'Annual Report Video', icon: '📈', color: 'bg-indigo-500/20 text-indigo-400', category: 'CORPORATE' },
  { id: 'INVESTOR_PITCH', label: 'Investor Pitch', icon: '💰', color: 'bg-emerald-500/20 text-emerald-400', category: 'CORPORATE' },
]

// ==================== PROMOTIONAL VIDEOS ====================
const PROMOTIONAL_VIDEO_TYPES = [
  { id: 'PRODUCT_VIDEO', label: 'Product Video', icon: '📦', color: 'bg-blue-500/20 text-blue-400', category: 'PROMOTIONAL' },
  { id: 'SERVICE_VIDEO', label: 'Service Explainer', icon: '🛠️', color: 'bg-green-500/20 text-green-400', category: 'PROMOTIONAL' },
  { id: 'PROMO_AD', label: 'Promotional Ad', icon: '📢', color: 'bg-orange-500/20 text-orange-400', category: 'PROMOTIONAL' },
  { id: 'TEASER', label: 'Teaser/Trailer', icon: '🎭', color: 'bg-purple-500/20 text-purple-400', category: 'PROMOTIONAL' },
  { id: 'LAUNCH_VIDEO', label: 'Launch Video', icon: '🚀', color: 'bg-red-500/20 text-red-400', category: 'PROMOTIONAL' },
  { id: 'OFFER_VIDEO', label: 'Offer/Sale Video', icon: '🏷️', color: 'bg-amber-500/20 text-amber-400', category: 'PROMOTIONAL' },
  { id: 'COUNTDOWN', label: 'Countdown Video', icon: '⏰', color: 'bg-pink-500/20 text-pink-400', category: 'PROMOTIONAL' },
  { id: 'UNBOXING', label: 'Unboxing Video', icon: '📦', color: 'bg-cyan-100 text-cyan-700', category: 'PROMOTIONAL' },
]

// ==================== EDUCATIONAL VIDEOS ====================
const EDUCATIONAL_VIDEO_TYPES = [
  { id: 'EXPLAINER', label: 'Explainer Video', icon: '💡', color: 'bg-yellow-500/20 text-yellow-400', category: 'EDUCATIONAL' },
  { id: 'PROCEDURE_VIDEO', label: 'Procedure Video', icon: '🏥', color: 'bg-teal-500/20 text-teal-400', category: 'EDUCATIONAL' },
  { id: 'FAQ_VIDEO', label: 'FAQ Video', icon: '❓', color: 'bg-blue-500/20 text-blue-400', category: 'EDUCATIONAL' },
  { id: 'TIPS_TRICKS', label: 'Tips & Tricks', icon: '📝', color: 'bg-green-500/20 text-green-400', category: 'EDUCATIONAL' },
  { id: 'AWARENESS', label: 'Awareness Video', icon: '📣', color: 'bg-purple-500/20 text-purple-400', category: 'EDUCATIONAL' },
  { id: 'TRAINING', label: 'Training Video', icon: '🎓', color: 'bg-indigo-500/20 text-indigo-400', category: 'EDUCATIONAL' },
  { id: 'DEMO_VIDEO', label: 'Demo Video', icon: '🖥️', color: 'bg-slate-800/50 text-slate-200', category: 'EDUCATIONAL' },
  { id: 'HEALTH_TIP', label: 'Health Tip', icon: '❤️', color: 'bg-red-500/20 text-red-400', category: 'EDUCATIONAL' },
]

// ==================== SOCIAL MEDIA VIDEOS ====================
const SOCIAL_VIDEO_TYPES = [
  { id: 'TRENDING_CHALLENGE', label: 'Trending Challenge', icon: '🔥', color: 'bg-orange-500/20 text-orange-400', category: 'SOCIAL' },
  { id: 'BTS_VIDEO', label: 'Behind The Scenes', icon: '🎬', color: 'bg-purple-500/20 text-purple-400', category: 'SOCIAL' },
  { id: 'DAY_IN_LIFE', label: 'Day in Life', icon: '☀️', color: 'bg-yellow-500/20 text-yellow-400', category: 'SOCIAL' },
  { id: 'QNA_VIDEO', label: 'Q&A Video', icon: '💬', color: 'bg-blue-500/20 text-blue-400', category: 'SOCIAL' },
  { id: 'LIVE_RECORDING', label: 'Live Recording Edit', icon: '🔴', color: 'bg-red-500/20 text-red-400', category: 'SOCIAL' },
  { id: 'COLLAB_VIDEO', label: 'Collaboration Video', icon: '🤝', color: 'bg-green-500/20 text-green-400', category: 'SOCIAL' },
  { id: 'REACTION', label: 'Reaction Video', icon: '😮', color: 'bg-pink-500/20 text-pink-400', category: 'SOCIAL' },
  { id: 'DUET_STITCH', label: 'Duet/Stitch', icon: '🎭', color: 'bg-fuchsia-100 text-fuchsia-700', category: 'SOCIAL' },
]

// ==================== EVENT COVERAGE ====================
const EVENT_VIDEO_TYPES = [
  { id: 'EVENT_HIGHLIGHT', label: 'Event Highlights', icon: '✨', color: 'bg-amber-500/20 text-amber-400', category: 'EVENT' },
  { id: 'FULL_EVENT', label: 'Full Event Edit', icon: '🎥', color: 'bg-blue-500/20 text-blue-400', category: 'EVENT' },
  { id: 'CONFERENCE', label: 'Conference Coverage', icon: '🎤', color: 'bg-purple-500/20 text-purple-400', category: 'EVENT' },
  { id: 'AWARD_CEREMONY', label: 'Award Ceremony', icon: '🏆', color: 'bg-yellow-500/20 text-yellow-400', category: 'EVENT' },
  { id: 'INAUGURATION', label: 'Inauguration', icon: '🎀', color: 'bg-red-500/20 text-red-400', category: 'EVENT' },
  { id: 'HEALTH_CAMP', label: 'Health Camp', icon: '🏥', color: 'bg-green-500/20 text-green-400', category: 'EVENT' },
  { id: 'WORKSHOP', label: 'Workshop Coverage', icon: '📚', color: 'bg-teal-500/20 text-teal-400', category: 'EVENT' },
  { id: 'CELEBRATION', label: 'Celebration Video', icon: '🎉', color: 'bg-pink-500/20 text-pink-400', category: 'EVENT' },
]

// ==================== ANIMATION/MOTION ====================
const ANIMATION_VIDEO_TYPES = [
  { id: 'MOTION_GRAPHICS', label: 'Motion Graphics', icon: '🎨', color: 'bg-purple-500/20 text-purple-400', category: 'ANIMATION' },
  { id: '2D_ANIMATION', label: '2D Animation', icon: '✏️', color: 'bg-blue-500/20 text-blue-400', category: 'ANIMATION' },
  { id: '3D_ANIMATION', label: '3D Animation', icon: '🎲', color: 'bg-indigo-500/20 text-indigo-400', category: 'ANIMATION' },
  { id: 'WHITEBOARD', label: 'Whiteboard Animation', icon: '📝', color: 'bg-slate-800/50 text-slate-200', category: 'ANIMATION' },
  { id: 'LOGO_ANIMATION', label: 'Logo Animation', icon: '✨', color: 'bg-amber-500/20 text-amber-400', category: 'ANIMATION' },
  { id: 'TEXT_ANIMATION', label: 'Text Animation', icon: '🔤', color: 'bg-green-500/20 text-green-400', category: 'ANIMATION' },
  { id: 'INFOGRAPHIC_VIDEO', label: 'Infographic Video', icon: '📊', color: 'bg-cyan-100 text-cyan-700', category: 'ANIMATION' },
  { id: 'KINETIC_TYPO', label: 'Kinetic Typography', icon: '🔠', color: 'bg-orange-500/20 text-orange-400', category: 'ANIMATION' },
  { id: 'INTRO_OUTRO', label: 'Intro/Outro Animation', icon: '🎬', color: 'bg-pink-500/20 text-pink-400', category: 'ANIMATION' },
]

// Combine all video types
const ALL_VIDEO_TYPES = [
  ...SHORT_FORM_VIDEO_TYPES,
  ...LONG_FORM_VIDEO_TYPES,
  ...TESTIMONIAL_VIDEO_TYPES,
  ...CORPORATE_VIDEO_TYPES,
  ...PROMOTIONAL_VIDEO_TYPES,
  ...EDUCATIONAL_VIDEO_TYPES,
  ...SOCIAL_VIDEO_TYPES,
  ...EVENT_VIDEO_TYPES,
  ...ANIMATION_VIDEO_TYPES,
]

// Video type filters (includes ALL option)
const VIDEO_TYPE_FILTERS = [
  { id: 'ALL', label: 'All Video Types' },
  ...ALL_VIDEO_TYPES,
]

// ==================== EDITING STATUSES ====================
const EDITING_STATUSES = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'BRIEF_RECEIVED', label: 'Brief Received', icon: '📥', color: 'bg-slate-800/50 text-slate-200' },
  { id: 'SCRIPT_PENDING', label: 'Script Pending', icon: '📝', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'SCRIPT_APPROVED', label: 'Script Approved', icon: '✅', color: 'bg-green-500/20 text-green-400' },
  { id: 'SHOOT_SCHEDULED', label: 'Shoot Scheduled', icon: '📅', color: 'bg-sky-100 text-sky-700' },
  { id: 'SHOOT_COMPLETED', label: 'Shoot Completed', icon: '🎬', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'RAW_PENDING', label: 'Raw Footage Pending', icon: '⏳', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'RAW_RECEIVED', label: 'Raw Footage Received', icon: '📦', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'IN_EDITING', label: 'In Editing', icon: '✂️', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'ROUGH_CUT', label: 'Rough Cut Ready', icon: '🎞️', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'INTERNAL_REVIEW', label: 'Internal Review', icon: '👀', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'CHANGES_INTERNAL', label: 'Internal Changes', icon: '🔄', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'CLIENT_REVIEW', label: 'Client Review', icon: '👤', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'CHANGES_CLIENT', label: 'Client Changes', icon: '✏️', color: 'bg-rose-100 text-rose-700' },
  { id: 'FINAL_EXPORT', label: 'Final Export', icon: '📤', color: 'bg-teal-500/20 text-teal-400' },
  { id: 'DELIVERED', label: 'Delivered', icon: '🎉', color: 'bg-green-500/20 text-green-400' },
  { id: 'ON_HOLD', label: 'On Hold', icon: '⏸️', color: 'bg-gray-800/50 text-gray-200' },
  { id: 'CANCELLED', label: 'Cancelled', icon: '❌', color: 'bg-red-500/20 text-red-400' },
]

// ==================== RAW FOOTAGE STATUSES ====================
const RAW_FOOTAGE_STATUSES = [
  { id: 'NOT_REQUIRED', label: 'Not Required', icon: '➖', color: 'bg-slate-800/50 text-slate-200' },
  { id: 'PENDING', label: 'Pending', icon: '⏳', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'RECEIVED', label: 'Received', icon: '📦', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'DELIVERED', label: 'Delivered to Team', icon: '✅', color: 'bg-green-500/20 text-green-400' },
  { id: 'DELAYED', label: 'Delayed', icon: '⚠️', color: 'bg-red-500/20 text-red-400' },
]

// ==================== PRIORITIES ====================
const PRIORITIES = [
  { id: 'CRITICAL', label: 'Critical', icon: '🔴', color: 'bg-red-500/20 text-red-400' },
  { id: 'HIGH', label: 'High', icon: '🟠', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'MEDIUM', label: 'Medium', icon: '🟡', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'LOW', label: 'Low', icon: '🟢', color: 'bg-green-500/20 text-green-400' },
]

// ==================== OUTPUT FORMATS ====================
const OUTPUT_FORMATS = [
  { id: 'MP4_1080', label: 'MP4 1080p', icon: '🎬' },
  { id: 'MP4_4K', label: 'MP4 4K', icon: '📺' },
  { id: 'MOV_PRORES', label: 'MOV ProRes', icon: '🎥' },
  { id: 'VERTICAL_9_16', label: 'Vertical 9:16', icon: '📱' },
  { id: 'SQUARE_1_1', label: 'Square 1:1', icon: '⬜' },
  { id: 'HORIZONTAL_16_9', label: 'Horizontal 16:9', icon: '🖥️' },
  { id: 'HORIZONTAL_4_3', label: 'Horizontal 4:3', icon: '📐' },
  { id: 'GIF', label: 'GIF', icon: '🎞️' },
  { id: 'WEBM', label: 'WebM', icon: '🌐' },
]

// ==================== PLATFORMS ====================
const DELIVERY_PLATFORMS = [
  { id: 'YOUTUBE', label: 'YouTube', icon: '▶️', color: 'bg-red-500/20 text-red-400' },
  { id: 'INSTAGRAM', label: 'Instagram', icon: '📸', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'FACEBOOK', label: 'Facebook', icon: '📘', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'LINKEDIN', label: 'LinkedIn', icon: '💼', color: 'bg-sky-100 text-sky-700' },
  { id: 'TIKTOK', label: 'TikTok', icon: '🎵', color: 'bg-slate-800/50 text-slate-200' },
  { id: 'TWITTER', label: 'Twitter/X', icon: '🐦', color: 'bg-slate-800/50 text-slate-200' },
  { id: 'WEBSITE', label: 'Website', icon: '🌐', color: 'bg-green-500/20 text-green-400' },
  { id: 'TV_DISPLAY', label: 'TV/Display', icon: '📺', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'WHATSAPP', label: 'WhatsApp', icon: '💬', color: 'bg-emerald-500/20 text-emerald-400' },
]

// ==================== CLIENT TYPES ====================
const CLIENT_TYPES = [
  { id: 'HOSPITAL', label: 'Hospital', icon: '🏥' },
  { id: 'CLINIC', label: 'Clinic', icon: '🩺' },
  { id: 'DOCTOR', label: 'Doctor', icon: '👨‍⚕️' },
  { id: 'LAB', label: 'Diagnostic Lab', icon: '🔬' },
  { id: 'PHARMA', label: 'Pharma', icon: '💊' },
  { id: 'DENTAL', label: 'Dental', icon: '🦷' },
  { id: 'WELLNESS', label: 'Wellness/Spa', icon: '🧘' },
  { id: 'CORPORATE', label: 'Corporate', icon: '🏢' },
  { id: 'ECOMMERCE', label: 'E-commerce', icon: '🛒' },
  { id: 'RESTAURANT', label: 'Restaurant/Cafe', icon: '🍽️' },
  { id: 'EDUCATION', label: 'Education', icon: '🎓' },
  { id: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠' },
  { id: 'EVENT', label: 'Event', icon: '🎉' },
  { id: 'OTHER', label: 'Other', icon: '📋' },
]

// ==================== EDITING TASKS ====================
const EDITING_TASKS = [
  { id: 'COLOR_GRADE', label: 'Color Grading', icon: '🎨' },
  { id: 'AUDIO_MIX', label: 'Audio Mixing', icon: '🔊' },
  { id: 'SUBTITLES', label: 'Subtitles/Captions', icon: '💬' },
  { id: 'MOTION_GRAPHICS', label: 'Motion Graphics', icon: '✨' },
  { id: 'SOUND_DESIGN', label: 'Sound Design', icon: '🎵' },
  { id: 'VFX', label: 'Visual Effects', icon: '🪄' },
  { id: 'THUMBNAIL', label: 'Thumbnail Creation', icon: '🖼️' },
  { id: 'TRANSITIONS', label: 'Transitions', icon: '🔄' },
  { id: 'LOWER_THIRDS', label: 'Lower Thirds', icon: '📝' },
  { id: 'INTRO_OUTRO', label: 'Intro/Outro', icon: '🎬' },
  { id: 'MUSIC_SELECTION', label: 'Music Selection', icon: '🎶' },
  { id: 'VOICEOVER', label: 'Voiceover', icon: '🎤' },
]

interface VideoProject {
  id: string
  client: string
  clientType: string
  projectName: string
  videoType: string
  videoCategory: string
  shootDate: string
  rawFootageDelivery: string | null
  editedVideoDelivery: string | null
  rawFootageStatus: string
  editedVideoStatus: string
  onTimeDelivery: boolean
  proofLink: string
  assignedEditor: string
  priority: string
  duration: string
  deliveryPlatforms: string[]
  revisionCount: number
}

interface VideoDeliverable {
  id: string
  projectId: string
  client: string
  deliverableType: string
  title: string
  dueDate: string
  deliveredDate: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'DELAYED'
  proofLink: string
  month: string
}

const VIDEO_PROJECTS: VideoProject[] = [
  { id: '1', client: 'Vision Eye Centre', clientType: 'CLINIC', projectName: 'Patient Testimonial Series', videoType: 'PATIENT_TESTIMONIAL', videoCategory: 'TESTIMONIAL', shootDate: '2024-03-05', rawFootageDelivery: '2024-03-06', editedVideoDelivery: '2024-03-10', rawFootageStatus: 'DELIVERED', editedVideoStatus: 'DELIVERED', onTimeDelivery: true, proofLink: 'https://drive.google.com/visioneyevideos', assignedEditor: 'Rohit', priority: 'HIGH', duration: '2:30', deliveryPlatforms: ['YOUTUBE', 'INSTAGRAM'], revisionCount: 1 },
  { id: '2', client: 'Apollo Hospitals Delhi', clientType: 'HOSPITAL', projectName: 'Doctor Interview - Cardiology', videoType: 'DOCUMENTARY', videoCategory: 'LONG_FORM', shootDate: '2024-03-08', rawFootageDelivery: '2024-03-09', editedVideoDelivery: null, rawFootageStatus: 'DELIVERED', editedVideoStatus: 'IN_EDITING', onTimeDelivery: true, proofLink: '', assignedEditor: 'Sneha', priority: 'HIGH', duration: '8:00', deliveryPlatforms: ['YOUTUBE', 'WEBSITE'], revisionCount: 0 },
  { id: '3', client: 'Dr. Aloy Mukherjee', clientType: 'DOCTOR', projectName: 'Procedure Explainer Reels', videoType: 'INSTAGRAM_REEL', videoCategory: 'SHORT_FORM', shootDate: '2024-03-02', rawFootageDelivery: '2024-03-03', editedVideoDelivery: '2024-03-08', rawFootageStatus: 'DELIVERED', editedVideoStatus: 'DELIVERED', onTimeDelivery: true, proofLink: 'https://www.instagram.com/reel/example', assignedEditor: 'Kavya', priority: 'MEDIUM', duration: '0:45', deliveryPlatforms: ['INSTAGRAM', 'YOUTUBE'], revisionCount: 2 },
  { id: '4', client: 'GNA Face & Dental', clientType: 'DENTAL', projectName: 'Before & After Showcase', videoType: 'BEFORE_AFTER', videoCategory: 'TESTIMONIAL', shootDate: '2024-03-10', rawFootageDelivery: null, editedVideoDelivery: null, rawFootageStatus: 'PENDING', editedVideoStatus: 'RAW_PENDING', onTimeDelivery: true, proofLink: '', assignedEditor: 'Rohit', priority: 'MEDIUM', duration: '1:00', deliveryPlatforms: ['INSTAGRAM', 'FACEBOOK'], revisionCount: 0 },
  { id: '5', client: 'Raj Hospital', clientType: 'HOSPITAL', projectName: 'Hospital Tour Video', videoType: 'FACILITY_TOUR', videoCategory: 'CORPORATE', shootDate: '2024-02-28', rawFootageDelivery: '2024-03-02', editedVideoDelivery: '2024-03-12', rawFootageStatus: 'DELIVERED', editedVideoStatus: 'CLIENT_REVIEW', onTimeDelivery: false, proofLink: '', assignedEditor: 'Sneha', priority: 'LOW', duration: '5:00', deliveryPlatforms: ['YOUTUBE', 'WEBSITE'], revisionCount: 1 },
  { id: '6', client: 'Apollo Hospitals Delhi', clientType: 'HOSPITAL', projectName: 'Health Tips Reels - Diabetes', videoType: 'QUICK_TIP', videoCategory: 'SHORT_FORM', shootDate: '2024-03-12', rawFootageDelivery: '2024-03-12', editedVideoDelivery: null, rawFootageStatus: 'DELIVERED', editedVideoStatus: 'ROUGH_CUT', onTimeDelivery: true, proofLink: '', assignedEditor: 'Kavya', priority: 'HIGH', duration: '0:30', deliveryPlatforms: ['INSTAGRAM', 'YOUTUBE', 'FACEBOOK'], revisionCount: 0 },
  { id: '7', client: 'Lifecare Hospital Kenya', clientType: 'HOSPITAL', projectName: 'Brand Film 2024', videoType: 'BRAND_FILM', videoCategory: 'CORPORATE', shootDate: '2024-03-15', rawFootageDelivery: null, editedVideoDelivery: null, rawFootageStatus: 'PENDING', editedVideoStatus: 'SHOOT_SCHEDULED', onTimeDelivery: true, proofLink: '', assignedEditor: 'Rohit', priority: 'CRITICAL', duration: '3:00', deliveryPlatforms: ['YOUTUBE', 'WEBSITE', 'TV_DISPLAY'], revisionCount: 0 },
  { id: '8', client: 'Vision Eye Centre', clientType: 'CLINIC', projectName: 'LASIK Animation Explainer', videoType: 'MOTION_GRAPHICS', videoCategory: 'ANIMATION', shootDate: '2024-03-01', rawFootageDelivery: null, editedVideoDelivery: null, rawFootageStatus: 'NOT_REQUIRED', editedVideoStatus: 'IN_EDITING', onTimeDelivery: true, proofLink: '', assignedEditor: 'Sneha', priority: 'HIGH', duration: '1:30', deliveryPlatforms: ['YOUTUBE', 'WEBSITE', 'INSTAGRAM'], revisionCount: 0 },
]

const VIDEO_DELIVERABLES: VideoDeliverable[] = [
  { id: '1', projectId: '1', client: 'Vision Eye Centre', deliverableType: 'EDITED_VIDEO', title: 'LASIK Success Story', dueDate: '2024-03-10', deliveredDate: '2024-03-10', status: 'DELIVERED', proofLink: 'https://youtube.com/shorts/example1', month: 'MAR' },
  { id: '2', projectId: '1', client: 'Vision Eye Centre', deliverableType: 'SHORTS', title: 'Eye Care Tips Reel', dueDate: '2024-03-12', deliveredDate: '2024-03-11', status: 'DELIVERED', proofLink: 'https://www.instagram.com/reel/example2', month: 'MAR' },
  { id: '3', projectId: '2', client: 'Apollo Hospitals Delhi', deliverableType: 'EDITED_VIDEO', title: 'Cardiology Department Feature', dueDate: '2024-03-15', deliveredDate: null, status: 'IN_PROGRESS', proofLink: '', month: 'MAR' },
  { id: '4', projectId: '3', client: 'Dr. Aloy Mukherjee', deliverableType: 'SHORTS', title: 'Hernia Surgery Process', dueDate: '2024-03-08', deliveredDate: '2024-03-08', status: 'DELIVERED', proofLink: 'https://youtube.com/shorts/example3', month: 'MAR' },
  { id: '5', projectId: '5', client: 'Raj Hospital', deliverableType: 'EDITED_VIDEO', title: 'Hospital Tour Film', dueDate: '2024-03-10', deliveredDate: null, status: 'DELAYED', proofLink: '', month: 'MAR' },
]

export default function VideoProductionPage() {
  const [projects] = useState(VIDEO_PROJECTS)
  const [deliverables] = useState(VIDEO_DELIVERABLES)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [monthFilter, setMonthFilter] = useState<string>('MAR')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || p.editedVideoStatus === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || p.videoCategory === categoryFilter
    const matchesType = typeFilter === 'ALL' || p.videoType === typeFilter
    const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter
    return matchesStatus && matchesCategory && matchesType && matchesPriority
  })

  const totalProjects = projects.length
  const rawDelivered = projects.filter(p => p.rawFootageStatus === 'DELIVERED').length
  const editedDelivered = projects.filter(p => p.editedVideoStatus === 'DELIVERED').length
  const inEditing = projects.filter(p => ['IN_EDITING', 'ROUGH_CUT', 'INTERNAL_REVIEW', 'CHANGES_INTERNAL'].includes(p.editedVideoStatus)).length
  const onTimeRate = Math.round((projects.filter(p => p.onTimeDelivery).length / totalProjects) * 100)

  const getVideoTypeInfo = (typeId: string) => {
    return ALL_VIDEO_TYPES.find(t => t.id === typeId) || { label: typeId, color: 'bg-slate-800/50 text-slate-200', icon: '🎥' }
  }

  const getStatusInfo = (statusId: string) => {
    return EDITING_STATUSES.find(s => s.id === statusId) || { label: statusId, color: 'bg-slate-800/50 text-slate-200', icon: '📄' }
  }

  const getRawStatusInfo = (statusId: string) => {
    return RAW_FOOTAGE_STATUSES.find(s => s.id === statusId) || { label: statusId, color: 'bg-slate-800/50 text-slate-200', icon: '📄' }
  }

  const getPriorityInfo = (priorityId: string) => {
    return PRIORITIES.find(p => p.id === priorityId) || { label: priorityId, color: 'bg-slate-800/50 text-slate-200', icon: '⚪' }
  }

  const getCategoryInfo = (categoryId: string) => {
    return VIDEO_CATEGORIES.find(c => c.id === categoryId) || { label: categoryId, color: 'bg-slate-800/50 text-slate-200', icon: '📁' }
  }

  const getPlatformInfo = (platformId: string) => {
    return DELIVERY_PLATFORMS.find(p => p.id === platformId) || { label: platformId, color: 'bg-slate-800/50 text-slate-200', icon: '📲' }
  }

  // Get video types filtered by category
  const getVideoTypesByCategory = (category: string) => {
    if (category === 'ALL') return ALL_VIDEO_TYPES
    return ALL_VIDEO_TYPES.filter(t => t.category === category)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Video Production Studio</h1>
            <p className="text-violet-200">Shoots, editing, motion graphics & delivery tracking</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 glass-card text-violet-600 rounded-lg font-medium hover:bg-violet-50"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Active Projects</p>
          <p className="text-3xl font-bold text-slate-200">{totalProjects}</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">Raw Footage Delivered</p>
          <p className="text-3xl font-bold text-blue-400">{rawDelivered}/{totalProjects}</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Videos Delivered</p>
          <p className="text-3xl font-bold text-green-400">{editedDelivered}/{totalProjects}</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">In Editing</p>
          <p className="text-3xl font-bold text-amber-400">{inEditing}</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl border border-purple-200 p-4">
          <p className="text-sm text-purple-400">On-Time Rate</p>
          <p className="text-3xl font-bold text-purple-400">{onTimeRate}%</p>
        </div>
      </div>

      {/* Category Quick Stats */}
      <div className="grid grid-cols-9 gap-2">
        {VIDEO_CATEGORIES.filter(c => c.id !== 'ALL').map(category => (
          <button
            key={category.id}
            onClick={() => setCategoryFilter(category.id === categoryFilter ? 'ALL' : category.id)}
            className={`p-3 rounded-lg border text-center transition-all ${
              categoryFilter === category.id
                ? `${category.color} border-2`
                : 'glass-card border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-xl">{category.icon}</div>
            <div className="text-xs font-medium truncate">{category.label.split(' ')[0]}</div>
            <div className="text-lg font-bold">{projects.filter(p => p.videoCategory === category.id).length}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setTypeFilter('ALL')
              }}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              {VIDEO_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.id === 'ALL' ? cat.label : `${cat.icon} ${cat.label}`}</option>
              ))}
            </select>
          </div>

          {/* Video Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Video Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="ALL">All Types</option>
              {getVideoTypesByCategory(categoryFilter).map(type => (
                <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Editing Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              {EDITING_STATUSES.map(status => (
                <option key={status.id} value={status.id}>{status.id === 'ALL' ? status.label : `${status.icon} ${status.label}`}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="ALL">All Priorities</option>
              {PRIORITIES.map(priority => (
                <option key={priority.id} value={priority.id}>{priority.icon} {priority.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
          <h2 className="font-semibold text-white">Video Projects ({filteredProjects.length})</h2>
          <div className="flex gap-2">
            <span className="text-xs text-slate-400">{filteredProjects.length} of {totalProjects} shown</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT / PROJECT</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">CATEGORY</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TYPE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DURATION</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">RAW FOOTAGE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">EDIT STATUS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">EDITOR</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PRIORITY</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PLATFORMS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ON-TIME</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">REVISIONS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PROOF</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => {
                const typeInfo = getVideoTypeInfo(project.videoType)
                const statusInfo = getStatusInfo(project.editedVideoStatus)
                const rawStatusInfo = getRawStatusInfo(project.rawFootageStatus)
                const priorityInfo = getPriorityInfo(project.priority)
                const categoryInfo = getCategoryInfo(project.videoCategory)

                return (
                  <tr key={project.id} className="border-b border-white/5 hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{project.client}</p>
                      <p className="text-sm text-slate-400">{project.projectName}</p>
                      <p className="text-xs text-slate-400">Shoot: {new Date(project.shootDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${categoryInfo.color}`}>
                        {categoryInfo.icon} {categoryInfo.label?.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${typeInfo.color}`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-slate-300">{project.duration}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${rawStatusInfo.color}`}>
                        {rawStatusInfo.icon} {rawStatusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-slate-300">{project.assignedEditor}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${priorityInfo.color}`}>
                        {priorityInfo.icon} {priorityInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {project.deliveryPlatforms.map(platform => {
                          const platformInfo = getPlatformInfo(platform)
                          return (
                            <span key={platform} className={`px-1.5 py-0.5 text-xs rounded ${platformInfo.color}`} title={platformInfo.label}>
                              {platformInfo.icon}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {project.onTimeDelivery ? (
                        <span className="text-green-400 font-medium">Yes</span>
                      ) : (
                        <span className="text-red-400 font-medium">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        project.revisionCount === 0 ? 'bg-green-500/20 text-green-400' :
                        project.revisionCount <= 2 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {project.revisionCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {project.proofLink ? (
                        <a href={project.proofLink} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 text-sm font-medium">
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex gap-2">
        {['JAN', 'FEB', 'MAR'].map(month => (
          <button
            key={month}
            onClick={() => setMonthFilter(month)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              monthFilter === month
                ? 'bg-violet-600 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-violet-300'
            }`}
          >
            {month} 2024
          </button>
        ))}
      </div>

      {/* Recent Deliverables */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Deliverables</h2>
          <button className="text-violet-600 hover:text-violet-700 text-sm font-medium">
            + Add Deliverable
          </button>
        </div>
        <div className="divide-y divide-white/10">
          {deliverables.filter(d => d.month === monthFilter).map(deliverable => (
            <div key={deliverable.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{deliverable.title}</h3>
                  <p className="text-sm text-slate-400">{deliverable.client}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusInfo(deliverable.status).color}`}>
                    {deliverable.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-300">
                  Due: {new Date(deliverable.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                {deliverable.deliveredDate && (
                  <span className="text-green-400">
                    Delivered: {new Date(deliverable.deliveredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                {deliverable.proofLink ? (
                  <a href={deliverable.proofLink} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700">
                    View Proof →
                  </a>
                ) : (
                  <span className="text-slate-400">No proof yet</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Production Workflow */}
      <div className="bg-violet-50 rounded-xl border border-violet-200 p-4">
        <h3 className="font-semibold text-violet-800 mb-3">Video Production Workflow</h3>
        <div className="grid md:grid-cols-5 gap-4 text-sm text-violet-700">
          <div>
            <p className="font-medium mb-1">Pre-Production</p>
            <ul className="space-y-1">
              <li>1. Brief received</li>
              <li>2. Script approval</li>
              <li>3. Shot list ready</li>
              <li>4. Shoot scheduled</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Production</p>
            <ul className="space-y-1">
              <li>1. Shoot completed</li>
              <li>2. Raw footage backup</li>
              <li>3. Transfer to editing</li>
              <li>4. Deliver within 24hrs</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Post-Production</p>
            <ul className="space-y-1">
              <li>1. Rough cut (2-3 days)</li>
              <li>2. Color grading</li>
              <li>3. Audio mixing</li>
              <li>4. Motion graphics</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Review</p>
            <ul className="space-y-1">
              <li>1. Internal review</li>
              <li>2. Team feedback</li>
              <li>3. Client review</li>
              <li>4. Max 2 revision rounds</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Delivery</p>
            <ul className="space-y-1">
              <li>1. Final export</li>
              <li>2. Multiple formats</li>
              <li>3. Platform optimization</li>
              <li>4. Proof link shared</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">New Video Project</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-300">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Client</label>
                <input type="text" className="w-full px-3 py-2 border border-white/10 rounded-lg" placeholder="Client name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Client Type</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  {CLIENT_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Project Name</label>
                <input type="text" className="w-full px-3 py-2 border border-white/10 rounded-lg" placeholder="Video project name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Video Category</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  {VIDEO_CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Video Type</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  {ALL_VIDEO_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Shoot Date</label>
                <input type="date" className="w-full px-3 py-2 border border-white/10 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Expected Duration</label>
                <input type="text" className="w-full px-3 py-2 border border-white/10 rounded-lg" placeholder="e.g., 2:30, 0:45" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Assigned Editor</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  <option>Rohit</option>
                  <option>Sneha</option>
                  <option>Kavya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Priority</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  {PRIORITIES.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.icon} {priority.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Delivery Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_PLATFORMS.map(platform => (
                    <label key={platform.id} className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer hover:bg-slate-900/40 ${platform.color.replace('100', '50')}`}>
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{platform.icon} {platform.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Output Formats Required</label>
                <div className="flex flex-wrap gap-2">
                  {OUTPUT_FORMATS.map(format => (
                    <label key={format.id} className="flex items-center gap-1 px-2 py-1 bg-slate-900/40 rounded border border-white/10 cursor-pointer hover:bg-slate-800/50">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{format.icon} {format.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Editing Tasks Required</label>
                <div className="flex flex-wrap gap-2">
                  {EDITING_TASKS.map(task => (
                    <label key={task.id} className="flex items-center gap-1 px-2 py-1 bg-slate-900/40 rounded border border-white/10 cursor-pointer hover:bg-slate-800/50">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{task.icon} {task.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-300 hover:text-white">
                Cancel
              </button>
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
