/**
 * Field Descriptions for Pioneer OS
 *
 * Centralized descriptions for every form field across all modules.
 * Used by FieldInfo components to show "i" button tooltips.
 *
 * Format: { description, example?, source?, required? }
 */

interface FieldDesc {
  description: string
  example?: string
  source?: string
  required?: boolean
}

// ============ CLIENT FIELDS ============
export const clientFields: Record<string, FieldDesc> = {
  name: {
    description: 'Full business name of the client as it appears on their letterhead or official documents.',
    example: 'Acme Technologies Pvt. Ltd.',
    source: 'Client contract or website',
    required: true,
  },
  contactPerson: {
    description: 'Primary point of contact at the client company. This person will receive all communications.',
    example: 'Rahul Sharma',
    source: 'Ask during onboarding call',
    required: true,
  },
  email: {
    description: 'Official email of the primary contact person. Used for invoices, reports, and portal access.',
    example: 'rahul@acmetech.com',
    source: 'Client provides during onboarding',
    required: true,
  },
  phone: {
    description: 'WhatsApp-enabled phone number with country code. Used for WhatsApp communication and reminders.',
    example: '+919876543210',
    source: 'Client provides during onboarding',
    required: true,
  },
  companyWebsite: {
    description: 'Client\'s current website URL. Used for SEO audits, analytics setup, and reference.',
    example: 'https://acmetech.com',
    source: 'Google search or client provides',
  },
  industry: {
    description: 'Business sector the client operates in. Helps team understand context and tailor strategy.',
    example: 'Healthcare, Real Estate, EdTech, Fashion',
    source: 'Ask client or check their website',
  },
  budget: {
    description: 'Monthly marketing budget range the client has committed. Determines service tier and deliverables.',
    example: '50000 - 100000',
    source: 'Sales proposal or contract',
    required: true,
  },
  tier: {
    description: 'Service tier determines pricing, SLA, and deliverable volume. Auto-calculated from budget but can be overridden.',
    example: 'STANDARD',
    source: 'Auto-set from budget. STARTER: <25K, STANDARD: 25-75K, PREMIUM: 75-150K, ENTERPRISE: >150K',
  },
  monthlyFee: {
    description: 'Exact monthly fee charged to the client (excluding GST). Must match the signed contract.',
    example: '75000',
    source: 'Signed contract/SLA document',
    required: true,
  },
  services: {
    description: 'Which services are included in this client\'s package. Select all that apply from the contract.',
    example: 'SEO, Social Media, Google Ads',
    source: 'Contract scope of work',
    required: true,
  },
  gstNumber: {
    description: 'Client\'s GST Identification Number (15 characters). Needed for tax-compliant invoices.',
    example: '27AABCU9603R1ZM',
    source: 'Client provides or check on GST portal',
  },
  billingAddress: {
    description: 'Registered address for invoicing. Must match their GST registration address if GST number is provided.',
    example: '301, Business Tower, MG Road, Mumbai 400001',
    source: 'Client provides',
  },
  contractStartDate: {
    description: 'Date the contract/engagement officially begins. Billing cycle starts from this date.',
    example: '2026-04-01',
    source: 'Signed contract',
    required: true,
  },
  contractDuration: {
    description: 'How many months the contract runs for. Most contracts are 6 or 12 months.',
    example: '12',
    source: 'Signed contract',
  },
  paymentTerms: {
    description: 'When payment is due after invoice is sent. Standard is Net 7 (7 days) or Net 15.',
    example: 'NET_7',
    source: 'Contract payment terms section',
  },
  accountManager: {
    description: 'Employee who is the primary owner/contact for this client. Responsible for overall relationship.',
    example: 'Select from team list',
    source: 'Assigned by Manager',
    required: true,
  },
  lifecycleStage: {
    description: 'Current stage in client journey. Changes as client progresses through onboarding to active service.',
    example: 'ONBOARDING',
    source: 'Auto-managed by system based on checklist completion',
  },
  notes: {
    description: 'Any additional context about the client - special requirements, preferences, history, or important instructions.',
    example: 'Client prefers calls over email. Monthly reporting on 5th.',
  },
}

