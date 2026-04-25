'use client'

import { useState } from 'react'

// ==================== DESIGN CATEGORIES ====================
const DESIGN_CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'PRINT', label: 'Print Materials', icon: '🖨️', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'DIGITAL', label: 'Digital Graphics', icon: '💻', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'BRANDING', label: 'Branding & Identity', icon: '🎨', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'MARKETING', label: 'Marketing Collateral', icon: '📢', color: 'bg-green-500/20 text-green-400' },
  { id: 'PACKAGING', label: 'Packaging Design', icon: '📦', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'SIGNAGE', label: 'Signage & Display', icon: '🪧', color: 'bg-red-500/20 text-red-400' },
  { id: 'PRESENTATION', label: 'Presentations', icon: '📊', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'SOCIAL', label: 'Social Media Graphics', icon: '📱', color: 'bg-pink-500/20 text-pink-400' },
]

// ==================== PRINT MATERIALS ====================
const PRINT_DESIGN_TYPES = [
  { id: 'BROCHURE', label: 'Brochure', icon: '📖', color: 'bg-blue-500/20 text-blue-400', category: 'PRINT' },
  { id: 'FLYER', label: 'Flyer/Leaflet', icon: '📄', color: 'bg-green-500/20 text-green-400', category: 'PRINT' },
  { id: 'POSTER', label: 'Poster', icon: '🖼️', color: 'bg-red-500/20 text-red-400', category: 'PRINT' },
  { id: 'BANNER', label: 'Flex Banner', icon: '🏳️', color: 'bg-orange-500/20 text-orange-400', category: 'PRINT' },
  { id: 'STANDEE', label: 'Standee/Roll-up', icon: '🧍', color: 'bg-pink-500/20 text-pink-400', category: 'PRINT' },
  { id: 'VISITING_CARD', label: 'Visiting Card', icon: '💳', color: 'bg-purple-500/20 text-purple-400', category: 'PRINT' },
  { id: 'LETTERHEAD', label: 'Letterhead', icon: '📝', color: 'bg-teal-500/20 text-teal-400', category: 'PRINT' },
  { id: 'ENVELOPE', label: 'Envelope', icon: '✉️', color: 'bg-slate-800/50 text-slate-200', category: 'PRINT' },
  { id: 'CATALOGUE', label: 'Catalogue', icon: '📚', color: 'bg-indigo-500/20 text-indigo-400', category: 'PRINT' },
  { id: 'BOOKLET', label: 'Booklet', icon: '📕', color: 'bg-amber-500/20 text-amber-400', category: 'PRINT' },
  { id: 'MENU_CARD', label: 'Menu Card', icon: '🍽️', color: 'bg-emerald-500/20 text-emerald-400', category: 'PRINT' },
  { id: 'INVITATION', label: 'Invitation Card', icon: '💌', color: 'bg-rose-100 text-rose-700', category: 'PRINT' },
  { id: 'CALENDAR', label: 'Calendar', icon: '📅', color: 'bg-cyan-100 text-cyan-700', category: 'PRINT' },
  { id: 'CERTIFICATE', label: 'Certificate', icon: '🏆', color: 'bg-yellow-500/20 text-yellow-400', category: 'PRINT' },
  { id: 'ID_CARD', label: 'ID Card/Badge', icon: '🪪', color: 'bg-sky-100 text-sky-700', category: 'PRINT' },
  { id: 'STICKER', label: 'Sticker/Label', icon: '🏷️', color: 'bg-lime-100 text-lime-700', category: 'PRINT' },
  { id: 'NEWSPAPER_AD', label: 'Newspaper Ad', icon: '📰', color: 'bg-stone-100 text-stone-700', category: 'PRINT' },
  { id: 'MAGAZINE_AD', label: 'Magazine Ad', icon: '📖', color: 'bg-fuchsia-100 text-fuchsia-700', category: 'PRINT' },
]

