'use client'

import { useState, useRef } from 'react'

// ==================== TYPES ====================
interface ServiceTemplateData {
    id: string
    name: string
    category: string
    subcategory: string
    description: string
    deliverables: string
    pricing: string
    inclusions: string
    exclusions: string
    revisionPolicy: string
}

interface FormData {
    // Step 1: Client Info
    clientSegment: string // INDIAN, INTERNATIONAL, MYKOHI_WHITELABEL
    companyName: string
    contactName: string
    contactEmail: string
    contactPhone: string
    address: string
    gstNumber: string // Only required for Indian Segment
    gstDocumentUrl: string // URL for GST document (Google Drive/Dropbox link)
    hasGST: boolean
    businessType: string
    industry: string
    // Mykohi Specific Fields
    mykohiSpecialty: string // e.g. Anxiety, Depression, Couples Therapy
    mykohiTargetRegion: string

    // Step 2: Service Scope
    selectedServices: string[]
    customScope: string
    commencementDate: string
    contractDuration: string
    monthlyRetainer: string
    advanceAmount: string
    isEnterprise: boolean
    poNumber: string

    // Step 3: SLA
    clientSignature: string
}

// ==================== SERVICE TEMPLATES ====================
const SERVICE_TEMPLATES = {
    ONE_TIME: [
        {
            id: 'website_design',
            name: 'Website Design & Development',
            price: 'Starting ₹50,000',
            deliverables: ['Custom responsive website', 'Up to 10 pages', 'Contact form integration', 'SEO-ready structure', 'Mobile optimization', '2 rounds of revisions'],
            timeline: '4-6 weeks',
        },
        {
            id: 'logo_brand',
            name: 'Logo & Brand Identity',
            price: 'Starting ₹15,000',
            deliverables: ['3 logo concepts', 'Brand color palette', 'Typography selection', 'Brand guidelines PDF', 'All source files', '3 rounds of revisions'],
            timeline: '2-3 weeks',
        },
        {
            id: 'brand_kit',
            name: 'Complete Brand Kit',
            price: 'Starting ₹35,000',
            deliverables: ['Logo design', 'Business cards', 'Letterhead & envelope', 'Email signature', 'Social media templates', 'Brand guidelines document'],
            timeline: '3-4 weeks',
        },
        {
            id: 'app_uiux',
            name: 'App UI/UX Design',
            price: 'Starting ₹75,000',
            deliverables: ['User research & personas', 'Wireframes', 'High-fidelity mockups', 'Interactive prototype', 'Design system', 'Developer handoff package'],
            timeline: '6-8 weeks',
        },
    ],
    RECURRING: [
        {
            id: 'social_media',
            name: 'Social Media Management',
            price: '₹25,000/month',
            deliverables: ['12 static posts/month', '8 reels/month', '4 LinkedIn posts/month', 'Captions & hashtags', 'Community management', 'Monthly analytics report'],
            timeline: 'Monthly',
        },
        {
            id: 'seo',
            name: 'SEO (Search Engine Optimization)',
            price: '₹20,000/month',
            deliverables: ['25-30 keyword tracking', 'On-page optimization', 'Technical SEO audit', 'Content recommendations', 'Link building', 'Monthly ranking report'],
            timeline: 'Monthly',
        },
        {
            id: 'google_ads',
            name: 'Google Ads Management',
            price: '₹15,000/month + Ad Spend',
            deliverables: ['Campaign setup & optimization', 'Keyword research', 'Ad copy creation', 'Landing page recommendations', 'Conversion tracking', 'Weekly performance reports'],
            timeline: 'Monthly',
        },
        {
            id: 'meta_ads',
            name: 'Meta Ads Management',
            price: '₹15,000/month + Ad Spend',
            deliverables: ['Facebook & Instagram ads', 'Audience targeting', 'Creative design', 'A/B testing', 'Retargeting setup', 'Weekly performance reports'],
            timeline: 'Monthly',
        },
        {
            id: 'content_marketing',
            name: 'Content Marketing',
            price: '₹20,000/month',
            deliverables: ['4 blog posts/month', 'Content calendar', 'SEO-optimized writing', 'Content distribution', 'Performance tracking', 'Quarterly content strategy review'],
            timeline: 'Monthly',
        },
        {
            id: 'video_marketing',
            name: 'Video Marketing',
            price: '₹30,000/month',
            deliverables: ['4 short-form videos', '1 long-form video', 'Script writing', 'Editing & post-production', 'Thumbnail design', 'YouTube/Social optimization'],
            timeline: 'Monthly',
        },
    ],
    ANNUAL: [
        {
            id: 'server_maintenance',
            name: 'Server & Hosting Maintenance',
            price: '₹5,000/month (billed annually)',
            deliverables: ['Server monitoring 24/7', 'Security patches', 'SSL certificate management', 'Backup management', 'Uptime guarantee 99.9%', 'Emergency support'],
            timeline: 'Annual',
        },
        {
            id: 'website_maintenance',
            name: 'Website Maintenance',
            price: '₹8,000/month (billed annually)',
            deliverables: ['Regular updates & patches', 'Content updates (up to 10/month)', 'Bug fixes', 'Performance optimization', 'Security monitoring', 'Monthly health report'],
            timeline: 'Annual',
        },
        {
            id: 'domain_hosting',
            name: 'Domain & Hosting',
            price: '₹12,000/year',
            deliverables: ['Domain renewal', 'Premium hosting', 'Email hosting', 'DNS management', 'CDN setup', 'Daily backups'],
            timeline: 'Annual',
        },
    ],
    AI_SAAS: [
        {
            id: 'ai_chatbot',
            name: 'AI Chatbot Solution',
            price: '₹25,000/month',
            deliverables: ['Custom AI chatbot', 'Knowledge base training', 'Multi-channel deployment', 'Analytics dashboard', 'Monthly optimization', 'Priority support'],
            timeline: 'Monthly',
        },
        {
            id: 'lead_gen_ai',
            name: 'AI Lead Generation',
            price: '₹35,000/month',
            deliverables: ['AI-powered lead scoring', 'Automated outreach', 'CRM integration', 'Predictive analytics', 'A/B testing automation', 'Weekly intelligence reports'],
            timeline: 'Monthly',
        },
        {
            id: 'social_ai',
            name: 'Social Media AI',
            price: '₹20,000/month',
            deliverables: ['AI content generation', 'Optimal posting times', 'Sentiment analysis', 'Competitor tracking', 'Trend prediction', 'Automated engagement'],
            timeline: 'Monthly',
        },
    ],
}

