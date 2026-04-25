// Healthcare Digital Marketing Glossary
// Comprehensive terms for healthcare marketing professionals

export interface GlossaryTerm {
  term: string
  definition: string
  category: 'healthcare' | 'marketing' | 'seo' | 'ads' | 'social' | 'web' | 'analytics'
  example?: string
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // === HEALTHCARE TERMS ===
  { term: 'OPD', definition: 'Outpatient Department — where patients visit for consultations without being admitted.', category: 'healthcare', example: 'OPD ads target patients looking for doctor appointments.' },
  { term: 'IPD', definition: 'Inpatient Department — where patients are admitted and stay overnight for treatment.', category: 'healthcare' },
  { term: 'EMR', definition: 'Electronic Medical Records — digital version of patient charts and medical history.', category: 'healthcare' },
  { term: 'EHR', definition: 'Electronic Health Records — comprehensive digital health records shared across providers.', category: 'healthcare' },
  { term: 'HIPAA', definition: 'Health Insurance Portability and Accountability Act — US law protecting patient health information privacy.', category: 'healthcare', example: 'All healthcare ads must be HIPAA compliant.' },
  { term: 'Telemedicine', definition: 'Remote healthcare delivery via video calls, phone, or messaging platforms.', category: 'healthcare' },
  { term: 'Multi-specialty Hospital', definition: 'Hospital offering services across many medical specialties (ortho, cardio, neuro, etc).', category: 'healthcare' },
  { term: 'Super-specialty Hospital', definition: 'Hospital focused on one or few specialized areas with advanced equipment and expertise.', category: 'healthcare' },
  { term: 'GBP', definition: 'Google Business Profile (formerly GMB) — free listing that appears in Google Maps and local search results.', category: 'seo', example: 'Optimizing GBP helps doctors appear in "near me" searches.' },
  { term: 'GMB', definition: 'Google My Business — now called Google Business Profile (GBP). Manages how a business appears on Google Search and Maps.', category: 'seo' },
  { term: 'Patient Journey', definition: 'The complete path a patient takes from awareness of symptoms to booking, treatment, and follow-up.', category: 'healthcare' },
  { term: 'Footfall', definition: 'The number of patients physically visiting a clinic or hospital.', category: 'healthcare', example: 'Social media campaigns increased footfall by 25%.' },
  { term: 'Bed Occupancy Rate', definition: 'Percentage of available hospital beds that are occupied at any given time.', category: 'healthcare' },
  { term: 'TAT', definition: 'Turnaround Time — time taken to complete a task or deliver a report/creative.', category: 'healthcare' },
  { term: 'IVF', definition: 'In Vitro Fertilization — fertility treatment where eggs are fertilized outside the body.', category: 'healthcare' },
  { term: 'LASIK', definition: 'Laser-Assisted In Situ Keratomileusis — laser eye surgery to correct vision.', category: 'healthcare' },
  { term: 'Orthopedics', definition: 'Medical specialty dealing with bones, joints, muscles, and spine conditions.', category: 'healthcare' },
  { term: 'Dermatology', definition: 'Medical specialty dealing with skin, hair, and nail conditions.', category: 'healthcare' },
  { term: 'Oncology', definition: 'Medical specialty dealing with cancer diagnosis and treatment.', category: 'healthcare' },
  { term: 'Cardiology', definition: 'Medical specialty dealing with heart and cardiovascular conditions.', category: 'healthcare' },
  { term: 'Neurology', definition: 'Medical specialty dealing with brain, spinal cord, and nervous system disorders.', category: 'healthcare' },
  { term: 'Gastroenterology', definition: 'Medical specialty dealing with digestive system disorders.', category: 'healthcare' },
  { term: 'ENT', definition: 'Ear, Nose, and Throat — medical specialty also called Otolaryngology.', category: 'healthcare' },
  { term: 'Urology', definition: 'Medical specialty dealing with urinary tract and male reproductive system conditions.', category: 'healthcare' },
  { term: 'Nephrology', definition: 'Medical specialty dealing with kidney diseases and disorders.', category: 'healthcare' },
  { term: 'Radiology', definition: 'Medical specialty using imaging (X-ray, CT, MRI, ultrasound) for diagnosis.', category: 'healthcare' },
  { term: 'Pathology', definition: 'Medical specialty that examines body tissues and fluids to diagnose disease.', category: 'healthcare' },