// ==================== DIGITAL GRAPHICS ====================
const DIGITAL_DESIGN_TYPES = [
  { id: 'WEBSITE_BANNER', label: 'Website Banner', icon: '🖥️', color: 'bg-blue-500/20 text-blue-400', category: 'DIGITAL' },
  { id: 'EMAIL_TEMPLATE', label: 'Email Template', icon: '📧', color: 'bg-green-500/20 text-green-400', category: 'DIGITAL' },
  { id: 'NEWSLETTER', label: 'Newsletter Design', icon: '📰', color: 'bg-teal-500/20 text-teal-400', category: 'DIGITAL' },
  { id: 'LANDING_PAGE', label: 'Landing Page Graphics', icon: '🎯', color: 'bg-purple-500/20 text-purple-400', category: 'DIGITAL' },
  { id: 'WEB_ICON', label: 'Web Icons/Buttons', icon: '🔘', color: 'bg-indigo-500/20 text-indigo-400', category: 'DIGITAL' },
  { id: 'INFOGRAPHIC', label: 'Infographic', icon: '📊', color: 'bg-orange-500/20 text-orange-400', category: 'DIGITAL' },
  { id: 'GIF_ANIMATION', label: 'GIF/Animation', icon: '🎞️', color: 'bg-pink-500/20 text-pink-400', category: 'DIGITAL' },
  { id: 'APP_GRAPHICS', label: 'App Graphics', icon: '📱', color: 'bg-cyan-100 text-cyan-700', category: 'DIGITAL' },
  { id: 'EBOOK_COVER', label: 'E-book Cover', icon: '📕', color: 'bg-amber-500/20 text-amber-400', category: 'DIGITAL' },
  { id: 'DIGITAL_AD', label: 'Digital Ad Creative', icon: '🎨', color: 'bg-red-500/20 text-red-400', category: 'DIGITAL' },
]

// ==================== BRANDING & IDENTITY ====================
const BRANDING_DESIGN_TYPES = [
  { id: 'LOGO_DESIGN', label: 'Logo Design', icon: '✨', color: 'bg-purple-500/20 text-purple-400', category: 'BRANDING' },
  { id: 'LOGO_REVISION', label: 'Logo Revision', icon: '🔄', color: 'bg-violet-100 text-violet-700', category: 'BRANDING' },
  { id: 'BRAND_GUIDELINES', label: 'Brand Guidelines', icon: '📋', color: 'bg-indigo-500/20 text-indigo-400', category: 'BRANDING' },
  { id: 'COLOR_PALETTE', label: 'Color Palette', icon: '🎨', color: 'bg-pink-500/20 text-pink-400', category: 'BRANDING' },
  { id: 'TYPOGRAPHY', label: 'Typography Selection', icon: '🔤', color: 'bg-slate-800/50 text-slate-200', category: 'BRANDING' },
  { id: 'BRAND_MOCKUP', label: 'Brand Mockups', icon: '📦', color: 'bg-amber-500/20 text-amber-400', category: 'BRANDING' },
  { id: 'STATIONERY_SET', label: 'Stationery Set', icon: '📝', color: 'bg-teal-500/20 text-teal-400', category: 'BRANDING' },
  { id: 'BRAND_PRESENTATION', label: 'Brand Presentation', icon: '📊', color: 'bg-blue-500/20 text-blue-400', category: 'BRANDING' },
]

// ==================== MARKETING COLLATERAL ====================
const MARKETING_DESIGN_TYPES = [
  { id: 'COMPANY_PROFILE', label: 'Company Profile', icon: '🏢', color: 'bg-blue-500/20 text-blue-400', category: 'MARKETING' },
  { id: 'PRODUCT_SHEET', label: 'Product Sheet', icon: '📄', color: 'bg-green-500/20 text-green-400', category: 'MARKETING' },
  { id: 'CASE_STUDY', label: 'Case Study Design', icon: '📊', color: 'bg-purple-500/20 text-purple-400', category: 'MARKETING' },
  { id: 'WHITE_PAPER', label: 'White Paper', icon: '📃', color: 'bg-slate-800/50 text-slate-200', category: 'MARKETING' },
  { id: 'REPORT_DESIGN', label: 'Report Design', icon: '📈', color: 'bg-indigo-500/20 text-indigo-400', category: 'MARKETING' },
  { id: 'PROPOSAL_DESIGN', label: 'Proposal Design', icon: '📋', color: 'bg-amber-500/20 text-amber-400', category: 'MARKETING' },
  { id: 'MEDIA_KIT', label: 'Media Kit', icon: '📦', color: 'bg-pink-500/20 text-pink-400', category: 'MARKETING' },
  { id: 'TRADE_SHOW', label: 'Trade Show Materials', icon: '🏪', color: 'bg-orange-500/20 text-orange-400', category: 'MARKETING' },
]

