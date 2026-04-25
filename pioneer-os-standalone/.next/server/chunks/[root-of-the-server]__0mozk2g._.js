;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="12d320d8-a6aa-6c7d-cb89-141b2d9794c3")}catch(e){}}();
module.exports=[230194,e=>{"use strict";async function t(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.includes(".apps.googleusercontent.com")?{success:!0,message:"Google OAuth credentials format validated"}:{success:!1,message:"Invalid Google Client ID format"}:{success:!1,message:"Client ID and Client Secret are required"}}async function r(e){let{appId:t,appSecret:r}=e;if(!t||!r)return{success:!1,message:"App ID and App Secret are required"};try{let e=await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${t}&client_secret=${r}&grant_type=client_credentials`);if(!e.ok){let t=await e.json();return{success:!1,message:t.error?.message||"Invalid credentials"}}if((await e.json()).access_token)return{success:!0,message:"Meta credentials verified successfully"};return{success:!1,message:"Failed to obtain access token"}}catch(e){return{success:!1,message:"Connection test failed"}}}async function a(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.length<10||r.length<10?{success:!1,message:"Invalid credential format"}:{success:!0,message:"LinkedIn credentials format validated"}:{success:!1,message:"Client ID and Client Secret are required"}}async function n(e){let{keyId:t,keySecret:r}=e;if(!t||!r)return{success:!1,message:"Key ID and Key Secret are required"};try{let e=Buffer.from(`${t}:${r}`).toString("base64"),a=await fetch("https://api.razorpay.com/v1/payments?count=1",{headers:{Authorization:`Basic ${e}`}});if(a.ok)return{success:!0,message:"Razorpay credentials verified successfully"};if(401===a.status)return{success:!1,message:"Invalid Razorpay credentials"};return{success:!1,message:`Razorpay API error: ${a.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function i(e){let{secretKey:t}=e;if(!t)return{success:!1,message:"Secret Key is required"};try{let e=await fetch("https://api.stripe.com/v1/balance",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Stripe credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Stripe credentials"};return{success:!1,message:`Stripe API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function s(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.resend.com/domains",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Resend credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Resend API key"};return{success:!1,message:`Resend API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function o(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://openrouter.ai/api/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"OpenRouter credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid OpenRouter API key"};return{success:!1,message:`OpenRouter API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function l(e){let{clientId:t,apiKey:r,whatsappClient:a}=e;if(!t||!r)return{success:!1,message:"Client ID and API Key are required"};try{let e=await fetch("https://api.wbiztool.com/v1/status",{headers:{"X-Client-ID":t,"X-API-Key":r,...a&&{"X-WhatsApp-Client":a}}});if(e.ok)return{success:!0,message:"WBizTool credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid WBizTool credentials"};if(404===e.status)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:`WBizTool API error: ${e.status}`}}catch(e){if(t.length>5&&r.length>5)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:"Connection test failed"}}}e.s(["PROVIDERS",0,{GOOGLE:{name:"Google OAuth",type:"OAUTH",category:"oauth",description:"Google OAuth for Analytics, Search Console, Ads, and YouTube",docsUrl:"https://console.cloud.google.com/apis/credentials",fields:[{key:"clientId",label:"Client ID",envKey:"GOOGLE_CLIENT_ID",type:"text",required:!0,placeholder:"xxxxx.apps.googleusercontent.com",helpText:"From Google Cloud Console > APIs & Services > Credentials"},{key:"clientSecret",label:"Client Secret",envKey:"GOOGLE_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:t},META:{name:"Meta (Facebook/Instagram)",type:"OAUTH",category:"oauth",description:"Meta OAuth for Facebook Pages, Instagram, and Meta Ads",docsUrl:"https://developers.facebook.com/apps/",fields:[{key:"appId",label:"App ID",envKey:"META_APP_ID",type:"text",required:!0,placeholder:"123456789012345",helpText:"From Meta for Developers > Your App > Settings > Basic"},{key:"appSecret",label:"App Secret",envKey:"META_APP_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:r},LINKEDIN:{name:"LinkedIn",type:"OAUTH",category:"oauth",description:"LinkedIn OAuth for Company Pages and Ads",docsUrl:"https://www.linkedin.com/developers/apps",fields:[{key:"clientId",label:"Client ID",envKey:"LINKEDIN_CLIENT_ID",type:"text",required:!0,helpText:"From LinkedIn Developers > Your App > Auth"},{key:"clientSecret",label:"Client Secret",envKey:"LINKEDIN_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:a},TWITTER:{name:"Twitter/X",type:"OAUTH",category:"oauth",description:"Twitter OAuth for posting and analytics",docsUrl:"https://developer.twitter.com/en/portal/dashboard",fields:[{key:"clientId",label:"Client ID",envKey:"TWITTER_CLIENT_ID",type:"text",required:!0,helpText:"From Twitter Developer Portal > Your App > Keys and tokens"},{key:"clientSecret",label:"Client Secret",envKey:"TWITTER_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}]},RAZORPAY:{name:"Razorpay",type:"API_KEY",category:"payment",description:"Payment processing for Indian market",docsUrl:"https://dashboard.razorpay.com/app/keys",fields:[{key:"keyId",label:"Key ID",envKey:"RAZORPAY_KEY_ID",type:"text",required:!0,placeholder:"rzp_live_xxxxx or rzp_test_xxxxx",helpText:"From Razorpay Dashboard > Settings > API Keys"},{key:"keySecret",label:"Key Secret",envKey:"RAZORPAY_KEY_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"RAZORPAY_WEBHOOK_SECRET",type:"password",required:!1,helpText:"For verifying webhook signatures"}],testConnection:n},STRIPE:{name:"Stripe",type:"API_KEY",category:"payment",description:"Payment processing for international market",docsUrl:"https://dashboard.stripe.com/apikeys",fields:[{key:"publishableKey",label:"Publishable Key",envKey:"STRIPE_PUBLISHABLE_KEY",type:"text",required:!0,placeholder:"pk_live_xxxxx or pk_test_xxxxx",helpText:"Public key for client-side use"},{key:"secretKey",label:"Secret Key",envKey:"STRIPE_SECRET_KEY",type:"password",required:!0,placeholder:"sk_live_xxxxx or sk_test_xxxxx",helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"STRIPE_WEBHOOK_SECRET",type:"password",required:!1,placeholder:"whsec_xxxxx",helpText:"For verifying webhook signatures"}],testConnection:i},RESEND:{name:"Resend",type:"API_KEY",category:"communication",description:"Transactional email service",docsUrl:"https://resend.com/api-keys",fields:[{key:"apiKey",label:"API Key",envKey:"RESEND_API_KEY",type:"password",required:!0,placeholder:"re_xxxxx",helpText:"From Resend Dashboard > API Keys"},{key:"fromEmail",label:"Default From Email",envKey:"RESEND_FROM_EMAIL",type:"text",required:!1,placeholder:"notifications@yourdomain.com",helpText:"Must be from a verified domain"}],testConnection:s},OPENROUTER:{name:"OpenRouter",type:"API_KEY",category:"ai",description:"AI model router for GPT, Claude, and other models",docsUrl:"https://openrouter.ai/keys",fields:[{key:"apiKey",label:"API Key",envKey:"OPENROUTER_API_KEY",type:"password",required:!0,placeholder:"sk-or-xxxxx",helpText:"From OpenRouter Dashboard"},{key:"defaultModel",label:"Default Model",envKey:"OPENROUTER_DEFAULT_MODEL",type:"text",required:!1,placeholder:"anthropic/claude-3-sonnet",helpText:"Default model to use for AI requests"}],testConnection:o},DEEPSEEK:{name:"DeepSeek",type:"API_KEY",category:"ai",description:"DeepSeek AI for data extraction and conversational AI",docsUrl:"https://platform.deepseek.com/api_keys",fields:[{key:"apiKey",label:"API Key",envKey:"DEEPSEEK_API_KEY",type:"password",required:!0,placeholder:"sk-xxxxx",helpText:"From DeepSeek Platform Dashboard"}],testConnection:async e=>{let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.deepseek.com/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"DeepSeek credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid DeepSeek API key"};return{success:!1,message:`DeepSeek API error: ${e.status}`}}catch{return{success:!1,message:"Connection test failed"}}}},WBIZTOOL:{name:"WBizTool",type:"API_KEY",category:"communication",description:"WhatsApp Business API integration",docsUrl:"https://wbiztool.com/docs",fields:[{key:"clientId",label:"Client ID",envKey:"WBIZTOOL_CLIENT_ID",type:"text",required:!0,helpText:"From WBizTool Dashboard"},{key:"apiKey",label:"API Key",envKey:"WBIZTOOL_API_KEY",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"whatsappClient",label:"WhatsApp Client ID",envKey:"WBIZTOOL_WHATSAPP_CLIENT",type:"text",required:!1,helpText:"Specific WhatsApp account identifier"}],testConnection:l}}])},353669,e=>{"use strict";var t=e.i(35344);async function r(e,a=1e3){return await t.prisma.$transaction(async t=>await t.sequence.findUnique({where:{id:e}})?(await t.sequence.update({where:{id:e},data:{value:{increment:1}}})).value:(await t.sequence.create({data:{id:e,value:a+1}})).value)}async function a(){let e=await r("CLIENT",1e3);return`CLT${e}`}async function n(e){let t=e||new Date().getFullYear(),a=await r(`INVOICE_${t}`,0);return`INV-${t}-${String(a).padStart(4,"0")}`}async function i(e){let t=e||new Date().getFullYear(),a=await r(`PROFORMA_${t}`,0);return`PI-${t}-${String(a).padStart(4,"0")}`}async function s(){let e=await t.prisma.$transaction(async e=>{let t=await e.user.findFirst({where:{empId:{startsWith:"BP-"}},orderBy:{empId:"desc"},select:{empId:!0}}),r=0;if(t?.empId){let e=t.empId.match(/BP-(\d+)/);e&&(r=parseInt(e[1],10))}let a=await e.sequence.findUnique({where:{id:"EMPLOYEE"}});return((!a||a.value<=r)&&await e.sequence.upsert({where:{id:"EMPLOYEE"},create:{id:"EMPLOYEE",value:r+1},update:{value:r+1}}),await e.sequence.findUnique({where:{id:"EMPLOYEE"}}))?(await e.sequence.update({where:{id:"EMPLOYEE"},data:{value:{increment:1}}})).value:(await e.sequence.create({data:{id:"EMPLOYEE",value:r+1}})).value},{isolationLevel:"Serializable"});return`BP-${String(e).padStart(3,"0")}`}async function o(){let e=await r("INVOICE_SIMPLE",0);return`INV-${String(e).padStart(4,"0")}`}async function l(){let e=await r("TICKET",0);return`TKT-${String(e).padStart(5,"0")}`}async function d(){let e=await r("ISSUE",0);return`ISS-${String(e).padStart(3,"0")}`}async function c(){let e=await r("ASSET",0);return`BP-ASSET-${String(e).padStart(4,"0")}`}e.s(["generateAssetTag",0,c,"generateClientId",0,a,"generateEmployeeId",0,s,"generateInvoiceNumber",0,n,"generateIssueNumber",0,d,"generateProformaNumber",0,i,"generateSimpleInvoiceNumber",0,o,"generateTicketNumber",0,l,"getNextSequenceValue",0,r])},588224,e=>{"use strict";let t=new Set(["createdAt","updatedAt","name","title","dueDate","date","amount","total","status","priority"]);e.s(["getPaginationParams",0,function(e){let{searchParams:t}=new URL(e.url),r=parseInt(t.get("page")||String(1),10);(isNaN(r)||r<1)&&(r=1);let a=parseInt(t.get("limit")||String(20),10);(isNaN(a)||a<1)&&(a=20),a>100&&(a=100);let n=(r-1)*a,i=a;return{page:r,limit:a,skip:n,take:i}},"getSortParams",0,function(e,r="createdAt",a="desc"){let{searchParams:n}=new URL(e.url),i=n.get("sortBy")||r,s=n.get("sortOrder")||a;return t.has(i)||(i=r),{orderBy:{[i]:"asc"===s?"asc":"desc"}}},"paginatedResponse",0,function(e,t,r,a){let n=Math.ceil(t/a);return{data:e,pagination:{page:r,limit:a,total:t,totalPages:n,hasMore:r<n,hasPrevious:r>1}}}])},120674,e=>{"use strict";var t=e.i(246245);e.i(897360);var r=e.i(292550);let a="Branding Pioneers",n=null,i=0;async function s(){let e=Date.now();if(n&&e-i<36e5)return n;let a=(await (0,r.getCredentialsWithFallback)("RESEND")).apiKey||process.env.RESEND_API_KEY||"";return n=new t.Resend(a),i=e,n}async function o(){return(await (0,r.getCredentialsWithFallback)("RESEND")).fromEmail||process.env.RESEND_FROM_EMAIL||"noreply@brandingpioneers.in"}let l=process.env.NEXTAUTH_URL||"https://brandingpioneers.in";async function d(e){try{let t=await s(),r=await o(),a=Array.isArray(e.to)?e.to:[e.to],{data:n,error:i}=await t.emails.send({from:e.from||`Pioneer OS <${r}>`,to:a,subject:e.subject,html:e.html,...e.text?{text:e.text}:{},...e.replyTo?{replyTo:e.replyTo}:{}});if(i)return console.error("[Email] Resend error:",i),{success:!1,error:i.message};return{success:!0,messageId:n?.id}}catch(e){return console.error("[Email] Send error:",e),{success:!1,error:e instanceof Error?e.message:"Failed to send email"}}}async function c({to:e,token:t,firstName:r}){let a=`${l}/auth/magic?token=${t}`;return d({to:e,subject:"Your Login Link - Pioneer OS",html:`
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
              <a href="${a}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
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
              ${a}
            </p>
          </div>

          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            Didn't request this? You can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `})}async function p({to:e,token:t,firstName:r}){let a=`https://brandingpioneers.in/auth/magic?token=${t}`;return d({to:e,subject:"Your Admin Login Link - Branding Pioneers",html:`
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
              <a href="${a}" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px;">
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
              ${a}
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
    `})}async function u({to:e,name:t,onboardingUrl:r,expiresAt:n}){let i=Math.ceil((n.getTime()-Date.now())/864e5);return d({to:e,subject:`Complete Your Onboarding - ${a}`,html:`
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
    `})}async function m(e,t){let r=t.contactName||t.clientName;return d({to:e,subject:`Invoice ${t.invoiceNumber} - ${a}`,replyTo:"accounts@brandingpioneers.com",text:`Dear ${r},

Greetings from ${a}!

Please find below the invoice details:

Invoice Number: ${t.invoiceNumber}
Amount: ${t.currency} ${t.amount}
Due Date: ${t.dueDate}

${t.notes||""}

Please ensure timely payment to continue uninterrupted services.

For any queries, feel free to reach out to our accounts team.

Best regards,
Accounts Team
${a}
accounts@brandingpioneers.com`,html:`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${a}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">Invoice Notification</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin-top: 0;">Dear ${r},</p>
          <p>Greetings from ${a}!</p>
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
          <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong><br>${a}</p>
        </div>
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated email from ${a}.</p>
        </div>
      </body>
      </html>
    `})}async function g(e,t){let r=t.contactName||t.clientName;return d({to:e,subject:`Payment Received - Thank You! (Invoice ${t.invoiceNumber})`,replyTo:"accounts@brandingpioneers.com",text:`Dear ${r},

Thank you for your payment!

We have received your payment of ${t.currency} ${t.amount} for Invoice ${t.invoiceNumber}.
${t.transactionRef?`Transaction Reference: ${t.transactionRef}`:""}

We appreciate your prompt payment and look forward to continuing our partnership.

Best regards,
Accounts Team
${a}`,html:`
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
          <p style="margin-bottom: 0;">Best regards,<br><strong>Accounts Team</strong><br>${a}</p>
        </div>
        <div style="background: #1f2937; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">This is an automated receipt from ${a}.</p>
        </div>
      </body>
      </html>
    `})}e.s(["sendAdminMagicLinkEmail",0,p,"sendInvoiceEmail",0,m,"sendMagicLinkEmail",0,c,"sendOnboardingEmail",0,u,"sendPaymentReceivedEmail",0,g],120674)},657736,e=>{"use strict";var t=e.i(747909),r=e.i(174017),a=e.i(996250),n=e.i(759756),i=e.i(561916),s=e.i(174677),o=e.i(869741),l=e.i(316795),d=e.i(487718),c=e.i(995169),p=e.i(47587),u=e.i(666012),m=e.i(570101),g=e.i(626937),y=e.i(10372),h=e.i(193695);e.i(820232);var f=e.i(600220),x=e.i(89171),b=e.i(35344),v=e.i(223999),E=e.i(588224),w=e.i(469719),I=e.i(353669),A=e.i(120674);let k=["SUPER_ADMIN","MANAGER","ACCOUNTS","SALES"],T=w.z.object({clientId:w.z.string().min(1,"Client is required"),amount:w.z.number().min(0,"Amount must be positive"),tax:w.z.number().min(0).optional().default(0),dueDate:w.z.string().refine(e=>!isNaN(Date.parse(e)),{message:"dueDate must be a valid date string"}),items:w.z.array(w.z.object({description:w.z.string().min(1),quantity:w.z.number().int().positive(),rate:w.z.number().min(0)})).optional(),notes:w.z.string().max(2e3).optional()}),R=(0,v.withAuth)(async(e,{user:t})=>{if(!(k.includes(t.role)||"ACCOUNTS"===t.department))return x.NextResponse.json({error:"Forbidden - Insufficient permissions"},{status:403});let{searchParams:r}=new URL(e.url),a=r.get("status"),n=r.get("clientId"),{skip:i,take:s,page:o,limit:l}=(0,E.getPaginationParams)(e),d={};a&&(d.status=a),n&&(d.clientId=n);let[c,p]=await Promise.all([b.prisma.invoice.findMany({where:d,skip:i,take:s,include:{client:{select:{id:!0,name:!0}}},orderBy:{createdAt:"desc"}}),b.prisma.invoice.count({where:d})]);return x.NextResponse.json((0,E.paginatedResponse)(c,p,o,l))}),P=(0,v.withAuth)(async(e,{user:t})=>{if(!(["SUPER_ADMIN","MANAGER","ACCOUNTS"].includes(t.role)||"ACCOUNTS"===t.department))return x.NextResponse.json({error:"Forbidden - Insufficient permissions"},{status:403});let r=await e.json(),a=T.safeParse(r);if(!a.success)return x.NextResponse.json({error:"Validation failed",details:a.error.flatten().fieldErrors},{status:400});let{clientId:n,amount:i,tax:s,dueDate:o,items:l,notes:d}=a.data,c=!0===r.sendImmediately,p=i;l&&l.length>0&&(p=l.reduce((e,t)=>e+t.quantity*t.rate,0));let u=await b.prisma.client.findUnique({where:{id:n},select:{id:!0,name:!0}});if(!u)return x.NextResponse.json({error:"Client not found"},{status:404});let m=await (0,I.generateSimpleInvoiceNumber)(),g=Math.round((p+s)*100)/100,y=await b.prisma.invoice.create({data:{invoiceNumber:m,clientId:n,amount:p,tax:s,total:g,dueDate:new Date(o),items:l?JSON.stringify(l):null,notes:d,status:"DRAFT"},include:{client:{select:{id:!0,name:!0}}}});if(c&&u)try{let e=new Intl.NumberFormat("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}).format(g),t=new Date(o).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),r=await b.prisma.client.findUnique({where:{id:n},select:{contactEmail:!0,contactName:!0,name:!0}});r?.contactEmail&&(await (0,A.sendInvoiceEmail)(r.contactEmail,{clientName:r.name,contactName:r.contactName||r.name,invoiceNumber:m,amount:e,dueDate:t,currency:"INR",notes:d||void 0})).success&&await b.prisma.invoice.update({where:{id:y.id},data:{status:"SENT"}})}catch(e){console.error("[Invoices] Non-blocking email error:",e)}return x.NextResponse.json(y,{status:201})});e.s(["GET",0,R,"POST",0,P],223804);var S=e.i(223804);let C=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/invoices/route",pathname:"/api/invoices",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/invoices/route.ts",nextConfigOutput:"standalone",userland:S}),{workAsyncStorage:N,workUnitAsyncStorage:_,serverHooks:D}=C;async function O(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),C.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/invoices/route";x=x.replace(/\/index$/,"")||"/";let b=await C.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:v,params:E,nextConfig:w,parsedUrl:I,isDraftMode:A,prerenderManifest:k,routerServerContext:T,isOnDemandRevalidate:R,revalidateOnlyGenerated:P,resolvedPathname:S,clientReferenceManifest:N,serverActionsManifest:_}=b,D=(0,o.normalizeAppPath)(x),O=!!(k.dynamicRoutes[D]||k.routes[S]),$=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,I,!1):t.end("This page could not be found"),null);if(O&&!A){let e=!!k.routes[S],t=k.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(w.adapterPath)return await $();throw new h.NoFallbackError}}let K=null;!O||C.isDev||A||(K="/index"===(K=S)?"/":K);let B=!0===C.isDev||!O,q=O&&!B;_&&N&&(0,s.setManifestsSingleton)({page:x,clientReferenceManifest:N,serverActionsManifest:_});let z=e.method||"GET",F=(0,i.getTracer)(),U=F.getActiveScopeSpan(),L=!!(null==T?void 0:T.isWrappedByNextServer),M=!!(0,n.getRequestMeta)(e,"minimalMode"),Y=(0,n.getRequestMeta)(e,"incrementalCache")||await C.getIncrementalCache(e,w,k,M);null==Y||Y.resetRequestCache(),globalThis.__incrementalCache=Y;let W={params:E,previewProps:k.preview,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:B,incrementalCache:Y,cacheLifeProfiles:w.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>C.onRequestError(e,t,a,n,T)},sharedContext:{buildId:v}},H=new l.NodeNextRequest(e),j=new l.NodeNextResponse(t),G=d.NextRequestAdapter.fromNodeNextRequest(H,(0,d.signalFromNodeResponse)(t));try{let n,s=async e=>C.handle(G,W).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${z} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${z} ${x}`)}),o=async n=>{var i,o;let l=async({previousCacheEntry:r})=>{try{if(!M&&R&&P&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=W.renderOpts.fetchMetrics;let o=W.renderOpts.pendingWaitUntil;o&&a.waitUntil&&(a.waitUntil(o),o=void 0);let l=W.renderOpts.collectedTags;if(!O)return await (0,u.sendResponse)(H,j,i,W.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[y.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==W.renderOpts.collectedRevalidate&&!(W.renderOpts.collectedRevalidate>=y.INFINITE_CACHE)&&W.renderOpts.collectedRevalidate,a=void 0===W.renderOpts.collectedExpire||W.renderOpts.collectedExpire>=y.INFINITE_CACHE?void 0:W.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:R})},!1,T),t}},d=await C.handleResponse({req:e,nextConfig:w,cacheKey:K,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:k,isRoutePPREnabled:!1,isOnDemandRevalidate:R,revalidateOnlyGenerated:P,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:M});if(!O)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});M||t.setHeader("x-nextjs-cache",R?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,m.fromNodeOutgoingHttpHeaders)(d.value.headers);return M&&O||c.delete(y.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,g.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)(H,j,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};L&&U?await o(U):(n=F.getActiveScopeSpan(),await F.withPropagatedContext(e.headers,()=>F.trace(c.BaseServerSpan.handleRequest,{spanName:`${z} ${x}`,kind:i.SpanKind.SERVER,attributes:{"http.method":z,"http.target":e.url}},o),void 0,!L))}catch(t){if(t instanceof h.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:R})},!1,T),O)throw t;return await (0,u.sendResponse)(H,j,new Response(null,{status:500})),null}}e.s(["handler",0,O,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:N,workUnitAsyncStorage:_})},"routeModule",0,C,"serverHooks",0,D,"workAsyncStorage",0,N,"workUnitAsyncStorage",0,_],657736)},485685,e=>{e.v(e=>Promise.resolve().then(()=>e(254799)))}];

//# debugId=12d320d8-a6aa-6c7d-cb89-141b2d9794c3
//# sourceMappingURL=%5Broot-of-the-server%5D__0mozk2g._.js.map