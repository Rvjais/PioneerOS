/**
 * Help Content for Pioneer OS
 *
 * Simple explanations for every module
 * Written for easy understanding by all team members
 */

export const HelpContent = {
  // ============ ACCOUNTS MODULE ============
  accounts: {
    dashboard: {
      title: 'How to use Accounts Dashboard',
      steps: [
        'This is your home base - see all pending payments and what needs attention today',
        'Check "Due Today" section first thing in the morning',
        'Click on any client name to see their full details',
        'Use quick actions to record payments or send reminders'
      ],
      tips: [
        'Red means overdue - handle these first!',
        'Green means paid - all good here',
        'Yellow means pending - follow up soon'
      ]
    },

    payments: {
      title: 'How to Record Payments',
      steps: [
        'Click "Add Payment" button',
        'Select the client who paid',
        'Enter the amount they paid (gross amount)',
        'TDS will be calculated automatically (usually 10%)',
        'Add transaction reference (UTR number) if you have it',
        'Click Save - Done!'
      ],
      tips: [
        'Always add UTR/reference number for easy tracking',
        'System warns you if payment looks like a duplicate',
        'Check the invoice number matches if client mentioned it'
      ]
    },

    ledger: {
      title: 'How to use Payment Ledger',
      steps: [
        'This shows ALL payments received',
        'Use filters to find specific payments',
        'Click on any row to see full details',
        'Export to Excel for reports'
      ],
      tips: [
        'Filter by month to see monthly collection',
        'Gross = what client paid, Net = what we received after TDS'
      ]
    },

    bankStatements: {
      title: 'How to Import Bank Statements',
      steps: [
        'Click "Upload Statement" and fill bank details',
        'Open your bank statement PDF or online banking',
        'Select and COPY the transaction table (Ctrl+C)',
        'Click "Process" on the uploaded statement',
        'PASTE the copied text (Ctrl+V) and click Process',
        'System will auto-match payments with clients!'
      ],
      tips: [
        'Copy the full transaction table, including dates',
        'Works with any bank - HDFC, ICICI, SBI, Axis, etc.',
        'Green = auto-matched, Yellow = needs your review'
      ]
    },

    autoInvoice: {
      title: 'How Auto-Invoice Works',
      steps: [
        'Set up which day of month to generate invoice',
        'Set up which day to send it to client',
        'Choose if you want WhatsApp, Email, or both',
        'System will automatically create and send invoices!'
      ],
      tips: [
        'Invoice is created a few days before sending',
        'You can always send manually if auto fails',
        'Disable for clients who asked to pause'
      ]
    },

    paymentTracker: {
      title: 'How to Track Payment Follow-ups',
      steps: [
        'Each row is a client, columns are days of the month',
        'Click on any cell to mark follow-up status',
        'Green = Done, Red = Pending, Yellow = Will Pay Soon',
        'Add notes when you call - helps next time!'
      ],
      tips: [
        'Start from left (day 1) and work right',
        'Mark "Call Not Picked" if no answer',
        'Mark "Payment Received" when money comes in'
      ]
    },

    reconciliation: {
      title: 'How to Reconcile Payments',
      steps: [
        'This matches your recorded payments with bank transactions',
        'Green = Perfect match, amounts are same',
        'Yellow = Close match, small difference',
        'Red = Mismatch, needs your attention'
      ],
      tips: [
        'Run reconciliation end of every week',
        'Fix mismatches before month-end',
        'Ask accounts lead if something looks wrong'
      ]
    },

    roi: {
      title: 'Understanding ROI Dashboard',
      steps: [
        'ROI = Return on Investment = Are we profitable?',
        'Each department shows money earned vs money spent',
        'Green percentage = Making profit',
        'Red percentage = Losing money (need to fix!)'
      ],
      tips: [
        'Higher ROI is better',
        'Check why expenses are high if ROI is low',
        'Revenue comes from client payments'
      ]
    },

    clientOnboarding: {
      title: 'How to Onboard New Clients',
      steps: [
        'New client shows up in "Pending" status',
        'Upload their contract/SLA document',
        'Mark SLA as signed when they sign',
        'Confirm when they make first payment',
        'Client becomes ACTIVE - all done!'
      ],
      tips: [
        'Follow the checklist - dont skip steps',
        'Call client if stuck at any step',
        'Inform manager if client delays payment'
      ]
    },

    contracts: {
      title: 'Managing Client Contracts',
      steps: [
        'Upload contract PDF for each client',
        'Mark when contract is signed',
        'Track contract expiry dates',
        'Renew before expiry!'
      ],
      tips: [
        'Set reminder 1 month before expiry',
        'Keep all contracts organized here',
        'Download anytime for reference'
      ]
    }
  },

  // ============ HR MODULE ============
  hr: {
    dashboard: {
      title: 'HR Dashboard Overview',
      steps: [
        'See all employee stats at a glance',
        'Check attendance summary for today',
        'View pending approvals (leaves, requests)',
        'Quick access to common HR tasks',
        'See upcoming interviews and anniversaries',
        'Track escalations that need attention'
      ],
      tips: [
        'Check dashboard every morning',
        'Handle pending requests same day if possible',
        'Red alerts mean urgent action needed'
      ]
    },

    attendance: {
      title: 'Managing Attendance',
      steps: [
        'View daily attendance of all employees',
        'Mark attendance manually if needed',
        'Check late arrivals and early exits',
        'Export attendance report for payroll'
      ],
      tips: [
        'Sync with biometric data regularly',
        'Contact employee if absent without notice'
      ]
    },

    leaves: {
      title: 'Leave Management',
      steps: [
        'See all pending leave requests',
        'Click to view details and reason',
        'Approve or Reject with comments',
        'Check leave balance before approving'
      ],
      tips: [
        'Check team calendar for conflicts',
        'Dont leave requests pending too long'
      ]
    },

    employees: {
      title: 'Team Directory',
      steps: [
        'Search for any team member by name',
        'Click to see their full profile',
        'Update details when they change',
        'Add new team members here'
      ],
      tips: [
        'Keep phone numbers updated',
        'Add emergency contact for everyone'
      ]
    },

    candidates: {
      title: 'Candidate Pipeline Management',
      steps: [
        'New candidates show as "NEW" - review and move forward',
        'Track where each candidate came from (Naukri, LinkedIn, Referral)',
        'Assign manager for each candidate for accountability',
        'Move through stages: SCREENING → PHONE_SCREEN → INTERVIEW → OFFER → HIRED'
      ],
      tips: [
        'Respond to new candidates within 48 hours',
        'Track referrals - they usually convert better',
        'Add notes after every interaction'
      ]
    },

    interviews: {
      title: 'Interview Scheduling & Feedback',
      steps: [
        'Schedule interviews with date, time, and interviewer',
        'Three stages: Phone Screen → Manager Interview → Founder Interview',
        'Each interviewer submits feedback and rating',
        'Move candidate forward based on feedback'
      ],
      tips: [
        'Schedule phone screens within 3 days of application',
        'Send calendar invite to both candidate and interviewer',
        'Collect feedback same day as interview',
        'Rating 4-5 = Strong Yes, 3 = Maybe, 1-2 = No'
      ]
    },

    offers: {
      title: 'Offer Letter Management',
      steps: [
        'Create offer after successful founder interview',
        'Enter position, salary, joining date',
        'Send for founder approval',
        'Once approved, send to candidate',
        'Track acceptance/rejection'
      ],
      tips: [
        'Double-check salary before sending for approval',
        'Follow up if no response in 3 days',
        'Keep offer letters confidential'
      ]
    },

    day0Tasks: {
      title: 'Day 0 Onboarding Checklist',
      steps: [
        'When new employee joins, Day 0 tasks are created automatically',
        'Tasks are assigned to HR, IT Admin, Manager, and Buddy',
        'Each person completes their assigned tasks',
        'Track progress - 100% means onboarding complete!'
      ],
      tips: [
        'Complete HR documentation first (ID proof, bank details)',
        'IT setup should be ready before employee arrives',
        'Buddy should do office tour on first day',
        'Manager assigns first task by end of Day 0'
      ]
    },

    escalations: {
      title: 'Employee Escalations',
      steps: [
        'Record when a client escalates about an employee',
        'Set severity: LOW, MEDIUM, HIGH, CRITICAL',
        'Assign to manager for follow-up',
        'Document resolution and close when fixed'
      ],
      tips: [
        'Critical escalations need same-day response',
        'Talk to employee before drawing conclusions',
        'Multiple escalations = performance review needed'
      ]
    },

    appreciations: {
      title: 'Employee Appreciations',
      steps: [
        'Record when client appreciates an employee',
        'Add what they did well',
        'Can be shared company-wide or kept private',
        'Use for performance reviews and recognition'
      ],
      tips: [
        'Share appreciations in team meetings',
        'Use for Employee of the Month selection',
        'Appreciations boost morale - celebrate them!'
      ]
    },

    managerReviews: {
      title: 'Manager Behavior Reviews',
      steps: [
        'HR conducts quarterly reviews of all managers',
        'Rate on: communication, fairness, support, growth',
        'Collect feedback from team members',
        'Share results and improvement plan with manager'
      ],
      tips: [
        'Reviews are confidential - build trust',
        'Focus on behavior, not personality',
        'Track improvement over quarters'
      ]
    },

    employerBranding: {
      title: 'Employer Branding Content',
      steps: [
        'Plan content for LinkedIn, Instagram, Glassdoor',
        'Add ideas to the Ideas Bank for later',
        'Schedule content with deadlines',
        'Get founder approval before posting',
        'Mark as posted once live'
      ],
      tips: [
        'Mix content: culture, achievements, team posts',
        'Best days to post: Tuesday-Thursday',
        'Employee stories get most engagement',
        'Respond to comments within 24 hours'
      ]
    },

    engagementActivities: {
      title: 'Employee Engagement Activities',
      steps: [
        'Plan activities: team outings, celebrations, workshops',
        'Set budget and get approval',
        'Schedule date and responsible person',
        'Collect feedback after activity',
        'Track participation rates'
      ],
      tips: [
        'Mix online and offline activities',
        'Birthday celebrations build connection',
        'Workshops help skill development',
        'Monthly activities keep morale high'
      ]
    },

    workAnniversaries: {
      title: 'Work Anniversary Tracking',
      steps: [
        'System auto-tracks everyone\'s work anniversary',
        'Get alerts 7 days before anniversary',
        'Plan celebration (card, cake, gift)',
        'Mark as celebrated when done',
        'Milestone years (1, 3, 5, 10) get special treatment'
      ],
      tips: [
        'Announce anniversaries in team meetings',
        'Personalized message from manager matters',
        'Long tenure deserves bigger recognition',
        'Never miss an anniversary - people remember!'
      ]
    },

    clientFeedback: {
      title: 'Client Feedback on Employees',
      steps: [
        'Request feedback from client after project milestones',
        'Rating 1-5 on quality, communication, timeliness',
        'Add qualitative remarks',
        'Use for performance reviews'
      ],
      tips: [
        'Request feedback quarterly for active projects',
        'Follow up on low ratings immediately',
        'High ratings = appreciation opportunity'
      ]
    }
  },

  // ============ CRM MODULE ============
  crm: {
    leads: {
      title: 'Managing Leads',
      steps: [
        'New lead comes in - add their details',
        'Set follow-up reminders',
        'Update status after each call',
        'When they say YES - Convert to Client!'
      ],
      tips: [
        'Call within 24 hours of new lead',
        'Add notes after every conversation',
        'Move to Lost if they say final NO'
      ]
    },

    pipeline: {
      title: 'Understanding Pipeline',
      steps: [
        'Leads move from left to right as they progress',
        'Drag cards to move them to next stage',
        'NEW → CONTACTED → INTERESTED → PROPOSAL → WON',
        'Track your conversion rate!'
      ],
      tips: [
        'Dont let leads sit too long in one stage',
        'More leads on right = more money coming!'
      ]
    }
  },

  // ============ TASKS MODULE ============
  tasks: {
    daily: {
      title: 'Managing Daily Tasks',
      steps: [
        'Check your tasks for today',
        'Click "Start" when you begin a task',
        'Update progress as you work',
        'Click "Complete" when done!'
      ],
      tips: [
        'Start most important tasks first',
        'Add blockers if something is stopping you',
        'Ask for help if stuck'
      ]
    },

    create: {
      title: 'Creating New Tasks',
      steps: [
        'Click "New Task" button',
        'Add clear title - what needs to be done?',
        'Select the client (if its for a client)',
        'Set due date',
        'Assign to team member'
      ],
      tips: [
        'Be specific in task title',
        'Break big tasks into smaller ones',
        'Set realistic due dates'
      ]
    }
  },

  // ============ CLIENT PORTAL ============
  clientPortal: {
    dashboard: {
      title: 'Client Portal Dashboard',
      steps: [
        'Clients see their project status here',
        'They can view deliverables we shared',
        'Raise support tickets if issues',
        'See their invoices and payments'
      ],
      tips: [
        'Keep deliverables updated weekly',
        'Respond to tickets within 24 hours'
      ]
    }
  },

  // ============ COMMON FEATURES ============
  common: {
    search: {
      title: 'Using Search',
      steps: [
        'Type what you are looking for',
        'Press Enter or click Search',
        'Click on result to open it'
      ],
      tips: [
        'Search by client name, phone, or email',
        'Use filters to narrow results'
      ]
    },

    filters: {
      title: 'Using Filters',
      steps: [
        'Click on filter dropdown',
        'Select your criteria',
        'Results update automatically',
        'Click "Clear" to reset'
      ],
      tips: [
        'Combine multiple filters for precise results',
        'Date filters help find old records'
      ]
    },

    notifications: {
      title: 'Understanding Notifications',
      steps: [
        'Bell icon shows unread notifications',
        'Click to see all notifications',
        'Click on any to go to that item',
        'Mark as read when done'
      ],
      tips: [
        'Check notifications regularly',
        'Dont ignore payment reminders!'
      ]
    },

    export: {
      title: 'Exporting Data',
      steps: [
        'Apply filters first (optional)',
        'Click Export button',
        'Choose format (Excel/PDF)',
        'File downloads to your computer'
      ],
      tips: [
        'Export monthly reports for records',
        'Share Excel with accounts team'
      ]
    }
  },

  // ============ VENDORS MODULE ============
  vendors: {
    list: {
      title: 'Managing Vendors',
      steps: [
        'Add new vendors when we start working with them',
        'Keep their bank details updated',
        'Track their payment status',
        'Mark active/inactive as needed'
      ],
      tips: [
        'Verify bank details before first payment',
        'Keep GST number for billing'
      ]
    }
  },

  // ============ INVOICES MODULE ============
  invoices: {
    create: {
      title: 'Creating Invoices',
      steps: [
        'Click "New Invoice"',
        'Select client',
        'Add items and amounts',
        'Review GST calculation',
        'Save as Draft or Send directly'
      ],
      tips: [
        'Double-check amount before sending',
        'Add payment terms clearly'
      ]
    },

    send: {
      title: 'Sending Invoices',
      steps: [
        'Open the invoice',
        'Click "Send"',
        'Choose WhatsApp, Email, or both',
        'Confirm and send!'
      ],
      tips: [
        'Send on the day mentioned in config',
        'Resend if client says not received'
      ]
    }
  },

  // ============ SALES MODULE ============
  sales: {
    dashboard: {
      title: 'Sales Dashboard Overview',
      steps: [
        'See your pipeline value and deal stages at a glance',
        'Check leads assigned to you and their status',
        'View your daily tasks and follow-ups due today',
        'Track your monthly/quarterly conversion numbers'
      ],
      tips: [
        'Focus on leads in INTERESTED and PROPOSAL stages - they are closest to converting',
        'Update lead status after every call/meeting',
        'Check dashboard first thing every morning'
      ]
    },

    leads: {
      title: 'Managing Your Leads',
      steps: [
        'New leads appear in the "New" column - review within 24 hours',
        'Click on a lead to see full details and add notes',
        'Log every call, email, or meeting as an Activity',
        'Move lead through stages as they progress',
        'Convert to Client when they say YES and sign contract'
      ],
      tips: [
        'First call within 1 hour doubles conversion rate',
        'Always set a follow-up date - never leave a lead without next action',
        'Add budget info after discovery call - helps prioritize',
        'Use "Lost" with reason when a lead says final NO'
      ]
    },

    deals: {
      title: 'Deal Pipeline Management',
      steps: [
        'Each deal represents a potential client engagement with a value',
        'Drag deals between stages: Discovery → Proposal → Negotiation → Won/Lost',
        'Update deal value and probability as negotiations progress',
        'Close the deal when contract is signed'
      ],
      tips: [
        'Keep deal value accurate - affects revenue forecasting',
        'Deals stuck in one stage for 2+ weeks need escalation',
        'Add all decision-makers as contacts on the deal'
      ]
    },

    proposals: {
      title: 'Creating Proposals',
      steps: [
        'Click "New Proposal" and select the lead/client',
        'Choose services to include from the service catalog',
        'Set pricing - can customize per client',
        'Add terms, timeline, and deliverables',
        'Generate PDF and send via WhatsApp or Email'
      ],
      tips: [
        'Use existing templates as starting points',
        'Include case studies relevant to their industry',
        'Send proposal within 24 hours of request'
      ]
    },

    dailyTasks: {
      title: 'Sales Daily Planning',
      steps: [
        'Plan your day before 10 AM',
        'List all calls, meetings, and follow-ups',
        'Mark each task as done when completed',
        'Review unfinished tasks and carry forward'
      ],
      tips: [
        'Start with hot leads (PROPOSAL/NEGOTIATION stage)',
        'Block time for cold outreach in afternoon',
        'Log activity immediately after each call'
      ]
    }
  },

  // ============ MEETINGS MODULE ============
  meetings: {
    hub: {
      title: 'Meetings Hub',
      steps: [
        'See all your upcoming meetings in one place',
        'Click any meeting to see agenda and participants',
        'Join or view meeting details from here',
        'Past meetings show notes and action items'
      ],
      tips: [
        'Check meetings tab every morning for today\'s schedule',
        'Review action items from yesterday\'s meetings'
      ]
    },

    daily: {
      title: 'Daily Huddle (Mandatory)',
      steps: [
        'Fill in what you did YESTERDAY - be specific with deliverables',
        'Plan what you will do TODAY - include client names',
        'Mention any BLOCKERS preventing your work',
        'Submit before 10:30 AM - this is mandatory!'
      ],
      tips: [
        'Late submissions are tracked and affect your discipline score',
        'Be honest about blockers - your manager can help resolve them',
        'Keep entries brief but specific - no generic statements'
      ]
    },

    tactical: {
      title: 'Monthly Tactical Meeting (5th of month)',
      steps: [
        'Review last month\'s KPIs vs targets',
        'Each department presents their numbers',
        'Identify what worked and what didn\'t',
        'Set specific goals for next month with owners'
      ],
      tips: [
        'Prepare your department KPIs before the meeting',
        'Bring solutions, not just problems',
        'Action items must have owners and deadlines'
      ]
    },

    strategic: {
      title: 'Quarterly Strategic Meeting',
      steps: [
        'Review quarterly business performance',
        'Discuss strategic initiatives and progress',
        'Set goals for next quarter',
        'Align departments on priorities'
      ],
      tips: [
        'Think big picture - not daily operations',
        'Come prepared with data and proposals',
        'Focus on what moves the needle most'
      ]
    },

    create: {
      title: 'Scheduling a Meeting',
      steps: [
        'Click "New Meeting" and set the title',
        'Choose meeting type (Internal, Client, One-on-One)',
        'Set date, time, and expected duration',
        'Add participants and share the agenda',
        'Send invite - participants get notified'
      ],
      tips: [
        'Always include an agenda - no agenda, no meeting',
        'Keep meetings under 60 minutes',
        'Send agenda at least 1 day before the meeting'
      ]
    }
  },

  // ============ PERFORMANCE MODULE ============
  performance: {
    dashboard: {
      title: 'Performance Dashboard',
      steps: [
        'See your Growth Score - a 0-100 monthly rating',
        'Check individual component scores (Performance, Accountability, Discipline, Learning, Appreciation)',
        'View your ranking compared to peers',
        'Track your score trend over months'
      ],
      tips: [
        'Growth Score directly impacts your appraisal',
        'Score = Performance (35%) + Accountability (20%) + Discipline (15%) + Learning (15%) + Appreciation (15%)',
        'Escalations and client churn cause deductions'
      ]
    },

    goals: {
      title: 'Goal Setting & Tracking',
      steps: [
        'View your assigned goals for this quarter',
        'Update progress percentage as you make progress',
        'Add comments on what you\'ve achieved',
        'Mark complete when goal is fully achieved'
      ],
      tips: [
        'Review goals weekly - don\'t wait till end of quarter',
        'Break big goals into smaller milestones',
        'Discuss blockers with your manager early'
      ]
    },

    leaderboard: {
      title: 'Performance Leaderboard',
      steps: [
        'See top performers ranked by Growth Score',
        'Filter by department to see your peer ranking',
        'View monthly and quarterly rankings',
        'Click on any name to see their score breakdown'
      ],
      tips: [
        'Top performers get featured in team meetings',
        'Consistent high scores improve appraisal outcomes'
      ]
    },

    appraisals: {
      title: 'Performance Appraisals',
      steps: [
        'Appraisals happen once you complete 12 months',
        'First, complete your Self-Appraisal form',
        'Your manager then does their review',
        'HR finalizes the outcome (increment, promotion, etc.)',
        'You\'ll be notified of the result'
      ],
      tips: [
        'You need 72+ learning hours to be eligible',
        'Reference specific achievements with data/proof',
        'Your 12-month Growth Score average matters a lot',
        'Cannot be on PIP or Probation during appraisal'
      ]
    }
  },

  // ============ LEARNING MODULE ============
  learning: {
    dashboard: {
      title: 'Learning Dashboard',
      steps: [
        'See your total learning hours this year (need 72 for appraisal)',
        'View monthly breakdown of hours logged',
        'Check which entries are verified vs pending',
        'Find learning resources recommended for your role'
      ],
      tips: [
        '72 hours/year = 6 hours/month = 1.5 hours/week',
        'Mix different types: courses, articles, videos, workshops',
        'Manager must verify your entries - include proof links'
      ]
    },

    log: {
      title: 'Logging Learning Hours',
      steps: [
        'Click "Log Learning" button',
        'Enter what you learned (be specific)',
        'Select the type (Course, Article, Video, etc.)',
        'Enter hours spent (minimum 0.5)',
        'Add proof link (certificate, screenshot, URL)',
        'Submit for manager verification'
      ],
      tips: [
        'Log immediately after learning - don\'t batch at month-end',
        'Include source URL or certificate link for quick verification',
        'Learning must be relevant to your role or growth plan'
      ]
    },

    resources: {
      title: 'Learning Resources',
      steps: [
        'Browse curated resources for your department',
        'Filter by topic, difficulty, or format',
        'Bookmark resources you want to complete later',
        'Mark as completed and log your learning hours'
      ],
      tips: [
        'Start with resources marked "Recommended"',
        'Certifications count for extra credit',
        'Share useful resources with your team'
      ]
    }
  },

  // ============ WHATSAPP MODULE ============
  whatsapp: {
    hub: {
      title: 'WhatsApp Hub Overview',
      steps: [
        'See all WhatsApp conversations organized by department',
        'Click on any chat to view messages and reply',
        'Use the search bar to find specific conversations',
        'Pin important chats for quick access'
      ],
      tips: [
        'You only see chats for your department',
        'Managers can see all department chats',
        'Messages are logged automatically - no need to screenshot'
      ]
    },

    send: {
      title: 'Sending WhatsApp Messages',
      steps: [
        'Select a chat or enter a new phone number',
        'Type your message in the composer',
        'Use templates for common messages (invoices, reminders)',
        'Click Send - message is logged automatically'
      ],
      tips: [
        'Use templates for professional, consistent messaging',
        'AI Enhance button improves your message tone',
        'Rate limited to 30 messages/minute to prevent spam'
      ]
    },

    templates: {
      title: 'WhatsApp Templates',
      steps: [
        'Browse existing templates by category',
        'Click "Use Template" to pre-fill a message',
        'Variables like {name}, {amount} are replaced automatically',
        'Create new templates for repeated messages'
      ],
      tips: [
        'Templates ensure consistent professional communication',
        'Test templates with internal numbers first',
        'Get manager approval for new templates'
      ]
    },

    campaigns: {
      title: 'WhatsApp Campaigns',
      steps: [
        'Click "New Campaign" and give it a name',
        'Select a message template',
        'Choose recipients (individual, group, or filtered list)',
        'Review and start the campaign',
        'Track delivery and read status'
      ],
      tips: [
        'Send campaigns during business hours (9 AM - 6 PM)',
        'Keep recipient lists under 200 for best delivery',
        'Check analytics after 24 hours for insights'
      ]
    },

    ai: {
      title: 'AI Features in WhatsApp',
      steps: [
        'Enhance - Improves your message tone (professional/friendly/concise)',
        'Summarize - Creates a summary of long conversations',
        'Suggest Reply - AI suggests what to reply based on context',
        'Sentiment - Analyzes if client is happy, neutral, or unhappy'
      ],
      tips: [
        'Always review AI suggestions before sending',
        'Sentiment analysis helps prioritize unhappy clients',
        'Summarize is great for handoff between team members'
      ]
    }
  },

  // ============ ADMIN MODULE ============
  admin: {
    dashboard: {
      title: 'Admin Panel Overview',
      steps: [
        'Manage all users, roles, and system settings from here',
        'View system health and audit logs',
        'Configure integrations and API credentials',
        'Manage company entities and departments'
      ],
      tips: [
        'Only Super Admins can access this panel',
        'Changes here affect all users immediately',
        'Check audit log regularly for security'
      ]
    },

    users: {
      title: 'User Management',
      steps: [
        'View all users with their roles and status',
        'Click "Add User" to create a new account',
        'Click on any user to edit their details',
        'Deactivate users who leave (don\'t delete - we need records)'
      ],
      tips: [
        'Set role carefully - it determines all access',
        'Use custom roles for special access combinations',
        'Generate magic link for users who can\'t login'
      ]
    },

    customRoles: {
      title: 'Custom Roles',
      steps: [
        'Custom roles combine base roles + departments + permissions',
        'Click "Create Role" to make a new combination',
        'Select which base roles to inherit from',
        'Add departments for cross-department access',
        'Assign to users who need special access'
      ],
      tips: [
        'Freelancers and Interns cannot use custom roles',
        'Test the role by impersonating a user with it',
        'Keep role names descriptive (e.g., "SEO Team Lead")'
      ]
    },

    settings: {
      title: 'System Settings',
      steps: [
        'Configure app-wide settings here',
        'Changes take effect immediately',
        'Some settings require app restart'
      ],
      tips: [
        'Document why you changed a setting',
        'Test in dev environment first if possible'
      ]
    },

    audit: {
      title: 'Audit Log',
      steps: [
        'See all important actions taken in the system',
        'Filter by user, action type, or date range',
        'Track login sessions and impersonation events',
        'Export for compliance reporting'
      ],
      tips: [
        'Review weekly for suspicious activity',
        'Multiple failed logins may indicate unauthorized access',
        'Impersonation sessions are always logged'
      ]
    }
  },

  // ============ CLIENTS MODULE ============
  clients: {
    list: {
      title: 'Client List',
      steps: [
        'See all your clients with their current status and health',
        'Use filters to narrow by tier, lifecycle stage, or department',
        'Click any client name to see full details',
        'Green health = good, Yellow = attention needed, Red = at risk'
      ],
      tips: [
        'Sort by health score to prioritize at-risk clients',
        'Use search to quickly find a specific client',
        'CHURNED clients are hidden by default - use status filter to see them'
      ]
    },

    detail: {
      title: 'Client Detail Page',
      steps: [
        'Overview tab shows key info, health score, and recent activity',
        'Team tab shows who is assigned to this client',
        'Deliverables tab tracks monthly outputs',
        'Billing tab shows invoices and payment history',
        'Documents tab has contracts and shared files'
      ],
      tips: [
        'Update deliverable status weekly',
        'Check health score regularly - it auto-updates daily',
        'Add notes about important conversations'
      ]
    },

    onboarding: {
      title: 'Client Onboarding Process',
      steps: [
        'Step 1: Client confirms their business details',
        'Step 2: Select services and set scope',
        'Step 3: Generate and sign SLA document',
        'Step 4: Create proforma invoice and collect advance',
        'Step 5: Set up platform access (Google, Meta, etc.)',
        'Step 6: Assign team members',
        'Step 7: Activate client - they\'re now LIVE!'
      ],
      tips: [
        'Follow the checklist in order - some steps depend on previous ones',
        'Don\'t activate until SLA is signed and first payment received',
        'Send the onboarding link to client for them to fill details'
      ]
    },

    import: {
      title: 'Bulk Client Import',
      steps: [
        'Download the template CSV from the Templates section',
        'Fill in client data following the column headers exactly',
        'Upload the completed file',
        'Review the preview - fix any errors shown',
        'Confirm import - clients will be created in PROSPECT status'
      ],
      tips: [
        'Required columns: name, email, phone',
        'Use the exact format shown in template headers',
        'Import in batches of 50 or less for best results'
      ]
    }
  },

  // ============ PROFILE MODULE ============
  profile: {
    overview: {
      title: 'Your Profile',
      steps: [
        'Keep your profile picture and bio updated',
        'Verify your personal details are correct',
        'Check your role and department assignment',
        'View your attendance and leave summary'
      ],
      tips: [
        'Profile completion is tracked - aim for 100%',
        'Update emergency contact whenever it changes',
        'Your profile is visible to your team'
      ]
    },

    security: {
      title: 'Security Settings',
      steps: [
        'Enable 2-Factor Authentication for extra security',
        'View your active login sessions across devices',
        'End sessions on devices you no longer use',
        'Change password if you suspect unauthorized access'
      ],
      tips: [
        '2FA is strongly recommended for all users',
        'Use an authenticator app (Google Authenticator, Authy)',
        'Check active sessions weekly'
      ]
    }
  },

  // ============ FINANCE MODULE ============
  finance: {
    overview: {
      title: 'Finance Overview',
      steps: [
        'See total revenue, expenses, and profit at a glance',
        'View month-over-month trends',
        'Check outstanding (unpaid) amounts',
        'Review department-wise expense breakdown'
      ],
      tips: [
        'Outstanding amounts in red need immediate follow-up',
        'Compare with last month to spot trends',
        'Export reports for monthly reviews'
      ]
    },

    expenses: {
      title: 'Expense Management',
      steps: [
        'Submit expenses with receipt for reimbursement',
        'Track approval status (Pending/Approved/Rejected)',
        'View department budgets and remaining balance',
        'Export expense reports for accounting'
      ],
      tips: [
        'Submit expenses within 7 days of purchase',
        'Always upload receipt photo or PDF',
        'Client-chargeable expenses are billed to the client'
      ]
    }
  },

  // ============ DIRECTORY MODULE ============
  directory: {
    list: {
      title: 'Team Directory',
      steps: [
        'Browse all team members across departments',
        'Search by name, role, or department',
        'Click on anyone to see their profile',
        'View org chart for reporting structure'
      ],
      tips: [
        'Find anyone\'s WhatsApp or email quickly here',
        'Org chart shows who reports to whom',
        'Use department filter to see specific teams'
      ]
    }
  },

  // ============ FREELANCER MODULE ============
  freelancer: {
    home: {
      title: 'Freelancer Dashboard',
      steps: [
        'See your assigned tasks and deadlines',
        'Submit work reports for completed deliverables',
        'Track your payment history and pending amounts',
        'Check your daily task plan'
      ],
      tips: [
        'Submit work reports weekly for timely payment',
        'Include deliverable links/files in reports',
        'Check daily planner every morning'
      ]
    },

    workReports: {
      title: 'Submitting Work Reports',
      steps: [
        'Click "New Report" for the billing period',
        'List all deliverables completed with details',
        'Add links or file references for each deliverable',
        'Submit for manager review',
        'Payment is processed after approval'
      ],
      tips: [
        'Be specific about what was delivered',
        'Include revision rounds if any',
        'Reports are due by the 5th of next month'
      ]
    }
  },

  // ============ INTERN MODULE ============
  intern: {
    home: {
      title: 'Intern Dashboard',
      steps: [
        'See your assigned tasks and learning modules',
        'Check your daily task plan',
        'Log learning hours (important for evaluation)',
        'View intern handbook for guidelines'
      ],
      tips: [
        'Complete learning modules on schedule',
        'Ask your buddy or mentor if you\'re stuck',
        'Daily planner submission is mandatory'
      ]
    }
  },

  // ============ KNOWLEDGE MODULE ============
  knowledge: {
    base: {
      title: 'Knowledge Base',
      steps: [
        'Search for answers to common questions',
        'Browse by category (HR, Policies, Tools, etc.)',
        'View frequently asked questions',
        'Can\'t find an answer? Ask your manager or HR'
      ],
      tips: [
        'Check here before asking HR - saves everyone time',
        'Bookmark pages you refer to often'
      ]
    },

    sop: {
      title: 'Standard Operating Procedures',
      steps: [
        'Find step-by-step instructions for common processes',
        'SOPs are organized by department',
        'Follow procedures exactly - they exist for a reason',
        'Suggest improvements if you find a better way'
      ],
      tips: [
        'New employees should read all relevant SOPs in first week',
        'Updated SOPs are highlighted with a badge'
      ]
    }
  },

  // ============ DATA DISCOVERY ============
  dataDiscovery: {
    findOldData: {
      title: 'Finding Old or Hidden Data',
      steps: [
        'By default, lists show only ACTIVE items to reduce clutter',
        'Use the STATUS filter to see archived, completed, or churned records',
        'Use DATE RANGE filter to see records from specific time periods',
        'Soft-deleted records can be restored by admins',
        'Export to Excel before filtering to get ALL data at once'
      ],
      tips: [
        'Churned clients: Set lifecycle filter to "CHURNED"',
        'Completed tasks: Set status filter to "COMPLETED" or "ALL"',
        'Old invoices: Use the date range filter',
        'Past employees: Set status to "INACTIVE" in directory',
        'Deleted records: Ask admin to check - they may be recoverable'
      ]
    },

    filters: {
      title: 'Mastering Filters',
      steps: [
        'Most lists have filter dropdowns at the top',
        'Combine multiple filters to narrow results precisely',
        'Date range filter lets you see any time period',
        'Search bar works alongside filters',
        'Click "Clear Filters" to reset and see everything'
      ],
      tips: [
        'Status = "All" shows everything including archived',
        'Sort by "Created Date" to find oldest records',
        'Export with current filters applied to get filtered data only'
      ]
    }
  }
}

export type HelpModule = keyof typeof HelpContent
export type HelpSection<M extends HelpModule> = keyof typeof HelpContent[M]

/**
 * Get help content for a specific module and section
 */
export function getHelpContent(module: string, section: string) {
  const moduleContent = HelpContent[module as HelpModule]
  if (!moduleContent) return null

  return moduleContent[section as keyof typeof moduleContent] || null
}

export default HelpContent
