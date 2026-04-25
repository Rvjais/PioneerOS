# All "Coming Soon" Features Across PioneerOS

## CRITICAL (Broken Functionality)

### 1. Social Media - Plan Post
- **File:** `/src/app/(dashboard)/social/content/planner/page.tsx` (line 107)
- **Issue:** Button shows alert instead of opening modal
- **Fix:** Replace with `setShowPlanModal(true)` and create plan post modal

### 2. Social Media - Add Task
- **File:** `/src/app/(dashboard)/social/tasks/page.tsx` (line 111)
- **Issue:** Alert shown instead of add task functionality
- **Fix:** Wire up add task modal

### 3. Social Media - New Creative Request
- **File:** `/src/app/(dashboard)/social/content/creative-requests/page.tsx` (line 98)
- **Issue:** Alert shown instead of request form
- **Fix:** Enable the new request button with modal

---

## MODALS/PAGES (Full page placeholders)

### Admin Notifications
- **Templates:** `/admin/notifications/templates/page.tsx` (line 24)
- **Scheduled:** `/admin/notifications/scheduled/page.tsx` (line 24)
- **Broadcast/Alert/Clear:** `/admin/notifications/page.tsx` (lines 161, 171, 193)

### Web Module
- **Asset Library:** `/web/design/assets/page.tsx` (line 13)
- **Style Guides:** `/web/design/style-guides/page.tsx` (line 13)
- **Project Invoices:** `/web/billing/invoices/page.tsx` (line 21)
- **AMC Logs:** `/web/amc/logs/page.tsx` (line 13)

### Other
- **Recognition:** `/recognition/page.tsx` (line 107) - Employee of Month
- **Accounts Analytics:** `/accounts/analytics/page.tsx` (line 320) - Unit Economics
- **Settings:** `/settings/SettingsClient.tsx` (line 420) - Notification Preferences

---

## DISABLED BUTTONS (27 total)

### SEO Module (13 buttons)
- `+ New Plan` - `/seo/clients/plans/page.tsx` (line 88)
- `Edit Plan` - `/seo/clients/plans/page.tsx` (line 100)
- `+ Add Issue` - `/seo/deliverables/technical/page.tsx` (line 103)
- Action buttons - `/seo/deliverables/technical/page.tsx` (line 187)
- `Make Changes` - `/seo/quality/approvals/page.tsx` (line 123)
- `View Details` - `/seo/quality/approvals/page.tsx` (line 126)
- `Send Reminder` - `/seo/quality/approvals/page.tsx` (line 134)
- `View Submission` - `/seo/quality/approvals/page.tsx` (line 137)
- `Approve` - `/seo/quality/qc-review/page.tsx` (line 146)
- `Return for Fix` - `/seo/quality/qc-review/page.tsx` (line 149)
- `Preview` - `/seo/quality/qc-review/page.tsx` (line 152)
- `Fix & Resubmit` - `/seo/quality/qc-review/page.tsx` (line 160)
- `+ Create Report` - `/seo/performance/reports/page.tsx` (line 67)
- `Edit Report` - `/seo/performance/reports/page.tsx` (line 128)
- `Preview` - `/seo/performance/reports/page.tsx` (line 131)
- `+ Add Video` - `/seo/youtube/page.tsx` (line 85)

### Social Module (3 buttons)
- `+ New Strategy` - `/social/clients/strategy/page.tsx` (line 71)
- `Edit Strategy` - `/social/clients/strategy/page.tsx` (line 128)
- `Add Task` (modal) - `/social/daily-planner/page.tsx` (line 616)

### ADS Module (5 buttons)
- `+ Add Budget` - `/ads/budget/allocations/page.tsx` (line 125)
- `Adjust Budget` - `/ads/budget/allocations/page.tsx` (line 243)
- `View Campaigns` - `/ads/budget/allocations/page.tsx` (line 246)
- `Download Report` - `/ads/budget/allocations/page.tsx` (line 249)
- `+ Upload Creative` - `/ads/creatives/assets/page.tsx` (line 151)

### HR Module (2 buttons)
- `Submit Referral` - `/hr/referrals/page.tsx` (line 89)
- `Add Training` - `/hr/training/page.tsx` (line 67)

---

## SUMMARY BY PRIORITY

| Priority | Count | Examples |
|----------|-------|----------|
| Critical | 3 | Plan Post, Add Task, New Request (Social) |
| High | 5 | Budget, Upload Creative, New Strategy |
| Medium | 12 | SEO buttons, Reports, YouTube |
| Low | 10 | Admin notifications, Web billing |