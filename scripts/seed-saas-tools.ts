/**
 * SaaS Tools Migration Script
 *
 * Run with: npx ts-node scripts/seed-saas-tools.ts
 *
 * This script migrates SaaS tools from the static file to the database.
 * It's safe to run multiple times - existing tools will be skipped.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Static tool data (migrating from saasTools.ts)
const saasToolsData = [
  // Website Builders
  { name: 'ezsite', category: 'Website Builders', description: 'Website builder', url: 'https://ezsite.com', loginType: 'team' },
  { name: 'Webwave', category: 'Website Builders', description: 'Drag & drop website builder', url: 'https://webwave.me/', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Swipe Pages', category: 'Website Builders', description: 'Landing page builder', url: 'https://swipepages.com/', loginType: 'subaccount', email: 'brian@brandingpioneers.com', password: 'BPtools@4321' },
  { name: 'Mixo', category: 'Website Builders', description: 'AI website generator', url: 'https://app.mixo.io/sites/new', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Toddle', category: 'Website Builders', description: 'Visual web app builder', url: 'https://toddle.dev/', loginType: 'team' },
  { name: 'PageMaker', category: 'Website Builders', description: 'Landing page builder', url: 'https://app.pagemaker.io', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Webcake', category: 'Website Builders', description: 'Free landing page builder', url: 'https://webcake.io/', loginType: 'free', notes: 'Free with custom domain' },
  { name: 'BlogHunch', category: 'Website Builders', description: 'Blogging platform', url: 'https://bloghunch.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Storipress', category: 'Website Builders', description: 'Publishing platform', url: 'https://storipress.com', loginType: 'subaccount', email: 'Brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'QuickBlog', category: 'Website Builders', description: 'Quick blog setup', url: 'https://app.quickblog.co/dashboard', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Brilliant Directories', category: 'Website Builders', description: 'Directory website builder', url: 'https://brilliantdirectories.com', loginType: 'team', password: 'BPtools@4321' },
  { name: 'AppMySite', category: 'Website Builders', description: 'App builder', url: 'https://app.appmysite.com/', loginType: 'whitelabel', email: 'Brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Fouita', category: 'Website Builders', description: 'Widget builder', url: 'https://fouita.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'OneDomain', category: 'Website Builders', description: 'Domain management', url: 'https://onedomain.io/', loginType: 'team', password: 'BPtools@4321' },

  // Forms & Surveys
  { name: 'MangoForm', category: 'Forms & Surveys', description: 'Form builder', url: 'https://www.mangoform.app/', loginType: 'team', email: 'Brandingpioneers@gmail.com' },
  { name: 'MakeForms', category: 'Forms & Surveys', description: 'Form builder', url: 'https://app.us.makeforms.io/', loginType: 'subaccount', email: 'Brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Formester', category: 'Forms & Surveys', description: 'Form builder', url: 'https://app.formester.com/', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Headless Forms', category: 'Forms & Surveys', description: 'Headless form backend', url: 'https://app.headlessforms.cloud/login', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'BoloForms', category: 'Forms & Surveys', description: 'Google Forms alternative', url: 'https://www.boloforms.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Formaloo', category: 'Forms & Surveys', description: 'No-code form builder', url: 'https://www.formaloo.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'VoiceForm', category: 'Forms & Surveys', description: 'Voice-enabled forms', url: 'https://app.voiceform.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Meiro', category: 'Forms & Surveys', description: 'Interactive quizzes', url: 'https://app.meiro.cc/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'MetaSurvey', category: 'Forms & Surveys', description: 'Survey tool', url: 'https://app.getmetasurvey.com/', loginType: 'team', password: 'BPtools@4321' },

  // Chatbots & AI
  { name: 'Poper AI', category: 'Chatbots & AI', description: 'Website popups', url: 'https://www.poper.ai/', loginType: 'team', email: 'Brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Chatbase', category: 'Chatbots & AI', description: 'AI chatbot builder', url: 'https://www.chatbase.co/', loginType: 'subaccount', email: 'Brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Orimon AI', category: 'Chatbots & AI', description: 'AI chatbot', url: 'https://orimon.ai/', loginType: 'whitelabel', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Ideta', category: 'Chatbots & AI', description: 'Chatbot platform', url: 'https://www.ideta.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Boei', category: 'Chatbots & AI', description: 'Website chat widget', url: 'https://boei.help/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'BotBiz', category: 'Chatbots & AI', description: 'WhatsApp chatbot', url: 'https://dash.botbiz.app/login', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Sensibot', category: 'Chatbots & AI', description: 'WhatsApp automation', url: 'https://sensibot.io', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'ToChat', category: 'Chatbots & AI', description: 'WhatsApp chat widget', url: 'https://services.tochat.be/login', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'LiveCaller', category: 'Chatbots & AI', description: 'Live chat & calls', url: 'https://livecaller.io/login', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'PinChat', category: 'Chatbots & AI', description: 'Chat widget', url: 'https://pinchat.me/en/dashboard/', loginType: 'whitelabel', email: 'Brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // CRM & Sales
  { name: 'Trafft', category: 'CRM & Sales', description: 'Appointment scheduling', url: 'https://agency.trafft.com/', loginType: 'whitelabel', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'TidyCal', category: 'CRM & Sales', description: 'Calendar scheduling', url: 'https://tidycal.com/', loginType: 'subaccount', email: 'toolsfbp@gmail.com', password: 'BPtools@4321' },
  { name: 'CallbackTracker', category: 'CRM & Sales', description: 'Callback tracking', url: 'https://app.callbacktracker.com/user/login', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'CallZara', category: 'CRM & Sales', description: 'Call management', url: 'https://app.callzara.com/login', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'ClientManager', category: 'CRM & Sales', description: 'Client management', url: 'https://app.clientmanager.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Samdock', category: 'CRM & Sales', description: 'Simple CRM', url: 'https://samdock.app/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordsamdock' },
  { name: 'ClientJoy', category: 'CRM & Sales', description: 'Agency CRM', url: 'https://www.clientjoy.io/', loginType: 'team', email: 'Brandingpioneers@gmail.com' },
  { name: 'HeyReach', category: 'CRM & Sales', description: 'LinkedIn outreach', url: 'https://heyreach.io', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Waalaxy', category: 'CRM & Sales', description: 'LinkedIn automation', url: 'https://app.waalaxy.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', notes: 'Login with LinkedIn' },
  { name: 'SalesHandy', category: 'CRM & Sales', description: 'Email outreach', url: 'https://my.saleshandy.com/sequence', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Climbo', category: 'CRM & Sales', description: 'Referral program', url: 'https://app.climbo.com/', loginType: 'whitelabel', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Social Media
  { name: 'ContentStudio', category: 'Social Media', description: 'Social media management', url: 'https://app.contentstudio.io', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Postly', category: 'Social Media', description: 'Social scheduling', url: 'https://app.postly.ai/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'BPtools@4321' },
  { name: 'SuperGrow', category: 'Social Media', description: 'LinkedIn growth', url: 'https://app.supergrow.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'HashtagsForLikes', category: 'Social Media', description: 'Hashtag research', url: 'https://www.hashtagsforlikes.co/login', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Instoo', category: 'Social Media', description: 'Instagram automation', url: 'https://instoo.com/', loginType: 'team', email: 'Brandingpioneers@gmail.com', password: 'BPtools@4321', notes: 'Chrome extension required' },
  { name: 'SleekBio', category: 'Social Media', description: 'Link in bio', url: 'https://sleekbio.com/', loginType: 'team', email: 'contentwithbp@gmail.com', password: 'BPtools@4321' },
  { name: 'LinkHub', category: 'Social Media', description: 'Link in bio', url: 'https://linkhub.online/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'BPtools@4321', notes: 'Username: med' },
  { name: 'Snip.ly', category: 'Social Media', description: 'Link shortener with CTA', url: 'https://snip.ly/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'BPtools@4321' },
  { name: 'Replug', category: 'Social Media', description: 'Link management', url: 'https://app.replug.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Oviond', category: 'Social Media', description: 'Agency reporting', url: 'https://app.oviond.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Snackeet', category: 'Social Media', description: 'Story builder', url: 'https://snackeet.com', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Ravely', category: 'Social Media', description: 'Reviews widget', url: 'https://dashboard.ravely.io/widget', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'KuickFeed', category: 'Social Media', description: 'Social wall', url: 'https://app.kuickfeed.com/admin', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Linke.to', category: 'Social Media', description: 'Link in bio', url: 'https://linke.to/dashboard/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321', notes: 'Use code: 474783' },
  { name: 'Linkz AI', category: 'Social Media', description: 'Link management', url: 'https://dashboard.linkz.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // SEO Tools
  { name: 'SEO Crawl', category: 'SEO Tools', description: 'SEO crawler', url: 'https://app.seocrawl.com/dashboard', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'SEO Pilot', category: 'SEO Tools', description: 'SEO automation', url: 'https://app.seopilot.io/dashboard/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'SEOwl', category: 'SEO Tools', description: 'SEO monitoring', url: 'https://app.seowl.co/', loginType: 'team', email: 'seowithbp@gmail.com', password: 'BPtools@4321' },
  { name: 'SiteGuru', category: 'SEO Tools', description: 'SEO checklist', url: 'https://app.siteguru.co/', loginType: 'team', email: 'seowithbp@gmail.com', password: 'BPtools@4321' },
  { name: 'Nozzle', category: 'SEO Tools', description: 'Rank tracking', url: 'https://app.nozzle.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', notes: 'Login through email' },
  { name: 'TopicMojo', category: 'SEO Tools', description: 'Topic research', url: 'https://topicmojo.com/', loginType: 'team', email: 'brandingpioneers@gmail.com' },
  { name: 'AltText AI', category: 'SEO Tools', description: 'Alt text generator', url: 'https://alttext.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Screpy', category: 'SEO Tools', description: 'Website analyzer', url: 'https://app.screpy.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Strell', category: 'SEO Tools', description: 'Content optimization', url: 'https://app.strell.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'RankAtom', category: 'SEO Tools', description: 'Rank tracker', url: 'https://rankatom.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Postaga', category: 'SEO Tools', description: 'Link building outreach', url: 'https://app.postaga.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Hexometer', category: 'SEO Tools', description: 'Website monitoring', url: 'https://hexometer.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Switchy', category: 'SEO Tools', description: 'Link management', url: 'https://switchy.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Design & Media
  { name: 'Canva', category: 'Design & Media', description: 'Design tool', url: 'https://canva.com/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'BPtools@4321' },
  { name: 'Freepik', category: 'Design & Media', description: 'Stock graphics', url: 'https://www.freepik.com/', loginType: 'team', email: 'dataofbp@gmail.com', password: 'BPtools@4321' },
  { name: 'UIHut', category: 'Design & Media', description: 'UI resources', url: 'https://uihut.com/', loginType: 'team', email: 'toolsfbp@gmail.com', password: 'BPtools@4321' },
  { name: 'Creattie', category: 'Design & Media', description: 'Lottie animations', url: 'https://creattie.com/', loginType: 'team', email: 'toolsfbp@gmail.com', password: 'BPtools@4321' },
  { name: 'LogoDiffusion', category: 'Design & Media', description: 'AI logo generator', url: 'https://logodiffusion.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'PosterStudio', category: 'Design & Media', description: 'AI ad creator', url: 'https://app.posterstudio.ai/create-ads', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Robolly', category: 'Design & Media', description: 'Image automation', url: 'https://robolly.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Abyssale', category: 'Design & Media', description: 'Banner automation', url: 'https://app.abyssale.com/', loginType: 'team', email: 'ramon.hein9@gmail.com', password: 'BPtools@4321' },
  { name: 'Dezygn', category: 'Design & Media', description: 'Design apps', url: 'https://my.dezygn.com/dl/apps', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Envato Elements', category: 'Design & Media', description: 'Creative assets', url: 'https://elements.envato.com/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'BPtools@4321', notes: 'Premium subscription' },
  { name: 'MonsterONE', category: 'Design & Media', description: 'Templates & themes', url: 'https://monsterone.com/', loginType: 'free', password: 'BPtools@4321' },
  { name: 'ThemeForest', category: 'Design & Media', description: 'Premium themes', url: 'http://themeforest.net/', loginType: 'team', password: 'BPtools@4321' },

  // Video & Animation
  { name: 'Steve AI', category: 'Video & Animation', description: 'AI video generator', url: 'https://steve.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com' },
  { name: 'ContentFries', category: 'Video & Animation', description: 'Video repurposing', url: 'https://app.contentfries.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Fliki', category: 'Video & Animation', description: 'AI video creation', url: 'https://app.fliki.ai/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'Demo@4321' },
  { name: 'Wave.video', category: 'Video & Animation', description: 'Video marketing', url: 'https://wave.video/videos', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'InVideo', category: 'Video & Animation', description: 'Video editor', url: 'https://invideo.io/', loginType: 'team', email: 'Brandingpioneers', password: 'brandingpioneers1234' },
  { name: 'Lumen5', category: 'Video & Animation', description: 'Video from text', url: 'https://lumen5.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Passwordlumen5' },
  { name: 'Woxo', category: 'Video & Animation', description: 'Video automation', url: 'https://woxo.tech/dashboard', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordwoxo' },
  { name: 'Jitter', category: 'Video & Animation', description: 'Motion design', url: 'https://jitter.video/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordjitter' },
  { name: 'Animatron', category: 'Video & Animation', description: 'Animation editor', url: 'https://editor.animatron.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Kapwing', category: 'Video & Animation', description: 'Video editor', url: 'https://www.kapwing.com/', loginType: 'team', email: 'brandingpioneers@gmail.com' },
  { name: 'Speechki', category: 'Video & Animation', description: 'Text to speech', url: 'https://plugin.speechki.org/projects', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'BPtools@4321' },
  { name: 'Gumlet', category: 'Video & Animation', description: 'Video hosting', url: 'https://www.gumlet.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'FlexClip', category: 'Video & Animation', description: 'Video editor', url: 'https://www.flexclip.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Guidejar', category: 'Video & Animation', description: 'Product demos', url: 'https://www.guidejar.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Taja AI', category: 'Video & Animation', description: 'YouTube SEO', url: 'https://www.taja.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'VideoTok', category: 'Video & Animation', description: 'Short video creator', url: 'https://www.videotok.app/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Content & Writing
  { name: 'AISEO', category: 'Content & Writing', description: 'AI writing', url: 'https://aiseo.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'WordHero', category: 'Content & Writing', description: 'AI copywriter', url: 'https://app.wordhero.co/home', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Writecream', category: 'Content & Writing', description: 'AI content', url: 'https://app.writecream.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Rytr', category: 'Content & Writing', description: 'AI writer', url: 'https://rytr.me/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordrytr' },
  { name: 'NeuronWriter', category: 'Content & Writing', description: 'SEO content', url: 'https://app.neuronwriter.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Creaitor', category: 'Content & Writing', description: 'AI content', url: 'https://www.creaitor.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Grammarly', category: 'Content & Writing', description: 'Writing assistant', url: 'https://www.grammarly.com/signin', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'Demo@4321' },
  { name: 'Linguix', category: 'Content & Writing', description: 'Grammar checker', url: 'https://linguix.com/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'Demo@4321' },
  { name: 'Katteb', category: 'Content & Writing', description: 'AI writer', url: 'https://katteb.com/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'Demo@4321' },
  { name: 'WritePanda', category: 'Content & Writing', description: 'AI content', url: 'https://www.writepanda.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Analytics
  { name: 'TruConversion', category: 'Analytics', description: 'Conversion tracking', url: 'https://app.truconversion.com/', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'WiserNotify', category: 'Analytics', description: 'Social proof', url: 'https://app.wisernotify.com/dashboard', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'UserMaven', category: 'Analytics', description: 'Privacy analytics', url: 'https://app.usermaven.com/login', loginType: 'subaccount', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Proven.ly', category: 'Analytics', description: 'Social proof popups', url: 'https://app.proven.ly/app-socialproof/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'TwicPics', category: 'Analytics', description: 'Image optimization', url: 'https://account.twicpics.com', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Popupular', category: 'Analytics', description: 'Popup builder', url: 'https://dashboard.popupular.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'SparrowCharts', category: 'Analytics', description: 'Marketing analytics', url: 'https://www.sparrowcharts.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Digivizer', category: 'Analytics', description: 'Analytics dashboard', url: 'https://app.digivizer.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Netumo', category: 'Analytics', description: 'Uptime monitoring', url: 'https://www.netumo.app/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Automation
  { name: 'Pabbly', category: 'Automation', description: 'Workflow automation', url: 'https://www.pabbly.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordpabbly' },
  { name: 'Hexomatic', category: 'Automation', description: 'Web scraping', url: 'https://dash.hexomatic.com/workflows/create', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Browse AI', category: 'Automation', description: 'Web scraping', url: 'https://browse.ai', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'Demo@4321' },
  { name: 'ZeroWork', category: 'Automation', description: 'Browser automation', url: 'https://app.zerowork.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Robomotion', category: 'Automation', description: 'RPA automation', url: 'https://branding.robomotion.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'CheatLayer', category: 'Automation', description: 'No-code automation', url: 'https://cheatlayer.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Outscraper', category: 'Automation', description: 'Google Maps scraper', url: 'https://app.outscraper.com/googleMaps', loginType: 'team', email: 'brandingpioneers@gmail.com' },
  { name: 'LeadsGorilla', category: 'Automation', description: 'Local SEO leads', url: 'https://app.leadsgorilla.net/login', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Email & Marketing
  { name: 'Acumbamail', category: 'Email & Marketing', description: 'Email marketing', url: 'https://acumbamail.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'SendFox', category: 'Email & Marketing', description: 'Email for creators', url: 'https://sendfox.com/dashboard', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Kirim Email', category: 'Email & Marketing', description: 'Email automation', url: 'https://member.kirim.email/', loginType: 'team', email: 'toolsfbp@gmail.com', password: 'BPtools@4321' },
  { name: 'NuReply', category: 'Email & Marketing', description: 'Email outreach', url: 'https://nureply.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'ShortySMS', category: 'Email & Marketing', description: 'SMS marketing', url: 'https://shortysms.com/dashboard/checklist', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Gravitec', category: 'Email & Marketing', description: 'Push notifications', url: 'https://push.gravitec.net/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Pushfy', category: 'Email & Marketing', description: 'Push notifications', url: 'https://pushfy.me/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'KingSumo', category: 'Email & Marketing', description: 'Viral giveaways', url: 'https://kingsumo.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Ads & PPC
  { name: 'AdCrux', category: 'Ads & PPC', description: 'Email campaigns', url: 'https://adcrux.io/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordadcrux' },
  { name: 'FraudBlocker', category: 'Ads & PPC', description: 'Click fraud protection', url: 'https://fraudblocker.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Plai', category: 'Ads & PPC', description: 'AI ad creation', url: 'https://app.plai.io/home', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordplai' },
  { name: 'Adriel', category: 'Ads & PPC', description: 'Ad analytics', url: 'https://www.adriel.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'passwordadriel' },
  { name: 'Retargetify', category: 'Ads & PPC', description: 'Retargeting pixels', url: 'https://getretargetify.com/dashboard', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'Demo@4321' },
  { name: 'TagMate', category: 'Ads & PPC', description: 'Tag management', url: 'https://track.tagmate.app/', loginType: 'team', email: 'toolsofbp@gmail.com', password: 'Demo@4321' },
  { name: 'CampaignHero', category: 'Ads & PPC', description: 'Google Ads AI', url: 'https://campaignhero.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },
  { name: 'Shown', category: 'Ads & PPC', description: 'AI ad creation', url: 'https://app.shown.io/dashboard', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },

  // Collaboration
  { name: 'Taskade', category: 'Collaboration', description: 'Team workspace', url: 'https://www.taskade.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Sessions', category: 'Collaboration', description: 'Video meetings', url: 'https://sessions.us/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Butter', category: 'Collaboration', description: 'Workshop platform', url: 'https://butter.us', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'GoBrunch', category: 'Collaboration', description: 'Virtual rooms', url: 'https://gobrunch.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'MeetGeek', category: 'Collaboration', description: 'Meeting transcription', url: 'https://meetgeek.ai/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'CrowdParty', category: 'Collaboration', description: 'Team games', url: 'https://crowdparty.app', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Ruttl', category: 'Collaboration', description: 'Website feedback', url: 'https://app.ruttl.com/', loginType: 'whitelabel', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'WebVizio', category: 'Collaboration', description: 'Visual feedback', url: 'https://app.webvizio.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'Retable', category: 'Collaboration', description: 'Smart spreadsheets', url: 'https://retable.io', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },

  // Hosting & Storage
  { name: 'Google Drive', category: 'Hosting & Storage', description: '2TB storage', url: 'https://drive.google.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', notes: '2TB storage' },
  { name: 'Koofr', category: 'Hosting & Storage', description: '1TB storage', url: 'https://app.koofr.net/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321', notes: '1TB storage' },
  { name: 'pCloud', category: 'Hosting & Storage', description: '10TB storage', url: 'https://u.pcloud.com/', loginType: 'team', email: 'datapfbp@gmail.com', password: 'passwordpcloud12345', notes: '10TB storage' },
  { name: 'Internxt', category: 'Hosting & Storage', description: '5TB storage', url: 'https://drive.internxt.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321', notes: '5TB storage' },
  { name: 'BackupSheep', category: 'Hosting & Storage', description: 'Cloud backup', url: 'https://backupsheep.com/', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'BPtools@4321' },
  { name: 'A2 Hosting', category: 'Hosting & Storage', description: 'Web hosting', url: 'https://my.a2hosting.com/', loginType: 'team', email: 'arush.thapar@yahoo.com', password: 'Demo@987654321' },
  { name: 'VapourHost', category: 'Hosting & Storage', description: 'Web hosting', url: 'https://my.vapourhost.com/login', loginType: 'team', email: 'brandingpioneers@gmail.com', password: 'Demo@4321' },

  // Chrome Extensions
  { name: 'DivMagic', category: 'Chrome Extensions', description: 'Copy CSS from sites', url: 'https://chromewebstore.google.com/detail/divmagic', loginType: 'team', email: 'Brandingpioneers@gmail.com' },
]

async function seedSaasTools() {
  console.log('Starting SaaS tools migration...\n')

  let created = 0
  let skipped = 0
  let errors = 0

  for (const tool of saasToolsData) {
    try {
      // Check if tool already exists by name
      const existing = await prisma.saasTool.findFirst({
        where: { name: tool.name },
      })

      if (existing) {
        console.log(`  [SKIP] ${tool.name} - already exists`)
        skipped++
        continue
      }

      await prisma.saasTool.create({
        data: {
          name: tool.name,
          category: tool.category,
          description: tool.description || null,
          url: tool.url,
          loginType: tool.loginType,
          email: tool.email || null,
          password: tool.password || null,
          notes: tool.notes || null,
          isActive: true,
          accessLevel: 'ALL',
        },
      })
      console.log(`  [OK] ${tool.name} - created`)
      created++
    } catch (error) {
      console.error(`  [ERROR] ${tool.name} - ${error}`)
      errors++
    }
  }

  console.log('\n--- Migration Complete ---')
  console.log(`  Created: ${created}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Errors: ${errors}`)
  console.log(`  Total: ${saasToolsData.length}`)
}

seedSaasTools()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
