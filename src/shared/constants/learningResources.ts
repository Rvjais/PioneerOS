export type LearningResource = {
  id: string
  title: string
  description: string
  category: string
  type: 'youtube' | 'course' | 'article' | 'tool' | 'book'
  url: string
  instructor?: string
  platform?: string
  isPaid: boolean
  price?: string
  duration?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  language: 'english' | 'hindi' | 'both'
}

export const learningCategories = [
  'Digital Marketing',
  'Social Media',
  'SEO & Content',
  'Design',
  'Video Production',
  'Web Development',
  'Analytics',
  'Copywriting',
  'Business Skills',
  'AI & Automation',
]

export const youtubeChannels = [
  // English Channels
  { name: 'Neil Patel', url: 'https://youtube.com/@NeilPatel', focus: 'Digital Marketing & SEO', subscribers: '1.2M', language: 'english' as const },
  { name: 'HubSpot', url: 'https://youtube.com/@HubSpot', focus: 'Inbound Marketing', subscribers: '500K', language: 'english' as const },
  { name: 'Gary Vaynerchuk', url: 'https://youtube.com/@garyvee', focus: 'Social Media & Entrepreneurship', subscribers: '3.5M', language: 'english' as const },
  { name: 'Wes McDowell', url: 'https://youtube.com/@WesMcDowell', focus: 'Web Design & Marketing', subscribers: '400K', language: 'english' as const },
  { name: 'The Futur', url: 'https://youtube.com/@thefutur', focus: 'Design Business', subscribers: '2.5M', language: 'english' as const },
  { name: 'Ahrefs', url: 'https://youtube.com/@AhsrefsChannel', focus: 'SEO Tutorials', subscribers: '500K', language: 'english' as const },
  { name: 'Moz', url: 'https://youtube.com/@Moz', focus: 'SEO & Content', subscribers: '100K', language: 'english' as const },
  { name: 'Social Media Examiner', url: 'https://youtube.com/@SocialMediaExaminer', focus: 'Social Media Marketing', subscribers: '200K', language: 'english' as const },
  { name: 'Figma', url: 'https://youtube.com/@Figma', focus: 'UI/UX Design', subscribers: '600K', language: 'english' as const },
  { name: 'Peter McKinnon', url: 'https://youtube.com/@PeterMcKinnon', focus: 'Photography & Video', subscribers: '5.8M', language: 'english' as const },
  { name: 'Marques Brownlee', url: 'https://youtube.com/@mkbhd', focus: 'Tech Reviews & Production', subscribers: '18M', language: 'english' as const },
  { name: 'DesignCourse', url: 'https://youtube.com/@DesignCourse', focus: 'Web Design & Dev', subscribers: '1M', language: 'english' as const },
  // Hindi Channels
  { name: 'WsCube Tech', url: 'https://youtube.com/@WsCubeTech', focus: 'Digital Marketing Complete', subscribers: '4M', language: 'hindi' as const },
  { name: 'CodeWithHarry', url: 'https://youtube.com/@CodeWithHarry', focus: 'Web Development', subscribers: '5M', language: 'hindi' as const },
  { name: 'GFXMentor', url: 'https://youtube.com/@GFXMentor', focus: 'Graphic Design & Photoshop', subscribers: '2M', language: 'hindi' as const },
  { name: 'Thapa Technical', url: 'https://youtube.com/@ThapaTechnical', focus: 'MERN Stack Development', subscribers: '1M', language: 'hindi' as const },
  { name: 'Dr. Vivek Bindra', url: 'https://youtube.com/@DrVivekBindra', focus: 'Business & Motivation', subscribers: '22M', language: 'hindi' as const },
  { name: 'Sorav Jain', url: 'https://youtube.com/@soaborayil', focus: 'Digital Marketing', subscribers: '500K', language: 'hindi' as const },
]