// ==================== PACKAGING DESIGN ====================
const PACKAGING_DESIGN_TYPES = [
  { id: 'BOX_DESIGN', label: 'Box Design', icon: '📦', color: 'bg-amber-500/20 text-amber-400', category: 'PACKAGING' },
  { id: 'LABEL_DESIGN', label: 'Product Label', icon: '🏷️', color: 'bg-green-500/20 text-green-400', category: 'PACKAGING' },
  { id: 'POUCH_DESIGN', label: 'Pouch/Bag Design', icon: '👜', color: 'bg-pink-500/20 text-pink-400', category: 'PACKAGING' },
  { id: 'BOTTLE_DESIGN', label: 'Bottle/Container', icon: '🍶', color: 'bg-blue-500/20 text-blue-400', category: 'PACKAGING' },
  { id: 'WRAPPER_DESIGN', label: 'Wrapper Design', icon: '🎁', color: 'bg-purple-500/20 text-purple-400', category: 'PACKAGING' },
  { id: 'DIELINE', label: 'Dieline Creation', icon: '✂️', color: 'bg-slate-800/50 text-slate-200', category: 'PACKAGING' },
  { id: 'MOCKUP_3D', label: '3D Mockup', icon: '🎲', color: 'bg-indigo-500/20 text-indigo-400', category: 'PACKAGING' },
]

// ==================== SIGNAGE & DISPLAY ====================
const SIGNAGE_DESIGN_TYPES = [
  { id: 'HOARDING', label: 'Hoarding/Billboard', icon: '🪧', color: 'bg-red-500/20 text-red-400', category: 'SIGNAGE' },
  { id: 'NEON_SIGN', label: 'Neon/LED Sign', icon: '💡', color: 'bg-yellow-500/20 text-yellow-400', category: 'SIGNAGE' },
  { id: 'DIRECTION_SIGN', label: 'Direction Signage', icon: '➡️', color: 'bg-blue-500/20 text-blue-400', category: 'SIGNAGE' },
  { id: 'WINDOW_GRAPHIC', label: 'Window Graphics', icon: '🪟', color: 'bg-cyan-100 text-cyan-700', category: 'SIGNAGE' },
  { id: 'FLOOR_GRAPHIC', label: 'Floor Graphics', icon: '⬇️', color: 'bg-green-500/20 text-green-400', category: 'SIGNAGE' },
  { id: 'VEHICLE_WRAP', label: 'Vehicle Wrap', icon: '🚗', color: 'bg-orange-500/20 text-orange-400', category: 'SIGNAGE' },
  { id: 'EXHIBITION_BOOTH', label: 'Exhibition Booth', icon: '🏪', color: 'bg-purple-500/20 text-purple-400', category: 'SIGNAGE' },
  { id: 'BACKDROP', label: 'Backdrop/Stage Design', icon: '🎭', color: 'bg-indigo-500/20 text-indigo-400', category: 'SIGNAGE' },
  { id: 'POP_DISPLAY', label: 'POP Display', icon: '🏷️', color: 'bg-pink-500/20 text-pink-400', category: 'SIGNAGE' },
]

// ==================== PRESENTATIONS ====================
const PRESENTATION_DESIGN_TYPES = [
  { id: 'PPT_TEMPLATE', label: 'PPT Template', icon: '📊', color: 'bg-orange-500/20 text-orange-400', category: 'PRESENTATION' },
  { id: 'PPT_DESIGN', label: 'Full Presentation', icon: '🎯', color: 'bg-blue-500/20 text-blue-400', category: 'PRESENTATION' },
  { id: 'PITCH_DECK', label: 'Pitch Deck', icon: '💼', color: 'bg-indigo-500/20 text-indigo-400', category: 'PRESENTATION' },
  { id: 'KEYNOTE', label: 'Keynote Design', icon: '🍎', color: 'bg-slate-800/50 text-slate-200', category: 'PRESENTATION' },
  { id: 'GOOGLE_SLIDES', label: 'Google Slides', icon: '📑', color: 'bg-yellow-500/20 text-yellow-400', category: 'PRESENTATION' },
]

