# Architecture Report — visualise-it

> Generated on 2026-07-02 | 1587 source files scanned

---

## 📊 Overview

| Metric | Count |
|--------|------:|
| Frontend API Calls | 912 |
| Backend Routes | 986 |
| Database Models | 934 |
| Unused Routes | 783 |
| Unused Models | 756 |
| Database Types | sql, postgresql |

## 🖥️ API Endpoints

| Method | Path | File | Status |
|--------|------|------|--------|
| `POST` | `/api/admin/access-requests` | `admin/access-requests/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/access-requests/:id/send-instructions` | `[id]/send-instructions/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/access-requests/:id/verify` | `[id]/verify/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/api-credentials` | `admin/api-credentials/route.ts` | ✅ Used |
| `POST` | `/api/admin/api-credentials/:id/rotate` | `[id]/rotate/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/api-credentials/:id/verify` | `[id]/verify/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/api-credentials/alerts` | `api-credentials/alerts/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/api-credentials/migrate` | `api-credentials/migrate/route.ts` | ✅ Used |
| `POST` | `/api/admin/api-credentials/re-auth` | `api-credentials/re-auth/route.ts` | ✅ Used |
| `POST` | `/api/admin/branding-magic-link/send` | `branding-magic-link/send/route.ts` | ✅ Used |
| `POST` | `/api/admin/entities` | `admin/entities/route.ts` | ✅ Used |
| `POST` | `/api/admin/entities/:entityId/bank-accounts` | `[entityId]/bank-accounts/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/entities/:entityId/payment-gateways` | `[entityId]/payment-gateways/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/generate-magic-link` | `admin/generate-magic-link/route.ts` | ✅ Used |
| `POST` | `/api/admin/oauth-connections/:id/refresh` | `[id]/refresh/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/oauth-connections/:id/revoke` | `[id]/revoke/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/oauth-connections/:id/verify-access` | `[id]/verify-access/route.ts` | ⚠️ Unused |
| `POST` | `/api/admin/service-accounts` | `admin/service-accounts/route.ts` | ✅ Used |
| `POST` | `/api/admin/users` | `admin/users/route.ts` | ✅ Used |
| `POST` | `/api/admin/view-as` | `admin/view-as/route.ts` | ✅ Used |
| `POST` | `/api/auth/client` | `auth/client/route.ts` | ✅ Used |
| `POST` | `/api/auth/client-magic` | `auth/client-magic/route.ts` | ✅ Used |
| `POST` | `/api/auth/client/logout` | `client/logout/route.ts` | ⚠️ Unused |
| `POST` | `/api/auth/log-login` | `auth/log-login/route.ts` | ⚠️ Unused |
| `POST` | `/api/auth/magic-link` | `auth/magic-link/route.ts` | ✅ Used |
| `POST` | `/api/auth/magic-link/verify` | `magic-link/verify/route.ts` | ✅ Used |
| `POST` | `/api/auth/password/check` | `password/check/route.ts` | ✅ Used |
| `POST` | `/api/auth/password/forgot` | `password/forgot/route.ts` | ⚠️ Unused |
| `POST` | `/api/auth/password/login` | `password/login/route.ts` | ⚠️ Unused |
| `POST` | `/api/auth/password/register` | `password/register/route.ts` | ✅ Used |
| `POST` | `/api/auth/password/reset` | `password/reset/route.ts` | ✅ Used |
| `POST` | `/api/auth/password/reset-with-otp` | `password/reset-with-otp/route.ts` | ✅ Used |
| `POST` | `/api/careers/apply` | `careers/apply/route.ts` | ✅ Used |
| `POST` | `/api/client-portal/invitations/accept` | `invitations/accept/route.ts` | ⚠️ Unused |
| `POST` | `/api/client-portal/logout` | `client-portal/logout/route.ts` | ✅ Used |
| `POST` | `/api/client-portal/survey/public` | `survey/public/route.ts` | ✅ Used |
| `POST` | `/api/clients/:clientId/add-website-module` | `[clientId]/add-website-module/route.ts` | ⚠️ Unused |
| `POST` | `/api/clients/rfp` | `clients/rfp/route.ts` | ⚠️ Unused |
| `POST` | `/api/crm/leads` | `crm/leads/route.ts` | ✅ Used |
| `POST` | `/api/cron/ads/sync` | `ads/sync/route.ts` | ⚠️ Unused |
| `POST` | `/api/cron/clients/health-scores` | `clients/health-scores/route.ts` | ⚠️ Unused |
| `POST` | `/api/cron/hr-notifications` | `cron/hr-notifications/route.ts` | ⚠️ Unused |
| `POST` | `/api/cron/invoice-overdue` | `cron/invoice-overdue/route.ts` | ⚠️ Unused |
| `POST` | `/api/cron/notifications/daily` | `notifications/daily/route.ts` | ⚠️ Unused |
| `POST` | `/api/cron/notifications/monthly` | `notifications/monthly/route.ts` | ⚠️ Unused |
| `POST` | `/api/cron/notifications/weekly` | `notifications/weekly/route.ts` | ⚠️ Unused |
| `POST` | `/api/cron/tactical-reminder` | `cron/tactical-reminder/route.ts` | ⚠️ Unused |
| `POST` | `/api/hr/assessment/:token` | `assessment/[token]/route.ts` | ⚠️ Unused |
| `POST` | `/api/ideas` | `api/ideas/route.ts` | ✅ Used |
| `POST` | `/api/learning/comments` | `learning/comments/route.ts` | ✅ Used |
| `POST` | `/api/magic-link/:token` | `magic-link/[token]/route.ts` | ⚠️ Unused |
| `POST` | `/api/magic-link/generate` | `magic-link/generate/route.ts` | ✅ Used |
| `POST` | `/api/network/comment` | `network/comment/route.ts` | ✅ Used |
| `POST` | `/api/network/like` | `network/like/route.ts` | ✅ Used |
| `POST` | `/api/network/post` | `network/post/route.ts` | ✅ Used |
| `POST` | `/api/onboard/:token/complete` | `[token]/complete/route.ts` | ⚠️ Unused |
| `POST` | `/api/onboarding/:token/confirm` | `[token]/confirm/route.ts` | ⚠️ Unused |
| `POST` | `/api/onboarding/:token/details` | `[token]/details/route.ts` | ⚠️ Unused |
| `POST` | `/api/onboarding/:token/payment` | `[token]/payment/route.ts` | ⚠️ Unused |
| `POST` | `/api/onboarding/:token/service-change-request` | `[token]/service-change-request/route.ts` | ⚠️ Unused |
| `POST` | `/api/onboarding/:token/sla` | `[token]/sla/route.ts` | ⚠️ Unused |
| `POST` | `/api/payments/create-order` | `payments/create-order/route.ts` | ✅ Used |
| `POST` | `/api/payments/offline-request` | `payments/offline-request/route.ts` | ✅ Used |
| `POST` | `/api/payments/verify` | `payments/verify/route.ts` | ✅ Used |
| `POST` | `/api/payments/webhook` | `payments/webhook/route.ts` | ⚠️ Unused |
| `POST` | `/api/proposal/:token/accept` | `[token]/accept/route.ts` | ⚠️ Unused |
| `POST` | `/api/public/join` | `public/join/route.ts` | ✅ Used |
| `POST` | `/api/public/rfp` | `public/rfp/route.ts` | ⚠️ Unused |
| `POST` | `/api/public/rfp-v2` | `public/rfp-v2/route.ts` | ⚠️ Unused |
| `POST` | `/api/rfp` | `api/rfp/route.ts` | ✅ Used |
| `POST` | `/api/rfp/:token` | `rfp/[token]/route.ts` | ⚠️ Unused |
| `POST` | `/api/rfp/submit` | `rfp/submit/route.ts` | ⚠️ Unused |
| `POST` | `/api/saas-tools` | `api/saas-tools/route.ts` | ✅ Used |
| `POST` | `/api/sales/activity` | `sales/activity/route.ts` | ⚠️ Unused |
| `POST` | `/api/sales/deals` | `sales/deals/route.ts` | ✅ Used |
| `POST` | `/api/sales/goals` | `sales/goals/route.ts` | ✅ Used |
| `POST` | `/api/sales/handover` | `sales/handover/route.ts` | ✅ Used |
| `POST` | `/api/sales/leads/:leadId/activities` | `[leadId]/activities/route.ts` | ⚠️ Unused |
| `POST` | `/api/sales/leads/:leadId/nurture` | `[leadId]/nurture/route.ts` | ⚠️ Unused |
| `POST` | `/api/sales/leads/import` | `leads/import/route.ts` | ✅ Used |
| `POST` | `/api/sales/meetings` | `sales/meetings/route.ts` | ✅ Used |
| `POST` | `/api/sales/proposals` | `sales/proposals/route.ts` | ✅ Used |
| `POST` | `/api/sales/rfp` | `sales/rfp/route.ts` | ✅ Used |
| `POST` | `/api/sales/rfp/:token` | `rfp/[token]/route.ts` | ⚠️ Unused |
| `POST` | `/api/web-onboarding/:token` | `web-onboarding/[token]/route.ts` | ⚠️ Unused |
| `POST` | `/api/web-portal/credentials` | `web-portal/credentials/route.ts` | ✅ Used |
| `POST` | `/api/web-portal/maintenance` | `web-portal/maintenance/route.ts` | ✅ Used |
| `POST` | `/api/web-portal/sitemap/:pageId/feedback` | `[pageId]/feedback/route.ts` | ⚠️ Unused |
| `POST` | `/api/web/domains` | `web/domains/route.ts` | ✅ Used |
| `POST` | `/api/web/hosting` | `web/hosting/route.ts` | ✅ Used |
| `POST` | `/api/web/reimbursements` | `web/reimbursements/route.ts` | ✅ Used |
| `PUT` | `/api/magic-link/generate` | `magic-link/generate/route.ts` | ✅ Used |
| `PUT` | `/api/web-portal/credentials` | `web-portal/credentials/route.ts` | ✅ Used |
| `PATCH` | `/api/admin/access-requests/:id` | `access-requests/[id]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/admin/api-credentials/:id` | `api-credentials/[id]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/admin/entities/:entityId` | `entities/[entityId]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/admin/oauth-connections/:id` | `oauth-connections/[id]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/admin/service-accounts/:id` | `service-accounts/[id]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/daily-meeting/tasks/:taskId` | `tasks/[taskId]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/expenses/:id` | `expenses/[id]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/hr/assessment/:token` | `assessment/[token]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/meetings/:meetingId` | `meetings/[meetingId]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/onboard/:token` | `onboard/[token]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/sales/daily-tasks/:taskId` | `daily-tasks/[taskId]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/sales/goals` | `sales/goals/route.ts` | ✅ Used |
| `PATCH` | `/api/sales/handover` | `sales/handover/route.ts` | ✅ Used |
| `PATCH` | `/api/sales/leads/:leadId` | `leads/[leadId]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/sales/leads/:leadId/stage` | `[leadId]/stage/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/sales/meetings/:meetingId` | `meetings/[meetingId]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/sales/proposals` | `sales/proposals/route.ts` | ✅ Used |
| `PATCH` | `/api/sales/proposals/:id` | `proposals/[id]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/web-onboarding/:token` | `web-onboarding/[token]/route.ts` | ⚠️ Unused |
| `PATCH` | `/api/web/domains` | `web/domains/route.ts` | ✅ Used |
| `PATCH` | `/api/web/hosting` | `web/hosting/route.ts` | ✅ Used |
| `PATCH` | `/api/web/reimbursements` | `web/reimbursements/route.ts` | ✅ Used |
| `DELETE` | `/api/admin/access-requests/:id` | `access-requests/[id]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/admin/api-credentials/:id` | `api-credentials/[id]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/admin/cache` | `admin/cache/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/admin/entities/:entityId` | `entities/[entityId]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/admin/entities/:entityId/bank-accounts` | `[entityId]/bank-accounts/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/admin/entities/:entityId/payment-gateways` | `[entityId]/payment-gateways/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/admin/service-accounts/:id` | `service-accounts/[id]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/admin/view-as` | `admin/view-as/route.ts` | ✅ Used |
| `DELETE` | `/api/clients/:clientId/add-website-module` | `[clientId]/add-website-module/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/expenses/:id` | `expenses/[id]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/learning/comments` | `learning/comments/route.ts` | ✅ Used |
| `DELETE` | `/api/sales/daily-tasks/:taskId` | `daily-tasks/[taskId]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/sales/leads/:leadId` | `leads/[leadId]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/sales/meetings/:meetingId` | `meetings/[meetingId]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/sales/proposals/:id` | `proposals/[id]/route.ts` | ⚠️ Unused |
| `DELETE` | `/api/web-portal/credentials` | `web-portal/credentials/route.ts` | ✅ Used |
| `DELETE` | `/api/web/domains` | `web/domains/route.ts` | ✅ Used |
| `DELETE` | `/api/web/hosting` | `web/hosting/route.ts` | ✅ Used |
| `DELETE` | `client_session` | `server/auth/clientAuth.ts` | ⚠️ Unused |
| `DELETE` | `client_session` | `client-portal/logout/route.ts` | ⚠️ Unused |
| `DELETE` | `client_session` | `client/logout/route.ts` | ⚠️ Unused |
| `DELETE` | `viewAsUserId` | `admin/view-as/route.ts` | ⚠️ Unused |
| `GET` | `/api/accounts/aging-report` | `accounts/aging-report/route.ts` | ⚠️ Unused |
| `GET` | `/api/accounts/client-profitability` | `accounts/client-profitability/route.ts` | ⚠️ Unused |
| `GET` | `/api/accounts/discrepancies` | `accounts/discrepancies/route.ts` | ⚠️ Unused |
| `GET` | `/api/accounts/finance-stats` | `accounts/finance-stats/route.ts` | ⚠️ Unused |
| `GET` | `/api/accounts/onboarding-analytics` | `accounts/onboarding-analytics/route.ts` | ✅ Used |
| `GET` | `/api/accounts/payment-automation` | `accounts/payment-automation/route.ts` | ✅ Used |
| `GET` | `/api/accounts/revenue-forecast` | `accounts/revenue-forecast/route.ts` | ✅ Used |
| `GET` | `/api/accounts/tax-compliance` | `accounts/tax-compliance/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/access-requests` | `admin/access-requests/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/access-requests/:id` | `access-requests/[id]/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/api-credentials` | `admin/api-credentials/route.ts` | ✅ Used |
| `GET` | `/api/admin/api-credentials/:id` | `api-credentials/[id]/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/api-credentials/alerts` | `api-credentials/alerts/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/api-credentials/analytics` | `api-credentials/analytics/route.ts` | ✅ Used |
| `GET` | `/api/admin/api-credentials/audit-log` | `api-credentials/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/api-credentials/health` | `api-credentials/health/route.ts` | ✅ Used |
| `GET` | `/api/admin/cache` | `admin/cache/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/entities` | `admin/entities/route.ts` | ✅ Used |
| `GET` | `/api/admin/entities/:entityId` | `entities/[entityId]/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/oauth-connections` | `admin/oauth-connections/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/oauth-connections/:id` | `oauth-connections/[id]/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/service-accounts` | `admin/service-accounts/route.ts` | ✅ Used |
| `GET` | `/api/admin/service-accounts/:id` | `service-accounts/[id]/route.ts` | ⚠️ Unused |
| `GET` | `/api/admin/users` | `admin/users/route.ts` | ✅ Used |
| `GET` | `/api/admin/view-as` | `admin/view-as/route.ts` | ✅ Used |
| `GET` | `/api/auth/client-magic` | `auth/client-magic/route.ts` | ✅ Used |
| `GET` | `/api/auth/log-login` | `auth/log-login/route.ts` | ⚠️ Unused |
| `GET` | `/api/client-portal/invitations/accept` | `invitations/accept/route.ts` | ⚠️ Unused |
| `GET` | `/api/client-portal/magic-login` | `client-portal/magic-login/route.ts` | ⚠️ Unused |
| `GET` | `/api/client-portal/survey/public` | `survey/public/route.ts` | ✅ Used |
| `GET` | `/api/clients/:clientId/tactical-data` | `[clientId]/tactical-data/route.ts` | ⚠️ Unused |
| `GET` | `/api/crm/leads` | `crm/leads/route.ts` | ✅ Used |
| `GET` | `/api/cron/clients/health-scores` | `clients/health-scores/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/credential-health` | `cron/credential-health/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/invoice-overdue` | `cron/invoice-overdue/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/notifications/daily` | `notifications/daily/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/notifications/monthly` | `notifications/monthly/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/notifications/weekly` | `notifications/weekly/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/sync-integrations` | `cron/sync-integrations/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/tactical-reminder` | `cron/tactical-reminder/route.ts` | ⚠️ Unused |
| `GET` | `/api/cron/whatsapp/schedules` | `whatsapp/schedules/route.ts` | ⚠️ Unused |
| `GET` | `/api/debug/pending-users` | `debug/pending-users/route.ts` | ⚠️ Unused |
| `GET` | `/api/expenses` | `api/expenses/route.ts` | ✅ Used |
| `GET` | `/api/expenses/:id` | `expenses/[id]/route.ts` | ⚠️ Unused |
| `GET` | `/api/google-drive/callback` | `google-drive/callback/route.ts` | ⚠️ Unused |
| `GET` | `/api/health` | `api/health/route.ts` | ⚠️ Unused |
| `GET` | `/api/hr/assessment/:token` | `assessment/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/hr/client-names` | `hr/client-names/route.ts` | ✅ Used |
| `GET` | `/api/learning/comments` | `learning/comments/route.ts` | ✅ Used |
| `GET` | `/api/magic-link/:token` | `magic-link/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/magic-link/generate` | `magic-link/generate/route.ts` | ✅ Used |
| `GET` | `/api/manager/dashboard` | `manager/dashboard/route.ts` | ✅ Used |
| `GET` | `/api/manager/departments/:dept` | `departments/[dept]/route.ts` | ⚠️ Unused |
| `GET` | `/api/manager/hr/team-performance` | `hr/team-performance/route.ts` | ✅ Used |
| `GET` | `/api/notifications/whatsapp` | `notifications/whatsapp/route.ts` | ✅ Used |
| `GET` | `/api/onboard/:token` | `onboard/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/onboarding/:token` | `onboarding/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/onboarding/:token/details` | `[token]/details/route.ts` | ⚠️ Unused |
| `GET` | `/api/onboarding/:token/invoice` | `[token]/invoice/route.ts` | ⚠️ Unused |
| `GET` | `/api/onboarding/:token/payment` | `[token]/payment/route.ts` | ⚠️ Unused |
| `GET` | `/api/onboarding/:token/service-change-request` | `[token]/service-change-request/route.ts` | ⚠️ Unused |
| `GET` | `/api/onboarding/:token/sla` | `[token]/sla/route.ts` | ⚠️ Unused |
| `GET` | `/api/proposal/:token` | `proposal/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/rfp/:token` | `rfp/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/saas-tools` | `api/saas-tools/route.ts` | ✅ Used |
| `GET` | `/api/sales/activity` | `sales/activity/route.ts` | ⚠️ Unused |
| `GET` | `/api/sales/analytics` | `sales/analytics/route.ts` | ✅ Used |
| `GET` | `/api/sales/daily-tracker` | `sales/daily-tracker/route.ts` | ⚠️ Unused |
| `GET` | `/api/sales/deals` | `sales/deals/route.ts` | ✅ Used |
| `GET` | `/api/sales/goals` | `sales/goals/route.ts` | ✅ Used |
| `GET` | `/api/sales/handover` | `sales/handover/route.ts` | ✅ Used |
| `GET` | `/api/sales/leads/:leadId` | `leads/[leadId]/route.ts` | ⚠️ Unused |
| `GET` | `/api/sales/leads/:leadId/activities` | `[leadId]/activities/route.ts` | ⚠️ Unused |
| `GET` | `/api/sales/leads/:leadId/nurture` | `[leadId]/nurture/route.ts` | ⚠️ Unused |
| `GET` | `/api/sales/meetings` | `sales/meetings/route.ts` | ✅ Used |
| `GET` | `/api/sales/nurturing/content` | `nurturing/content/route.ts` | ✅ Used |
| `GET` | `/api/sales/proposals` | `sales/proposals/route.ts` | ✅ Used |
| `GET` | `/api/sales/proposals/:id` | `proposals/[id]/route.ts` | ⚠️ Unused |
| `GET` | `/api/sales/rfp` | `sales/rfp/route.ts` | ✅ Used |
| `GET` | `/api/sales/rfp/:token` | `rfp/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/testimonials/user/:userId/badges` | `[userId]/badges/route.ts` | ⚠️ Unused |
| `GET` | `/api/web-onboarding/:token` | `web-onboarding/[token]/route.ts` | ⚠️ Unused |
| `GET` | `/api/web-portal` | `api/web-portal/route.ts` | ✅ Used |
| `GET` | `/api/web-portal/contracts` | `web-portal/contracts/route.ts` | ✅ Used |
| `GET` | `/api/web-portal/credentials` | `web-portal/credentials/route.ts` | ✅ Used |
| `GET` | `/api/web-portal/maintenance` | `web-portal/maintenance/route.ts` | ✅ Used |
| `GET` | `/api/web-portal/sitemap` | `web-portal/sitemap/route.ts` | ✅ Used |
| `GET` | `/api/web-portal/sitemap/:pageId` | `sitemap/[pageId]/route.ts` | ⚠️ Unused |
| `GET` | `/api/web-portal/sitemap/:pageId/feedback` | `[pageId]/feedback/route.ts` | ⚠️ Unused |
| `GET` | `/api/web/clients` | `web/clients/route.ts` | ✅ Used |
| `GET` | `/api/web/domains` | `web/domains/route.ts` | ✅ Used |
| `GET` | `/api/web/hosting` | `web/hosting/route.ts` | ✅ Used |
| `GET` | `/api/web/reimbursements` | `web/reimbursements/route.ts` | ✅ Used |
| `GET` | `accountId` | `[entityId]/bank-accounts/route.ts` | ⚠️ Unused |
| `GET` | `accountId` | `dashboard/[platform]/route.ts` | ⚠️ Unused |
| `GET` | `accountId` | `import/excel/route.ts` | ⚠️ Unused |
| `GET` | `accountType` | `accounts/bank-statements/route.ts` | ⚠️ Unused |
| `GET` | `action` | `(dashboard)/ideas/IdeasClient.tsx` | ⚠️ Unused |
| `GET` | `action` | `api/meetings/route.ts` | ⚠️ Unused |
| `GET` | `action` | `sales/leads/page.tsx` | ⚠️ Unused |
| `GET` | `action` | `client-portal/activity/route.ts` | ⚠️ Unused |
| `GET` | `actionType` | `admin/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `agencyAccessOnly` | `admin/oauth-connections/route.ts` | ⚠️ Unused |
| `GET` | `aggregation` | `ads/spend/route.ts` | ⚠️ Unused |
| `GET` | `alertLevel` | `api/budget-alerts/route.ts` | ⚠️ Unused |
| `GET` | `approvedOnly` | `api/client-deliverables/route.ts` | ⚠️ Unused |
| `GET` | `assignedToId` | `ads/campaigns/route.ts` | ⚠️ Unused |
| `GET` | `assignedToId` | `seo/tasks/route.ts` | ⚠️ Unused |
| `GET` | `assignedToId` | `web/bugs/route.ts` | ⚠️ Unused |
| `GET` | `assigneeId` | `api/tasks/route.ts` | ⚠️ Unused |
| `GET` | `AT_RISK` | `(dashboard)/analytics/page.tsx` | ⚠️ Unused |
| `GET` | `authorization` | `cron/credential-health/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `cron/hr-notifications/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `cron/invoice-overdue/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `cron/sync-integrations/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `cron/tactical-reminder/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `ads/sync/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `clients/health-scores/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `notifications/daily/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `notifications/monthly/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `notifications/weekly/route.ts` | ⚠️ Unused |
| `GET` | `authorization` | `whatsapp/schedules/route.ts` | ⚠️ Unused |
| `GET` | `bankName` | `accounts/bank-statements/route.ts` | ⚠️ Unused |
| `GET` | `batchId` | `import/batches/route.ts` | ⚠️ Unused |
| `GET` | `campaignId` | `ads/ab-tests/route.ts` | ⚠️ Unused |
| `GET` | `campaignId` | `ads/conversions/route.ts` | ⚠️ Unused |
| `GET` | `campaignId` | `ads/spend/route.ts` | ⚠️ Unused |
| `GET` | `campaignId` | `ads/creatives/route.ts` | ⚠️ Unused |
| `GET` | `candidateId` | `hr/interviews/route.ts` | ⚠️ Unused |
| `GET` | `candidateId` | `hr/offers/route.ts` | ⚠️ Unused |
| `GET` | `category` | `api/documents/route.ts` | ⚠️ Unused |
| `GET` | `category` | `api/meetings/route.ts` | ⚠️ Unused |
| `GET` | `category` | `api/saas-tools/route.ts` | ⚠️ Unused |
| `GET` | `category` | `api/work-entries/route.ts` | ⚠️ Unused |
| `GET` | `category` | `social/print-designing/page.tsx` | ⚠️ Unused |
| `GET` | `category` | `client-portal/deliverables/route.ts` | ⚠️ Unused |
| `GET` | `category` | `client-portal/documents/route.ts` | ⚠️ Unused |
| `GET` | `category` | `client-portal/goals/route.ts` | ⚠️ Unused |
| `GET` | `category` | `client-portal/notifications/route.ts` | ⚠️ Unused |
| `GET` | `category` | `client-portal/work-tracker/route.ts` | ⚠️ Unused |
| `GET` | `category` | `expenses/recurring/route.ts` | ⚠️ Unused |
| `GET` | `category` | `bank-statements/[id]/route.ts` | ⚠️ Unused |
| `GET` | `category` | `[clientId]/documents/route.ts` | ⚠️ Unused |
| `GET` | `category` | `nurturing/content/route.ts` | ⚠️ Unused |
| `GET` | `cf-connecting-ip` | `server/security/index.ts` | ⚠️ Unused |
| `GET` | `client_session` | `PioneerOS/src/proxy.ts` | ⚠️ Unused |
| `GET` | `client_session` | `server/auth/clientAuth.ts` | ⚠️ Unused |
| `GET` | `client_session` | `server/auth/clientAuth.ts` | ⚠️ Unused |
| `GET` | `client_session` | `client-portal/logout/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/budget-alerts/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/client-deliverables/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/documents/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/invoices/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/issues/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/maintenance-contracts/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/meetings/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/tasks/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/testimonials/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `api/work-entries/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `embed/support/page.tsx` | ⚠️ Unused |
| `GET` | `clientId` | `accounts/payments/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `admin/access-requests/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `admin/oauth-connections/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `admin/terminations/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/ab-tests/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/analytics/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/budget/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/campaigns/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/conversions/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/creative-requests/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/spend/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `ads/creatives/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `client-portal/data/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `communication/logs/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `communication/schedules/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `hr/employee-feedback/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `integrations/sync/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `social/approvals/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `social/metrics/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `social/posts/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/backlinks/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/client-approvals/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/content/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/gbp/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/keywords/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/reports/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/qc-reviews/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/tasks/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `seo/youtube/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `tactical/posts/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `web/domains/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `web/escalations/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `web/hosting/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `web/reimbursements/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `web/upsells/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `quick-add/assignment/route.ts` | ⚠️ Unused |
| `GET` | `clientId` | `tactical/export/route.ts` | ⚠️ Unused |
| `GET` | `clientStatus` | `auto-invoice/config/route.ts` | ⚠️ Unused |
| `GET` | `code` | `google-drive/callback/route.ts` | ⚠️ Unused |
| `GET` | `code` | `linkedin/callback/route.ts` | ⚠️ Unused |
| `GET` | `code` | `google/callback/route.ts` | ⚠️ Unused |
| `GET` | `code` | `meta/callback/route.ts` | ⚠️ Unused |
| `GET` | `color` | `embed/client-onboarding/page.tsx` | ⚠️ Unused |
| `GET` | `columnMapping` | `import/excel/route.ts` | ⚠️ Unused |
| `GET` | `content` | `components/network/CreatePostForm.tsx` | ✅ Used |
| `GET` | `content` | `components/network/NetworkFeed.tsx` | ✅ Used |
| `GET` | `content` | `(dashboard)/network/actions.ts` | ✅ Used |
| `GET` | `content` | `(dashboard)/network/actions.ts` | ✅ Used |
| `GET` | `content-disposition` | `components/portal/ServiceManagement.tsx` | ⚠️ Unused |
| `GET` | `content-disposition` | `portal/account/page.tsx` | ⚠️ Unused |
| `GET` | `Content-Disposition` | `admin/reports/ReportBuilderClient.tsx` | ⚠️ Unused |
| `GET` | `contentType` | `social/posts/route.ts` | ⚠️ Unused |
| `GET` | `cookie` | `server/auth/clientAuth.ts` | ⚠️ Unused |
| `GET` | `createdBy` | `api/client-deliverables/route.ts` | ⚠️ Unused |
| `GET` | `credentialId` | `api-credentials/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `cursor` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `customRoleId` | `custom-roles/assign/route.ts` | ⚠️ Unused |
| `GET` | `date` | `api/work-entries/route.ts` | ✅ Used |
| `GET` | `date` | `daily/tasks/route.ts` | ✅ Used |
| `GET` | `date` | `daily-meeting/tasks/route.ts` | ✅ Used |
| `GET` | `date` | `hr/attendance/route.ts` | ✅ Used |
| `GET` | `date` | `tasks/daily/route.ts` | ✅ Used |
| `GET` | `days` | `api/celebrations/route.ts` | ⚠️ Unused |
| `GET` | `days` | `hr/work-anniversaries/route.ts` | ⚠️ Unused |
| `GET` | `daysBack` | `integrations/sync/route.ts` | ⚠️ Unused |
| `GET` | `deleteAllRead` | `client-portal/notifications/route.ts` | ⚠️ Unused |
| `GET` | `department` | `api/accountability/route.ts` | ⚠️ Unused |
| `GET` | `department` | `api/department-kpis/route.ts` | ⚠️ Unused |
| `GET` | `department` | `api/goals/route.ts` | ⚠️ Unused |
| `GET` | `department` | `api/org-chart/route.ts` | ⚠️ Unused |
| `GET` | `department` | `api/tasks/route.ts` | ⚠️ Unused |
| `GET` | `department` | `api/users/route.ts` | ⚠️ Unused |
| `GET` | `department` | `hiring/candidates/route.ts` | ⚠️ Unused |
| `GET` | `department` | `hr/employees/route.ts` | ⚠️ Unused |
| `GET` | `department` | `meetings/strategic/route.ts` | ⚠️ Unused |
| `GET` | `department` | `tactical/auto-populate/route.ts` | ⚠️ Unused |
| `GET` | `department` | `expenses/departments/route.ts` | ⚠️ Unused |
| `GET` | `department` | `roi/departments/route.ts` | ⚠️ Unused |
| `GET` | `department` | `assessment/pipeline/route.ts` | ⚠️ Unused |
| `GET` | `dept` | `app/careers/page.tsx` | ⚠️ Unused |
| `GET` | `dept` | `embed/careers/page.tsx` | ⚠️ Unused |
| `GET` | `deviceType` | `devices/admin/route.ts` | ⚠️ Unused |
| `GET` | `employeeId` | `client-portal/work-tracker/route.ts` | ⚠️ Unused |
| `GET` | `employeeId` | `hr/appreciations/route.ts` | ⚠️ Unused |
| `GET` | `employeeId` | `hr/employee-feedback/route.ts` | ⚠️ Unused |
| `GET` | `employeeId` | `hr/escalations/route.ts` | ⚠️ Unused |
| `GET` | `endDate` | `ads/analytics/route.ts` | ⚠️ Unused |
| `GET` | `endDate` | `ads/conversions/route.ts` | ⚠️ Unused |
| `GET` | `endDate` | `ads/spend/route.ts` | ⚠️ Unused |
| `GET` | `endDate` | `client-portal/work-tracker/route.ts` | ⚠️ Unused |
| `GET` | `ENTERPRISE` | `(dashboard)/analytics/page.tsx` | ⚠️ Unused |
| `GET` | `entity` | `accounts/payments/route.ts` | ⚠️ Unused |
| `GET` | `entityId` | `accounts/bank-statements/route.ts` | ⚠️ Unused |
| `GET` | `entityId` | `accounts/reconciliation-summary/route.ts` | ⚠️ Unused |
| `GET` | `entityType` | `accounts/aging-report/route.ts` | ⚠️ Unused |
| `GET` | `error` | `(auth)/login/page.tsx` | ⚠️ Unused |
| `GET` | `error` | `google-drive/callback/route.ts` | ⚠️ Unused |
| `GET` | `error` | `linkedin/callback/route.ts` | ⚠️ Unused |
| `GET` | `error` | `google/callback/route.ts` | ⚠️ Unused |
| `GET` | `error` | `meta/callback/route.ts` | ⚠️ Unused |
| `GET` | `error_description` | `linkedin/callback/route.ts` | ⚠️ Unused |
| `GET` | `error_reason` | `meta/callback/route.ts` | ⚠️ Unused |
| `GET` | `ESCALATION` | `admin/notifications/page.tsx` | ⚠️ Unused |
| `GET` | `eventName` | `ads/conversions/route.ts` | ⚠️ Unused |
| `GET` | `excludeFounders` | `hr/employees/route.ts` | ⚠️ Unused |
| `GET` | `expiring` | `accounts/contracts/route.ts` | ⚠️ Unused |
| `GET` | `expiringWithin` | `web/domains/route.ts` | ⚠️ Unused |
| `GET` | `expiringWithin` | `web/hosting/route.ts` | ⚠️ Unused |
| `GET` | `export` | `dashboard/[platform]/route.ts` | ✅ Used |
| `GET` | `file` | `upload/cloudinary/route.ts` | ✅ Used |
| `GET` | `file` | `import/excel/route.ts` | ✅ Used |
| `GET` | `fileId` | `[id]/upload/route.ts` | ⚠️ Unused |
| `GET` | `folder` | `upload/cloudinary/route.ts` | ⚠️ Unused |
| `GET` | `format` | `tactical/export/route.ts` | ⚠️ Unused |
| `GET` | `format` | `templates/[platform]/route.ts` | ⚠️ Unused |
| `GET` | `freelancerId` | `freelancer/payments/route.ts` | ⚠️ Unused |
| `GET` | `freelancerId` | `freelancer/work-reports/route.ts` | ⚠️ Unused |
| `GET` | `from` | `admin/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `from` | `hr/employer-branding/route.ts` | ⚠️ Unused |
| `GET` | `from` | `hr/engagement-activities/route.ts` | ⚠️ Unused |
| `GET` | `from` | `hr/interviews/route.ts` | ⚠️ Unused |
| `GET` | `from` | `dashboard/[platform]/route.ts` | ⚠️ Unused |
| `GET` | `from` | `dashboard/overview/route.ts` | ⚠️ Unused |
| `GET` | `gatewayId` | `[entityId]/payment-gateways/route.ts` | ⚠️ Unused |
| `GET` | `groupBy` | `social/metrics/route.ts` | ⚠️ Unused |
| `GET` | `GROWTH` | `(dashboard)/analytics/page.tsx` | ⚠️ Unused |
| `GET` | `hard` | `[clientId]/credentials/route.ts` | ⚠️ Unused |
| `GET` | `hard` | `[clientId]/portal-users/route.ts` | ⚠️ Unused |
| `GET` | `hasPortalUser` | `admin/clients/route.ts` | ⚠️ Unused |
| `GET` | `HEALTHY` | `(dashboard)/analytics/page.tsx` | ⚠️ Unused |
| `GET` | `host` | `auth/client-magic/route.ts` | ⚠️ Unused |
| `GET` | `id` | `api/calendar/route.ts` | ⚠️ Unused |
| `GET` | `id` | `api/client-deliverables/route.ts` | ⚠️ Unused |
| `GET` | `id` | `api/documents/route.ts` | ⚠️ Unused |
| `GET` | `id` | `api/quotes/route.ts` | ⚠️ Unused |
| `GET` | `id` | `admin/announcements/route.ts` | ⚠️ Unused |
| `GET` | `id` | `client-portal/credentials/route.ts` | ⚠️ Unused |
| `GET` | `id` | `client-portal/documents/route.ts` | ⚠️ Unused |
| `GET` | `id` | `client-portal/invitations/route.ts` | ⚠️ Unused |
| `GET` | `id` | `client-portal/notifications/route.ts` | ⚠️ Unused |
| `GET` | `id` | `client-portal/termination/route.ts` | ⚠️ Unused |
| `GET` | `id` | `finance/calendar/route.ts` | ⚠️ Unused |
| `GET` | `id` | `learning/comments/route.ts` | ⚠️ Unused |
| `GET` | `id` | `learning/verify/route.ts` | ⚠️ Unused |
| `GET` | `id` | `operations/calendar/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/backlinks/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/client-approvals/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/content/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/gbp/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/keywords/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/reports/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/qc-reviews/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/tasks/route.ts` | ⚠️ Unused |
| `GET` | `id` | `seo/youtube/route.ts` | ⚠️ Unused |
| `GET` | `id` | `web/domains/route.ts` | ⚠️ Unused |
| `GET` | `id` | `web/hosting/route.ts` | ⚠️ Unused |
| `GET` | `id` | `web-portal/credentials/route.ts` | ⚠️ Unused |
| `GET` | `id` | `web/approvals/page.tsx` | ⚠️ Unused |
| `GET` | `id` | `[clientId]/approvals/route.ts` | ⚠️ Unused |
| `GET` | `id` | `[clientId]/credentials/route.ts` | ⚠️ Unused |
| `GET` | `id` | `[clientId]/documents/route.ts` | ⚠️ Unused |
| `GET` | `id` | `[clientId]/goals/route.ts` | ⚠️ Unused |
| `GET` | `id` | `[clientId]/notifications/route.ts` | ⚠️ Unused |
| `GET` | `id` | `[clientId]/portal-users/route.ts` | ⚠️ Unused |
| `GET` | `id` | `attendance/entry/route.ts` | ⚠️ Unused |
| `GET` | `includeAmc` | `web/clients/route.ts` | ⚠️ Unused |
| `GET` | `includeBilling` | `api/projects/route.ts` | ⚠️ Unused |
| `GET` | `includeClients` | `api/org-chart/route.ts` | ⚠️ Unused |
| `GET` | `includeDomains` | `web/clients/route.ts` | ⚠️ Unused |
| `GET` | `includeHosting` | `web/clients/route.ts` | ⚠️ Unused |
| `GET` | `includeInactive` | `auth/sessions/route.ts` | ⚠️ Unused |
| `GET` | `includeInactive` | `[clientId]/platform-accounts/route.ts` | ⚠️ Unused |
| `GET` | `includeLifecycle` | `api/clients/route.ts` | ⚠️ Unused |
| `GET` | `includeProjects` | `web/clients/route.ts` | ⚠️ Unused |
| `GET` | `interviewerId` | `hr/interviews/route.ts` | ⚠️ Unused |
| `GET` | `isEnabled` | `auto-invoice/config/route.ts` | ⚠️ Unused |
| `GET` | `isPublic` | `hr/appreciations/route.ts` | ⚠️ Unused |
| `GET` | `leadId` | `sales/activity/route.ts` | ⚠️ Unused |
| `GET` | `leadId` | `sales/proposals/route.ts` | ⚠️ Unused |
| `GET` | `leadId` | `proposals/new/page.tsx` | ⚠️ Unused |
| `GET` | `leadId` | `rfp/send/page.tsx` | ⚠️ Unused |
| `GET` | `learningLogId` | `learning/verify/route.ts` | ⚠️ Unused |
| `GET` | `level` | `api/goals/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `limit` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `limit` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `limit` | `api/clients/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `api/expenses/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `api/meetings/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `api/notifications/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `accounts/onboarding/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `accounts/payments/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `admin/announcements/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `admin/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `admin/clients/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `admin/entities/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `admin/terminations/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `ads/ab-tests/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `ads/campaigns/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `ads/conversions/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `ads/creative-requests/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `ads/spend/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `ads/creatives/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `auth/log-login/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `auth/sessions/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `client-portal/activity/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `client-portal/announcements/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `client-portal/approvals/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `client-portal/documents/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `client-portal/notifications/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `communication/logs/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `crm/leads/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `design/requests/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `hr/attendance-import/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `hr/employees/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `hr/employee-feedback/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `hr/leave/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `sales/deals/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `social/approvals/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `social/clients/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `social/content-ideas/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `social/metrics/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `social/posts/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/backlinks/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/client-approvals/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/content/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/gbp/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/keywords/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/reports/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/qc-reviews/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/tasks/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `seo/youtube/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `web/bugs/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `web/clients/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `web/domains/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `web/escalations/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `web/hosting/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `web/requests/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `web/upsells/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `api-credentials/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `sessions/history/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `[clientId]/documents/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `[clientId]/notifications/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `import/batches/route.ts` | ⚠️ Unused |
| `GET` | `limit` | `[id]/logs/route.ts` | ⚠️ Unused |
| `GET` | `linkId` | `[id]/link-task/route.ts` | ⚠️ Unused |
| `GET` | `logId` | `learning/log/route.ts` | ⚠️ Unused |
| `GET` | `logId` | `[id]/logs/route.ts` | ⚠️ Unused |
| `GET` | `managerId` | `hr/manager-reviews/route.ts` | ⚠️ Unused |
| `GET` | `matchStatus` | `bank-statements/[id]/route.ts` | ⚠️ Unused |
| `GET` | `MEETING` | `admin/notifications/page.tsx` | ⚠️ Unused |
| `GET` | `meetingId` | `api/meetings/route.ts` | ⚠️ Unused |
| `GET` | `meetingId` | `strategic/peer-review/route.ts` | ⚠️ Unused |
| `GET` | `meetingId` | `tactical/export/route.ts` | ⚠️ Unused |
| `GET` | `memberId` | `[clientId]/team/route.ts` | ⚠️ Unused |
| `GET` | `mode` | `api/quotes/route.ts` | ⚠️ Unused |
| `GET` | `month` | `api/accountability/route.ts` | ⚠️ Unused |
| `GET` | `month` | `api/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `api/client-deliverables/route.ts` | ⚠️ Unused |
| `GET` | `month` | `api/expenses/route.ts` | ⚠️ Unused |
| `GET` | `month` | `api/scorecard/route.ts` | ⚠️ Unused |
| `GET` | `month` | `api/work-entries/route.ts` | ⚠️ Unused |
| `GET` | `month` | `academy/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accountability/achievements/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accountability/deliverables/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accountability/goals/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accounts/bank-statements/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accounts/calendar-events/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accounts/follow-ups/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accounts/payments/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accounts/reconciliation/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accounts/reconciliation-summary/route.ts` | ⚠️ Unused |
| `GET` | `month` | `accounts/tax-compliance/route.ts` | ⚠️ Unused |
| `GET` | `month` | `ads/budget/route.ts` | ⚠️ Unused |
| `GET` | `month` | `analytics/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `analytics/profitability/route.ts` | ⚠️ Unused |
| `GET` | `month` | `client-access/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `client-deliverables/summary/route.ts` | ⚠️ Unused |
| `GET` | `month` | `client-portal/deliverables/route.ts` | ⚠️ Unused |
| `GET` | `month` | `communications/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `content/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `design/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `finance/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `hr/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `integrations/sync/route.ts` | ⚠️ Unused |
| `GET` | `month` | `learning/audit/route.ts` | ⚠️ Unused |
| `GET` | `month` | `meetings/tactical/route.ts` | ⚠️ Unused |
| `GET` | `month` | `operations/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `sales/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `sales/goals/route.ts` | ⚠️ Unused |
| `GET` | `month` | `social/metrics/route.ts` | ⚠️ Unused |
| `GET` | `month` | `social/posts/route.ts` | ⚠️ Unused |
| `GET` | `month` | `tactical/auto-populate/route.ts` | ⚠️ Unused |
| `GET` | `month` | `tactical/kpis/route.ts` | ⚠️ Unused |
| `GET` | `month` | `tactical/posts/route.ts` | ⚠️ Unused |
| `GET` | `month` | `web/calendar/route.ts` | ⚠️ Unused |
| `GET` | `month` | `expenses/departments/route.ts` | ⚠️ Unused |
| `GET` | `month` | `roi/departments/route.ts` | ⚠️ Unused |
| `GET` | `month` | `attendance/sync/route.ts` | ⚠️ Unused |
| `GET` | `month` | `tactical/export/route.ts` | ⚠️ Unused |
| `GET` | `months` | `accounts/client-profitability/route.ts` | ⚠️ Unused |
| `GET` | `months` | `accounts/discrepancies/route.ts` | ⚠️ Unused |
| `GET` | `months` | `daily/history/route.ts` | ⚠️ Unused |
| `GET` | `myRequests` | `api/testimonials/route.ts` | ⚠️ Unused |
| `GET` | `next-auth.session-token` | `auth/sessions/route.ts` | ⚠️ Unused |
| `GET` | `offset` | `client-portal/activity/route.ts` | ⚠️ Unused |
| `GET` | `offset` | `client-portal/announcements/route.ts` | ⚠️ Unused |
| `GET` | `offset` | `client-portal/approvals/route.ts` | ⚠️ Unused |
| `GET` | `offset` | `client-portal/documents/route.ts` | ⚠️ Unused |
| `GET` | `offset` | `client-portal/notifications/route.ts` | ⚠️ Unused |
| `GET` | `offset` | `api-credentials/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `onboarding` | `api/clients/route.ts` | ✅ Used |
| `GET` | `order` | `seo/keywords/route.ts` | ✅ Used |
| `GET` | `origin` | `PioneerOS/src/proxy.ts` | ⚠️ Unused |
| `GET` | `overdue` | `communication/schedules/route.ts` | ⚠️ Unused |
| `GET` | `ownerId` | `api/goals/route.ts` | ⚠️ Unused |
| `GET` | `page` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `page` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `page` | `api/clients/route.ts` | ⚠️ Unused |
| `GET` | `page` | `accounts/onboarding/route.ts` | ⚠️ Unused |
| `GET` | `page` | `admin/clients/route.ts` | ⚠️ Unused |
| `GET` | `page` | `admin/terminations/route.ts` | ⚠️ Unused |
| `GET` | `page` | `ads/ab-tests/route.ts` | ⚠️ Unused |
| `GET` | `page` | `ads/campaigns/route.ts` | ⚠️ Unused |
| `GET` | `page` | `ads/conversions/route.ts` | ⚠️ Unused |
| `GET` | `page` | `ads/creative-requests/route.ts` | ⚠️ Unused |
| `GET` | `page` | `ads/spend/route.ts` | ⚠️ Unused |
| `GET` | `page` | `ads/creatives/route.ts` | ⚠️ Unused |
| `GET` | `page` | `auth/log-login/route.ts` | ⚠️ Unused |
| `GET` | `page` | `crm/leads/route.ts` | ⚠️ Unused |
| `GET` | `page` | `design/requests/route.ts` | ⚠️ Unused |
| `GET` | `page` | `hr/employees/route.ts` | ⚠️ Unused |
| `GET` | `page` | `hr/employee-feedback/route.ts` | ⚠️ Unused |
| `GET` | `page` | `hr/leave/route.ts` | ⚠️ Unused |
| `GET` | `page` | `sales/deals/route.ts` | ⚠️ Unused |
| `GET` | `page` | `social/approvals/route.ts` | ⚠️ Unused |
| `GET` | `page` | `social/clients/route.ts` | ⚠️ Unused |
| `GET` | `page` | `social/content-ideas/route.ts` | ⚠️ Unused |
| `GET` | `page` | `social/metrics/route.ts` | ⚠️ Unused |
| `GET` | `page` | `social/posts/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/backlinks/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/client-approvals/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/content/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/gbp/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/keywords/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/reports/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/qc-reviews/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/tasks/route.ts` | ⚠️ Unused |
| `GET` | `page` | `seo/youtube/route.ts` | ⚠️ Unused |
| `GET` | `page` | `web/bugs/route.ts` | ⚠️ Unused |
| `GET` | `page` | `web/domains/route.ts` | ⚠️ Unused |
| `GET` | `page` | `web/escalations/route.ts` | ⚠️ Unused |
| `GET` | `page` | `web/hosting/route.ts` | ⚠️ Unused |
| `GET` | `page` | `web/requests/route.ts` | ⚠️ Unused |
| `GET` | `page` | `web/upsells/route.ts` | ⚠️ Unused |
| `GET` | `page` | `sessions/history/route.ts` | ⚠️ Unused |
| `GET` | `page` | `[clientId]/documents/route.ts` | ⚠️ Unused |
| `GET` | `page` | `[id]/logs/route.ts` | ⚠️ Unused |
| `GET` | `parentId` | `api/goals/route.ts` | ⚠️ Unused |
| `GET` | `past` | `client-portal/meetings/route.ts` | ⚠️ Unused |
| `GET` | `period` | `accounts/finance-stats/route.ts` | ⚠️ Unused |
| `GET` | `period` | `accounts/performance/route.ts` | ⚠️ Unused |
| `GET` | `period` | `analytics/profitability/route.ts` | ⚠️ Unused |
| `GET` | `period` | `client-portal/goals/route.ts` | ⚠️ Unused |
| `GET` | `period` | `daily/stats/route.ts` | ⚠️ Unused |
| `GET` | `platform` | `admin/oauth-connections/route.ts` | ✅ Used |
| `GET` | `platform` | `ads/analytics/route.ts` | ✅ Used |
| `GET` | `platform` | `ads/budget/route.ts` | ✅ Used |
| `GET` | `platform` | `ads/campaigns/route.ts` | ✅ Used |
| `GET` | `platform` | `ads/conversions/route.ts` | ✅ Used |
| `GET` | `platform` | `ads/spend/route.ts` | ✅ Used |
| `GET` | `platform` | `ads/creatives/route.ts` | ✅ Used |
| `GET` | `platform` | `hr/employer-branding/route.ts` | ✅ Used |
| `GET` | `platform` | `social/metrics/route.ts` | ✅ Used |
| `GET` | `platform` | `social/posts/route.ts` | ✅ Used |
| `GET` | `platform` | `[clientId]/platform-accounts/route.ts` | ✅ Used |
| `GET` | `platform` | `import/batches/route.ts` | ✅ Used |
| `GET` | `position` | `app/careers/page.tsx` | ⚠️ Unused |
| `GET` | `preset` | `dashboard/[platform]/route.ts` | ⚠️ Unused |
| `GET` | `preset` | `dashboard/overview/route.ts` | ⚠️ Unused |
| `GET` | `preview` | `import/csv/route.ts` | ⚠️ Unused |
| `GET` | `preview` | `import/excel/route.ts` | ⚠️ Unused |
| `GET` | `preview` | `import/paste/route.ts` | ⚠️ Unused |
| `GET` | `priority` | `api/issues/route.ts` | ⚠️ Unused |
| `GET` | `priority` | `api/tasks/route.ts` | ⚠️ Unused |
| `GET` | `priority` | `sales/leads/page.tsx` | ⚠️ Unused |
| `GET` | `priority` | `ads/creative-requests/route.ts` | ⚠️ Unused |
| `GET` | `priority` | `social/approvals/route.ts` | ⚠️ Unused |
| `GET` | `priority` | `seo/tasks/route.ts` | ⚠️ Unused |
| `GET` | `priority` | `web/bugs/route.ts` | ⚠️ Unused |
| `GET` | `profileId` | `seo/gbp/route.ts` | ⚠️ Unused |
| `GET` | `projectId` | `embed/bug-report/page.tsx` | ⚠️ Unused |
| `GET` | `projectId` | `web/bugs/route.ts` | ⚠️ Unused |
| `GET` | `projectId` | `web/requests/route.ts` | ⚠️ Unused |
| `GET` | `propertyId` | `[clientId]/properties/route.ts` | ⚠️ Unused |
| `GET` | `provider` | `web/hosting/route.ts` | ⚠️ Unused |
| `GET` | `q` | `api/search/route.ts` | ⚠️ Unused |
| `GET` | `q` | `knowledge/search/route.ts` | ⚠️ Unused |
| `GET` | `quarter` | `api/quarterly-goals/route.ts` | ⚠️ Unused |
| `GET` | `quarter` | `api/work-entries/route.ts` | ⚠️ Unused |
| `GET` | `quarter` | `hr/manager-reviews/route.ts` | ⚠️ Unused |
| `GET` | `quarter` | `meetings/strategic/route.ts` | ⚠️ Unused |
| `GET` | `quarter` | `meetings/quarterly/route.ts` | ⚠️ Unused |
| `GET` | `recent` | `api/users/route.ts` | ⚠️ Unused |
| `GET` | `redirectTo` | `admin/view-as/route.ts` | ⚠️ Unused |
| `GET` | `resourceId` | `learning/comments/route.ts` | ⚠️ Unused |
| `GET` | `reveal` | `client-portal/credentials/route.ts` | ⚠️ Unused |
| `GET` | `revieweeId` | `strategic/peer-review/route.ts` | ⚠️ Unused |
| `GET` | `role` | `sales/handover/route.ts` | ⚠️ Unused |
| `GET` | `roleId` | `admin/custom-roles/route.ts` | ⚠️ Unused |
| `GET` | `scope` | `api/budget-alerts/route.ts` | ⚠️ Unused |
| `GET` | `search` | `api/clients/route.ts` | ⚠️ Unused |
| `GET` | `search` | `api/web-clients/route.ts` | ⚠️ Unused |
| `GET` | `search` | `accounts/proposals/route.ts` | ⚠️ Unused |
| `GET` | `search` | `admin/clients/route.ts` | ⚠️ Unused |
| `GET` | `search` | `ads/campaigns/route.ts` | ⚠️ Unused |
| `GET` | `search` | `client-portal/documents/route.ts` | ⚠️ Unused |
| `GET` | `search` | `hr/employees/route.ts` | ⚠️ Unused |
| `GET` | `search` | `hr/fnf/route.ts` | ⚠️ Unused |
| `GET` | `search` | `social/clients/route.ts` | ⚠️ Unused |
| `GET` | `search` | `social/content-ideas/route.ts` | ⚠️ Unused |
| `GET` | `segment` | `accounts/aging-report/route.ts` | ⚠️ Unused |
| `GET` | `segment` | `accounts/client-profitability/route.ts` | ⚠️ Unused |
| `GET` | `sessionId` | `meetings/ai-extract/route.ts` | ⚠️ Unused |
| `GET` | `severity` | `hr/escalations/route.ts` | ⚠️ Unused |
| `GET` | `severity` | `web/escalations/route.ts` | ⚠️ Unused |
| `GET` | `sheetName` | `import/excel/route.ts` | ⚠️ Unused |
| `GET` | `showFull` | `admin/entities/route.ts` | ⚠️ Unused |
| `GET` | `showFull` | `entities/[entityId]/route.ts` | ⚠️ Unused |
| `GET` | `sort` | `seo/keywords/route.ts` | ⚠️ Unused |
| `GET` | `sort` | `seo/keywords/route.ts` | ⚠️ Unused |
| `GET` | `sortBy` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `sortBy` | `api/tasks/route.ts` | ⚠️ Unused |
| `GET` | `sortOrder` | `shared/utils/pagination.ts` | ⚠️ Unused |
| `GET` | `sortOrder` | `api/tasks/route.ts` | ⚠️ Unused |
| `GET` | `source` | `embed/bug-report/page.tsx` | ⚠️ Unused |
| `GET` | `source` | `embed/client-onboarding/page.tsx` | ⚠️ Unused |
| `GET` | `source` | `embed/support/page.tsx` | ⚠️ Unused |
| `GET` | `sslStatus` | `web/domains/route.ts` | ⚠️ Unused |
| `GET` | `stage` | `sales/leads/page.tsx` | ✅ Used |
| `GET` | `stage` | `sales/pipeline/page.tsx` | ✅ Used |
| `GET` | `stage` | `hr/interviews/route.ts` | ✅ Used |
| `GET` | `startDate` | `ads/analytics/route.ts` | ⚠️ Unused |
| `GET` | `startDate` | `ads/conversions/route.ts` | ⚠️ Unused |
| `GET` | `startDate` | `ads/spend/route.ts` | ⚠️ Unused |
| `GET` | `startDate` | `client-portal/work-tracker/route.ts` | ⚠️ Unused |
| `GET` | `STARTER` | `(dashboard)/analytics/page.tsx` | ⚠️ Unused |
| `GET` | `state` | `google-drive/callback/route.ts` | ⚠️ Unused |
| `GET` | `state` | `linkedin/callback/route.ts` | ⚠️ Unused |
| `GET` | `state` | `google/callback/route.ts` | ⚠️ Unused |
| `GET` | `state` | `meta/callback/route.ts` | ⚠️ Unused |
| `GET` | `status` | `api/client-access-requests/route.ts` | ✅ Used |
| `GET` | `status` | `api/client-deliverables/route.ts` | ✅ Used |
| `GET` | `status` | `api/clients/route.ts` | ✅ Used |
| `GET` | `status` | `api/goals/route.ts` | ✅ Used |
| `GET` | `status` | `api/invoices/route.ts` | ✅ Used |
| `GET` | `status` | `api/issues/route.ts` | ✅ Used |
| `GET` | `status` | `api/maintenance-contracts/route.ts` | ✅ Used |
| `GET` | `status` | `api/meetings/route.ts` | ✅ Used |
| `GET` | `status` | `api/tasks/route.ts` | ✅ Used |
| `GET` | `status` | `api/testimonials/route.ts` | ✅ Used |
| `GET` | `status` | `api/users/route.ts` | ✅ Used |
| `GET` | `status` | `api/web-clients/route.ts` | ✅ Used |
| `GET` | `status` | `api/work-entries/route.ts` | ✅ Used |
| `GET` | `status` | `design/requests/DesignRequestsClient.tsx` | ✅ Used |
| `GET` | `status` | `accountability/achievements/route.ts` | ✅ Used |
| `GET` | `status` | `accountability/goals/route.ts` | ✅ Used |
| `GET` | `status` | `accounts/bank-statements/route.ts` | ✅ Used |
| `GET` | `status` | `accounts/onboarding/route.ts` | ✅ Used |
| `GET` | `status` | `accounts/proposals/route.ts` | ✅ Used |
| `GET` | `status` | `admin/access-requests/route.ts` | ✅ Used |
| `GET` | `status` | `admin/announcements/route.ts` | ✅ Used |
| `GET` | `status` | `admin/oauth-connections/route.ts` | ✅ Used |
| `GET` | `status` | `admin/terminations/route.ts` | ✅ Used |
| `GET` | `status` | `ads/ab-tests/route.ts` | ✅ Used |
| `GET` | `status` | `ads/campaigns/route.ts` | ✅ Used |
| `GET` | `status` | `ads/creative-requests/route.ts` | ✅ Used |
| `GET` | `status` | `ads/creatives/route.ts` | ✅ Used |
| `GET` | `status` | `client-portal/approvals/route.ts` | ✅ Used |
| `GET` | `status` | `client-portal/goals/route.ts` | ✅ Used |
| `GET` | `status` | `client-portal/invoices/route.ts` | ✅ Used |
| `GET` | `status` | `client-portal/reports/route.ts` | ✅ Used |
| `GET` | `status` | `communication/schedules/route.ts` | ✅ Used |
| `GET` | `status` | `design/requests/route.ts` | ✅ Used |
| `GET` | `status` | `expenses/recurring/route.ts` | ✅ Used |
| `GET` | `status` | `freelancer/payments/route.ts` | ✅ Used |
| `GET` | `status` | `freelancer/work-reports/route.ts` | ✅ Used |
| `GET` | `status` | `hiring/candidates/route.ts` | ✅ Used |
| `GET` | `status` | `hr/attendance-import/route.ts` | ✅ Used |
| `GET` | `status` | `hr/employer-branding/route.ts` | ✅ Used |
| `GET` | `status` | `hr/engagement-activities/route.ts` | ✅ Used |
| `GET` | `status` | `hr/escalations/route.ts` | ✅ Used |
| `GET` | `status` | `hr/exit/route.ts` | ✅ Used |
| `GET` | `status` | `hr/fnf/route.ts` | ✅ Used |
| `GET` | `status` | `hr/leave/route.ts` | ✅ Used |
| `GET` | `status` | `hr/interviews/route.ts` | ✅ Used |
| `GET` | `status` | `hr/manager-reviews/route.ts` | ✅ Used |
| `GET` | `status` | `hr/offers/route.ts` | ✅ Used |
| `GET` | `status` | `sales/deals/route.ts` | ✅ Used |
| `GET` | `status` | `sales/goals/route.ts` | ✅ Used |
| `GET` | `status` | `sales/handover/route.ts` | ✅ Used |
| `GET` | `status` | `sales/proposals/route.ts` | ✅ Used |
| `GET` | `status` | `sales/rfp/route.ts` | ✅ Used |
| `GET` | `status` | `social/approvals/route.ts` | ✅ Used |
| `GET` | `status` | `social/content-ideas/route.ts` | ✅ Used |
| `GET` | `status` | `seo/backlinks/route.ts` | ✅ Used |
| `GET` | `status` | `seo/client-approvals/route.ts` | ✅ Used |
| `GET` | `status` | `seo/content/route.ts` | ✅ Used |
| `GET` | `status` | `seo/reports/route.ts` | ✅ Used |
| `GET` | `status` | `seo/qc-reviews/route.ts` | ✅ Used |
| `GET` | `status` | `seo/tasks/route.ts` | ✅ Used |
| `GET` | `status` | `seo/youtube/route.ts` | ✅ Used |
| `GET` | `status` | `web/bugs/route.ts` | ✅ Used |
| `GET` | `status` | `web/clients/route.ts` | ✅ Used |
| `GET` | `status` | `web/escalations/route.ts` | ✅ Used |
| `GET` | `status` | `web/reimbursements/route.ts` | ✅ Used |
| `GET` | `status` | `web/requests/route.ts` | ✅ Used |
| `GET` | `status` | `web/upsells/route.ts` | ✅ Used |
| `GET` | `status` | `meetings/monthly/route.ts` | ✅ Used |
| `GET` | `status` | `meetings/quarterly/route.ts` | ✅ Used |
| `GET` | `status` | `web/approvals/route.ts` | ✅ Used |
| `GET` | `status` | `[clientId]/approvals/route.ts` | ✅ Used |
| `GET` | `status` | `assessment/pipeline/route.ts` | ✅ Used |
| `GET` | `status` | `devices/admin/route.ts` | ✅ Used |
| `GET` | `subtaskId` | `[taskId]/subtasks/route.ts` | ⚠️ Unused |
| `GET` | `summary` | `[clientId]/platform-accounts/route.ts` | ⚠️ Unused |
| `GET` | `tab` | `sales/deals/page.tsx` | ⚠️ Unused |
| `GET` | `target` | `admin/cache/route.ts` | ⚠️ Unused |
| `GET` | `TASK` | `admin/notifications/page.tsx` | ⚠️ Unused |
| `GET` | `teamView` | `meetings/tactical/route.ts` | ⚠️ Unused |
| `GET` | `templates` | `hr/day0-tasks/route.ts` | ✅ Used |
| `GET` | `testType` | `ads/ab-tests/route.ts` | ⚠️ Unused |
| `GET` | `theme` | `embed/bug-report/page.tsx` | ⚠️ Unused |
| `GET` | `theme` | `embed/client-onboarding/page.tsx` | ⚠️ Unused |
| `GET` | `theme` | `embed/rfp/page.tsx` | ⚠️ Unused |
| `GET` | `theme` | `embed/support/page.tsx` | ⚠️ Unused |
| `GET` | `theme` | `social/content-ideas/route.ts` | ⚠️ Unused |
| `GET` | `to` | `admin/audit-log/route.ts` | ⚠️ Unused |
| `GET` | `to` | `hr/employer-branding/route.ts` | ⚠️ Unused |
| `GET` | `to` | `hr/engagement-activities/route.ts` | ⚠️ Unused |
| `GET` | `to` | `hr/interviews/route.ts` | ⚠️ Unused |
| `GET` | `to` | `dashboard/[platform]/route.ts` | ⚠️ Unused |
| `GET` | `to` | `dashboard/overview/route.ts` | ⚠️ Unused |
| `GET` | `token` | `app/admin-login/page.tsx` | ⚠️ Unused |
| `GET` | `token` | `app/exit-interview/page.tsx` | ⚠️ Unused |
| `GET` | `token` | `(public)/rfp-v2/page.tsx` | ⚠️ Unused |
| `GET` | `token` | `auth/magic/page.tsx` | ⚠️ Unused |
| `GET` | `token` | `auth/register-password/page.tsx` | ⚠️ Unused |
| `GET` | `token` | `auth/reset-password/page.tsx` | ⚠️ Unused |
| `GET` | `token` | `client-portal/magic/page.tsx` | ⚠️ Unused |
| `GET` | `token` | `client-portal/magic-login/route.ts` | ⚠️ Unused |
| `GET` | `token` | `invitations/accept/route.ts` | ⚠️ Unused |
| `GET` | `token` | `survey/public/route.ts` | ⚠️ Unused |
| `GET` | `type` | `(dashboard)/network/actions.ts` | ⚠️ Unused |
| `GET` | `type` | `api/calendar/route.ts` | ⚠️ Unused |
| `GET` | `type` | `api/documents/route.ts` | ⚠️ Unused |
| `GET` | `type` | `api/maintenance-contracts/route.ts` | ⚠️ Unused |
| `GET` | `type` | `ads/creatives/route.ts` | ⚠️ Unused |
| `GET` | `type` | `client-portal/approvals/route.ts` | ⚠️ Unused |
| `GET` | `type` | `client-portal/export/route.ts` | ⚠️ Unused |
| `GET` | `type` | `client-portal/reports/route.ts` | ⚠️ Unused |
| `GET` | `type` | `communication/logs/route.ts` | ⚠️ Unused |
| `GET` | `type` | `finance/calendar/route.ts` | ⚠️ Unused |
| `GET` | `type` | `hr/appreciations/route.ts` | ⚠️ Unused |
| `GET` | `type` | `hr/employer-branding/route.ts` | ⚠️ Unused |
| `GET` | `type` | `hr/engagement-activities/route.ts` | ⚠️ Unused |
| `GET` | `type` | `hr/escalations/route.ts` | ⚠️ Unused |
| `GET` | `type` | `integrations/sync/route.ts` | ⚠️ Unused |
| `GET` | `type` | `operations/calendar/route.ts` | ⚠️ Unused |
| `GET` | `type` | `social/approvals/route.ts` | ⚠️ Unused |
| `GET` | `type` | `social/content-ideas/route.ts` | ⚠️ Unused |
| `GET` | `type` | `web/escalations/route.ts` | ⚠️ Unused |
| `GET` | `type` | `web/requests/route.ts` | ⚠️ Unused |
| `GET` | `type` | `web/upsells/route.ts` | ⚠️ Unused |
| `GET` | `type` | `nurturing/content/route.ts` | ⚠️ Unused |
| `GET` | `unread` | `client-portal/notifications/route.ts` | ⚠️ Unused |
| `GET` | `unreadOnly` | `api/notifications/route.ts` | ⚠️ Unused |
| `GET` | `upcoming` | `api/maintenance-contracts/route.ts` | ⚠️ Unused |
| `GET` | `upcoming` | `client-portal/meetings/route.ts` | ⚠️ Unused |
| `GET` | `user-agent` | `server/auth/client-info.ts` | ⚠️ Unused |
| `GET` | `user-agent` | `server/security/requestLogger.ts` | ⚠️ Unused |
| `GET` | `user-agent` | `auth/log-login/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `api/quarterly-goals/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `api/scorecard/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `api/testimonials/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `api/work-entries/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `accountability/achievements/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `accountability/deliverables/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `accountability/goals/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `admin/view-as/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `auth/log-login/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `client-portal/activity/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `hr/day0-tasks/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `hr/exit/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `hr/leave/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `meetings/tactical/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `sales/goals/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `tactical/auto-populate/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `tactical/kpis/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `tasks/daily-report/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `custom-roles/assign/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `quick-add/assignment/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `attendance/sync/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `daily/history/route.ts` | ⚠️ Unused |
| `GET` | `userId` | `daily/stats/route.ts` | ⚠️ Unused |
| `GET` | `view` | `api/work-entries/route.ts` | ✅ Used |
| `GET` | `view` | `client-deliverables/summary/route.ts` | ✅ Used |
| `GET` | `view` | `client-portal/work-tracker/route.ts` | ✅ Used |
| `GET` | `view` | `design/requests/route.ts` | ✅ Used |
| `GET` | `viewAs` | `admin/users/UserManagementClient.tsx` | ⚠️ Unused |
| `GET` | `viewAsUserId` | `app/(dashboard)/layout.tsx` | ⚠️ Unused |
| `GET` | `viewAsUserId` | `tasks/daily/page.tsx` | ⚠️ Unused |
| `GET` | `viewAsUserId` | `admin/view-as/route.ts` | ⚠️ Unused |
| `GET` | `viewAsUserId` | `tasks/daily/route.ts` | ⚠️ Unused |
| `GET` | `WARNING` | `(dashboard)/analytics/page.tsx` | ⚠️ Unused |
| `GET` | `webProjectStatus` | `api/web-clients/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `server/auth/client-info.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `server/auth/withClientAuth.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `server/security/index.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `server/security/requestLogger.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `auth/client/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `auth/log-login/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `auth/magic-link/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `careers/apply/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `magic-link/[token]/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `magic-link/[token]/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `magic-link/generate/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `magic-link/generate/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `payments/create-order/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `payments/offline-request/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `payments/verify/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `public/rfp/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `public/rfp-v2/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `password/check/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `password/login/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `password/forgot/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `password/register/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `password/reset/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `password/reset-with-otp/route.ts` | ⚠️ Unused |
| `GET` | `x-forwarded-for` | `rfp/[token]/route.ts` | ⚠️ Unused |
| `GET` | `x-message-id` | `server/notifications/email.ts` | ⚠️ Unused |
| `GET` | `x-razorpay-signature` | `payments/webhook/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `server/auth/client-info.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `server/auth/withClientAuth.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `server/security/index.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `server/security/requestLogger.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `auth/client/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `auth/log-login/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `auth/magic-link/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `careers/apply/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `magic-link/[token]/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `magic-link/[token]/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `magic-link/generate/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `magic-link/generate/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `payments/create-order/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `payments/offline-request/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `payments/verify/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `public/rfp/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `public/rfp-v2/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `password/check/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `password/login/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `password/forgot/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `password/register/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `password/reset/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `password/reset-with-otp/route.ts` | ⚠️ Unused |
| `GET` | `x-real-ip` | `rfp/[token]/route.ts` | ⚠️ Unused |
| `GET` | `X-ReAuth-Token` | `server/security/re-auth.ts` | ⚠️ Unused |
| `GET` | `year` | `api/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `api/quarterly-goals/route.ts` | ⚠️ Unused |
| `GET` | `year` | `api/work-entries/route.ts` | ⚠️ Unused |
| `GET` | `year` | `academy/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `accounts/calendar-events/route.ts` | ⚠️ Unused |
| `GET` | `year` | `analytics/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `client-access/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `communications/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `content/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `design/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `finance/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `hr/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `hr/manager-reviews/route.ts` | ⚠️ Unused |
| `GET` | `year` | `meetings/strategic/route.ts` | ⚠️ Unused |
| `GET` | `year` | `meetings/tactical/route.ts` | ⚠️ Unused |
| `GET` | `year` | `operations/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `sales/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `web/calendar/route.ts` | ⚠️ Unused |
| `GET` | `year` | `expenses/departments/route.ts` | ⚠️ Unused |
| `GET` | `year` | `meetings/monthly/route.ts` | ⚠️ Unused |
| `GET` | `year` | `meetings/quarterly/route.ts` | ⚠️ Unused |
| `GET` | `year` | `attendance/sync/route.ts` | ⚠️ Unused |

## 🖥️ Frontend API Calls

| Component | UI Element | Method | Path | File |
|-----------|------------|--------|------|------|
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal` | `app/client-portal/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal/credentials` | `app/client-portal/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal/meetings` | `app/client-portal/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal/reports` | `app/client-portal/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal/invoices` | `app/client-portal/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal/deliverables` | `app/client-portal/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal/profile/edit` | `app/client-portal/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/client-portal/payments` | `app/client-portal/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients?limit=500` | `components/admin/QuickAllocateModal.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/users?limit=500&status=ACTIVE` | `components/admin/QuickAllocateModal.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/users` | `components/dashboards/AdminDashboard.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients` | `components/dashboards/AdminDashboard.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/crm/leads` | `components/dashboards/AdminDashboard.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/issues` | `components/dashboards/AdminDashboard.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/users?department=DESIGN` | `components/layout/DesignNav.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/design/requests?status=REQUESTED,IN_DESIGN` | `components/layout/DesignNav.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/ads/analytics` | `(dashboard)/ads/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/ads/campaigns?take=5&orderBy=updatedAt` | `(dashboard)/ads/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/admin/users` | `(dashboard)/calendar/CalendarClient.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients?limit=200` | `(dashboard)/calendar/CalendarClient.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients?limit=500` | `(dashboard)/client-access/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/client-access-requests` | `(dashboard)/client-access/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/accounts/calendar-events?year=*&month=*` | `accounts/calendar/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/accounts/contracts?expiring=true` | `accounts/calendar/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/accounts/finance-stats?period=*` | `accounts/finance-overview/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/accounts/payments?limit=10` | `accounts/finance-overview/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients?sortBy=monthlyFee&limit=5` | `accounts/finance-overview/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/admin/clients` | `admin/bulk-ops/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/hr/assessment/pipeline` | `admin/bulk-ops/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/whatsapp/campaigns` | `communications/campaigns/CampaignsPage.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/whatsapp/templates?active=true` | `communications/campaigns/CampaignsPage.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/admin/users` | `finance/calendar/CalendarClient.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients?limit=200` | `finance/calendar/CalendarClient.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients` | `finance/overview/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/invoices` | `finance/overview/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/hr/employees` | `hr/attendance/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/hr/attendance/sync` | `hr/attendance/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/hr/interviews` | `hr/interviews/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/hr/interviews/pending-candidates` | `hr/interviews/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/clients` | `meetings/new/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/users` | `meetings/new/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/admin/users` | `operations/calendar/CalendarClient.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/clients?limit=200` | `operations/calendar/CalendarClient.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/sales/meetings` | `sales/meetings/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/sales/leads` | `sales/meetings/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/sales/leads?stage=active&limit=100` | `sales/nurturing/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/sales/nurturing/content` | `sales/nurturing/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/ads/analytics` | `reports/operations/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/users?department=ADS` | `reports/operations/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/ads/analytics` | `reports/strategic/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/ads/campaigns?status=ACTIVE` | `reports/strategic/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/hr/attendance?date=*` | `hr/attendance/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/hr/employees` | `hr/attendance/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/social/dashboard` | `reports/operations/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/social/clients?limit=1` | `reports/operations/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/social/dashboard` | `reports/strategic/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/social/clients?limit=100` | `reports/strategic/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/social/dashboard` | `reports/tactical/page.tsx` |
| `?` | ⚡ useEffect Loader | `GET` | `/api/social/clients?limit=100` | `reports/tactical/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/web/upsells` | `billing/upsells/page.tsx` |
| `?` | ⚙ undefined | `GET` | `/api/web/clients` | `billing/upsells/page.tsx` |
| `AddTaskModal` | ⚡ useEffect Loader | `GET` | `/api/admin/users` | `daily/components/AddTaskModal.tsx` |
| `clientRes` | ⚙ clientRes | `GET` | `/api/hr/client-names` | `hr/client-feedback/page.tsx` |
| `clientRes` | ⚙ clientRes | `POST` | `/api/clients` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `clientsRes` | ⚙ clientsRes | `GET` | `/api/clients?status=ACTIVE` | `accounts/calendar/page.tsx` |
| `companyRes` | ⚙ companyRes | `GET` | `/api/client-portal/profile` | `components/client-portal/ProfileModal.tsx` |
| `compRes` | ⚙ compRes | `GET` | `/api/meetings/compliance` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `createInvoice` | ⚙ createInvoice | `POST` | `/api/accounts/proforma-invoice` | `accounts/proforma-invoice/page.tsx` |
| `deactivate` | ⚙ deactivate | `PATCH` | `/api/vendors/*` | `admin/vendors/page.tsx` |
| `deleteQuote` | ⚙ deleteQuote | `DELETE` | `/api/quotes?id=*` | `hr/quotes/page.tsx` |
| `empRes` | ⚙ empRes | `GET` | `/api/hr/employees` | `hr/client-feedback/page.tsx` |
| `empRes` | ⚙ empRes | `GET` | `/api/hr/employees` | `appraisals/workflow/page.tsx` |
| `expensesRes` | ⚙ expensesRes | `GET` | `/api/expenses?limit=5` | `accounts/quick-entry/page.tsx` |
| `feedbackRes` | ⚙ feedbackRes | `GET` | `/api/hr/client-feedback` | `hr/client-feedback/page.tsx` |
| `fetchApprovals` | ⚙ fetchApprovals | `GET` | `/api/social/approvals?type=CLIENT&limit=100` | `approvals/client/page.tsx` |
| `fetchApprovals` | ⚙ fetchApprovals | `GET` | `/api/social/approvals?type=INTERNAL&limit=100` | `approvals/internal/page.tsx` |
| `handleApprove` | ⚙ handleApprove | `POST` | `/api/web/projects/*/phases/*/approve` | `components/web/PhaseApprovalGate.tsx` |
| `handleCellEdit` | ⚙ handleCellEdit | `PATCH` | `/api/hiring/*` | `(dashboard)/hiring/CandidateSheet.tsx` |
| `handleCellEdit` | ⚙ handleCellEdit | `PATCH` | `/api/assets/*` | `hr/assets/AssetSheet.tsx` |
| `handleChecklistToggle` | ⚙ handleChecklistToggle | `PATCH` | `/api/accounts/client-onboarding/*` | `accounts/client-onboarding/page.tsx` |
| `handleChecklistToggle` | ⚙ handleChecklistToggle | `PATCH` | `/api/hr/onboarding-checklist/*` | `hr/onboarding-checklist/page.tsx` |
| `handleConfirmPayment` | ⚙ handleConfirmPayment | `POST` | `/api/accounts/payment/*` | `contracts/[clientId]/ContractManager.tsx` |
| `handleDisconnect` | ⚙ handleDisconnect | `POST` | `/api/integrations/*/disconnect` | `components/integrations/ConnectPlatforms.tsx` |
| `handleImport` | ⚙ handleImport | `POST` | `/api/clients/*/import/excel` | `components/reporting/CSVImporter.tsx` |
| `handleImport` | ⚙ handleImport | `POST` | `/api/clients/*/import/*` | `components/reporting/CSVImporter.tsx` |
| `handleLogout` | ⚙ handleLogout | `POST` | `/api/client-portal/logout` | `app/client-portal/page.tsx` |
| `handleLogRemarks` | ⚙ handleLogRemarks | `POST` | `/api/clients/operations-log` | `daily/views/OpsClientListView.tsx` |
| `handleMarkAllRead` | ⚙ handleMarkAllRead | `PUT` | `/api/client-portal/notifications` | `components/client-portal/NotificationBell.tsx` |
| `handleMarkAsRead` | ⚙ handleMarkAsRead | `PUT` | `/api/client-portal/notifications` | `components/client-portal/NotificationBell.tsx` |
| `handleMarkLost` | ⚙ handleMarkLost | `PATCH` | `/api/crm/leads/*` | `crm/[leadId]/LeadDetail.tsx` |
| `handleNext` | ⚙ handleNext | `PATCH` | `/api/onboard/*` | `onboard/[token]/OnboardingForm.tsx` |
| `handleNotesUpdate` | ⚙ handleNotesUpdate | `PATCH` | `/api/accounts/client-onboarding/*` | `accounts/client-onboarding/page.tsx` |
| `handleNotesUpdate` | ⚙ handleNotesUpdate | `PATCH` | `/api/hr/onboarding-checklist/*` | `hr/onboarding-checklist/page.tsx` |
| `handlePreview` | ⚙ handlePreview | `POST` | `/api/clients/*/import/excel?preview=true` | `components/reporting/CSVImporter.tsx` |
| `handlePreview` | ⚙ handlePreview | `POST` | `/api/clients/*/import/*?preview=true` | `components/reporting/CSVImporter.tsx` |
| `handleRemoveMember` | ⚙ handleRemoveMember | `DELETE` | `/api/clients/*/team?memberId=*` | `[clientId]/team/TeamAssignment.tsx` |
| `handleRequestApproval` | ⚙ handleRequestApproval | `POST` | `/api/web/projects/*/phases/*/request-approval` | `components/web/PhaseApprovalGate.tsx` |
| `handleRequestChanges` | ⚙ handleRequestChanges | `POST` | `/api/web/projects/*/phases/*/request-changes` | `components/web/PhaseApprovalGate.tsx` |
| `handleSendWhatsAppExternal` | ⚙ handleSendWhatsAppExternal | `PATCH` | `/api/tasks/daily/*` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `handleSetPrimary` | ⚙ handleSetPrimary | `PATCH` | `/api/clients/*/team/*` | `[clientId]/team/TeamAssignment.tsx` |
| `handleSignOut` | ⚙ handleSignOut | `POST` | `/api/client-portal/logout` | `app/portal/layout.tsx` |
| `handleSignOut` | ⚙ handleSignOut | `POST` | `/api/client-portal/logout` | `portal/web/layout.tsx` |
| `handleSignSLA` | ⚙ handleSignSLA | `PATCH` | `/api/accounts/sla/*` | `contracts/[clientId]/ContractManager.tsx` |
| `handleStatusChange` | ⚙ handleStatusChange | `PATCH` | `/api/hr/engagement-activities/*` | `hr/engagement-activities/page.tsx` |
| `handleSubmitForApproval` | ⚙ handleSubmitForApproval | `PATCH` | `/api/work-entries/*` | `(dashboard)/work-tracker/page.tsx` |
| `handleSubmitPost` | ⚙ handleSubmitPost | `GET` | `/api/social/approvals?type=CONTENT` | `content/planner/page.tsx` |
| `handleToggle` | ⚙ handleToggle | `PUT` | `/api/web/projects/*/phases/*/checklist` | `components/web/PhaseChecklist.tsx` |
| `handleUploadSLA` | ⚙ handleUploadSLA | `POST` | `/api/accounts/sla/*` | `contracts/[clientId]/ContractManager.tsx` |
| `ImpersonationBanner` | ⚡ useEffect Loader | `GET` | `/api/admin/view-as` | `components/layout/ImpersonationBanner.tsx` |
| `InitiateExitButton` | ⚡ useEffect Loader | `GET` | `/api/hr/employees?excludeFounders=true` | `hr/exit/InitiateExitButton.tsx` |
| `LeaderboardClient` | ⚡ useEffect Loader | `GET` | `/api/users` | `(dashboard)/performance/LeaderboardClient.tsx` |
| `loadData` | ⚡ useEffect Loader | `GET` | `/api/users` | `issues/[issueId]/IssueDetail.tsx` |
| `logActivity` | ⚙ logActivity | `POST` | `/api/sales/leads/*/activities` | `sales/leads/page.tsx` |
| `markAllAsRead` | ⚙ markAllAsRead | `PUT` | `/api/client-portal/notifications` | `portal/notifications/page.tsx` |
| `markAllRead` | ⚙ markAllRead | `PATCH` | `/api/notifications` | `(dashboard)/inbox/InboxClient.tsx` |
| `markRead` | ⚙ markRead | `PATCH` | `/api/notifications` | `(dashboard)/inbox/InboxClient.tsx` |
| `orderRes` | ⚙ orderRes | `POST` | `/api/payments/create-order` | `[token]/payment/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/quotes?mode=qotd` | `(auth)/login/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/dashboard` | `(dashboard)/social/page.tsx` |
| `page` | ⚡ useEffect Loader | `POST` | `/api/auth/client-magic` | `client-portal/magic/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/client-portal/dashboard` | `portal/dashboard/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/accounts/client-profitability?*` | `accounts/client-profitability/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/accounts/tax-compliance?month=*` | `accounts/tax-compliance/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/admin/settings` | `admin/settings/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/users` | `hr/escalations/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients` | `hr/escalations/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/sales/analytics` | `sales/analytics/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/tasks?status=ALL` | `seo/calendar/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/approvals?limit=100` | `social/calendar/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/metrics?platform=LINKEDIN` | `social/linkedin/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/posts?platform=LINKEDIN` | `social/linkedin/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/tasks?department=SOCIAL_MEDIA` | `social/tasks/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients` | `creatives/requests/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients?limit=200` | `requests/new/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/users?department=DESIGN` | `requests/new/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients` | `work-reports/new/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/hiring/candidates` | `hr/hiring/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/admin/users?role=SALES&limit=100` | `performance/goals/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients?status=ACTIVE&limit=100` | `clients/keywords/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/tasks` | `clients/plans/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients?status=ACTIVE&limit=100` | `deliverables/backlinks/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients?status=ACTIVE&limit=100` | `deliverables/content/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/hr/employees?department=SEO` | `deliverables/content/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/tasks` | `deliverables/technical/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/keywords` | `performance/rankings/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/dashboard` | `performance/traffic/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/dashboard` | `reports/operations/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/dashboard` | `reports/strategic/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/seo/dashboard` | `reports/tactical/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/clients` | `clients/strategy/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/posts?month=*` | `content/calendar/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/approvals?type=CONTENT` | `content/planner/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients` | `content/planner/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/clients` | `content/creative-requests/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/social/approvals?type=CREATIVE` | `content/creative-requests/page.tsx` |
| `page` | ⚡ useEffect Loader | `GET` | `/api/tasks?department=SOCIAL_MEDIA` | `tasks/board/page.tsx` |
| `paymentsRes` | ⚙ paymentsRes | `GET` | `/api/accounts/payments?limit=5` | `accounts/quick-entry/page.tsx` |
| `POST` | ⚙ POST | `POST` | `//oauth2.googleapis.com/revoke?token=*` | `[id]/revoke/route.ts` |
| `profileRes` | ⚙ profileRes | `GET` | `/api/client-portal/profile/edit` | `components/client-portal/ProfileModal.tsx` |
| `profileRes` | ⚙ profileRes | `PATCH` | `/api/users/profile` | `(dashboard)/settings/SettingsClient.tsx` |
| `promises` | ⚙ promises | `PATCH` | `/api/client-deliverables` | `tactical-tracker/views/ManagerTrackerView.tsx` |
| `res` | ⚙ res | `POST` | `/api/v1/send_msg/` | `Office/PioneerOS/test-otp-flow.js` |
| `res` | ⚙ res | `POST` | `/api/careers/apply` | `app/careers/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/auth/test-login` | `app/client-login/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/client` | `app/client-login/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/client` | `app/client-login/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/test-login` | `app/client-login/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/tickets` | `app/client-portal/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/client-portal/credentials?id=*` | `app/client-portal/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/credentials` | `app/client-portal/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/exit-interview` | `app/exit-interview/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/public/join` | `app/join/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/client-portal/profile` | `app/portal/layout.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/client-portal/notifications?unread=true` | `app/portal/layout.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/client-onboarding` | `app/welcome/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/quick-allocate` | `components/admin/QuickAllocateModal.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?limit=100` | `components/ads/AddBudgetModal.tsx` |
| `res` | ⚙ res | `POST` | `/api/ads/budget` | `components/ads/AddBudgetModal.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients` | `components/ads/CampaignCreateModal.tsx` |
| `res` | ⚙ res | `POST` | `/api/ads/campaigns` | `components/ads/CampaignCreateModal.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/credentials?reveal=true` | `components/client-portal/CredentialModal.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/notifications?limit=10` | `components/client-portal/NotificationBell.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile/edit` | `components/client-portal/ProfileModal.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile` | `components/client-portal/ProfileModal.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile` | `components/client-portal/ProfileModal.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile` | `components/client-portal/ProfileModal.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile/edit` | `components/client-portal/ProfileModal.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile/edit` | `components/client-portal/ProfileModal.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/team/*` | `components/client-portal/TeamMemberProfileModal.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/termination` | `components/client-portal/TerminationTab.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/termination` | `components/client-portal/TerminationTab.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/client-portal/termination` | `components/client-portal/TerminationTab.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/work-tracker?*` | `components/client-portal/WorkTrackerTab.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/profile` | `components/client-portal/WorkTrackerTab.tsx` |
| `res` | ⚙ res | `POST` | `/api/crm/leads/*/activity` | `components/crm/CallNotesForm.tsx` |
| `res` | ⚙ res | `POST` | `/api/crm/leads/*/reminder` | `components/crm/FollowUpScheduler.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/onboarding/*/resend` | `components/dashboards/AccountsDashboard.tsx` |
| `res` | ⚙ res | `POST` | `/api/notifications/whatsapp` | `components/dashboards/AccountsDashboard.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/invoices/*` | `components/dashboards/AccountsDashboard.tsx` |
| `res` | ⚙ res | `GET` | `/api/auth/client-magic` | `components/dashboards/AdminDashboard.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings` | `components/dashboards/InternDashboard.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/tasks/*` | `components/dashboards/ManagerDashboard.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/tasks/*` | `components/dashboards/ManagerDashboard.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/crm/leads/*` | `components/dashboards/SalesDashboard.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/crm/leads/*` | `components/dashboards/SalesDashboard.tsx` |
| `res` | ⚙ res | `GET` | `/api/integrations/status/*` | `components/integrations/ConnectPlatforms.tsx` |
| `res` | ⚙ res | `POST` | `/api/integrations/*/connect` | `components/integrations/ConnectPlatforms.tsx` |
| `res` | ⚙ res | `POST` | `/api/integrations/sync` | `components/integrations/ConnectPlatforms.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/users?department=ADS` | `components/layout/AdsNav.tsx` |
| `res` | ⚙ res | `GET` | `/api/notifications?limit=5` | `components/layout/DashboardHeader.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/search?q=*` | `components/layout/DashboardHeader.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/notifications` | `components/layout/DashboardHeader.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/view-as?redirectTo=/admin/users` | `components/layout/ImpersonationBanner.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings/ai-extract` | `components/meetings/AIDataEntryModal.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings/ai-extract` | `components/meetings/AIDataEntryModal.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings/daily` | `components/meetings/DailyMeetingForm.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/meetings/*` | `components/meetings/MOMTracker.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings` | `components/meetings/MOMTracker.tsx` |
| `res` | ⚙ res | `GET` | `/api/meetings/compliance` | `components/meetings/MeetingBlocker.tsx` |
| `res` | ⚙ res | `POST` | `/api/network/post` | `components/network/CreatePostForm.tsx` |
| `res` | ⚙ res | `POST` | `/api/network/like` | `components/network/NetworkFeed.tsx` |
| `res` | ⚙ res | `POST` | `/api/network/comment` | `components/network/NetworkFeed.tsx` |
| `res` | ⚙ res | `GET` | `/api/org-chart/*` | `components/org-chart/OrgChartProfileModal.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/survey` | `components/portal/MonthlySurveyPopup.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/survey` | `components/portal/MonthlySurveyPopup.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/termination` | `components/portal/ServiceManagement.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/termination` | `components/portal/ServiceManagement.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/termination/handover` | `components/portal/ServiceManagement.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/client-portal/termination?id=*` | `components/portal/ServiceManagement.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/termination/export` | `components/portal/ServiceManagement.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/users/profile-picture` | `components/profile/ProfileHeader.tsx` |
| `res` | ⚙ res | `POST` | `/api/clients/*/platform-accounts` | `components/reporting/AddAccountModal.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/clients/*/import/batches?batchId=*` | `components/reporting/ImportHistory.tsx` |
| `res` | ⚙ res | `POST` | `/api/clients/*/import/manual` | `components/reporting/ManualEntryForm.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/clients/*/platform-accounts/*` | `components/reporting/PlatformAccountCard.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/clients/*/platform-accounts/*` | `components/reporting/PlatformAccountCard.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients/*/platform-accounts` | `components/reporting/PlatformsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/leads/*/nurture` | `components/sales/NurturingActions.tsx` |
| `res` | ⚙ res | `GET` | `/api/auth/sessions` | `components/settings/SessionManagement.tsx` |
| `res` | ⚙ res | `GET` | `/api/auth/sessions/history?page=*&limit=10` | `components/settings/SessionManagement.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/auth/sessions/*` | `components/settings/SessionManagement.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/auth/sessions` | `components/settings/SessionManagement.tsx` |
| `res` | ⚙ res | `GET` | `/api/auth/2fa/status` | `components/settings/TwoFactorSettings.tsx` |
| `res` | ⚙ res | `GET` | `/api/auth/2fa/setup` | `components/settings/TwoFactorSettings.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/2fa/verify` | `components/settings/TwoFactorSettings.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/2fa/disable` | `components/settings/TwoFactorSettings.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/2fa/backup-codes` | `components/settings/TwoFactorSettings.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/tasks/daily/stats?*` | `components/tasks/BreakthroughStats.tsx` |
| `res` | ⚙ res | `POST` | `/api/leads/quick-add` | `components/tasks/QuickAddLeadModal.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/testimonials/user/*/badges` | `components/testimonials/TestimonialBadges.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/testimonials/user/*/badges` | `components/testimonials/TestimonialBadges.tsx` |
| `res` | ⚙ res | `POST` | `/api/upload/cloudinary` | `components/ui/FileUpload.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/web-clients/*/phases` | `components/web/PhaseTracker.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/magic-link` | `(auth)/login/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/academy/content` | `(dashboard)/academy/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/generate-magic-link` | `(dashboard)/admin/AdminDashboard.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/admin/users/*` | `(dashboard)/admin/AdminDashboard.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/users` | `(dashboard)/admin/AdminDashboard.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/generate-magic-link` | `(dashboard)/all-access/AllAccessClient.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/calendar?year=*&month=*` | `(dashboard)/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/calendar?year=*&month=*` | `(dashboard)/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/calendar` | `(dashboard)/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-access-requests` | `(dashboard)/client-access/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/quick-add/client` | `(dashboard)/clients/ClientsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/clients/*/logo` | `(dashboard)/clients/ClientsClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/crm/leads` | `(dashboard)/crm/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/crm/leads` | `(dashboard)/crm/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/crm/leads/*` | `(dashboard)/crm/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/crm/leads/*` | `(dashboard)/crm/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/documents?*` | `(dashboard)/files/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/documents` | `(dashboard)/files/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/documents?id=*` | `(dashboard)/files/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/quarterly-goals?*` | `(dashboard)/goals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/users?status=ACTIVE` | `(dashboard)/goals/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/quarterly-goals` | `(dashboard)/goals/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/quarterly-goals` | `(dashboard)/goals/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/quarterly-goals` | `(dashboard)/goals/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/goals/*` | `(dashboard)/goals/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hiring` | `(dashboard)/hiring/CandidateSheet.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/hiring/*` | `(dashboard)/hiring/CandidateSheet.tsx` |
| `res` | ⚙ res | `POST` | `/api/ideas` | `(dashboard)/ideas/IdeasClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/saas-tools` | `(dashboard)/internal-tools/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/issues` | `(dashboard)/issues/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/knowledge/search?q=*` | `(dashboard)/knowledge/KnowledgeBaseClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/learning/audit` | `(dashboard)/learning/LearningClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/learning/audit` | `(dashboard)/learning/LearningClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/learning/log` | `(dashboard)/learning/LearningClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/learning/verify` | `(dashboard)/learning/LearningClient.tsx` |
| `res` | ⚙ res | `PUT` | `/api/learning/verify` | `(dashboard)/learning/LearningClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/learning/log?logId=*` | `(dashboard)/learning/LearningClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/manager/dashboard` | `(dashboard)/manager/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/mash/dm/unread-counts` | `(dashboard)/mash/MashClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/mash/channels/*/messages` | `(dashboard)/mash/MashClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/mash/dm/*` | `(dashboard)/mash/MashClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/mash/dm/*` | `(dashboard)/mash/MashClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/mash/channels/*/messages` | `(dashboard)/mash/MashClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings` | `(dashboard)/meetings/MeetingsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/meetings` | `(dashboard)/meetings/MeetingsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/meetings` | `(dashboard)/meetings/MeetingsTableClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily` | `(dashboard)/my-day/MyDayClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily/*/start` | `(dashboard)/my-day/MyDayClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily/*/complete` | `(dashboard)/my-day/MyDayClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/notifications` | `(dashboard)/notifications/NotificationsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/notifications` | `(dashboard)/notifications/NotificationsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/accountability/calculate` | `(dashboard)/performance/LeaderboardClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/accountability/achievements` | `(dashboard)/performance/LeaderboardClient.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/users/profile` | `(dashboard)/profile/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/seo/dashboard` | `(dashboard)/seo/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/users/profile` | `(dashboard)/settings/SettingsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/users/profile` | `(dashboard)/settings/SettingsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/users/profile` | `(dashboard)/settings/SettingsClient.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/tasks/daily-report?userId=*` | `(dashboard)/tasks/EndOfDayReport.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks` | `(dashboard)/tasks/TasksClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/tasks/*` | `(dashboard)/tasks/TasksClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/*/timer` | `(dashboard)/tasks/TasksClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/*/timer` | `(dashboard)/tasks/TasksClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/tasks/*` | `(dashboard)/tasks/TasksClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/users` | `(dashboard)/team/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/testimonials` | `(dashboard)/testimonials/TestimonialsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/testimonials/*` | `(dashboard)/testimonials/TestimonialsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/testimonials/*` | `(dashboard)/testimonials/TestimonialsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/testimonials/*` | `(dashboard)/testimonials/TestimonialsClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/work-entries?*` | `(dashboard)/work-tracker/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE&limit=100` | `(dashboard)/work-tracker/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/google-drive/status` | `(dashboard)/work-tracker/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/work-entries` | `(dashboard)/work-tracker/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/work-entries/*/upload` | `(dashboard)/work-tracker/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/rfp/*` | `(public)/rfp-v2/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/hr/assessment/*` | `assessment/[token]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/assessment/*` | `assessment/[token]/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/auth/client-magic` | `auth/client-test-links/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/password/reset-with-otp` | `auth/forgot-password/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/password/reset-with-otp` | `auth/forgot-password/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/password/reset-with-otp` | `auth/forgot-password/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/magic-link/verify` | `auth/magic/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/password/check` | `auth/register-password/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/password/register` | `auth/register-password/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/auth/password/reset` | `auth/reset-password/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/org-chart` | `client-portal/team/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web/bugs` | `embed/bug-report/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/careers/apply` | `embed/careers/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/client-onboarding` | `embed/client-onboarding/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/rfp` | `embed/rfp/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/support/tickets` | `embed/support/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/client-onboarding` | `embed/welcome/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/data?clientId=*` | `mykohi-portal/[clientId]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/onboard/*/complete` | `onboard/[token]/OnboardingForm.tsx` |
| `res` | ⚙ res | `GET` | `/api/onboarding/*` | `onboarding/[token]/OnboardingWizard.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile` | `portal/account/CompanyInfoSection.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/credentials*` | `portal/account/CredentialsSection.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/credentials` | `portal/account/CredentialsSection.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/client-portal/credentials?id=*` | `portal/account/CredentialsSection.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/feedback` | `portal/account/FeedbackSection.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/profile` | `portal/account/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/credentials*` | `portal/account/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/profile/edit` | `portal/account/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile/edit` | `portal/account/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile/edit` | `portal/account/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/export?type=*` | `portal/account/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile` | `portal/account/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/profile` | `portal/account/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/feedback` | `portal/account/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/credentials` | `portal/account/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/client-portal/credentials?id=*` | `portal/account/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/ads` | `portal/ads/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/approvals` | `portal/approvals/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/approvals` | `portal/approvals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/contracts` | `portal/contracts/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/deliverables?*` | `portal/deliverables/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/goals` | `portal/goals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/invoices?*` | `portal/invoices/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/meetings?*` | `portal/meetings/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/notifications?*` | `portal/notifications/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/client-portal/notifications` | `portal/notifications/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/client-portal/notifications?id=*` | `portal/notifications/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/dashboard` | `portal/performance/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/client-portal/onboarding-data` | `portal/profile/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/reports?*` | `portal/reports/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/client-portal/profile` | `portal/web/layout.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-portal` | `portal/web/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/proposal/*` | `proposal/[token]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/proposal/*/accept` | `proposal/[token]/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/rfp/*` | `rfp/[token]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/rfp/*` | `rfp/[token]/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/client-portal/survey/public?token=*` | `survey/[token]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/survey/public` | `survey/[token]/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-onboarding/*` | `web-onboarding/[token]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-onboarding/*` | `web-onboarding/[token]/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/academy/calendar?year=*&month=*` | `academy/calendar/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/client-accounts` | `accounts/accounts-view/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/achievements` | `accounts/achievements/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/aging-report*` | `accounts/aging-report/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients` | `accounts/analytics/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/auto-invoice/config` | `accounts/auto-invoice/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/accounts/auto-invoice/config/*` | `accounts/auto-invoice/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/bank-statements?*` | `accounts/bank-statements/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/entities` | `accounts/bank-statements/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/bank-statements` | `accounts/bank-statements/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/bank-statements/*/process` | `accounts/bank-statements/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/budget-alerts?*` | `accounts/budget-alerts/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE` | `accounts/budget-alerts/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/budget-alerts` | `accounts/budget-alerts/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/budget-alerts/*/pause` | `accounts/budget-alerts/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/budget-alerts/*` | `accounts/budget-alerts/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?includeLifecycle=true` | `accounts/client-lifecycle/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?onboarding=true` | `accounts/client-onboarding/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/client-onboarding/*` | `accounts/client-onboarding/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients` | `accounts/clients/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/daily-meeting/tasks?date=*` | `accounts/daily-meeting/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/deliverables?includeBilling=true` | `accounts/deliverables/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/deliverables/*/billing` | `accounts/deliverables/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/accounts/discrepancies?months=*` | `accounts/discrepancies/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/expenses?month=*` | `accounts/expenses/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/expenses` | `accounts/expenses/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/handover` | `accounts/handovers/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/handover` | `accounts/handovers/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/handover` | `accounts/handovers/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/invoices?month=*` | `accounts/invoices/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/auto-invoice/send/*` | `accounts/invoices/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/leaderboard?metric=*&period=*` | `accounts/leaderboard/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/payments?month=*` | `accounts/ledger/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients` | `accounts/ledger/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/payments` | `accounts/ledger/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients` | `accounts/manage/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/clients/*` | `accounts/manage/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/goals` | `accounts/my-goals/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/goals` | `accounts/my-goals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/onboarding-analytics` | `accounts/onboarding-analytics/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/follow-ups?month=*` | `accounts/payment-tracker/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/payment-automation` | `accounts/payment-tracker/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/follow-ups` | `accounts/payment-tracker/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/performance?period=*` | `accounts/performance/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/proforma-invoice` | `accounts/proforma-invoice/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/projects?includeBilling=true` | `accounts/projects/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/proposals?*` | `accounts/proposals/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/proposals/*/send` | `accounts/proposals/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/accounts/proposals/*` | `accounts/proposals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE` | `accounts/quick-entry/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/payments` | `accounts/quick-entry/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/expenses` | `accounts/quick-entry/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/auto-invoice/bulk` | `accounts/quick-entry/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/reconciliation-summary?*` | `accounts/reconciliation-summary/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/entities` | `accounts/reconciliation-summary/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/accounts/revenue-forecast` | `accounts/revenue-forecast/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/roi/departments?*` | `accounts/roi/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/roi/compute` | `accounts/roi/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/terminations?*` | `accounts/terminations/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/admin/terminations/*` | `accounts/terminations/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/audit-log?*` | `admin/audit-log/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/users` | `admin/branding-magic-links/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/branding-magic-link/send` | `admin/branding-magic-links/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/hr/assessment/send` | `admin/bulk-ops/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-access-requests?status=*&limit=100` | `admin/client-access-requests/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/client-access-requests/*` | `admin/client-access-requests/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/client-access-requests/*` | `admin/client-access-requests/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/sync-client-assignments` | `admin/client-assignments/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/sync-client-assignments` | `admin/client-assignments/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/sync-client-assignments` | `admin/client-assignments/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/custom-roles` | `admin/custom-roles/CustomRolesClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/admin/custom-roles` | `admin/custom-roles/CustomRolesClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/custom-roles?roleId=*` | `admin/custom-roles/CustomRolesClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/custom-roles/assign` | `admin/custom-roles/CustomRolesClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/custom-roles/assign?userId=*&customRoleId=*` | `admin/custom-roles/CustomRolesClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/entities` | `admin/entities/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/entities` | `admin/entities/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/entities/*` | `admin/entities/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/entities/*/bank-accounts` | `admin/entities/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/entities/*/bank-accounts?accountId=*` | `admin/entities/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/entities/*/payment-gateways` | `admin/entities/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/entities/*/payment-gateways?gatewayId=*` | `admin/entities/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/freelancer/work-reports/bulk-update` | `admin/freelancers/FreelancerManagementClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/freelancer/payments` | `admin/freelancers/FreelancerManagementClient.tsx` |
| `res` | ⚙ res | `PUT` | `/api/magic-link/generate` | `admin/magic-links/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/settings` | `admin/settings/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/view-as?userId=*&redirectTo=/` | `admin/users/UserManagementClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/view-as?redirectTo=/admin/users` | `admin/users/UserManagementClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/quick-add/employee` | `admin/users/UserManagementClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/admin/generate-magic-link` | `admin/users/UserManagementClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/admin/users/*` | `admin/users/UserManagementClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/admin/users/*` | `admin/users/UserManagementClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/vendors?*` | `admin/vendors/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/campaigns?limit=50` | `ads/calendar/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/campaigns?*` | `ads/campaigns/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/analytics/calendar?year=*&month=*` | `analytics/calendar/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/analytics/profitability?*` | `analytics/profitability/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/client-access/calendar?year=*&month=*` | `client-access/calendar/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients/*` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/admin/users?role=EMPLOYEE` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients/*/tactical-data` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients/*/credentials` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients/*/portal-users` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/clients/*/credentials?id=*` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/clients/*/portal-users?id=*` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/clients/*/team` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/clients/*/team?memberId=*` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/clients` | `clients/[clientId]/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/clients/*/logo` | `clients/[clientId]/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/communications/calendar?year=*&month=*` | `communications/calendar/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/content/calendar?year=*&month=*` | `content/calendar/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/crm/leads/*` | `crm/[leadId]/LeadDetail.tsx` |
| `res` | ⚙ res | `POST` | `/api/crm/leads/*/convert` | `crm/[leadId]/LeadDetail.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/design/calendar?month=*&year=*` | `design/calendar/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/design/requests/*` | `design/requests/DesignRequestsClient.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/finance/calendar?year=*&month=*` | `finance/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/finance/calendar?year=*&month=*` | `finance/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/finance/calendar` | `finance/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/expenses` | `finance/expenses/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/expenses` | `finance/expenses/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/expenses/*` | `finance/expenses/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/expenses/*` | `finance/expenses/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/freelancer/work-reports` | `freelancer/work-reports/FreelancerWorkReportsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/hiring` | `hiring/new/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/appreciations?*` | `hr/appreciations/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/employees` | `hr/appreciations/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/appreciations` | `hr/appreciations/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/appraisals/trigger` | `hr/appraisals/AppraisalsDashboard.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/assessment/pipeline?*` | `hr/assessment-pipeline/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/assessment/*` | `hr/assessment-pipeline/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/attendance/entry` | `hr/attendance/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/assets` | `hr/assets/AssetSheet.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/assets/*` | `hr/assets/AssetSheet.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/employees` | `hr/attendance-import/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/attendance-import?limit=5` | `hr/attendance-import/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/attendance-import` | `hr/attendance-import/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/attendance-import/*` | `hr/attendance-import/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/hr/calendar?month=*&year=*` | `hr/calendar/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/client-feedback` | `hr/client-feedback/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/daily-meeting/tasks?date=*` | `hr/daily-meeting/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/employer-branding` | `hr/employer-branding/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/employer-branding/*` | `hr/employer-branding/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/employer-branding` | `hr/employer-branding/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/engagement-activities` | `hr/engagement-activities/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/engagement-activities` | `hr/engagement-activities/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/escalations` | `hr/escalations/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/escalations` | `hr/escalations/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/escalations/*` | `hr/escalations/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/exit/*/checklist` | `hr/exit/ExitChecklistClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/exit/*/checklist` | `hr/exit/ExitChecklistClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/exit` | `hr/exit/InitiateExitButton.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/fnf` | `hr/fnf/FnFClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/fnf` | `hr/fnf/FnFClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/fnf/*` | `hr/fnf/FnFClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/interviews` | `hr/interviews/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/interviews/*` | `hr/interviews/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/users?active=true` | `hr/interviews/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/leave` | `hr/leave/ApplyLeaveButton.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/leave/*` | `hr/leave/LeaveActionButtons.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/manager-reviews?*` | `hr/manager-reviews/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/manager-reviews` | `hr/manager-reviews/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/users?status=PROBATION,ACTIVE&recent=true` | `hr/onboarding-checklist/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/onboarding-checklist/*` | `hr/onboarding-checklist/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/quotes?mode=all` | `hr/quotes/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/quotes` | `hr/quotes/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/quotes` | `hr/quotes/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/vendors` | `hr/vendor-onboarding/VendorSheet.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/verify/*` | `hr/verifications/VerificationsList.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/verify/*` | `hr/verifications/VerificationsList.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/work-anniversaries?days=*` | `hr/work-anniversaries/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/work-anniversaries` | `hr/work-anniversaries/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/intern/acknowledge-handbook` | `intern/handbook/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/issues/*` | `issues/[issueId]/IssueDetail.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/issues/*` | `issues/[issueId]/IssueDetail.tsx` |
| `res` | ⚙ res | `POST` | `/api/issues/*/assign` | `issues/[issueId]/IssueDetail.tsx` |
| `res` | ⚙ res | `POST` | `/api/issues/*/comment` | `issues/[issueId]/IssueDetail.tsx` |
| `res` | ⚙ res | `GET` | `/api/learning/comments?resourceId=*` | `learning/resources/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/learning/comments` | `learning/resources/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/tactical/kpis` | `meetings/department-tactical/DepartmentTacticalClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/accountability/rating` | `meetings/kpi/KPIClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/accountability/goals` | `meetings/kpi/KPIClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/accountability/goals` | `meetings/kpi/KPIClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings` | `meetings/new/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/tactical/ops-kpis` | `meetings/ops-tactical/OpsTacticalClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tactical/ops-kpis/submit` | `meetings/ops-tactical/OpsTacticalClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings/strategic/peer-review` | `meetings/strategic/StrategicMeetingClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings/tactical/seed` | `meetings/tactical/TacticalMeetingClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings/tactical` | `meetings/tactical/TacticalMeetingClient.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/operations/calendar?year=*&month=*` | `operations/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/operations/calendar?year=*&month=*` | `operations/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/operations/calendar` | `operations/calendar/CalendarClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tactical/posts` | `meetings/tactical-sheet/TacticalSheetClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tactical/submit` | `meetings/tactical-sheet/TacticalSheetClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/operations/pending-onboarding` | `operations/pending-onboarding/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-deliverables?clientId=*&month=*` | `operations/tactical-tracker/TacticalTrackerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-deliverables` | `operations/tactical-tracker/TacticalTrackerClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/client-deliverables` | `operations/tactical-tracker/TacticalTrackerClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/client-deliverables?id=*` | `operations/tactical-tracker/TacticalTrackerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/accountability/deliverables` | `performance/deliverables/DeliverablesClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/accountability/goals` | `performance/goals/GoalsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/accountability/goals` | `performance/goals/GoalsClient.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/sales/calendar?month=*&year=*` | `sales/calendar/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/daily-tasks/*` | `sales/components/TaskCheckbox.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/leads` | `sales/daily-meeting/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/deals` | `sales/deals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/handover?*` | `sales/handovers/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/handover` | `sales/handovers/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/leads` | `sales/leads/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/leads` | `sales/leads/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/meetings` | `sales/meetings/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/meetings/*` | `sales/meetings/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/meetings/*` | `sales/meetings/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/leads/*/nurture` | `sales/nurturing/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/leads` | `sales/pipeline/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/leads/*/stage` | `sales/pipeline/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/proposals` | `sales/proposals/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/proposals` | `sales/proposals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/rfp/create` | `sales/rfp-manager/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/rfp/create` | `sales/rfp-manager/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE&limit=100` | `seo/gbp/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/gbp` | `seo/gbp/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/gbp` | `seo/gbp/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/gbp` | `seo/gbp/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/tasks` | `seo/tasks/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE&limit=100` | `seo/tasks/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/employees?department=SEO` | `seo/tasks/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/tasks` | `seo/tasks/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/tasks` | `seo/tasks/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE&limit=100` | `seo/youtube/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/youtube` | `seo/youtube/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/youtube` | `seo/youtube/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/youtube` | `seo/youtube/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/calendar` | `social/calendar/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks` | `social/tasks/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/tasks/*` | `tasks/[id]/TaskDetailClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/*/comments` | `tasks/[id]/TaskDetailClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/tasks/daily/*` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/tasks/daily/*` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily/*/start` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily/*/complete` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/tasks/daily/*` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily/*/complete` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/whatsapp/task-message` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/whatsapp/task-message` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily/submit` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/tasks/daily/pending-reviews` | `tasks/daily/DailyTaskPlannerClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/users/*` | `team/[id]/EditProfileModal.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/users/profile-picture` | `team/[id]/TeamMemberHeader.tsx` |
| `res` | ⚙ res | `GET` | `/api/org-chart` | `team/org-chart/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web/bugs` | `web/bugs/WebBugsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/web/bugs/*` | `web/bugs/WebBugsClient.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/web/calendar?month=*&year=*` | `web/calendar/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-clients?*` | `web/clients/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-clients` | `web/clients/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web/escalations` | `web/escalations/WebEscalationsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks` | `web/projects/WebProjectsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/web/requests` | `web/requests/WebRequestsClient.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/web/requests/*` | `web/requests/WebRequestsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/onboarding/*/service-change-request` | `[token]/steps/Step1ConfirmDetails.tsx` |
| `res` | ⚙ res | `POST` | `/api/onboarding/*/confirm` | `[token]/steps/Step1ConfirmDetails.tsx` |
| `res` | ⚙ res | `GET` | `/api/onboarding/*/sla` | `[token]/steps/Step2SignSLA.tsx` |
| `res` | ⚙ res | `POST` | `/api/onboarding/*/sla` | `[token]/steps/Step2SignSLA.tsx` |
| `res` | ⚙ res | `GET` | `/api/onboarding/*/invoice` | `[token]/steps/Step3PaymentInvoice.tsx` |
| `res` | ⚙ res | `POST` | `/api/onboarding/*/payment` | `[token]/steps/Step3PaymentInvoice.tsx` |
| `res` | ⚙ res | `POST` | `/api/onboarding/*/details` | `[token]/steps/Step4AccountOnboarding.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-portal/meetings/*` | `meetings/[id]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/issues` | `support/new/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-portal/contracts` | `web/contracts/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-portal/credentials` | `web/credentials/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-portal/credentials` | `web/credentials/page.tsx` |
| `res` | ⚙ res | `DELETE` | `/api/web-portal/credentials?id=*` | `web/credentials/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-portal/maintenance` | `web/maintenance/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-portal/maintenance` | `web/maintenance/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-portal/sitemap` | `web/sitemap/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-portal/support/tickets` | `web/support/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/proposal/*` | `[token]/payment/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/payments/offline-request` | `[token]/payment/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/proposal/*` | `[token]/success/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/expenses/recurring?*` | `expenses/recurring/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE` | `expenses/recurring/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/expenses/recurring` | `expenses/recurring/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/expenses/recurring/*/pay` | `expenses/recurring/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/expenses/recurring/*` | `expenses/recurring/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/meetings/monthly?*` | `meetings/monthly/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/meetings/monthly` | `meetings/monthly/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/meetings/strategic?period=*` | `meetings/strategic/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/meetings/operational?period=*` | `meetings/operational/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/meetings/tactical?month=*` | `meetings/tactical/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/onboarding/*/confirm-payment` | `onboarding/[proposalId]/ProposalDetailsClient.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/onboarding` | `onboarding/create/CreateOnboardingClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/accounts/proposals/*` | `proposals/[id]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/proposals/*/send` | `proposals/[id]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/proposals` | `proposals/new/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/budget?month=*` | `budget/allocations/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/spend?from=*&to=*` | `budget/spend/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/campaigns?*` | `campaigns/google/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/campaigns?*` | `campaigns/meta/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/campaigns?status=DRAFT&limit=20` | `campaigns/planner/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/campaigns?limit=50` | `clients/strategy/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/creatives?*` | `creatives/assets/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/campaigns` | `creatives/assets/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/upload/cloudinary` | `creatives/assets/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/ads/creatives` | `creatives/assets/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/creative-requests` | `creatives/requests/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/ads/creative-requests` | `creatives/requests/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/conversions?from=*&to=*` | `leads/conversions/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/conversions?*` | `leads/performance/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/ads/campaigns?*` | `performance/campaigns/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/analytics` | `performance/reports/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/analytics?type=roi` | `performance/roi/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/ads/analytics` | `reports/tactical/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/clients/*/team` | `[clientId]/team/TeamAssignment.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/deliverables/approvals` | `deliverables/approvals/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/qc/reviews` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/qc/reviews` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/design/requests` | `requests/new/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients` | `invoices/new/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/invoices` | `invoices/new/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/freelancer/work-reports` | `work-reports/new/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/appraisals/*/complete` | `appraisals/[id]/AppraisalReview.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/appraisals/save` | `appraisals/self/SelfAppraisalForm.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/appraisals/submit` | `appraisals/self/SelfAppraisalForm.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/appraisals/trigger` | `appraisals/workflow/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/appraisals/*/complete` | `appraisals/workflow/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/attendance/sync` | `attendance/calendar/SyncMyZenButton.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/attendance-import?limit=50` | `attendance-import/analyze/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/attendance-import/merge` | `attendance-import/analyze/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/devices/my` | `forms/device-allocation/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/devices/request` | `forms/device-allocation/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/devices/return` | `forms/device-allocation/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/meetings/tactical` | `reports/tactical/HRTacticalClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/manager/departments/ads` | `departments/ads/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/manager/departments/ai` | `departments/ai/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/manager/departments/seo` | `departments/seo/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/manager/departments/social` | `departments/social/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/manager/departments/web` | `departments/web/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/manager/hr/team-performance` | `hr/team-performance/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/issues` | `operations/mash-tasks/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/operations/onboarding/*` | `onboarding/[clientId]/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/operations/onboarding/*` | `onboarding/[clientId]/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-deliverables?clientId=*&month=*` | `tactical-tracker/views/AccountsTrackerView.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-deliverables?clientId=*&month=*` | `tactical-tracker/views/EmployeeTrackerView.tsx` |
| `res` | ⚙ res | `POST` | `/api/client-deliverables` | `tactical-tracker/views/EmployeeTrackerView.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/client-deliverables` | `tactical-tracker/views/EmployeeTrackerView.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-deliverables?clientId=*&month=*` | `tactical-tracker/views/HRTrackerView.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-deliverables?clientId=*&month=*` | `tactical-tracker/views/ManagerTrackerView.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/client-deliverables` | `tactical-tracker/views/ManagerTrackerView.tsx` |
| `res` | ⚙ res | `GET` | `/api/client-deliverables?clientId=*&month=*` | `tactical-tracker/views/SalesTrackerView.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/deals?status=LOST` | `deals/lost/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/leads/*` | `deals/lost/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/deals?status=WON` | `deals/won/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/leads/*/stage` | `leads/[id]/SalesLeadDetail.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/leads/import` | `leads/import/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/nurturing/content` | `nurturing/content/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/goals?*` | `performance/goals/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/goals` | `performance/goals/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/goals` | `performance/goals/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/goals` | `performance/goals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/leads` | `proposals/new/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/proposals` | `proposals/new/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/rfp?status=COMPLETED` | `rfp/completed/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/rfp?status=SENT` | `rfp/pending/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/leads` | `rfp/send/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/sales/rfp` | `rfp/send/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/keywords` | `clients/keywords/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/keywords` | `clients/keywords/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/plans` | `clients/plans/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/backlinks` | `deliverables/backlinks/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/backlinks` | `deliverables/backlinks/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/backlinks` | `deliverables/backlinks/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/content` | `deliverables/content/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/content` | `deliverables/content/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/content` | `deliverables/content/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/tasks` | `deliverables/technical/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/tasks` | `deliverables/technical/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE&limit=100` | `performance/reports/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/reports` | `performance/reports/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/reports` | `performance/reports/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/reports` | `performance/reports/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE&limit=100` | `quality/approvals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/client-approvals` | `quality/approvals/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/client-approvals` | `quality/approvals/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/client-approvals` | `quality/approvals/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/client-approvals` | `quality/approvals/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/client-approvals` | `quality/approvals/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients?status=ACTIVE&limit=100` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/qc-reviews` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/seo/qc-reviews` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/qc-reviews` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/qc-reviews` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `PUT` | `/api/seo/qc-reviews` | `quality/qc-review/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/seo/tasks` | `tasks/board/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/seo/tasks` | `tasks/timeline/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/social/approvals/*` | `approvals/client/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/social/approvals/*` | `approvals/internal/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/social/metrics?groupBy=platform` | `clients/platforms/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/social/strategy` | `clients/strategy/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/social/approvals` | `content/planner/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/social/approvals` | `content/creative-requests/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/social/clients?limit=100` | `performance/campaigns/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/social/posts?limit=100` | `performance/engagement/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/social/posts?contentType=&limit=50` | `publishing/scheduled/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/social/metrics?limit=100` | `performance/reports/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/social/posts?limit=50` | `publishing/published/page.tsx` |
| `res` | ⚡ useEffect Loader | `GET` | `/api/social/approvals` | `tasks/timeline/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks/daily/*/review` | `daily/components/ManagerReviewPanel.tsx` |
| `res` | ⚙ res | `GET` | `/api/tasks/daily/history?months=12` | `daily/history/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/hr/pipeline-tasks` | `daily/views/HRGanttView.tsx` |
| `res` | ⚙ res | `POST` | `/api/hr/pipeline-tasks` | `daily/views/HRGanttView.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/hr/pipeline-tasks/*` | `daily/views/HRGanttView.tsx` |
| `res` | ⚙ res | `GET` | `/api/clients/operations-overview` | `daily/views/OpsClientListView.tsx` |
| `res` | ⚙ res | `POST` | `/api/web/amc` | `amc/new/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-clients/*` | `clients/[id]/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/web-clients/*` | `clients/[id]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/maintenance-contracts` | `clients/[id]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-clients/*/convert-recurring` | `clients/[id]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-clients` | `clients/new/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/tasks` | `projects/new/WebProjectForm.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-portal/sitemap/*` | `sitemap/[pageId]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-portal/sitemap/*/feedback` | `sitemap/[pageId]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-portal/sitemap/*/feedback` | `sitemap/[pageId]/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/accounts/onboarding/*/activate` | `[proposalId]/review/ManagerReviewClient.tsx` |
| `res` | ⚙ res | `GET` | `/api/sales/proposals/*` | `[id]/edit/page.tsx` |
| `res` | ⚙ res | `PATCH` | `/api/sales/proposals/*` | `[id]/edit/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-clients/*/portal-access` | `[id]/portal/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-clients/*/portal-access` | `[id]/portal/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-clients/*/portal-access` | `[id]/portal/page.tsx` |
| `res` | ⚙ res | `GET` | `/api/web-clients/*/sitemap` | `[id]/sitemap/page.tsx` |
| `res` | ⚙ res | `POST` | `/api/web-clients/*/sitemap` | `[id]/sitemap/page.tsx` |
| `resp` | ⚙ resp | `POST` | `/emails` | `server/email/sender.ts` |
| `response` | ⚙ response | `POST` | `/chat/completions` | `server/ai/learningVerification.ts` |
| `response` | ⚙ response | `POST` | `/chat/completions` | `server/ai/openrouter.ts` |
| `response` | ⚙ response | `GET` | `//graph.facebook.com/oauth/access_token?client_id=*&client_secret=*&grant_type=client_credentials` | `server/api-credentials/providers.ts` |
| `response` | ⚙ response | `GET` | `/v1/payments` | `server/api-credentials/providers.ts` |
| `response` | ⚙ response | `GET` | `/v1/balance` | `server/api-credentials/providers.ts` |
| `response` | ⚙ response | `GET` | `/domains` | `server/api-credentials/providers.ts` |
| `response` | ⚙ response | `GET` | `/api/v1/models` | `server/api-credentials/providers.ts` |
| `response` | ⚙ response | `GET` | `/v1/status` | `server/api-credentials/providers.ts` |
| `response` | ⚙ response | `GET` | `/v1/models` | `server/api-credentials/providers.ts` |
| `response` | ⚙ response | `GET` | `//ipwho.is/*` | `server/auth/session-tracker.ts` |
| `response` | ⚙ response | `POST` | `/v3/mail/send` | `server/notifications/email.ts` |
| `response` | ⚙ response | `POST` | `/send_msg/` | `server/notifications/wbiztool.ts` |
| `response` | ⚙ response | `POST` | `/send_msg/group/` | `server/notifications/wbiztool.ts` |
| `response` | ⚙ response | `GET` | `/api/saas-tools?*` | `shared/constants/saasTools.ts` |
| `response` | ⚙ response | `GET` | `/api/saas-tools/*` | `shared/constants/saasTools.ts` |
| `response` | ⚙ response | `POST` | `/api/saas-tools` | `shared/constants/saasTools.ts` |
| `response` | ⚙ response | `PATCH` | `/api/saas-tools/*` | `shared/constants/saasTools.ts` |
| `response` | ⚙ response | `DELETE` | `/api/saas-tools/*` | `shared/constants/saasTools.ts` |
| `response` | ⚙ response | `POST` | `/api/clients/*/lifecycle` | `components/clients/LifecyclePipeline.tsx` |
| `response` | ⚙ response | `PATCH` | `/api/clients/*` | `components/clients/LifecyclePipeline.tsx` |
| `response` | ⚙ response | `POST` | `/api/web/amc/*/logs` | `components/web/AMCTracker.tsx` |
| `response` | ⚙ response | `GET` | `/api/clients?isWebTeamClient=true` | `components/web/AddDomainModal.tsx` |
| `response` | ⚙ response | `POST` | `/api/web/domains` | `components/web/AddDomainModal.tsx` |
| `response` | ⚙ response | `GET` | `/api/clients?isWebTeamClient=true` | `components/web/AddHostingModal.tsx` |
| `response` | ⚙ response | `POST` | `/api/web/hosting` | `components/web/AddHostingModal.tsx` |
| `response` | ⚙ response | `POST` | `/api/web/reimbursements` | `components/web/ReimbursementForm.tsx` |
| `response` | ⚙ response | `GET` | `/api/client-portal/web/dashboard` | `client-portal/web/page.tsx` |
| `response` | ⚙ response | `GET` | `/oauth2/v2/userinfo` | `integrations/google/client.ts` |
| `response` | ⚙ response | `POST` | `/api/reports/export` | `admin/reports/ReportBuilderClient.tsx` |
| `response` | ⚙ response | `POST` | `/api/whatsapp/campaigns/*/start` | `communications/campaigns/CampaignsPage.tsx` |
| `response` | ⚙ response | `POST` | `/api/whatsapp/campaigns` | `communications/campaigns/CampaignsPage.tsx` |
| `response` | ⚙ response | `GET` | `/api/whatsapp/templates` | `communications/templates/TemplatesPage.tsx` |
| `response` | ⚙ response | `POST` | `/api/whatsapp/templates/*/send` | `communications/templates/TemplatesPage.tsx` |
| `response` | ⚙ response | `GET` | `/api/client-portal/web/approvals` | `web/approvals/page.tsx` |
| `response` | ⚙ response | `POST` | `/api/client-portal/web/approvals/*/approve` | `web/approvals/page.tsx` |
| `response` | ⚙ response | `POST` | `/api/client-portal/web/approvals/*/request-changes` | `web/approvals/page.tsx` |
| `response` | ⚙ response | `GET` | `/api/client-portal/web/bugs` | `web/bugs/page.tsx` |
| `response` | ⚙ response | `POST` | `/api/client-portal/web/bugs` | `web/bugs/page.tsx` |
| `response` | ⚙ response | `GET` | `/api/client-portal/web/requests` | `web/requests/page.tsx` |
| `response` | ⚙ response | `POST` | `/api/client-portal/web/requests` | `web/requests/page.tsx` |
| `response` | ⚙ response | `POST` | `/api/client-portal/web/requests/*/approve` | `web/requests/page.tsx` |
| `response` | ⚙ response | `POST` | `/api/client-portal/web/requests/*/reject` | `web/requests/page.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/access-requests?*` | `api-management/components/AccessRequestsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/access-requests/*/send-instructions` | `api-management/components/AccessRequestsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/access-requests/*/verify` | `api-management/components/AccessRequestsTab.tsx` |
| `response` | ⚙ response | `DELETE` | `/api/admin/access-requests/*` | `api-management/components/AccessRequestsTab.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/api-credentials/analytics` | `api-management/components/AnalyticsTab.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/api-credentials` | `api-management/components/ApiCredentialsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/api-credentials/migrate` | `api-management/components/ApiCredentialsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/api-credentials/*/verify` | `api-management/components/ApiCredentialsTab.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/api-credentials/audit-log?*` | `api-management/components/AuditLogTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/api-credentials/*/verify` | `api-management/components/CredentialCard.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/api-credentials/*` | `api-management/components/CredentialForm.tsx` |
| `response` | ⚙ response | `DELETE` | `/api/admin/api-credentials/*` | `api-management/components/CredentialForm.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/api-credentials/health` | `api-management/components/HealthOverview.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/oauth-connections?*` | `api-management/components/OAuthConnectionsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/oauth-connections/*/refresh` | `api-management/components/OAuthConnectionsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/oauth-connections/*/revoke` | `api-management/components/OAuthConnectionsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/oauth-connections/*/verify-access` | `api-management/components/OAuthConnectionsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/api-credentials/re-auth` | `api-management/components/ReAuthModal.tsx` |
| `response` | ⚙ response | `GET` | `/api/admin/service-accounts` | `api-management/components/ServiceAccountsTab.tsx` |
| `response` | ⚙ response | `PATCH` | `/api/admin/service-accounts/*` | `api-management/components/ServiceAccountsTab.tsx` |
| `response` | ⚙ response | `DELETE` | `/api/admin/service-accounts/*` | `api-management/components/ServiceAccountsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/admin/service-accounts` | `api-management/components/ServiceAccountsTab.tsx` |
| `response` | ⚙ response | `POST` | `/api/web/upsells` | `billing/upsells/page.tsx` |
| `response` | ⚙ response | `PATCH` | `/api/web/upsells/*` | `billing/upsells/page.tsx` |
| `result` | ⚙ result | `GET` | `/api/tasks?department=SOCIAL_MEDIA` | `social/tasks/page.tsx` |
| `result` | ⚙ result | `GET` | `/api/social/approvals?type=CREATIVE` | `content/creative-requests/page.tsx` |
| `results` | ⚙ results | `PATCH` | `/api/admin/users/*` | `(dashboard)/admin/AdminDashboard.tsx` |
| `results` | ⚙ results | `PATCH` | `/api/admin/users/*` | `(dashboard)/admin/AdminDashboard.tsx` |
| `results` | ⚙ results | `POST` | `/api/admin/quick-add/assignment` | `admin/bulk-ops/page.tsx` |
| `results` | ⚙ results | `PATCH` | `/api/admin/clients` | `admin/bulk-ops/page.tsx` |
| `saveDraft` | ⚙ saveDraft | `PATCH` | `/api/web-onboarding/*` | `web-onboarding/[token]/page.tsx` |
| `saveNotes` | ⚙ saveNotes | `PATCH` | `/api/operations/onboarding/*` | `onboarding/[clientId]/page.tsx` |
| `saveRes` | ⚙ saveRes | `POST` | `/api/tactical/ops-kpis` | `meetings/ops-tactical/OpsTacticalClient.tsx` |
| `saveTask` | ⚙ saveTask | `POST` | `/api/daily-meeting/tasks` | `accounts/daily-meeting/page.tsx` |
| `saveTask` | ⚙ saveTask | `POST` | `/api/daily-meeting/tasks` | `hr/daily-meeting/page.tsx` |
| `SeoNav` | ⚡ useEffect Loader | `GET` | `/api/hr/employees?department=SEO` | `components/layout/SeoNav.tsx` |
| `skipVerification` | ⚙ skipVerification | `PATCH` | `/api/learning/verify` | `(dashboard)/learning/LearningClient.tsx` |
| `SocialNav` | ⚡ useEffect Loader | `GET` | `/api/hr/employees?department=SOCIAL_MEDIA` | `components/layout/SocialNav.tsx` |
| `Step1ConfirmDetails` | ⚡ useEffect Loader | `GET` | `/api/onboarding/*/service-change-request` | `[token]/steps/Step1ConfirmDetails.tsx` |
| `ticketsRes` | ⚙ ticketsRes | `GET` | `/api/client-portal` | `app/client-portal/page.tsx` |
| `toggleAccess` | ⚙ toggleAccess | `PATCH` | `/api/web-clients/*/portal-access` | `[id]/portal/page.tsx` |
| `toggleActive` | ⚙ toggleActive | `PATCH` | `/api/whatsapp/templates/*` | `communications/templates/TemplatesPage.tsx` |
| `toggleActive` | ⚙ toggleActive | `PUT` | `/api/quotes` | `hr/quotes/page.tsx` |
| `updateStatus` | ⚙ updateStatus | `PATCH` | `/api/accounts/proforma-invoice/*` | `accounts/proforma-invoice/page.tsx` |
| `updateTaskStatus` | ⚙ updateTaskStatus | `PATCH` | `/api/daily-meeting/tasks/*` | `accounts/daily-meeting/page.tsx` |
| `updateTaskStatus` | ⚙ updateTaskStatus | `PATCH` | `/api/daily-meeting/tasks/*` | `hr/daily-meeting/page.tsx` |
| `uploadRes` | ⚙ uploadRes | `POST` | `/api/upload/cloudinary` | `(dashboard)/files/page.tsx` |
| `uploadRes` | ⚙ uploadRes | `POST` | `/api/upload/cloudinary` | `(dashboard)/settings/SettingsClient.tsx` |
| `verifyRes` | ⚡ useEffect Loader | `POST` | `/api/auth/magic-link/verify` | `app/admin-login/page.tsx` |
| `verifyRes` | ⚙ verifyRes | `POST` | `/api/payments/verify` | `[token]/payment/page.tsx` |

## 🗄️ Database Models

### 📊 DistributedLock *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "lockName: String"
  - `2`: "acquiredAt: DateTime"
  - `3`: "expiresAt: DateTime"

### 📊 User 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "empId: String"
  - `2`: "firstName: String"
  - `3`: "lastName: String"
  - `4`: "phone: String"
  - `5`: "email: String"
  - `6`: "password: String"
  - `7`: "twoFactorEnabled: Boolean"
  - `8`: "twoFactorSecret: String"
  - `9`: "twoFactorBackupCodes: String"
  - `10`: "twoFactorVerifiedAt: DateTime"
  - `11`: "role: String"
  - `12`: "department: String"
  - `13`: "employeeType: String"
  - `14`: "joiningDate: DateTime"
  - `15`: "dateOfBirth: DateTime"
  - `16`: "status: String"
  - `17`: "bloodGroup: String"
  - `18`: "address: String"
  - `19`: "languages: String"
  - `20`: "aiTools: String"
  - `21`: "education: String"
  - `22`: "healthConditions: String"
  - `23`: "capacity: Int"
  - `24`: "buddyId: String"
  - `25`: "profileCompletionStatus: String"
  - `26`: "onboardingStep: Int"
  - `27`: "hrVerifiedBy: String"
  - `28`: "hrVerifiedAt: DateTime"
  - `29`: "appraisalDate: DateTime"
  - `30`: "clientCapacity: Int"
  - `31`: "deletedAt: DateTime"
  - `32`: "createdAt: DateTime"
  - `33`: "updatedAt: DateTime"
  - `34`: "aiExtractions: AIExtractionSession"
  - `35`: "accountability: AccountabilityCharter"
  - `36`: "accountabilityScores: AccountabilityScore"
  - `37`: "achievements: Achievement"
  - `38`: "arcadeTransactions: ArcadePointTransaction"
  - `39`: "arcadeRedemptions: ArcadeRedemption"
  - `40`: "assetAssignments: AssetAssignment"
  - `41`: "attendance: Attendance"
  - `42`: "attendanceImports: AttendanceImport"
  - `43`: "budgetAlerts: BudgetAlert"
  - `44`: "assignedCampaigns: Campaign"
  - `45`: "assignedCandidates: Candidate"
  - `46`: "createdChannels: ChatChannel"
  - `47`: "channelMemberships: ChatChannelMember"
  - `48`: "sentMessages: ChatMessage"
  - `49`: "approvedAccessRequests: ClientAccessRequest"
  - `50`: "clientAccessRequests: ClientAccessRequest"
  - `51`: "contentApprovalsCreated: ContentApproval"
  - `52`: "deliverablesCreated: ClientDeliverable"
  - `53`: "deliverablesReviewed: ClientDeliverable"
  - `54`: "deliverablesSubmitted: ClientDeliverable"
  - `55`: "clientAssignments: ClientTeamMember"
  - `56`: "comments: Comment"
  - `57`: "communicationLogs: CommunicationLog"
  - `58`: "contentIdeas: ContentIdea"
  - `59`: "dailyMeetings: DailyMeeting"
  - `60`: "allocatedDailyTasks: DailyTask"
  - `61`: "reviewedDailyTasks: DailyTask"
  - `62`: "dailyTaskPlans: DailyTaskPlan"
  - `63`: "day0Assignments: Day0Task"
  - `64`: "day0Tasks: Day0Task"
  - `65`: "deviceRequests: DeviceRequest"
  - `66`: "receivedDirectMessages: DirectMessage"
  - `67`: "sentDirectMessages: DirectMessage"
  - `68`: "documents: Document"
  - `69`: "appreciationsReceived: EmployeeAppreciation"
  - `70`: "appreciationsGiven: EmployeeAppreciation"
  - `71`: "employeeClientFeedback: EmployeeClientFeedback"
  - `72`: "escalationsReceived: EmployeeEscalation"
  - `73`: "escalationsReported: EmployeeEscalation"
  - `74`: "onboardingChecklist: EmployeeOnboardingChecklist"
  - `75`: "createdEmployeeProposals: EmployeeProposal"
  - `76`: "employeeProposals: EmployeeProposal"
  - `77`: "assignedWhatsAppChats: EmployeeWhatsAppChat"
  - `78`: "brandingContentApproved: EmployerBrandingContent"
  - `79`: "brandingContentCreated: EmployerBrandingContent"
  - `80`: "activitiesApproved: EngagementActivity"
  - `81`: "activitiesOrganized: EngagementActivity"
  - `82`: "exitProcesses: ExitProcess"
  - `83`: "expensePayments: ExpensePayment"
  - `84`: "fnfSettlements: FnFSettlement"
  - `85`: "followUpReminders: FollowUpReminder"
  - `86`: "freelancerProfile: FreelancerProfile"
  - `87`: "goalsCreated: Goal"
  - `88`: "goalsOwned: Goal"
  - `89`: "ideas: Idea"
  - `90`: "ideaVotes: IdeaVote"
  - `91`: "impersonationsAsAdmin: ImpersonationSession"
  - `92`: "impersonationsAsTarget: ImpersonationSession"
  - `93`: "incentivePayouts: IncentivePayout"
  - `94`: "internProfile: InternProfile"
  - `95`: "conductedInterviews: Interview"
  - `96`: "issues: Issue"
  - `97`: "createdIssues: Issue"
  - `98`: "assignedLeads: Lead"
  - `99`: "leadActivities: LeadActivity"
  - `100`: "nurturingActions: LeadNurturingAction"
  - `101`: "learningAudits: LearningAudit"
  - `102`: "learningLogs: LearningLog"
  - `103`: "resourceComments: LearningResourceComment"
  - `104`: "learningVerifications: LearningVerification"
  - `105`: "leaveBalances: LeaveBalance"
  - `106`: "leaveRequests: LeaveRequest"
  - `107`: "likes: Like"
  - `108`: "magicLinkTokens: MagicLinkToken"
  - `109`: "managerReviewsReceived: ManagerBehaviorReview"
  - `110`: "managerReviewsConducted: ManagerBehaviorReview"
  - `111`: "meetingActionItems: MeetingActionItem"
  - `112`: "meetingCompliance: MeetingCompliance"
  - `113`: "meetings: MeetingParticipant"
  - `114`: "monthlyGrowthScores: MonthlyGrowthScore"
  - `115`: "notifications: Notification"
  - `116`: "pipManagedPlans: PIPPlan"
  - `117`: "pipPlans: PIPPlan"
  - `118`: "pageFeedback: PageFeedback"
  - `119`: "scores: PerformanceScore"
  - `120`: "posts: Post"
  - `121`: "profile: Profile"
  - `122`: "quotesCreated: Quote"
  - `123`: "rbcAccruals: RBCAccrual"
  - `124`: "rbcPayouts: RBCPayout"
  - `125`: "rbcPot: RBC_Pot"
  - `126`: "givenRecognition: Recognition"
  - `127`: "recognition: Recognition"
  - `128`: "expensesCreated: RecurringExpense"
  - `129`: "referralsReceived: ReferralBonus"
  - `130`: "referralsMade: ReferralBonus"
  - `131`: "salesDailyTasks: SalesDailyTask"
  - `132`: "salesDeals: SalesDeal"
  - `133`: "accountsHandovers: SalesHandover"
  - `134`: "salesHandovers: SalesHandover"
  - `135`: "salesMeetings: SalesMeeting"
  - `136`: "salesWhatsAppMessages: SalesWhatsAppMessage"
  - `137`: "seoBacklinksCreated: SeoBacklink"
  - `138`: "seoContentWritten: SeoContent"
  - `139`: "seoTasksAssigned: SeoTask"
  - `140`: "seoTasksReviewing: SeoTask"
  - `141`: "qcReviewsSubmitted: QcReview"
  - `142`: "qcReviewsReviewed: QcReview"
  - `143`: "approvalsSubmitted: ClientApproval"
  - `144`: "youTubeVideosAssigned: YouTubeVideo"
  - `145`: "sharedWhatsAppChats: SharedWhatsAppChat"
  - `146`: "socialMediaPageMetrics: SocialMediaPageMetrics"
  - `147`: "socialMediaPosts: SocialMediaPost"
  - `148`: "supportTickets: SupportTicket"
  - `149`: "tacticalGoals: TacticalGoal"
  - `150`: "tacticalMeetings: TacticalMeeting"
  - `151`: "assignedTasks: Task"
  - `152`: "createdTasks: Task"
  - `153`: "reviewedTasks: Task"
  - `154`: "taskComments: TaskComment"
  - `155`: "ticketActivities: TicketActivity"
  - `156`: "timeEntries: TimeEntry"
  - `157`: "buddy: User"
  - `158`: "buddies: User"
  - `159`: "certifications: UserCertification"
  - `160`: "customRoles: UserCustomRole"
  - `161`: "googleDrive: UserGoogleDrive"
  - `162`: "trainings: UserTraining"
  - `163`: "requestedTestimonials: VideoTestimonial"
  - `164`: "verifiedTestimonials: VideoTestimonial"
  - `165`: "violations: Violations"
  - `166`: "WebBugReport_WebBugReport_assignedToIdToUser: WebBugReport"
  - `167`: "WebBugReport_WebBugReport_resolvedByIdToUser: WebBugReport"
  - `168`: "WebChangeRequest_WebChangeRequest_assignedToIdToUser: WebChangeRequest"
  - `169`: "WebChangeRequest_WebChangeRequest_completedByIdToUser: WebChangeRequest"
  - `170`: "assignedWebPhases: WebProjectPhase"
  - `171`: "whatsAppAccess: WhatsAppAccess"
  - `172`: "whatsAppChatNotes: WhatsAppChatNote"
  - `173`: "workAnniversaries: WorkAnniversaryReminder"
  - `174`: "workDeliverables: WorkDeliverable"
  - `175`: "workEntries: WorkEntry"
  - `176`: "loginSessions: LoginSession"
  - `177`: "passwordResetTokens: PasswordResetToken"

### 📊 Profile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "ndaSigned: Boolean"
  - `3`: "ndaSignedAt: DateTime"
  - `4`: "biometricPunch: Boolean"
  - `5`: "razorpayLinked: Boolean"
  - `6`: "profilePicture: String"
  - `7`: "panCard: String"
  - `8`: "aadhaar: String"
  - `9`: "linkedIn: String"
  - `10`: "favoriteFood: String"
  - `11`: "parentsPhone1: String"
  - `12`: "parentsPhone2: String"
  - `13`: "livingSituation: String"
  - `14`: "distanceFromOffice: String"
  - `15`: "skills: String"
  - `16`: "bio: String"
  - `17`: "emergencyContactName: String"
  - `18`: "emergencyContactPhone: String"
  - `19`: "panCardUrl: String"
  - `20`: "aadhaarUrl: String"
  - `21`: "bankDetailsUrl: String"
  - `22`: "educationCertUrl: String"
  - `23`: "employeeHandbookAccepted: Boolean"
  - `24`: "socialMediaPolicyAccepted: Boolean"
  - `25`: "clientConfidentialityAccepted: Boolean"
  - `26`: "allPoliciesAccepted: Boolean"
  - `27`: "policiesAcceptedAt: DateTime"
  - `28`: "completionPercentage: Int"
  - `29`: "signatureData: String"
  - `30`: "signatureType: String"
  - `31`: "signedAt: DateTime"
  - `32`: "selfieImage: String"
  - `33`: "kycVerifiedAt: DateTime"
  - `34`: "allocatedDeviceType: String"
  - `35`: "allocatedDeviceId: String"
  - `36`: "personalMobileNumber: String"
  - `37`: "officialPhoneNumber: String"
  - `38`: "hasWhatsAppAccess: Boolean"
  - `39`: "deviceAllocatedAt: DateTime"
  - `40`: "user: User"

### 📊 VideoTestimonial *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "requestedById: String"
  - `2`: "clientId: String"
  - `3`: "requestedAt: DateTime"
  - `4`: "requestMessage: String"
  - `5`: "clientContactName: String"
  - `6`: "clientContactEmail: String"
  - `7`: "youtubeUrl: String"
  - `8`: "thumbnailUrl: String"
  - `9`: "title: String"
  - `10`: "description: String"
  - `11`: "duration: Int"
  - `12`: "status: String"
  - `13`: "receivedAt: DateTime"
  - `14`: "verifiedAt: DateTime"
  - `15`: "verifiedById: String"
  - `16`: "verificationNotes: String"
  - `17`: "voucherAmount: Float"
  - `18`: "voucherCode: String"
  - `19`: "rewardedAt: DateTime"
  - `20`: "badgeColor: String"
  - `21`: "isFeatured: Boolean"
  - `22`: "displayOrder: Int"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"
  - `25`: "client: Client"
  - `26`: "requestedBy: User"
  - `27`: "verifiedBy: User"

### 📊 Client 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "logoUrl: String"
  - `3`: "contactName: String"
  - `4`: "contactEmail: String"
  - `5`: "contactPhone: String"
  - `6`: "whatsapp: String"
  - `7`: "websiteUrl: String"
  - `8`: "address: String"
  - `9`: "gstNumber: String"
  - `10`: "panNumber: String"
  - `11`: "state: String"
  - `12`: "city: String"
  - `13`: "pincode: String"
  - `14`: "businessType: String"
  - `15`: "industry: String"
  - `16`: "monthlyBudget: String"
  - `17`: "monthlyFee: Float"
  - `18`: "tier: String"
  - `19`: "clientSegment: String"
  - `20`: "status: String"
  - `21`: "clientType: String"
  - `22`: "isWebTeamClient: Boolean"
  - `23`: "addedByUserId: String"
  - `24`: "webProjectStatus: String"
  - `25`: "webProjectStartDate: DateTime"
  - `26`: "webProjectEndDate: DateTime"
  - `27`: "webProjectNotes: String"
  - `28`: "websiteType: String"
  - `29`: "techStack: String"
  - `30`: "parentClientId: String"
  - `31`: "brandName: String"
  - `32`: "serviceSegment: String"
  - `33`: "billingType: String"
  - `34`: "billingAmount: Float"
  - `35`: "concernedPerson: String"
  - `36`: "concernedPersonPhone: String"
  - `37`: "isLost: Boolean"
  - `38`: "lostReason: String"
  - `39`: "stoppedServices: Boolean"
  - `40`: "upsellPotential: String"
  - `41`: "linkedClientId: String"
  - `42`: "paymentStatus: String"
  - `43`: "paymentDueDay: Int"
  - `44`: "invoiceDayOfMonth: Int"
  - `45`: "invoiceStatus: String"
  - `46`: "currentPaymentStatus: String"
  - `47`: "bankAccount: String"
  - `48`: "advanceAmount: Float"
  - `49`: "pendingAmount: Float"
  - `50`: "services: String"
  - `51`: "reminderFrequency: String"
  - `52`: "paymentTerms: String"
  - `53`: "customPaymentDays: Int"
  - `54`: "preferredContact: String"
  - `55`: "haltReminders: Boolean"
  - `56`: "accountsNotes: String"
  - `57`: "healthScore: Int"
  - `58`: "healthStatus: String"
  - `59`: "projectStatus: String"
  - `60`: "projectPriority: String"
  - `61`: "platform: String"
  - `62`: "startDate: DateTime"
  - `63`: "endDate: DateTime"
  - `64`: "progress: Int"
  - `65`: "onboardingToken: String"
  - `66`: "onboardingStatus: String"
  - `67`: "slaSigned: Boolean"
  - `68`: "slaSignedAt: DateTime"
  - `69`: "slaDocumentUrl: String"
  - `70`: "sowSigned: Boolean"
  - `71`: "sowSignedAt: DateTime"
  - `72`: "sowDocumentUrl: String"
  - `73`: "initialPaymentConfirmed: Boolean"
  - `74`: "initialPaymentDate: DateTime"
  - `75`: "lifecycleStage: String"
  - `76`: "leadId: String"
  - `77`: "entityType: String"
  - `78`: "poNumber: String"
  - `79`: "welcomeMessageSent: Boolean"
  - `80`: "onboardingFormCompleted: Boolean"
  - `81`: "accountManagerId: String"
  - `82`: "onboardingSharedBy: String"
  - `83`: "onboardingSharedAt: DateTime"
  - `84`: "proposalId: String"
  - `85`: "paymentConfirmedAt: DateTime"
  - `86`: "ledgerStartedAt: DateTime"
  - `87`: "primaryGoal: String"
  - `88`: "ndaSigned: Boolean"
  - `89`: "contractLength: String"
  - `90`: "referralSource: String"
  - `91`: "notes: String"
  - `92`: "facebookUrl: String"
  - `93`: "instagramUrl: String"
  - `94`: "linkedinUrl: String"
  - `95`: "twitterUrl: String"
  - `96`: "youtubeUrl: String"
  - `97`: "competitor1: String"
  - `98`: "competitor2: String"
  - `99`: "competitor3: String"
  - `100`: "targetAudience: String"
  - `101`: "brandAssets: String"
  - `102`: "selectedServices: String"
  - `103`: "contentTypes: String"
  - `104`: "credentials: String"
  - `105`: "terminationStatus: String"
  - `106`: "deletedAt: DateTime"
  - `107`: "createdAt: DateTime"
  - `108`: "updatedAt: DateTime"
  - `109`: "clientCode: String"
  - `110`: "aiExtractions: AIExtractionSession"
  - `111`: "accountability: AccountabilityCharter"
  - `112`: "achievements: Achievement"
  - `113`: "autoInvoiceConfig: AutoInvoiceConfig"
  - `114`: "automations: Automation"
  - `115`: "bankTransactions: BankTransaction"
  - `116`: "budgetAlerts: BudgetAlert"
  - `117`: "budgetAllocations: BudgetAllocation"
  - `118`: "campaigns: Campaign"
  - `119`: "linkedClient: Client"
  - `120`: "linkedClients: Client"
  - `121`: "parentClient: Client"
  - `122`: "subClients: Client"
  - `123`: "accessRequests: ClientAccessRequest"
  - `124`: "portalAnnouncements: ClientAnnouncement"
  - `125`: "clientCredentials: ClientCredential"
  - `126`: "deliverables: ClientDeliverable"
  - `127`: "portalDocuments: ClientDocument"
  - `128`: "clientFeedback: ClientFeedback"
  - `129`: "portalGoals: ClientGoal"
  - `130`: "ledgerEntries: ClientLedger"
  - `131`: "lifecycleEvents: ClientLifecycleEvent"
  - `132`: "oauthConnections: ClientOAuthConnection"
  - `133`: "clientOnboardingChecklist: ClientOnboardingChecklist"
  - `134`: "operationsLogs: ClientOperationsLog"
  - `135`: "platformAccounts: ClientPlatformAccount"
  - `136`: "clientPortalFeedback: ClientPortalFeedback"
  - `137`: "properties: ClientProperty"
  - `138`: "scopes: ClientScope"
  - `139`: "teamMembers: ClientTeamMember"
  - `140`: "clientUsers: ClientUser"
  - `141`: "userInvitations: ClientUserInvitation"
  - `142`: "whatsAppGroups: ClientWhatsAppGroup"
  - `143`: "communicationLogs: CommunicationLog"
  - `144`: "communicationSchedules: CommunicationSchedule"
  - `145`: "contentApprovals: ContentApproval"
  - `146`: "contracts: Contract"
  - `147`: "dailyTasks: DailyTask"
  - `148`: "importBatches: DataImportBatch"
  - `149`: "documents: Document"
  - `150`: "domains: Domain"
  - `151`: "employeeAppreciations: EmployeeAppreciation"
  - `152`: "employeeClientFeedbacks: EmployeeClientFeedback"
  - `153`: "employeeEscalations: EmployeeEscalation"
  - `154`: "expenses: Expense"
  - `155`: "expenseAllocations: ExpenseAllocation"
  - `156`: "gbpProfiles: GbpProfile"
  - `157`: "goals: Goal"
  - `158`: "hostingAccounts: HostingAccount"
  - `159`: "invoices: Invoice"
  - `160`: "leads: Lead"
  - `161`: "maintenanceContracts: MaintenanceContract"
  - `162`: "meetings: Meeting"
  - `163`: "oauthAccessRequests: OAuthAccessRequest"
  - `164`: "paymentCollections: PaymentCollection"
  - `165`: "paymentFollowUps: PaymentFollowUp"
  - `166`: "portalNotifications: PortalNotification"
  - `167`: "rfpSubmissions: RFPSubmission"
  - `168`: "reports: Report"
  - `169`: "slaDocuments: SLADocument"
  - `170`: "seoBacklinks: SeoBacklink"
  - `171`: "seoContent: SeoContent"
  - `172`: "seoKeywords: SeoKeyword"
  - `173`: "seoTasks: SeoTask"
  - `174`: "qcReviews: QcReview"
  - `175`: "clientApprovals: ClientApproval"
  - `176`: "youTubeVideos: YouTubeVideo"
  - `177`: "seoReports: SeoReport"
  - `178`: "terminations: ServiceTermination"
  - `179`: "sharedWhatsAppChats: SharedWhatsAppChat"
  - `180`: "socialMediaPageMetrics: SocialMediaPageMetrics"
  - `181`: "socialMediaPosts: SocialMediaPost"
  - `182`: "supportTickets: SupportTicket"
  - `183`: "tacticalKPIEntries: TacticalKPIEntry"
  - `184`: "tasks: Task"
  - `185`: "upsellOpportunities: UpsellOpportunity"
  - `186`: "videoTestimonials: VideoTestimonial"
  - `187`: "webOnboardings: WebOnboarding"
  - `188`: "webProjects: WebProject"
  - `189`: "webProjectPhases: WebProjectPhase"
  - `190`: "webReimbursements: WebReimbursement"
  - `191`: "sitemapPages: WebsiteSitemap"
  - `192`: "whatsAppMessages: WhatsAppMessage"
  - `193`: "workDeliverables: WorkDeliverable"
  - `194`: "workEntries: WorkEntry"
  - `195`: "clientPortal: ClientPortal"

### 📊 ClientTeamMember *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "userId: String"
  - `3`: "role: String"
  - `4`: "isPrimary: Boolean"
  - `5`: "assignedAt: DateTime"
  - `6`: "client: Client"
  - `7`: "user: User"

### 📊 ClientScope *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "category: String"
  - `3`: "item: String"
  - `4`: "quantity: Int"
  - `5`: "delivered: Int"
  - `6`: "month: DateTime"
  - `7`: "status: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "client: Client"

### 📊 ClientDeliverable *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "category: String"
  - `3`: "workItem: String"
  - `4`: "description: String"
  - `5`: "month: String"
  - `6`: "proofUrl: String"
  - `7`: "kpi: String"
  - `8`: "status: String"
  - `9`: "submittedAt: DateTime"
  - `10`: "submittedById: String"
  - `11`: "reviewedAt: DateTime"
  - `12`: "reviewedById: String"
  - `13`: "reviewNotes: String"
  - `14`: "clientVisible: Boolean"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "createdById: String"
  - `18`: "client: Client"
  - `19`: "createdBy: User"
  - `20`: "reviewedBy: User"
  - `21`: "submittedBy: User"

### 📊 Task 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "department: String"
  - `4`: "priority: String"
  - `5`: "status: String"
  - `6`: "type: String"
  - `7`: "dueDate: DateTime"
  - `8`: "startDate: DateTime"
  - `9`: "completedAt: DateTime"
  - `10`: "assigneeId: String"
  - `11`: "creatorId: String"
  - `12`: "reviewerId: String"
  - `13`: "clientId: String"
  - `14`: "qaStatus: String"
  - `15`: "qaComments: String"
  - `16`: "qaReviewedAt: DateTime"
  - `17`: "isRecurring: Boolean"
  - `18`: "recurrence: String"
  - `19`: "parentTaskId: String"
  - `20`: "attachments: String"
  - `21`: "estimatedHours: Float"
  - `22`: "actualHours: Float"
  - `23`: "timeSpent: Int"
  - `24`: "timerStartedAt: DateTime"
  - `25`: "taskOutcome: String"
  - `26`: "breakdownReason: String"
  - `27`: "proofUrl: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "subtasks: Subtask"
  - `31`: "assignee: User"
  - `32`: "client: Client"
  - `33`: "creator: User"
  - `34`: "reviewer: User"
  - `35`: "comments: TaskComment"
  - `36`: "timeEntries: TimeEntry"

### 📊 TaskComment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "userId: String"
  - `3`: "content: String"
  - `4`: "type: String"
  - `5`: "metadata: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "task: Task"
  - `9`: "user: User"

### 📊 Subtask 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "title: String"
  - `3`: "isCompleted: Boolean"
  - `4`: "completedAt: DateTime"
  - `5`: "completedBy: String"
  - `6`: "order: Int"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "task: Task"

### 📊 TimeEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "userId: String"
  - `3`: "hours: Float"
  - `4`: "description: String"
  - `5`: "date: DateTime"
  - `6`: "createdAt: DateTime"
  - `7`: "task: Task"
  - `8`: "user: User"

### 📊 Notification 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "message: String"
  - `5`: "link: String"
  - `6`: "isRead: Boolean"
  - `7`: "priority: String"
  - `8`: "createdAt: DateTime"
  - `9`: "user: User"

### 📊 Meeting 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "category: String"
  - `5`: "date: DateTime"
  - `6`: "duration: Int"
  - `7`: "location: String"
  - `8`: "clientId: String"
  - `9`: "status: String"
  - `10`: "recurrence: String"
  - `11`: "agenda: String"
  - `12`: "notes: String"
  - `13`: "actionItems: String"
  - `14`: "minutesSummary: String"
  - `15`: "noteTakerUrl: String"
  - `16`: "keyPointers: String"
  - `17`: "meetingLink: String"
  - `18`: "isOnline: Boolean"
  - `19`: "momRecorded: Boolean"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "meetingActionItems: MeetingActionItem"
  - `24`: "participants: MeetingParticipant"

### 📊 MeetingParticipant *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "userId: String"
  - `3`: "role: String"
  - `4`: "attended: Boolean"
  - `5`: "meeting: Meeting"
  - `6`: "user: User"

### 📊 SOPCategory *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "icon: String"
  - `4`: "order: Int"
  - `5`: "createdAt: DateTime"
  - `6`: "sops: SOP"

### 📊 SOP *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "categoryId: String"
  - `2`: "title: String"
  - `3`: "content: String"
  - `4`: "version: String"
  - `5`: "status: String"
  - `6`: "department: String"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "category: SOPCategory"

### 📊 Training *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "department: String"
  - `4`: "type: String"
  - `5`: "duration: Int"
  - `6`: "content: String"
  - `7`: "isRequired: Boolean"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "userTrainings: UserTraining"

### 📊 UserTraining *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "trainingId: String"
  - `3`: "progress: Int"
  - `4`: "status: String"
  - `5`: "startedAt: DateTime"
  - `6`: "completedAt: DateTime"
  - `7`: "score: Float"
  - `8`: "training: Training"
  - `9`: "user: User"

### 📊 Certification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "provider: String"
  - `4`: "validFor: Int"
  - `5`: "userCertifications: UserCertification"

### 📊 UserCertification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "certificationId: String"
  - `3`: "earnedAt: DateTime"
  - `4`: "expiresAt: DateTime"
  - `5`: "certificateUrl: String"
  - `6`: "certification: Certification"
  - `7`: "user: User"

### 📊 CommunicationTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "type: String"
  - `4`: "subject: String"
  - `5`: "content: String"
  - `6`: "variables: String"
  - `7`: "isActive: Boolean"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "schedules: CommunicationSchedule"

### 📊 CommunicationSchedule *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "templateId: String"
  - `3`: "name: String"
  - `4`: "type: String"
  - `5`: "frequency: String"
  - `6`: "dayOfWeek: Int"
  - `7`: "dayOfMonth: Int"
  - `8`: "preferredTime: String"
  - `9`: "description: String"
  - `10`: "lastSentAt: DateTime"
  - `11`: "nextDueAt: DateTime"
  - `12`: "missedCount: Int"
  - `13`: "completedCount: Int"
  - `14`: "assignedToId: String"
  - `15`: "status: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "logs: CommunicationLog"
  - `19`: "client: Client"
  - `20`: "template: CommunicationTemplate"

### 📊 CommunicationLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "userId: String"
  - `3`: "scheduleId: String"
  - `4`: "type: String"
  - `5`: "subject: String"
  - `6`: "content: String"
  - `7`: "status: String"
  - `8`: "sentAt: DateTime"
  - `9`: "outcome: String"
  - `10`: "duration: Int"
  - `11`: "actionItems: String"
  - `12`: "attachments: String"
  - `13`: "createdAt: DateTime"
  - `14`: "client: Client"
  - `15`: "schedule: CommunicationSchedule"
  - `16`: "user: User"

### 📊 Document 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "type: String"
  - `3`: "category: String"
  - `4`: "fileUrl: String"
  - `5`: "fileSize: Int"
  - `6`: "mimeType: String"
  - `7`: "clientId: String"
  - `8`: "uploadedById: String"
  - `9`: "createdAt: DateTime"
  - `10`: "client: Client"
  - `11`: "uploadedBy: User"

### 📊 Contract 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "startDate: DateTime"
  - `5`: "endDate: DateTime"
  - `6`: "renewalDate: DateTime"
  - `7`: "value: Float"
  - `8`: "status: String"
  - `9`: "terms: String"
  - `10`: "documentUrl: String"
  - `11`: "signerName: String"
  - `12`: "signerSignature: String"
  - `13`: "agencySignature: String"
  - `14`: "signedAt: DateTime"
  - `15`: "contractSubType: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 Invoice 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "invoiceNumber: String"
  - `2`: "clientId: String"
  - `3`: "amount: Float"
  - `4`: "tax: Float"
  - `5`: "total: Float"
  - `6`: "paidAmount: Float"
  - `7`: "status: String"
  - `8`: "invoiceType: String"
  - `9`: "dueDate: DateTime"
  - `10`: "paidAt: DateTime"
  - `11`: "items: String"
  - `12`: "notes: String"
  - `13`: "entityType: String"
  - `14`: "isAdvance: Boolean"
  - `15`: "currency: String"
  - `16`: "serviceMonth: DateTime"
  - `17`: "slaDocumentId: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "bankTransactions: BankTransaction"
  - `21`: "client: Client"
  - `22`: "payments: PaymentCollection"

### 📊 PaymentCollection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "invoiceId: String"
  - `3`: "grossAmount: Float"
  - `4`: "tdsDeducted: Float"
  - `5`: "tdsPercentage: Float"
  - `6`: "gstAmount: Float"
  - `7`: "netAmount: Float"
  - `8`: "collectedAt: DateTime"
  - `9`: "collectedBy: String"
  - `10`: "paymentMethod: String"
  - `11`: "transactionRef: String"
  - `12`: "bankAccountId: String"
  - `13`: "bankName: String"
  - `14`: "accountNumber: String"
  - `15`: "retainerMonth: DateTime"
  - `16`: "serviceType: String"
  - `17`: "description: String"
  - `18`: "entityType: String"
  - `19`: "currency: String"
  - `20`: "status: String"
  - `21`: "notes: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"
  - `24`: "bankTransactions: BankTransaction"
  - `25`: "client: Client"
  - `26`: "invoice: Invoice"

### 📊 PaymentFollowUp *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "date: DateTime"
  - `3`: "status: String"
  - `4`: "notes: String"
  - `5`: "nextAction: String"
  - `6`: "nextActionDate: DateTime"
  - `7`: "recordedBy: String"
  - `8`: "month: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"

### 📊 Expense 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "category: String"
  - `2`: "description: String"
  - `3`: "amount: Float"
  - `4`: "date: DateTime"
  - `5`: "vendor: String"
  - `6`: "notes: String"
  - `7`: "clientId: String"
  - `8`: "receipt: String"
  - `9`: "status: String"
  - `10`: "submittedBy: String"
  - `11`: "approvedBy: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "client: Client"

### 📊 Lead 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "companyName: String"
  - `2`: "contactName: String"
  - `3`: "contactEmail: String"
  - `4`: "contactPhone: String"
  - `5`: "source: String"
  - `6`: "value: Float"
  - `7`: "notes: String"
  - `8`: "stage: String"
  - `9`: "pipeline: String"
  - `10`: "lostReason: String"
  - `11`: "wonAt: DateTime"
  - `12`: "leadCategory: String"
  - `13`: "leadPriority: String"
  - `14`: "location: String"
  - `15`: "state: String"
  - `16`: "yearsInOperation: String"
  - `17`: "rfpToken: String"
  - `18`: "rfpStatus: String"
  - `19`: "rfpSentAt: DateTime"
  - `20`: "rfpCompletedAt: DateTime"
  - `21`: "rfpResponses: String"
  - `22`: "isHealthcare: Boolean"
  - `23`: "healthcareType: String"
  - `24`: "patientVolume: String"
  - `25`: "specialization: String"
  - `26`: "numberOfLocations: Int"
  - `27`: "primaryObjective: String"
  - `28`: "currentChallenges: String"
  - `29`: "businessType: String"
  - `30`: "pastMarketing: String"
  - `31`: "workedWithAgency: Boolean"
  - `32`: "agencyIssues: String"
  - `33`: "timeline: String"
  - `34`: "budgetRange: String"
  - `35`: "clientId: String"
  - `36`: "nextFollowUp: DateTime"
  - `37`: "lastContactedAt: DateTime"
  - `38`: "followUpNotes: String"
  - `39`: "callNotes: String"
  - `40`: "assignedToId: String"
  - `41`: "createdBy: String"
  - `42`: "deletedAt: DateTime"
  - `43`: "createdAt: DateTime"
  - `44`: "updatedAt: DateTime"
  - `45`: "dailyPlannerTasks: DailyTask"
  - `46`: "reminders: FollowUpReminder"
  - `47`: "assignedTo: User"
  - `48`: "client: Client"
  - `49`: "activities: LeadActivity"
  - `50`: "nurturingActions: LeadNurturingAction"
  - `51`: "proposals: Proposal"
  - `52`: "dailyTasks: SalesDailyTask"
  - `53`: "deals: SalesDeal"
  - `54`: "handovers: SalesHandover"
  - `55`: "meetings: SalesMeeting"
  - `56`: "whatsappMessages: SalesWhatsAppMessage"

### 📊 Proposal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "title: String"
  - `3`: "value: Float"
  - `4`: "services: String"
  - `5`: "validUntil: DateTime"
  - `6`: "status: String"
  - `7`: "documentUrl: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "lead: Lead"

### 📊 Candidate 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "email: String"
  - `3`: "phone: String"
  - `4`: "position: String"
  - `5`: "department: String"
  - `6`: "resumeUrl: String"
  - `7`: "portfolioUrl: String"
  - `8`: "linkedInUrl: String"
  - `9`: "source: String"
  - `10`: "referredBy: String"
  - `11`: "status: String"
  - `12`: "currentStage: String"
  - `13`: "assignedManagerId: String"
  - `14`: "expectedSalary: Float"
  - `15`: "offeredSalary: Float"
  - `16`: "experience: Int"
  - `17`: "noticePeriod: Int"
  - `18`: "phoneScreenNotes: String"
  - `19`: "phoneScreenRating: Int"
  - `20`: "managerFeedback: String"
  - `21`: "managerRating: Int"
  - `22`: "founderFeedback: String"
  - `23`: "founderDecision: String"
  - `24`: "interviewFeedback: String"
  - `25`: "testTaskUrl: String"
  - `26`: "testTaskScore: Float"
  - `27`: "testTaskFeedback: String"
  - `28`: "notes: String"
  - `29`: "rejectionReason: String"
  - `30`: "createdAt: DateTime"
  - `31`: "updatedAt: DateTime"
  - `32`: "assignedManager: User"
  - `33`: "assessment: CandidateAssessment"
  - `34`: "interviews: Interview"
  - `35`: "offerLetter: OfferLetter"

### 📊 CandidateAssessment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "token: String"
  - `3`: "completed: Boolean"
  - `4`: "fullName: String"
  - `5`: "email: String"
  - `6`: "phone: String"
  - `7`: "currentCity: String"
  - `8`: "dateOfBirth: String"
  - `9`: "linkedInUrl: String"
  - `10`: "portfolioUrl: String"
  - `11`: "resumeUrl: String"
  - `12`: "totalExperience: Float"
  - `13`: "currentCompany: String"
  - `14`: "currentRole: String"
  - `15`: "currentSalary: Float"
  - `16`: "expectedSalary: Float"
  - `17`: "noticePeriod: String"
  - `18`: "reasonForLeaving: String"
  - `19`: "primarySkills: String"
  - `20`: "tools: String"
  - `21`: "certifications: String"
  - `22`: "languagesKnown: String"
  - `23`: "canWorkFromOffice: Boolean"
  - `24`: "commuteDetails: String"
  - `25`: "joiningTimeline: String"
  - `26`: "readyForTrial: Boolean"
  - `27`: "trialAvailability: String"
  - `28`: "hasHealthcareExp: Boolean"
  - `29`: "healthcareDetails: String"
  - `30`: "healthcareClients: String"
  - `31`: "workSampleUrls: String"
  - `32`: "caseStudyUrl: String"
  - `33`: "githubUrl: String"
  - `34`: "whyThisRole: String"
  - `35`: "biggestAchievement: String"
  - `36`: "challengeExample: String"
  - `37`: "teamWorkStyle: String"
  - `38`: "learningApproach: String"
  - `39`: "salaryNegotiable: Boolean"
  - `40`: "availableForCalls: Boolean"
  - `41`: "preferredCallTime: String"
  - `42`: "relevanceRating: Int"
  - `43`: "strengthAreas: String"
  - `44`: "improvementAreas: String"
  - `45`: "referenceContacts: String"
  - `46`: "additionalInfo: String"
  - `47`: "questionsForUs: String"
  - `48`: "hrStatus: String"
  - `49`: "hrNotes: String"
  - `50`: "shortlistedAt: DateTime"
  - `51`: "shortlistedBy: String"
  - `52`: "interviewDate: DateTime"
  - `53`: "interviewMode: String"
  - `54`: "interviewNotes: String"
  - `55`: "interviewRating: Int"
  - `56`: "taskTitle: String"
  - `57`: "taskDescription: String"
  - `58`: "taskDeadline: DateTime"
  - `59`: "taskAssignedAt: DateTime"
  - `60`: "taskSubmissionUrl: String"
  - `61`: "taskSubmittedAt: DateTime"
  - `62`: "taskScore: Float"
  - `63`: "taskFeedback: String"
  - `64`: "finalRoundDate: DateTime"
  - `65`: "finalRoundNotes: String"
  - `66`: "finalRoundDecision: String"
  - `67`: "finalDecisionBy: String"
  - `68`: "finalDecisionAt: DateTime"
  - `69`: "offerSalary: Float"
  - `70`: "offerDate: DateTime"
  - `71`: "offerAccepted: Boolean"
  - `72`: "joiningDate: DateTime"
  - `73`: "createdAt: DateTime"
  - `74`: "updatedAt: DateTime"
  - `75`: "candidate: Candidate"

### 📊 EmployeeProposal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "candidateName: String"
  - `3`: "candidateEmail: String"
  - `4`: "candidatePhone: String"
  - `5`: "department: String"
  - `6`: "position: String"
  - `7`: "employmentType: String"
  - `8`: "offeredSalary: Float"
  - `9`: "joiningDate: DateTime"
  - `10`: "probationMonths: Int"
  - `11`: "entityType: String"
  - `12`: "confirmedName: String"
  - `13`: "dateOfBirth: DateTime"
  - `14`: "bloodGroup: String"
  - `15`: "personalPhone: String"
  - `16`: "personalEmail: String"
  - `17`: "currentAddress: String"
  - `18`: "city: String"
  - `19`: "state: String"
  - `20`: "pincode: String"
  - `21`: "parentsAddress: String"
  - `22`: "fatherPhone: String"
  - `23`: "motherPhone: String"
  - `24`: "emergencyName: String"
  - `25`: "emergencyPhone: String"
  - `26`: "emergencyRelation: String"
  - `27`: "linkedinUrl: String"
  - `28`: "languages: String"
  - `29`: "livingSituation: String"
  - `30`: "distanceFromOffice: String"
  - `31`: "favoriteFood: String"
  - `32`: "healthConditions: String"
  - `33`: "detailsConfirmedAt: DateTime"
  - `34`: "ndaAccepted: Boolean"
  - `35`: "ndaAcceptedAt: DateTime"
  - `36`: "ndaSignerName: String"
  - `37`: "ndaSignatureData: String"
  - `38`: "ndaSignatureType: String"
  - `39`: "bondAccepted: Boolean"
  - `40`: "bondAcceptedAt: DateTime"
  - `41`: "bondSignerName: String"
  - `42`: "bondSignatureData: String"
  - `43`: "bondSignatureType: String"
  - `44`: "bondDurationMonths: Int"
  - `45`: "handbookAccepted: Boolean"
  - `46`: "socialMediaPolicyAccepted: Boolean"
  - `47`: "confidentialityAccepted: Boolean"
  - `48`: "antiHarassmentAccepted: Boolean"
  - `49`: "codeOfConductAccepted: Boolean"
  - `50`: "policiesAcceptedAt: DateTime"
  - `51`: "policiesSignerName: String"
  - `52`: "policiesSignatureData: String"
  - `53`: "policiesSignatureType: String"
  - `54`: "profilePictureUrl: String"
  - `55`: "panCardUrl: String"
  - `56`: "aadhaarUrl: String"
  - `57`: "educationCertUrl: String"
  - `58`: "bankAccountName: String"
  - `59`: "bankName: String"
  - `60`: "bankAccountNumber: String"
  - `61`: "bankIfscCode: String"
  - `62`: "documentsSubmittedAt: DateTime"
  - `63`: "onboardingCompleted: Boolean"
  - `64`: "onboardingCompletedAt: DateTime"
  - `65`: "magicLinkSent: Boolean"
  - `66`: "magicLinkSentAt: DateTime"
  - `67`: "currentStep: Int"
  - `68`: "status: String"
  - `69`: "expiresAt: DateTime"
  - `70`: "viewedAt: DateTime"
  - `71`: "userId: String"
  - `72`: "createdById: String"
  - `73`: "createdAt: DateTime"
  - `74`: "updatedAt: DateTime"
  - `75`: "createdBy: User"
  - `76`: "user: User"

### 📊 LeaveRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "startDate: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "reason: String"
  - `6`: "status: String"
  - `7`: "approvedBy: String"
  - `8`: "approvedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "rejectionReason: String"
  - `11`: "user: User"

### 📊 Post 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "content: String"
  - `4`: "attachments: String"
  - `5`: "isPinned: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "comments: Comment"
  - `9`: "likes: Like"
  - `10`: "user: User"

### 📊 Comment 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "postId: String"
  - `2`: "userId: String"
  - `3`: "content: String"
  - `4`: "createdAt: DateTime"
  - `5`: "post: Post"
  - `6`: "user: User"

### 📊 Like 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "postId: String"
  - `2`: "userId: String"
  - `3`: "createdAt: DateTime"
  - `4`: "post: Post"
  - `5`: "user: User"

### 📊 Idea 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "category: String"
  - `5`: "status: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"
  - `9`: "votes: IdeaVote"

### 📊 IdeaVote *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ideaId: String"
  - `2`: "userId: String"
  - `3`: "idea: Idea"
  - `4`: "user: User"

### 📊 Recognition *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "receiverId: String"
  - `2`: "giverId: String"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "message: String"
  - `6`: "xpAwarded: Int"
  - `7`: "createdAt: DateTime"
  - `8`: "giver: User"
  - `9`: "receiver: User"

### 📊 Issue 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "severity: String"
  - `5`: "status: String"
  - `6`: "clientId: String"
  - `7`: "assigneeId: String"
  - `8`: "creatorId: String"
  - `9`: "resolution: String"
  - `10`: "resolvedAt: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "assignee: User"
  - `14`: "creator: User"

### 📊 Report 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "month: DateTime"
  - `5`: "data: String"
  - `6`: "fileUrl: String"
  - `7`: "status: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "client: Client"

### 📊 Automation 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "type: String"
  - `3`: "clientId: String"
  - `4`: "status: String"
  - `5`: "metrics: String"
  - `6`: "config: String"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "client: Client"

### 📊 AccountabilityCharter *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "unitsProduced: Float"
  - `4`: "monthYear: DateTime"
  - `5`: "client: Client"
  - `6`: "user: User"

### 📊 RBC_Pot *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "totalAccrued: Float"
  - `3`: "milestoneMultiplier: Float"
  - `4`: "isForfeited: Boolean"
  - `5`: "user: User"

### 📊 Attendance 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "date: DateTime"
  - `3`: "checkIn: DateTime"
  - `4`: "checkOut: DateTime"
  - `5`: "biometricPunch: Boolean"
  - `6`: "myZenHours: Float"
  - `7`: "huddleLate: Boolean"
  - `8`: "status: String"
  - `9`: "importBatchId: String"
  - `10`: "sourceType: String"
  - `11`: "rawSourceData: String"
  - `12`: "parseConfidence: Float"
  - `13`: "importBatch: AttendanceImport"
  - `14`: "user: User"

### 📊 AttendanceImport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "source: String"
  - `2`: "rawData: String"
  - `3`: "parsedData: String"
  - `4`: "recordCount: Int"
  - `5`: "status: String"
  - `6`: "errorMessage: String"
  - `7`: "importedBy: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "records: Attendance"
  - `11`: "importedByUser: User"

### 📊 Violations *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "description: String"
  - `3`: "fineAmount: Float"
  - `4`: "charityPaid: Boolean"
  - `5`: "date: DateTime"
  - `6`: "updatedAt: DateTime"
  - `7`: "user: User"

### 📊 PerformanceScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "score: Float"
  - `3`: "month: DateTime"
  - `4`: "department: String"
  - `5`: "rank: Int"
  - `6`: "metrics: String"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"

### 📊 DepartmentTarget *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "metric: String"
  - `3`: "target: Int"
  - `4`: "completed: Int"
  - `5`: "month: DateTime"
  - `6`: "tip: String"
  - `7`: "updatedAt: DateTime"

### 📊 CompanyNews *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "content: String"
  - `3`: "author: String"
  - `4`: "pinned: Boolean"
  - `5`: "category: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"

### 📊 Event 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "date: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "type: String"
  - `6`: "location: String"
  - `7`: "isAllDay: Boolean"
  - `8`: "createdAt: DateTime"

### 📊 Feedback 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "content: String"
  - `3`: "category: String"
  - `4`: "isAnonymous: Boolean"
  - `5`: "status: String"
  - `6`: "createdAt: DateTime"

### 📊 Quote 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "text: String"
  - `2`: "author: String"
  - `3`: "isActive: Boolean"
  - `4`: "createdAt: DateTime"
  - `5`: "updatedAt: DateTime"
  - `6`: "createdBy: String"
  - `7`: "creator: User"

### 📊 LeadActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "outcome: String"
  - `7`: "duration: Int"
  - `8`: "createdAt: DateTime"
  - `9`: "lead: Lead"
  - `10`: "user: User"

### 📊 FollowUpReminder *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "scheduledAt: DateTime"
  - `4`: "title: String"
  - `5`: "notes: String"
  - `6`: "isCompleted: Boolean"
  - `7`: "completedAt: DateTime"
  - `8`: "priority: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "lead: Lead"
  - `12`: "user: User"

### 📊 LeadNurturingAction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "actionType: String"
  - `4`: "contentTitle: String"
  - `5`: "contentUrl: String"
  - `6`: "notes: String"
  - `7`: "channel: String"
  - `8`: "response: String"
  - `9`: "createdAt: DateTime"
  - `10`: "lead: Lead"
  - `11`: "user: User"

### 📊 SalesHandover *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "salesUserId: String"
  - `3`: "accountsUserId: String"
  - `4`: "status: String"
  - `5`: "paymentTerms: String"
  - `6`: "servicesAgreed: String"
  - `7`: "specialTerms: String"
  - `8`: "proposalUrl: String"
  - `9`: "dealValue: Float"
  - `10`: "rfpSummary: String"
  - `11`: "nurturingHistory: String"
  - `12`: "keyContacts: String"
  - `13`: "notes: String"
  - `14`: "acknowledgedAt: DateTime"
  - `15`: "completedAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "accountsUser: User"
  - `19`: "lead: Lead"
  - `20`: "salesUser: User"

### 📊 SalesMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "meetingType: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "scheduledAt: DateTime"
  - `7`: "duration: Int"
  - `8`: "location: String"
  - `9`: "meetingLink: String"
  - `10`: "outcome: String"
  - `11`: "outcomeNotes: String"
  - `12`: "status: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "lead: Lead"
  - `16`: "user: User"

### 📊 SalesWhatsAppMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "messageType: String"
  - `4`: "templateId: String"
  - `5`: "content: String"
  - `6`: "recipientPhone: String"
  - `7`: "recipientName: String"
  - `8`: "status: String"
  - `9`: "sentAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "lead: Lead"
  - `12`: "user: User"

### 📊 SalesWhatsAppTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "content: String"
  - `4`: "isActive: Boolean"
  - `5`: "createdAt: DateTime"
  - `6`: "updatedAt: DateTime"

### 📊 SalesDeal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "dealValue: Float"
  - `4`: "servicesSold: String"
  - `5`: "contractDuration: Int"
  - `6`: "startDate: DateTime"
  - `7`: "status: String"
  - `8`: "lossReason: String"
  - `9`: "billingCycle: String"
  - `10`: "paymentTerms: String"
  - `11`: "closedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "lead: Lead"
  - `15`: "user: User"

### 📊 SalesDailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "leadId: String"
  - `3`: "taskType: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "dueDate: DateTime"
  - `7`: "priority: String"
  - `8`: "status: String"
  - `9`: "completedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "lead: Lead"
  - `13`: "user: User"

### 📊 ClientLifecycleEvent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "fromStage: String"
  - `3`: "toStage: String"
  - `4`: "reason: String"
  - `5`: "notes: String"
  - `6`: "triggeredBy: String"
  - `7`: "createdAt: DateTime"
  - `8`: "client: Client"

### 📊 ClientUser *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "email: String"
  - `3`: "name: String"
  - `4`: "phone: String"
  - `5`: "role: String"
  - `6`: "isActive: Boolean"
  - `7`: "lastLoginAt: DateTime"
  - `8`: "otpCode: String"
  - `9`: "otpExpiresAt: DateTime"
  - `10`: "otpAttempts: Int"
  - `11`: "sessionToken: String"
  - `12`: "sessionExpiresAt: DateTime"
  - `13`: "passwordHash: String"
  - `14`: "emailNotifications: Boolean"
  - `15`: "whatsappNotifications: Boolean"
  - `16`: "pushNotifications: Boolean"
  - `17`: "hasMarketingAccess: Boolean"
  - `18`: "hasWebsiteAccess: Boolean"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "uploadedDocuments: ClientDocument"
  - `22`: "portalFeedback: ClientPortalFeedback"
  - `23`: "client: Client"
  - `24`: "activities: ClientUserActivity"
  - `25`: "invitedBy: ClientUserInvitation"
  - `26`: "contentApprovals: ContentApproval"
  - `27`: "pageFeedback: PageFeedback"
  - `28`: "notifications: PortalNotification"
  - `29`: "supportTickets: SupportTicket"

### 📊 ClientCredential *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "category: String"
  - `4`: "username: String"
  - `5`: "password: String"
  - `6`: "email: String"
  - `7`: "url: String"
  - `8`: "apiKey: String"
  - `9`: "notes: String"
  - `10`: "isActive: Boolean"
  - `11`: "lastUpdated: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "client: Client"

### 📊 SupportTicket *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ticketNumber: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "priority: String"
  - `6`: "status: String"
  - `7`: "clientId: String"
  - `8`: "clientUserId: String"
  - `9`: "assignedToId: String"
  - `10`: "resolvedAt: DateTime"
  - `11`: "resolution: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "assignedTo: User"
  - `15`: "client: Client"
  - `16`: "clientUser: ClientUser"
  - `17`: "activities: TicketActivity"

### 📊 TicketActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ticketId: String"
  - `2`: "userId: String"
  - `3`: "type: String"
  - `4`: "description: String"
  - `5`: "metadata: String"
  - `6`: "createdAt: DateTime"
  - `7`: "ticket: SupportTicket"
  - `8`: "user: User"

### 📊 EmployeeOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "offerLetterSigned: Boolean"
  - `3`: "offerLetterSignedAt: DateTime"
  - `4`: "idProofSubmitted: Boolean"
  - `5`: "idProofSubmittedAt: DateTime"
  - `6`: "addressProofSubmitted: Boolean"
  - `7`: "addressProofSubmittedAt: DateTime"
  - `8`: "panCardSubmitted: Boolean"
  - `9`: "panCardSubmittedAt: DateTime"
  - `10`: "bankDetailsSubmitted: Boolean"
  - `11`: "bankDetailsSubmittedAt: DateTime"
  - `12`: "educationDocsSubmitted: Boolean"
  - `13`: "educationDocsSubmittedAt: DateTime"
  - `14`: "profilePhotoSubmitted: Boolean"
  - `15`: "profilePhotoSubmittedAt: DateTime"
  - `16`: "emailCreated: Boolean"
  - `17`: "emailCreatedAt: DateTime"
  - `18`: "slackInviteSent: Boolean"
  - `19`: "slackInviteSentAt: DateTime"
  - `20`: "systemAccessGranted: Boolean"
  - `21`: "systemAccessGrantedAt: DateTime"
  - `22`: "deviceAllocated: Boolean"
  - `23`: "deviceAllocatedAt: DateTime"
  - `24`: "softwareLicensesAssigned: Boolean"
  - `25`: "softwareLicensesAt: DateTime"
  - `26`: "hrOrientationComplete: Boolean"
  - `27`: "hrOrientationAt: DateTime"
  - `28`: "policiesAcknowledged: Boolean"
  - `29`: "policiesAcknowledgedAt: DateTime"
  - `30`: "ndaSigned: Boolean"
  - `31`: "ndaSignedAt: DateTime"
  - `32`: "biometricRegistered: Boolean"
  - `33`: "biometricRegisteredAt: DateTime"
  - `34`: "buddyAssigned: Boolean"
  - `35`: "buddyAssignedAt: DateTime"
  - `36`: "teamIntroductionDone: Boolean"
  - `37`: "teamIntroductionAt: DateTime"
  - `38`: "departmentTrainingDone: Boolean"
  - `39`: "departmentTrainingAt: DateTime"
  - `40`: "firstWeekCheckIn: Boolean"
  - `41`: "firstWeekCheckInAt: DateTime"
  - `42`: "thirtyDayReview: Boolean"
  - `43`: "thirtyDayReviewAt: DateTime"
  - `44`: "completionPercentage: Int"
  - `45`: "status: String"
  - `46`: "hrNotes: String"
  - `47`: "lastUpdatedBy: String"
  - `48`: "createdAt: DateTime"
  - `49`: "updatedAt: DateTime"
  - `50`: "user: User"

### 📊 ClientOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "contractSigned: Boolean"
  - `3`: "contractSignedAt: DateTime"
  - `4`: "invoicePaid: Boolean"
  - `5`: "invoicePaidAt: DateTime"
  - `6`: "ndaSigned: Boolean"
  - `7`: "ndaSignedAt: DateTime"
  - `8`: "kickoffMeetingDone: Boolean"
  - `9`: "kickoffMeetingAt: DateTime"
  - `10`: "brandGuidelinesReceived: Boolean"
  - `11`: "brandGuidelinesAt: DateTime"
  - `12`: "websiteAccessGranted: Boolean"
  - `13`: "websiteAccessAt: DateTime"
  - `14`: "analyticsAccessGranted: Boolean"
  - `15`: "analyticsAccessAt: DateTime"
  - `16`: "socialMediaAccess: Boolean"
  - `17`: "socialMediaAccessAt: DateTime"
  - `18`: "adsAccountAccess: Boolean"
  - `19`: "adsAccountAccessAt: DateTime"
  - `20`: "trackingSetup: Boolean"
  - `21`: "trackingSetupAt: DateTime"
  - `22`: "pixelsInstalled: Boolean"
  - `23`: "pixelsInstalledAt: DateTime"
  - `24`: "crmIntegrated: Boolean"
  - `25`: "crmIntegratedAt: DateTime"
  - `26`: "reportingDashboardReady: Boolean"
  - `27`: "reportingDashboardAt: DateTime"
  - `28`: "accountManagerAssigned: Boolean"
  - `29`: "accountManagerAssignedAt: DateTime"
  - `30`: "teamIntroductionDone: Boolean"
  - `31`: "teamIntroductionAt: DateTime"
  - `32`: "communicationChannelSetup: Boolean"
  - `33`: "communicationChannelAt: DateTime"
  - `34`: "firstStrategyCallDone: Boolean"
  - `35`: "firstStrategyCallAt: DateTime"
  - `36`: "contentCalendarShared: Boolean"
  - `37`: "contentCalendarAt: DateTime"
  - `38`: "firstDeliverablesApproved: Boolean"
  - `39`: "firstDeliverablesAt: DateTime"
  - `40`: "monthlyReportingSchedule: Boolean"
  - `41`: "monthlyReportingAt: DateTime"
  - `42`: "selectedServices: String"
  - `43`: "scopeItems: String"
  - `44`: "operationsAssignedAt: DateTime"
  - `45`: "kickoffScheduledAt: DateTime"
  - `46`: "completionPercentage: Int"
  - `47`: "status: String"
  - `48`: "managerNotes: String"
  - `49`: "assignedManagerId: String"
  - `50`: "lastUpdatedBy: String"
  - `51`: "createdAt: DateTime"
  - `52`: "updatedAt: DateTime"
  - `53`: "client: Client"

### 📊 InternProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "internshipType: String"
  - `3`: "stipendAmount: Float"
  - `4`: "startDate: DateTime"
  - `5`: "expectedEndDate: DateTime"
  - `6`: "actualEndDate: DateTime"
  - `7`: "hasOwnLaptop: Boolean"
  - `8`: "deviceAssignedId: String"
  - `9`: "mentorId: String"
  - `10`: "buddyId: String"
  - `11`: "monthlyReviews: String"
  - `12`: "currentStatus: String"
  - `13`: "conversionStatus: String"
  - `14`: "exitInterviewDone: Boolean"
  - `15`: "certificateIssued: Boolean"
  - `16`: "certificateUrl: String"
  - `17`: "linkedInRecommendation: Boolean"
  - `18`: "handbookAcknowledged: Boolean"
  - `19`: "handbookAcknowledgedAt: DateTime"
  - `20`: "leavePolicy: String"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"
  - `23`: "user: User"

### 📊 FreelancerProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "contractType: String"
  - `3`: "hourlyRate: Float"
  - `4`: "projectRate: Float"
  - `5`: "retainerAmount: Float"
  - `6`: "panNumber: String"
  - `7`: "gstNumber: String"
  - `8`: "bankAccountNumber: String"
  - `9`: "bankIfscCode: String"
  - `10`: "bankName: String"
  - `11`: "upiId: String"
  - `12`: "currentStatus: String"
  - `13`: "totalEarned: Float"
  - `14`: "pendingAmount: Float"
  - `15`: "skills: String"
  - `16`: "portfolio: String"
  - `17`: "linkedIn: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "payments: FreelancerPayment"
  - `21`: "user: User"
  - `22`: "workReports: FreelancerWorkReport"

### 📊 FreelancerWorkReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "freelancerProfileId: String"
  - `2`: "periodStart: DateTime"
  - `3`: "periodEnd: DateTime"
  - `4`: "submittedAt: DateTime"
  - `5`: "projectName: String"
  - `6`: "clientId: String"
  - `7`: "description: String"
  - `8`: "hoursWorked: Float"
  - `9`: "deliverables: String"
  - `10`: "attachments: String"
  - `11`: "billableAmount: Float"
  - `12`: "status: String"
  - `13`: "reviewedBy: String"
  - `14`: "reviewedAt: DateTime"
  - `15`: "reviewNotes: String"
  - `16`: "paymentId: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "freelancerProfile: FreelancerProfile"

### 📊 FreelancerPayment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "freelancerProfileId: String"
  - `2`: "amount: Float"
  - `3`: "paymentDate: DateTime"
  - `4`: "paymentMethod: String"
  - `5`: "transactionRef: String"
  - `6`: "invoiceNumber: String"
  - `7`: "invoiceUrl: String"
  - `8`: "periodStart: DateTime"
  - `9`: "periodEnd: DateTime"
  - `10`: "status: String"
  - `11`: "processedBy: String"
  - `12`: "processedAt: DateTime"
  - `13`: "notes: String"
  - `14`: "workReportIds: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "freelancerProfile: FreelancerProfile"

### 📊 ImpersonationSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "adminId: String"
  - `2`: "targetUserId: String"
  - `3`: "startedAt: DateTime"
  - `4`: "endedAt: DateTime"
  - `5`: "reason: String"
  - `6`: "actionsPerformed: String"
  - `7`: "admin: User"
  - `8`: "targetUser: User"

### 📊 AccountabilityScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "expectedUnits: Int"
  - `4`: "deliveredUnits: Int"
  - `5`: "unitScore: Float"
  - `6`: "tacticalGoals: String"
  - `7`: "goalsAchieved: Int"
  - `8`: "totalGoals: Int"
  - `9`: "growthScore: Float"
  - `10`: "finalScore: Float"
  - `11`: "rank: Int"
  - `12`: "companyRank: Int"
  - `13`: "managerRating: Float"
  - `14`: "managerNotes: String"
  - `15`: "calculatedAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "user: User"

### 📊 LearningLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "resourceUrl: String"
  - `4`: "resourceTitle: String"
  - `5`: "topic: String"
  - `6`: "minutesWatched: Int"
  - `7`: "notes: String"
  - `8`: "createdAt: DateTime"
  - `9`: "verificationId: String"
  - `10`: "user: User"
  - `11`: "verification: LearningVerification"

### 📊 LearningVerification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "learningLogId: String"
  - `3`: "topic: String"
  - `4`: "resourceTitle: String"
  - `5`: "taskPrompt: String"
  - `6`: "taskType: String"
  - `7`: "difficulty: String"
  - `8`: "userResponse: String"
  - `9`: "submittedAt: DateTime"
  - `10`: "aiScore: Float"
  - `11`: "aiFeedback: String"
  - `12`: "evaluatedAt: DateTime"
  - `13`: "isVerified: Boolean"
  - `14`: "status: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "learningLogs: LearningLog"
  - `18`: "user: User"

### 📊 LearningAudit *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "totalEntries: Int"
  - `4`: "totalMinutes: Int"
  - `5`: "verifiedEntries: Int"
  - `6`: "averageScore: Float"
  - `7`: "aiSummary: String"
  - `8`: "aiRecommendations: String"
  - `9`: "overallVerdict: String"
  - `10`: "auditedAt: DateTime"
  - `11`: "user: User"

### 📊 WorkDeliverable *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "month: DateTime"
  - `4`: "category: String"
  - `5`: "deliverableType: String"
  - `6`: "quantity: Int"
  - `7`: "unitValue: Float"
  - `8`: "totalValue: Float"
  - `9`: "proofUrl: String"
  - `10`: "qualityScore: Int"
  - `11`: "revisionCount: Int"
  - `12`: "turnaroundHours: Float"
  - `13`: "designUrls: String"
  - `14`: "status: String"
  - `15`: "approvedBy: String"
  - `16`: "approvedAt: DateTime"
  - `17`: "notes: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "client: Client"
  - `21`: "user: User"

### 📊 DepartmentBaseline *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "baseSalary: Float"
  - `3`: "baseUnits: Int"
  - `4`: "unitType: String"
  - `5`: "unitDescription: String"
  - `6`: "scaleFactor: Float"
  - `7`: "updatedAt: DateTime"

### 📊 Achievement 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "icon: String"
  - `6`: "category: String"
  - `7`: "clientId: String"
  - `8`: "proofUrl: String"
  - `9`: "pointsAwarded: Int"
  - `10`: "incentiveValue: Float"
  - `11`: "status: String"
  - `12`: "addedBy: String"
  - `13`: "approvedBy: String"
  - `14`: "approvedAt: DateTime"
  - `15`: "earnedAt: DateTime"
  - `16`: "progress: Int"
  - `17`: "target: Int"
  - `18`: "rarity: String"
  - `19`: "month: DateTime"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "user: User"

### 📊 TacticalGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "targetValue: Float"
  - `6`: "currentValue: Float"
  - `7`: "category: String"
  - `8`: "priority: String"
  - `9`: "status: String"
  - `10`: "achievedAt: DateTime"
  - `11`: "setBy: String"
  - `12`: "reviewNotes: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "user: User"

### 📊 IncentivePayout *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "unitIncentive: Float"
  - `4`: "achievementBonus: Float"
  - `5`: "referralBonus: Float"
  - `6`: "attendanceBonus: Float"
  - `7`: "totalIncentive: Float"
  - `8`: "status: String"
  - `9`: "approvedBy: String"
  - `10`: "approvedAt: DateTime"
  - `11`: "paidAt: DateTime"
  - `12`: "deductions: Float"
  - `13`: "deductionReason: String"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "user: User"

### 📊 LearningResourceComment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "resourceId: String"
  - `2`: "userId: String"
  - `3`: "content: String"
  - `4`: "rating: Int"
  - `5`: "isHelpful: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"

### 📊 MeetingActionItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "assigneeId: String"
  - `5`: "dueDate: DateTime"
  - `6`: "priority: String"
  - `7`: "status: String"
  - `8`: "completedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "assignee: User"
  - `12`: "meeting: Meeting"

### 📊 DailyTaskPlan *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "date: DateTime"
  - `3`: "isWeeklyPlan: Boolean"
  - `4`: "status: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "submittedBeforeHuddle: Boolean"
  - `7`: "totalPlannedHours: Float"
  - `8`: "totalActualHours: Float"
  - `9`: "hasUnder4Hours: Boolean"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "tasks: DailyTask"
  - `13`: "user: User"

### 📊 DailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "planId: String"
  - `2`: "clientId: String"
  - `3`: "clientName: String"
  - `4`: "activityType: String"
  - `5`: "description: String"
  - `6`: "plannedStartTime: DateTime"
  - `7`: "plannedHours: Float"
  - `8`: "actualStartTime: DateTime"
  - `9`: "actualEndTime: DateTime"
  - `10`: "actualHours: Float"
  - `11`: "addedAt: DateTime"
  - `12`: "startedAt: DateTime"
  - `13`: "completedAt: DateTime"
  - `14`: "status: String"
  - `15`: "isBreakdown: Boolean"
  - `16`: "breakdownReason: String"
  - `17`: "priority: String"
  - `18`: "sortOrder: Int"
  - `19`: "notes: String"
  - `20`: "deliverable: String"
  - `21`: "proofUrl: String"
  - `22`: "remarks: String"
  - `23`: "clientVisible: Boolean"
  - `24`: "workEntryId: String"
  - `25`: "allocatedById: String"
  - `26`: "deadline: DateTime"
  - `27`: "rateTask: Int"
  - `28`: "company: String"
  - `29`: "reportedToManager: Boolean"
  - `30`: "reportedAt: DateTime"
  - `31`: "managerReviewed: Boolean"
  - `32`: "managerReviewedAt: DateTime"
  - `33`: "managerReviewedById: String"
  - `34`: "managerRating: Int"
  - `35`: "managerFeedback: String"
  - `36`: "clientCommunicated: Boolean"
  - `37`: "communicatedAt: DateTime"
  - `38`: "communicatedVia: String"
  - `39`: "communicationMessage: String"
  - `40`: "isBreakthrough: Boolean"
  - `41`: "leadId: String"
  - `42`: "departmentTarget: String"
  - `43`: "employeeTargetId: String"
  - `44`: "candidateTargetId: String"
  - `45`: "accountsTaskType: String"
  - `46`: "complianceType: String"
  - `47`: "paymentReceivedDate: DateTime"
  - `48`: "invoiceNotifiedAt: DateTime"
  - `49`: "createdAt: DateTime"
  - `50`: "updatedAt: DateTime"
  - `51`: "allocatedBy: User"
  - `52`: "client: Client"
  - `53`: "lead: Lead"
  - `54`: "managerReviewedBy: User"
  - `55`: "plan: DailyTaskPlan"
  - `56`: "goalLinks: TaskGoalLink"

### 📊 ArcadePointTransaction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "points: Int"
  - `4`: "reason: String"
  - `5`: "category: String"
  - `6`: "month: DateTime"
  - `7`: "metadata: String"
  - `8`: "createdAt: DateTime"
  - `9`: "user: User"

### 📊 ArcadeReward *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "pointsCost: Int"
  - `4`: "category: String"
  - `5`: "stock: Int"
  - `6`: "imageUrl: String"
  - `7`: "isActive: Boolean"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "redemptions: ArcadeRedemption"

### 📊 ArcadeRedemption *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "rewardId: String"
  - `3`: "pointsSpent: Int"
  - `4`: "status: String"
  - `5`: "fulfilledAt: DateTime"
  - `6`: "notes: String"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "reward: ArcadeReward"
  - `10`: "user: User"

### 📊 LeaveBalance *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "year: Int"
  - `3`: "type: String"
  - `4`: "total: Float"
  - `5`: "used: Float"
  - `6`: "remaining: Float"
  - `7`: "carryForward: Float"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "user: User"

### 📊 RBCAccrual *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "rbcPotId: String"
  - `3`: "month: DateTime"
  - `4`: "amount: Float"
  - `5`: "reason: String"
  - `6`: "status: String"
  - `7`: "createdAt: DateTime"
  - `8`: "user: User"

### 📊 RBCPayout *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "rbcPotId: String"
  - `3`: "amount: Float"
  - `4`: "vestingMonth: DateTime"
  - `5`: "paidAt: DateTime"
  - `6`: "status: String"
  - `7`: "multiplier: Float"
  - `8`: "createdAt: DateTime"
  - `9`: "user: User"

### 📊 PIPPlan *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "managerId: String"
  - `3`: "startDate: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "reason: String"
  - `6`: "status: String"
  - `7`: "finalOutcome: String"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "milestones: PIPMilestone"
  - `12`: "manager: User"
  - `13`: "user: User"

### 📊 PIPMilestone *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "pipPlanId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "dayMark: Int"
  - `5`: "targetDate: DateTime"
  - `6`: "status: String"
  - `7`: "reviewNotes: String"
  - `8`: "reviewedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "pipPlan: PIPPlan"

### 📊 Asset *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "assetTag: String"
  - `2`: "name: String"
  - `3`: "type: String"
  - `4`: "brand: String"
  - `5`: "model: String"
  - `6`: "serialNumber: String"
  - `7`: "purchaseDate: DateTime"
  - `8`: "purchasePrice: Float"
  - `9`: "warrantyEnd: DateTime"
  - `10`: "condition: String"
  - `11`: "status: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "assignments: AssetAssignment"

### 📊 AssetAssignment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "assetId: String"
  - `2`: "userId: String"
  - `3`: "assignedAt: DateTime"
  - `4`: "returnedAt: DateTime"
  - `5`: "conditionOnAssign: String"
  - `6`: "conditionOnReturn: String"
  - `7`: "notes: String"
  - `8`: "createdAt: DateTime"
  - `9`: "asset: Asset"
  - `10`: "user: User"

### 📊 ExitProcess *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "noticeDate: DateTime"
  - `4`: "lastWorkingDate: DateTime"
  - `5`: "exitDate: DateTime"
  - `6`: "reason: String"
  - `7`: "exitInterviewNotes: String"
  - `8`: "status: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "checklist: ExitChecklist"
  - `12`: "user: User"
  - `13`: "settlement: FnFSettlement"

### 📊 ExitChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "exitProcessId: String"
  - `2`: "category: String"
  - `3`: "item: String"
  - `4`: "status: String"
  - `5`: "responsibleRole: String"
  - `6`: "isCompleted: Boolean"
  - `7`: "completedAt: DateTime"
  - `8`: "completedBy: String"
  - `9`: "notes: String"
  - `10`: "createdAt: DateTime"
  - `11`: "exitProcess: ExitProcess"

### 📊 FnFSettlement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "exitProcessId: String"
  - `3`: "status: String"
  - `4`: "totalAmount: Float"
  - `5`: "netPayable: Float"
  - `6`: "approvedByHR: String"
  - `7`: "approvedByFinance: String"
  - `8`: "approvedByLeadership: String"
  - `9`: "paidAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "lineItems: FnFLineItem"
  - `13`: "exitProcess: ExitProcess"
  - `14`: "user: User"

### 📊 FnFLineItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "settlementId: String"
  - `2`: "type: String"
  - `3`: "description: String"
  - `4`: "amount: Float"
  - `5`: "isDeduction: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "settlement: FnFSettlement"

### 📊 ReferralBonus *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "referrerId: String"
  - `2`: "referredUserId: String"
  - `3`: "referredName: String"
  - `4`: "type: String"
  - `5`: "amount: Float"
  - `6`: "status: String"
  - `7`: "qualifiedAt: DateTime"
  - `8`: "paidAt: DateTime"
  - `9`: "notes: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "referredUser: User"
  - `13`: "referrer: User"

### 📊 RFPSubmission *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "clientId: String"
  - `3`: "companyName: String"
  - `4`: "contactName: String"
  - `5`: "contactEmail: String"
  - `6`: "contactPhone: String"
  - `7`: "address: String"
  - `8`: "gstNumber: String"
  - `9`: "industry: String"
  - `10`: "businessType: String"
  - `11`: "websiteUrl: String"
  - `12`: "servicesRequested: String"
  - `13`: "scopeDetails: String"
  - `14`: "budgetRange: String"
  - `15`: "monthlyBudget: Float"
  - `16`: "expectedStartDate: DateTime"
  - `17`: "contractDuration: String"
  - `18`: "clientTier: String"
  - `19`: "currency: String"
  - `20`: "locations: String"
  - `21`: "targetAudience: String"
  - `22`: "competitors: String"
  - `23`: "usp: String"
  - `24`: "adBudget: String"
  - `25`: "retainerBudget: String"
  - `26`: "primaryGoals: String"
  - `27`: "successMetrics: String"
  - `28`: "biggestChallenge: String"
  - `29`: "currentMarketing: String"
  - `30`: "whatWorked: String"
  - `31`: "whatDidntWork: String"
  - `32`: "preferredCallTime: String"
  - `33`: "additionalInfo: String"
  - `34`: "prospectFormData: String"
  - `35`: "patientVolume: String"
  - `36`: "specializations: String"
  - `37`: "status: String"
  - `38`: "currentStep: Int"
  - `39`: "completed: Boolean"
  - `40`: "completedAt: DateTime"
  - `41`: "viewedAt: DateTime"
  - `42`: "expiresAt: DateTime"
  - `43`: "submittedById: String"
  - `44`: "createdById: String"
  - `45`: "notes: String"
  - `46`: "leadId: String"
  - `47`: "createdAt: DateTime"
  - `48`: "updatedAt: DateTime"
  - `49`: "client: Client"

### 📊 SLADocument *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "entityType: String"
  - `3`: "entityName: String"
  - `4`: "entityAddress: String"
  - `5`: "clientName: String"
  - `6`: "clientAddress: String"
  - `7`: "clientGstNumber: String"
  - `8`: "servicesScope: String"
  - `9`: "customScope: String"
  - `10`: "monthlyRetainer: Float"
  - `11`: "advanceAmount: Float"
  - `12`: "contractDuration: String"
  - `13`: "commencementDate: DateTime"
  - `14`: "endDate: DateTime"
  - `15`: "poNumber: String"
  - `16`: "paymentTerms: String"
  - `17`: "slaMetrics: String"
  - `18`: "escalationContacts: String"
  - `19`: "clientSignerName: String"
  - `20`: "clientSignature: String"
  - `21`: "clientSignedAt: DateTime"
  - `22`: "agencySignerName: String"
  - `23`: "agencySignature: String"
  - `24`: "agencySignedAt: DateTime"
  - `25`: "status: String"
  - `26`: "documentUrl: String"
  - `27`: "generatedInvoiceId: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "client: Client"

### 📊 ServiceTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "subcategory: String"
  - `4`: "description: String"
  - `5`: "deliverables: String"
  - `6`: "pricing: String"
  - `7`: "inclusions: String"
  - `8`: "exclusions: String"
  - `9`: "revisionPolicy: String"
  - `10`: "slaMetrics: String"
  - `11`: "terms: String"
  - `12`: "isActive: Boolean"
  - `13`: "displayOrder: Int"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"

### 📊 VendorOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "companyName: String"
  - `2`: "contactName: String"
  - `3`: "contactEmail: String"
  - `4`: "contactPhone: String"
  - `5`: "address: String"
  - `6`: "gstNumber: String"
  - `7`: "panNumber: String"
  - `8`: "bankAccountName: String"
  - `9`: "bankAccountNumber: String"
  - `10`: "bankIFSC: String"
  - `11`: "bankName: String"
  - `12`: "serviceCategory: String"
  - `13`: "contractDuration: String"
  - `14`: "paymentTerms: String"
  - `15`: "monthlyRate: Float"
  - `16`: "ndaSigned: Boolean"
  - `17`: "ndaSignedAt: DateTime"
  - `18`: "ndaSignature: String"
  - `19`: "contractSigned: Boolean"
  - `20`: "contractSignedAt: DateTime"
  - `21`: "contractSignature: String"
  - `22`: "documentsUrl: String"
  - `23`: "status: String"
  - `24`: "approvedById: String"
  - `25`: "notes: String"
  - `26`: "createdAt: DateTime"
  - `27`: "updatedAt: DateTime"

### 📊 ClientPortal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "pinCode: String"
  - `3`: "themeColor: String"
  - `4`: "logoUrl: String"
  - `5`: "isActive: Boolean"
  - `6`: "lastAccessed: DateTime"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "client: Client"

### 📊 CompanyEntity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "code: String"
  - `2`: "name: String"
  - `3`: "tradeName: String"
  - `4`: "type: String"
  - `5`: "country: String"
  - `6`: "gstNumber: String"
  - `7`: "panNumber: String"
  - `8`: "cinNumber: String"
  - `9`: "einNumber: String"
  - `10`: "tanNumber: String"
  - `11`: "registeredAddress: String"
  - `12`: "operatingAddress: String"
  - `13`: "city: String"
  - `14`: "state: String"
  - `15`: "pincode: String"
  - `16`: "email: String"
  - `17`: "phone: String"
  - `18`: "website: String"
  - `19`: "invoicePrefix: String"
  - `20`: "invoiceCounter: Int"
  - `21`: "defaultCurrency: String"
  - `22`: "logoUrl: String"
  - `23`: "letterheadUrl: String"
  - `24`: "signatureUrl: String"
  - `25`: "isActive: Boolean"
  - `26`: "isPrimary: Boolean"
  - `27`: "createdAt: DateTime"
  - `28`: "updatedAt: DateTime"
  - `29`: "bankAccounts: EntityBankAccount"
  - `30`: "paymentGateways: EntityPaymentGateway"

### 📊 EntityBankAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "bankName: String"
  - `3`: "accountName: String"
  - `4`: "accountNumber: String"
  - `5`: "ifscCode: String"
  - `6`: "swiftCode: String"
  - `7`: "routingNumber: String"
  - `8`: "branchName: String"
  - `9`: "branchAddress: String"
  - `10`: "accountType: String"
  - `11`: "currency: String"
  - `12`: "displayName: String"
  - `13`: "isPrimary: Boolean"
  - `14`: "isActive: Boolean"
  - `15`: "lastBalance: Float"
  - `16`: "lastBalanceDate: DateTime"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "entity: CompanyEntity"

### 📊 EntityPaymentGateway *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "provider: String"
  - `3`: "displayName: String"
  - `4`: "merchantId: String"
  - `5`: "apiKeyId: String"
  - `6`: "apiKeySecret: String"
  - `7`: "webhookSecret: String"
  - `8`: "mode: String"
  - `9`: "supportedCurrencies: String"
  - `10`: "defaultCurrency: String"
  - `11`: "supportsSubscription: Boolean"
  - `12`: "supportsRefund: Boolean"
  - `13`: "supportsPartialPayment: Boolean"
  - `14`: "feePercentage: Float"
  - `15`: "fixedFee: Float"
  - `16`: "isPrimary: Boolean"
  - `17`: "isActive: Boolean"
  - `18`: "lastUsedAt: DateTime"
  - `19`: "totalTransactions: Int"
  - `20`: "totalVolume: Float"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"
  - `23`: "entity: CompanyEntity"

### 📊 SelfAppraisal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "cycleYear: Int"
  - `3`: "cyclePeriod: String"
  - `4`: "status: String"
  - `5`: "triggeredAt: DateTime"
  - `6`: "startedAt: DateTime"
  - `7`: "submittedAt: DateTime"
  - `8`: "completedAt: DateTime"
  - `9`: "overallRating: Int"
  - `10`: "keyAccomplishments: String"
  - `11`: "challengesFaced: String"
  - `12`: "goalsAchieved: String"
  - `13`: "goalsMissed: String"
  - `14`: "skillsImproved: String"
  - `15`: "learningCompleted: String"
  - `16`: "skillsToImprove: String"
  - `17`: "roleClarity: Int"
  - `18`: "resourcesAdequate: Int"
  - `19`: "workloadBalance: Int"
  - `20`: "teamCollaboration: Int"
  - `21`: "managerSupport: Int"
  - `22`: "cultureFit: Int"
  - `23`: "nextYearGoals: String"
  - `24`: "careerAspirations: String"
  - `25`: "supportNeeded: String"
  - `26`: "trainingRequests: String"
  - `27`: "companyFeedback: String"
  - `28`: "teamFeedback: String"
  - `29`: "processFeedback: String"
  - `30`: "managerComments: String"
  - `31`: "managerRating: Int"
  - `32`: "reviewedBy: String"
  - `33`: "reviewedAt: DateTime"
  - `34`: "finalRating: Int"
  - `35`: "incrementRecommendation: String"
  - `36`: "promotionRecommendation: Boolean"
  - `37`: "learningHoursThisYear: Float"
  - `38`: "learningHoursRequired: Float"
  - `39`: "createdAt: DateTime"
  - `40`: "updatedAt: DateTime"

### 📊 LoginSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "userType: String"
  - `3`: "ipAddress: String"
  - `4`: "userAgent: String"
  - `5`: "deviceType: String"
  - `6`: "browser: String"
  - `7`: "browserVersion: String"
  - `8`: "os: String"
  - `9`: "osVersion: String"
  - `10`: "country: String"
  - `11`: "countryCode: String"
  - `12`: "region: String"
  - `13`: "city: String"
  - `14`: "latitude: Float"
  - `15`: "longitude: Float"
  - `16`: "timezone: String"
  - `17`: "isp: String"
  - `18`: "sessionToken: String"
  - `19`: "isActive: Boolean"
  - `20`: "loginAt: DateTime"
  - `21`: "logoutAt: DateTime"
  - `22`: "lastActivityAt: DateTime"
  - `23`: "expiresAt: DateTime"
  - `24`: "isSuspicious: Boolean"
  - `25`: "suspiciousReason: String"
  - `26`: "isNewDevice: Boolean"
  - `27`: "deviceFingerprint: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "user: User"

### 📊 ChatChannel *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "slug: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "icon: String"
  - `6`: "isMash: Boolean"
  - `7`: "isArchived: Boolean"
  - `8`: "allowedRoles: String"
  - `9`: "isReadOnly: Boolean"
  - `10`: "createdById: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "createdBy: User"
  - `14`: "members: ChatChannelMember"
  - `15`: "messages: ChatMessage"

### 📊 ChatChannelMember *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "channelId: String"
  - `2`: "userId: String"
  - `3`: "role: String"
  - `4`: "isMuted: Boolean"
  - `5`: "lastReadAt: DateTime"
  - `6`: "joinedAt: DateTime"
  - `7`: "channel: ChatChannel"
  - `8`: "user: User"

### 📊 ChatMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "channelId: String"
  - `2`: "senderId: String"
  - `3`: "content: String"
  - `4`: "type: String"
  - `5`: "priority: String"
  - `6`: "isPinned: Boolean"
  - `7`: "attachments: String"
  - `8`: "parentId: String"
  - `9`: "reactions: String"
  - `10`: "isEdited: Boolean"
  - `11`: "editedAt: DateTime"
  - `12`: "isDeleted: Boolean"
  - `13`: "deletedAt: DateTime"
  - `14`: "readBy: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "channel: ChatChannel"
  - `18`: "parent: ChatMessage"
  - `19`: "replies: ChatMessage"
  - `20`: "sender: User"

### 📊 DirectMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "senderId: String"
  - `2`: "receiverId: String"
  - `3`: "content: String"
  - `4`: "type: String"
  - `5`: "attachments: String"
  - `6`: "isRead: Boolean"
  - `7`: "readAt: DateTime"
  - `8`: "isDeleted: Boolean"
  - `9`: "deletedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "receiver: User"
  - `13`: "sender: User"

### 📊 ClientProperty *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "name: String"
  - `4`: "url: String"
  - `5`: "isActive: Boolean"
  - `6`: "isPrimary: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "client: Client"
  - `9`: "kpiEntries: TacticalKPIEntry"

### 📊 TacticalMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "reportingMonth: DateTime"
  - `4`: "status: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "submittedOnTime: Boolean"
  - `7`: "reviewedBy: String"
  - `8`: "reviewedAt: DateTime"
  - `9`: "managerNotes: String"
  - `10`: "performanceScore: Float"
  - `11`: "accountabilityScore: Float"
  - `12`: "clientSatisfactionScore: Float"
  - `13`: "overallScore: Float"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "kpiEntries: TacticalKPIEntry"
  - `17`: "user: User"

### 📊 TacticalKPIEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "clientId: String"
  - `3`: "propertyId: String"
  - `4`: "department: String"
  - `5`: "organicTraffic: Int"
  - `6`: "prevOrganicTraffic: Int"
  - `7`: "leads: Int"
  - `8`: "prevLeads: Int"
  - `9`: "gbpCalls: Int"
  - `10`: "prevGbpCalls: Int"
  - `11`: "gbpDirections: Int"
  - `12`: "prevGbpDirections: Int"
  - `13`: "keywordsTop3: Int"
  - `14`: "prevKeywordsTop3: Int"
  - `15`: "keywordsTop10: Int"
  - `16`: "prevKeywordsTop10: Int"
  - `17`: "keywordsTop20: Int"
  - `18`: "prevKeywordsTop20: Int"
  - `19`: "backlinksBuilt: Int"
  - `20`: "prevBacklinksBuilt: Int"
  - `21`: "adSpend: Float"
  - `22`: "prevAdSpend: Float"
  - `23`: "impressions: Int"
  - `24`: "prevImpressions: Int"
  - `25`: "clicks: Int"
  - `26`: "prevClicks: Int"
  - `27`: "conversions: Int"
  - `28`: "prevConversions: Int"
  - `29`: "costPerConversion: Float"
  - `30`: "prevCostPerConversion: Float"
  - `31`: "roas: Float"
  - `32`: "prevRoas: Float"
  - `33`: "followers: Int"
  - `34`: "prevFollowers: Int"
  - `35`: "engagement: Float"
  - `36`: "prevEngagement: Float"
  - `37`: "postsPublished: Int"
  - `38`: "prevPostsPublished: Int"
  - `39`: "reachTotal: Int"
  - `40`: "prevReachTotal: Int"
  - `41`: "videoViews: Int"
  - `42`: "prevVideoViews: Int"
  - `43`: "pageSpeed: Int"
  - `44`: "prevPageSpeed: Int"
  - `45`: "bounceRate: Float"
  - `46`: "prevBounceRate: Float"
  - `47`: "avgSessionDuration: Float"
  - `48`: "prevAvgSessionDuration: Float"
  - `49`: "pagesBuilt: Int"
  - `50`: "prevPagesBuilt: Int"
  - `51`: "bugsFixed: Int"
  - `52`: "prevBugsFixed: Int"
  - `53`: "customMetrics: String"
  - `54`: "trafficGrowth: Float"
  - `55`: "leadsGrowth: Float"
  - `56`: "callsGrowth: Float"
  - `57`: "keywordsGrowth: Float"
  - `58`: "notes: String"
  - `59`: "achievements: String"
  - `60`: "challenges: String"
  - `61`: "nextMonthPlan: String"
  - `62`: "createdAt: DateTime"
  - `63`: "updatedAt: DateTime"
  - `64`: "client: Client"
  - `65`: "meeting: TacticalMeeting"
  - `66`: "property: ClientProperty"

### 📊 StrategicMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "quarter: Int"
  - `2`: "year: Int"
  - `3`: "department: String"
  - `4`: "conductedAt: DateTime"
  - `5`: "quarterlyData: String"
  - `6`: "summary: String"
  - `7`: "keyDecisions: String"
  - `8`: "actionItems: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "peerReviews: PeerReview"
  - `12`: "goals: StrategicGoal"

### 📊 StrategicGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "userId: String"
  - `3`: "department: String"
  - `4`: "clientId: String"
  - `5`: "title: String"
  - `6`: "description: String"
  - `7`: "targetMetric: String"
  - `8`: "targetValue: Float"
  - `9`: "currentValue: Float"
  - `10`: "deadline: DateTime"
  - `11`: "status: String"
  - `12`: "achievedValue: Float"
  - `13`: "achievedAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "meeting: StrategicMeeting"

### 📊 PeerReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "reviewerId: String"
  - `3`: "revieweeId: String"
  - `4`: "collaborationRating: Int"
  - `5`: "communicationRating: Int"
  - `6`: "deliveryRating: Int"
  - `7`: "innovationRating: Int"
  - `8`: "overallRating: Int"
  - `9`: "didWell: String"
  - `10`: "needsImprovement: String"
  - `11`: "shouldDoDifferently: String"
  - `12`: "additionalComments: String"
  - `13`: "isAnonymous: Boolean"
  - `14`: "isPublic: Boolean"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "meeting: StrategicMeeting"

### 📊 EmployeeScorecard *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "performanceScore: Float"
  - `4`: "performanceBreakdown: String"
  - `5`: "accountabilityScore: Float"
  - `6`: "projectsManaged: Int"
  - `7`: "projectsExpected: Int"
  - `8`: "clientSatisfactionScore: Float"
  - `9`: "avgNpsScore: Float"
  - `10`: "positiveReviews: Int"
  - `11`: "negativeReviews: Int"
  - `12`: "escalationsCount: Int"
  - `13`: "churnedClients: Int"
  - `14`: "learningHoursRequired: Float"
  - `15`: "learningHoursCompleted: Float"
  - `16`: "learningCompliant: Boolean"
  - `17`: "appraisalDelayMonths: Int"
  - `18`: "overallScore: Float"
  - `19`: "companyRank: Int"
  - `20`: "departmentRank: Int"
  - `21`: "isAppraisalEligible: Boolean"
  - `22`: "nextAppraisalDate: DateTime"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"

### 📊 ClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "month: DateTime"
  - `3`: "npsScore: Int"
  - `4`: "npsCategory: String"
  - `5`: "overallSatisfaction: Int"
  - `6`: "communicationRating: Int"
  - `7`: "deliveryRating: Int"
  - `8`: "valueRating: Int"
  - `9`: "feedback: String"
  - `10`: "improvements: String"
  - `11`: "hadEscalation: Boolean"
  - `12`: "escalationDetails: String"
  - `13`: "churnRisk: String"
  - `14`: "churnedThisMonth: Boolean"
  - `15`: "churnReason: String"
  - `16`: "collectedAt: DateTime"
  - `17`: "collectedBy: String"
  - `18`: "client: Client"

### 📊 ClientPortalFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "clientUserId: String"
  - `3`: "type: String"
  - `4`: "rating: Int"
  - `5`: "message: String"
  - `6`: "status: String"
  - `7`: "response: String"
  - `8`: "respondedBy: String"
  - `9`: "respondedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "client: Client"
  - `12`: "clientUser: ClientUser"

### 📊 CustomRole *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "displayName: String"
  - `3`: "baseRoles: String"
  - `4`: "departments: String"
  - `5`: "permissions: String"
  - `6`: "isActive: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "userAssignments: UserCustomRole"

### 📊 UserCustomRole *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "customRoleId: String"
  - `3`: "assignedAt: DateTime"
  - `4`: "customRole: CustomRole"
  - `5`: "user: User"

### 📊 ClientWhatsAppGroup *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "groupType: String"
  - `4`: "joinLink: String"
  - `5`: "qrCodeUrl: String"
  - `6`: "officialPhoneRequired: String"
  - `7`: "isActive: Boolean"
  - `8`: "memberCount: Int"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"

### 📊 WhatsAppTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "department: String"
  - `4`: "content: String"
  - `5`: "variables: String"
  - `6`: "language: String"
  - `7`: "hasMedia: Boolean"
  - `8`: "mediaType: String"
  - `9`: "mediaUrl: String"
  - `10`: "usageCount: Int"
  - `11`: "lastUsedAt: DateTime"
  - `12`: "isActive: Boolean"
  - `13`: "isApproved: Boolean"
  - `14`: "approvedBy: String"
  - `15`: "approvedAt: DateTime"
  - `16`: "createdBy: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "usageLogs: WhatsAppTemplateUsage"

### 📊 WhatsAppTemplateUsage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "templateId: String"
  - `2`: "userId: String"
  - `3`: "recipientPhone: String"
  - `4`: "recipientName: String"
  - `5`: "recipientType: String"
  - `6`: "status: String"
  - `7`: "messageId: String"
  - `8`: "error: String"
  - `9`: "sentAt: DateTime"
  - `10`: "deliveredAt: DateTime"
  - `11`: "readAt: DateTime"
  - `12`: "template: WhatsAppTemplate"

### 📊 WhatsAppCampaign *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "templateId: String"
  - `4`: "targetType: String"
  - `5`: "targetFilter: String"
  - `6`: "recipientCount: Int"
  - `7`: "status: String"
  - `8`: "scheduledAt: DateTime"
  - `9`: "startedAt: DateTime"
  - `10`: "completedAt: DateTime"
  - `11`: "sentCount: Int"
  - `12`: "deliveredCount: Int"
  - `13`: "failedCount: Int"
  - `14`: "createdBy: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "messages: WhatsAppCampaignMessage"

### 📊 WhatsAppCampaignMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "recipientPhone: String"
  - `3`: "recipientName: String"
  - `4`: "status: String"
  - `5`: "messageId: String"
  - `6`: "error: String"
  - `7`: "sentAt: DateTime"
  - `8`: "deliveredAt: DateTime"
  - `9`: "campaign: WhatsAppCampaign"

### 📊 DeviceRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "deviceType: String"
  - `3`: "reason: String"
  - `4`: "urgency: String"
  - `5`: "status: String"
  - `6`: "approvedBy: String"
  - `7`: "fulfilledAssetId: String"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "user: User"

### 📊 HRPipelineTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "candidateId: String"
  - `3`: "employeeId: String"
  - `4`: "taskType: String"
  - `5`: "title: String"
  - `6`: "description: String"
  - `7`: "startDate: DateTime"
  - `8`: "endDate: DateTime"
  - `9`: "duration: Int"
  - `10`: "progress: Int"
  - `11`: "dependencies: String"
  - `12`: "status: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 ClientOperationsLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "date: DateTime"
  - `3`: "npsScore: Int"
  - `4`: "flagStatus: String"
  - `5`: "paymentStatus: String"
  - `6`: "paymentDueDate: DateTime"
  - `7`: "remarks: String"
  - `8`: "loggedBy: String"
  - `9`: "createdAt: DateTime"
  - `10`: "client: Client"

### 📊 WhatsAppAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "phoneNumber: String"
  - `3`: "displayName: String"
  - `4`: "wbiztoolClientId: Int"
  - `5`: "wbiztoolWhatsappId: Int"
  - `6`: "sessionStatus: String"
  - `7`: "isActive: Boolean"
  - `8`: "createdById: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "employeeChats: EmployeeWhatsAppChat"
  - `12`: "accessGrants: WhatsAppAccess"
  - `13`: "messages: WhatsAppMessage"
  - `14`: "schedules: WhatsAppSchedule"

### 📊 WhatsAppMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "direction: String"
  - `3`: "phoneNumber: String"
  - `4`: "contactName: String"
  - `5`: "messageType: String"
  - `6`: "content: String"
  - `7`: "mediaUrl: String"
  - `8`: "status: String"
  - `9`: "externalMsgId: String"
  - `10`: "clientId: String"
  - `11`: "sentById: String"
  - `12`: "scheduleId: String"
  - `13`: "sentAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "account: WhatsAppAccount"
  - `16`: "client: Client"
  - `17`: "schedule: WhatsAppSchedule"

### 📊 WhatsAppSchedule *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "name: String"
  - `3`: "targetType: String"
  - `4`: "targetPhone: String"
  - `5`: "targetClientId: String"
  - `6`: "targetChatId: String"
  - `7`: "isGroup: Boolean"
  - `8`: "messageTemplate: String"
  - `9`: "scheduleType: String"
  - `10`: "frequency: String"
  - `11`: "dayOfWeek: Int"
  - `12`: "dayOfMonth: Int"
  - `13`: "scheduledTime: String"
  - `14`: "scheduledAt: DateTime"
  - `15`: "lastRunAt: DateTime"
  - `16`: "nextRunAt: DateTime"
  - `17`: "runCount: Int"
  - `18`: "status: String"
  - `19`: "createdById: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "messages: WhatsAppMessage"
  - `23`: "account: WhatsAppAccount"

### 📊 WhatsAppAccess *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "accountId: String"
  - `3`: "accessLevel: String"
  - `4`: "grantedById: String"
  - `5`: "grantedAt: DateTime"
  - `6`: "account: WhatsAppAccount"
  - `7`: "user: User"

### 📊 EmployeeWhatsAppChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "accountId: String"
  - `3`: "phoneNumber: String"
  - `4`: "chatName: String"
  - `5`: "assignedAt: DateTime"
  - `6`: "assignedById: String"
  - `7`: "account: WhatsAppAccount"
  - `8`: "user: User"

### 📊 WhatsAppSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sessionId: String"
  - `2`: "department: String"
  - `3`: "userId: String"
  - `4`: "status: String"
  - `5`: "phoneNumber: String"
  - `6`: "lastError: String"
  - `7`: "reconnectCount: Int"
  - `8`: "lastConnectedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 WhatsAppAuthState *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sessionId: String"
  - `2`: "key: String"
  - `3`: "value: String"
  - `4`: "createdAt: DateTime"
  - `5`: "updatedAt: DateTime"

### 📊 UserPinnedChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "chatIdentifier: String"
  - `3`: "chatName: String"
  - `4`: "isGroup: Boolean"
  - `5`: "pinnedAt: DateTime"

### 📊 BankStatement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "bankName: String"
  - `3`: "accountType: String"
  - `4`: "accountNumber: String"
  - `5`: "statementMonth: DateTime"
  - `6`: "fileName: String"
  - `7`: "fileUrl: String"
  - `8`: "status: String"
  - `9`: "openingBalance: Float"
  - `10`: "closingBalance: Float"
  - `11`: "totalCredits: Float"
  - `12`: "totalDebits: Float"
  - `13`: "matchedCount: Int"
  - `14`: "unmatchedCount: Int"
  - `15`: "aiParsingResult: String"
  - `16`: "processingError: String"
  - `17`: "processedAt: DateTime"
  - `18`: "uploadedBy: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "transactions: BankTransaction"

### 📊 BankTransaction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "statementId: String"
  - `2`: "transactionDate: DateTime"
  - `3`: "valueDate: DateTime"
  - `4`: "description: String"
  - `5`: "reference: String"
  - `6`: "type: String"
  - `7`: "amount: Float"
  - `8`: "balance: Float"
  - `9`: "matchStatus: String"
  - `10`: "matchConfidence: Float"
  - `11`: "clientId: String"
  - `12`: "invoiceId: String"
  - `13`: "paymentId: String"
  - `14`: "category: String"
  - `15`: "subcategory: String"
  - `16`: "expenseId: String"
  - `17`: "aiParsedData: String"
  - `18`: "isReviewed: Boolean"
  - `19`: "reviewedBy: String"
  - `20`: "reviewedAt: DateTime"
  - `21`: "reviewNotes: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"
  - `24`: "client: Client"
  - `25`: "invoice: Invoice"
  - `26`: "payment: PaymentCollection"
  - `27`: "statement: BankStatement"

### 📊 DepartmentExpense *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "month: DateTime"
  - `3`: "baseSalaryComponent: Float"
  - `4`: "rbcComponent: Float"
  - `5`: "totalSalaryComponent: Float"
  - `6`: "toolsExpense: Float"
  - `7`: "freelancerExpense: Float"
  - `8`: "miscExpense: Float"
  - `9`: "totalExpense: Float"
  - `10`: "attributedRevenue: Float"
  - `11`: "clientCount: Int"
  - `12`: "roi: Float"
  - `13`: "costPerClient: Float"
  - `14`: "revenuePerClient: Float"
  - `15`: "notes: String"
  - `16`: "calculatedAt: DateTime"
  - `17`: "calculatedBy: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 DepartmentSalaryAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "month: DateTime"
  - `3`: "headCount: Int"
  - `4`: "totalBaseSalary: Float"
  - `5`: "totalRBCAllocation: Float"
  - `6`: "isVerified: Boolean"
  - `7`: "verifiedBy: String"
  - `8`: "verifiedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 AutoInvoiceConfig *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "isEnabled: Boolean"
  - `3`: "generateOnDay: Int"
  - `4`: "sendOnDay: Int"
  - `5`: "sendViaWhatsApp: Boolean"
  - `6`: "sendViaEmail: Boolean"
  - `7`: "useClientMonthlyFee: Boolean"
  - `8`: "customAmount: Float"
  - `9`: "includeGST: Boolean"
  - `10`: "gstPercentage: Float"
  - `11`: "invoicePrefix: String"
  - `12`: "defaultNotes: String"
  - `13`: "lastGeneratedAt: DateTime"
  - `14`: "lastSentAt: DateTime"
  - `15`: "nextScheduledAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 AccountsMonthlyReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "month: DateTime"
  - `2`: "totalExpectedRevenue: Float"
  - `3`: "totalCollected: Float"
  - `4`: "totalPending: Float"
  - `5`: "totalOverdue: Float"
  - `6`: "collectionRate: Float"
  - `7`: "activeClients: Int"
  - `8`: "newClients: Int"
  - `9`: "churnedClients: Int"
  - `10`: "departmentROISummary: String"
  - `11`: "expenseByCategory: String"
  - `12`: "keyHighlights: String"
  - `13`: "challenges: String"
  - `14`: "actionItems: String"
  - `15`: "status: String"
  - `16`: "scheduledAt: DateTime"
  - `17`: "conductedAt: DateTime"
  - `18`: "conductedBy: String"
  - `19`: "participants: String"
  - `20`: "meetingNotes: String"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"

### 📊 AccountsQuarterlyReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "quarter: Int"
  - `2`: "year: Int"
  - `3`: "quarterlyRevenue: Float"
  - `4`: "previousQuarterRev: Float"
  - `5`: "revenueGrowthPct: Float"
  - `6`: "cashInflow: Float"
  - `7`: "cashOutflow: Float"
  - `8`: "netCashFlow: Float"
  - `9`: "badDebtAmount: Float"
  - `10`: "writeOffClients: String"
  - `11`: "avgCollectionDays: Float"
  - `12`: "clientRetentionRate: Float"
  - `13`: "nextQuarterForecast: Float"
  - `14`: "strategicGoals: String"
  - `15`: "status: String"
  - `16`: "scheduledAt: DateTime"
  - `17`: "conductedAt: DateTime"
  - `18`: "conductedBy: String"
  - `19`: "participants: String"
  - `20`: "meetingNotes: String"
  - `21`: "actionItems: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 Interview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "stage: String"
  - `3`: "scheduledAt: DateTime"
  - `4`: "duration: Int"
  - `5`: "location: String"
  - `6`: "meetingLink: String"
  - `7`: "calendarEventId: String"
  - `8`: "interviewerId: String"
  - `9`: "status: String"
  - `10`: "feedback: String"
  - `11`: "rating: Int"
  - `12`: "decision: String"
  - `13`: "notes: String"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "candidate: Candidate"
  - `17`: "interviewer: User"

### 📊 OfferLetter *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "position: String"
  - `3`: "department: String"
  - `4`: "offeredSalary: Float"
  - `5`: "joiningDate: DateTime"
  - `6`: "employmentType: String"
  - `7`: "probationMonths: Int"
  - `8`: "noticePeriodDays: Int"
  - `9`: "negotiationNotes: String"
  - `10`: "finalSalary: Float"
  - `11`: "status: String"
  - `12`: "approvedBy: String"
  - `13`: "approvedAt: DateTime"
  - `14`: "sentAt: DateTime"
  - `15`: "candidateResponse: String"
  - `16`: "respondedAt: DateTime"
  - `17`: "offerLetterUrl: String"
  - `18`: "signedUrl: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "candidate: Candidate"

### 📊 EmployeeClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "employeeId: String"
  - `3`: "overallRating: Int"
  - `4`: "qualitativeRemarks: String"
  - `5`: "communicationRating: Int"
  - `6`: "deliveryRating: Int"
  - `7`: "professionalismRating: Int"
  - `8`: "responsiveRating: Int"
  - `9`: "service: String"
  - `10`: "projectName: String"
  - `11`: "periodStart: DateTime"
  - `12`: "periodEnd: DateTime"
  - `13`: "collectedBy: String"
  - `14`: "source: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "client: Client"
  - `18`: "employee: User"

### 📊 EmployeeEscalation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "employeeId: String"
  - `2`: "type: String"
  - `3`: "severity: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "clientId: String"
  - `7`: "reportedBy: String"
  - `8`: "status: String"
  - `9`: "resolution: String"
  - `10`: "resolvedBy: String"
  - `11`: "resolvedAt: DateTime"
  - `12`: "impactOnAppraisal: Boolean"
  - `13`: "actionTaken: String"
  - `14`: "managerNotified: Boolean"
  - `15`: "hrNotified: Boolean"
  - `16`: "notifiedAt: DateTime"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "client: Client"
  - `20`: "employee: User"
  - `21`: "reporter: User"

### 📊 EmployeeAppreciation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "employeeId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "clientId: String"
  - `6`: "givenBy: String"
  - `7`: "xpAwarded: Int"
  - `8`: "isPublic: Boolean"
  - `9`: "certificate: String"
  - `10`: "createdAt: DateTime"
  - `11`: "client: Client"
  - `12`: "employee: User"
  - `13`: "giver: User"

### 📊 ManagerBehaviorReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "managerId: String"
  - `2`: "quarter: Int"
  - `3`: "year: Int"
  - `4`: "personalityRating: Int"
  - `5`: "commitmentRating: Int"
  - `6`: "behaviorRating: Int"
  - `7`: "leadershipRating: Int"
  - `8`: "communicationRating: Int"
  - `9`: "teamBuildingRating: Int"
  - `10`: "strengths: String"
  - `11`: "areasOfImprovement: String"
  - `12`: "specificIncidents: String"
  - `13`: "teamFeedbackSummary: String"
  - `14`: "reviewedBy: String"
  - `15`: "status: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "manager: User"
  - `19`: "reviewer: User"

### 📊 EmployerBrandingContent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "platform: String"
  - `5`: "contentText: String"
  - `6`: "mediaUrls: String"
  - `7`: "hashtags: String"
  - `8`: "scheduledFor: DateTime"
  - `9`: "publishedAt: DateTime"
  - `10`: "status: String"
  - `11`: "createdBy: String"
  - `12`: "approvedBy: String"
  - `13`: "approvedAt: DateTime"
  - `14`: "rejectionReason: String"
  - `15`: "likes: Int"
  - `16`: "comments: Int"
  - `17`: "shares: Int"
  - `18`: "reach: Int"
  - `19`: "impressions: Int"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "approver: User"
  - `23`: "creator: User"

### 📊 ContentIdea *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "theme: String"
  - `5`: "tags: String"
  - `6`: "status: String"
  - `7`: "usedCount: Int"
  - `8`: "lastUsedAt: DateTime"
  - `9`: "createdBy: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "creator: User"

### 📊 EngagementActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "scheduledDate: DateTime"
  - `5`: "endDate: DateTime"
  - `6`: "location: String"
  - `7`: "estimatedBudget: Float"
  - `8`: "actualSpent: Float"
  - `9`: "budgetApproved: Boolean"
  - `10`: "status: String"
  - `11`: "approvedBy: String"
  - `12`: "approvedAt: DateTime"
  - `13`: "rejectionReason: String"
  - `14`: "targetAudience: String"
  - `15`: "department: String"
  - `16`: "expectedCount: Int"
  - `17`: "actualCount: Int"
  - `18`: "organizedBy: String"
  - `19`: "photos: String"
  - `20`: "feedback: String"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"
  - `23`: "approver: User"
  - `24`: "organizer: User"

### 📊 WorkAnniversaryReminder *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "anniversaryDate: DateTime"
  - `3`: "yearsCompleted: Int"
  - `4`: "reminderSent: Boolean"
  - `5`: "reminderSentAt: DateTime"
  - `6`: "celebrated: Boolean"
  - `7`: "celebrationNotes: String"
  - `8`: "giftGiven: String"
  - `9`: "createdAt: DateTime"
  - `10`: "user: User"

### 📊 Day0Task *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "category: String"
  - `4`: "responsibleRole: String"
  - `5`: "dueHours: Int"
  - `6`: "isTemplate: Boolean"
  - `7`: "userId: String"
  - `8`: "assignedTo: String"
  - `9`: "status: String"
  - `10`: "completedAt: DateTime"
  - `11`: "completedBy: String"
  - `12`: "notes: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "assignee: User"
  - `16`: "user: User"

### 📊 SaasTool *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "description: String"
  - `4`: "url: String"
  - `5`: "loginType: String"
  - `6`: "email: String"
  - `7`: "password: String"
  - `8`: "notes: String"
  - `9`: "isActive: Boolean"
  - `10`: "accessLevel: String"
  - `11`: "lastAccessedAt: DateTime"
  - `12`: "lastAccessedBy: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 ClientProposal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "prospectName: String"
  - `3`: "prospectEmail: String"
  - `4`: "prospectPhone: String"
  - `5`: "prospectCompany: String"
  - `6`: "services: String"
  - `7`: "scopeItems: String"
  - `8`: "basePrice: Float"
  - `9`: "gstPercentage: Float"
  - `10`: "totalPrice: Float"
  - `11`: "allowServiceModification: Boolean"
  - `12`: "allowScopeModification: Boolean"
  - `13`: "clientName: String"
  - `14`: "clientEmail: String"
  - `15`: "clientPhone: String"
  - `16`: "clientCompany: String"
  - `17`: "clientGst: String"
  - `18`: "selectedServices: String"
  - `19`: "selectedScope: String"
  - `20`: "finalPrice: Float"
  - `21`: "clientAddress: String"
  - `22`: "clientCity: String"
  - `23`: "clientState: String"
  - `24`: "clientPincode: String"
  - `25`: "contractDuration: String"
  - `26`: "paymentTerms: String"
  - `27`: "advanceAmount: Float"
  - `28`: "advancePercentage: Int"
  - `29`: "slaAccepted: Boolean"
  - `30`: "slaAcceptedAt: DateTime"
  - `31`: "slaSignerName: String"
  - `32`: "slaSignerDesignation: String"
  - `33`: "slaDocumentId: String"
  - `34`: "invoiceGenerated: Boolean"
  - `35`: "invoiceGeneratedAt: DateTime"
  - `36`: "invoiceNumber: String"
  - `37`: "paymentMethod: String"
  - `38`: "paymentConfirmed: Boolean"
  - `39`: "paymentConfirmedAt: DateTime"
  - `40`: "paymentConfirmedBy: String"
  - `41`: "paymentReference: String"
  - `42`: "razorpayOrderId: String"
  - `43`: "razorpayPaymentId: String"
  - `44`: "accountOnboardingCompleted: Boolean"
  - `45`: "accountOnboardingCompletedAt: DateTime"
  - `46`: "accountOnboardingData: String"
  - `47`: "managerReviewed: Boolean"
  - `48`: "managerReviewedAt: DateTime"
  - `49`: "managerReviewedBy: String"
  - `50`: "accountManagerId: String"
  - `51`: "teamAllocated: Boolean"
  - `52`: "teamAllocationData: String"
  - `53`: "portalActivated: Boolean"
  - `54`: "portalActivatedAt: DateTime"
  - `55`: "kickoffScheduled: Boolean"
  - `56`: "kickoffDate: DateTime"
  - `57`: "currentStep: Int"
  - `58`: "status: String"
  - `59`: "expiresAt: DateTime"
  - `60`: "viewedAt: DateTime"
  - `61`: "acceptedAt: DateTime"
  - `62`: "clientId: String"
  - `63`: "invoiceId: String"
  - `64`: "createdById: String"
  - `65`: "createdByRole: String"
  - `66`: "entityType: String"
  - `67`: "createdAt: DateTime"
  - `68`: "updatedAt: DateTime"
  - `69`: "onboardingDetails: AccountOnboardingDetails"

### 📊 AccountOnboardingDetails *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "proposalId: String"
  - `2`: "brandName: String"
  - `3`: "brandTagline: String"
  - `4`: "brandDescription: String"
  - `5`: "brandVoice: String"
  - `6`: "targetAudience: String"
  - `7`: "competitors: String"
  - `8`: "uniqueSellingPoint: String"
  - `9`: "communicationStyle: String"
  - `10`: "reportingFrequency: String"
  - `11`: "meetingPreference: String"
  - `12`: "responseExpectation: String"
  - `13`: "decisionMaker: String"
  - `14`: "feedbackStyle: String"
  - `15`: "involvementLevel: String"
  - `16`: "primaryContactName: String"
  - `17`: "primaryContactPhone: String"
  - `18`: "primaryContactEmail: String"
  - `19`: "whatsappNumber: String"
  - `20`: "preferredChannel: String"
  - `21`: "escalationContact: String"
  - `22`: "escalationPhone: String"
  - `23`: "seoDetails: String"
  - `24`: "socialDetails: String"
  - `25`: "adsDetails: String"
  - `26`: "webDetails: String"
  - `27`: "gbpDetails: String"
  - `28`: "contentApprovalRequired: Boolean"
  - `29`: "contentApprovalBy: String"
  - `30`: "contentTurnaround: String"
  - `31`: "doNotDo: String"
  - `32`: "mustDo: String"
  - `33`: "additionalNotes: String"
  - `34`: "seoSectionComplete: Boolean"
  - `35`: "socialSectionComplete: Boolean"
  - `36`: "adsSectionComplete: Boolean"
  - `37`: "webSectionComplete: Boolean"
  - `38`: "gbpSectionComplete: Boolean"
  - `39`: "createdAt: DateTime"
  - `40`: "updatedAt: DateTime"
  - `41`: "proposal: ClientProposal"

### 📊 ClientLedger *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "category: String"
  - `4`: "description: String"
  - `5`: "amount: Float"
  - `6`: "balance: Float"
  - `7`: "referenceId: String"
  - `8`: "recordedBy: String"
  - `9`: "createdAt: DateTime"
  - `10`: "client: Client"

### 📊 Sequence *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "value: Int"
  - `2`: "updatedAt: DateTime"

### 📊 MagicLink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "clientId: String"
  - `4`: "role: String"
  - `5`: "department: String"
  - `6`: "ipAddress: String"
  - `7`: "isUsed: Boolean"
  - `8`: "usedAt: DateTime"
  - `9`: "expiresAt: DateTime"
  - `10`: "createdBy: String"
  - `11`: "createdAt: DateTime"

### 📊 UserGoogleDrive *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "accessToken: String"
  - `3`: "refreshToken: String"
  - `4`: "tokenExpiry: DateTime"
  - `5`: "email: String"
  - `6`: "rootFolderId: String"
  - `7`: "isConnected: Boolean"
  - `8`: "lastSyncAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "user: User"

### 📊 WorkEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "date: DateTime"
  - `4`: "year: Int"
  - `5`: "month: Int"
  - `6`: "week: Int"
  - `7`: "category: String"
  - `8`: "deliverableType: String"
  - `9`: "quantity: Int"
  - `10`: "metrics: String"
  - `11`: "resultSummary: String"
  - `12`: "resultMetrics: String"
  - `13`: "hoursSpent: Float"
  - `14`: "description: String"
  - `15`: "notes: String"
  - `16`: "qualityScore: Int"
  - `17`: "revisionCount: Int"
  - `18`: "turnaroundHours: Float"
  - `19`: "deliverableUrl: String"
  - `20`: "status: String"
  - `21`: "submittedAt: DateTime"
  - `22`: "approvedBy: String"
  - `23`: "approvedAt: DateTime"
  - `24`: "rejectionNote: String"
  - `25`: "tacticalMeetingId: String"
  - `26`: "strategicMeetingId: String"
  - `27`: "whatsappChatId: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "invoiceId: String"
  - `31`: "goalLinks: TaskGoalLink"
  - `32`: "client: Client"
  - `33`: "user: User"
  - `34`: "files: WorkEntryFile"

### 📊 WorkEntryFile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "workEntryId: String"
  - `2`: "driveFileId: String"
  - `3`: "fileName: String"
  - `4`: "fileType: String"
  - `5`: "fileSize: Int"
  - `6`: "webViewLink: String"
  - `7`: "thumbnailUrl: String"
  - `8`: "fileCategory: String"
  - `9`: "createdAt: DateTime"
  - `10`: "workEntry: WorkEntry"

### 📊 DeliverableTypeConfig *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "category: String"
  - `2`: "type: String"
  - `3`: "displayName: String"
  - `4`: "unitValue: Float"
  - `5`: "minQuantity: Int"
  - `6`: "maxQuantity: Int"
  - `7`: "requiredMetrics: String"
  - `8`: "isActive: Boolean"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 WhatsAppChatNote *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "chatIdentifier: String"
  - `3`: "chatName: String"
  - `4`: "content: String"
  - `5`: "isPinned: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"

### 📊 SharedWhatsAppChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "chatIdentifier: String"
  - `2`: "chatName: String"
  - `3`: "chatType: String"
  - `4`: "department: String"
  - `5`: "clientId: String"
  - `6`: "isActive: Boolean"
  - `7`: "addedById: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "addedBy: User"
  - `11`: "client: Client"

### 📊 SocialMediaPost *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "month: DateTime"
  - `4`: "postUrl: String"
  - `5`: "platform: String"
  - `6`: "contentType: String"
  - `7`: "caption: String"
  - `8`: "postedAt: DateTime"
  - `9`: "likes: Int"
  - `10`: "comments: Int"
  - `11`: "shares: Int"
  - `12`: "saves: Int"
  - `13`: "reach: Int"
  - `14`: "impressions: Int"
  - `15`: "views: Int"
  - `16`: "watchTime: Int"
  - `17`: "engagementRate: Float"
  - `18`: "isTopPerformer: Boolean"
  - `19`: "performanceNotes: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "user: User"

### 📊 MonthlyGrowthScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "performanceScore: Float"
  - `4`: "performanceBreakdown: String"
  - `5`: "accountabilityScore: Float"
  - `6`: "clientsManaged: Int"
  - `7`: "clientCapacity: Int"
  - `8`: "accountabilityNotes: String"
  - `9`: "disciplineScore: Float"
  - `10`: "presentDays: Int"
  - `11`: "lateDays: Int"
  - `12`: "absentDays: Int"
  - `13`: "onTimePercentage: Float"
  - `14`: "disciplineSource: String"
  - `15`: "learningScore: Float"
  - `16`: "learningHoursLogged: Float"
  - `17`: "learningHoursRequired: Float"
  - `18`: "appreciationScore: Float"
  - `19`: "managerAppreciations: Int"
  - `20`: "clientAppreciations: Int"
  - `21`: "testimonials: Int"
  - `22`: "escalationsCount: Int"
  - `23`: "escalationDeduction: Float"
  - `24`: "clientsLost: Int"
  - `25`: "churnDeduction: Float"
  - `26`: "finalScore: Float"
  - `27`: "scoreGrade: String"
  - `28`: "tacticalDataSubmitted: Boolean"
  - `29`: "submittedAt: DateTime"
  - `30`: "submittedOnTime: Boolean"
  - `31`: "reviewedBy: String"
  - `32`: "reviewedAt: DateTime"
  - `33`: "reviewNotes: String"
  - `34`: "createdAt: DateTime"
  - `35`: "updatedAt: DateTime"
  - `36`: "user: User"

### 📊 SocialMediaPageMetrics *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "month: DateTime"
  - `4`: "platform: String"
  - `5`: "followers: Int"
  - `6`: "prevFollowers: Int"
  - `7`: "followerGrowth: Float"
  - `8`: "totalReach: Int"
  - `9`: "prevTotalReach: Int"
  - `10`: "reachGrowth: Float"
  - `11`: "totalEngagement: Int"
  - `12`: "engagementRate: Float"
  - `13`: "prevEngagementRate: Float"
  - `14`: "postsPublished: Int"
  - `15`: "reelsPublished: Int"
  - `16`: "storiesPublished: Int"
  - `17`: "leadsGenerated: Int"
  - `18`: "linkClicks: Int"
  - `19`: "profileVisits: Int"
  - `20`: "connections: Int"
  - `21`: "subscribers: Int"
  - `22`: "videoViews: Int"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"
  - `25`: "client: Client"
  - `26`: "user: User"

### 📊 RecurringExpense *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "category: String"
  - `4`: "vendor: String"
  - `5`: "frequency: String"
  - `6`: "amount: Float"
  - `7`: "currency: String"
  - `8`: "startDate: DateTime"
  - `9`: "endDate: DateTime"
  - `10`: "nextDueDate: DateTime"
  - `11`: "lastPaidDate: DateTime"
  - `12`: "isClientBillable: Boolean"
  - `13`: "autoPayEnabled: Boolean"
  - `14`: "reminderDays: Int"
  - `15`: "status: String"
  - `16`: "createdBy: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "allocations: ExpenseAllocation"
  - `20`: "payments: ExpensePayment"
  - `21`: "creator: User"

### 📊 ExpenseAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "expenseId: String"
  - `2`: "clientId: String"
  - `3`: "percentage: Float"
  - `4`: "fixedAmount: Float"
  - `5`: "notes: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "client: Client"
  - `9`: "expense: RecurringExpense"

### 📊 ExpensePayment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "expenseId: String"
  - `2`: "amount: Float"
  - `3`: "paidDate: DateTime"
  - `4`: "dueDate: DateTime"
  - `5`: "paymentMethod: String"
  - `6`: "transactionRef: String"
  - `7`: "receipt: String"
  - `8`: "status: String"
  - `9`: "notes: String"
  - `10`: "paidBy: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "expense: RecurringExpense"
  - `14`: "payer: User"

### 📊 Goal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "level: String"
  - `2`: "parentId: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "category: String"
  - `6`: "quarter: Int"
  - `7`: "year: Int"
  - `8`: "clientId: String"
  - `9`: "department: String"
  - `10`: "ownerId: String"
  - `11`: "startDate: DateTime"
  - `12`: "targetDate: DateTime"
  - `13`: "completedDate: DateTime"
  - `14`: "targetValue: Float"
  - `15`: "currentValue: Float"
  - `16`: "unit: String"
  - `17`: "status: String"
  - `18`: "progress: Float"
  - `19`: "weight: Float"
  - `20`: "score: Float"
  - `21`: "achievementNotes: String"
  - `22`: "selfRating: Int"
  - `23`: "createdBy: String"
  - `24`: "createdAt: DateTime"
  - `25`: "updatedAt: DateTime"
  - `26`: "client: Client"
  - `27`: "creator: User"
  - `28`: "owner: User"
  - `29`: "parent: Goal"
  - `30`: "children: Goal"
  - `31`: "taskLinks: TaskGoalLink"

### 📊 TaskGoalLink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "goalId: String"
  - `2`: "dailyTaskId: String"
  - `3`: "workEntryId: String"
  - `4`: "contributionWeight: Float"
  - `5`: "notes: String"
  - `6`: "createdAt: DateTime"
  - `7`: "dailyTask: DailyTask"
  - `8`: "goal: Goal"
  - `9`: "workEntry: WorkEntry"

### 📊 BudgetAlert *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "scope: String"
  - `2`: "clientId: String"
  - `3`: "department: String"
  - `4`: "budgetAmount: Float"
  - `5`: "currency: String"
  - `6`: "period: String"
  - `7`: "periodStart: DateTime"
  - `8`: "periodEnd: DateTime"
  - `9`: "warningThreshold: Float"
  - `10`: "criticalThreshold: Float"
  - `11`: "spentAmount: Float"
  - `12`: "spentPercentage: Float"
  - `13`: "alertLevel: String"
  - `14`: "lastAlertSent: DateTime"
  - `15`: "alertsEnabled: Boolean"
  - `16`: "pauseOnCritical: Boolean"
  - `17`: "isPaused: Boolean"
  - `18`: "pausedAt: DateTime"
  - `19`: "pausedBy: String"
  - `20`: "notifyUsers: String"
  - `21`: "notifyOnWarning: Boolean"
  - `22`: "notifyOnCritical: Boolean"
  - `23`: "createdBy: String"
  - `24`: "createdAt: DateTime"
  - `25`: "updatedAt: DateTime"
  - `26`: "client: Client"
  - `27`: "creator: User"

### 📊 ClientOAuthConnection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "accessToken: String"
  - `4`: "refreshToken: String"
  - `5`: "tokenType: String"
  - `6`: "expiresAt: DateTime"
  - `7`: "scopes: String"
  - `8`: "status: String"
  - `9`: "lastError: String"
  - `10`: "lastSyncAt: DateTime"
  - `11`: "lastSyncStatus: String"
  - `12`: "connectedBy: String"
  - `13`: "connectedAt: DateTime"
  - `14`: "platformUserId: String"
  - `15`: "platformEmail: String"
  - `16`: "agencyAccessGranted: Boolean"
  - `17`: "agencyAccessVerifiedAt: DateTime"
  - `18`: "delegatedToEmail: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"
  - `22`: "accounts: PlatformAccount"

### 📊 PlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "connectionId: String"
  - `2`: "platform: String"
  - `3`: "accountId: String"
  - `4`: "accountName: String"
  - `5`: "accountType: String"
  - `6`: "metadata: String"
  - `7`: "isActive: Boolean"
  - `8`: "isPrimary: Boolean"
  - `9`: "lastSyncAt: DateTime"
  - `10`: "lastSyncStatus: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "connection: ClientOAuthConnection"
  - `14`: "metrics: PlatformMetric"

### 📊 PlatformMetric *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "date: DateTime"
  - `3`: "periodType: String"
  - `4`: "metricType: String"
  - `5`: "metricValue: Float"
  - `6`: "metricUnit: String"
  - `7`: "previousValue: Float"
  - `8`: "changePercent: Float"
  - `9`: "dimension: String"
  - `10`: "dimensionValue: String"
  - `11`: "rawData: String"
  - `12`: "createdAt: DateTime"
  - `13`: "account: PlatformAccount"

### 📊 PlatformSyncJob *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "connectionId: String"
  - `2`: "accountId: String"
  - `3`: "platform: String"
  - `4`: "syncType: String"
  - `5`: "status: String"
  - `6`: "startedAt: DateTime"
  - `7`: "completedAt: DateTime"
  - `8`: "recordsProcessed: Int"
  - `9`: "recordsFailed: Int"
  - `10`: "errorMessage: String"
  - `11`: "errorDetails: String"
  - `12`: "createdAt: DateTime"

### 📊 MagicLinkToken *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "channel: String"
  - `4`: "expiresAt: DateTime"
  - `5`: "usedAt: DateTime"
  - `6`: "createdAt: DateTime"
  - `7`: "user: User"

### 📊 PasswordResetToken *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "channel: String"
  - `4`: "purpose: String"
  - `5`: "expiresAt: DateTime"
  - `6`: "usedAt: DateTime"
  - `7`: "createdAt: DateTime"
  - `8`: "user: User"

### 📊 AgencyApiCredential *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "provider: String"
  - `2`: "credentialType: String"
  - `3`: "name: String"
  - `4`: "credentials: String"
  - `5`: "status: String"
  - `6`: "environment: String"
  - `7`: "lastVerifiedAt: DateTime"
  - `8`: "lastVerifiedBy: String"
  - `9`: "lastError: String"
  - `10`: "usageCount: Int"
  - `11`: "lastUsedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "createdBy: String"
  - `14`: "updatedAt: DateTime"
  - `15`: "updatedBy: String"
  - `16`: "auditLogs: ApiCredentialAuditLog"

### 📊 AgencyServiceAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "platform: String"
  - `2`: "serviceType: String"
  - `3`: "email: String"
  - `4`: "name: String"
  - `5`: "description: String"
  - `6`: "isActive: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"

### 📊 OAuthAccessRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "serviceType: String"
  - `4`: "targetEmail: String"
  - `5`: "status: String"
  - `6`: "instructionsSentAt: DateTime"
  - `7`: "accessVerifiedAt: DateTime"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"

### 📊 ApiCredentialAuditLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "credentialId: String"
  - `2`: "action: String"
  - `3`: "fieldChanged: String"
  - `4`: "userId: String"
  - `5`: "userIp: String"
  - `6`: "success: Boolean"
  - `7`: "errorMessage: String"
  - `8`: "createdAt: DateTime"
  - `9`: "credential: AgencyApiCredential"

### 📊 ClientPlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "accountId: String"
  - `4`: "accountName: String"
  - `5`: "accessType: String"
  - `6`: "isActive: Boolean"
  - `7`: "lastSyncAt: DateTime"
  - `8`: "lastSyncStatus: String"
  - `9`: "syncError: String"
  - `10`: "metadata: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "createdBy: String"
  - `14`: "client: Client"
  - `15`: "metrics: PlatformMetricEntry"

### 📊 PlatformMetricEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "date: DateTime"
  - `3`: "metricType: String"
  - `4`: "value: Float"
  - `5`: "dimension: String"
  - `6`: "dimensionValue: String"
  - `7`: "importSource: String"
  - `8`: "importBatchId: String"
  - `9`: "createdAt: DateTime"
  - `10`: "createdBy: String"
  - `11`: "account: ClientPlatformAccount"

### 📊 DataImportBatch *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "accountId: String"
  - `4`: "importType: String"
  - `5`: "fileName: String"
  - `6`: "totalRows: Int"
  - `7`: "successRows: Int"
  - `8`: "failedRows: Int"
  - `9`: "errorLog: String"
  - `10`: "status: String"
  - `11`: "createdAt: DateTime"
  - `12`: "createdBy: String"
  - `13`: "completedAt: DateTime"
  - `14`: "client: Client"

### 📊 ClientUserInvitation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "email: String"
  - `3`: "name: String"
  - `4`: "role: String"
  - `5`: "token: String"
  - `6`: "expiresAt: DateTime"
  - `7`: "acceptedAt: DateTime"
  - `8`: "invitedById: String"
  - `9`: "status: String"
  - `10`: "createdAt: DateTime"
  - `11`: "client: Client"
  - `12`: "invitedBy: ClientUser"

### 📊 ClientUserActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientUserId: String"
  - `2`: "action: String"
  - `3`: "resource: String"
  - `4`: "resourceType: String"
  - `5`: "details: String"
  - `6`: "ipAddress: String"
  - `7`: "userAgent: String"
  - `8`: "createdAt: DateTime"
  - `9`: "clientUser: ClientUser"

### 📊 PortalNotification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "clientUserId: String"
  - `3`: "title: String"
  - `4`: "message: String"
  - `5`: "type: String"
  - `6`: "category: String"
  - `7`: "actionUrl: String"
  - `8`: "actionLabel: String"
  - `9`: "isRead: Boolean"
  - `10`: "readAt: DateTime"
  - `11`: "sourceType: String"
  - `12`: "sourceId: String"
  - `13`: "expiresAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "client: Client"
  - `16`: "clientUser: ClientUser"

### 📊 ClientDocument *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "description: String"
  - `4`: "category: String"
  - `5`: "fileUrl: String"
  - `6`: "fileType: String"
  - `7`: "fileSize: Int"
  - `8`: "version: Int"
  - `9`: "previousVersionId: String"
  - `10`: "uploadedById: String"
  - `11`: "uploadedByStaff: String"
  - `12`: "isPublic: Boolean"
  - `13`: "allowDownload: Boolean"
  - `14`: "sharedWith: String"
  - `15`: "expiresAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"
  - `19`: "uploadedBy: ClientUser"

### 📊 ClientAnnouncement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "content: String"
  - `3`: "type: String"
  - `4`: "priority: String"
  - `5`: "targetAll: Boolean"
  - `6`: "clientId: String"
  - `7`: "targetTiers: String"
  - `8`: "isPinned: Boolean"
  - `9`: "imageUrl: String"
  - `10`: "actionUrl: String"
  - `11`: "actionLabel: String"
  - `12`: "publishAt: DateTime"
  - `13`: "expiresAt: DateTime"
  - `14`: "createdById: String"
  - `15`: "isActive: Boolean"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 ClientGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "description: String"
  - `4`: "category: String"
  - `5`: "metricType: String"
  - `6`: "targetValue: Float"
  - `7`: "currentValue: Float"
  - `8`: "unit: String"
  - `9`: "periodType: String"
  - `10`: "startDate: DateTime"
  - `11`: "endDate: DateTime"
  - `12`: "status: String"
  - `13`: "achievedAt: DateTime"
  - `14`: "isVisible: Boolean"
  - `15`: "displayOrder: Int"
  - `16`: "color: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "client: Client"

### 📊 ContentApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "specifications: String"
  - `6`: "contentUrl: String"
  - `7`: "previewUrl: String"
  - `8`: "attachments: String"
  - `9`: "status: String"
  - `10`: "priority: String"
  - `11`: "dueDate: DateTime"
  - `12`: "reviewedById: String"
  - `13`: "reviewedAt: DateTime"
  - `14`: "reviewNote: String"
  - `15`: "revisionCount: Int"
  - `16`: "revisionNotes: String"
  - `17`: "createdById: String"
  - `18`: "reminderSent: Boolean"
  - `19`: "reminderSentAt: DateTime"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "createdBy: User"
  - `24`: "reviewedBy: ClientUser"

### 📊 ClientAccessRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "requestedById: String"
  - `3`: "requestedRole: String"
  - `4`: "purpose: String"
  - `5`: "status: String"
  - `6`: "approvedById: String"
  - `7`: "approvedAt: DateTime"
  - `8`: "rejectionReason: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "approvedBy: User"
  - `12`: "client: Client"
  - `13`: "requestedBy: User"

### 📊 WebProjectPhase *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "phase: String"
  - `3`: "status: String"
  - `4`: "assignedTo: String"
  - `5`: "startedAt: DateTime"
  - `6`: "completedAt: DateTime"
  - `7`: "notes: String"
  - `8`: "proofUrl: String"
  - `9`: "order: Int"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "user: User"
  - `13`: "client: Client"

### 📊 MaintenanceContract *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "startDate: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "renewalDate: DateTime"
  - `6`: "amount: Float"
  - `7`: "status: String"
  - `8`: "autoRenew: Boolean"
  - `9`: "reminderSent: Boolean"
  - `10`: "notes: String"
  - `11`: "domainName: String"
  - `12`: "domainRegistrar: String"
  - `13`: "domainExpiryDate: DateTime"
  - `14`: "serverProvider: String"
  - `15`: "serverExpiryDate: DateTime"
  - `16`: "serverPlan: String"
  - `17`: "billingCycle: String"
  - `18`: "nextBillingDate: DateTime"
  - `19`: "allocatedHours: Float"
  - `20`: "usedHours: Float"
  - `21`: "hourlyRateAfter: Float"
  - `22`: "expiryReminderSent: Boolean"
  - `23`: "reminderSentAt: DateTime"
  - `24`: "createdAt: DateTime"
  - `25`: "updatedAt: DateTime"
  - `26`: "client: Client"
  - `27`: "maintenanceLogs: MaintenanceLog"

### 📊 ServiceChangeRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "proposalId: String"
  - `2`: "clientId: String"
  - `3`: "type: String"
  - `4`: "serviceId: String"
  - `5`: "serviceName: String"
  - `6`: "reason: String"
  - `7`: "status: String"
  - `8`: "reviewedAt: DateTime"
  - `9`: "reviewedBy: String"
  - `10`: "managerNotes: String"
  - `11`: "priceImpact: Float"
  - `12`: "effectiveFrom: DateTime"
  - `13`: "annexureNumber: String"
  - `14`: "annexureData: String"
  - `15`: "requestedAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 ServiceTermination *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "requestedBy: String"
  - `3`: "requestedAt: DateTime"
  - `4`: "reason: String"
  - `5`: "feedback: String"
  - `6`: "noticeStartDate: DateTime"
  - `7`: "noticeEndDate: DateTime"
  - `8`: "lastServiceDate: DateTime"
  - `9`: "monthlyFee: Float"
  - `10`: "daysInMonth: Int"
  - `11`: "daysServed: Int"
  - `12`: "proRataAmount: Float"
  - `13`: "proRataBreakdown: String"
  - `14`: "pendingDues: Float"
  - `15`: "totalDue: Float"
  - `16`: "amountPaid: Float"
  - `17`: "paymentCleared: Boolean"
  - `18`: "paymentClearedAt: DateTime"
  - `19`: "handoverCallScheduled: Boolean"
  - `20`: "handoverCallDate: DateTime"
  - `21`: "handoverCallCompleted: Boolean"
  - `22`: "handoverCallNotes: String"
  - `23`: "handoverMeetingId: String"
  - `24`: "dataExportEnabled: Boolean"
  - `25`: "dataExportedAt: DateTime"
  - `26`: "dataExportUrl: String"
  - `27`: "status: String"
  - `28`: "completedAt: DateTime"
  - `29`: "cancelledAt: DateTime"
  - `30`: "cancelledReason: String"
  - `31`: "processedBy: String"
  - `32`: "processedAt: DateTime"
  - `33`: "adminNotes: String"
  - `34`: "createdAt: DateTime"
  - `35`: "updatedAt: DateTime"
  - `36`: "client: Client"

### 📊 WebsiteSitemap *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "pageName: String"
  - `3`: "pageSlug: String"
  - `4`: "pageUrl: String"
  - `5`: "pageType: String"
  - `6`: "description: String"
  - `7`: "status: String"
  - `8`: "order: Int"
  - `9`: "wireframeUrl: String"
  - `10`: "designUrl: String"
  - `11`: "previewUrl: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "feedback: PageFeedback"
  - `15`: "client: Client"

### 📊 PageFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sitemapId: String"
  - `2`: "clientUserId: String"
  - `3`: "userId: String"
  - `4`: "feedbackType: String"
  - `5`: "message: String"
  - `6`: "screenshotUrl: String"
  - `7`: "status: String"
  - `8`: "parentId: String"
  - `9`: "createdAt: DateTime"
  - `10`: "resolvedAt: DateTime"
  - `11`: "clientUser: ClientUser"
  - `12`: "parent: PageFeedback"
  - `13`: "replies: PageFeedback"
  - `14`: "sitemap: WebsiteSitemap"
  - `15`: "user: User"

### 📊 WebOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "clientId: String"
  - `3`: "status: String"
  - `4`: "businessName: String"
  - `5`: "businessDescription: String"
  - `6`: "industry: String"
  - `7`: "targetAudience: String"
  - `8`: "websiteType: String"
  - `9`: "requiredPages: String"
  - `10`: "features: String"
  - `11`: "colorPreferences: String"
  - `12`: "stylePreference: String"
  - `13`: "referenceUrls: String"
  - `14`: "hasLogo: Boolean"
  - `15`: "hasContent: Boolean"
  - `16`: "logoUrl: String"
  - `17`: "brandGuideUrl: String"
  - `18`: "hasDomain: Boolean"
  - `19`: "domainName: String"
  - `20`: "hasHosting: Boolean"
  - `21`: "hostingProvider: String"
  - `22`: "contactName: String"
  - `23`: "contactEmail: String"
  - `24`: "contactPhone: String"
  - `25`: "submittedAt: DateTime"
  - `26`: "reviewedBy: String"
  - `27`: "convertedAt: DateTime"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "client: Client"

### 📊 Domain 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "domainName: String"
  - `3`: "registrar: String"
  - `4`: "registrationDate: DateTime"
  - `5`: "expiryDate: DateTime"
  - `6`: "autoRenew: Boolean"
  - `7`: "nameservers: String"
  - `8`: "dnsProvider: String"
  - `9`: "sslStatus: String"
  - `10`: "sslExpiryDate: DateTime"
  - `11`: "sslProvider: String"
  - `12`: "purchasedBy: String"
  - `13`: "annualCost: Float"
  - `14`: "loginUrl: String"
  - `15`: "notes: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 HostingAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "provider: String"
  - `3`: "planType: String"
  - `4`: "planName: String"
  - `5`: "serverLocation: String"
  - `6`: "monthlyCost: Float"
  - `7`: "renewalDate: DateTime"
  - `8`: "storageGB: Float"
  - `9`: "bandwidthGB: Float"
  - `10`: "ipAddress: String"
  - `11`: "cpanelUrl: String"
  - `12`: "sshAccess: Boolean"
  - `13`: "sshHost: String"
  - `14`: "sshPort: Int"
  - `15`: "purchasedBy: String"
  - `16`: "status: String"
  - `17`: "loginUrl: String"
  - `18`: "notes: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"

### 📊 MaintenanceLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "contractId: String"
  - `2`: "date: DateTime"
  - `3`: "hoursSpent: Float"
  - `4`: "description: String"
  - `5`: "performedById: String"
  - `6`: "category: String"
  - `7`: "billable: Boolean"
  - `8`: "ticketId: String"
  - `9`: "attachments: String"
  - `10`: "clientVisible: Boolean"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "contract: MaintenanceContract"

### 📊 WebReimbursement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "description: String"
  - `4`: "vendor: String"
  - `5`: "amount: Float"
  - `6`: "currency: String"
  - `7`: "paidById: String"
  - `8`: "paidDate: DateTime"
  - `9`: "receiptUrl: String"
  - `10`: "invoiceUrl: String"
  - `11`: "status: String"
  - `12`: "approvedById: String"
  - `13`: "approvedAt: DateTime"
  - `14`: "rejectionReason: String"
  - `15`: "reimbursedDate: DateTime"
  - `16`: "billedToClient: Boolean"
  - `17`: "clientInvoiceId: String"
  - `18`: "notes: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"

### 📊 UpsellOpportunity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "estimatedValue: Float"
  - `6`: "probability: Int"
  - `7`: "status: String"
  - `8`: "assignedToId: String"
  - `9`: "source: String"
  - `10`: "triggerReason: String"
  - `11`: "pitchedDate: DateTime"
  - `12`: "pitchNotes: String"
  - `13`: "followUpDate: DateTime"
  - `14`: "wonDate: DateTime"
  - `15`: "lostDate: DateTime"
  - `16`: "lostReason: String"
  - `17`: "wonValue: Float"
  - `18`: "notes: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"

### 📊 WebProject *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "description: String"
  - `4`: "projectType: String"
  - `5`: "status: String"
  - `6`: "priority: String"
  - `7`: "startDate: DateTime"
  - `8`: "targetEndDate: DateTime"
  - `9`: "actualEndDate: DateTime"
  - `10`: "quotedAmount: Float"
  - `11`: "finalAmount: Float"
  - `12`: "estimatedHours: Float"
  - `13`: "actualHours: Float"
  - `14`: "profitMargin: Float"
  - `15`: "platform: String"
  - `16`: "techStack: String"
  - `17`: "stagingUrl: String"
  - `18`: "productionUrl: String"
  - `19`: "repositoryUrl: String"
  - `20`: "figmaUrl: String"
  - `21`: "projectManagerId: String"
  - `22`: "leadDeveloperId: String"
  - `23`: "leadDesignerId: String"
  - `24`: "currentPhase: String"
  - `25`: "phaseProgress: String"
  - `26`: "notes: String"
  - `27`: "createdAt: DateTime"
  - `28`: "updatedAt: DateTime"
  - `29`: "bugReports: WebBugReport"
  - `30`: "changeRequests: WebChangeRequest"
  - `31`: "designApprovals: WebDesignApproval"
  - `32`: "client: Client"
  - `33`: "phases: WebProjectPhaseItem"
  - `34`: "timeEntries: WebProjectTimeEntry"

### 📊 WebProjectPhaseItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "phase: String"
  - `3`: "status: String"
  - `4`: "order: Int"
  - `5`: "assignedToId: String"
  - `6`: "startedAt: DateTime"
  - `7`: "completedAt: DateTime"
  - `8`: "approvedAt: DateTime"
  - `9`: "approvedById: String"
  - `10`: "checklist: String"
  - `11`: "requiresApproval: Boolean"
  - `12`: "approvalNotes: String"
  - `13`: "revisionCount: Int"
  - `14`: "deliverableUrls: String"
  - `15`: "notes: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "project: WebProject"

### 📊 WebBugReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "clientUserId: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "pageUrl: String"
  - `6`: "screenshotUrl: String"
  - `7`: "browserInfo: String"
  - `8`: "priority: String"
  - `9`: "status: String"
  - `10`: "assignedToId: String"
  - `11`: "resolvedAt: DateTime"
  - `12`: "resolvedById: String"
  - `13`: "resolution: String"
  - `14`: "fixedInVersion: String"
  - `15`: "estimatedHours: Float"
  - `16`: "actualHours: Float"
  - `17`: "isBillable: Boolean"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "User_WebBugReport_assignedToIdToUser: User"
  - `21`: "project: WebProject"
  - `22`: "User_WebBugReport_resolvedByIdToUser: User"

### 📊 WebChangeRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "clientUserId: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "type: String"
  - `6`: "pageUrl: String"
  - `7`: "screenshotUrl: String"
  - `8`: "estimatedHours: Float"
  - `9`: "estimatedCost: Float"
  - `10`: "requiresApproval: Boolean"
  - `11`: "status: String"
  - `12`: "clientApprovedAt: DateTime"
  - `13`: "rejectionReason: String"
  - `14`: "assignedToId: String"
  - `15`: "completedAt: DateTime"
  - `16`: "completedById: String"
  - `17`: "actualHours: Float"
  - `18`: "actualCost: Float"
  - `19`: "isBillable: Boolean"
  - `20`: "invoiced: Boolean"
  - `21`: "invoiceId: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"
  - `24`: "User_WebChangeRequest_assignedToIdToUser: User"
  - `25`: "User_WebChangeRequest_completedByIdToUser: User"
  - `26`: "project: WebProject"

### 📊 WebDesignApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "designUrl: String"
  - `5`: "thumbnailUrl: String"
  - `6`: "phase: String"
  - `7`: "version: Int"
  - `8`: "status: String"
  - `9`: "clientUserId: String"
  - `10`: "reviewedAt: DateTime"
  - `11`: "clientFeedback: String"
  - `12`: "feedbackPins: String"
  - `13`: "designerId: String"
  - `14`: "internalNotes: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "project: WebProject"

### 📊 WebProjectTimeEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "userId: String"
  - `3`: "date: DateTime"
  - `4`: "hours: Float"
  - `5`: "description: String"
  - `6`: "phase: String"
  - `7`: "category: String"
  - `8`: "isBillable: Boolean"
  - `9`: "invoiced: Boolean"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "project: WebProject"

### 📊 DailyMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "date: DateTime"
  - `3`: "checkInTime: DateTime"
  - `4`: "yesterdayWork: String"
  - `5`: "yesterdayBlockers: String"
  - `6`: "todayPlan: String"
  - `7`: "todayClients: String"
  - `8`: "estimatedHours: Float"
  - `9`: "workload: String"
  - `10`: "mood: String"
  - `11`: "needsHelp: Boolean"
  - `12`: "helpDescription: String"
  - `13`: "workLocation: String"
  - `14`: "isLate: Boolean"
  - `15`: "autoMarked: Boolean"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "user: User"

### 📊 MeetingCompliance *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "dailyMeetingsExpected: Int"
  - `4`: "dailyMeetingsFilled: Int"
  - `5`: "dailyMeetingsLate: Int"
  - `6`: "dailyMeetingsMissed: Int"
  - `7`: "autoMarkedLeaves: Int"
  - `8`: "tacticalFilled: Boolean"
  - `9`: "tacticalFilledAt: DateTime"
  - `10`: "tacticalIsLate: Boolean"
  - `11`: "strategicFilled: Boolean"
  - `12`: "strategicFilledAt: DateTime"
  - `13`: "strategicIsLate: Boolean"
  - `14`: "complianceScore: Float"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "user: User"

### 📊 AIExtractionSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "targetType: String"
  - `3`: "targetId: String"
  - `4`: "clientId: String"
  - `5`: "messages: String"
  - `6`: "extractedData: String"
  - `7`: "confidence: Float"
  - `8`: "status: String"
  - `9`: "completedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "client: Client"
  - `13`: "user: User"

### 📊 SystemSetting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "key: String"
  - `2`: "value: String"
  - `3`: "category: String"
  - `4`: "description: String"
  - `5`: "updatedBy: String"
  - `6`: "updatedAt: DateTime"
  - `7`: "createdAt: DateTime"

### 📊 SeoKeyword *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "keyword: String"
  - `3`: "location: String"
  - `4`: "searchVolume: Int"
  - `5`: "currentRank: Int"
  - `6`: "previousRank: Int"
  - `7`: "targetPage: String"
  - `8`: "isActive: Boolean"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"
  - `12`: "rankHistory: SeoRankHistory"

### 📊 SeoRankHistory *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "keywordId: String"
  - `2`: "rank: Int"
  - `3`: "date: DateTime"
  - `4`: "keyword: SeoKeyword"

### 📊 SeoBacklink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "targetUrl: String"
  - `3`: "anchorText: String"
  - `4`: "backlinkSource: String"
  - `5`: "domainAuthority: Int"
  - `6`: "status: String"
  - `7`: "liveUrl: String"
  - `8`: "submittedDate: DateTime"
  - `9`: "createdById: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "client: Client"
  - `13`: "createdBy: User"

### 📊 SeoContent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "blogTopic: String"
  - `3`: "targetKeyword: String"
  - `4`: "writerId: String"
  - `5`: "status: String"
  - `6`: "wordCount: Int"
  - `7`: "publishedUrl: String"
  - `8`: "deadline: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"
  - `12`: "writer: User"

### 📊 GbpProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "profileName: String"
  - `3`: "location: String"
  - `4`: "category: String"
  - `5`: "totalReviews: Int"
  - `6`: "rating: Float"
  - `7`: "status: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "metrics: GbpMetric"
  - `11`: "posts: GbpPost"
  - `12`: "client: Client"

### 📊 GbpPost *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "profileId: String"
  - `2`: "postType: String"
  - `3`: "content: String"
  - `4`: "proofLink: String"
  - `5`: "views: Int"
  - `6`: "publishedAt: DateTime"
  - `7`: "createdAt: DateTime"
  - `8`: "profile: GbpProfile"

### 📊 GbpMetric *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "profileId: String"
  - `2`: "month: String"
  - `3`: "calls: Int"
  - `4`: "directions: Int"
  - `5`: "profileViews: Int"
  - `6`: "websiteClicks: Int"
  - `7`: "monthlyPosts: Int"
  - `8`: "createdAt: DateTime"
  - `9`: "profile: GbpProfile"

### 📊 SeoTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "taskType: String"
  - `3`: "category: String"
  - `4`: "description: String"
  - `5`: "assignedToId: String"
  - `6`: "reviewerId: String"
  - `7`: "priority: String"
  - `8`: "status: String"
  - `9`: "deadline: DateTime"
  - `10`: "completedAt: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "assignedTo: User"
  - `14`: "client: Client"
  - `15`: "reviewer: User"

### 📊 Campaign 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "platform: String"
  - `4`: "campaignType: String"
  - `5`: "objective: String"
  - `6`: "status: String"
  - `7`: "externalId: String"
  - `8`: "dailyBudget: Float"
  - `9`: "monthlyBudget: Float"
  - `10`: "totalBudget: Float"
  - `11`: "currency: String"
  - `12`: "targetAudience: String"
  - `13`: "keywords: String"
  - `14`: "placements: String"
  - `15`: "impressions: Int"
  - `16`: "clicks: Int"
  - `17`: "conversions: Int"
  - `18`: "leads: Int"
  - `19`: "spend: Float"
  - `20`: "cpc: Float"
  - `21`: "cpl: Float"
  - `22`: "ctr: Float"
  - `23`: "roas: Float"
  - `24`: "qualityScore: Float"
  - `25`: "startDate: DateTime"
  - `26`: "endDate: DateTime"
  - `27`: "assignedToId: String"
  - `28`: "createdById: String"
  - `29`: "createdAt: DateTime"
  - `30`: "updatedAt: DateTime"
  - `31`: "abTests: ABTest"
  - `32`: "adCreatives: AdCreative"
  - `33`: "adSpendRecords: AdSpend"
  - `34`: "assignedTo: User"
  - `35`: "client: Client"
  - `36`: "conversionEvents: ConversionEvent"

### 📊 AdCreative *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "name: String"
  - `4`: "type: String"
  - `5`: "platform: String"
  - `6`: "status: String"
  - `7`: "headline: String"
  - `8`: "description: String"
  - `9`: "callToAction: String"
  - `10`: "mediaUrl: String"
  - `11`: "thumbnailUrl: String"
  - `12`: "landingPageUrl: String"
  - `13`: "impressions: Int"
  - `14`: "clicks: Int"
  - `15`: "conversions: Int"
  - `16`: "ctr: Float"
  - `17`: "approvedById: String"
  - `18`: "approvedAt: DateTime"
  - `19`: "rejectionReason: String"
  - `20`: "version: Int"
  - `21`: "parentId: String"
  - `22`: "createdById: String"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"
  - `25`: "campaign: Campaign"

### 📊 AdSpend *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "date: DateTime"
  - `4`: "platform: String"
  - `5`: "amount: Float"
  - `6`: "currency: String"
  - `7`: "impressions: Int"
  - `8`: "clicks: Int"
  - `9`: "conversions: Int"
  - `10`: "leads: Int"
  - `11`: "cpc: Float"
  - `12`: "cpl: Float"
  - `13`: "ctr: Float"
  - `14`: "roas: Float"
  - `15`: "createdAt: DateTime"
  - `16`: "campaign: Campaign"

### 📊 BudgetAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "month: DateTime"
  - `3`: "platform: String"
  - `4`: "allocatedAmount: Float"
  - `5`: "spentAmount: Float"
  - `6`: "currency: String"
  - `7`: "dailyTarget: Float"
  - `8`: "pacingStatus: String"
  - `9`: "approvedById: String"
  - `10`: "approvedAt: DateTime"
  - `11`: "notes: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "client: Client"

### 📊 ABTest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "name: String"
  - `4`: "hypothesis: String"
  - `5`: "status: String"
  - `6`: "testType: String"
  - `7`: "variantA: String"
  - `8`: "variantB: String"
  - `9`: "winner: String"
  - `10`: "confidenceLevel: Float"
  - `11`: "startDate: DateTime"
  - `12`: "endDate: DateTime"
  - `13`: "conclusion: String"
  - `14`: "createdById: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "campaign: Campaign"

### 📊 ConversionEvent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "eventName: String"
  - `4`: "platform: String"
  - `5`: "source: String"
  - `6`: "leadName: String"
  - `7`: "leadEmail: String"
  - `8`: "leadPhone: String"
  - `9`: "adSpend: Float"
  - `10`: "revenue: Float"
  - `11`: "occurredAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "campaign: Campaign"

### 📊 QcReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "taskTitle: String"
  - `3`: "taskType: String"
  - `4`: "submittedById: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "reviewerId: String"
  - `7`: "reviewedAt: DateTime"
  - `8`: "status: String"
  - `9`: "feedback: String"
  - `10`: "priority: String"
  - `11`: "deadline: DateTime"
  - `12`: "completedAt: DateTime"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "client: Client"
  - `16`: "submittedBy: User"
  - `17`: "reviewer: User"

### 📊 ClientApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "deliverable: String"
  - `3`: "deliverableType: String"
  - `4`: "submittedById: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "reviewerName: String"
  - `7`: "status: String"
  - `8`: "feedback: String"
  - `9`: "dueDate: DateTime"
  - `10`: "completedAt: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "client: Client"
  - `14`: "submittedBy: User"

### 📊 YouTubeVideo *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "videoTitle: String"
  - `3`: "videoUrl: String"
  - `4`: "thumbnailUrl: String"
  - `5`: "channelName: String"
  - `6`: "views: Int"
  - `7`: "likes: Int"
  - `8`: "comments: Int"
  - `9`: "subscribers: Int"
  - `10`: "duration: String"
  - `11`: "publishedAt: DateTime"
  - `12`: "status: String"
  - `13`: "priority: String"
  - `14`: "assignedToId: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "client: Client"
  - `18`: "assignedTo: User"

### 📊 SeoReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "title: String"
  - `3`: "reportType: String"
  - `4`: "period: String"
  - `5`: "status: String"
  - `6`: "metrics: Json"
  - `7`: "publishedAt: DateTime"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "client: Client"

### 📊 DistributedLock *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "lockName: String"
  - `2`: "acquiredAt: DateTime"
  - `3`: "expiresAt: DateTime"

### 📊 User 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "empId: String"
  - `2`: "firstName: String"
  - `3`: "lastName: String"
  - `4`: "phone: String"
  - `5`: "email: String"
  - `6`: "password: String"
  - `7`: "twoFactorEnabled: Boolean"
  - `8`: "twoFactorSecret: String"
  - `9`: "twoFactorBackupCodes: String"
  - `10`: "twoFactorVerifiedAt: DateTime"
  - `11`: "role: String"
  - `12`: "department: String"
  - `13`: "employeeType: String"
  - `14`: "joiningDate: DateTime"
  - `15`: "dateOfBirth: DateTime"
  - `16`: "status: String"
  - `17`: "bloodGroup: String"
  - `18`: "address: String"
  - `19`: "languages: String"
  - `20`: "aiTools: String"
  - `21`: "education: String"
  - `22`: "healthConditions: String"
  - `23`: "capacity: Int"
  - `24`: "buddyId: String"
  - `25`: "profileCompletionStatus: String"
  - `26`: "onboardingStep: Int"
  - `27`: "hrVerifiedBy: String"
  - `28`: "hrVerifiedAt: DateTime"
  - `29`: "appraisalDate: DateTime"
  - `30`: "clientCapacity: Int"
  - `31`: "deletedAt: DateTime"
  - `32`: "createdAt: DateTime"
  - `33`: "updatedAt: DateTime"
  - `34`: "aiExtractions: AIExtractionSession"
  - `35`: "accountability: AccountabilityCharter"
  - `36`: "accountabilityScores: AccountabilityScore"
  - `37`: "achievements: Achievement"
  - `38`: "arcadeTransactions: ArcadePointTransaction"
  - `39`: "arcadeRedemptions: ArcadeRedemption"
  - `40`: "assetAssignments: AssetAssignment"
  - `41`: "attendance: Attendance"
  - `42`: "attendanceImports: AttendanceImport"
  - `43`: "budgetAlerts: BudgetAlert"
  - `44`: "assignedCampaigns: Campaign"
  - `45`: "assignedCandidates: Candidate"
  - `46`: "createdChannels: ChatChannel"
  - `47`: "channelMemberships: ChatChannelMember"
  - `48`: "sentMessages: ChatMessage"
  - `49`: "approvedAccessRequests: ClientAccessRequest"
  - `50`: "clientAccessRequests: ClientAccessRequest"
  - `51`: "contentApprovalsCreated: ContentApproval"
  - `52`: "deliverablesCreated: ClientDeliverable"
  - `53`: "deliverablesReviewed: ClientDeliverable"
  - `54`: "deliverablesSubmitted: ClientDeliverable"
  - `55`: "clientAssignments: ClientTeamMember"
  - `56`: "comments: Comment"
  - `57`: "communicationLogs: CommunicationLog"
  - `58`: "contentIdeas: ContentIdea"
  - `59`: "dailyMeetings: DailyMeeting"
  - `60`: "allocatedDailyTasks: DailyTask"
  - `61`: "reviewedDailyTasks: DailyTask"
  - `62`: "dailyTaskPlans: DailyTaskPlan"
  - `63`: "day0Assignments: Day0Task"
  - `64`: "day0Tasks: Day0Task"
  - `65`: "deviceRequests: DeviceRequest"
  - `66`: "receivedDirectMessages: DirectMessage"
  - `67`: "sentDirectMessages: DirectMessage"
  - `68`: "documents: Document"
  - `69`: "appreciationsReceived: EmployeeAppreciation"
  - `70`: "appreciationsGiven: EmployeeAppreciation"
  - `71`: "employeeClientFeedback: EmployeeClientFeedback"
  - `72`: "escalationsReceived: EmployeeEscalation"
  - `73`: "escalationsReported: EmployeeEscalation"
  - `74`: "onboardingChecklist: EmployeeOnboardingChecklist"
  - `75`: "createdEmployeeProposals: EmployeeProposal"
  - `76`: "employeeProposals: EmployeeProposal"
  - `77`: "assignedWhatsAppChats: EmployeeWhatsAppChat"
  - `78`: "brandingContentApproved: EmployerBrandingContent"
  - `79`: "brandingContentCreated: EmployerBrandingContent"
  - `80`: "activitiesApproved: EngagementActivity"
  - `81`: "activitiesOrganized: EngagementActivity"
  - `82`: "exitProcesses: ExitProcess"
  - `83`: "expensePayments: ExpensePayment"
  - `84`: "fnfSettlements: FnFSettlement"
  - `85`: "followUpReminders: FollowUpReminder"
  - `86`: "freelancerProfile: FreelancerProfile"
  - `87`: "goalsCreated: Goal"
  - `88`: "goalsOwned: Goal"
  - `89`: "ideas: Idea"
  - `90`: "ideaVotes: IdeaVote"
  - `91`: "impersonationsAsAdmin: ImpersonationSession"
  - `92`: "impersonationsAsTarget: ImpersonationSession"
  - `93`: "incentivePayouts: IncentivePayout"
  - `94`: "internProfile: InternProfile"
  - `95`: "conductedInterviews: Interview"
  - `96`: "issues: Issue"
  - `97`: "createdIssues: Issue"
  - `98`: "assignedLeads: Lead"
  - `99`: "leadActivities: LeadActivity"
  - `100`: "nurturingActions: LeadNurturingAction"
  - `101`: "learningAudits: LearningAudit"
  - `102`: "learningLogs: LearningLog"
  - `103`: "resourceComments: LearningResourceComment"
  - `104`: "learningVerifications: LearningVerification"
  - `105`: "leaveBalances: LeaveBalance"
  - `106`: "leaveRequests: LeaveRequest"
  - `107`: "likes: Like"
  - `108`: "magicLinkTokens: MagicLinkToken"
  - `109`: "managerReviewsReceived: ManagerBehaviorReview"
  - `110`: "managerReviewsConducted: ManagerBehaviorReview"
  - `111`: "meetingActionItems: MeetingActionItem"
  - `112`: "meetingCompliance: MeetingCompliance"
  - `113`: "meetings: MeetingParticipant"
  - `114`: "monthlyGrowthScores: MonthlyGrowthScore"
  - `115`: "notifications: Notification"
  - `116`: "pipManagedPlans: PIPPlan"
  - `117`: "pipPlans: PIPPlan"
  - `118`: "pageFeedback: PageFeedback"
  - `119`: "scores: PerformanceScore"
  - `120`: "posts: Post"
  - `121`: "profile: Profile"
  - `122`: "quotesCreated: Quote"
  - `123`: "rbcAccruals: RBCAccrual"
  - `124`: "rbcPayouts: RBCPayout"
  - `125`: "rbcPot: RBC_Pot"
  - `126`: "givenRecognition: Recognition"
  - `127`: "recognition: Recognition"
  - `128`: "expensesCreated: RecurringExpense"
  - `129`: "referralsReceived: ReferralBonus"
  - `130`: "referralsMade: ReferralBonus"
  - `131`: "salesDailyTasks: SalesDailyTask"
  - `132`: "salesDeals: SalesDeal"
  - `133`: "accountsHandovers: SalesHandover"
  - `134`: "salesHandovers: SalesHandover"
  - `135`: "salesMeetings: SalesMeeting"
  - `136`: "salesWhatsAppMessages: SalesWhatsAppMessage"
  - `137`: "seoBacklinksCreated: SeoBacklink"
  - `138`: "seoContentWritten: SeoContent"
  - `139`: "seoTasksAssigned: SeoTask"
  - `140`: "seoTasksReviewing: SeoTask"
  - `141`: "qcReviewsSubmitted: QcReview"
  - `142`: "qcReviewsReviewed: QcReview"
  - `143`: "approvalsSubmitted: ClientApproval"
  - `144`: "youTubeVideosAssigned: YouTubeVideo"
  - `145`: "sharedWhatsAppChats: SharedWhatsAppChat"
  - `146`: "socialMediaPageMetrics: SocialMediaPageMetrics"
  - `147`: "socialMediaPosts: SocialMediaPost"
  - `148`: "supportTickets: SupportTicket"
  - `149`: "tacticalGoals: TacticalGoal"
  - `150`: "tacticalMeetings: TacticalMeeting"
  - `151`: "assignedTasks: Task"
  - `152`: "createdTasks: Task"
  - `153`: "reviewedTasks: Task"
  - `154`: "taskComments: TaskComment"
  - `155`: "ticketActivities: TicketActivity"
  - `156`: "timeEntries: TimeEntry"
  - `157`: "buddy: User"
  - `158`: "buddies: User"
  - `159`: "certifications: UserCertification"
  - `160`: "customRoles: UserCustomRole"
  - `161`: "googleDrive: UserGoogleDrive"
  - `162`: "trainings: UserTraining"
  - `163`: "requestedTestimonials: VideoTestimonial"
  - `164`: "verifiedTestimonials: VideoTestimonial"
  - `165`: "violations: Violations"
  - `166`: "WebBugReport_WebBugReport_assignedToIdToUser: WebBugReport"
  - `167`: "WebBugReport_WebBugReport_resolvedByIdToUser: WebBugReport"
  - `168`: "WebChangeRequest_WebChangeRequest_assignedToIdToUser: WebChangeRequest"
  - `169`: "WebChangeRequest_WebChangeRequest_completedByIdToUser: WebChangeRequest"
  - `170`: "assignedWebPhases: WebProjectPhase"
  - `171`: "whatsAppAccess: WhatsAppAccess"
  - `172`: "whatsAppChatNotes: WhatsAppChatNote"
  - `173`: "workAnniversaries: WorkAnniversaryReminder"
  - `174`: "workDeliverables: WorkDeliverable"
  - `175`: "workEntries: WorkEntry"
  - `176`: "loginSessions: LoginSession"
  - `177`: "passwordResetTokens: PasswordResetToken"

### 📊 Profile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "ndaSigned: Boolean"
  - `3`: "ndaSignedAt: DateTime"
  - `4`: "biometricPunch: Boolean"
  - `5`: "razorpayLinked: Boolean"
  - `6`: "profilePicture: String"
  - `7`: "panCard: String"
  - `8`: "aadhaar: String"
  - `9`: "linkedIn: String"
  - `10`: "favoriteFood: String"
  - `11`: "parentsPhone1: String"
  - `12`: "parentsPhone2: String"
  - `13`: "livingSituation: String"
  - `14`: "distanceFromOffice: String"
  - `15`: "skills: String"
  - `16`: "bio: String"
  - `17`: "emergencyContactName: String"
  - `18`: "emergencyContactPhone: String"
  - `19`: "panCardUrl: String"
  - `20`: "aadhaarUrl: String"
  - `21`: "bankDetailsUrl: String"
  - `22`: "educationCertUrl: String"
  - `23`: "employeeHandbookAccepted: Boolean"
  - `24`: "socialMediaPolicyAccepted: Boolean"
  - `25`: "clientConfidentialityAccepted: Boolean"
  - `26`: "allPoliciesAccepted: Boolean"
  - `27`: "policiesAcceptedAt: DateTime"
  - `28`: "completionPercentage: Int"
  - `29`: "signatureData: String"
  - `30`: "signatureType: String"
  - `31`: "signedAt: DateTime"
  - `32`: "selfieImage: String"
  - `33`: "kycVerifiedAt: DateTime"
  - `34`: "allocatedDeviceType: String"
  - `35`: "allocatedDeviceId: String"
  - `36`: "personalMobileNumber: String"
  - `37`: "officialPhoneNumber: String"
  - `38`: "hasWhatsAppAccess: Boolean"
  - `39`: "deviceAllocatedAt: DateTime"
  - `40`: "user: User"

### 📊 VideoTestimonial *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "requestedById: String"
  - `2`: "clientId: String"
  - `3`: "requestedAt: DateTime"
  - `4`: "requestMessage: String"
  - `5`: "clientContactName: String"
  - `6`: "clientContactEmail: String"
  - `7`: "youtubeUrl: String"
  - `8`: "thumbnailUrl: String"
  - `9`: "title: String"
  - `10`: "description: String"
  - `11`: "duration: Int"
  - `12`: "status: String"
  - `13`: "receivedAt: DateTime"
  - `14`: "verifiedAt: DateTime"
  - `15`: "verifiedById: String"
  - `16`: "verificationNotes: String"
  - `17`: "voucherAmount: Float"
  - `18`: "voucherCode: String"
  - `19`: "rewardedAt: DateTime"
  - `20`: "badgeColor: String"
  - `21`: "isFeatured: Boolean"
  - `22`: "displayOrder: Int"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"
  - `25`: "client: Client"
  - `26`: "requestedBy: User"
  - `27`: "verifiedBy: User"

### 📊 Client 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "logoUrl: String"
  - `3`: "contactName: String"
  - `4`: "contactEmail: String"
  - `5`: "contactPhone: String"
  - `6`: "whatsapp: String"
  - `7`: "websiteUrl: String"
  - `8`: "address: String"
  - `9`: "gstNumber: String"
  - `10`: "panNumber: String"
  - `11`: "state: String"
  - `12`: "city: String"
  - `13`: "pincode: String"
  - `14`: "businessType: String"
  - `15`: "industry: String"
  - `16`: "monthlyBudget: String"
  - `17`: "monthlyFee: Float"
  - `18`: "tier: String"
  - `19`: "clientSegment: String"
  - `20`: "status: String"
  - `21`: "clientType: String"
  - `22`: "isWebTeamClient: Boolean"
  - `23`: "addedByUserId: String"
  - `24`: "webProjectStatus: String"
  - `25`: "webProjectStartDate: DateTime"
  - `26`: "webProjectEndDate: DateTime"
  - `27`: "webProjectNotes: String"
  - `28`: "websiteType: String"
  - `29`: "techStack: String"
  - `30`: "parentClientId: String"
  - `31`: "brandName: String"
  - `32`: "serviceSegment: String"
  - `33`: "billingType: String"
  - `34`: "billingAmount: Float"
  - `35`: "concernedPerson: String"
  - `36`: "concernedPersonPhone: String"
  - `37`: "isLost: Boolean"
  - `38`: "lostReason: String"
  - `39`: "stoppedServices: Boolean"
  - `40`: "upsellPotential: String"
  - `41`: "linkedClientId: String"
  - `42`: "paymentStatus: String"
  - `43`: "paymentDueDay: Int"
  - `44`: "invoiceDayOfMonth: Int"
  - `45`: "invoiceStatus: String"
  - `46`: "currentPaymentStatus: String"
  - `47`: "bankAccount: String"
  - `48`: "advanceAmount: Float"
  - `49`: "pendingAmount: Float"
  - `50`: "services: String"
  - `51`: "reminderFrequency: String"
  - `52`: "paymentTerms: String"
  - `53`: "customPaymentDays: Int"
  - `54`: "preferredContact: String"
  - `55`: "haltReminders: Boolean"
  - `56`: "accountsNotes: String"
  - `57`: "healthScore: Int"
  - `58`: "healthStatus: String"
  - `59`: "projectStatus: String"
  - `60`: "projectPriority: String"
  - `61`: "platform: String"
  - `62`: "startDate: DateTime"
  - `63`: "endDate: DateTime"
  - `64`: "progress: Int"
  - `65`: "onboardingToken: String"
  - `66`: "onboardingStatus: String"
  - `67`: "slaSigned: Boolean"
  - `68`: "slaSignedAt: DateTime"
  - `69`: "slaDocumentUrl: String"
  - `70`: "sowSigned: Boolean"
  - `71`: "sowSignedAt: DateTime"
  - `72`: "sowDocumentUrl: String"
  - `73`: "initialPaymentConfirmed: Boolean"
  - `74`: "initialPaymentDate: DateTime"
  - `75`: "lifecycleStage: String"
  - `76`: "leadId: String"
  - `77`: "entityType: String"
  - `78`: "poNumber: String"
  - `79`: "welcomeMessageSent: Boolean"
  - `80`: "onboardingFormCompleted: Boolean"
  - `81`: "accountManagerId: String"
  - `82`: "onboardingSharedBy: String"
  - `83`: "onboardingSharedAt: DateTime"
  - `84`: "proposalId: String"
  - `85`: "paymentConfirmedAt: DateTime"
  - `86`: "ledgerStartedAt: DateTime"
  - `87`: "primaryGoal: String"
  - `88`: "ndaSigned: Boolean"
  - `89`: "contractLength: String"
  - `90`: "referralSource: String"
  - `91`: "notes: String"
  - `92`: "facebookUrl: String"
  - `93`: "instagramUrl: String"
  - `94`: "linkedinUrl: String"
  - `95`: "twitterUrl: String"
  - `96`: "youtubeUrl: String"
  - `97`: "competitor1: String"
  - `98`: "competitor2: String"
  - `99`: "competitor3: String"
  - `100`: "targetAudience: String"
  - `101`: "brandAssets: String"
  - `102`: "selectedServices: String"
  - `103`: "contentTypes: String"
  - `104`: "credentials: String"
  - `105`: "terminationStatus: String"
  - `106`: "deletedAt: DateTime"
  - `107`: "createdAt: DateTime"
  - `108`: "updatedAt: DateTime"
  - `109`: "clientCode: String"
  - `110`: "aiExtractions: AIExtractionSession"
  - `111`: "accountability: AccountabilityCharter"
  - `112`: "achievements: Achievement"
  - `113`: "autoInvoiceConfig: AutoInvoiceConfig"
  - `114`: "automations: Automation"
  - `115`: "bankTransactions: BankTransaction"
  - `116`: "budgetAlerts: BudgetAlert"
  - `117`: "budgetAllocations: BudgetAllocation"
  - `118`: "campaigns: Campaign"
  - `119`: "linkedClient: Client"
  - `120`: "linkedClients: Client"
  - `121`: "parentClient: Client"
  - `122`: "subClients: Client"
  - `123`: "accessRequests: ClientAccessRequest"
  - `124`: "portalAnnouncements: ClientAnnouncement"
  - `125`: "clientCredentials: ClientCredential"
  - `126`: "deliverables: ClientDeliverable"
  - `127`: "portalDocuments: ClientDocument"
  - `128`: "clientFeedback: ClientFeedback"
  - `129`: "portalGoals: ClientGoal"
  - `130`: "ledgerEntries: ClientLedger"
  - `131`: "lifecycleEvents: ClientLifecycleEvent"
  - `132`: "oauthConnections: ClientOAuthConnection"
  - `133`: "clientOnboardingChecklist: ClientOnboardingChecklist"
  - `134`: "operationsLogs: ClientOperationsLog"
  - `135`: "platformAccounts: ClientPlatformAccount"
  - `136`: "clientPortalFeedback: ClientPortalFeedback"
  - `137`: "properties: ClientProperty"
  - `138`: "scopes: ClientScope"
  - `139`: "teamMembers: ClientTeamMember"
  - `140`: "clientUsers: ClientUser"
  - `141`: "userInvitations: ClientUserInvitation"
  - `142`: "whatsAppGroups: ClientWhatsAppGroup"
  - `143`: "communicationLogs: CommunicationLog"
  - `144`: "communicationSchedules: CommunicationSchedule"
  - `145`: "contentApprovals: ContentApproval"
  - `146`: "contracts: Contract"
  - `147`: "dailyTasks: DailyTask"
  - `148`: "importBatches: DataImportBatch"
  - `149`: "documents: Document"
  - `150`: "domains: Domain"
  - `151`: "employeeAppreciations: EmployeeAppreciation"
  - `152`: "employeeClientFeedbacks: EmployeeClientFeedback"
  - `153`: "employeeEscalations: EmployeeEscalation"
  - `154`: "expenses: Expense"
  - `155`: "expenseAllocations: ExpenseAllocation"
  - `156`: "gbpProfiles: GbpProfile"
  - `157`: "goals: Goal"
  - `158`: "hostingAccounts: HostingAccount"
  - `159`: "invoices: Invoice"
  - `160`: "leads: Lead"
  - `161`: "maintenanceContracts: MaintenanceContract"
  - `162`: "meetings: Meeting"
  - `163`: "oauthAccessRequests: OAuthAccessRequest"
  - `164`: "paymentCollections: PaymentCollection"
  - `165`: "paymentFollowUps: PaymentFollowUp"
  - `166`: "portalNotifications: PortalNotification"
  - `167`: "rfpSubmissions: RFPSubmission"
  - `168`: "reports: Report"
  - `169`: "slaDocuments: SLADocument"
  - `170`: "seoBacklinks: SeoBacklink"
  - `171`: "seoContent: SeoContent"
  - `172`: "seoKeywords: SeoKeyword"
  - `173`: "seoTasks: SeoTask"
  - `174`: "qcReviews: QcReview"
  - `175`: "clientApprovals: ClientApproval"
  - `176`: "youTubeVideos: YouTubeVideo"
  - `177`: "seoReports: SeoReport"
  - `178`: "terminations: ServiceTermination"
  - `179`: "sharedWhatsAppChats: SharedWhatsAppChat"
  - `180`: "socialMediaPageMetrics: SocialMediaPageMetrics"
  - `181`: "socialMediaPosts: SocialMediaPost"
  - `182`: "supportTickets: SupportTicket"
  - `183`: "tacticalKPIEntries: TacticalKPIEntry"
  - `184`: "tasks: Task"
  - `185`: "upsellOpportunities: UpsellOpportunity"
  - `186`: "videoTestimonials: VideoTestimonial"
  - `187`: "webOnboardings: WebOnboarding"
  - `188`: "webProjects: WebProject"
  - `189`: "webProjectPhases: WebProjectPhase"
  - `190`: "webReimbursements: WebReimbursement"
  - `191`: "sitemapPages: WebsiteSitemap"
  - `192`: "whatsAppMessages: WhatsAppMessage"
  - `193`: "workDeliverables: WorkDeliverable"
  - `194`: "workEntries: WorkEntry"
  - `195`: "clientPortal: ClientPortal"

### 📊 ClientTeamMember *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "userId: String"
  - `3`: "role: String"
  - `4`: "isPrimary: Boolean"
  - `5`: "assignedAt: DateTime"
  - `6`: "client: Client"
  - `7`: "user: User"

### 📊 ClientScope *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "category: String"
  - `3`: "item: String"
  - `4`: "quantity: Int"
  - `5`: "delivered: Int"
  - `6`: "month: DateTime"
  - `7`: "status: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "client: Client"

### 📊 ClientDeliverable *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "category: String"
  - `3`: "workItem: String"
  - `4`: "description: String"
  - `5`: "month: String"
  - `6`: "proofUrl: String"
  - `7`: "kpi: String"
  - `8`: "status: String"
  - `9`: "submittedAt: DateTime"
  - `10`: "submittedById: String"
  - `11`: "reviewedAt: DateTime"
  - `12`: "reviewedById: String"
  - `13`: "reviewNotes: String"
  - `14`: "clientVisible: Boolean"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "createdById: String"
  - `18`: "client: Client"
  - `19`: "createdBy: User"
  - `20`: "reviewedBy: User"
  - `21`: "submittedBy: User"

### 📊 Task 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "department: String"
  - `4`: "priority: String"
  - `5`: "status: String"
  - `6`: "type: String"
  - `7`: "dueDate: DateTime"
  - `8`: "startDate: DateTime"
  - `9`: "completedAt: DateTime"
  - `10`: "assigneeId: String"
  - `11`: "creatorId: String"
  - `12`: "reviewerId: String"
  - `13`: "clientId: String"
  - `14`: "qaStatus: String"
  - `15`: "qaComments: String"
  - `16`: "qaReviewedAt: DateTime"
  - `17`: "isRecurring: Boolean"
  - `18`: "recurrence: String"
  - `19`: "parentTaskId: String"
  - `20`: "attachments: String"
  - `21`: "estimatedHours: Float"
  - `22`: "actualHours: Float"
  - `23`: "timeSpent: Int"
  - `24`: "timerStartedAt: DateTime"
  - `25`: "taskOutcome: String"
  - `26`: "breakdownReason: String"
  - `27`: "proofUrl: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "subtasks: Subtask"
  - `31`: "assignee: User"
  - `32`: "client: Client"
  - `33`: "creator: User"
  - `34`: "reviewer: User"
  - `35`: "comments: TaskComment"
  - `36`: "timeEntries: TimeEntry"

### 📊 TaskComment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "userId: String"
  - `3`: "content: String"
  - `4`: "type: String"
  - `5`: "metadata: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "task: Task"
  - `9`: "user: User"

### 📊 Subtask 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "title: String"
  - `3`: "isCompleted: Boolean"
  - `4`: "completedAt: DateTime"
  - `5`: "completedBy: String"
  - `6`: "order: Int"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "task: Task"

### 📊 TimeEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "userId: String"
  - `3`: "hours: Float"
  - `4`: "description: String"
  - `5`: "date: DateTime"
  - `6`: "createdAt: DateTime"
  - `7`: "task: Task"
  - `8`: "user: User"

### 📊 Notification 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "message: String"
  - `5`: "link: String"
  - `6`: "isRead: Boolean"
  - `7`: "priority: String"
  - `8`: "createdAt: DateTime"
  - `9`: "user: User"

### 📊 Meeting 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "category: String"
  - `5`: "date: DateTime"
  - `6`: "duration: Int"
  - `7`: "location: String"
  - `8`: "clientId: String"
  - `9`: "status: String"
  - `10`: "recurrence: String"
  - `11`: "agenda: String"
  - `12`: "notes: String"
  - `13`: "actionItems: String"
  - `14`: "minutesSummary: String"
  - `15`: "noteTakerUrl: String"
  - `16`: "keyPointers: String"
  - `17`: "meetingLink: String"
  - `18`: "isOnline: Boolean"
  - `19`: "momRecorded: Boolean"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "meetingActionItems: MeetingActionItem"
  - `24`: "participants: MeetingParticipant"

### 📊 MeetingParticipant *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "userId: String"
  - `3`: "role: String"
  - `4`: "attended: Boolean"
  - `5`: "meeting: Meeting"
  - `6`: "user: User"

### 📊 SOPCategory *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "icon: String"
  - `4`: "order: Int"
  - `5`: "createdAt: DateTime"
  - `6`: "sops: SOP"

### 📊 SOP *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "categoryId: String"
  - `2`: "title: String"
  - `3`: "content: String"
  - `4`: "version: String"
  - `5`: "status: String"
  - `6`: "department: String"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "category: SOPCategory"

### 📊 Training *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "department: String"
  - `4`: "type: String"
  - `5`: "duration: Int"
  - `6`: "content: String"
  - `7`: "isRequired: Boolean"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "userTrainings: UserTraining"

### 📊 UserTraining *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "trainingId: String"
  - `3`: "progress: Int"
  - `4`: "status: String"
  - `5`: "startedAt: DateTime"
  - `6`: "completedAt: DateTime"
  - `7`: "score: Float"
  - `8`: "training: Training"
  - `9`: "user: User"

### 📊 Certification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "provider: String"
  - `4`: "validFor: Int"
  - `5`: "userCertifications: UserCertification"

### 📊 UserCertification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "certificationId: String"
  - `3`: "earnedAt: DateTime"
  - `4`: "expiresAt: DateTime"
  - `5`: "certificateUrl: String"
  - `6`: "certification: Certification"
  - `7`: "user: User"

### 📊 CommunicationTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "type: String"
  - `4`: "subject: String"
  - `5`: "content: String"
  - `6`: "variables: String"
  - `7`: "isActive: Boolean"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "schedules: CommunicationSchedule"

### 📊 CommunicationSchedule *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "templateId: String"
  - `3`: "name: String"
  - `4`: "type: String"
  - `5`: "frequency: String"
  - `6`: "dayOfWeek: Int"
  - `7`: "dayOfMonth: Int"
  - `8`: "preferredTime: String"
  - `9`: "description: String"
  - `10`: "lastSentAt: DateTime"
  - `11`: "nextDueAt: DateTime"
  - `12`: "missedCount: Int"
  - `13`: "completedCount: Int"
  - `14`: "assignedToId: String"
  - `15`: "status: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "logs: CommunicationLog"
  - `19`: "client: Client"
  - `20`: "template: CommunicationTemplate"

### 📊 CommunicationLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "userId: String"
  - `3`: "scheduleId: String"
  - `4`: "type: String"
  - `5`: "subject: String"
  - `6`: "content: String"
  - `7`: "status: String"
  - `8`: "sentAt: DateTime"
  - `9`: "outcome: String"
  - `10`: "duration: Int"
  - `11`: "actionItems: String"
  - `12`: "attachments: String"
  - `13`: "createdAt: DateTime"
  - `14`: "client: Client"
  - `15`: "schedule: CommunicationSchedule"
  - `16`: "user: User"

### 📊 Document 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "type: String"
  - `3`: "category: String"
  - `4`: "fileUrl: String"
  - `5`: "fileSize: Int"
  - `6`: "mimeType: String"
  - `7`: "clientId: String"
  - `8`: "uploadedById: String"
  - `9`: "createdAt: DateTime"
  - `10`: "client: Client"
  - `11`: "uploadedBy: User"

### 📊 Contract 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "startDate: DateTime"
  - `5`: "endDate: DateTime"
  - `6`: "renewalDate: DateTime"
  - `7`: "value: Float"
  - `8`: "status: String"
  - `9`: "terms: String"
  - `10`: "documentUrl: String"
  - `11`: "signerName: String"
  - `12`: "signerSignature: String"
  - `13`: "agencySignature: String"
  - `14`: "signedAt: DateTime"
  - `15`: "contractSubType: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 Invoice 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "invoiceNumber: String"
  - `2`: "clientId: String"
  - `3`: "amount: Float"
  - `4`: "tax: Float"
  - `5`: "total: Float"
  - `6`: "paidAmount: Float"
  - `7`: "status: String"
  - `8`: "invoiceType: String"
  - `9`: "dueDate: DateTime"
  - `10`: "paidAt: DateTime"
  - `11`: "items: String"
  - `12`: "notes: String"
  - `13`: "entityType: String"
  - `14`: "isAdvance: Boolean"
  - `15`: "currency: String"
  - `16`: "serviceMonth: DateTime"
  - `17`: "slaDocumentId: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "bankTransactions: BankTransaction"
  - `21`: "client: Client"
  - `22`: "payments: PaymentCollection"

### 📊 PaymentCollection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "invoiceId: String"
  - `3`: "grossAmount: Float"
  - `4`: "tdsDeducted: Float"
  - `5`: "tdsPercentage: Float"
  - `6`: "gstAmount: Float"
  - `7`: "netAmount: Float"
  - `8`: "collectedAt: DateTime"
  - `9`: "collectedBy: String"
  - `10`: "paymentMethod: String"
  - `11`: "transactionRef: String"
  - `12`: "bankAccountId: String"
  - `13`: "bankName: String"
  - `14`: "accountNumber: String"
  - `15`: "retainerMonth: DateTime"
  - `16`: "serviceType: String"
  - `17`: "description: String"
  - `18`: "entityType: String"
  - `19`: "currency: String"
  - `20`: "status: String"
  - `21`: "notes: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"
  - `24`: "bankTransactions: BankTransaction"
  - `25`: "client: Client"
  - `26`: "invoice: Invoice"

### 📊 PaymentFollowUp *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "date: DateTime"
  - `3`: "status: String"
  - `4`: "notes: String"
  - `5`: "nextAction: String"
  - `6`: "nextActionDate: DateTime"
  - `7`: "recordedBy: String"
  - `8`: "month: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"

### 📊 Expense 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "category: String"
  - `2`: "description: String"
  - `3`: "amount: Float"
  - `4`: "date: DateTime"
  - `5`: "vendor: String"
  - `6`: "notes: String"
  - `7`: "clientId: String"
  - `8`: "receipt: String"
  - `9`: "status: String"
  - `10`: "submittedBy: String"
  - `11`: "approvedBy: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "client: Client"

### 📊 Lead 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "companyName: String"
  - `2`: "contactName: String"
  - `3`: "contactEmail: String"
  - `4`: "contactPhone: String"
  - `5`: "source: String"
  - `6`: "value: Float"
  - `7`: "notes: String"
  - `8`: "stage: String"
  - `9`: "pipeline: String"
  - `10`: "lostReason: String"
  - `11`: "wonAt: DateTime"
  - `12`: "leadCategory: String"
  - `13`: "leadPriority: String"
  - `14`: "location: String"
  - `15`: "state: String"
  - `16`: "yearsInOperation: String"
  - `17`: "rfpToken: String"
  - `18`: "rfpStatus: String"
  - `19`: "rfpSentAt: DateTime"
  - `20`: "rfpCompletedAt: DateTime"
  - `21`: "rfpResponses: String"
  - `22`: "isHealthcare: Boolean"
  - `23`: "healthcareType: String"
  - `24`: "patientVolume: String"
  - `25`: "specialization: String"
  - `26`: "numberOfLocations: Int"
  - `27`: "primaryObjective: String"
  - `28`: "currentChallenges: String"
  - `29`: "businessType: String"
  - `30`: "pastMarketing: String"
  - `31`: "workedWithAgency: Boolean"
  - `32`: "agencyIssues: String"
  - `33`: "timeline: String"
  - `34`: "budgetRange: String"
  - `35`: "clientId: String"
  - `36`: "nextFollowUp: DateTime"
  - `37`: "lastContactedAt: DateTime"
  - `38`: "followUpNotes: String"
  - `39`: "callNotes: String"
  - `40`: "assignedToId: String"
  - `41`: "createdBy: String"
  - `42`: "deletedAt: DateTime"
  - `43`: "createdAt: DateTime"
  - `44`: "updatedAt: DateTime"
  - `45`: "dailyPlannerTasks: DailyTask"
  - `46`: "reminders: FollowUpReminder"
  - `47`: "assignedTo: User"
  - `48`: "client: Client"
  - `49`: "activities: LeadActivity"
  - `50`: "nurturingActions: LeadNurturingAction"
  - `51`: "proposals: Proposal"
  - `52`: "dailyTasks: SalesDailyTask"
  - `53`: "deals: SalesDeal"
  - `54`: "handovers: SalesHandover"
  - `55`: "meetings: SalesMeeting"
  - `56`: "whatsappMessages: SalesWhatsAppMessage"

### 📊 Proposal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "title: String"
  - `3`: "value: Float"
  - `4`: "services: String"
  - `5`: "validUntil: DateTime"
  - `6`: "status: String"
  - `7`: "documentUrl: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "lead: Lead"

### 📊 Candidate 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "email: String"
  - `3`: "phone: String"
  - `4`: "position: String"
  - `5`: "department: String"
  - `6`: "resumeUrl: String"
  - `7`: "portfolioUrl: String"
  - `8`: "linkedInUrl: String"
  - `9`: "source: String"
  - `10`: "referredBy: String"
  - `11`: "status: String"
  - `12`: "currentStage: String"
  - `13`: "assignedManagerId: String"
  - `14`: "expectedSalary: Float"
  - `15`: "offeredSalary: Float"
  - `16`: "experience: Int"
  - `17`: "noticePeriod: Int"
  - `18`: "phoneScreenNotes: String"
  - `19`: "phoneScreenRating: Int"
  - `20`: "managerFeedback: String"
  - `21`: "managerRating: Int"
  - `22`: "founderFeedback: String"
  - `23`: "founderDecision: String"
  - `24`: "interviewFeedback: String"
  - `25`: "testTaskUrl: String"
  - `26`: "testTaskScore: Float"
  - `27`: "testTaskFeedback: String"
  - `28`: "notes: String"
  - `29`: "rejectionReason: String"
  - `30`: "createdAt: DateTime"
  - `31`: "updatedAt: DateTime"
  - `32`: "assignedManager: User"
  - `33`: "assessment: CandidateAssessment"
  - `34`: "interviews: Interview"
  - `35`: "offerLetter: OfferLetter"

### 📊 CandidateAssessment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "token: String"
  - `3`: "completed: Boolean"
  - `4`: "fullName: String"
  - `5`: "email: String"
  - `6`: "phone: String"
  - `7`: "currentCity: String"
  - `8`: "dateOfBirth: String"
  - `9`: "linkedInUrl: String"
  - `10`: "portfolioUrl: String"
  - `11`: "resumeUrl: String"
  - `12`: "totalExperience: Float"
  - `13`: "currentCompany: String"
  - `14`: "currentRole: String"
  - `15`: "currentSalary: Float"
  - `16`: "expectedSalary: Float"
  - `17`: "noticePeriod: String"
  - `18`: "reasonForLeaving: String"
  - `19`: "primarySkills: String"
  - `20`: "tools: String"
  - `21`: "certifications: String"
  - `22`: "languagesKnown: String"
  - `23`: "canWorkFromOffice: Boolean"
  - `24`: "commuteDetails: String"
  - `25`: "joiningTimeline: String"
  - `26`: "readyForTrial: Boolean"
  - `27`: "trialAvailability: String"
  - `28`: "hasHealthcareExp: Boolean"
  - `29`: "healthcareDetails: String"
  - `30`: "healthcareClients: String"
  - `31`: "workSampleUrls: String"
  - `32`: "caseStudyUrl: String"
  - `33`: "githubUrl: String"
  - `34`: "whyThisRole: String"
  - `35`: "biggestAchievement: String"
  - `36`: "challengeExample: String"
  - `37`: "teamWorkStyle: String"
  - `38`: "learningApproach: String"
  - `39`: "salaryNegotiable: Boolean"
  - `40`: "availableForCalls: Boolean"
  - `41`: "preferredCallTime: String"
  - `42`: "relevanceRating: Int"
  - `43`: "strengthAreas: String"
  - `44`: "improvementAreas: String"
  - `45`: "referenceContacts: String"
  - `46`: "additionalInfo: String"
  - `47`: "questionsForUs: String"
  - `48`: "hrStatus: String"
  - `49`: "hrNotes: String"
  - `50`: "shortlistedAt: DateTime"
  - `51`: "shortlistedBy: String"
  - `52`: "interviewDate: DateTime"
  - `53`: "interviewMode: String"
  - `54`: "interviewNotes: String"
  - `55`: "interviewRating: Int"
  - `56`: "taskTitle: String"
  - `57`: "taskDescription: String"
  - `58`: "taskDeadline: DateTime"
  - `59`: "taskAssignedAt: DateTime"
  - `60`: "taskSubmissionUrl: String"
  - `61`: "taskSubmittedAt: DateTime"
  - `62`: "taskScore: Float"
  - `63`: "taskFeedback: String"
  - `64`: "finalRoundDate: DateTime"
  - `65`: "finalRoundNotes: String"
  - `66`: "finalRoundDecision: String"
  - `67`: "finalDecisionBy: String"
  - `68`: "finalDecisionAt: DateTime"
  - `69`: "offerSalary: Float"
  - `70`: "offerDate: DateTime"
  - `71`: "offerAccepted: Boolean"
  - `72`: "joiningDate: DateTime"
  - `73`: "createdAt: DateTime"
  - `74`: "updatedAt: DateTime"
  - `75`: "candidate: Candidate"

### 📊 EmployeeProposal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "candidateName: String"
  - `3`: "candidateEmail: String"
  - `4`: "candidatePhone: String"
  - `5`: "department: String"
  - `6`: "position: String"
  - `7`: "employmentType: String"
  - `8`: "offeredSalary: Float"
  - `9`: "joiningDate: DateTime"
  - `10`: "probationMonths: Int"
  - `11`: "entityType: String"
  - `12`: "confirmedName: String"
  - `13`: "dateOfBirth: DateTime"
  - `14`: "bloodGroup: String"
  - `15`: "personalPhone: String"
  - `16`: "personalEmail: String"
  - `17`: "currentAddress: String"
  - `18`: "city: String"
  - `19`: "state: String"
  - `20`: "pincode: String"
  - `21`: "parentsAddress: String"
  - `22`: "fatherPhone: String"
  - `23`: "motherPhone: String"
  - `24`: "emergencyName: String"
  - `25`: "emergencyPhone: String"
  - `26`: "emergencyRelation: String"
  - `27`: "linkedinUrl: String"
  - `28`: "languages: String"
  - `29`: "livingSituation: String"
  - `30`: "distanceFromOffice: String"
  - `31`: "favoriteFood: String"
  - `32`: "healthConditions: String"
  - `33`: "detailsConfirmedAt: DateTime"
  - `34`: "ndaAccepted: Boolean"
  - `35`: "ndaAcceptedAt: DateTime"
  - `36`: "ndaSignerName: String"
  - `37`: "ndaSignatureData: String"
  - `38`: "ndaSignatureType: String"
  - `39`: "bondAccepted: Boolean"
  - `40`: "bondAcceptedAt: DateTime"
  - `41`: "bondSignerName: String"
  - `42`: "bondSignatureData: String"
  - `43`: "bondSignatureType: String"
  - `44`: "bondDurationMonths: Int"
  - `45`: "handbookAccepted: Boolean"
  - `46`: "socialMediaPolicyAccepted: Boolean"
  - `47`: "confidentialityAccepted: Boolean"
  - `48`: "antiHarassmentAccepted: Boolean"
  - `49`: "codeOfConductAccepted: Boolean"
  - `50`: "policiesAcceptedAt: DateTime"
  - `51`: "policiesSignerName: String"
  - `52`: "policiesSignatureData: String"
  - `53`: "policiesSignatureType: String"
  - `54`: "profilePictureUrl: String"
  - `55`: "panCardUrl: String"
  - `56`: "aadhaarUrl: String"
  - `57`: "educationCertUrl: String"
  - `58`: "bankAccountName: String"
  - `59`: "bankName: String"
  - `60`: "bankAccountNumber: String"
  - `61`: "bankIfscCode: String"
  - `62`: "documentsSubmittedAt: DateTime"
  - `63`: "onboardingCompleted: Boolean"
  - `64`: "onboardingCompletedAt: DateTime"
  - `65`: "magicLinkSent: Boolean"
  - `66`: "magicLinkSentAt: DateTime"
  - `67`: "currentStep: Int"
  - `68`: "status: String"
  - `69`: "expiresAt: DateTime"
  - `70`: "viewedAt: DateTime"
  - `71`: "userId: String"
  - `72`: "createdById: String"
  - `73`: "createdAt: DateTime"
  - `74`: "updatedAt: DateTime"
  - `75`: "createdBy: User"
  - `76`: "user: User"

### 📊 LeaveRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "startDate: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "reason: String"
  - `6`: "status: String"
  - `7`: "approvedBy: String"
  - `8`: "approvedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "rejectionReason: String"
  - `11`: "user: User"

### 📊 Post 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "content: String"
  - `4`: "attachments: String"
  - `5`: "isPinned: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "comments: Comment"
  - `9`: "likes: Like"
  - `10`: "user: User"

### 📊 Comment 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "postId: String"
  - `2`: "userId: String"
  - `3`: "content: String"
  - `4`: "createdAt: DateTime"
  - `5`: "post: Post"
  - `6`: "user: User"

### 📊 Like 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "postId: String"
  - `2`: "userId: String"
  - `3`: "createdAt: DateTime"
  - `4`: "post: Post"
  - `5`: "user: User"

### 📊 Idea 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "category: String"
  - `5`: "status: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"
  - `9`: "votes: IdeaVote"

### 📊 IdeaVote *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ideaId: String"
  - `2`: "userId: String"
  - `3`: "idea: Idea"
  - `4`: "user: User"

### 📊 Recognition *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "receiverId: String"
  - `2`: "giverId: String"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "message: String"
  - `6`: "xpAwarded: Int"
  - `7`: "createdAt: DateTime"
  - `8`: "giver: User"
  - `9`: "receiver: User"

### 📊 Issue 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "severity: String"
  - `5`: "status: String"
  - `6`: "clientId: String"
  - `7`: "assigneeId: String"
  - `8`: "creatorId: String"
  - `9`: "resolution: String"
  - `10`: "resolvedAt: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "assignee: User"
  - `14`: "creator: User"

### 📊 Report 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "month: DateTime"
  - `5`: "data: String"
  - `6`: "fileUrl: String"
  - `7`: "status: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "client: Client"

### 📊 Automation 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "type: String"
  - `3`: "clientId: String"
  - `4`: "status: String"
  - `5`: "metrics: String"
  - `6`: "config: String"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "client: Client"

### 📊 AccountabilityCharter *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "unitsProduced: Float"
  - `4`: "monthYear: DateTime"
  - `5`: "client: Client"
  - `6`: "user: User"

### 📊 RBC_Pot *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "totalAccrued: Float"
  - `3`: "milestoneMultiplier: Float"
  - `4`: "isForfeited: Boolean"
  - `5`: "user: User"

### 📊 Attendance 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "date: DateTime"
  - `3`: "checkIn: DateTime"
  - `4`: "checkOut: DateTime"
  - `5`: "biometricPunch: Boolean"
  - `6`: "myZenHours: Float"
  - `7`: "huddleLate: Boolean"
  - `8`: "status: String"
  - `9`: "importBatchId: String"
  - `10`: "sourceType: String"
  - `11`: "rawSourceData: String"
  - `12`: "parseConfidence: Float"
  - `13`: "importBatch: AttendanceImport"
  - `14`: "user: User"

### 📊 AttendanceImport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "source: String"
  - `2`: "rawData: String"
  - `3`: "parsedData: String"
  - `4`: "recordCount: Int"
  - `5`: "status: String"
  - `6`: "errorMessage: String"
  - `7`: "importedBy: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "records: Attendance"
  - `11`: "importedByUser: User"

### 📊 Violations *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "description: String"
  - `3`: "fineAmount: Float"
  - `4`: "charityPaid: Boolean"
  - `5`: "date: DateTime"
  - `6`: "updatedAt: DateTime"
  - `7`: "user: User"

### 📊 PerformanceScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "score: Float"
  - `3`: "month: DateTime"
  - `4`: "department: String"
  - `5`: "rank: Int"
  - `6`: "metrics: String"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"

### 📊 DepartmentTarget *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "metric: String"
  - `3`: "target: Int"
  - `4`: "completed: Int"
  - `5`: "month: DateTime"
  - `6`: "tip: String"
  - `7`: "updatedAt: DateTime"

### 📊 CompanyNews *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "content: String"
  - `3`: "author: String"
  - `4`: "pinned: Boolean"
  - `5`: "category: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"

### 📊 Event 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "date: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "type: String"
  - `6`: "location: String"
  - `7`: "isAllDay: Boolean"
  - `8`: "createdAt: DateTime"

### 📊 Feedback 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "content: String"
  - `3`: "category: String"
  - `4`: "isAnonymous: Boolean"
  - `5`: "status: String"
  - `6`: "createdAt: DateTime"

### 📊 Quote 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "text: String"
  - `2`: "author: String"
  - `3`: "isActive: Boolean"
  - `4`: "createdAt: DateTime"
  - `5`: "updatedAt: DateTime"
  - `6`: "createdBy: String"
  - `7`: "creator: User"

### 📊 LeadActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "outcome: String"
  - `7`: "duration: Int"
  - `8`: "createdAt: DateTime"
  - `9`: "lead: Lead"
  - `10`: "user: User"

### 📊 FollowUpReminder *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "scheduledAt: DateTime"
  - `4`: "title: String"
  - `5`: "notes: String"
  - `6`: "isCompleted: Boolean"
  - `7`: "completedAt: DateTime"
  - `8`: "priority: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "lead: Lead"
  - `12`: "user: User"

### 📊 LeadNurturingAction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "actionType: String"
  - `4`: "contentTitle: String"
  - `5`: "contentUrl: String"
  - `6`: "notes: String"
  - `7`: "channel: String"
  - `8`: "response: String"
  - `9`: "createdAt: DateTime"
  - `10`: "lead: Lead"
  - `11`: "user: User"

### 📊 SalesHandover *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "salesUserId: String"
  - `3`: "accountsUserId: String"
  - `4`: "status: String"
  - `5`: "paymentTerms: String"
  - `6`: "servicesAgreed: String"
  - `7`: "specialTerms: String"
  - `8`: "proposalUrl: String"
  - `9`: "dealValue: Float"
  - `10`: "rfpSummary: String"
  - `11`: "nurturingHistory: String"
  - `12`: "keyContacts: String"
  - `13`: "notes: String"
  - `14`: "acknowledgedAt: DateTime"
  - `15`: "completedAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "accountsUser: User"
  - `19`: "lead: Lead"
  - `20`: "salesUser: User"

### 📊 SalesMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "meetingType: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "scheduledAt: DateTime"
  - `7`: "duration: Int"
  - `8`: "location: String"
  - `9`: "meetingLink: String"
  - `10`: "outcome: String"
  - `11`: "outcomeNotes: String"
  - `12`: "status: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "lead: Lead"
  - `16`: "user: User"

### 📊 SalesWhatsAppMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "messageType: String"
  - `4`: "templateId: String"
  - `5`: "content: String"
  - `6`: "recipientPhone: String"
  - `7`: "recipientName: String"
  - `8`: "status: String"
  - `9`: "sentAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "lead: Lead"
  - `12`: "user: User"

### 📊 SalesWhatsAppTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "content: String"
  - `4`: "isActive: Boolean"
  - `5`: "createdAt: DateTime"
  - `6`: "updatedAt: DateTime"

### 📊 SalesDeal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "userId: String"
  - `3`: "dealValue: Float"
  - `4`: "servicesSold: String"
  - `5`: "contractDuration: Int"
  - `6`: "startDate: DateTime"
  - `7`: "status: String"
  - `8`: "lossReason: String"
  - `9`: "billingCycle: String"
  - `10`: "paymentTerms: String"
  - `11`: "closedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "lead: Lead"
  - `15`: "user: User"

### 📊 SalesDailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "leadId: String"
  - `3`: "taskType: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "dueDate: DateTime"
  - `7`: "priority: String"
  - `8`: "status: String"
  - `9`: "completedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "lead: Lead"
  - `13`: "user: User"

### 📊 ClientLifecycleEvent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "fromStage: String"
  - `3`: "toStage: String"
  - `4`: "reason: String"
  - `5`: "notes: String"
  - `6`: "triggeredBy: String"
  - `7`: "createdAt: DateTime"
  - `8`: "client: Client"

### 📊 ClientUser *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "email: String"
  - `3`: "name: String"
  - `4`: "phone: String"
  - `5`: "role: String"
  - `6`: "isActive: Boolean"
  - `7`: "lastLoginAt: DateTime"
  - `8`: "otpCode: String"
  - `9`: "otpExpiresAt: DateTime"
  - `10`: "otpAttempts: Int"
  - `11`: "sessionToken: String"
  - `12`: "sessionExpiresAt: DateTime"
  - `13`: "passwordHash: String"
  - `14`: "emailNotifications: Boolean"
  - `15`: "whatsappNotifications: Boolean"
  - `16`: "pushNotifications: Boolean"
  - `17`: "hasMarketingAccess: Boolean"
  - `18`: "hasWebsiteAccess: Boolean"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "uploadedDocuments: ClientDocument"
  - `22`: "portalFeedback: ClientPortalFeedback"
  - `23`: "client: Client"
  - `24`: "activities: ClientUserActivity"
  - `25`: "invitedBy: ClientUserInvitation"
  - `26`: "contentApprovals: ContentApproval"
  - `27`: "pageFeedback: PageFeedback"
  - `28`: "notifications: PortalNotification"
  - `29`: "supportTickets: SupportTicket"

### 📊 ClientCredential *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "category: String"
  - `4`: "username: String"
  - `5`: "password: String"
  - `6`: "email: String"
  - `7`: "url: String"
  - `8`: "apiKey: String"
  - `9`: "notes: String"
  - `10`: "isActive: Boolean"
  - `11`: "lastUpdated: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "client: Client"

### 📊 SupportTicket *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ticketNumber: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "priority: String"
  - `6`: "status: String"
  - `7`: "clientId: String"
  - `8`: "clientUserId: String"
  - `9`: "assignedToId: String"
  - `10`: "resolvedAt: DateTime"
  - `11`: "resolution: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "assignedTo: User"
  - `15`: "client: Client"
  - `16`: "clientUser: ClientUser"
  - `17`: "activities: TicketActivity"

### 📊 TicketActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ticketId: String"
  - `2`: "userId: String"
  - `3`: "type: String"
  - `4`: "description: String"
  - `5`: "metadata: String"
  - `6`: "createdAt: DateTime"
  - `7`: "ticket: SupportTicket"
  - `8`: "user: User"

### 📊 EmployeeOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "offerLetterSigned: Boolean"
  - `3`: "offerLetterSignedAt: DateTime"
  - `4`: "idProofSubmitted: Boolean"
  - `5`: "idProofSubmittedAt: DateTime"
  - `6`: "addressProofSubmitted: Boolean"
  - `7`: "addressProofSubmittedAt: DateTime"
  - `8`: "panCardSubmitted: Boolean"
  - `9`: "panCardSubmittedAt: DateTime"
  - `10`: "bankDetailsSubmitted: Boolean"
  - `11`: "bankDetailsSubmittedAt: DateTime"
  - `12`: "educationDocsSubmitted: Boolean"
  - `13`: "educationDocsSubmittedAt: DateTime"
  - `14`: "profilePhotoSubmitted: Boolean"
  - `15`: "profilePhotoSubmittedAt: DateTime"
  - `16`: "emailCreated: Boolean"
  - `17`: "emailCreatedAt: DateTime"
  - `18`: "slackInviteSent: Boolean"
  - `19`: "slackInviteSentAt: DateTime"
  - `20`: "systemAccessGranted: Boolean"
  - `21`: "systemAccessGrantedAt: DateTime"
  - `22`: "deviceAllocated: Boolean"
  - `23`: "deviceAllocatedAt: DateTime"
  - `24`: "softwareLicensesAssigned: Boolean"
  - `25`: "softwareLicensesAt: DateTime"
  - `26`: "hrOrientationComplete: Boolean"
  - `27`: "hrOrientationAt: DateTime"
  - `28`: "policiesAcknowledged: Boolean"
  - `29`: "policiesAcknowledgedAt: DateTime"
  - `30`: "ndaSigned: Boolean"
  - `31`: "ndaSignedAt: DateTime"
  - `32`: "biometricRegistered: Boolean"
  - `33`: "biometricRegisteredAt: DateTime"
  - `34`: "buddyAssigned: Boolean"
  - `35`: "buddyAssignedAt: DateTime"
  - `36`: "teamIntroductionDone: Boolean"
  - `37`: "teamIntroductionAt: DateTime"
  - `38`: "departmentTrainingDone: Boolean"
  - `39`: "departmentTrainingAt: DateTime"
  - `40`: "firstWeekCheckIn: Boolean"
  - `41`: "firstWeekCheckInAt: DateTime"
  - `42`: "thirtyDayReview: Boolean"
  - `43`: "thirtyDayReviewAt: DateTime"
  - `44`: "completionPercentage: Int"
  - `45`: "status: String"
  - `46`: "hrNotes: String"
  - `47`: "lastUpdatedBy: String"
  - `48`: "createdAt: DateTime"
  - `49`: "updatedAt: DateTime"
  - `50`: "user: User"

### 📊 ClientOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "contractSigned: Boolean"
  - `3`: "contractSignedAt: DateTime"
  - `4`: "invoicePaid: Boolean"
  - `5`: "invoicePaidAt: DateTime"
  - `6`: "ndaSigned: Boolean"
  - `7`: "ndaSignedAt: DateTime"
  - `8`: "kickoffMeetingDone: Boolean"
  - `9`: "kickoffMeetingAt: DateTime"
  - `10`: "brandGuidelinesReceived: Boolean"
  - `11`: "brandGuidelinesAt: DateTime"
  - `12`: "websiteAccessGranted: Boolean"
  - `13`: "websiteAccessAt: DateTime"
  - `14`: "analyticsAccessGranted: Boolean"
  - `15`: "analyticsAccessAt: DateTime"
  - `16`: "socialMediaAccess: Boolean"
  - `17`: "socialMediaAccessAt: DateTime"
  - `18`: "adsAccountAccess: Boolean"
  - `19`: "adsAccountAccessAt: DateTime"
  - `20`: "trackingSetup: Boolean"
  - `21`: "trackingSetupAt: DateTime"
  - `22`: "pixelsInstalled: Boolean"
  - `23`: "pixelsInstalledAt: DateTime"
  - `24`: "crmIntegrated: Boolean"
  - `25`: "crmIntegratedAt: DateTime"
  - `26`: "reportingDashboardReady: Boolean"
  - `27`: "reportingDashboardAt: DateTime"
  - `28`: "accountManagerAssigned: Boolean"
  - `29`: "accountManagerAssignedAt: DateTime"
  - `30`: "teamIntroductionDone: Boolean"
  - `31`: "teamIntroductionAt: DateTime"
  - `32`: "communicationChannelSetup: Boolean"
  - `33`: "communicationChannelAt: DateTime"
  - `34`: "firstStrategyCallDone: Boolean"
  - `35`: "firstStrategyCallAt: DateTime"
  - `36`: "contentCalendarShared: Boolean"
  - `37`: "contentCalendarAt: DateTime"
  - `38`: "firstDeliverablesApproved: Boolean"
  - `39`: "firstDeliverablesAt: DateTime"
  - `40`: "monthlyReportingSchedule: Boolean"
  - `41`: "monthlyReportingAt: DateTime"
  - `42`: "selectedServices: String"
  - `43`: "scopeItems: String"
  - `44`: "operationsAssignedAt: DateTime"
  - `45`: "kickoffScheduledAt: DateTime"
  - `46`: "completionPercentage: Int"
  - `47`: "status: String"
  - `48`: "managerNotes: String"
  - `49`: "assignedManagerId: String"
  - `50`: "lastUpdatedBy: String"
  - `51`: "createdAt: DateTime"
  - `52`: "updatedAt: DateTime"
  - `53`: "client: Client"

### 📊 InternProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "internshipType: String"
  - `3`: "stipendAmount: Float"
  - `4`: "startDate: DateTime"
  - `5`: "expectedEndDate: DateTime"
  - `6`: "actualEndDate: DateTime"
  - `7`: "hasOwnLaptop: Boolean"
  - `8`: "deviceAssignedId: String"
  - `9`: "mentorId: String"
  - `10`: "buddyId: String"
  - `11`: "monthlyReviews: String"
  - `12`: "currentStatus: String"
  - `13`: "conversionStatus: String"
  - `14`: "exitInterviewDone: Boolean"
  - `15`: "certificateIssued: Boolean"
  - `16`: "certificateUrl: String"
  - `17`: "linkedInRecommendation: Boolean"
  - `18`: "handbookAcknowledged: Boolean"
  - `19`: "handbookAcknowledgedAt: DateTime"
  - `20`: "leavePolicy: String"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"
  - `23`: "user: User"

### 📊 FreelancerProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "contractType: String"
  - `3`: "hourlyRate: Float"
  - `4`: "projectRate: Float"
  - `5`: "retainerAmount: Float"
  - `6`: "panNumber: String"
  - `7`: "gstNumber: String"
  - `8`: "bankAccountNumber: String"
  - `9`: "bankIfscCode: String"
  - `10`: "bankName: String"
  - `11`: "upiId: String"
  - `12`: "currentStatus: String"
  - `13`: "totalEarned: Float"
  - `14`: "pendingAmount: Float"
  - `15`: "skills: String"
  - `16`: "portfolio: String"
  - `17`: "linkedIn: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "payments: FreelancerPayment"
  - `21`: "user: User"
  - `22`: "workReports: FreelancerWorkReport"

### 📊 FreelancerWorkReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "freelancerProfileId: String"
  - `2`: "periodStart: DateTime"
  - `3`: "periodEnd: DateTime"
  - `4`: "submittedAt: DateTime"
  - `5`: "projectName: String"
  - `6`: "clientId: String"
  - `7`: "description: String"
  - `8`: "hoursWorked: Float"
  - `9`: "deliverables: String"
  - `10`: "attachments: String"
  - `11`: "billableAmount: Float"
  - `12`: "status: String"
  - `13`: "reviewedBy: String"
  - `14`: "reviewedAt: DateTime"
  - `15`: "reviewNotes: String"
  - `16`: "paymentId: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "freelancerProfile: FreelancerProfile"

### 📊 FreelancerPayment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "freelancerProfileId: String"
  - `2`: "amount: Float"
  - `3`: "paymentDate: DateTime"
  - `4`: "paymentMethod: String"
  - `5`: "transactionRef: String"
  - `6`: "invoiceNumber: String"
  - `7`: "invoiceUrl: String"
  - `8`: "periodStart: DateTime"
  - `9`: "periodEnd: DateTime"
  - `10`: "status: String"
  - `11`: "processedBy: String"
  - `12`: "processedAt: DateTime"
  - `13`: "notes: String"
  - `14`: "workReportIds: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "freelancerProfile: FreelancerProfile"

### 📊 ImpersonationSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "adminId: String"
  - `2`: "targetUserId: String"
  - `3`: "startedAt: DateTime"
  - `4`: "endedAt: DateTime"
  - `5`: "reason: String"
  - `6`: "actionsPerformed: String"
  - `7`: "admin: User"
  - `8`: "targetUser: User"

### 📊 AccountabilityScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "expectedUnits: Int"
  - `4`: "deliveredUnits: Int"
  - `5`: "unitScore: Float"
  - `6`: "tacticalGoals: String"
  - `7`: "goalsAchieved: Int"
  - `8`: "totalGoals: Int"
  - `9`: "growthScore: Float"
  - `10`: "finalScore: Float"
  - `11`: "rank: Int"
  - `12`: "companyRank: Int"
  - `13`: "managerRating: Float"
  - `14`: "managerNotes: String"
  - `15`: "calculatedAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "user: User"

### 📊 LearningLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "resourceUrl: String"
  - `4`: "resourceTitle: String"
  - `5`: "topic: String"
  - `6`: "minutesWatched: Int"
  - `7`: "notes: String"
  - `8`: "createdAt: DateTime"
  - `9`: "verificationId: String"
  - `10`: "user: User"
  - `11`: "verification: LearningVerification"

### 📊 LearningVerification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "learningLogId: String"
  - `3`: "topic: String"
  - `4`: "resourceTitle: String"
  - `5`: "taskPrompt: String"
  - `6`: "taskType: String"
  - `7`: "difficulty: String"
  - `8`: "userResponse: String"
  - `9`: "submittedAt: DateTime"
  - `10`: "aiScore: Float"
  - `11`: "aiFeedback: String"
  - `12`: "evaluatedAt: DateTime"
  - `13`: "isVerified: Boolean"
  - `14`: "status: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "learningLogs: LearningLog"
  - `18`: "user: User"

### 📊 LearningAudit *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "totalEntries: Int"
  - `4`: "totalMinutes: Int"
  - `5`: "verifiedEntries: Int"
  - `6`: "averageScore: Float"
  - `7`: "aiSummary: String"
  - `8`: "aiRecommendations: String"
  - `9`: "overallVerdict: String"
  - `10`: "auditedAt: DateTime"
  - `11`: "user: User"

### 📊 WorkDeliverable *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "month: DateTime"
  - `4`: "category: String"
  - `5`: "deliverableType: String"
  - `6`: "quantity: Int"
  - `7`: "unitValue: Float"
  - `8`: "totalValue: Float"
  - `9`: "proofUrl: String"
  - `10`: "qualityScore: Int"
  - `11`: "revisionCount: Int"
  - `12`: "turnaroundHours: Float"
  - `13`: "designUrls: String"
  - `14`: "status: String"
  - `15`: "approvedBy: String"
  - `16`: "approvedAt: DateTime"
  - `17`: "notes: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "client: Client"
  - `21`: "user: User"

### 📊 DepartmentBaseline *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "baseSalary: Float"
  - `3`: "baseUnits: Int"
  - `4`: "unitType: String"
  - `5`: "unitDescription: String"
  - `6`: "scaleFactor: Float"
  - `7`: "updatedAt: DateTime"

### 📊 Achievement 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "icon: String"
  - `6`: "category: String"
  - `7`: "clientId: String"
  - `8`: "proofUrl: String"
  - `9`: "pointsAwarded: Int"
  - `10`: "incentiveValue: Float"
  - `11`: "status: String"
  - `12`: "addedBy: String"
  - `13`: "approvedBy: String"
  - `14`: "approvedAt: DateTime"
  - `15`: "earnedAt: DateTime"
  - `16`: "progress: Int"
  - `17`: "target: Int"
  - `18`: "rarity: String"
  - `19`: "month: DateTime"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "user: User"

### 📊 TacticalGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "targetValue: Float"
  - `6`: "currentValue: Float"
  - `7`: "category: String"
  - `8`: "priority: String"
  - `9`: "status: String"
  - `10`: "achievedAt: DateTime"
  - `11`: "setBy: String"
  - `12`: "reviewNotes: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "user: User"

### 📊 IncentivePayout *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "unitIncentive: Float"
  - `4`: "achievementBonus: Float"
  - `5`: "referralBonus: Float"
  - `6`: "attendanceBonus: Float"
  - `7`: "totalIncentive: Float"
  - `8`: "status: String"
  - `9`: "approvedBy: String"
  - `10`: "approvedAt: DateTime"
  - `11`: "paidAt: DateTime"
  - `12`: "deductions: Float"
  - `13`: "deductionReason: String"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "user: User"

### 📊 LearningResourceComment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "resourceId: String"
  - `2`: "userId: String"
  - `3`: "content: String"
  - `4`: "rating: Int"
  - `5`: "isHelpful: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"

### 📊 MeetingActionItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "assigneeId: String"
  - `5`: "dueDate: DateTime"
  - `6`: "priority: String"
  - `7`: "status: String"
  - `8`: "completedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "assignee: User"
  - `12`: "meeting: Meeting"

### 📊 DailyTaskPlan *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "date: DateTime"
  - `3`: "isWeeklyPlan: Boolean"
  - `4`: "status: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "submittedBeforeHuddle: Boolean"
  - `7`: "totalPlannedHours: Float"
  - `8`: "totalActualHours: Float"
  - `9`: "hasUnder4Hours: Boolean"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "tasks: DailyTask"
  - `13`: "user: User"

### 📊 DailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "planId: String"
  - `2`: "clientId: String"
  - `3`: "clientName: String"
  - `4`: "activityType: String"
  - `5`: "description: String"
  - `6`: "plannedStartTime: DateTime"
  - `7`: "plannedHours: Float"
  - `8`: "actualStartTime: DateTime"
  - `9`: "actualEndTime: DateTime"
  - `10`: "actualHours: Float"
  - `11`: "addedAt: DateTime"
  - `12`: "startedAt: DateTime"
  - `13`: "completedAt: DateTime"
  - `14`: "status: String"
  - `15`: "isBreakdown: Boolean"
  - `16`: "breakdownReason: String"
  - `17`: "priority: String"
  - `18`: "sortOrder: Int"
  - `19`: "notes: String"
  - `20`: "deliverable: String"
  - `21`: "proofUrl: String"
  - `22`: "remarks: String"
  - `23`: "clientVisible: Boolean"
  - `24`: "workEntryId: String"
  - `25`: "allocatedById: String"
  - `26`: "deadline: DateTime"
  - `27`: "rateTask: Int"
  - `28`: "company: String"
  - `29`: "reportedToManager: Boolean"
  - `30`: "reportedAt: DateTime"
  - `31`: "managerReviewed: Boolean"
  - `32`: "managerReviewedAt: DateTime"
  - `33`: "managerReviewedById: String"
  - `34`: "managerRating: Int"
  - `35`: "managerFeedback: String"
  - `36`: "clientCommunicated: Boolean"
  - `37`: "communicatedAt: DateTime"
  - `38`: "communicatedVia: String"
  - `39`: "communicationMessage: String"
  - `40`: "isBreakthrough: Boolean"
  - `41`: "leadId: String"
  - `42`: "departmentTarget: String"
  - `43`: "employeeTargetId: String"
  - `44`: "candidateTargetId: String"
  - `45`: "accountsTaskType: String"
  - `46`: "complianceType: String"
  - `47`: "paymentReceivedDate: DateTime"
  - `48`: "invoiceNotifiedAt: DateTime"
  - `49`: "createdAt: DateTime"
  - `50`: "updatedAt: DateTime"
  - `51`: "allocatedBy: User"
  - `52`: "client: Client"
  - `53`: "lead: Lead"
  - `54`: "managerReviewedBy: User"
  - `55`: "plan: DailyTaskPlan"
  - `56`: "goalLinks: TaskGoalLink"

### 📊 ArcadePointTransaction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "points: Int"
  - `4`: "reason: String"
  - `5`: "category: String"
  - `6`: "month: DateTime"
  - `7`: "metadata: String"
  - `8`: "createdAt: DateTime"
  - `9`: "user: User"

### 📊 ArcadeReward *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "pointsCost: Int"
  - `4`: "category: String"
  - `5`: "stock: Int"
  - `6`: "imageUrl: String"
  - `7`: "isActive: Boolean"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "redemptions: ArcadeRedemption"

### 📊 ArcadeRedemption *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "rewardId: String"
  - `3`: "pointsSpent: Int"
  - `4`: "status: String"
  - `5`: "fulfilledAt: DateTime"
  - `6`: "notes: String"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "reward: ArcadeReward"
  - `10`: "user: User"

### 📊 LeaveBalance *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "year: Int"
  - `3`: "type: String"
  - `4`: "total: Float"
  - `5`: "used: Float"
  - `6`: "remaining: Float"
  - `7`: "carryForward: Float"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "user: User"

### 📊 RBCAccrual *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "rbcPotId: String"
  - `3`: "month: DateTime"
  - `4`: "amount: Float"
  - `5`: "reason: String"
  - `6`: "status: String"
  - `7`: "createdAt: DateTime"
  - `8`: "user: User"

### 📊 RBCPayout *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "rbcPotId: String"
  - `3`: "amount: Float"
  - `4`: "vestingMonth: DateTime"
  - `5`: "paidAt: DateTime"
  - `6`: "status: String"
  - `7`: "multiplier: Float"
  - `8`: "createdAt: DateTime"
  - `9`: "user: User"

### 📊 PIPPlan *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "managerId: String"
  - `3`: "startDate: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "reason: String"
  - `6`: "status: String"
  - `7`: "finalOutcome: String"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "milestones: PIPMilestone"
  - `12`: "manager: User"
  - `13`: "user: User"

### 📊 PIPMilestone *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "pipPlanId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "dayMark: Int"
  - `5`: "targetDate: DateTime"
  - `6`: "status: String"
  - `7`: "reviewNotes: String"
  - `8`: "reviewedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "pipPlan: PIPPlan"

### 📊 Asset *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "assetTag: String"
  - `2`: "name: String"
  - `3`: "type: String"
  - `4`: "brand: String"
  - `5`: "model: String"
  - `6`: "serialNumber: String"
  - `7`: "purchaseDate: DateTime"
  - `8`: "purchasePrice: Float"
  - `9`: "warrantyEnd: DateTime"
  - `10`: "condition: String"
  - `11`: "status: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "assignments: AssetAssignment"

### 📊 AssetAssignment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "assetId: String"
  - `2`: "userId: String"
  - `3`: "assignedAt: DateTime"
  - `4`: "returnedAt: DateTime"
  - `5`: "conditionOnAssign: String"
  - `6`: "conditionOnReturn: String"
  - `7`: "notes: String"
  - `8`: "createdAt: DateTime"
  - `9`: "asset: Asset"
  - `10`: "user: User"

### 📊 ExitProcess *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "type: String"
  - `3`: "noticeDate: DateTime"
  - `4`: "lastWorkingDate: DateTime"
  - `5`: "exitDate: DateTime"
  - `6`: "reason: String"
  - `7`: "exitInterviewNotes: String"
  - `8`: "status: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "checklist: ExitChecklist"
  - `12`: "user: User"
  - `13`: "settlement: FnFSettlement"

### 📊 ExitChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "exitProcessId: String"
  - `2`: "category: String"
  - `3`: "item: String"
  - `4`: "status: String"
  - `5`: "responsibleRole: String"
  - `6`: "isCompleted: Boolean"
  - `7`: "completedAt: DateTime"
  - `8`: "completedBy: String"
  - `9`: "notes: String"
  - `10`: "createdAt: DateTime"
  - `11`: "exitProcess: ExitProcess"

### 📊 FnFSettlement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "exitProcessId: String"
  - `3`: "status: String"
  - `4`: "totalAmount: Float"
  - `5`: "netPayable: Float"
  - `6`: "approvedByHR: String"
  - `7`: "approvedByFinance: String"
  - `8`: "approvedByLeadership: String"
  - `9`: "paidAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "lineItems: FnFLineItem"
  - `13`: "exitProcess: ExitProcess"
  - `14`: "user: User"

### 📊 FnFLineItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "settlementId: String"
  - `2`: "type: String"
  - `3`: "description: String"
  - `4`: "amount: Float"
  - `5`: "isDeduction: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "settlement: FnFSettlement"

### 📊 ReferralBonus *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "referrerId: String"
  - `2`: "referredUserId: String"
  - `3`: "referredName: String"
  - `4`: "type: String"
  - `5`: "amount: Float"
  - `6`: "status: String"
  - `7`: "qualifiedAt: DateTime"
  - `8`: "paidAt: DateTime"
  - `9`: "notes: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "referredUser: User"
  - `13`: "referrer: User"

### 📊 RFPSubmission *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "clientId: String"
  - `3`: "companyName: String"
  - `4`: "contactName: String"
  - `5`: "contactEmail: String"
  - `6`: "contactPhone: String"
  - `7`: "address: String"
  - `8`: "gstNumber: String"
  - `9`: "industry: String"
  - `10`: "businessType: String"
  - `11`: "websiteUrl: String"
  - `12`: "servicesRequested: String"
  - `13`: "scopeDetails: String"
  - `14`: "budgetRange: String"
  - `15`: "monthlyBudget: Float"
  - `16`: "expectedStartDate: DateTime"
  - `17`: "contractDuration: String"
  - `18`: "clientTier: String"
  - `19`: "currency: String"
  - `20`: "locations: String"
  - `21`: "targetAudience: String"
  - `22`: "competitors: String"
  - `23`: "usp: String"
  - `24`: "adBudget: String"
  - `25`: "retainerBudget: String"
  - `26`: "primaryGoals: String"
  - `27`: "successMetrics: String"
  - `28`: "biggestChallenge: String"
  - `29`: "currentMarketing: String"
  - `30`: "whatWorked: String"
  - `31`: "whatDidntWork: String"
  - `32`: "preferredCallTime: String"
  - `33`: "additionalInfo: String"
  - `34`: "prospectFormData: String"
  - `35`: "patientVolume: String"
  - `36`: "specializations: String"
  - `37`: "status: String"
  - `38`: "currentStep: Int"
  - `39`: "completed: Boolean"
  - `40`: "completedAt: DateTime"
  - `41`: "viewedAt: DateTime"
  - `42`: "expiresAt: DateTime"
  - `43`: "submittedById: String"
  - `44`: "createdById: String"
  - `45`: "notes: String"
  - `46`: "leadId: String"
  - `47`: "createdAt: DateTime"
  - `48`: "updatedAt: DateTime"
  - `49`: "client: Client"

### 📊 SLADocument *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "entityType: String"
  - `3`: "entityName: String"
  - `4`: "entityAddress: String"
  - `5`: "clientName: String"
  - `6`: "clientAddress: String"
  - `7`: "clientGstNumber: String"
  - `8`: "servicesScope: String"
  - `9`: "customScope: String"
  - `10`: "monthlyRetainer: Float"
  - `11`: "advanceAmount: Float"
  - `12`: "contractDuration: String"
  - `13`: "commencementDate: DateTime"
  - `14`: "endDate: DateTime"
  - `15`: "poNumber: String"
  - `16`: "paymentTerms: String"
  - `17`: "slaMetrics: String"
  - `18`: "escalationContacts: String"
  - `19`: "clientSignerName: String"
  - `20`: "clientSignature: String"
  - `21`: "clientSignedAt: DateTime"
  - `22`: "agencySignerName: String"
  - `23`: "agencySignature: String"
  - `24`: "agencySignedAt: DateTime"
  - `25`: "status: String"
  - `26`: "documentUrl: String"
  - `27`: "generatedInvoiceId: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "client: Client"

### 📊 ServiceTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "subcategory: String"
  - `4`: "description: String"
  - `5`: "deliverables: String"
  - `6`: "pricing: String"
  - `7`: "inclusions: String"
  - `8`: "exclusions: String"
  - `9`: "revisionPolicy: String"
  - `10`: "slaMetrics: String"
  - `11`: "terms: String"
  - `12`: "isActive: Boolean"
  - `13`: "displayOrder: Int"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"

### 📊 VendorOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "companyName: String"
  - `2`: "contactName: String"
  - `3`: "contactEmail: String"
  - `4`: "contactPhone: String"
  - `5`: "address: String"
  - `6`: "gstNumber: String"
  - `7`: "panNumber: String"
  - `8`: "bankAccountName: String"
  - `9`: "bankAccountNumber: String"
  - `10`: "bankIFSC: String"
  - `11`: "bankName: String"
  - `12`: "serviceCategory: String"
  - `13`: "contractDuration: String"
  - `14`: "paymentTerms: String"
  - `15`: "monthlyRate: Float"
  - `16`: "ndaSigned: Boolean"
  - `17`: "ndaSignedAt: DateTime"
  - `18`: "ndaSignature: String"
  - `19`: "contractSigned: Boolean"
  - `20`: "contractSignedAt: DateTime"
  - `21`: "contractSignature: String"
  - `22`: "documentsUrl: String"
  - `23`: "status: String"
  - `24`: "approvedById: String"
  - `25`: "notes: String"
  - `26`: "createdAt: DateTime"
  - `27`: "updatedAt: DateTime"

### 📊 ClientPortal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "pinCode: String"
  - `3`: "themeColor: String"
  - `4`: "logoUrl: String"
  - `5`: "isActive: Boolean"
  - `6`: "lastAccessed: DateTime"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "client: Client"

### 📊 CompanyEntity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "code: String"
  - `2`: "name: String"
  - `3`: "tradeName: String"
  - `4`: "type: String"
  - `5`: "country: String"
  - `6`: "gstNumber: String"
  - `7`: "panNumber: String"
  - `8`: "cinNumber: String"
  - `9`: "einNumber: String"
  - `10`: "tanNumber: String"
  - `11`: "registeredAddress: String"
  - `12`: "operatingAddress: String"
  - `13`: "city: String"
  - `14`: "state: String"
  - `15`: "pincode: String"
  - `16`: "email: String"
  - `17`: "phone: String"
  - `18`: "website: String"
  - `19`: "invoicePrefix: String"
  - `20`: "invoiceCounter: Int"
  - `21`: "defaultCurrency: String"
  - `22`: "logoUrl: String"
  - `23`: "letterheadUrl: String"
  - `24`: "signatureUrl: String"
  - `25`: "isActive: Boolean"
  - `26`: "isPrimary: Boolean"
  - `27`: "createdAt: DateTime"
  - `28`: "updatedAt: DateTime"
  - `29`: "bankAccounts: EntityBankAccount"
  - `30`: "paymentGateways: EntityPaymentGateway"

### 📊 EntityBankAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "bankName: String"
  - `3`: "accountName: String"
  - `4`: "accountNumber: String"
  - `5`: "ifscCode: String"
  - `6`: "swiftCode: String"
  - `7`: "routingNumber: String"
  - `8`: "branchName: String"
  - `9`: "branchAddress: String"
  - `10`: "accountType: String"
  - `11`: "currency: String"
  - `12`: "displayName: String"
  - `13`: "isPrimary: Boolean"
  - `14`: "isActive: Boolean"
  - `15`: "lastBalance: Float"
  - `16`: "lastBalanceDate: DateTime"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "entity: CompanyEntity"

### 📊 EntityPaymentGateway *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "provider: String"
  - `3`: "displayName: String"
  - `4`: "merchantId: String"
  - `5`: "apiKeyId: String"
  - `6`: "apiKeySecret: String"
  - `7`: "webhookSecret: String"
  - `8`: "mode: String"
  - `9`: "supportedCurrencies: String"
  - `10`: "defaultCurrency: String"
  - `11`: "supportsSubscription: Boolean"
  - `12`: "supportsRefund: Boolean"
  - `13`: "supportsPartialPayment: Boolean"
  - `14`: "feePercentage: Float"
  - `15`: "fixedFee: Float"
  - `16`: "isPrimary: Boolean"
  - `17`: "isActive: Boolean"
  - `18`: "lastUsedAt: DateTime"
  - `19`: "totalTransactions: Int"
  - `20`: "totalVolume: Float"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"
  - `23`: "entity: CompanyEntity"

### 📊 SelfAppraisal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "cycleYear: Int"
  - `3`: "cyclePeriod: String"
  - `4`: "status: String"
  - `5`: "triggeredAt: DateTime"
  - `6`: "startedAt: DateTime"
  - `7`: "submittedAt: DateTime"
  - `8`: "completedAt: DateTime"
  - `9`: "overallRating: Int"
  - `10`: "keyAccomplishments: String"
  - `11`: "challengesFaced: String"
  - `12`: "goalsAchieved: String"
  - `13`: "goalsMissed: String"
  - `14`: "skillsImproved: String"
  - `15`: "learningCompleted: String"
  - `16`: "skillsToImprove: String"
  - `17`: "roleClarity: Int"
  - `18`: "resourcesAdequate: Int"
  - `19`: "workloadBalance: Int"
  - `20`: "teamCollaboration: Int"
  - `21`: "managerSupport: Int"
  - `22`: "cultureFit: Int"
  - `23`: "nextYearGoals: String"
  - `24`: "careerAspirations: String"
  - `25`: "supportNeeded: String"
  - `26`: "trainingRequests: String"
  - `27`: "companyFeedback: String"
  - `28`: "teamFeedback: String"
  - `29`: "processFeedback: String"
  - `30`: "managerComments: String"
  - `31`: "managerRating: Int"
  - `32`: "reviewedBy: String"
  - `33`: "reviewedAt: DateTime"
  - `34`: "finalRating: Int"
  - `35`: "incrementRecommendation: String"
  - `36`: "promotionRecommendation: Boolean"
  - `37`: "learningHoursThisYear: Float"
  - `38`: "learningHoursRequired: Float"
  - `39`: "createdAt: DateTime"
  - `40`: "updatedAt: DateTime"

### 📊 LoginSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "userType: String"
  - `3`: "ipAddress: String"
  - `4`: "userAgent: String"
  - `5`: "deviceType: String"
  - `6`: "browser: String"
  - `7`: "browserVersion: String"
  - `8`: "os: String"
  - `9`: "osVersion: String"
  - `10`: "country: String"
  - `11`: "countryCode: String"
  - `12`: "region: String"
  - `13`: "city: String"
  - `14`: "latitude: Float"
  - `15`: "longitude: Float"
  - `16`: "timezone: String"
  - `17`: "isp: String"
  - `18`: "sessionToken: String"
  - `19`: "isActive: Boolean"
  - `20`: "loginAt: DateTime"
  - `21`: "logoutAt: DateTime"
  - `22`: "lastActivityAt: DateTime"
  - `23`: "expiresAt: DateTime"
  - `24`: "isSuspicious: Boolean"
  - `25`: "suspiciousReason: String"
  - `26`: "isNewDevice: Boolean"
  - `27`: "deviceFingerprint: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "user: User"

### 📊 ChatChannel *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "slug: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "icon: String"
  - `6`: "isMash: Boolean"
  - `7`: "isArchived: Boolean"
  - `8`: "allowedRoles: String"
  - `9`: "isReadOnly: Boolean"
  - `10`: "createdById: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "createdBy: User"
  - `14`: "members: ChatChannelMember"
  - `15`: "messages: ChatMessage"

### 📊 ChatChannelMember *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "channelId: String"
  - `2`: "userId: String"
  - `3`: "role: String"
  - `4`: "isMuted: Boolean"
  - `5`: "lastReadAt: DateTime"
  - `6`: "joinedAt: DateTime"
  - `7`: "channel: ChatChannel"
  - `8`: "user: User"

### 📊 ChatMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "channelId: String"
  - `2`: "senderId: String"
  - `3`: "content: String"
  - `4`: "type: String"
  - `5`: "priority: String"
  - `6`: "isPinned: Boolean"
  - `7`: "attachments: String"
  - `8`: "parentId: String"
  - `9`: "reactions: String"
  - `10`: "isEdited: Boolean"
  - `11`: "editedAt: DateTime"
  - `12`: "isDeleted: Boolean"
  - `13`: "deletedAt: DateTime"
  - `14`: "readBy: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "channel: ChatChannel"
  - `18`: "parent: ChatMessage"
  - `19`: "replies: ChatMessage"
  - `20`: "sender: User"

### 📊 DirectMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "senderId: String"
  - `2`: "receiverId: String"
  - `3`: "content: String"
  - `4`: "type: String"
  - `5`: "attachments: String"
  - `6`: "isRead: Boolean"
  - `7`: "readAt: DateTime"
  - `8`: "isDeleted: Boolean"
  - `9`: "deletedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "receiver: User"
  - `13`: "sender: User"

### 📊 ClientProperty *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "name: String"
  - `4`: "url: String"
  - `5`: "isActive: Boolean"
  - `6`: "isPrimary: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "client: Client"
  - `9`: "kpiEntries: TacticalKPIEntry"

### 📊 TacticalMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "reportingMonth: DateTime"
  - `4`: "status: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "submittedOnTime: Boolean"
  - `7`: "reviewedBy: String"
  - `8`: "reviewedAt: DateTime"
  - `9`: "managerNotes: String"
  - `10`: "performanceScore: Float"
  - `11`: "accountabilityScore: Float"
  - `12`: "clientSatisfactionScore: Float"
  - `13`: "overallScore: Float"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "kpiEntries: TacticalKPIEntry"
  - `17`: "user: User"

### 📊 TacticalKPIEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "clientId: String"
  - `3`: "propertyId: String"
  - `4`: "department: String"
  - `5`: "organicTraffic: Int"
  - `6`: "prevOrganicTraffic: Int"
  - `7`: "leads: Int"
  - `8`: "prevLeads: Int"
  - `9`: "gbpCalls: Int"
  - `10`: "prevGbpCalls: Int"
  - `11`: "gbpDirections: Int"
  - `12`: "prevGbpDirections: Int"
  - `13`: "keywordsTop3: Int"
  - `14`: "prevKeywordsTop3: Int"
  - `15`: "keywordsTop10: Int"
  - `16`: "prevKeywordsTop10: Int"
  - `17`: "keywordsTop20: Int"
  - `18`: "prevKeywordsTop20: Int"
  - `19`: "backlinksBuilt: Int"
  - `20`: "prevBacklinksBuilt: Int"
  - `21`: "adSpend: Float"
  - `22`: "prevAdSpend: Float"
  - `23`: "impressions: Int"
  - `24`: "prevImpressions: Int"
  - `25`: "clicks: Int"
  - `26`: "prevClicks: Int"
  - `27`: "conversions: Int"
  - `28`: "prevConversions: Int"
  - `29`: "costPerConversion: Float"
  - `30`: "prevCostPerConversion: Float"
  - `31`: "roas: Float"
  - `32`: "prevRoas: Float"
  - `33`: "followers: Int"
  - `34`: "prevFollowers: Int"
  - `35`: "engagement: Float"
  - `36`: "prevEngagement: Float"
  - `37`: "postsPublished: Int"
  - `38`: "prevPostsPublished: Int"
  - `39`: "reachTotal: Int"
  - `40`: "prevReachTotal: Int"
  - `41`: "videoViews: Int"
  - `42`: "prevVideoViews: Int"
  - `43`: "pageSpeed: Int"
  - `44`: "prevPageSpeed: Int"
  - `45`: "bounceRate: Float"
  - `46`: "prevBounceRate: Float"
  - `47`: "avgSessionDuration: Float"
  - `48`: "prevAvgSessionDuration: Float"
  - `49`: "pagesBuilt: Int"
  - `50`: "prevPagesBuilt: Int"
  - `51`: "bugsFixed: Int"
  - `52`: "prevBugsFixed: Int"
  - `53`: "customMetrics: String"
  - `54`: "trafficGrowth: Float"
  - `55`: "leadsGrowth: Float"
  - `56`: "callsGrowth: Float"
  - `57`: "keywordsGrowth: Float"
  - `58`: "notes: String"
  - `59`: "achievements: String"
  - `60`: "challenges: String"
  - `61`: "nextMonthPlan: String"
  - `62`: "createdAt: DateTime"
  - `63`: "updatedAt: DateTime"
  - `64`: "client: Client"
  - `65`: "meeting: TacticalMeeting"
  - `66`: "property: ClientProperty"

### 📊 StrategicMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "quarter: Int"
  - `2`: "year: Int"
  - `3`: "department: String"
  - `4`: "conductedAt: DateTime"
  - `5`: "quarterlyData: String"
  - `6`: "summary: String"
  - `7`: "keyDecisions: String"
  - `8`: "actionItems: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "peerReviews: PeerReview"
  - `12`: "goals: StrategicGoal"

### 📊 StrategicGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "userId: String"
  - `3`: "department: String"
  - `4`: "clientId: String"
  - `5`: "title: String"
  - `6`: "description: String"
  - `7`: "targetMetric: String"
  - `8`: "targetValue: Float"
  - `9`: "currentValue: Float"
  - `10`: "deadline: DateTime"
  - `11`: "status: String"
  - `12`: "achievedValue: Float"
  - `13`: "achievedAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "meeting: StrategicMeeting"

### 📊 PeerReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "reviewerId: String"
  - `3`: "revieweeId: String"
  - `4`: "collaborationRating: Int"
  - `5`: "communicationRating: Int"
  - `6`: "deliveryRating: Int"
  - `7`: "innovationRating: Int"
  - `8`: "overallRating: Int"
  - `9`: "didWell: String"
  - `10`: "needsImprovement: String"
  - `11`: "shouldDoDifferently: String"
  - `12`: "additionalComments: String"
  - `13`: "isAnonymous: Boolean"
  - `14`: "isPublic: Boolean"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "meeting: StrategicMeeting"

### 📊 EmployeeScorecard *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "performanceScore: Float"
  - `4`: "performanceBreakdown: String"
  - `5`: "accountabilityScore: Float"
  - `6`: "projectsManaged: Int"
  - `7`: "projectsExpected: Int"
  - `8`: "clientSatisfactionScore: Float"
  - `9`: "avgNpsScore: Float"
  - `10`: "positiveReviews: Int"
  - `11`: "negativeReviews: Int"
  - `12`: "escalationsCount: Int"
  - `13`: "churnedClients: Int"
  - `14`: "learningHoursRequired: Float"
  - `15`: "learningHoursCompleted: Float"
  - `16`: "learningCompliant: Boolean"
  - `17`: "appraisalDelayMonths: Int"
  - `18`: "overallScore: Float"
  - `19`: "companyRank: Int"
  - `20`: "departmentRank: Int"
  - `21`: "isAppraisalEligible: Boolean"
  - `22`: "nextAppraisalDate: DateTime"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"

### 📊 ClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "month: DateTime"
  - `3`: "npsScore: Int"
  - `4`: "npsCategory: String"
  - `5`: "overallSatisfaction: Int"
  - `6`: "communicationRating: Int"
  - `7`: "deliveryRating: Int"
  - `8`: "valueRating: Int"
  - `9`: "feedback: String"
  - `10`: "improvements: String"
  - `11`: "hadEscalation: Boolean"
  - `12`: "escalationDetails: String"
  - `13`: "churnRisk: String"
  - `14`: "churnedThisMonth: Boolean"
  - `15`: "churnReason: String"
  - `16`: "collectedAt: DateTime"
  - `17`: "collectedBy: String"
  - `18`: "client: Client"

### 📊 ClientPortalFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "clientUserId: String"
  - `3`: "type: String"
  - `4`: "rating: Int"
  - `5`: "message: String"
  - `6`: "status: String"
  - `7`: "response: String"
  - `8`: "respondedBy: String"
  - `9`: "respondedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "client: Client"
  - `12`: "clientUser: ClientUser"

### 📊 CustomRole *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "displayName: String"
  - `3`: "baseRoles: String"
  - `4`: "departments: String"
  - `5`: "permissions: String"
  - `6`: "isActive: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"
  - `9`: "userAssignments: UserCustomRole"

### 📊 UserCustomRole *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "customRoleId: String"
  - `3`: "assignedAt: DateTime"
  - `4`: "customRole: CustomRole"
  - `5`: "user: User"

### 📊 ClientWhatsAppGroup *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "groupType: String"
  - `4`: "joinLink: String"
  - `5`: "qrCodeUrl: String"
  - `6`: "officialPhoneRequired: String"
  - `7`: "isActive: Boolean"
  - `8`: "memberCount: Int"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"

### 📊 WhatsAppTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "department: String"
  - `4`: "content: String"
  - `5`: "variables: String"
  - `6`: "language: String"
  - `7`: "hasMedia: Boolean"
  - `8`: "mediaType: String"
  - `9`: "mediaUrl: String"
  - `10`: "usageCount: Int"
  - `11`: "lastUsedAt: DateTime"
  - `12`: "isActive: Boolean"
  - `13`: "isApproved: Boolean"
  - `14`: "approvedBy: String"
  - `15`: "approvedAt: DateTime"
  - `16`: "createdBy: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "usageLogs: WhatsAppTemplateUsage"

### 📊 WhatsAppTemplateUsage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "templateId: String"
  - `2`: "userId: String"
  - `3`: "recipientPhone: String"
  - `4`: "recipientName: String"
  - `5`: "recipientType: String"
  - `6`: "status: String"
  - `7`: "messageId: String"
  - `8`: "error: String"
  - `9`: "sentAt: DateTime"
  - `10`: "deliveredAt: DateTime"
  - `11`: "readAt: DateTime"
  - `12`: "template: WhatsAppTemplate"

### 📊 WhatsAppCampaign *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "templateId: String"
  - `4`: "targetType: String"
  - `5`: "targetFilter: String"
  - `6`: "recipientCount: Int"
  - `7`: "status: String"
  - `8`: "scheduledAt: DateTime"
  - `9`: "startedAt: DateTime"
  - `10`: "completedAt: DateTime"
  - `11`: "sentCount: Int"
  - `12`: "deliveredCount: Int"
  - `13`: "failedCount: Int"
  - `14`: "createdBy: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "messages: WhatsAppCampaignMessage"

### 📊 WhatsAppCampaignMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "recipientPhone: String"
  - `3`: "recipientName: String"
  - `4`: "status: String"
  - `5`: "messageId: String"
  - `6`: "error: String"
  - `7`: "sentAt: DateTime"
  - `8`: "deliveredAt: DateTime"
  - `9`: "campaign: WhatsAppCampaign"

### 📊 DeviceRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "deviceType: String"
  - `3`: "reason: String"
  - `4`: "urgency: String"
  - `5`: "status: String"
  - `6`: "approvedBy: String"
  - `7`: "fulfilledAssetId: String"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "user: User"

### 📊 HRPipelineTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "candidateId: String"
  - `3`: "employeeId: String"
  - `4`: "taskType: String"
  - `5`: "title: String"
  - `6`: "description: String"
  - `7`: "startDate: DateTime"
  - `8`: "endDate: DateTime"
  - `9`: "duration: Int"
  - `10`: "progress: Int"
  - `11`: "dependencies: String"
  - `12`: "status: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 ClientOperationsLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "date: DateTime"
  - `3`: "npsScore: Int"
  - `4`: "flagStatus: String"
  - `5`: "paymentStatus: String"
  - `6`: "paymentDueDate: DateTime"
  - `7`: "remarks: String"
  - `8`: "loggedBy: String"
  - `9`: "createdAt: DateTime"
  - `10`: "client: Client"

### 📊 WhatsAppAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "phoneNumber: String"
  - `3`: "displayName: String"
  - `4`: "wbiztoolClientId: Int"
  - `5`: "wbiztoolWhatsappId: Int"
  - `6`: "sessionStatus: String"
  - `7`: "isActive: Boolean"
  - `8`: "createdById: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "employeeChats: EmployeeWhatsAppChat"
  - `12`: "accessGrants: WhatsAppAccess"
  - `13`: "messages: WhatsAppMessage"
  - `14`: "schedules: WhatsAppSchedule"

### 📊 WhatsAppMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "direction: String"
  - `3`: "phoneNumber: String"
  - `4`: "contactName: String"
  - `5`: "messageType: String"
  - `6`: "content: String"
  - `7`: "mediaUrl: String"
  - `8`: "status: String"
  - `9`: "externalMsgId: String"
  - `10`: "clientId: String"
  - `11`: "sentById: String"
  - `12`: "scheduleId: String"
  - `13`: "sentAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "account: WhatsAppAccount"
  - `16`: "client: Client"
  - `17`: "schedule: WhatsAppSchedule"

### 📊 WhatsAppSchedule *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "name: String"
  - `3`: "targetType: String"
  - `4`: "targetPhone: String"
  - `5`: "targetClientId: String"
  - `6`: "targetChatId: String"
  - `7`: "isGroup: Boolean"
  - `8`: "messageTemplate: String"
  - `9`: "scheduleType: String"
  - `10`: "frequency: String"
  - `11`: "dayOfWeek: Int"
  - `12`: "dayOfMonth: Int"
  - `13`: "scheduledTime: String"
  - `14`: "scheduledAt: DateTime"
  - `15`: "lastRunAt: DateTime"
  - `16`: "nextRunAt: DateTime"
  - `17`: "runCount: Int"
  - `18`: "status: String"
  - `19`: "createdById: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "messages: WhatsAppMessage"
  - `23`: "account: WhatsAppAccount"

### 📊 WhatsAppAccess *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "accountId: String"
  - `3`: "accessLevel: String"
  - `4`: "grantedById: String"
  - `5`: "grantedAt: DateTime"
  - `6`: "account: WhatsAppAccount"
  - `7`: "user: User"

### 📊 EmployeeWhatsAppChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "accountId: String"
  - `3`: "phoneNumber: String"
  - `4`: "chatName: String"
  - `5`: "assignedAt: DateTime"
  - `6`: "assignedById: String"
  - `7`: "account: WhatsAppAccount"
  - `8`: "user: User"

### 📊 WhatsAppSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sessionId: String"
  - `2`: "department: String"
  - `3`: "userId: String"
  - `4`: "status: String"
  - `5`: "phoneNumber: String"
  - `6`: "lastError: String"
  - `7`: "reconnectCount: Int"
  - `8`: "lastConnectedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 WhatsAppAuthState *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sessionId: String"
  - `2`: "key: String"
  - `3`: "value: String"
  - `4`: "createdAt: DateTime"
  - `5`: "updatedAt: DateTime"

### 📊 UserPinnedChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "chatIdentifier: String"
  - `3`: "chatName: String"
  - `4`: "isGroup: Boolean"
  - `5`: "pinnedAt: DateTime"

### 📊 BankStatement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "bankName: String"
  - `3`: "accountType: String"
  - `4`: "accountNumber: String"
  - `5`: "statementMonth: DateTime"
  - `6`: "fileName: String"
  - `7`: "fileUrl: String"
  - `8`: "status: String"
  - `9`: "openingBalance: Float"
  - `10`: "closingBalance: Float"
  - `11`: "totalCredits: Float"
  - `12`: "totalDebits: Float"
  - `13`: "matchedCount: Int"
  - `14`: "unmatchedCount: Int"
  - `15`: "aiParsingResult: String"
  - `16`: "processingError: String"
  - `17`: "processedAt: DateTime"
  - `18`: "uploadedBy: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "transactions: BankTransaction"

### 📊 BankTransaction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "statementId: String"
  - `2`: "transactionDate: DateTime"
  - `3`: "valueDate: DateTime"
  - `4`: "description: String"
  - `5`: "reference: String"
  - `6`: "type: String"
  - `7`: "amount: Float"
  - `8`: "balance: Float"
  - `9`: "matchStatus: String"
  - `10`: "matchConfidence: Float"
  - `11`: "clientId: String"
  - `12`: "invoiceId: String"
  - `13`: "paymentId: String"
  - `14`: "category: String"
  - `15`: "subcategory: String"
  - `16`: "expenseId: String"
  - `17`: "aiParsedData: String"
  - `18`: "isReviewed: Boolean"
  - `19`: "reviewedBy: String"
  - `20`: "reviewedAt: DateTime"
  - `21`: "reviewNotes: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"
  - `24`: "client: Client"
  - `25`: "invoice: Invoice"
  - `26`: "payment: PaymentCollection"
  - `27`: "statement: BankStatement"

### 📊 DepartmentExpense *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "month: DateTime"
  - `3`: "baseSalaryComponent: Float"
  - `4`: "rbcComponent: Float"
  - `5`: "totalSalaryComponent: Float"
  - `6`: "toolsExpense: Float"
  - `7`: "freelancerExpense: Float"
  - `8`: "miscExpense: Float"
  - `9`: "totalExpense: Float"
  - `10`: "attributedRevenue: Float"
  - `11`: "clientCount: Int"
  - `12`: "roi: Float"
  - `13`: "costPerClient: Float"
  - `14`: "revenuePerClient: Float"
  - `15`: "notes: String"
  - `16`: "calculatedAt: DateTime"
  - `17`: "calculatedBy: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 DepartmentSalaryAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "month: DateTime"
  - `3`: "headCount: Int"
  - `4`: "totalBaseSalary: Float"
  - `5`: "totalRBCAllocation: Float"
  - `6`: "isVerified: Boolean"
  - `7`: "verifiedBy: String"
  - `8`: "verifiedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 AutoInvoiceConfig *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "isEnabled: Boolean"
  - `3`: "generateOnDay: Int"
  - `4`: "sendOnDay: Int"
  - `5`: "sendViaWhatsApp: Boolean"
  - `6`: "sendViaEmail: Boolean"
  - `7`: "useClientMonthlyFee: Boolean"
  - `8`: "customAmount: Float"
  - `9`: "includeGST: Boolean"
  - `10`: "gstPercentage: Float"
  - `11`: "invoicePrefix: String"
  - `12`: "defaultNotes: String"
  - `13`: "lastGeneratedAt: DateTime"
  - `14`: "lastSentAt: DateTime"
  - `15`: "nextScheduledAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 AccountsMonthlyReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "month: DateTime"
  - `2`: "totalExpectedRevenue: Float"
  - `3`: "totalCollected: Float"
  - `4`: "totalPending: Float"
  - `5`: "totalOverdue: Float"
  - `6`: "collectionRate: Float"
  - `7`: "activeClients: Int"
  - `8`: "newClients: Int"
  - `9`: "churnedClients: Int"
  - `10`: "departmentROISummary: String"
  - `11`: "expenseByCategory: String"
  - `12`: "keyHighlights: String"
  - `13`: "challenges: String"
  - `14`: "actionItems: String"
  - `15`: "status: String"
  - `16`: "scheduledAt: DateTime"
  - `17`: "conductedAt: DateTime"
  - `18`: "conductedBy: String"
  - `19`: "participants: String"
  - `20`: "meetingNotes: String"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"

### 📊 AccountsQuarterlyReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "quarter: Int"
  - `2`: "year: Int"
  - `3`: "quarterlyRevenue: Float"
  - `4`: "previousQuarterRev: Float"
  - `5`: "revenueGrowthPct: Float"
  - `6`: "cashInflow: Float"
  - `7`: "cashOutflow: Float"
  - `8`: "netCashFlow: Float"
  - `9`: "badDebtAmount: Float"
  - `10`: "writeOffClients: String"
  - `11`: "avgCollectionDays: Float"
  - `12`: "clientRetentionRate: Float"
  - `13`: "nextQuarterForecast: Float"
  - `14`: "strategicGoals: String"
  - `15`: "status: String"
  - `16`: "scheduledAt: DateTime"
  - `17`: "conductedAt: DateTime"
  - `18`: "conductedBy: String"
  - `19`: "participants: String"
  - `20`: "meetingNotes: String"
  - `21`: "actionItems: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 Interview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "stage: String"
  - `3`: "scheduledAt: DateTime"
  - `4`: "duration: Int"
  - `5`: "location: String"
  - `6`: "meetingLink: String"
  - `7`: "calendarEventId: String"
  - `8`: "interviewerId: String"
  - `9`: "status: String"
  - `10`: "feedback: String"
  - `11`: "rating: Int"
  - `12`: "decision: String"
  - `13`: "notes: String"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"
  - `16`: "candidate: Candidate"
  - `17`: "interviewer: User"

### 📊 OfferLetter *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "position: String"
  - `3`: "department: String"
  - `4`: "offeredSalary: Float"
  - `5`: "joiningDate: DateTime"
  - `6`: "employmentType: String"
  - `7`: "probationMonths: Int"
  - `8`: "noticePeriodDays: Int"
  - `9`: "negotiationNotes: String"
  - `10`: "finalSalary: Float"
  - `11`: "status: String"
  - `12`: "approvedBy: String"
  - `13`: "approvedAt: DateTime"
  - `14`: "sentAt: DateTime"
  - `15`: "candidateResponse: String"
  - `16`: "respondedAt: DateTime"
  - `17`: "offerLetterUrl: String"
  - `18`: "signedUrl: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "candidate: Candidate"

### 📊 EmployeeClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "employeeId: String"
  - `3`: "overallRating: Int"
  - `4`: "qualitativeRemarks: String"
  - `5`: "communicationRating: Int"
  - `6`: "deliveryRating: Int"
  - `7`: "professionalismRating: Int"
  - `8`: "responsiveRating: Int"
  - `9`: "service: String"
  - `10`: "projectName: String"
  - `11`: "periodStart: DateTime"
  - `12`: "periodEnd: DateTime"
  - `13`: "collectedBy: String"
  - `14`: "source: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "client: Client"
  - `18`: "employee: User"

### 📊 EmployeeEscalation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "employeeId: String"
  - `2`: "type: String"
  - `3`: "severity: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "clientId: String"
  - `7`: "reportedBy: String"
  - `8`: "status: String"
  - `9`: "resolution: String"
  - `10`: "resolvedBy: String"
  - `11`: "resolvedAt: DateTime"
  - `12`: "impactOnAppraisal: Boolean"
  - `13`: "actionTaken: String"
  - `14`: "managerNotified: Boolean"
  - `15`: "hrNotified: Boolean"
  - `16`: "notifiedAt: DateTime"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "client: Client"
  - `20`: "employee: User"
  - `21`: "reporter: User"

### 📊 EmployeeAppreciation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "employeeId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "clientId: String"
  - `6`: "givenBy: String"
  - `7`: "xpAwarded: Int"
  - `8`: "isPublic: Boolean"
  - `9`: "certificate: String"
  - `10`: "createdAt: DateTime"
  - `11`: "client: Client"
  - `12`: "employee: User"
  - `13`: "giver: User"

### 📊 ManagerBehaviorReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "managerId: String"
  - `2`: "quarter: Int"
  - `3`: "year: Int"
  - `4`: "personalityRating: Int"
  - `5`: "commitmentRating: Int"
  - `6`: "behaviorRating: Int"
  - `7`: "leadershipRating: Int"
  - `8`: "communicationRating: Int"
  - `9`: "teamBuildingRating: Int"
  - `10`: "strengths: String"
  - `11`: "areasOfImprovement: String"
  - `12`: "specificIncidents: String"
  - `13`: "teamFeedbackSummary: String"
  - `14`: "reviewedBy: String"
  - `15`: "status: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "manager: User"
  - `19`: "reviewer: User"

### 📊 EmployerBrandingContent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "platform: String"
  - `5`: "contentText: String"
  - `6`: "mediaUrls: String"
  - `7`: "hashtags: String"
  - `8`: "scheduledFor: DateTime"
  - `9`: "publishedAt: DateTime"
  - `10`: "status: String"
  - `11`: "createdBy: String"
  - `12`: "approvedBy: String"
  - `13`: "approvedAt: DateTime"
  - `14`: "rejectionReason: String"
  - `15`: "likes: Int"
  - `16`: "comments: Int"
  - `17`: "shares: Int"
  - `18`: "reach: Int"
  - `19`: "impressions: Int"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "approver: User"
  - `23`: "creator: User"

### 📊 ContentIdea *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "theme: String"
  - `5`: "tags: String"
  - `6`: "status: String"
  - `7`: "usedCount: Int"
  - `8`: "lastUsedAt: DateTime"
  - `9`: "createdBy: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "creator: User"

### 📊 EngagementActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "scheduledDate: DateTime"
  - `5`: "endDate: DateTime"
  - `6`: "location: String"
  - `7`: "estimatedBudget: Float"
  - `8`: "actualSpent: Float"
  - `9`: "budgetApproved: Boolean"
  - `10`: "status: String"
  - `11`: "approvedBy: String"
  - `12`: "approvedAt: DateTime"
  - `13`: "rejectionReason: String"
  - `14`: "targetAudience: String"
  - `15`: "department: String"
  - `16`: "expectedCount: Int"
  - `17`: "actualCount: Int"
  - `18`: "organizedBy: String"
  - `19`: "photos: String"
  - `20`: "feedback: String"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"
  - `23`: "approver: User"
  - `24`: "organizer: User"

### 📊 WorkAnniversaryReminder *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "anniversaryDate: DateTime"
  - `3`: "yearsCompleted: Int"
  - `4`: "reminderSent: Boolean"
  - `5`: "reminderSentAt: DateTime"
  - `6`: "celebrated: Boolean"
  - `7`: "celebrationNotes: String"
  - `8`: "giftGiven: String"
  - `9`: "createdAt: DateTime"
  - `10`: "user: User"

### 📊 Day0Task *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "category: String"
  - `4`: "responsibleRole: String"
  - `5`: "dueHours: Int"
  - `6`: "isTemplate: Boolean"
  - `7`: "userId: String"
  - `8`: "assignedTo: String"
  - `9`: "status: String"
  - `10`: "completedAt: DateTime"
  - `11`: "completedBy: String"
  - `12`: "notes: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "assignee: User"
  - `16`: "user: User"

### 📊 SaasTool *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "description: String"
  - `4`: "url: String"
  - `5`: "loginType: String"
  - `6`: "email: String"
  - `7`: "password: String"
  - `8`: "notes: String"
  - `9`: "isActive: Boolean"
  - `10`: "accessLevel: String"
  - `11`: "lastAccessedAt: DateTime"
  - `12`: "lastAccessedBy: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 ClientProposal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "prospectName: String"
  - `3`: "prospectEmail: String"
  - `4`: "prospectPhone: String"
  - `5`: "prospectCompany: String"
  - `6`: "services: String"
  - `7`: "scopeItems: String"
  - `8`: "basePrice: Float"
  - `9`: "gstPercentage: Float"
  - `10`: "totalPrice: Float"
  - `11`: "allowServiceModification: Boolean"
  - `12`: "allowScopeModification: Boolean"
  - `13`: "clientName: String"
  - `14`: "clientEmail: String"
  - `15`: "clientPhone: String"
  - `16`: "clientCompany: String"
  - `17`: "clientGst: String"
  - `18`: "selectedServices: String"
  - `19`: "selectedScope: String"
  - `20`: "finalPrice: Float"
  - `21`: "clientAddress: String"
  - `22`: "clientCity: String"
  - `23`: "clientState: String"
  - `24`: "clientPincode: String"
  - `25`: "contractDuration: String"
  - `26`: "paymentTerms: String"
  - `27`: "advanceAmount: Float"
  - `28`: "advancePercentage: Int"
  - `29`: "slaAccepted: Boolean"
  - `30`: "slaAcceptedAt: DateTime"
  - `31`: "slaSignerName: String"
  - `32`: "slaSignerDesignation: String"
  - `33`: "slaDocumentId: String"
  - `34`: "invoiceGenerated: Boolean"
  - `35`: "invoiceGeneratedAt: DateTime"
  - `36`: "invoiceNumber: String"
  - `37`: "paymentMethod: String"
  - `38`: "paymentConfirmed: Boolean"
  - `39`: "paymentConfirmedAt: DateTime"
  - `40`: "paymentConfirmedBy: String"
  - `41`: "paymentReference: String"
  - `42`: "razorpayOrderId: String"
  - `43`: "razorpayPaymentId: String"
  - `44`: "accountOnboardingCompleted: Boolean"
  - `45`: "accountOnboardingCompletedAt: DateTime"
  - `46`: "accountOnboardingData: String"
  - `47`: "managerReviewed: Boolean"
  - `48`: "managerReviewedAt: DateTime"
  - `49`: "managerReviewedBy: String"
  - `50`: "accountManagerId: String"
  - `51`: "teamAllocated: Boolean"
  - `52`: "teamAllocationData: String"
  - `53`: "portalActivated: Boolean"
  - `54`: "portalActivatedAt: DateTime"
  - `55`: "kickoffScheduled: Boolean"
  - `56`: "kickoffDate: DateTime"
  - `57`: "currentStep: Int"
  - `58`: "status: String"
  - `59`: "expiresAt: DateTime"
  - `60`: "viewedAt: DateTime"
  - `61`: "acceptedAt: DateTime"
  - `62`: "clientId: String"
  - `63`: "invoiceId: String"
  - `64`: "createdById: String"
  - `65`: "createdByRole: String"
  - `66`: "entityType: String"
  - `67`: "createdAt: DateTime"
  - `68`: "updatedAt: DateTime"
  - `69`: "onboardingDetails: AccountOnboardingDetails"

### 📊 AccountOnboardingDetails *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "proposalId: String"
  - `2`: "brandName: String"
  - `3`: "brandTagline: String"
  - `4`: "brandDescription: String"
  - `5`: "brandVoice: String"
  - `6`: "targetAudience: String"
  - `7`: "competitors: String"
  - `8`: "uniqueSellingPoint: String"
  - `9`: "communicationStyle: String"
  - `10`: "reportingFrequency: String"
  - `11`: "meetingPreference: String"
  - `12`: "responseExpectation: String"
  - `13`: "decisionMaker: String"
  - `14`: "feedbackStyle: String"
  - `15`: "involvementLevel: String"
  - `16`: "primaryContactName: String"
  - `17`: "primaryContactPhone: String"
  - `18`: "primaryContactEmail: String"
  - `19`: "whatsappNumber: String"
  - `20`: "preferredChannel: String"
  - `21`: "escalationContact: String"
  - `22`: "escalationPhone: String"
  - `23`: "seoDetails: String"
  - `24`: "socialDetails: String"
  - `25`: "adsDetails: String"
  - `26`: "webDetails: String"
  - `27`: "gbpDetails: String"
  - `28`: "contentApprovalRequired: Boolean"
  - `29`: "contentApprovalBy: String"
  - `30`: "contentTurnaround: String"
  - `31`: "doNotDo: String"
  - `32`: "mustDo: String"
  - `33`: "additionalNotes: String"
  - `34`: "seoSectionComplete: Boolean"
  - `35`: "socialSectionComplete: Boolean"
  - `36`: "adsSectionComplete: Boolean"
  - `37`: "webSectionComplete: Boolean"
  - `38`: "gbpSectionComplete: Boolean"
  - `39`: "createdAt: DateTime"
  - `40`: "updatedAt: DateTime"
  - `41`: "proposal: ClientProposal"

### 📊 ClientLedger *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "category: String"
  - `4`: "description: String"
  - `5`: "amount: Float"
  - `6`: "balance: Float"
  - `7`: "referenceId: String"
  - `8`: "recordedBy: String"
  - `9`: "createdAt: DateTime"
  - `10`: "client: Client"

### 📊 Sequence *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "value: Int"
  - `2`: "updatedAt: DateTime"

### 📊 MagicLink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "clientId: String"
  - `4`: "role: String"
  - `5`: "department: String"
  - `6`: "ipAddress: String"
  - `7`: "isUsed: Boolean"
  - `8`: "usedAt: DateTime"
  - `9`: "expiresAt: DateTime"
  - `10`: "createdBy: String"
  - `11`: "createdAt: DateTime"

### 📊 UserGoogleDrive *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "accessToken: String"
  - `3`: "refreshToken: String"
  - `4`: "tokenExpiry: DateTime"
  - `5`: "email: String"
  - `6`: "rootFolderId: String"
  - `7`: "isConnected: Boolean"
  - `8`: "lastSyncAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "user: User"

### 📊 WorkEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "date: DateTime"
  - `4`: "year: Int"
  - `5`: "month: Int"
  - `6`: "week: Int"
  - `7`: "category: String"
  - `8`: "deliverableType: String"
  - `9`: "quantity: Int"
  - `10`: "metrics: String"
  - `11`: "resultSummary: String"
  - `12`: "resultMetrics: String"
  - `13`: "hoursSpent: Float"
  - `14`: "description: String"
  - `15`: "notes: String"
  - `16`: "qualityScore: Int"
  - `17`: "revisionCount: Int"
  - `18`: "turnaroundHours: Float"
  - `19`: "deliverableUrl: String"
  - `20`: "status: String"
  - `21`: "submittedAt: DateTime"
  - `22`: "approvedBy: String"
  - `23`: "approvedAt: DateTime"
  - `24`: "rejectionNote: String"
  - `25`: "tacticalMeetingId: String"
  - `26`: "strategicMeetingId: String"
  - `27`: "whatsappChatId: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "invoiceId: String"
  - `31`: "goalLinks: TaskGoalLink"
  - `32`: "client: Client"
  - `33`: "user: User"
  - `34`: "files: WorkEntryFile"

### 📊 WorkEntryFile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "workEntryId: String"
  - `2`: "driveFileId: String"
  - `3`: "fileName: String"
  - `4`: "fileType: String"
  - `5`: "fileSize: Int"
  - `6`: "webViewLink: String"
  - `7`: "thumbnailUrl: String"
  - `8`: "fileCategory: String"
  - `9`: "createdAt: DateTime"
  - `10`: "workEntry: WorkEntry"

### 📊 DeliverableTypeConfig *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "category: String"
  - `2`: "type: String"
  - `3`: "displayName: String"
  - `4`: "unitValue: Float"
  - `5`: "minQuantity: Int"
  - `6`: "maxQuantity: Int"
  - `7`: "requiredMetrics: String"
  - `8`: "isActive: Boolean"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 WhatsAppChatNote *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "chatIdentifier: String"
  - `3`: "chatName: String"
  - `4`: "content: String"
  - `5`: "isPinned: Boolean"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "user: User"

### 📊 SharedWhatsAppChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "chatIdentifier: String"
  - `2`: "chatName: String"
  - `3`: "chatType: String"
  - `4`: "department: String"
  - `5`: "clientId: String"
  - `6`: "isActive: Boolean"
  - `7`: "addedById: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "addedBy: User"
  - `11`: "client: Client"

### 📊 SocialMediaPost *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "month: DateTime"
  - `4`: "postUrl: String"
  - `5`: "platform: String"
  - `6`: "contentType: String"
  - `7`: "caption: String"
  - `8`: "postedAt: DateTime"
  - `9`: "likes: Int"
  - `10`: "comments: Int"
  - `11`: "shares: Int"
  - `12`: "saves: Int"
  - `13`: "reach: Int"
  - `14`: "impressions: Int"
  - `15`: "views: Int"
  - `16`: "watchTime: Int"
  - `17`: "engagementRate: Float"
  - `18`: "isTopPerformer: Boolean"
  - `19`: "performanceNotes: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "user: User"

### 📊 MonthlyGrowthScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "performanceScore: Float"
  - `4`: "performanceBreakdown: String"
  - `5`: "accountabilityScore: Float"
  - `6`: "clientsManaged: Int"
  - `7`: "clientCapacity: Int"
  - `8`: "accountabilityNotes: String"
  - `9`: "disciplineScore: Float"
  - `10`: "presentDays: Int"
  - `11`: "lateDays: Int"
  - `12`: "absentDays: Int"
  - `13`: "onTimePercentage: Float"
  - `14`: "disciplineSource: String"
  - `15`: "learningScore: Float"
  - `16`: "learningHoursLogged: Float"
  - `17`: "learningHoursRequired: Float"
  - `18`: "appreciationScore: Float"
  - `19`: "managerAppreciations: Int"
  - `20`: "clientAppreciations: Int"
  - `21`: "testimonials: Int"
  - `22`: "escalationsCount: Int"
  - `23`: "escalationDeduction: Float"
  - `24`: "clientsLost: Int"
  - `25`: "churnDeduction: Float"
  - `26`: "finalScore: Float"
  - `27`: "scoreGrade: String"
  - `28`: "tacticalDataSubmitted: Boolean"
  - `29`: "submittedAt: DateTime"
  - `30`: "submittedOnTime: Boolean"
  - `31`: "reviewedBy: String"
  - `32`: "reviewedAt: DateTime"
  - `33`: "reviewNotes: String"
  - `34`: "createdAt: DateTime"
  - `35`: "updatedAt: DateTime"
  - `36`: "user: User"

### 📊 SocialMediaPageMetrics *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "clientId: String"
  - `3`: "month: DateTime"
  - `4`: "platform: String"
  - `5`: "followers: Int"
  - `6`: "prevFollowers: Int"
  - `7`: "followerGrowth: Float"
  - `8`: "totalReach: Int"
  - `9`: "prevTotalReach: Int"
  - `10`: "reachGrowth: Float"
  - `11`: "totalEngagement: Int"
  - `12`: "engagementRate: Float"
  - `13`: "prevEngagementRate: Float"
  - `14`: "postsPublished: Int"
  - `15`: "reelsPublished: Int"
  - `16`: "storiesPublished: Int"
  - `17`: "leadsGenerated: Int"
  - `18`: "linkClicks: Int"
  - `19`: "profileVisits: Int"
  - `20`: "connections: Int"
  - `21`: "subscribers: Int"
  - `22`: "videoViews: Int"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"
  - `25`: "client: Client"
  - `26`: "user: User"

### 📊 RecurringExpense *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "category: String"
  - `4`: "vendor: String"
  - `5`: "frequency: String"
  - `6`: "amount: Float"
  - `7`: "currency: String"
  - `8`: "startDate: DateTime"
  - `9`: "endDate: DateTime"
  - `10`: "nextDueDate: DateTime"
  - `11`: "lastPaidDate: DateTime"
  - `12`: "isClientBillable: Boolean"
  - `13`: "autoPayEnabled: Boolean"
  - `14`: "reminderDays: Int"
  - `15`: "status: String"
  - `16`: "createdBy: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "allocations: ExpenseAllocation"
  - `20`: "payments: ExpensePayment"
  - `21`: "creator: User"

### 📊 ExpenseAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "expenseId: String"
  - `2`: "clientId: String"
  - `3`: "percentage: Float"
  - `4`: "fixedAmount: Float"
  - `5`: "notes: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"
  - `8`: "client: Client"
  - `9`: "expense: RecurringExpense"

### 📊 ExpensePayment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "expenseId: String"
  - `2`: "amount: Float"
  - `3`: "paidDate: DateTime"
  - `4`: "dueDate: DateTime"
  - `5`: "paymentMethod: String"
  - `6`: "transactionRef: String"
  - `7`: "receipt: String"
  - `8`: "status: String"
  - `9`: "notes: String"
  - `10`: "paidBy: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "expense: RecurringExpense"
  - `14`: "payer: User"

### 📊 Goal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "level: String"
  - `2`: "parentId: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "category: String"
  - `6`: "quarter: Int"
  - `7`: "year: Int"
  - `8`: "clientId: String"
  - `9`: "department: String"
  - `10`: "ownerId: String"
  - `11`: "startDate: DateTime"
  - `12`: "targetDate: DateTime"
  - `13`: "completedDate: DateTime"
  - `14`: "targetValue: Float"
  - `15`: "currentValue: Float"
  - `16`: "unit: String"
  - `17`: "status: String"
  - `18`: "progress: Float"
  - `19`: "weight: Float"
  - `20`: "score: Float"
  - `21`: "achievementNotes: String"
  - `22`: "selfRating: Int"
  - `23`: "createdBy: String"
  - `24`: "createdAt: DateTime"
  - `25`: "updatedAt: DateTime"
  - `26`: "client: Client"
  - `27`: "creator: User"
  - `28`: "owner: User"
  - `29`: "parent: Goal"
  - `30`: "children: Goal"
  - `31`: "taskLinks: TaskGoalLink"

### 📊 TaskGoalLink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "goalId: String"
  - `2`: "dailyTaskId: String"
  - `3`: "workEntryId: String"
  - `4`: "contributionWeight: Float"
  - `5`: "notes: String"
  - `6`: "createdAt: DateTime"
  - `7`: "dailyTask: DailyTask"
  - `8`: "goal: Goal"
  - `9`: "workEntry: WorkEntry"

### 📊 BudgetAlert *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "scope: String"
  - `2`: "clientId: String"
  - `3`: "department: String"
  - `4`: "budgetAmount: Float"
  - `5`: "currency: String"
  - `6`: "period: String"
  - `7`: "periodStart: DateTime"
  - `8`: "periodEnd: DateTime"
  - `9`: "warningThreshold: Float"
  - `10`: "criticalThreshold: Float"
  - `11`: "spentAmount: Float"
  - `12`: "spentPercentage: Float"
  - `13`: "alertLevel: String"
  - `14`: "lastAlertSent: DateTime"
  - `15`: "alertsEnabled: Boolean"
  - `16`: "pauseOnCritical: Boolean"
  - `17`: "isPaused: Boolean"
  - `18`: "pausedAt: DateTime"
  - `19`: "pausedBy: String"
  - `20`: "notifyUsers: String"
  - `21`: "notifyOnWarning: Boolean"
  - `22`: "notifyOnCritical: Boolean"
  - `23`: "createdBy: String"
  - `24`: "createdAt: DateTime"
  - `25`: "updatedAt: DateTime"
  - `26`: "client: Client"
  - `27`: "creator: User"

### 📊 ClientOAuthConnection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "accessToken: String"
  - `4`: "refreshToken: String"
  - `5`: "tokenType: String"
  - `6`: "expiresAt: DateTime"
  - `7`: "scopes: String"
  - `8`: "status: String"
  - `9`: "lastError: String"
  - `10`: "lastSyncAt: DateTime"
  - `11`: "lastSyncStatus: String"
  - `12`: "connectedBy: String"
  - `13`: "connectedAt: DateTime"
  - `14`: "platformUserId: String"
  - `15`: "platformEmail: String"
  - `16`: "agencyAccessGranted: Boolean"
  - `17`: "agencyAccessVerifiedAt: DateTime"
  - `18`: "delegatedToEmail: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"
  - `22`: "accounts: PlatformAccount"

### 📊 PlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "connectionId: String"
  - `2`: "platform: String"
  - `3`: "accountId: String"
  - `4`: "accountName: String"
  - `5`: "accountType: String"
  - `6`: "metadata: String"
  - `7`: "isActive: Boolean"
  - `8`: "isPrimary: Boolean"
  - `9`: "lastSyncAt: DateTime"
  - `10`: "lastSyncStatus: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "connection: ClientOAuthConnection"
  - `14`: "metrics: PlatformMetric"

### 📊 PlatformMetric *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "date: DateTime"
  - `3`: "periodType: String"
  - `4`: "metricType: String"
  - `5`: "metricValue: Float"
  - `6`: "metricUnit: String"
  - `7`: "previousValue: Float"
  - `8`: "changePercent: Float"
  - `9`: "dimension: String"
  - `10`: "dimensionValue: String"
  - `11`: "rawData: String"
  - `12`: "createdAt: DateTime"
  - `13`: "account: PlatformAccount"

### 📊 PlatformSyncJob *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "connectionId: String"
  - `2`: "accountId: String"
  - `3`: "platform: String"
  - `4`: "syncType: String"
  - `5`: "status: String"
  - `6`: "startedAt: DateTime"
  - `7`: "completedAt: DateTime"
  - `8`: "recordsProcessed: Int"
  - `9`: "recordsFailed: Int"
  - `10`: "errorMessage: String"
  - `11`: "errorDetails: String"
  - `12`: "createdAt: DateTime"

### 📊 MagicLinkToken *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "channel: String"
  - `4`: "expiresAt: DateTime"
  - `5`: "usedAt: DateTime"
  - `6`: "createdAt: DateTime"
  - `7`: "user: User"

### 📊 PasswordResetToken *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "channel: String"
  - `4`: "purpose: String"
  - `5`: "expiresAt: DateTime"
  - `6`: "usedAt: DateTime"
  - `7`: "createdAt: DateTime"
  - `8`: "user: User"

### 📊 AgencyApiCredential *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "provider: String"
  - `2`: "credentialType: String"
  - `3`: "name: String"
  - `4`: "credentials: String"
  - `5`: "status: String"
  - `6`: "environment: String"
  - `7`: "lastVerifiedAt: DateTime"
  - `8`: "lastVerifiedBy: String"
  - `9`: "lastError: String"
  - `10`: "usageCount: Int"
  - `11`: "lastUsedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "createdBy: String"
  - `14`: "updatedAt: DateTime"
  - `15`: "updatedBy: String"
  - `16`: "auditLogs: ApiCredentialAuditLog"

### 📊 AgencyServiceAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "platform: String"
  - `2`: "serviceType: String"
  - `3`: "email: String"
  - `4`: "name: String"
  - `5`: "description: String"
  - `6`: "isActive: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"

### 📊 OAuthAccessRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "serviceType: String"
  - `4`: "targetEmail: String"
  - `5`: "status: String"
  - `6`: "instructionsSentAt: DateTime"
  - `7`: "accessVerifiedAt: DateTime"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"

### 📊 ApiCredentialAuditLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "credentialId: String"
  - `2`: "action: String"
  - `3`: "fieldChanged: String"
  - `4`: "userId: String"
  - `5`: "userIp: String"
  - `6`: "success: Boolean"
  - `7`: "errorMessage: String"
  - `8`: "createdAt: DateTime"
  - `9`: "credential: AgencyApiCredential"

### 📊 ClientPlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "accountId: String"
  - `4`: "accountName: String"
  - `5`: "accessType: String"
  - `6`: "isActive: Boolean"
  - `7`: "lastSyncAt: DateTime"
  - `8`: "lastSyncStatus: String"
  - `9`: "syncError: String"
  - `10`: "metadata: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "createdBy: String"
  - `14`: "client: Client"
  - `15`: "metrics: PlatformMetricEntry"

### 📊 PlatformMetricEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "date: DateTime"
  - `3`: "metricType: String"
  - `4`: "value: Float"
  - `5`: "dimension: String"
  - `6`: "dimensionValue: String"
  - `7`: "importSource: String"
  - `8`: "importBatchId: String"
  - `9`: "createdAt: DateTime"
  - `10`: "createdBy: String"
  - `11`: "account: ClientPlatformAccount"

### 📊 DataImportBatch *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "platform: String"
  - `3`: "accountId: String"
  - `4`: "importType: String"
  - `5`: "fileName: String"
  - `6`: "totalRows: Int"
  - `7`: "successRows: Int"
  - `8`: "failedRows: Int"
  - `9`: "errorLog: String"
  - `10`: "status: String"
  - `11`: "createdAt: DateTime"
  - `12`: "createdBy: String"
  - `13`: "completedAt: DateTime"
  - `14`: "client: Client"

### 📊 ClientUserInvitation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "email: String"
  - `3`: "name: String"
  - `4`: "role: String"
  - `5`: "token: String"
  - `6`: "expiresAt: DateTime"
  - `7`: "acceptedAt: DateTime"
  - `8`: "invitedById: String"
  - `9`: "status: String"
  - `10`: "createdAt: DateTime"
  - `11`: "client: Client"
  - `12`: "invitedBy: ClientUser"

### 📊 ClientUserActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientUserId: String"
  - `2`: "action: String"
  - `3`: "resource: String"
  - `4`: "resourceType: String"
  - `5`: "details: String"
  - `6`: "ipAddress: String"
  - `7`: "userAgent: String"
  - `8`: "createdAt: DateTime"
  - `9`: "clientUser: ClientUser"

### 📊 PortalNotification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "clientUserId: String"
  - `3`: "title: String"
  - `4`: "message: String"
  - `5`: "type: String"
  - `6`: "category: String"
  - `7`: "actionUrl: String"
  - `8`: "actionLabel: String"
  - `9`: "isRead: Boolean"
  - `10`: "readAt: DateTime"
  - `11`: "sourceType: String"
  - `12`: "sourceId: String"
  - `13`: "expiresAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "client: Client"
  - `16`: "clientUser: ClientUser"

### 📊 ClientDocument *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "description: String"
  - `4`: "category: String"
  - `5`: "fileUrl: String"
  - `6`: "fileType: String"
  - `7`: "fileSize: Int"
  - `8`: "version: Int"
  - `9`: "previousVersionId: String"
  - `10`: "uploadedById: String"
  - `11`: "uploadedByStaff: String"
  - `12`: "isPublic: Boolean"
  - `13`: "allowDownload: Boolean"
  - `14`: "sharedWith: String"
  - `15`: "expiresAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"
  - `19`: "uploadedBy: ClientUser"

### 📊 ClientAnnouncement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "content: String"
  - `3`: "type: String"
  - `4`: "priority: String"
  - `5`: "targetAll: Boolean"
  - `6`: "clientId: String"
  - `7`: "targetTiers: String"
  - `8`: "isPinned: Boolean"
  - `9`: "imageUrl: String"
  - `10`: "actionUrl: String"
  - `11`: "actionLabel: String"
  - `12`: "publishAt: DateTime"
  - `13`: "expiresAt: DateTime"
  - `14`: "createdById: String"
  - `15`: "isActive: Boolean"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 ClientGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "description: String"
  - `4`: "category: String"
  - `5`: "metricType: String"
  - `6`: "targetValue: Float"
  - `7`: "currentValue: Float"
  - `8`: "unit: String"
  - `9`: "periodType: String"
  - `10`: "startDate: DateTime"
  - `11`: "endDate: DateTime"
  - `12`: "status: String"
  - `13`: "achievedAt: DateTime"
  - `14`: "isVisible: Boolean"
  - `15`: "displayOrder: Int"
  - `16`: "color: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "client: Client"

### 📊 ContentApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "specifications: String"
  - `6`: "contentUrl: String"
  - `7`: "previewUrl: String"
  - `8`: "attachments: String"
  - `9`: "status: String"
  - `10`: "priority: String"
  - `11`: "dueDate: DateTime"
  - `12`: "reviewedById: String"
  - `13`: "reviewedAt: DateTime"
  - `14`: "reviewNote: String"
  - `15`: "revisionCount: Int"
  - `16`: "revisionNotes: String"
  - `17`: "createdById: String"
  - `18`: "reminderSent: Boolean"
  - `19`: "reminderSentAt: DateTime"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"
  - `22`: "client: Client"
  - `23`: "createdBy: User"
  - `24`: "reviewedBy: ClientUser"

### 📊 ClientAccessRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "requestedById: String"
  - `3`: "requestedRole: String"
  - `4`: "purpose: String"
  - `5`: "status: String"
  - `6`: "approvedById: String"
  - `7`: "approvedAt: DateTime"
  - `8`: "rejectionReason: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "approvedBy: User"
  - `12`: "client: Client"
  - `13`: "requestedBy: User"

### 📊 WebProjectPhase *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "phase: String"
  - `3`: "status: String"
  - `4`: "assignedTo: String"
  - `5`: "startedAt: DateTime"
  - `6`: "completedAt: DateTime"
  - `7`: "notes: String"
  - `8`: "proofUrl: String"
  - `9`: "order: Int"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "user: User"
  - `13`: "client: Client"

### 📊 MaintenanceContract *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "startDate: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "renewalDate: DateTime"
  - `6`: "amount: Float"
  - `7`: "status: String"
  - `8`: "autoRenew: Boolean"
  - `9`: "reminderSent: Boolean"
  - `10`: "notes: String"
  - `11`: "domainName: String"
  - `12`: "domainRegistrar: String"
  - `13`: "domainExpiryDate: DateTime"
  - `14`: "serverProvider: String"
  - `15`: "serverExpiryDate: DateTime"
  - `16`: "serverPlan: String"
  - `17`: "billingCycle: String"
  - `18`: "nextBillingDate: DateTime"
  - `19`: "allocatedHours: Float"
  - `20`: "usedHours: Float"
  - `21`: "hourlyRateAfter: Float"
  - `22`: "expiryReminderSent: Boolean"
  - `23`: "reminderSentAt: DateTime"
  - `24`: "createdAt: DateTime"
  - `25`: "updatedAt: DateTime"
  - `26`: "client: Client"
  - `27`: "maintenanceLogs: MaintenanceLog"

### 📊 ServiceChangeRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "proposalId: String"
  - `2`: "clientId: String"
  - `3`: "type: String"
  - `4`: "serviceId: String"
  - `5`: "serviceName: String"
  - `6`: "reason: String"
  - `7`: "status: String"
  - `8`: "reviewedAt: DateTime"
  - `9`: "reviewedBy: String"
  - `10`: "managerNotes: String"
  - `11`: "priceImpact: Float"
  - `12`: "effectiveFrom: DateTime"
  - `13`: "annexureNumber: String"
  - `14`: "annexureData: String"
  - `15`: "requestedAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 ServiceTermination *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "requestedBy: String"
  - `3`: "requestedAt: DateTime"
  - `4`: "reason: String"
  - `5`: "feedback: String"
  - `6`: "noticeStartDate: DateTime"
  - `7`: "noticeEndDate: DateTime"
  - `8`: "lastServiceDate: DateTime"
  - `9`: "monthlyFee: Float"
  - `10`: "daysInMonth: Int"
  - `11`: "daysServed: Int"
  - `12`: "proRataAmount: Float"
  - `13`: "proRataBreakdown: String"
  - `14`: "pendingDues: Float"
  - `15`: "totalDue: Float"
  - `16`: "amountPaid: Float"
  - `17`: "paymentCleared: Boolean"
  - `18`: "paymentClearedAt: DateTime"
  - `19`: "handoverCallScheduled: Boolean"
  - `20`: "handoverCallDate: DateTime"
  - `21`: "handoverCallCompleted: Boolean"
  - `22`: "handoverCallNotes: String"
  - `23`: "handoverMeetingId: String"
  - `24`: "dataExportEnabled: Boolean"
  - `25`: "dataExportedAt: DateTime"
  - `26`: "dataExportUrl: String"
  - `27`: "status: String"
  - `28`: "completedAt: DateTime"
  - `29`: "cancelledAt: DateTime"
  - `30`: "cancelledReason: String"
  - `31`: "processedBy: String"
  - `32`: "processedAt: DateTime"
  - `33`: "adminNotes: String"
  - `34`: "createdAt: DateTime"
  - `35`: "updatedAt: DateTime"
  - `36`: "client: Client"

### 📊 WebsiteSitemap *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "pageName: String"
  - `3`: "pageSlug: String"
  - `4`: "pageUrl: String"
  - `5`: "pageType: String"
  - `6`: "description: String"
  - `7`: "status: String"
  - `8`: "order: Int"
  - `9`: "wireframeUrl: String"
  - `10`: "designUrl: String"
  - `11`: "previewUrl: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "feedback: PageFeedback"
  - `15`: "client: Client"

### 📊 PageFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sitemapId: String"
  - `2`: "clientUserId: String"
  - `3`: "userId: String"
  - `4`: "feedbackType: String"
  - `5`: "message: String"
  - `6`: "screenshotUrl: String"
  - `7`: "status: String"
  - `8`: "parentId: String"
  - `9`: "createdAt: DateTime"
  - `10`: "resolvedAt: DateTime"
  - `11`: "clientUser: ClientUser"
  - `12`: "parent: PageFeedback"
  - `13`: "replies: PageFeedback"
  - `14`: "sitemap: WebsiteSitemap"
  - `15`: "user: User"

### 📊 WebOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "clientId: String"
  - `3`: "status: String"
  - `4`: "businessName: String"
  - `5`: "businessDescription: String"
  - `6`: "industry: String"
  - `7`: "targetAudience: String"
  - `8`: "websiteType: String"
  - `9`: "requiredPages: String"
  - `10`: "features: String"
  - `11`: "colorPreferences: String"
  - `12`: "stylePreference: String"
  - `13`: "referenceUrls: String"
  - `14`: "hasLogo: Boolean"
  - `15`: "hasContent: Boolean"
  - `16`: "logoUrl: String"
  - `17`: "brandGuideUrl: String"
  - `18`: "hasDomain: Boolean"
  - `19`: "domainName: String"
  - `20`: "hasHosting: Boolean"
  - `21`: "hostingProvider: String"
  - `22`: "contactName: String"
  - `23`: "contactEmail: String"
  - `24`: "contactPhone: String"
  - `25`: "submittedAt: DateTime"
  - `26`: "reviewedBy: String"
  - `27`: "convertedAt: DateTime"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "client: Client"

### 📊 Domain 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "domainName: String"
  - `3`: "registrar: String"
  - `4`: "registrationDate: DateTime"
  - `5`: "expiryDate: DateTime"
  - `6`: "autoRenew: Boolean"
  - `7`: "nameservers: String"
  - `8`: "dnsProvider: String"
  - `9`: "sslStatus: String"
  - `10`: "sslExpiryDate: DateTime"
  - `11`: "sslProvider: String"
  - `12`: "purchasedBy: String"
  - `13`: "annualCost: Float"
  - `14`: "loginUrl: String"
  - `15`: "notes: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "client: Client"

### 📊 HostingAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "provider: String"
  - `3`: "planType: String"
  - `4`: "planName: String"
  - `5`: "serverLocation: String"
  - `6`: "monthlyCost: Float"
  - `7`: "renewalDate: DateTime"
  - `8`: "storageGB: Float"
  - `9`: "bandwidthGB: Float"
  - `10`: "ipAddress: String"
  - `11`: "cpanelUrl: String"
  - `12`: "sshAccess: Boolean"
  - `13`: "sshHost: String"
  - `14`: "sshPort: Int"
  - `15`: "purchasedBy: String"
  - `16`: "status: String"
  - `17`: "loginUrl: String"
  - `18`: "notes: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"

### 📊 MaintenanceLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "contractId: String"
  - `2`: "date: DateTime"
  - `3`: "hoursSpent: Float"
  - `4`: "description: String"
  - `5`: "performedById: String"
  - `6`: "category: String"
  - `7`: "billable: Boolean"
  - `8`: "ticketId: String"
  - `9`: "attachments: String"
  - `10`: "clientVisible: Boolean"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "contract: MaintenanceContract"

### 📊 WebReimbursement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "description: String"
  - `4`: "vendor: String"
  - `5`: "amount: Float"
  - `6`: "currency: String"
  - `7`: "paidById: String"
  - `8`: "paidDate: DateTime"
  - `9`: "receiptUrl: String"
  - `10`: "invoiceUrl: String"
  - `11`: "status: String"
  - `12`: "approvedById: String"
  - `13`: "approvedAt: DateTime"
  - `14`: "rejectionReason: String"
  - `15`: "reimbursedDate: DateTime"
  - `16`: "billedToClient: Boolean"
  - `17`: "clientInvoiceId: String"
  - `18`: "notes: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"

### 📊 UpsellOpportunity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "type: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "estimatedValue: Float"
  - `6`: "probability: Int"
  - `7`: "status: String"
  - `8`: "assignedToId: String"
  - `9`: "source: String"
  - `10`: "triggerReason: String"
  - `11`: "pitchedDate: DateTime"
  - `12`: "pitchNotes: String"
  - `13`: "followUpDate: DateTime"
  - `14`: "wonDate: DateTime"
  - `15`: "lostDate: DateTime"
  - `16`: "lostReason: String"
  - `17`: "wonValue: Float"
  - `18`: "notes: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"
  - `21`: "client: Client"

### 📊 WebProject *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "description: String"
  - `4`: "projectType: String"
  - `5`: "status: String"
  - `6`: "priority: String"
  - `7`: "startDate: DateTime"
  - `8`: "targetEndDate: DateTime"
  - `9`: "actualEndDate: DateTime"
  - `10`: "quotedAmount: Float"
  - `11`: "finalAmount: Float"
  - `12`: "estimatedHours: Float"
  - `13`: "actualHours: Float"
  - `14`: "profitMargin: Float"
  - `15`: "platform: String"
  - `16`: "techStack: String"
  - `17`: "stagingUrl: String"
  - `18`: "productionUrl: String"
  - `19`: "repositoryUrl: String"
  - `20`: "figmaUrl: String"
  - `21`: "projectManagerId: String"
  - `22`: "leadDeveloperId: String"
  - `23`: "leadDesignerId: String"
  - `24`: "currentPhase: String"
  - `25`: "phaseProgress: String"
  - `26`: "notes: String"
  - `27`: "createdAt: DateTime"
  - `28`: "updatedAt: DateTime"
  - `29`: "bugReports: WebBugReport"
  - `30`: "changeRequests: WebChangeRequest"
  - `31`: "designApprovals: WebDesignApproval"
  - `32`: "client: Client"
  - `33`: "phases: WebProjectPhaseItem"
  - `34`: "timeEntries: WebProjectTimeEntry"

### 📊 WebProjectPhaseItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "phase: String"
  - `3`: "status: String"
  - `4`: "order: Int"
  - `5`: "assignedToId: String"
  - `6`: "startedAt: DateTime"
  - `7`: "completedAt: DateTime"
  - `8`: "approvedAt: DateTime"
  - `9`: "approvedById: String"
  - `10`: "checklist: String"
  - `11`: "requiresApproval: Boolean"
  - `12`: "approvalNotes: String"
  - `13`: "revisionCount: Int"
  - `14`: "deliverableUrls: String"
  - `15`: "notes: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "project: WebProject"

### 📊 WebBugReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "clientUserId: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "pageUrl: String"
  - `6`: "screenshotUrl: String"
  - `7`: "browserInfo: String"
  - `8`: "priority: String"
  - `9`: "status: String"
  - `10`: "assignedToId: String"
  - `11`: "resolvedAt: DateTime"
  - `12`: "resolvedById: String"
  - `13`: "resolution: String"
  - `14`: "fixedInVersion: String"
  - `15`: "estimatedHours: Float"
  - `16`: "actualHours: Float"
  - `17`: "isBillable: Boolean"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "User_WebBugReport_assignedToIdToUser: User"
  - `21`: "project: WebProject"
  - `22`: "User_WebBugReport_resolvedByIdToUser: User"

### 📊 WebChangeRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "clientUserId: String"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "type: String"
  - `6`: "pageUrl: String"
  - `7`: "screenshotUrl: String"
  - `8`: "estimatedHours: Float"
  - `9`: "estimatedCost: Float"
  - `10`: "requiresApproval: Boolean"
  - `11`: "status: String"
  - `12`: "clientApprovedAt: DateTime"
  - `13`: "rejectionReason: String"
  - `14`: "assignedToId: String"
  - `15`: "completedAt: DateTime"
  - `16`: "completedById: String"
  - `17`: "actualHours: Float"
  - `18`: "actualCost: Float"
  - `19`: "isBillable: Boolean"
  - `20`: "invoiced: Boolean"
  - `21`: "invoiceId: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"
  - `24`: "User_WebChangeRequest_assignedToIdToUser: User"
  - `25`: "User_WebChangeRequest_completedByIdToUser: User"
  - `26`: "project: WebProject"

### 📊 WebDesignApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "designUrl: String"
  - `5`: "thumbnailUrl: String"
  - `6`: "phase: String"
  - `7`: "version: Int"
  - `8`: "status: String"
  - `9`: "clientUserId: String"
  - `10`: "reviewedAt: DateTime"
  - `11`: "clientFeedback: String"
  - `12`: "feedbackPins: String"
  - `13`: "designerId: String"
  - `14`: "internalNotes: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "project: WebProject"

### 📊 WebProjectTimeEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "userId: String"
  - `3`: "date: DateTime"
  - `4`: "hours: Float"
  - `5`: "description: String"
  - `6`: "phase: String"
  - `7`: "category: String"
  - `8`: "isBillable: Boolean"
  - `9`: "invoiced: Boolean"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "project: WebProject"

### 📊 DailyMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "date: DateTime"
  - `3`: "checkInTime: DateTime"
  - `4`: "yesterdayWork: String"
  - `5`: "yesterdayBlockers: String"
  - `6`: "todayPlan: String"
  - `7`: "todayClients: String"
  - `8`: "estimatedHours: Float"
  - `9`: "workload: String"
  - `10`: "mood: String"
  - `11`: "needsHelp: Boolean"
  - `12`: "helpDescription: String"
  - `13`: "workLocation: String"
  - `14`: "isLate: Boolean"
  - `15`: "autoMarked: Boolean"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "user: User"

### 📊 MeetingCompliance *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "dailyMeetingsExpected: Int"
  - `4`: "dailyMeetingsFilled: Int"
  - `5`: "dailyMeetingsLate: Int"
  - `6`: "dailyMeetingsMissed: Int"
  - `7`: "autoMarkedLeaves: Int"
  - `8`: "tacticalFilled: Boolean"
  - `9`: "tacticalFilledAt: DateTime"
  - `10`: "tacticalIsLate: Boolean"
  - `11`: "strategicFilled: Boolean"
  - `12`: "strategicFilledAt: DateTime"
  - `13`: "strategicIsLate: Boolean"
  - `14`: "complianceScore: Float"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "user: User"

### 📊 AIExtractionSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "targetType: String"
  - `3`: "targetId: String"
  - `4`: "clientId: String"
  - `5`: "messages: String"
  - `6`: "extractedData: String"
  - `7`: "confidence: Float"
  - `8`: "status: String"
  - `9`: "completedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "client: Client"
  - `13`: "user: User"

### 📊 SystemSetting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "key: String"
  - `2`: "value: String"
  - `3`: "category: String"
  - `4`: "description: String"
  - `5`: "updatedBy: String"
  - `6`: "updatedAt: DateTime"
  - `7`: "createdAt: DateTime"

### 📊 SeoKeyword *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "keyword: String"
  - `3`: "location: String"
  - `4`: "searchVolume: Int"
  - `5`: "currentRank: Int"
  - `6`: "previousRank: Int"
  - `7`: "targetPage: String"
  - `8`: "isActive: Boolean"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"
  - `12`: "rankHistory: SeoRankHistory"

### 📊 SeoRankHistory *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "keywordId: String"
  - `2`: "rank: Int"
  - `3`: "date: DateTime"
  - `4`: "keyword: SeoKeyword"

### 📊 SeoBacklink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "targetUrl: String"
  - `3`: "anchorText: String"
  - `4`: "backlinkSource: String"
  - `5`: "domainAuthority: Int"
  - `6`: "status: String"
  - `7`: "liveUrl: String"
  - `8`: "submittedDate: DateTime"
  - `9`: "createdById: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "client: Client"
  - `13`: "createdBy: User"

### 📊 SeoContent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "blogTopic: String"
  - `3`: "targetKeyword: String"
  - `4`: "writerId: String"
  - `5`: "status: String"
  - `6`: "wordCount: Int"
  - `7`: "publishedUrl: String"
  - `8`: "deadline: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "client: Client"
  - `12`: "writer: User"

### 📊 GbpProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "profileName: String"
  - `3`: "location: String"
  - `4`: "category: String"
  - `5`: "totalReviews: Int"
  - `6`: "rating: Float"
  - `7`: "status: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "metrics: GbpMetric"
  - `11`: "posts: GbpPost"
  - `12`: "client: Client"

### 📊 GbpPost *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "profileId: String"
  - `2`: "postType: String"
  - `3`: "content: String"
  - `4`: "proofLink: String"
  - `5`: "views: Int"
  - `6`: "publishedAt: DateTime"
  - `7`: "createdAt: DateTime"
  - `8`: "profile: GbpProfile"

### 📊 GbpMetric *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "profileId: String"
  - `2`: "month: String"
  - `3`: "calls: Int"
  - `4`: "directions: Int"
  - `5`: "profileViews: Int"
  - `6`: "websiteClicks: Int"
  - `7`: "monthlyPosts: Int"
  - `8`: "createdAt: DateTime"
  - `9`: "profile: GbpProfile"

### 📊 SeoTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "taskType: String"
  - `3`: "category: String"
  - `4`: "description: String"
  - `5`: "assignedToId: String"
  - `6`: "reviewerId: String"
  - `7`: "priority: String"
  - `8`: "status: String"
  - `9`: "deadline: DateTime"
  - `10`: "completedAt: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "assignedTo: User"
  - `14`: "client: Client"
  - `15`: "reviewer: User"

### 📊 Campaign 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "name: String"
  - `3`: "platform: String"
  - `4`: "campaignType: String"
  - `5`: "objective: String"
  - `6`: "status: String"
  - `7`: "externalId: String"
  - `8`: "dailyBudget: Float"
  - `9`: "monthlyBudget: Float"
  - `10`: "totalBudget: Float"
  - `11`: "currency: String"
  - `12`: "targetAudience: String"
  - `13`: "keywords: String"
  - `14`: "placements: String"
  - `15`: "impressions: Int"
  - `16`: "clicks: Int"
  - `17`: "conversions: Int"
  - `18`: "leads: Int"
  - `19`: "spend: Float"
  - `20`: "cpc: Float"
  - `21`: "cpl: Float"
  - `22`: "ctr: Float"
  - `23`: "roas: Float"
  - `24`: "qualityScore: Float"
  - `25`: "startDate: DateTime"
  - `26`: "endDate: DateTime"
  - `27`: "assignedToId: String"
  - `28`: "createdById: String"
  - `29`: "createdAt: DateTime"
  - `30`: "updatedAt: DateTime"
  - `31`: "abTests: ABTest"
  - `32`: "adCreatives: AdCreative"
  - `33`: "adSpendRecords: AdSpend"
  - `34`: "assignedTo: User"
  - `35`: "client: Client"
  - `36`: "conversionEvents: ConversionEvent"

### 📊 AdCreative *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "name: String"
  - `4`: "type: String"
  - `5`: "platform: String"
  - `6`: "status: String"
  - `7`: "headline: String"
  - `8`: "description: String"
  - `9`: "callToAction: String"
  - `10`: "mediaUrl: String"
  - `11`: "thumbnailUrl: String"
  - `12`: "landingPageUrl: String"
  - `13`: "impressions: Int"
  - `14`: "clicks: Int"
  - `15`: "conversions: Int"
  - `16`: "ctr: Float"
  - `17`: "approvedById: String"
  - `18`: "approvedAt: DateTime"
  - `19`: "rejectionReason: String"
  - `20`: "version: Int"
  - `21`: "parentId: String"
  - `22`: "createdById: String"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"
  - `25`: "campaign: Campaign"

### 📊 AdSpend *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "date: DateTime"
  - `4`: "platform: String"
  - `5`: "amount: Float"
  - `6`: "currency: String"
  - `7`: "impressions: Int"
  - `8`: "clicks: Int"
  - `9`: "conversions: Int"
  - `10`: "leads: Int"
  - `11`: "cpc: Float"
  - `12`: "cpl: Float"
  - `13`: "ctr: Float"
  - `14`: "roas: Float"
  - `15`: "createdAt: DateTime"
  - `16`: "campaign: Campaign"

### 📊 BudgetAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "month: DateTime"
  - `3`: "platform: String"
  - `4`: "allocatedAmount: Float"
  - `5`: "spentAmount: Float"
  - `6`: "currency: String"
  - `7`: "dailyTarget: Float"
  - `8`: "pacingStatus: String"
  - `9`: "approvedById: String"
  - `10`: "approvedAt: DateTime"
  - `11`: "notes: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "client: Client"

### 📊 ABTest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "name: String"
  - `4`: "hypothesis: String"
  - `5`: "status: String"
  - `6`: "testType: String"
  - `7`: "variantA: String"
  - `8`: "variantB: String"
  - `9`: "winner: String"
  - `10`: "confidenceLevel: Float"
  - `11`: "startDate: DateTime"
  - `12`: "endDate: DateTime"
  - `13`: "conclusion: String"
  - `14`: "createdById: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "campaign: Campaign"

### 📊 ConversionEvent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "clientId: String"
  - `3`: "eventName: String"
  - `4`: "platform: String"
  - `5`: "source: String"
  - `6`: "leadName: String"
  - `7`: "leadEmail: String"
  - `8`: "leadPhone: String"
  - `9`: "adSpend: Float"
  - `10`: "revenue: Float"
  - `11`: "occurredAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "campaign: Campaign"

### 📊 QcReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "taskTitle: String"
  - `3`: "taskType: String"
  - `4`: "submittedById: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "reviewerId: String"
  - `7`: "reviewedAt: DateTime"
  - `8`: "status: String"
  - `9`: "feedback: String"
  - `10`: "priority: String"
  - `11`: "deadline: DateTime"
  - `12`: "completedAt: DateTime"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "client: Client"
  - `16`: "submittedBy: User"
  - `17`: "reviewer: User"

### 📊 ClientApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "deliverable: String"
  - `3`: "deliverableType: String"
  - `4`: "submittedById: String"
  - `5`: "submittedAt: DateTime"
  - `6`: "reviewerName: String"
  - `7`: "status: String"
  - `8`: "feedback: String"
  - `9`: "dueDate: DateTime"
  - `10`: "completedAt: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"
  - `13`: "client: Client"
  - `14`: "submittedBy: User"

### 📊 YouTubeVideo *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "videoTitle: String"
  - `3`: "videoUrl: String"
  - `4`: "thumbnailUrl: String"
  - `5`: "channelName: String"
  - `6`: "views: Int"
  - `7`: "likes: Int"
  - `8`: "comments: Int"
  - `9`: "subscribers: Int"
  - `10`: "duration: String"
  - `11`: "publishedAt: DateTime"
  - `12`: "status: String"
  - `13`: "priority: String"
  - `14`: "assignedToId: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "client: Client"
  - `18`: "assignedTo: User"

### 📊 SeoReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "title: String"
  - `3`: "reportType: String"
  - `4`: "period: String"
  - `5`: "status: String"
  - `6`: "metrics: Json"
  - `7`: "publishedAt: DateTime"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"
  - `10`: "client: Client"

### 📊 DistributedLock *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "lockName: String"
  - `2`: "acquiredAt: DateTime"
  - `3`: "expiresAt: DateTime"

### 📊 User 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "empId: String"
  - `2`: "firstName: String"
  - `3`: "lastName: String"
  - `4`: "phone: String"
  - `5`: "email: String"
  - `6`: "password: String"
  - `7`: "twoFactorEnabled: Boolean"
  - `8`: "twoFactorSecret: String"
  - `9`: "twoFactorBackupCodes: String"
  - `10`: "twoFactorVerifiedAt: DateTime"
  - `11`: "role: String"
  - `12`: "department: String"
  - `13`: "employeeType: String"
  - `14`: "joiningDate: DateTime"
  - `15`: "dateOfBirth: DateTime"
  - `16`: "status: String"
  - `17`: "bloodGroup: String"
  - `18`: "address: String"
  - `19`: "languages: String"
  - `20`: "aiTools: String"
  - `21`: "education: String"
  - `22`: "healthConditions: String"
  - `23`: "capacity: Int"
  - `24`: "buddyId: String"
  - `25`: "buddy: User"
  - `26`: "buddies: User"
  - `27`: "profileCompletionStatus: String"
  - `28`: "onboardingStep: Int"
  - `29`: "hrVerifiedBy: String"
  - `30`: "hrVerifiedAt: DateTime"
  - `31`: "profile: Profile"
  - `32`: "rbcPot: RBC_Pot"
  - `33`: "attendance: Attendance"
  - `34`: "violations: Violations"
  - `35`: "accountability: AccountabilityCharter"
  - `36`: "scores: PerformanceScore"
  - `37`: "assignedTasks: Task"
  - `38`: "createdTasks: Task"
  - `39`: "reviewedTasks: Task"
  - `40`: "notifications: Notification"
  - `41`: "clientAssignments: ClientTeamMember"
  - `42`: "meetings: MeetingParticipant"
  - `43`: "trainings: UserTraining"
  - `44`: "certifications: UserCertification"
  - `45`: "communicationLogs: CommunicationLog"
  - `46`: "posts: Post"
  - `47`: "comments: Comment"
  - `48`: "likes: Like"
  - `49`: "ideas: Idea"
  - `50`: "ideaVotes: IdeaVote"
  - `51`: "recognition: Recognition"
  - `52`: "givenRecognition: Recognition"
  - `53`: "leaveRequests: LeaveRequest"
  - `54`: "documents: Document"
  - `55`: "onboardingChecklist: EmployeeOnboardingChecklist"
  - `56`: "issues: Issue"
  - `57`: "createdIssues: Issue"
  - `58`: "assignedLeads: Lead"
  - `59`: "leadActivities: LeadActivity"
  - `60`: "followUpReminders: FollowUpReminder"
  - `61`: "nurturingActions: LeadNurturingAction"
  - `62`: "salesHandovers: SalesHandover"
  - `63`: "accountsHandovers: SalesHandover"
  - `64`: "salesMeetings: SalesMeeting"
  - `65`: "salesWhatsAppMessages: SalesWhatsAppMessage"
  - `66`: "salesDeals: SalesDeal"
  - `67`: "salesDailyTasks: SalesDailyTask"
  - `68`: "allocatedDailyTasks: DailyTask"
  - `69`: "reviewedDailyTasks: DailyTask"
  - `70`: "supportTickets: SupportTicket"
  - `71`: "ticketActivities: TicketActivity"
  - `72`: "accountabilityScores: AccountabilityScore"
  - `73`: "workDeliverables: WorkDeliverable"
  - `74`: "achievements: Achievement"
  - `75`: "tacticalGoals: TacticalGoal"
  - `76`: "incentivePayouts: IncentivePayout"
  - `77`: "resourceComments: LearningResourceComment"
  - `78`: "taskComments: TaskComment"
  - `79`: "timeEntries: TimeEntry"
  - `80`: "arcadeTransactions: ArcadePointTransaction"
  - `81`: "arcadeRedemptions: ArcadeRedemption"
  - `82`: "leaveBalances: LeaveBalance"
  - `83`: "rbcAccruals: RBCAccrual"
  - `84`: "rbcPayouts: RBCPayout"
  - `85`: "pipPlans: PIPPlan"
  - `86`: "pipManagedPlans: PIPPlan"
  - `87`: "assetAssignments: AssetAssignment"
  - `88`: "exitProcesses: ExitProcess"
  - `89`: "fnfSettlements: FnFSettlement"
  - `90`: "referralsMade: ReferralBonus"
  - `91`: "referralsReceived: ReferralBonus"
  - `92`: "meetingActionItems: MeetingActionItem"
  - `93`: "appraisalDate: DateTime"
  - `94`: "learningLogs: LearningLog"
  - `95`: "learningVerifications: LearningVerification"
  - `96`: "learningAudits: LearningAudit"
  - `97`: "dailyTaskPlans: DailyTaskPlan"
  - `98`: "createdChannels: ChatChannel"
  - `99`: "channelMemberships: ChatChannelMember"
  - `100`: "sentMessages: ChatMessage"
  - `101`: "sentDirectMessages: DirectMessage"
  - `102`: "receivedDirectMessages: DirectMessage"
  - `103`: "tacticalMeetings: TacticalMeeting"
  - `104`: "dailyMeetings: DailyMeeting"
  - `105`: "meetingCompliance: MeetingCompliance"
  - `106`: "aiExtractions: AIExtractionSession"
  - `107`: "loginSessions: LoginSession"
  - `108`: "customRoles: UserCustomRole"
  - `109`: "whatsAppAccess: WhatsAppAccess"
  - `110`: "assignedWhatsAppChats: EmployeeWhatsAppChat"
  - `111`: "conductedInterviews: Interview"
  - `112`: "assignedCandidates: Candidate"
  - `113`: "employeeProposals: EmployeeProposal"
  - `114`: "createdEmployeeProposals: EmployeeProposal"
  - `115`: "employeeClientFeedback: EmployeeClientFeedback"
  - `116`: "escalationsReceived: EmployeeEscalation"
  - `117`: "escalationsReported: EmployeeEscalation"
  - `118`: "appreciationsReceived: EmployeeAppreciation"
  - `119`: "appreciationsGiven: EmployeeAppreciation"
  - `120`: "managerReviewsReceived: ManagerBehaviorReview"
  - `121`: "managerReviewsConducted: ManagerBehaviorReview"
  - `122`: "brandingContentCreated: EmployerBrandingContent"
  - `123`: "brandingContentApproved: EmployerBrandingContent"
  - `124`: "contentIdeas: ContentIdea"
  - `125`: "activitiesOrganized: EngagementActivity"
  - `126`: "activitiesApproved: EngagementActivity"
  - `127`: "workAnniversaries: WorkAnniversaryReminder"
  - `128`: "day0Tasks: Day0Task"
  - `129`: "day0Assignments: Day0Task"
  - `130`: "googleDrive: UserGoogleDrive"
  - `131`: "workEntries: WorkEntry"
  - `132`: "whatsAppChatNotes: WhatsAppChatNote"
  - `133`: "sharedWhatsAppChats: SharedWhatsAppChat"
  - `134`: "socialMediaPosts: SocialMediaPost"
  - `135`: "monthlyGrowthScores: MonthlyGrowthScore"
  - `136`: "socialMediaPageMetrics: SocialMediaPageMetrics"
  - `137`: "clientCapacity: Int"
  - `138`: "deliverablesCreated: ClientDeliverable"
  - `139`: "deliverablesSubmitted: ClientDeliverable"
  - `140`: "deliverablesReviewed: ClientDeliverable"
  - `141`: "expensesCreated: RecurringExpense"
  - `142`: "expensePayments: ExpensePayment"
  - `143`: "goalsOwned: Goal"
  - `144`: "goalsCreated: Goal"
  - `145`: "budgetAlerts: BudgetAlert"
  - `146`: "deviceRequests: DeviceRequest"
  - `147`: "magicLinkTokens: MagicLinkToken"
  - `148`: "passwordResetTokens: PasswordResetToken"
  - `149`: "clientAccessRequests: ClientAccessRequest"
  - `150`: "approvedAccessRequests: ClientAccessRequest"
  - `151`: "assignedWebPhases: WebProjectPhase"
  - `152`: "requestedTestimonials: VideoTestimonial"
  - `153`: "verifiedTestimonials: VideoTestimonial"
  - `154`: "pageFeedback: PageFeedback"
  - `155`: "internProfile: InternProfile"
  - `156`: "freelancerProfile: FreelancerProfile"
  - `157`: "impersonationsAsAdmin: ImpersonationSession"
  - `158`: "impersonationsAsTarget: ImpersonationSession"
  - `159`: "attendanceImports: AttendanceImport"
  - `160`: "quotesCreated: Quote"
  - `161`: "seoBacklinksCreated: SeoBacklink"
  - `162`: "seoContentWritten: SeoContent"
  - `163`: "seoTasksAssigned: SeoTask"
  - `164`: "seoTasksReviewing: SeoTask"
  - `165`: "assignedCampaigns: Campaign"
  - `166`: "deletedAt: DateTime"
  - `167`: "createdAt: DateTime"
  - `168`: "updatedAt: DateTime"

### 📊 Profile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "ndaSigned: Boolean"
  - `4`: "ndaSignedAt: DateTime"
  - `5`: "biometricPunch: Boolean"
  - `6`: "razorpayLinked: Boolean"
  - `7`: "profilePicture: String"
  - `8`: "panCard: String"
  - `9`: "aadhaar: String"
  - `10`: "linkedIn: String"
  - `11`: "favoriteFood: String"
  - `12`: "parentsPhone1: String"
  - `13`: "parentsPhone2: String"
  - `14`: "livingSituation: String"
  - `15`: "distanceFromOffice: String"
  - `16`: "skills: String"
  - `17`: "bio: String"
  - `18`: "emergencyContactName: String"
  - `19`: "emergencyContactPhone: String"
  - `20`: "panCardUrl: String"
  - `21`: "aadhaarUrl: String"
  - `22`: "bankDetailsUrl: String"
  - `23`: "educationCertUrl: String"
  - `24`: "employeeHandbookAccepted: Boolean"
  - `25`: "socialMediaPolicyAccepted: Boolean"
  - `26`: "clientConfidentialityAccepted: Boolean"
  - `27`: "allPoliciesAccepted: Boolean"
  - `28`: "policiesAcceptedAt: DateTime"
  - `29`: "completionPercentage: Int"
  - `30`: "signatureData: String"
  - `31`: "signatureType: String"
  - `32`: "signedAt: DateTime"
  - `33`: "selfieImage: String"
  - `34`: "kycVerifiedAt: DateTime"
  - `35`: "allocatedDeviceType: String"
  - `36`: "allocatedDeviceId: String"
  - `37`: "personalMobileNumber: String"
  - `38`: "officialPhoneNumber: String"
  - `39`: "hasWhatsAppAccess: Boolean"
  - `40`: "deviceAllocatedAt: DateTime"

### 📊 VideoTestimonial *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "requestedById: String"
  - `2`: "requestedBy: User"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "requestedAt: DateTime"
  - `6`: "requestMessage: String"
  - `7`: "clientContactName: String"
  - `8`: "clientContactEmail: String"
  - `9`: "youtubeUrl: String"
  - `10`: "thumbnailUrl: String"
  - `11`: "title: String"
  - `12`: "description: String"
  - `13`: "duration: Int"
  - `14`: "status: String"
  - `15`: "receivedAt: DateTime"
  - `16`: "verifiedAt: DateTime"
  - `17`: "verifiedById: String"
  - `18`: "verifiedBy: User"
  - `19`: "verificationNotes: String"
  - `20`: "voucherAmount: Float"
  - `21`: "voucherCode: String"
  - `22`: "rewardedAt: DateTime"
  - `23`: "badgeColor: String"
  - `24`: "isFeatured: Boolean"
  - `25`: "displayOrder: Int"
  - `26`: "createdAt: DateTime"
  - `27`: "updatedAt: DateTime"

### 📊 Client 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "logoUrl: String"
  - `3`: "contactName: String"
  - `4`: "contactEmail: String"
  - `5`: "contactPhone: String"
  - `6`: "whatsapp: String"
  - `7`: "websiteUrl: String"
  - `8`: "address: String"
  - `9`: "gstNumber: String"
  - `10`: "panNumber: String"
  - `11`: "state: String"
  - `12`: "city: String"
  - `13`: "pincode: String"
  - `14`: "businessType: String"
  - `15`: "industry: String"
  - `16`: "monthlyBudget: String"
  - `17`: "monthlyFee: Float"
  - `18`: "tier: String"
  - `19`: "clientSegment: String"
  - `20`: "status: String"
  - `21`: "clientType: String"
  - `22`: "isWebTeamClient: Boolean"
  - `23`: "addedByUserId: String"
  - `24`: "webProjectStatus: String"
  - `25`: "webProjectStartDate: DateTime"
  - `26`: "webProjectEndDate: DateTime"
  - `27`: "webProjectNotes: String"
  - `28`: "websiteType: String"
  - `29`: "techStack: String"
  - `30`: "parentClientId: String"
  - `31`: "parentClient: Client"
  - `32`: "subClients: Client"
  - `33`: "brandName: String"
  - `34`: "serviceSegment: String"
  - `35`: "billingType: String"
  - `36`: "billingAmount: Float"
  - `37`: "concernedPerson: String"
  - `38`: "concernedPersonPhone: String"
  - `39`: "isLost: Boolean"
  - `40`: "lostReason: String"
  - `41`: "stoppedServices: Boolean"
  - `42`: "upsellPotential: String"
  - `43`: "linkedClientId: String"
  - `44`: "linkedClient: Client"
  - `45`: "linkedClients: Client"
  - `46`: "paymentStatus: String"
  - `47`: "paymentDueDay: Int"
  - `48`: "invoiceDayOfMonth: Int"
  - `49`: "invoiceStatus: String"
  - `50`: "currentPaymentStatus: String"
  - `51`: "bankAccount: String"
  - `52`: "advanceAmount: Float"
  - `53`: "pendingAmount: Float"
  - `54`: "services: String"
  - `55`: "reminderFrequency: String"
  - `56`: "paymentTerms: String"
  - `57`: "customPaymentDays: Int"
  - `58`: "preferredContact: String"
  - `59`: "haltReminders: Boolean"
  - `60`: "accountsNotes: String"
  - `61`: "healthScore: Int"
  - `62`: "healthStatus: String"
  - `63`: "projectStatus: String"
  - `64`: "projectPriority: String"
  - `65`: "platform: String"
  - `66`: "startDate: DateTime"
  - `67`: "endDate: DateTime"
  - `68`: "progress: Int"
  - `69`: "onboardingToken: String"
  - `70`: "onboardingStatus: String"
  - `71`: "slaSigned: Boolean"
  - `72`: "slaSignedAt: DateTime"
  - `73`: "slaDocumentUrl: String"
  - `74`: "sowSigned: Boolean"
  - `75`: "sowSignedAt: DateTime"
  - `76`: "sowDocumentUrl: String"
  - `77`: "initialPaymentConfirmed: Boolean"
  - `78`: "initialPaymentDate: DateTime"
  - `79`: "lifecycleStage: String"
  - `80`: "leadId: String"
  - `81`: "entityType: String"
  - `82`: "poNumber: String"
  - `83`: "welcomeMessageSent: Boolean"
  - `84`: "onboardingFormCompleted: Boolean"
  - `85`: "accountManagerId: String"
  - `86`: "onboardingSharedBy: String"
  - `87`: "onboardingSharedAt: DateTime"
  - `88`: "proposalId: String"
  - `89`: "paymentConfirmedAt: DateTime"
  - `90`: "ledgerStartedAt: DateTime"
  - `91`: "clientPortal: ClientPortal"
  - `92`: "primaryGoal: String"
  - `93`: "ndaSigned: Boolean"
  - `94`: "contractLength: String"
  - `95`: "referralSource: String"
  - `96`: "notes: String"
  - `97`: "facebookUrl: String"
  - `98`: "instagramUrl: String"
  - `99`: "linkedinUrl: String"
  - `100`: "twitterUrl: String"
  - `101`: "youtubeUrl: String"
  - `102`: "competitor1: String"
  - `103`: "competitor2: String"
  - `104`: "competitor3: String"
  - `105`: "targetAudience: String"
  - `106`: "brandAssets: String"
  - `107`: "selectedServices: String"
  - `108`: "contentTypes: String"
  - `109`: "credentials: String"
  - `110`: "accountability: AccountabilityCharter"
  - `111`: "teamMembers: ClientTeamMember"
  - `112`: "tasks: Task"
  - `113`: "meetings: Meeting"
  - `114`: "contracts: Contract"
  - `115`: "invoices: Invoice"
  - `116`: "scopes: ClientScope"
  - `117`: "communicationLogs: CommunicationLog"
  - `118`: "communicationSchedules: CommunicationSchedule"
  - `119`: "documents: Document"
  - `120`: "reports: Report"
  - `121`: "leads: Lead"
  - `122`: "lifecycleEvents: ClientLifecycleEvent"
  - `123`: "clientUsers: ClientUser"
  - `124`: "clientCredentials: ClientCredential"
  - `125`: "supportTickets: SupportTicket"
  - `126`: "rfpSubmissions: RFPSubmission"
  - `127`: "slaDocuments: SLADocument"
  - `128`: "workDeliverables: WorkDeliverable"
  - `129`: "achievements: Achievement"
  - `130`: "dailyTasks: DailyTask"
  - `131`: "properties: ClientProperty"
  - `132`: "tacticalKPIEntries: TacticalKPIEntry"
  - `133`: "aiExtractions: AIExtractionSession"
  - `134`: "clientFeedback: ClientFeedback"
  - `135`: "clientPortalFeedback: ClientPortalFeedback"
  - `136`: "employeeEscalations: EmployeeEscalation"
  - `137`: "employeeAppreciations: EmployeeAppreciation"
  - `138`: "employeeClientFeedbacks: EmployeeClientFeedback"
  - `139`: "whatsAppGroups: ClientWhatsAppGroup"
  - `140`: "operationsLogs: ClientOperationsLog"
  - `141`: "whatsAppMessages: WhatsAppMessage"
  - `142`: "paymentCollections: PaymentCollection"
  - `143`: "paymentFollowUps: PaymentFollowUp"
  - `144`: "ledgerEntries: ClientLedger"
  - `145`: "bankTransactions: BankTransaction"
  - `146`: "autoInvoiceConfig: AutoInvoiceConfig"
  - `147`: "workEntries: WorkEntry"
  - `148`: "sharedWhatsAppChats: SharedWhatsAppChat"
  - `149`: "socialMediaPosts: SocialMediaPost"
  - `150`: "socialMediaPageMetrics: SocialMediaPageMetrics"
  - `151`: "deliverables: ClientDeliverable"
  - `152`: "expenseAllocations: ExpenseAllocation"
  - `153`: "budgetAlerts: BudgetAlert"
  - `154`: "oauthConnections: ClientOAuthConnection"
  - `155`: "oauthAccessRequests: OAuthAccessRequest"
  - `156`: "platformAccounts: ClientPlatformAccount"
  - `157`: "importBatches: DataImportBatch"
  - `158`: "portalNotifications: PortalNotification"
  - `159`: "portalDocuments: ClientDocument"
  - `160`: "portalAnnouncements: ClientAnnouncement"
  - `161`: "portalGoals: ClientGoal"
  - `162`: "contentApprovals: ContentApproval"
  - `163`: "userInvitations: ClientUserInvitation"
  - `164`: "accessRequests: ClientAccessRequest"
  - `165`: "webProjectPhases: WebProjectPhase"
  - `166`: "maintenanceContracts: MaintenanceContract"
  - `167`: "sitemapPages: WebsiteSitemap"
  - `168`: "webOnboardings: WebOnboarding"
  - `169`: "videoTestimonials: VideoTestimonial"
  - `170`: "goals: Goal"
  - `171`: "clientOnboardingChecklist: ClientOnboardingChecklist"
  - `172`: "terminations: ServiceTermination"
  - `173`: "terminationStatus: String"
  - `174`: "automations: Automation"
  - `175`: "expenses: Expense"
  - `176`: "domains: Domain"
  - `177`: "hostingAccounts: HostingAccount"
  - `178`: "webReimbursements: WebReimbursement"
  - `179`: "upsellOpportunities: UpsellOpportunity"
  - `180`: "webProjects: WebProject"
  - `181`: "seoKeywords: SeoKeyword"
  - `182`: "seoBacklinks: SeoBacklink"
  - `183`: "seoContent: SeoContent"
  - `184`: "gbpProfiles: GbpProfile"
  - `185`: "seoTasks: SeoTask"
  - `186`: "campaigns: Campaign"
  - `187`: "budgetAllocations: BudgetAllocation"
  - `188`: "deletedAt: DateTime"
  - `189`: "createdAt: DateTime"
  - `190`: "updatedAt: DateTime"

### 📊 ClientTeamMember *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "role: String"
  - `6`: "isPrimary: Boolean"
  - `7`: "assignedAt: DateTime"

### 📊 ClientScope *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "category: String"
  - `4`: "item: String"
  - `5`: "quantity: Int"
  - `6`: "delivered: Int"
  - `7`: "month: DateTime"
  - `8`: "status: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 ClientDeliverable *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "category: String"
  - `4`: "workItem: String"
  - `5`: "description: String"
  - `6`: "month: String"
  - `7`: "proofUrl: String"
  - `8`: "kpi: String"
  - `9`: "status: String"
  - `10`: "submittedAt: DateTime"
  - `11`: "submittedById: String"
  - `12`: "submittedBy: User"
  - `13`: "reviewedAt: DateTime"
  - `14`: "reviewedById: String"
  - `15`: "reviewedBy: User"
  - `16`: "reviewNotes: String"
  - `17`: "clientVisible: Boolean"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "createdById: String"
  - `21`: "createdBy: User"

### 📊 Task 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "department: String"
  - `4`: "priority: String"
  - `5`: "status: String"
  - `6`: "type: String"
  - `7`: "dueDate: DateTime"
  - `8`: "startDate: DateTime"
  - `9`: "completedAt: DateTime"
  - `10`: "assigneeId: String"
  - `11`: "assignee: User"
  - `12`: "creatorId: String"
  - `13`: "creator: User"
  - `14`: "reviewerId: String"
  - `15`: "reviewer: User"
  - `16`: "clientId: String"
  - `17`: "client: Client"
  - `18`: "qaStatus: String"
  - `19`: "qaComments: String"
  - `20`: "qaReviewedAt: DateTime"
  - `21`: "isRecurring: Boolean"
  - `22`: "recurrence: String"
  - `23`: "parentTaskId: String"
  - `24`: "attachments: String"
  - `25`: "estimatedHours: Float"
  - `26`: "actualHours: Float"
  - `27`: "timeSpent: Int"
  - `28`: "timerStartedAt: DateTime"
  - `29`: "taskOutcome: String"
  - `30`: "breakdownReason: String"
  - `31`: "proofUrl: String"
  - `32`: "comments: TaskComment"
  - `33`: "subtasks: Subtask"
  - `34`: "timeEntries: TimeEntry"
  - `35`: "createdAt: DateTime"
  - `36`: "updatedAt: DateTime"

### 📊 TaskComment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "task: Task"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "content: String"
  - `6`: "type: String"
  - `7`: "metadata: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 Subtask 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "task: Task"
  - `3`: "title: String"
  - `4`: "isCompleted: Boolean"
  - `5`: "completedAt: DateTime"
  - `6`: "completedBy: String"
  - `7`: "order: Int"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 TimeEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "taskId: String"
  - `2`: "task: Task"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "hours: Float"
  - `6`: "description: String"
  - `7`: "date: DateTime"
  - `8`: "createdAt: DateTime"

### 📊 Notification 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "message: String"
  - `6`: "link: String"
  - `7`: "isRead: Boolean"
  - `8`: "priority: String"
  - `9`: "createdAt: DateTime"

### 📊 Meeting 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "category: String"
  - `5`: "date: DateTime"
  - `6`: "duration: Int"
  - `7`: "location: String"
  - `8`: "clientId: String"
  - `9`: "client: Client"
  - `10`: "status: String"
  - `11`: "recurrence: String"
  - `12`: "agenda: String"
  - `13`: "notes: String"
  - `14`: "actionItems: String"
  - `15`: "minutesSummary: String"
  - `16`: "noteTakerUrl: String"
  - `17`: "keyPointers: String"
  - `18`: "meetingLink: String"
  - `19`: "participants: MeetingParticipant"
  - `20`: "meetingActionItems: MeetingActionItem"
  - `21`: "isOnline: Boolean"
  - `22`: "momRecorded: Boolean"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"

### 📊 MeetingParticipant *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "meeting: Meeting"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "role: String"
  - `6`: "attended: Boolean"

### 📊 SOPCategory *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "icon: String"
  - `4`: "order: Int"
  - `5`: "sops: SOP"
  - `6`: "createdAt: DateTime"

### 📊 SOP *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "categoryId: String"
  - `2`: "category: SOPCategory"
  - `3`: "title: String"
  - `4`: "content: String"
  - `5`: "version: String"
  - `6`: "status: String"
  - `7`: "department: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 Training *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "department: String"
  - `4`: "type: String"
  - `5`: "duration: Int"
  - `6`: "content: String"
  - `7`: "isRequired: Boolean"
  - `8`: "userTrainings: UserTraining"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 UserTraining *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "trainingId: String"
  - `4`: "training: Training"
  - `5`: "progress: Int"
  - `6`: "status: String"
  - `7`: "startedAt: DateTime"
  - `8`: "completedAt: DateTime"
  - `9`: "score: Float"

### 📊 Certification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "provider: String"
  - `4`: "validFor: Int"
  - `5`: "userCertifications: UserCertification"

### 📊 UserCertification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "certificationId: String"
  - `4`: "certification: Certification"
  - `5`: "earnedAt: DateTime"
  - `6`: "expiresAt: DateTime"
  - `7`: "certificateUrl: String"

### 📊 CommunicationTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "type: String"
  - `4`: "subject: String"
  - `5`: "content: String"
  - `6`: "variables: String"
  - `7`: "isActive: Boolean"
  - `8`: "schedules: CommunicationSchedule"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 CommunicationSchedule *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "templateId: String"
  - `4`: "template: CommunicationTemplate"
  - `5`: "name: String"
  - `6`: "type: String"
  - `7`: "frequency: String"
  - `8`: "dayOfWeek: Int"
  - `9`: "dayOfMonth: Int"
  - `10`: "preferredTime: String"
  - `11`: "description: String"
  - `12`: "lastSentAt: DateTime"
  - `13`: "nextDueAt: DateTime"
  - `14`: "missedCount: Int"
  - `15`: "completedCount: Int"
  - `16`: "assignedToId: String"
  - `17`: "status: String"
  - `18`: "logs: CommunicationLog"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"

### 📊 CommunicationLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "scheduleId: String"
  - `6`: "schedule: CommunicationSchedule"
  - `7`: "type: String"
  - `8`: "subject: String"
  - `9`: "content: String"
  - `10`: "status: String"
  - `11`: "sentAt: DateTime"
  - `12`: "outcome: String"
  - `13`: "duration: Int"
  - `14`: "actionItems: String"
  - `15`: "attachments: String"
  - `16`: "createdAt: DateTime"

### 📊 Document 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "type: String"
  - `3`: "category: String"
  - `4`: "fileUrl: String"
  - `5`: "fileSize: Int"
  - `6`: "mimeType: String"
  - `7`: "clientId: String"
  - `8`: "client: Client"
  - `9`: "uploadedById: String"
  - `10`: "uploadedBy: User"
  - `11`: "createdAt: DateTime"

### 📊 Contract 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "startDate: DateTime"
  - `6`: "endDate: DateTime"
  - `7`: "renewalDate: DateTime"
  - `8`: "value: Float"
  - `9`: "status: String"
  - `10`: "terms: String"
  - `11`: "documentUrl: String"
  - `12`: "signerName: String"
  - `13`: "signerSignature: String"
  - `14`: "agencySignature: String"
  - `15`: "signedAt: DateTime"
  - `16`: "contractSubType: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"

### 📊 Invoice 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "invoiceNumber: String"
  - `2`: "clientId: String"
  - `3`: "client: Client"
  - `4`: "amount: Float"
  - `5`: "tax: Float"
  - `6`: "total: Float"
  - `7`: "paidAmount: Float"
  - `8`: "status: String"
  - `9`: "dueDate: DateTime"
  - `10`: "paidAt: DateTime"
  - `11`: "items: String"
  - `12`: "notes: String"
  - `13`: "entityType: String"
  - `14`: "isAdvance: Boolean"
  - `15`: "currency: String"
  - `16`: "serviceMonth: DateTime"
  - `17`: "slaDocumentId: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"
  - `20`: "payments: PaymentCollection"
  - `21`: "bankTransactions: BankTransaction"

### 📊 PaymentCollection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "invoiceId: String"
  - `4`: "invoice: Invoice"
  - `5`: "grossAmount: Float"
  - `6`: "tdsDeducted: Float"
  - `7`: "tdsPercentage: Float"
  - `8`: "gstAmount: Float"
  - `9`: "netAmount: Float"
  - `10`: "collectedAt: DateTime"
  - `11`: "collectedBy: String"
  - `12`: "paymentMethod: String"
  - `13`: "transactionRef: String"
  - `14`: "bankAccountId: String"
  - `15`: "bankName: String"
  - `16`: "accountNumber: String"
  - `17`: "retainerMonth: DateTime"
  - `18`: "serviceType: String"
  - `19`: "description: String"
  - `20`: "entityType: String"
  - `21`: "currency: String"
  - `22`: "status: String"
  - `23`: "notes: String"
  - `24`: "bankTransactions: BankTransaction"
  - `25`: "createdAt: DateTime"
  - `26`: "updatedAt: DateTime"

### 📊 PaymentFollowUp *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "date: DateTime"
  - `4`: "status: String"
  - `5`: "notes: String"
  - `6`: "nextAction: String"
  - `7`: "nextActionDate: DateTime"
  - `8`: "recordedBy: String"
  - `9`: "month: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"

### 📊 Expense 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "category: String"
  - `2`: "description: String"
  - `3`: "amount: Float"
  - `4`: "date: DateTime"
  - `5`: "vendor: String"
  - `6`: "notes: String"
  - `7`: "clientId: String"
  - `8`: "client: Client"
  - `9`: "receipt: String"
  - `10`: "status: String"
  - `11`: "submittedBy: String"
  - `12`: "approvedBy: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 Lead 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "companyName: String"
  - `2`: "contactName: String"
  - `3`: "contactEmail: String"
  - `4`: "contactPhone: String"
  - `5`: "source: String"
  - `6`: "value: Float"
  - `7`: "notes: String"
  - `8`: "stage: String"
  - `9`: "pipeline: String"
  - `10`: "lostReason: String"
  - `11`: "wonAt: DateTime"
  - `12`: "leadCategory: String"
  - `13`: "leadPriority: String"
  - `14`: "location: String"
  - `15`: "state: String"
  - `16`: "yearsInOperation: String"
  - `17`: "rfpToken: String"
  - `18`: "rfpStatus: String"
  - `19`: "rfpSentAt: DateTime"
  - `20`: "rfpCompletedAt: DateTime"
  - `21`: "rfpResponses: String"
  - `22`: "isHealthcare: Boolean"
  - `23`: "healthcareType: String"
  - `24`: "patientVolume: String"
  - `25`: "specialization: String"
  - `26`: "numberOfLocations: Int"
  - `27`: "primaryObjective: String"
  - `28`: "currentChallenges: String"
  - `29`: "businessType: String"
  - `30`: "pastMarketing: String"
  - `31`: "workedWithAgency: Boolean"
  - `32`: "agencyIssues: String"
  - `33`: "timeline: String"
  - `34`: "budgetRange: String"
  - `35`: "clientId: String"
  - `36`: "client: Client"
  - `37`: "nextFollowUp: DateTime"
  - `38`: "lastContactedAt: DateTime"
  - `39`: "followUpNotes: String"
  - `40`: "callNotes: String"
  - `41`: "assignedToId: String"
  - `42`: "assignedTo: User"
  - `43`: "createdBy: String"
  - `44`: "proposals: Proposal"
  - `45`: "activities: LeadActivity"
  - `46`: "reminders: FollowUpReminder"
  - `47`: "nurturingActions: LeadNurturingAction"
  - `48`: "handovers: SalesHandover"
  - `49`: "meetings: SalesMeeting"
  - `50`: "whatsappMessages: SalesWhatsAppMessage"
  - `51`: "deals: SalesDeal"
  - `52`: "dailyTasks: SalesDailyTask"
  - `53`: "dailyPlannerTasks: DailyTask"
  - `54`: "deletedAt: DateTime"
  - `55`: "createdAt: DateTime"
  - `56`: "updatedAt: DateTime"

### 📊 Proposal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "title: String"
  - `4`: "value: Float"
  - `5`: "services: String"
  - `6`: "validUntil: DateTime"
  - `7`: "status: String"
  - `8`: "documentUrl: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 Candidate 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "email: String"
  - `3`: "phone: String"
  - `4`: "position: String"
  - `5`: "department: String"
  - `6`: "resumeUrl: String"
  - `7`: "portfolioUrl: String"
  - `8`: "linkedInUrl: String"
  - `9`: "source: String"
  - `10`: "referredBy: String"
  - `11`: "status: String"
  - `12`: "currentStage: String"
  - `13`: "assignedManagerId: String"
  - `14`: "assignedManager: User"
  - `15`: "expectedSalary: Float"
  - `16`: "offeredSalary: Float"
  - `17`: "experience: Int"
  - `18`: "noticePeriod: Int"
  - `19`: "phoneScreenNotes: String"
  - `20`: "phoneScreenRating: Int"
  - `21`: "managerFeedback: String"
  - `22`: "managerRating: Int"
  - `23`: "founderFeedback: String"
  - `24`: "founderDecision: String"
  - `25`: "interviewFeedback: String"
  - `26`: "testTaskUrl: String"
  - `27`: "testTaskScore: Float"
  - `28`: "testTaskFeedback: String"
  - `29`: "notes: String"
  - `30`: "rejectionReason: String"
  - `31`: "interviews: Interview"
  - `32`: "offerLetter: OfferLetter"
  - `33`: "assessment: CandidateAssessment"
  - `34`: "createdAt: DateTime"
  - `35`: "updatedAt: DateTime"

### 📊 CandidateAssessment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "candidate: Candidate"
  - `3`: "token: String"
  - `4`: "completed: Boolean"
  - `5`: "fullName: String"
  - `6`: "email: String"
  - `7`: "phone: String"
  - `8`: "currentCity: String"
  - `9`: "dateOfBirth: String"
  - `10`: "linkedInUrl: String"
  - `11`: "portfolioUrl: String"
  - `12`: "resumeUrl: String"
  - `13`: "totalExperience: Float"
  - `14`: "currentCompany: String"
  - `15`: "currentRole: String"
  - `16`: "currentSalary: Float"
  - `17`: "expectedSalary: Float"
  - `18`: "noticePeriod: String"
  - `19`: "reasonForLeaving: String"
  - `20`: "primarySkills: String"
  - `21`: "tools: String"
  - `22`: "certifications: String"
  - `23`: "languagesKnown: String"
  - `24`: "canWorkFromOffice: Boolean"
  - `25`: "commuteDetails: String"
  - `26`: "joiningTimeline: String"
  - `27`: "readyForTrial: Boolean"
  - `28`: "trialAvailability: String"
  - `29`: "hasHealthcareExp: Boolean"
  - `30`: "healthcareDetails: String"
  - `31`: "healthcareClients: String"
  - `32`: "workSampleUrls: String"
  - `33`: "caseStudyUrl: String"
  - `34`: "githubUrl: String"
  - `35`: "whyThisRole: String"
  - `36`: "biggestAchievement: String"
  - `37`: "challengeExample: String"
  - `38`: "teamWorkStyle: String"
  - `39`: "learningApproach: String"
  - `40`: "salaryNegotiable: Boolean"
  - `41`: "availableForCalls: Boolean"
  - `42`: "preferredCallTime: String"
  - `43`: "relevanceRating: Int"
  - `44`: "strengthAreas: String"
  - `45`: "improvementAreas: String"
  - `46`: "referenceContacts: String"
  - `47`: "additionalInfo: String"
  - `48`: "questionsForUs: String"
  - `49`: "hrStatus: String"
  - `50`: "hrNotes: String"
  - `51`: "shortlistedAt: DateTime"
  - `52`: "shortlistedBy: String"
  - `53`: "interviewDate: DateTime"
  - `54`: "interviewMode: String"
  - `55`: "interviewNotes: String"
  - `56`: "interviewRating: Int"
  - `57`: "taskTitle: String"
  - `58`: "taskDescription: String"
  - `59`: "taskDeadline: DateTime"
  - `60`: "taskAssignedAt: DateTime"
  - `61`: "taskSubmissionUrl: String"
  - `62`: "taskSubmittedAt: DateTime"
  - `63`: "taskScore: Float"
  - `64`: "taskFeedback: String"
  - `65`: "finalRoundDate: DateTime"
  - `66`: "finalRoundNotes: String"
  - `67`: "finalRoundDecision: String"
  - `68`: "finalDecisionBy: String"
  - `69`: "finalDecisionAt: DateTime"
  - `70`: "offerSalary: Float"
  - `71`: "offerDate: DateTime"
  - `72`: "offerAccepted: Boolean"
  - `73`: "joiningDate: DateTime"
  - `74`: "createdAt: DateTime"
  - `75`: "updatedAt: DateTime"

### 📊 EmployeeProposal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "candidateName: String"
  - `3`: "candidateEmail: String"
  - `4`: "candidatePhone: String"
  - `5`: "department: String"
  - `6`: "position: String"
  - `7`: "employmentType: String"
  - `8`: "offeredSalary: Float"
  - `9`: "joiningDate: DateTime"
  - `10`: "probationMonths: Int"
  - `11`: "entityType: String"
  - `12`: "confirmedName: String"
  - `13`: "dateOfBirth: DateTime"
  - `14`: "bloodGroup: String"
  - `15`: "personalPhone: String"
  - `16`: "personalEmail: String"
  - `17`: "currentAddress: String"
  - `18`: "city: String"
  - `19`: "state: String"
  - `20`: "pincode: String"
  - `21`: "parentsAddress: String"
  - `22`: "fatherPhone: String"
  - `23`: "motherPhone: String"
  - `24`: "emergencyName: String"
  - `25`: "emergencyPhone: String"
  - `26`: "emergencyRelation: String"
  - `27`: "linkedinUrl: String"
  - `28`: "languages: String"
  - `29`: "livingSituation: String"
  - `30`: "distanceFromOffice: String"
  - `31`: "favoriteFood: String"
  - `32`: "healthConditions: String"
  - `33`: "detailsConfirmedAt: DateTime"
  - `34`: "ndaAccepted: Boolean"
  - `35`: "ndaAcceptedAt: DateTime"
  - `36`: "ndaSignerName: String"
  - `37`: "ndaSignatureData: String"
  - `38`: "ndaSignatureType: String"
  - `39`: "bondAccepted: Boolean"
  - `40`: "bondAcceptedAt: DateTime"
  - `41`: "bondSignerName: String"
  - `42`: "bondSignatureData: String"
  - `43`: "bondSignatureType: String"
  - `44`: "bondDurationMonths: Int"
  - `45`: "handbookAccepted: Boolean"
  - `46`: "socialMediaPolicyAccepted: Boolean"
  - `47`: "confidentialityAccepted: Boolean"
  - `48`: "antiHarassmentAccepted: Boolean"
  - `49`: "codeOfConductAccepted: Boolean"
  - `50`: "policiesAcceptedAt: DateTime"
  - `51`: "policiesSignerName: String"
  - `52`: "policiesSignatureData: String"
  - `53`: "policiesSignatureType: String"
  - `54`: "profilePictureUrl: String"
  - `55`: "panCardUrl: String"
  - `56`: "aadhaarUrl: String"
  - `57`: "educationCertUrl: String"
  - `58`: "bankAccountName: String"
  - `59`: "bankName: String"
  - `60`: "bankAccountNumber: String"
  - `61`: "bankIfscCode: String"
  - `62`: "documentsSubmittedAt: DateTime"
  - `63`: "onboardingCompleted: Boolean"
  - `64`: "onboardingCompletedAt: DateTime"
  - `65`: "magicLinkSent: Boolean"
  - `66`: "magicLinkSentAt: DateTime"
  - `67`: "currentStep: Int"
  - `68`: "status: String"
  - `69`: "expiresAt: DateTime"
  - `70`: "viewedAt: DateTime"
  - `71`: "userId: String"
  - `72`: "user: User"
  - `73`: "createdById: String"
  - `74`: "createdBy: User"
  - `75`: "createdAt: DateTime"
  - `76`: "updatedAt: DateTime"

### 📊 LeaveRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "type: String"
  - `4`: "startDate: DateTime"
  - `5`: "endDate: DateTime"
  - `6`: "reason: String"
  - `7`: "status: String"
  - `8`: "approvedBy: String"
  - `9`: "approvedAt: DateTime"
  - `10`: "createdAt: DateTime"

### 📊 Post 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "type: String"
  - `4`: "content: String"
  - `5`: "attachments: String"
  - `6`: "isPinned: Boolean"
  - `7`: "comments: Comment"
  - `8`: "likes: Like"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 Comment 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "postId: String"
  - `2`: "post: Post"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "content: String"
  - `6`: "createdAt: DateTime"

### 📊 Like 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "postId: String"
  - `2`: "post: Post"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "createdAt: DateTime"

### 📊 Idea 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "category: String"
  - `6`: "status: String"
  - `7`: "votes: IdeaVote"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 IdeaVote *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ideaId: String"
  - `2`: "idea: Idea"
  - `3`: "userId: String"
  - `4`: "user: User"

### 📊 Recognition *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "receiverId: String"
  - `2`: "receiver: User"
  - `3`: "giverId: String"
  - `4`: "giver: User"
  - `5`: "type: String"
  - `6`: "title: String"
  - `7`: "message: String"
  - `8`: "xpAwarded: Int"
  - `9`: "createdAt: DateTime"

### 📊 Issue 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "severity: String"
  - `5`: "status: String"
  - `6`: "clientId: String"
  - `7`: "assigneeId: String"
  - `8`: "assignee: User"
  - `9`: "creatorId: String"
  - `10`: "creator: User"
  - `11`: "resolution: String"
  - `12`: "resolvedAt: DateTime"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 Report 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "month: DateTime"
  - `6`: "data: String"
  - `7`: "fileUrl: String"
  - `8`: "status: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 Automation 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "type: String"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "status: String"
  - `6`: "metrics: String"
  - `7`: "config: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 AccountabilityCharter *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "unitsProduced: Float"
  - `6`: "monthYear: DateTime"

### 📊 RBC_Pot *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "totalAccrued: Float"
  - `4`: "milestoneMultiplier: Float"
  - `5`: "isForfeited: Boolean"

### 📊 Attendance 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "date: DateTime"
  - `4`: "checkIn: DateTime"
  - `5`: "checkOut: DateTime"
  - `6`: "biometricPunch: Boolean"
  - `7`: "myZenHours: Float"
  - `8`: "huddleLate: Boolean"
  - `9`: "status: String"
  - `10`: "importBatchId: String"
  - `11`: "sourceType: String"
  - `12`: "rawSourceData: String"
  - `13`: "parseConfidence: Float"
  - `14`: "importBatch: AttendanceImport"

### 📊 AttendanceImport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "source: String"
  - `2`: "rawData: String"
  - `3`: "parsedData: String"
  - `4`: "recordCount: Int"
  - `5`: "status: String"
  - `6`: "errorMessage: String"
  - `7`: "importedBy: String"
  - `8`: "importedByUser: User"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "records: Attendance"

### 📊 Violations *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "description: String"
  - `4`: "fineAmount: Float"
  - `5`: "charityPaid: Boolean"
  - `6`: "date: DateTime"
  - `7`: "updatedAt: DateTime"

### 📊 PerformanceScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "score: Float"
  - `4`: "month: DateTime"
  - `5`: "department: String"
  - `6`: "rank: Int"
  - `7`: "metrics: String"
  - `8`: "updatedAt: DateTime"

### 📊 DepartmentTarget *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "metric: String"
  - `3`: "target: Int"
  - `4`: "completed: Int"
  - `5`: "month: DateTime"
  - `6`: "tip: String"
  - `7`: "updatedAt: DateTime"

### 📊 CompanyNews *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "content: String"
  - `3`: "author: String"
  - `4`: "pinned: Boolean"
  - `5`: "category: String"
  - `6`: "createdAt: DateTime"
  - `7`: "updatedAt: DateTime"

### 📊 Event 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "date: DateTime"
  - `4`: "endDate: DateTime"
  - `5`: "type: String"
  - `6`: "location: String"
  - `7`: "isAllDay: Boolean"
  - `8`: "createdAt: DateTime"

### 📊 Feedback 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "content: String"
  - `3`: "category: String"
  - `4`: "isAnonymous: Boolean"
  - `5`: "status: String"
  - `6`: "createdAt: DateTime"

### 📊 Quote 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "text: String"
  - `2`: "author: String"
  - `3`: "isActive: Boolean"
  - `4`: "createdAt: DateTime"
  - `5`: "updatedAt: DateTime"
  - `6`: "createdBy: String"
  - `7`: "creator: User"

### 📊 LeadActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "type: String"
  - `6`: "title: String"
  - `7`: "description: String"
  - `8`: "outcome: String"
  - `9`: "duration: Int"
  - `10`: "createdAt: DateTime"

### 📊 FollowUpReminder *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "scheduledAt: DateTime"
  - `6`: "title: String"
  - `7`: "notes: String"
  - `8`: "isCompleted: Boolean"
  - `9`: "completedAt: DateTime"
  - `10`: "priority: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"

### 📊 LeadNurturingAction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "actionType: String"
  - `6`: "contentTitle: String"
  - `7`: "contentUrl: String"
  - `8`: "notes: String"
  - `9`: "channel: String"
  - `10`: "response: String"
  - `11`: "createdAt: DateTime"

### 📊 SalesHandover *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "salesUserId: String"
  - `4`: "salesUser: User"
  - `5`: "accountsUserId: String"
  - `6`: "accountsUser: User"
  - `7`: "status: String"
  - `8`: "paymentTerms: String"
  - `9`: "servicesAgreed: String"
  - `10`: "specialTerms: String"
  - `11`: "proposalUrl: String"
  - `12`: "dealValue: Float"
  - `13`: "rfpSummary: String"
  - `14`: "nurturingHistory: String"
  - `15`: "keyContacts: String"
  - `16`: "notes: String"
  - `17`: "acknowledgedAt: DateTime"
  - `18`: "completedAt: DateTime"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"

### 📊 SalesMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "meetingType: String"
  - `6`: "title: String"
  - `7`: "description: String"
  - `8`: "scheduledAt: DateTime"
  - `9`: "duration: Int"
  - `10`: "location: String"
  - `11`: "meetingLink: String"
  - `12`: "outcome: String"
  - `13`: "outcomeNotes: String"
  - `14`: "status: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"

### 📊 SalesWhatsAppMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "messageType: String"
  - `6`: "templateId: String"
  - `7`: "content: String"
  - `8`: "recipientPhone: String"
  - `9`: "recipientName: String"
  - `10`: "status: String"
  - `11`: "sentAt: DateTime"
  - `12`: "createdAt: DateTime"

### 📊 SalesWhatsAppTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "content: String"
  - `4`: "isActive: Boolean"
  - `5`: "createdAt: DateTime"
  - `6`: "updatedAt: DateTime"

### 📊 SalesDeal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "leadId: String"
  - `2`: "lead: Lead"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "dealValue: Float"
  - `6`: "servicesSold: String"
  - `7`: "contractDuration: Int"
  - `8`: "startDate: DateTime"
  - `9`: "status: String"
  - `10`: "lossReason: String"
  - `11`: "billingCycle: String"
  - `12`: "paymentTerms: String"
  - `13`: "closedAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"

### 📊 SalesDailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "leadId: String"
  - `4`: "lead: Lead"
  - `5`: "taskType: String"
  - `6`: "title: String"
  - `7`: "description: String"
  - `8`: "dueDate: DateTime"
  - `9`: "priority: String"
  - `10`: "status: String"
  - `11`: "completedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 ClientLifecycleEvent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "fromStage: String"
  - `4`: "toStage: String"
  - `5`: "reason: String"
  - `6`: "notes: String"
  - `7`: "triggeredBy: String"
  - `8`: "createdAt: DateTime"

### 📊 ClientUser *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "email: String"
  - `4`: "name: String"
  - `5`: "phone: String"
  - `6`: "role: String"
  - `7`: "isActive: Boolean"
  - `8`: "lastLoginAt: DateTime"
  - `9`: "otpCode: String"
  - `10`: "otpExpiresAt: DateTime"
  - `11`: "sessionToken: String"
  - `12`: "sessionExpiresAt: DateTime"
  - `13`: "passwordHash: String"
  - `14`: "emailNotifications: Boolean"
  - `15`: "whatsappNotifications: Boolean"
  - `16`: "pushNotifications: Boolean"
  - `17`: "supportTickets: SupportTicket"
  - `18`: "activities: ClientUserActivity"
  - `19`: "notifications: PortalNotification"
  - `20`: "uploadedDocuments: ClientDocument"
  - `21`: "contentApprovals: ContentApproval"
  - `22`: "invitedBy: ClientUserInvitation"
  - `23`: "portalFeedback: ClientPortalFeedback"
  - `24`: "hasMarketingAccess: Boolean"
  - `25`: "hasWebsiteAccess: Boolean"
  - `26`: "pageFeedback: PageFeedback"
  - `27`: "createdAt: DateTime"
  - `28`: "updatedAt: DateTime"

### 📊 ClientCredential *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "platform: String"
  - `4`: "category: String"
  - `5`: "username: String"
  - `6`: "password: String"
  - `7`: "email: String"
  - `8`: "url: String"
  - `9`: "apiKey: String"
  - `10`: "notes: String"
  - `11`: "isActive: Boolean"
  - `12`: "lastUpdated: DateTime"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 SupportTicket *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ticketNumber: String"
  - `2`: "title: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "priority: String"
  - `6`: "status: String"
  - `7`: "clientId: String"
  - `8`: "client: Client"
  - `9`: "clientUserId: String"
  - `10`: "clientUser: ClientUser"
  - `11`: "assignedToId: String"
  - `12`: "assignedTo: User"
  - `13`: "resolvedAt: DateTime"
  - `14`: "resolution: String"
  - `15`: "activities: TicketActivity"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 TicketActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "ticketId: String"
  - `2`: "ticket: SupportTicket"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "type: String"
  - `6`: "description: String"
  - `7`: "metadata: String"
  - `8`: "createdAt: DateTime"

### 📊 EmployeeOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "offerLetterSigned: Boolean"
  - `4`: "offerLetterSignedAt: DateTime"
  - `5`: "idProofSubmitted: Boolean"
  - `6`: "idProofSubmittedAt: DateTime"
  - `7`: "addressProofSubmitted: Boolean"
  - `8`: "addressProofSubmittedAt: DateTime"
  - `9`: "panCardSubmitted: Boolean"
  - `10`: "panCardSubmittedAt: DateTime"
  - `11`: "bankDetailsSubmitted: Boolean"
  - `12`: "bankDetailsSubmittedAt: DateTime"
  - `13`: "educationDocsSubmitted: Boolean"
  - `14`: "educationDocsSubmittedAt: DateTime"
  - `15`: "profilePhotoSubmitted: Boolean"
  - `16`: "profilePhotoSubmittedAt: DateTime"
  - `17`: "emailCreated: Boolean"
  - `18`: "emailCreatedAt: DateTime"
  - `19`: "slackInviteSent: Boolean"
  - `20`: "slackInviteSentAt: DateTime"
  - `21`: "systemAccessGranted: Boolean"
  - `22`: "systemAccessGrantedAt: DateTime"
  - `23`: "deviceAllocated: Boolean"
  - `24`: "deviceAllocatedAt: DateTime"
  - `25`: "softwareLicensesAssigned: Boolean"
  - `26`: "softwareLicensesAt: DateTime"
  - `27`: "hrOrientationComplete: Boolean"
  - `28`: "hrOrientationAt: DateTime"
  - `29`: "policiesAcknowledged: Boolean"
  - `30`: "policiesAcknowledgedAt: DateTime"
  - `31`: "ndaSigned: Boolean"
  - `32`: "ndaSignedAt: DateTime"
  - `33`: "biometricRegistered: Boolean"
  - `34`: "biometricRegisteredAt: DateTime"
  - `35`: "buddyAssigned: Boolean"
  - `36`: "buddyAssignedAt: DateTime"
  - `37`: "teamIntroductionDone: Boolean"
  - `38`: "teamIntroductionAt: DateTime"
  - `39`: "departmentTrainingDone: Boolean"
  - `40`: "departmentTrainingAt: DateTime"
  - `41`: "firstWeekCheckIn: Boolean"
  - `42`: "firstWeekCheckInAt: DateTime"
  - `43`: "thirtyDayReview: Boolean"
  - `44`: "thirtyDayReviewAt: DateTime"
  - `45`: "completionPercentage: Int"
  - `46`: "status: String"
  - `47`: "hrNotes: String"
  - `48`: "lastUpdatedBy: String"
  - `49`: "createdAt: DateTime"
  - `50`: "updatedAt: DateTime"

### 📊 ClientOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "contractSigned: Boolean"
  - `4`: "contractSignedAt: DateTime"
  - `5`: "invoicePaid: Boolean"
  - `6`: "invoicePaidAt: DateTime"
  - `7`: "ndaSigned: Boolean"
  - `8`: "ndaSignedAt: DateTime"
  - `9`: "kickoffMeetingDone: Boolean"
  - `10`: "kickoffMeetingAt: DateTime"
  - `11`: "brandGuidelinesReceived: Boolean"
  - `12`: "brandGuidelinesAt: DateTime"
  - `13`: "websiteAccessGranted: Boolean"
  - `14`: "websiteAccessAt: DateTime"
  - `15`: "analyticsAccessGranted: Boolean"
  - `16`: "analyticsAccessAt: DateTime"
  - `17`: "socialMediaAccess: Boolean"
  - `18`: "socialMediaAccessAt: DateTime"
  - `19`: "adsAccountAccess: Boolean"
  - `20`: "adsAccountAccessAt: DateTime"
  - `21`: "trackingSetup: Boolean"
  - `22`: "trackingSetupAt: DateTime"
  - `23`: "pixelsInstalled: Boolean"
  - `24`: "pixelsInstalledAt: DateTime"
  - `25`: "crmIntegrated: Boolean"
  - `26`: "crmIntegratedAt: DateTime"
  - `27`: "reportingDashboardReady: Boolean"
  - `28`: "reportingDashboardAt: DateTime"
  - `29`: "accountManagerAssigned: Boolean"
  - `30`: "accountManagerAssignedAt: DateTime"
  - `31`: "teamIntroductionDone: Boolean"
  - `32`: "teamIntroductionAt: DateTime"
  - `33`: "communicationChannelSetup: Boolean"
  - `34`: "communicationChannelAt: DateTime"
  - `35`: "firstStrategyCallDone: Boolean"
  - `36`: "firstStrategyCallAt: DateTime"
  - `37`: "contentCalendarShared: Boolean"
  - `38`: "contentCalendarAt: DateTime"
  - `39`: "firstDeliverablesApproved: Boolean"
  - `40`: "firstDeliverablesAt: DateTime"
  - `41`: "monthlyReportingSchedule: Boolean"
  - `42`: "monthlyReportingAt: DateTime"
  - `43`: "selectedServices: String"
  - `44`: "scopeItems: String"
  - `45`: "operationsAssignedAt: DateTime"
  - `46`: "kickoffScheduledAt: DateTime"
  - `47`: "completionPercentage: Int"
  - `48`: "status: String"
  - `49`: "managerNotes: String"
  - `50`: "assignedManagerId: String"
  - `51`: "lastUpdatedBy: String"
  - `52`: "createdAt: DateTime"
  - `53`: "updatedAt: DateTime"

### 📊 InternProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "internshipType: String"
  - `4`: "stipendAmount: Float"
  - `5`: "startDate: DateTime"
  - `6`: "expectedEndDate: DateTime"
  - `7`: "actualEndDate: DateTime"
  - `8`: "hasOwnLaptop: Boolean"
  - `9`: "deviceAssignedId: String"
  - `10`: "mentorId: String"
  - `11`: "buddyId: String"
  - `12`: "monthlyReviews: String"
  - `13`: "currentStatus: String"
  - `14`: "conversionStatus: String"
  - `15`: "exitInterviewDone: Boolean"
  - `16`: "certificateIssued: Boolean"
  - `17`: "certificateUrl: String"
  - `18`: "linkedInRecommendation: Boolean"
  - `19`: "handbookAcknowledged: Boolean"
  - `20`: "handbookAcknowledgedAt: DateTime"
  - `21`: "leavePolicy: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 FreelancerProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "contractType: String"
  - `4`: "hourlyRate: Float"
  - `5`: "projectRate: Float"
  - `6`: "retainerAmount: Float"
  - `7`: "panNumber: String"
  - `8`: "gstNumber: String"
  - `9`: "bankAccountNumber: String"
  - `10`: "bankIfscCode: String"
  - `11`: "bankName: String"
  - `12`: "upiId: String"
  - `13`: "currentStatus: String"
  - `14`: "totalEarned: Float"
  - `15`: "pendingAmount: Float"
  - `16`: "skills: String"
  - `17`: "portfolio: String"
  - `18`: "linkedIn: String"
  - `19`: "workReports: FreelancerWorkReport"
  - `20`: "payments: FreelancerPayment"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"

### 📊 FreelancerWorkReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "freelancerProfileId: String"
  - `2`: "freelancerProfile: FreelancerProfile"
  - `3`: "periodStart: DateTime"
  - `4`: "periodEnd: DateTime"
  - `5`: "submittedAt: DateTime"
  - `6`: "projectName: String"
  - `7`: "clientId: String"
  - `8`: "description: String"
  - `9`: "hoursWorked: Float"
  - `10`: "deliverables: String"
  - `11`: "attachments: String"
  - `12`: "billableAmount: Float"
  - `13`: "status: String"
  - `14`: "reviewedBy: String"
  - `15`: "reviewedAt: DateTime"
  - `16`: "reviewNotes: String"
  - `17`: "paymentId: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 FreelancerPayment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "freelancerProfileId: String"
  - `2`: "freelancerProfile: FreelancerProfile"
  - `3`: "amount: Float"
  - `4`: "paymentDate: DateTime"
  - `5`: "paymentMethod: String"
  - `6`: "transactionRef: String"
  - `7`: "invoiceNumber: String"
  - `8`: "invoiceUrl: String"
  - `9`: "periodStart: DateTime"
  - `10`: "periodEnd: DateTime"
  - `11`: "status: String"
  - `12`: "processedBy: String"
  - `13`: "processedAt: DateTime"
  - `14`: "notes: String"
  - `15`: "workReportIds: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 ImpersonationSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "adminId: String"
  - `2`: "admin: User"
  - `3`: "targetUserId: String"
  - `4`: "targetUser: User"
  - `5`: "startedAt: DateTime"
  - `6`: "endedAt: DateTime"
  - `7`: "reason: String"
  - `8`: "actionsPerformed: String"

### 📊 AccountabilityScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "expectedUnits: Int"
  - `5`: "deliveredUnits: Int"
  - `6`: "unitScore: Float"
  - `7`: "tacticalGoals: String"
  - `8`: "goalsAchieved: Int"
  - `9`: "totalGoals: Int"
  - `10`: "growthScore: Float"
  - `11`: "finalScore: Float"
  - `12`: "rank: Int"
  - `13`: "companyRank: Int"
  - `14`: "managerRating: Float"
  - `15`: "managerNotes: String"
  - `16`: "calculatedAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 LearningLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "resourceUrl: String"
  - `5`: "resourceTitle: String"
  - `6`: "topic: String"
  - `7`: "minutesWatched: Int"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "verificationId: String"
  - `11`: "verification: LearningVerification"

### 📊 LearningVerification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "learningLogId: String"
  - `4`: "topic: String"
  - `5`: "resourceTitle: String"
  - `6`: "taskPrompt: String"
  - `7`: "taskType: String"
  - `8`: "difficulty: String"
  - `9`: "userResponse: String"
  - `10`: "submittedAt: DateTime"
  - `11`: "aiScore: Float"
  - `12`: "aiFeedback: String"
  - `13`: "evaluatedAt: DateTime"
  - `14`: "isVerified: Boolean"
  - `15`: "status: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"
  - `18`: "learningLogs: LearningLog"

### 📊 LearningAudit *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "totalEntries: Int"
  - `5`: "totalMinutes: Int"
  - `6`: "verifiedEntries: Int"
  - `7`: "averageScore: Float"
  - `8`: "aiSummary: String"
  - `9`: "aiRecommendations: String"
  - `10`: "overallVerdict: String"
  - `11`: "auditedAt: DateTime"

### 📊 WorkDeliverable *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "month: DateTime"
  - `6`: "category: String"
  - `7`: "deliverableType: String"
  - `8`: "quantity: Int"
  - `9`: "unitValue: Float"
  - `10`: "totalValue: Float"
  - `11`: "proofUrl: String"
  - `12`: "qualityScore: Int"
  - `13`: "revisionCount: Int"
  - `14`: "turnaroundHours: Float"
  - `15`: "designUrls: String"
  - `16`: "status: String"
  - `17`: "approvedBy: String"
  - `18`: "approvedAt: DateTime"
  - `19`: "notes: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 DepartmentBaseline *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "baseSalary: Float"
  - `3`: "baseUnits: Int"
  - `4`: "unitType: String"
  - `5`: "unitDescription: String"
  - `6`: "scaleFactor: Float"
  - `7`: "updatedAt: DateTime"

### 📊 Achievement 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "clientId: String"
  - `7`: "client: Client"
  - `8`: "proofUrl: String"
  - `9`: "pointsAwarded: Int"
  - `10`: "incentiveValue: Float"
  - `11`: "status: String"
  - `12`: "addedBy: String"
  - `13`: "approvedBy: String"
  - `14`: "approvedAt: DateTime"
  - `15`: "month: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 TacticalGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "targetValue: Float"
  - `7`: "currentValue: Float"
  - `8`: "category: String"
  - `9`: "priority: String"
  - `10`: "status: String"
  - `11`: "achievedAt: DateTime"
  - `12`: "setBy: String"
  - `13`: "reviewNotes: String"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"

### 📊 IncentivePayout *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "unitIncentive: Float"
  - `5`: "achievementBonus: Float"
  - `6`: "referralBonus: Float"
  - `7`: "attendanceBonus: Float"
  - `8`: "totalIncentive: Float"
  - `9`: "status: String"
  - `10`: "approvedBy: String"
  - `11`: "approvedAt: DateTime"
  - `12`: "paidAt: DateTime"
  - `13`: "deductions: Float"
  - `14`: "deductionReason: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"

### 📊 LearningResourceComment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "resourceId: String"
  - `2`: "userId: String"
  - `3`: "user: User"
  - `4`: "content: String"
  - `5`: "rating: Int"
  - `6`: "isHelpful: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"

### 📊 MeetingActionItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "meeting: Meeting"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "assigneeId: String"
  - `6`: "assignee: User"
  - `7`: "dueDate: DateTime"
  - `8`: "priority: String"
  - `9`: "status: String"
  - `10`: "completedAt: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"

### 📊 DailyTaskPlan *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "date: DateTime"
  - `4`: "isWeeklyPlan: Boolean"
  - `5`: "status: String"
  - `6`: "submittedAt: DateTime"
  - `7`: "submittedBeforeHuddle: Boolean"
  - `8`: "totalPlannedHours: Float"
  - `9`: "totalActualHours: Float"
  - `10`: "hasUnder4Hours: Boolean"
  - `11`: "tasks: DailyTask"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 DailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "planId: String"
  - `2`: "plan: DailyTaskPlan"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "clientName: String"
  - `6`: "activityType: String"
  - `7`: "description: String"
  - `8`: "plannedStartTime: DateTime"
  - `9`: "plannedHours: Float"
  - `10`: "actualStartTime: DateTime"
  - `11`: "actualEndTime: DateTime"
  - `12`: "actualHours: Float"
  - `13`: "addedAt: DateTime"
  - `14`: "startedAt: DateTime"
  - `15`: "completedAt: DateTime"
  - `16`: "status: String"
  - `17`: "isBreakdown: Boolean"
  - `18`: "breakdownReason: String"
  - `19`: "priority: String"
  - `20`: "sortOrder: Int"
  - `21`: "notes: String"
  - `22`: "deliverable: String"
  - `23`: "proofUrl: String"
  - `24`: "remarks: String"
  - `25`: "clientVisible: Boolean"
  - `26`: "workEntryId: String"
  - `27`: "allocatedById: String"
  - `28`: "allocatedBy: User"
  - `29`: "deadline: DateTime"
  - `30`: "rateTask: Int"
  - `31`: "company: String"
  - `32`: "reportedToManager: Boolean"
  - `33`: "reportedAt: DateTime"
  - `34`: "managerReviewed: Boolean"
  - `35`: "managerReviewedAt: DateTime"
  - `36`: "managerReviewedById: String"
  - `37`: "managerReviewedBy: User"
  - `38`: "managerRating: Int"
  - `39`: "managerFeedback: String"
  - `40`: "clientCommunicated: Boolean"
  - `41`: "communicatedAt: DateTime"
  - `42`: "communicatedVia: String"
  - `43`: "communicationMessage: String"
  - `44`: "goalLinks: TaskGoalLink"
  - `45`: "isBreakthrough: Boolean"
  - `46`: "leadId: String"
  - `47`: "lead: Lead"
  - `48`: "departmentTarget: String"
  - `49`: "employeeTargetId: String"
  - `50`: "candidateTargetId: String"
  - `51`: "accountsTaskType: String"
  - `52`: "complianceType: String"
  - `53`: "paymentReceivedDate: DateTime"
  - `54`: "invoiceNotifiedAt: DateTime"
  - `55`: "createdAt: DateTime"
  - `56`: "updatedAt: DateTime"

### 📊 ArcadePointTransaction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "type: String"
  - `4`: "points: Int"
  - `5`: "reason: String"
  - `6`: "category: String"
  - `7`: "month: DateTime"
  - `8`: "metadata: String"
  - `9`: "createdAt: DateTime"

### 📊 ArcadeReward *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "pointsCost: Int"
  - `4`: "category: String"
  - `5`: "stock: Int"
  - `6`: "imageUrl: String"
  - `7`: "isActive: Boolean"
  - `8`: "redemptions: ArcadeRedemption"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 ArcadeRedemption *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "rewardId: String"
  - `4`: "reward: ArcadeReward"
  - `5`: "pointsSpent: Int"
  - `6`: "status: String"
  - `7`: "fulfilledAt: DateTime"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 LeaveBalance *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "year: Int"
  - `4`: "type: String"
  - `5`: "total: Float"
  - `6`: "used: Float"
  - `7`: "remaining: Float"
  - `8`: "carryForward: Float"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 RBCAccrual *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "rbcPotId: String"
  - `4`: "month: DateTime"
  - `5`: "amount: Float"
  - `6`: "reason: String"
  - `7`: "status: String"
  - `8`: "createdAt: DateTime"

### 📊 RBCPayout *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "rbcPotId: String"
  - `4`: "amount: Float"
  - `5`: "vestingMonth: DateTime"
  - `6`: "paidAt: DateTime"
  - `7`: "status: String"
  - `8`: "multiplier: Float"
  - `9`: "createdAt: DateTime"

### 📊 PIPPlan *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "managerId: String"
  - `4`: "manager: User"
  - `5`: "startDate: DateTime"
  - `6`: "endDate: DateTime"
  - `7`: "reason: String"
  - `8`: "status: String"
  - `9`: "finalOutcome: String"
  - `10`: "notes: String"
  - `11`: "milestones: PIPMilestone"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 PIPMilestone *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "pipPlanId: String"
  - `2`: "pipPlan: PIPPlan"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "dayMark: Int"
  - `6`: "targetDate: DateTime"
  - `7`: "status: String"
  - `8`: "reviewNotes: String"
  - `9`: "reviewedAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"

### 📊 Asset *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "assetTag: String"
  - `2`: "name: String"
  - `3`: "type: String"
  - `4`: "brand: String"
  - `5`: "model: String"
  - `6`: "serialNumber: String"
  - `7`: "purchaseDate: DateTime"
  - `8`: "purchasePrice: Float"
  - `9`: "warrantyEnd: DateTime"
  - `10`: "condition: String"
  - `11`: "status: String"
  - `12`: "assignments: AssetAssignment"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 AssetAssignment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "assetId: String"
  - `2`: "asset: Asset"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "assignedAt: DateTime"
  - `6`: "returnedAt: DateTime"
  - `7`: "conditionOnAssign: String"
  - `8`: "conditionOnReturn: String"
  - `9`: "notes: String"
  - `10`: "createdAt: DateTime"

### 📊 ExitProcess *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "type: String"
  - `4`: "noticeDate: DateTime"
  - `5`: "lastWorkingDate: DateTime"
  - `6`: "exitDate: DateTime"
  - `7`: "reason: String"
  - `8`: "exitInterviewNotes: String"
  - `9`: "status: String"
  - `10`: "checklist: ExitChecklist"
  - `11`: "settlement: FnFSettlement"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 ExitChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "exitProcessId: String"
  - `2`: "exitProcess: ExitProcess"
  - `3`: "category: String"
  - `4`: "item: String"
  - `5`: "status: String"
  - `6`: "responsibleRole: String"
  - `7`: "isCompleted: Boolean"
  - `8`: "completedAt: DateTime"
  - `9`: "completedBy: String"
  - `10`: "notes: String"
  - `11`: "createdAt: DateTime"

### 📊 FnFSettlement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "exitProcessId: String"
  - `4`: "exitProcess: ExitProcess"
  - `5`: "status: String"
  - `6`: "totalAmount: Float"
  - `7`: "netPayable: Float"
  - `8`: "approvedByHR: String"
  - `9`: "approvedByFinance: String"
  - `10`: "approvedByLeadership: String"
  - `11`: "paidAt: DateTime"
  - `12`: "lineItems: FnFLineItem"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 FnFLineItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "settlementId: String"
  - `2`: "settlement: FnFSettlement"
  - `3`: "type: String"
  - `4`: "description: String"
  - `5`: "amount: Float"
  - `6`: "isDeduction: Boolean"
  - `7`: "createdAt: DateTime"

### 📊 ReferralBonus *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "referrerId: String"
  - `2`: "referrer: User"
  - `3`: "referredUserId: String"
  - `4`: "referredUser: User"
  - `5`: "referredName: String"
  - `6`: "type: String"
  - `7`: "amount: Float"
  - `8`: "status: String"
  - `9`: "qualifiedAt: DateTime"
  - `10`: "paidAt: DateTime"
  - `11`: "notes: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 RFPSubmission *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "clientId: String"
  - `3`: "client: Client"
  - `4`: "companyName: String"
  - `5`: "contactName: String"
  - `6`: "contactEmail: String"
  - `7`: "contactPhone: String"
  - `8`: "address: String"
  - `9`: "gstNumber: String"
  - `10`: "industry: String"
  - `11`: "businessType: String"
  - `12`: "websiteUrl: String"
  - `13`: "servicesRequested: String"
  - `14`: "scopeDetails: String"
  - `15`: "budgetRange: String"
  - `16`: "monthlyBudget: Float"
  - `17`: "expectedStartDate: DateTime"
  - `18`: "contractDuration: String"
  - `19`: "clientTier: String"
  - `20`: "currency: String"
  - `21`: "locations: String"
  - `22`: "targetAudience: String"
  - `23`: "competitors: String"
  - `24`: "usp: String"
  - `25`: "adBudget: String"
  - `26`: "retainerBudget: String"
  - `27`: "primaryGoals: String"
  - `28`: "successMetrics: String"
  - `29`: "biggestChallenge: String"
  - `30`: "currentMarketing: String"
  - `31`: "whatWorked: String"
  - `32`: "whatDidntWork: String"
  - `33`: "preferredCallTime: String"
  - `34`: "additionalInfo: String"
  - `35`: "prospectFormData: String"
  - `36`: "patientVolume: String"
  - `37`: "specializations: String"
  - `38`: "status: String"
  - `39`: "currentStep: Int"
  - `40`: "completed: Boolean"
  - `41`: "completedAt: DateTime"
  - `42`: "viewedAt: DateTime"
  - `43`: "expiresAt: DateTime"
  - `44`: "submittedById: String"
  - `45`: "createdById: String"
  - `46`: "notes: String"
  - `47`: "leadId: String"
  - `48`: "createdAt: DateTime"
  - `49`: "updatedAt: DateTime"

### 📊 SLADocument *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "entityType: String"
  - `4`: "entityName: String"
  - `5`: "entityAddress: String"
  - `6`: "clientName: String"
  - `7`: "clientAddress: String"
  - `8`: "clientGstNumber: String"
  - `9`: "servicesScope: String"
  - `10`: "customScope: String"
  - `11`: "monthlyRetainer: Float"
  - `12`: "advanceAmount: Float"
  - `13`: "contractDuration: String"
  - `14`: "commencementDate: DateTime"
  - `15`: "endDate: DateTime"
  - `16`: "poNumber: String"
  - `17`: "paymentTerms: String"
  - `18`: "slaMetrics: String"
  - `19`: "escalationContacts: String"
  - `20`: "clientSignerName: String"
  - `21`: "clientSignature: String"
  - `22`: "clientSignedAt: DateTime"
  - `23`: "agencySignerName: String"
  - `24`: "agencySignature: String"
  - `25`: "agencySignedAt: DateTime"
  - `26`: "status: String"
  - `27`: "documentUrl: String"
  - `28`: "generatedInvoiceId: String"
  - `29`: "createdAt: DateTime"
  - `30`: "updatedAt: DateTime"

### 📊 ServiceTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "subcategory: String"
  - `4`: "description: String"
  - `5`: "deliverables: String"
  - `6`: "pricing: String"
  - `7`: "inclusions: String"
  - `8`: "exclusions: String"
  - `9`: "revisionPolicy: String"
  - `10`: "slaMetrics: String"
  - `11`: "terms: String"
  - `12`: "isActive: Boolean"
  - `13`: "displayOrder: Int"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"

### 📊 VendorOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "companyName: String"
  - `2`: "contactName: String"
  - `3`: "contactEmail: String"
  - `4`: "contactPhone: String"
  - `5`: "address: String"
  - `6`: "gstNumber: String"
  - `7`: "panNumber: String"
  - `8`: "bankAccountName: String"
  - `9`: "bankAccountNumber: String"
  - `10`: "bankIFSC: String"
  - `11`: "bankName: String"
  - `12`: "serviceCategory: String"
  - `13`: "contractDuration: String"
  - `14`: "paymentTerms: String"
  - `15`: "monthlyRate: Float"
  - `16`: "ndaSigned: Boolean"
  - `17`: "ndaSignedAt: DateTime"
  - `18`: "ndaSignature: String"
  - `19`: "contractSigned: Boolean"
  - `20`: "contractSignedAt: DateTime"
  - `21`: "contractSignature: String"
  - `22`: "documentsUrl: String"
  - `23`: "status: String"
  - `24`: "approvedById: String"
  - `25`: "notes: String"
  - `26`: "createdAt: DateTime"
  - `27`: "updatedAt: DateTime"

### 📊 ClientPortal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "pinCode: String"
  - `4`: "themeColor: String"
  - `5`: "logoUrl: String"
  - `6`: "isActive: Boolean"
  - `7`: "lastAccessed: DateTime"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 CompanyEntity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "code: String"
  - `2`: "name: String"
  - `3`: "tradeName: String"
  - `4`: "type: String"
  - `5`: "country: String"
  - `6`: "gstNumber: String"
  - `7`: "panNumber: String"
  - `8`: "cinNumber: String"
  - `9`: "einNumber: String"
  - `10`: "tanNumber: String"
  - `11`: "registeredAddress: String"
  - `12`: "operatingAddress: String"
  - `13`: "city: String"
  - `14`: "state: String"
  - `15`: "pincode: String"
  - `16`: "email: String"
  - `17`: "phone: String"
  - `18`: "website: String"
  - `19`: "invoicePrefix: String"
  - `20`: "invoiceCounter: Int"
  - `21`: "defaultCurrency: String"
  - `22`: "logoUrl: String"
  - `23`: "letterheadUrl: String"
  - `24`: "signatureUrl: String"
  - `25`: "isActive: Boolean"
  - `26`: "isPrimary: Boolean"
  - `27`: "bankAccounts: EntityBankAccount"
  - `28`: "paymentGateways: EntityPaymentGateway"
  - `29`: "createdAt: DateTime"
  - `30`: "updatedAt: DateTime"

### 📊 EntityBankAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "entity: CompanyEntity"
  - `3`: "bankName: String"
  - `4`: "accountName: String"
  - `5`: "accountNumber: String"
  - `6`: "ifscCode: String"
  - `7`: "swiftCode: String"
  - `8`: "routingNumber: String"
  - `9`: "branchName: String"
  - `10`: "branchAddress: String"
  - `11`: "accountType: String"
  - `12`: "currency: String"
  - `13`: "displayName: String"
  - `14`: "isPrimary: Boolean"
  - `15`: "isActive: Boolean"
  - `16`: "lastBalance: Float"
  - `17`: "lastBalanceDate: DateTime"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 EntityPaymentGateway *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "entity: CompanyEntity"
  - `3`: "provider: String"
  - `4`: "displayName: String"
  - `5`: "merchantId: String"
  - `6`: "apiKeyId: String"
  - `7`: "apiKeySecret: String"
  - `8`: "webhookSecret: String"
  - `9`: "mode: String"
  - `10`: "supportedCurrencies: String"
  - `11`: "defaultCurrency: String"
  - `12`: "supportsSubscription: Boolean"
  - `13`: "supportsRefund: Boolean"
  - `14`: "supportsPartialPayment: Boolean"
  - `15`: "feePercentage: Float"
  - `16`: "fixedFee: Float"
  - `17`: "isPrimary: Boolean"
  - `18`: "isActive: Boolean"
  - `19`: "lastUsedAt: DateTime"
  - `20`: "totalTransactions: Int"
  - `21`: "totalVolume: Float"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 SelfAppraisal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "cycleYear: Int"
  - `3`: "cyclePeriod: String"
  - `4`: "status: String"
  - `5`: "triggeredAt: DateTime"
  - `6`: "startedAt: DateTime"
  - `7`: "submittedAt: DateTime"
  - `8`: "completedAt: DateTime"
  - `9`: "overallRating: Int"
  - `10`: "keyAccomplishments: String"
  - `11`: "challengesFaced: String"
  - `12`: "goalsAchieved: String"
  - `13`: "goalsMissed: String"
  - `14`: "skillsImproved: String"
  - `15`: "learningCompleted: String"
  - `16`: "skillsToImprove: String"
  - `17`: "roleClarity: Int"
  - `18`: "resourcesAdequate: Int"
  - `19`: "workloadBalance: Int"
  - `20`: "teamCollaboration: Int"
  - `21`: "managerSupport: Int"
  - `22`: "cultureFit: Int"
  - `23`: "nextYearGoals: String"
  - `24`: "careerAspirations: String"
  - `25`: "supportNeeded: String"
  - `26`: "trainingRequests: String"
  - `27`: "companyFeedback: String"
  - `28`: "teamFeedback: String"
  - `29`: "processFeedback: String"
  - `30`: "managerComments: String"
  - `31`: "managerRating: Int"
  - `32`: "reviewedBy: String"
  - `33`: "reviewedAt: DateTime"
  - `34`: "finalRating: Int"
  - `35`: "incrementRecommendation: String"
  - `36`: "promotionRecommendation: Boolean"
  - `37`: "learningHoursThisYear: Float"
  - `38`: "learningHoursRequired: Float"
  - `39`: "createdAt: DateTime"
  - `40`: "updatedAt: DateTime"

### 📊 LoginSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "userType: String"
  - `4`: "ipAddress: String"
  - `5`: "userAgent: String"
  - `6`: "deviceType: String"
  - `7`: "browser: String"
  - `8`: "browserVersion: String"
  - `9`: "os: String"
  - `10`: "osVersion: String"
  - `11`: "country: String"
  - `12`: "countryCode: String"
  - `13`: "region: String"
  - `14`: "city: String"
  - `15`: "latitude: Float"
  - `16`: "longitude: Float"
  - `17`: "timezone: String"
  - `18`: "isp: String"
  - `19`: "sessionToken: String"
  - `20`: "isActive: Boolean"
  - `21`: "loginAt: DateTime"
  - `22`: "logoutAt: DateTime"
  - `23`: "lastActivityAt: DateTime"
  - `24`: "expiresAt: DateTime"
  - `25`: "isSuspicious: Boolean"
  - `26`: "suspiciousReason: String"
  - `27`: "isNewDevice: Boolean"
  - `28`: "deviceFingerprint: String"
  - `29`: "createdAt: DateTime"
  - `30`: "updatedAt: DateTime"

### 📊 ChatChannel *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "slug: String"
  - `3`: "description: String"
  - `4`: "type: String"
  - `5`: "icon: String"
  - `6`: "isMash: Boolean"
  - `7`: "isArchived: Boolean"
  - `8`: "allowedRoles: String"
  - `9`: "isReadOnly: Boolean"
  - `10`: "createdById: String"
  - `11`: "createdBy: User"
  - `12`: "messages: ChatMessage"
  - `13`: "members: ChatChannelMember"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"

### 📊 ChatChannelMember *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "channelId: String"
  - `2`: "channel: ChatChannel"
  - `3`: "userId: String"
  - `4`: "user: User"
  - `5`: "role: String"
  - `6`: "isMuted: Boolean"
  - `7`: "lastReadAt: DateTime"
  - `8`: "joinedAt: DateTime"

### 📊 ChatMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "channelId: String"
  - `2`: "channel: ChatChannel"
  - `3`: "senderId: String"
  - `4`: "sender: User"
  - `5`: "content: String"
  - `6`: "type: String"
  - `7`: "priority: String"
  - `8`: "isPinned: Boolean"
  - `9`: "attachments: String"
  - `10`: "parentId: String"
  - `11`: "parent: ChatMessage"
  - `12`: "replies: ChatMessage"
  - `13`: "reactions: String"
  - `14`: "isEdited: Boolean"
  - `15`: "editedAt: DateTime"
  - `16`: "isDeleted: Boolean"
  - `17`: "deletedAt: DateTime"
  - `18`: "readBy: String"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"

### 📊 DirectMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "senderId: String"
  - `2`: "sender: User"
  - `3`: "receiverId: String"
  - `4`: "receiver: User"
  - `5`: "content: String"
  - `6`: "type: String"
  - `7`: "attachments: String"
  - `8`: "isRead: Boolean"
  - `9`: "readAt: DateTime"
  - `10`: "isDeleted: Boolean"
  - `11`: "deletedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 ClientProperty *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "type: String"
  - `4`: "name: String"
  - `5`: "url: String"
  - `6`: "isActive: Boolean"
  - `7`: "isPrimary: Boolean"
  - `8`: "createdAt: DateTime"
  - `9`: "kpiEntries: TacticalKPIEntry"

### 📊 TacticalMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "reportingMonth: DateTime"
  - `5`: "status: String"
  - `6`: "submittedAt: DateTime"
  - `7`: "submittedOnTime: Boolean"
  - `8`: "reviewedBy: String"
  - `9`: "reviewedAt: DateTime"
  - `10`: "managerNotes: String"
  - `11`: "performanceScore: Float"
  - `12`: "accountabilityScore: Float"
  - `13`: "clientSatisfactionScore: Float"
  - `14`: "overallScore: Float"
  - `15`: "kpiEntries: TacticalKPIEntry"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 TacticalKPIEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "meeting: TacticalMeeting"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "propertyId: String"
  - `6`: "property: ClientProperty"
  - `7`: "department: String"
  - `8`: "organicTraffic: Int"
  - `9`: "prevOrganicTraffic: Int"
  - `10`: "leads: Int"
  - `11`: "prevLeads: Int"
  - `12`: "gbpCalls: Int"
  - `13`: "prevGbpCalls: Int"
  - `14`: "gbpDirections: Int"
  - `15`: "prevGbpDirections: Int"
  - `16`: "keywordsTop3: Int"
  - `17`: "prevKeywordsTop3: Int"
  - `18`: "keywordsTop10: Int"
  - `19`: "prevKeywordsTop10: Int"
  - `20`: "keywordsTop20: Int"
  - `21`: "prevKeywordsTop20: Int"
  - `22`: "backlinksBuilt: Int"
  - `23`: "prevBacklinksBuilt: Int"
  - `24`: "adSpend: Float"
  - `25`: "prevAdSpend: Float"
  - `26`: "impressions: Int"
  - `27`: "prevImpressions: Int"
  - `28`: "clicks: Int"
  - `29`: "prevClicks: Int"
  - `30`: "conversions: Int"
  - `31`: "prevConversions: Int"
  - `32`: "costPerConversion: Float"
  - `33`: "prevCostPerConversion: Float"
  - `34`: "roas: Float"
  - `35`: "prevRoas: Float"
  - `36`: "followers: Int"
  - `37`: "prevFollowers: Int"
  - `38`: "engagement: Float"
  - `39`: "prevEngagement: Float"
  - `40`: "postsPublished: Int"
  - `41`: "prevPostsPublished: Int"
  - `42`: "reachTotal: Int"
  - `43`: "prevReachTotal: Int"
  - `44`: "videoViews: Int"
  - `45`: "prevVideoViews: Int"
  - `46`: "pageSpeed: Int"
  - `47`: "prevPageSpeed: Int"
  - `48`: "bounceRate: Float"
  - `49`: "prevBounceRate: Float"
  - `50`: "avgSessionDuration: Float"
  - `51`: "prevAvgSessionDuration: Float"
  - `52`: "pagesBuilt: Int"
  - `53`: "prevPagesBuilt: Int"
  - `54`: "bugsFixed: Int"
  - `55`: "prevBugsFixed: Int"
  - `56`: "customMetrics: String"
  - `57`: "trafficGrowth: Float"
  - `58`: "leadsGrowth: Float"
  - `59`: "callsGrowth: Float"
  - `60`: "keywordsGrowth: Float"
  - `61`: "notes: String"
  - `62`: "achievements: String"
  - `63`: "challenges: String"
  - `64`: "nextMonthPlan: String"
  - `65`: "createdAt: DateTime"
  - `66`: "updatedAt: DateTime"

### 📊 StrategicMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "quarter: Int"
  - `2`: "year: Int"
  - `3`: "department: String"
  - `4`: "conductedAt: DateTime"
  - `5`: "quarterlyData: String"
  - `6`: "goals: StrategicGoal"
  - `7`: "peerReviews: PeerReview"
  - `8`: "summary: String"
  - `9`: "keyDecisions: String"
  - `10`: "actionItems: String"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"

### 📊 StrategicGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "meeting: StrategicMeeting"
  - `3`: "userId: String"
  - `4`: "department: String"
  - `5`: "clientId: String"
  - `6`: "title: String"
  - `7`: "description: String"
  - `8`: "targetMetric: String"
  - `9`: "targetValue: Float"
  - `10`: "currentValue: Float"
  - `11`: "deadline: DateTime"
  - `12`: "status: String"
  - `13`: "achievedValue: Float"
  - `14`: "achievedAt: DateTime"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"

### 📊 PeerReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "meetingId: String"
  - `2`: "meeting: StrategicMeeting"
  - `3`: "reviewerId: String"
  - `4`: "revieweeId: String"
  - `5`: "collaborationRating: Int"
  - `6`: "communicationRating: Int"
  - `7`: "deliveryRating: Int"
  - `8`: "innovationRating: Int"
  - `9`: "overallRating: Int"
  - `10`: "didWell: String"
  - `11`: "needsImprovement: String"
  - `12`: "shouldDoDifferently: String"
  - `13`: "additionalComments: String"
  - `14`: "isAnonymous: Boolean"
  - `15`: "isPublic: Boolean"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 EmployeeScorecard *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "month: DateTime"
  - `3`: "performanceScore: Float"
  - `4`: "performanceBreakdown: String"
  - `5`: "accountabilityScore: Float"
  - `6`: "projectsManaged: Int"
  - `7`: "projectsExpected: Int"
  - `8`: "clientSatisfactionScore: Float"
  - `9`: "avgNpsScore: Float"
  - `10`: "positiveReviews: Int"
  - `11`: "negativeReviews: Int"
  - `12`: "escalationsCount: Int"
  - `13`: "churnedClients: Int"
  - `14`: "learningHoursRequired: Float"
  - `15`: "learningHoursCompleted: Float"
  - `16`: "learningCompliant: Boolean"
  - `17`: "appraisalDelayMonths: Int"
  - `18`: "overallScore: Float"
  - `19`: "companyRank: Int"
  - `20`: "departmentRank: Int"
  - `21`: "isAppraisalEligible: Boolean"
  - `22`: "nextAppraisalDate: DateTime"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"

### 📊 ClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "month: DateTime"
  - `4`: "npsScore: Int"
  - `5`: "npsCategory: String"
  - `6`: "overallSatisfaction: Int"
  - `7`: "communicationRating: Int"
  - `8`: "deliveryRating: Int"
  - `9`: "valueRating: Int"
  - `10`: "feedback: String"
  - `11`: "improvements: String"
  - `12`: "hadEscalation: Boolean"
  - `13`: "escalationDetails: String"
  - `14`: "churnRisk: String"
  - `15`: "churnedThisMonth: Boolean"
  - `16`: "churnReason: String"
  - `17`: "collectedAt: DateTime"
  - `18`: "collectedBy: String"

### 📊 ClientPortalFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "clientUserId: String"
  - `4`: "clientUser: ClientUser"
  - `5`: "type: String"
  - `6`: "rating: Int"
  - `7`: "message: String"
  - `8`: "status: String"
  - `9`: "response: String"
  - `10`: "respondedBy: String"
  - `11`: "respondedAt: DateTime"
  - `12`: "createdAt: DateTime"

### 📊 CustomRole *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "displayName: String"
  - `3`: "baseRoles: String"
  - `4`: "departments: String"
  - `5`: "permissions: String"
  - `6`: "isActive: Boolean"
  - `7`: "userAssignments: UserCustomRole"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 UserCustomRole *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "customRoleId: String"
  - `3`: "user: User"
  - `4`: "customRole: CustomRole"
  - `5`: "assignedAt: DateTime"

### 📊 ClientWhatsAppGroup *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "name: String"
  - `4`: "groupType: String"
  - `5`: "joinLink: String"
  - `6`: "qrCodeUrl: String"
  - `7`: "officialPhoneRequired: String"
  - `8`: "isActive: Boolean"
  - `9`: "memberCount: Int"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"

### 📊 WhatsAppTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "department: String"
  - `4`: "content: String"
  - `5`: "variables: String"
  - `6`: "language: String"
  - `7`: "hasMedia: Boolean"
  - `8`: "mediaType: String"
  - `9`: "mediaUrl: String"
  - `10`: "usageCount: Int"
  - `11`: "lastUsedAt: DateTime"
  - `12`: "isActive: Boolean"
  - `13`: "isApproved: Boolean"
  - `14`: "approvedBy: String"
  - `15`: "approvedAt: DateTime"
  - `16`: "createdBy: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"
  - `19`: "usageLogs: WhatsAppTemplateUsage"

### 📊 WhatsAppTemplateUsage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "templateId: String"
  - `2`: "template: WhatsAppTemplate"
  - `3`: "userId: String"
  - `4`: "recipientPhone: String"
  - `5`: "recipientName: String"
  - `6`: "recipientType: String"
  - `7`: "status: String"
  - `8`: "messageId: String"
  - `9`: "error: String"
  - `10`: "sentAt: DateTime"
  - `11`: "deliveredAt: DateTime"
  - `12`: "readAt: DateTime"

### 📊 WhatsAppCampaign *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "templateId: String"
  - `4`: "targetType: String"
  - `5`: "targetFilter: String"
  - `6`: "recipientCount: Int"
  - `7`: "status: String"
  - `8`: "scheduledAt: DateTime"
  - `9`: "startedAt: DateTime"
  - `10`: "completedAt: DateTime"
  - `11`: "sentCount: Int"
  - `12`: "deliveredCount: Int"
  - `13`: "failedCount: Int"
  - `14`: "createdBy: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"
  - `17`: "messages: WhatsAppCampaignMessage"

### 📊 WhatsAppCampaignMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "campaign: WhatsAppCampaign"
  - `3`: "recipientPhone: String"
  - `4`: "recipientName: String"
  - `5`: "status: String"
  - `6`: "messageId: String"
  - `7`: "error: String"
  - `8`: "sentAt: DateTime"
  - `9`: "deliveredAt: DateTime"

### 📊 DeviceRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "deviceType: String"
  - `4`: "reason: String"
  - `5`: "urgency: String"
  - `6`: "status: String"
  - `7`: "approvedBy: String"
  - `8`: "fulfilledAssetId: String"
  - `9`: "notes: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"

### 📊 HRPipelineTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "candidateId: String"
  - `3`: "employeeId: String"
  - `4`: "taskType: String"
  - `5`: "title: String"
  - `6`: "description: String"
  - `7`: "startDate: DateTime"
  - `8`: "endDate: DateTime"
  - `9`: "duration: Int"
  - `10`: "progress: Int"
  - `11`: "dependencies: String"
  - `12`: "status: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 ClientOperationsLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "date: DateTime"
  - `4`: "npsScore: Int"
  - `5`: "flagStatus: String"
  - `6`: "paymentStatus: String"
  - `7`: "paymentDueDate: DateTime"
  - `8`: "remarks: String"
  - `9`: "loggedBy: String"
  - `10`: "createdAt: DateTime"

### 📊 WhatsAppAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "phoneNumber: String"
  - `3`: "displayName: String"
  - `4`: "wbiztoolClientId: Int"
  - `5`: "wbiztoolWhatsappId: Int"
  - `6`: "sessionStatus: String"
  - `7`: "isActive: Boolean"
  - `8`: "createdById: String"
  - `9`: "messages: WhatsAppMessage"
  - `10`: "schedules: WhatsAppSchedule"
  - `11`: "accessGrants: WhatsAppAccess"
  - `12`: "employeeChats: EmployeeWhatsAppChat"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 WhatsAppMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "account: WhatsAppAccount"
  - `3`: "direction: String"
  - `4`: "phoneNumber: String"
  - `5`: "contactName: String"
  - `6`: "messageType: String"
  - `7`: "content: String"
  - `8`: "mediaUrl: String"
  - `9`: "status: String"
  - `10`: "externalMsgId: String"
  - `11`: "clientId: String"
  - `12`: "client: Client"
  - `13`: "sentById: String"
  - `14`: "scheduleId: String"
  - `15`: "schedule: WhatsAppSchedule"
  - `16`: "sentAt: DateTime"
  - `17`: "createdAt: DateTime"

### 📊 WhatsAppSchedule *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "account: WhatsAppAccount"
  - `3`: "name: String"
  - `4`: "targetType: String"
  - `5`: "targetPhone: String"
  - `6`: "targetClientId: String"
  - `7`: "targetChatId: String"
  - `8`: "isGroup: Boolean"
  - `9`: "messageTemplate: String"
  - `10`: "scheduleType: String"
  - `11`: "frequency: String"
  - `12`: "dayOfWeek: Int"
  - `13`: "dayOfMonth: Int"
  - `14`: "scheduledTime: String"
  - `15`: "scheduledAt: DateTime"
  - `16`: "lastRunAt: DateTime"
  - `17`: "nextRunAt: DateTime"
  - `18`: "runCount: Int"
  - `19`: "status: String"
  - `20`: "createdById: String"
  - `21`: "messages: WhatsAppMessage"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 WhatsAppAccess *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "accountId: String"
  - `4`: "account: WhatsAppAccount"
  - `5`: "accessLevel: String"
  - `6`: "grantedById: String"
  - `7`: "grantedAt: DateTime"

### 📊 EmployeeWhatsAppChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "accountId: String"
  - `4`: "account: WhatsAppAccount"
  - `5`: "phoneNumber: String"
  - `6`: "chatName: String"
  - `7`: "assignedAt: DateTime"
  - `8`: "assignedById: String"

### 📊 WhatsAppSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sessionId: String"
  - `2`: "department: String"
  - `3`: "userId: String"
  - `4`: "status: String"
  - `5`: "phoneNumber: String"
  - `6`: "lastError: String"
  - `7`: "reconnectCount: Int"
  - `8`: "lastConnectedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 WhatsAppAuthState *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sessionId: String"
  - `2`: "key: String"
  - `3`: "value: String"
  - `4`: "createdAt: DateTime"
  - `5`: "updatedAt: DateTime"

### 📊 UserPinnedChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "chatIdentifier: String"
  - `3`: "chatName: String"
  - `4`: "isGroup: Boolean"
  - `5`: "pinnedAt: DateTime"

### 📊 BankStatement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "entityId: String"
  - `2`: "bankName: String"
  - `3`: "accountType: String"
  - `4`: "accountNumber: String"
  - `5`: "statementMonth: DateTime"
  - `6`: "fileName: String"
  - `7`: "fileUrl: String"
  - `8`: "status: String"
  - `9`: "openingBalance: Float"
  - `10`: "closingBalance: Float"
  - `11`: "totalCredits: Float"
  - `12`: "totalDebits: Float"
  - `13`: "matchedCount: Int"
  - `14`: "unmatchedCount: Int"
  - `15`: "aiParsingResult: String"
  - `16`: "processingError: String"
  - `17`: "processedAt: DateTime"
  - `18`: "transactions: BankTransaction"
  - `19`: "uploadedBy: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 BankTransaction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "statementId: String"
  - `2`: "statement: BankStatement"
  - `3`: "transactionDate: DateTime"
  - `4`: "valueDate: DateTime"
  - `5`: "description: String"
  - `6`: "reference: String"
  - `7`: "type: String"
  - `8`: "amount: Float"
  - `9`: "balance: Float"
  - `10`: "matchStatus: String"
  - `11`: "matchConfidence: Float"
  - `12`: "clientId: String"
  - `13`: "client: Client"
  - `14`: "invoiceId: String"
  - `15`: "invoice: Invoice"
  - `16`: "paymentId: String"
  - `17`: "payment: PaymentCollection"
  - `18`: "category: String"
  - `19`: "subcategory: String"
  - `20`: "expenseId: String"
  - `21`: "aiParsedData: String"
  - `22`: "isReviewed: Boolean"
  - `23`: "reviewedBy: String"
  - `24`: "reviewedAt: DateTime"
  - `25`: "reviewNotes: String"
  - `26`: "createdAt: DateTime"
  - `27`: "updatedAt: DateTime"

### 📊 DepartmentExpense *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "month: DateTime"
  - `3`: "baseSalaryComponent: Float"
  - `4`: "rbcComponent: Float"
  - `5`: "totalSalaryComponent: Float"
  - `6`: "toolsExpense: Float"
  - `7`: "freelancerExpense: Float"
  - `8`: "miscExpense: Float"
  - `9`: "totalExpense: Float"
  - `10`: "attributedRevenue: Float"
  - `11`: "clientCount: Int"
  - `12`: "roi: Float"
  - `13`: "costPerClient: Float"
  - `14`: "revenuePerClient: Float"
  - `15`: "notes: String"
  - `16`: "calculatedAt: DateTime"
  - `17`: "calculatedBy: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 DepartmentSalaryAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "department: String"
  - `2`: "month: DateTime"
  - `3`: "headCount: Int"
  - `4`: "totalBaseSalary: Float"
  - `5`: "totalRBCAllocation: Float"
  - `6`: "isVerified: Boolean"
  - `7`: "verifiedBy: String"
  - `8`: "verifiedAt: DateTime"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 AutoInvoiceConfig *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "isEnabled: Boolean"
  - `4`: "generateOnDay: Int"
  - `5`: "sendOnDay: Int"
  - `6`: "sendViaWhatsApp: Boolean"
  - `7`: "sendViaEmail: Boolean"
  - `8`: "useClientMonthlyFee: Boolean"
  - `9`: "customAmount: Float"
  - `10`: "includeGST: Boolean"
  - `11`: "gstPercentage: Float"
  - `12`: "invoicePrefix: String"
  - `13`: "defaultNotes: String"
  - `14`: "lastGeneratedAt: DateTime"
  - `15`: "lastSentAt: DateTime"
  - `16`: "nextScheduledAt: DateTime"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"

### 📊 AccountsMonthlyReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "month: DateTime"
  - `2`: "totalExpectedRevenue: Float"
  - `3`: "totalCollected: Float"
  - `4`: "totalPending: Float"
  - `5`: "totalOverdue: Float"
  - `6`: "collectionRate: Float"
  - `7`: "activeClients: Int"
  - `8`: "newClients: Int"
  - `9`: "churnedClients: Int"
  - `10`: "departmentROISummary: String"
  - `11`: "expenseByCategory: String"
  - `12`: "keyHighlights: String"
  - `13`: "challenges: String"
  - `14`: "actionItems: String"
  - `15`: "status: String"
  - `16`: "scheduledAt: DateTime"
  - `17`: "conductedAt: DateTime"
  - `18`: "conductedBy: String"
  - `19`: "participants: String"
  - `20`: "meetingNotes: String"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"

### 📊 AccountsQuarterlyReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "quarter: Int"
  - `2`: "year: Int"
  - `3`: "quarterlyRevenue: Float"
  - `4`: "previousQuarterRev: Float"
  - `5`: "revenueGrowthPct: Float"
  - `6`: "cashInflow: Float"
  - `7`: "cashOutflow: Float"
  - `8`: "netCashFlow: Float"
  - `9`: "badDebtAmount: Float"
  - `10`: "writeOffClients: String"
  - `11`: "avgCollectionDays: Float"
  - `12`: "clientRetentionRate: Float"
  - `13`: "nextQuarterForecast: Float"
  - `14`: "strategicGoals: String"
  - `15`: "status: String"
  - `16`: "scheduledAt: DateTime"
  - `17`: "conductedAt: DateTime"
  - `18`: "conductedBy: String"
  - `19`: "participants: String"
  - `20`: "meetingNotes: String"
  - `21`: "actionItems: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 Interview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "candidate: Candidate"
  - `3`: "stage: String"
  - `4`: "scheduledAt: DateTime"
  - `5`: "duration: Int"
  - `6`: "location: String"
  - `7`: "meetingLink: String"
  - `8`: "calendarEventId: String"
  - `9`: "interviewerId: String"
  - `10`: "interviewer: User"
  - `11`: "status: String"
  - `12`: "feedback: String"
  - `13`: "rating: Int"
  - `14`: "decision: String"
  - `15`: "notes: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 OfferLetter *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "candidateId: String"
  - `2`: "candidate: Candidate"
  - `3`: "position: String"
  - `4`: "department: String"
  - `5`: "offeredSalary: Float"
  - `6`: "joiningDate: DateTime"
  - `7`: "employmentType: String"
  - `8`: "probationMonths: Int"
  - `9`: "noticePeriodDays: Int"
  - `10`: "negotiationNotes: String"
  - `11`: "finalSalary: Float"
  - `12`: "status: String"
  - `13`: "approvedBy: String"
  - `14`: "approvedAt: DateTime"
  - `15`: "sentAt: DateTime"
  - `16`: "candidateResponse: String"
  - `17`: "respondedAt: DateTime"
  - `18`: "offerLetterUrl: String"
  - `19`: "signedUrl: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 EmployeeClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "employeeId: String"
  - `4`: "employee: User"
  - `5`: "overallRating: Int"
  - `6`: "qualitativeRemarks: String"
  - `7`: "communicationRating: Int"
  - `8`: "deliveryRating: Int"
  - `9`: "professionalismRating: Int"
  - `10`: "responsiveRating: Int"
  - `11`: "service: String"
  - `12`: "projectName: String"
  - `13`: "periodStart: DateTime"
  - `14`: "periodEnd: DateTime"
  - `15`: "collectedBy: String"
  - `16`: "source: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"

### 📊 EmployeeEscalation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "employeeId: String"
  - `2`: "employee: User"
  - `3`: "type: String"
  - `4`: "severity: String"
  - `5`: "title: String"
  - `6`: "description: String"
  - `7`: "clientId: String"
  - `8`: "client: Client"
  - `9`: "reportedBy: String"
  - `10`: "reporter: User"
  - `11`: "status: String"
  - `12`: "resolution: String"
  - `13`: "resolvedBy: String"
  - `14`: "resolvedAt: DateTime"
  - `15`: "impactOnAppraisal: Boolean"
  - `16`: "actionTaken: String"
  - `17`: "managerNotified: Boolean"
  - `18`: "hrNotified: Boolean"
  - `19`: "notifiedAt: DateTime"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 EmployeeAppreciation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "employeeId: String"
  - `2`: "employee: User"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "clientId: String"
  - `7`: "client: Client"
  - `8`: "givenBy: String"
  - `9`: "giver: User"
  - `10`: "xpAwarded: Int"
  - `11`: "isPublic: Boolean"
  - `12`: "certificate: String"
  - `13`: "createdAt: DateTime"

### 📊 ManagerBehaviorReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "managerId: String"
  - `2`: "manager: User"
  - `3`: "quarter: Int"
  - `4`: "year: Int"
  - `5`: "personalityRating: Int"
  - `6`: "commitmentRating: Int"
  - `7`: "behaviorRating: Int"
  - `8`: "leadershipRating: Int"
  - `9`: "communicationRating: Int"
  - `10`: "teamBuildingRating: Int"
  - `11`: "strengths: String"
  - `12`: "areasOfImprovement: String"
  - `13`: "specificIncidents: String"
  - `14`: "teamFeedbackSummary: String"
  - `15`: "reviewedBy: String"
  - `16`: "reviewer: User"
  - `17`: "status: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 EmployerBrandingContent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "platform: String"
  - `5`: "contentText: String"
  - `6`: "mediaUrls: String"
  - `7`: "hashtags: String"
  - `8`: "scheduledFor: DateTime"
  - `9`: "publishedAt: DateTime"
  - `10`: "status: String"
  - `11`: "createdBy: String"
  - `12`: "creator: User"
  - `13`: "approvedBy: String"
  - `14`: "approver: User"
  - `15`: "approvedAt: DateTime"
  - `16`: "rejectionReason: String"
  - `17`: "likes: Int"
  - `18`: "comments: Int"
  - `19`: "shares: Int"
  - `20`: "reach: Int"
  - `21`: "impressions: Int"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 ContentIdea *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "theme: String"
  - `5`: "tags: String"
  - `6`: "status: String"
  - `7`: "usedCount: Int"
  - `8`: "lastUsedAt: DateTime"
  - `9`: "createdBy: String"
  - `10`: "creator: User"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"

### 📊 EngagementActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "type: String"
  - `4`: "scheduledDate: DateTime"
  - `5`: "endDate: DateTime"
  - `6`: "location: String"
  - `7`: "estimatedBudget: Float"
  - `8`: "actualSpent: Float"
  - `9`: "budgetApproved: Boolean"
  - `10`: "status: String"
  - `11`: "approvedBy: String"
  - `12`: "approver: User"
  - `13`: "approvedAt: DateTime"
  - `14`: "rejectionReason: String"
  - `15`: "targetAudience: String"
  - `16`: "department: String"
  - `17`: "expectedCount: Int"
  - `18`: "actualCount: Int"
  - `19`: "organizedBy: String"
  - `20`: "organizer: User"
  - `21`: "photos: String"
  - `22`: "feedback: String"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"

### 📊 WorkAnniversaryReminder *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "anniversaryDate: DateTime"
  - `4`: "yearsCompleted: Int"
  - `5`: "reminderSent: Boolean"
  - `6`: "reminderSentAt: DateTime"
  - `7`: "celebrated: Boolean"
  - `8`: "celebrationNotes: String"
  - `9`: "giftGiven: String"
  - `10`: "createdAt: DateTime"

### 📊 Day0Task *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "description: String"
  - `3`: "category: String"
  - `4`: "responsibleRole: String"
  - `5`: "dueHours: Int"
  - `6`: "isTemplate: Boolean"
  - `7`: "userId: String"
  - `8`: "user: User"
  - `9`: "assignedTo: String"
  - `10`: "assignee: User"
  - `11`: "status: String"
  - `12`: "completedAt: DateTime"
  - `13`: "completedBy: String"
  - `14`: "notes: String"
  - `15`: "createdAt: DateTime"
  - `16`: "updatedAt: DateTime"

### 📊 SaasTool *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "category: String"
  - `3`: "description: String"
  - `4`: "url: String"
  - `5`: "loginType: String"
  - `6`: "email: String"
  - `7`: "password: String"
  - `8`: "notes: String"
  - `9`: "isActive: Boolean"
  - `10`: "accessLevel: String"
  - `11`: "lastAccessedAt: DateTime"
  - `12`: "lastAccessedBy: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 ClientProposal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "prospectName: String"
  - `3`: "prospectEmail: String"
  - `4`: "prospectPhone: String"
  - `5`: "prospectCompany: String"
  - `6`: "services: String"
  - `7`: "scopeItems: String"
  - `8`: "basePrice: Float"
  - `9`: "gstPercentage: Float"
  - `10`: "totalPrice: Float"
  - `11`: "allowServiceModification: Boolean"
  - `12`: "allowScopeModification: Boolean"
  - `13`: "clientName: String"
  - `14`: "clientEmail: String"
  - `15`: "clientPhone: String"
  - `16`: "clientCompany: String"
  - `17`: "clientGst: String"
  - `18`: "selectedServices: String"
  - `19`: "selectedScope: String"
  - `20`: "finalPrice: Float"
  - `21`: "clientAddress: String"
  - `22`: "clientCity: String"
  - `23`: "clientState: String"
  - `24`: "clientPincode: String"
  - `25`: "contractDuration: String"
  - `26`: "paymentTerms: String"
  - `27`: "advanceAmount: Float"
  - `28`: "advancePercentage: Int"
  - `29`: "slaAccepted: Boolean"
  - `30`: "slaAcceptedAt: DateTime"
  - `31`: "slaSignerName: String"
  - `32`: "slaSignerDesignation: String"
  - `33`: "slaDocumentId: String"
  - `34`: "invoiceGenerated: Boolean"
  - `35`: "invoiceGeneratedAt: DateTime"
  - `36`: "invoiceNumber: String"
  - `37`: "paymentMethod: String"
  - `38`: "paymentConfirmed: Boolean"
  - `39`: "paymentConfirmedAt: DateTime"
  - `40`: "paymentConfirmedBy: String"
  - `41`: "paymentReference: String"
  - `42`: "razorpayOrderId: String"
  - `43`: "razorpayPaymentId: String"
  - `44`: "accountOnboardingCompleted: Boolean"
  - `45`: "accountOnboardingCompletedAt: DateTime"
  - `46`: "accountOnboardingData: String"
  - `47`: "managerReviewed: Boolean"
  - `48`: "managerReviewedAt: DateTime"
  - `49`: "managerReviewedBy: String"
  - `50`: "accountManagerId: String"
  - `51`: "teamAllocated: Boolean"
  - `52`: "teamAllocationData: String"
  - `53`: "portalActivated: Boolean"
  - `54`: "portalActivatedAt: DateTime"
  - `55`: "kickoffScheduled: Boolean"
  - `56`: "kickoffDate: DateTime"
  - `57`: "currentStep: Int"
  - `58`: "status: String"
  - `59`: "expiresAt: DateTime"
  - `60`: "viewedAt: DateTime"
  - `61`: "acceptedAt: DateTime"
  - `62`: "clientId: String"
  - `63`: "invoiceId: String"
  - `64`: "createdById: String"
  - `65`: "createdByRole: String"
  - `66`: "entityType: String"
  - `67`: "onboardingDetails: AccountOnboardingDetails"
  - `68`: "createdAt: DateTime"
  - `69`: "updatedAt: DateTime"

### 📊 AccountOnboardingDetails *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "proposalId: String"
  - `2`: "proposal: ClientProposal"
  - `3`: "brandName: String"
  - `4`: "brandTagline: String"
  - `5`: "brandDescription: String"
  - `6`: "brandVoice: String"
  - `7`: "targetAudience: String"
  - `8`: "competitors: String"
  - `9`: "uniqueSellingPoint: String"
  - `10`: "communicationStyle: String"
  - `11`: "reportingFrequency: String"
  - `12`: "meetingPreference: String"
  - `13`: "responseExpectation: String"
  - `14`: "decisionMaker: String"
  - `15`: "feedbackStyle: String"
  - `16`: "involvementLevel: String"
  - `17`: "primaryContactName: String"
  - `18`: "primaryContactPhone: String"
  - `19`: "primaryContactEmail: String"
  - `20`: "whatsappNumber: String"
  - `21`: "preferredChannel: String"
  - `22`: "escalationContact: String"
  - `23`: "escalationPhone: String"
  - `24`: "seoDetails: String"
  - `25`: "socialDetails: String"
  - `26`: "adsDetails: String"
  - `27`: "webDetails: String"
  - `28`: "gbpDetails: String"
  - `29`: "contentApprovalRequired: Boolean"
  - `30`: "contentApprovalBy: String"
  - `31`: "contentTurnaround: String"
  - `32`: "doNotDo: String"
  - `33`: "mustDo: String"
  - `34`: "additionalNotes: String"
  - `35`: "seoSectionComplete: Boolean"
  - `36`: "socialSectionComplete: Boolean"
  - `37`: "adsSectionComplete: Boolean"
  - `38`: "webSectionComplete: Boolean"
  - `39`: "gbpSectionComplete: Boolean"
  - `40`: "createdAt: DateTime"
  - `41`: "updatedAt: DateTime"

### 📊 ClientLedger *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "type: String"
  - `4`: "category: String"
  - `5`: "description: String"
  - `6`: "amount: Float"
  - `7`: "balance: Float"
  - `8`: "referenceId: String"
  - `9`: "recordedBy: String"
  - `10`: "createdAt: DateTime"

### 📊 Sequence *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "value: Int"
  - `2`: "updatedAt: DateTime"

### 📊 MagicLink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "clientId: String"
  - `4`: "role: String"
  - `5`: "department: String"
  - `6`: "ipAddress: String"
  - `7`: "isUsed: Boolean"
  - `8`: "usedAt: DateTime"
  - `9`: "expiresAt: DateTime"
  - `10`: "createdBy: String"
  - `11`: "createdAt: DateTime"

### 📊 UserGoogleDrive *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "accessToken: String"
  - `4`: "refreshToken: String"
  - `5`: "tokenExpiry: DateTime"
  - `6`: "email: String"
  - `7`: "rootFolderId: String"
  - `8`: "isConnected: Boolean"
  - `9`: "lastSyncAt: DateTime"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"

### 📊 WorkEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "date: DateTime"
  - `6`: "year: Int"
  - `7`: "month: Int"
  - `8`: "week: Int"
  - `9`: "category: String"
  - `10`: "deliverableType: String"
  - `11`: "quantity: Int"
  - `12`: "metrics: String"
  - `13`: "resultSummary: String"
  - `14`: "resultMetrics: String"
  - `15`: "hoursSpent: Float"
  - `16`: "description: String"
  - `17`: "notes: String"
  - `18`: "files: WorkEntryFile"
  - `19`: "qualityScore: Int"
  - `20`: "revisionCount: Int"
  - `21`: "turnaroundHours: Float"
  - `22`: "deliverableUrl: String"
  - `23`: "status: String"
  - `24`: "submittedAt: DateTime"
  - `25`: "approvedBy: String"
  - `26`: "approvedAt: DateTime"
  - `27`: "rejectionNote: String"
  - `28`: "tacticalMeetingId: String"
  - `29`: "strategicMeetingId: String"
  - `30`: "whatsappChatId: String"
  - `31`: "goalLinks: TaskGoalLink"
  - `32`: "createdAt: DateTime"
  - `33`: "updatedAt: DateTime"

### 📊 WorkEntryFile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "workEntryId: String"
  - `2`: "workEntry: WorkEntry"
  - `3`: "driveFileId: String"
  - `4`: "fileName: String"
  - `5`: "fileType: String"
  - `6`: "fileSize: Int"
  - `7`: "webViewLink: String"
  - `8`: "thumbnailUrl: String"
  - `9`: "fileCategory: String"
  - `10`: "createdAt: DateTime"

### 📊 DeliverableTypeConfig *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "category: String"
  - `2`: "type: String"
  - `3`: "displayName: String"
  - `4`: "unitValue: Float"
  - `5`: "minQuantity: Int"
  - `6`: "maxQuantity: Int"
  - `7`: "requiredMetrics: String"
  - `8`: "isActive: Boolean"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"

### 📊 WhatsAppChatNote *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "chatIdentifier: String"
  - `4`: "chatName: String"
  - `5`: "content: String"
  - `6`: "isPinned: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"

### 📊 SharedWhatsAppChat *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "chatIdentifier: String"
  - `2`: "chatName: String"
  - `3`: "chatType: String"
  - `4`: "department: String"
  - `5`: "clientId: String"
  - `6`: "client: Client"
  - `7`: "isActive: Boolean"
  - `8`: "addedById: String"
  - `9`: "addedBy: User"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"

### 📊 SocialMediaPost *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "month: DateTime"
  - `6`: "postUrl: String"
  - `7`: "platform: String"
  - `8`: "contentType: String"
  - `9`: "caption: String"
  - `10`: "postedAt: DateTime"
  - `11`: "likes: Int"
  - `12`: "comments: Int"
  - `13`: "shares: Int"
  - `14`: "saves: Int"
  - `15`: "reach: Int"
  - `16`: "impressions: Int"
  - `17`: "views: Int"
  - `18`: "watchTime: Int"
  - `19`: "engagementRate: Float"
  - `20`: "isTopPerformer: Boolean"
  - `21`: "performanceNotes: String"
  - `22`: "createdAt: DateTime"
  - `23`: "updatedAt: DateTime"

### 📊 MonthlyGrowthScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "performanceScore: Float"
  - `5`: "performanceBreakdown: String"
  - `6`: "accountabilityScore: Float"
  - `7`: "clientsManaged: Int"
  - `8`: "clientCapacity: Int"
  - `9`: "accountabilityNotes: String"
  - `10`: "disciplineScore: Float"
  - `11`: "presentDays: Int"
  - `12`: "lateDays: Int"
  - `13`: "absentDays: Int"
  - `14`: "onTimePercentage: Float"
  - `15`: "disciplineSource: String"
  - `16`: "learningScore: Float"
  - `17`: "learningHoursLogged: Float"
  - `18`: "learningHoursRequired: Float"
  - `19`: "appreciationScore: Float"
  - `20`: "managerAppreciations: Int"
  - `21`: "clientAppreciations: Int"
  - `22`: "testimonials: Int"
  - `23`: "escalationsCount: Int"
  - `24`: "escalationDeduction: Float"
  - `25`: "clientsLost: Int"
  - `26`: "churnDeduction: Float"
  - `27`: "finalScore: Float"
  - `28`: "scoreGrade: String"
  - `29`: "tacticalDataSubmitted: Boolean"
  - `30`: "submittedAt: DateTime"
  - `31`: "submittedOnTime: Boolean"
  - `32`: "reviewedBy: String"
  - `33`: "reviewedAt: DateTime"
  - `34`: "reviewNotes: String"
  - `35`: "createdAt: DateTime"
  - `36`: "updatedAt: DateTime"

### 📊 SocialMediaPageMetrics *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "month: DateTime"
  - `6`: "platform: String"
  - `7`: "followers: Int"
  - `8`: "prevFollowers: Int"
  - `9`: "followerGrowth: Float"
  - `10`: "totalReach: Int"
  - `11`: "prevTotalReach: Int"
  - `12`: "reachGrowth: Float"
  - `13`: "totalEngagement: Int"
  - `14`: "engagementRate: Float"
  - `15`: "prevEngagementRate: Float"
  - `16`: "postsPublished: Int"
  - `17`: "reelsPublished: Int"
  - `18`: "storiesPublished: Int"
  - `19`: "leadsGenerated: Int"
  - `20`: "linkClicks: Int"
  - `21`: "profileVisits: Int"
  - `22`: "connections: Int"
  - `23`: "subscribers: Int"
  - `24`: "videoViews: Int"
  - `25`: "createdAt: DateTime"
  - `26`: "updatedAt: DateTime"

### 📊 RecurringExpense *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "name: String"
  - `2`: "description: String"
  - `3`: "category: String"
  - `4`: "vendor: String"
  - `5`: "frequency: String"
  - `6`: "amount: Float"
  - `7`: "currency: String"
  - `8`: "startDate: DateTime"
  - `9`: "endDate: DateTime"
  - `10`: "nextDueDate: DateTime"
  - `11`: "lastPaidDate: DateTime"
  - `12`: "isClientBillable: Boolean"
  - `13`: "autoPayEnabled: Boolean"
  - `14`: "reminderDays: Int"
  - `15`: "status: String"
  - `16`: "createdBy: String"
  - `17`: "creator: User"
  - `18`: "allocations: ExpenseAllocation"
  - `19`: "payments: ExpensePayment"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 ExpenseAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "expenseId: String"
  - `2`: "expense: RecurringExpense"
  - `3`: "clientId: String"
  - `4`: "client: Client"
  - `5`: "percentage: Float"
  - `6`: "fixedAmount: Float"
  - `7`: "notes: String"
  - `8`: "createdAt: DateTime"
  - `9`: "updatedAt: DateTime"

### 📊 ExpensePayment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "expenseId: String"
  - `2`: "expense: RecurringExpense"
  - `3`: "amount: Float"
  - `4`: "paidDate: DateTime"
  - `5`: "dueDate: DateTime"
  - `6`: "paymentMethod: String"
  - `7`: "transactionRef: String"
  - `8`: "receipt: String"
  - `9`: "status: String"
  - `10`: "notes: String"
  - `11`: "paidBy: String"
  - `12`: "payer: User"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 Goal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "level: String"
  - `2`: "parentId: String"
  - `3`: "parent: Goal"
  - `4`: "children: Goal"
  - `5`: "title: String"
  - `6`: "description: String"
  - `7`: "category: String"
  - `8`: "quarter: Int"
  - `9`: "year: Int"
  - `10`: "clientId: String"
  - `11`: "client: Client"
  - `12`: "department: String"
  - `13`: "ownerId: String"
  - `14`: "owner: User"
  - `15`: "startDate: DateTime"
  - `16`: "targetDate: DateTime"
  - `17`: "completedDate: DateTime"
  - `18`: "targetValue: Float"
  - `19`: "currentValue: Float"
  - `20`: "unit: String"
  - `21`: "status: String"
  - `22`: "progress: Float"
  - `23`: "weight: Float"
  - `24`: "score: Float"
  - `25`: "achievementNotes: String"
  - `26`: "selfRating: Int"
  - `27`: "createdBy: String"
  - `28`: "creator: User"
  - `29`: "taskLinks: TaskGoalLink"
  - `30`: "createdAt: DateTime"
  - `31`: "updatedAt: DateTime"

### 📊 TaskGoalLink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "goalId: String"
  - `2`: "goal: Goal"
  - `3`: "dailyTaskId: String"
  - `4`: "dailyTask: DailyTask"
  - `5`: "workEntryId: String"
  - `6`: "workEntry: WorkEntry"
  - `7`: "contributionWeight: Float"
  - `8`: "notes: String"
  - `9`: "createdAt: DateTime"

### 📊 BudgetAlert *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "scope: String"
  - `2`: "clientId: String"
  - `3`: "client: Client"
  - `4`: "department: String"
  - `5`: "budgetAmount: Float"
  - `6`: "currency: String"
  - `7`: "period: String"
  - `8`: "periodStart: DateTime"
  - `9`: "periodEnd: DateTime"
  - `10`: "warningThreshold: Float"
  - `11`: "criticalThreshold: Float"
  - `12`: "spentAmount: Float"
  - `13`: "spentPercentage: Float"
  - `14`: "alertLevel: String"
  - `15`: "lastAlertSent: DateTime"
  - `16`: "alertsEnabled: Boolean"
  - `17`: "pauseOnCritical: Boolean"
  - `18`: "isPaused: Boolean"
  - `19`: "pausedAt: DateTime"
  - `20`: "pausedBy: String"
  - `21`: "notifyUsers: String"
  - `22`: "notifyOnWarning: Boolean"
  - `23`: "notifyOnCritical: Boolean"
  - `24`: "createdBy: String"
  - `25`: "creator: User"
  - `26`: "createdAt: DateTime"
  - `27`: "updatedAt: DateTime"

### 📊 ClientOAuthConnection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "platform: String"
  - `4`: "accessToken: String"
  - `5`: "refreshToken: String"
  - `6`: "tokenType: String"
  - `7`: "expiresAt: DateTime"
  - `8`: "scopes: String"
  - `9`: "status: String"
  - `10`: "lastError: String"
  - `11`: "lastSyncAt: DateTime"
  - `12`: "lastSyncStatus: String"
  - `13`: "connectedBy: String"
  - `14`: "connectedAt: DateTime"
  - `15`: "platformUserId: String"
  - `16`: "platformEmail: String"
  - `17`: "agencyAccessGranted: Boolean"
  - `18`: "agencyAccessVerifiedAt: DateTime"
  - `19`: "delegatedToEmail: String"
  - `20`: "accounts: PlatformAccount"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"

### 📊 PlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "connectionId: String"
  - `2`: "connection: ClientOAuthConnection"
  - `3`: "platform: String"
  - `4`: "accountId: String"
  - `5`: "accountName: String"
  - `6`: "accountType: String"
  - `7`: "metadata: String"
  - `8`: "isActive: Boolean"
  - `9`: "isPrimary: Boolean"
  - `10`: "lastSyncAt: DateTime"
  - `11`: "lastSyncStatus: String"
  - `12`: "metrics: PlatformMetric"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 PlatformMetric *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "account: PlatformAccount"
  - `3`: "date: DateTime"
  - `4`: "periodType: String"
  - `5`: "metricType: String"
  - `6`: "metricValue: Float"
  - `7`: "metricUnit: String"
  - `8`: "previousValue: Float"
  - `9`: "changePercent: Float"
  - `10`: "dimension: String"
  - `11`: "dimensionValue: String"
  - `12`: "rawData: String"
  - `13`: "createdAt: DateTime"

### 📊 PlatformSyncJob *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "connectionId: String"
  - `2`: "accountId: String"
  - `3`: "platform: String"
  - `4`: "syncType: String"
  - `5`: "status: String"
  - `6`: "startedAt: DateTime"
  - `7`: "completedAt: DateTime"
  - `8`: "recordsProcessed: Int"
  - `9`: "recordsFailed: Int"
  - `10`: "errorMessage: String"
  - `11`: "errorDetails: String"
  - `12`: "createdAt: DateTime"

### 📊 MagicLinkToken *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "user: User"
  - `4`: "channel: String"
  - `5`: "expiresAt: DateTime"
  - `6`: "usedAt: DateTime"
  - `7`: "createdAt: DateTime"

### 📊 PasswordResetToken *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "userId: String"
  - `3`: "user: User"
  - `4`: "channel: String"
  - `5`: "purpose: String"
  - `6`: "expiresAt: DateTime"
  - `7`: "usedAt: DateTime"
  - `8`: "createdAt: DateTime"

### 📊 AgencyApiCredential *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "provider: String"
  - `2`: "credentialType: String"
  - `3`: "name: String"
  - `4`: "credentials: String"
  - `5`: "status: String"
  - `6`: "environment: String"
  - `7`: "lastVerifiedAt: DateTime"
  - `8`: "lastVerifiedBy: String"
  - `9`: "lastError: String"
  - `10`: "usageCount: Int"
  - `11`: "lastUsedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "createdBy: String"
  - `14`: "updatedAt: DateTime"
  - `15`: "updatedBy: String"
  - `16`: "auditLogs: ApiCredentialAuditLog"

### 📊 AgencyServiceAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "platform: String"
  - `2`: "serviceType: String"
  - `3`: "email: String"
  - `4`: "name: String"
  - `5`: "description: String"
  - `6`: "isActive: Boolean"
  - `7`: "createdAt: DateTime"
  - `8`: "updatedAt: DateTime"

### 📊 OAuthAccessRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "platform: String"
  - `4`: "serviceType: String"
  - `5`: "targetEmail: String"
  - `6`: "status: String"
  - `7`: "instructionsSentAt: DateTime"
  - `8`: "accessVerifiedAt: DateTime"
  - `9`: "notes: String"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"

### 📊 ApiCredentialAuditLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "credentialId: String"
  - `2`: "credential: AgencyApiCredential"
  - `3`: "action: String"
  - `4`: "fieldChanged: String"
  - `5`: "userId: String"
  - `6`: "userIp: String"
  - `7`: "success: Boolean"
  - `8`: "errorMessage: String"
  - `9`: "createdAt: DateTime"

### 📊 ClientPlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "platform: String"
  - `4`: "accountId: String"
  - `5`: "accountName: String"
  - `6`: "accessType: String"
  - `7`: "isActive: Boolean"
  - `8`: "lastSyncAt: DateTime"
  - `9`: "lastSyncStatus: String"
  - `10`: "syncError: String"
  - `11`: "metadata: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"
  - `14`: "createdBy: String"
  - `15`: "metrics: PlatformMetricEntry"

### 📊 PlatformMetricEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "accountId: String"
  - `2`: "account: ClientPlatformAccount"
  - `3`: "date: DateTime"
  - `4`: "metricType: String"
  - `5`: "value: Float"
  - `6`: "dimension: String"
  - `7`: "dimensionValue: String"
  - `8`: "importSource: String"
  - `9`: "importBatchId: String"
  - `10`: "createdAt: DateTime"
  - `11`: "createdBy: String"

### 📊 DataImportBatch *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "platform: String"
  - `4`: "accountId: String"
  - `5`: "importType: String"
  - `6`: "fileName: String"
  - `7`: "totalRows: Int"
  - `8`: "successRows: Int"
  - `9`: "failedRows: Int"
  - `10`: "errorLog: String"
  - `11`: "status: String"
  - `12`: "createdAt: DateTime"
  - `13`: "createdBy: String"
  - `14`: "completedAt: DateTime"

### 📊 ClientUserInvitation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "email: String"
  - `4`: "name: String"
  - `5`: "role: String"
  - `6`: "token: String"
  - `7`: "expiresAt: DateTime"
  - `8`: "acceptedAt: DateTime"
  - `9`: "invitedById: String"
  - `10`: "invitedBy: ClientUser"
  - `11`: "status: String"
  - `12`: "createdAt: DateTime"

### 📊 ClientUserActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientUserId: String"
  - `2`: "clientUser: ClientUser"
  - `3`: "action: String"
  - `4`: "resource: String"
  - `5`: "resourceType: String"
  - `6`: "details: String"
  - `7`: "ipAddress: String"
  - `8`: "userAgent: String"
  - `9`: "createdAt: DateTime"

### 📊 PortalNotification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "clientUserId: String"
  - `4`: "clientUser: ClientUser"
  - `5`: "title: String"
  - `6`: "message: String"
  - `7`: "type: String"
  - `8`: "category: String"
  - `9`: "actionUrl: String"
  - `10`: "actionLabel: String"
  - `11`: "isRead: Boolean"
  - `12`: "readAt: DateTime"
  - `13`: "sourceType: String"
  - `14`: "sourceId: String"
  - `15`: "expiresAt: DateTime"
  - `16`: "createdAt: DateTime"

### 📊 ClientDocument *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "name: String"
  - `4`: "description: String"
  - `5`: "category: String"
  - `6`: "fileUrl: String"
  - `7`: "fileType: String"
  - `8`: "fileSize: Int"
  - `9`: "version: Int"
  - `10`: "previousVersionId: String"
  - `11`: "uploadedById: String"
  - `12`: "uploadedBy: ClientUser"
  - `13`: "uploadedByStaff: String"
  - `14`: "isPublic: Boolean"
  - `15`: "allowDownload: Boolean"
  - `16`: "sharedWith: String"
  - `17`: "expiresAt: DateTime"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 ClientAnnouncement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "title: String"
  - `2`: "content: String"
  - `3`: "type: String"
  - `4`: "priority: String"
  - `5`: "targetAll: Boolean"
  - `6`: "clientId: String"
  - `7`: "client: Client"
  - `8`: "targetTiers: String"
  - `9`: "isPinned: Boolean"
  - `10`: "imageUrl: String"
  - `11`: "actionUrl: String"
  - `12`: "actionLabel: String"
  - `13`: "publishAt: DateTime"
  - `14`: "expiresAt: DateTime"
  - `15`: "createdById: String"
  - `16`: "isActive: Boolean"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"

### 📊 ClientGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "name: String"
  - `4`: "description: String"
  - `5`: "category: String"
  - `6`: "metricType: String"
  - `7`: "targetValue: Float"
  - `8`: "currentValue: Float"
  - `9`: "unit: String"
  - `10`: "periodType: String"
  - `11`: "startDate: DateTime"
  - `12`: "endDate: DateTime"
  - `13`: "status: String"
  - `14`: "achievedAt: DateTime"
  - `15`: "isVisible: Boolean"
  - `16`: "displayOrder: Int"
  - `17`: "color: String"
  - `18`: "createdAt: DateTime"
  - `19`: "updatedAt: DateTime"

### 📊 ContentApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "type: String"
  - `6`: "contentUrl: String"
  - `7`: "previewUrl: String"
  - `8`: "attachments: String"
  - `9`: "status: String"
  - `10`: "priority: String"
  - `11`: "dueDate: DateTime"
  - `12`: "reviewedById: String"
  - `13`: "reviewedBy: ClientUser"
  - `14`: "reviewedAt: DateTime"
  - `15`: "reviewNote: String"
  - `16`: "revisionCount: Int"
  - `17`: "revisionNotes: String"
  - `18`: "createdById: String"
  - `19`: "reminderSent: Boolean"
  - `20`: "reminderSentAt: DateTime"
  - `21`: "createdAt: DateTime"
  - `22`: "updatedAt: DateTime"

### 📊 ClientAccessRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "requestedById: String"
  - `4`: "requestedBy: User"
  - `5`: "requestedRole: String"
  - `6`: "purpose: String"
  - `7`: "status: String"
  - `8`: "approvedById: String"
  - `9`: "approvedBy: User"
  - `10`: "approvedAt: DateTime"
  - `11`: "rejectionReason: String"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 WebProjectPhase *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "phase: String"
  - `4`: "status: String"
  - `5`: "assignedTo: String"
  - `6`: "user: User"
  - `7`: "startedAt: DateTime"
  - `8`: "completedAt: DateTime"
  - `9`: "notes: String"
  - `10`: "proofUrl: String"
  - `11`: "order: Int"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 MaintenanceContract *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "type: String"
  - `4`: "startDate: DateTime"
  - `5`: "endDate: DateTime"
  - `6`: "renewalDate: DateTime"
  - `7`: "amount: Float"
  - `8`: "status: String"
  - `9`: "autoRenew: Boolean"
  - `10`: "reminderSent: Boolean"
  - `11`: "notes: String"
  - `12`: "domainName: String"
  - `13`: "domainRegistrar: String"
  - `14`: "domainExpiryDate: DateTime"
  - `15`: "serverProvider: String"
  - `16`: "serverExpiryDate: DateTime"
  - `17`: "serverPlan: String"
  - `18`: "billingCycle: String"
  - `19`: "nextBillingDate: DateTime"
  - `20`: "allocatedHours: Float"
  - `21`: "usedHours: Float"
  - `22`: "hourlyRateAfter: Float"
  - `23`: "expiryReminderSent: Boolean"
  - `24`: "reminderSentAt: DateTime"
  - `25`: "maintenanceLogs: MaintenanceLog"
  - `26`: "createdAt: DateTime"
  - `27`: "updatedAt: DateTime"

### 📊 ServiceChangeRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "proposalId: String"
  - `2`: "clientId: String"
  - `3`: "type: String"
  - `4`: "serviceId: String"
  - `5`: "serviceName: String"
  - `6`: "reason: String"
  - `7`: "status: String"
  - `8`: "reviewedAt: DateTime"
  - `9`: "reviewedBy: String"
  - `10`: "managerNotes: String"
  - `11`: "priceImpact: Float"
  - `12`: "effectiveFrom: DateTime"
  - `13`: "annexureNumber: String"
  - `14`: "annexureData: String"
  - `15`: "requestedAt: DateTime"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 ServiceTermination *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "requestedBy: String"
  - `4`: "requestedAt: DateTime"
  - `5`: "reason: String"
  - `6`: "feedback: String"
  - `7`: "noticeStartDate: DateTime"
  - `8`: "noticeEndDate: DateTime"
  - `9`: "lastServiceDate: DateTime"
  - `10`: "monthlyFee: Float"
  - `11`: "daysInMonth: Int"
  - `12`: "daysServed: Int"
  - `13`: "proRataAmount: Float"
  - `14`: "proRataBreakdown: String"
  - `15`: "pendingDues: Float"
  - `16`: "totalDue: Float"
  - `17`: "amountPaid: Float"
  - `18`: "paymentCleared: Boolean"
  - `19`: "paymentClearedAt: DateTime"
  - `20`: "handoverCallScheduled: Boolean"
  - `21`: "handoverCallDate: DateTime"
  - `22`: "handoverCallCompleted: Boolean"
  - `23`: "handoverCallNotes: String"
  - `24`: "handoverMeetingId: String"
  - `25`: "dataExportEnabled: Boolean"
  - `26`: "dataExportedAt: DateTime"
  - `27`: "dataExportUrl: String"
  - `28`: "status: String"
  - `29`: "completedAt: DateTime"
  - `30`: "cancelledAt: DateTime"
  - `31`: "cancelledReason: String"
  - `32`: "processedBy: String"
  - `33`: "processedAt: DateTime"
  - `34`: "adminNotes: String"
  - `35`: "createdAt: DateTime"
  - `36`: "updatedAt: DateTime"

### 📊 WebsiteSitemap *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "pageName: String"
  - `4`: "pageSlug: String"
  - `5`: "pageUrl: String"
  - `6`: "pageType: String"
  - `7`: "description: String"
  - `8`: "status: String"
  - `9`: "order: Int"
  - `10`: "wireframeUrl: String"
  - `11`: "designUrl: String"
  - `12`: "previewUrl: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"
  - `15`: "feedback: PageFeedback"

### 📊 PageFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "sitemapId: String"
  - `2`: "sitemap: WebsiteSitemap"
  - `3`: "clientUserId: String"
  - `4`: "clientUser: ClientUser"
  - `5`: "userId: String"
  - `6`: "user: User"
  - `7`: "feedbackType: String"
  - `8`: "message: String"
  - `9`: "screenshotUrl: String"
  - `10`: "status: String"
  - `11`: "parentId: String"
  - `12`: "parent: PageFeedback"
  - `13`: "replies: PageFeedback"
  - `14`: "createdAt: DateTime"
  - `15`: "resolvedAt: DateTime"

### 📊 WebOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "token: String"
  - `2`: "clientId: String"
  - `3`: "client: Client"
  - `4`: "status: String"
  - `5`: "businessName: String"
  - `6`: "businessDescription: String"
  - `7`: "industry: String"
  - `8`: "targetAudience: String"
  - `9`: "websiteType: String"
  - `10`: "requiredPages: String"
  - `11`: "features: String"
  - `12`: "colorPreferences: String"
  - `13`: "stylePreference: String"
  - `14`: "referenceUrls: String"
  - `15`: "hasLogo: Boolean"
  - `16`: "hasContent: Boolean"
  - `17`: "logoUrl: String"
  - `18`: "brandGuideUrl: String"
  - `19`: "hasDomain: Boolean"
  - `20`: "domainName: String"
  - `21`: "hasHosting: Boolean"
  - `22`: "hostingProvider: String"
  - `23`: "contactName: String"
  - `24`: "contactEmail: String"
  - `25`: "contactPhone: String"
  - `26`: "submittedAt: DateTime"
  - `27`: "reviewedBy: String"
  - `28`: "convertedAt: DateTime"
  - `29`: "createdAt: DateTime"
  - `30`: "updatedAt: DateTime"

### 📊 Domain 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "domainName: String"
  - `4`: "registrar: String"
  - `5`: "registrationDate: DateTime"
  - `6`: "expiryDate: DateTime"
  - `7`: "autoRenew: Boolean"
  - `8`: "nameservers: String"
  - `9`: "dnsProvider: String"
  - `10`: "sslStatus: String"
  - `11`: "sslExpiryDate: DateTime"
  - `12`: "sslProvider: String"
  - `13`: "purchasedBy: String"
  - `14`: "annualCost: Float"
  - `15`: "loginUrl: String"
  - `16`: "notes: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"

### 📊 HostingAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "provider: String"
  - `4`: "planType: String"
  - `5`: "planName: String"
  - `6`: "serverLocation: String"
  - `7`: "monthlyCost: Float"
  - `8`: "renewalDate: DateTime"
  - `9`: "storageGB: Float"
  - `10`: "bandwidthGB: Float"
  - `11`: "ipAddress: String"
  - `12`: "cpanelUrl: String"
  - `13`: "sshAccess: Boolean"
  - `14`: "sshHost: String"
  - `15`: "sshPort: Int"
  - `16`: "purchasedBy: String"
  - `17`: "status: String"
  - `18`: "loginUrl: String"
  - `19`: "notes: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 MaintenanceLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "contractId: String"
  - `2`: "contract: MaintenanceContract"
  - `3`: "date: DateTime"
  - `4`: "hoursSpent: Float"
  - `5`: "description: String"
  - `6`: "performedById: String"
  - `7`: "category: String"
  - `8`: "billable: Boolean"
  - `9`: "ticketId: String"
  - `10`: "attachments: String"
  - `11`: "clientVisible: Boolean"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 WebReimbursement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "type: String"
  - `4`: "description: String"
  - `5`: "vendor: String"
  - `6`: "amount: Float"
  - `7`: "currency: String"
  - `8`: "paidById: String"
  - `9`: "paidDate: DateTime"
  - `10`: "receiptUrl: String"
  - `11`: "invoiceUrl: String"
  - `12`: "status: String"
  - `13`: "approvedById: String"
  - `14`: "approvedAt: DateTime"
  - `15`: "rejectionReason: String"
  - `16`: "reimbursedDate: DateTime"
  - `17`: "billedToClient: Boolean"
  - `18`: "clientInvoiceId: String"
  - `19`: "notes: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 UpsellOpportunity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "type: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "estimatedValue: Float"
  - `7`: "probability: Int"
  - `8`: "status: String"
  - `9`: "assignedToId: String"
  - `10`: "source: String"
  - `11`: "triggerReason: String"
  - `12`: "pitchedDate: DateTime"
  - `13`: "pitchNotes: String"
  - `14`: "followUpDate: DateTime"
  - `15`: "wonDate: DateTime"
  - `16`: "lostDate: DateTime"
  - `17`: "lostReason: String"
  - `18`: "wonValue: Float"
  - `19`: "notes: String"
  - `20`: "createdAt: DateTime"
  - `21`: "updatedAt: DateTime"

### 📊 WebProject *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "name: String"
  - `4`: "description: String"
  - `5`: "projectType: String"
  - `6`: "status: String"
  - `7`: "priority: String"
  - `8`: "startDate: DateTime"
  - `9`: "targetEndDate: DateTime"
  - `10`: "actualEndDate: DateTime"
  - `11`: "quotedAmount: Float"
  - `12`: "finalAmount: Float"
  - `13`: "estimatedHours: Float"
  - `14`: "actualHours: Float"
  - `15`: "profitMargin: Float"
  - `16`: "platform: String"
  - `17`: "techStack: String"
  - `18`: "stagingUrl: String"
  - `19`: "productionUrl: String"
  - `20`: "repositoryUrl: String"
  - `21`: "figmaUrl: String"
  - `22`: "projectManagerId: String"
  - `23`: "leadDeveloperId: String"
  - `24`: "leadDesignerId: String"
  - `25`: "currentPhase: String"
  - `26`: "phaseProgress: String"
  - `27`: "notes: String"
  - `28`: "createdAt: DateTime"
  - `29`: "updatedAt: DateTime"
  - `30`: "phases: WebProjectPhaseItem"
  - `31`: "bugReports: WebBugReport"
  - `32`: "changeRequests: WebChangeRequest"
  - `33`: "designApprovals: WebDesignApproval"
  - `34`: "timeEntries: WebProjectTimeEntry"

### 📊 WebProjectPhaseItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "project: WebProject"
  - `3`: "phase: String"
  - `4`: "status: String"
  - `5`: "order: Int"
  - `6`: "assignedToId: String"
  - `7`: "startedAt: DateTime"
  - `8`: "completedAt: DateTime"
  - `9`: "approvedAt: DateTime"
  - `10`: "approvedById: String"
  - `11`: "checklist: String"
  - `12`: "requiresApproval: Boolean"
  - `13`: "approvalNotes: String"
  - `14`: "revisionCount: Int"
  - `15`: "deliverableUrls: String"
  - `16`: "notes: String"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"

### 📊 WebBugReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "project: WebProject"
  - `3`: "clientUserId: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "pageUrl: String"
  - `7`: "screenshotUrl: String"
  - `8`: "browserInfo: String"
  - `9`: "priority: String"
  - `10`: "status: String"
  - `11`: "assignedToId: String"
  - `12`: "resolvedAt: DateTime"
  - `13`: "resolvedById: String"
  - `14`: "resolution: String"
  - `15`: "fixedInVersion: String"
  - `16`: "estimatedHours: Float"
  - `17`: "actualHours: Float"
  - `18`: "isBillable: Boolean"
  - `19`: "createdAt: DateTime"
  - `20`: "updatedAt: DateTime"

### 📊 WebChangeRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "project: WebProject"
  - `3`: "clientUserId: String"
  - `4`: "title: String"
  - `5`: "description: String"
  - `6`: "type: String"
  - `7`: "pageUrl: String"
  - `8`: "screenshotUrl: String"
  - `9`: "estimatedHours: Float"
  - `10`: "estimatedCost: Float"
  - `11`: "requiresApproval: Boolean"
  - `12`: "status: String"
  - `13`: "clientApprovedAt: DateTime"
  - `14`: "rejectionReason: String"
  - `15`: "assignedToId: String"
  - `16`: "completedAt: DateTime"
  - `17`: "completedById: String"
  - `18`: "actualHours: Float"
  - `19`: "actualCost: Float"
  - `20`: "isBillable: Boolean"
  - `21`: "invoiced: Boolean"
  - `22`: "invoiceId: String"
  - `23`: "createdAt: DateTime"
  - `24`: "updatedAt: DateTime"

### 📊 WebDesignApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "project: WebProject"
  - `3`: "title: String"
  - `4`: "description: String"
  - `5`: "designUrl: String"
  - `6`: "thumbnailUrl: String"
  - `7`: "phase: String"
  - `8`: "version: Int"
  - `9`: "status: String"
  - `10`: "clientUserId: String"
  - `11`: "reviewedAt: DateTime"
  - `12`: "clientFeedback: String"
  - `13`: "feedbackPins: String"
  - `14`: "designerId: String"
  - `15`: "internalNotes: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 WebProjectTimeEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "projectId: String"
  - `2`: "project: WebProject"
  - `3`: "userId: String"
  - `4`: "date: DateTime"
  - `5`: "hours: Float"
  - `6`: "description: String"
  - `7`: "phase: String"
  - `8`: "category: String"
  - `9`: "isBillable: Boolean"
  - `10`: "invoiced: Boolean"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"

### 📊 DailyMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "date: DateTime"
  - `4`: "checkInTime: DateTime"
  - `5`: "yesterdayWork: String"
  - `6`: "yesterdayBlockers: String"
  - `7`: "todayPlan: String"
  - `8`: "todayClients: String"
  - `9`: "estimatedHours: Float"
  - `10`: "workload: String"
  - `11`: "mood: String"
  - `12`: "needsHelp: Boolean"
  - `13`: "helpDescription: String"
  - `14`: "workLocation: String"
  - `15`: "isLate: Boolean"
  - `16`: "autoMarked: Boolean"
  - `17`: "createdAt: DateTime"
  - `18`: "updatedAt: DateTime"

### 📊 MeetingCompliance *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "month: DateTime"
  - `4`: "dailyMeetingsExpected: Int"
  - `5`: "dailyMeetingsFilled: Int"
  - `6`: "dailyMeetingsLate: Int"
  - `7`: "dailyMeetingsMissed: Int"
  - `8`: "autoMarkedLeaves: Int"
  - `9`: "tacticalFilled: Boolean"
  - `10`: "tacticalFilledAt: DateTime"
  - `11`: "tacticalIsLate: Boolean"
  - `12`: "strategicFilled: Boolean"
  - `13`: "strategicFilledAt: DateTime"
  - `14`: "strategicIsLate: Boolean"
  - `15`: "complianceScore: Float"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 AIExtractionSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "userId: String"
  - `2`: "user: User"
  - `3`: "targetType: String"
  - `4`: "targetId: String"
  - `5`: "clientId: String"
  - `6`: "client: Client"
  - `7`: "messages: String"
  - `8`: "extractedData: String"
  - `9`: "confidence: Float"
  - `10`: "status: String"
  - `11`: "completedAt: DateTime"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 SystemSetting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "key: String"
  - `2`: "value: String"
  - `3`: "category: String"
  - `4`: "description: String"
  - `5`: "updatedBy: String"
  - `6`: "updatedAt: DateTime"
  - `7`: "createdAt: DateTime"

### 📊 SeoKeyword *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "keyword: String"
  - `4`: "location: String"
  - `5`: "searchVolume: Int"
  - `6`: "currentRank: Int"
  - `7`: "previousRank: Int"
  - `8`: "targetPage: String"
  - `9`: "isActive: Boolean"
  - `10`: "createdAt: DateTime"
  - `11`: "updatedAt: DateTime"
  - `12`: "rankHistory: SeoRankHistory"

### 📊 SeoRankHistory *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "keywordId: String"
  - `2`: "keyword: SeoKeyword"
  - `3`: "rank: Int"
  - `4`: "date: DateTime"

### 📊 SeoBacklink *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "targetUrl: String"
  - `4`: "anchorText: String"
  - `5`: "backlinkSource: String"
  - `6`: "domainAuthority: Int"
  - `7`: "status: String"
  - `8`: "liveUrl: String"
  - `9`: "submittedDate: DateTime"
  - `10`: "createdById: String"
  - `11`: "createdBy: User"
  - `12`: "createdAt: DateTime"
  - `13`: "updatedAt: DateTime"

### 📊 SeoContent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "blogTopic: String"
  - `4`: "targetKeyword: String"
  - `5`: "writerId: String"
  - `6`: "writer: User"
  - `7`: "status: String"
  - `8`: "wordCount: Int"
  - `9`: "publishedUrl: String"
  - `10`: "deadline: DateTime"
  - `11`: "createdAt: DateTime"
  - `12`: "updatedAt: DateTime"

### 📊 GbpProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "profileName: String"
  - `4`: "location: String"
  - `5`: "category: String"
  - `6`: "totalReviews: Int"
  - `7`: "rating: Float"
  - `8`: "status: String"
  - `9`: "createdAt: DateTime"
  - `10`: "updatedAt: DateTime"
  - `11`: "posts: GbpPost"
  - `12`: "metrics: GbpMetric"

### 📊 GbpPost *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "profileId: String"
  - `2`: "profile: GbpProfile"
  - `3`: "postType: String"
  - `4`: "content: String"
  - `5`: "proofLink: String"
  - `6`: "views: Int"
  - `7`: "publishedAt: DateTime"
  - `8`: "createdAt: DateTime"

### 📊 GbpMetric *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "profileId: String"
  - `2`: "profile: GbpProfile"
  - `3`: "month: String"
  - `4`: "calls: Int"
  - `5`: "directions: Int"
  - `6`: "profileViews: Int"
  - `7`: "websiteClicks: Int"
  - `8`: "monthlyPosts: Int"
  - `9`: "createdAt: DateTime"

### 📊 SeoTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "taskType: String"
  - `4`: "category: String"
  - `5`: "description: String"
  - `6`: "assignedToId: String"
  - `7`: "assignedTo: User"
  - `8`: "reviewerId: String"
  - `9`: "reviewer: User"
  - `10`: "priority: String"
  - `11`: "status: String"
  - `12`: "deadline: DateTime"
  - `13`: "completedAt: DateTime"
  - `14`: "createdAt: DateTime"
  - `15`: "updatedAt: DateTime"

### 📊 Campaign 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "name: String"
  - `4`: "platform: String"
  - `5`: "campaignType: String"
  - `6`: "objective: String"
  - `7`: "status: String"
  - `8`: "externalId: String"
  - `9`: "dailyBudget: Float"
  - `10`: "monthlyBudget: Float"
  - `11`: "totalBudget: Float"
  - `12`: "currency: String"
  - `13`: "targetAudience: String"
  - `14`: "keywords: String"
  - `15`: "placements: String"
  - `16`: "impressions: Int"
  - `17`: "clicks: Int"
  - `18`: "conversions: Int"
  - `19`: "leads: Int"
  - `20`: "spend: Float"
  - `21`: "cpc: Float"
  - `22`: "cpl: Float"
  - `23`: "ctr: Float"
  - `24`: "roas: Float"
  - `25`: "qualityScore: Float"
  - `26`: "startDate: DateTime"
  - `27`: "endDate: DateTime"
  - `28`: "adCreatives: AdCreative"
  - `29`: "adSpendRecords: AdSpend"
  - `30`: "abTests: ABTest"
  - `31`: "conversionEvents: ConversionEvent"
  - `32`: "assignedToId: String"
  - `33`: "assignedTo: User"
  - `34`: "createdById: String"
  - `35`: "createdAt: DateTime"
  - `36`: "updatedAt: DateTime"

### 📊 AdCreative *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "campaign: Campaign"
  - `3`: "clientId: String"
  - `4`: "name: String"
  - `5`: "type: String"
  - `6`: "platform: String"
  - `7`: "status: String"
  - `8`: "headline: String"
  - `9`: "description: String"
  - `10`: "callToAction: String"
  - `11`: "mediaUrl: String"
  - `12`: "thumbnailUrl: String"
  - `13`: "landingPageUrl: String"
  - `14`: "impressions: Int"
  - `15`: "clicks: Int"
  - `16`: "conversions: Int"
  - `17`: "ctr: Float"
  - `18`: "approvedById: String"
  - `19`: "approvedAt: DateTime"
  - `20`: "rejectionReason: String"
  - `21`: "version: Int"
  - `22`: "parentId: String"
  - `23`: "createdById: String"
  - `24`: "createdAt: DateTime"
  - `25`: "updatedAt: DateTime"

### 📊 AdSpend *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "campaign: Campaign"
  - `3`: "clientId: String"
  - `4`: "date: DateTime"
  - `5`: "platform: String"
  - `6`: "amount: Float"
  - `7`: "currency: String"
  - `8`: "impressions: Int"
  - `9`: "clicks: Int"
  - `10`: "conversions: Int"
  - `11`: "leads: Int"
  - `12`: "cpc: Float"
  - `13`: "cpl: Float"
  - `14`: "ctr: Float"
  - `15`: "roas: Float"
  - `16`: "createdAt: DateTime"

### 📊 BudgetAllocation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "clientId: String"
  - `2`: "client: Client"
  - `3`: "month: DateTime"
  - `4`: "platform: String"
  - `5`: "allocatedAmount: Float"
  - `6`: "spentAmount: Float"
  - `7`: "currency: String"
  - `8`: "dailyTarget: Float"
  - `9`: "pacingStatus: String"
  - `10`: "approvedById: String"
  - `11`: "approvedAt: DateTime"
  - `12`: "notes: String"
  - `13`: "createdAt: DateTime"
  - `14`: "updatedAt: DateTime"

### 📊 ABTest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "campaign: Campaign"
  - `3`: "clientId: String"
  - `4`: "name: String"
  - `5`: "hypothesis: String"
  - `6`: "status: String"
  - `7`: "testType: String"
  - `8`: "variantA: String"
  - `9`: "variantB: String"
  - `10`: "winner: String"
  - `11`: "confidenceLevel: Float"
  - `12`: "startDate: DateTime"
  - `13`: "endDate: DateTime"
  - `14`: "conclusion: String"
  - `15`: "createdById: String"
  - `16`: "createdAt: DateTime"
  - `17`: "updatedAt: DateTime"

### 📊 ConversionEvent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- **Schema:**
  - `0`: "id: String"
  - `1`: "campaignId: String"
  - `2`: "campaign: Campaign"
  - `3`: "clientId: String"
  - `4`: "eventName: String"
  - `5`: "platform: String"
  - `6`: "source: String"
  - `7`: "leadName: String"
  - `8`: "leadEmail: String"
  - `9`: "leadPhone: String"
  - `10`: "adSpend: Float"
  - `11`: "revenue: Float"
  - `12`: "occurredAt: DateTime"
  - `13`: "createdAt: DateTime"

### 📊 DepartmentTarget *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Quote 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 User 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Client 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 CompanyNews *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Event 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 PerformanceScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 LeaveRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 EmployeeOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientTeamMember *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 DailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Task 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 FreelancerWorkReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 FreelancerPayment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Invoice 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Lead 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 AgencyApiCredential *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/api-credentials/alerts.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ApiCredentialAuditLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/api-credentials/credential-service.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 LoginSession *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/auth/session-tracker.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientOAuthConnection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/connection-service.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 UserGoogleDrive *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/googleDrive.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 PlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/sync-service.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientUser *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/notifications/portalNotifications.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientPlatformAccount *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/reporting/dashboard-data.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 DataImportBatch *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/reporting/dashboard-data.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 PlatformMetricEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/reporting/dashboard-data.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SelfAppraisal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/appraisal.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WorkEntry *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/clientBilling.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientScope *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/clientIntegrity.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Attendance 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 LearningLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 EmployeeAppreciation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 EmployeeClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Achievement 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 EmployeeEscalation *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 MonthlyGrowthScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 PaymentCollection *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/accounts/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 PaymentFollowUp *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/accounts/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 CompanyEntity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ArcadePointTransaction *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/arcade/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ArcadeReward *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/arcade/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ArcadeRedemption *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/arcade/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Meeting 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/calendar/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Post 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/calendar/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ContentApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/design/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Candidate 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hiring/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Idea 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/ideas/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Interview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 OfferLetter *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Notification 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/inbox/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 SupportTicket *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/inbox/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 UserTraining *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/intern/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ChatChannel *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/mash/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 AccountabilityScore *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/performance/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Recognition *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/recognition/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 LeadActivity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 FollowUpReminder *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 SOPCategory *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sop/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 VideoTestimonial *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/testimonials/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Training *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/training/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 UserCertification *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/training/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 VendorOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/vendors/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebProject *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Domain 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebBugReport *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 UpsellOpportunity *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebChangeRequest *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebProjectPhaseItem *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebDesignApproval *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Asset *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/assets/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 BudgetAlert 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/budget-alerts/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientAccessRequest 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-access-requests/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientDeliverable 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-deliverables/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Document 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/documents/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Expense 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Goal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/goals/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 MaintenanceContract 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/maintenance-contracts/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SaasTool 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/saas-tools/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 EmployeeScorecard 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/scorecard/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebsiteSitemap 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-portal/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 PageFeedback 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-portal/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Campaign 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/google/ads.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AdSpend *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/google/ads.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientProposal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/accounts/onboarding/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 CustomRole *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/custom-roles/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 FreelancerProfile *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/freelancers/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 CommunicationSchedule *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/communication/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 CommunicationTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/communication/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 CommunicationLog *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/communication/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 RFPSubmission *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/rfp/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 RBCAccrual *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/finance/rbc/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 RBCPayout *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/finance/rbc/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 RBC_Pot *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/finance/rbc/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ExitProcess *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/exit/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 FnFSettlement *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/fnf/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 LeaveBalance *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/leave/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 PIPPlan *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/pip/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 ReferralBonus *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/referrals/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 DailyMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/daily/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 WorkDeliverable *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/department-tactical/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 TacticalGoal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/kpi/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 TacticalMeeting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/strategic/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 PeerReview *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/strategic/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 SocialMediaPost *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/tactical-sheet/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 SocialMediaPageMetrics *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/tactical-sheet/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 SalesDeal *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/performance/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 Proposal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/reports/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 SalesHandover *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/reports/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 DailyTaskPlan 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/tasks/daily/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 HRPipelineTask 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/tasks/daily/page.tsx`
- **Schema:** Prisma Model (detected from usage)

### 📊 BankStatement 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/bank-statements/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 DepartmentExpense 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/client-profitability/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Contract 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/contracts/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 BankTransaction 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/reconciliation/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 OAuthAccessRequest 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientAnnouncement 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/announcements/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ImpersonationSession 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/audit-log/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AgencyServiceAccount 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/service-accounts/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SystemSetting *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/settings/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ServiceTermination 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/terminations/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ABTest 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/ab-tests/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 BudgetAllocation 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/budget/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ConversionEvent 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AdCreative 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creatives/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ExpenseAllocation 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/analytics/profitability/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientUserActivity 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/activity/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientCredential 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/credentials/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SLADocument *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/contracts/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientDocument 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/documents/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientGoal 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/export/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientPortalFeedback *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/feedback/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientUserInvitation 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/invitations/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 PortalNotification 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/notifications/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Report 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/reports/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 PIPMilestone 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/hr-notifications/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 RecurringExpense 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/recurring/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AttendanceImport 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/attendance-import/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Day0Task 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/day0-tasks/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 EmployerBrandingContent 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employer-branding/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ContentIdea 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employer-branding/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 EngagementActivity 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/engagement-activities/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ManagerBehaviorReview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/manager-reviews/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 LearningAudit 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/audit/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 LearningResourceComment 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/comments/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 LearningVerification 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/verify/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 MagicLink 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/generate/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Issue 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/manager/dashboard/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AIExtractionSession 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/ai-extract/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientOnboardingChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/operations/pending-onboarding/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SalesDailyTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/daily-tasks/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SalesMeeting 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/daily-tracker/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SalesWhatsAppMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/whatsapp/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SeoBacklink 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/backlinks/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientApproval 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/client-approvals/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SeoContent 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/content/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SeoTask *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/dashboard/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SeoKeyword *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/dashboard/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 GbpProfile 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/gbp/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 SeoReport 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/reports/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 QcReview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/qc-reviews/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 YouTubeVideo 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/youtube/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 HostingAccount 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/hosting/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebReimbursement 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/reimbursements/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WhatsAppCampaign *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/whatsapp/campaigns/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WhatsAppTemplate *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/whatsapp/templates/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AutoInvoiceConfig 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/auto-invoice/config/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AccountsMonthlyReview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/meetings/monthly/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AccountsQuarterlyReview 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/meetings/quarterly/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientLedger *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/payments/manual/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 DepartmentSalaryAllocation 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/roi/departments/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientLifecycleEvent *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/lifecycle/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ClientProperty 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/properties/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WhatsAppSchedule 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/whatsapp/schedules/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 CandidateAssessment 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/assessment/pipeline/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 DeviceRequest 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/devices/admin/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 AssetAssignment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/devices/my/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 DirectMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/mash/dm/[userId]/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ServiceChangeRequest 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/service-change-request/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 TaskComment *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/[taskId]/comments/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 Subtask 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/[taskId]/subtasks/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebOnboarding *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-clients/[id]/onboarding/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 WebProjectPhase *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-clients/[id]/phases/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ExitChecklist *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/exit/[id]/checklist/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 ChatMessage *(Unused)*
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/mash/channels/[channelId]/messages/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 LeadNurturingAction 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/nurture/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 📊 MaintenanceLog 
- **Type:** sql
- **File:** `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/amc/[id]/logs/route.ts`
- **Schema:** Prisma Model (detected from usage)

### 🐘 user_profiles *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 clients 
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 tasks 
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 meetings 
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 automation_logs *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 pioneer_academy *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 tool_registry *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 arcade_events *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 social_posts *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 posh_complaints *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 appraisals *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 ai_query_logs *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

### 🐘 learning_submissions *(Unused)*
- **Type:** postgresql
- **File:** `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- **Schema:** SQL Table Definition

## ⚠️ Dead Code — Unused Routes

These routes exist in the backend but no frontend calls match them:

- `[GET] /api/health` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/health/route.ts`
- `[GET] /api/accounts/aging-report` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/aging-report/route.ts`
- `[GET] /api/accounts/client-profitability` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/client-profitability/route.ts`
- `[GET] /api/accounts/discrepancies` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/discrepancies/route.ts`
- `[GET] /api/accounts/finance-stats` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/finance-stats/route.ts`
- `[GET] /api/accounts/tax-compliance` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/tax-compliance/route.ts`
- `[GET] /api/admin/access-requests` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/route.ts`
- `[POST] /api/admin/access-requests` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/route.ts`
- `[GET] /api/admin/cache` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/cache/route.ts`
- `[DELETE] /api/admin/cache` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/cache/route.ts`
- `[GET] /api/admin/oauth-connections` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/route.ts`
- `[GET] /api/auth/log-login` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[POST] /api/auth/log-login` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[GET] /api/client-portal/magic-login` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/magic-login/route.ts`
- `[POST] /api/clients/rfp` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/rfp/route.ts`
- `[GET] /api/cron/credential-health` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/credential-health/route.ts`
- `[POST] /api/cron/hr-notifications` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/hr-notifications/route.ts`
- `[GET] /api/cron/invoice-overdue` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/invoice-overdue/route.ts`
- `[POST] /api/cron/invoice-overdue` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/invoice-overdue/route.ts`
- `[GET] /api/cron/sync-integrations` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/sync-integrations/route.ts`
- `[GET] /api/cron/tactical-reminder` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/tactical-reminder/route.ts`
- `[POST] /api/cron/tactical-reminder` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/tactical-reminder/route.ts`
- `[GET] /api/debug/pending-users` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/debug/pending-users/route.ts`
- `[GET] /api/expenses/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/[id]/route.ts`
- `[DELETE] /api/expenses/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/[id]/route.ts`
- `[PATCH] /api/expenses/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/[id]/route.ts`
- `[GET] /api/google-drive/callback` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/google-drive/callback/route.ts`
- `[GET] /api/magic-link/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/[token]/route.ts`
- `[POST] /api/magic-link/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/[token]/route.ts`
- `[PATCH] /api/meetings/:meetingId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/[meetingId]/route.ts`
- `[GET] /api/onboard/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboard/[token]/route.ts`
- `[PATCH] /api/onboard/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboard/[token]/route.ts`
- `[GET] /api/onboarding/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/route.ts`
- `[POST] /api/payments/webhook` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/webhook/route.ts`
- `[GET] /api/proposal/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/proposal/[token]/route.ts`
- `[POST] /api/public/rfp` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/public/rfp/route.ts`
- `[POST] /api/public/rfp-v2` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/public/rfp-v2/route.ts`
- `[GET] /api/rfp/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/rfp/[token]/route.ts`
- `[POST] /api/rfp/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/rfp/[token]/route.ts`
- `[POST] /api/rfp/submit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/rfp/submit/route.ts`
- `[GET] /api/sales/activity` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/activity/route.ts`
- `[POST] /api/sales/activity` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/activity/route.ts`
- `[GET] /api/sales/daily-tracker` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/daily-tracker/route.ts`
- `[GET] /api/web-onboarding/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-onboarding/[token]/route.ts`
- `[POST] /api/web-onboarding/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-onboarding/[token]/route.ts`
- `[PATCH] /api/web-onboarding/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-onboarding/[token]/route.ts`
- `[GET] /api/admin/access-requests/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/[id]/route.ts`
- `[DELETE] /api/admin/access-requests/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/[id]/route.ts`
- `[PATCH] /api/admin/access-requests/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/[id]/route.ts`
- `[GET] /api/admin/api-credentials/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/[id]/route.ts`
- `[DELETE] /api/admin/api-credentials/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/[id]/route.ts`
- `[PATCH] /api/admin/api-credentials/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/[id]/route.ts`
- `[GET] /api/admin/api-credentials/alerts` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/alerts/route.ts`
- `[POST] /api/admin/api-credentials/alerts` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/alerts/route.ts`
- `[GET] /api/admin/api-credentials/audit-log` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/audit-log/route.ts`
- `[GET] /api/admin/entities/:entityId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/route.ts`
- `[DELETE] /api/admin/entities/:entityId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/route.ts`
- `[PATCH] /api/admin/entities/:entityId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/route.ts`
- `[GET] /api/admin/oauth-connections/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/[id]/route.ts`
- `[PATCH] /api/admin/oauth-connections/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/[id]/route.ts`
- `[GET] /api/admin/service-accounts/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/service-accounts/[id]/route.ts`
- `[DELETE] /api/admin/service-accounts/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/service-accounts/[id]/route.ts`
- `[PATCH] /api/admin/service-accounts/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/service-accounts/[id]/route.ts`
- `[POST] /api/auth/client/logout` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/client/logout/route.ts`
- `[POST] /api/auth/password/login` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/login/route.ts`
- `[POST] /api/auth/password/forgot` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/forgot/route.ts`
- `[GET] /api/client-portal/invitations/accept` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/invitations/accept/route.ts`
- `[POST] /api/client-portal/invitations/accept` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/invitations/accept/route.ts`
- `[POST] /api/clients/:clientId/add-website-module` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/add-website-module/route.ts`
- `[DELETE] /api/clients/:clientId/add-website-module` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/add-website-module/route.ts`
- `[GET] /api/clients/:clientId/tactical-data` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/tactical-data/route.ts`
- `[POST] /api/cron/ads/sync` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/ads/sync/route.ts`
- `[GET] /api/cron/clients/health-scores` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/clients/health-scores/route.ts`
- `[POST] /api/cron/clients/health-scores` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/clients/health-scores/route.ts`
- `[GET] /api/cron/notifications/daily` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/daily/route.ts`
- `[POST] /api/cron/notifications/daily` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/daily/route.ts`
- `[GET] /api/cron/notifications/monthly` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/monthly/route.ts`
- `[POST] /api/cron/notifications/monthly` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/monthly/route.ts`
- `[GET] /api/cron/notifications/weekly` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/weekly/route.ts`
- `[POST] /api/cron/notifications/weekly` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/weekly/route.ts`
- `[GET] /api/cron/whatsapp/schedules` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/whatsapp/schedules/route.ts`
- `[PATCH] /api/daily-meeting/tasks/:taskId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/daily-meeting/tasks/[taskId]/route.ts`
- `[GET] /api/hr/assessment/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/assessment/[token]/route.ts`
- `[POST] /api/hr/assessment/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/assessment/[token]/route.ts`
- `[PATCH] /api/hr/assessment/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/assessment/[token]/route.ts`
- `[GET] /api/manager/departments/:dept` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/manager/departments/[dept]/route.ts`
- `[POST] /api/onboard/:token/complete` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboard/[token]/complete/route.ts`
- `[POST] /api/onboarding/:token/confirm` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/confirm/route.ts`
- `[GET] /api/onboarding/:token/details` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/details/route.ts`
- `[POST] /api/onboarding/:token/details` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/details/route.ts`
- `[GET] /api/onboarding/:token/invoice` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/invoice/route.ts`
- `[GET] /api/onboarding/:token/payment` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/payment/route.ts`
- `[POST] /api/onboarding/:token/payment` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/payment/route.ts`
- `[GET] /api/onboarding/:token/service-change-request` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/service-change-request/route.ts`
- `[POST] /api/onboarding/:token/service-change-request` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/service-change-request/route.ts`
- `[GET] /api/onboarding/:token/sla` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/sla/route.ts`
- `[POST] /api/onboarding/:token/sla` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/onboarding/[token]/sla/route.ts`
- `[POST] /api/proposal/:token/accept` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/proposal/[token]/accept/route.ts`
- `[DELETE] /api/sales/daily-tasks/:taskId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/daily-tasks/[taskId]/route.ts`
- `[PATCH] /api/sales/daily-tasks/:taskId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/daily-tasks/[taskId]/route.ts`
- `[GET] /api/sales/leads/:leadId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/route.ts`
- `[DELETE] /api/sales/leads/:leadId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/route.ts`
- `[PATCH] /api/sales/leads/:leadId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/route.ts`
- `[DELETE] /api/sales/meetings/:meetingId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/meetings/[meetingId]/route.ts`
- `[PATCH] /api/sales/meetings/:meetingId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/meetings/[meetingId]/route.ts`
- `[GET] /api/sales/proposals/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/proposals/[id]/route.ts`
- `[DELETE] /api/sales/proposals/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/proposals/[id]/route.ts`
- `[PATCH] /api/sales/proposals/:id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/proposals/[id]/route.ts`
- `[GET] /api/sales/rfp/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/rfp/[token]/route.ts`
- `[POST] /api/sales/rfp/:token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/rfp/[token]/route.ts`
- `[GET] /api/web-portal/sitemap/:pageId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-portal/sitemap/[pageId]/route.ts`
- `[POST] /api/admin/access-requests/:id/send-instructions` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/[id]/send-instructions/route.ts`
- `[POST] /api/admin/access-requests/:id/verify` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/[id]/verify/route.ts`
- `[POST] /api/admin/api-credentials/:id/rotate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/[id]/rotate/route.ts`
- `[POST] /api/admin/api-credentials/:id/verify` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/[id]/verify/route.ts`
- `[POST] /api/admin/entities/:entityId/bank-accounts` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/bank-accounts/route.ts`
- `[DELETE] /api/admin/entities/:entityId/bank-accounts` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/bank-accounts/route.ts`
- `[POST] /api/admin/entities/:entityId/payment-gateways` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/payment-gateways/route.ts`
- `[DELETE] /api/admin/entities/:entityId/payment-gateways` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/payment-gateways/route.ts`
- `[POST] /api/admin/oauth-connections/:id/refresh` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/[id]/refresh/route.ts`
- `[POST] /api/admin/oauth-connections/:id/revoke` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/[id]/revoke/route.ts`
- `[POST] /api/admin/oauth-connections/:id/verify-access` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/[id]/verify-access/route.ts`
- `[GET] /api/sales/leads/:leadId/activities` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/activities/route.ts`
- `[POST] /api/sales/leads/:leadId/activities` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/activities/route.ts`
- `[GET] /api/sales/leads/:leadId/nurture` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/nurture/route.ts`
- `[POST] /api/sales/leads/:leadId/nurture` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/nurture/route.ts`
- `[PATCH] /api/sales/leads/:leadId/stage` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/leads/[leadId]/stage/route.ts`
- `[GET] /api/testimonials/user/:userId/badges` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/testimonials/user/[userId]/badges/route.ts`
- `[GET] /api/web-portal/sitemap/:pageId/feedback` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-portal/sitemap/[pageId]/feedback/route.ts`
- `[POST] /api/web-portal/sitemap/:pageId/feedback` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-portal/sitemap/[pageId]/feedback/route.ts`
- `[GET] origin` — `/home/veer/Desktop/Office/PioneerOS/src/proxy.ts`
- `[GET] client_session` — `/home/veer/Desktop/Office/PioneerOS/src/proxy.ts`
- `[GET] viewAsUserId` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/layout.tsx`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/admin-login/page.tsx`
- `[GET] dept` — `/home/veer/Desktop/Office/PioneerOS/src/app/careers/page.tsx`
- `[GET] position` — `/home/veer/Desktop/Office/PioneerOS/src/app/careers/page.tsx`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/exit-interview/page.tsx`
- `[GET] user-agent` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/client-info.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/client-info.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/client-info.ts`
- `[GET] client_session` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/clientAuth.ts`
- `[GET] client_session` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/clientAuth.ts`
- `[GET] cookie` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/clientAuth.ts`
- `[DELETE] client_session` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/clientAuth.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/withClientAuth.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/withClientAuth.ts`
- `[GET] x-message-id` — `/home/veer/Desktop/Office/PioneerOS/src/server/notifications/email.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/server/security/index.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/server/security/index.ts`
- `[GET] cf-connecting-ip` — `/home/veer/Desktop/Office/PioneerOS/src/server/security/index.ts`
- `[GET] X-ReAuth-Token` — `/home/veer/Desktop/Office/PioneerOS/src/server/security/re-auth.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/server/security/requestLogger.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/server/security/requestLogger.ts`
- `[GET] user-agent` — `/home/veer/Desktop/Office/PioneerOS/src/server/security/requestLogger.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] cursor` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] sortBy` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] sortOrder` — `/home/veer/Desktop/Office/PioneerOS/src/shared/utils/pagination.ts`
- `[GET] content-disposition` — `/home/veer/Desktop/Office/PioneerOS/src/client/components/portal/ServiceManagement.tsx`
- `[GET] error` — `/home/veer/Desktop/Office/PioneerOS/src/app/(auth)/login/page.tsx`
- `[GET] ENTERPRISE` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/analytics/page.tsx`
- `[GET] GROWTH` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/analytics/page.tsx`
- `[GET] STARTER` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/analytics/page.tsx`
- `[GET] HEALTHY` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/analytics/page.tsx`
- `[GET] WARNING` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/analytics/page.tsx`
- `[GET] AT_RISK` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/analytics/page.tsx`
- `[GET] action` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/ideas/IdeasClient.tsx`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/network/actions.ts`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/(public)/rfp-v2/page.tsx`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/route.ts`
- `[GET] scope` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/budget-alerts/route.ts`
- `[GET] alertLevel` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/budget-alerts/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/budget-alerts/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/calendar/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/calendar/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/calendar/route.ts`
- `[GET] days` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/celebrations/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-deliverables/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-deliverables/route.ts`
- `[GET] createdBy` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-deliverables/route.ts`
- `[GET] approvedOnly` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-deliverables/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-deliverables/route.ts`
- `[GET] includeLifecycle` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/department-kpis/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/documents/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/documents/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/documents/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/documents/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/route.ts`
- `[GET] level` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/goals/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/goals/route.ts`
- `[GET] ownerId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/goals/route.ts`
- `[GET] parentId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/goals/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/invoices/route.ts`
- `[GET] priority` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/issues/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/issues/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/maintenance-contracts/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/maintenance-contracts/route.ts`
- `[GET] upcoming` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/maintenance-contracts/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/route.ts`
- `[GET] meetingId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/route.ts`
- `[GET] action` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/route.ts`
- `[GET] unreadOnly` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/notifications/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/notifications/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/org-chart/route.ts`
- `[GET] includeClients` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/org-chart/route.ts`
- `[GET] includeBilling` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/projects/route.ts`
- `[GET] quarter` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/quarterly-goals/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/quarterly-goals/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/quarterly-goals/route.ts`
- `[GET] mode` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/quotes/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/quotes/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/saas-tools/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/scorecard/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/scorecard/route.ts`
- `[GET] q` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/search/route.ts`
- `[GET] priority` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/route.ts`
- `[GET] assigneeId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/route.ts`
- `[GET] sortBy` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/route.ts`
- `[GET] sortOrder` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/testimonials/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/testimonials/route.ts`
- `[GET] myRequests` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/testimonials/route.ts`
- `[GET] recent` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/users/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/users/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-clients/route.ts`
- `[GET] webProjectStatus` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-clients/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/work-entries/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/work-entries/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/work-entries/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/work-entries/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/work-entries/route.ts`
- `[GET] quarter` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/work-entries/route.ts`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/auth/magic/page.tsx`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/auth/register-password/page.tsx`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/auth/reset-password/page.tsx`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/client-portal/magic/page.tsx`
- `[GET] theme` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/bug-report/page.tsx`
- `[GET] source` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/bug-report/page.tsx`
- `[GET] projectId` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/bug-report/page.tsx`
- `[GET] dept` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/careers/page.tsx`
- `[GET] theme` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/client-onboarding/page.tsx`
- `[GET] color` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/client-onboarding/page.tsx`
- `[GET] source` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/client-onboarding/page.tsx`
- `[GET] theme` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/rfp/page.tsx`
- `[GET] theme` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/support/page.tsx`
- `[GET] source` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/support/page.tsx`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/embed/support/page.tsx`
- `[GET] content-disposition` — `/home/veer/Desktop/Office/PioneerOS/src/app/portal/account/page.tsx`
- `[GET] TASK` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/notifications/page.tsx`
- `[GET] MEETING` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/notifications/page.tsx`
- `[GET] ESCALATION` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/notifications/page.tsx`
- `[GET] Content-Disposition` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/reports/ReportBuilderClient.tsx`
- `[GET] viewAs` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/users/UserManagementClient.tsx`
- `[GET] tab` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/deals/page.tsx`
- `[GET] action` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/leads/page.tsx`
- `[GET] priority` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/leads/page.tsx`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/social/print-designing/page.tsx`
- `[GET] viewAsUserId` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/tasks/daily/page.tsx`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/academy/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/academy/calendar/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/achievements/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/achievements/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/deliverables/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/deliverables/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/goals/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accountability/goals/route.ts`
- `[GET] entityType` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/aging-report/route.ts`
- `[GET] segment` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/aging-report/route.ts`
- `[GET] entityId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/bank-statements/route.ts`
- `[GET] bankName` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/bank-statements/route.ts`
- `[GET] accountType` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/bank-statements/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/bank-statements/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/calendar-events/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/calendar-events/route.ts`
- `[GET] months` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/client-profitability/route.ts`
- `[GET] segment` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/client-profitability/route.ts`
- `[GET] expiring` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/contracts/route.ts`
- `[GET] months` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/discrepancies/route.ts`
- `[GET] period` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/finance-stats/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/follow-ups/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/onboarding/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/onboarding/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/payments/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/payments/route.ts`
- `[GET] entity` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/payments/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/payments/route.ts`
- `[GET] period` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/performance/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/proposals/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/reconciliation/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/reconciliation-summary/route.ts`
- `[GET] entityId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/reconciliation-summary/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/tax-compliance/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/access-requests/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/announcements/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/announcements/route.ts`
- `[GET] from` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/audit-log/route.ts`
- `[GET] to` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/audit-log/route.ts`
- `[GET] actionType` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/audit-log/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/audit-log/route.ts`
- `[GET] target` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/cache/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/clients/route.ts`
- `[GET] hasPortalUser` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/clients/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/clients/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/clients/route.ts`
- `[GET] roleId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/custom-roles/route.ts`
- `[GET] showFull` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/route.ts`
- `[GET] agencyAccessOnly` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/oauth-connections/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/terminations/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/terminations/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/terminations/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/view-as/route.ts`
- `[GET] redirectTo` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/view-as/route.ts`
- `[DELETE] viewAsUserId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/view-as/route.ts`
- `[GET] viewAsUserId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/view-as/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/ab-tests/route.ts`
- `[GET] campaignId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/ab-tests/route.ts`
- `[GET] testType` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/ab-tests/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/ab-tests/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/ab-tests/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/analytics/route.ts`
- `[GET] startDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/analytics/route.ts`
- `[GET] endDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/analytics/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/budget/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/budget/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/campaigns/route.ts`
- `[GET] assignedToId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/campaigns/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/campaigns/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/campaigns/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/campaigns/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- `[GET] campaignId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- `[GET] eventName` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- `[GET] startDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- `[GET] endDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/conversions/route.ts`
- `[GET] priority` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creative-requests/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creative-requests/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creative-requests/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creative-requests/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/spend/route.ts`
- `[GET] campaignId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/spend/route.ts`
- `[GET] startDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/spend/route.ts`
- `[GET] endDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/spend/route.ts`
- `[GET] aggregation` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/spend/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/spend/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/spend/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creatives/route.ts`
- `[GET] campaignId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creatives/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creatives/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creatives/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/ads/creatives/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/analytics/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/analytics/calendar/route.ts`
- `[GET] period` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/analytics/profitability/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/analytics/profitability/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/client/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/client/route.ts`
- `[GET] host` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/client-magic/route.ts`
- `[GET] user-agent` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/log-login/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/magic-link/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/magic-link/route.ts`
- `[GET] includeInactive` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/sessions/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/sessions/route.ts`
- `[GET] next-auth.session-token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/sessions/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/careers/apply/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/careers/apply/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-access/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-access/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-deliverables/summary/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/activity/route.ts`
- `[GET] action` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/activity/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/activity/route.ts`
- `[GET] offset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/activity/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/announcements/route.ts`
- `[GET] offset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/announcements/route.ts`
- `[GET] reveal` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/credentials/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/credentials/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/approvals/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/approvals/route.ts`
- `[GET] offset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/approvals/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/data/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/deliverables/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/deliverables/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/documents/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/documents/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/documents/route.ts`
- `[GET] offset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/documents/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/documents/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/export/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/goals/route.ts`
- `[GET] period` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/goals/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/invitations/route.ts`
- `[GET] client_session` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/logout/route.ts`
- `[DELETE] client_session` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/logout/route.ts`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/magic-login/route.ts`
- `[GET] past` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/meetings/route.ts`
- `[GET] upcoming` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/meetings/route.ts`
- `[GET] unread` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/notifications/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/notifications/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/notifications/route.ts`
- `[GET] offset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/notifications/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/notifications/route.ts`
- `[GET] deleteAllRead` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/notifications/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/reports/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/termination/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/work-tracker/route.ts`
- `[GET] employeeId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/work-tracker/route.ts`
- `[GET] startDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/work-tracker/route.ts`
- `[GET] endDate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/work-tracker/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/communication/logs/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/communication/logs/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/communication/logs/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/communication/schedules/route.ts`
- `[GET] overdue` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/communication/schedules/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/communications/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/communications/calendar/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/content/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/content/calendar/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/crm/leads/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/crm/leads/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/credential-health/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/hr-notifications/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/invoice-overdue/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/sync-integrations/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/tactical-reminder/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/design/calendar/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/design/calendar/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/design/requests/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/design/requests/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/expenses/recurring/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/finance/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/finance/calendar/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/finance/calendar/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/finance/calendar/route.ts`
- `[GET] freelancerId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/freelancer/payments/route.ts`
- `[GET] code` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/google-drive/callback/route.ts`
- `[GET] state` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/google-drive/callback/route.ts`
- `[GET] error` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/google-drive/callback/route.ts`
- `[GET] freelancerId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/freelancer/work-reports/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hiring/candidates/route.ts`
- `[GET] employeeId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/appreciations/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/appreciations/route.ts`
- `[GET] isPublic` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/appreciations/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/calendar/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/calendar/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/attendance-import/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/day0-tasks/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employees/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employees/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employees/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employees/route.ts`
- `[GET] excludeFounders` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employees/route.ts`
- `[GET] employeeId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employee-feedback/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employee-feedback/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employee-feedback/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employee-feedback/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employer-branding/route.ts`
- `[GET] from` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employer-branding/route.ts`
- `[GET] to` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/employer-branding/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/engagement-activities/route.ts`
- `[GET] from` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/engagement-activities/route.ts`
- `[GET] to` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/engagement-activities/route.ts`
- `[GET] employeeId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/escalations/route.ts`
- `[GET] severity` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/escalations/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/escalations/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/exit/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/fnf/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/leave/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/leave/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/leave/route.ts`
- `[GET] candidateId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/interviews/route.ts`
- `[GET] interviewerId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/interviews/route.ts`
- `[GET] from` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/interviews/route.ts`
- `[GET] to` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/interviews/route.ts`
- `[GET] managerId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/manager-reviews/route.ts`
- `[GET] quarter` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/manager-reviews/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/manager-reviews/route.ts`
- `[GET] candidateId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/offers/route.ts`
- `[GET] days` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/work-anniversaries/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/sync/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/sync/route.ts`
- `[GET] daysBack` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/sync/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/sync/route.ts`
- `[GET] q` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/knowledge/search/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/audit/route.ts`
- `[GET] resourceId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/comments/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/comments/route.ts`
- `[GET] logId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/log/route.ts`
- `[GET] learningLogId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/verify/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/learning/verify/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/[token]/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/[token]/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/[token]/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/[token]/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/generate/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/generate/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/generate/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/magic-link/generate/route.ts`
- `[GET] sessionId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/ai-extract/route.ts`
- `[GET] quarter` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/strategic/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/strategic/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/strategic/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/route.ts`
- `[GET] teamView` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/operations/calendar/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/operations/calendar/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/operations/calendar/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/operations/calendar/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/create-order/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/create-order/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/offline-request/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/offline-request/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/verify/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/verify/route.ts`
- `[GET] x-razorpay-signature` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/payments/webhook/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/public/rfp/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/public/rfp/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/public/rfp-v2/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/public/rfp-v2/route.ts`
- `[GET] leadId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/activity/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/calendar/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/calendar/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/deals/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/deals/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/goals/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/goals/route.ts`
- `[GET] role` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/handover/route.ts`
- `[GET] leadId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/proposals/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/approvals/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/approvals/route.ts`
- `[GET] priority` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/approvals/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/approvals/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/approvals/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/clients/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/clients/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/clients/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/content-ideas/route.ts`
- `[GET] theme` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/content-ideas/route.ts`
- `[GET] search` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/content-ideas/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/content-ideas/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/content-ideas/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/metrics/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/metrics/route.ts`
- `[GET] groupBy` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/metrics/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/metrics/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/metrics/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/posts/route.ts`
- `[GET] contentType` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/posts/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/posts/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/posts/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/social/posts/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/backlinks/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/backlinks/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/backlinks/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/backlinks/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/client-approvals/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/client-approvals/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/client-approvals/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/client-approvals/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/content/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/content/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/content/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/content/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/gbp/route.ts`
- `[GET] profileId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/gbp/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/gbp/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/gbp/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/gbp/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/keywords/route.ts`
- `[GET] sort` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/keywords/route.ts`
- `[GET] sort` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/keywords/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/keywords/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/keywords/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/keywords/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/reports/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/reports/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/reports/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/reports/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/qc-reviews/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/qc-reviews/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/qc-reviews/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/qc-reviews/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/tasks/route.ts`
- `[GET] assignedToId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/tasks/route.ts`
- `[GET] priority` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/tasks/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/tasks/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/tasks/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/tasks/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/youtube/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/youtube/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/youtube/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/youtube/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tactical/auto-populate/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tactical/auto-populate/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tactical/auto-populate/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tactical/kpis/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tactical/kpis/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tactical/posts/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tactical/posts/route.ts`
- `[GET] viewAsUserId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/daily/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/daily-report/route.ts`
- `[GET] folder` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/upload/cloudinary/route.ts`
- `[GET] projectId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/bugs/route.ts`
- `[GET] priority` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/bugs/route.ts`
- `[GET] assignedToId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/bugs/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/bugs/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/bugs/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/calendar/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/calendar/route.ts`
- `[GET] includeProjects` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/clients/route.ts`
- `[GET] includeDomains` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/clients/route.ts`
- `[GET] includeHosting` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/clients/route.ts`
- `[GET] includeAmc` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/clients/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/clients/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/domains/route.ts`
- `[GET] sslStatus` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/domains/route.ts`
- `[GET] expiringWithin` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/domains/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/domains/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/domains/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/domains/route.ts`
- `[GET] severity` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/escalations/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/escalations/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/escalations/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/escalations/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/escalations/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/hosting/route.ts`
- `[GET] provider` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/hosting/route.ts`
- `[GET] expiringWithin` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/hosting/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/hosting/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/hosting/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/hosting/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/reimbursements/route.ts`
- `[GET] projectId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/requests/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/requests/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/requests/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/requests/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/upsells/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/upsells/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/upsells/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/upsells/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-portal/credentials/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/client-portal/web/approvals/page.tsx`
- `[GET] leadId` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/proposals/new/page.tsx`
- `[GET] leadId` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/rfp/send/page.tsx`
- `[GET] isEnabled` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/auto-invoice/config/route.ts`
- `[GET] clientStatus` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/auto-invoice/config/route.ts`
- `[GET] matchStatus` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/bank-statements/[id]/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/bank-statements/[id]/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/expenses/departments/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/expenses/departments/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/expenses/departments/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/meetings/monthly/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/meetings/quarterly/route.ts`
- `[GET] quarter` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/meetings/quarterly/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/roi/departments/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/roi/departments/route.ts`
- `[GET] credentialId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/audit-log/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/audit-log/route.ts`
- `[GET] offset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/api-credentials/audit-log/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/custom-roles/assign/route.ts`
- `[GET] customRoleId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/custom-roles/assign/route.ts`
- `[GET] showFull` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/quick-add/assignment/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/quick-add/assignment/route.ts`
- `[DELETE] client_session` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/client/logout/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/check/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/check/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/login/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/login/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/forgot/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/forgot/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/register/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/register/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/reset/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/reset/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/reset-with-otp/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/password/reset-with-otp/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/sessions/history/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/auth/sessions/history/route.ts`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/invitations/accept/route.ts`
- `[GET] token` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/survey/public/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/approvals/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/credentials/route.ts`
- `[GET] hard` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/credentials/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/documents/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/documents/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/documents/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/documents/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/goals/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/notifications/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/notifications/route.ts`
- `[GET] includeInactive` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/platform-accounts/route.ts`
- `[GET] summary` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/platform-accounts/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/portal-users/route.ts`
- `[GET] hard` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/portal-users/route.ts`
- `[GET] propertyId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/properties/route.ts`
- `[GET] memberId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/team/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/ads/sync/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/clients/health-scores/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/daily/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/monthly/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/notifications/weekly/route.ts`
- `[GET] authorization` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/cron/whatsapp/schedules/route.ts`
- `[GET] linkId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/goals/[id]/link-task/route.ts`
- `[GET] department` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/assessment/pipeline/route.ts`
- `[GET] id` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/attendance/entry/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/attendance/sync/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/attendance/sync/route.ts`
- `[GET] year` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/attendance/sync/route.ts`
- `[GET] deviceType` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/devices/admin/route.ts`
- `[GET] code` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/linkedin/callback/route.ts`
- `[GET] state` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/linkedin/callback/route.ts`
- `[GET] error` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/linkedin/callback/route.ts`
- `[GET] error_description` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/linkedin/callback/route.ts`
- `[GET] code` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/google/callback/route.ts`
- `[GET] state` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/google/callback/route.ts`
- `[GET] error` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/google/callback/route.ts`
- `[GET] code` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/meta/callback/route.ts`
- `[GET] state` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/meta/callback/route.ts`
- `[GET] error` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/meta/callback/route.ts`
- `[GET] error_reason` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/integrations/meta/callback/route.ts`
- `[GET] meetingId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/strategic/peer-review/route.ts`
- `[GET] revieweeId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/strategic/peer-review/route.ts`
- `[GET] meetingId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/export/route.ts`
- `[GET] clientId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/export/route.ts`
- `[GET] month` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/export/route.ts`
- `[GET] format` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/meetings/tactical/export/route.ts`
- `[GET] type` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/nurturing/content/route.ts`
- `[GET] category` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/nurturing/content/route.ts`
- `[GET] x-forwarded-for` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/rfp/[token]/route.ts`
- `[GET] x-real-ip` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/rfp/[token]/route.ts`
- `[GET] subtaskId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/[taskId]/subtasks/route.ts`
- `[GET] months` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/daily/history/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/daily/history/route.ts`
- `[GET] period` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/daily/stats/route.ts`
- `[GET] userId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/daily/stats/route.ts`
- `[GET] fileId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/work-entries/[id]/upload/route.ts`
- `[GET] accountId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/bank-accounts/route.ts`
- `[GET] gatewayId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/entities/[entityId]/payment-gateways/route.ts`
- `[GET] preset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/dashboard/[platform]/route.ts`
- `[GET] from` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/dashboard/[platform]/route.ts`
- `[GET] to` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/dashboard/[platform]/route.ts`
- `[GET] accountId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/dashboard/[platform]/route.ts`
- `[GET] preset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/dashboard/overview/route.ts`
- `[GET] from` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/dashboard/overview/route.ts`
- `[GET] to` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/dashboard/overview/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/batches/route.ts`
- `[GET] batchId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/batches/route.ts`
- `[GET] preview` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/csv/route.ts`
- `[GET] accountId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/excel/route.ts`
- `[GET] sheetName` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/excel/route.ts`
- `[GET] columnMapping` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/excel/route.ts`
- `[GET] preview` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/excel/route.ts`
- `[GET] preview` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/paste/route.ts`
- `[GET] page` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/amc/[id]/logs/route.ts`
- `[GET] limit` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/amc/[id]/logs/route.ts`
- `[GET] logId` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web/amc/[id]/logs/route.ts`
- `[GET] format` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/import/templates/[platform]/route.ts`

## ⚠️ Dead Code — Unused Models

These models exist but no route references them:

- `DistributedLock` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Profile` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `VideoTestimonial` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientTeamMember` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientScope` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientDeliverable` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `TaskComment` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `TimeEntry` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MeetingParticipant` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SOPCategory` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SOP` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Training` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `UserTraining` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Certification` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `UserCertification` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `CommunicationTemplate` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `CommunicationSchedule` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `CommunicationLog` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PaymentCollection` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PaymentFollowUp` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `CandidateAssessment` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployeeProposal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LeaveRequest` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `IdeaVote` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Recognition` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AccountabilityCharter` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `RBC_Pot` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AttendanceImport` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Violations` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PerformanceScore` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DepartmentTarget` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `CompanyNews` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LeadActivity` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `FollowUpReminder` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LeadNurturingAction` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SalesHandover` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SalesMeeting` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SalesWhatsAppMessage` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SalesWhatsAppTemplate` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SalesDeal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SalesDailyTask` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientLifecycleEvent` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientUser` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientCredential` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SupportTicket` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `TicketActivity` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployeeOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `InternProfile` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `FreelancerProfile` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `FreelancerWorkReport` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `FreelancerPayment` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ImpersonationSession` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AccountabilityScore` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LearningLog` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LearningVerification` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LearningAudit` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WorkDeliverable` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DepartmentBaseline` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `TacticalGoal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `IncentivePayout` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LearningResourceComment` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MeetingActionItem` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DailyTaskPlan` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DailyTask` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ArcadePointTransaction` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ArcadeReward` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ArcadeRedemption` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LeaveBalance` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `RBCAccrual` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `RBCPayout` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PIPPlan` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PIPMilestone` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Asset` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AssetAssignment` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ExitProcess` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ExitChecklist` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `FnFSettlement` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `FnFLineItem` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ReferralBonus` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `RFPSubmission` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SLADocument` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ServiceTemplate` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `VendorOnboarding` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientPortal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `CompanyEntity` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EntityBankAccount` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EntityPaymentGateway` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SelfAppraisal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `LoginSession` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ChatChannel` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ChatChannelMember` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ChatMessage` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DirectMessage` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientProperty` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `TacticalMeeting` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `TacticalKPIEntry` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `StrategicMeeting` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `StrategicGoal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PeerReview` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployeeScorecard` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientPortalFeedback` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `CustomRole` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `UserCustomRole` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientWhatsAppGroup` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppTemplate` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppTemplateUsage` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppCampaign` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppCampaignMessage` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DeviceRequest` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `HRPipelineTask` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientOperationsLog` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppAccount` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppMessage` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppSchedule` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppAccess` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployeeWhatsAppChat` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppSession` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppAuthState` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `UserPinnedChat` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `BankStatement` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `BankTransaction` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DepartmentExpense` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DepartmentSalaryAllocation` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AutoInvoiceConfig` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AccountsMonthlyReview` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AccountsQuarterlyReview` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `OfferLetter` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployeeClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployeeEscalation` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployeeAppreciation` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ManagerBehaviorReview` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EmployerBrandingContent` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ContentIdea` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `EngagementActivity` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WorkAnniversaryReminder` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Day0Task` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SaasTool` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientProposal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AccountOnboardingDetails` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientLedger` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `Sequence` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MagicLink` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `UserGoogleDrive` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WorkEntry` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WorkEntryFile` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DeliverableTypeConfig` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WhatsAppChatNote` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SharedWhatsAppChat` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SocialMediaPost` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MonthlyGrowthScore` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SocialMediaPageMetrics` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `RecurringExpense` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ExpenseAllocation` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ExpensePayment` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `TaskGoalLink` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `BudgetAlert` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientOAuthConnection` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PlatformMetric` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PlatformSyncJob` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MagicLinkToken` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PasswordResetToken` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AgencyApiCredential` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AgencyServiceAccount` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `OAuthAccessRequest` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ApiCredentialAuditLog` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientPlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PlatformMetricEntry` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DataImportBatch` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientUserInvitation` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientUserActivity` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PortalNotification` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientDocument` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientAnnouncement` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientGoal` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ContentApproval` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientAccessRequest` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebProjectPhase` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MaintenanceContract` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ServiceChangeRequest` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ServiceTermination` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebsiteSitemap` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `PageFeedback` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebOnboarding` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `HostingAccount` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MaintenanceLog` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebReimbursement` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `UpsellOpportunity` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebProject` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebProjectPhaseItem` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebBugReport` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebChangeRequest` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebDesignApproval` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `WebProjectTimeEntry` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DailyMeeting` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `MeetingCompliance` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AIExtractionSession` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SystemSetting` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SeoKeyword` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SeoRankHistory` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SeoBacklink` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SeoContent` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `GbpProfile` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `GbpPost` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `GbpMetric` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SeoTask` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AdCreative` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `AdSpend` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `BudgetAllocation` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ABTest` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ConversionEvent` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `QcReview` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `ClientApproval` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `YouTubeVideo` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `SeoReport` — `/home/veer/Desktop/Office/PioneerOS/prisma/schema.prisma`
- `DistributedLock` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Profile` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `VideoTestimonial` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientTeamMember` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientScope` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientDeliverable` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `TaskComment` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `TimeEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MeetingParticipant` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SOPCategory` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SOP` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Training` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `UserTraining` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Certification` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `UserCertification` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `CommunicationTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `CommunicationSchedule` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `CommunicationLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PaymentCollection` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PaymentFollowUp` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `CandidateAssessment` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployeeProposal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LeaveRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `IdeaVote` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Recognition` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AccountabilityCharter` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `RBC_Pot` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AttendanceImport` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Violations` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PerformanceScore` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DepartmentTarget` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `CompanyNews` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LeadActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `FollowUpReminder` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LeadNurturingAction` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SalesHandover` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SalesMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SalesWhatsAppMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SalesWhatsAppTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SalesDeal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SalesDailyTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientLifecycleEvent` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientUser` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientCredential` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SupportTicket` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `TicketActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployeeOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `InternProfile` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `FreelancerProfile` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `FreelancerWorkReport` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `FreelancerPayment` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ImpersonationSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AccountabilityScore` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LearningLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LearningVerification` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LearningAudit` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WorkDeliverable` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DepartmentBaseline` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `TacticalGoal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `IncentivePayout` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LearningResourceComment` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MeetingActionItem` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DailyTaskPlan` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DailyTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ArcadePointTransaction` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ArcadeReward` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ArcadeRedemption` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LeaveBalance` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `RBCAccrual` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `RBCPayout` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PIPPlan` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PIPMilestone` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Asset` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AssetAssignment` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ExitProcess` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ExitChecklist` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `FnFSettlement` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `FnFLineItem` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ReferralBonus` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `RFPSubmission` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SLADocument` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ServiceTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `VendorOnboarding` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientPortal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `CompanyEntity` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EntityBankAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EntityPaymentGateway` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SelfAppraisal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `LoginSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ChatChannel` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ChatChannelMember` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ChatMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DirectMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientProperty` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `TacticalMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `TacticalKPIEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `StrategicMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `StrategicGoal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PeerReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployeeScorecard` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientPortalFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `CustomRole` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `UserCustomRole` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientWhatsAppGroup` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppTemplateUsage` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppCampaign` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppCampaignMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DeviceRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `HRPipelineTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientOperationsLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppSchedule` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppAccess` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployeeWhatsAppChat` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppAuthState` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `UserPinnedChat` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `BankStatement` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `BankTransaction` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DepartmentExpense` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DepartmentSalaryAllocation` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AutoInvoiceConfig` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AccountsMonthlyReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AccountsQuarterlyReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `OfferLetter` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployeeClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployeeEscalation` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployeeAppreciation` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ManagerBehaviorReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EmployerBrandingContent` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ContentIdea` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `EngagementActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WorkAnniversaryReminder` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Day0Task` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SaasTool` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientProposal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AccountOnboardingDetails` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientLedger` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `Sequence` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MagicLink` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `UserGoogleDrive` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WorkEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WorkEntryFile` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DeliverableTypeConfig` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WhatsAppChatNote` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SharedWhatsAppChat` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SocialMediaPost` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MonthlyGrowthScore` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SocialMediaPageMetrics` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `RecurringExpense` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ExpenseAllocation` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ExpensePayment` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `TaskGoalLink` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `BudgetAlert` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientOAuthConnection` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PlatformMetric` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PlatformSyncJob` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MagicLinkToken` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PasswordResetToken` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AgencyApiCredential` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AgencyServiceAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `OAuthAccessRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ApiCredentialAuditLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientPlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PlatformMetricEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DataImportBatch` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientUserInvitation` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientUserActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PortalNotification` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientDocument` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientAnnouncement` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientGoal` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ContentApproval` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientAccessRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebProjectPhase` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MaintenanceContract` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ServiceChangeRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ServiceTermination` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebsiteSitemap` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `PageFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebOnboarding` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `HostingAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MaintenanceLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebReimbursement` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `UpsellOpportunity` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebProject` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebProjectPhaseItem` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebBugReport` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebChangeRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebDesignApproval` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `WebProjectTimeEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DailyMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `MeetingCompliance` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AIExtractionSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SystemSetting` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SeoKeyword` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SeoRankHistory` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SeoBacklink` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SeoContent` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `GbpProfile` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `GbpPost` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `GbpMetric` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SeoTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AdCreative` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `AdSpend` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `BudgetAllocation` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ABTest` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ConversionEvent` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `QcReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `ClientApproval` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `YouTubeVideo` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `SeoReport` — `/home/veer/Desktop/Office/PioneerOS/pioneer-os-standalone/prisma/schema.prisma`
- `DistributedLock` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Profile` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `VideoTestimonial` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientTeamMember` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientScope` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientDeliverable` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `TaskComment` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `TimeEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MeetingParticipant` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SOPCategory` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SOP` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Training` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `UserTraining` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Certification` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `UserCertification` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `CommunicationTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `CommunicationSchedule` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `CommunicationLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PaymentCollection` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PaymentFollowUp` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `CandidateAssessment` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployeeProposal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LeaveRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `IdeaVote` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Recognition` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AccountabilityCharter` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `RBC_Pot` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AttendanceImport` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Violations` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PerformanceScore` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DepartmentTarget` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `CompanyNews` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LeadActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `FollowUpReminder` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LeadNurturingAction` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SalesHandover` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SalesMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SalesWhatsAppMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SalesWhatsAppTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SalesDeal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SalesDailyTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientLifecycleEvent` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientUser` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientCredential` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SupportTicket` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `TicketActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployeeOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `InternProfile` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `FreelancerProfile` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `FreelancerWorkReport` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `FreelancerPayment` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ImpersonationSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AccountabilityScore` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LearningLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LearningVerification` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LearningAudit` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WorkDeliverable` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DepartmentBaseline` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `TacticalGoal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `IncentivePayout` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LearningResourceComment` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MeetingActionItem` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DailyTaskPlan` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DailyTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ArcadePointTransaction` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ArcadeReward` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ArcadeRedemption` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LeaveBalance` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `RBCAccrual` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `RBCPayout` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PIPPlan` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PIPMilestone` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Asset` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AssetAssignment` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ExitProcess` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ExitChecklist` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `FnFSettlement` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `FnFLineItem` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ReferralBonus` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `RFPSubmission` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SLADocument` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ServiceTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `VendorOnboarding` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientPortal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `CompanyEntity` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EntityBankAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EntityPaymentGateway` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SelfAppraisal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `LoginSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ChatChannel` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ChatChannelMember` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ChatMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DirectMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientProperty` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `TacticalMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `TacticalKPIEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `StrategicMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `StrategicGoal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PeerReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployeeScorecard` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientPortalFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `CustomRole` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `UserCustomRole` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientWhatsAppGroup` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppTemplate` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppTemplateUsage` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppCampaign` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppCampaignMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DeviceRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `HRPipelineTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientOperationsLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppMessage` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppSchedule` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppAccess` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployeeWhatsAppChat` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppAuthState` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `UserPinnedChat` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `BankStatement` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `BankTransaction` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DepartmentExpense` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DepartmentSalaryAllocation` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AutoInvoiceConfig` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AccountsMonthlyReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AccountsQuarterlyReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `OfferLetter` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployeeClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployeeEscalation` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployeeAppreciation` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ManagerBehaviorReview` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EmployerBrandingContent` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ContentIdea` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `EngagementActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WorkAnniversaryReminder` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Day0Task` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SaasTool` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientProposal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AccountOnboardingDetails` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientLedger` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `Sequence` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MagicLink` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `UserGoogleDrive` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WorkEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WorkEntryFile` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DeliverableTypeConfig` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WhatsAppChatNote` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SharedWhatsAppChat` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SocialMediaPost` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MonthlyGrowthScore` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SocialMediaPageMetrics` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `RecurringExpense` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ExpenseAllocation` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ExpensePayment` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `TaskGoalLink` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `BudgetAlert` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientOAuthConnection` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PlatformMetric` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PlatformSyncJob` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MagicLinkToken` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PasswordResetToken` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AgencyApiCredential` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AgencyServiceAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `OAuthAccessRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ApiCredentialAuditLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientPlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PlatformMetricEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DataImportBatch` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientUserInvitation` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientUserActivity` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PortalNotification` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientDocument` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientAnnouncement` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientGoal` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ContentApproval` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ClientAccessRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebProjectPhase` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MaintenanceContract` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ServiceChangeRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ServiceTermination` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebsiteSitemap` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `PageFeedback` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebOnboarding` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `HostingAccount` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MaintenanceLog` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebReimbursement` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `UpsellOpportunity` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebProject` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebProjectPhaseItem` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebBugReport` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebChangeRequest` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebDesignApproval` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `WebProjectTimeEntry` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DailyMeeting` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `MeetingCompliance` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AIExtractionSession` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SystemSetting` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SeoKeyword` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SeoRankHistory` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SeoBacklink` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SeoContent` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `GbpProfile` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `GbpPost` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `GbpMetric` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `SeoTask` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AdCreative` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `AdSpend` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `BudgetAllocation` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ABTest` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `ConversionEvent` — `/home/veer/Desktop/Office/PioneerOS/pioneer_data/prisma/schema.prisma`
- `DepartmentTarget` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `CompanyNews` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `PerformanceScore` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `LeaveRequest` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `EmployeeOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `ClientTeamMember` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `DailyTask` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `FreelancerWorkReport` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `FreelancerPayment` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/page.tsx`
- `AgencyApiCredential` — `/home/veer/Desktop/Office/PioneerOS/src/server/api-credentials/alerts.ts`
- `ApiCredentialAuditLog` — `/home/veer/Desktop/Office/PioneerOS/src/server/api-credentials/credential-service.ts`
- `LoginSession` — `/home/veer/Desktop/Office/PioneerOS/src/server/auth/session-tracker.ts`
- `ClientOAuthConnection` — `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/connection-service.ts`
- `UserGoogleDrive` — `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/googleDrive.ts`
- `PlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/sync-service.ts`
- `ClientUser` — `/home/veer/Desktop/Office/PioneerOS/src/server/notifications/portalNotifications.ts`
- `ClientPlatformAccount` — `/home/veer/Desktop/Office/PioneerOS/src/server/reporting/dashboard-data.ts`
- `DataImportBatch` — `/home/veer/Desktop/Office/PioneerOS/src/server/reporting/dashboard-data.ts`
- `PlatformMetricEntry` — `/home/veer/Desktop/Office/PioneerOS/src/server/reporting/dashboard-data.ts`
- `SelfAppraisal` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/appraisal.ts`
- `WorkEntry` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/clientBilling.ts`
- `ClientScope` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/clientIntegrity.ts`
- `LearningLog` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- `EmployeeAppreciation` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- `EmployeeClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- `ClientFeedback` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- `EmployeeEscalation` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- `MonthlyGrowthScore` — `/home/veer/Desktop/Office/PioneerOS/src/server/services/growthScore.ts`
- `PaymentCollection` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/accounts/page.tsx`
- `PaymentFollowUp` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/accounts/page.tsx`
- `CompanyEntity` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/page.tsx`
- `ArcadePointTransaction` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/arcade/page.tsx`
- `ArcadeReward` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/arcade/page.tsx`
- `ArcadeRedemption` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/arcade/page.tsx`
- `ContentApproval` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/design/page.tsx`
- `OfferLetter` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/page.tsx`
- `SupportTicket` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/inbox/page.tsx`
- `UserTraining` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/intern/page.tsx`
- `ChatChannel` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/mash/page.tsx`
- `AccountabilityScore` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/performance/page.tsx`
- `Recognition` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/recognition/page.tsx`
- `LeadActivity` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/page.tsx`
- `FollowUpReminder` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/page.tsx`
- `SOPCategory` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sop/page.tsx`
- `VideoTestimonial` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/testimonials/page.tsx`
- `Training` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/training/page.tsx`
- `UserCertification` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/training/page.tsx`
- `VendorOnboarding` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/vendors/page.tsx`
- `WebProject` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- `WebBugReport` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- `UpsellOpportunity` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- `WebChangeRequest` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- `WebProjectPhaseItem` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- `WebDesignApproval` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/web/page.tsx`
- `Asset` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/assets/route.ts`
- `AdSpend` — `/home/veer/Desktop/Office/PioneerOS/src/server/integrations/google/ads.ts`
- `ClientProposal` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/accounts/onboarding/page.tsx`
- `CustomRole` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/custom-roles/page.tsx`
- `FreelancerProfile` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/admin/freelancers/page.tsx`
- `CommunicationSchedule` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/communication/page.tsx`
- `CommunicationTemplate` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/communication/page.tsx`
- `CommunicationLog` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/communication/page.tsx`
- `RFPSubmission` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/clients/rfp/page.tsx`
- `RBCAccrual` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/finance/rbc/page.tsx`
- `RBCPayout` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/finance/rbc/page.tsx`
- `RBC_Pot` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/finance/rbc/page.tsx`
- `ExitProcess` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/exit/page.tsx`
- `FnFSettlement` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/fnf/page.tsx`
- `LeaveBalance` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/leave/page.tsx`
- `PIPPlan` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/pip/page.tsx`
- `ReferralBonus` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/hr/referrals/page.tsx`
- `DailyMeeting` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/daily/page.tsx`
- `WorkDeliverable` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/department-tactical/page.tsx`
- `TacticalGoal` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/kpi/page.tsx`
- `TacticalMeeting` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/strategic/page.tsx`
- `PeerReview` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/strategic/page.tsx`
- `SocialMediaPost` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/tactical-sheet/page.tsx`
- `SocialMediaPageMetrics` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/meetings/tactical-sheet/page.tsx`
- `SalesDeal` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/performance/page.tsx`
- `SalesHandover` — `/home/veer/Desktop/Office/PioneerOS/src/app/(dashboard)/sales/reports/page.tsx`
- `SystemSetting` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/admin/settings/route.ts`
- `SLADocument` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/contracts/route.ts`
- `ClientPortalFeedback` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/client-portal/feedback/route.ts`
- `ClientOnboardingChecklist` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/operations/pending-onboarding/route.ts`
- `SalesDailyTask` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/daily-tasks/route.ts`
- `SalesWhatsAppMessage` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/sales/whatsapp/route.ts`
- `SeoTask` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/dashboard/route.ts`
- `SeoKeyword` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/seo/dashboard/route.ts`
- `WhatsAppCampaign` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/whatsapp/campaigns/route.ts`
- `WhatsAppTemplate` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/whatsapp/templates/route.ts`
- `ClientLedger` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/accounts/payments/manual/route.ts`
- `ClientLifecycleEvent` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/clients/[clientId]/lifecycle/route.ts`
- `AssetAssignment` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/devices/my/route.ts`
- `DirectMessage` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/mash/dm/[userId]/route.ts`
- `TaskComment` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/tasks/[taskId]/comments/route.ts`
- `WebOnboarding` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-clients/[id]/onboarding/route.ts`
- `WebProjectPhase` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/web-clients/[id]/phases/route.ts`
- `ExitChecklist` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/hr/exit/[id]/checklist/route.ts`
- `ChatMessage` — `/home/veer/Desktop/Office/PioneerOS/src/app/api/mash/channels/[channelId]/messages/route.ts`
- `user_profiles` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `automation_logs` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `pioneer_academy` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `tool_registry` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `arcade_events` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `social_posts` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `posh_complaints` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `appraisals` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `ai_query_logs` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`
- `learning_submissions` — `/home/veer/Desktop/Office/PioneerOS/supabase/schema.sql`

## 🔗 Data Flow Map

Below is how frontend calls connect to backend routes and models:

- **`[GET] /api/client-portal`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-portal/credentials`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-portal/meetings`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-portal/reports`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-portal/invoices`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-portal/deliverables`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-portal/profile/edit`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-portal/payments`** (undefined)
  - *(no matching route)*
- **`[GET] /api/clients?limit=500`** (undefined)
  - *(no matching route)*
- **`[GET] /api/users?limit=500&status=ACTIVE`** (undefined)
  - *(no matching route)*
- **`[GET] /api/users`** (undefined)
  - *(no matching route)*
- **`[GET] /api/clients`** (undefined)
  - *(no matching route)*
- **`[GET] /api/crm/leads`** (undefined)
  - → `[POST] /api/crm/leads`
  - → `[GET] /api/crm/leads`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
- **`[GET] /api/issues`** (undefined)
  - *(no matching route)*
- **`[GET] /api/users?department=DESIGN`** (undefined)
  - *(no matching route)*
- **`[GET] /api/design/requests?status=REQUESTED,IN_DESIGN`** (undefined)
  - *(no matching route)*
- **`[GET] /api/ads/analytics`** (undefined)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?take=5&orderBy=updatedAt`** (undefined)
  - *(no matching route)*
- **`[GET] /api/admin/users`** (undefined)
  - → `[POST] /api/admin/users`
  - → `[GET] /api/admin/users`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
- **`[GET] /api/clients?limit=200`** (undefined)
  - *(no matching route)*
- **`[GET] /api/clients?limit=500`** (undefined)
  - *(no matching route)*
- **`[GET] /api/client-access-requests`** (undefined)
  - *(no matching route)*
- **`[GET] /api/accounts/calendar-events?year=*&month=*`** (undefined)
  - *(no matching route)*
- **`[GET] /api/accounts/contracts?expiring=true`** (undefined)
  - *(no matching route)*
- **`[GET] /api/accounts/finance-stats?period=*`** (undefined)
  - *(no matching route)*
- **`[GET] /api/accounts/payments?limit=10`** (undefined)
  - *(no matching route)*
- **`[GET] /api/clients?sortBy=monthlyFee&limit=5`** (undefined)
  - *(no matching route)*
- **`[GET] /api/admin/clients`** (undefined)
  - *(no matching route)*
- **`[GET] /api/hr/assessment/pipeline`** (undefined)
  - *(no matching route)*
- **`[GET] /api/whatsapp/campaigns`** (undefined)
  - *(no matching route)*
- **`[GET] /api/whatsapp/templates?active=true`** (undefined)
  - *(no matching route)*
- **`[GET] /api/admin/users`** (undefined)
  - → `[POST] /api/admin/users`
  - → `[GET] /api/admin/users`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
- **`[GET] /api/clients?limit=200`** (undefined)
  - *(no matching route)*
- **`[GET] /api/clients`** (undefined)
  - *(no matching route)*
- **`[GET] /api/invoices`** (undefined)
  - *(no matching route)*
- **`[GET] /api/hr/employees`** (undefined)
  - *(no matching route)*
- **`[GET] /api/hr/attendance/sync`** (undefined)
  - *(no matching route)*
- **`[GET] /api/hr/interviews`** (undefined)
  - *(no matching route)*
- **`[GET] /api/hr/interviews/pending-candidates`** (undefined)
  - *(no matching route)*
- **`[GET] /api/clients`** (undefined)
  - *(no matching route)*
- **`[GET] /api/users`** (undefined)
  - *(no matching route)*
- **`[GET] /api/admin/users`** (undefined)
  - → `[POST] /api/admin/users`
  - → `[GET] /api/admin/users`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
- **`[GET] /api/clients?limit=200`** (undefined)
  - *(no matching route)*
- **`[GET] /api/sales/meetings`** (undefined)
  - → `[POST] /api/sales/meetings`
  - → `[GET] /api/sales/meetings`
    - → 📦 `Meeting`
    - → 📦 `Meeting`
    - → 📦 `Meeting`
    - → 📦 `Meeting`
    - → 📦 `meetings`
- **`[GET] /api/sales/leads`** (undefined)
  - *(no matching route)*
- **`[GET] /api/sales/leads?stage=active&limit=100`** (undefined)
  - *(no matching route)*
- **`[GET] /api/sales/nurturing/content`** (undefined)
  - → `[GET] /api/sales/nurturing/content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
- **`[GET] /api/ads/analytics`** (undefined)
  - *(no matching route)*
- **`[GET] /api/users?department=ADS`** (undefined)
  - *(no matching route)*
- **`[GET] /api/ads/analytics`** (undefined)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?status=ACTIVE`** (undefined)
  - *(no matching route)*
- **`[GET] /api/hr/attendance?date=*`** (undefined)
  - *(no matching route)*
- **`[GET] /api/hr/employees`** (undefined)
  - *(no matching route)*
- **`[GET] /api/social/dashboard`** (undefined)
  - *(no matching route)*
- **`[GET] /api/social/clients?limit=1`** (undefined)
  - *(no matching route)*
- **`[GET] /api/social/dashboard`** (undefined)
  - *(no matching route)*
- **`[GET] /api/social/clients?limit=100`** (undefined)
  - *(no matching route)*
- **`[GET] /api/social/dashboard`** (undefined)
  - *(no matching route)*
- **`[GET] /api/social/clients?limit=100`** (undefined)
  - *(no matching route)*
- **`[GET] /api/web/upsells`** (undefined)
  - *(no matching route)*
- **`[GET] /api/web/clients`** (undefined)
  - → `[GET] /api/web/clients`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/admin/users`** (AddTaskModal)
  - → `[POST] /api/admin/users`
  - → `[GET] /api/admin/users`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
- **`[GET] /api/hr/client-names`** (clientRes)
  - → `[GET] /api/hr/client-names`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/clients`** (clientRes)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE`** (clientsRes)
  - *(no matching route)*
- **`[GET] /api/client-portal/profile`** (companyRes)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/meetings/compliance`** (compRes)
  - *(no matching route)*
- **`[POST] /api/accounts/proforma-invoice`** (createInvoice)
  - *(no matching route)*
- **`[PATCH] /api/vendors/*`** (deactivate)
  - *(no matching route)*
- **`[DELETE] /api/quotes?id=*`** (deleteQuote)
  - *(no matching route)*
- **`[GET] /api/hr/employees`** (empRes)
  - *(no matching route)*
- **`[GET] /api/hr/employees`** (empRes)
  - *(no matching route)*
- **`[GET] /api/expenses?limit=5`** (expensesRes)
  - *(no matching route)*
- **`[GET] /api/hr/client-feedback`** (feedbackRes)
  - *(no matching route)*
- **`[GET] /api/social/approvals?type=CLIENT&limit=100`** (fetchApprovals)
  - *(no matching route)*
- **`[GET] /api/social/approvals?type=INTERNAL&limit=100`** (fetchApprovals)
  - *(no matching route)*
- **`[POST] /api/web/projects/*/phases/*/approve`** (handleApprove)
  - *(no matching route)*
- **`[PATCH] /api/hiring/*`** (handleCellEdit)
  - *(no matching route)*
- **`[PATCH] /api/assets/*`** (handleCellEdit)
  - *(no matching route)*
- **`[PATCH] /api/accounts/client-onboarding/*`** (handleChecklistToggle)
  - *(no matching route)*
- **`[PATCH] /api/hr/onboarding-checklist/*`** (handleChecklistToggle)
  - *(no matching route)*
- **`[POST] /api/accounts/payment/*`** (handleConfirmPayment)
  - *(no matching route)*
- **`[POST] /api/integrations/*/disconnect`** (handleDisconnect)
  - *(no matching route)*
- **`[POST] /api/clients/*/import/excel`** (handleImport)
  - *(no matching route)*
- **`[POST] /api/clients/*/import/*`** (handleImport)
  - *(no matching route)*
- **`[POST] /api/client-portal/logout`** (handleLogout)
  - → `[POST] /api/client-portal/logout`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/clients/operations-log`** (handleLogRemarks)
  - *(no matching route)*
- **`[PUT] /api/client-portal/notifications`** (handleMarkAllRead)
  - *(no matching route)*
- **`[PUT] /api/client-portal/notifications`** (handleMarkAsRead)
  - *(no matching route)*
- **`[PATCH] /api/crm/leads/*`** (handleMarkLost)
  - *(no matching route)*
- **`[PATCH] /api/onboard/*`** (handleNext)
  - *(no matching route)*
- **`[PATCH] /api/accounts/client-onboarding/*`** (handleNotesUpdate)
  - *(no matching route)*
- **`[PATCH] /api/hr/onboarding-checklist/*`** (handleNotesUpdate)
  - *(no matching route)*
- **`[POST] /api/clients/*/import/excel?preview=true`** (handlePreview)
  - *(no matching route)*
- **`[POST] /api/clients/*/import/*?preview=true`** (handlePreview)
  - *(no matching route)*
- **`[DELETE] /api/clients/*/team?memberId=*`** (handleRemoveMember)
  - *(no matching route)*
- **`[POST] /api/web/projects/*/phases/*/request-approval`** (handleRequestApproval)
  - *(no matching route)*
- **`[POST] /api/web/projects/*/phases/*/request-changes`** (handleRequestChanges)
  - *(no matching route)*
- **`[PATCH] /api/tasks/daily/*`** (handleSendWhatsAppExternal)
  - *(no matching route)*
- **`[PATCH] /api/clients/*/team/*`** (handleSetPrimary)
  - *(no matching route)*
- **`[POST] /api/client-portal/logout`** (handleSignOut)
  - → `[POST] /api/client-portal/logout`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/client-portal/logout`** (handleSignOut)
  - → `[POST] /api/client-portal/logout`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[PATCH] /api/accounts/sla/*`** (handleSignSLA)
  - *(no matching route)*
- **`[PATCH] /api/hr/engagement-activities/*`** (handleStatusChange)
  - *(no matching route)*
- **`[PATCH] /api/work-entries/*`** (handleSubmitForApproval)
  - *(no matching route)*
- **`[GET] /api/social/approvals?type=CONTENT`** (handleSubmitPost)
  - *(no matching route)*
- **`[PUT] /api/web/projects/*/phases/*/checklist`** (handleToggle)
  - *(no matching route)*
- **`[POST] /api/accounts/sla/*`** (handleUploadSLA)
  - *(no matching route)*
- **`[GET] /api/admin/view-as`** (ImpersonationBanner)
  - → `[POST] /api/admin/view-as`
  - → `[DELETE] /api/admin/view-as`
  - → `[GET] /api/admin/view-as`
- **`[GET] /api/hr/employees?excludeFounders=true`** (InitiateExitButton)
  - *(no matching route)*
- **`[GET] /api/users`** (LeaderboardClient)
  - *(no matching route)*
- **`[GET] /api/users`** (loadData)
  - *(no matching route)*
- **`[POST] /api/sales/leads/*/activities`** (logActivity)
  - *(no matching route)*
- **`[PUT] /api/client-portal/notifications`** (markAllAsRead)
  - *(no matching route)*
- **`[PATCH] /api/notifications`** (markAllRead)
  - *(no matching route)*
- **`[PATCH] /api/notifications`** (markRead)
  - *(no matching route)*
- **`[POST] /api/payments/create-order`** (orderRes)
  - → `[POST] /api/payments/create-order`
  - → `[GET] order`
- **`[GET] /api/quotes?mode=qotd`** (page)
  - *(no matching route)*
- **`[GET] /api/social/dashboard`** (page)
  - *(no matching route)*
- **`[POST] /api/auth/client-magic`** (page)
  - → `[POST] /api/auth/client-magic`
  - → `[GET] /api/auth/client-magic`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[GET] /api/client-portal/dashboard`** (page)
  - *(no matching route)*
- **`[GET] /api/accounts/client-profitability?*`** (page)
  - *(no matching route)*
- **`[GET] /api/accounts/tax-compliance?month=*`** (page)
  - *(no matching route)*
- **`[GET] /api/admin/settings`** (page)
  - *(no matching route)*
- **`[GET] /api/users`** (page)
  - *(no matching route)*
- **`[GET] /api/clients`** (page)
  - *(no matching route)*
- **`[GET] /api/sales/analytics`** (page)
  - → `[GET] /api/sales/analytics`
- **`[GET] /api/seo/tasks?status=ALL`** (page)
  - *(no matching route)*
- **`[GET] /api/social/approvals?limit=100`** (page)
  - *(no matching route)*
- **`[GET] /api/social/metrics?platform=LINKEDIN`** (page)
  - *(no matching route)*
- **`[GET] /api/social/posts?platform=LINKEDIN`** (page)
  - *(no matching route)*
- **`[GET] /api/tasks?department=SOCIAL_MEDIA`** (page)
  - *(no matching route)*
- **`[GET] /api/clients`** (page)
  - *(no matching route)*
- **`[GET] /api/clients?limit=200`** (page)
  - *(no matching route)*
- **`[GET] /api/users?department=DESIGN`** (page)
  - *(no matching route)*
- **`[GET] /api/clients`** (page)
  - *(no matching route)*
- **`[GET] /api/hiring/candidates`** (page)
  - *(no matching route)*
- **`[GET] /api/admin/users?role=SALES&limit=100`** (page)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (page)
  - *(no matching route)*
- **`[GET] /api/seo/tasks`** (page)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (page)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (page)
  - *(no matching route)*
- **`[GET] /api/hr/employees?department=SEO`** (page)
  - *(no matching route)*
- **`[GET] /api/seo/tasks`** (page)
  - *(no matching route)*
- **`[GET] /api/seo/keywords`** (page)
  - *(no matching route)*
- **`[GET] /api/seo/dashboard`** (page)
  - *(no matching route)*
- **`[GET] /api/seo/dashboard`** (page)
  - *(no matching route)*
- **`[GET] /api/seo/dashboard`** (page)
  - *(no matching route)*
- **`[GET] /api/seo/dashboard`** (page)
  - *(no matching route)*
- **`[GET] /api/social/clients`** (page)
  - *(no matching route)*
- **`[GET] /api/social/posts?month=*`** (page)
  - *(no matching route)*
- **`[GET] /api/social/approvals?type=CONTENT`** (page)
  - *(no matching route)*
- **`[GET] /api/clients`** (page)
  - *(no matching route)*
- **`[GET] /api/clients`** (page)
  - *(no matching route)*
- **`[GET] /api/social/approvals?type=CREATIVE`** (page)
  - *(no matching route)*
- **`[GET] /api/tasks?department=SOCIAL_MEDIA`** (page)
  - *(no matching route)*
- **`[GET] /api/accounts/payments?limit=5`** (paymentsRes)
  - *(no matching route)*
- **`[POST] //oauth2.googleapis.com/revoke?token=*`** (POST)
  - *(no matching route)*
- **`[GET] /api/client-portal/profile/edit`** (profileRes)
  - *(no matching route)*
- **`[PATCH] /api/users/profile`** (profileRes)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PATCH] /api/client-deliverables`** (promises)
  - *(no matching route)*
- **`[POST] /api/v1/send_msg/`** (res)
  - *(no matching route)*
- **`[POST] /api/careers/apply`** (res)
  - → `[POST] /api/careers/apply`
- **`[GET] /api/auth/test-login`** (res)
  - *(no matching route)*
- **`[POST] /api/auth/client`** (res)
  - → `[POST] /api/auth/client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/auth/client`** (res)
  - → `[POST] /api/auth/client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/auth/test-login`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/tickets`** (res)
  - *(no matching route)*
- **`[DELETE] /api/client-portal/credentials?id=*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/credentials`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/exit-interview`** (res)
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/public/join`** (res)
  - → `[POST] /api/public/join`
- **`[GET] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/client-portal/notifications?unread=true`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/client-onboarding`** (res)
  - → `[GET] onboarding`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[POST] /api/admin/quick-allocate`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?limit=100`** (res)
  - *(no matching route)*
- **`[POST] /api/ads/budget`** (res)
  - *(no matching route)*
- **`[GET] /api/clients`** (res)
  - *(no matching route)*
- **`[POST] /api/ads/campaigns`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/credentials?reveal=true`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/notifications?limit=10`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/profile/edit`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PUT] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PUT] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PUT] /api/client-portal/profile/edit`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/profile/edit`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/team/*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/termination`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/termination`** (res)
  - *(no matching route)*
- **`[DELETE] /api/client-portal/termination`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/work-tracker?*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[POST] /api/crm/leads/*/activity`** (res)
  - *(no matching route)*
- **`[POST] /api/crm/leads/*/reminder`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/onboarding/*/resend`** (res)
  - *(no matching route)*
- **`[POST] /api/notifications/whatsapp`** (res)
  - → `[GET] /api/notifications/whatsapp`
    - → 📦 `Notification`
    - → 📦 `Notification`
    - → 📦 `Notification`
    - → 📦 `Notification`
- **`[PATCH] /api/invoices/*`** (res)
  - *(no matching route)*
- **`[GET] /api/auth/client-magic`** (res)
  - → `[POST] /api/auth/client-magic`
  - → `[GET] /api/auth/client-magic`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/meetings`** (res)
  - *(no matching route)*
- **`[PATCH] /api/tasks/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/tasks/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/crm/leads/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/crm/leads/*`** (res)
  - *(no matching route)*
- **`[GET] /api/integrations/status/*`** (res)
  - *(no matching route)*
- **`[POST] /api/integrations/*/connect`** (res)
  - *(no matching route)*
- **`[POST] /api/integrations/sync`** (res)
  - *(no matching route)*
- **`[GET] /api/users?department=ADS`** (res)
  - *(no matching route)*
- **`[GET] /api/notifications?limit=5`** (res)
  - *(no matching route)*
- **`[GET] /api/search?q=*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/notifications`** (res)
  - *(no matching route)*
- **`[DELETE] /api/admin/view-as?redirectTo=/admin/users`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings/ai-extract`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings/ai-extract`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings/daily`** (res)
  - *(no matching route)*
- **`[PATCH] /api/meetings/*`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings`** (res)
  - *(no matching route)*
- **`[GET] /api/meetings/compliance`** (res)
  - *(no matching route)*
- **`[POST] /api/network/post`** (res)
  - → `[POST] /api/network/post`
    - → 📦 `Post`
    - → 📦 `Post`
    - → 📦 `Post`
    - → 📦 `Post`
- **`[POST] /api/network/like`** (res)
  - → `[POST] /api/network/like`
    - → 📦 `Like`
    - → 📦 `Like`
    - → 📦 `Like`
- **`[POST] /api/network/comment`** (res)
  - → `[POST] /api/network/comment`
    - → 📦 `Comment`
    - → 📦 `Comment`
    - → 📦 `Comment`
- **`[GET] /api/org-chart/*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/survey`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/survey`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/termination`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/termination`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/termination/handover`** (res)
  - *(no matching route)*
- **`[DELETE] /api/client-portal/termination?id=*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/termination/export`** (res)
  - → `[GET] export`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PATCH] /api/users/profile-picture`** (res)
  - *(no matching route)*
- **`[POST] /api/clients/*/platform-accounts`** (res)
  - *(no matching route)*
- **`[DELETE] /api/clients/*/import/batches?batchId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/clients/*/import/manual`** (res)
  - *(no matching route)*
- **`[PATCH] /api/clients/*/platform-accounts/*`** (res)
  - *(no matching route)*
- **`[DELETE] /api/clients/*/platform-accounts/*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients/*/platform-accounts`** (res)
  - *(no matching route)*
- **`[POST] /api/sales/leads/*/nurture`** (res)
  - *(no matching route)*
- **`[GET] /api/auth/sessions`** (res)
  - *(no matching route)*
- **`[GET] /api/auth/sessions/history?page=*&limit=10`** (res)
  - *(no matching route)*
- **`[DELETE] /api/auth/sessions/*`** (res)
  - *(no matching route)*
- **`[DELETE] /api/auth/sessions`** (res)
  - *(no matching route)*
- **`[GET] /api/auth/2fa/status`** (res)
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Invoice`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Meeting`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Interview`
    - → 📦 `ClientAccessRequest`
    - → 📦 `ClientDeliverable`
    - → 📦 `Expense`
    - → 📦 `Goal`
    - → 📦 `MaintenanceContract`
    - → 📦 `Campaign`
    - → 📦 `Proposal`
    - → 📦 `BankStatement`
    - → 📦 `Contract`
    - → 📦 `OAuthAccessRequest`
    - → 📦 `ClientAnnouncement`
    - → 📦 `ServiceTermination`
    - → 📦 `ABTest`
    - → 📦 `AdCreative`
    - → 📦 `Report`
    - → 📦 `RecurringExpense`
    - → 📦 `AttendanceImport`
    - → 📦 `EmployerBrandingContent`
    - → 📦 `ContentIdea`
    - → 📦 `EngagementActivity`
    - → 📦 `ManagerBehaviorReview`
    - → 📦 `Issue`
    - → 📦 `SeoBacklink`
    - → 📦 `ClientApproval`
    - → 📦 `SeoContent`
    - → 📦 `SeoReport`
    - → 📦 `QcReview`
    - → 📦 `YouTubeVideo`
    - → 📦 `WebReimbursement`
    - → 📦 `AccountsMonthlyReview`
    - → 📦 `AccountsQuarterlyReview`
    - → 📦 `CandidateAssessment`
    - → 📦 `DeviceRequest`
    - → 📦 `clients`
    - → 📦 `tasks`
    - → 📦 `meetings`
- **`[GET] /api/auth/2fa/setup`** (res)
  - *(no matching route)*
- **`[POST] /api/auth/2fa/verify`** (res)
  - *(no matching route)*
- **`[POST] /api/auth/2fa/disable`** (res)
  - *(no matching route)*
- **`[POST] /api/auth/2fa/backup-codes`** (res)
  - *(no matching route)*
- **`[GET] /api/tasks/daily/stats?*`** (res)
  - *(no matching route)*
- **`[POST] /api/leads/quick-add`** (res)
  - *(no matching route)*
- **`[GET] /api/testimonials/user/*/badges`** (res)
  - *(no matching route)*
- **`[GET] /api/testimonials/user/*/badges`** (res)
  - *(no matching route)*
- **`[POST] /api/upload/cloudinary`** (res)
  - *(no matching route)*
- **`[PATCH] /api/web-clients/*/phases`** (res)
  - *(no matching route)*
- **`[POST] /api/auth/magic-link`** (res)
  - → `[POST] /api/auth/magic-link`
- **`[GET] /api/academy/content`** (res)
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
- **`[POST] /api/admin/generate-magic-link`** (res)
  - → `[POST] /api/admin/generate-magic-link`
- **`[PATCH] /api/admin/users/*`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/users`** (res)
  - → `[POST] /api/admin/users`
  - → `[GET] /api/admin/users`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
- **`[POST] /api/admin/generate-magic-link`** (res)
  - → `[POST] /api/admin/generate-magic-link`
- **`[GET] /api/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/calendar`** (res)
  - *(no matching route)*
- **`[POST] /api/client-access-requests`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/quick-add/client`** (res)
  - *(no matching route)*
- **`[PATCH] /api/clients/*/logo`** (res)
  - *(no matching route)*
- **`[GET] /api/crm/leads`** (res)
  - → `[POST] /api/crm/leads`
  - → `[GET] /api/crm/leads`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
- **`[POST] /api/crm/leads`** (res)
  - → `[POST] /api/crm/leads`
  - → `[GET] /api/crm/leads`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
- **`[PATCH] /api/crm/leads/*`** (res)
  - *(no matching route)*
- **`[DELETE] /api/crm/leads/*`** (res)
  - *(no matching route)*
- **`[GET] /api/documents?*`** (res)
  - *(no matching route)*
- **`[POST] /api/documents`** (res)
  - *(no matching route)*
- **`[DELETE] /api/documents?id=*`** (res)
  - *(no matching route)*
- **`[GET] /api/quarterly-goals?*`** (res)
  - *(no matching route)*
- **`[GET] /api/users?status=ACTIVE`** (res)
  - *(no matching route)*
- **`[POST] /api/quarterly-goals`** (res)
  - *(no matching route)*
- **`[POST] /api/quarterly-goals`** (res)
  - *(no matching route)*
- **`[PATCH] /api/quarterly-goals`** (res)
  - *(no matching route)*
- **`[PATCH] /api/goals/*`** (res)
  - *(no matching route)*
- **`[POST] /api/hiring`** (res)
  - *(no matching route)*
- **`[DELETE] /api/hiring/*`** (res)
  - *(no matching route)*
- **`[POST] /api/ideas`** (res)
  - → `[POST] /api/ideas`
    - → 📦 `Idea`
    - → 📦 `Idea`
    - → 📦 `Idea`
    - → 📦 `Idea`
- **`[GET] /api/saas-tools`** (res)
  - → `[POST] /api/saas-tools`
  - → `[GET] /api/saas-tools`
    - → 📦 `SaasTool`
- **`[GET] /api/issues`** (res)
  - *(no matching route)*
- **`[GET] /api/knowledge/search?q=*`** (res)
  - *(no matching route)*
- **`[GET] /api/learning/audit`** (res)
  - *(no matching route)*
- **`[POST] /api/learning/audit`** (res)
  - *(no matching route)*
- **`[GET] /api/learning/log`** (res)
  - *(no matching route)*
- **`[POST] /api/learning/verify`** (res)
  - *(no matching route)*
- **`[PUT] /api/learning/verify`** (res)
  - *(no matching route)*
- **`[DELETE] /api/learning/log?logId=*`** (res)
  - *(no matching route)*
- **`[GET] /api/manager/dashboard`** (res)
  - → `[GET] /api/manager/dashboard`
    - → 📦 `Issue`
- **`[GET] /api/mash/dm/unread-counts`** (res)
  - *(no matching route)*
- **`[GET] /api/mash/channels/*/messages`** (res)
  - *(no matching route)*
- **`[GET] /api/mash/dm/*`** (res)
  - *(no matching route)*
- **`[POST] /api/mash/dm/*`** (res)
  - *(no matching route)*
- **`[POST] /api/mash/channels/*/messages`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings`** (res)
  - *(no matching route)*
- **`[PATCH] /api/meetings`** (res)
  - *(no matching route)*
- **`[PATCH] /api/meetings`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily/*/start`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily/*/complete`** (res)
  - *(no matching route)*
- **`[PATCH] /api/notifications`** (res)
  - *(no matching route)*
- **`[PATCH] /api/notifications`** (res)
  - *(no matching route)*
- **`[POST] /api/accountability/calculate`** (res)
  - *(no matching route)*
- **`[POST] /api/accountability/achievements`** (res)
  - *(no matching route)*
- **`[GET] /api/users/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/seo/dashboard`** (res)
  - *(no matching route)*
- **`[PATCH] /api/users/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PATCH] /api/users/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PATCH] /api/users/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/tasks/daily-report?userId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks`** (res)
  - *(no matching route)*
- **`[PATCH] /api/tasks/*`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/*/timer`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/*/timer`** (res)
  - *(no matching route)*
- **`[DELETE] /api/tasks/*`** (res)
  - *(no matching route)*
- **`[GET] /api/users`** (res)
  - *(no matching route)*
- **`[POST] /api/testimonials`** (res)
  - *(no matching route)*
- **`[PATCH] /api/testimonials/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/testimonials/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/testimonials/*`** (res)
  - *(no matching route)*
- **`[GET] /api/work-entries?*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/google-drive/status`** (res)
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Invoice`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Meeting`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Interview`
    - → 📦 `ClientAccessRequest`
    - → 📦 `ClientDeliverable`
    - → 📦 `Expense`
    - → 📦 `Goal`
    - → 📦 `MaintenanceContract`
    - → 📦 `Campaign`
    - → 📦 `Proposal`
    - → 📦 `BankStatement`
    - → 📦 `Contract`
    - → 📦 `OAuthAccessRequest`
    - → 📦 `ClientAnnouncement`
    - → 📦 `ServiceTermination`
    - → 📦 `ABTest`
    - → 📦 `AdCreative`
    - → 📦 `Report`
    - → 📦 `RecurringExpense`
    - → 📦 `AttendanceImport`
    - → 📦 `EmployerBrandingContent`
    - → 📦 `ContentIdea`
    - → 📦 `EngagementActivity`
    - → 📦 `ManagerBehaviorReview`
    - → 📦 `Issue`
    - → 📦 `SeoBacklink`
    - → 📦 `ClientApproval`
    - → 📦 `SeoContent`
    - → 📦 `SeoReport`
    - → 📦 `QcReview`
    - → 📦 `YouTubeVideo`
    - → 📦 `WebReimbursement`
    - → 📦 `AccountsMonthlyReview`
    - → 📦 `AccountsQuarterlyReview`
    - → 📦 `CandidateAssessment`
    - → 📦 `DeviceRequest`
    - → 📦 `clients`
    - → 📦 `tasks`
    - → 📦 `meetings`
- **`[POST] /api/work-entries`** (res)
  - *(no matching route)*
- **`[POST] /api/work-entries/*/upload`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/rfp/*`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/assessment/*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/assessment/*`** (res)
  - *(no matching route)*
- **`[GET] /api/auth/client-magic`** (res)
  - → `[POST] /api/auth/client-magic`
  - → `[GET] /api/auth/client-magic`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/auth/password/reset-with-otp`** (res)
  - → `[POST] /api/auth/password/reset-with-otp`
- **`[POST] /api/auth/password/reset-with-otp`** (res)
  - → `[POST] /api/auth/password/reset-with-otp`
- **`[POST] /api/auth/password/reset-with-otp`** (res)
  - → `[POST] /api/auth/password/reset-with-otp`
- **`[POST] /api/auth/magic-link/verify`** (res)
  - → `[POST] /api/auth/magic-link/verify`
- **`[POST] /api/auth/password/check`** (res)
  - → `[POST] /api/auth/password/check`
- **`[POST] /api/auth/password/register`** (res)
  - → `[POST] /api/auth/password/register`
- **`[POST] /api/auth/password/reset`** (res)
  - → `[POST] /api/auth/password/reset`
- **`[GET] /api/client-portal/org-chart`** (res)
  - *(no matching route)*
- **`[POST] /api/web/bugs`** (res)
  - *(no matching route)*
- **`[POST] /api/careers/apply`** (res)
  - → `[POST] /api/careers/apply`
- **`[POST] /api/accounts/client-onboarding`** (res)
  - → `[GET] onboarding`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[POST] /api/rfp`** (res)
  - → `[POST] /api/rfp`
- **`[POST] /api/support/tickets`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/client-onboarding`** (res)
  - → `[GET] onboarding`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/client-portal/data?clientId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/onboard/*/complete`** (res)
  - *(no matching route)*
- **`[GET] /api/onboarding/*`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/client-portal/credentials*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/credentials`** (res)
  - *(no matching route)*
- **`[DELETE] /api/client-portal/credentials?id=*`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/feedback`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/client-portal/credentials*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/profile/edit`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/profile/edit`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/profile/edit`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/export?type=*`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[PUT] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[POST] /api/client-portal/feedback`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/credentials`** (res)
  - *(no matching route)*
- **`[DELETE] /api/client-portal/credentials?id=*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/ads`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/approvals`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/approvals`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/contracts`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/deliverables?*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/goals`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/invoices?*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/meetings?*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/notifications?*`** (res)
  - *(no matching route)*
- **`[PUT] /api/client-portal/notifications`** (res)
  - *(no matching route)*
- **`[DELETE] /api/client-portal/notifications?id=*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/dashboard`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/onboarding-data`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/reports?*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/profile`** (res)
  - → `[GET] file`
  - → `[GET] file`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/web-portal`** (res)
  - → `[GET] /api/web-portal`
    - → 📦 `WebsiteSitemap`
    - → 📦 `PageFeedback`
- **`[GET] /api/proposal/*`** (res)
  - *(no matching route)*
- **`[POST] /api/proposal/*/accept`** (res)
  - *(no matching route)*
- **`[GET] /api/rfp/*`** (res)
  - *(no matching route)*
- **`[POST] /api/rfp/*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/survey/public?token=*`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/survey/public`** (res)
  - → `[POST] /api/client-portal/survey/public`
  - → `[GET] /api/client-portal/survey/public`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[GET] /api/web-onboarding/*`** (res)
  - *(no matching route)*
- **`[POST] /api/web-onboarding/*`** (res)
  - *(no matching route)*
- **`[GET] /api/academy/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/client-accounts`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/achievements`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/aging-report*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/auto-invoice/config`** (res)
  - *(no matching route)*
- **`[PUT] /api/accounts/auto-invoice/config/*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/bank-statements?*`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/entities`** (res)
  - → `[POST] /api/admin/entities`
  - → `[GET] /api/admin/entities`
- **`[POST] /api/accounts/bank-statements`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/bank-statements/*/process`** (res)
  - *(no matching route)*
- **`[GET] /api/budget-alerts?*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE`** (res)
  - *(no matching route)*
- **`[POST] /api/budget-alerts`** (res)
  - *(no matching route)*
- **`[POST] /api/budget-alerts/*/pause`** (res)
  - *(no matching route)*
- **`[DELETE] /api/budget-alerts/*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?includeLifecycle=true`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?onboarding=true`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/client-onboarding/*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients`** (res)
  - *(no matching route)*
- **`[GET] /api/daily-meeting/tasks?date=*`** (res)
  - *(no matching route)*
- **`[GET] /api/deliverables?includeBilling=true`** (res)
  - *(no matching route)*
- **`[PATCH] /api/deliverables/*/billing`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/discrepancies?months=*`** (res)
  - *(no matching route)*
- **`[GET] /api/expenses?month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/expenses`** (res)
  - → `[GET] /api/expenses`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
- **`[GET] /api/sales/handover`** (res)
  - → `[POST] /api/sales/handover`
  - → `[PATCH] /api/sales/handover`
  - → `[GET] /api/sales/handover`
- **`[PATCH] /api/sales/handover`** (res)
  - → `[POST] /api/sales/handover`
  - → `[PATCH] /api/sales/handover`
  - → `[GET] /api/sales/handover`
- **`[PATCH] /api/sales/handover`** (res)
  - → `[POST] /api/sales/handover`
  - → `[PATCH] /api/sales/handover`
  - → `[GET] /api/sales/handover`
- **`[GET] /api/invoices?month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/auto-invoice/send/*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/leaderboard?metric=*&period=*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/payments?month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/payments`** (res)
  - *(no matching route)*
- **`[GET] /api/clients`** (res)
  - *(no matching route)*
- **`[PATCH] /api/clients/*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/goals`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/goals`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/onboarding-analytics`** (res)
  - → `[GET] /api/accounts/onboarding-analytics`
- **`[GET] /api/accounts/follow-ups?month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/payment-automation`** (res)
  - → `[GET] /api/accounts/payment-automation`
    - → 📦 `Automation`
    - → 📦 `Automation`
    - → 📦 `Automation`
- **`[POST] /api/accounts/follow-ups`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/performance?period=*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/proforma-invoice`** (res)
  - *(no matching route)*
- **`[GET] /api/projects?includeBilling=true`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/proposals?*`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/proposals/*/send`** (res)
  - *(no matching route)*
- **`[DELETE] /api/accounts/proposals/*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/payments`** (res)
  - *(no matching route)*
- **`[POST] /api/expenses`** (res)
  - → `[GET] /api/expenses`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
- **`[POST] /api/accounts/auto-invoice/bulk`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/reconciliation-summary?*`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/entities`** (res)
  - → `[POST] /api/admin/entities`
  - → `[GET] /api/admin/entities`
- **`[GET] /api/accounts/revenue-forecast`** (res)
  - → `[GET] /api/accounts/revenue-forecast`
- **`[GET] /api/accounts/roi/departments?*`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/roi/compute`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/terminations?*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/admin/terminations/*`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/audit-log?*`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/users`** (res)
  - → `[POST] /api/admin/users`
  - → `[GET] /api/admin/users`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
    - → 📦 `User`
- **`[POST] /api/admin/branding-magic-link/send`** (res)
  - → `[POST] /api/admin/branding-magic-link/send`
- **`[PUT] /api/hr/assessment/send`** (res)
  - *(no matching route)*
- **`[GET] /api/client-access-requests?status=*&limit=100`** (res)
  - *(no matching route)*
- **`[PATCH] /api/client-access-requests/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/client-access-requests/*`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/sync-client-assignments`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/sync-client-assignments`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/sync-client-assignments`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/custom-roles`** (res)
  - *(no matching route)*
- **`[PATCH] /api/admin/custom-roles`** (res)
  - *(no matching route)*
- **`[DELETE] /api/admin/custom-roles?roleId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/custom-roles/assign`** (res)
  - *(no matching route)*
- **`[DELETE] /api/admin/custom-roles/assign?userId=*&customRoleId=*`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/entities`** (res)
  - → `[POST] /api/admin/entities`
  - → `[GET] /api/admin/entities`
- **`[POST] /api/admin/entities`** (res)
  - → `[POST] /api/admin/entities`
  - → `[GET] /api/admin/entities`
- **`[DELETE] /api/admin/entities/*`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/entities/*/bank-accounts`** (res)
  - *(no matching route)*
- **`[DELETE] /api/admin/entities/*/bank-accounts?accountId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/entities/*/payment-gateways`** (res)
  - *(no matching route)*
- **`[DELETE] /api/admin/entities/*/payment-gateways?gatewayId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/freelancer/work-reports/bulk-update`** (res)
  - → `[GET] date`
  - → `[GET] date`
  - → `[GET] date`
  - → `[GET] date`
  - → `[GET] date`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Attendance`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Attendance`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Attendance`
    - → 📦 `Task`
    - → 📦 `Attendance`
    - → 📦 `Meeting`
    - → 📦 `tasks`
- **`[POST] /api/freelancer/payments`** (res)
  - *(no matching route)*
- **`[PUT] /api/magic-link/generate`** (res)
  - → `[POST] /api/magic-link/generate`
  - → `[PUT] /api/magic-link/generate`
  - → `[GET] /api/magic-link/generate`
    - → 📦 `MagicLink`
- **`[POST] /api/admin/settings`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/view-as?userId=*&redirectTo=/`** (res)
  - *(no matching route)*
- **`[DELETE] /api/admin/view-as?redirectTo=/admin/users`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/quick-add/employee`** (res)
  - *(no matching route)*
- **`[POST] /api/admin/generate-magic-link`** (res)
  - → `[POST] /api/admin/generate-magic-link`
- **`[PATCH] /api/admin/users/*`** (res)
  - *(no matching route)*
- **`[DELETE] /api/admin/users/*`** (res)
  - *(no matching route)*
- **`[GET] /api/vendors?*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?limit=50`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?*`** (res)
  - *(no matching route)*
- **`[GET] /api/analytics/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/analytics/profitability?*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-access/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients/*`** (res)
  - *(no matching route)*
- **`[GET] /api/admin/users?role=EMPLOYEE`** (res)
  - *(no matching route)*
- **`[GET] /api/clients/*/tactical-data`** (res)
  - *(no matching route)*
- **`[GET] /api/clients/*/credentials`** (res)
  - *(no matching route)*
- **`[GET] /api/clients/*/portal-users`** (res)
  - *(no matching route)*
- **`[DELETE] /api/clients/*/credentials?id=*`** (res)
  - *(no matching route)*
- **`[DELETE] /api/clients/*/portal-users?id=*`** (res)
  - *(no matching route)*
- **`[POST] /api/clients/*/team`** (res)
  - *(no matching route)*
- **`[DELETE] /api/clients/*/team?memberId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/clients`** (res)
  - *(no matching route)*
- **`[PATCH] /api/clients/*/logo`** (res)
  - *(no matching route)*
- **`[GET] /api/communications/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/content/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/crm/leads/*`** (res)
  - *(no matching route)*
- **`[POST] /api/crm/leads/*/convert`** (res)
  - *(no matching route)*
- **`[GET] /api/design/calendar?month=*&year=*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/design/requests/*`** (res)
  - *(no matching route)*
- **`[GET] /api/finance/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/finance/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/finance/calendar`** (res)
  - *(no matching route)*
- **`[GET] /api/expenses`** (res)
  - → `[GET] /api/expenses`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
- **`[POST] /api/expenses`** (res)
  - → `[GET] /api/expenses`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
    - → 📦 `Expense`
- **`[PATCH] /api/expenses/*`** (res)
  - *(no matching route)*
- **`[DELETE] /api/expenses/*`** (res)
  - *(no matching route)*
- **`[POST] /api/freelancer/work-reports`** (res)
  - *(no matching route)*
- **`[POST] /api/hiring`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/appreciations?*`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/employees`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/appreciations`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/appraisals/trigger`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/assessment/pipeline?*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/assessment/*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/attendance/entry`** (res)
  - *(no matching route)*
- **`[POST] /api/assets`** (res)
  - *(no matching route)*
- **`[DELETE] /api/assets/*`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/employees`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/attendance-import?limit=5`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/attendance-import`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/attendance-import/*`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/calendar?month=*&year=*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/client-feedback`** (res)
  - *(no matching route)*
- **`[GET] /api/daily-meeting/tasks?date=*`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/employer-branding`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/employer-branding/*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/employer-branding`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/engagement-activities`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/engagement-activities`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/escalations`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/escalations`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/escalations/*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/exit/*/checklist`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/exit/*/checklist`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/exit`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/fnf`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/fnf`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/fnf/*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/interviews`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/interviews/*`** (res)
  - *(no matching route)*
- **`[GET] /api/users?active=true`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/leave`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/leave/*`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/manager-reviews?*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/manager-reviews`** (res)
  - *(no matching route)*
- **`[GET] /api/users?status=PROBATION,ACTIVE&recent=true`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/onboarding-checklist/*`** (res)
  - *(no matching route)*
- **`[GET] /api/quotes?mode=all`** (res)
  - *(no matching route)*
- **`[PUT] /api/quotes`** (res)
  - *(no matching route)*
- **`[POST] /api/quotes`** (res)
  - *(no matching route)*
- **`[POST] /api/vendors`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/verify/*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/verify/*`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/work-anniversaries?days=*`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/work-anniversaries`** (res)
  - *(no matching route)*
- **`[POST] /api/intern/acknowledge-handbook`** (res)
  - *(no matching route)*
- **`[GET] /api/issues/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/issues/*`** (res)
  - *(no matching route)*
- **`[POST] /api/issues/*/assign`** (res)
  - *(no matching route)*
- **`[POST] /api/issues/*/comment`** (res)
  - *(no matching route)*
- **`[GET] /api/learning/comments?resourceId=*`** (res)
  - *(no matching route)*
- **`[POST] /api/learning/comments`** (res)
  - → `[POST] /api/learning/comments`
  - → `[DELETE] /api/learning/comments`
  - → `[GET] /api/learning/comments`
    - → 📦 `Comment`
    - → 📦 `Comment`
    - → 📦 `Comment`
    - → 📦 `LearningResourceComment`
- **`[POST] /api/tactical/kpis`** (res)
  - *(no matching route)*
- **`[PATCH] /api/accountability/rating`** (res)
  - *(no matching route)*
- **`[POST] /api/accountability/goals`** (res)
  - *(no matching route)*
- **`[PATCH] /api/accountability/goals`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings`** (res)
  - *(no matching route)*
- **`[POST] /api/tactical/ops-kpis`** (res)
  - *(no matching route)*
- **`[POST] /api/tactical/ops-kpis/submit`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings/strategic/peer-review`** (res)
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/meetings/tactical/seed`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings/tactical`** (res)
  - *(no matching route)*
- **`[GET] /api/operations/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/operations/calendar?year=*&month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/operations/calendar`** (res)
  - *(no matching route)*
- **`[POST] /api/tactical/posts`** (res)
  - *(no matching route)*
- **`[POST] /api/tactical/submit`** (res)
  - *(no matching route)*
- **`[GET] /api/operations/pending-onboarding`** (res)
  - → `[GET] onboarding`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/client-deliverables?clientId=*&month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/client-deliverables`** (res)
  - *(no matching route)*
- **`[PATCH] /api/client-deliverables`** (res)
  - *(no matching route)*
- **`[DELETE] /api/client-deliverables?id=*`** (res)
  - *(no matching route)*
- **`[POST] /api/accountability/deliverables`** (res)
  - *(no matching route)*
- **`[PATCH] /api/accountability/goals`** (res)
  - *(no matching route)*
- **`[POST] /api/accountability/goals`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/calendar?month=*&year=*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/sales/daily-tasks/*`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/leads`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/deals`** (res)
  - → `[POST] /api/sales/deals`
  - → `[GET] /api/sales/deals`
- **`[GET] /api/sales/handover?*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/sales/handover`** (res)
  - → `[POST] /api/sales/handover`
  - → `[PATCH] /api/sales/handover`
  - → `[GET] /api/sales/handover`
- **`[GET] /api/sales/leads`** (res)
  - *(no matching route)*
- **`[POST] /api/sales/leads`** (res)
  - *(no matching route)*
- **`[POST] /api/sales/meetings`** (res)
  - → `[POST] /api/sales/meetings`
  - → `[GET] /api/sales/meetings`
    - → 📦 `Meeting`
    - → 📦 `Meeting`
    - → 📦 `Meeting`
    - → 📦 `Meeting`
    - → 📦 `meetings`
- **`[PATCH] /api/sales/meetings/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/sales/meetings/*`** (res)
  - *(no matching route)*
- **`[POST] /api/sales/leads/*/nurture`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/leads`** (res)
  - *(no matching route)*
- **`[PATCH] /api/sales/leads/*/stage`** (res)
  - → `[GET] stage`
  - → `[GET] stage`
  - → `[GET] stage`
    - → 📦 `Lead`
    - → 📦 `Interview`
    - → 📦 `Lead`
    - → 📦 `Interview`
    - → 📦 `Lead`
    - → 📦 `Interview`
    - → 📦 `Lead`
    - → 📦 `Interview`
- **`[GET] /api/sales/proposals`** (res)
  - → `[POST] /api/sales/proposals`
  - → `[PATCH] /api/sales/proposals`
  - → `[GET] /api/sales/proposals`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
- **`[PATCH] /api/sales/proposals`** (res)
  - → `[POST] /api/sales/proposals`
  - → `[PATCH] /api/sales/proposals`
  - → `[GET] /api/sales/proposals`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
- **`[GET] /api/rfp/create`** (res)
  - *(no matching route)*
- **`[POST] /api/rfp/create`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/gbp`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/gbp`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/gbp`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/tasks`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/employees?department=SEO`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/tasks`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/tasks`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/youtube`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/youtube`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/youtube`** (res)
  - *(no matching route)*
- **`[POST] /api/calendar`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks`** (res)
  - *(no matching route)*
- **`[PATCH] /api/tasks/*`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/*/comments`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily`** (res)
  - *(no matching route)*
- **`[PATCH] /api/tasks/daily/*`** (res)
  - *(no matching route)*
- **`[DELETE] /api/tasks/daily/*`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily/*/start`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily/*/complete`** (res)
  - *(no matching route)*
- **`[PATCH] /api/tasks/daily/*`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily/*/complete`** (res)
  - *(no matching route)*
- **`[POST] /api/whatsapp/task-message`** (res)
  - *(no matching route)*
- **`[PATCH] /api/whatsapp/task-message`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily/submit`** (res)
  - *(no matching route)*
- **`[GET] /api/tasks/daily/pending-reviews`** (res)
  - *(no matching route)*
- **`[PATCH] /api/users/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/users/profile-picture`** (res)
  - *(no matching route)*
- **`[GET] /api/org-chart`** (res)
  - *(no matching route)*
- **`[POST] /api/web/bugs`** (res)
  - *(no matching route)*
- **`[PATCH] /api/web/bugs/*`** (res)
  - *(no matching route)*
- **`[GET] /api/web/calendar?month=*&year=*`** (res)
  - *(no matching route)*
- **`[GET] /api/web-clients?*`** (res)
  - *(no matching route)*
- **`[POST] /api/web-clients`** (res)
  - *(no matching route)*
- **`[POST] /api/web/escalations`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks`** (res)
  - *(no matching route)*
- **`[POST] /api/web/requests`** (res)
  - *(no matching route)*
- **`[PATCH] /api/web/requests/*`** (res)
  - *(no matching route)*
- **`[POST] /api/onboarding/*/service-change-request`** (res)
  - *(no matching route)*
- **`[POST] /api/onboarding/*/confirm`** (res)
  - *(no matching route)*
- **`[GET] /api/onboarding/*/sla`** (res)
  - *(no matching route)*
- **`[POST] /api/onboarding/*/sla`** (res)
  - *(no matching route)*
- **`[GET] /api/onboarding/*/invoice`** (res)
  - *(no matching route)*
- **`[POST] /api/onboarding/*/payment`** (res)
  - *(no matching route)*
- **`[POST] /api/onboarding/*/details`** (res)
  - *(no matching route)*
- **`[GET] /api/client-portal/meetings/*`** (res)
  - *(no matching route)*
- **`[POST] /api/client-portal/issues`** (res)
  - *(no matching route)*
- **`[GET] /api/web-portal/contracts`** (res)
  - → `[GET] /api/web-portal/contracts`
    - → 📦 `Contract`
    - → 📦 `Contract`
    - → 📦 `Contract`
    - → 📦 `Contract`
- **`[GET] /api/web-portal/credentials`** (res)
  - → `[POST] /api/web-portal/credentials`
  - → `[PUT] /api/web-portal/credentials`
  - → `[DELETE] /api/web-portal/credentials`
  - → `[GET] /api/web-portal/credentials`
- **`[GET] /api/web-portal/credentials`** (res)
  - → `[POST] /api/web-portal/credentials`
  - → `[PUT] /api/web-portal/credentials`
  - → `[DELETE] /api/web-portal/credentials`
  - → `[GET] /api/web-portal/credentials`
- **`[DELETE] /api/web-portal/credentials?id=*`** (res)
  - *(no matching route)*
- **`[GET] /api/web-portal/maintenance`** (res)
  - → `[POST] /api/web-portal/maintenance`
  - → `[GET] /api/web-portal/maintenance`
- **`[POST] /api/web-portal/maintenance`** (res)
  - → `[POST] /api/web-portal/maintenance`
  - → `[GET] /api/web-portal/maintenance`
- **`[GET] /api/web-portal/sitemap`** (res)
  - → `[GET] /api/web-portal/sitemap`
- **`[POST] /api/client-portal/support/tickets`** (res)
  - *(no matching route)*
- **`[GET] /api/proposal/*`** (res)
  - *(no matching route)*
- **`[POST] /api/payments/offline-request`** (res)
  - → `[POST] /api/payments/offline-request`
- **`[GET] /api/proposal/*`** (res)
  - *(no matching route)*
- **`[GET] /api/expenses/recurring?*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE`** (res)
  - *(no matching route)*
- **`[POST] /api/expenses/recurring`** (res)
  - *(no matching route)*
- **`[POST] /api/expenses/recurring/*/pay`** (res)
  - *(no matching route)*
- **`[PATCH] /api/expenses/recurring/*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/meetings/monthly?*`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/meetings/monthly`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/meetings/strategic?period=*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/meetings/operational?period=*`** (res)
  - *(no matching route)*
- **`[GET] /api/accounts/meetings/tactical?month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/onboarding/*/confirm-payment`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/onboarding`** (res)
  - → `[GET] onboarding`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[GET] /api/accounts/proposals/*`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/proposals/*/send`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/proposals`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/budget?month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/spend?from=*&to=*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?status=DRAFT&limit=20`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?limit=50`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/creatives?*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns`** (res)
  - *(no matching route)*
- **`[POST] /api/upload/cloudinary`** (res)
  - *(no matching route)*
- **`[POST] /api/ads/creatives`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/creative-requests`** (res)
  - *(no matching route)*
- **`[POST] /api/ads/creative-requests`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/conversions?from=*&to=*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/conversions?*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/campaigns?*`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/analytics`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/analytics?type=roi`** (res)
  - *(no matching route)*
- **`[GET] /api/ads/analytics`** (res)
  - *(no matching route)*
- **`[POST] /api/clients/*/team`** (res)
  - *(no matching route)*
- **`[GET] /api/deliverables/approvals`** (res)
  - *(no matching route)*
- **`[GET] /api/qc/reviews`** (res)
  - *(no matching route)*
- **`[POST] /api/qc/reviews`** (res)
  - *(no matching route)*
- **`[POST] /api/design/requests`** (res)
  - *(no matching route)*
- **`[GET] /api/clients`** (res)
  - *(no matching route)*
- **`[POST] /api/invoices`** (res)
  - *(no matching route)*
- **`[POST] /api/freelancer/work-reports`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/appraisals/*/complete`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/appraisals/save`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/appraisals/submit`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/appraisals/trigger`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/appraisals/*/complete`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/attendance/sync`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/attendance-import?limit=50`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/attendance-import/merge`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/devices/my`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/devices/request`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/devices/return`** (res)
  - *(no matching route)*
- **`[POST] /api/meetings/tactical`** (res)
  - *(no matching route)*
- **`[GET] /api/manager/departments/ads`** (res)
  - *(no matching route)*
- **`[GET] /api/manager/departments/ai`** (res)
  - *(no matching route)*
- **`[GET] /api/manager/departments/seo`** (res)
  - *(no matching route)*
- **`[GET] /api/manager/departments/social`** (res)
  - *(no matching route)*
- **`[GET] /api/manager/departments/web`** (res)
  - *(no matching route)*
- **`[GET] /api/manager/hr/team-performance`** (res)
  - → `[GET] /api/manager/hr/team-performance`
- **`[GET] /api/issues`** (res)
  - *(no matching route)*
- **`[GET] /api/operations/onboarding/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/operations/onboarding/*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-deliverables?clientId=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-deliverables?clientId=*&month=*`** (res)
  - *(no matching route)*
- **`[POST] /api/client-deliverables`** (res)
  - *(no matching route)*
- **`[PATCH] /api/client-deliverables`** (res)
  - *(no matching route)*
- **`[GET] /api/client-deliverables?clientId=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/client-deliverables?clientId=*&month=*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/client-deliverables`** (res)
  - *(no matching route)*
- **`[GET] /api/client-deliverables?clientId=*&month=*`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/deals?status=LOST`** (res)
  - *(no matching route)*
- **`[PATCH] /api/sales/leads/*`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/deals?status=WON`** (res)
  - *(no matching route)*
- **`[PATCH] /api/sales/leads/*/stage`** (res)
  - → `[GET] stage`
  - → `[GET] stage`
  - → `[GET] stage`
    - → 📦 `Lead`
    - → 📦 `Interview`
    - → 📦 `Lead`
    - → 📦 `Interview`
    - → 📦 `Lead`
    - → 📦 `Interview`
    - → 📦 `Lead`
    - → 📦 `Interview`
- **`[POST] /api/sales/leads/import`** (res)
  - → `[POST] /api/sales/leads/import`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
    - → 📦 `Lead`
- **`[GET] /api/sales/nurturing/content`** (res)
  - → `[GET] /api/sales/nurturing/content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
- **`[GET] /api/sales/goals?*`** (res)
  - *(no matching route)*
- **`[POST] /api/sales/goals`** (res)
  - → `[POST] /api/sales/goals`
  - → `[PATCH] /api/sales/goals`
  - → `[GET] /api/sales/goals`
    - → 📦 `Goal`
    - → 📦 `Goal`
    - → 📦 `Goal`
    - → 📦 `Goal`
- **`[PATCH] /api/sales/goals`** (res)
  - → `[POST] /api/sales/goals`
  - → `[PATCH] /api/sales/goals`
  - → `[GET] /api/sales/goals`
    - → 📦 `Goal`
    - → 📦 `Goal`
    - → 📦 `Goal`
    - → 📦 `Goal`
- **`[PATCH] /api/sales/goals`** (res)
  - → `[POST] /api/sales/goals`
  - → `[PATCH] /api/sales/goals`
  - → `[GET] /api/sales/goals`
    - → 📦 `Goal`
    - → 📦 `Goal`
    - → 📦 `Goal`
    - → 📦 `Goal`
- **`[GET] /api/sales/leads`** (res)
  - *(no matching route)*
- **`[POST] /api/sales/proposals`** (res)
  - → `[POST] /api/sales/proposals`
  - → `[PATCH] /api/sales/proposals`
  - → `[GET] /api/sales/proposals`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
    - → 📦 `Proposal`
- **`[GET] /api/sales/rfp?status=COMPLETED`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/rfp?status=SENT`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/leads`** (res)
  - *(no matching route)*
- **`[POST] /api/sales/rfp`** (res)
  - → `[POST] /api/sales/rfp`
  - → `[GET] /api/sales/rfp`
- **`[GET] /api/seo/keywords`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/keywords`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/plans`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/backlinks`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/backlinks`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/backlinks`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/content`** (res)
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
- **`[POST] /api/seo/content`** (res)
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
- **`[PUT] /api/seo/content`** (res)
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
  - → `[GET] content`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Client`
    - → 📦 `Post`
- **`[PUT] /api/seo/tasks`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/tasks`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/reports`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/reports`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/reports`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/client-approvals`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/client-approvals`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/client-approvals`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/client-approvals`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/client-approvals`** (res)
  - *(no matching route)*
- **`[GET] /api/clients?status=ACTIVE&limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/qc-reviews`** (res)
  - *(no matching route)*
- **`[POST] /api/seo/qc-reviews`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/qc-reviews`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/qc-reviews`** (res)
  - *(no matching route)*
- **`[PUT] /api/seo/qc-reviews`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/tasks`** (res)
  - *(no matching route)*
- **`[GET] /api/seo/tasks`** (res)
  - *(no matching route)*
- **`[PATCH] /api/social/approvals/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/social/approvals/*`** (res)
  - *(no matching route)*
- **`[GET] /api/social/metrics?groupBy=platform`** (res)
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
  - → `[GET] platform`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Campaign`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Campaign`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Campaign`
    - → 📦 `Client`
    - → 📦 `Post`
    - → 📦 `Campaign`
    - → 📦 `BudgetAllocation`
    - → 📦 `ConversionEvent`
    - → 📦 `AdCreative`
    - → 📦 `EmployerBrandingContent`
    - → 📦 `ContentIdea`
    - → 📦 `clients`
- **`[POST] /api/social/strategy`** (res)
  - *(no matching route)*
- **`[POST] /api/social/approvals`** (res)
  - *(no matching route)*
- **`[POST] /api/social/approvals`** (res)
  - *(no matching route)*
- **`[GET] /api/social/clients?limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/social/posts?limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/social/posts?contentType=&limit=50`** (res)
  - *(no matching route)*
- **`[GET] /api/social/metrics?limit=100`** (res)
  - *(no matching route)*
- **`[GET] /api/social/posts?limit=50`** (res)
  - *(no matching route)*
- **`[GET] /api/social/approvals`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks/daily/*/review`** (res)
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[GET] /api/tasks/daily/history?months=12`** (res)
  - *(no matching route)*
- **`[GET] /api/hr/pipeline-tasks`** (res)
  - *(no matching route)*
- **`[POST] /api/hr/pipeline-tasks`** (res)
  - *(no matching route)*
- **`[PATCH] /api/hr/pipeline-tasks/*`** (res)
  - *(no matching route)*
- **`[GET] /api/clients/operations-overview`** (res)
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
  - → `[GET] view`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
- **`[POST] /api/web/amc`** (res)
  - *(no matching route)*
- **`[GET] /api/web-clients/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/web-clients/*`** (res)
  - *(no matching route)*
- **`[POST] /api/maintenance-contracts`** (res)
  - *(no matching route)*
- **`[POST] /api/web-clients/*/convert-recurring`** (res)
  - *(no matching route)*
- **`[POST] /api/web-clients`** (res)
  - *(no matching route)*
- **`[POST] /api/tasks`** (res)
  - *(no matching route)*
- **`[GET] /api/web-portal/sitemap/*`** (res)
  - *(no matching route)*
- **`[POST] /api/web-portal/sitemap/*/feedback`** (res)
  - *(no matching route)*
- **`[POST] /api/web-portal/sitemap/*/feedback`** (res)
  - *(no matching route)*
- **`[POST] /api/accounts/onboarding/*/activate`** (res)
  - *(no matching route)*
- **`[GET] /api/sales/proposals/*`** (res)
  - *(no matching route)*
- **`[PATCH] /api/sales/proposals/*`** (res)
  - *(no matching route)*
- **`[GET] /api/web-clients/*/portal-access`** (res)
  - *(no matching route)*
- **`[POST] /api/web-clients/*/portal-access`** (res)
  - *(no matching route)*
- **`[POST] /api/web-clients/*/portal-access`** (res)
  - *(no matching route)*
- **`[GET] /api/web-clients/*/sitemap`** (res)
  - *(no matching route)*
- **`[POST] /api/web-clients/*/sitemap`** (res)
  - *(no matching route)*
- **`[POST] /emails`** (resp)
  - *(no matching route)*
- **`[POST] /chat/completions`** (response)
  - *(no matching route)*
- **`[POST] /chat/completions`** (response)
  - *(no matching route)*
- **`[GET] //graph.facebook.com/oauth/access_token?client_id=*&client_secret=*&grant_type=client_credentials`** (response)
  - *(no matching route)*
- **`[GET] /v1/payments`** (response)
  - *(no matching route)*
- **`[GET] /v1/balance`** (response)
  - *(no matching route)*
- **`[GET] /domains`** (response)
  - → `[POST] /api/web/domains`
  - → `[PATCH] /api/web/domains`
  - → `[DELETE] /api/web/domains`
  - → `[GET] /api/web/domains`
    - → 📦 `Domain`
    - → 📦 `Domain`
    - → 📦 `Domain`
    - → 📦 `Domain`
- **`[GET] /api/v1/models`** (response)
  - *(no matching route)*
- **`[GET] /v1/status`** (response)
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
  - → `[GET] status`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Meeting`
    - → 📦 `Contract`
    - → 📦 `Invoice`
    - → 📦 `Expense`
    - → 📦 `Proposal`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Issue`
    - → 📦 `Report`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Interview`
    - → 📦 `Goal`
    - → 📦 `Campaign`
    - → 📦 `User`
    - → 📦 `Client`
    - → 📦 `Task`
    - → 📦 `Invoice`
    - → 📦 `Attendance`
    - → 📦 `Achievement`
    - → 📦 `Meeting`
    - → 📦 `Candidate`
    - → 📦 `Idea`
    - → 📦 `Interview`
    - → 📦 `ClientAccessRequest`
    - → 📦 `ClientDeliverable`
    - → 📦 `Expense`
    - → 📦 `Goal`
    - → 📦 `MaintenanceContract`
    - → 📦 `Campaign`
    - → 📦 `Proposal`
    - → 📦 `BankStatement`
    - → 📦 `Contract`
    - → 📦 `OAuthAccessRequest`
    - → 📦 `ClientAnnouncement`
    - → 📦 `ServiceTermination`
    - → 📦 `ABTest`
    - → 📦 `AdCreative`
    - → 📦 `Report`
    - → 📦 `RecurringExpense`
    - → 📦 `AttendanceImport`
    - → 📦 `EmployerBrandingContent`
    - → 📦 `ContentIdea`
    - → 📦 `EngagementActivity`
    - → 📦 `ManagerBehaviorReview`
    - → 📦 `Issue`
    - → 📦 `SeoBacklink`
    - → 📦 `ClientApproval`
    - → 📦 `SeoContent`
    - → 📦 `SeoReport`
    - → 📦 `QcReview`
    - → 📦 `YouTubeVideo`
    - → 📦 `WebReimbursement`
    - → 📦 `AccountsMonthlyReview`
    - → 📦 `AccountsQuarterlyReview`
    - → 📦 `CandidateAssessment`
    - → 📦 `DeviceRequest`
    - → 📦 `clients`
    - → 📦 `tasks`
    - → 📦 `meetings`
- **`[GET] /v1/models`** (response)
  - *(no matching route)*
- **`[GET] //ipwho.is/*`** (response)
  - *(no matching route)*
- **`[POST] /v3/mail/send`** (response)
  - *(no matching route)*
- **`[POST] /send_msg/`** (response)
  - *(no matching route)*
- **`[POST] /send_msg/group/`** (response)
  - *(no matching route)*
- **`[GET] /api/saas-tools?*`** (response)
  - *(no matching route)*
- **`[GET] /api/saas-tools/*`** (response)
  - *(no matching route)*
- **`[POST] /api/saas-tools`** (response)
  - → `[POST] /api/saas-tools`
  - → `[GET] /api/saas-tools`
    - → 📦 `SaasTool`
- **`[PATCH] /api/saas-tools/*`** (response)
  - *(no matching route)*
- **`[DELETE] /api/saas-tools/*`** (response)
  - *(no matching route)*
- **`[POST] /api/clients/*/lifecycle`** (response)
  - *(no matching route)*
- **`[PATCH] /api/clients/*`** (response)
  - *(no matching route)*
- **`[POST] /api/web/amc/*/logs`** (response)
  - *(no matching route)*
- **`[GET] /api/clients?isWebTeamClient=true`** (response)
  - *(no matching route)*
- **`[POST] /api/web/domains`** (response)
  - → `[POST] /api/web/domains`
  - → `[PATCH] /api/web/domains`
  - → `[DELETE] /api/web/domains`
  - → `[GET] /api/web/domains`
    - → 📦 `Domain`
    - → 📦 `Domain`
    - → 📦 `Domain`
    - → 📦 `Domain`
- **`[GET] /api/clients?isWebTeamClient=true`** (response)
  - *(no matching route)*
- **`[POST] /api/web/hosting`** (response)
  - → `[POST] /api/web/hosting`
  - → `[PATCH] /api/web/hosting`
  - → `[DELETE] /api/web/hosting`
  - → `[GET] /api/web/hosting`
    - → 📦 `HostingAccount`
- **`[POST] /api/web/reimbursements`** (response)
  - → `[POST] /api/web/reimbursements`
  - → `[PATCH] /api/web/reimbursements`
  - → `[GET] /api/web/reimbursements`
    - → 📦 `WebReimbursement`
- **`[GET] /api/client-portal/web/dashboard`** (response)
  - *(no matching route)*
- **`[GET] /oauth2/v2/userinfo`** (response)
  - *(no matching route)*
- **`[POST] /api/reports/export`** (response)
  - → `[GET] export`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `Client`
    - → 📦 `clients`
- **`[POST] /api/whatsapp/campaigns/*/start`** (response)
  - *(no matching route)*
- **`[POST] /api/whatsapp/campaigns`** (response)
  - *(no matching route)*
- **`[GET] /api/whatsapp/templates`** (response)
  - → `[GET] templates`
    - → 📦 `Task`
    - → 📦 `Task`
    - → 📦 `Task`
    - → 📦 `Task`
    - → 📦 `Day0Task`
    - → 📦 `tasks`
- **`[POST] /api/whatsapp/templates/*/send`** (response)
  - *(no matching route)*
- **`[GET] /api/client-portal/web/approvals`** (response)
  - *(no matching route)*
- **`[POST] /api/client-portal/web/approvals/*/approve`** (response)
  - *(no matching route)*
- **`[POST] /api/client-portal/web/approvals/*/request-changes`** (response)
  - *(no matching route)*
- **`[GET] /api/client-portal/web/bugs`** (response)
  - *(no matching route)*
- **`[POST] /api/client-portal/web/bugs`** (response)
  - *(no matching route)*
- **`[GET] /api/client-portal/web/requests`** (response)
  - *(no matching route)*
- **`[POST] /api/client-portal/web/requests`** (response)
  - *(no matching route)*
- **`[POST] /api/client-portal/web/requests/*/approve`** (response)
  - *(no matching route)*
- **`[POST] /api/client-portal/web/requests/*/reject`** (response)
  - *(no matching route)*
- **`[GET] /api/admin/access-requests?*`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/access-requests/*/send-instructions`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/access-requests/*/verify`** (response)
  - *(no matching route)*
- **`[DELETE] /api/admin/access-requests/*`** (response)
  - *(no matching route)*
- **`[GET] /api/admin/api-credentials/analytics`** (response)
  - → `[GET] /api/admin/api-credentials/analytics`
- **`[GET] /api/admin/api-credentials`** (response)
  - → `[POST] /api/admin/api-credentials`
  - → `[GET] /api/admin/api-credentials`
- **`[POST] /api/admin/api-credentials/migrate`** (response)
  - → `[POST] /api/admin/api-credentials/migrate`
- **`[POST] /api/admin/api-credentials/*/verify`** (response)
  - *(no matching route)*
- **`[GET] /api/admin/api-credentials/audit-log?*`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/api-credentials/*/verify`** (response)
  - *(no matching route)*
- **`[GET] /api/admin/api-credentials/*`** (response)
  - *(no matching route)*
- **`[DELETE] /api/admin/api-credentials/*`** (response)
  - *(no matching route)*
- **`[GET] /api/admin/api-credentials/health`** (response)
  - → `[GET] /api/admin/api-credentials/health`
- **`[GET] /api/admin/oauth-connections?*`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/oauth-connections/*/refresh`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/oauth-connections/*/revoke`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/oauth-connections/*/verify-access`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/api-credentials/re-auth`** (response)
  - → `[POST] /api/admin/api-credentials/re-auth`
- **`[GET] /api/admin/service-accounts`** (response)
  - → `[POST] /api/admin/service-accounts`
  - → `[GET] /api/admin/service-accounts`
    - → 📦 `AgencyServiceAccount`
- **`[PATCH] /api/admin/service-accounts/*`** (response)
  - *(no matching route)*
- **`[DELETE] /api/admin/service-accounts/*`** (response)
  - *(no matching route)*
- **`[POST] /api/admin/service-accounts`** (response)
  - → `[POST] /api/admin/service-accounts`
  - → `[GET] /api/admin/service-accounts`
    - → 📦 `AgencyServiceAccount`
- **`[POST] /api/web/upsells`** (response)
  - *(no matching route)*
- **`[PATCH] /api/web/upsells/*`** (response)
  - *(no matching route)*
- **`[GET] /api/tasks?department=SOCIAL_MEDIA`** (result)
  - *(no matching route)*
- **`[GET] /api/social/approvals?type=CREATIVE`** (result)
  - *(no matching route)*
- **`[PATCH] /api/admin/users/*`** (results)
  - *(no matching route)*
- **`[PATCH] /api/admin/users/*`** (results)
  - *(no matching route)*
- **`[POST] /api/admin/quick-add/assignment`** (results)
  - *(no matching route)*
- **`[PATCH] /api/admin/clients`** (results)
  - *(no matching route)*
- **`[PATCH] /api/web-onboarding/*`** (saveDraft)
  - *(no matching route)*
- **`[PATCH] /api/operations/onboarding/*`** (saveNotes)
  - *(no matching route)*
- **`[POST] /api/tactical/ops-kpis`** (saveRes)
  - *(no matching route)*
- **`[POST] /api/daily-meeting/tasks`** (saveTask)
  - *(no matching route)*
- **`[POST] /api/daily-meeting/tasks`** (saveTask)
  - *(no matching route)*
- **`[GET] /api/hr/employees?department=SEO`** (SeoNav)
  - *(no matching route)*
- **`[PATCH] /api/learning/verify`** (skipVerification)
  - *(no matching route)*
- **`[GET] /api/hr/employees?department=SOCIAL_MEDIA`** (SocialNav)
  - *(no matching route)*
- **`[GET] /api/onboarding/*/service-change-request`** (Step1ConfirmDetails)
  - *(no matching route)*
- **`[GET] /api/client-portal`** (ticketsRes)
  - *(no matching route)*
- **`[PATCH] /api/web-clients/*/portal-access`** (toggleAccess)
  - *(no matching route)*
- **`[PATCH] /api/whatsapp/templates/*`** (toggleActive)
  - *(no matching route)*
- **`[PUT] /api/quotes`** (toggleActive)
  - *(no matching route)*
- **`[PATCH] /api/accounts/proforma-invoice/*`** (updateStatus)
  - *(no matching route)*
- **`[PATCH] /api/daily-meeting/tasks/*`** (updateTaskStatus)
  - *(no matching route)*
- **`[PATCH] /api/daily-meeting/tasks/*`** (updateTaskStatus)
  - *(no matching route)*
- **`[POST] /api/upload/cloudinary`** (uploadRes)
  - *(no matching route)*
- **`[POST] /api/upload/cloudinary`** (uploadRes)
  - *(no matching route)*
- **`[POST] /api/auth/magic-link/verify`** (verifyRes)
  - → `[POST] /api/auth/magic-link/verify`
- **`[POST] /api/payments/verify`** (verifyRes)
  - → `[POST] /api/payments/verify`

---
*Report generated by visualise-it v2.0.4*