// ============ TASK FIELDS ============
export const taskFields: Record<string, FieldDesc> = {
  title: {
    description: 'Clear, specific title describing what needs to be done. Should be understandable without reading the description.',
    example: 'Create monthly SEO report for Acme Tech - March 2026',
    required: true,
  },
  description: {
    description: 'Detailed instructions, requirements, or context for the task. Include links, references, or special instructions.',
    example: 'Include keyword rankings, traffic data, and backlink progress. Use template from Google Drive.',
  },
  assignee: {
    description: 'Team member who will work on this task. Choose based on department and current workload.',
    example: 'Select from team list',
    source: 'Check team availability in daily planner',
    required: true,
  },
  reviewer: {
    description: 'Person who will review and approve the completed work. Usually the team lead or account manager.',
    example: 'Select from team list',
  },
  client: {
    description: 'Which client this task is for. Leave empty for internal tasks.',
    example: 'Acme Technologies',
  },
  priority: {
    description: 'How urgently this needs attention. URGENT = today, HIGH = within 2 days, MEDIUM = this week, LOW = this month.',
    example: 'MEDIUM',
    required: true,
  },
  dueDate: {
    description: 'When this task must be completed by. Set realistically - consider dependencies and workload.',
    example: '2026-04-05',
    required: true,
  },
  status: {
    description: 'Current progress: TODO (not started), IN_PROGRESS (working on it), IN_REVIEW (done, needs approval), COMPLETED (approved).',
    example: 'TODO',
  },
  estimatedHours: {
    description: 'How many hours you expect this task to take. Helps with workload planning and capacity.',
    example: '3',
  },
  tags: {
    description: 'Labels to categorize the task. Makes it easier to filter and find later.',
    example: 'reporting, monthly, SEO',
  },
}

// ============ INVOICE FIELDS ============
export const invoiceFields: Record<string, FieldDesc> = {
  client: {
    description: 'Select the client to invoice. Their billing details (address, GST, etc.) will auto-populate.',
    required: true,
  },
  invoiceNumber: {
    description: 'Auto-generated unique invoice number. Format: INV-YYYY-NNN. Do not change unless correcting an error.',
    example: 'INV-2026-042',
    source: 'Auto-generated',
  },
  invoiceDate: {
    description: 'Date the invoice is issued. Usually today\'s date or the first of the billing month.',
    example: '2026-04-01',
    required: true,
  },
  dueDate: {
    description: 'Payment deadline. Auto-calculated from payment terms but can be overridden.',
    example: '2026-04-08',
    source: 'Auto-calculated from client payment terms',
    required: true,
  },
  entity: {
    description: 'Which company entity is issuing this invoice. Determines letterhead, bank details, and GST number.',
    example: 'Branding Pioneers',
    source: 'Match to client contract entity',
    required: true,
  },
  items: {
    description: 'Line items describing what you\'re charging for. Add each service as a separate line item.',
    example: 'SEO Services - March 2026: Rs. 50,000',
    required: true,
  },
  itemDescription: {
    description: 'What this line item is for. Be specific - client should understand what they\'re paying for.',
    example: 'SEO Services for March 2026 - Includes keyword optimization, content, and link building',
    required: true,
  },
  itemAmount: {
    description: 'Amount for this line item before tax. Enter the exact amount from the rate card or contract.',
    example: '50000',
    required: true,
  },
  gstRate: {
    description: 'GST percentage to apply. Standard rate is 18% for marketing services.',
    example: '18',
    source: 'Standard: 18% for services',
  },
  tdsRate: {
    description: 'TDS percentage that client will deduct while paying. Standard is 10% under Section 194J.',
    example: '10',
    source: 'Standard: 10% for professional services',
  },
  notes: {
    description: 'Additional notes shown on the invoice. Payment instructions, bank details, or special terms.',
    example: 'Please pay via NEFT to account details mentioned below.',
  },
}

