---
name: dashboard-nav-unified-fix
description: UnifiedSidebar picks nav by user role - HR always sees HR nav, Accounts sees Accounts nav, etc.
type: reference
---

# Dashboard Navigation Fix (Apr 2026)

## Problem
Department users (HR, Accounts, Sales, etc.) were seeing:
1. The department-specific inner sidebar (HRNav, AccountsNav, etc.)
2. The outer DashboardNav sidebar

When navigating to routes like `/directory`, the inner sidebar disappeared and DashboardNav took over — causing confusion because HR users expected to see HR navigation.

## Solution: UnifiedSidebar
Sidebar is chosen based on **user's role/department** from the session — not the current URL. Every user ALWAYS sees the same sidebar regardless of which route they're on.

## Architecture

### Root `DashboardLayout` (src/app/(dashboard)/layout.tsx)
- Always renders one `<UnifiedSidebar />` (always shows hamburger)
- `UnifiedSidebar` is a **server component** — runs on server, picks nav by role
- Route protection delegated to child layouts

### UnifiedSidebar (src/app/(dashboard)/UnifiedSidebar.tsx)
Server component that picks nav by role:
```
HR role OR HR department → HRNav
ACCOUNTS role OR ACCOUNTS department → AccountsNav
SALES role OR SALES department → SalesNav
SEO role OR SEO department → SeoNav
WEB_MANAGER role OR WEB department → WebNav
ADS role OR ADS department → AdsNav
SOCIAL role OR SOCIAL department → SocialNav
MANAGER or OPERATIONS_HEAD role → ManagerNav
OM or BLENDED_USER with multiple depts → BlendedNav
Default (SUPER_ADMIN, EMPLOYEE, FREELANCER, INTERN, etc.) → DashboardNav
```

### Department Layouts (hr, accounts, sales, seo, web, ads, social, manager, blended, finance, crm, dashboard)
- All stripped of nav rendering — only do RBAC checks via `requirePageAuth`
- Return `<>{children}</>` — no duplicate sidebar

### Deleted Files
- `src/app/(dashboard)/hr/HRLayoutClient.tsx`
- `src/app/(dashboard)/accounts/AccountsLayoutClient.tsx`

## Nav Components Used
- `DashboardNav` — default/general nav
- `HRNav` — HR-specific nav
- `AccountsNav` — Accounts-specific nav
- `SalesNav` — Sales-specific nav
- `SeoNav` — SEO-specific nav
- `WebNav` — Web/AI team nav
- `AdsNav` — Ads-specific nav
- `SocialNav` — Social media nav
- `ManagerNav` — Manager/Operations nav
- `BlendedNav` — Multi-department users

## Mobile Navigation
- `DashboardNav` renders its own mobile drawer controlled by `DashboardHeader`'s hamburger
- Department navs (HRNav, AccountsNav, etc.) — only `HRLayoutClient` and `SalesLayout` had mobile drawers, now removed
- **Note**: SeoNav, WebNav, SocialNav, ManagerNav, BlendedNav don't have mobile drawers — they need to be added if mobile support is needed