export const learningResources: LearningResource[] = [
  // Digital Marketing - English
  { id: '1', title: 'Google Digital Garage', description: 'Free digital marketing certification from Google', category: 'Digital Marketing', type: 'course', url: 'https://skillshop.withgoogle.com', platform: 'Google', isPaid: false, duration: '40 hours', level: 'beginner', tags: ['google', 'certification', 'fundamentals'], language: 'english' },
  { id: '2', title: 'Meta Blueprint', description: 'Official Facebook & Instagram marketing courses', category: 'Digital Marketing', type: 'course', url: 'https://www.facebook.com/business/learn', platform: 'Meta', isPaid: false, duration: '20+ hours', level: 'beginner', tags: ['meta', 'facebook', 'instagram'], language: 'english' },
  { id: '3', title: 'HubSpot Academy', description: 'Inbound marketing, sales, and service certifications', category: 'Digital Marketing', type: 'course', url: 'https://academy.hubspot.com', platform: 'HubSpot', isPaid: false, duration: 'Varies', level: 'intermediate', tags: ['inbound', 'certification', 'hubspot'], language: 'english' },

  // Digital Marketing - Hindi
  { id: '28', title: 'WsCube Tech - Digital Marketing', description: 'Complete digital marketing course in Hindi', category: 'Digital Marketing', type: 'youtube', url: 'https://www.youtube.com/@WsCubeTech', platform: 'YouTube', isPaid: false, duration: '50+ hours', level: 'beginner', tags: ['hindi', 'digital marketing', 'complete course'], language: 'hindi' },
  { id: '29', title: 'Satish K Videos - Marketing', description: 'Digital marketing tutorials in Hindi', category: 'Digital Marketing', type: 'youtube', url: 'https://www.youtube.com/@SatishKVideos', platform: 'YouTube', isPaid: false, duration: '30+ hours', level: 'beginner', tags: ['hindi', 'tutorials', 'marketing'], language: 'hindi' },
  { id: '30', title: 'Intellipaat Hindi - Digital Marketing', description: 'Professional digital marketing training in Hindi', category: 'Digital Marketing', type: 'course', url: 'https://intellipaat.com/digital-marketing-course-training/', platform: 'Intellipaat', isPaid: true, price: '₹15,000', duration: '40 hours', level: 'intermediate', tags: ['hindi', 'certification', 'professional'], language: 'hindi' },

  // Social Media - English
  { id: '4', title: 'Later Social Media Certificate', description: 'Social media strategy and planning', category: 'Social Media', type: 'course', url: 'https://later.com/training', platform: 'Later', isPaid: false, duration: '8 hours', level: 'beginner', tags: ['scheduling', 'instagram', 'planning'], language: 'english' },
  { id: '5', title: 'Hootsuite Academy', description: 'Social marketing certification', category: 'Social Media', type: 'course', url: 'https://education.hootsuite.com', platform: 'Hootsuite', isPaid: true, price: '$199', duration: '6 hours', level: 'intermediate', tags: ['certification', 'social media'], language: 'english' },
  { id: '6', title: 'Buffer Social Media Guides', description: 'Free guides on social media strategy', category: 'Social Media', type: 'article', url: 'https://buffer.com/resources', platform: 'Buffer', isPaid: false, level: 'beginner', tags: ['guides', 'strategy'], language: 'english' },

  // Social Media - Hindi
  { id: '31', title: 'Sorav Jain - Social Media', description: 'Social media marketing strategies in Hindi', category: 'Social Media', type: 'youtube', url: 'https://www.youtube.com/@soaborayil', platform: 'YouTube', isPaid: false, duration: '20+ hours', level: 'beginner', tags: ['hindi', 'social media', 'instagram'], language: 'hindi' },
  { id: '32', title: 'Learn and Earn - Social Media', description: 'Social media growth tips in Hindi', category: 'Social Media', type: 'youtube', url: 'https://www.youtube.com/@LearnandEarnwithPavanAgrawal', platform: 'YouTube', isPaid: false, duration: '15+ hours', level: 'beginner', tags: ['hindi', 'growth', 'tips'], language: 'hindi' },

  // SEO & Content - English
  { id: '7', title: 'Moz SEO Learning Center', description: 'Comprehensive SEO beginner guide', category: 'SEO & Content', type: 'course', url: 'https://moz.com/learn/seo', platform: 'Moz', isPaid: false, duration: '10 hours', level: 'beginner', tags: ['seo', 'fundamentals'], language: 'english' },
  { id: '8', title: 'Ahrefs Academy', description: 'Advanced SEO and content marketing', category: 'SEO & Content', type: 'course', url: 'https://ahrefs.com/academy', platform: 'Ahrefs', isPaid: false, duration: '8 hours', level: 'intermediate', tags: ['seo', 'backlinks', 'content'], language: 'english' },
  { id: '9', title: 'SEMrush Academy', description: 'SEO, PPC, and content marketing', category: 'SEO & Content', type: 'course', url: 'https://www.semrush.com/academy', platform: 'SEMrush', isPaid: false, duration: '15 hours', level: 'intermediate', tags: ['seo', 'ppc', 'certification'], language: 'english' },
  { id: '10', title: 'Google Search Central', description: 'Official Google SEO documentation', category: 'SEO & Content', type: 'article', url: 'https://developers.google.com/search', platform: 'Google', isPaid: false, level: 'intermediate', tags: ['google', 'technical seo'], language: 'english' },

  // SEO & Content - Hindi
  { id: '33', title: 'WsCube Tech - SEO Course', description: 'Complete SEO tutorial in Hindi', category: 'SEO & Content', type: 'youtube', url: 'https://www.youtube.com/playlist?list=PLjVLYmrlmjGdMqBqPPKQ0cLEm0WJmFoYF', platform: 'YouTube', isPaid: false, duration: '15 hours', level: 'beginner', tags: ['hindi', 'seo', 'complete'], language: 'hindi' },
  { id: '34', title: 'Deepak Kanakraju - SEO', description: 'Practical SEO tips in Hindi', category: 'SEO & Content', type: 'youtube', url: 'https://www.youtube.com/@deepakkanakraju', platform: 'YouTube', isPaid: false, duration: '10+ hours', level: 'intermediate', tags: ['hindi', 'seo', 'practical'], language: 'hindi' },

  // Design - English
  { id: '11', title: 'Figma Tutorials', description: 'Official Figma learning resources', category: 'Design', type: 'course', url: 'https://help.figma.com/hc/en-us/categories/360002051613', platform: 'Figma', isPaid: false, duration: '10 hours', level: 'beginner', tags: ['figma', 'ui/ux'], language: 'english' },
  { id: '12', title: 'Canva Design School', description: 'Design fundamentals and Canva tips', category: 'Design', type: 'course', url: 'https://www.canva.com/designschool', platform: 'Canva', isPaid: false, duration: '5 hours', level: 'beginner', tags: ['canva', 'graphic design'], language: 'english' },
  { id: '13', title: 'Adobe Creative Cloud Tutorials', description: 'Learn Photoshop, Illustrator, and more', category: 'Design', type: 'course', url: 'https://helpx.adobe.com/creative-cloud/tutorials.html', platform: 'Adobe', isPaid: false, duration: '50+ hours', level: 'intermediate', tags: ['photoshop', 'illustrator', 'adobe'], language: 'english' },

  // Design - Hindi
  { id: '35', title: 'GFXMentor - Photoshop Hindi', description: 'Professional Photoshop tutorials in Hindi', category: 'Design', type: 'youtube', url: 'https://www.youtube.com/@GFXMentor', platform: 'YouTube', isPaid: false, duration: '100+ hours', level: 'beginner', tags: ['hindi', 'photoshop', 'professional'], language: 'hindi' },
  { id: '36', title: 'Graphic Design Hindi', description: 'Complete graphic design course in Hindi', category: 'Design', type: 'youtube', url: 'https://www.youtube.com/@graphicdesignhindi', platform: 'YouTube', isPaid: false, duration: '50+ hours', level: 'beginner', tags: ['hindi', 'graphic design', 'illustrator'], language: 'hindi' },
  { id: '37', title: 'Canva Hindi Tutorial', description: 'Canva design tutorials in Hindi', category: 'Design', type: 'youtube', url: 'https://www.youtube.com/results?search_query=canva+hindi+tutorial', platform: 'YouTube', isPaid: false, duration: '10+ hours', level: 'beginner', tags: ['hindi', 'canva', 'social media'], language: 'hindi' },

  // Video Production - English
  { id: '14', title: 'DaVinci Resolve Training', description: 'Free professional video editing course', category: 'Video Production', type: 'course', url: 'https://www.blackmagicdesign.com/products/davinciresolve/training', platform: 'Blackmagic', isPaid: false, duration: '20 hours', level: 'intermediate', tags: ['video editing', 'color grading'], language: 'english' },
  { id: '15', title: 'Skillshare Video Editing', description: 'Premiere Pro and video production courses', category: 'Video Production', type: 'course', url: 'https://www.skillshare.com/browse/video', platform: 'Skillshare', isPaid: true, price: '$14/month', duration: 'Varies', level: 'intermediate', tags: ['premiere', 'video'], language: 'english' },

  // Video Production - Hindi
  { id: '38', title: 'Tech Gun - Video Editing', description: 'Premiere Pro complete course in Hindi', category: 'Video Production', type: 'youtube', url: 'https://www.youtube.com/@TechGun', platform: 'YouTube', isPaid: false, duration: '30+ hours', level: 'beginner', tags: ['hindi', 'premiere pro', 'video editing'], language: 'hindi' },
  { id: '39', title: 'Raghav - After Effects Hindi', description: 'After Effects motion graphics in Hindi', category: 'Video Production', type: 'youtube', url: 'https://www.youtube.com/@RaghavSomani', platform: 'YouTube', isPaid: false, duration: '20+ hours', level: 'intermediate', tags: ['hindi', 'after effects', 'motion'], language: 'hindi' },

  // Web Development - English
  { id: '16', title: 'freeCodeCamp', description: 'Free coding courses and certifications', category: 'Web Development', type: 'course', url: 'https://www.freecodecamp.org', platform: 'freeCodeCamp', isPaid: false, duration: '300+ hours', level: 'beginner', tags: ['coding', 'html', 'css', 'javascript'], language: 'english' },
  { id: '17', title: 'The Odin Project', description: 'Full stack web development curriculum', category: 'Web Development', type: 'course', url: 'https://www.theodinproject.com', platform: 'The Odin Project', isPaid: false, duration: '500+ hours', level: 'beginner', tags: ['full stack', 'web dev'], language: 'english' },
  { id: '18', title: 'Next.js Learn', description: 'Official Next.js tutorial', category: 'Web Development', type: 'course', url: 'https://nextjs.org/learn', platform: 'Vercel', isPaid: false, duration: '8 hours', level: 'intermediate', tags: ['nextjs', 'react'], language: 'english' },

  // Web Development - Hindi
  { id: '40', title: 'CodeWithHarry - Web Dev', description: 'Complete web development in Hindi', category: 'Web Development', type: 'youtube', url: 'https://www.youtube.com/@CodeWithHarry', platform: 'YouTube', isPaid: false, duration: '100+ hours', level: 'beginner', tags: ['hindi', 'web development', 'full stack'], language: 'hindi' },
  { id: '41', title: 'Thapa Technical - MERN', description: 'MERN stack development in Hindi', category: 'Web Development', type: 'youtube', url: 'https://www.youtube.com/@ThapaTechnical', platform: 'YouTube', isPaid: false, duration: '50+ hours', level: 'intermediate', tags: ['hindi', 'mern', 'react'], language: 'hindi' },

  // Analytics - English
  { id: '19', title: 'Google Analytics Academy', description: 'Official GA4 certification', category: 'Analytics', type: 'course', url: 'https://skillshop.withgoogle.com/googleanalytics', platform: 'Google', isPaid: false, duration: '10 hours', level: 'intermediate', tags: ['ga4', 'analytics', 'certification'], language: 'english' },
  { id: '20', title: 'Google Tag Manager Fundamentals', description: 'Learn GTM implementation', category: 'Analytics', type: 'course', url: 'https://skillshop.withgoogle.com', platform: 'Google', isPaid: false, duration: '5 hours', level: 'intermediate', tags: ['gtm', 'tracking'], language: 'english' },

  // Analytics - Hindi
  { id: '42', title: 'Analytics Hindi Tutorial', description: 'Google Analytics 4 in Hindi', category: 'Analytics', type: 'youtube', url: 'https://www.youtube.com/results?search_query=google+analytics+4+hindi', platform: 'YouTube', isPaid: false, duration: '10 hours', level: 'beginner', tags: ['hindi', 'ga4', 'tutorial'], language: 'hindi' },

  // Copywriting - English
  { id: '21', title: 'Copyblogger', description: 'Free content marketing and copywriting guides', category: 'Copywriting', type: 'article', url: 'https://copyblogger.com/blog', platform: 'Copyblogger', isPaid: false, level: 'beginner', tags: ['copywriting', 'content'], language: 'english' },
  { id: '22', title: 'Conversion Copywriting Guide', description: 'By Joanna Wiebe of Copyhackers', category: 'Copywriting', type: 'article', url: 'https://copyhackers.com', platform: 'Copyhackers', isPaid: false, level: 'intermediate', tags: ['conversion', 'copywriting'], language: 'english' },

  // Business Skills - English
  { id: '23', title: 'Coursera - Digital Marketing Specialization', description: 'University of Illinois certification', category: 'Business Skills', type: 'course', url: 'https://www.coursera.org/specializations/digital-marketing', platform: 'Coursera', isPaid: true, price: '$49/month', duration: '6 months', level: 'intermediate', tags: ['certification', 'university'], language: 'english' },
  { id: '24', title: 'LinkedIn Learning', description: 'Business and professional development courses', category: 'Business Skills', type: 'course', url: 'https://www.linkedin.com/learning', platform: 'LinkedIn', isPaid: true, price: '$30/month', duration: 'Varies', level: 'intermediate', tags: ['professional', 'business'], language: 'english' },

  // Business Skills - Hindi
  { id: '43', title: 'Vivek Bindra - Business', description: 'Business fundamentals in Hindi', category: 'Business Skills', type: 'youtube', url: 'https://www.youtube.com/@DrVivekBindra', platform: 'YouTube', isPaid: false, duration: '200+ hours', level: 'beginner', tags: ['hindi', 'business', 'motivational'], language: 'hindi' },
  { id: '44', title: 'Rajiv Talreja - Sales', description: 'Sales and business growth in Hindi', category: 'Business Skills', type: 'youtube', url: 'https://www.youtube.com/@RajivTalreja', platform: 'YouTube', isPaid: false, duration: '50+ hours', level: 'intermediate', tags: ['hindi', 'sales', 'growth'], language: 'hindi' },

  // AI & Automation - English
  { id: '25', title: 'Prompt Engineering Guide', description: 'Learn effective AI prompting', category: 'AI & Automation', type: 'article', url: 'https://www.promptingguide.ai', platform: 'Open Source', isPaid: false, level: 'beginner', tags: ['ai', 'prompts', 'chatgpt'], language: 'english' },
  { id: '26', title: 'Zapier University', description: 'Automation and workflow tutorials', category: 'AI & Automation', type: 'course', url: 'https://zapier.com/learn', platform: 'Zapier', isPaid: false, duration: '10 hours', level: 'beginner', tags: ['automation', 'workflow'], language: 'english' },
  { id: '27', title: 'Make Academy', description: 'Advanced automation with Make', category: 'AI & Automation', type: 'course', url: 'https://www.make.com/en/academy', platform: 'Make', isPaid: false, duration: '8 hours', level: 'intermediate', tags: ['automation', 'integrations'], language: 'english' },

  // AI & Automation - Hindi
  { id: '45', title: 'AI Hindi Tutorial', description: 'ChatGPT and AI tools in Hindi', category: 'AI & Automation', type: 'youtube', url: 'https://www.youtube.com/results?search_query=chatgpt+hindi+tutorial', platform: 'YouTube', isPaid: false, duration: '15+ hours', level: 'beginner', tags: ['hindi', 'chatgpt', 'ai tools'], language: 'hindi' },
  { id: '46', title: 'Automation Hindi', description: 'Marketing automation in Hindi', category: 'AI & Automation', type: 'youtube', url: 'https://www.youtube.com/results?search_query=marketing+automation+hindi', platform: 'YouTube', isPaid: false, duration: '10+ hours', level: 'intermediate', tags: ['hindi', 'automation', 'marketing'], language: 'hindi' },
]

export const recommendedBooks = [
  { title: 'Building a StoryBrand', author: 'Donald Miller', category: 'Marketing', description: 'Clarify your message so customers will listen' },
  { title: 'Made to Stick', author: 'Chip & Dan Heath', category: 'Communication', description: 'Why some ideas survive and others die' },
  { title: 'Contagious', author: 'Jonah Berger', category: 'Marketing', description: 'Why things catch on' },
  { title: 'Hooked', author: 'Nir Eyal', category: 'Product', description: 'How to build habit-forming products' },
  { title: 'The 1-Page Marketing Plan', author: 'Allan Dib', category: 'Marketing', description: 'Get new customers and make more money' },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Productivity', description: 'Tiny changes, remarkable results' },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Productivity', description: 'Rules for focused success' },
  { title: 'This Is Marketing', author: 'Seth Godin', category: 'Marketing', description: 'You can not be seen until you learn to see' },
]