// ============ LEAD / SALES FIELDS ============
export const leadFields: Record<string, FieldDesc> = {
  name: {
    description: 'Full name of the potential client or company that reached out or was contacted.',
    example: 'TechStart Solutions / Priya Mehta',
    required: true,
  },
  email: {
    description: 'Email address for follow-up communication. Verify it\'s the decision-maker\'s email.',
    example: 'priya@techstart.in',
  },
  phone: {
    description: 'Contact number. WhatsApp-enabled preferred for quick follow-ups.',
    example: '+919876543210',
    required: true,
  },
  source: {
    description: 'How this lead came to us. Important for tracking which channels bring the most business.',
    example: 'Website Form, LinkedIn, Referral, Naukri, Cold Outreach, Google Ads',
    required: true,
  },
  service: {
    description: 'What service(s) the lead is interested in. Can select multiple.',
    example: 'SEO + Google Ads',
    source: 'From initial conversation or form submission',
  },
  budget: {
    description: 'Approximate monthly budget the lead mentioned or you estimate based on their business size.',
    example: '50000-100000',
    source: 'Ask during discovery call',
  },
  status: {
    description: 'Current stage: NEW (just received), CONTACTED (spoke once), INTERESTED (wants proposal), PROPOSAL_SENT, NEGOTIATION, WON, LOST.',
    example: 'NEW',
  },
  assignedTo: {
    description: 'Sales team member responsible for following up with this lead.',
    example: 'Select from sales team',
    required: true,
  },
  notes: {
    description: 'Context from conversations - what they need, pain points, timeline, competition, decision-maker info.',
    example: 'Currently using competitor agency, unhappy with results. Decision by end of month.',
  },
  followUpDate: {
    description: 'When to next contact this lead. Set based on their response and urgency.',
    example: '2026-04-02',
  },
  probability: {
    description: 'Estimated chance of converting (0-100%). NEW=10%, CONTACTED=25%, INTERESTED=50%, PROPOSAL=70%, NEGOTIATION=85%.',
    example: '50',
  },
}

