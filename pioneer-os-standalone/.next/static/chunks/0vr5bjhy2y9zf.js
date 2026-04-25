;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="591a293c-ac21-5310-1872-667a5bedfd7c")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,383973,e=>{"use strict";var t=e.i(843476),s=e.i(271645);let a=[{id:"templates",label:"Message Templates",icon:(0,t.jsx)("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"})})},{id:"faqs",label:"Client Handling FAQs",icon:(0,t.jsx)("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})})},{id:"tips",label:"Department Tips",icon:(0,t.jsx)("svg",{className:"w-4 h-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"})})}],n=[{category:"Onboarding & Kickoff",templates:[{title:"Welcome Message",purpose:"Sent after signing SLA/first payment.",content:`Hi [Client Name],

Welcome to Branding Pioneers! We're thrilled to have you onboard.

I will be your Account Manager. Could you please fill out this onboarding form? [Link]

Once filled, we will schedule our kickoff call.

Best,
[Your Name]`,channel:"WhatsApp / Email"},{title:"Missing Inputs Follow-up",purpose:"When a client hasn't shared required assets.",content:`Hi [Client Name],

Just a quick follow-up — we are ready to start, but we are awaiting [Asset Name / Credentials] from your end.

Could you please share this by [Day/Date]?

Best,
[Your Name]`,channel:"WhatsApp"}]},{category:"Operations & Reporting",templates:[{title:"Approval Request",purpose:"When sending content for approval.",content:`Hi [Client Name],

Please find attached the [Content Calendar / Designs] for the upcoming week.

Kindly share your feedback by [Time/Day]. If we don't hear back, we will assume approval and proceed.

Best,
[Your Name]`,channel:"WhatsApp / Email"},{title:"Month-End Report",purpose:"Sending the performance report.",content:`Hi [Client Name],

Please find attached the performance report for [Month].

Key Highlights:
- [Highlight 1]
- [Highlight 2]

Would you like to discuss? Available for a call on [Day/Time].

Best,
[Your Name]`,channel:"Email"}]}],i=[{question:"How to handle Scope Creep?",context:"Client keeps asking for services outside the SLA.",action:`1. Acknowledge: Validate their request.
2. Refer to SLA: Remind them of agreed scope.
3. Provide Options: Offer as add-on or swap.

**Script:** "That's a great idea! However, this falls outside our current SLA. We can do this as an add-on for ₹[Amount], or swap with [Other Deliverable]. Which do you prefer?"`},{question:"How to handle an Angry Client?",context:"Client is upset over poor performance or mistake.",action:`1. Move to a call immediately.
2. Listen without interrupting.
3. Own the problem if it's our fault.
4. Provide an action plan.

**Script:** "I completely understand your frustration. We dropped the ball on [Issue]. Here is what we're doing to fix it by [Date]."`}],o=[{department:"Web Development",points:["**Hosting Handoffs:** Never host client websites on your personal server.","**Domain Access:** Get domain registrar access via delegated access, not actual password.","**Go-Live Friday Rule:** Avoid pushing major updates on Friday at 5 PM."]},{department:"Social Media & Design",points:["**Grid Anxiety:** Remind clients 95% of users see posts in feed, not profile page.",'**Revisions:** Group feedback. Refuse "drip-feed" feedback with 1 change per message.',"**Shadowbanning:** Check if client bought fake followers or used banned hashtags."]},{department:"Performance Marketing (Ads)",points:["**Account Bans:** Meta bans happen automatically. Keep standard response ready.",'**The "Change it" Reflex:** Hold the line. Explain the 7-day learning phase.',"**Budget Scaling:** Never increase budget by more than 20% in 24 hours."]},{department:"SEO",points:['**The Sandbox:** New websites are in "Google Sandbox" for 3-6 months.',"**Algorithm Updates:** Send proactive email before clients notice traffic drops.","**Content Is King:** Document when client refuses blog content."]},{department:"Accounts & Billing",points:['**Advance Payments:** Enforce "No Advance, No Work" rule for new clients.',"**GST Compliance:** Verify client's GST number on portal before invoicing.","**Pause Protocol:** If 15 days overdue, notify Account Manager to pause campaigns."]}];e.s(["GuidelinesClient",0,function({allowedTipsDepartments:e}){let[r,l]=(0,s.useState)(a[0].id),[d,c]=(0,s.useState)(null),p=o.filter(t=>e.includes(t.department));return(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-2xl font-bold text-white",children:"Client Guidelines"}),(0,t.jsx)("p",{className:"text-slate-400 mt-1",children:"Communication templates, FAQs, and best practices."})]}),(0,t.jsx)("div",{className:"flex space-x-2 border-b border-white/10",children:a.map(e=>(0,t.jsxs)("button",{onClick:()=>l(e.id),className:`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${r===e.id?"border-blue-600 text-blue-400":"border-transparent text-slate-400 hover:text-slate-200"}`,children:[e.icon,e.label]},e.id))}),"templates"===r&&(0,t.jsx)("div",{className:"space-y-8",children:n.map((e,s)=>(0,t.jsxs)("div",{children:[(0,t.jsx)("h2",{className:"text-lg font-bold text-white mb-4",children:e.category}),(0,t.jsx)("div",{className:"grid md:grid-cols-2 gap-4",children:e.templates.map((e,s)=>(0,t.jsxs)("div",{className:"glass-card rounded-xl border border-white/10 overflow-hidden",children:[(0,t.jsxs)("div",{className:"bg-slate-900/40 px-4 py-3 border-b flex justify-between items-center",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"font-semibold text-white text-sm",children:e.title}),(0,t.jsx)("p",{className:"text-xs text-slate-400",children:e.purpose})]}),(0,t.jsx)("span",{className:"text-[10px] font-bold px-2 py-1 bg-blue-500/20 text-blue-400 rounded",children:e.channel})]}),(0,t.jsxs)("div",{className:"p-4 relative group",children:[(0,t.jsx)("pre",{className:"text-sm text-slate-200 whitespace-pre-wrap font-mono bg-slate-900/40 p-3 rounded-lg",children:e.content}),(0,t.jsx)("button",{onClick:()=>{var t;return t=e.content,void(navigator.clipboard.writeText(t),c(t),setTimeout(()=>c(null),2e3))},className:"absolute top-6 right-6 p-2 glass-card border rounded-md shadow-none opacity-0 group-hover:opacity-100 transition-opacity",children:d===e.content?"✓":"Copy"})]})]},s))})]},e.category))}),"faqs"===r&&(0,t.jsx)("div",{className:"space-y-4",children:i.map((e,s)=>(0,t.jsxs)("div",{className:"glass-card rounded-xl border border-white/10 p-6",children:[(0,t.jsx)("h3",{className:"text-lg font-bold text-white mb-2",children:e.question}),(0,t.jsxs)("p",{className:"text-sm text-slate-400 italic mb-4",children:["Context: ",e.context]}),(0,t.jsx)("div",{className:"text-sm text-slate-200 whitespace-pre-wrap",children:e.action})]},e.question))}),"tips"===r&&(0,t.jsx)("div",{className:"grid lg:grid-cols-2 gap-6",children:0===p.length?(0,t.jsx)("div",{className:"col-span-2 text-center py-8 text-slate-400",children:"No department-specific tips available."}):p.map((e,s)=>(0,t.jsxs)("div",{className:"glass-card rounded-xl border border-white/10 overflow-hidden",children:[(0,t.jsx)("div",{className:"bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4",children:(0,t.jsx)("h3",{className:"font-bold text-white text-lg",children:e.department})}),(0,t.jsx)("div",{className:"p-5",children:(0,t.jsx)("ul",{className:"space-y-3",children:e.points.map((e,s)=>{let a=e.match(/\*\*(.*?)\*\*(.*)/);return a?(0,t.jsxs)("li",{className:"flex gap-3 text-sm text-slate-300",children:[(0,t.jsx)("span",{className:"text-blue-500",children:"•"}),(0,t.jsxs)("span",{children:[(0,t.jsx)("strong",{className:"text-white",children:a[1]}),a[2]]})]},s):(0,t.jsxs)("li",{className:"flex gap-3 text-sm text-slate-300",children:[(0,t.jsx)("span",{className:"text-blue-500",children:"•"}),(0,t.jsx)("span",{children:e})]},s)})})})]},e.department))})]})}])}]);

//# debugId=591a293c-ac21-5310-1872-667a5bedfd7c