// ==================== SOCIAL MEDIA GRAPHICS ====================
const SOCIAL_DESIGN_TYPES = [
  { id: 'IG_POST', label: 'Instagram Post', icon: '📸', color: 'bg-pink-500/20 text-pink-400', category: 'SOCIAL' },
  { id: 'IG_STORY', label: 'Instagram Story', icon: '📱', color: 'bg-purple-500/20 text-purple-400', category: 'SOCIAL' },
  { id: 'IG_CAROUSEL', label: 'Instagram Carousel', icon: '🎠', color: 'bg-fuchsia-100 text-fuchsia-700', category: 'SOCIAL' },
  { id: 'IG_HIGHLIGHT', label: 'Story Highlight Cover', icon: '⭕', color: 'bg-rose-100 text-rose-700', category: 'SOCIAL' },
  { id: 'FB_POST', label: 'Facebook Post', icon: '📘', color: 'bg-blue-500/20 text-blue-400', category: 'SOCIAL' },
  { id: 'FB_COVER', label: 'Facebook Cover', icon: '🖼️', color: 'bg-sky-100 text-sky-700', category: 'SOCIAL' },
  { id: 'FB_EVENT', label: 'Facebook Event Cover', icon: '📅', color: 'bg-indigo-500/20 text-indigo-400', category: 'SOCIAL' },
  { id: 'LI_POST', label: 'LinkedIn Post', icon: '💼', color: 'bg-cyan-100 text-cyan-700', category: 'SOCIAL' },
  { id: 'LI_BANNER', label: 'LinkedIn Banner', icon: '🏢', color: 'bg-teal-500/20 text-teal-400', category: 'SOCIAL' },
  { id: 'TWITTER_POST', label: 'Twitter/X Post', icon: '🐦', color: 'bg-slate-800/50 text-slate-200', category: 'SOCIAL' },
  { id: 'YT_THUMBNAIL', label: 'YouTube Thumbnail', icon: '▶️', color: 'bg-red-500/20 text-red-400', category: 'SOCIAL' },
  { id: 'YT_BANNER', label: 'YouTube Banner', icon: '📺', color: 'bg-orange-500/20 text-orange-400', category: 'SOCIAL' },
  { id: 'PINTEREST_PIN', label: 'Pinterest Pin', icon: '📌', color: 'bg-red-500/20 text-red-400', category: 'SOCIAL' },
  { id: 'WHATSAPP_STATUS', label: 'WhatsApp Status', icon: '💬', color: 'bg-green-500/20 text-green-400', category: 'SOCIAL' },
  { id: 'GBP_POST', label: 'Google Business Post', icon: '🔍', color: 'bg-amber-500/20 text-amber-400', category: 'SOCIAL' },
]

// Combine all design types
const ALL_DESIGN_TYPES = [
  ...PRINT_DESIGN_TYPES,
  ...DIGITAL_DESIGN_TYPES,
  ...BRANDING_DESIGN_TYPES,
  ...MARKETING_DESIGN_TYPES,
  ...PACKAGING_DESIGN_TYPES,
  ...SIGNAGE_DESIGN_TYPES,
  ...PRESENTATION_DESIGN_TYPES,
  ...SOCIAL_DESIGN_TYPES,
]

// Design type filters (includes ALL option)
const DESIGN_TYPE_FILTERS = [
  { id: 'ALL', label: 'All Design Types' },
  ...ALL_DESIGN_TYPES,
]

// ==================== STATUSES ====================
const STATUSES = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'BRIEF_RECEIVED', label: 'Brief Received', icon: '📥', color: 'bg-slate-800/50 text-slate-200' },
  { id: 'AWAITING_ASSETS', label: 'Awaiting Assets', icon: '⏳', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'IN_QUEUE', label: 'In Queue', icon: '📋', color: 'bg-sky-100 text-sky-700' },
  { id: 'DESIGNING', label: 'Designing', icon: '🎨', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'INTERNAL_REVIEW', label: 'Internal Review', icon: '👀', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'CHANGES_INTERNAL', label: 'Internal Changes', icon: '🔄', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'CLIENT_REVIEW', label: 'Client Review', icon: '👤', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'CHANGES_CLIENT', label: 'Client Changes', icon: '✏️', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'APPROVED', label: 'Approved', icon: '✅', color: 'bg-teal-500/20 text-teal-400' },
  { id: 'PRINT_READY', label: 'Print Ready', icon: '🖨️', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'SENT_TO_PRINT', label: 'Sent to Print', icon: '📤', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'DELIVERED', label: 'Delivered', icon: '🎉', color: 'bg-green-500/20 text-green-400' },
  { id: 'ON_HOLD', label: 'On Hold', icon: '⏸️', color: 'bg-gray-800/50 text-gray-200' },
  { id: 'CANCELLED', label: 'Cancelled', icon: '❌', color: 'bg-red-500/20 text-red-400' },
]