const CATEGORIES = [
    { id: 'ONE_TIME', label: 'One-Time', iconType: 'target', description: 'Website, Logo, Brand' },
    { id: 'RECURRING', label: 'Recurring (Monthly)', iconType: 'refresh', description: 'SMM, SEO, Ads' },
    { id: 'ANNUAL', label: 'Annual', iconType: 'calendar', description: 'Maintenance, Hosting' },
    { id: 'AI_SAAS', label: 'AI SaaS', iconType: 'chip', description: 'Chatbot, Lead Gen' },
]

const renderCategoryIcon = (iconType: string, className: string = "w-5 h-5") => {
    switch (iconType) {
        case 'target':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        case 'refresh':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        case 'calendar':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        case 'chip':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
        default:
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
}

const INDUSTRIES = [
    'Healthcare', 'Real Estate', 'E-commerce', 'SaaS/Tech', 'Education', 'Finance',
    'Hospitality', 'Retail', 'Manufacturing', 'Legal', 'Food & Beverage', 'Fashion',
    'Fitness & Wellness', 'Automotive', 'Travel', 'Non-Profit', 'Other',
]

// ==================== MAIN COMPONENT ====================
export default function PaymentOnboardingWizard() {
    const [step, setStep] = useState(1)
    const [activeCategory, setActiveCategory] = useState('RECURRING')
    const signatureRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

    const [form, setForm] = useState<FormData>({
        clientSegment: 'INDIAN',
        companyName: '', contactName: '', contactEmail: '', contactPhone: '',
        address: '', gstNumber: '', gstDocumentUrl: '', hasGST: false,
        businessType: '', industry: '',
        mykohiSpecialty: '', mykohiTargetRegion: '',
        selectedServices: [], customScope: '', commencementDate: '',
        contractDuration: '12_MONTHS', monthlyRetainer: '', advanceAmount: '',
        isEnterprise: false, poNumber: '',
        clientSignature: '',
    })

    const entityType = form.clientSegment === 'INDIAN' && form.hasGST ? 'ATZ_MEDAPPZ' : 'BRANDING_PIONEERS'
    const entityName = form.clientSegment === 'INDIAN' && form.hasGST ? 'ATZ Medappz Pvt Ltd' : 'Branding Pioneers'

    const updateForm = (updates: Partial<FormData>) => setForm(prev => ({ ...prev, ...updates }))

    const toggleService = (id: string) => {
        const current = form.selectedServices
        if (current.includes(id)) {
            updateForm({ selectedServices: current.filter(s => s !== id) })
        } else {
            updateForm({ selectedServices: [...current, id] })
        }
    }

    const allServices = [...SERVICE_TEMPLATES.ONE_TIME, ...SERVICE_TEMPLATES.RECURRING, ...SERVICE_TEMPLATES.ANNUAL, ...SERVICE_TEMPLATES.AI_SAAS]
    const selectedServiceDetails = allServices.filter(s => form.selectedServices.includes(s.id))

    // ================ SIGNATURE CANVAS ================
    const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = signatureRef.current
        if (!canvas) return
        setIsDrawing(true)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const rect = canvas.getBoundingClientRect()
        ctx.beginPath()
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return
        const canvas = signatureRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const rect = canvas.getBoundingClientRect()
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()
    }

    const endDraw = () => {
        setIsDrawing(false)
        const canvas = signatureRef.current
        if (canvas) {
            updateForm({ clientSignature: canvas.toDataURL() })
        }
    }

    const clearSignature = () => {
        const canvas = signatureRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        updateForm({ clientSignature: '' })
    }

    // ================ STEP NAVIGATION ================
    const steps = [
        { num: 1, label: 'Client Information', iconType: 'clipboard' },
        { num: 2, label: 'Service Scope & Pricing', iconType: 'package' },
        { num: 3, label: 'SLA Document', iconType: 'document' },
        { num: 4, label: 'Proforma Invoice', iconType: 'receipt' },
        { num: 5, label: 'Confirmation', iconType: 'check' },
    ]

    const renderStepIcon = (iconType: string, className: string = "w-4 h-4") => {
        switch (iconType) {
            case 'clipboard':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            case 'package':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            case 'document':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            case 'receipt':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>
            case 'check':
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            default:
                return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        }
    }

    const gstRate = form.hasGST ? 0.18 : 0
    const retainer = parseFloat(form.monthlyRetainer) || 0
    const advance = parseFloat(form.advanceAmount) || retainer
    const gstAmount = advance * gstRate
    const totalInvoice = advance + gstAmount

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Payment Onboarding</h1>
                <p className="text-slate-400 mt-1">Accounts — Client SLA & PI Generation</p>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                    <div key={s.num} className="flex items-center flex-1">
                        <button
                            onClick={() => s.num < step && setStep(s.num)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all w-full ${step === s.num
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                                : step > s.num
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                    : 'bg-white/5 backdrop-blur-sm text-slate-400 border border-white/5'
                                }`}
                        >
                            <span>{step > s.num ? renderStepIcon('check') : renderStepIcon(s.iconType)}</span>
                            <span className="hidden lg:inline truncate">{s.label}</span>
                        </button>
                        {i < steps.length - 1 && <div className={`w-6 h-0.5 mx-1 ${step > s.num ? 'bg-emerald-500/50' : 'bg-white/10 backdrop-blur-sm'}`} />}
                    </div>
                ))}
            </div>

            {/* =============== STEP 1: CLIENT INFO =============== */}
            {step === 1 && (
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('clipboard', 'w-5 h-5')} Client Information</h2>

                    {/* Client Segment Selector */}
                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                        <label className="text-sm text-slate-400 mb-2 block font-medium">Select Client Segment *</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => updateForm({ clientSegment: 'INDIAN', hasGST: false })}
                                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${form.clientSegment === 'INDIAN'
                                    ? 'bg-blue-600/20 border-blue-500 text-blue-100 border-2'
                                    : 'bg-white/5 backdrop-blur-sm border-white/10 text-slate-400 border hover:bg-white/10'}`}
                            >
                                <div className="font-semibold mb-1 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> Indian Client</div>
                                <div className="text-xs opacity-70">INR Billing, standard SLA, local constraints.</div>
                            </button>
                            <button
                                onClick={() => updateForm({ clientSegment: 'INTERNATIONAL', hasGST: false })}
                                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${form.clientSegment === 'INTERNATIONAL'
                                    ? 'bg-purple-600/20 border-purple-500 text-purple-100 border-2'
                                    : 'bg-white/5 backdrop-blur-sm border-white/10 text-slate-400 border hover:bg-white/10'}`}
                            >
                                <div className="font-semibold mb-1 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> International Client</div>
                                <div className="text-xs opacity-70">USD Billing, GST Exempt, Intl. SLA.</div>
                            </button>
                            <button
                                onClick={() => updateForm({ clientSegment: 'MYKOHI_WHITELABEL', hasGST: false })}
                                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${form.clientSegment === 'MYKOHI_WHITELABEL'
                                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-100 border-2'
                                    : 'bg-white/5 backdrop-blur-sm border-white/10 text-slate-400 border hover:bg-white/10'}`}
                            >
                                <div className="font-semibold mb-1 flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg> Mykohi (Whitelabel)</div>
                                <div className="text-xs opacity-70">Mental Health focus, portal access, B2B billing.</div>
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Company / Practice Name *</label>
                            <input type="text" value={form.companyName} onChange={e => updateForm({ companyName: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                placeholder={form.clientSegment === 'MYKOHI_WHITELABEL' ? 'Enter therapist or clinic name' : 'Enter company/brand name'} />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Contact Full Name *</label>
                            <input type="text" value={form.contactName} onChange={e => updateForm({ contactName: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                placeholder="Full name of contact person" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Email</label>
                            <input type="email" value={form.contactEmail} onChange={e => updateForm({ contactEmail: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                placeholder="email@company.com" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Phone</label>
                            <input type="tel" value={form.contactPhone} onChange={e => updateForm({ contactPhone: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                placeholder="+XX XXXXX XXXXX" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Address *</label>
                        <textarea value={form.address} onChange={e => updateForm({ address: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none h-20 resize-none"
                            placeholder="Headquarters or clinic address" />
                    </div>

                    {/* Mykohi Specific Section */}
                    {form.clientSegment === 'MYKOHI_WHITELABEL' && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-4">
                            <h3 className="text-emerald-400 font-medium text-sm flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> Mental Health Practice Details (Mykohi Only)</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Primary Specialty</label>
                                    <input type="text" value={form.mykohiSpecialty} onChange={e => updateForm({ mykohiSpecialty: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                                        placeholder="e.g. Anxiety, Couples Therapy, EMDR" />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Target Demographics / Region</label>
                                    <input type="text" value={form.mykohiTargetRegion} onChange={e => updateForm({ mykohiTargetRegion: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                                        placeholder="e.g. Teens in NYC, Remote UK" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GST Section - Only for Indian Segment */}
                    {form.clientSegment === 'INDIAN' && (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <label className="flex items-center gap-3 mb-3">
                                <input type="checkbox" checked={form.hasGST} onChange={e => updateForm({ hasGST: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 backdrop-blur-sm border-white/20 text-blue-500 focus:ring-blue-500/50" />
                                <span className="text-white font-medium">Client has GST registration</span>
                            </label>
                            {form.hasGST && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">GST Number</label>
                                        <input type="text" value={form.gstNumber} onChange={e => {
                                            const val = e.target.value.toUpperCase()
                                            updateForm({ gstNumber: val })
                                        }}
                                            pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                                            maxLength={15}
                                            className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                            placeholder="22AAAAA0000A1Z5" />
                                        {form.gstNumber && form.gstNumber.length === 15 && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber) && (
                                            <p className="text-xs text-red-400 mt-1">Invalid GST format</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-400 mb-1 block">GST Document URL</label>
                                        <input type="url" value={form.gstDocumentUrl || ''} onChange={e => updateForm({ gstDocumentUrl: e.target.value })}
                                            placeholder="https://drive.google.com/..."
                                            className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
                                        <p className="text-xs text-slate-400 mt-1">Upload to Google Drive and paste link</p>
                                    </div>
                                </div>
                            )}
                            <div className={`mt-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${form.hasGST ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Indian Entity: <strong>{entityName}</strong> — {form.hasGST ? 'GST invoice with 18% GST will be generated.' : 'Non-GST invoice will be generated.'}
                            </div>
                        </div>
                    )}

                    {/* Internal / Mykohi Disclaimer */}
                    {form.clientSegment === 'INTERNATIONAL' && (
                        <div className="bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-xl p-4 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span><strong>International Entity: Branding Pioneers</strong> — A USD invoice with 0% Export GST will be generated via Stripe/Swift.</span>
                        </div>
                    )}
                    {form.clientSegment === 'MYKOHI_WHITELABEL' && (
                        <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl p-4 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span><strong>Whitelabel B2B: Branding Pioneers (Backend)</strong> — An individual invoice will NOT be generated for this end-client. A Whitelabeled Client Portal link & Service Delivery Agreement will be created.</span>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Business Type</label>
                            <select value={form.businessType} onChange={e => updateForm({ businessType: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none [&>option]:text-white [&>option]:glass-card">
                                <option value="">Select...</option>
                                <option value="B2B">B2B</option>
                                <option value="B2C">B2C</option>
                                <option value="D2C">D2C</option>
                                <option value="B2B2C">B2B2C</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Industry</label>
                            <select value={form.industry} onChange={e => updateForm({ industry: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none [&>option]:text-white [&>option]:glass-card">
                                <option value="">Select industry...</option>
                                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => setStep(2)} disabled={!form.companyName || !form.contactName}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Next: Service Scope →
                        </button>
                    </div>
                </div>
            )}

            {/* =============== STEP 2: SERVICE SCOPE =============== */}
            {step === 2 && (
                <div className="space-y-4">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                        {CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 ${activeCategory === cat.id
                                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}>
                                <span>{renderCategoryIcon(cat.iconType, 'w-4 h-4')}</span>
                                <span className="hidden md:inline">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Service Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {(SERVICE_TEMPLATES[activeCategory as keyof typeof SERVICE_TEMPLATES] ?? []).map((svc) => {
                            const isSelected = form.selectedServices.includes(svc.id)
                            return (
                                <div key={svc.id}
                                    onClick={() => toggleService(svc.id)}
                                    className={`bg-white/5 backdrop-blur-sm backdrop-blur-xl border rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/10 ${isSelected ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10'
                                        }`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-white">{svc.name}</h3>
                                            <p className="text-sm text-blue-400 font-medium mt-0.5">{svc.price}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/20'
                                            }`}>
                                            {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                    </div>
                                    <ul className="space-y-1">
                                        {svc.deliverables.map((d: string, i: number) => (
                                            <li key={`deliverable-${d}-${i}`} className="text-xs text-slate-400 flex items-start gap-2">
                                                <span className="text-emerald-400 mt-0.5">•</span> {d}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>{svc.timeline}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Selected Summary & Pricing */}
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">{renderStepIcon('package', 'w-5 h-5')} Selected Services ({form.selectedServices.length})</h3>
                        {selectedServiceDetails.length === 0 ? (
                            <p className="text-slate-400 text-sm">No services selected yet</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedServiceDetails.map(s => (
                                    <span key={s.id} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/20 flex items-center gap-2">
                                        {s.name}
                                        <button onClick={() => toggleService(s.id)} className="hover:text-red-300">×</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Custom Scope Notes (paste scope details)</label>
                            <textarea value={form.customScope} onChange={e => updateForm({ customScope: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none h-24 resize-none"
                                placeholder="Paste detailed scope of work deliverables finalized..." />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Commencement Date *</label>
                                <input type="date" value={form.commencementDate} onChange={e => updateForm({ commencementDate: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Contract Duration</label>
                                <select value={form.contractDuration} onChange={e => updateForm({ contractDuration: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:outline-none [&>option]:text-white [&>option]:glass-card">
                                    <option value="3_MONTHS">3 Months</option>
                                    <option value="6_MONTHS">6 Months</option>
                                    <option value="12_MONTHS">12 Months</option>
                                    <option value="CUSTOM">Custom</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Monthly Retainer (₹) *</label>
                                <input type="number" value={form.monthlyRetainer} onChange={e => updateForm({ monthlyRetainer: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                    placeholder="e.g. 70000" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Advance Amount (₹)</label>
                                <input type="number" value={form.advanceAmount} onChange={e => updateForm({ advanceAmount: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                    placeholder="Same as retainer if blank" />
                            </div>
                        </div>

                        {/* Enterprise PO */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" checked={form.isEnterprise} onChange={e => updateForm({ isEnterprise: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 backdrop-blur-sm border-white/20 text-purple-500" />
                                <span className="text-white font-medium">Enterprise Client — Requires Purchase Order</span>
                            </label>
                            {form.isEnterprise && (
                                <div className="mt-3">
                                    <input type="text" value={form.poNumber} onChange={e => updateForm({ poNumber: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                                        placeholder="Enter PO Number or upload PO document" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">
                            ← Back
                        </button>
                        <button onClick={() => setStep(3)} disabled={form.selectedServices.length === 0 || !form.monthlyRetainer}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Next: Generate SLA →
                        </button>
                    </div>
                </div>
            )}

            {/* =============== STEP 3: AUTO-GENERATED SLA =============== */}
            {step === 3 && (
                <div className="space-y-4">
                    <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        {/* SLA Header */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border-b border-white/10">
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-white">
                                    {form.clientSegment === 'MYKOHI_WHITELABEL' ? 'Whitelabel Service Delivery Agreement' : 'Digital Services Agreement'}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">{entityName}</p>
                            </div>
                        </div>

                        {/* SLA Body */}
                        <div className="p-6 space-y-6 text-sm text-slate-300 leading-relaxed">
                            {/* Parties */}
                            <div>
                                <h3 className="text-white font-semibold text-base mb-2">Parties</h3>
                                <p>This Agreement is entered into by <strong className="text-white">{entityName}</strong> (&quot;Agency&quot;),
                                    with its registered office at 84, Ground Floor, Supreme Coworks, Sector 32, Gurgaon 122001,
                                    and <strong className="text-white">{form.companyName || '[Client Name]'}</strong> (&quot;Client&quot;),
                                    with its registered office at <strong className="text-white">{form.address || '[Client Address]'}</strong>,
                                    collectively referred to as the &quot;Parties&quot;.</p>
                            </div>

                            {/* Services */}
                            <div>
                                <h3 className="text-white font-semibold text-base mb-2">Services and Deliverables</h3>
                                <p>The Agency agrees to provide services as outlined in the attached Service Annexure, which includes:</p>
                                <ul className="list-disc ml-6 mt-2 space-y-1">
                                    {selectedServiceDetails.map(s => (
                                        <li key={s.id} className="text-white">{s.name} <span className="text-blue-400">({form.clientSegment === 'INTERNATIONAL' ? 'USD Pricing Applied' : s.price})</span></li>
                                    ))}
                                </ul>
                                {form.customScope && (
                                    <div className="mt-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">Custom Scope:</p>
                                        <p className="text-slate-300 whitespace-pre-wrap">{form.customScope}</p>
                                    </div>
                                )}
                            </div>

                            {/* Terms */}
                            <div>
                                <h3 className="text-white font-semibold text-base mb-2">Terms and Conditions</h3>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-white font-medium">Duration and Termination:</h4>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Effective Date: <strong className="text-white">{form.commencementDate || '[TBD]'}</strong></li>
                                            <li>Duration: <strong className="text-white">{form.contractDuration.replace(/_/g, ' ')}</strong> from signing date, renewable upon mutual agreement.</li>
                                            <li>Either party may terminate with a 30-day written notice.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Payment Terms:</h4>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Monthly Retainer: <strong className="text-white">{form.clientSegment === 'INTERNATIONAL' ? '$' : '₹'}{Number(retainer).toLocaleString('en-IN')}/month</strong></li>
                                            <li>Payments are to be made in advance by the 1st of each month.</li>

                                            {form.clientSegment === 'INDIAN' && form.hasGST && <li>GST @ 18% applicable. TDS of 2% may be deducted.</li>}
                                            {form.clientSegment === 'INTERNATIONAL' && <li>International payments processed via Stripe/Swift (USD). Zero Export GST.</li>}
                                            {form.clientSegment === 'MYKOHI_WHITELABEL' && <li>Payments managed B2B via overarching Mykohi Partnership Agreement. No direct client invoicing.</li>}

                                            <li>Delays in payments will pause all communications and services.</li>
                                            <li>Annual retainer fee increases by 10%.</li>
                                        </ul>
                                    </div>
                                    {form.clientSegment === 'MYKOHI_WHITELABEL' && (
                                        <div>
                                            <h4 className="text-emerald-400 font-medium">Whitelabel & Confidentiality (Mykohi):</h4>
                                            <ul className="list-disc ml-6 space-y-1 text-emerald-100/70">
                                                <li>Agency ({entityName}) acts as a backend fulfillment partner for Client.</li>
                                                <li>All deliverables, portals, and communications will be strictly whitelabeled or co-branded as agreed.</li>
                                                <li>Agency will not directly contact or solicit the end-client.</li>
                                            </ul>
                                        </div>
                                    )}
                                    {form.clientSegment === 'INTERNATIONAL' && (
                                        <div>
                                            <h4 className="text-purple-400 font-medium">International Jurisdiction:</h4>
                                            <ul className="list-disc ml-6 space-y-1 text-purple-100/70">
                                                <li>This agreement is subject to International Arbitration clauses.</li>
                                                <li>Currency exchange rate fluctuations will not affect the agreed USD retainer.</li>
                                            </ul>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-white font-medium">Performance Metrics & Reporting:</h4>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Monthly performance reports with defined KPIs per service.</li>
                                            <li>Regular review meetings for project updates and feedback.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Confidentiality & IP Rights:</h4>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Both parties shall maintain strict confidentiality of proprietary information.</li>
                                            <li>All IP created during engagement belongs to the Client upon full payment.</li>
                                            <li>Agency retains right to showcase work in portfolio (anonymized if requested).</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">Dispute Resolution:</h4>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Governed by laws of India, disputes subject to arbitration in Gurgaon.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Escalation Contacts */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                <h3 className="text-white font-semibold text-base mb-2">Escalation & Accounts</h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400">Escalation — Client Support Head:</p>
                                        <p className="text-white font-medium">Himanshu — 84484 73282</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Accounts Manager:</p>
                                        <p className="text-white font-medium">Gautham — 95990 62712</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Working Hours: 11 AM to 6 PM, Monday to Friday. Preferred: WhatsApp.</p>
                            </div>

                            {/* Signatures */}
                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                                <div>
                                    <h4 className="text-white font-semibold mb-3">For {entityName}:</h4>
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                                        <p className="text-white font-medium text-lg italic mb-1">Arush Thapar</p>
                                        <p className="text-xs text-slate-400">Director</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-3">For {form.companyName || 'Client'}:</h4>
                                    <div className="bg-white/5 backdrop-blur-sm border border-dashed border-white/20 rounded-xl p-2">
                                        <canvas
                                            ref={signatureRef}
                                            width={400}
                                            height={120}
                                            className="w-full bg-transparent cursor-crosshair rounded-lg"
                                            onMouseDown={startDraw}
                                            onMouseMove={draw}
                                            onMouseUp={endDraw}
                                            onMouseLeave={endDraw}
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-400">Sign above ↑</span>
                                            <button onClick={clearSignature} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <input type="text" placeholder="Signer full name" value={form.contactName}
                                            className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none" readOnly />
                                    </div>
                                    {form.hasGST && (
                                        <p className="text-xs text-slate-400 mt-1">GST: {form.gstNumber || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">
                            ← Back
                        </button>
                        <button onClick={() => setStep(4)} disabled={!form.clientSignature}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Sign & Generate PI →
                        </button>
                    </div>
                </div>
            )}

            {/* =============== STEP 4: AUTO-GENERATED PI / PORTAL =============== */}
            {step === 4 && (
                <div className="space-y-4">
                    {form.clientSegment === 'MYKOHI_WHITELABEL' ? (
                        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Whitelabel Agreement Signed!</h2>
                            <p className="text-slate-300 max-w-md mx-auto">
                                The Service Delivery Agreement for <strong className="text-white">{form.companyName}</strong> has been generated and signed.
                            </p>
                            <p className="text-sm text-emerald-400">
                                Mykohi B2B Billing applies. No direct end-client invoice is generated.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                            {/* Invoice Header */}
                            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-6 border-b border-white/10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{entityName}</h2>
                                        <p className="text-sm text-slate-400">84, Ground Floor, Supreme Coworks, Sector 32, Gurgaon 122001</p>
                                        {form.hasGST && form.clientSegment === 'INDIAN' && <p className="text-xs text-slate-400 mt-1">GSTIN: [Agency GST Number]</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">INVOICE</p>
                                        <p className="text-sm text-slate-400">#{`INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`}</p>
                                        <p className="text-xs text-slate-400 mt-1">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bill To */}
                            <div className="p-6 border-b border-white/10">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase mb-1">Bill To</p>
                                        <p className="text-white font-semibold">{form.companyName}</p>
                                        <p className="text-sm text-slate-400">{form.contactName}</p>
                                        <p className="text-sm text-slate-400">{form.address}</p>
                                        {form.gstNumber && form.clientSegment === 'INDIAN' && <p className="text-xs text-slate-400 mt-1">GSTIN: {form.gstNumber}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase mb-1">PI Type</p>
                                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium">
                                            Advance Payment
                                        </span>
                                        <p className="text-xs text-slate-400 mt-2">Commencement: {form.commencementDate || 'TBD'}</p>
                                        <p className="text-xs text-slate-400">Duration: {form.contractDuration.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="p-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 text-xs font-medium text-slate-400 uppercase">Service</th>
                                            <th className="text-left py-3 text-xs font-medium text-slate-400 uppercase">Type</th>
                                            <th className="text-right py-3 text-xs font-medium text-slate-400 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {selectedServiceDetails.map(s => (
                                            <tr key={s.id}>
                                                <td className="py-3 text-sm text-white">{s.name}</td>
                                                <td className="py-3 text-sm text-slate-400">{s.timeline}</td>
                                                <td className="py-3 text-sm text-white text-right">
                                                    {form.clientSegment === 'INTERNATIONAL' ? 'USD Pricing Applied' : s.price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Subtotal (Advance Payment)</span>
                                        <span className="text-white">
                                            {form.clientSegment === 'INTERNATIONAL' ? '$' : '₹'}{Number(advance).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    {form.clientSegment === 'INDIAN' && form.hasGST && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">GST @ 18%</span>
                                            <span className="text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    {form.clientSegment === 'INTERNATIONAL' && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Export GST</span>
                                            <span className="text-white">$0.00 (Zero-Rated)</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                                        <span className="text-white">Total Payable</span>
                                        <span className="text-emerald-400">
                                            {form.clientSegment === 'INTERNATIONAL' ? '$' : '₹'}
                                            {(Number(advance) + (form.clientSegment === 'INDIAN' && form.hasGST ? Number(gstAmount) : 0)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Bank Details */}
                                <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                    <h4 className="text-white font-semibold mb-2">
                                        {form.clientSegment === 'INTERNATIONAL' ? 'Stripe/Swift Details' : 'Bank Details for Payment'}
                                    </h4>
                                    {form.clientSegment === 'INTERNATIONAL' ? (
                                        <div className="text-sm text-slate-300">
                                            A secure payment link using Stripe will be emailed to {form.contactEmail}. Use Swift Code: BPIOXXXXX for wire transfers.
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-slate-400">Account Name</p>
                                                <p className="text-white">{entityName}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Bank</p>
                                                <p className="text-white">[Bank Name — to be configured]</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Account Number</p>
                                                <p className="text-white">[Account Number]</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">IFSC Code</p>
                                                <p className="text-white">[IFSC Code]</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )} {/* End conditional invoice / mykohi portal block */}

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">
                            ← Back to SLA
                        </button>
                        <div className="flex gap-3">
                            {form.clientSegment !== 'MYKOHI_WHITELABEL' && (
                                <button className="px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download PDF
                                </button>
                            )}
                            <button onClick={() => setStep(5)}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-none hover:shadow-emerald-500/20 transition-all">
                                Confirm & Complete →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =============== STEP 5: CONFIRMATION =============== */}
            {step === 5 && (
                <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Onboarding Complete!</h2>
                    <p className="text-slate-400 mb-6">
                        {form.clientSegment === 'MYKOHI_WHITELABEL'
                            ? `SDA signed and Whitelabel Portal generated for `
                            : `SLA signed and invoice generated for `}
                        <strong className="text-white">{form.companyName}</strong>
                    </p>

                    <div className="max-w-md mx-auto space-y-3 text-left">
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <div>
                                <p className="text-sm font-medium text-emerald-300">
                                    {form.clientSegment === 'MYKOHI_WHITELABEL' ? 'Service Delivery Agreement Signed' : 'SLA Signed'}
                                </p>
                                <p className="text-xs text-slate-400">{entityName} — {form.contractDuration.replace(/_/g, ' ')}</p>
                            </div>
                        </div>

                        {form.clientSegment === 'MYKOHI_WHITELABEL' ? (
                            <div className="flex flex-col gap-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    <div>
                                        <p className="text-sm font-medium text-emerald-300">Whitelabel Client Portal Created</p>
                                        <p className="text-xs text-slate-400">Share this magic link with the Mykohi End-Client.</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs p-2 bg-black/30 rounded-lg text-emerald-400 font-mono break-all text-center">
                                    pioneeros.app/mykohi-portal/REQ-{Date.now().toString().slice(-6)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>
                                <div>
                                    <p className="text-sm font-medium text-blue-300">Advance PI Generated</p>
                                    <p className="text-xs text-slate-400">
                                        {form.clientSegment === 'INTERNATIONAL' ? '$' : '₹'}
                                        {(Number(advance) + (form.clientSegment === 'INDIAN' && form.hasGST ? Number(gstAmount) : 0)).toLocaleString('en-IN')}
                                        {form.clientSegment === 'INDIAN' && form.hasGST ? ' (incl. GST)' : ''}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <div>
                                <p className="text-sm font-medium text-purple-300">Account Manager Delegation</p>
                                <p className="text-xs text-slate-400">Client will be assigned to account manager</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <div>
                                <p className="text-sm font-medium text-amber-300">Welcome Message</p>
                                <p className="text-xs text-slate-400">Will be sent upon payment confirmation</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                        <label className="flex items-center gap-3 justify-center">
                            <input type="checkbox" className="w-5 h-5 rounded bg-white/10 backdrop-blur-sm border-white/20 text-emerald-500" />
                            <span className="text-white font-medium">Payment confirmed in bank account</span>
                        </label>
                    </div>

                    <div className="flex gap-3 justify-center mt-6">
                        <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none transition-all">
                            Send Client Onboarding Form
                        </button>
                        <button className="px-6 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">
                            View Client Record
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
