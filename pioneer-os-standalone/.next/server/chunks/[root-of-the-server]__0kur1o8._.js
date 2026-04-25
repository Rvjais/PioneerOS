;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="387ddbdb-9258-9eda-78f7-6888fc8eace7")}catch(e){}}();
module.exports=[108875,(e,t,r)=>{t.exports=e.x("ioredis-23a6225d3f8c0bff",()=>require("ioredis-23a6225d3f8c0bff"))},456622,e=>{"use strict";var t=e.i(108875),r=e.i(254799);let n={maxRequests:30,windowMs:6e4,keyPrefix:"ratelimit:"},i=null,a=!1,s=new Map,o=null;async function l(e,t,r){let n=Date.now(),i=s.get(e);return!i||i.resetAt<n?(i={count:1,resetAt:n+r},s.set(e,i),{success:!0,remaining:t-1,resetAt:i.resetAt}):i.count>=t?{success:!1,remaining:0,resetAt:i.resetAt,retryAfter:Math.ceil((i.resetAt-n)/1e3)}:(i.count++,s.set(e,i),{success:!0,remaining:t-i.count,resetAt:i.resetAt})}async function c(e,t,n,i){let a=Date.now(),s=a-i,o=e.pipeline();o.zremrangebyscore(t,"-inf",s),o.zadd(t,a.toString(),`${a}:${r.default.randomUUID()}`),o.zcard(t),o.pexpire(t,i);let c=await o.exec();if(!c)return l(t,n,i);let d=c[2]?.[1]||0,p=a+i;return d>n?{success:!1,remaining:0,resetAt:p,retryAfter:Math.ceil(i/1e3)}:{success:!0,remaining:n-d,resetAt:p}}async function d(e,r={}){let{maxRequests:s,windowMs:o,keyPrefix:p}={...n,...r},u=`${p}${e}`,m=function(){if(i)return i;let e=process.env.REDIS_URL;if(!e)return console.error("[RateLimit] WARNING: REDIS_URL not set in production — using in-memory rate limiting. This is NOT safe across multiple instances."),null;try{return(i=new t.default(e,{maxRetriesPerRequest:1,retryStrategy:e=>e>3?(console.error("[RateLimit] Redis connection failed, falling back to in-memory"),a=!1,null):Math.min(100*e,1e3)})).on("connect",()=>{a=!0}),i.on("error",()=>{a=!1}),i}catch(e){return console.error("[RateLimit] Failed to create Redis client:",e),null}}();if(m&&a)try{return await c(m,u,s,o)}catch(e){console.error("[RateLimit] Redis error, falling back to memory:",e)}return l(u,s,o)}async function p(e){return d(`2fa-verify:${e}`,{maxRequests:5,windowMs:9e5})}async function u(e){return d(`2fa-setup:${e}`,{maxRequests:3,windowMs:36e5})}"u">typeof setInterval&&"u">typeof process&&(o=setInterval(()=>{let e=Date.now();for(let[t,r]of s.entries())r.resetAt<e&&s.delete(t)},6e4))&&"object"==typeof o&&"unref"in o&&o.unref(),e.s(["check2FASetupRateLimit",0,u,"check2FAVerifyRateLimit",0,p,"checkRateLimit",0,d])},230194,e=>{"use strict";async function t(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.includes(".apps.googleusercontent.com")?{success:!0,message:"Google OAuth credentials format validated"}:{success:!1,message:"Invalid Google Client ID format"}:{success:!1,message:"Client ID and Client Secret are required"}}async function r(e){let{appId:t,appSecret:r}=e;if(!t||!r)return{success:!1,message:"App ID and App Secret are required"};try{let e=await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${t}&client_secret=${r}&grant_type=client_credentials`);if(!e.ok){let t=await e.json();return{success:!1,message:t.error?.message||"Invalid credentials"}}if((await e.json()).access_token)return{success:!0,message:"Meta credentials verified successfully"};return{success:!1,message:"Failed to obtain access token"}}catch(e){return{success:!1,message:"Connection test failed"}}}async function n(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.length<10||r.length<10?{success:!1,message:"Invalid credential format"}:{success:!0,message:"LinkedIn credentials format validated"}:{success:!1,message:"Client ID and Client Secret are required"}}async function i(e){let{keyId:t,keySecret:r}=e;if(!t||!r)return{success:!1,message:"Key ID and Key Secret are required"};try{let e=Buffer.from(`${t}:${r}`).toString("base64"),n=await fetch("https://api.razorpay.com/v1/payments?count=1",{headers:{Authorization:`Basic ${e}`}});if(n.ok)return{success:!0,message:"Razorpay credentials verified successfully"};if(401===n.status)return{success:!1,message:"Invalid Razorpay credentials"};return{success:!1,message:`Razorpay API error: ${n.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function a(e){let{secretKey:t}=e;if(!t)return{success:!1,message:"Secret Key is required"};try{let e=await fetch("https://api.stripe.com/v1/balance",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Stripe credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Stripe credentials"};return{success:!1,message:`Stripe API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function s(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.resend.com/domains",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Resend credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Resend API key"};return{success:!1,message:`Resend API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function o(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://openrouter.ai/api/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"OpenRouter credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid OpenRouter API key"};return{success:!1,message:`OpenRouter API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function l(e){let{clientId:t,apiKey:r,whatsappClient:n}=e;if(!t||!r)return{success:!1,message:"Client ID and API Key are required"};try{let e=await fetch("https://api.wbiztool.com/v1/status",{headers:{"X-Client-ID":t,"X-API-Key":r,...n&&{"X-WhatsApp-Client":n}}});if(e.ok)return{success:!0,message:"WBizTool credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid WBizTool credentials"};if(404===e.status)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:`WBizTool API error: ${e.status}`}}catch(e){if(t.length>5&&r.length>5)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:"Connection test failed"}}}e.s(["PROVIDERS",0,{GOOGLE:{name:"Google OAuth",type:"OAUTH",category:"oauth",description:"Google OAuth for Analytics, Search Console, Ads, and YouTube",docsUrl:"https://console.cloud.google.com/apis/credentials",fields:[{key:"clientId",label:"Client ID",envKey:"GOOGLE_CLIENT_ID",type:"text",required:!0,placeholder:"xxxxx.apps.googleusercontent.com",helpText:"From Google Cloud Console > APIs & Services > Credentials"},{key:"clientSecret",label:"Client Secret",envKey:"GOOGLE_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:t},META:{name:"Meta (Facebook/Instagram)",type:"OAUTH",category:"oauth",description:"Meta OAuth for Facebook Pages, Instagram, and Meta Ads",docsUrl:"https://developers.facebook.com/apps/",fields:[{key:"appId",label:"App ID",envKey:"META_APP_ID",type:"text",required:!0,placeholder:"123456789012345",helpText:"From Meta for Developers > Your App > Settings > Basic"},{key:"appSecret",label:"App Secret",envKey:"META_APP_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:r},LINKEDIN:{name:"LinkedIn",type:"OAUTH",category:"oauth",description:"LinkedIn OAuth for Company Pages and Ads",docsUrl:"https://www.linkedin.com/developers/apps",fields:[{key:"clientId",label:"Client ID",envKey:"LINKEDIN_CLIENT_ID",type:"text",required:!0,helpText:"From LinkedIn Developers > Your App > Auth"},{key:"clientSecret",label:"Client Secret",envKey:"LINKEDIN_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:n},TWITTER:{name:"Twitter/X",type:"OAUTH",category:"oauth",description:"Twitter OAuth for posting and analytics",docsUrl:"https://developer.twitter.com/en/portal/dashboard",fields:[{key:"clientId",label:"Client ID",envKey:"TWITTER_CLIENT_ID",type:"text",required:!0,helpText:"From Twitter Developer Portal > Your App > Keys and tokens"},{key:"clientSecret",label:"Client Secret",envKey:"TWITTER_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}]},RAZORPAY:{name:"Razorpay",type:"API_KEY",category:"payment",description:"Payment processing for Indian market",docsUrl:"https://dashboard.razorpay.com/app/keys",fields:[{key:"keyId",label:"Key ID",envKey:"RAZORPAY_KEY_ID",type:"text",required:!0,placeholder:"rzp_live_xxxxx or rzp_test_xxxxx",helpText:"From Razorpay Dashboard > Settings > API Keys"},{key:"keySecret",label:"Key Secret",envKey:"RAZORPAY_KEY_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"RAZORPAY_WEBHOOK_SECRET",type:"password",required:!1,helpText:"For verifying webhook signatures"}],testConnection:i},STRIPE:{name:"Stripe",type:"API_KEY",category:"payment",description:"Payment processing for international market",docsUrl:"https://dashboard.stripe.com/apikeys",fields:[{key:"publishableKey",label:"Publishable Key",envKey:"STRIPE_PUBLISHABLE_KEY",type:"text",required:!0,placeholder:"pk_live_xxxxx or pk_test_xxxxx",helpText:"Public key for client-side use"},{key:"secretKey",label:"Secret Key",envKey:"STRIPE_SECRET_KEY",type:"password",required:!0,placeholder:"sk_live_xxxxx or sk_test_xxxxx",helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"STRIPE_WEBHOOK_SECRET",type:"password",required:!1,placeholder:"whsec_xxxxx",helpText:"For verifying webhook signatures"}],testConnection:a},RESEND:{name:"Resend",type:"API_KEY",category:"communication",description:"Transactional email service",docsUrl:"https://resend.com/api-keys",fields:[{key:"apiKey",label:"API Key",envKey:"RESEND_API_KEY",type:"password",required:!0,placeholder:"re_xxxxx",helpText:"From Resend Dashboard > API Keys"},{key:"fromEmail",label:"Default From Email",envKey:"RESEND_FROM_EMAIL",type:"text",required:!1,placeholder:"notifications@yourdomain.com",helpText:"Must be from a verified domain"}],testConnection:s},OPENROUTER:{name:"OpenRouter",type:"API_KEY",category:"ai",description:"AI model router for GPT, Claude, and other models",docsUrl:"https://openrouter.ai/keys",fields:[{key:"apiKey",label:"API Key",envKey:"OPENROUTER_API_KEY",type:"password",required:!0,placeholder:"sk-or-xxxxx",helpText:"From OpenRouter Dashboard"},{key:"defaultModel",label:"Default Model",envKey:"OPENROUTER_DEFAULT_MODEL",type:"text",required:!1,placeholder:"anthropic/claude-3-sonnet",helpText:"Default model to use for AI requests"}],testConnection:o},DEEPSEEK:{name:"DeepSeek",type:"API_KEY",category:"ai",description:"DeepSeek AI for data extraction and conversational AI",docsUrl:"https://platform.deepseek.com/api_keys",fields:[{key:"apiKey",label:"API Key",envKey:"DEEPSEEK_API_KEY",type:"password",required:!0,placeholder:"sk-xxxxx",helpText:"From DeepSeek Platform Dashboard"}],testConnection:async e=>{let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.deepseek.com/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"DeepSeek credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid DeepSeek API key"};return{success:!1,message:`DeepSeek API error: ${e.status}`}}catch{return{success:!1,message:"Connection test failed"}}}},WBIZTOOL:{name:"WBizTool",type:"API_KEY",category:"communication",description:"WhatsApp Business API integration",docsUrl:"https://wbiztool.com/docs",fields:[{key:"clientId",label:"Client ID",envKey:"WBIZTOOL_CLIENT_ID",type:"text",required:!0,helpText:"From WBizTool Dashboard"},{key:"apiKey",label:"API Key",envKey:"WBIZTOOL_API_KEY",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"whatsappClient",label:"WhatsApp Client ID",envKey:"WBIZTOOL_WHATSAPP_CLIENT",type:"text",required:!1,helpText:"Specific WhatsApp account identifier"}],testConnection:l}}])},267950,e=>{"use strict";let t={TDS_DEFAULT_PERCENTAGE:parseFloat(process.env.TDS_DEFAULT_PERCENTAGE||"10"),TDS_MIN_PERCENTAGE:0,TDS_MAX_PERCENTAGE:30,GST_DEFAULT_PERCENTAGE:parseFloat(process.env.GST_DEFAULT_PERCENTAGE||"18"),GST_CGST_PERCENTAGE:9,GST_SGST_PERCENTAGE:9,GST_IGST_PERCENTAGE:18};process.env.EMAIL_ENABLED,process.env.EMAIL_FROM,process.env.EMAIL_FROM_NAME,process.env.EMAIL_REPLY_TO,process.env.SMTP_HOST,parseInt(process.env.SMTP_PORT||"587"),process.env.SMTP_SECURE,process.env.SMTP_USER,process.env.SMTP_PASS,process.env.SENDGRID_API_KEY,process.env.USE_SENDGRID;let r={DEPARTMENT_SERVICE_MAP:{SEO:"SEO",SOCIAL:"SM",ADS:"ADS",WEB:"WEB",AI_TOOLS:"AI"},TRACKED_DEPARTMENTS:["SEO","SOCIAL","ADS","WEB","AI_TOOLS"],ROI_THRESHOLDS:{NEGATIVE:0,LOW:20,GOOD:40,EXCELLENT:60},DEFAULT_EQUAL_WEIGHT:!0};e.s(["RECONCILIATION_CONFIG",0,{AUTO_MATCH_THRESHOLD:.85,SUGGEST_MATCH_THRESHOLD:.6,DUPLICATE_AMOUNT_TOLERANCE:.01,DUPLICATE_DATE_RANGE_DAYS:3,TRANSACTION_CATEGORIES:["CLIENT_PAYMENT","SALARY","VENDOR_PAYMENT","TOOLS_SUBSCRIPTION","OFFICE_EXPENSE","TAX_PAYMENT","REFUND","TRANSFER","OTHER"]},"ROI_CONFIG",0,r,"TAX_CONFIG",0,t,"TIER_CONFIG",0,{ENTERPRISE_MIN_VALUE:3e5,PREMIUM_MIN_VALUE:1e5,STANDARD_MIN_VALUE:25e3,STARTER_MIN_VALUE:15e3},"calculateNetAmount",0,function(e,t){return Math.round((e-t)*100)/100},"calculateTDS",0,function(e,r){return Math.round(e*(r??t.TDS_DEFAULT_PERCENTAGE)/100*100)/100},"getServiceCodeFromDepartment",0,function(e){return r.DEPARTMENT_SERVICE_MAP[e]||e},"getTotalServiceCount",0,function(e){return function(e){if(!e)return[];let t=e.includes("|")?"|":",";return e.split(t).map(e=>e.trim().toUpperCase()).filter(e=>e.length>0)}(e).length}])},120674,e=>{"use strict";var t=e.i(246245);e.i(897360);var r=e.i(292550);let n="Branding Pioneers",i=null,a=0;async function s(){let e=Date.now();if(i&&e-a<36e5)return i;let n=(await (0,r.getCredentialsWithFallback)("RESEND")).apiKey||process.env.RESEND_API_KEY||"";return i=new t.Resend(n),a=e,i}async function o(){return(await (0,r.getCredentialsWithFallback)("RESEND")).fromEmail||process.env.RESEND_FROM_EMAIL||"noreply@brandingpioneers.in"}let l=process.env.NEXTAUTH_URL||"https://brandingpioneers.in";async function c(e){try{let t=await s(),r=await o(),n=Array.isArray(e.to)?e.to:[e.to],{data:i,error:a}=await t.emails.send({from:e.from||`Pioneer OS <${r}>`,to:n,subject:e.subject,html:e.html,...e.text?{text:e.text}:{},...e.replyTo?{replyTo:e.replyTo}:{}});if(a)return console.error("[Email] Resend error:",a),{success:!1,error:a.message};return{success:!0,messageId:i?.id}}catch(e){return console.error("[Email] Send error:",e),{success:!1,error:e instanceof Error?e.message:"Failed to send email"}}}async function d({to:e,token:t,firstName:r}){let n=`${l}/auth/magic?token=${t}`;return c({to:e,subject:"Your Login Link - Pioneer OS",html:`
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
    `})}async function u({to:e,name:t,onboardingUrl:r,expiresAt:i}){let a=Math.ceil((i.getTime()-Date.now())/864e5);return c({to:e,subject:`Complete Your Onboarding - ${n}`,html:`
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
              This link expires in <strong style="color: #F59E0B;">${a} days</strong>
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
    `})}e.s(["sendAdminMagicLinkEmail",0,p,"sendInvoiceEmail",0,m,"sendMagicLinkEmail",0,d,"sendOnboardingEmail",0,u,"sendPaymentReceivedEmail",0,y],120674)},859437,e=>{"use strict";var t=e.i(35344);let r=30,n={criticalThreshold:3,warningThreshold:1},i=3,a=2,s={healthy:80,warning:50},o={paymentOverdue:40,paymentPartial:20,paymentPending:10,deliverablesBelow50:30,deliverablesBelow80:15,deliverablesBelow100:5,noMeetings:10,ticketsCritical:15,ticketsWarning:5,feedbackLow:15,feedbackMediocre:5,feedbackGap:5,feedbackBonus:-5},l=15,c={LEAD:["WON","CHURNED"],WON:["ONBOARDING","CHURNED"],ONBOARDING:["ACTIVE","AT_RISK","CHURNED"],ACTIVE:["RETENTION","AT_RISK","CHURNED"],RETENTION:["ACTIVE","AT_RISK","CHURNED"],AT_RISK:["ACTIVE","RETENTION","CHURNED"],CHURNED:["ACTIVE"]};async function d(e){let r=await t.prisma.client.findUnique({where:{id:e},select:{id:!0,paymentStatus:!0,currentPaymentStatus:!0,paymentDueDay:!0}});if(!r)return;let n=await t.prisma.paymentCollection.findFirst({where:{clientId:e},orderBy:{collectedAt:"desc"},select:{status:!0,collectedAt:!0}}),i=await t.prisma.invoice.findFirst({where:{clientId:e},orderBy:{createdAt:"desc"},select:{status:!0,dueDate:!0}}),a="PENDING";n?.status==="CONFIRMED"?a="DONE":i&&("PAID"===i.status?a="DONE":"PARTIAL"===i.status?a="PARTIAL":i.dueDate&&new Date(i.dueDate)<new Date&&(a="OVERDUE")),r.currentPaymentStatus!==a&&await t.prisma.client.update({where:{id:e},data:{currentPaymentStatus:a,paymentStatus:"DONE"===a?"PAID":"OVERDUE"===a?"OVERDUE":"PENDING"}})}async function p(e){let c,d=await t.prisma.client.findUnique({where:{id:e},select:{id:!0,currentPaymentStatus:!0,lifecycleStage:!0,healthScore:!0,tier:!0}});if(!d)return 0;let p=d.healthScore,m=100;switch(d.currentPaymentStatus){case"DONE":break;case"PENDING":m-=o.paymentPending;break;case"PARTIAL":m-=o.paymentPartial;break;case"OVERDUE":m-=o.paymentOverdue}let y=new Date,g=new Date(y.getFullYear(),y.getMonth()-(i-1),1),f=await t.prisma.clientScope.findMany({where:{clientId:e,month:{gte:g}},select:{quantity:!0,delivered:!0}});if(f.length>0){let e=f.reduce((e,t)=>e+(t.quantity||0),0),t=f.reduce((e,t)=>e+(t.delivered||0),0);if(e>0){let r=t/e;r<.5?m-=o.deliverablesBelow50:r<.8?m-=o.deliverablesBelow80:r<1&&(m-=o.deliverablesBelow100)}}let h=new Date(Date.now()-24*r*36e5);0===await t.prisma.meeting.count({where:{clientId:e,date:{gte:h}}})&&(m-=o.noMeetings);let x=await t.prisma.supportTicket.count({where:{clientUser:{clientId:e},status:{in:["OPEN","IN_PROGRESS"]}}});x>n.criticalThreshold?m-=o.ticketsCritical:x>n.warningThreshold&&(m-=o.ticketsWarning);let E=new Date(y.getFullYear(),y.getMonth()-a,1),b=new Date(y.getFullYear(),y.getMonth(),1),A=new Date(y.getFullYear(),y.getMonth()-1,1),T=await t.prisma.clientFeedback.findFirst({where:{clientId:e,month:{gte:A,lte:b}},orderBy:{month:"desc"},select:{overallSatisfaction:!0,communicationRating:!0,deliveryRating:!0,valueRating:!0}});if(T){let e=[T.overallSatisfaction,T.communicationRating,T.deliveryRating,T.valueRating].filter(e=>null!==e);if(e.length>0){let t=e.reduce((e,t)=>e+t,0)/e.length;t>=4?m-=o.feedbackBonus:t<2.5?m-=o.feedbackLow:t<3.5&&(m-=o.feedbackMediocre)}}else await t.prisma.clientFeedback.findFirst({where:{clientId:e,month:{gte:E}}})||(m-=o.feedbackGap);c=(m=Math.max(0,Math.min(100,m)))>=s.healthy?"HEALTHY":m>=s.warning?"WARNING":"AT_RISK";let I=function(e,t){if(null===e)return"STABLE";let r=t-e;return r<=-l?"DECLINING":r>=l?"IMPROVING":"STABLE"}(p,m);return await t.prisma.client.update({where:{id:e},data:{healthScore:m,healthStatus:c}}),"DECLINING"===I&&null!==p&&await u(e,d.tier,p,m),m}async function u(e,r,n,i){let a=await t.prisma.client.findUnique({where:{id:e},select:{name:!0,accountManagerId:!0,teamMembers:{where:{isPrimary:!0},select:{userId:!0}}}});if(!a)return;let s=[];a.accountManagerId&&s.push(a.accountManagerId),a.teamMembers.forEach(e=>{s.includes(e.userId)||s.push(e.userId)});let o=["PREMIUM","ENTERPRISE"];if(o.includes(r)&&(await t.prisma.user.findMany({where:{role:{in:["MANAGER","SUPER_ADMIN"]}},select:{id:!0}})).forEach(e=>{s.includes(e.id)||s.push(e.id)}),0===s.length)return;let l=o.includes(r)?"URGENT":"NORMAL";await t.prisma.notification.createMany({data:s.map(t=>({userId:t,type:"CLIENT_LIFECYCLE",title:"Health Score Declining",message:`${a.name} health score dropped from ${n} to ${i}. Immediate review recommended.`,link:`/clients/${e}`,priority:l}))})}async function m(){let e=await t.prisma.client.findMany({where:{status:"ACTIVE",isLost:!1},select:{id:!0}}),r=0,n=0;for(let t of e)try{await p(t.id),r++}catch(e){console.error(`Failed to update health score for client ${t.id}:`,e),n++}return{updated:r,errors:n}}e.s(["isValidTransition",0,function(e,t){let r=c[e];return r?.includes(t)??!1},"syncPaymentStatus",0,d,"updateAllHealthScores",0,m])},485685,e=>{e.v(e=>Promise.resolve().then(()=>e(254799)))}];

//# debugId=387ddbdb-9258-9eda-78f7-6888fc8eace7
//# sourceMappingURL=%5Broot-of-the-server%5D__0kur1o8._.js.map