// ============ HR FIELDS ============
export const hrFields: Record<string, FieldDesc> = {
  // Employee fields
  firstName: {
    description: 'Legal first name as it appears on government ID. Used for official documents and payroll.',
    example: 'Rahul',
    required: true,
  },
  lastName: {
    description: 'Legal last name / surname as on government ID.',
    example: 'Sharma',
    required: true,
  },
  personalEmail: {
    description: 'Personal email for sending offer letter and onboarding link before company email is set up.',
    example: 'rahul.personal@gmail.com',
    required: true,
  },
  phone: {
    description: 'Personal mobile number. Used for WhatsApp communication and emergency contact.',
    example: '+919876543210',
    required: true,
  },
  role: {
    description: 'System role that determines what features and data the employee can access in Pioneer OS.',
    example: 'EMPLOYEE',
    source: 'Based on designation and department',
    required: true,
  },
  department: {
    description: 'Primary department the employee belongs to. Determines their sidebar navigation and KPIs.',
    example: 'SEO',
    required: true,
  },
  designation: {
    description: 'Official job title as mentioned in the offer letter.',
    example: 'Senior SEO Specialist',
    required: true,
  },
  joiningDate: {
    description: 'First day of employment. Used to calculate tenure, probation period, and appraisal eligibility.',
    example: '2026-04-01',
    required: true,
  },
  employeeType: {
    description: 'Employment classification: FULL_TIME (salaried), PART_TIME, FREELANCER (project-based), INTERN.',
    example: 'FULL_TIME',
    required: true,
  },
  salary: {
    description: 'Monthly CTC (Cost to Company) in INR. Encrypted and visible only to HR, Accounts, and Super Admin.',
    example: '45000',
    source: 'Offer letter',
    required: true,
  },
  pan: {
    description: 'PAN card number (10 characters). Required for TDS calculations and Form 16.',
    example: 'ABCDE1234F',
    source: 'Employee provides during onboarding',
    required: true,
  },
  aadhaar: {
    description: 'Aadhaar card number (12 digits). Used for identity verification and EPF registration.',
    example: '1234 5678 9012',
    source: 'Employee provides during onboarding',
  },
  bankAccount: {
    description: 'Salary bank account number. Verified against cancelled cheque before first payroll.',
    example: '1234567890123456',
    source: 'Employee provides during onboarding',
    required: true,
  },
  ifsc: {
    description: 'IFSC code of the bank branch. 11 characters. Used for NEFT/RTGS salary transfer.',
    example: 'HDFC0001234',
    source: 'Check on bank passbook or cancelled cheque',
    required: true,
  },
  emergencyContact: {
    description: 'Name and phone of someone to contact in case of emergency. Should be a family member.',
    example: 'Neha Sharma - +919876543211',
    required: true,
  },
  buddyId: {
    description: 'Existing team member assigned as buddy for the first 30 days. Helps with onboarding and questions.',
    example: 'Select from team',
    source: 'Manager assigns based on department',
  },

  // Leave fields
  leaveType: {
    description: 'Category of leave: Casual (CL), Sick (SL), Earned/Privilege (EL), Compensatory Off (CO), or Loss of Pay (LOP).',
    example: 'CL',
    required: true,
  },
  leaveStartDate: {
    description: 'First day of leave. Must be a future date (or today for emergency sick leave).',
    example: '2026-04-10',
    required: true,
  },
  leaveEndDate: {
    description: 'Last day of leave (inclusive). Half-day leave: start and end dates are the same.',
    example: '2026-04-12',
    required: true,
  },
  leaveReason: {
    description: 'Brief reason for leave. For sick leave of 2+ days, medical certificate may be required.',
    example: 'Family function / Doctor appointment / Personal work',
    required: true,
  },

  // Candidate fields
  candidateName: {
    description: 'Full name of the job applicant.',
    example: 'Ankit Verma',
    required: true,
  },
  candidateEmail: {
    description: 'Applicant\'s email for sending interview invites and offer letters.',
    example: 'ankit.verma@gmail.com',
    required: true,
  },
  candidateRole: {
    description: 'Position the candidate is applying for.',
    example: 'SEO Specialist',
    required: true,
  },
  candidateSource: {
    description: 'Where the application came from. Helps track recruitment channel effectiveness.',
    example: 'Naukri, LinkedIn, Referral (Employee Name), Indeed, Direct',
    required: true,
  },
  expectedSalary: {
    description: 'Monthly CTC the candidate is expecting. Compare with budget for the role.',
    example: '40000',
  },
  resumeUrl: {
    description: 'Upload the candidate\'s latest resume. PDF format preferred.',
    example: 'Upload PDF file',
    required: true,
  },
  interviewFeedback: {
    description: 'Detailed feedback after the interview. Include strengths, weaknesses, and recommendation (Hire / No Hire / Maybe).',
    example: 'Strong technical skills, good communication. Recommend hiring at offered salary.',
    required: true,
  },
  interviewRating: {
    description: 'Overall rating: 1 (Definite No) to 5 (Definite Yes). 3 = needs another round.',
    example: '4',
    required: true,
  },
}

// ============ MEETING FIELDS ============
export const meetingFields: Record<string, FieldDesc> = {
  title: {
    description: 'Meeting subject. Be specific so attendees know the agenda before joining.',
    example: 'Weekly SEO Review - Client Updates',
    required: true,
  },
  type: {
    description: 'Meeting category: DAILY (huddle), TACTICAL (monthly ops review), STRATEGIC (quarterly planning), CLIENT, INTERNAL, ONE_ON_ONE.',
    example: 'INTERNAL',
    required: true,
  },
  scheduledAt: {
    description: 'Date and time for the meeting. Check attendee availability before scheduling.',
    example: '2026-04-02 10:00 AM',
    required: true,
  },
  duration: {
    description: 'Expected meeting length in minutes. Keep meetings under 60 minutes when possible.',
    example: '30',
  },
  participants: {
    description: 'Who needs to attend. Include the decision-maker and anyone who needs to take action.',
    example: 'Select team members',
    required: true,
  },
  agenda: {
    description: 'List of topics to cover. Shared with participants before the meeting.',
    example: '1. Review last week actions\n2. Client updates\n3. Blockers\n4. Next week priorities',
  },
  actionItem: {
    description: 'Specific action that came out of the meeting. Must have a clear owner and deadline.',
    example: 'Prepare Q1 report for Acme Tech',
    required: true,
  },
  actionAssignee: {
    description: 'Who is responsible for completing this action item.',
    required: true,
  },
  actionDueDate: {
    description: 'When this action item must be completed.',
    required: true,
  },

  // Daily meeting fields
  yesterday: {
    description: 'What you completed yesterday. List specific tasks and outcomes, not generic descriptions.',
    example: 'Completed SEO audit for Acme. Sent 3 client reports. Fixed keyword tracking issue.',
    required: true,
  },
  today: {
    description: 'What you plan to work on today. Be specific with client names and deliverables.',
    example: 'Start social media calendar for TechStart. Review ad campaigns for BuildRight.',
    required: true,
  },
  blockers: {
    description: 'Anything preventing you from completing your work. Include what help you need.',
    example: 'Waiting for client logo from Acme. Need access to Google Analytics for BuildRight.',
  },
}