  // === SEO TERMS ===
  { term: 'On-Page SEO', definition: 'Optimizing individual web pages (content, titles, meta tags, headers) to rank higher in search results.', category: 'seo' },
  { term: 'Off-Page SEO', definition: 'Activities outside your website to improve rankings — link building, social signals, brand mentions.', category: 'seo' },
  { term: 'Technical SEO', definition: 'Optimizing website infrastructure — speed, mobile-friendliness, crawlability, schema markup.', category: 'seo' },
  { term: 'Local SEO', definition: 'Optimizing to appear in local search results and Google Maps for location-based queries.', category: 'seo', example: '"Best orthopedic doctor near me" is a local SEO target.' },
  { term: 'SERP', definition: 'Search Engine Results Page — the page Google shows after a search query.', category: 'seo' },
  { term: 'Keyword Ranking', definition: 'The position a website holds in search results for a specific keyword.', category: 'seo' },
  { term: 'Backlink', definition: 'A link from another website pointing to yours — signals trust and authority to Google.', category: 'seo' },
  { term: 'Domain Authority (DA)', definition: 'A score (0-100) predicting how well a website will rank. Higher DA = stronger ranking potential.', category: 'seo' },
  { term: 'Schema Markup', definition: 'Structured data code added to pages to help search engines understand content better.', category: 'seo', example: 'Medical schema shows doctor ratings, specialties, and hours in search results.' },
  { term: 'Content Cluster', definition: 'A group of interlinked pages around a core topic to establish topical authority.', category: 'seo', example: 'A pillar page on "Knee Replacement" with clusters on recovery, cost, types, etc.' },
  { term: 'Canonical URL', definition: 'The preferred URL for a page when duplicate content exists, told to Google via a tag.', category: 'seo' },
  { term: 'Crawlability', definition: 'How easily search engine bots can access and read your website pages.', category: 'seo' },
  { term: 'Indexing', definition: 'When Google adds a webpage to its database so it can appear in search results.', category: 'seo' },
  { term: 'Long-tail Keywords', definition: 'Specific, longer search phrases with lower competition but higher intent.', category: 'seo', example: '"best knee replacement surgeon in Delhi" vs "knee surgery"' },
  { term: 'Featured Snippet', definition: 'The highlighted answer box at the top of Google results (position zero).', category: 'seo' },
  { term: 'NAP', definition: 'Name, Address, Phone — must be consistent across all online listings for local SEO.', category: 'seo' },
  { term: 'Citation', definition: 'Any online mention of a business NAP — directories, social profiles, review sites.', category: 'seo' },
  { term: 'Core Web Vitals', definition: 'Google metrics measuring page experience — LCP (loading), FID (interactivity), CLS (visual stability).', category: 'seo' },
  { term: 'E-E-A-T', definition: 'Experience, Expertise, Authoritativeness, Trustworthiness — Google quality guidelines, critical for healthcare content.', category: 'seo' },
  { term: 'YMYL', definition: 'Your Money or Your Life — Google category for pages that can impact health, finances, or safety. Healthcare sites are YMYL.', category: 'seo' },

