# PIONEER-OS DASHBOARD - COMPLETE FEATURE DOCUMENTATION

## Executive Summary

This document provides a comprehensive analysis of every feature, interaction, data flow, and workflow in the Pioneer-OS dashboard. The system is built on Next.js 15+ with App Router, Prisma ORM with PostgreSQL, and NextAuth for authentication.

---

## TABLE OF CONTENTS

1. [Authentication & Session Management](#1-authentication--session-management)
2. [Dashboard & Navigation System](#2-dashboard--navigation-system)
3. [Task Management](#3-task-management)
4. [HR & People Operations](#4-hr--people-operations)
5. [Client Management](#5-client-management)
6. [Sales & CRM](#6-sales--crm)
7. [Accounts & Finance](#7-accounts--finance)
8. [SEO Department](#8-seo-department)
9. [Ads Department](#9-ads-department)
10. [Social Media Department](#10-social-media-department)
11. [Web Development](#11-web-development)
12. [Design Department](#12-design-department)
13. [Manager/Operations](#13-manageroperations)
14. [Learning & Development](#14-learning--development)
15. [Meetings & Calendar](#15-meetings--calendar)
16. [Client Portal](#16-client-portal)
17. [Notifications & Communication](#17-notifications--communication)
18. [Reporting & Analytics](#18-reporting--analytics)

---

## 1. AUTHENTICATION & SESSION MANAGEMENT

### Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOGIN SYSTEM WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌───────────┐
  │  User    │────▶│  /login      │────▶│ Choose Method   │────▶│ Magic Link│
  │  visits  │     │  page        │     │                 │     │   OR      │
  └──────────┘     └──────────────┘     └─────────────────┘     │ Password  │
                                                                      │
         ┌────────────────────────────────────┬─────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│  Magic Link     │                 │  Password Login │
│  Flow           │                 │  Flow           │
└────────┬────────┘                 └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│ Email/Phone/    │                 │ Phone +         │
│ Employee ID     │                 │ Password        │
│ (BP-XXX format) │                 │                 │
└────────┬────────┘                 └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│ Validate Input  │                 │ NextAuth        │
│ (email/phone/   │                 │ Credentials     │
│  employee ID)   │                 │ Provider        │
└────────┬────────┘                 └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│ POST            │                 │ Validate from   │
│ /api/auth/      │                 │ Prisma User     │
│ magic-link      │                 │ table           │
└────────┬────────┘                 └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│ Generate Token  │                 │ Create Session  │
│ (30 min expiry) │                 │ JWT Cookie       │
└────────┬────────┘                 └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│ Send via        │                 │ Redirect to     │
│ Email/WhatsApp  │                 │ /dashboard      │
└────────┬────────┘                 └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐
│ User clicks     │                 │ Show role-based │
│ link in email   │                 │ dashboard       │
└────────┬────────┘                 └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Token validated │
│ Session created │
└─────────────────┘
```

### Authentication API Endpoints

| Endpoint | Method | Purpose | Data Flow |
|----------|--------|---------|-----------|
| `/api/auth/magic-link` | POST | Send magic link to email/WhatsApp | Request → Validate → Generate Token → Send Notification → Store in DB |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers for login/session | OAuth callbacks, session management |
| `/api/client-portal/magic-login` | POST | Client portal magic link | Similar to employee magic link |
| `/api/onboard/[token]` | GET/POST | Onboarding with token validation | Token → User creation → Session |

### Role-Based Access Matrix

| Role | Dashboard | HR | Sales | Accounts | SEO | Ads | Social | Web | Design |
|------|-----------|-----|-------|----------|-----|-----|--------|-----|--------|
| SUPER_ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| MANAGER | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| OPERATIONS_HEAD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| HR | ✓ | ✓ | - | - | - | - | - | - | - |
| SALES | ✓ | - | ✓ | - | - | - | - | - | - |
| ACCOUNTS | ✓ | - | - | ✓ | - | - | - | - | - |
| SEO | ✓ | - | - | - | ✓ | - | - | - | - |
| ADS | ✓ | - | - | - | - | ✓ | - | - | - |
| SOCIAL | ✓ | - | - | - | - | - | ✓ | - | - |
| WEB_MANAGER | ✓ | - | - | - | - | - | - | ✓ | - |
| DESIGNER | ✓ | - | - | - | - | - | - | - | ✓ |
| EMPLOYEE | ✓ | - | - | - | - | - | - | - | - |
| FREELANCER | ✓ | - | - | - | - | - | - | - | - |
| INTERN | ✓ | - | - | - | - | - | - | - | - |

---

## 2. DASHBOARD & NAVIGATION SYSTEM

### UnifiedSidebar Component Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIDEBAR SELECTION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │ User     │
  │ logs in  │
  └────┬─────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     UnifiedSidebar.tsx                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ 1. Get server session                                                  │ │
│  │ 2. If viewAsUserId present → fetch that user's role                    │ │
│  │ 3. Else use current user's role                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Role Matching Logic                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ HR_ROLES.includes(role) OR department === 'HR'      → HRNav             │ │
│  │ ACCOUNTS_ROLES.includes(role) OR department === 'ACCOUNTS' → AccountsNav│ │
│  │ SALES_ROLES.includes(role) OR department === 'SALES' → SalesNav        │ │
│  │ SEO_ROLES.includes(role) OR department === 'SEO' → SeoNav              │ │
│  │ WEB_ROLES.includes(role) OR department === 'WEB' → WebNav             │ │
│  │ ADS_ROLES.includes(role) OR department === 'ADS' → AdsNav             │ │
│  │ SOCIAL_ROLES.includes(role) OR department === 'SOCIAL' → SocialNav    │ │
│  │ DESIGN_ROLES.includes(role) OR department === 'DESIGN' → DesignNav    │ │
│  │ MANAGER_ROLES.includes(role) → ManagerNav                             │ │
│  │ role === 'OM' OR role === 'BLENDED_USER' (multi-dept) → BlendedNav    │ │
│  │ Default → DashboardNav                                                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Render Selected Nav                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Navigation Component Structure

Each navigation component (HRNav, AccountsNav, etc.) follows this pattern:

```typescript
// Example: HRNav structure
<nav>
├── Logo/Brand Section
├── Quick Actions (role-specific buttons)
├── Main Menu Sections
│   ├── Dashboard (overview)
│   ├── People
│   │   ├── Employees
│   │   ├── Leave Management
│   │   ├── Attendance
│   │   ├── Onboarding
│   │   └── ...
│   ├── Hiring
│   │   ├── Candidates
│   │   ├── Interviews
│   │   └── ...
│   └── Settings
├── Team Members (colleague list)
└── External Quick Links (Super Admin only)
```

### Dashboard Page Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MAIN DASHBOARD (/dashboard)                               │
└─────────────────────────────────────────────────────────────────────────────┘

  User ──▶ /dashboard ──▶ getServerSession(authOptions)
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │ Role Detection       │
                         │ from session.user   │
                         └──────────┬──────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
   │ SUPER_ADMIN  │         │   MANAGER    │         │    HR        │
   │ Manager      │         │   HR         │         │   Employee   │
   │ Operations   │         │   Sales      │         │   Freelancer │
   └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
          │                         │                         │
          ▼                         ▼                         ▼
   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
   │ AdminDashboard│         │ManagerDashboard│        │EmployeeDash  │
   │ (dynamic())   │         │(dynamic())   │         │(dynamic())   │
   └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
          │                         │                         │
          ▼                         ▼                         ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                      Data Fetching Functions                            │
   ├─────────────────────────────────────────────────────────────────────────┤
   │ getDashboardData()        → General stats, clients, news, events       │
   │ getHRDashboardData()      → Pending verifications, leave requests      │
   │ getEmployeeDashboardData()→ Client assignments, today's tasks           │
   │ getAccountsDashboardData()→ Onboarding, overdue invoices, payments     │
   │ getSalesDashboardData()   → Leads, pipeline, proposals                  │
   │ getSEODashboardData()     → Tasks, rankings, content calendar          │
   │ getAdsDashboardData()     → Campaigns, budget, leads                   │
   │ getSocialDashboardData()  → Posts, engagement, calendar                │
   │ getWebDashboardData()     → Projects, bugs, escalations                 │
   │ getInternDashboardData()  → Tasks, learning progress, skills           │
   │ getFreelancerDashboardData()→ Assignments, payments, work reports     │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. TASK MANAGEMENT

### Task Creation to Completion Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TASK LIFECYCLE WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 1. CREATE TASK                                                           │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User clicks "New Task" button                                        │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/tasks                                                      │ │
  │ │ {                                                                    │ │
  │ │   title, description, department, priority, status,                    │ │
  │ │   dueDate, assigneeId, reviewerId, clientId, type, estimatedHours    │ │
  │ │ }                                                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Prisma.task.create() → DB                                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ If assigneeId !== creator                                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Create Notification:                                                  │ │
  │ │ prisma.notification.create()                                          │ │
  │ │ notifyTaskAssignment() via WhatsApp/in-app                           │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 2. TASK STATES (Status Flow)                                             │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │                                                                      │ │
  │ │   ┌─────────┐      ┌─────────────┐      ┌─────────┐      ┌─────────┐│
  │ │   │  TODO   │ ───▶ │ IN_PROGRESS │ ───▶ │ REVIEW  │ ───▶ │ COMPLETED│
  │ │   └─────────┘      └─────────────┘      └─────────┘      └─────────┘│
  │ │       │                  │                 │                     ▲  │
  │ │       │                  │                 │                     │  │
  │ │       ▼                  ▼                 ▼                     │  │
  │ │   ┌─────────┐      ┌─────────┐      ┌──────────┐         │      │
  │ │   │CANCELLED│      │ BLOCKED │      │ REVISION │─────────┘      │
  │ │   └─────────┘      └─────────┘      └──────────┘                │
  │ │                                                                      │ │
  │ │ Status transitions via PATCH /api/tasks/[id]                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 3. TASK FILTERS & QUERIES                                                │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ GET /api/tasks?status=TODO&priority=HIGH&assigneeId=xxx              │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ RBAC Logic:                                                          │ │
  │ │ • SUPER_ADMIN/MANAGER → see all tasks                               │ │
  │ │ • FREELANCER/INTERN → only assigned or created tasks                │ │
  │ │ • EMPLOYEE → assigned, created, or department tasks                   │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 4. TASK TIMER                                                            │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User starts timer on task                                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ timerStartedAt = new Date()                                          │ │
  │ │ Store in prisma.task                                                  │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Work entry created with start/end times                              │ │
  │ │ Time logged to user's workEntries                                    │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Task Management API Endpoints

| Endpoint | Method | Purpose | Data Flow |
|----------|--------|---------|-----------|
| `/api/tasks` | GET | List tasks with filters | Query params → RBAC filter → Prisma findMany → Paginated response |
| `/api/tasks` | POST | Create task | Validation → Prisma create → Notification → Response |
| `/api/tasks/[id]` | GET | Single task | ID → Prisma findUnique → Include assignee, creator, client |
| `/api/tasks/[id]` | PATCH | Update task | Validation → Prisma update → Notification if assignee changed |
| `/api/tasks/[id]` | DELETE | Soft delete | deletedAt = now() |
| `/api/tasks/bulk` | PATCH | Bulk status update | IDs array → Prisma updateMany |

### Task Page Components

```
/tasks/page.tsx
├── Stats Cards (Total, To Do, In Progress, Review, Completed)
├── Filters (Status, Priority, Assignee, Department, Client)
├── Task Table
│   ├── Title, Client, Assignee, Due Date, Priority, Status
│   ├── Inline Actions (Edit, Delete, Start Timer, Change Status)
│   └── Bulk Actions
├── Create Task Modal
├── End of Day Report Component
└── Pagination
```

---

## 4. HR & PEOPLE OPERATIONS

### Leave Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LEAVE MANAGEMENT WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ APPLY LEAVE                                                              │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User clicks "Apply Leave"                                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Select Leave Type: PL | CL | SL | COMP_OFF                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Fill: Start Date, End Date, Reason                                   │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/hr/leave                                                   │ │
  │ │ {                                                                    │ │
  │ │   type: 'PL', startDate, endDate, reason                             │ │
  │ │ }                                                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Validate against LeaveBalance                                        │ │
  │ │ Balance check for requested days                                     │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ prisma.leaveRequest.create({ status: 'PENDING' })                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Notification sent to HR/Manager                                      │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ APPROVE/REJECT LEAVE                                                     │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ HR/Manager views /hr/leaves                                           │ │
  │ │ Pending requests displayed                                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Click Approve/Reject                                                 │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ PATCH /api/hr/leave/[id]                                             │ │
  │ │ { status: 'APPROVED' | 'REJECTED', reviewNote }                       │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ If APPROVED:                                                          │ │
  │ │   - Deduct from LeaveBalance                                         │ │
  │ │   - Update Attendance for leave days                                  │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Notification to employee                                              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ ATTENDANCE TRACKING                                                       │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Daily: POST /api/hr/attendance                                        │ │
  │ │ { date, status: 'PRESENT' | 'WFH' | 'ABSENT', punchIn, punchOut }   │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Check for existing record                                            │ │
  │ │ Update or create attendance                                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Late arrivals flagged (after 10 AM)                                   │ │
  │ │ Violations recorded if no leave applied                               │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### HR Module Pages & Features

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/hr` | HR Dashboard | Overview stats, pending actions |
| `/hr/leave` | Leave Management | Apply, approve, reject leaves; view balances |
| `/hr/leaves` | All Leaves View | Filter by status, user, date range |
| `/hr/attendance` | Attendance Tracking | Daily check-in, monthly view |
| `/hr/attendance/calendar` | Calendar View | Visual attendance by date |
| `/hr/appraisals` | Performance Appraisals | Schedule, conduct, rate employees |
| `/hr/training` | Training Management | Assign, track, verify learning |
| `/hr/onboarding-checklist` | Employee Onboarding | Step-by-step onboarding tasks |
| `/hr/employee-onboarding` | New Hire Onboarding | Complete onboarding flow |
| `/hr/vendor-onboarding` | Vendor Onboarding | Onboard vendors |
| `/hr/verifications` | Background Verifications | KYC, reference checks |
| `/hr/assets` | Asset Management | Track devices assigned |
| `/hr/exit` | Exit Process | Initiate employee exit |
| `/hr/fnf` | Full & Final | Settlement calculations |
| `/hr/pip` | Performance Improvement Plan | Create, track PIPs |
| `/hr/interviews` | Interview Management | Schedule, conduct, feedback |
| `/hr/assessment-pipeline` | Candidate Assessment | Assessment pipeline |
| `/hr/referrals` | Employee Referrals | Track referral bonuses |
| `/hr/escalations` | HR Escalations | Handle employee issues |
| `/hr/engagement-activities` | Team Activities | Organize engagement events |
| `/hr/quotes` | Quote of the Day | Company inspiration quotes |
| `/hr/work-anniversaries` | Work Anniversaries | Track tenure milestones |
| `/hr/client-feedback` | Client Feedback | View client feedback on employees |
| `/hr/manager-reviews` | Manager Reviews | 360-degree feedback |
| `/hr/appreciations` | Appreciations | Recognize colleagues |
| `/hr/employer-branding` | Branding Content | Manage employer brand |
| `/hr/calendar` | HR Calendar | HR events and deadlines |

### HR API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/hr/leave` | GET, POST | List/create leave requests |
| `/api/hr/leave/[id]` | GET, PATCH, DELETE | Single leave operations |
| `/api/hr/attendance` | GET, POST | Attendance tracking |
| `/api/hr/employees` | GET | List employees with filters |
| `/api/hr/onboarding` | GET, POST | Onboarding management |
| `/api/hr/appraisal` | GET, POST | Appraisal records |
| `/api/hr/asset` | GET, POST | Asset management |
| `/api/hr/exit` | GET, POST | Exit process |

---

## 5. CLIENT MANAGEMENT

### Client Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LIFECYCLE WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 1. LEAD CREATION                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Sales team creates lead via /sales/leads                            │ │
  │ │ POST /api/sales/leads                                                │ │
  │ │ { companyName, contactName, contactEmail, contactPhone, source }     │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Lead created with stage: LEAD_RECEIVED                               │ │
  │ │ LeadActivity logged: "Lead created"                                  │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 2. LEAD NURTURING                                                         │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Actions: Call, Email, Meeting, Proposal                               │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/sales/leads/[id]/activity                                  │ │
  │ │ { type, note, nextFollowUp }                                         │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Stage progression:                                                   │ │
  │ │ LEAD_RECEIVED → RFP_SENT → RFP_COMPLETED → PROPOSAL_SHARED →        │ │
  │ │ FOLLOW_UP_ONGOING → NEGOTIATING → WON/LOST                           │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 3. CLIENT ONBOARDING (Sales → Accounts)                                  │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Won lead triggers handover                                            │ │
  │ │ SalesHandover created                                                 │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Accounts team notified                                                │ │
  │ │ Client onboarding initiated via /accounts/client-onboarding          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Data collection: Contract, Services, Billing, Contacts                │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Client activated with monthly fee set                                │ │
  │ │ Team members assigned from various departments                       │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 4. CLIENT MANAGEMENT                                                     │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Active client management via /accounts/clients                        │ │
  │ │ • Health score tracking                                              │ │
  │ │ • Deliverables monitoring                                            │ │
  │ │ • Invoice generation                                                 │ │
  │ │ • Issue tracking                                                     │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ ClientLifecycle service updates health score                         │ │
  │ │ Based on: deliverables met, invoices paid, satisfaction              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 5. CLIENT TERMINATION                                                    │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Termination initiated via Client Portal or Admin                      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Exit automation triggered                                            │ │
  │ │ Contract review, final invoices, data export                         │ │
  │ │ Client marked as: TERMINATED                                          │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Client Management Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/accounts/clients` | Client List | View all, filter by status/tier, search |
| `/accounts/client-lifecycle` | Lifecycle View | Visual pipeline of all clients |
| `/accounts/client-onboarding` | Onboarding | Complete onboarding checklist |
| `/accounts/client-onboarding-form` | Onboarding Form | Detailed data collection |
| `/accounts/client-guidelines` | Guidelines | Client service guidelines |
| `/accounts/contracts` | Contract Management | Manage client contracts |
| `/accounts/client-profitability` | Profitability | Revenue vs cost analysis |

---

## 6. SALES & CRM

### Lead to Deal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SALES PIPELINE WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ LEAD STAGES                                                              │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │                                                                        │ │
  │ │   ┌──────────────┐                                                    │ │
  │ │   │LEAD_RECEIVED │                                                    │ │
  │ │   └──────┬───────┘                                                    │ │
  │ │          │                                                            │ │
  │ │          ▼                                                            │ │
  │ │   ┌──────────────┐    ┌────────────────┐                              │ │
  │ │   │  RFP_SENT    │───▶│ RFP_COMPLETED  │                              │ │
  │ │   └──────────────┘    └────────┬───────┘                              │ │
  │ │                                 │                                      │ │
  │ │                                 ▼                                      │ │
  │ │                          ┌────────────┐                                │ │
  │ │                          │ PROPOSAL   │                                │ │
  │ │                          │  SHARED    │                                │ │
  │ │                          └──────┬─────┘                                │ │
  │ │                                 │                                      │ │
  │ │                                 ▼                                      │ │
  │ │                          ┌────────────┐                                │ │
  │ │                          │ NEGOTIATING│                                │ │
  │ │                          └──────┬─────┘                                │ │
  │ │                    ┌────────────┼────────────┐                        │ │
  │ │                    ▼                         ▼                        │ │
  │ │              ┌──────────┐              ┌───────┐                      │ │
  │ │              │   WON    │              │  LOST │                      │ │
  │ │              └──────────┘              └───────┘                      │ │
  │ │                                                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ SALES ACTIVITIES                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Call Logged      → POST /api/sales/leads/[id]/call                   │ │
  │ │ Email Sent       → POST /api/sales/leads/[id]/email                  │ │
  │ │ Meeting Scheduled→ POST /api/sales/meetings                          │ │
  │ │ Proposal Created → POST /api/sales/proposals                        │ │
  │ │ RFP Received     → POST /api/sales/rfps                              │ │
  │ │                                                                        │ │
  │ │ Each activity updates lead stage and logs LeadActivity               │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ DEAL TRACKING                                                             │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ When proposal accepted, create SalesDeal                            │ │
  │ │ POST /api/sales/deals                                                 │ │
  │ │ { clientId, value, expectedCloseDate, stage }                         │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Deal linked to client                                                │ │
  │ │ Deal activities tracked                                              │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Won deal → trigger client onboarding                                │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Sales Pages & Features

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/sales` | Sales Dashboard | Pipeline overview, metrics |
| `/sales/leads` | Lead Management | Create, nurture, convert leads |
| `/sales/pipeline` | Pipeline View | Kanban view of all leads |
| `/sales/deals` | Deal Tracking | Track deal progress |
| `/sales/meetings` | Sales Meetings | Schedule client meetings |
| `/sales/proposals` | Proposal Management | Create, send, track proposals |
| `/sales/rfp-manager` | RFP Manager | Handle RFP submissions |
| `/sales/nurturing` | Lead Nurturing | Automated nurture sequences |
| `/sales/performance` | Sales Performance | Team performance metrics |
| `/sales/reports` | Sales Reports | Revenue, conversion reports |
| `/sales/handovers` | Client Handovers | Handover to accounts |

### Sales API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sales/leads` | GET, POST | Lead management |
| `/api/sales/leads/[id]` | GET, PATCH | Single lead |
| `/api/sales/leads/[id]/activity` | GET, POST | Lead activities |
| `/api/sales/deals` | GET, POST | Deal tracking |
| `/api/sales/meetings` | GET, POST | Sales meetings |
| `/api/sales/proposals` | GET, POST | Proposals |
| `/api/sales/rfp` | GET, POST | RFP management |

---

## 7. ACCOUNTS & FINANCE

### Invoice Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INVOICE MANAGEMENT WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 1. MANUAL INVOICE CREATION                                                │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User clicks "Create Invoice" at /accounts/invoices                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Select Client from list                                               │ │
  │ │ Fill: Invoice number, items, amounts, due date                       │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/invoices                                                    │ │
  │ │ { clientId, invoiceNumber, items[], dueDate }                        │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Prisma.invoice.create()                                              │ │
  │ │ Status: DRAFT                                                         │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 2. AUTO INVOICE GENERATION                                               │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Configured at /accounts/auto-invoice                                 │ │
  │ │ Per-client billing configuration                                      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Monthly cron job: GET /api/accounts/auto-invoice/generate            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ For each client with auto-invoice enabled:                           │ │
  │ │   - Calculate based on contract/services                             │ │
  │ │   - Generate invoice items                                            │ │
  │ │   - Create invoice with status: SENT                                  │ │
  │ │   - Send to client email                                              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 3. INVOICE SENT TO CLIENT                                                │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User clicks "Send Invoice"                                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/accounts/auto-invoice/send/[invoiceId]                     │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Email sent via notification service                                   │ │
  │ │ Status: SENT                                                          │ │
  │ │ Invoice link accessible via Client Portal                             │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 4. PAYMENT TRACKING                                                      │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Client pays → Bank statement imported                                │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/accounts/bank-statements/[id]/process                      │ │
  │ │ Transaction matched to invoice                                        │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Invoice status updated: PARTIAL | PAID                                │ │
  │ │ Payment recorded in ExpensePayment                                    │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ 5. OVERDUE HANDLING                                                      │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Cron job runs daily: GET /api/cron/invoice-overdue                   │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Identify invoices past due date with status SENT/PARTIAL             │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Status → OVERDUE                                                      │ │
  │ │ Notification sent to accounts team                                    │ │
  │ │ Follow-up reminder sent to client                                     │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Accounts Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/accounts` | Accounts Dashboard | Overview, pending actions |
| `/accounts/invoices` | Invoice Management | Create, send, track invoices |
| `/accounts/auto-invoice` | Auto Invoice Config | Configure auto-billing |
| `/accounts/proforma-invoice` | Proforma Invoices | Proforma billing |
| `/accounts/accounts-view` | Account Statements | View account ledger |
| `/accounts/bank-statements` | Bank Statements | Import, process statements |
| `/accounts/ledger` | Ledger View | Transaction history |
| `/accounts/payment-tracker` | Payment Tracking | Track all payments |
| `/accounts/pending-payments` | Pending Payments | Payments due |
| `/accounts/expenses` | Expense Management | Track expenses |
| `/accounts/expenses/recurring` | Recurring Expenses | Subscription tracking |
| `/accounts/roi` | ROI Analysis | Client profitability |
| `/accounts/aging-report` | Aging Report | Receivables aging |
| `/accounts/deliverables` | Deliverables Tracking | Track deliverables |
| `/accounts/budget-alerts` | Budget Alerts | Expense alerts |
| `/accounts/handovers` | Sales Handovers | Incoming handovers |
| `/accounts/onboardings` | Client Onboardings | Track onboardings |
| `/accounts/performance` | Performance | Accounts team metrics |
| `/accounts/leaderboard` | Leaderboard | Team rankings |
| `/accounts/achievements` | Achievements | Track achievements |

### Finance API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/invoices` | GET, POST | Invoice management |
| `/api/invoices/[id]` | GET, PATCH | Single invoice |
| `/api/accounts/auto-invoice/*` | Various | Auto invoice operations |
| `/api/accounts/bank-statements/*` | Various | Bank statement processing |
| `/api/accounts/expenses/*` | Various | Expense tracking |
| `/api/accounts/finance-stats` | GET | Financial statistics |
| `/api/accounts/aging-report` | GET | Aging report data |

---

## 8. SEO DEPARTMENT

### SEO Task Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SEO TASK WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ TASK TYPES                                                               │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │                                                                        │ │
  │ │   ON_PAGE    ───▶ Content optimization, meta tags, internal linking   │ │
  │ │   OFF_PAGE   ───▶ Backlink building, guest posting                   │ │
  │ │   TECHNICAL  ───▶ Site speed, crawlability, schema markup            │ │
  │ │   CONTENT    ───▶ Blog writing, articles, guides                      │ │
  │ │   REPORTING  ───▶ Rank tracking, analytics, monthly reports          │ │
  │ │                                                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ TASK LIFECYCLE                                                           │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │                                                                        │ │
  │ │   ┌──────┐     ┌─────────────┐     ┌────────┐     ┌───────┐         │ │
  │ │   │ TODO │ ──▶ │ IN_PROGRESS │ ──▶ │ REVIEW │ ──▶ │ DONE  │         │ │
  │ │   └──────┘     └─────────────┘     └────────┘     └───────┘         │ │
  │ │       │                                │                              │ │
  │ │       │                                ▼                              │ │
  │ │       │                          ┌──────────┐                        │ │
  │ │       └──────────────────────────│ REVISION │──────┐                 │ │
  │ │                                   └──────────┘      │                 │ │
  │ │                                                 ▼  │                 │ │
  │ │                                              ┌──────┘                 │ │
  │ │                                              │                        │ │
  │ │                                              └────────────────────    │ │
  │ │                                                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  │                                                                          │
  │ ON_PAGE/Technical tasks: Reviewed by SEO Lead                           │
  │ CONTENT tasks: QC review before completion                              │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CONTENT WORKFLOW                                                         │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Writer assigned to SeoContent task                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Content written and submitted                                         │ │
  │ │ Status → REVIEW                                                       │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ QC Review at /seo/quality/qc-review                                  │ │
  │ │ • Grammar, readability, SEO optimization                             │ │
  │ │ • Plagiarism check                                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Approved or sent for REVISION                                        │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Client Approval at /seo/quality/approvals                            │ │
  │ │ Final sign-off before publishing                                      │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### SEO Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/seo` | SEO Dashboard | Overview, tasks, rankings |
| `/seo/tasks` | SEO Tasks | Task board, timeline view |
| `/seo/calendar` | SEO Calendar | Content calendar |
| `/seo/daily-planner` | Daily Planner | Daily task planning |
| `/seo/deliverables/content` | Content Deliverables | Track content |
| `/seo/deliverables/backlinks` | Backlink Deliverables | Track backlinks |
| `/seo/deliverables/technical` | Technical Tasks | Technical SEO |
| `/seo/quality/qc-review` | QC Review | Internal review |
| `/seo/quality/approvals` | Client Approvals | Client sign-off |
| `/seo/gbp` | Google Business Profile | GBP management |
| `/seo/youtube` | YouTube SEO | Video optimization |
| `/seo/performance/rankings` | Keyword Rankings | Track rankings |
| `/seo/performance/traffic` | Traffic Reports | Traffic analysis |
| `/seo/performance/reports` | SEO Reports | Generate reports |
| `/seo/reports/operations` | Ops Report | Operations report |
| `/seo/reports/tactical` | Tactical Report | Tactical insights |
| `/seo/reports/strategic` | Strategic Report | Strategic insights |

### SEO API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/seo/tasks` | GET, POST | SEO task management |
| `/api/seo/content` | GET, POST | Content management |
| `/api/seo/backlinks` | GET, POST | Backlink tracking |
| `/api/seo/calendar` | GET, POST | Calendar events |
| `/api/seo/gbp` | GET, POST | GBP management |
| `/api/qc/reviews` | GET, POST | QC reviews |

---

## 9. ADS DEPARTMENT

### Campaign Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ADS CAMPAIGN WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CAMPAIGN LIFECYCLE                                                        │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │                                                                        │ │
  │ │   Planning ──▶ Created ──▶ Under Review ──▶ Active ──▶ Paused      │ │
  │ │                                                        │              │ │
  │ │                                                        ▼              │ │
  │ │                                                    Completed          │ │
  │ │                                                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CAMPAIGN CREATION                                                        │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User goes to /ads/campaigns/planner                                  │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Select Platform: META | GOOGLE | LINKEDIN                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Create Campaign:                                                      │ │
  │ │ • Name, Objective, Daily Budget                                       │ │
  │ │ • Target Audience (location, age, interests)                          │ │
  │ │ • Ad Creative assets                                                  │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/ads/campaigns                                               │ │
  │ │ { name, platform, objective, dailyBudget, clientId }                  │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Campaign created with status: CREATED                                │ │
  │ │ Ad Sets and Ads can be added                                          │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ LEAD TRACKING                                                            │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Platform API integration for lead sync                                 │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ GET /api/cron/sync-integrations (daily)                              │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Fetch leads from Meta/Google APIs                                      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Store in Campaign Lead table                                          │ │
  │ │ Track: impressions, clicks, cost, leads, conversions                  │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ BUDGET MANAGEMENT                                                        │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Budget allocations per client at /ads/budget/allocations              │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Monthly budget distribution across campaigns                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Alert when spend approaches threshold                                 │ │
  │ │ Budget alerts at /accounts/budget-alerts                             │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Ads Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/ads` | Ads Dashboard | Overview, campaign summary |
| `/ads/daily-planner` | Daily Planner | Plan daily ad activities |
| `/ads/calendar` | Ads Calendar | Calendar view of campaigns |
| `/ads/campaigns/meta` | Meta Campaigns | Meta ad management |
| `/ads/campaigns/google` | Google Campaigns | Google Ads management |
| `/ads/campaigns/planner` | Campaign Planner | Create new campaigns |
| `/ads/creatives/assets` | Ad Creatives | Manage creative assets |
| `/ads/creatives/requests` | Creative Requests | Request new creatives |
| `/ads/leads/performance` | Lead Performance | Lead metrics |
| `/ads/leads/conversions` | Conversions | Conversion tracking |
| `/ads/budget/allocations` | Budget Allocations | Budget per client |
| `/ads/budget/spend` | Spend Tracking | Track spend vs budget |
| `/ads/performance/*` | Performance Reports | ROI, ROAS reports |
| `/ads/reports/*` | Reports | Ops, tactical, strategic |

### Ads API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ads/campaigns` | GET, POST | Campaign management |
| `/api/ads/campaigns/[id]` | GET, PATCH | Single campaign |
| `/api/ads/creatives` | GET, POST | Creative management |
| `/api/ads/leads` | GET | Lead tracking |
| `/api/ads/budget` | GET, POST | Budget management |
| `/api/ads/performance` | GET | Performance metrics |

---

## 10. SOCIAL MEDIA DEPARTMENT

### Content Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SOCIAL CONTENT WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CONTENT PLANNING                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User at /social/content/planner                                      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Create content idea:                                                 │ │
  │ │ POST /api/social/content-ideas                                        │ │
  │ │ { title, platform, scheduledDate, clientId }                         │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Idea added to content calendar                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CREATIVE REQUEST FLOW                                                    │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Request creative for content piece                                    │ │
  │ │ POST /api/social/creatives/request                                    │ │
  │ │ { type, specifications, deadline }                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Request appears in /design/requests                                  │ │
  │ │ Design team works on creative                                         │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Creative delivered and linked to content                              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ APPROVAL FLOW                                                            │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Content created → Internal Approval                                  │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/social/approvals                                            │ │
  │ │ { contentId, type, dueDate }                                         │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Review at /social/approvals/internal                                  │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Approved or Revision requested                                        │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Client Approval at /social/approvals/client                          │ │
  │ │ Final client sign-off                                                  │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ PUBLISHING                                                                │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Client approved → Scheduled for publish                              │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/social/posts                                                │ │
  │ │ { platform, content, scheduledTime, clientId }                        │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Calendar updated at /social/calendar                                  │ │
  │ │ Published posts tracked at /social/publishing/published              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Social Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/social` | Social Dashboard | Overview, quick stats |
| `/social/calendar` | Social Calendar | Visual calendar |
| `/social/content/planner` | Content Planner | Plan content |
| `/social/content/creative-requests` | Creative Requests | Request designs |
| `/social/content/calendar` | Content Calendar | Content schedule |
| `/social/tasks` | Social Tasks | Task board |
| `/social/approvals/internal` | Internal Approvals | Internal review |
| `/social/approvals/client` | Client Approvals | Client sign-off |
| `/social/linkedin` | LinkedIn | LinkedIn management |
| `/social/video-production` | Video Production | Video workflow |
| `/social/print-designing` | Print Designing | Print materials |
| `/social/publishing/scheduled` | Scheduled Posts | View scheduled |
| `/social/publishing/published` | Published Posts | View published |
| `/social/performance/*` | Performance | Engagement, reports |

### Social API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/social/dashboard` | GET | Dashboard data |
| `/api/social/posts` | GET, POST | Post management |
| `/api/social/approvals` | GET, POST | Approval workflow |
| `/api/social/metrics` | GET | Engagement metrics |
| `/api/social/clients` | GET | Client content |
| `/api/social/content-ideas` | GET, POST | Content ideas |
| `/api/content/calendar` | GET, POST | Calendar events |

---

## 11. WEB DEVELOPMENT

### Project Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WEB PROJECT WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ PROJECT CREATION                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ New client or existing → Create web project                           │ │
  │ │ POST /api/web/projects                                                │ │
  │ │ { name, clientId, type, requirements }                                │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Project created as Task with type: PROJECT                            │ │
  │ │ Phases can be added for larger projects                              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ PROJECT PHASES                                                           │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Project divided into phases:                                          │ │
  │ │ • Design Phase                                                        │ │
  │ │ • Development Phase                                                   │ │
  │ │ • Testing Phase                                                       │ │
  │ │ • Deployment Phase                                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Each phase as WebProjectPhase                                         │ │
  │ │ Progress tracked per phase                                            │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ BUG TRACKING                                                             │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Bug reported → POST /api/web/bugs                                     │ │
  │ │ { title, description, severity, projectId }                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Assigned to developer                                                │ │
  │ │ Tracked via priority levels                                          │ │
  │ │ Status: OPEN → IN_PROGRESS → RESOLVED → CLOSED                       │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CHANGE REQUESTS                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Client requests changes → POST /api/web/requests                      │ │
  │ │ { description, scope, timeline }                                      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Impact assessment and estimation                                       │ │
  │ │ Approved or scoped accordingly                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ ESCALATION MANAGEMENT                                                   │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Issue escalated → POST /api/web/escalations                           │ │
  │ │ Priority: HIGH/URGENT                                                 │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Manager notified                                                      │ │
  │ │ Tracked at /manager/clients/escalations                              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ AMC MANAGEMENT                                                           │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Annual Maintenance Contract tracking                                  │ │
  │ │ /web/amc/renewals shows upcoming renewals                             │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Maintenance logs at /web/amc/logs                                   │ │
  │ │ Support tickets linked to AMC                                         │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Web Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/web` | Web Dashboard | Overview, active projects |
| `/web/projects` | Web Projects | Manage projects |
| `/web/projects/pipeline` | Project Pipeline | Pipeline view |
| `/web/projects/completed` | Completed | Archive of done |
| `/web/projects/on-hold` | On Hold | On hold projects |
| `/web/clients` | Web Clients | Client list |
| `/web/clients/new` | New Client | Add new client |
| `/web/bugs` | Bug Tracker | Bug management |
| `/web/requests` | Change Requests | Manage CRs |
| `/web/escalations` | Escalations | View escalations |
| `/web/calendar` | Web Calendar | Calendar view |
| `/web/amc` | AMC Dashboard | AMC overview |
| `/web/amc/renewals` | Renewals | Upcoming renewals |
| `/web/amc/logs` | Maintenance Logs | Log maintenance |

### Web API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/web/projects` | GET, POST | Project management |
| `/api/web/bugs` | GET, POST | Bug tracking |
| `/api/web/requests` | GET, POST | Change requests |
| `/api/web/escalations` | GET, POST | Escalation management |
| `/api/web/calendar` | GET, POST | Calendar events |
| `/api/web/domains` | GET, POST | Domain management |
| `/api/web/hosting` | GET, POST | Hosting management |
| `/api/web/reimbursements` | GET, POST | Reimbursements |

---

## 12. DESIGN DEPARTMENT

### Design Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DESIGN REQUEST WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ REQUEST CREATION                                                         │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Team member submits design request                                     │ │
  │ │ POST /api/design/requests                                              │ │
  │ │ { type, specifications, deadline, clientId }                         │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Request appears in /design/requests                                   │ │
  │ │ Type categories: PRINT, DIGITAL, BRANDING, THUMBNAIL                 │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ WORKFLOW STATES                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │                                                                        │ │
  │ │   ┌──────────┐     ┌─────────────┐     ┌─────────┐     ┌──────────┐  │ │
  │ │   │ PENDING  │ ──▶ │ IN_PROGRESS │ ──▶ │ REVIEW  │ ──▶ │ DELIVERED│  │ │
  │ │   └──────────┘     └─────────────┘     └─────────┘     └──────────┘  │ │
  │ │                        │                                     ▲         │ │
  │ │                        │                                     │         │ │
  │ │                        └─────────────────────────────────────┘         │ │
  │ │                                 (Revision Loop)                        │ │
  │ │                                                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ DESIGN DELIVERY                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Design completed and uploaded                                         │ │
  │ │ Client notified for approval                                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Approval at /design/approvals                                       │ │
  │ │ Final delivered and archived                                          │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ METRICS                                                                  │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Turnaround time tracked at /design/metrics/turnaround               │ │
  │ │ Average time per request type                                         │ │
  │ │ Design team performance metrics                                       │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Design Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/design` | Design Dashboard | Overview, quick stats |
| `/design/daily-planner` | Daily Planner | Daily task planning |
| `/design/calendar` | Design Calendar | Calendar view |
| `/design/requests` | All Requests | View all requests |
| `/design/requests/pending` | Pending Review | Review queue |
| `/design/requests/in-progress` | In Progress | Active work |
| `/design/print` | Print Designing | Print designs |
| `/design/digital` | Digital Graphics | Digital work |
| `/design/branding` | Branding | Brand identity work |
| `/design/thumbnails` | Thumbnails | Video thumbnails |
| `/design/delivered` | Delivered | Completed designs |
| `/design/approvals` | Client Approvals | Client sign-off |
| `/design/metrics` | Design Metrics | Performance metrics |

---

## 13. MANAGER/OPERATIONS

### Manager Overview Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MANAGER DASHBOARD WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ OVERVIEW SECTIONS                                                        │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ • Client health across all departments                               │ │
  │ │ • Team performance metrics                                           │ │
  │ │ • Escalations requiring attention                                    │ │
  │ │ • Task completion rates                                               │ │
  │ │ • Financial overview (revenue, outstanding)                          │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ MASH TASK MANAGEMENT                                                     │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Operations tasks at /manager/operations/mash-tasks                   │ │
  │ │ Cross-department coordination                                         │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CLIENT ESCALATIONS                                                       │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ View at /manager/clients/escalations                                 │ │
  │ │ Priority-based resolution                                             │ │
  │ │ Escalation history tracked                                            │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ TEAM MANAGEMENT                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ View at /team                                                        │ │
  │ │ • Department structure                                                │ │
  │ │ • Capacity planning                                                   │ │
  │ │ • Performance reviews                                                 │ │
  │ │ • Role assignments                                                    │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Manager Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/manager` | Manager Dashboard | Overview, all metrics |
| `/manager/clients/escalations` | Client Escalations | Handle escalations |
| `/manager/operations/mash-tasks` | MASH Tasks | Operations tasks |
| `/team` | Team Management | Team overview |
| `/directory` | Team Directory | Employee directory |
| `/performance` | Performance | Performance tracking |

---

## 14. LEARNING & DEVELOPMENT

### Learning Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LEARNING SYSTEM WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ LEARNING RESOURCE ACCESS                                                 │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Employee accesses /academy or /learning                              │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Browse available resources                                           │ │
  │ │ Watch videos, read materials                                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Progress tracked: POST /api/learning/log                             │ │
  │ │ { resourceId, progress, timeSpent }                                  │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ LEARNING VERIFICATION                                                    │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ HR verifies learning completion                                       │ │
  │ │ POST /api/learning/verification                                       │ │
  │ │ { userId, resourceId, verified }                                      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ LearningAudit trail created                                           │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │影响到绩效评分 (Affects performance score)                              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ APPRAISAL TRIGGERS                                                       │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Monthly learning hours tracked                                        │ │
  │ │ Minimum: 6 hours/month                                                │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ If < 6 hours for 2+ months:                                          │ │
  │ │   - Appraisal date pushed back                                       │ │
  │ │   - Notification to employee                                         │ │
  │ │   - HR notified                                                       │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Learning Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/academy` | Academy Dashboard | Learning overview |
| `/academy/calendar` | Academy Calendar | Scheduled learning |
| `/learning` | Learning Dashboard | All resources |
| `/learning/resources` | Learning Resources | Browse resources |

---

## 15. MEETINGS & CALENDAR

### Meeting Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MEETING WORKFLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ MEETING CREATION                                                          │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ User goes to /meetings/new                                            │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Select: Type, Title, Date/Time, Duration, Attendees                 │ │
  │ │ POST /api/meetings                                                    │ │
  │ │ { title, type, dateTime, duration, attendees[], clientId }           │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Meeting created                                                       │ │
  │ │ Participants notified                                                 │ │
  │ │ Calendar updated                                                      │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ MEETING TYPES                                                            │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ DAILY         → Daily standup/huddle                                 │ │
  │ │ TACTICAL      → KPI/tactical review                                  │ │
  │ │ STRATEGIC     → Strategic planning                                   │ │
  │ │ CLIENT        → Client meetings                                      │ │
  │ │ INTERNAL      → Internal team meetings                               │ │
  │ │ INTERVIEW     → HR interviews                                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ TACTICAL MEETINGS                                                        │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ /meetings/tactical or /meetings/tactical-sheet                      │ │
  │ │ KPI review focused                                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Action items created from meeting                                    │ │
  │ │ Follow-up tracked                                                     │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CALENDAR SYNC                                                            │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ All meetings appear in /calendar                                     │ │
  │ │ Department-specific calendars:                                       │ │
  │ │ • /hr/calendar                                                       │ │
  │ │ • /accounts/calendar                                                 │ │
  │ │ • /web/calendar                                                      │ │
  │ │ • etc.                                                               │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Meeting Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/meetings` | All Meetings | View all meetings |
| `/meetings/daily` | Daily Meetings | Daily standups |
| `/meetings/tactical` | Tactical Meetings | KPI reviews |
| `/meetings/tactical-sheet` | KPI Sheet | KPI tracking |
| `/meetings/department-tactical` | Dept Tactical | Department reviews |
| `/meetings/ops-tactical` | Ops Tactical | Operations reviews |
| `/meetings/strategic` | Strategic Meetings | Strategy meetings |
| `/meetings/kpi` | KPI Meetings | KPI reviews |
| `/meetings/new` | New Meeting | Create meeting |
| `/calendar` | Global Calendar | All events |

---

## 16. CLIENT PORTAL

### Client Portal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT PORTAL WORKFLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CLIENT LOGIN                                                             │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Client visits /client-login                                           │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Enter email → POST /api/client-portal/magic-login                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Magic link sent to email                                              │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Click link → Validated → Session created                             │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Redirect to /portal (Client Portal Dashboard)                        │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ PORTAL DASHBOARD                                                         │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ GET /api/client-portal/dashboard                                      │ │
  │ │ Returns:                                                             │ │
  │ │ • Active projects and progress                                        │ │
  │ │ • Recent deliverables                                                 │ │
  │ │ • Outstanding invoices                                                │ │
  │ │ • Upcoming meetings                                                   │ │
  │ │ • Team contacts                                                       │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ KEY PORTAL FEATURES                                                      │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │                                                                        │ │
  │ │ 📊 Dashboard      → Overview of all client data                      │ │
  │ │ 📋 Goals         → View agreed goals/targets                         │ │
  │ │ 🐛 Issues        → Raise and track issues                            │ │
  │ │ 💰 Invoices      → View and pay invoices                             │ │
  │ │ 📅 Meetings       → View scheduled meetings                           │ │
  │ │ 📁 Documents     → Access shared documents                            │ │
  │ │ 💳 Payments      → Payment history and due                           │ │
  │ │ ✅ Approvals      → Approve deliverables                             │ │
  │ │ 💬 Feedback       → Send feedback                                     │ │
  │ │ 🎫 Support       → Raise support tickets                             │ │
  │ │ 📈 Deliverables   → View delivered work                               │ │
  │ │ 🔐 Credentials    → Access shared credentials                         │ │
  │ │ 📢 Announcements  → Company announcements                            │ │
  │ │ 🔔 Notifications  → Alerts and updates                               │ │
  │ │ 📊 Ads Metrics    → View ad performance                              │ │
  │ │                                                                 │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ APPROVAL WORKFLOW                                                        │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Team delivers work → Creates approval request                        │ │
  │ │ Client notified via portal + email                                    │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Client reviews at /portal/approvals                                  │ │
  │ │ Approve or request revision                                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/client-portal/approvals                                    │ │
  │ │ { status: 'APPROVED' | 'REVISION_REQUESTED' }                       │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ ISSUE TRACKING                                                           │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Client raises issue → POST /api/client-portal/tickets                │ │
  │ │ { title, description, priority }                                     │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Issue created in Prisma                                              │ │
  │ │ Assigned to relevant team member                                     │ │
  │ │ Client can track progress                                             │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Client Portal Pages

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/client-login` | Client Login | Magic link login |
| `/portal` | Client Dashboard | Overview |
| `/portal/goals` | Goals | View goals |
| `/portal/issues` | Issues | Raise tracking issues |
| `/portal/invoices` | Invoices | View/pay invoices |
| `/portal/meetings` | Meetings | View scheduled |
| `/portal/documents` | Documents | Access files |
| `/portal/payments` | Payments | Payment history |
| `/portal/approvals` | Approvals | Approve work |
| `/portal/feedback` | Feedback | Send feedback |
| `/portal/tickets` | Support Tickets | Raise tickets |
| `/portal/deliverables` | Deliverables | View deliverables |
| `/portal/credentials` | Credentials | Access credentials |
| `/portal/announcements` | Announcements | View announcements |
| `/portal/work-tracker` | Work Tracker | Track progress |
| `/mykohi-portal` | MyKohi Portal | Alternative portal |

### Client Portal API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/client-portal` | GET | Main portal data |
| `/api/client-portal/dashboard` | GET | Dashboard data |
| `/api/client-portal/goals` | GET | Client goals |
| `/api/client-portal/issues` | GET | Client issues |
| `/api/client-portal/invoices` | GET | Client invoices |
| `/api/client-portal/meetings` | GET | Client meetings |
| `/api/client-portal/activity` | GET | Activity feed |
| `/api/client-portal/documents` | GET | Client documents |
| `/api/client-portal/payments` | GET | Payment info |
| `/api/client-portal/approvals` | GET, POST | Approvals |
| `/api/client-portal/feedback` | GET, POST | Feedback |
| `/api/client-portal/tickets` | GET, POST | Support tickets |
| `/api/client-portal/magic-login` | POST | Magic link login |
| `/api/client-portal/logout` | POST | Logout |

---

## 17. NOTIFICATIONS & COMMUNICATION

### Notification System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ NOTIFICATION CREATION                                                    │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Various triggers create notifications:                                │ │
  │ │ • Task assigned → notifyTaskAssignment()                             │ │
  │ │ • Leave requested → HR notified                                       │ │
  │ │ • Invoice due → Accounts notified                                     │ │
  │ │ • Approval needed → Stakeholder notified                             │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ POST /api/notifications (or internal create)                         │ │
  │ │ { userId, type, title, message, link, priority }                     │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ NOTIFICATION DELIVERY                                                   │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ In-app: Stored in prisma.notification                               │ │
  │ │         Displayed in header bell icon                                │ │
  │ │         Viewable at /notifications                                   │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ WhatsApp: Via notifyTaskAssignment()                                 │ │
  │ │         For urgent/important notifications                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Email: For external stakeholders (clients)                           │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ NOTIFICATION TYPES                                                       │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ TASK           → Task assignment, updates                           │ │
  │ │ LEAVE          → Leave requests, approvals                          │ │
  │ │ MEETING        → Meeting invites, reminders                         │ │
  │ │ INVOICE        → Invoice due, payment received                      │ │
  │ │ APPROVAL       → Approval requests                                  │ │
  │ │ ANNOUNCEMENT   → Company announcements                              │ │
  │ │ SYSTEM         → System alerts, updates                            │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### Communication Features

| Feature | Location | Description |
|---------|----------|-------------|
| MASH Chat | `/mash` | Team messaging |
| Network Posts | `/network` | Company feed |
| Direct Messages | `/messages` | Private messaging |
| WhatsApp Integration | Various | External communication |

---

## 18. REPORTING & ANALYTICS

### Analytics Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REPORTING & ANALYTICS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ ANALYTICS DASHBOARD                                                      │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ /analytics - Overview analytics                                       │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ GET /api/analytics/*                                                │ │
  │ │ Various data sources aggregated                                      │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ DEPARTMENT ANALYTICS                                                     │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ /analytics/calendar    → Calendar analytics                          │ │
  │ │ /analytics/profitability → Client profitability                      │ │
  │ │ /accounts/analytics     → Financial analytics                        │ │
  │ │ /seo/performance/*      → SEO metrics                                │ │
  │ │ /ads/performance/*      → Ad metrics                                 │ │
  │ │ /social/performance/*   → Social engagement                          │ │
  │ │ /sales/performance       → Sales metrics                              │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ REPORTS                                                                  │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ /reports → General reports                                           │ │
  │ │ /sales/reports → Sales reports                                      │ │
  │ │ /finance/reports → Finance reports                                   │ │
  │ │ Various department-specific reports                                  │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

---

## DATABASE MODELS OVERVIEW

### Core Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| `User` | Employee/Freelancer/Intern | id, empId, firstName, lastName, phone, email, role, department, status |
| `Profile` | Extended user data | userId, ndaSigned, policiesAccepted, profilePicture |
| `Client` | Client companies | id, name, status, tier, monthlyFee, healthScore |
| `Task` | Task management | id, title, status, priority, assigneeId, creatorId, clientId, dueDate |
| `LeaveRequest` | Leave management | id, userId, type, startDate, endDate, status |
| `Attendance` | Daily attendance | id, userId, date, status, punchIn, punchOut |
| `Invoice` | Invoice management | id, clientId, amount, status, dueDate, paidAmount |
| `Lead` | Sales leads | id, companyName, stage, value, assigneeId |
| `Meeting` | Meeting scheduling | id, title, dateTime, duration, attendees |
| `Notification` | User notifications | id, userId, type, title, message, read |
| `Post` | Network posts | id, userId, content, likesCount |
| `Comment` | Post comments | id, postId, userId, content |

### Complete Prisma Schema Reference

See `/prisma/schema.prisma` for complete schema with all relationships.

---

## COMPLETE API ENDPOINT REFERENCE

### Authentication
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/magic-link` | POST | Send magic link |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handlers |
| `/api/client-portal/magic-login` | POST | Client login |
| `/api/onboard/[token]` | GET, POST | Onboarding |

### Users & HR
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/users` | GET | List users |
| `/api/hr/employees` | GET | HR employees |
| `/api/hr/leave` | GET, POST | Leave management |
| `/api/hr/leave/[id]` | GET, PATCH | Leave operations |
| `/api/hr/attendance` | GET, POST | Attendance |
| `/api/hr/onboarding` | GET, POST | Onboarding |
| `/api/hr/appraisal` | GET, POST | Appraisals |
| `/api/hr/asset` | GET, POST | Asset management |
| `/api/hr/exit` | GET, POST | Exit process |

### Clients & Sales
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/clients` | GET, POST | Client management |
| `/api/clients/[id]` | GET, PUT, DELETE | Single client |
| `/api/sales/leads` | GET, POST | Lead management |
| `/api/sales/leads/[id]` | GET, PATCH | Single lead |
| `/api/sales/deals` | GET, POST | Deal tracking |
| `/api/sales/meetings` | GET, POST | Sales meetings |
| `/api/sales/proposals` | GET, POST | Proposals |
| `/api/sales/rfp` | GET, POST | RFP management |

### Tasks & Projects
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/tasks` | GET, POST | Task management |
| `/api/tasks/[id]` | GET, PATCH, DELETE | Single task |
| `/api/projects` | GET, POST | Project management |
| `/api/issues` | GET, POST | Issue tracking |
| `/api/goals` | GET, POST | Goal management |

### Finance & Accounts
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/invoices` | GET, POST | Invoice management |
| `/api/invoices/[id]` | GET, PATCH | Single invoice |
| `/api/accounts/auto-invoice/*` | Various | Auto invoice |
| `/api/accounts/bank-statements/*` | Various | Bank statements |
| `/api/accounts/expenses/*` | Various | Expenses |
| `/api/accounts/finance-stats` | GET | Financial stats |
| `/api/accounts/aging-report` | GET | Aging report |

### Department APIs

**SEO:**
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/seo/tasks` | GET, POST | SEO tasks |
| `/api/seo/content` | GET, POST | Content |
| `/api/seo/backlinks` | GET, POST | Backlinks |
| `/api/qc/reviews` | GET, POST | QC reviews |

**Ads:**
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/ads/campaigns` | GET, POST | Campaigns |
| `/api/ads/creatives` | GET, POST | Creatives |
| `/api/ads/leads` | GET | Leads |
| `/api/ads/budget` | GET, POST | Budget |

**Social:**
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/social/dashboard` | GET | Dashboard |
| `/api/social/posts` | GET, POST | Posts |
| `/api/social/approvals` | GET, POST | Approvals |
| `/api/social/content-ideas` | GET, POST | Ideas |

**Web:**
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/web/projects` | GET, POST | Projects |
| `/api/web/bugs` | GET, POST | Bugs |
| `/api/web/requests` | GET, POST | Requests |
| `/api/web/escalations` | GET, POST | Escalations |

### Client Portal
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/client-portal` | GET | Main portal |
| `/api/client-portal/dashboard` | GET | Dashboard |
| `/api/client-portal/goals` | GET | Goals |
| `/api/client-portal/issues` | GET | Issues |
| `/api/client-portal/invoices` | GET | Invoices |
| `/api/client-portal/approvals` | GET, POST | Approvals |
| `/api/client-portal/tickets` | GET, POST | Tickets |
| `/api/client-portal/feedback` | GET, POST | Feedback |
| `/api/client-portal/activity` | GET | Activity |

### Cron Jobs
| Endpoint | Schedule | Description |
|----------|----------|-------------|
| `/api/cron/hr-notifications` | Daily | HR reminders |
| `/api/cron/sync-integrations` | Daily | Sync external |
| `/api/cron/credential-health` | Daily | Check credentials |
| `/api/cron/tactical-reminder` | Daily | Tactical reminders |
| `/api/cron/invoice-overdue` | Daily | Check overdue |

---

## DATA FLOW DIAGRAMS

### Task Creation to Notification Flow

```
User                    UI                    API                   Database              Notification
 │                      │                     │                       │                      │
 │  Click "Create Task" │                     │                       │                      │
 │─────────────────────>│                     │                       │                      │
 │                      │                     │                       │                      │
 │                      │  POST /api/tasks    │                       │                      │
 │                      │────────────────────>│                       │                      │
 │                      │                     │                       │                      │
 │                      │                     │  Validate & Create     │                      │
 │                      │                     │──────────────────────>│                      │
 │                      │                     │                       │                      │
 │                      │                     │  <Task Created>        │                      │
 │                      │                     │<──────────────────────│                      │
 │                      │                     │                       │                      │
 │                      │                     │  Create Notification  │                      │
 │                      │                     │──────────────────────>│                      │
 │                      │                     │                       │                      │
 │                      │                     │                       │  Store Notification  │
 │                      │                     │                       │─────────────────────>│
 │                      │                     │                       │                       │
 │                      │                     │                       │  Send WhatsApp       │
 │                      │                     │                       │─────────────────────>│
 │                      │                     │                       │                       │
 │                      │  Response          │                       │                      │
 │                      │<────────────────────│                       │                      │
 │                      │                     │                       │                      │
 │  Show Success Toast  │                     │                       │                      │
 │<─────────────────────│                     │                       │                      │
```

### Client Onboarding Flow

```
Sales Team              Accounts Team            Client              Database
    │                        │                     │                    │
    │ Won Deal               │                     │                    │
    │<───────────────────────│                     │                    │
    │                        │                     │                    │
    │ Create Handover        │                     │                    │
    │───────────────────────>│                     │                    │
    │                        │                     │                    │
    │                        │ Start Onboarding    │                    │
    │                        │────────────────────>│                    │
    │                        │                     │                    │
    │                        │                     │  Complete Form      │
    │                        │                     │<────────────────────│
    │                        │                     │                    │
    │                        │                     │  Contract Signed    │
    │                        │                     │<────────────────────│
    │                        │                     │                    │
    │                        │  Client Activated  │                    │
    │                        │───────────────────>│                    │
    │                        │                     │                    │
    │                        │                     │  Welcome Email      │
    │                        │                     │<────────────────────│
    │                        │                     │                    │
    │                        │  Assign Team        │                    │
    │                        │────────────────────>│                    │
    │                        │                     │                    │
    │                        │                     │  Portal Access      │
    │                        │                     │<────────────────────│
```

---

## SUMMARY STATISTICS

| Category | Count |
|----------|-------|
| Dashboard Pages | 80+ |
| API Endpoints | 150+ |
| Navigation Components | 11 |
| Database Models | 100+ |
| User Roles | 15+ |
| Departments | 10+ |

---

## ENDPOINTS BY DEPARTMENT

### ACCOUNTS: 40+ endpoints
- Client management, invoices, payments, bank statements, expenses, auto-invoice, budgets, reporting

### HR: 25+ endpoints
- Employees, leave, attendance, onboarding, appraisals, assets, exit, training

### SALES: 20+ endpoints
- Leads, deals, meetings, proposals, RFPs, handovers

### SEO: 15+ endpoints
- Tasks, content, backlinks, quality, GBP, YouTube

### ADS: 15+ endpoints
- Campaigns, creatives, leads, budget, performance

### SOCIAL: 15+ endpoints
- Posts, approvals, metrics, content ideas, publishing

### WEB: 15+ endpoints
- Projects, bugs, requests, escalations, domains, hosting

### DESIGN: 10+ endpoints
- Requests, approvals, metrics

### CLIENT PORTAL: 25+ endpoints
- Dashboard, goals, issues, invoices, approvals, tickets, feedback

---

## 19. ADDITIONAL FEATURES DISCOVERED IN RECHECK

### 19.1 ADMIN DASHBOARD (`/admin`)

Full-featured admin panel with user management, system settings, and monitoring.

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/admin` | Admin Dashboard | Stats, user overview, system health |
| `/admin/users` | User Management | CRUD operations on all users |
| `/admin/roles` | Role Management | Define and modify roles |
| `/admin/departments` | Department Management | Manage departments |
| `/admin/sessions` | Session Management | Active sessions, impersonation |
| `/admin/magic-links` | Magic Link Management | Generate and manage magic links |
| `/admin/branding-magic-links` | Branding Links | Company branding magic links |
| `/admin/notifications` | Notification Management | System-wide notifications |
| `/admin/reports` | Admin Reports | System reports and analytics |
| `/admin/settings` | System Settings | Application configuration |
| `/admin/audit-log` | Audit Log | All admin actions logged |
| `/admin/api-management` | API Management | API key and access management |
| `/admin/bulk-ops` | Bulk Operations | Batch user operations |
| `/admin/custom-roles` | Custom Roles | Define custom role sets |
| `/admin/client-access-requests` | Access Requests | Manage client access |
| `/admin/client-assignments` | Client Assignments | Team member assignments |
| `/admin/freelancers` | Freelancer Management | Manage freelancers |
| `/admin/vendors` | Vendor Management | Manage vendors |
| `/admin/entities` | Company Entities | Manage company entities |
| `/admin/embed-forms` | Embed Forms | Embedded form configurations |
| `/admin/clients` | Client Management | Admin-level client control |
| `/admin/leads` | Lead Management | Admin-level lead control |
| `/admin/rfp` | RFP Management | Admin-level RFP management |

### 19.2 MASH CHAT SYSTEM (`/mash`)

Real-time team messaging and collaboration.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MASH CHAT WORKFLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ CHANNEL TYPES                                                             │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ • Company-wide (MASH) - Announcements channel                        │ │
  │ │ • Department channels - team-seo, team-ads, team-social, etc.       │ │
  │ │ • Public channels - Open for all members                              │ │
  │ │ • Private channels - Invite only                                      │ │
  │ │ • Direct Messages - 1:1 conversations                                 │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ MESSAGING FLOW                                                           │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ POST /api/mash/messages                                              │ │
  │ │ { channelId, content, attachments }                                │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ prisma.chatMessage.create()                                          │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Real-time delivery via polling/SSE                                   │ │
  │ │ Unread counts updated                                                │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### 19.3 NETWORK / COMPANY FEED (`/network`)

Internal social network for company updates and posts.

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/network` | Network Feed | View/create posts, likes, comments |
| `/network/[postId]` | Single Post | View post with comments |

**Features:**
- Create posts with text, images
- Like/unlike posts
- Comment on posts
- Pin important posts
- Department groups
- Trending tags

### 19.4 KNOWLEDGE BASE (`/knowledge`)

Company knowledge base with FAQs and policies.

| Route | Description | Key Actions |
|-------|-------------|-------------|
| `/knowledge` | Knowledge Base | Browse FAQs and policy chapters |

**Data Flow:**
```
User → /knowledge → Load faqEntries + policyChapters → Client-side filtering → View content
```

### 19.5 ARCADE / GAMIFICATION (`/arcade`)

Gamification system with points, rewards, and leaderboard.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARCADE/GAMIFICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ POINT EARNING                                                             │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Achievements trigger ArcadePointTransaction                         │ │
  │ │ Points types: EARN, BONUS, REDEEM, ADJUSTMENT                      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ Categories: CERTIFICATION, TESTIMONIAL, REFERRAL, SLA_BREACH,      │ │
  │ │            POLICY_VIOLATION, ATTENDANCE, PERFORMANCE                │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ REWARD REDEMPTION                                                         │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ ArcadeReward catalog: GIFT_CARD, EXPERIENCE, GADGET, TIME_OFF      │ │
  │ │         │                                                            │ │
  │ │         ▼                                                            │ │
  │ │ User browses rewards → Redeem points → ArcadeRedemption created    │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘

                                    ▼

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ LEADERBOARD                                                               │
  │ ┌──────────────────────────────────────────────────────────────────────┐ │
  │ │ Points aggregated per user                                           │ │
  │ │ Ranked by total earned                                               │ │
  │ │ Shows department breakdown                                           │ │
  │ └──────────────────────────────────────────────────────────────────────┘ │
  └──────────────────────────────────────────────────────────────────────────┘
```

### 19.6 IDEAS PORTAL (`/ideas`)

Employee ideas submission and voting system.

```
User → /ideas → Submit idea (title, description, category)
                    ↓
            prisma.idea.create()
                    ↓
            Other users vote (upvote/downvote)
                    ↓
            Status: SUGGESTED → UNDER_REVIEW → APPROVED → IMPLEMENTED
```

### 19.7 RECOGNITION WALL (`/recognition`)

Team recognition and appreciation system.

| Type | Icon | Description |
|------|------|-------------|
| APPRECIATION | Party | General appreciation |
| EMPLOYEE_OF_MONTH | Trophy | Monthly recognition |
| TOP_PERFORMER | Star | Performance recognition |
| INNOVATION | Lightbulb | Innovation awards |
| CLIENT_PRAISE | Heart | Client-positive feedback |

**Features:**
- Give recognition with XP rewards
- Monthly stats tracking
- Employee of the month selection
- Public recognition feed

### 19.8 SETTINGS (`/settings`)

User profile and preferences management.

| Section | Description |
|---------|-------------|
| Profile | Name, email, phone, department |
| Avatar | Profile picture upload |
| Social | LinkedIn, bio, skills |
| Security | Password change, 2FA |
| Notifications | Notification preferences |
| Preferences | Theme, language |

### 19.9 WORK TRACKER (`/work-tracker`)

Track work time and productivity.

```
User → /work-tracker → View assignments
                    ↓
            Track time per task
                    ↓
            WorkEntry records created
                    ↓
            Reports generated
```

### 19.10 OPERATIONS (`/operations`)

Operations management and tactical tracking.

| Route | Description |
|-------|-------------|
| `/operations` | Operations Dashboard |
| `/operations/calendar` | Operations calendar |
| `/operations/onboarding` | Pending onboardings |
| `/operations/tactical-tracker` | Tactical goal tracking |

**Tactical Tracker Flow:**
```
Operations Head → Track tactical goals across departments
                    ↓
            Client scope view (retainer, services)
                    ↓
            Role-based views (Manager, Sales, Accounts, HR)
                    ↓
            Department performance metrics
```

### 19.11 PERFORMANCE TRACKING (`/performance`)

Employee performance metrics and achievements.

| Route | Description |
|-------|-------------|
| `/performance` | Performance Dashboard |
| `/performance/achievements` | Achievement management |
| `/performance/deliverables` | Deliverables tracking |
| `/performance/goals` | Goal hierarchy |
| `/performance/Leaderboard` | Team leaderboard |
| `/performance/calendar` | Performance calendar |

### 19.12 FREELANCER PORTAL (`/freelancer`)

Freelancer-specific dashboard.

| Route | Description |
|-------|-------------|
| `/freelancer` | Freelancer Dashboard |
| `/freelancer/work-reports` | Log work hours |
| `/freelancer/payments` | Payment history |

### 19.13 INTERN SECTION (`/intern`)

Intern-specific resources and tracking.

| Route | Description |
|-------|-------------|
| `/intern` | Intern Dashboard |
| `/intern/handbook` | Intern handbook |

### 19.14 CLIENT MANAGEMENT (`/clients`)

Client overview and management (separate from accounts).

| Route | Description |
|-------|-------------|
| `/clients` | Client List with health scores |
| `/clients/[clientId]` | Single client view |
| `/clients/communication` | Client communications |
| `/clients/guidelines` | Service guidelines |
| `/clients/lifecycle` | Client lifecycle stages |
| `/clients/questionnaire` | Client onboarding questionnaire |
| `/clients/rfp` | Client RFP submissions |

### 19.15 PROJECTS (`/projects`)

Project management across all clients.

| Route | Description |
|-------|-------------|
| `/projects` | Projects overview with task stats |

### 19.16 HIRING PIPELINE (`/hiring`)

Candidate tracking through hiring process.

| Route | Description |
|-------|-------------|
| `/hiring` | Hiring Pipeline |
| `/hiring/candidates` | Candidate spreadsheet |
| `/hiring/new` | Add new candidate |

### 19.17 TEAM DIRECTORY (`/team`)

Team members listing and directory.

| Route | Description |
|-------|-------------|
| `/team` | Team member grid/list |
| `/team/org-chart` | Organization chart |

### 19.18 FILES & DOCUMENTS (`/files`)

File management and document vault.

### 19.19 VENDORS (`/vendors`)

Vendor management system.

### 19.20 INTERNAL TOOLS (`/internal-tools`)

Internal company tools access.

### 19.21 GLOSSARY (`/glossary`)

Company terminology and definitions.

### 19.22 GUIDEBOOK (`/guidebook`)

Company guidebook and procedures.

### 19.23 MY DAY (`/my-day`)

Personal daily planning and task view.

### 19.24 SEARCH (`/search`)

Global search across the platform.

### 19.25 POLICIES (`/policies`)

Company policies and employee agreements.

| Route | Description |
|-------|-------------|
| `/policies` | Policies list |
| `/policies/employee-agreement` | Employee agreement |

### 19.26 TESTIMONIALS (`/testimonials`)

Video testimonials management.

### 19.27 PROFILE (`/profile`)

User profile viewing.

### 19.28 REPORTS (`/reports`)

General reporting dashboard.

### 19.29 TRAINING (`/training`)

Training resources and management.

### 19.30 CONTENT MANAGEMENT (`/content`)

Content calendar and management.

| Route | Description |
|-------|-------------|
| `/content` | Content Dashboard |
| `/content/calendar` | Content calendar |
| `/content/campaigns` | Content campaigns |
| `/content/templates` | Content templates |

### 19.31 COMMUNICATIONS (`/communications`)

Communications calendar and management.

### 19.32 PAYMENTS (`/payments`)

Payment tracking and management.

### 19.33 INVOICES (`/invoices`)

Invoice management (standalone view).

### 19.34 ALL-ACCESS (`/all-access`)

Special access dashboard for multi-department users.

### 19.35 BLENDED DASHBOARD (`/blended`)

Blended/multi-department user dashboard.

---

## 20. COMPLETE PAGE COUNT BY DEPARTMENT

| Department | Page Count |
|------------|-----------|
| Admin | 25+ |
| Accounts | 50+ |
| HR | 35+ |
| Sales | 25+ |
| SEO | 20+ |
| Ads | 15+ |
| Social | 20+ |
| Web | 15+ |
| Design | 12+ |
| Operations | 10+ |
| Dashboard (root) | 20+ |
| **TOTAL** | **250+ pages** |

---

## 21. ALL API ENDPOINTS BY CATEGORY

### Authentication & Users: 25+ endpoints
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/auth/magic-link` - Magic link authentication
- `/api/users` - User CRUD operations
- `/api/users/[id]` - Single user operations
- `/api/users/bulk` - Bulk user operations
- `/api/users/search` - User search
- `/api/admin/sessions` - Session management
- `/api/admin/audit-log` - Audit logging
- `/api/admin/magic-links` - Magic link management

### HR: 30+ endpoints
- `/api/hr/employees` - Employee management
- `/api/hr/leave` - Leave requests
- `/api/hr/leave/[id]` - Leave operations
- `/api/hr/attendance` - Attendance tracking
- `/api/hr/onboarding` - Onboarding management
- `/api/hr/appraisal` - Appraisal system
- `/api/hr/training` - Training management
- `/api/hr/interviews` - Interview scheduling
- `/api/hr/candidates` - Candidate management
- `/api/hr/assets` - Asset management
- `/api/hr/exit` - Exit process

### Clients & Sales: 35+ endpoints
- `/api/clients` - Client management
- `/api/clients/[id]` - Single client
- `/api/clients/assignments` - Team assignments
- `/api/sales/leads` - Lead management
- `/api/sales/leads/[id]` - Single lead
- `/api/sales/deals` - Deal tracking
- `/api/sales/proposals` - Proposals
- `/api/sales/rfp` - RFP management
- `/api/crm/[leadId]` - CRM operations

### Tasks & Projects: 20+ endpoints
- `/api/tasks` - Task CRUD
- `/api/tasks/[id]` - Single task
- `/api/tasks/bulk` - Bulk operations
- `/api/projects` - Project management
- `/api/goals` - Goal management
- `/api/deliverables` - Deliverables tracking

### Finance & Accounts: 45+ endpoints
- `/api/invoices` - Invoice management
- `/api/invoices/[id]` - Single invoice
- `/api/accounts/auto-invoice/*` - Auto invoice
- `/api/accounts/bank-statements/*` - Bank statements
- `/api/accounts/expenses/*` - Expense tracking
- `/api/accounts/payments` - Payment tracking
- `/api/accounts/aging-report` - Aging reports
- `/api/accounts/finance-stats` - Financial stats

### Department APIs: 100+ endpoints
- SEO: `/api/seo/*` - 15+ endpoints
- Ads: `/api/ads/*` - 15+ endpoints
- Social: `/api/social/*` - 15+ endpoints
- Web: `/api/web/*` - 15+ endpoints
- Design: `/api/design/*` - 10+ endpoints
- Content: `/api/content/*` - 10+ endpoints

### Client Portal: 25+ endpoints
- `/api/client-portal/*` - Full client portal API
- `/api/portal/*` - Alternative portal API

### Communication: 20+ endpoints
- `/api/mash/*` - Chat messaging
- `/api/network/*` - Social network
- `/api/notifications/*` - Notifications
- `/api/meetings/*` - Meeting management

### Gamification: 10+ endpoints
- `/api/arcade/*` - Gamification system
- `/api/achievements/*` - Achievements
- `/api/recognition/*` - Recognition

### Cron Jobs: 10+ endpoints
- `/api/cron/hr-notifications` - HR daily tasks
- `/api/cron/sync-integrations` - External sync
- `/api/cron/credential-health` - Health checks
- `/api/cron/tactical-reminder` - Tactical reminders
- `/api/cron/invoice-overdue` - Overdue checks

**TOTAL API ENDPOINTS: 500+**

---

## 22. DATABASE MODELS (Complete Prisma Schema)

### User & Authentication (15+ models)
- User, Profile, LoginSession, ImpersonationSession, MagicLinkToken

### HR & People (20+ models)
- Attendance, LeaveRequest, LeaveBalance, Interview, Candidate
- EmployeeOnboardingChecklist, PIPPlan, ExitProcess, FnFSettlement
- AssetAssignment, Day0Task, LearningLog, LearningVerification

### Clients & Sales (15+ models)
- Client, ClientTeamMember, ClientUser, Lead, LeadActivity
- SalesDeal, SalesMeeting, Proposal, RFP, ClientLifecycle

### Tasks & Projects (10+ models)
- Task, Project, Issue, Goal, DailyTask, DailyTaskPlan

### Finance (15+ models)
- Invoice, RecurringExpense, ExpensePayment, RBC_Pot, BudgetAlert

### Communication (15+ models)
- ChatChannel, ChatMessage, DirectMessage, Post, Comment, Like
- Notification, Meeting, MeetingParticipant, MeetingActionItem

### Gamification (10+ models)
- ArcadePointTransaction, ArcadeRedemption, ArcadeReward
- Achievement, Recognition, Idea, IdeaVote

### Content & Media (10+ models)
- SocialMediaPost, Campaign, SeoTask, SeoContent, SeoBacklink

### Client Portal (10+ models)
- ClientAccessRequest, ClientDeliverable, VideoTestimonial
- PageFeedback, SupportTicket, TicketActivity

### Other (15+ models)
- Quote, Document, DeviceRequest, EmployerBrandingContent
- EngagementActivity, WorkAnniversaryReminder, GoogleDrive

**TOTAL MODELS: 150+**

---

## 23. BUTTON ACTIONS MATRIX

| Button | Location | Action | API Called | Result |
|--------|----------|--------|------------|--------|
| Create Task | /tasks | Opens modal | POST /api/tasks | Task created, notification sent |
| Apply Leave | /hr/leave | Opens modal | POST /api/hr/leave | Leave request created |
| Send Invoice | /accounts/invoices | Confirmation dialog | POST /api/accounts/auto-invoice/send/[id] | Invoice emailed |
| Add Lead | /sales/leads | Opens modal | POST /api/sales/leads | Lead created |
| Create Campaign | /ads/campaigns | Opens modal | POST /api/ads/campaigns | Campaign created |
| Post to Network | /network | Submit form | POST /api/network/post | Post published |
| Give Recognition | /recognition | Opens modal | POST /api/recognition | XP awarded |
| Submit Idea | /ideas | Submit form | POST /api/ideas | Idea submitted |
| Redeem Reward | /arcade | Confirm dialog | POST /api/arcade/redeem | Points deducted |
| Start Timer | /tasks/[id] | Click button | PATCH /api/tasks/[id] | Timer started |
| Approve Leave | /hr/leaves | Click button | PATCH /api/hr/leave/[id] | Leave approved |
| Client Approval | /portal/approvals | Click button | POST /api/client-portal/approvals | Work approved |

---

## 24. NOTIFICATION TRIGGERS

| Event | Notification Type | Recipients |
|-------|-------------------|------------|
| Task Assigned | TASK | Assignee |
| Leave Requested | LEAVE | HR Manager |
| Leave Approved/Rejected | LEAVE | Requester |
| Invoice Due | INVOICE | Accounts team |
| Invoice Overdue | INVOICE | Accounts team |
| Client Approval Needed | APPROVAL | Client |
| Meeting Scheduled | MEETING | All attendees |
| Mention in Chat | CHAT | Mentioned user |
| New Network Post | POST | Followers |
| Recognition Given | RECOGNITION | Recipient |
| Achievement Earned | ACHIEVEMENT | User |
| Goal Completed | GOAL | User, Manager |

---

## 25. ROLE-BASED FEATURE ACCESS

| Feature | SUPER_ADMIN | MANAGER | HR | SALES | ACCOUNTS | SEO | ADS | SOCIAL | WEB | EMPLOYEE |
|---------|-------------|---------|-----|-------|----------|-----|-----|--------|-----|----------|
| Admin Dashboard | ✓ | ✓ | - | - | - | - | - | - | - | - |
| User Management | ✓ | ✓ | - | - | - | - | - | - | - | - |
| All Tasks View | ✓ | ✓ | - | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Own Tasks View | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Leave Management | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Own only |
| Invoice Management | ✓ | ✓ | - | - | ✓ | - | - | - | - | - |
| Client Management | ✓ | ✓ | - | ✓ | ✓ | - | - | - | - | Assigned |
| Lead Management | ✓ | ✓ | - | ✓ | - | - | - | - | - | - |
| Department Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Recognition | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Arcade | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Client Portal Admin | ✓ | ✓ | - | - | ✓ | - | - | - | - | - |
| Reports | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Limited |

---

*Document generated from thorough codebase recheck*
*Last updated: April 2026*
*Total Pages: 250+*
*Total API Endpoints: 500+*
*Total Database Models: 150+*