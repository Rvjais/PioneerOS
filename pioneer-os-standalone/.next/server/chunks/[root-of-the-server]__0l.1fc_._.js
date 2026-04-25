;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="af59a900-1f22-be33-bf1a-38067e237855")}catch(e){}}();
module.exports=[230194,e=>{"use strict";async function t(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.includes(".apps.googleusercontent.com")?{success:!0,message:"Google OAuth credentials format validated"}:{success:!1,message:"Invalid Google Client ID format"}:{success:!1,message:"Client ID and Client Secret are required"}}async function r(e){let{appId:t,appSecret:r}=e;if(!t||!r)return{success:!1,message:"App ID and App Secret are required"};try{let e=await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${t}&client_secret=${r}&grant_type=client_credentials`);if(!e.ok){let t=await e.json();return{success:!1,message:t.error?.message||"Invalid credentials"}}if((await e.json()).access_token)return{success:!0,message:"Meta credentials verified successfully"};return{success:!1,message:"Failed to obtain access token"}}catch(e){return{success:!1,message:"Connection test failed"}}}async function n(e){let{clientId:t,clientSecret:r}=e;return t&&r?t.length<10||r.length<10?{success:!1,message:"Invalid credential format"}:{success:!0,message:"LinkedIn credentials format validated"}:{success:!1,message:"Client ID and Client Secret are required"}}async function a(e){let{keyId:t,keySecret:r}=e;if(!t||!r)return{success:!1,message:"Key ID and Key Secret are required"};try{let e=Buffer.from(`${t}:${r}`).toString("base64"),n=await fetch("https://api.razorpay.com/v1/payments?count=1",{headers:{Authorization:`Basic ${e}`}});if(n.ok)return{success:!0,message:"Razorpay credentials verified successfully"};if(401===n.status)return{success:!1,message:"Invalid Razorpay credentials"};return{success:!1,message:`Razorpay API error: ${n.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function i(e){let{secretKey:t}=e;if(!t)return{success:!1,message:"Secret Key is required"};try{let e=await fetch("https://api.stripe.com/v1/balance",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Stripe credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Stripe credentials"};return{success:!1,message:`Stripe API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function s(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.resend.com/domains",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"Resend credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid Resend API key"};return{success:!1,message:`Resend API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function o(e){let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://openrouter.ai/api/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"OpenRouter credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid OpenRouter API key"};return{success:!1,message:`OpenRouter API error: ${e.status}`}}catch(e){return{success:!1,message:"Connection test failed"}}}async function l(e){let{clientId:t,apiKey:r,whatsappClient:n}=e;if(!t||!r)return{success:!1,message:"Client ID and API Key are required"};try{let e=await fetch("https://api.wbiztool.com/v1/status",{headers:{"X-Client-ID":t,"X-API-Key":r,...n&&{"X-WhatsApp-Client":n}}});if(e.ok)return{success:!0,message:"WBizTool credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid WBizTool credentials"};if(404===e.status)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:`WBizTool API error: ${e.status}`}}catch(e){if(t.length>5&&r.length>5)return{success:!0,message:"WBizTool credentials format validated"};return{success:!1,message:"Connection test failed"}}}e.s(["PROVIDERS",0,{GOOGLE:{name:"Google OAuth",type:"OAUTH",category:"oauth",description:"Google OAuth for Analytics, Search Console, Ads, and YouTube",docsUrl:"https://console.cloud.google.com/apis/credentials",fields:[{key:"clientId",label:"Client ID",envKey:"GOOGLE_CLIENT_ID",type:"text",required:!0,placeholder:"xxxxx.apps.googleusercontent.com",helpText:"From Google Cloud Console > APIs & Services > Credentials"},{key:"clientSecret",label:"Client Secret",envKey:"GOOGLE_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:t},META:{name:"Meta (Facebook/Instagram)",type:"OAUTH",category:"oauth",description:"Meta OAuth for Facebook Pages, Instagram, and Meta Ads",docsUrl:"https://developers.facebook.com/apps/",fields:[{key:"appId",label:"App ID",envKey:"META_APP_ID",type:"text",required:!0,placeholder:"123456789012345",helpText:"From Meta for Developers > Your App > Settings > Basic"},{key:"appSecret",label:"App Secret",envKey:"META_APP_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:r},LINKEDIN:{name:"LinkedIn",type:"OAUTH",category:"oauth",description:"LinkedIn OAuth for Company Pages and Ads",docsUrl:"https://www.linkedin.com/developers/apps",fields:[{key:"clientId",label:"Client ID",envKey:"LINKEDIN_CLIENT_ID",type:"text",required:!0,helpText:"From LinkedIn Developers > Your App > Auth"},{key:"clientSecret",label:"Client Secret",envKey:"LINKEDIN_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}],testConnection:n},TWITTER:{name:"Twitter/X",type:"OAUTH",category:"oauth",description:"Twitter OAuth for posting and analytics",docsUrl:"https://developer.twitter.com/en/portal/dashboard",fields:[{key:"clientId",label:"Client ID",envKey:"TWITTER_CLIENT_ID",type:"text",required:!0,helpText:"From Twitter Developer Portal > Your App > Keys and tokens"},{key:"clientSecret",label:"Client Secret",envKey:"TWITTER_CLIENT_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"}]},RAZORPAY:{name:"Razorpay",type:"API_KEY",category:"payment",description:"Payment processing for Indian market",docsUrl:"https://dashboard.razorpay.com/app/keys",fields:[{key:"keyId",label:"Key ID",envKey:"RAZORPAY_KEY_ID",type:"text",required:!0,placeholder:"rzp_live_xxxxx or rzp_test_xxxxx",helpText:"From Razorpay Dashboard > Settings > API Keys"},{key:"keySecret",label:"Key Secret",envKey:"RAZORPAY_KEY_SECRET",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"RAZORPAY_WEBHOOK_SECRET",type:"password",required:!1,helpText:"For verifying webhook signatures"}],testConnection:a},STRIPE:{name:"Stripe",type:"API_KEY",category:"payment",description:"Payment processing for international market",docsUrl:"https://dashboard.stripe.com/apikeys",fields:[{key:"publishableKey",label:"Publishable Key",envKey:"STRIPE_PUBLISHABLE_KEY",type:"text",required:!0,placeholder:"pk_live_xxxxx or pk_test_xxxxx",helpText:"Public key for client-side use"},{key:"secretKey",label:"Secret Key",envKey:"STRIPE_SECRET_KEY",type:"password",required:!0,placeholder:"sk_live_xxxxx or sk_test_xxxxx",helpText:"Keep this secret secure"},{key:"webhookSecret",label:"Webhook Secret",envKey:"STRIPE_WEBHOOK_SECRET",type:"password",required:!1,placeholder:"whsec_xxxxx",helpText:"For verifying webhook signatures"}],testConnection:i},RESEND:{name:"Resend",type:"API_KEY",category:"communication",description:"Transactional email service",docsUrl:"https://resend.com/api-keys",fields:[{key:"apiKey",label:"API Key",envKey:"RESEND_API_KEY",type:"password",required:!0,placeholder:"re_xxxxx",helpText:"From Resend Dashboard > API Keys"},{key:"fromEmail",label:"Default From Email",envKey:"RESEND_FROM_EMAIL",type:"text",required:!1,placeholder:"notifications@yourdomain.com",helpText:"Must be from a verified domain"}],testConnection:s},OPENROUTER:{name:"OpenRouter",type:"API_KEY",category:"ai",description:"AI model router for GPT, Claude, and other models",docsUrl:"https://openrouter.ai/keys",fields:[{key:"apiKey",label:"API Key",envKey:"OPENROUTER_API_KEY",type:"password",required:!0,placeholder:"sk-or-xxxxx",helpText:"From OpenRouter Dashboard"},{key:"defaultModel",label:"Default Model",envKey:"OPENROUTER_DEFAULT_MODEL",type:"text",required:!1,placeholder:"anthropic/claude-3-sonnet",helpText:"Default model to use for AI requests"}],testConnection:o},DEEPSEEK:{name:"DeepSeek",type:"API_KEY",category:"ai",description:"DeepSeek AI for data extraction and conversational AI",docsUrl:"https://platform.deepseek.com/api_keys",fields:[{key:"apiKey",label:"API Key",envKey:"DEEPSEEK_API_KEY",type:"password",required:!0,placeholder:"sk-xxxxx",helpText:"From DeepSeek Platform Dashboard"}],testConnection:async e=>{let{apiKey:t}=e;if(!t)return{success:!1,message:"API Key is required"};try{let e=await fetch("https://api.deepseek.com/v1/models",{headers:{Authorization:`Bearer ${t}`}});if(e.ok)return{success:!0,message:"DeepSeek credentials verified successfully"};if(401===e.status)return{success:!1,message:"Invalid DeepSeek API key"};return{success:!1,message:`DeepSeek API error: ${e.status}`}}catch{return{success:!1,message:"Connection test failed"}}}},WBIZTOOL:{name:"WBizTool",type:"API_KEY",category:"communication",description:"WhatsApp Business API integration",docsUrl:"https://wbiztool.com/docs",fields:[{key:"clientId",label:"Client ID",envKey:"WBIZTOOL_CLIENT_ID",type:"text",required:!0,helpText:"From WBizTool Dashboard"},{key:"apiKey",label:"API Key",envKey:"WBIZTOOL_API_KEY",type:"password",required:!0,helpText:"Keep this secret secure"},{key:"whatsappClient",label:"WhatsApp Client ID",envKey:"WBIZTOOL_WHATSAPP_CLIENT",type:"text",required:!1,helpText:"Specific WhatsApp account identifier"}],testConnection:l}}])},120674,e=>{"use strict";var t=e.i(246245);e.i(897360);var r=e.i(292550);let n="Branding Pioneers",a=null,i=0;async function s(){let e=Date.now();if(a&&e-i<36e5)return a;let n=(await (0,r.getCredentialsWithFallback)("RESEND")).apiKey||process.env.RESEND_API_KEY||"";return a=new t.Resend(n),i=e,a}async function o(){return(await (0,r.getCredentialsWithFallback)("RESEND")).fromEmail||process.env.RESEND_FROM_EMAIL||"noreply@brandingpioneers.in"}let l=process.env.NEXTAUTH_URL||"https://brandingpioneers.in";async function c(e){try{let t=await s(),r=await o(),n=Array.isArray(e.to)?e.to:[e.to],{data:a,error:i}=await t.emails.send({from:e.from||`Pioneer OS <${r}>`,to:n,subject:e.subject,html:e.html,...e.text?{text:e.text}:{},...e.replyTo?{replyTo:e.replyTo}:{}});if(i)return console.error("[Email] Resend error:",i),{success:!1,error:i.message};return{success:!0,messageId:a?.id}}catch(e){return console.error("[Email] Send error:",e),{success:!1,error:e instanceof Error?e.message:"Failed to send email"}}}async function d({to:e,token:t,firstName:r}){let n=`${l}/auth/magic?token=${t}`;return c({to:e,subject:"Your Login Link - Pioneer OS",html:`
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
    `})}async function g(e,t){let r=t.contactName||t.clientName;return c({to:e,subject:`Payment Received - Thank You! (Invoice ${t.invoiceNumber})`,replyTo:"accounts@brandingpioneers.com",text:`Dear ${r},

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
    `})}e.s(["sendAdminMagicLinkEmail",0,p,"sendInvoiceEmail",0,m,"sendMagicLinkEmail",0,d,"sendOnboardingEmail",0,u,"sendPaymentReceivedEmail",0,g],120674)},164176,e=>{"use strict";var t=e.i(747909),r=e.i(174017),n=e.i(996250),a=e.i(759756),i=e.i(561916),s=e.i(174677),o=e.i(869741),l=e.i(316795),c=e.i(487718),d=e.i(995169),p=e.i(47587),u=e.i(666012),m=e.i(570101),g=e.i(626937),y=e.i(10372),h=e.i(193695);e.i(820232);var f=e.i(600220),x=e.i(89171),b=e.i(35344),v=e.i(255627),I=e.i(120674),E=e.i(469719),w=e.i(223999);let A=E.z.object({sendViaWhatsApp:E.z.boolean().optional(),sendViaEmail:E.z.boolean().optional(),customMessage:E.z.string().optional()}),k=(0,w.withAuth)(async(e,{user:t,params:r})=>{try{var n,a;let i,s;if(!(["SUPER_ADMIN","MANAGER","ACCOUNTS"].includes(t.role)||"ACCOUNTS"===t.department))return x.NextResponse.json({error:"Forbidden"},{status:403});let{invoiceId:o}=await r,l=await e.json(),c=A.safeParse(l);if(!c.success)return x.NextResponse.json({error:"Validation failed",details:c.error.flatten()},{status:400});let{sendViaWhatsApp:d,sendViaEmail:p,customMessage:u}=c.data,m=await b.prisma.invoice.findUnique({where:{id:o},include:{client:{include:{autoInvoiceConfig:!0}}}});if(!m)return x.NextResponse.json({error:"Invoice not found"},{status:404});if("PAID"===m.status)return x.NextResponse.json({error:"Invoice already paid"},{status:400});let g=m.client,y=g.autoInvoiceConfig,h=d??y?.sendViaWhatsApp??!0,f=p??y?.sendViaEmail??!0,E={whatsApp:{sent:!1,error:null},email:{sent:!1,error:null}},w=u||(n=m,a=g,i=new Date(n.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),s=new Intl.NumberFormat("en-IN",{style:"currency",currency:n.currency||"INR"}).format(n.total),`Dear ${a.contactName||a.name},

Greetings from Branding Pioneers!

Please find below the invoice details for your review:

📄 *Invoice #${n.invoiceNumber}*
💰 Amount: ${s}
📅 Due Date: ${i}

${n.notes||""}

Please ensure timely payment to continue uninterrupted services.

For any queries, feel free to reach out.

Best regards,
Accounts Team
Branding Pioneers`);if(h&&g.whatsapp)try{let e=await (0,v.sendWhatsAppMessage)({phone:g.whatsapp,message:w});1===e.status?(E.whatsApp.sent=!0,await b.prisma.communicationLog.create({data:{clientId:g.id,type:"WHATSAPP",subject:`Invoice ${m.invoiceNumber}`,content:w,status:"SENT",sentAt:new Date,userId:t.id}})):E.whatsApp.error=e.message||"Failed to send"}catch(e){E.whatsApp.error=e instanceof Error?e.message:"WhatsApp error"}else h&&!g.whatsapp&&(E.whatsApp.error="No WhatsApp number configured");if(f&&g.contactEmail)try{let e=new Date(m.dueDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),r=new Intl.NumberFormat("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}).format(m.total),n=await (0,I.sendInvoiceEmail)(g.contactEmail,{clientName:g.name,contactName:g.contactName||g.name,invoiceNumber:m.invoiceNumber,amount:r,dueDate:e,currency:m.currency||"INR",notes:m.notes||void 0});n.success?(E.email.sent=!0,await b.prisma.communicationLog.create({data:{clientId:g.id,type:"EMAIL",subject:`Invoice ${m.invoiceNumber} - ${g.name}`,content:w,status:"SENT",sentAt:new Date,userId:t.id}})):(E.email.error=n.error||"Failed to send email",await b.prisma.communicationLog.create({data:{clientId:g.id,type:"EMAIL",subject:`Invoice ${m.invoiceNumber} - ${g.name}`,content:w,status:"FAILED",userId:t.id}}))}catch(e){E.email.error=e instanceof Error?e.message:"Email error"}else f&&!g.contactEmail&&(E.email.error="No email configured");let k=E.whatsApp.sent||E.email.sent;return k&&(await b.prisma.invoice.update({where:{id:o},data:{status:"SENT"}}),y&&await b.prisma.autoInvoiceConfig.update({where:{clientId:g.id},data:{lastSentAt:new Date}})),x.NextResponse.json({success:k,invoiceId:o,invoiceNumber:m.invoiceNumber,clientName:g.name,results:E,invoiceStatus:k?"SENT":m.status})}catch(e){return console.error("Failed to send invoice:",e),x.NextResponse.json({error:"Failed to send invoice"},{status:500})}});e.s(["POST",0,k],953049);var T=e.i(953049);let R=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/accounts/auto-invoice/send/[invoiceId]/route",pathname:"/api/accounts/auto-invoice/send/[invoiceId]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/accounts/auto-invoice/send/[invoiceId]/route.ts",nextConfigOutput:"standalone",userland:T}),{workAsyncStorage:P,workUnitAsyncStorage:C,serverHooks:S}=R;async function _(e,t,n){n.requestMeta&&(0,a.setRequestMeta)(e,n.requestMeta),R.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/accounts/auto-invoice/send/[invoiceId]/route";x=x.replace(/\/index$/,"")||"/";let b=await R.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:v,params:I,nextConfig:E,parsedUrl:w,isDraftMode:A,prerenderManifest:k,routerServerContext:T,isOnDemandRevalidate:P,revalidateOnlyGenerated:C,resolvedPathname:S,clientReferenceManifest:_,serverActionsManifest:D}=b,N=(0,o.normalizeAppPath)(x),K=!!(k.dynamicRoutes[N]||k.routes[S]),$=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,w,!1):t.end("This page could not be found"),null);if(K&&!A){let e=!!k.routes[S],t=k.dynamicRoutes[N];if(t&&!1===t.fallback&&!e){if(E.adapterPath)return await $();throw new h.NoFallbackError}}let O=null;!K||R.isDev||A||(O="/index"===(O=S)?"/":O);let B=!0===R.isDev||!K,z=K&&!B;D&&_&&(0,s.setManifestsSingleton)({page:x,clientReferenceManifest:_,serverActionsManifest:D});let F=e.method||"GET",q=(0,i.getTracer)(),L=q.getActiveScopeSpan(),U=!!(null==T?void 0:T.isWrappedByNextServer),M=!!(0,a.getRequestMeta)(e,"minimalMode"),W=(0,a.getRequestMeta)(e,"incrementalCache")||await R.getIncrementalCache(e,E,k,M);null==W||W.resetRequestCache(),globalThis.__incrementalCache=W;let H={params:I,previewProps:k.preview,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:B,incrementalCache:W,cacheLifeProfiles:E.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n,a)=>R.onRequestError(e,t,n,a,T)},sharedContext:{buildId:v}},Y=new l.NodeNextRequest(e),j=new l.NodeNextResponse(t),G=c.NextRequestAdapter.fromNodeNextRequest(Y,(0,c.signalFromNodeResponse)(t));try{let a,s=async e=>R.handle(G,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=q.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${F} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",n),a.updateName(t))}else e.updateName(`${F} ${x}`)}),o=async a=>{var i,o;let l=async({previousCacheEntry:r})=>{try{if(!M&&P&&C&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(a);e.fetchMetrics=H.renderOpts.fetchMetrics;let o=H.renderOpts.pendingWaitUntil;o&&n.waitUntil&&(n.waitUntil(o),o=void 0);let l=H.renderOpts.collectedTags;if(!K)return await (0,u.sendResponse)(Y,j,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[y.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=y.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,n=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=y.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await R.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:z,isOnDemandRevalidate:P})},!1,T),t}},c=await R.handleResponse({req:e,nextConfig:E,cacheKey:O,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:k,isRoutePPREnabled:!1,isOnDemandRevalidate:P,revalidateOnlyGenerated:C,responseGenerator:l,waitUntil:n.waitUntil,isMinimalMode:M});if(!K)return null;if((null==c||null==(i=c.value)?void 0:i.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(o=c.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});M||t.setHeader("x-nextjs-cache",P?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,m.fromNodeOutgoingHttpHeaders)(c.value.headers);return M&&K||d.delete(y.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,g.getCacheControlHeader)(c.cacheControl)),await (0,u.sendResponse)(Y,j,new Response(c.value.body,{headers:d,status:c.value.status||200})),null};U&&L?await o(L):(a=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(d.BaseServerSpan.handleRequest,{spanName:`${F} ${x}`,kind:i.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},o),void 0,!U))}catch(t){if(t instanceof h.NoFallbackError||await R.onRequestError(e,t,{routerKind:"App Router",routePath:N,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:z,isOnDemandRevalidate:P})},!1,T),K)throw t;return await (0,u.sendResponse)(Y,j,new Response(null,{status:500})),null}}e.s(["handler",0,_,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:P,workUnitAsyncStorage:C})},"routeModule",0,R,"serverHooks",0,S,"workAsyncStorage",0,P,"workUnitAsyncStorage",0,C],164176)},485685,e=>{e.v(e=>Promise.resolve().then(()=>e(254799)))}];

//# debugId=af59a900-1f22-be33-bf1a-38067e237855
//# sourceMappingURL=%5Broot-of-the-server%5D__0l.1fc_._.js.map