  // === ADS / PERFORMANCE MARKETING ===
  { term: 'CPL', definition: 'Cost Per Lead — how much you pay for each lead generated through ads.', category: 'ads', example: 'If you spend ₹10,000 and get 50 leads, CPL = ₹200.' },
  { term: 'CPC', definition: 'Cost Per Click — amount paid each time someone clicks your ad.', category: 'ads' },
  { term: 'CPM', definition: 'Cost Per Mille — cost per 1,000 ad impressions shown.', category: 'ads' },
  { term: 'CTR', definition: 'Click-Through Rate — percentage of people who click after seeing your ad. CTR = clicks/impressions × 100.', category: 'ads', example: '3-5% CTR is good for healthcare Google ads.' },
  { term: 'ROAS', definition: 'Return On Ad Spend — revenue generated per rupee spent on ads. ROAS = revenue/ad spend.', category: 'ads' },
  { term: 'Conversion Rate', definition: 'Percentage of visitors who complete a desired action (book appointment, call, fill form).', category: 'ads' },
  { term: 'Quality Score', definition: 'Google Ads metric (1-10) measuring ad relevance, landing page quality, and expected CTR.', category: 'ads' },
  { term: 'Ad Rank', definition: 'Determines your ad position. Ad Rank = Bid × Quality Score × expected impact of extensions.', category: 'ads' },
  { term: 'Retargeting', definition: 'Showing ads to people who previously visited your website but did not convert.', category: 'ads' },
  { term: 'Lookalike Audience', definition: 'Meta/Facebook audience that resembles your existing patients/leads based on demographics and behavior.', category: 'ads' },
  { term: 'Lead Magnet', definition: 'Free resource (health guide, checklist) offered in exchange for contact details.', category: 'ads' },
  { term: 'Landing Page', definition: 'A dedicated page designed for a specific campaign/ad to maximize conversions.', category: 'ads' },
  { term: 'A/B Testing', definition: 'Running two versions of an ad or page to see which performs better.', category: 'ads' },
  { term: 'Impression', definition: 'Each time your ad is displayed to a user, whether clicked or not.', category: 'ads' },
  { term: 'Boosting', definition: 'Paying to amplify an organic social media post to reach more people.', category: 'ads' },
  { term: 'Pixel', definition: 'A small code installed on websites to track visitor behavior for ad optimization (Meta Pixel, Google Tag).', category: 'ads' },
  { term: 'Full-Funnel Marketing', definition: 'Running campaigns across all stages — awareness (top), consideration (middle), conversion (bottom).', category: 'ads' },

  // === SOCIAL MEDIA ===
  { term: 'Engagement Rate', definition: 'Percentage of audience interacting with content. ER = (likes + comments + shares) / reach × 100.', category: 'social' },
  { term: 'Reach', definition: 'Number of unique users who saw your content.', category: 'social' },
  { term: 'Impressions', definition: 'Total times your content was displayed (one person can generate multiple impressions).', category: 'social' },
  { term: 'Organic Reach', definition: 'Number of people who see your content without paid promotion.', category: 'social' },
  { term: 'Content Calendar', definition: 'A schedule planning what content to post, when, and on which platform.', category: 'social' },
  { term: 'UGC', definition: 'User Generated Content — content created by patients/users (testimonials, reviews, photos).', category: 'social' },
  { term: 'Reel', definition: 'Short-form vertical video (15-90 seconds) on Instagram/Facebook for maximum reach.', category: 'social' },
  { term: 'Carousel', definition: 'Multi-image/slide post that users swipe through — great for educational healthcare content.', category: 'social' },
  { term: 'Stories', definition: 'Temporary 24-hour content on Instagram/Facebook for behind-the-scenes and quick updates.', category: 'social' },
  { term: 'Shorts', definition: 'YouTube short-form vertical videos (under 60 seconds) similar to Reels.', category: 'social' },
  { term: 'CTA', definition: 'Call To Action — prompting users to take action like "Book Now", "Call Us", "Learn More".', category: 'social' },
  { term: 'Hashtag Strategy', definition: 'Using relevant hashtags to increase content discoverability on social platforms.', category: 'social' },
  { term: 'Influencer Marketing', definition: 'Partnering with individuals who have large followings to promote healthcare services.', category: 'social' },
  { term: 'Social Proof', definition: 'Using testimonials, reviews, and patient stories to build trust and credibility.', category: 'social' },
  { term: 'Brand Voice', definition: 'The consistent personality and tone used across all communications.', category: 'social', example: 'Apollo prefers conservative branding; Smart Clinics wants modern/clean aesthetic.' },