// ============ WORK ENTRY FIELDS ============
export const workEntryFields: Record<string, FieldDesc> = {
  client: {
    description: 'Which client this work was for. Select "Internal" for non-client work.',
    required: true,
  },
  activity: {
    description: 'Type of work done. Options depend on your department (SEO, Ads, Social, Web, etc.).',
    example: 'On-Page SEO / Content Creation / Campaign Setup',
    required: true,
  },
  hours: {
    description: 'Time spent on this activity in hours. Use decimals for partial hours (0.5 = 30 min).',
    example: '2.5',
    required: true,
  },
  description: {
    description: 'Brief description of what was done. Enough detail for your reviewer to understand.',
    example: 'Optimized 5 product pages - added meta titles, descriptions, and internal links.',
  },
  deliverableType: {
    description: 'What kind of output this work produced. Used for KPI tracking.',
    example: 'Blog Post / Social Post / Landing Page / Report',
  },
  deliverableCount: {
    description: 'Number of deliverables produced (posts created, pages optimized, campaigns launched, etc.).',
    example: '5',
  },
}

// ============ EXPENSE FIELDS ============
export const expenseFields: Record<string, FieldDesc> = {
  category: {
    description: 'Expense category for accounting classification. Select the most specific option.',
    example: 'Software Subscription / Travel / Office Supplies / Client Entertainment',
    required: true,
  },
  amount: {
    description: 'Total expense amount in INR including taxes.',
    example: '2500',
    required: true,
  },
  description: {
    description: 'What was purchased and why. Include vendor name and business purpose.',
    example: 'Canva Pro subscription for social media design - March 2026',
    required: true,
  },
  receipt: {
    description: 'Upload photo or PDF of the bill/receipt. Required for reimbursement approval.',
    example: 'Upload image or PDF',
    source: 'Take photo of physical receipt or download from email',
    required: true,
  },
  date: {
    description: 'Date the expense was incurred. Cannot be more than 30 days in the past.',
    example: '2026-03-28',
    required: true,
  },
  vendor: {
    description: 'Name of the vendor or service provider.',
    example: 'Amazon / Canva / Uber / Restaurant Name',
  },
  clientChargeable: {
    description: 'Can this expense be billed to a client? If yes, select which client.',
    example: 'Yes - Acme Technologies',
  },
}

// ============ WHATSAPP FIELDS ============
export const whatsappFields: Record<string, FieldDesc> = {
  to: {
    description: 'Phone number to send message to. Must include country code without spaces or dashes.',
    example: '919876543210',
    required: true,
  },
  message: {
    description: 'Message text to send. Keep professional. Can include links but not attachments in this field.',
    example: 'Hi Rahul, please find your invoice attached. Payment due by April 8.',
    required: true,
  },
  template: {
    description: 'Pre-approved message template. Variables like {name}, {amount} will be replaced automatically.',
    example: 'Payment Reminder / Invoice Sent / Welcome Message',
  },
  scheduledFor: {
    description: 'Send later - set date and time. Messages are sent within 5 minutes of scheduled time.',
    example: '2026-04-01 09:00 AM',
  },
  campaignName: {
    description: 'Name for this broadcast campaign. Helps track performance later.',
    example: 'March Invoice Reminders',
    required: true,
  },
  campaignRecipients: {
    description: 'Who to send to. Can select individual contacts, client groups, or filter by criteria.',
    example: 'All active clients with pending payments',
    required: true,
  },
}