// ==================== PRIORITIES ====================
const PRIORITIES = [
  { id: 'CRITICAL', label: 'Critical', icon: '🔴', color: 'bg-red-500/20 text-red-400' },
  { id: 'HIGH', label: 'High', icon: '🟠', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'MEDIUM', label: 'Medium', icon: '🟡', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'LOW', label: 'Low', icon: '🟢', color: 'bg-green-500/20 text-green-400' },
]

// ==================== FILE FORMATS ====================
const FILE_FORMATS = [
  { id: 'AI', label: 'Adobe Illustrator (.ai)', icon: '🎨' },
  { id: 'PSD', label: 'Photoshop (.psd)', icon: '🖼️' },
  { id: 'PDF', label: 'PDF', icon: '📄' },
  { id: 'JPG', label: 'JPG/JPEG', icon: '🖼️' },
  { id: 'PNG', label: 'PNG', icon: '🖼️' },
  { id: 'SVG', label: 'SVG', icon: '📐' },
  { id: 'EPS', label: 'EPS', icon: '📊' },
  { id: 'INDD', label: 'InDesign (.indd)', icon: '📰' },
  { id: 'CDR', label: 'CorelDRAW (.cdr)', icon: '🎨' },
  { id: 'FIGMA', label: 'Figma', icon: '🎯' },
  { id: 'XD', label: 'Adobe XD', icon: '📱' },
  { id: 'CANVA', label: 'Canva', icon: '✨' },
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

interface PrintProject {
  id: string
  client: string
  clientType: string
  designType: string
  designCategory: string
  title: string
  description: string
  quantity: string
  dueDate: string
  deliveredDate: string | null
  status: string
  proofLink: string
  printFileLink: string
  assignedDesigner: string
  priority: string
  month: string
  fileFormats: string[]
  revisionCount: number
}

interface PrintDeliverable {
  id: string
  client: string
  deliverableType: string
  title: string
  dueDate: string
  deliveredDate: string | null
  status: 'PENDING' | 'DELIVERED' | 'DELAYED'
  proofLink: string
  month: string
}

const PRINT_PROJECTS: PrintProject[] = [
  { id: '1', client: 'Raj Hospital', clientType: 'HOSPITAL', designType: 'BROCHURE', designCategory: 'PRINT', title: 'Hospital Services Brochure', description: '8-page brochure for all departments', quantity: '500 pcs', dueDate: '2024-03-15', deliveredDate: null, status: 'DESIGNING', proofLink: '', printFileLink: '', assignedDesigner: 'Rohit', priority: 'HIGH', month: 'MAR', fileFormats: ['AI', 'PDF'], revisionCount: 0 },
  { id: '2', client: 'Vision Eye Centre', clientType: 'CLINIC', designType: 'STANDEE', designCategory: 'PRINT', title: 'LASIK Awareness Standee', description: 'Roll-up standee for clinic', quantity: '2 pcs', dueDate: '2024-03-10', deliveredDate: '2024-03-09', status: 'DELIVERED', proofLink: 'https://drive.google.com/printdesigns/standee', printFileLink: 'https://drive.google.com/printready/standee.pdf', assignedDesigner: 'Meera', priority: 'MEDIUM', month: 'MAR', fileFormats: ['AI', 'PDF', 'JPG'], revisionCount: 1 },
  { id: '3', client: 'Apollo Hospitals Delhi', clientType: 'HOSPITAL', designType: 'FLYER', designCategory: 'PRINT', title: 'Health Camp Flyer', description: 'A5 flyer for camp promotion', quantity: '1000 pcs', dueDate: '2024-03-08', deliveredDate: '2024-03-07', status: 'DELIVERED', proofLink: 'https://drive.google.com/printdesigns/flyer', printFileLink: 'https://drive.google.com/printready/flyer.pdf', assignedDesigner: 'Rohit', priority: 'HIGH', month: 'MAR', fileFormats: ['AI', 'PDF'], revisionCount: 2 },
  { id: '4', client: 'Dr. Aloy Mukherjee', clientType: 'DOCTOR', designType: 'VISITING_CARD', designCategory: 'PRINT', title: 'Doctor Visiting Cards', description: 'Premium visiting cards', quantity: '200 pcs', dueDate: '2024-03-12', deliveredDate: null, status: 'CLIENT_REVIEW', proofLink: 'https://drive.google.com/printdesigns/vc', printFileLink: '', assignedDesigner: 'Kavya', priority: 'LOW', month: 'MAR', fileFormats: ['AI', 'PDF'], revisionCount: 0 },
  { id: '5', client: 'GNA Face & Dental', clientType: 'DENTAL', designType: 'BANNER', designCategory: 'PRINT', title: 'Clinic Banner Design', description: 'Outdoor flex banner 8x4 ft', quantity: '1 pc', dueDate: '2024-03-18', deliveredDate: null, status: 'BRIEF_RECEIVED', proofLink: '', printFileLink: '', assignedDesigner: 'Meera', priority: 'MEDIUM', month: 'MAR', fileFormats: [], revisionCount: 0 },
  { id: '6', client: 'Raj Hospital', clientType: 'HOSPITAL', designType: 'IG_CAROUSEL', designCategory: 'SOCIAL', title: 'Doctor Day Carousel', description: '5-slide carousel for Instagram', quantity: 'N/A', dueDate: '2024-03-20', deliveredDate: null, status: 'DESIGNING', proofLink: '', printFileLink: '', assignedDesigner: 'Kavya', priority: 'MEDIUM', month: 'MAR', fileFormats: ['PSD', 'JPG'], revisionCount: 0 },
  { id: '7', client: 'Lifecare Hospital Kenya', clientType: 'HOSPITAL', designType: 'CATALOGUE', designCategory: 'PRINT', title: 'Services Catalogue', description: '24-page catalogue', quantity: '200 pcs', dueDate: '2024-03-20', deliveredDate: null, status: 'INTERNAL_REVIEW', proofLink: 'https://drive.google.com/printdesigns/catalogue', printFileLink: '', assignedDesigner: 'Kavya', priority: 'HIGH', month: 'MAR', fileFormats: ['INDD', 'PDF'], revisionCount: 1 },
  { id: '8', client: 'Apollo Hospitals Delhi', clientType: 'HOSPITAL', designType: 'YT_THUMBNAIL', designCategory: 'SOCIAL', title: 'YouTube Video Thumbnails', description: 'Thumbnails for 5 videos', quantity: '5 pcs', dueDate: '2024-03-14', deliveredDate: null, status: 'APPROVED', proofLink: 'https://drive.google.com/thumbnails', printFileLink: '', assignedDesigner: 'Rohit', priority: 'HIGH', month: 'MAR', fileFormats: ['PSD', 'JPG'], revisionCount: 0 },
]

const PRINT_DELIVERABLES: PrintDeliverable[] = [
  { id: '1', client: 'Vision Eye Centre', deliverableType: 'Standee', title: 'LASIK Awareness Standee', dueDate: '2024-03-10', deliveredDate: '2024-03-09', status: 'DELIVERED', proofLink: 'https://drive.google.com/printdesigns/standee', month: 'MAR' },
  { id: '2', client: 'Apollo Hospitals Delhi', deliverableType: 'Flyer', title: 'Health Camp Flyer', dueDate: '2024-03-08', deliveredDate: '2024-03-07', status: 'DELIVERED', proofLink: 'https://drive.google.com/printdesigns/flyer', month: 'MAR' },
  { id: '3', client: 'Raj Hospital', deliverableType: 'Brochure', title: 'Hospital Services Brochure', dueDate: '2024-03-15', deliveredDate: null, status: 'PENDING', proofLink: '', month: 'MAR' },
  { id: '4', client: 'Dr. Aloy Mukherjee', deliverableType: 'Visiting Card', title: 'Doctor Visiting Cards', dueDate: '2024-03-12', deliveredDate: null, status: 'PENDING', proofLink: '', month: 'MAR' },
]

export default function PrintDesigningPage() {
  const [projects] = useState(PRINT_PROJECTS)
  const [deliverables] = useState(PRINT_DELIVERABLES)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [monthFilter, setMonthFilter] = useState<string>('MAR')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredProjects = projects.filter(p => {
    const matchesMonth = p.month === monthFilter
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || p.designCategory === categoryFilter
    const matchesType = typeFilter === 'ALL' || p.designType === typeFilter
    const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter
    return matchesMonth && matchesStatus && matchesCategory && matchesType && matchesPriority
  })

  const monthProjects = projects.filter(p => p.month === monthFilter)
  const totalProjects = monthProjects.length
  const delivered = monthProjects.filter(p => p.status === 'DELIVERED').length
  const inProgress = monthProjects.filter(p => ['DESIGNING', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'CHANGES_INTERNAL', 'CHANGES_CLIENT'].includes(p.status)).length
  const pendingApproval = monthProjects.filter(p => p.status === 'APPROVED' || p.status === 'PRINT_READY').length

  const getDesignTypeInfo = (typeId: string) => {
    return ALL_DESIGN_TYPES.find(t => t.id === typeId) || { label: typeId, color: 'bg-slate-800/50 text-slate-200', icon: '📄' }
  }

  const getStatusInfo = (statusId: string) => {
    return STATUSES.find(s => s.id === statusId) || { label: statusId, color: 'bg-slate-800/50 text-slate-200', icon: '📄' }
  }

  const getPriorityInfo = (priorityId: string) => {
    return PRIORITIES.find(p => p.id === priorityId) || { label: priorityId, color: 'bg-slate-800/50 text-slate-200', icon: '⚪' }
  }

  const getCategoryInfo = (categoryId: string) => {
    return DESIGN_CATEGORIES.find(c => c.id === categoryId) || { label: categoryId, color: 'bg-slate-800/50 text-slate-200', icon: '📁' }
  }

  // Get task types filtered by category
  const getTaskTypesByCategory = (category: string) => {
    if (category === 'ALL') return ALL_DESIGN_TYPES
    return ALL_DESIGN_TYPES.filter(t => t.category === category)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Graphic Design Studio</h1>
            <p className="text-orange-200">Print materials, digital graphics, branding & social media</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 glass-card text-orange-600 rounded-lg font-medium hover:bg-orange-500/10"
          >
            + New Design Request
          </button>
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
                ? 'bg-orange-500 text-white'
                : 'glass-card text-slate-300 border border-white/10 hover:border-orange-300'
            }`}
          >
            {month} 2024
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/40 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-slate-300">Total Projects</p>
          <p className="text-3xl font-bold text-slate-200">{totalProjects}</p>
          <p className="text-xs text-slate-400">this month</p>
        </div>
        <div className="bg-blue-500/10 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-400">{inProgress}</p>
          <p className="text-xs text-blue-500">designing/review</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-400">Ready for Print</p>
          <p className="text-3xl font-bold text-amber-400">{pendingApproval}</p>
          <p className="text-xs text-amber-500">approved designs</p>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-400">Delivered</p>
          <p className="text-3xl font-bold text-green-400">{delivered}</p>
          <p className="text-xs text-green-500">completed</p>
        </div>
      </div>

      {/* Category Quick Stats */}
      <div className="grid grid-cols-8 gap-2">
        {DESIGN_CATEGORIES.filter(c => c.id !== 'ALL').map(category => (
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
            <div className="text-lg font-bold">{monthProjects.filter(p => p.designCategory === category.id).length}</div>
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
              {DESIGN_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.id === 'ALL' ? cat.label : `${cat.icon} ${cat.label}`}</option>
              ))}
            </select>
          </div>

          {/* Design Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Design Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              <option value="ALL">All Types</option>
              {getTaskTypesByCategory(categoryFilter).map(type => (
                <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm"
            >
              {STATUSES.map(status => (
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
          <h2 className="font-semibold text-white">Design Projects ({filteredProjects.length})</h2>
          <div className="flex gap-2">
            <span className="text-xs text-slate-400">{filteredProjects.length} of {monthProjects.length} shown</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/40">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT / PROJECT</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">CATEGORY</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">TYPE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">QUANTITY</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DUE DATE</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">STATUS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">DESIGNER</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PRIORITY</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">REVISIONS</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PROOF</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">FINAL</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => {
                const typeInfo = getDesignTypeInfo(project.designType)
                const statusInfo = getStatusInfo(project.status)
                const priorityInfo = getPriorityInfo(project.priority)
                const categoryInfo = getCategoryInfo(project.designCategory)

                return (
                  <tr key={project.id} className="border-b border-white/5 hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{project.client}</p>
                      <p className="text-sm text-slate-400">{project.title}</p>
                      <p className="text-xs text-slate-400">{project.description}</p>
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
                    <td className="py-3 px-4 text-center text-sm text-slate-300">{project.quantity}</td>
                    <td className="py-3 px-4 text-center text-sm text-slate-300">
                      {new Date(project.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-slate-300">{project.assignedDesigner}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${priorityInfo.color}`}>
                        {priorityInfo.icon} {priorityInfo.label}
                      </span>
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
                        <a href={project.proofLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {project.printFileLink ? (
                        <a href={project.printFileLink} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-400 text-sm font-medium">
                          Download
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

      {/* Recent Deliverables */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Deliverables</h2>
        </div>
        <div className="divide-y divide-white/10">
          {deliverables.filter(d => d.month === monthFilter).map(deliverable => (
            <div key={deliverable.id} className="p-4 hover:bg-slate-900/40">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">{deliverable.title}</h3>
                  <p className="text-sm text-slate-400">{deliverable.client} • {deliverable.deliverableType}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusInfo(deliverable.status).color}`}>
                  {deliverable.status}
                </span>
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
                  <a href={deliverable.proofLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">
                    View Proof →
                  </a>
                ) : (
                  <span className="text-slate-400">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Design Guidelines */}
      <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
        <h3 className="font-semibold text-orange-800 mb-3">Design Guidelines</h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-orange-700">
          <div>
            <p className="font-medium mb-1">File Formats</p>
            <ul className="space-y-1">
              <li>• Print: PDF (CMYK)</li>
              <li>• Editable: AI/PSD/INDD</li>
              <li>• Preview: JPG/PNG</li>
              <li>• Web: SVG/PNG</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Resolution</p>
            <ul className="space-y-1">
              <li>• Print: 300 DPI minimum</li>
              <li>• Large format: 150 DPI</li>
              <li>• Digital: 72 DPI</li>
              <li>• Bleed: 3mm all sides</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Color Mode</p>
            <ul className="space-y-1">
              <li>• Print: CMYK</li>
              <li>• Digital: RGB/sRGB</li>
              <li>• Pantone for logos</li>
              <li>• Rich black: C60M40Y40K100</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Turnaround</p>
            <ul className="space-y-1">
              <li>• First proof: 2 days</li>
              <li>• Revisions: 24hrs each</li>
              <li>• Max 2 rounds included</li>
              <li>• Print-ready: 24hrs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Design Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">New Design Request</h2>
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
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Design Category</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  {DESIGN_CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Design Type</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  {ALL_DESIGN_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Project Title</label>
                <input type="text" className="w-full px-3 py-2 border border-white/10 rounded-lg" placeholder="Design project title" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border border-white/10 rounded-lg" rows={3} placeholder="Design requirements and specifications" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Quantity</label>
                <input type="text" className="w-full px-3 py-2 border border-white/10 rounded-lg" placeholder="e.g., 500 pcs, N/A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Due Date</label>
                <input type="date" className="w-full px-3 py-2 border border-white/10 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Assigned Designer</label>
                <select className="w-full px-3 py-2 border border-white/10 rounded-lg">
                  <option>Rohit</option>
                  <option>Meera</option>
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
                <label className="block text-sm font-medium text-slate-200 mb-1">File Formats Required</label>
                <div className="flex flex-wrap gap-2">
                  {FILE_FORMATS.map(format => (
                    <label key={format.id} className="flex items-center gap-1 px-2 py-1 bg-slate-900/40 rounded border border-white/10 cursor-pointer hover:bg-slate-800/50">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{format.icon} {format.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-300 hover:text-white">
                Cancel
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
