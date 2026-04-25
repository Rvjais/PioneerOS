'use client'

import { useState } from 'react'

const STEPS = [
    { num: 1, label: 'Business Details', iconType: 'building' },
    { num: 2, label: 'Brand & Media', iconType: 'palette' },
    { num: 3, label: 'Digital Presence', iconType: 'globe' },
    { num: 4, label: 'Social Media', iconType: 'share' },
    { num: 5, label: 'Advertising', iconType: 'chart' },
    { num: 6, label: 'Content & Comms', iconType: 'pencil' },
    { num: 7, label: 'Goals & KPIs', iconType: 'target' },
]

const renderStepIcon = (iconType: string, className: string = "w-5 h-5") => {
    switch (iconType) {
        case 'building':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        case 'palette':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
        case 'globe':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
        case 'share':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        case 'chart':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        case 'pencil':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        case 'target':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        case 'clipboard':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        case 'phone':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        case 'warning':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        case 'sparkles':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        case 'check':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        default:
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    }
}

const renderPlatformIcon = (platform: string, className: string = "w-5 h-5") => {
    switch (platform) {
        case 'instagram':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        case 'facebook':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        case 'linkedin':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        case 'youtube':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        case 'twitter':
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
        default:
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
    }
}

export default function ClientOnboardingFormPage() {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState<Record<string, string>>({})

    const updateField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

    const Field = ({ label, name, type = 'text', placeholder = '', rows }: { label: string; name: string; type?: string; placeholder?: string; rows?: number }) => (
        <div>
            <label className="text-sm text-slate-400 mb-1 block">{label}</label>
            {rows ? (
                <textarea value={form[name] || ''} onChange={e => updateField(name, e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none resize-none"
                    style={{ height: rows * 36 }} placeholder={placeholder} />
            ) : (
                <input type={type} value={form[name] || ''} onChange={e => updateField(name, e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                    placeholder={placeholder} />
            )}
        </div>
    )

    const progress = Math.round((step / STEPS.length) * 100)

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    {renderStepIcon('clipboard', 'w-6 h-6')}
                    Client Onboarding Form
                </h1>
                <p className="text-slate-400 mt-1">Collect everything we need to deliver outstanding results</p>
            </div>

            {/* Progress */}
            <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">Step {step} of {STEPS.length}: {STEPS[step - 1].label}</span>
                    <span className="text-sm text-slate-400">{progress}% Complete</span>
                </div>
                <div className="w-full h-2 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex gap-1 mt-3">
                    {STEPS.map(s => (
                        <button key={s.num} onClick={() => setStep(s.num)}
                            className={`flex-1 py-1.5 text-xs rounded-lg transition-all flex items-center justify-center ${step === s.num ? 'bg-blue-500/20 text-blue-300' : step > s.num ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 backdrop-blur-sm text-slate-400'}`}>
                            {renderStepIcon(s.iconType, 'w-4 h-4')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
                {step === 1 && (
                    <>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('building')} Business Details</h2>
                        <p className="text-sm text-slate-400">Tell us everything about your business so we can create the best strategy.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field label="About Your Business *" name="aboutBusiness" rows={3} placeholder="What does your business do? What products/services do you offer?" />
                            <Field label="Mission & Vision" name="missionVision" rows={3} placeholder="What's your company's mission statement?" />
                            <Field label="Unique Selling Points (USPs)" name="usps" rows={2} placeholder="What makes you different from competitors?" />
                            <Field label="Target Audience" name="targetAudience" rows={2} placeholder="Who are your ideal customers? Demographics, interests..." />
                            <Field label="Competitor 1" name="competitor1" placeholder="Main competitor website/name" />
                            <Field label="Competitor 2" name="competitor2" placeholder="Second competitor" />
                            <Field label="Competitor 3" name="competitor3" placeholder="Third competitor" />
                            <Field label="Target Locations/Markets" name="targetLocations" placeholder="e.g. Delhi NCR, Pan India, Global" />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('palette')} Brand & Media Assets</h2>
                        <p className="text-sm text-slate-400">Share your existing brand assets so we maintain consistency.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm text-slate-400 mb-1 block">Logo Files (upload via drive link)</label>
                                <input type="url" value={form.logoFiles || ''} onChange={e => updateField('logoFiles', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                    placeholder="Google Drive / Dropbox link to logo files (AI, SVG, PNG)" />
                            </div>
                            <Field label="Brand Colors (Hex codes)" name="brandColors" placeholder="#FF5733, #2196F3, #4CAF50" />
                            <Field label="Brand Fonts" name="brandFonts" placeholder="e.g. Poppins, Montserrat" />
                            <Field label="Brand Guidelines Link" name="brandGuidelinesUrl" placeholder="Link to brand guide PDF" />
                            <Field label="Existing Creative Assets Link" name="creativeAssetsUrl" placeholder="Drive folder with photos, videos, etc." />
                            <Field label="Product/Service Photos" name="productPhotosUrl" placeholder="Link to product images" />
                            <Field label="Team Photos / Office Photos" name="teamPhotosUrl" placeholder="Link to team/office images" />
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('globe')} Digital Presence & Website Access</h2>
                        <p className="text-sm text-slate-400">We need access to manage your digital properties.</p>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-300 flex items-center gap-2">
                            {renderStepIcon('warning', 'w-5 h-5')} All credentials are stored securely and used only for authorized work.
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field label="Website URL" name="websiteUrl" type="url" placeholder="https://..." />
                            <Field label="CMS Platform" name="cmsPlatform" placeholder="WordPress, Shopify, Custom, etc." />
                            <Field label="Website Admin Login URL" name="websiteAdminUrl" placeholder="https://yoursite.com/wp-admin" />
                            <Field label="Website Admin Username" name="websiteAdminUser" placeholder="admin username" />
                            <Field label="Website Admin Password" name="websiteAdminPass" type="password" placeholder="admin password" />
                            <Field label="Hosting Provider" name="hostingProvider" placeholder="GoDaddy, AWS, Hostinger, etc." />
                            <Field label="Domain Registrar" name="domainRegistrar" placeholder="GoDaddy, Namecheap, etc." />
                            <Field label="Google Analytics ID" name="gaId" placeholder="UA-XXXXX or G-XXXXX" />
                            <Field label="Search Console Access Email" name="searchConsoleEmail" placeholder="email with access" />
                            <Field label="Google Tag Manager ID" name="gtmId" placeholder="GTM-XXXXX" />
                        </div>
                    </>
                )}

                {step === 4 && (
                    <>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('phone')} Social Media Access</h2>
                        <p className="text-sm text-slate-400">Provide access to your social media accounts.</p>
                        <div className="space-y-4">
                            {[
                                { name: 'Instagram', iconType: 'instagram', fields: ['instagramUrl', 'instagramLogin', 'instagramPass'] },
                                { name: 'Facebook', iconType: 'facebook', fields: ['facebookUrl', 'facebookPageAdmin', 'facebookBusinessManager'] },
                                { name: 'LinkedIn', iconType: 'linkedin', fields: ['linkedinUrl', 'linkedinLogin', 'linkedinPass'] },
                                { name: 'YouTube', iconType: 'youtube', fields: ['youtubeUrl', 'youtubeLogin', 'youtubePass'] },
                                { name: 'Twitter/X', iconType: 'twitter', fields: ['twitterUrl', 'twitterLogin', 'twitterPass'] },
                            ].map(platform => (
                                <div key={platform.name} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">{renderPlatformIcon(platform.iconType)} {platform.name}</h4>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        <Field label="Profile URL" name={platform.fields[0]} placeholder={`${platform.name} page URL`} />
                                        <Field label="Login Email/Username" name={platform.fields[1]} placeholder="Login credentials" />
                                        <Field label="Password" name={platform.fields[2]} type="password" placeholder="Password" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {step === 5 && (
                    <>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('chart')} Advertising Accounts</h2>
                        <p className="text-sm text-slate-400">Access to ad platforms for campaign management.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field label="Google Ads Customer ID" name="googleAdsId" placeholder="XXX-XXX-XXXX" />
                            <Field label="Google Ads Login Email" name="googleAdsEmail" placeholder="email with Ads access" />
                            <Field label="Meta Business Manager URL" name="metaBusinessUrl" placeholder="business.facebook.com URL" />
                            <Field label="Meta Ads Account ID" name="metaAdsAccountId" placeholder="act_XXXXX" />
                            <Field label="Any Other Ad Platform" name="otherAdPlatform" placeholder="LinkedIn Ads, Twitter Ads, etc." />
                            <Field label="Other Ad Account Details" name="otherAdDetails" placeholder="Account IDs and access info" />
                        </div>
                    </>
                )}

                {step === 6 && (
                    <>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('pencil')} Content & Communication Preferences</h2>
                        <p className="text-sm text-slate-400">Help us understand your brand voice and content preferences.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field label="Brand Tone of Voice" name="toneOfVoice" rows={2} placeholder="Professional, Casual, Playful, Authoritative, etc." />
                            <Field label="Topics to Avoid" name="topicsToAvoid" rows={2} placeholder="Any sensitive topics or competitors not to mention?" />
                            <Field label="Content Approval Process" name="approvalProcess" rows={2} placeholder="Who approves content? Turnaround time expected?" />
                            <Field label="Primary Contact for Approvals" name="approvalContact" placeholder="Name and WhatsApp number" />
                            <Field label="Preferred Communication Channel" name="preferredChannel" placeholder="WhatsApp, Email, Slack, etc." />
                            <Field label="WhatsApp Group Set Up?" name="whatsappGroupSetup" placeholder="Yes/No — we'll create one" />
                            <Field label="Content References (brands you admire)" name="contentReferences" rows={2} placeholder="Share Instagram/website links of brands you like" />
                            <Field label="Any Existing Content Calendar?" name="existingContentCalendar" placeholder="Link to existing calendar if any" />
                        </div>
                    </>
                )}

                {step === 7 && (
                    <>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">{renderStepIcon('target')} Goals & KPIs</h2>
                        <p className="text-sm text-slate-400">Define success metrics so we can track and deliver results.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Field label="Primary Business Goal" name="primaryGoal" rows={2} placeholder="e.g. Increase online leads by 50% in 6 months" />
                            <Field label="Secondary Goals" name="secondaryGoals" rows={2} placeholder="Other goals you'd like to achieve" />
                            <Field label="Current Monthly Leads/Sales" name="currentMetrics" placeholder="Approximate current numbers" />
                            <Field label="Target Monthly Leads/Sales" name="targetMetrics" placeholder="What you want to achieve" />
                            <Field label="Key Performance Indicators" name="kpis" rows={2} placeholder="Website traffic, social followers, leads, revenue, etc." />
                            <Field label="Reporting Frequency Preference" name="reportingFrequency" placeholder="Weekly, Bi-weekly, Monthly" />
                            <Field label="Any Upcoming Launches/Events" name="upcomingEvents" rows={2} placeholder="Product launches, sales, events we should plan for" />
                            <Field label="Additional Notes" name="additionalNotes" rows={3} placeholder="Anything else we should know..." />
                        </div>

                        <div className="mt-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                            <p className="text-emerald-300 font-semibold mb-2 flex items-center justify-center gap-2">{renderStepIcon('sparkles')} You&apos;re almost done!</p>
                            <p className="text-sm text-slate-400">Click submit to complete your onboarding. Our team will review and set up everything.</p>
                        </div>
                    </>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button onClick={() => step > 1 && setStep(step - 1)} disabled={step === 1}
                    className="px-6 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-30">
                    ← Back
                </button>
                {step < STEPS.length ? (
                    <button onClick={() => setStep(step + 1)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-none transition-all">
                        Next: {STEPS[step]?.label} →
                    </button>
                ) : (
                    <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-none transition-all flex items-center gap-2">
                        {renderStepIcon('check')} Submit Onboarding Form
                    </button>
                )}
            </div>
        </div>
    )
}