  // === WEB / CRO ===
  { term: 'CRO', definition: 'Conversion Rate Optimization — improving website to convert more visitors into leads/patients.', category: 'web' },
  { term: 'Above the Fold', definition: 'Content visible without scrolling — the most important area of a webpage.', category: 'web' },
  { term: 'Responsive Design', definition: 'Website design that adapts to all screen sizes (mobile, tablet, desktop).', category: 'web' },
  { term: 'Page Speed', definition: 'How fast a webpage loads — critical for SEO ranking and user experience.', category: 'web' },
  { term: 'SSL', definition: 'Secure Sockets Layer — encryption that shows the padlock icon. Required for healthcare websites.', category: 'web' },
  { term: 'CMS', definition: 'Content Management System — platform to manage website content (WordPress, Next.js, etc).', category: 'web' },
  { term: 'Heatmap', definition: 'Visual representation of where users click, scroll, and spend time on a webpage.', category: 'web' },
  { term: 'Bounce Rate', definition: 'Percentage of visitors who leave after viewing only one page.', category: 'web' },
  { term: 'Session Duration', definition: 'Average time a visitor spends on your website in one visit.', category: 'web' },
  { term: 'Thank You Page', definition: 'Page shown after form submission — can be used for tracking conversions and upselling.', category: 'web' },
  { term: 'Microsite', definition: 'A small, focused website for a specific campaign, service, or sub-brand.', category: 'web', example: 'Each Mykohi sub-brand has its own microsite.' },
  { term: 'AMC', definition: 'Annual Maintenance Contract — yearly agreement for website maintenance, updates, and support.', category: 'web' },

  // === ANALYTICS ===
  { term: 'GA4', definition: 'Google Analytics 4 — the current version of Google Analytics for tracking website traffic and behavior.', category: 'analytics' },
  { term: 'UTM Parameters', definition: 'Tags added to URLs to track which campaigns drive traffic. Format: utm_source, utm_medium, utm_campaign.', category: 'analytics' },
  { term: 'KPI', definition: 'Key Performance Indicator — measurable value showing how effectively goals are being achieved.', category: 'analytics' },
  { term: 'MoM', definition: 'Month over Month — comparing metrics between consecutive months to measure growth.', category: 'analytics' },
  { term: 'YoY', definition: 'Year over Year — comparing metrics from the same period in different years.', category: 'analytics' },
  { term: 'ROI', definition: 'Return on Investment — profit generated relative to the cost. ROI = (revenue - cost) / cost × 100.', category: 'analytics' },
  { term: 'Attribution', definition: 'Identifying which marketing channel or touchpoint led to a conversion.', category: 'analytics' },
  { term: 'Dashboard', definition: 'Visual display of key metrics in one place for quick performance monitoring.', category: 'analytics' },
  { term: 'Cohort Analysis', definition: 'Grouping users by shared characteristics to analyze behavior patterns over time.', category: 'analytics' },
  { term: 'Funnel Analysis', definition: 'Tracking users through stages (visit → form → call → appointment) to identify drop-off points.', category: 'analytics' },

