import { User, Briefcase, Shield, FileText, BookOpen, Upload, PartyPopper, Heart, Clock, Calendar, Award, DollarSign, TrendingUp, Lock, Globe, Database, Lightbulb, AlertTriangle, Laptop, MessageSquare, Receipt, HelpCircle, LogOut, Wifi, Activity, Eye } from 'lucide-react'

// ============================================
// TYPES
// ============================================

export interface OnboardingData {
  id: string
  token: string
  status: string
  currentStep: number
  isExpired: boolean
  entity: { name: string; legalName: string; address: string }
  candidate: { name: string; email: string; phone: string }
  offer: {
    department: string
    position: string
    employmentType: string
    salary: number
    joiningDate: string
    probationMonths: number
    bondDurationMonths: number
  }
  details: {
    confirmed: boolean
    dateOfBirth?: string
    bloodGroup?: string
    currentAddress?: string
    city?: string
    state?: string
    emergencyName?: string
    emergencyPhone?: string
  }
  nda: { accepted: boolean; acceptedAt?: string; signerName?: string }
  bond: { accepted: boolean; acceptedAt?: string; signerName?: string; durationMonths?: number }
  policies: {
    accepted: boolean
    acceptedAt?: string
    handbook: boolean
    socialMedia: boolean
    confidentiality: boolean
    antiHarassment: boolean
    codeOfConduct: boolean
  }
  documents: {
    submitted: boolean
    submittedAt?: string
    profilePicture?: string
    panCard?: string
    aadhaar?: string
    educationCert?: string
    bankDetails: { name?: string; bank?: string; account?: string; ifsc?: string }
  }
  completion: { completed: boolean; completedAt?: string; magicLinkSent: boolean }
  steps: Array<{ step: number; key: string; label: string; description: string }>
  createdAt: string
  expiresAt: string
}

export interface StepProps {
  data: OnboardingData
  token: string
  onComplete: () => void
}

// ============================================
// CONSTANTS
// ============================================

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const STEP_CONFIG = [
  { id: 1, label: 'Personal Details', icon: User },
  { id: 2, label: 'Review Offer', icon: Briefcase },
  { id: 3, label: 'Sign NDA', icon: Shield },
  { id: 4, label: 'Sign Bond', icon: FileText },
  { id: 5, label: 'Company Policies', icon: BookOpen },
  { id: 6, label: 'Documents', icon: Upload },
  { id: 7, label: 'Welcome!', icon: PartyPopper },
]

