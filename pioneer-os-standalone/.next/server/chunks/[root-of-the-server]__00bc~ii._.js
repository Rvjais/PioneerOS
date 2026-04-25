;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="f1b8946d-e183-8a79-8dd1-062c3f77989d")}catch(e){}}();
module.exports=[524836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},921517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},449719,(e,t,r)=>{t.exports=e.x("assert",()=>require("assert"))},792509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},427699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},145706,(e,t,r)=>{t.exports=e.x("querystring",()=>require("querystring"))},254799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},463021,(e,t,r)=>{t.exports=e.x("@prisma/client-2c3a283f134fdcb6",()=>require("@prisma/client-2c3a283f134fdcb6"))},500874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},918622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},556704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},832319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},324725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},224361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},406461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},193695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},970862,e=>{"use strict";var t=e.i(254799);let r="aes-256-gcm";function n(){let e=process.env.ENCRYPTION_KEY;if(!e)throw Error("ENCRYPTION_KEY environment variable is REQUIRED in production. Refusing to start with default key.");if(e.length<32)throw Error("ENCRYPTION_KEY must be at least 32 characters for adequate security");if(64===e.length&&/^[0-9a-fA-F]+$/.test(e))return Buffer.from(e,"hex");let r=process.env.ENCRYPTION_SALT;if(!r)throw Error("ENCRYPTION_SALT is required in production. Set a unique ENCRYPTION_SALT environment variable.");return t.scryptSync(e,r||"pioneer-os-default-salt",32)}function a(e){if(!e)return e;try{let a=n(),i=t.randomBytes(16),s=t.createCipheriv(r,a,i),o=s.update(e,"utf8","base64");o+=s.final("base64");let l=s.getAuthTag();return`${i.toString("base64")}:${l.toString("base64")}:${o}`}catch(e){throw console.error("Encryption error:",e),Error("Failed to encrypt data")}}function i(e){if(!e||!e.includes(":"))return e;try{let a=n(),i=e.split(":");if(3!==i.length)return e;let[s,o,l]=i,c=Buffer.from(s,"base64"),d=Buffer.from(o,"base64"),p=t.createDecipheriv(r,a,c);p.setAuthTag(d);let u=p.update(l,"base64","utf8");return u+=p.final("utf8")}catch(e){throw console.error("Decryption error: failed to decrypt value"),Error("Failed to decrypt data. The encryption key may have changed or the data is corrupted.")}}e.s(["SALARY_FIELDS",0,{candidate:["salary"],internProfile:["stipendAmount"],freelancerProfile:["hourlyRate","projectRate","retainerAmount","totalEarned","pendingAmount"],freelancerWorkReport:["billableAmount"],freelancerPayment:["amount"],departmentBaseline:["baseSalary","baseUnits"],fnfSettlement:["totalAmount","netPayable"],fnfLineItem:["amount"],incentivePayout:["unitIncentive","achievementBonus","referralBonus","attendanceBonus","totalIncentive","deductions"],rbcAccrual:["amount"],rbcPayout:["amount"]},"SENSITIVE_FIELDS",0,{profile:["panCard","aadhaar","parentsPhone1","parentsPhone2","emergencyContactPhone"],client:["gstNumber","panNumber","bankAccount","credentials"],freelancerProfile:["panNumber","gstNumber","bankAccountNumber","bankIfscCode","upiId"],vendorOnboarding:["gstNumber","panNumber","bankAccountNumber","bankIFSC"],entityBankAccount:["accountNumber","ifscCode","swiftCode","routingNumber"],entityPaymentGateway:["apiKeyId","apiKeySecret","webhookSecret","merchantId"],companyEntity:["gstNumber","panNumber","tanNumber","einNumber","cinNumber"]},"canViewSalaryData",0,function(e,t){return"SUPER_ADMIN"===e||"ACCOUNTS"===e||"HR"===t||"ACCOUNTS"===t},"decrypt",0,i,"decryptJSON",0,function(e){if(!e)return null;try{let t=i(e);return JSON.parse(t)}catch{return null}},"encrypt",0,a,"encryptJSON",0,function(e){return a(JSON.stringify(e))},"isEncrypted",0,function(e){if(!e)return!1;let t=e.split(":");if(3!==t.length)return!1;let r=/^[A-Za-z0-9+/]+=*$/;return t.every(e=>r.test(e))},"maskBankAccount",0,function(e){return e?e.length<=4?"*".repeat(e.length):"*".repeat(e.length-4)+e.slice(-4):""},"maskSensitive",0,function(e,t=4){return e?e.length<=t?"*".repeat(e.length):"*".repeat(e.length-t)+e.slice(-t):""}])},35344,e=>{"use strict";let t;var r=e.i(463021),n=e.i(970862);let a={Profile:n.SENSITIVE_FIELDS.profile,Client:n.SENSITIVE_FIELDS.client,FreelancerProfile:n.SENSITIVE_FIELDS.freelancerProfile,VendorOnboarding:n.SENSITIVE_FIELDS.vendorOnboarding,EntityBankAccount:n.SENSITIVE_FIELDS.entityBankAccount,EntityPaymentGateway:n.SENSITIVE_FIELDS.entityPaymentGateway,CompanyEntity:n.SENSITIVE_FIELDS.companyEntity};function i(e,t){let r=a[e];if(!r||!t)return t;let i={...t};for(let e of r){let t=i[e];"string"==typeof t&&t&&!(0,n.isEncrypted)(t)&&(i[e]=(0,n.encrypt)(t))}return i}function s(e,t){let r=a[e];if(!r||!t)return t;let i={...t};for(let e of r){let t=i[e];"string"==typeof t&&t&&(0,n.isEncrypted)(t)&&(i[e]=(0,n.decrypt)(t))}return i}n.SALARY_FIELDS.candidate,n.SALARY_FIELDS.internProfile,n.SALARY_FIELDS.freelancerProfile,n.SALARY_FIELDS.freelancerWorkReport,n.SALARY_FIELDS.freelancerPayment,n.SALARY_FIELDS.departmentBaseline,n.SALARY_FIELDS.fnfSettlement,n.SALARY_FIELDS.fnfLineItem,n.SALARY_FIELDS.incentivePayout,n.SALARY_FIELDS.rbcAccrual,n.SALARY_FIELDS.rbcPayout;let o=["Profile","Client","FreelancerProfile","VendorOnboarding","EntityBankAccount","EntityPaymentGateway","CompanyEntity"];globalThis.prismaGlobal=globalThis.prismaGlobal??((t=new r.PrismaClient({log:["error"],datasources:{db:{url:function(){let e=process.env.DATABASE_URL||"";if(!e)return e;let t=e.includes("?")?"&":"?",r=e.includes("connection_limit="),n=e.includes("pool_timeout="),a=[];return r||a.push("connection_limit=5"),n||a.push("pool_timeout=10"),a.length>0?e+t+a.join("&"):e}()}}})).$use(async(e,t)=>{let{model:r,action:n,args:a}=e;if("true"===process.env.DISABLE_ENCRYPTION,!r||!o.includes(r))return t(e);["create","update","upsert","createMany","updateMany"].includes(n)&&(a.data&&(Array.isArray(a.data)?a.data=a.data.map(e=>i(r,e)):a.data=i(r,a.data)),"upsert"===n&&(a.create&&(a.create=i(r,a.create)),a.update&&(a.update=i(r,a.update))));let l=await t(e);if(l&&["findUnique","findFirst","findMany","create","update","upsert"].includes(n)){if(Array.isArray(l))return l&&Array.isArray(l)?l.map(e=>s(r,e)):l;else if("object"==typeof l&&null!==l)return s(r,l)}return l}),t);let l=globalThis.prismaGlobal;e.s(["default",0,l,"prisma",0,l],35344)},108875,(e,t,r)=>{t.exports=e.x("ioredis-23a6225d3f8c0bff",()=>require("ioredis-23a6225d3f8c0bff"))},456622,e=>{"use strict";var t=e.i(108875),r=e.i(254799);let n={maxRequests:30,windowMs:6e4,keyPrefix:"ratelimit:"},a=null,i=!1,s=new Map,o=null;async function l(e,t,r){let n=Date.now(),a=s.get(e);return!a||a.resetAt<n?(a={count:1,resetAt:n+r},s.set(e,a),{success:!0,remaining:t-1,resetAt:a.resetAt}):a.count>=t?{success:!1,remaining:0,resetAt:a.resetAt,retryAfter:Math.ceil((a.resetAt-n)/1e3)}:(a.count++,s.set(e,a),{success:!0,remaining:t-a.count,resetAt:a.resetAt})}async function c(e,t,n,a){let i=Date.now(),s=i-a,o=e.pipeline();o.zremrangebyscore(t,"-inf",s),o.zadd(t,i.toString(),`${i}:${r.default.randomUUID()}`),o.zcard(t),o.pexpire(t,a);let c=await o.exec();if(!c)return l(t,n,a);let d=c[2]?.[1]||0,p=i+a;return d>n?{success:!1,remaining:0,resetAt:p,retryAfter:Math.ceil(a/1e3)}:{success:!0,remaining:n-d,resetAt:p}}async function d(e,r={}){let{maxRequests:s,windowMs:o,keyPrefix:p}={...n,...r},u=`${p}${e}`,m=function(){if(a)return a;let e=process.env.REDIS_URL;if(!e)return console.error("[RateLimit] WARNING: REDIS_URL not set in production — using in-memory rate limiting. This is NOT safe across multiple instances."),null;try{return(a=new t.default(e,{maxRetriesPerRequest:1,retryStrategy:e=>e>3?(console.error("[RateLimit] Redis connection failed, falling back to in-memory"),i=!1,null):Math.min(100*e,1e3)})).on("connect",()=>{i=!0}),a.on("error",()=>{i=!1}),a}catch(e){return console.error("[RateLimit] Failed to create Redis client:",e),null}}();if(m&&i)try{return await c(m,u,s,o)}catch(e){console.error("[RateLimit] Redis error, falling back to memory:",e)}return l(u,s,o)}async function p(e){return d(`2fa-verify:${e}`,{maxRequests:5,windowMs:9e5})}async function u(e){return d(`2fa-setup:${e}`,{maxRequests:3,windowMs:36e5})}"u">typeof setInterval&&"u">typeof process&&(o=setInterval(()=>{let e=Date.now();for(let[t,r]of s.entries())r.resetAt<e&&s.delete(t)},6e4))&&"object"==typeof o&&"unref"in o&&o.unref(),e.s(["check2FASetupRateLimit",0,u,"check2FAVerifyRateLimit",0,p,"checkRateLimit",0,d])},230194,e=>{"use strict";async function t(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.includes(".apps.googleusercontent.com")?{success:!0,message:"Google OAuth credentials format validated"}:{success:!1,message:"Invalid Google Client ID format"}:{success:!1,message:"Client ID and Client Secret are required"}}async function r(e){let{appId:t,appSecret:r}=e;if(!t||!r)return{success:!1,message:"App ID and App Secret are required"};try{let e=await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${t}&client_secret=${r}&grant_type=client_credentials`);if(!e.ok){let t=await e.json();return{success:!1,message:t.error?.message||"Invalid credentials"}}if((await e.json()).access_token)return{success:!0,message:"Meta credentials verified successfully"};return{success:!1,message:"Failed to obtain access token"}}catch(e){return{success:!1,message:"Connection test failed"}}}async function n(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.length<10||r.length<10?{success:!1,message:"Invalid credential format"}:{success:!0,message:"LinkedIn credentials format validated"}:{success:!1,message:"Client ID and Client Secret are required"}}async function a(e){let{keyId:t,keySecret:r}=e;if(!t||!r)return{success:!1,message:"Key ID and Key Secret are required"};try{let e=Buffer.from(`${t}:${r}`).toString("base64"),n=await fetch("https://api.razorpay.com/v1/payments?count=1",{headers:{Authorization:`Basic ${e}`}});if(n.ok)return{success:!0,message:"Razorpay credentials verified successfully"};if(401===n.status)return{success:!1,message:"Invalid Razorpay credentials"};return{success:!1,message:`Razorpay API error: ${n.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function i(e){let{secretKey:t}=e;if(!t)return{success:!1,message:"Secret Key is required"};try{let e=await fetch("https://api.stripe.com/v1/balance",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Stripe credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Stripe credentials"};return{success:!1,message:`Stripe API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function s(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.resend.com/domains",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Resend credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Resend API key"};return{success:!1,message:`Resend API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function o(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://openrouter.ai/api/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"OpenRouter credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid OpenRouter API key"};return{success:!1,message:`OpenRouter API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function l(e){let{clientId:t,apiKey:r,whatsappClient:n}=e;if(!t||!r)return{success:!1,message:"Client ID and API Key are required"};try{let e=await fetch("https://api.wbiztool.com/v1/status",{headers:{"X-Client-ID":t,"X-API-Key":r,...n&&{"X-WhatsApp-Client":n}}});if(e.ok)return{success:!0,message:"WBizTool credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid WBizTool credentials"};if(404===e.status)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:`WBizTool API error: ${e.status}`}}catch(e){if(t.length>5&&r.length>5)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:"Connection test failed"}}}e.s(["PROVIDERS",0,{GOOGLE:{name:"Google OAuth",type:"OAUTH",category:"oauth",description:"Google OAuth for Analytics, Search Console, Ads, and YouTube",docsUrl:"https://console.cloud.google.com/apis/credentials",fields:[{key:"clientId",label:"Client ID",envKey:"GOOGLE_CLIENT_ID",type:"text",required:!0,placeholder:"xxxxx.apps.googleusercontent.com",helpText:"From Google Cloud Console > APIs & Services > Credentials"},{key:"clientSecret",label:"Client Secret",envKey:"GOOGLE_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:t},META:{name:"Meta (Facebook/Instagram)",type:"OAUTH",category:"oauth",description:"Meta OAuth for Facebook Pages, Instagram, and Meta Ads",docsUrl:"https://developers.facebook.com/apps/",fields:[{key:"appId",label:"App ID",envKey:"META_APP_ID",type:"text",required:!0,placeholder:"123456789012345",helpText:"From Meta for Developers > Your App > Settings > Basic"},{key:"appSecret",label:"App Secret",envKey:"META_APP_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:r},LINKEDIN:{name:"LinkedIn",type:"OAUTH",category:"oauth",description:"LinkedIn OAuth for Company Pages and Ads",docsUrl:"https://www.linkedin.com/developers/apps",fields:[{key:"clientId",label:"Client ID",envKey:"LINKEDIN_CLIENT_ID",type:"text",required:!0,helpText:"From LinkedIn Developers > Your App > Auth"},{key:"clientSecret",label:"Client Secret",envKey:"LINKEDIN_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:n},TWITTER:{name:"Twitter/X",type:"OAUTH",category:"oauth",description:"Twitter OAuth for posting and analytics",docsUrl:"https://developer.twitter.com/en/portal/dashboard",fields:[{key:"clientId",label:"Client ID",envKey:"TWITTER_CLIENT_ID",type:"text",required:!0,helpText:"From Twitter Developer Portal > Your App > Keys and tokens"},{key:"clientSecret",label:"Client Secret",envKey:"TWITTER_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}]},RAZORPAY:{name:"Razorpay",type:"API_KEY",category:"payment",description:"Payment processing for Indian market",docsUrl:"https://dashboard.razorpay.com/app/keys",fields:[{key:"keyId",label:"Key ID",envKey:"RAZORPAY_KEY_ID",type:"text",required:!0,placeholder:"rzp_live_xxxxx or rzp_test_xxxxx",helpText:"From Razorpay Dashboard > Settings > API Keys"},{key:"keySecret",label:"Key Secret",envKey:"RAZORPAY_KEY_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"RAZORPAY_WEBHOOK_SECRET",type:"password",required:!1,helpText:"For verifying webhook signatures"}],testConnection:a},STRIPE:{name:"Stripe",type:"API_KEY",category:"payment",description:"Payment processing for international market",docsUrl:"https://dashboard.stripe.com/apikeys",fields:[{key:"publishableKey",label:"Publishable Key",envKey:"STRIPE_PUBLISHABLE_KEY",type:"text",required:!0,placeholder:"pk_live_xxxxx or pk_test_xxxxx",helpText:"Public key for client-side use"},{key:"secretKey",label:"Secret Key",envKey:"STRIPE_SECRET_KEY",type:"password",required:!0,placeholder:"sk_live_xxxxx or sk_test_xxxxx",helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"STRIPE_WEBHOOK_SECRET",type:"password",required:!1,placeholder:"whsec_xxxxx",helpText:"For verifying webhook signatures"}],testConnection:i},RESEND:{name:"Resend",type:"API_KEY",category:"communication",description:"Transactional email service",docsUrl:"https://resend.com/api-keys",fields:[{key:"apiKey",label:"API Key",envKey:"RESEND_API_KEY",type:"password",required:!0,placeholder:"re_xxxxx",helpText:"From Resend Dashboard > API Keys"},{key:"fromEmail",label:"Default From Email",envKey:"RESEND_FROM_EMAIL",type:"text",required:!1,placeholder:"notifications@yourdomain.com",helpText:"Must be from a verified domain"}],testConnection:s},OPENROUTER:{name:"OpenRouter",type:"API_KEY",category:"ai",description:"AI model router for GPT, Claude, and other models",docsUrl:"https://openrouter.ai/keys",fields:[{key:"apiKey",label:"API Key",envKey:"OPENROUTER_API_KEY",type:"password",required:!0,placeholder:"sk-or-xxxxx",helpText:"From OpenRouter Dashboard"},{key:"defaultModel",label:"Default Model",envKey:"OPENROUTER_DEFAULT_MODEL",type:"text",required:!1,placeholder:"anthropic/claude-3-sonnet",helpText:"Default model to use for AI requests"}],testConnection:o},DEEPSEEK:{name:"DeepSeek",type:"API_KEY",category:"ai",description:"DeepSeek AI for data extraction and conversational AI",docsUrl:"https://platform.deepseek.com/api_keys",fields:[{key:"apiKey",label:"API Key",envKey:"DEEPSEEK_API_KEY",type:"password",required:!0,placeholder:"sk-xxxxx",helpText:"From DeepSeek Platform Dashboard"}],testConnection:async e=>{let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.deepseek.com/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"DeepSeek credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid DeepSeek API key"};return{success:!1,message:`DeepSeek API error: ${e.status}`}}catch{return{success:!1,message:"Connection test failed"}}}},WBIZTOOL:{name:"WBizTool",type:"API_KEY",category:"communication",description:"WhatsApp Business API integration",docsUrl:"https://wbiztool.com/docs",fields:[{key:"clientId",label:"Client ID",envKey:"WBIZTOOL_CLIENT_ID",type:"text",required:!0,helpText:"From WBizTool Dashboard"},{key:"apiKey",label:"API Key",envKey:"WBIZTOOL_API_KEY",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"whatsappClient",label:"WhatsApp Client ID",envKey:"WBIZTOOL_WHATSAPP_CLIENT",type:"text",required:!1,helpText:"Specific WhatsApp account identifier"}],testConnection:l}}])},120674,e=>{"use strict";var t=e.i(246245);e.i(897360);var r=e.i(292550);let n="Branding Pioneers",a=null,i=0;async function s(){let e=Date.now();if(a&&e-i<36e5)return a;let n=(await (0,r.getCredentialsWithFallback)("RESEND")).apiKey||process.env.RESEND_API_KEY||"";return a=new t.Resend(n),i=e,a}async function o(){return(await (0,r.getCredentialsWithFallback)("RESEND")).fromEmail||process.env.RESEND_FROM_EMAIL||"noreply@brandingpioneers.in"}let l=process.env.NEXTAUTH_URL||"https://brandingpioneers.in";async function c(e){try{let t=await s(),r=await o(),n=Array.isArray(e.to)?e.to:[e.to],{data:a,error:i}=await t.emails.send({from:e.from||`Pioneer OS <${r}>`,to:n,subject:e.subject,html:e.html,...e.text?{text:e.text}:{},...e.replyTo?{replyTo:e.replyTo}:{}});if(i)return console.error("[Email] Resend error:",i),{success:!1,error:i.message};return{success:!0,messageId:a?.id}}catch(e){return console.error("[Email] Send error:",e),{success:!1,error:e instanceof Error?e.message:"Failed to send email"}}}async function d({to:e,token:t,firstName:r}){let n=`${l}/auth/magic?token=${t}`;return c({to:e,subject:"Your Login Link - Pioneer OS",html:`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0B0E14;">
        <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 16px 24px; border-radius: 16px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">Pioneer<span style="opacity: 0.9;">OS</span></span>
            </div>
          </div>

          <div style="background: linear-gradient(180deg, #141A25 0%, #0F1419 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
              Hey ${r}!
            </h1>
            <p style="color: #94A3B8; font-size: 16px; margin: 0 0 32px 0; text-align: center;">
              Click the button below to sign in to Pioneer OS
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${n}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Sign In to Pioneer OS
              </a>
            </div>

            <p style="color: #64748B; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
              This link expires in <strong style="color: #F59E0B;">30 minutes</strong>
            </p>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;"></div>

            <p style="color: #64748B; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="color: #3B82F6; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
              ${n}
            </p>
          </div>

          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Didn't request this? You can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `})}async function p({to:e,token:t,firstName:r}){let n=`https://brandingpioneers.in/auth/magic?token=${t}`;return c({to:e,subject:"Your Admin Login Link - Branding Pioneers",html:`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 16px 24px; border-radius: 12px;">
              <span style="color: white; font-size: 20px; font-weight: bold;">Branding Pioneers</span>
            </div>
          </div>

          <div style="background: #f8f9fa; border-radius: 20px; padding: 40px; border: 1px solid #e5e7eb;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
              Hey ${r}!
            </h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0; text-align: center;">
              Click the button below to sign in to Branding Pioneers Admin
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${n}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Sign In to Branding Pioneers
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
              This link expires in <strong style="color: #f59e0b;">24 hours</strong>
            </p>

            <div style="border-top: 1px solid #e5e7eb; margin: 24px 0;"></div>

            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="color: #1a1a2e; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
              ${n}
            </p>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <img src="https://media.licdn.com/dms/image/v2/D560BAQGT-4AkgFOddw/company-logo_200_200/company-logo_200_200/0/1707465236952/branding_pioneers_logo?e=2147483647&v=beta&t=ija9ZpUW4n7IqvXbi0baAKUyo2q20DBV2dDH5g5rJm8" alt="Branding Pioneers" style="width: 48px; height: 48px; border-radius: 50%; margin-bottom: 12px;" />
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Branding Pioneers<br />
              <a href="https://brandingpioneers.in" style="color: #1a1a2e; text-decoration: none;">brandingpioneers.in</a>
            </p>
          </div>

          <p style="color: #d1d5db; font-size: 12px; text-align: center; margin-top: 24px;">
            Didn't request this? You can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `})}async function u({to:e,name:t,onboardingUrl:r,expiresAt:a}){let i=Math.ceil((a.getTime()-Date.now())/864e5);return c({to:e,subject:`Complete Your Onboarding - ${n}`,html:`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0B0E14;">
        <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 16px 24px; border-radius: 16px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">Branding<span style="opacity: 0.9;">Pioneers</span></span>
            </div>
          </div>

          <div style="background: linear-gradient(180deg, #141A25 0%, #0F1419 100%); border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
            <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; text-align: center;">
              Hi ${t||"there"}!
            </h1>
            <p style="color: #94A3B8; font-size: 16px; margin: 0 0 24px 0; text-align: center;">
              Please complete your onboarding to get started with our services.
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${r}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Complete Onboarding
              </a>
            </div>

            <p style="color: #64748B; font-size: 14px; text-align: center; margin: 0 0 24px 0;">
              This link expires in <strong style="color: #F59E0B;">${i} days</strong>
            </p>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;"></div>

            <p style="color: #64748B; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="color: #3B82F6; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">
              ${r}
            </p>
          </div>
        </div>
      </body>
      </html>
    `})}async function m(e,t){let r=t.contactName||t.clientName;return c({to:e,subject:`Invoice ${t.invoiceNumber} - ${n}`,replyTo:"accounts@brandingpioneers.com",text:`Dear ${r},

Greetings from ${n}!

Please find below the invoice details:

Invoice Number: ${t.invoiceNumber}
Amount: ${t.currency} ${t.amount}
Due Date: ${t.dueDate}

${t.notes||""}

Please ensure timely payment to continue uninterrupted services.

For any queries, feel free to reach out to our accounts team.

Best regards,
Accounts Team
${n}
accounts@brandingpioneers.com`,html:`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${n}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Invoice Notification</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin-top: 0;">Dear ${r},</p>
          <p>Greetings from ${n}!</p>
          <p>Please find below the invoice details for your review:</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><strong style="color: #6b7280;">Invoice Number</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;"><strong style="color: #1f2937;">${t.invoiceNumber}</strong></td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><strong style="color: #6b7280;">Amount</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right;"><strong style="color: #059669; font-size: 18px;">${t.currency} ${t.amount}</strong></td></tr>
              <tr><td style="padding: 10px 0;"><strong style="color: #6b7280;">Due Date</strong></td><td style="padding: 10px 0; text-align: right;"><strong style="color: #dc2626;">${t.dueDate}</strong></td></tr>
            </table>
          </div>
          ${t.notes?`<p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;"><strong>Note:</strong> ${t.notes}</p>`:""}
          <p>Please ensure timely payment to continue uninterrupted services.</p>
          <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong><br>${n}</p>
        </div>
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated email from ${n}.</p>
        </div>
      </body>
      </html>
    `})}async function y(e,t){let r=t.contactName||t.clientName;return c({to:e,subject:`Payment Received - Thank You! (Invoice ${t.invoiceNumber})`,replyTo:"accounts@brandingpioneers.com",text:`Dear ${r},

Thank you for your payment!

We have received your payment of ${t.currency} ${t.amount} for Invoice ${t.invoiceNumber}.
${t.transactionRef?`Transaction Reference: ${t.transactionRef}`:""}

We appreciate your prompt payment and look forward to continuing our partnership.

Best regards,
Accounts Team
${n}`,html:`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">&#10003;</div>
          <h1 style="color: white; margin: 0; font-size: 24px;">Payment Received</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Thank you!</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin-top: 0;">Dear ${r},</p>
          <p>We have received your payment. Thank you!</p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #d1fae5;">
            <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0 0 10px; text-align: center;">${t.currency} ${t.amount}</p>
            <p style="color: #6b7280; margin: 0; text-align: center;">Invoice: ${t.invoiceNumber}${t.transactionRef?`<br>Ref: ${t.transactionRef}`:""}</p>
          </div>
          <p>We appreciate your prompt payment and look forward to continuing our partnership.</p>
          <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong><br>${n}</p>
        </div>
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated receipt from ${n}.</p>
        </div>
      </body>
      </html>
    `})}e.s(["sendAdminMagicLinkEmail",0,p,"sendInvoiceEmail",0,m,"sendMagicLinkEmail",0,d,"sendOnboardingEmail",0,u,"sendPaymentReceivedEmail",0,y],120674)},795249,e=>{"use strict";var t=e.i(35344);async function r(e){try{await t.prisma.notification.create({data:{userId:e.userId,type:e.action,title:e.title,message:e.message,link:e.link||null,priority:"HIGH",isRead:!1}})}catch(e){console.error("Failed to log admin action:",e)}}e.s(["logAdminAction",0,r])},473533,e=>{"use strict";var t=e.i(747909),r=e.i(174017),n=e.i(996250),a=e.i(759756),i=e.i(561916),s=e.i(174677),o=e.i(869741),l=e.i(316795),c=e.i(487718),d=e.i(995169),p=e.i(47587),u=e.i(666012),m=e.i(570101),y=e.i(626937),g=e.i(10372),f=e.i(193695);e.i(820232);var h=e.i(600220),x=e.i(89171),b=e.i(823667),v=e.i(650519),A=e.i(35344),E=e.i(254799),I=e.i(456622),k=e.i(795249),R=e.i(120674);async function w(e){try{let t=await (0,b.getServerSession)(v.authOptions);if(!t)return x.NextResponse.json({error:"Unauthorized"},{status:401});let r=await A.default.user.findUnique({where:{id:t.user.id},select:{role:!0}});if(!r||!["SUPER_ADMIN","ADMIN"].includes(r.role))return x.NextResponse.json({error:"Forbidden"},{status:403});let n=await (0,I.checkRateLimit)(`branding-magic-link:${t.user.id}`,{maxRequests:20,windowMs:36e5});if(!n.success)return x.NextResponse.json({error:"Too many link generations. Please try again later."},{status:429,headers:{"Retry-After":String(n.retryAfter||60)}});let{userId:a,email:i}=await e.json();if(!a&&!i)return x.NextResponse.json({error:"userId or email is required"},{status:400});let s=null,o=i;if(a){if(!(s=await A.default.user.findFirst({where:{id:a,status:{in:["ACTIVE","PROBATION"]},deletedAt:null},select:{id:!0,empId:!0,firstName:!0,lastName:!0,email:!0,role:!0,department:!0}})))return x.NextResponse.json({error:"User not found or inactive"},{status:404});o=s.email}else{if(!(s=await A.default.user.findFirst({where:{email:i.toLowerCase(),status:{in:["ACTIVE","PROBATION"]},deletedAt:null},select:{id:!0,empId:!0,firstName:!0,lastName:!0,email:!0,role:!0,department:!0}})))return x.NextResponse.json({success:!0,message:`Login link sent to ${S(i)}`});o=s.email}await A.default.magicLinkToken.deleteMany({where:{userId:s.id,usedAt:null}});let l=E.default.randomBytes(32).toString("hex"),c=E.default.createHash("sha256").update(l).digest("hex"),d=new Date(Date.now()+864e5);await A.default.magicLinkToken.create({data:{token:c,userId:s.id,channel:"EMAIL",expiresAt:d}});let p=await (0,R.sendAdminMagicLinkEmail)({to:o,token:l,firstName:s.firstName});if(!p.success)return console.error("Failed to send admin magic link email:",p.error),x.NextResponse.json({error:"Failed to send login link. Please try again."},{status:500});return await (0,k.logAdminAction)({userId:t.user.id,action:"GENERATE_BRANDING_MAGIC_LINK",title:"Branding Magic Link generated",message:`Generated Branding Pioneers login link for ${s.firstName} ${s.lastName||""} (${s.empId||s.id})`,link:`/admin/users/${s.id}`}),x.NextResponse.json({success:!0,message:`Login link sent to ${S(o)}`,expiresAt:d.toISOString()})}catch(e){return console.error("Branding magic link error:",e),x.NextResponse.json({error:"Something went wrong"},{status:500})}}function S(e){let[t,r]=e.split("@"),n=t.substring(0,2)+"***";return`${n}@${r}`}e.s(["POST",0,w],294893);var T=e.i(294893);let P=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/admin/branding-magic-link/send/route",pathname:"/api/admin/branding-magic-link/send",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/admin/branding-magic-link/send/route.ts",nextConfigOutput:"standalone",userland:T}),{workAsyncStorage:_,workUnitAsyncStorage:N,serverHooks:C}=P;async function D(e,t,n){n.requestMeta&&(0,a.setRequestMeta)(e,n.requestMeta),P.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/admin/branding-magic-link/send/route";x=x.replace(/\/index$/,"")||"/";let b=await P.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:v,params:A,nextConfig:E,parsedUrl:I,isDraftMode:k,prerenderManifest:R,routerServerContext:w,isOnDemandRevalidate:S,revalidateOnlyGenerated:T,resolvedPathname:_,clientReferenceManifest:N,serverActionsManifest:C}=b,D=(0,o.normalizeAppPath)(x),O=!!(R.dynamicRoutes[D]||R.routes[_]),L=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,I,!1):t.end("This page could not be found"),null);if(O&&!k){let e=!!R.routes[_],t=R.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(E.adapterPath)return await L();throw new f.NoFallbackError}}let $=null;!O||P.isDev||k||($="/index"===($=_)?"/":$);let K=!0===P.isDev||!O,B=O&&!K;C&&N&&(0,s.setManifestsSingleton)({page:x,clientReferenceManifest:N,serverActionsManifest:C});let q=e.method||"GET",F=(0,i.getTracer)(),z=F.getActiveScopeSpan(),U=!!(null==w?void 0:w.isWrappedByNextServer),M=!!(0,a.getRequestMeta)(e,"minimalMode"),Y=(0,a.getRequestMeta)(e,"incrementalCache")||await P.getIncrementalCache(e,E,R,M);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let j={params:A,previewProps:R.preview,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:K,incrementalCache:Y,cacheLifeProfiles:E.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n,a)=>P.onRequestError(e,t,n,a,w)},sharedContext:{buildId:v}},H=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),G=c.NextRequestAdapter.fromNodeNextRequest(H,(0,c.signalFromNodeResponse)(t));try{let a,s=async e=>P.handle(G,j).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${q} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",n),a.updateName(t))}else e.updateName(`${q} ${x}`)}),o=async a=>{var i,o;let l=async({previousCacheEntry:r})=>{try{if(!M&&S&&T&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(a);e.fetchMetrics=j.renderOpts.fetchMetrics;let o=j.renderOpts.pendingWaitUntil;o&&n.waitUntil&&(n.waitUntil(o),o=void 0);let l=j.renderOpts.collectedTags;if(!O)return await (0,u.sendResponse)(H,W,i,j.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[g.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,n=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:j.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await P.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:B,isOnDemandRevalidate:S})},!1,w),t}},c=await P.handleResponse({req:e,nextConfig:E,cacheKey:$,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:R,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:T,responseGenerator:l,waitUntil:n.waitUntil,isMinimalMode:M});if(!O)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(o=c.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});M||t.setHeader("x-nextjs-cache",S?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),k&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,m.fromNodeOutgoingHttpHeaders)(c.value.headers);return M&&O||d.delete(g.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,y.getCacheControlHeader)(c.cacheControl)),await (0,u.sendResponse)(H,W,new Response(c.value.body,{headers:d,status:c.value.status||200})),null};U&&z?await o(z):(a=F.getActiveScopeSpan(),await F.withPropagatedContext(e.headers,()=>F.trace(d.BaseServerSpan.handleRequest,{spanName:`${q} ${x}`,kind:i.SpanKind.SERVER,attributes:{"http.method":q,"http.target":e.url}},o),void 0,!U))}catch(t){if(t instanceof f.NoFallbackError||await P.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:B,isOnDemandRevalidate:S})},!1,w),O)throw t;return await (0,u.sendResponse)(H,W,new Response(null,{status:500})),null}}e.s(["handler",0,D,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:N})},"routeModule",0,P,"serverHooks",0,C,"workAsyncStorage",0,_,"workUnitAsyncStorage",0,N],473533)},485685,e=>{e.v(e=>Promise.resolve().then(()=>e(254799)))}];

//# debugId=f1b8946d-e183-8a79-8dd1-062c3f77989d
//# sourceMappingURL=%5Broot-of-the-server%5D__00bc~ii._.js.map