  // === HEALTHCARE MARKETING SPECIFIC ===
  { term: 'Doctor Listing', definition: 'Online profile of a doctor on platforms like Practo, Google, hospital website with credentials and reviews.', category: 'marketing' },
  { term: 'Patient Testimonial', definition: 'Written or video review from a patient about their treatment experience — powerful social proof.', category: 'marketing' },
  { term: 'Medical Content Writing', definition: 'Creating accurate, E-E-A-T compliant health articles reviewed by medical professionals.', category: 'marketing' },
  { term: 'Reputation Management', definition: 'Monitoring and improving online reviews across Google, Practo, and social media.', category: 'marketing' },
  { term: 'ORM', definition: 'Online Reputation Management — handling negative reviews and building positive brand perception.', category: 'marketing' },
  { term: 'SOW', definition: 'Scope of Work — document defining services, deliverables, and expectations for a client engagement.', category: 'marketing' },
  { term: 'SLA', definition: 'Service Level Agreement — contract specifying quality standards, response times, and performance benchmarks.', category: 'marketing' },
  { term: 'Creative Brief', definition: 'Document outlining the objectives, audience, tone, and requirements for a design/content piece.', category: 'marketing' },
  { term: 'Brand Guidelines', definition: 'Rules defining how a brand should be presented — colors, fonts, logo usage, tone of voice.', category: 'marketing' },
  { term: 'Omnichannel Marketing', definition: 'Providing seamless experience across all channels — website, social, ads, WhatsApp, email.', category: 'marketing' },
  { term: 'Drip Campaign', definition: 'Automated series of messages (email/WhatsApp) sent over time to nurture leads.', category: 'marketing' },
  { term: 'Lead Nurturing', definition: 'Building relationships with potential patients through consistent follow-up and content.', category: 'marketing' },
  { term: 'Competitive Analysis', definition: 'Researching competitor hospitals/doctors to identify strengths, gaps, and opportunities.', category: 'marketing' },
  { term: 'Performance Report', definition: 'Monthly/quarterly document showing campaign results, metrics, and recommendations.', category: 'marketing' },
  { term: 'White-label', definition: 'Services provided under the client brand name rather than the agency name.', category: 'marketing', example: 'Mykohi sub-brands are white-label clients.' },
]

export const MOTIVATIONAL_QUOTES = [
  { text: "Work like an owner. Lead like a pioneer.", author: "Pioneer OS" },
  { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
  { text: "Content is king, but distribution is queen.", author: "Jonathan Perelman" },
  { text: "People don't buy what you do, they buy why you do it.", author: "Simon Sinek" },
  { text: "Marketing is no longer about the stuff you make, but the stories you tell.", author: "Seth Godin" },
  { text: "The aim of marketing is to know and understand the customer so well the product or service fits and sells itself.", author: "Peter Drucker" },
  { text: "Good content isn't about good storytelling. It's about telling a true story well.", author: "Ann Handley" },
  { text: "Your brand is what other people say about you when you're not in the room.", author: "Jeff Bezos" },
  { text: "Don't find customers for your products, find products for your customers.", author: "Seth Godin" },
  { text: "It takes 20 years to build a reputation and five minutes to ruin it.", author: "Warren Buffett" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Data beats opinions.", author: "Jim Barksdale" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Stop selling. Start helping.", author: "Zig Ziglar" },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
  { text: "Make it simple, but significant.", author: "Don Draper" },
  { text: "The consumer is not a moron. She's your wife.", author: "David Ogilvy" },
  { text: "On average, 5x more people read the headline than the body copy.", author: "David Ogilvy" },
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupery" },
  { text: "Wherever there is a human being, there is an opportunity for a kindness.", author: "Seneca" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "If people like you, they'll listen to you. If they trust you, they'll do business with you.", author: "Zig Ziglar" },
  { text: "Healthcare is about caring. Marketing is about reaching those who need care.", author: "Pioneer OS" },
  { term: "Every patient interaction is a brand experience.", author: "Pioneer OS" },
  { text: "Build something 100 people love, not something 1 million people kind of like.", author: "Brian Chesky" },
  { text: "The best marketing strategy ever: CARE.", author: "Gary Vaynerchuk" },
]

// Get today's term of the day (rotates daily)
export function getTermOfTheDay(): GlossaryTerm {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return GLOSSARY_TERMS[dayOfYear % GLOSSARY_TERMS.length]
}

// Get today's motivational quote
export function getQuoteOfTheDay(): { text: string; author: string } {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const quote = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
  return { text: (quote as any).text || (quote as any).term || '', author: quote.author }
}