// ============ PROFILE / SETTINGS FIELDS ============
export const profileFields: Record<string, FieldDesc> = {
  firstName: {
    description: 'Your first name as you want it displayed across the app.',
    required: true,
  },
  lastName: {
    description: 'Your last name / surname.',
    required: true,
  },
  phone: {
    description: 'Your WhatsApp number. Used for notifications and team communication.',
    example: '+919876543210',
  },
  profilePicture: {
    description: 'Your profile photo. Shown in team directory, org chart, and alongside your comments.',
    example: 'Upload a clear headshot',
  },
  bio: {
    description: 'Short bio visible to your team. Include your expertise and what you work on.',
    example: 'SEO Specialist focused on e-commerce and local SEO.',
  },
}

// ============ LEARNING FIELDS ============
export const learningFields: Record<string, FieldDesc> = {
  topic: {
    description: 'What you learned about. Be specific - topic should be relevant to your role.',
    example: 'Google Analytics 4 - Event Tracking Setup',
    required: true,
  },
  hours: {
    description: 'Time spent learning in hours. Minimum 0.5 hours. Need 72 hours/year for appraisal eligibility.',
    example: '1.5',
    required: true,
  },
  type: {
    description: 'How you learned: Course, Article, Video, Workshop, Certification, Book, Webinar.',
    example: 'Course',
    required: true,
  },
  source: {
    description: 'Where you learned from. Include URL or platform name.',
    example: 'Coursera - Google Digital Marketing Certificate',
  },
  proofUrl: {
    description: 'Link to certificate, screenshot of completion, or notes. Required for manager verification.',
    example: 'https://coursera.org/certificate/abc123',
    source: 'Course platform or screenshot',
  },
  keyTakeaways: {
    description: 'What you learned that you can apply to your work. 2-3 bullet points.',
    example: 'Learned how to set up custom events in GA4. Can now track form submissions accurately.',
  },
}

// ============ WEB PROJECT FIELDS ============
export const webProjectFields: Record<string, FieldDesc> = {
  projectName: {
    description: 'Name of the website project. Usually the client name + project type.',
    example: 'Acme Tech - Corporate Website Redesign',
    required: true,
  },
  client: {
    description: 'Which client this web project is for.',
    required: true,
  },
  projectType: {
    description: 'Type of web project: New Website, Redesign, Landing Page, E-commerce, Maintenance.',
    example: 'Redesign',
    required: true,
  },
  deadline: {
    description: 'Target completion date. Account for design, development, testing, and client review phases.',
    example: '2026-05-15',
    required: true,
  },
  domain: {
    description: 'Website domain name. Include www if applicable.',
    example: 'www.acmetech.com',
  },
  hosting: {
    description: 'Where the website will be hosted. Select from managed accounts or specify custom hosting.',
    example: 'Hostinger / AWS / GoDaddy',
  },
  phaseTitle: {
    description: 'Name of this project phase. Should clearly describe what\'s being delivered.',
    example: 'Phase 1 - Wireframes & Design',
    required: true,
  },
  bugDescription: {
    description: 'Detailed description of the bug. Include what happens vs what should happen, and steps to reproduce.',
    example: 'Contact form on /about page shows 500 error when submitted. Expected: confirmation message.',
    required: true,
  },
  bugSeverity: {
    description: 'How critical is this bug? CRITICAL = site down, HIGH = feature broken, MEDIUM = cosmetic issue, LOW = minor.',
    example: 'HIGH',
    required: true,
  },
}

/**
 * Get field description for a module
 */
export function getFieldDesc(module: string, field: string): FieldDesc | null {
  const modules: Record<string, Record<string, FieldDesc>> = {
    client: clientFields,
    task: taskFields,
    invoice: invoiceFields,
    lead: leadFields,
    hr: hrFields,
    meeting: meetingFields,
    workEntry: workEntryFields,
    expense: expenseFields,
    whatsapp: whatsappFields,
    profile: profileFields,
    learning: learningFields,
    webProject: webProjectFields,
  }

  return modules[module]?.[field] || null
}