export const POLICIES = [
  {
    key: 'handbook',
    title: '1. Employee Handbook & Code of Conduct',
    icon: BookOpen,
    content: `Welcome to Branding Pioneers. This Employee Handbook and Code of Conduct establishes the standards of professional behavior expected from every team member at our organization. By joining Branding Pioneers, you agree to uphold these standards at all times, both within the office and in any professional capacity representing the company.

All employees are expected to conduct themselves with integrity, professionalism, and mutual respect. You must treat colleagues, clients, vendors, and visitors with courtesy and fairness regardless of their role, background, or position. Discrimination, bullying, or disrespectful behavior of any kind will not be tolerated.

Conflicts of interest must be disclosed to management immediately upon becoming aware of them. You must not engage in any activity, employment, or business relationship that conflicts with the interests of Branding Pioneers or its clients. Moonlighting, freelancing, or any form of secondary employment — particularly within the digital marketing, healthcare, or related industries — requires prior written approval from senior management. Failure to obtain approval constitutes a serious breach of this policy.

Substance abuse, including the consumption of alcohol or any intoxicating substances during working hours or on company premises, is strictly prohibited. Arriving at work under the influence of such substances will result in immediate disciplinary action.

The dress code at Branding Pioneers is smart casual on regular working days. For client meetings, presentations, or external events, formal business attire is mandatory. Fridays are designated as casual dress days, though employees must still maintain a neat and professional appearance. Personal hygiene and grooming standards must be maintained at all times.

Company resources — including laptops, internet access, software licenses, and office supplies — are provided for business use. Limited personal use is acceptable, provided it does not interfere with your productivity or violate any other company policy.`,
  },
  {
    key: 'workingHours',
    title: '2. Working Hours & Attendance',
    icon: Clock,
    content: `Branding Pioneers operates from 10:00 AM to 7:00 PM, Monday through Saturday, with a one-hour lunch break. All employees are expected to be present and working during these hours unless prior arrangements have been made with their manager.

Attendance is tracked through biometric or digital check-in systems. Every employee must check in upon arrival and check out when leaving for the day. Failure to record attendance without a valid reason may be treated as an unapproved absence. A minimum attendance rate of 90% must be maintained each month, calculated excluding approved leaves and holidays.

Punctuality is a core expectation. An employee is considered late if they check in after 10:15 AM. Three instances of late arrival within a single calendar month will be counted as one full day of unapproved absence, which may result in a proportionate salary deduction. Habitual tardiness will be addressed through the disciplinary process.

Work From Home (WFH) arrangements are available only with prior approval from your direct manager. WFH is not an entitlement and must be requested at least one day in advance except in cases of genuine emergency. Employees working from home must remain available and responsive during standard working hours.

If you are required to work beyond regular hours to meet project deadlines or client deliverables, compensatory time off (comp-off) may be granted at the discretion of your manager. Comp-off must be availed within 30 days of the extra work performed and requires written approval. Branding Pioneers does not offer overtime pay; however, the company recognizes and values dedication through its performance review and incentive programs.

Unauthorized absence from work for three or more consecutive days without intimation will be considered abandonment of employment, and the company reserves the right to initiate separation proceedings.`,
  },
  {
    key: 'leavePolicy',
    title: '3. Leave Policy',
    icon: Calendar,
    content: `Branding Pioneers provides the following leave entitlements to all confirmed employees on an annual basis: 12 Casual Leaves (CL) and 6 Sick Leaves (SL). These leaves are credited at the beginning of each calendar year and are non-cumulative — unused leaves do not carry forward to the next year, and leave encashment is not available.

Casual leaves are intended for personal and planned absences. Applications for casual leave must be submitted through the HR portal at least three working days in advance. Leave approval is subject to team workload and manager discretion. Applying for leave does not guarantee approval; employees must wait for confirmation before assuming their leave has been sanctioned.

Sick leaves are intended for health-related absences. If you are unwell and unable to attend work, you must inform your manager before 10:00 AM on the day of absence. For sick leave exceeding two consecutive days, a valid medical certificate from a registered medical practitioner must be submitted upon return to work. Failure to provide a medical certificate may result in the leave being treated as unapproved absence.

Half-day leaves may be availed with prior approval. A half-day is defined as either the first half (10:00 AM to 1:30 PM) or the second half (1:30 PM to 7:00 PM). Half-day leave counts as 0.5 days against your leave balance.

Employees in their probation period are not entitled to any leave during the first 30 days of employment. After the initial 30 days of probation, leaves may be granted on a case-by-case basis with manager approval. National holidays as declared by the company at the beginning of each year will be observed by all employees. The holiday calendar is published annually and shared with all team members.

Leave taken in excess of the available balance will result in a proportionate deduction from the employee's salary for that month.`,
  },
  {
    key: 'probation',
    title: '4. Probation & Confirmation',
    icon: Award,
    content: `All new employees at Branding Pioneers are subject to a probation period of three months from their date of joining. This probation period is designed to assess your suitability for the role, your ability to meet performance expectations, and your alignment with the company's culture and values.

During probation, your performance will be reviewed at two key milestones: at 60 days and at 90 days. These reviews will be conducted by your direct manager in consultation with HR and will evaluate your work quality, productivity, attendance, attitude, teamwork, and ability to learn and adapt. Constructive feedback will be provided at each review to help you improve and succeed in your role.

Confirmation into permanent employment is not automatic. It is contingent upon satisfactory performance across all evaluation criteria, maintaining the required attendance rate, demonstrating a positive and professional attitude, and receiving a favorable recommendation from your manager. If your performance during the probation period does not meet expectations, the company reserves the right to extend your probation by up to an additional three months (for a maximum total probation of six months) or to terminate your employment.

During the probation period, either party may terminate the employment relationship by providing 15 days' written notice. The company also reserves the right to terminate employment during probation without notice or compensation if there is evidence of misconduct, dishonesty, negligence, or any other serious breach of company policy.

Upon successful completion of probation, you will receive a confirmation letter from HR specifying your confirmed status, revised terms (if any), and the effective date of confirmation. Benefits such as group health insurance will become available after confirmation.`,
  },
  {
    key: 'compensation',
    title: '5. Compensation & Benefits',
    icon: DollarSign,
    content: `Your salary at Branding Pioneers is as specified in your offer letter and is subject to applicable statutory deductions. Salaries are processed monthly and credited to your registered bank account by the 7th of each month for the preceding month's work. In the event the 7th falls on a bank holiday, the salary will be credited on the next working day.

Tax Deducted at Source (TDS) will be deducted from your salary as per the applicable provisions of the Income Tax Act. It is your responsibility to provide accurate tax-saving investment declarations and proofs to the HR and finance team within the prescribed timelines. Failure to submit investment proofs may result in higher TDS deductions.

Advance salary requests are not entertained under any circumstances. In case of financial hardship, employees may discuss options with HR on a confidential basis, but the company is under no obligation to provide advances or loans.

Provident Fund (PF) contributions will be deducted and deposited as per the applicable provisions of the Employees' Provident Funds and Miscellaneous Provisions Act, 1952, for eligible employees. The company will make matching employer contributions as required by law.

Group health insurance coverage will be provided to all confirmed employees (post-probation). The insurance covers hospitalization expenses as per the terms of the group policy. Details of coverage, exclusions, and the claims process will be shared with you upon confirmation. Pre-existing conditions may be subject to a waiting period as defined by the insurance provider.

Performance bonuses may be awarded at the sole discretion of management, based on individual performance, team performance, and overall company performance. Bonuses are not guaranteed and do not form part of the fixed compensation structure. The company reserves the right to modify the bonus structure at any time.`,
  },
  {
    key: 'performanceManagement',
    title: '6. Performance Management',
    icon: TrendingUp,
    content: `Branding Pioneers is committed to fostering a high-performance culture where every team member has the opportunity to grow, improve, and excel. Our performance management framework is designed to provide regular feedback, set clear expectations, and recognize outstanding contributions.

Monthly self-assessments are required from all employees. At the end of each month, you are expected to submit a brief self-assessment through the HR portal covering your key accomplishments, challenges faced, areas where you need support, and goals for the upcoming month. These self-assessments form an important input for your quarterly and annual reviews.

Quarterly performance reviews will be conducted by your direct manager at the end of each quarter. These reviews will evaluate your performance against the Key Performance Indicators (KPIs) specific to your department and role. KPIs are established at the beginning of each quarter in consultation with your manager and may include metrics such as project delivery timelines, client satisfaction scores, campaign performance, content output, lead generation targets, or other relevant measures.

The annual appraisal cycle takes place in March of each year. This comprehensive review considers your performance across all four quarters, your professional development, your contribution to team goals, and your alignment with company values. The annual appraisal determines salary revisions, promotions, role changes, and annual bonus eligibility.

If an employee's performance is found to be consistently below expectations, they will be placed on a Performance Improvement Plan (PIP). A PIP is a structured improvement program lasting 30 to 60 days, during which the employee is given specific, measurable targets to achieve with additional support and mentoring. Failure to meet PIP targets may result in reassignment, demotion, or termination of employment. The PIP process is documented, and the employee has the right to respond to the assessment in writing.`,
  },
  {
    key: 'confidentiality',
    title: '7. Client Confidentiality Agreement',
    icon: Lock,
    content: `As a healthcare digital marketing agency, Branding Pioneers handles extremely sensitive and confidential information belonging to our clients. This Client Confidentiality Agreement is one of the most critical policies governing your employment, and any breach will be treated with the utmost seriousness.

All client data is strictly confidential. This includes, but is not limited to, campaign strategies, marketing budgets, advertising spend details, performance analytics, website credentials, social media account access, patient data and demographics, business plans, revenue figures, pricing structures, proprietary methodologies, and any other information that is not publicly available.

You must not share, discuss, or disclose any client information with anyone outside Branding Pioneers — including friends, family members, industry contacts, former colleagues, or competing agencies. Client information must not be discussed in public spaces, on public transport, or in any setting where it could be overheard by unauthorized persons.

All client work must be performed using company-approved tools, platforms, and systems only. You must not store client data on personal devices, personal cloud storage, personal email accounts, or any unauthorized platform. File sharing must be done exclusively through approved company channels.

Any suspected or actual data breach must be reported immediately to your manager and the IT team. Even accidental exposure of client data — such as sending an email to the wrong recipient — must be reported within one hour of discovery.

A breach of client confidentiality is grounds for immediate termination without notice and may result in legal action for damages. This confidentiality obligation survives the termination of your employment for a period of two years. Even after leaving Branding Pioneers, you are bound by this agreement and may not use or disclose any confidential client information acquired during your employment.`,
  },
  {
    key: 'socialMedia',
    title: '8. Social Media & Online Conduct',
    icon: Globe,
    content: `As a team member of a digital marketing agency, your online presence and social media activity carry significant weight. This policy governs your use of social media in relation to your employment at Branding Pioneers and our commitment to protecting client interests and company reputation.

You may share that you work at Branding Pioneers and post general updates about your professional role. However, you must not post, share, or reference any client work — including campaign creatives, performance results, strategies, or client names — without obtaining prior written approval from your manager and the client management team.

Posting screenshots, recordings, or descriptions of internal tools, dashboards, project management systems, Slack or Teams conversations, internal emails, meeting notes, or any other internal communication is strictly prohibited. This includes blurring or partially obscuring such content — it must not be shared in any form.

You must not share or discuss company revenue, client pricing, profit margins, business strategy, internal restructuring, upcoming deals, or any other commercially sensitive information on social media or any online platform.

Personal social media use during working hours should be limited to breaks. Excessive personal browsing during work time will be addressed through the standard performance management process. You must not use your work email address to register for personal social media accounts.

If you identify yourself as an employee of Branding Pioneers on any social media profile, you must include a disclaimer stating that views expressed are your own and do not represent the company's official position. You must not engage in online arguments, controversial discussions, or defamatory commentary that could reflect poorly on Branding Pioneers or its clients.

The company reserves the right to monitor work devices and may request the removal of any social media content that violates this policy.`,
  },
  {
    key: 'dataProtection',
    title: '9. Data Protection & Privacy',
    icon: Database,
    content: `Branding Pioneers is committed to protecting the privacy and security of all data entrusted to us, including client data, patient data, employee data, and business data. Given our work in healthcare digital marketing, we handle data that may be subject to stringent privacy regulations, and all employees are required to handle such data with the highest level of care and responsibility.

All client and patient data must be handled in compliance with applicable data protection laws and regulations. Even where specific regulations may not explicitly apply, Branding Pioneers adopts a best-practices approach to data handling that prioritizes privacy and security at every level.

You must never store client or patient data on personal devices, personal cloud storage services, personal email accounts, or any system not explicitly authorized by the company's IT team. All data must be processed, stored, and transmitted using encrypted, company-approved tools and platforms only.

In the event of a data breach — whether confirmed or suspected — you must report it immediately to your manager and the IT team within one hour of discovery. This includes accidental data exposure, unauthorized access, loss of devices containing company data, phishing attempts, and any other security incidents. Delayed reporting of a breach is itself a policy violation.

All employees must maintain strong passwords for all work accounts and systems. Passwords must be at least 12 characters in length, include a combination of uppercase letters, lowercase letters, numbers, and special characters, and must be changed every 90 days. Passwords must never be shared with anyone, including colleagues or supervisors.

Two-factor authentication (2FA) is mandatory for all company accounts, client dashboards, and any system that supports it. Employees must configure 2FA within their first week of joining and must not disable it under any circumstances. If you suspect that your credentials have been compromised, change your passwords immediately and report the incident to IT.`,
  },
  {
    key: 'intellectualProperty',
    title: '10. Intellectual Property',
    icon: Lightbulb,
    content: `All intellectual property created during the course of your employment at Branding Pioneers belongs exclusively to the company. This policy establishes clear ownership rights over all work product and creative output generated by employees.

Work product includes, but is not limited to, all designs, graphics, illustrations, videos, animations, written content, blog posts, social media content, advertising copy, website code, software code, scripts, automation workflows, marketing strategies, campaign plans, SEO strategies, keyword research, process documentation, training materials, standard operating procedures, client reports, templates, frameworks, and any other material created as part of your job responsibilities.

This ownership extends to work created outside of regular office hours if company resources (including laptops, software licenses, tools, or proprietary knowledge) were used in the creation of such work. If you create work that may be related to your employment responsibilities outside of work hours, you must disclose this to your manager to determine ownership.

You do not have the right to use, reproduce, share, or include any work created for Branding Pioneers or its clients in your personal portfolio, blog, social media, or any external platform without obtaining prior written approval from management. Requests for portfolio usage will be evaluated on a case-by-case basis and may be subject to client approval.

Upon termination of employment, you must return all company property and materials and must not retain copies of any work product, client data, proprietary processes, or intellectual property in any form — digital or physical.

Any pre-existing intellectual property that you bring to your role must be disclosed at the time of joining. The company acknowledges your ownership of pre-existing work, provided it is properly documented. Any modifications or enhancements to pre-existing work made during your employment become the property of Branding Pioneers.`,
  },
  {
    key: 'antiHarassment',
    title: '11. Anti-Harassment & POSH Policy',
    icon: Heart,
    content: `Branding Pioneers maintains a zero-tolerance policy against sexual harassment, bullying, intimidation, and discrimination of any kind. We are committed to providing a safe, respectful, and inclusive workplace for all employees, contractors, interns, and visitors.

Harassment includes any unwelcome conduct — whether physical, verbal, visual, or online — that creates an intimidating, hostile, or offensive work environment. This includes, but is not limited to, unwelcome physical contact or advances, sexually suggestive comments or jokes, offensive remarks about a person's gender, race, religion, caste, disability, sexual orientation, or any other protected characteristic, threats or intimidation, stalking, displaying offensive images or materials, and sending inappropriate messages through any communication channel.

This policy applies to all workplace interactions, including those occurring in the office, during work-related travel, at company events and gatherings, on company communication platforms, and in any virtual or online interaction related to work.

Branding Pioneers has constituted an Internal Complaints Committee (ICC) as mandated by the Prevention of Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act). The ICC is responsible for receiving and investigating complaints of sexual harassment, conducting fair and impartial inquiries, recommending appropriate action, and ensuring compliance with the POSH Act.

All employees must complete mandatory anti-harassment and POSH awareness training within 30 days of joining. Refresher training sessions are conducted annually.

If you experience or witness any form of harassment, you are strongly encouraged to report it immediately. Reports can be made to your manager, to any ICC member, to HR, or through the anonymous reporting system. All complaints will be investigated promptly, thoroughly, and confidentially. Retaliation against any person who files a complaint or participates in an investigation is strictly prohibited and will result in severe disciplinary action, up to and including termination.`,
  },
  {
    key: 'itSecurity',
    title: '12. IT & Security Policy',
    icon: Laptop,
    content: `The IT and security infrastructure at Branding Pioneers is critical to our operations and to the protection of client data. All employees must adhere to this policy to maintain the security and integrity of our systems and data.

You must use only company-approved software, tools, and applications on work devices. Installing unauthorized software, including pirated or unlicensed software, is strictly prohibited and may result in immediate termination. If you require software that is not currently available, submit a request through the IT team for evaluation and approval.

Strong passwords are mandatory for all work accounts. Refer to the Data Protection and Privacy policy for specific password requirements. Never share your login credentials with anyone, including colleagues, managers, or IT support staff. IT will never ask for your password.

Always lock your screen when stepping away from your workstation, even briefly. Use the keyboard shortcut (Windows: Win+L, Mac: Ctrl+Cmd+Q) to lock your device. Leaving your workstation unlocked and unattended is a security violation.

The use of personal USB drives, external hard drives, or other removable storage media on company devices is prohibited without prior approval from the IT team. This measure is in place to prevent malware introduction and unauthorized data transfer.

Report any suspicious emails, phishing attempts, or potential security incidents to the IT team immediately. Do not click on links or download attachments from unknown or suspicious senders. If you accidentally click on a suspicious link, disconnect from the network and inform IT immediately.

The company reserves the right to audit, monitor, and inspect any company-owned device, account, or system at any time without prior notice. This includes email accounts, chat logs, browsing history, and file storage.

When working remotely, you must use the company-provided VPN for all work-related activities. Public Wi-Fi networks must not be used for accessing company systems or client data without an active VPN connection.`,
  },
  {
    key: 'communicationStandards',
    title: '13. Communication Standards',
    icon: MessageSquare,
    content: `Effective and professional communication is essential to the success of our operations and client relationships at Branding Pioneers. All employees must maintain high standards of communication across all channels — email, chat, phone, video, and in-person interactions.

All written communication, including emails, Slack messages, project management tool comments, and client correspondence, must be professional in tone, clear in content, and free from grammatical errors. Use proper salutations, structured formatting, and professional sign-offs in all emails. Avoid using excessive abbreviations, slang, or informal language in professional communications.

Response time expectations are as follows: during working hours (10:00 AM to 7:00 PM, Monday through Saturday), all internal messages and emails must be responded to within four hours. Client-facing communications should be responded to within two hours during working hours, or as specified in the client's service level agreement.

WhatsApp and personal messaging platforms should be used for work communication only in urgent situations when other channels are not accessible. Routine work discussions must take place on company-approved platforms such as Slack, email, or the project management system.

You must not engage in personal discussions, share personal content, or conduct non-work conversations on client communication groups or channels. Client groups are strictly for professional, project-related communication.

For issues or concerns that require escalation, follow the established escalation matrix: first contact your direct supervisor or team lead, then the department head, then HR, and finally senior management. Document all escalations in writing for proper tracking and resolution.

Meeting etiquette requires punctuality, preparation, and active participation. Keep meetings focused and time-bound. Share meeting agendas in advance and distribute minutes or action items within 24 hours of the meeting. Video must be turned on for all virtual meetings unless there is a specific technical constraint.`,
  },
  {
    key: 'expenseReimbursement',
    title: '14. Expense & Reimbursement Policy',
    icon: Receipt,
    content: `Branding Pioneers will reimburse reasonable and approved business expenses incurred by employees in the course of their official duties. This policy outlines the procedures for expense approval, documentation, and reimbursement.

All business expenses require pre-approval from your manager before they are incurred. Expenses incurred without prior approval may not be reimbursed. For expenses exceeding INR 5,000, approval from the department head or senior management is required in addition to your manager's approval.

Expense claims must be submitted through the HR portal within seven working days of incurring the expense. Each claim must be accompanied by original receipts, invoices, or bills. Claims submitted without proper documentation or after the seven-day window may be rejected.

Travel policy: For work-related travel, employees are entitled to economy class airfare or AC rail travel. Hotel accommodations are limited to 3-star or equivalent hotels, with rates approved in advance by management. Local transportation should be via company-approved cab services. Personal vehicle usage for work travel will be reimbursed at the prevailing company rate per kilometer.

Meal allowances during client meetings or work-related travel will be reimbursed at actual cost, subject to reasonable limits as determined by management. Team meals or client entertainment expenses require prior approval from the department head.

Personal expenses must never be charged to company accounts, corporate credit cards, or claimed as business expenses. Submitting fraudulent or inflated expense claims is considered gross misconduct and will result in immediate termination and potential legal action.

Reimbursement processing typically takes 15 to 20 working days from the date of submission and approval. Reimbursements will be credited to your salary account along with the next salary cycle or as a separate transfer, depending on the processing timeline.`,
  },
  {
    key: 'grievanceRedressal',
    title: '15. Grievance Redressal',
    icon: HelpCircle,
    content: `Branding Pioneers is committed to providing a fair and transparent mechanism for employees to raise concerns, complaints, or grievances related to their employment. We believe that every employee has the right to be heard and that grievances should be resolved promptly and impartially.

The grievance redressal process follows a structured three-step approach. Step 1: Direct Supervisor. In the first instance, you should raise your concern with your direct supervisor or team lead. Many issues can be resolved through open and honest conversation at this level. Your supervisor is expected to acknowledge your concern within two working days and work toward a resolution within seven working days.

Step 2: HR Department. If the matter is not resolved satisfactorily at the supervisor level, or if the grievance involves your supervisor, you may escalate the matter to the HR department. Submit a written description of your concern, including any relevant facts, dates, and documentation. HR will acknowledge receipt within two working days and conduct a thorough review, which may include interviews with relevant parties.

Step 3: Management Committee. If the issue remains unresolved after HR intervention, you may escalate the matter to the Management Committee. This committee, comprising senior leadership, will review the case and make a final determination. The decision of the Management Committee is binding.

An anonymous reporting option is available for employees who wish to raise concerns without identifying themselves. Anonymous reports can be submitted through the designated reporting form accessible via the HR portal. While anonymous reports will be investigated, please note that the ability to follow up and take action may be limited without the identity of the reporter.

All grievances are expected to be resolved within 15 working days of being formally raised, though complex matters may require additional time. The employee will be kept informed of progress throughout the process.

Retaliation against any employee for raising a legitimate grievance is strictly prohibited. Any employee found to be retaliating against a colleague for filing a grievance will face disciplinary action up to and including termination.`,
  },
  {
    key: 'disciplinaryPolicy',
    title: '16. Disciplinary Policy',
    icon: AlertTriangle,
    content: `Branding Pioneers follows a progressive disciplinary approach designed to correct behavior and performance issues while maintaining fairness and consistency. This policy applies to all employees and outlines the consequences of policy violations and misconduct.

The standard disciplinary process follows a progressive approach. First offense: Verbal Warning. A verbal warning is issued by the employee's direct supervisor and documented in the employee's file. The supervisor will clearly explain the issue, the expected improvement, and the timeline for improvement. Second offense: Written Warning. If the behavior or issue persists, a formal written warning will be issued by HR in consultation with the supervisor. The written warning will detail the violation, the previous verbal warning, the required corrective action, and the consequences of continued non-compliance. Third offense: Final Warning. A final written warning is issued, clearly stating that any further violation will result in termination of employment. The employee may also face additional consequences such as suspension without pay, demotion, or reassignment. Fourth offense: Termination. If the employee fails to correct the behavior after a final warning, their employment will be terminated.

Certain acts constitute gross misconduct and will result in immediate termination without following the progressive disciplinary process. Gross misconduct includes theft or misappropriation of company property or funds, fraud, dishonesty, or falsification of records, physical violence or threats of violence, serious data breach or deliberate disclosure of confidential information, substance abuse on company premises, sexual harassment or serious harassment of any kind, and any criminal activity on company premises.

Before any disciplinary action beyond a verbal warning, the employee will be issued a show-cause notice and given a reasonable opportunity to respond in writing. The employee may request to be accompanied by a colleague during disciplinary meetings. All disciplinary actions are documented and maintained in the employee's personnel file.`,
  },
  {
    key: 'separationExit',
    title: '17. Separation & Exit Policy',
    icon: LogOut,
    content: `This policy governs the process for separation of employment at Branding Pioneers, whether initiated by the employee or the company. A smooth and professional exit process is important for both parties and is a reflection of our organizational values.

Employees wishing to resign must submit their resignation in writing to their manager and HR. The notice period is as specified in your offer letter and bond agreement. During the notice period, you are expected to continue performing your duties to the best of your ability, complete all pending assignments, and cooperate fully with the knowledge transfer process.

An exit interview is mandatory for all departing employees. The exit interview is conducted by HR and provides an opportunity for you to share feedback about your experience, work environment, and suggestions for improvement. The information shared during exit interviews is treated as confidential and used for organizational improvement.

Knowledge transfer documentation is a critical part of the exit process. You must prepare comprehensive documentation of your current responsibilities, ongoing projects, client relationships, processes, login credentials (which will be transferred and changed), and any other information necessary for a smooth transition. This documentation must be reviewed and approved by your manager before your last working day.

Clearance from all departments — including IT, finance, admin, and HR — is required before your last working day. This includes returning all company property such as laptops, ID cards, access cards, mobile phones, and any other equipment or materials. Any outstanding advances, loans, or financial obligations to the company will be recovered from the full and final settlement.

The full and final settlement, including any outstanding salary, leave balance adjustments, and other dues, will be processed and credited within 45 working days from the last working day, subject to clearance from all departments.

An experience letter and relieving letter will be issued after the completion of clearance and settlement. The non-disparagement clause continues to apply after separation — you must not make derogatory or defamatory statements about Branding Pioneers, its employees, or its clients.`,
  },
  {
    key: 'remoteWork',
    title: '18. Remote Work & WFH Policy',
    icon: Wifi,
    content: `While Branding Pioneers primarily operates from its office at 750, Udyog Vihar, Third Floor, Gurgaon, Haryana, Work From Home (WFH) arrangements may be permitted under specific circumstances. This policy establishes guidelines for remote work to ensure productivity, accountability, and security are maintained.

WFH is available only with prior approval from your direct manager. Requests must be submitted at least one day in advance, except in genuine emergencies such as illness, family emergencies, or circumstances beyond your control. WFH is not an entitlement and is granted at management's discretion based on your role, current workload, team requirements, and your track record of productivity and reliability.

When working from home, you must be available and responsive during standard working hours (10:00 AM to 7:00 PM). This means being reachable on Slack, email, phone, and any other company communication channels. Response times should be consistent with in-office standards as outlined in the Communication Standards policy.

Video must be turned on for all meetings during WFH days. This is non-negotiable and applies to both internal team meetings and client calls. Ensure that your background is professional and free from distractions. Use headphones to maintain audio quality and privacy.

You are responsible for ensuring a secure and stable internet connection while working from home. Your home network must be password-protected with WPA2 or higher encryption. Company VPN must be active at all times when accessing company systems or client data. Public Wi-Fi networks must never be used for work purposes.

Regular check-ins with your manager are mandatory on WFH days. These may include morning stand-ups, mid-day updates, and end-of-day summaries as determined by your manager. Failure to check in or remain available during work hours while on WFH will be treated as an unauthorized absence.

The company reserves the right to revoke WFH privileges at any time if it determines that productivity, quality of work, or team collaboration is being adversely affected. Frequent or habitual WFH requests may be reviewed and may impact performance assessments.`,
  },
  {
    key: 'healthSafety',
    title: '19. Health & Safety',
    icon: Activity,
    content: `Branding Pioneers is committed to providing a safe and healthy work environment for all employees. This policy outlines our commitment to workplace safety and the responsibilities of both the company and its employees in maintaining a safe workplace.

Ergonomic workspace guidelines are provided to all employees. Your workstation should be set up to promote good posture and minimize strain. This includes positioning your monitor at eye level, using a chair with proper lumbar support, keeping your keyboard and mouse at a comfortable height, and taking regular breaks to stretch and move. If you experience any discomfort or pain related to your workstation setup, report it to the admin team for an ergonomic assessment.

A first-aid kit is available on the office premises and is maintained and restocked regularly. The location of the first-aid kit is clearly marked. Designated first-aid trained personnel are available during office hours. In case of a medical emergency, contact the admin team immediately and call emergency services if necessary.

Fire safety is a critical aspect of our workplace safety program. All employees must familiarize themselves with the location of fire exits, fire extinguishers, and the assembly point. Fire drills are conducted periodically, and participation is mandatory. Do not obstruct fire exits, corridors, or emergency equipment at any time. Report any fire hazards, including exposed wiring, overloaded power outlets, or malfunctioning equipment, immediately.

Branding Pioneers recognizes the importance of mental health and well-being. If you are experiencing stress, anxiety, burnout, or any mental health challenges, we encourage you to reach out to HR for support. The company may provide access to counseling services and is committed to creating an environment where discussing mental health is free from stigma.

Smoking, including the use of e-cigarettes and vaping devices, is strictly prohibited inside the office premises. Designated smoking areas, if provided, must be used. Smoking near office entrances or in common areas is not permitted.

All employees have a responsibility to report workplace hazards, unsafe conditions, or potential risks immediately to the admin or HR team. This includes wet floors, broken furniture, faulty equipment, poor lighting, or any other condition that could cause injury.`,
  },
  {
    key: 'codeOfConduct',
    title: '20. Whistleblower Protection Policy',
    icon: Eye,
    content: `Branding Pioneers is committed to maintaining the highest standards of ethical conduct and transparency in all its business operations. The Whistleblower Protection Policy provides a safe and confidential mechanism for employees to report suspected unethical conduct, violations of law, fraud, corruption, or any other wrongdoing without fear of retaliation.

This policy covers the reporting of financial irregularities, fraud, or misappropriation of funds, violations of company policies or applicable laws, corruption, bribery, or conflicts of interest, data breaches or misuse of confidential information, harassment or discrimination that has not been addressed through normal channels, safety violations that pose a risk to employees or others, and any other conduct that is illegal, unethical, or contrary to the company's stated values and policies.

Multiple reporting channels are available to ensure accessibility. You may report concerns through a dedicated email address monitored by senior management, an anonymous reporting form accessible through the HR portal, a direct report to any member of senior management, or a written letter submitted in a sealed envelope to the HR department marked as confidential. When filing a report, provide as much detail as possible, including dates, times, locations, individuals involved, and any supporting evidence or documentation.

Protection from retaliation is guaranteed. No employee who reports a concern in good faith will be subject to any form of retaliation, including termination, demotion, suspension, harassment, discrimination, or any other adverse employment action. Retaliation against a whistleblower is itself considered gross misconduct and will be dealt with severely, up to and including termination of the retaliating party.

All reports will be investigated promptly, thoroughly, and impartially. Investigations will typically be initiated within five working days of receiving the report and completed within 30 working days. Complex matters may require additional time, and the reporter will be kept informed of progress where possible.

Confidentiality will be maintained throughout the investigation and any subsequent proceedings. The identity of the whistleblower will be protected to the maximum extent possible, consistent with the need to conduct a thorough investigation. Only individuals directly involved in the investigation will have access to the report and related information.`,
  },
]

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
