;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="9afdce1b-7b91-bc3c-7399-8ab1a5f8344e")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,190391,e=>{"use strict";var t=e.i(843476),a=e.i(271645);function n({title:e,steps:i,tips:s,position:r="right"}){let[o,l]=(0,a.useState)(!1);return(0,t.jsxs)("div",{className:"relative inline-flex items-center",children:[(0,t.jsx)("button",{type:"button",className:"w-6 h-6 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 flex items-center justify-center transition-all duration-200 text-sm font-medium border border-blue-500/30",onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),onClick:()=>l(!o),"aria-label":"Help information",children:"i"}),o&&(0,t.jsxs)("div",{className:`absolute top-8 ${{left:"right-0",right:"left-0",center:"left-1/2 -translate-x-1/2"}[r]} z-50 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200`,children:[(0,t.jsx)("div",{className:"absolute -top-2 left-4 w-4 h-4 bg-slate-800 border-l border-t border-slate-600 transform rotate-45"}),(0,t.jsxs)("h4",{className:"text-white font-semibold text-sm mb-3 flex items-center gap-2",children:[(0,t.jsx)("svg",{className:"w-5 h-5 text-yellow-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"})}),e]}),(0,t.jsx)("div",{className:"space-y-2 mb-3",children:i.map((e,a)=>(0,t.jsxs)("div",{className:"flex gap-2 text-sm",children:[(0,t.jsx)("span",{className:"flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold",children:a+1}),(0,t.jsx)("span",{className:"text-slate-300",children:e})]},`step-${a}`))}),s&&s.length>0&&(0,t.jsxs)("div",{className:"border-t border-slate-700 pt-3 mt-3",children:[(0,t.jsx)("p",{className:"text-xs text-amber-400 font-medium mb-1",children:"Pro Tips:"}),s.map((e,a)=>(0,t.jsxs)("p",{className:"text-xs text-slate-400 flex gap-1 mb-1",children:[(0,t.jsx)("span",{children:"•"}),(0,t.jsx)("span",{children:e})]},`tip-${a}`))]})]})]})}e.s(["InfoTooltip",0,n,"PageHeader",0,function({title:e,subtitle:a,helpTitle:i,helpSteps:s,helpTips:r,children:o}){return(0,t.jsxs)("div",{className:"flex items-start justify-between mb-6",children:[(0,t.jsx)("div",{className:"flex items-start gap-3",children:(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("h1",{className:"text-2xl font-bold text-white",children:e}),(0,t.jsx)(n,{title:i,steps:s,tips:r})]}),a&&(0,t.jsx)("p",{className:"text-slate-400 mt-1",children:a})]})}),o&&(0,t.jsx)("div",{className:"flex items-center gap-3",children:o})]})},"SectionHeader",0,function({title:e,helpText:a,className:i=""}){return(0,t.jsxs)("div",{className:`flex items-center gap-2 ${i}`,children:[(0,t.jsx)("h3",{className:"text-lg font-semibold text-white",children:e}),(0,t.jsx)(n,{title:`About ${e}`,steps:[a]})]})},"default",0,n])},23010,e=>{"use strict";var t=e.i(843476),a=e.i(271645),n=e.i(190391);let i=[{id:"inv-email-1",name:"Invoice Email",category:"Invoice",subject:"Invoice #{{invoice_number}} for {{month}} {{year}} - Pioneer Media",body:`Dear {{client_name}},

I hope this email finds you well.

Please find attached your invoice #{{invoice_number}} for the month of {{month}} {{year}}.

Invoice Details:
- Invoice Number: {{invoice_number}}
- Amount: Rs. {{amount}}
- Due Date: {{due_date}}
- Services: {{services}}

Payment Methods:
1. Bank Transfer:
   Bank: HDFC Bank
   Account Name: Pioneer Media Pvt Ltd
   Account Number: 50200012345678
   IFSC Code: HDFC0001234

2. UPI: pioneer@hdfcbank

3. Online Payment: {{payment_link}}

Please ensure payment is made by the due date to avoid any service disruption.

If you have any questions regarding this invoice, please don't hesitate to reach out.

Thank you for your continued partnership!

Best regards,
{{sender_name}}
Accounts Team
Pioneer Media Pvt Ltd
accounts@pioneermedia.in | +91 98765 43210`,variables:["client_name","invoice_number","month","year","amount","due_date","services","payment_link","sender_name"]},{id:"inv-email-2",name:"Payment Reminder Email",category:"Invoice",subject:"Friendly Reminder: Payment Due for Invoice #{{invoice_number}}",body:`Dear {{client_name}},

This is a friendly reminder that payment for the following invoice is due:

Invoice Number: {{invoice_number}}
Amount Due: Rs. {{amount}}
Due Date: {{due_date}}

If you have already made the payment, please disregard this email and accept our thanks.

For your convenience, you can make the payment using the link below:
{{payment_link}}

If you have any questions or need assistance, please feel free to contact us.

Best regards,
{{sender_name}}
Accounts Team
Pioneer Media`,variables:["client_name","invoice_number","amount","due_date","payment_link","sender_name"]},{id:"inv-email-3",name:"Overdue Notice",category:"Invoice",subject:"URGENT: Overdue Payment - Invoice #{{invoice_number}}",body:`Dear {{client_name}},

We are writing to bring to your attention that payment for the following invoice is now overdue:

Invoice Number: {{invoice_number}}
Amount Due: Rs. {{amount}}
Original Due Date: {{due_date}}
Days Overdue: {{days_overdue}}

We kindly request immediate attention to this matter to avoid any interruption to your services.

If there are any issues preventing payment, please contact us immediately so we can discuss a resolution.

Payment can be made via:
- Bank Transfer (details on invoice)
- Online: {{payment_link}}

We value our business relationship and look forward to resolving this matter promptly.

Best regards,
{{sender_name}}
Accounts Manager
Pioneer Media`,variables:["client_name","invoice_number","amount","due_date","days_overdue","payment_link","sender_name"]},{id:"pay-email-1",name:"Payment Confirmation",category:"Payment",subject:"Payment Received - Thank You! (Invoice #{{invoice_number}})",body:`Dear {{client_name}},

We are pleased to confirm receipt of your payment. Thank you!

Payment Details:
- Amount Received: Rs. {{amount}}
- Payment Date: {{payment_date}}
- Reference Number: {{reference}}
- Invoice Number: {{invoice_number}}

Your account is now up to date. An official receipt has been attached to this email for your records.

Thank you for your prompt payment and continued trust in Pioneer Media.

Best regards,
{{sender_name}}
Accounts Team
Pioneer Media`,variables:["client_name","amount","payment_date","reference","invoice_number","sender_name"]},{id:"renewal-email-1",name:"Contract Renewal Reminder",category:"Contract",subject:"Contract Renewal Notice - {{client_name}}",body:`Dear {{client_name}},

We hope you've had a great experience working with Pioneer Media over the past year!

This is to inform you that your current contract is scheduled to expire on {{expiry_date}}.

Current Contract Details:
- Services: {{services}}
- Monthly Value: Rs. {{monthly_value}}
- Contract Period: {{contract_period}}

To ensure uninterrupted services, we recommend initiating the renewal process at the earliest.

Our team has prepared a renewal proposal with some exciting options for you. Would you be available for a brief call this week to discuss?

Please let us know your preferred time, and we'll schedule a meeting.

Looking forward to continuing our partnership!

Best regards,
{{sender_name}}
Accounts Manager
Pioneer Media`,variables:["client_name","expiry_date","services","monthly_value","contract_period","sender_name"]},{id:"welcome-email-1",name:"Welcome Email",category:"Onboarding",subject:"Welcome to Pioneer Media - Next Steps",body:`Dear {{client_name}},

Welcome to the Pioneer Media family! We're thrilled to have you on board.

Your dedicated account team:
- Account Manager: {{account_manager}}
- Project Lead: {{project_lead}}
- Support Email: accounts@pioneermedia.in

Next Steps:
1. Contract Review & Signing - Please review and sign the attached contract
2. Payment Setup - Complete your initial payment to activate services
3. Onboarding Call - We'll schedule a call to align on goals and timelines

Important Links:
- Client Portal: {{portal_link}}
- Service Agreement: Attached
- Payment Link: {{payment_link}}

If you have any questions during the onboarding process, please don't hesitate to reach out.

We're excited to start this journey together!

Best regards,
{{sender_name}}
Pioneer Media`,variables:["client_name","account_manager","project_lead","portal_link","payment_link","sender_name"]}],s=["All","Invoice","Payment","Contract","Onboarding"];e.s(["default",0,function(){let[e,r]=(0,a.useState)("All"),[o,l]=(0,a.useState)(null),[c,d]=(0,a.useState)(null),[m,u]=(0,a.useState)({}),h="All"===e?i:i.filter(t=>t.category===e),b=(e,t)=>{let a="";a="subject"===t?e.subject:"body"===t?e.body:`Subject: ${e.subject}

${e.body}`,navigator.clipboard.writeText(a),d(`${e.id}-${t}`),setTimeout(()=>d(null),2e3)},p=(e,t)=>{let a=e;return t.forEach(e=>{let t=m[e]||`{{${e}}}`;a=a.replace(RegExp(`{{${e}}}`,"g"),t)}),a};return(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsx)("div",{className:"flex items-center justify-between",children:(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("h1",{className:"text-2xl font-bold text-white",children:"Email Templates"}),(0,t.jsx)(n.InfoTooltip,{title:"Email Templates",steps:["Standard email templates for accounts","Copy subject and body separately or together","Fill in variables before sending","Maintain professional communication"],tips:["Always personalize before sending","Attach relevant documents"]})]}),(0,t.jsx)("p",{className:"text-slate-400 mt-1",children:"Professional email templates for Accounts team"})]})}),(0,t.jsx)("div",{className:"flex flex-wrap gap-2",children:s.map(a=>(0,t.jsx)("button",{onClick:()=>r(a),className:`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${e===a?"bg-emerald-600 text-white":"bg-white/5 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-white/10"}`,children:a},a))}),(0,t.jsxs)("div",{className:"grid lg:grid-cols-2 gap-6",children:[(0,t.jsx)("div",{className:"space-y-4",children:h.map(e=>(0,t.jsxs)("div",{onClick:()=>l(e),className:`bg-white/5 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all ${o?.id===e.id?"border-emerald-500 bg-emerald-500/10":"border-white/10 hover:border-white/20"}`,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-2",children:[(0,t.jsx)("h3",{className:"font-medium text-white",children:e.name}),(0,t.jsx)("span",{className:"text-xs px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-slate-400",children:e.category})]}),(0,t.jsx)("p",{className:"text-sm text-blue-400 mb-2",children:e.subject}),(0,t.jsx)("p",{className:"text-sm text-slate-400 line-clamp-2",children:e.body})]},e.id))}),(0,t.jsx)("div",{className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden sticky top-6 max-h-[80vh] overflow-y-auto",children:o?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{className:"p-4 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur",children:[(0,t.jsx)("h3",{className:"font-bold text-white",children:o.name}),(0,t.jsx)("p",{className:"text-sm text-slate-400",children:o.category})]}),(0,t.jsxs)("div",{className:"p-4 border-b border-white/10 bg-black/20",children:[(0,t.jsx)("p",{className:"text-sm text-slate-400 mb-3",children:"Fill in variables:"}),(0,t.jsx)("div",{className:"grid grid-cols-2 gap-2",children:o.variables.map(e=>(0,t.jsx)("input",{type:"text",placeholder:e.replace(/_/g," "),value:m[e]||"",onChange:t=>u(a=>({...a,[e]:t.target.value})),className:"px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-none"},e))})]}),(0,t.jsxs)("div",{className:"p-4",children:[(0,t.jsxs)("div",{className:"mb-3",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-1",children:[(0,t.jsx)("span",{className:"text-xs text-slate-400",children:"Subject:"}),(0,t.jsx)("button",{onClick:()=>b(o,"subject"),className:`text-xs px-2 py-1 rounded transition-colors ${c===`${o.id}-subject`?"bg-emerald-600 text-white":"bg-white/10 backdrop-blur-sm text-slate-300 hover:bg-white/20"}`,children:c===`${o.id}-subject`?"Copied!":"Copy"})]}),(0,t.jsx)("div",{className:"bg-blue-500/10 border border-blue-500/30 rounded-lg p-3",children:(0,t.jsx)("p",{className:"text-blue-300 text-sm",children:p(o.subject,o.variables)})})]}),(0,t.jsxs)("div",{className:"mb-4",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-1",children:[(0,t.jsx)("span",{className:"text-xs text-slate-400",children:"Body:"}),(0,t.jsx)("button",{onClick:()=>b(o,"body"),className:`text-xs px-2 py-1 rounded transition-colors ${c===`${o.id}-body`?"bg-emerald-600 text-white":"bg-white/10 backdrop-blur-sm text-slate-300 hover:bg-white/20"}`,children:c===`${o.id}-body`?"Copied!":"Copy"})]}),(0,t.jsx)("div",{className:"bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 max-h-[300px] overflow-y-auto",children:(0,t.jsx)("p",{className:"text-slate-300 text-sm whitespace-pre-wrap",children:p(o.body,o.variables)})})]}),(0,t.jsx)("button",{onClick:()=>b(o,"both"),className:`w-full px-4 py-2 rounded-lg transition-colors ${c===`${o.id}-both`?"bg-emerald-600 text-white":"bg-emerald-600 hover:bg-emerald-700 text-white"}`,children:c===`${o.id}-both`?"Copied!":"Copy Full Email"})]})]}):(0,t.jsx)("div",{className:"p-8 text-center text-slate-400",children:(0,t.jsx)("p",{children:"Select a template to preview"})})})]})]})}])}]);

//# debugId=9afdce1b-7b91-bc3c-7399-8ab1a5f8344e